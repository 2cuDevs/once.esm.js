// import OnceBrowser from '../mjs/OnceBrowser.class.mjs';
// import OnceNode from '../mjs/OnceNode.class.mjs';
import Thinglish from '../../../../../Thinglish/3.5.0/src/mjs/Thinglish.class.mjs';
//import Components from '../../../../../../../../'
import Loader from '../../../../../OnceServices/Loader/3.5.0/src/mjs/Loader.class.mjs';

class Once {
    static STATES = { "LOADED":"loaded",  "STARTED":"started", "NEW":"new", "INITIALIZED":"initialized", "SHUTDOWN":"shutdown" };
    #state = Once.STATES.LOADED;
    #setState = (aState) => {
        this.#state = aState;
    }
    
    static STARTUP_HOOK = null;
    static STARTUP_HOOK_CHAIN = [];



    static async start() {
        if (typeof ONCE !== "undefined") {
            ONCE.log("ONCE already started:", ONCE);
            return ONCE;
        }

        let once = new Once();
        once = await once.init();
        once.#state = Once.STATES.STARTED;
        return ONCE;
    }

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
        this.#state = Once.STATES.NEW;

        this.log("created", this);
    }

    async init() {
        if (this.isShutdown) this.shutdownError();
        if (!Once.STARTUP_HOOK) Once.STARTUP_HOOK = this.defaultStartUpHook.bind(this);
        this.log("starting ONCE initialization and handing back to callers startupHook:", Once.STARTUP_HOOK?.name);
        if (typeof global === "undefined") {
            // browser
            if (typeof window === "object") {
                let module = await import('../mjs/OnceBrowser.class.mjs');
                let OnceBrowser = module.default;
                
                OnceBrowser.start();
            }
        }
        else {
            // server
            let module = await import('../mjs/OnceNode.class.mjs');
            let OnceNode = module.default;
          
            OnceNode.start();
        }
        ONCE.global = global;
        ONCE.log("ONCE initialized:", this)
        
        Object.seal(this);
        this.#state = Once.STATES.INITIALIZED;
        return this;
    }

    get state() {
        return this.#state;
    }

    shutdown() {
        if (this.isShutdown) return;
        this.#state = Once.STATES.SHUTDOWN;
        console.log("shutting down ONCE:", this);
    }

    get isShutdown() {
        return this.#state === Once.STATES.SHUTDOWN;
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


let oncePromise = Once.start();
oncePromise.then(async once => {
    once.log("ONCE started", once);
    let result = null;
    if (Once.STARTUP_HOOK) {
        ONCE.log("calling startup hook:", Once.STARTUP_HOOK.name);
        result = await Once.STARTUP_HOOK(once);
    }
    else result = await once.defaultStartUpHook();
    ONCE.log("startup hook result:", result);
});

export default Once;