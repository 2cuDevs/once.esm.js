const debugMode = true;

var privateHandler = (_privateVars, objectInstance) => {
    _privateVars[objectInstance.privateID] = _privateVars[objectInstance.privateID] || {};
    return _privateVars[objectInstance.privateID];
}

var loadIOR4Class = (classes, iorString) => {
    // var classType = IOR.getInstance().init(iorString).load();
    // classes[classType.name] = classType;
}


var startTest = () => {

    let _privateVars = { 'ok': 1 };
    let _private = privateHandler.bind(this, _privateVars);

    let _classes = {};
    loadIOR4Class(_classes, '/EAMD.ucp/Components/tla/EAM/layer3/DomainEntity/1.0.0/DomainEntity.component.xml');
    

    global.test = class test { // extends _classes.DomainEntity
        init() {
            this._private = { privateID: Math.random() };

            _private(this).absoluteSave = true;

            return this;
        }
        get privateDebugger() {
            if (debugMode) {
                return _private(this);
            }
            return null
        }

        get privateID() {
            return this._private.privateID;
        }
    }

    /// Mor classes interfaces and Views beind

}


startTest();

let testInstance = new test().init();

console.log(testInstance.privateDebugger);