import Once from '../js/Once.class.mjs';

class OnceBrowser extends Once {
    static start() {
        if (window.ONCE) {
            console.log("ONCE already started");
            return window.ONCE;
        }
        window.global = window;
        let ONCE = new OnceBrowser();
        window.ONCE = ONCE;
        console.log("ONCE Browser started");
        return ONCE;
    }
    constructor() {
      super();
    }
}
  


export default OnceBrowser;