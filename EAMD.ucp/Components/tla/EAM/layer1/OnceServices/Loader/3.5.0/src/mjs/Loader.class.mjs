import Thinglish from '../../../../../Thinglish/3.5.0/src/mjs/Thinglish.class.mjs';
import { Interface,Version } from '../../../../../Thinglish/3.5.0/src/mjs/Thinglish.class.mjs';

class Loader extends Interface {
    constructor() {
        super();
        ONCE.log("created", this);
    }

    async init() {
       
    }

}

class ESModuelLoader {

    constructor() {
        //super();
        ONCE.log("created", this);
    }

    async init() {
       
    }
}

export default Loader;