import OnceBase from '../mjs/OnceBase.class.mjs';
import OnceBrowser from '../mjs/OnceBrowser.class.mjs';
import OnceNode from '../mjs/OnceNode.class.mjs';
import Thinglish from '../../../../../Thinglish/3.5.0/src/mjs/Thinglish.class.mjs';
//import Components from '../../../../../../../../'
import Loader from '../../../../../OnceServices/Loader/3.5.0/src/mjs/Loader.class.mjs';


class Once extends OnceBase {
    // #state = OnceBase.STATES.LOADED;


    static async start() {
        if (typeof ONCE !== "undefined") {
            ONCE.log("ONCE already started:", ONCE);
            return ONCE;
        }

        let once = new Once();
        once = await once.init();
        once.setState(Once.STATES.STARTED);

        once.log("ONCE: ", once.name);
        let result = null;
        if (Once.STARTUP_HOOK) {
            ONCE.log("calling startup hook:", Once.STARTUP_HOOK.name);
            result = await Once.STARTUP_HOOK(once);
        }
        else result = await once.defaultStartUpHook();

        return ONCE;
    }

    constructor() {
        super();
    }

    // setState(aState) {
    //     super.setState(aState);
    // }

}



let onceStartResult = await Once.start();
console.log("Once started asynchroniously:", onceStartResult.name);
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

export default Once;