class OnceBase {
    static STATES = { 
        "LOADED":"loaded",  
        "STARTED":"started", 
        "NEW":"new", 
        "INITIALIZED":"initialized", 
        "SHUTDOWN":"shutdown" 
    };
    #state = OnceBase.STATES.LOADED;

    
    static STARTUP_HOOK = null;
    static STARTUP_HOOK_CHAIN = [];



    // static async start() {
    //     if (typeof ONCE !== "undefined") {
    //         ONCE.log("ONCE already started:", ONCE);
    //         return ONCE;
    //     }

    //     let once = new OnceBase();
    //     once = await once.init();
    //     once.#state = Once.STATES.STARTED;

    //     once.log("ONCE: ", once.name);
    //     let result = null;
    //     if (Once.STARTUP_HOOK) {
    //         ONCE.log("calling startup hook:", Once.STARTUP_HOOK.name);
    //         result = await Once.STARTUP_HOOK(once);
    //     }
    //     else result = await once.defaultStartUpHook();

    //     return ONCE;
    // }

    static registerStartupHook(startUpHookFunction) {
        if (Once.STARTUP_HOOK !== startUpHookFunction) Once.STARTUP_HOOK_CHAIN.push(Once.STARTUP_HOOK);
        Once.STARTUP_HOOK = startUpHookFunction;
    }
  
    constructor() {
        if (typeof ONCE !== "undefined") { 
            this.shutdown();
            Object.freeze(this);
            return;
        }
        this.defaultLogger = console;
        Object.freeze(this.defaultLogger);
        this.#state = OnceBase.STATES.NEW;
        this.name = "OnceBase "+Date.now();
        this.global = null;

        this.log("created", this.name);
        Object.seal(this);
    }

    async init() {
        if (this.isShutdown) this.shutdownError();
        if (!OnceBase.STARTUP_HOOK) OnceBase.STARTUP_HOOK = this.defaultStartUpHook.bind(this);
        this.log("starting ONCE initialization and handing back to callers startupHook:", OnceBase.STARTUP_HOOK?.name);
        if (typeof global === "undefined") {
            // browser
            if (typeof window === "object") {
                let module = await import('./OnceBrowser.class.mjs');
                let OnceBrowser = module.default;
                
                OnceBrowser.start();
            }
        }
        else {
            //server
            let module = await import('./OnceNode.class.mjs');
            let OnceNode = module.default;

            this.global = global;
            this.global.ONCE = OnceNode.start();
        }
        ONCE.log("ONCE initialized:", ONCE.name)
        
        Object.seal(this);
        ONCE.#state = OnceBase.STATES.INITIALIZED;
        return ONCE;
    }

    get state() {
        return this.#state;
    }
    setState(aState) {
        this.#state = aState;
    }

    shutdown() {
        if (this.isShutdown) return;
        this.#state = Once.STATES.SHUTDOWN;
        console.log("shutting down ONCE:", this);
    }

    get isShutdown() {
        return this.#state === OnceBase.STATES.SHUTDOWN;
    }

    shutdownError() {
        throw new Error("This Once Instance is shutdown");
    }

    defaultStartUpHook() {
        this.log("internal once startUpHook");
        return "ended successfully"
    }

    log(...args) {        
        if (!this.loggger) this.logger = this.discover("Logger");
        this.logger.log("ONCE.logger: ",...args);
    }
  
    discover(aKey) {
        if (this.isShutdown) this.shutdownError();
        switch (aKey)   {   
            case "Logger":
                return this.defaultLogger;
            default:
                return null;
        }
    }

}



// // let onceStartResult = await Once.start();
// // console.log("Once started asynchroniously:", onceStartResult.name);
// let oncePromise = Once.start();
// oncePromise.then(async once => {
//     once.log("ONCE started", once);
//     let result = null;
//     if (Once.STARTUP_HOOK) {
//         ONCE.log("calling startup hook:", Once.STARTUP_HOOK.name);
//         result = await Once.STARTUP_HOOK(once);
//     }
//     else result = await once.defaultStartUpHook();
// });

export default OnceBase;