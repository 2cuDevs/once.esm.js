import Once from '../js/Once.class.mjs';

class OnceNode extends Once {

    static start() {
        if (global.ONCE) {
            console.log("ONCE already started");
            return global.ONCE;
        }
        let ONCE = new OnceNode();
        global.ONCE = ONCE;
        //let superOnce = Object.getPrototypeOf(ONCE);
        
        ONCE.log("ONCE Node started: ",ONCE.state);

        return ONCE;
    }
    constructor() {
      super();
    }
}

export default OnceNode;