import OnceBase from './OnceBase.class.mjs';

class OnceNode extends OnceBase {

    static start() {
        if (global.ONCE) {
            console.log("ONCE already started");
            return global.ONCE;
        }
        let ONCE = new OnceNode();
        global.ONCE = ONCE;
        //let superOnce = Object.getPrototypeOf(ONCE);
        
        ONCE.log("ONCE Node created: ",ONCE.state);

        return ONCE;
    }
    constructor() {
      super();
      this.name = "OnceNode "+Date.now();
    }
}

export default OnceNode;