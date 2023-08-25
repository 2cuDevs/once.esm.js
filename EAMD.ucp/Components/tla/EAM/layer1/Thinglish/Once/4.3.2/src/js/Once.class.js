/*
 * The Web 4.0 ™ platform is supported by enterprise level subscription through Cerulean Circle GmbH
 *    Copyright (C) 2017  Marcel Donges (marcel@donges.it)
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
      {
            license: "AGPL3.0",
            href: "http://www.gnu.org/licenses/agpl-3.0.de.html"
            coAuthors: [
                "Igor",
                "Philipp Bartels",
                }
      }
 */

/* global ONCE, UcpController, JavaScriptObject, DefaultUcpComponentDescriptor,
DefaultFolder, EAMDucpLoader, WeBeanLoader */


// ONCE 4.3.2 origin/dev/220


function Private(value, owner) {
    if (!owner)
        owner = this;


    // Object.defineProperty(owner, "private", {
    //     enumerable: false,
    //     configurable: true,
    //     get: () => { return this.get(owner)},
    //     set: (newValue) => { return this.set(newValue, owner)}
    // });

    var private = {
        value,
        owner
    };

    function print() {
        logger.log("log private:", private);
    }

    this.get = function (caller) {
        //         if (ONCE.global && ONCE.global.Thinglish) {
        //             logger.log("Private get current method: ", Thinglish.currentMethodDescriptor.currentMethodDescriptor);
        //         }
        if (caller === private.owner) {
            return Object.assign({}, private.value);
        }
        return "private! access denied";
    }

    this.set = function (newValue, caller) {
        if (caller === private.owner) {
            private.value = {};
            Object.assign(private.value, newValue);
            return true;
        }
        return false;
    }
    this.log = print;
}

class Particle {
    constructor(initialValue) {
        let value = Object.assign({}, initialValue);

        this.wave = [];
        this.value = new Proxy(value, {

            particle: this,
            wave: this.wave,
            construct: function (oTarget, constructorArgs) {
                if (oTarget instanceof UcpComponent)
                    return oTarget.getInstance().init(...constructorArgs);
                else
                    return new oTarget(...constructorArgs);
            },
            get: function (oTarget, sKey) {
                logger.log("get ", oTarget, sKey);
                return oTarget[sKey] || undefined;
            },
            set: function (oTarget, sKey, vValue) {
                logger.log("set ", sKey, "to", vValue, this);

                this.wave.push({
                    time: window.performance.now(),
                    method: "set",
                    key: sKey,
                    from: oTarget[sKey],
                    to: vValue
                });

                if (sKey in oTarget) {
                    return oTarget[sKey] = vValue;
                } else {
                    return false;
                }
            },

            enumerate: function (oTarget, sKey) {
                logger.log("enumerate", sKey);
                return Object.keys(oTarget);
            },
            ownKeys: function (oTarget, sKey) {
                logger.log("ownKeys", sKey);
                return Object.keys(oTarget);
            },
            has: function (oTarget, sKey) {
                logger.log("has", sKey);
                return sKey in oTarget;
            },
            defineProperty: function (oTarget, sKey, oDesc) {
                logger.log("defineProperty", sKey, "descriptor", oDesc);
                if (oDesc && 'value' in oDesc) {
                    oTarget.setItem(sKey, oDesc.value);
                }
                return oTarget;
            },
            deleteProperty: function (oTarget, sKey) {
                logger.log("delete ", sKey);
                if (sKey in oTarget) {
                    return false;
                }
                let result = oTarget[sKey];
                delete oTarget[sKey];
                return result;

            },
            getOwnPropertyDescriptor: function (oTarget, sKey) {
                logger.log("getOwnPropertyDescriptor", sKey);
                var vValue = Object.getOwnPropertyDescriptor(oTarget, sKey);
                return vValue ? {
                    value: vValue,
                    writable: true,
                    enumerable: true,
                    configurable: false
                } : undefined;
            },
            apply: function (oTarget, thisArg, argumentsList) {
                return oTarget(...argumentsList);

            },
            getPrototypeOf: function (oTarget) {
                return oTarget.prototype;
            },
            setPrototypeOf: function (oTarget, vValue) {

                return false;
            },
            isExtensible: function (oTarget) {
                return Reflect.isExtensible(oTarget);
            },
            preventExtensions: function (oTarget) {
                oTarget.canEvolve = false;
                return Reflect.preventExtensions(oTarget);
            }
        });
        this._private = new Private(value, this);
        this.owner = new Private({
            owner: this
        }, this._private);

    }

    log() {
        this._private.log();
    }

    /*
        get value() {
        return this._private.get().value;
    }

    set value(changeObject) {
        //Object.assign(this._private.get().value, changeObject);
        this._private.set(changeObject, this);
    }
    */

}

class Wave {

}

class Loader {
    static get implements() {
        return null;
    }
    static discover() {
        return this.type.implementations || [];
    }
    static canLoad(urlObject) {
        // returns 0 if cannot
        // returns 1 if really can
        // returns between 0 and 1 if probably can
        return 0;
    }

    constructor() { }

    get name() { return (this.type && this.type.class ? this.type.class.name : 'Loader') }

    client() {
        ONCE.notImplementedYet();
    }

    getIOR() {
        const ior = new IOR();
        ior.loader = this;
        return ior;
    }

    // @ToDo Check loader Interface
    load(namespace) {
        const path = (typeof namespace === "string") ? namespace : this.namespace2path(namespace);
        return path;
    }

    namespace2path(namespace) {
        return this.constructor.name + ".namespace2path(" + namespace + ")  not yet implemented";

        // return this.constructor.namespace2path(namespace);
    }

    path2namespace(path) {
        return this.constructor.name + ".path2namespace(" + path + ")  not yet implemented";
        //return this.constructor.type.class.path2namespace(path);
    }

    checkLoader(object) {
        logger.error("Not yet Implemented");
    }

    async call(ior, parameter) {
        return ONCE.call(ior, parameter);
    }

    static get staticStore() {
        this._private = this._private || {};
        this._private.staticStore = this._private.staticStore || IORStore.getInstance().init();
        return this._private.staticStore;
    }

    get staticStore() {
        return this.constructor.staticStore;
    }

    static get instanceStore() {
        this._private = this._private || {};
        this._private.instanceStore = this._private.instanceStore || InstanceStore.getInstance().init(this.type.class);
        return this._private.instanceStore;
    }

    static factory(urlObject) {

        let objectArray = Object.keys(this.instanceStore.registry);
        return (objectArray.length > 0 ? this.instanceStore.registry[objectArray[0]] : this.type.class.getInstance().init(urlObject));
    }

}

class TypeDescriptor {
    static get implements() {
        return null;
    }
    constructor() {
        this.class = undefined;
        this.dependencies = undefined;
        this.extends = undefined;
        this.interfaces = [];
        this.implements = [];
        this.uses = [];
        this._usedBy = [];
        this.isInstance = undefined;
        this.name = undefined;
        this.namespace = undefined;
        this.package = undefined;
        //this.version = undefined;
        this._ucpComponentDescriptor = undefined;
        this.weBeans = undefined;
        this.actionIndex = undefined;
    }

    get usedBy() {
        if (this._usedBy.length > 0) return this._usedBy;
        if (this.ucpComponentDescriptor?.class?.type !== this) {
            return this.ucpComponentDescriptor?.class?.type?.usedBy || this._usedBy;
        }
        return this._usedBy;
    }

    set usedBy(newValue) {
        this._usedBy = newValue;
    }

    init(object) {
        if (typeof object === "string") {
            this.name = object;
            return this;
        }
        if (!Array.isArray(object)) {
            if (object.type) {
                Object.keys(object.type).forEach(k => this[k] = object.type[k]);
            } else {
                Object.keys(object).forEach(k => this[k] = object[k]);

                this.actionIndex = {};

                let extending = Object.getPrototypeOf(object.class);
                extending = (extending && extending.name !== "") ? extending : null;

                //if (!extending && object.class._instanceCounter !== undefined) {
                //    logger.warn(`type ${object.class.name} already declared  in ${object.package}`);
                //}

                if (!extending && object.class.type) {
                    logger.warn(`${object.class.type.name} type will be overwritten: ${this.name}`);
                }
                if (object.class.type && object.class.type.originalClass) {
                    this.originalClass = object.class.type.originalClass;
                }

                object.class.type = this;

                if (extending) {
                    object.class.type.extends = extending;
                    if (ONCE.global.Thinglish) {
                        Thinglish._addImplementation(object.class, extending);
                    }
                }

                object.class.getInstance = () => {
                    let newType = object.class;

                    if (newType.defaultImplementationClass instanceof Function && !(ONCE.global.StructrFolder && newType.defaultImplementationClass === ONCE.global.StructrFolder)) {
                        newType = newType.defaultImplementationClass;
                    }
                    if (newType.onNewInstance instanceof Function) {
                        const { aTypeName, newObject } = newType.onNewInstance(object.class, object);
                        if (newObject) {
                            object = newObject;
                        }
                        if (Thinglish.isClass(ONCE.global[aTypeName])) {
                            newType = ONCE.global[aTypeName];
                        }
                    }

                    //ONCE.addStatistic(`ucpComponent.getInstance.${newType.type.name.replaceAll('.', '-')}`);


                    newType.type.instanceCount = (newType.type.instanceCount || 0) + 1;

                    const newInstance = new newType();
                    Thinglish.initType(newInstance);

                    // Check init Function on the Interface
                    for (const anInterface of newInstance.type.implements) {
                        if (typeof anInterface.initInterface == "function") {
                            anInterface.initInterface.call(newInstance);
                        }
                    }
                    if (ONCE.eventSupport) {
                        ONCE.eventSupport.fire(Once.EVENT.NEW_INSTANCE, ONCE, newInstance);
                    }
                    return newInstance;
                };

                object.class._instanceCounter = object.class._instanceCounter || 0;
                // iatalmid: add own properties to avoid use inherited property
                Object.defineProperty(object.class, '_private', {
                    value: {},
                    enumerable: true,
                    writable: true
                });
                Object.defineProperty(object.class, '_protected', {
                    value: {},
                    enumerable: true,
                    writable: true
                });
                Object.defineProperty(this, 'version', {
                    get: () => this.namespace.versionNumber,
                    enumerable: true,
                });

                let interfaces = [];
                // if (!object.class.implements && object.class.implements !== null && !object.class.type.extends) {
                //     logger.warn("Please consider to add 'static get implements() { return null }' to your class:", object.name);
                // } else {
                //     interfaces = object.class.implements;
                // }

                // if (interfaces === null) {
                //     interfaces = [];
                // }

                // let superClass = object.class.type.extends;
                // while (superClass) {
                //     if (!superClass.type)
                //         break;
                //     if (superClass.type.class.implements) {
                //         interfaces = interfaces.concat(superClass.type.class.implements);
                //     }
                //     superClass = superClass.type.class.extends;

                // }

                const getChildInterfaces = (objectList, type = 'obj') => {

                    for (const object of objectList) {
                        if (interfaces.includes(object)) continue;

                        if (type === 'int') interfaces.push(object);

                        if (object.type?.class?.implements) {
                            getChildInterfaces(object.type.class.implements, 'int')
                        }

                        if (object.type?.extends) {
                            getChildInterfaces([object.type.extends], type)

                        }

                    }
                }
                getChildInterfaces([object.class])

                interfaces.forEach(anInterface => {
                    Thinglish.implement(object.class, anInterface, false);
                    Thinglish._addInterface(object.class.type, anInterface);
                    Thinglish._addImplementation(object.class, anInterface);
                });

            }
        }

        if (this.class === "") {
            this.class = object.constructor;
        }
        if (this.name === "") {
            this.name = object.name;
        }

        return this;
    }

    toJSON() {
        return {
            class: this.class.name,
            extends: this.extends.name,
            implements: this.implements.map(item => item.name),
            package: this.package,

        };
    }
    get version() {
        this.namespace.versionNumber;
    }

    get ucpComponentDescriptor() {
        if (!this._ucpComponentDescriptor && this.class.scriptInfo.script.mainClass != this.class) {
            if (this.class.scriptInfo.script.mainClass == undefined) {
                throw new Error(`Looks like the Class ${this.class.name} was declared twice in ${this.class.scriptInfo.path}`);
            }
            this._ucpComponentDescriptor = this.class.scriptInfo.script.mainClass.type.ucpComponentDescriptor;
        }
        return this._ucpComponentDescriptor;
    }
    set ucpComponentDescriptor(newValue) {
        //logger.log("##### set _ucpComponentDescriptor for", this.class.name, "to", newValue);
        return this._ucpComponentDescriptor = newValue;
    }
};
class Namespace {
    static get implements() {
        return null;
    }
    static discover() {
        var objects = [];
        return Namespaces._getObjects(objects, Namespaces);
    }

    discover() {
        var objects = [];
        return this._getObjects(objects, this);
    }

    static get RootNamespace() {
        logger.error('static get RootNamespace: do not use it');
        return ONCE.global.Namespaces;
    }

    static currentScriptInfo() {
        if (!document) {
            let scriptInfo = ONCE.currentScriptInfo;
            if (scriptInfo) {
                let pathInfo = this.pathInfo(scriptInfo.script.src);
                scriptInfo.hasVersion = pathInfo.hasVersion;
                scriptInfo.isNamespace = pathInfo.isNamespace;
                scriptInfo.namespace = pathInfo.namespace;
                scriptInfo.versionNamespace = pathInfo.versionNamespace;
            }
            else {
                scriptInfo = this.pathInfo(process.argv[1]);
                if (typeof Once.namespace === "undefined") {
                    scriptInfo.script = { src: scriptInfo.path + "/src/js/Once.class.js" };
                    scriptInfo.script.mainClass = Once;
                }
                else {
                    scriptInfo.script = Once.namespace.script;
                }
            }
            return scriptInfo;
        }
        if (!document.currentScript)
            return { exists: false };

        let scriptInfo = this.pathInfo(document.currentScript.src);
        scriptInfo.script = document.currentScript;

        if (!scriptInfo.script.mainClass && document.currentScript.src.indexOf("Once.class.js") > 0) {
            scriptInfo.script.mainClass = Once;
        }

        return scriptInfo;
    }

    static set script4declare(script) {
        this._private = this._private || {};
        this._private.script2declare = script;
    }

    static get script4declare() {
        if (ONCE.mode === 'nodeServer') {
            this._private = this._private || {};
            return this._private.script2declare || null;
        } else {
            return (document.currentScript ? document.currentScript : null);
        }
    }

    static pathInfo(path) {
        let onceRepo = Once.REPOSITORY_ROOT || "EAMD.ucp";
        let onceRoot = onceRepo + (Once.REPOSITORY_COMPONENTS || "/Components");
        let repositoryRootIndex = path.indexOf(onceRepo);
        switch (repositoryRootIndex) {
            case -1:
                return { exists: true, path, isNamespace: false };
                break;
            default:
                path = path.substr(repositoryRootIndex + onceRoot.length + 1);
                let namespaceArray = path.split('/');
                let versionNamespace = undefined;
                let versionPath = undefined;
                namespaceArray = namespaceArray.map(n => {
                    let version = n.replace(/\./g, "_");
                    if (Namespace.isVersionName(n)) {
                        if (ONCE.global["Version"]) {
                            n = Version.parse(version).versionNamespace;
                        }
                        versionNamespace = version;
                        versionPath = n;
                    }
                    return n;
                });
                let basePath = namespaceArray.slice(0, versionNamespace ? namespaceArray.indexOf(versionPath) + 1 : namespaceArray.length - 1);
                basePath.pop();

                let namespace = basePath.join('.') + "." + versionNamespace;
                path = basePath.join('/') + "/" + versionPath;

                return {
                    exists: true, path,
                    isNamespace: true, namespace,
                    hasVersion: (versionNamespace != undefined), versionNamespace
                };
        }
        return "converted";
    }


    /** classOrFunction or (packageName, classOrFunction) */
    static declare(...args) {
        let packageName, classOrFunction;
        if (typeof args[0] !== "string" && args[1] === undefined) {
            classOrFunction = args[0];
            packageName = null;
        } else {
            packageName = args[0];
            classOrFunction = args[1];
        }

        //console.log("declare ",classOrFunction.name);
        let currentPackage = undefined;
        let currentVersion = undefined;
        let script = undefined;
        let currentScriptInfo = this.currentScriptInfo();
        if (currentScriptInfo.exists) {
            //console.log("   from script",currentScriptInfo.script.src);
            if (currentScriptInfo.isNamespace) currentPackage = currentScriptInfo.namespace;
            if (currentScriptInfo.hasVersion) currentVersion = currentScriptInfo.versionNamespace;
            if (currentScriptInfo.script) script = currentScriptInfo.script;
        }

        packageName = packageName || currentPackage || "";
        if (packageName === Once.USE_DEFAULT)
            packageName = currentPackage || "";

        let packageInfo = this.pathInfo("/EAMD.ucp/Components/" + packageName.replace(/\./g, "/"));

        if (packageName !== "tmp.light" && !packageInfo.hasVersion && currentScriptInfo.hasVersion) {
            packageName = packageName + "." + classOrFunction.name + "." + currentVersion;
            logger.info("corrected namespace to: ", packageName);
        }



        ONCE.global.Namespaces = ONCE.global.Namespaces || new Namespace().init('Namespaces');

        let packages = packageName.split(".");
        let currentNamespace = ONCE.global.Namespaces;
        packages.forEach(name => {
            currentNamespace[name] = currentNamespace[name] || new Namespace().init(name);
            currentNamespace[name].namespace = currentNamespace;
            currentNamespace = currentNamespace[name];
        }
        );
        currentNamespace[classOrFunction.name] = classOrFunction;
        classOrFunction.namespace = currentNamespace;

        if (currentVersion && currentVersion != currentNamespace.name) {
            logger.warn("Version mismatch: ", classOrFunction.name, "in", currentNamespace.package, currentNamespace.name, currentVersion, "in", packageName, "from script package", currentPackage);
        }


        let existingType = ONCE.global[classOrFunction.name];
        if (existingType?.type && existingType != classOrFunction && classOrFunction.name != "Thinglish") {
            console.error(`Potentially overwriting existing Version of: ${classOrFunction.name}
            Old Package ${existingType.type.package} used by: ${existingType.type.usedBy?.[0]}
            New Package ${packageName}
            for loading Class check: ${classOrFunction.name}.type.usedBy?.[0]`);
        }

        //if (document) {
        if (script) {
            currentNamespace.script = script;
            //             if (classOrFunction.scriptInfo) {
            //                 currentScriptInfo.script.mainClass = classOrFunction.scriptInfo.script.mainClass;
            //                 currentScriptInfo.script.mainClassTypeName = classOrFunction.scriptInfo.script.mainClassTypeName;
            //                 logger.warn("#### SCRIPTINFO   classOrFunction: ", classOrFunction.name, "scriptInfo", classOrFunction.scriptInfo.script.src, Thinglish.lookupInObject(classOrFunction, "scriptInfo.script.mainClass.name"));

            //             }
            // if (typeof Thinglish != "undefined") 
            //     logger.warn("#### SCRIPTINFO currentScriptInfo: ", classOrFunction.name, "scriptInfo", currentScriptInfo.script.src, Thinglish.lookupInObject(currentScriptInfo, "script.mainClass.name"));


            classOrFunction.scriptInfo = currentScriptInfo;
            script.declarationListPerScript = script.declarationListPerScript || [];
            script.declarationListPerScript.push(classOrFunction);

            logger.info("declared: '" + classOrFunction.name + "' at '" + currentNamespace.package, "' from script: ", classOrFunction.scriptInfo.script.src);

        }
        //}


        const getter = () => classOrFunction.namespace.package;
        // + "." + classOrFunction.name;
        const setter = newValue => {
            logger.warn("ignore trying to set package to '" + newValue + "' on", classOrFunction.package);
        }
            ;


        // if (typeof classOrFunction.package == 'undefined') {
        Object.defineProperty(classOrFunction, "package", {
            enumerable: false,
            configurable: true,
            get: getter.bind(classOrFunction),
            set: setter.bind(classOrFunction)
        });
        let ownIsStarted = Object.getOwnPropertyDescriptor(classOrFunction, "isStarted");
        if (!ownIsStarted) {
            //logger.log("### added own isStarted to",classOrFunction.name);
            Object.defineProperty(classOrFunction, "isStarted", { "value": false, "writable": true, "enumerable": true, "configurable": true });
        }
        let ownIsLoadingDependencies = Object.getOwnPropertyDescriptor(classOrFunction, "isLoadingDependencies");
        if (!ownIsLoadingDependencies) {
            //logger.log("### added own isLoadingDependencies to",classOrFunction.name);
            Object.defineProperty(classOrFunction, "isLoadingDependencies", { "value": false, "writable": true, "enumerable": true, "configurable": true });
        }
        // } else {
        //     classOrFunction;

        // }
        // if (typeof classOrFunction.type == 'undefined') {
        new TypeDescriptor().init({
            class: classOrFunction,
            name: classOrFunction.package + "." + classOrFunction.name,
            package: currentNamespace.package,
            namespace: currentNamespace,
            isInstance: false
        });
        // }

        // classOrFunction = new Proxy(classOrFunction, {
        //     construct: function (oTarget, constructorArgs) {
        //         if (ONCE.global["IdProvider"])
        //             return oTarget.getInstance().init(...constructorArgs);
        //         else
        //             return new oTarget(...constructorArgs);
        //     },

        // });



        return classOrFunction;
    }

    constructor() {
        this.namespace = null;
        //this.idCounter = 0;
        this._private = new Private({
            name: "secret",
            id: "uninitialized"
        }, this);

        if (this.constructor._instanceCounter === undefined)
            this.constructor._instanceCounter = 0;
        else
            this.constructor._instanceCounter++;

        if (document) {
            //this.loader = new DocumentScriptLoader();
        }
    }

    init(name, namespace) {
        if (Namespace.isVersionName(name) && ONCE.global["Version"]) {
            return new Version().init(name, namespace);
        }
        let value = {
            name,
            id: "uninitialized"
        };
        if (ONCE.global.IdProvider && IdProvider.defaultImplementationClass)
            value.id = IdProvider.createId(this);

        this._private.set(value, this);
        return this;
    }

    lookup(fullQualifiedNameString) {
        return Thinglish.lookupInObject(Namespaces, fullQualifiedNameString);
    }

    get name() {
        return this._private.get(this).name;
    }
    set name(newValue) {
        const oldName = this.name;
        if (this._private.set({
            name: newValue
        }, this)) {
            delete this.namespace[oldName];
            if (this.namespace[newValue]) {
                this._private.set({
                    name: oldName
                }, this)
                throw Error("cannot rename Namespace " + oldName + " to " + newValue + ", because it already exists!");
                // @todo make sure this becomes a valid use case by merging Namespaces
                // DANGER this could stop Once in production
            }
            this.namespace[newValue] = this;
        }
    }

    get parent() {
        return this.namespace;
    }

    get package() {
        let packageNames = [];
        let currentNamespace = this;
        while (currentNamespace.namespace) {
            packageNames.unshift(currentNamespace.name);
            currentNamespace = currentNamespace.namespace;
        }
        let packageName = packageNames.join(".");
        //logger.log(packageName);
        return packageName;
    }

    static isVersionName(name) {
        name = name.replace(/\./g, "_");
        let result = name.match(/([0-9]+)(_{1})([0-9]+)(_{1})([0-9]+)(-){0,1}(.*)*/);
        if (result) {
            if (result.index > 0)
                return false;
            if (!result[6] && result[7])
                return false;
            return true;
        }
        return false;
    }

    isVersionName() {
        return Namespace.isVersionName(this.name);
    }

    namespace2path() {
        let packageNames = [];
        let currentNamespace = this;
        while (currentNamespace.namespace) {
            let name = currentNamespace.name;
            if (currentNamespace instanceof Version)
                name = currentNamespace.versionNumber;
            packageNames.unshift(name);
            currentNamespace = currentNamespace.namespace;
        }
        // @todo replace string by Enum
        let path = /* "/EAMD.ucp/Components/" + */
            packageNames.join("/") + "/";
        //logger.log(packageName);
        return path;
    }
    // path2namespace() {
    //     let pathNames = [];
    //     let currentNamespace = this;
    //     while (currentNamespace.namespace) {
    //         let name = currentNamespace.name;
    //         if (currentNamespace instanceof Version) {
    //             name = currentNamespace.versionNumber;
    //         }
    //         pathNames.unshift(name);
    //         currentNamespace = currentNamespace.namespace;
    //     }       
    //     let namespace = ONCE.REPOSITORY_COMPONENTS;/* "/EAMD.ucp/Components/" + */
    //     + pathNames.join(ONCE.pathSeperator) + ONCE.pathSeperator;
    //     return namespace
    // }

    static path2namespace(path) {
        if (!path) {
            return null;
        }
        var EAMDcomponentDir = `${EAMDucpLoader.EAMDcomponentDir}/`;
        let index = path.indexOf(EAMDucpLoader.EAMDcomponentDir);
        if (index >= 0) {
            index += EAMDcomponentDir.length;
            path = path.substring(index);
        }

        index = path.indexOf(`${EAMDucpLoader.JSdir}/`);
        if (index > 0) {
            path = path.substring(0, index);
        }

        var paths = path.split("/");
        var namespace = null;
        var name = null;

        for (var i in paths) {
            name = paths[i];
            index = name.indexOf(".");
            if (index > 0) {
                // is version
                // var version = new Version().init(name);
                name = name.replace(/\./g, "_");
            }
            if (namespace)
                namespace += `.${name}`;
            else
                namespace = name;
        }
        namespace = namespace.replace(/^Namespaces\./, "");
        return namespace;
    }

    _getObjects(objects, object) {
        if (Thinglish.isClass(object)) {
            logger.debug({
                level: "debug",
                category: "NAMESPACE"
            }, "Class: " + object.type.name);
            objects.push(object);
            ONCE.global[object.name] = ONCE.global[object.name] || object;
        }
        if (object instanceof Namespace /*|| object.isPackage*/
        ) {

            // @todo find similar legacy code and replace with Verion check: if (object.name.indexOf("_0") != -1)
            if (object instanceof Version && Thinglish.isClass(object.namespace)) {
                return object;
            }

            var contained = false;
            if (Thinglish.isClass(object)) {
                for (var i in objects)
                    if (object === objects[i]) {
                        contained = true;
                        break;
                    }

                if (contained) {
                    return object;
                }
            }

            logger.debug({
                level: "debug",
                category: "NAMESPACE"
            }, object.package);

            const arr = Object.values(object).filter(item => item && item.name !== 'type' && item.name !== 'namespace').filter(item => item instanceof Namespace || item instanceof Version /*|| item.isPackage*/
            );

            if (object.parent) {// logger.log(` =========== ${object.parent? object.parent.parent.name : ''} ${object.parent.name} ${object.name}  ===============`);
            }

            //logger.log(arr.map(item => item.name).join(','));
            // arr.forEach(item => {
            //     this._getObjects(objects, item);
            // });

            for (var i in object) {
                var o = object[i];
                if (i !== "namespace" && i !== "type"/* && !(o instanceof Version)*/
                ) {
                    this._getObjects(objects, o);
                }
            }

        }

        return objects;
    }

    static bootstrapLoaderInterface(namespace, classOrFunction) {
        if (window["Loader"])
            return classOrFunction;
        var namespace = this.declare(namespace, classOrFunction);
        namespace.type.extends = Interface;
        ONCE.global.Loader = namespace;
        Interface.type.implementations.push(Loader);

        //Thinglish._addImplementation(DocumentScriptLoader, Loader);
        //Thinglish._addImplementation(EAMDucpLoader, Loader);
        //Thinglish._addImplementation(WeBeanLoader, Loader);

        return namespace;
    }

}


class Thing {
    static get implements() {
        return null;
    }
    static get dependencies() {
        return [];
    }

    static start() {
        logger.debug({
            level: "debug",
            category: "ONCE"
        }, this.type.name + " can be started");
        this.canBeStarted = true;
        //this.hasStartFunction = false;
        this.isStarted = false;
    }

    static discover() {
        //            var anInterface = Namespaces.lookup(this.type.name);
        return this.type.implementations;
    }

    constructor() {
        //const packageName = Namespaces.lookupInObject(this, "constructor.namespace.package");
        if (typeof ONCE !== 'undefined' && ONCE.state) {
            Thinglish.addLazyGetter(this, "Store", RelatedObjectStore);
            Thinglish.initType(this /*, packageName*/);
            this._private.id = this.type.name + "[" + (this.type.class._instanceCounter++) + "]";
        }
    }

    init() {
        return Object.freeze(this);
    }

    //        implement() {}

    load(object) {
        //            logger.debug(this.type.name + " is loading " + object.toString());
        if (!object) {
            return null;
        }
        if (Thinglish.lookupInObject(object, "type.name") === "IOR" ||
            object.type.class.name === "IOR") {
            return object.load();
        }

        return Namespaces.loader.load(object);
    }

    lookup(aClass) {
        return this.Store.lookup(aClass);
    }
    /*
        definePrivateAttribute(name, defaultValue) {
            Object.defineProperty(this, name, {
                enumerable: false,
                configurable: false,
                writable: true,
                value: defaultValue
            });
        }
    
        defineProperty(name, defaultValue, onWillChange) {
            var _propertyValue = defaultValue;
            onWillChange = onWillChange || this.defaultOnChange;
            // var _onWillChangeFunction = onWillChange;
    
            Object.defineProperty(this, name, {
                enumerable: false,
                configurable: true,
                get: () => _propertyValue,
                set: newValue => {
                    logger.debug("set '" + name + "' to '" + newValue + "'");
                    if (onWillChange) {
                        newValue = onWillChange();
                    }
                    _propertyValue = newValue;
                }
            });
        }
    
        defaultOnChange(name, oldValue, newValue) {
            logger.debug("property '" + name + "' changes from '" + oldValue + "' to '" + newValue + "'");
            return newValue;
        }
    
        get package() {
            var packageName = this.name;
            if (this.namespace)
                packageName = this.namespace.package + "." + this.name;
    
            return packageName;
    
        }
    
        set package(newPackage) {
            var thisPackage = new Namespace().setPackage(this.constructor, newPackage + "." + this.constructor.name);
            this.namespace = thisPackage;
            //eval("delete "+this.name+";");
            return thisPackage;
        }
    */
    discover() {
        return [this.Store];
    }

    /**
     *
     * @param {IOR} ior
     * @return {Promise} response
     */
    async call(ior, parameter) {
        const newIor = new IOR().init(ior.url);
        newIor.loader = ior.loader;
        newIor.headers = ior.headers;
        newIor.queryParameters = parameter;
        return newIor.load();
    }

    getDescriptor(merge, force) {
        if (force == undefined) {
            force = true;
        }
        return JavaScriptObjectDescriptor.describe(this, merge, force);
    }

    get uses() {
        return this.type.class.uses;
    }
    set uses(newValue) {
        logger.warn("Trying to set a readonly value: uses");
    }

    static get uses() {
        let d = this.ucpComponentDescriptor;
        if (!d || d.isLocal) {
            let dependencies = this.type.class.dependencies.map(d => {
                let ior = EAMDucpLoader.loockupObject(d);
                if (!ior)
                    return new IOR().init(d);

                let aClass = ior.referencedObject;
                let descriptor = aClass.type.ucpComponentDescriptor;
                if (!descriptor)
                    return ior;
                return descriptor;

            });
            dependencies.displayName = "Dependencies of " + this.type.class.name + " - " + this.type.version;
            //dependencies.displayName = "Dependencies of "+this.type.class.name+"["+this.type.versionString+"]";
            dependencies.description = "Class: " + this.package;

            return dependencies;
        }
        return this.ucpComponentDescriptor.data.uses;
    }

    static set uses(newValue) {
        logger.warn("Trying to set a readonly value: uses");
    }


    // getIOR() {
    //     let ior = "IOR:http://" + ONCE.ENV.ONCE_DEFAULT_SERVER + "/ior/" + this.type.name + "?id=" + this._private.get(this).id;
    //     logger.log(ior);
    //     return ior;
    // }

}

class Once extends Thing {


    static get dependenciesGroups() {
        switch (ONCE.mode) {
            case Once.MODE_NAVIGATOR:
            case Once.MODE_I_FRAME:
                return [
                    [
                        "/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/4.3.2/Thinglish.component.xml", //BS free
                        "/EAMD.ucp/Components/tla/EAM/layer3/logging/Logger/1.0.0/Logger.component.xml",
                        //"/EAMD.ucp/Components/com/ceruleanCircle/EAM/2_systems/BasicDataTypes/0.4.0/BasicDataTypes.component.xml", //BS free
                        "/EAMD.ucp/Components/tla/EAM/layer1/OnceServices/EventService/4.3.0/EventService.component.xml", // BS free
                    ], [
                        "/EAMD.ucp/Components/tla/EAMD/UcpComponentSupport/4.3.2/UcpComponentSupport.component.xml",
                        "/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/4.3.2/src/js/DragDropTouch.js",
                    ],
                    // Load all Components who are UcpComponents
                    [
                        "/EAMD.ucp/Components/tla/EAM/layer2/RESTClient/4.3.2/RESTClient.component.xml",
                        "/EAMD.ucp/Components/tla/EAM/layer5/DnDSupport/1.0.0/DnDSupport.component.xml",
                        //"ior:module:/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/4.3.0/src/js/DragDropTouch.js",
                        //"tla.EAM.layer1.OnceServices.OnEventServicece.1_4_3"
                        "/EAMD.ucp/Components/tla/EAM/layer3/lang/MultilanguageController/4.3.0/MultilanguageController.component.xml",
                    ]

                ];
            case Once.MODE_NODE_SERVER:
                return [
                    [
                        "/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/4.3.0/Thinglish.component.xml", //BS free
                        "/EAMD.ucp/Components/tla/EAM/layer3/logging/Logger/1.0.0/Logger.component.xml",
                        //"/EAMD.ucp/Components/com/ceruleanCircle/EAM/2_systems/BasicDataTypes/0.4.0/BasicDataTypes.component.xml", //BS free
                        "/EAMD.ucp/Components/tla/EAM/layer1/OnceServices/EventService/4.3.0/EventService.component.xml", // BS free
                    ], [

                        "/EAMD.ucp/Components/tla/EAMD/UcpComponentSupport/4.3.2/UcpComponentSupport.component.xml",
                    ], [

                        "/EAMD.ucp/Components/tla/EAM/layer2/RESTClient/4.3.2/RESTClient.component.xml",
                        "/EAMD.ucp/Components/org/Keycloak/KeycloakSessionManager/4.3.2/KeycloakSessionManager.component.xml",
                        "/EAMD.ucp/Components/tla/EAM/layer3/lang/MultilanguageController/4.3.0/MultilanguageController.component.xml",
                    ]
                ];
        }
    }

    static get dependencies() {
        this.type.dependencies = this.dependenciesGroups.flat();
        return this.type.dependencies;
    }

    get id() {

        // @ToDo should be replaced with an .IOR.id
        if (!this._private.id) {
            this._private.id = UUID.uuidv4();
        }
        return this._private.id;
    }
    constructor() {
        super();
        console.log("creating Once");
        Object.assign(this, {
            global: "uninitialized",
            installationMode: "uninitialized",
            pathSeperator: '/',
            startPath: ".",
            basePath: ".",
            repositoryRootPath: "uninitialized",
            mode: "uninitialized",
            autoRestart: false,
            hostnames: new Set(),
            clients: new Set(),
            dynamicPort: 7080,
            httpsPort: 7443,
            //443
            state: "new"
        });
        this._private = {};
        //logger.log("Once: ", this);
    }


    notImplementedYet() {
        throw new Error(`you must implement this method`);
    }

    async discover() {
        return await ONCE.getServer().discoverServices();
    }

    static async start() {
        let ONCE = new Once();
        ONCE.startTime = Date.now();

        console.log("starting...");
        // Set the stackTrace limit to Infinity (For loop Detection)
        if (Error.stackTraceLimit) {
            Error.stackTraceLimit = Infinity;
        }
        //try {
        if (typeof global === 'object') {
            if (global.ONCE) {
                logger.log("ONCE is already running: " + global.ONCE.mode);
                ONCE.state = "shutdown";
                logger.log("leaving uninitialized Once instance behind for garbage collection... ", ONCE);
                logger.log("This happens if you start ONCE a second time.");
                return global.ONCE;
            }

            console.log("starting in a node environment");
            global.ONCE = ONCE;
            ONCE.mode = "nodeServer";
            //var rootWindow = global;
            global.window = global;
            global.document = null;
            //    var url = require('url');
            //    const URL = url.URL;
            ONCE.global = global;


        }
        //} catch (err) {
        else {

            console.log("not in a node environment");
            if (ONCE.global.frameElement && iframeSupport) {
                logger.log("running in an iFrame");
                var rootWindow = ONCE.global.frameElement.contentONCE.global.parent;
                ONCE = rootONCE.global.ONCE;
                Namespaces = rootONCE.global.Namespaces;
                var UcpComponentSupport = rootONCE.global.UcpComponentSupport;
                ONCE.global.frameElement.onload = UcpComponentSupport.onload.bind(UcpComponentSupport);
                //var ucp = UcpComponentSupport.findUcpComponentLinks(document)
                //UcpComponentSupport.loadAndStartAll(ucp);
                logger.log("iFrame initialized");
                ONCE.mode = "iFrame";
            } else {
                if (ONCE.global.ONCE) {
                    logger.log("ONCE is already running: " + ONCE.global.ONCE.mode);
                    ONCE.state = "shutdown";
                    logger.log("leaving uninitialized Once instance behind for garbage collection... ", ONCE);
                    return ONCE.global.ONCE;
                }
                console.log("running in a Browser");
                window.ONCE = ONCE;
                ONCE.global = window;
                ONCE.mode = "navigator";
            }
        }

        //ONCE.isStarted = true; // Prevent to start it again

        await ONCE.init();

        ONCE.state = Once.STATE_STARTED;
        Thinglish.defineAccessors(Once, "state", () => ONCE.state, newValue => ONCE.state = newValue);

        try {
            if (typeof App !== "undefined") {
                let app = App.start();
                ONCE.Store.register(App, app);
            }

        } catch (e) {
            // @TODO Please fix
            //Action.do(DetailsView.ACTION_SHOW, e);
            console.error(e);
            Action.do(DetailsView.ACTION_SHOW, e);
        }
        // This is needed if no further component with Style is loaded
        if (typeof LessSingleton !== 'undefined') {
            LessSingleton.compile();
        }

        return ONCE;
    }

    static async loadENV(urlObject) {

        urlObject.pathName = (urlObject.pathName || '') + '/once/env';
        let fetchResult = await fetch(urlObject.url);
        if (fetchResult.ok) {
            return fetchResult.json();
        } else {
            throw new Error(`Fail to load ENV from URL ${urlObject.url}`)
        }
    }

    getServer() {
        if (!this._private.ownServer) {
            const json = {
                name: "Own ONCE Server",
                clientClass: RESTClient,
                url: ONCE.ENV.ONCE_DEFAULT_URL,
            }
            this._private.ownServer = DefaultServer.getInstance().init(json);
            this._private.ownServer.setEnv(ONCE.ENV);
        }
        return this._private.ownServer;
    }

    async init() {
        ONCE.global.originalConsole = console;

        ONCE.global.silentConsole = { log: m => { }, info: m => { }, debug: m => { }, warn: ONCE.global.originalConsole.warn, error: ONCE.global.originalConsole.error };
        //console = ONCE.global.silentConsole;
        ONCE.global.logger = ONCE.global.silentConsole;

        logger.log("initializing Once");

        ONCE.global.Version = Namespace.declare(null,
            class Version extends Namespace {
                static get implements() {
                    return null;
                }
                constructor() {
                    super();
                    this.major = null;
                    this.minor = null;
                    this.patch = null;
                    this.revision = null;
                }

                init(name, namespace) {
                    this._private.set({
                        name
                    }, this);
                    this.namespace = namespace;
                    return this;
                }

                static parse(name, namespace) {
                    name = name.replace(/\./g, "_");
                    let result = name.match(/([0-9]+)(_{1})([0-9]+)(_{1})([0-9]+)(-){0,1}(.*)*/);
                    if (result) {
                        if (result.index > 0)
                            return null;
                        if (!result[6] && result[7])
                            return null;

                        let version = new Version().init(name, namespace);
                        version.major = parseInt(result[1]);
                        version.minor = parseInt(result[3]);
                        version.patch = parseInt(result[5]);
                        version.revision = result[7];
                        /*
                            logger.log("Major: ",result[1]);
                            logger.log("Minor: ",result[3]);
                            logger.log("Patch: ",result[5]);
                            logger.log("revision: ",result[6]);
                            logger.log("true\n");
                            */
                        return version;
                    }
                    return null;
                }

                get versionNamespace() {
                    return this.name.replace(/\./g, "_");
                }

                get versionNumber() {
                    return this.name.replace(/_/g, ".");
                    ;
                }

            }
        );
        ONCE.global.Once = Namespace.declare("tla.EAM.layer1.Thinglish", Once);
        ONCE.global.Namespace = Namespace.declare("tla.EAM.layer1.Thinglish", Namespace);


        ONCE.now = () => {
            if (ONCE.global.performance?.timing?.navigationStart == undefined) {
                //logger.warn('No ONCE.global.performance');
                return Date.now();
            }
            return ONCE.global.performance.now() + ONCE.global.performance.timing.navigationStart;

        }

        ONCE.printDependencies = () => {

            let result = "";
            let packages = new ArraySet();

            const loopUses = (inputClass = Once, alreadyFound = []) => {
                let result = "";
                for (let aClass of inputClass.type?.uses || []) {
                    if (alreadyFound.includes(aClass)) continue;
                    alreadyFound.push(aClass);
                    if (aClass?.ior?.pathName) {
                        result += ` "${inputClass.type.name}" --|> "${aClass.ior.pathName}"\n`;
                        continue
                    }
                    if (!Thinglish.isClass(aClass)) {
                        continue;
                    }
                    packages.push(aClass.type.name);
                    result += ` "${inputClass.type.name}" --|> "${aClass.type.name}"\n`;
                    result += loopUses(aClass, alreadyFound);
                }
                return result;
            };

            result = loopUses();

            let packagePUMLStructure = {};
            packages.forEach(p => { let x = p.replace(/\.([^\.]+)$/, "_$1"); Thinglish.setInObject(packagePUMLStructure, x, p, true) })

            const loopPackages = (packageObject) => {
                let result = "";
                Object.keys(packageObject).forEach(key => {
                    const value = packageObject[key];
                    if (typeof value === "string") {
                        result += `  [${value}] as "${key}" \n`
                    } else {
                        result += ` package "${key}" { \n`
                        result += loopPackages(packageObject[key]);
                        result += ` }\n`;
                    }
                })
                return result;
            }
            return "@startuml \n" + 'package "Component" {\n' + loopPackages(packagePUMLStructure) + result + "\n@enduml";



        }

        ONCE.global.Thinglish = Namespace.declare("tmp.light",
            class Thinglish {
                static get implements() {
                    return null;
                }

                static isPromise(obj) {
                    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function' && typeof obj.catch === 'function';
                }

                static isArrowFunction(fn) {
                    return (typeof fn === 'function') && /^[^{]+?=>/.test(fn.toString());
                }

                static createSmartEvent(/* element, eventName */
                ) { }

                static initType(object /*, packageName */
                ) {
                    //logger.debug("init Type:", object);
                    if (Thinglish.isClass(object)) {
                        logger.debug("initType only for objects, not for classes");
                    }
                    object._private = new Private({
                        name: "secret",
                        //id: IdProvider.createId(),
                        typeInited: true
                    }, object);

                    if (object.type && object.type.isInstance) {
                        return;
                    }
                    if (object._private && object._private.typeInited) {
                        // to avoid call more than once
                        return;
                    }
                    object.type = object.constructor.type;

                    Thinglish.defineAccessors(object, "package", () => {
                        if (!object || !object.namespace) {
                            return null;
                        }
                        return object.namespace.package;
                        // + "." + object.constructor.name;
                    }
                        , newValue => logger.warn("trying to set package to ", newValue));
                    Thinglish.defineAlias(object, "constructor.namespace", "namespace");
                    Thinglish.defineAlias(object, "constructor.type", "type");

                    if (!Thinglish.getAllPropertiesDescriptor(object.__proto__, "id")) {
                        Thinglish.defineAccessors(object, "id", () => {
                            this._private = this._private || {};
                            this._private.id = this._private.id || UUID.createId();
                            return this._private.id;

                            // moved all id handling into the normal getter
                            // if (object.IOR?.id) return object.IOR.id

                            // if (object.ucpComponent != undefined) return object.ucpComponent.id;

                            // // @todo remove hack with Bene
                            // if (!object._private.get) {
                            //     //logger.warn("Object ", object, "._private    IS NOT of type Private...")
                            //     return object._private.ucpComponent.id;
                            // }
                            // return object._private.get(object).id;
                        }, () => logger.warn("IDs are constants"));
                    }

                    // object._private = object._private || {
                    //     id: object._private.get().id
                    // };
                    object._protected = object._protected || {};
                    if (!object.name) {
                        object.name = object.constructor.name;
                    }
                    if (object.type.class.implements) {
                        let interfaces = object.type.class.implements;
                        let extendedClass = object.type.extends;
                        while (extendedClass) {
                            if (extendedClass.implements) {
                                interfaces = interfaces.concat(extendedClass.implements);
                            }

                            extendedClass = extendedClass.type.extends;
                        }



                        // Check if the interfaces are already implemented
                        if (!object.type.implements) {


                            interfaces.forEach(anInterface => {
                                if (!Thinglish.implement) {
                                    logger.log({
                                        level: "warn",
                                        category: "RENDERING"
                                    }, "Did not implement", anInterface.name, "on", object.type.name);
                                    return;
                                }
                                while (anInterface.name !== "") {
                                    Thinglish.implement(object, anInterface);
                                    anInterface = Object.getPrototypeOf(anInterface);
                                }
                            }
                            );
                        }
                    }

                    // // Add View classes
                    // if (object.type?.ucpComponentDescriptor?.units?.length > 0) {
                    //     for (let unit of object.type?.ucpComponentDescriptor?.units) {
                    //         if (unit.model.type === Unit.TYPE.VIEW_CLASS) {
                    //             object.Store.register(unit.model.class, unit.model.class);
                    //         }
                    //     }
                    // }

                    object._private.typeInited = true;

                }

                static createPromise() {
                    // Need to create a native Promise which also preserves the
                    // interface of the custom promise type previously used by the API
                    const p = {
                        setSuccess: function (result) {
                            p.resolve(result);
                        },

                        setError: function (result) {
                            p.reject(result);
                        }
                    };
                    p.promise = new Promise(function (resolve, reject) {
                        p.resolve = resolve;
                        p.reject = reject;
                    });
                    return p;
                }

                static implement(aClass, anInterface, silent) {

                    const typeMaches = Thinglish.isTypeOf(anInterface, Interface);
                    if (!typeMaches) {
                        Thinglish.throwTypeError("anInterface", anInterface, "Interface", "Implement " + anInterface.name + "  ");
                    }


                    if (!Thinglish.isClass(aClass)) {
                        logger.log(aClass, "is not a Class!!!");
                        return;
                    }

                    if (aClass.type && aClass.type.implements && aClass.type.implements.indexOf(anInterface) != -1) {
                        //logger.log(anInterface.name, "is already implemented");
                        return;
                    }

                    // static features
                    Thinglish._inheritFeatures(anInterface, aClass);
                    // non-static features
                    Thinglish._inheritFeatures(anInterface.prototype, aClass.prototype); //NOT Object.getPrototypeOf(anInterface)  which gives Interface (=== extends)

                }

                static getAllPropertiesDescriptor(object, name) {
                    const propertyDescriptors = this.getAllPropertiesDescriptors(object);
                    for (var key in propertyDescriptors) {
                        if (key == name) return propertyDescriptors[key]
                    }
                }

                static getAllPropertiesDescriptors(object) {
                    let propertyDescriptors = {};
                    do {
                        let propertyDescriptorsTemp = Object.getOwnPropertyDescriptors(object);

                        Object.assign(propertyDescriptorsTemp, propertyDescriptors);
                        propertyDescriptors = propertyDescriptorsTemp;
                        object = object.__proto__;
                    } while (object)
                    return propertyDescriptors;
                }

                static _inheritFeatures(sourceClass, targetClass, config) {

                    const blacklist = ['IOR', 'constructor', 'defaultImplementationClass', 'overwriteServerDescriptor', 'weBeanUnitPaths', 'dependencies', 'eamLayer', 'initInterface', 'start'];

                    let sourcePropertyDescriptors = Object.getOwnPropertyDescriptors(sourceClass);
                    let targetPropertyDescriptors = Thinglish.getAllPropertiesDescriptors(targetClass);

                    for (const name in sourcePropertyDescriptors) {
                        if (blacklist.includes(name)) continue;

                        let descriptor = sourcePropertyDescriptors[name];
                        let aClassProperty = targetPropertyDescriptors?.[name];

                        if (!aClassProperty || (config && config.overwrite === true)) {

                            if (descriptor.get) {
                                Object.defineProperty(targetClass, name, descriptor);
                            } else {
                                targetClass[name] = descriptor.value;
                            }
                            /*if (!(silent == true)) {
                                Thinglish.throwTypeError(sourceClass.name, aClassProperty, name, "Class " + targetClass.constructor.name + " did not implement method: ")
                            }*/
                        }
                    }
                }

                static _addInterface(typeDescriptor, anInterface) {
                    if (!typeDescriptor) {
                        return;
                    }
                    const interfaces = typeDescriptor.implements = typeDescriptor.implements || [];

                    if (interfaces.indexOf(anInterface) === -1)
                        interfaces.push(anInterface);
                }

                // it's overrited below
                /*
                    static _addImplementation(type, anInterface) {
                        if (!anInterface.type)
                            Namespace.declare("tla.EAM.layer3", anInterface);
                        //                Thinglish.initType(anInterface);
        
                        var implementations = anInterface.type.implementations
                        if (!implementations) {
                            implementations = anInterface.type.implementations = [];
                        }
                        if (implementations.indexOf(type) == -1)
                            implementations.push(type);
                    }
                    */

                static throwTypeError(argName, argValue, expectedArgType, contextMessage) {
                    const argType = typeof argValue;
                    contextMessage = contextMessage || "TypeError: ";
                    const message = contextMessage + "expected type [" + expectedArgType + "] does not match " + "values type [" + argType + "] in value " + argValue;

                    switch (Thinglish.onTypeError) {
                        case Thinglish.SILENT_ON_TYPE_ERROR:
                            return false;
                        case Thinglish.VERBOSE_ON_TYPE_ERROR:
                            logger.debug(message);
                            return true;
                        case Thinglish.WARN_ON_TYPE_ERROR:
                            logger.warn(message);
                            return true;
                        case Thinglish.STOP_ON_TYPE_ERROR:
                            throw new TypeError(message);
                        default:
                            break;
                    }
                    return false;
                }
                static isInstanceOf(argValue, expectedArgType /*, warnOrError */
                ) {
                    if (Thinglish.isClass(argValue)) {
                        return false;
                    }
                    return Thinglish.isTypeOf(argValue, expectedArgType);
                }

                static isInstanceOfold(argValue, expectedArgType, warnOrError) {

                    //logger.log("instanceof ",argValue.name,expectedArgType.name);
                    if (expectedArgType === Interface) {
                        return false;
                    }
                    var argType = typeof argValue;
                    if (argType === "object") {

                        if (!argValue.type)
                            Thinglish.initType(argValue);

                        if (argValue.type)
                            argType = argValue.type.name;
                        else
                            argType = null;

                    }

                    if (argType === expectedArgType) {
                        //                    logger.debug(argName + ":" + argType + "  = " + argValue);
                        return true;
                    } else {
                        if (argType === "function") {
                            if (argValue.name === expectedArgType) {
                                //                    logger.debug(argName + ":" + argType + "  = " + argValue);
                                return true;
                            }
                            if (argValue.name === expectedArgType.name) {
                                //                    logger.debug(argName + ":" + argType + "  = " + argValue);
                                return true;
                            }
                        }
                        if (argType === expectedArgType.name) {
                            return true;
                        }
                        var result = false;
                        if (argValue.type && argValue.type.extends)
                            result = Thinglish.isInstanceOf(argValue.type.extends, expectedArgType, warnOrError);
                        if (result == true)
                            return true;
                        if (expectedArgType.type && expectedArgType.type.extends)
                            result = Thinglish.isInstanceOf(argValue, expectedArgType.type.extends, warnOrError);

                        if (argValue.type && argValue.type.implements) {
                            result = argValue.type.implements.some(type => {
                                if (expectedArgType == Interface)
                                    return false;
                                return Thinglish.isInstanceOf(type, expectedArgType, warnOrError);
                            }
                            );
                        }
                        if (expectedArgType.type && expectedArgType.type.implements) {
                            result = expectedArgType.type.implements.some(type => {
                                if (type == Interface)
                                    return false;
                                return Thinglish.isInstanceOf(argValue, type, warnOrError);
                            }
                            );
                        }

                        return result;
                    }
                    /**/
                }
                static isClass(aClass) {
                    return aClass instanceof Function && aClass.toString().substring(0, 6) === 'class ';
                }

                isClass(aClass) {
                    aClass = aClass || this;
                    return Thinglish.isClass(aClass);
                }

                static isES6Module(code) {
                    let hasImports = code.indexOf("import ") === -1 ? false : true;

                    return hasImports;
                }
                static migrateCodeToES6Module(code) {
                    let declareregEx = /var (.*) = Namespace.declare/g
                    let declarations = [...code.matchAll(declareregEx)];
                    code = code.replace(declareregEx, "let $1 = Namespace.declare")
                    let exportString = "\n//export default { " + declarations.map(a => a[1]).join(", ") + " }";
                    code = code + exportString;
                    return code;
                }

                static defineAlias(object, name, alias, defaultValue) {
                    const _propertyName = name;
                    let _object = object;
                    const _defaultValue = defaultValue;
                    if (alias && typeof alias !== "string") {
                        _object = alias;
                        alias = undefined;
                    }

                    if (!alias) {
                        alias = name.substr(name.lastIndexOf(".") + 1);
                    }

                    Object.defineProperty(object, alias, {
                        enumerable: false,
                        configurable: true,
                        get: () => {
                            //logger.warn("get: " , _object, _propertyName);
                            return Thinglish.lookupInObject(_object, _propertyName) || _defaultValue;
                        }
                        ,
                        set: (newValue) => {
                            //logger.debug("set '" + _object.id + "." + _propertyName + "' to ", newValue);
                            //var value = Thinglish.lookupInObject(_object, _propertyName);
                            Thinglish.setInObject(_object, _propertyName, newValue);
                            //_object[_propertyName] = newValue;
                        }
                    });
                }

                static defineAccessors(object, name, getter, setter) {
                    var _propertyName = name;
                    var _object = object;

                    if (!getter)
                        getter = () => {
                            return _object[_propertyName]
                        }
                            ;
                    if (!setter)
                        setter = (newValue) => {
                            logger.debug("set '" + _propertyName + "' to '" + newValue + "'");
                            _object[_propertyName] = newValue;
                        }
                            ;

                    Object.defineProperty(_object, name, {
                        enumerable: false,
                        configurable: true,
                        get: getter.bind(_object),
                        set: setter.bind(_object)
                    });
                }

                static addLazyGetter(object, attribute, implementationClass) {
                    // @todo specify setter better
                    let propertyValue = null;

                    Object.defineProperty(object, attribute, {
                        enumerable: true,
                        configurable: false,
                        get: () => {
                            //_propertyValue = _propertyValue || eval("new " + attribute + "();");
                            propertyValue = propertyValue || implementationClass.getInstance().init();
                            return propertyValue;
                        }
                        ,
                        set: newValue => {
                            logger.debug("set '" + attribute + "' to '" + newValue + "'");
                            propertyValue = newValue;
                        }
                    });
                }


                static async startDependencies(aClass) {
                    if (!aClass) {
                        return null;
                    }
                    logger.log({
                        level: "debug",
                        category: "ONCE"
                    }, 'start dependencies for ', aClass.name);
                    //const dependencies = aClass.dependenciesGroups || aClass.dependencies || [];

                    /* @todo comment in to see how multiple versions will be loaded if there is a dependency diff
                            if (Namespace.lookupInObject(aClass,"type.ucpComponentDescriptor"))
                                dependencies = aClass.type.ucpComponentDescriptor.getAllDependencies();
                            */

                    await Thinglish.loadAndStartAll(aClass);

                    logger.log({
                        level: "user",
                        category: "BOOTING"
                    }, "ONCE loaded all dependencies in ", Date.now() - ONCE.startTime, " milliseconds .... now listening");

                }

                static _addImplementation(type, anInterface) {
                    if (!anInterface.type) {
                        Namespace.declare(null, anInterface);
                    }

                    anInterface.type.implementations = anInterface.type.implementations || [];
                    const implementations = anInterface.type.implementations;

                    if (implementations.indexOf(type) === -1) {
                        implementations.push(type);
                    }
                }

                static existsInObject(object, thingName) {
                    const objectPath = thingName.split(".");
                    let currentObject = object;
                    for (let parameterName of objectPath) {

                        // Allow query on Arrays
                        if (parameterName.startsWith('[') && parameterName.endsWith(']')) parameterName = parameterName.substring(1, parameterName.length - 1);
                        if (currentObject === undefined || currentObject === null) return false;
                        if (typeof currentObject[parameterName] == 'undefined') return false;
                        currentObject = currentObject[parameterName];
                    }
                    return true;
                }

                static lookupInObject(object, thingName, config) {
                    if (thingName === "") return object;
                    const objectPath = thingName.split(".");
                    let currentObject = object;
                    for (let parameterName of objectPath) {

                        // Allow query on Arrays
                        if (parameterName.startsWith('[') && parameterName.endsWith(']')) parameterName = parameterName.substring(1, parameterName.length - 1);

                        currentObject = currentObject[parameterName];
                        if (currentObject === undefined || currentObject === null) {
                            if (config && config.noNull === true) {
                                return undefined;
                            } else {
                                return null;
                            }
                        }
                    }
                    return currentObject;
                }

                static setInObject(object, thingName, newValue, forceSetter = false) {
                    var originalObjectPath = thingName.split(".");
                    var objectPath = [...originalObjectPath];
                    var setter = objectPath.pop();
                    var actionDelete = false;
                    if (setter.endsWith('#DELETE')) {
                        actionDelete = true;
                        setter = setter.substring(0, setter.length - 7);
                        forceSetter = false; // No Force in case of delete 
                    }
                    var currentObject = object;
                    var name = null;

                    for (var i in objectPath) {
                        name = objectPath[i];
                        if (name.startsWith('[') && name.endsWith(']')) name = name.substring(1, name.length - 1)
                        const nextName = originalObjectPath[(parseInt(i) + 1)];

                        if (forceSetter && currentObject[name] === undefined) {
                            currentObject[name] = (nextName.startsWith('[') ? [] : {});
                        }

                        currentObject = currentObject[name];

                        if (currentObject == undefined) {
                            //                logger.warn(currentObject.package, name + " not found");
                            return null;
                        }
                    }
                    if (setter.startsWith('[') && setter.endsWith(']')) setter = setter.substring(1, setter.length - 1)

                    if (actionDelete) {
                        if (Array.isArray(currentObject)) {
                            currentObject.splice(setter, 1);
                        } else {
                            delete currentObject[setter];
                        }
                        return undefined;
                    }
                    return currentObject[setter] = newValue;

                }

                static isTypeOf(object, aClass) {
                    if (!object) return false;
                    if (aClass == Any) return true;
                    var types = this.getAllTypes(object);
                    return types.indexOf(aClass) != -1;
                }

                static getAllTypes(object, types = []) {

                    let currentClass = object;
                    if (!Thinglish.isClass(currentClass)) {
                        if (object.type) {
                            currentClass = object.type.class;
                        } else {
                            currentClass = null;
                        }
                    }

                    const addsImplementations = (list) => {
                        list.forEach(i => {
                            if (!types.includes(i)) {
                                types = [...new Set([...types, ...this.getAllTypes(i, types)])];
                                let ifcIdx = types.indexOf(Interface);
                                if (ifcIdx != -1) types.splice(ifcIdx, 1);
                            }
                        }
                        );
                    }

                    while (currentClass && !types.includes(currentClass)) {

                        types.push(currentClass);

                        // declaration time implements via static implements
                        if (currentClass.implements) {
                            addsImplementations(currentClass.implements, types);
                        }

                        // runtime implements via Thinglish.implements (e.g. Namespace in DefaultFolder)
                        if (currentClass.type.implements && currentClass.type.implements.length > 0) {
                            addsImplementations(currentClass.type.implements, types);
                        }
                        currentClass = currentClass.type.extends;

                    }

                    return types;
                }

                static wait(ms) {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve();
                        }
                            , ms);
                    }
                    );
                }

                static isAllUpperCase(value) {
                    if (!value && this.constructor.name === "String")
                        value = this;
                    return Object.keys(value).every(k => value[k] === value[k].toUpperCase());
                }


                static snake_case2CamelCase(s) {
                    if (!s && this.constructor.name === "String") {
                        s = this;
                    }
                    var camelCase = s.replace(/(_\w)/g, function (m) {
                        return m[1].toUpperCase();
                    });
                    camelCase = camelCase.replace(/(-\w)/g, function (m) {
                        return m[1].toUpperCase();
                    });
                    return camelCase;
                }
                static camelCase2snake_case(value) {
                    if (!value && this.constructor.name === "String") {
                        value = this;
                    }
                    return value.replace(/([A-Z])/g, function ($1) {
                        return "_" + $1.toLowerCase();
                    });
                }
                static camelCase2label(value) {
                    if (!value && this.constructor.name === "String") {
                        value = this;
                    }

                    value = value.replace(/([A-Z])/g, function ($1) {
                        return " " + $1.toUpperCase();
                    });
                    value = Thinglish.capitalize(value);
                    return value;
                }
                static camelCase2placeholder(value) {
                    if (!value && this.constructor.name === "String")
                        value = this;

                    value = value.replace(/([A-Z])/g, function ($1) {
                        return " " + $1.toLowerCase();
                    });
                    return value;
                }

                static camelCase2dashCase(value) {
                    if (!value && this.constructor.name === "String")
                        value = this;
                    return value.replace(/([A-Z])/g, function ($1) {
                        return "-" + $1.toLowerCase();
                    });
                }

                static capitalize(value) {
                    if (!value && this.constructor.name === "String") {
                        value = this;
                    }
                    return value.replace(/(.)/, function ($1) {
                        return $1.toUpperCase();
                    });
                }

                static get currentMethodName() {
                    return this.stack[2].name;
                }
                static get currentMethodDescriptor() {
                    return this.stack[2];
                }
                static currentMethod(currentThis) {
                    let methodDescriptor = this.stack[2];
                    let method = currentThis[methodDescriptor.name];
                    return method;
                }
                static get stack() {
                    let stack = (new Error).stack;
                    let methodStack = stack.match(/at (\S+)/g);
                    if (!methodStack) {
                        return this.parseStackSafari(stack)
                    }
                    else {
                        methodStack = methodStack.map(f => f.slice(3));
                    }
                    let links = stack.match(/\(.*()\)/g);

                    let i = 0;
                    let functionDescriptors = methodStack.map(m => {
                        let literal = m.split(".");
                        let link = links[i++];
                        link = link ? link.substring(1, link.length - 1) : "";
                        let lines = link ? link.split(":") : [0, 0];

                        let method = {
                            name: literal[1],
                            type: literal[0],
                            href: link,
                            pos: lines.pop(),
                            line: lines.pop(),
                            source: lines.join(":"),
                        };
                        return method;


                    });
                    i = 0;
                    functionDescriptors.push({});
                    functionDescriptors.forEach(f => {
                        if (i < functionDescriptors.length - 2)
                            f.caller = functionDescriptors[++i];
                        else
                            f.caller = null;

                        f.getMethod = currentThis => currentThis[f.name];
                        f.call = (currentThis, ...args) => currentThis[f.name](...args);
                        f.description = f.href;
                        f.badge = f.line;
                        f.icon = "indent";
                        //f.currentThis = currentThis => { return currentThis };
                    });
                    functionDescriptors.pop();
                    return functionDescriptors;


                };
                static parseStackSafari(stack) {
                    let methodStack = stack.match(/.*@\S+/g);
                    let i = 0;
                    let functionDescriptors = methodStack.map(m => {
                        let literal = m.split("@");
                        let link = literal[1];
                        //link = link?link.substring(1,link.length-1):"";
                        let lines = link ? link.split(":") : [0, 0];

                        let method = {
                            name: literal[0],
                            type: "unknown in Safari",
                            href: link,
                            pos: lines.pop(),
                            line: lines.pop(),
                            source: lines.join(":"),
                        };
                        return method;


                    });

                    i = 0;
                    functionDescriptors.push({});
                    functionDescriptors.forEach(f => {
                        if (i < functionDescriptors.length - 2)
                            f.caller = functionDescriptors[++i];
                        else
                            f.caller = null;

                        f.getMethod = currentThis => currentThis[f.name];
                        f.call = (currentThis, ...args) => currentThis[f.name](...args);
                        f.description = f.href;
                        f.badge = f.line;
                        f.icon = "indent";
                    });
                    functionDescriptors.pop();

                    return functionDescriptors;
                }

            }
        );

        ONCE.global.Any = Thinglish.ANY;

        String.prototype.toCamelCase = Thinglish.snake_case2CamelCase;
        String.prototype.toKebabCase = Thinglish.camelCase2dashCase;
        String.prototype.toDash = Thinglish.camelCase2dashCase;
        String.prototype.toSnakeCase = Thinglish.camelCase2snake_case;
        String.prototype.toUnderscore = Thinglish.camelCase2snake_case;
        String.prototype.toUnderscore = Thinglish.camelCase2snake_case;

        String.prototype.toLabel = Thinglish.camelCase2label;
        String.prototype.toPlaceholder = Thinglish.camelCase2placeholder;
        String.prototype.capitalize = Thinglish.capitalize;

        String.prototype.isAllUpperCase = Thinglish.isAllUpperCase;
        String.prototype.isAllLowerCase = Thinglish.isAllLowerCase;

        ONCE.global.Enum = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class Enum {
                static get implements() {
                    return null;
                }
                constructor() {
                    this.values = new Set();
                }

                init(array) {
                    if (!array)
                        array = [];
                    if (array && !Array.isArray(array))
                        array = [array];
                    this.values = new Set();
                    array.forEach(v => this.values.push(v));
                }

                valueOf() {
                    return this.values;
                }

                static declareEnumConstants(aClass, constantPrefixString, namedEnumerationValueJSON) {
                    let enumeration = new Enum();
                    enumeration.constantPrefixString = constantPrefixString.toLocaleUpperCase();

                    Object.defineProperty(aClass, enumeration.constantPrefixString + "ENUM", {
                        enumerable: true,
                        configurable: false,
                        writable: false,
                        value: enumeration
                    });
                    Object.defineProperty(aClass, enumeration.constantPrefixString + "ENUM_JSON", {
                        enumerable: true,
                        configurable: false,
                        writable: false,
                        value: namedEnumerationValueJSON
                    });
                    enumeration.keys = [];

                    enumeration.values = Object.keys(namedEnumerationValueJSON).map(k => {
                        let key = enumeration.constantPrefixString + k.toUnderscore().toLocaleUpperCase();
                        enumeration.keys.push(key);
                        Object.defineProperty(aClass, key, {
                            enumerable: true,
                            configurable: false,
                            writable: false,
                            value: namedEnumerationValueJSON[k]
                        });
                        return namedEnumerationValueJSON[k];
                    }
                    )
                    enumeration.namedEnumerationValueJSON = {};
                    for (let i in enumeration.keys) {
                        enumeration.namedEnumerationValueJSON[enumeration.keys[i]] = enumeration.values[i];
                    }
                    return enumeration;
                }
            }
        );

        ONCE.global.EnumValue = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class EnumValue {
                static get implements() {
                    return null;
                }

                constructor() {
                    this.value = undefined;
                    Thinglish.defineAlias(this, "value", "choice");
                }

                init(enummmeration) {
                    this._private = {};
                    this._private.enummmeration = enummmeration;
                    return this;
                }

                select(value) {
                    this.value = value;
                    return this.value;
                }

                get key() {
                    return this._private.enummmeration.keys[this._private.enummmeration.values.indexOf(this.value)];
                }

            }
        );

        Enum.declareEnumConstants(Once, "MODE_", {
            nodeServer: "nodeServer",
            navigator: "navigator",
            iFrame: "iFrame",
            native: "native"
        });

        Enum.declareEnumConstants(Once, "USE_", {
            default: "OVERWRITE_WITH_DEFAULT_VALUE",
            null: null,
        });

        Enum.declareEnumConstants(Once, "STATE_", {
            new: "new",
            initialized: "initialized",
            started: "started",
            stopped: "stopped",
            hibernate: "hibernate",
            crashed: "crashed",
            shutdorwn: "shutdorwn"
        });

        Enum.declareEnumConstants(Once, "REPOSITORY_", {
            root: "/EAMD.ucp",
            components: "/Components",
            scenarios: "/Scenarios",
            hosts: ["http://localhost:777"/*, "http://localhost:8888", "https://localhost:777"*/
            ]
        });

        Enum.declareEnumConstants(Once, "STAGE_", {
            dev: "0_DEV",
            test: "1_TEST",
            int: "2_INT",
            prod: "3_PROD"
        });

        Enum.declareEnumConstants(Once, "INSTALLATION_MODE_", {
            transient: "transient",
            npmLocal: "npm-local",
            npmGlobal: "npm-global",
            repositoryLocal: "repository-local",
            repositoryGlobal: "repository-global"
        });
        ONCE.checkInstallationMode();
        logger.log("ONCE.versionNumber: ", ONCE.versionNumber);

        ONCE.global.Url = Namespace.declare("tla.EAM.layer3.OnceServices",
            class Url extends Thing {
                static get implements() {
                    return null;
                }

                init(url) {
                    this._private = { searchParameters: {} };
                    this.protocol = [];
                    this._parseUrl(url);
                    return this;
                }


                get href() { return this._formatUrl() }
                set href(url) { this._parseUrl(url) }

                get url() { return this._formatUrl() }
                set url(url) { this.href = url }

                _parseUrl(url) {
                    url = url || '';
                    let urlParsed = url.match(/^(([^\/]+):(\/\/)?)?([^:\/]+)?(:(\d+))?(\/[^?#]*)?(\?([^#]+))?(#(.*))?$/);
                    this.protocol = (urlParsed[2] ? urlParsed[2].split(':') : []);

                    if (!urlParsed[4]) {
                        if (ONCE.mode === 'nodeServer') {
                            // if (!urlParsed[2]) {
                            //     let serverConfig = ONCE.ENV.ONCE_DEFAULT_URL.match(/^(([^\/]+):(\/\/)?)?([^:\/]+)?(:(\d+))?/);
                            //     this.protocol = (serverConfig[2] ? serverConfig[2].split(':') : []);
                            //     this.hostName = serverConfig[4];
                            //     this.port = serverConfig[6];
                            // }
                        } else {
                            this.protocol.push(document.location.protocol.replace(':', ''));
                            this.hostName = document.location.hostname;
                            this.port = document.location.port;
                        }
                    } else {
                        this.hostName = urlParsed[4];
                        this.port = urlParsed[6];
                    }
                    this.pathName = urlParsed[7];
                    this.search = urlParsed[9];
                    this.hash = urlParsed[11];
                }

                _formatUrl(protocolFilter = [], type = 'normal') {
                    let url = '';
                    let protocol;
                    let hostName = this.hostName;
                    let port = this.port;

                    if (protocolFilter.length > 0) {
                        protocol = this.protocol.filter(p => { return protocolFilter.indexOf(p) >= 0 })
                    } else {
                        protocol = this.protocol
                    }

                    if (protocol && protocol.length > 0) url += protocol.join(':') + (hostName ? '://' : ':');
                    if (hostName) url += hostName;
                    if (port) url += ':' + port;


                    if (type == 'origin') return url;
                    if (this.pathName) url += this.pathName;
                    if (type == 'originPath') return url;
                    if (this.search) url += '?' + this.search;
                    if (this.hash) url += '#' + this.hash;
                    return url;
                }

                get protocol() { return this._private.protocol }
                get hostName() { return this._private.hostName }
                get port() { return this._private.port }
                get pathName() { return this._private.pathName }
                get search() {
                    //let result = [];
                    if (!this._private.searchParameters || Object.keys(this._private.searchParameters) == 0) return '';
                    let result = Object.keys(this._private.searchParameters).sort().map((key) => {
                        let value = (typeof this._private.searchParameters[key] == 'string' ? this._private.searchParameters[key] : JSON.stringify(this._private.searchParameters[key]));
                        return `${key}=${value}`

                        // return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                    }).join('&');
                    return result;
                }
                get hash() { return this._private.hash }
                get host() { return this._private.hostName + (this._private.port ? ':' + this._private.port : '') }
                get origin() { return this._formatUrl(['https', 'http', 'ws', 'wss'], 'origin') }

                get isOwnOrigin() {
                    if (!this._private.hostName) {
                        return true
                    } else if (this.origin === ONCE.ENV.ONCE_DEFAULT_URL) {
                        return true;
                    }
                }

                get originPath() { return this._formatUrl(['https', 'http', 'ws', 'wss'], 'originPath') }

                get defaultOrigin() { return "https://" + ONCE.ENV.ONCE_DOCKER_HOST + ":" + ONCE.httpsPort }
                get localFileOrigin() { return ONCE.mode == Once.MODE_NODE_SERVER ? "file://" + ONCE.repositoryRootPath : ONCE.repositoryRootPath }
                get searchParameters() { return this._private.searchParameters }



                set protocol(value) {
                    value = value || [];
                    if (!Array.isArray(value)) {
                        throw Error("Only arrays are allowed in the Protocol parameter");
                    }
                    if (!(value instanceof ArraySet)) {
                        this._private.protocol = new ArraySet();
                        value.forEach(x => this._private.protocol.push(x))
                    } else {
                        this._private.protocol = value;
                    }
                    if (!this._private.protocol.hasProtocol) {
                        this._private.protocol.hasProtocol = function hasProtocol(p) {
                            if (p instanceof RegExp) {
                                for (let i in this) {
                                    if (!isNaN(i) && this[i].match(p)) return true;
                                }
                                return false;
                            } else {
                                return this.indexOf(p) !== -1;
                            }
                        };
                    }
                    //if (!this._private.protocol.remove) {
                    this._private.protocol.remove = function remove(r) {
                        if (r instanceof RegExp) {
                            for (let i in this) {
                                if (!isNaN(i) && this[i].match(r)) this.splice(i, 1);
                            }
                            //this.protocol = this.filter( x => { return (x.match(r) ? false : true)})
                        } else {
                            const id = this.indexOf(r);
                            if (id >= 0) this.splice(id, 1);
                        }
                    };
                    //}
                }
                set hostName(value) { this._private.hostName = value }
                set port(value) { this._private.port = value }
                set pathName(value) { this._private.pathName = value }
                set search(value) {
                    if (!value) {
                        this._private.searchParameters = {};
                        return;
                    }
                    let parameters = {};
                    value = value.replace(/^\?/, '');
                    value = decodeURIComponent(value);
                    value.split('&').forEach(x => {
                        let param = x.split('=');
                        // let value = decodeURIComponent(typeof param[1] == 'string' && (param[1].startsWith('{') || param[1].startsWith('[') ? JSON.parse(param[1]) : param[1]));
                        // parameters[decodeURIComponent(param[0])] = value;

                        let value = (typeof param[1] == 'string' && (param[1].startsWith('{') || param[1].startsWith('[')) ? JSON.parse(param[1]) : param[1]);
                        parameters[param[0]] = value;
                    })
                    this._private.searchParameters = parameters;
                }
                set hash(value) { this._private.hash = value }
                set searchParameters(value) { this._private.searchParameters = value }

                get fileType() {
                    if (!this.pathName) return null;
                    let fileType = this.pathName.match(/\.([\w\d]{1,5})$/);
                    if (fileType) return fileType[1];
                    return null;
                }

                get fileName() {
                    if (!this.pathName) return null;
                    let fileName = this.pathName.match(/\/([^\/]+\.[\w\d]{1,5})$/);
                    if (fileName) return fileName[1];
                    return null;
                }

                get normalizeHref() {
                    // let href = Thinglish.lookupInObject(this,"loader.normalizeHref");
                    // if (!href) href = this._formatUrl(['https', 'http', 'ws', 'wss']);
                    // return href;
                    return this._formatUrl(['https', 'http', 'ws', 'wss']);
                }

                get isIOR() {
                    return (this.protocol && this.protocol[0] == 'ior' ? true : false);
                }

                clone() {
                    let clone = this.type.class.getInstance();
                    Object.keys(this._private).forEach(key => {
                        clone._private[key] = this._private[key];
                    })
                    clone.protocol = [...this.protocol];
                    clone.searchParameters = { ...clone.searchParameters };

                    return clone;
                }

            }
        );

        ONCE.global.IOR = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class IOR extends Url {
                static get implements() {
                    return null;
                }
                // does not return true but makes sure that if it is an IOR you also have an IOR object.
                static isIOR(stringOrIOR, forceString = false) {
                    if (typeof stringOrIOR === "string" && (stringOrIOR.toLowerCase().startsWith("ior:") || forceString)) {
                        return IOR.getInstance().init(stringOrIOR);
                    } else if (stringOrIOR instanceof IOR) {
                        return stringOrIOR;
                    }

                    return false;
                }

                static async load(iorString, config) {
                    return this.getInstance().init(iorString).load(config);
                }

                static createFromObject(object) {
                    const ior = IOR.getInstance();
                    if (!object.type) {
                        Thinglish.initType(object);
                    }

                    object.type.name = "IOR:" + object.type.name;
                    ior.type = object.type;

                    return ior;
                }

                static getIORType(urlObject) {
                    const href = (urlObject.href ? urlObject.href : urlObject)

                    if (href.startsWith('ior')) {
                        if (href.includes(':ude')) {
                            return 'ude';
                        }
                        return 'default';
                    }
                    return false;
                }

                constructor() {
                    super();
                    this.referencedObject = null;
                    this.objectID = "";
                    //this._private = this._private || {};
                }

                init(value, queryParameters) {
                    if (!value) throw Error("IOR cannot be initialized on undefined.");

                    if (value instanceof IOR) {
                        return value;
                    }
                    if (value instanceof Url) {
                        value = value.href;
                    }
                    if (value) this.href = value;
                    if (queryParameters) {
                        this.queryParameters = queryParameters;
                    }
                    return this;
                }

                get connection() {
                    return this._private.connection;
                }
                set connection(value) {
                    this._private.connection = value;
                }

                get href() {
                    return super.href;
                }

                // Extra setter to add ior Protocol 
                set href(value) {
                    super.href = value;
                    if (!this.protocol.hasProtocol('ior')) {
                        this.protocol.unshift('ior');
                    }
                }

                // @ToDo Benedikt Refactor to search
                set queryParameters(parameter) {
                    this.searchParameters = parameter;
                }

                // @ToDo Benedikt Refactor to search
                get queryParameters() {
                    return this.search;
                }

                get isLoaded() {
                    // if (!this.referencedObject && this.class) {
                    //     this.referencedObject = this.class;
                    // }
                    return this.referencedObject != null;
                }

                get class() {
                    logger.warn("Please refactor ior.class to ior.referencedObject");
                    return this.referencedObject;
                }

                set class(newValue) {
                    logger.warn("Please refactor 'ior.class = ...' to ior.referencedObject = ");
                    this.referencedObject = newValue;
                }

                //@ToDo Remove if possible as this is also the URL
                get URL() {
                    return this;
                }
                set URL(newURL) {
                    return this.url = newURL.href;
                }

                get id() {
                    if (this.searchParameters?.id) return this.searchParameters.id

                    if (this.protocol.includes('ude')) {
                        const id = this.pathName.split('/').pop();
                        if (id) return id;
                    }
                    throw new Error('Oh shit. Please fix me');
                }

                set id(newId) {
                    if (this.protocol.includes('ude')) {
                        let path = this.pathName.split('/')
                        path.splice(-1)
                        this.pathName = path.join('/') + '/' + newId
                    } else {
                        super.id = newId;
                    }
                }

                get basePath() {
                    let a = this.pathName.split('/');
                    a.splice(-1);
                    return a.join('/');
                }

                get originBasePath() {
                    let a = this.pathName.split('/');
                    a.splice(-1);
                    return this.origin + a.join('/');
                }

                get iorUniquePath() {
                    let result = 'ior:';

                    if (!this.protocol.includes('ude')) {
                        result += this.origin || ONCE.ENV.ONCE_DEFAULT_URL;
                    }
                    result += this.pathName;
                    return result;
                }

                get loader() {
                    if (!this._private) {
                        return null;
                    }
                    if (!this._private.loader) {
                        this.findLoader();
                    }
                    return this._private.loader;
                }

                set loader(newLoader) {
                    this._private.loader = newLoader;
                }

                // @ToDo Benedikt Refactor to href
                get urlString() {
                    return this.href;
                }

                toString() {
                    if (!this.href) {
                        return "IOR:uninitialized";
                    }
                    // if (!this.href.toLowerCase().startsWith("ior:")) {
                    //     return 'ior:' + this.href;
                    // }
                    return this.href;
                }

                toJSON() {
                    return {
                        objectID: this.objectID,
                        url: this.toString(),
                        queryParameters: this.queryParameters
                    };
                }

                get sessionManager() {
                    if (this._private.sessionManager) return this._private.sessionManager;
                    if (this._private.securityContext) {
                        return this._private.securityContext.sessionManager;
                    }
                    let sessionManager;
                    try {
                        sessionManager = this.loader.client(this)?.sessionManager;
                    } catch (err) {
                        //Do nothing if it is not found
                    }
                    return sessionManager;
                }

                set sessionManager(sessionManager) {
                    this._private.sessionManager = sessionManager;
                    delete this._private.securityContext;
                }

                getSecurityContext() {
                    if (!this._private.securityContext) {

                        if (!this.sessionManager) throw new Error("Missing the Session Manager for IOR:" + this.href);

                        this._private.securityContext = SecurityContext.factory(this, this.sessionManager);
                        this._private.securityContext.then(
                            sc => {
                                this._private.securityContext = sc;
                                this._private.sessionManager.add(sc);
                            }
                        ).catch(err => {
                            //Will be handled by upper try catch block
                        });
                    }

                    return this._private.securityContext;
                }

                setSecurityContext(securityContext) {
                    this._private.securityContext = securityContext;
                }


                add(object) {
                    if (Thinglish.isInstanceOf(object, SessionManager)) {
                        this._private.sessionManager = object;
                    } else if (Thinglish.isInstanceOf(object, securityContext)) {
                        this._private.securityContext = object;
                    } else {
                        super.add(object);
                    }
                }

                async callAction(action, data) {
                    const dataParameter = 'functionArgs';

                    if (!action && this.hash) {
                        action = this.hash;
                    }

                    if (this.protocol.hasProtocol('ws') || this.protocol.hasProtocol('wss')) {
                        let client;
                        if (this.connection) {
                            client = this.connection;
                        } else {
                            let wsIOR = this.clone();
                            wsIOR.pathName = '/once/ws/ior';
                            wsIOR.protocol.remove(/^https?$/);
                            client = await Client.findClient(wsIOR);
                            if (!client) throw Error("No Client found for IOR", wsIOR.href);
                            this.connection = client;
                        }
                        let actionIOR = this.clone();
                        actionIOR.hash = action;
                        if (data) {
                            actionIOR.searchParameters[dataParameter] = Thinglish.serialize2IORDataStructure(data);
                        }
                        let result = await client.send(actionIOR);
                        return result;

                    } else if (this.protocol.hasProtocol('local') || ONCE.mode == Once.MODE_NODE_SERVER) {
                        // @TODO: Need to check that it is loaded
                        if (!this.isLoaded) {
                            await this.load();
                        }

                        if (!this.isLoaded) {
                            logger.error("Load dose not work. Can not call the Action");
                            return null;
                        }


                        action = action.replace(/global:\./, `global:${this.referencedObject.type.class.name}.`);
                        let actionObject = this.referencedObject.actionIndex._findActionByString(action);
                        if (!actionObject) {
                            throw new Error(`Action Index not found! ${this.href} ${action} `)
                            //logger.error("Action Index not found! ", this, action);
                            //return undefined;
                        }

                        if (actionObject.visibility !== Action.VISIBILITY.GLOBAL) {
                            logger.error("Action has the wrong visibility! expect 'global', but has " + actionObject.visibility, actionObject);
                            return undefined;
                        }

                        if (!data && this.searchParameters.functionArgs) {
                            data = this.searchParameters.functionArgs;
                        }
                        let callData = [...data];
                        // if (ONCE.mode === Once.MODE_NODE_SERVER && await this.getSecurityContext()) {
                        //     callData.unshift(this.getSecurityContext());
                        // }

                        //callData.push(this);

                        return await actionObject.do(...callData);
                    } else if (this.protocol.hasProtocol('https') && this.protocol.hasProtocol('ude')) {
                        let client = this.loader.client(this);

                        let callData = {
                            actionCall: {
                                functionArgs: data,
                                actionId: action
                            }
                        }

                        client.update(this, Thinglish.serialize2IORDataStructure(callData));
                    } else {
                        throw new Error("Can not do anything. Only WSS is implemented right now");
                    }
                }

                findLoader() {
                    if (!ONCE.global.Loader) {
                        logger.log(this.href);
                        this.loader = (ONCE.global.EAMDucpLoader.canLoad(this) > 0) ? ONCE.global.EAMDucpLoader.getInstance(this).init() : Namespaces.loader;
                        return this.loader;
                    }
                    const loaders = ONCE.global.Loader.discover().map(l => {
                        if (!(l.canLoad instanceof Function)) {
                            logger.warn(l.name, 'does not have canLoad method');
                            return [-1, l];
                        }
                        return [l.canLoad(this), l];
                    }
                    ).sort((a, b) => b[0] - a[0]);
                    let [[matchPriority, mostSuitable]] = loaders;
                    if (!mostSuitable) {
                        // not found
                        this.loader = Namespaces.loader;
                        return null; //this.loader;
                    }
                    //logger.info(`trying to find loader for ${this.href}`);
                    // loaders.forEach(l => {
                    //     const loadProbability = l.canLoad(this);
                    //     logger.debug(`${l.name} returns ${loadProbability}`);
                    //     if (loadProbability > mostSuitable.canLoad(this)) {
                    //         mostSuitable = l;
                    //         logger.debug(`found better loader ${l.name}`);
                    //     }
                    // }
                    // );
                    logger.debug(`==== the most suitable loader for ${this.href} is ${mostSuitable.name} initialized with ${this.href} === `);

                    if (mostSuitable.instanceStore) {
                        this.loader = mostSuitable.factory(this); //@ToDo remove url parameter later on
                        return this.loader;
                    }

                    this.loader = mostSuitable.getInstance();  //new mostSuitable();
                    if (this.loader.init instanceof Function) {
                        this.loader.init(this.href);
                    }

                    return this.loader;
                }

                load(config) {
                    // return Promise.resolve(this.loader.load(this));
                    let loadingPromiseOrObject = this.loader.load(this, config);
                    if (Thinglish.isPromise(loadingPromiseOrObject)) {
                        loadingPromiseOrObject.then(object => {
                            if (object) {
                                this.referencedObject = object;
                            }
                        }).catch(error => { });
                    } else {
                        this.referencedObject = loadingPromiseOrObject;
                    }
                    return loadingPromiseOrObject;
                }

                head() {
                    return this.loader.head(this);
                }

                call(ior, parameter) {
                    return ONCE.call(ior, parameter);
                }

                execute(method, ...rest) {
                    if (!(this.loader[method] instanceof Function)) {
                        logger.warn(`method ${method} is not defined in ${this.loader.name}`);
                        return false;
                    }

                    return this.loader[method].call(this.loader, this, ...rest);
                }
            }
        );



        ONCE.global.Interface = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class Interface {
                static get implements() {
                    return null;
                }
                static discover() {
                    const result = new Set();
                    const implementations = this.type.implementations;
                    if (implementations) {
                        implementations.forEach(i => {
                            result.add(i);
                            /*
                                if (i.discover instanceof Function) {
                                    let more = i.discover();
                                    if (more) {
                                        if (Array.isArray(more)) {
                                            more.forEach(i => {
                                                if (Interface.isInterface(i))
                                                    result.add(i);
                                                if (i.discover instanceof Function) {
                                                    let more = i.discover();
                                                }
            
                                            });
                                        } else {
                                            if (Interface.isInterface(more))
                                                result.add(more);
                                        }
                                    }
            
                                }
                                */
                        }
                        );
                    }
                    return Array.from(result);
                }

                static declareSubComponent(...args) {
                    UcpComponent.declareSubComponent.call(this, ...args);
                }

                static isInterface(object) {
                    if (!object) {
                        return false;
                    }

                    let current = object;
                    while (current) {
                        if (current === Interface) {
                            return true;
                        }
                        current = (current.type) ? current.type.extends : null;
                    }
                    return false;

                    // much to slow ... much to much overhead
                    // return Thinglish.isTypeOf(object, Interface);
                }
                static isRealInterface(object) {
                    return object && object.type && object.type.extends && object.type.extends === Interface;
                }
                constructor() {//logger.error("Interface cannot be instanciated");
                }
                init(object) {
                    if (!object) {
                        logger.error("cannot instanciate an Interface");
                        return null;
                    }
                    if (!object.type)
                        Thinglish.initType(object);

                    Thinglish.implement(object, Interface);
                    this.implementation = object;
                    return this;
                }

                static initInterface() {
                    // Can be used to init something on the Component if the Interface is implemented
                    return this;
                }

                get eamLayer() {
                    return 3;
                }

                /*
                    interfaceMethod() {
                        return "Inferface Hello World"
                    }
                    */

                static get defaultImplementationClass() {
                    if (!this._private)
                        this._private = {};

                    if (!this._private.defaultImplementationClass) {
                        const defaultClass = ONCE.global[`Default${this.name}`];
                        if (Thinglish.isClass(defaultClass)) {
                            this._private.defaultImplementationClass = defaultClass;
                        }
                    }
                    return this._private.defaultImplementationClass;
                }
                static set defaultImplementationClass(newValue) {
                    // so abstract class Interface will have a default implementation?
                    if (!this._private)
                        this._private = {};

                    this._private.defaultImplementationClass = newValue;
                }

                static get defaultInstance() {
                    if (ONCE.global.Interface && this === Interface) {
                        return null;
                    }
                    return new this.defaultImplementationClass();
                }

            }
        );

        if (typeof btoa === 'undefined') {
            ONCE.global.btoa = function (str) {
                return new Buffer.from(str, 'binary').toString('base64');
            }
                ;
        }
        ONCE.global.IdProvider = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class IdProvider extends Interface {
                // static discover() {
                //     return [UutID];
                // }
                static get defaultImplementationClass() {
                    return ONCE.global["UutID"];
                }
                static createId(instance) {
                    return IdProvider.defaultImplementationClass.createId(instance);
                }
                init() {
                    return this;
                }

                nonStaticMethodOfIdProvider() {
                    logger.log("just for testing: has been successfully implemented");
                }
            }
        );

        // Universal unique typed ID 
        ONCE.global.UutID = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class UutID {
                static get implements() {
                    return [IdProvider];
                }

                static createId(instance) {
                    let type = UutID;
                    if (instance)
                        type = instance.constructor;

                    let aPackage = type.package + "." + type.name;
                    if (!aPackage)
                        aPackage = type.name;

                    return encodeURIComponent(btoa(aPackage) + "." + (new Date()).getTime().toString(36) + Math.random().toString(36));
                }
                createId(instance) {
                    return this.constructor.createId(instance);
                }

            });

        // Universal unique typed ID 
        ONCE.global.UUID = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class UUID {
                static get implements() {
                    return [IdProvider];
                }

                static createId(instance) {
                    return this.uuidv4();
                }
                createId(instance) {
                    return this.constructor.createId(instance);
                }

                static uuidv4() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }

                static isUuidv4(value) {
                    return (value.toLowerCase().match(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[\da-f]{4}-[\da-f]{8}/) ? true : false);
                }

            });




        ONCE.global.ArraySet = Namespace.declare("com.ceruleanCircle.EAM.2_systems.BasicDataTypes",
            class ArraySet extends Array {
                static get implements() {
                    return null;
                }
                push(element) {
                    if (this.indexOf(element) === -1) {
                        return super.push(element);
                    }
                    return this.length;
                }
                unshift(element) {
                    if (this.every(e => {
                        return e != element
                    }
                    ))
                        return super.unshift(element);
                    return this.length;
                }
                static from(array) {
                    var newSet = new ArraySet();
                    if (Array.isArray(array))
                        array.forEach(e => {
                            newSet.push(e)
                        }
                        );
                    else
                        newSet.push(array);
                    return newSet;
                }

                remove(element) {
                    let i = this.indexOf(element);
                    if (i > -1)
                        return this.splice(i, 1);
                    else
                        return false;
                }

                concat(array) {
                    if (!Array.isArray(array))
                        return this;
                    array.forEach(e => this.push(e));
                    return this;
                }

                add(element) {
                    return this.push(element);
                }
            });

        ONCE.global.IndexedObjects = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class IndexedObjects {
                static get implements() { return null }
                constructor() {
                    this.index = {};
                    this.indexAttribute = "id";
                }

                init(indexAttribute) {
                    this.indexAttribute = indexAttribute;
                    return this;
                }

                getValues() {
                    return Object.values(this.index);

                    // const values = [];
                    // for (const i in this.index) {
                    //     values.push(this.index[i]);
                    // }
                    // return values;
                }

                getKeys() {
                    return Object.keys(this.index);
                    // const keys = [];
                    // for (var i in this.index) {
                    //     keys.push(i);
                    // }
                    // return keys;
                }

                addArray(array) {
                    array.forEach(e => this.add(e));
                }

                push(indexedObject) {
                    this.add(indexedObject);
                    return this.length;
                }

                get length() {
                    return this.getKeys().length;
                }

                add(indexedObject) {
                    var added = (this.lookupObject(indexedObject) == null);
                    this.index[this.lookupObjectID(indexedObject)] = indexedObject;
                    return added;
                }

                addAlias(alias, indexedObject) {
                    this.index[alias] = indexedObject;
                    if (indexedObject.indexedObjectAliases == null) {
                        indexedObject.indexedObjectAliases = [];
                    }
                    indexedObject.indexedObjectAliases.push(alias);
                }

                remove(indexedObject) {
                    this.index[this.lookupObjectID(indexedObject)] = null;
                }

                lookup(id) {
                    //finds the object with id
                    return this.index[id];
                }
                lookupObjectID(indexedObject) {
                    //finds the value of id in indexedObject
                    return IndexedObjects.lookupAttribute(indexedObject, this.indexAttribute);
                }
                lookupObject(indexedObject) {
                    //return this.constructor.lookup(this.index,id);
                    var id = this.lookupObjectID(indexedObject);
                    var object = this.lookup(id);
                    if (id === object)
                        return null;

                    return object;
                }

                static lookupAttribute(object, id) {
                    if (!object) return null;
                    if (!id)
                        return object;
                    var packages = id.split(".");
                    var currentNamespace = object;
                    var name = null;
                    for (var i in packages) {
                        name = packages[i];
                        var nextNamespace = currentNamespace[name];
                        if (!nextNamespace) {
                            //                logger.warn(currentNamespace.package, name + " not found");
                            return object;
                        }
                        currentNamespace = nextNamespace;
                    }
                    return currentNamespace;

                }


                filter(attribute, equalsTo) {
                    var collection = [];
                    if (attribute == null) {
                        attribute = this.indexAttribute;
                    }


                    for (var i in this.index) {
                        var indexedObject = this.index[i];

                        var value = indexedObject[attribute];
                        if (value != null) {
                            if (equalsTo === "*" || value === equalsTo || equalsTo == null) {
                                var entry = value;
                                collection.push(entry);
                            }
                        }
                    }
                    return collection;
                }
            }
        );

        ONCE.global.IndexedObjectsMap = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class IndexedObjectsMap {
                static get implements() { return null }
                constructor() {
                    this.allowCollections = false;
                    this.mapIndexAttribute = "mapEntry.mapId";
                    this.keys = new IndexedObjects().init(this.mapIndexAttribute);
                }

                init(mapIndexAttribute) {
                    this.mapIndexAttribute = mapIndexAttribute;
                    return this;
                }

                getMapEntry(key) {
                    var indexedObject = this.keys.lookup(key);
                    if (indexedObject == null)
                        return null;
                    return indexedObject.mapEntry;

                }

                getKey(key) {
                    var id = IndexedObjects.lookupAttribute(key, this.mapIndexAttribute);
                    var indexedObject = this.keys.lookup(id);
                    if (indexedObject == null)
                        return null;
                    return indexedObject.mapEntry.key;

                }

                getAllKeys() {
                    var keys = [];
                    var allEntries = this.keys.filter("mapEntry");
                    return allEntries
                }

                getValue(key) {
                    var id = IndexedObjects.lookupAttribute(key, this.mapIndexAttribute);
                    var indexedObject = this.keys.lookup(id);
                    if (indexedObject == null)
                        return null;
                    return indexedObject.mapEntry.value;

                }

                set(key, value) {
                    var id = IndexedObjects.lookupAttribute(key, this.mapIndexAttribute);
                    var indexedObject = this.keys.lookup(id);
                    if (indexedObject == null) {
                        var mapEnty = {
                            mapEntry: {
                                mapId: id,
                                key: key,
                                value: value,
                                mapIndexAttribute: this.mapIndexAttribute,
                                name: id,
                                type: { name: "com.ceruleanCircle.EAM.2_systems.BasicDataTypes.IndexedObjectsMap.Entry" }
                            }
                        }

                        this.keys.add(mapEnty)
                    } else {
                        indexedObject.value = value;
                    }
                }

                add(key, value) {

                    //		logger.log("model2View: "+key[this.keys.indexAttribute]);
                    if (!value) value = key;

                    if (!this.allowCollections)
                        return;
                    var id = IndexedObjects.lookupAttribute(key, this.mapIndexAttribute);
                    var indexedObject = this.keys.lookup(id);
                    //var indexedObject = this.keys.lookup(key);
                    if (indexedObject == null) {
                        //this.set(key, [value]);
                        this.set(key, ArraySet.from([value]));
                    } else {
                        if (indexedObject.mapEntry.value == null)
                            indexedObject.mapEntry.value = new Set();

                        if (indexedObject.mapEntry.value.push == null) {
                            //not a collection? so make it a collection
                            indexedObject.mapEntry.value = Set.from([indexedObject.value]);
                        }
                        indexedObject.mapEntry.value.push(value);
                    }
                }

                remove(key, value) {
                    var id = IndexedObjects.lookupAttribute(key, this.mapIndexAttribute);
                    var indexedObject = this.keys.lookup(id);
                    //var indexedObject = this.keys.lookup(key);
                    if (indexedObject == null) {
                        return false;
                    } else {
                        if (indexedObject.mapEntry.value == null)
                            indexedObject.mapEntry.value = new ArraySet();

                        if (indexedObject.mapEntry.value) {
                            //not a collection? so make it a collection
                            if (!value)
                                return false;

                            return indexedObject.mapEntry.value.remove(value);
                        }
                    }
                    return false;

                }

                removeAll(key) {
                    var id = IndexedObjects.lookupAttribute(key, this.mapIndexAttribute);
                    var indexedObject = this.keys.lookup(id);
                    //var indexedObject = this.keys.lookup(key);
                    if (indexedObject == null) {
                        return false;
                    } else {

                        indexedObject.mapEntry.value = new ArraySet();
                        return true;
                    }
                    return false;

                }




                isCollection(key) {
                    var indexedObject = this.keys.lookup(key);
                    if (indexedObject == null)
                        return false;

                    if (indexedObject.value == null)
                        return false;

                    if (indexedObject.value.push == null)
                        return false;
                    else
                        return true;

                }

            }
        );

        ONCE.global.Store = Namespace.declare("tla.EAM.layer1.OnceServices",
            class Store extends Interface {
                static get implements() {
                    return null;
                }


                register(key, value) {
                    this.registry = this.registry || {};
                    this.registry[key] = value;
                    if (this.eventSupport) {
                        this.eventSupport.fire(Store.EVENT.ON_REGISTER, this, key, value);
                    }

                }

                remove(key) {
                    const value = this.registry[key];
                    delete this.registry[key];
                    if (this.eventSupport) {
                        this.eventSupport.fire(Store.EVENT.ON_REMOVE, this, key, value);
                    }

                }

                lookup(key) {
                    this.registry = this.registry || {};
                    return this.registry[key];
                }

                discover() {
                    this.registry = this.registry || {};
                    return Object.keys(this.registry).map(k => { return { key: k, value: this.registry[k] } });
                }

                clear() {
                    this.registry = {};
                    this.eventSupport.fire(Store.EVENT.ON_CLEAR, this);
                }

                get eventSupport() {
                    if (typeof EventSupport !== 'undefined') {
                        Thinglish._inheritFeatures(EventSupport.prototype, this, { overwrite: true });
                        return this.eventSupport;
                    }
                }

                static get EVENT() {
                    return {
                        ON_REGISTER: 'onRegister',
                        ON_REMOVE: 'onRemove',
                        ON_CLEAR: 'onClear',
                    }
                }

            });

        ONCE.global.InstanceStore = Namespace.declare("tla.EAM.layer1.OnceServices",
            class InstanceStore {
                static get implements() {
                    return [Store];
                }

                init(classType) {
                    this.registry = {};
                    this.classType = classType;
                    return this;
                }


                discover(functionName, parameters) {
                    if (functionName) {
                        return Object.keys(this.registry).map(k => {
                            let v = this.registry[k];
                            if (v[functionName] && typeof v[functionName] == "function") {
                                let result = v[functionName](...parameters);
                                return { result, value: v };
                            }
                        }).filter(x => x.value != undefined);
                    } else {
                        return Object.keys(this.registry).map(k => { return { key: k, value: this.registry[k] } });
                    }
                }


            });

        ONCE.global.RelatedObjectStore = Namespace.declare("tla.EAM.layer1.OnceServices",
            class RelatedObjectStore {
                static get implements() {
                    return [Store];
                }
                constructor() {
                    //Thinglish.initType(this, "tla.EAM.layer1.OnceServices." + this.constructor.name);
                    //            super();
                    if (ONCE.global.IndexedObjectsMap) {
                        this.registry = new ONCE.global.IndexedObjectsMap();
                        this.registry.init("type.name");
                        this.registry.allowCollections = true;
                    }
                }

                init() {
                    return this;
                }

                register(aType, anImplementation) {

                    if (anImplementation === undefined) {
                        if (!aType?.type?.class) throw new Error("Can not register this");
                        anImplementation = aType;
                        aType = aType.type.class
                    }

                    //if (anInterface.constructor.name === "String");
                    //anInterface = Namespaces.lookup(anInterface);
                    if (!this.registry) {
                        return;
                    }
                    let nextType = aType;
                    while (nextType) {
                        this.registry.add(nextType, anImplementation);
                        if (!nextType.type) {
                            return;
                        }
                        if (nextType.type.implements) {
                            nextType.type.implements.forEach(i => this.register(i, anImplementation));
                        }
                        nextType = nextType.type.extends;
                    }
                    if (this.eventSupport) {
                        this.eventSupport.fire(Store.EVENT.ON_REGISTER, this, aType);
                    }
                }

                remove(aType, anImplementation) {
                    //if (anInterface.constructor.name === "String");
                    //anInterface = Namespaces.lookup(anInterface);

                    if (anImplementation === undefined) {
                        anImplementation = aType;
                        aType = undefined;
                    }
                    if (!this.registry) {
                        return false;
                    }
                    if (!aType) {
                        let result = [];
                        for (let type of Thinglish.getAllTypes(anImplementation)) {
                            result.push((anImplementation) ? this.registry.remove(type, anImplementation) : this.registry.removeAll(type));
                        }
                        return result;
                    }
                    if (this.eventSupport) {
                        this.eventSupport.fire(Store.EVENT.ON_REMOVE, this, aType);
                    }
                    return (anImplementation) ? this.registry.remove(aType, anImplementation) : this.registry.removeAll(aType);
                }

                lookup(anInterface) {
                    return anInterface ? this.registry.getValue(anInterface) : this.registry.getAllKeys();
                }

                discover() {
                    return this.registry.getAllKeys();
                }

            });


        ONCE.global.WeakMapPromiseStore = Namespace.declare(
            class WeakMapPromiseStore {
                static get implements() {
                    return [Store];
                }

                init() {
                    this.registry = new WeakMap();
                    return this;
                }

                register(key, value) {

                    let objectRef;
                    const isPromise = Thinglish.isPromise(value);
                    if (isPromise) {
                        objectRef = { promise: value };
                    } else {
                        objectRef = { ref: value }
                    }

                    this.registry.set(key, objectRef);

                    if (isPromise) {
                        value.then(x => {
                            // Update the existing Entity
                            objectRef.ref = x;
                            delete objectRef.promise;
                            if (this.eventSupport) {
                                this.eventSupport.fire(Store.EVENT.ON_REGISTER, this, key, x);
                            }
                        }).catch(e => {
                            // Delete the existing Entity
                            this.remove(key);
                        })
                    } else {
                        if (this.eventSupport) {
                            this.eventSupport.fire(Store.EVENT.ON_REGISTER, this, key, value);
                        }
                    }


                }

                lookup(key) {
                    let objectRef;

                    objectRef = this.registry.get(key);

                    if (objectRef === undefined) return undefined;

                    if (typeof objectRef.promise !== 'undefined') {
                        return objectRef.promise;
                    }

                    return objectRef.ref;
                }

                remove(key) {
                    const value = this.lookup(key);
                    this.registry.delete(key);
                    if (this.eventSupport) {
                        this.eventSupport.fire(Store.EVENT.ON_REMOVE, this, key, value);
                    }

                }

                clear() {
                    this.registry = new WeakMap();
                    this.eventSupport.fire(Store.EVENT.ON_CLEAR, this);
                }

            });


        ONCE.global.WeakRefPromiseStore = Namespace.declare(
            class WeakRefPromiseStore {
                static get implements() {
                    return [Store];
                }

                init() {
                    this.registry = {};
                    this.mapRegistry = new Map();
                    return this;
                }

                get weakRefAvailable() {
                    return typeof WeakRef !== 'undefined';
                }

                clear() {
                    this.registry = new Map();
                    this.eventSupport.fire(Store.EVENT.ON_CLEAR, this);
                }

                register(key, value) {

                    let objectRef;
                    const isPromise = Thinglish.isPromise(value);
                    if (isPromise) {
                        objectRef = { promise: value };
                    } else {
                        objectRef = { ref: (this.weakRefAvailable ? new WeakRef(value) : value) }
                    }

                    if (typeof key === 'object') {
                        this.mapRegistry.set(key, objectRef);
                    } else {
                        this.registry[key] = objectRef;
                    }

                    if (isPromise) {
                        value.then(x => {
                            if (x === undefined) {
                                this.remove(key);
                            } else {
                                objectRef.ref = (this.weakRefAvailable ? new WeakRef(x) : x);
                                delete objectRef.promise;
                            }
                        })
                    }

                }

                lookup(key) {
                    if (key !== undefined) {
                        let objectRef;
                        if (typeof key === 'object') {
                            objectRef = this.mapRegistry.get(key);

                        } else {
                            objectRef = this.registry[key];
                        }

                        if (objectRef === undefined) return undefined;

                        if (typeof objectRef.promise !== 'undefined') {
                            return objectRef.promise;
                        }
                        let object = (this.weakRefAvailable ? objectRef.ref.deref() : objectRef.ref);
                        if (Thinglish.isInstanceOf(object, UcpComponent)) {
                            if (object.componentState === UcpComponent.COMPONENT_STATES.DESTROYED) {
                                this.remove(key, { silent: true });
                                return undefined;
                            }
                        }
                        return object;
                    } else {
                        let result = [];
                        for (const objectRef of Object.values(this.registry)) {
                            if (objectRef === undefined) continue;
                            if (typeof objectRef.promise !== 'undefined') {
                                result.push(objectRef.promise);
                            } else {
                                const object = (this.weakRefAvailable ? objectRef.ref.deref() : objectRef.ref);
                                if (object) {
                                    if (Thinglish.isInstanceOf(object, UcpComponent)) {
                                        // @ToDo need cleanup
                                        continue;
                                    }
                                    result.push(object);
                                }
                            }
                        }
                        return result;
                    }
                }

                remove(key, config) {

                    const value = !(config && config.silent === true) ? this.lookup(key) : '';

                    if (typeof key === 'object') {
                        this.mapRegistry.remove(key);
                    } else {
                        delete this.registry[key];
                    }

                    if (this.eventSupport && !(config && config.silent === true)) {
                        this.eventSupport.fire(Store.EVENT.ON_REMOVE, this, key, value);
                    }

                }

            });

        ONCE.global.WeakStore = Namespace.declare("tla.EAM.layer1.OnceServices",
            class WeakStore {
                static get implements() {
                    return [Store];
                }
                constructor() {
                    //Thinglish.initType(this, "tla.EAM.layer1.OnceServices." + this.constructor.name);
                    //            super();
                    this.registry = {};
                }

                init(scope, aClassForScopeStatic) {
                    switch (scope) {
                        case "static":
                            if (!aClassForScopeStatic)
                                aClassForScopeStatic = this.constructor;

                            aClassForScopeStatic._private = this._private || {};
                            aClassForScopeStatic._private.store = this._private.store || {};
                            this.registry = aClassForScopeStatic._private.store;
                            break;

                        default:
                            this.registry = {};
                            break;
                    }
                    return this;
                }

                static clearObjectStore() {
                    this._private.store = {};
                }

                static createNewPath(server) {
                    server = server || ONCE.ENV.ONCE_LOCAL_SERVER;
                    return 'ior:ude:rest:' + server + '/udo/' + UUID.uuidv4();
                }

                static async storeObject(url, ucpComponent, promise, status = false) {
                    //@Todo Change only to the unique id insted of the URL!
                    this._private = this._private || {};
                    this._private.store = this._private.store || {};

                    let objectRef = this._private.store[url] || {};

                    objectRef.ref = (typeof WeakRef !== 'undefined' ? new WeakRef(ucpComponent) : ucpComponent);
                    objectRef.promise = promise;
                    objectRef.status = status;

                    this._private.store[url] = objectRef;

                }

                static async loockupObject(url) {
                    //@Todo Change only to the unique id insted of the URL!
                    this._private = this._private || {};
                    this._private.store = this._private.store || {};

                    const objectRef = this._private.store[url];
                    if (objectRef !== undefined) {
                        if (objectRef.active === false) await objectRef.promise;
                        return (typeof WeakRef !== 'undefined' ? objectRef.ref.deref() : objectRef.ref);
                    }
                    return undefined;
                }

                static deleteStoredObject(url) {
                    delete this._private.store[url];
                }

            });

        ONCE.global.IORStore = Namespace.declare("tla.EAM.layer1.OnceServices",
            class IORStore extends Thing {
                static get implements() {
                    return [Store];
                }

                constructor() {
                    super();
                    this.registry = {};
                }

                init() {
                    return this;
                }

                register(ior, value) {
                    // ior = IOR.isIOR(ior);
                    // if (!ior) return false;
                    if (!value) value = ior.referencedObject;
                    this.registry[ior.iorUniquePath] = value;

                    if (ior.pathName.endsWith(".component.xml"))
                        this.registry["component:" + ior.pathName] = value;
                }

                lookup(ior) {
                    let theIOR = IOR.isIOR(ior);
                    if (theIOR === false)
                        return this.registry[ior];
                    else {
                        let result = this.registry[theIOR.iorUniquePath];
                        if (!result && ior.pathName.endsWith(".component.xml"))
                            result = this.registry["component:" + ior.pathName];
                        return result;
                    }
                }

            });




        ONCE.global.Loader = Namespace.bootstrapLoaderInterface("tla.EAM.layer3.OnceServices", Loader);
        //ONCE.global.Loader = Namespace.declare("tla.EAM.layer1.OnceServices", Loader);

        ONCE.global.OnceStoreLoader = Namespace.declare("tla.EAM.layer3.OnceServices",
            class OnceStoreLoader {
                static get implements() {
                    return [Loader];
                }
                static canLoad(urlObject) {
                    if (!(urlObject instanceof IOR)) {
                        return 0;
                    }
                    if (urlObject.protocol.hasProtocol('ior') && urlObject.protocol.hasProtocol('local')) {
                        return 0.94;
                    }
                    if (urlObject.url.match(/id=/)) {
                        return 0.91;
                    }
                    return 0.001;
                }
                get basePath() {
                    throw new Error('Do not use this getter. Use the basePath of the IOR');
                }
            });



        ONCE.global.Thing = Namespace.declare("tla.EAM.layer1.Thinglish", Thing);

        ONCE.global.TypeDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper", TypeDescriptor);

        ONCE.global.FeatureDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
            class FeatureDescriptor extends Thing {
                static get implements() {
                    return null
                }
                constructor() {
                    super();
                    this.name = undefined;
                    this.feature = undefined;
                    this.typeof = undefined;

                    this.displayName = undefined;
                    this.description = undefined;

                    this.object = undefined;
                    this.method2Call = undefined;
                    //Thinglish.initType(this);

                }
                init(object, featureName) {

                    this.name = featureName;
                    this.feature = undefined;
                    this.object = object;

                    this.method2Call = undefined;

                    return this;
                }

                get typeName() {
                    if (!this.type && !this.type.name)
                        return this.constructor.name;
                    return this.type.name.substr(this.type.name.lastIndexOf(".") + 1);
                }
                get fullTypeName() {
                    if (!this.type)
                        return this.constructor.name;

                    return this.type.name;
                }

                get value() {
                    if (!this.object)
                        return null;
                    return this.object[this.name];
                }
                set value(newValue) {
                    this.object[this.name] = newValue;
                }

                valueOf() {
                    return this.value;
                }
            });

        ONCE.global.PropertyDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
            class PropertyDescriptor extends FeatureDescriptor {
                static get implements() {
                    return null
                }
                constructor() {
                    super();
                }

                init(object, featureName, featureType, propertyDescriptor) {
                    super.init(object, featureName);
                    this.feature = featureType;
                    this.descriptor = propertyDescriptor;
                    Thinglish.defineAlias(this, "descriptor", "property");

                    this.method2Call = undefined;
                    return this;
                }
                /* debugging help> who was setting it
                        static get type() {
                                return this._type;
         
                        }
                        static set type(newValue) {
                                this._type = newValue;
         
                        }
                        */
            }
        );

        ONCE.global.RelationshipDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",




            class RelationshipDescriptor extends FeatureDescriptor {
                static get implements() {
                    return null
                }
                static get CARDINALITY_UNLIMITED() {
                    return -1
                }
                static get CARDINALITY_ONE() {
                    return 1
                }

                constructor() {
                    super();
                }
                init(object, featureName, featureType, propertyDescriptor) {
                    super.init(object, featureName);
                    this.feature = featureType;
                    this.property = propertyDescriptor;

                    this.method2Call = undefined;
                    this.cardinality = RelationshipDescriptor.CARDINALITY_ONE;

                    // set to the relationshipDescriptor/collection of the opposite object if exists.
                    this.opposite = null;
                    this.typeof = this.fullTypeName;

                    return this;
                }
            }
        );

        ONCE.global.CollectionDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
            class CollectionDescriptor extends RelationshipDescriptor {
                static get implements() {
                    return null
                }
                static get COLLECTION_SORTED() {
                    return true;
                }
                static get COLLECTION_UNSORTED() {
                    return false;
                }

                static get COLLECTION_ORDERED() {
                    return true;
                }
                static get COLLECTION_UNORDERED() {
                    return false;
                }

                static get COLLECTION_SET() {
                    return false;
                }
                static get COLLECTION_BAG() {
                    return true;
                }

                static get COLLECTION_CAN_ADD() {
                    return "add2collection";
                }
                static get COLLECTION_CAN_REMOVE() {
                    return "removeFromCollection";
                }
                constructor() {
                    super();
                }
                init(object, featureName, featureType, propertyDescriptor) {
                    super.init(object, featureName, featureType, propertyDescriptor);

                    this.method2Call = undefined;

                    this.cardinality = CollectionDescriptor.CARDINALITY_UNLIMITED;

                    this.typeof = undefined;
                    if (this.value.length > 1) {
                        this.typeof = Thinglish.getTypeName(this.value[0]);
                    }
                    this.capabilities = {
                        sorted: CollectionDescriptor.COLLECTION_UNSORTED,
                        ordered: CollectionDescriptor.COLLECTION_UNORDERED,
                        duplicats: CollectionDescriptor.COLLECTION_BAG,
                        canAdd: CollectionDescriptor.COLLECTION_CAN_ADD,
                        canRemove: CollectionDescriptor.COLLECTION_CAN_REMOVE,

                    };
                    return this;
                }
            }
        );

        ONCE.global.MethodDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
            class MethodDescriptor extends FeatureDescriptor {
                static get implements() {
                    return null
                }
                constructor() {
                    super();
                }
                init(object, featureName, featureType, propertyDescriptor) {
                    super.init(object, featureName);

                    this.feature = featureType;
                    //if (this.feature == "function")
                    //this.feature = "method";
                    this.property = propertyDescriptor;

                    switch (this.feature) {
                        case "function":
                            this.feature === "method"
                        case "eventHandler":
                        case "method":
                            this.method2Call = this.value;
                            break;
                        default:
                            this.method2Call = propertyDescriptor.set;
                            this.feature === "setter"
                    }

                    let d = this.argumentDescriptors;
                    this.arguments = [];
                    return this;
                }

                get source() {
                    if (!this.method2Call)
                        return "";
                    return this.method2Call.toString();
                }

                get numberOfArguments() {
                    return this.method2Call.length;
                }

                get badge() {
                    return this.numberOfArguments;
                }

                get argumentDescriptors() {
                    let declaration = this.source.substring(0, this.source.indexOf("{")).trim();
                    let argumentsList = declaration.substring(declaration.indexOf("(") + 1, declaration.indexOf(")"));
                    let args = argumentsList.split(",");
                    if (args[0] === "")
                        args = null;

                    this.declaration = declaration;
                    this.argumentsList = argumentsList;
                    this.args = args;
                    return args;
                }

                async call() {
                    let args = [];

                    let length = -1;
                    for (let i in arguments) {
                        //if (arguments[i] === undefined) continue;
                        args.push(arguments[i]);
                        length = i;
                    }

                    if (length > -1)
                        args.splice(0, 1);

                    for (let i in this.arguments) {
                        args[Number(i) + Number(length)] = this.arguments[i];
                    }

                    let result = null;
                    try {
                        result = await this.method2Call.call(this.object, ...args);
                    } catch (error) {
                        Action.do(DetailsView.ACTION_SHOW, error);
                        logger.error(error);
                        return error;
                    }
                    return result;
                }

            }
        );

        ONCE.global.JavaScriptObjectDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
            class JavaScriptObjectDescriptor {
                static get implements() {
                    return null;
                }
                static get previousObject() {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    return JavaScriptObjectDescriptor._private.previousObject;
                }
                static set previousObject(newValue) {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    JavaScriptObjectDescriptor._private.previousObject = newValue;
                }
                static get isInitialized() {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    return JavaScriptObjectDescriptor._private.isInitialized;
                }
                static set isInitialized(newValue) {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    JavaScriptObjectDescriptor._private.isInitialized = newValue;
                }
                static get previousDescriptor() {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    return JavaScriptObjectDescriptor._private.descriptor;
                }
                static set previousDescriptor(newValue) {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    JavaScriptObjectDescriptor._private.descriptor = newValue;
                }
                static get lastFeature() {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    return JavaScriptObjectDescriptor._private.lastFeature;
                }
                static set lastFeature(newValue) {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    JavaScriptObjectDescriptor._private.lastFeature = newValue;
                }
                static get ignoredFeatureIndex() {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    if (!JavaScriptObjectDescriptor._private.ignoredFeatureIndex)
                        JavaScriptObjectDescriptor._private.ignoredFeatureIndex = {};
                    return JavaScriptObjectDescriptor._private.ignoredFeatureIndex;
                }
                static set ignoredFeatureIndex(newValue) {
                    if (!JavaScriptObjectDescriptor._private)
                        JavaScriptObjectDescriptor._private = {};
                    if (!JavaScriptObjectDescriptor._private.ignoredFeatureIndex)
                        JavaScriptObjectDescriptor._private.ignoredFeatureIndex = {};
                    JavaScriptObjectDescriptor._private.ignoredFeatureIndex = newValue;
                }

                addIgnoredFeature(newValue) {
                    let isIgnored = JavaScriptObjectDescriptor.ignoredFeatureIndex[newValue];
                    if (!isIgnored)
                        JavaScriptObjectDescriptor.ignoredFeatureIndex[newValue] = [];
                    JavaScriptObjectDescriptor.ignoredFeatureIndex[newValue].push(JavaScriptObjectDescriptor.previousObject);
                }

                constructor() {
                    this.object = undefined;

                    this.featureIndex = {};
                    this.propertyIndex = {};
                    this.attributeIndex = {};
                    this.relationshipIndex = {};
                    this.collectionIndex = {};
                    this.eventHandlerIndex = {};
                    this.methodIndex = {};

                }
                get properties() {
                    return Object.keys(this.propertyIndex).map(k => this.propertyIndex[k]);
                }
                get attributes() {
                    return Object.keys(this.attributeIndex).map(k => this.attributeIndex[k]);
                }
                get relationships() {
                    return Object.keys(this.relationshipIndex).map(k => this.relationshipIndex[k]);
                }
                get collections() {
                    return Object.keys(this.collectionIndex).map(k => this.collectionIndex[k]);
                }
                get eventHandlers() {
                    return Object.keys(this.eventHandlerIndex).map(k => this.eventHandlerIndex[k]);
                }
                get methods() {
                    return Object.keys(this.methodIndex).map(k => this.methodIndex[k]);
                }

                init(object, merge, force, log) {
                    if (object === JavaScriptObjectDescriptor.previousObject)
                        if (JavaScriptObjectDescriptor.previousDescriptor.isInitialized === false) {
                            logger.debug("Prevented infinite recursion...");
                            logger.warn("Not describable: ", object, JavaScriptObjectDescriptor.lastFeature);
                            this.addIgnoredFeature(JavaScriptObjectDescriptor.lastFeature.substr(JavaScriptObjectDescriptor.lastFeature.lastIndexOf(":") + 2));
                            JavaScriptObjectDescriptor.previousObject = null;
                            let test = JavaScriptObjectDescriptor.describe(object);
                            if (test.isInitialized)
                                return test;
                            else
                                return null;
                        } else
                            return JavaScriptObjectDescriptor.previousDescriptor;

                    JavaScriptObjectDescriptor.previousObject = object;
                    JavaScriptObjectDescriptor.previousDescriptor = this;

                    if (object.type && object.type.descriptor) {
                        if (object.type.descriptor.isInitialized === false)
                            return null;
                        // the same object is currently being described
                        if (force !== true)
                            return object.type.descriptor;
                    }

                    let type = null;
                    if (!typeof object === "String") {
                        type = new TypeDescriptor().init(object);
                        type.descriptor = this;

                        if (object instanceof UcpComponent)
                            object.type = type;
                    }

                    JavaScriptObjectDescriptor.describe(object, merge, force, this, log);
                    this.isInitialized = true;

                    var aClass = Thinglish.lookupInObject(object, "type.class")
                    if (aClass && aClass.type) {
                        aClass.type.descriptor = this;
                    }

                    return this;
                }

                static describe(object, merge, force, jsd, log) {
                    if (jsd == undefined)
                        return new JavaScriptObjectDescriptor().init(object, merge, force, log);

                    if (jsd.isInitialized === false)
                        return null;
                    jsd.isInitialized = false;
                    logger.log({
                        level: "info",
                        category: "TYPE"
                    }, "describe ", object.id, object);
                    jsd.object = object;
                    let descriptor = {};

                    if (Array.isArray(object) || typeof object === "string") {
                        descriptor.length = {
                            feature: {
                                propertyDescriptor: Object.getOwnPropertyDescriptor(object, "length")
                            }
                        };
                    } else {
                        Object.keys(object).forEach(k => descriptor[k] = {
                            feature: {
                                attribute: k
                            }
                        });

                        let pd = Object.getOwnPropertyDescriptors(object);
                        Object.keys(pd).forEach(k => {
                            JavaScriptObjectDescriptor.lastFeature = "own: " + k;
                            if (descriptor[k] == undefined)
                                descriptor[k] = {
                                    feature: {
                                        propertyDescriptor: undefined
                                    }
                                }
                            descriptor[k].feature.propertyDescriptor = pd[k];
                            if (pd[k].value)
                                descriptor[k].type = "function";
                            if (pd[k].get)
                                descriptor[k].type = "property";
                        }
                        );
                    }

                    let proto = Object.getPrototypeOf(object);
                    let pd = Object.getOwnPropertyDescriptors(proto);
                    if (pd) {
                        Object.keys(pd).forEach(k => {
                            JavaScriptObjectDescriptor.lastFeature = "inherited: " + k;
                            if (descriptor[k] instanceof Function || k.startsWith("__") || k === "caller" || k === "callee" || k === "arguments") {
                                //logger.debug("describe: skipping proto", k);
                                return;
                            }
                            if (descriptor[k] == undefined)
                                descriptor[k] = {
                                    feature: {
                                        propertyDescriptor: undefined
                                    }
                                }
                            descriptor[k].feature.prototypeFeature = pd[k];
                            descriptor[k].feature.propertyDescriptor = pd[k];
                            descriptor[k].feature.inherited = true;
                            descriptor[k].feature.inheritedFrom = true;
                            if (pd[k].value)
                                descriptor[k].type = "function";
                            if (pd[k].get)
                                descriptor[k].type = "property";
                        }
                        );
                    }

                    Object.keys(descriptor).forEach(i => {
                        JavaScriptObjectDescriptor.lastFeature = "qualifying: " + i;
                        if (typeof descriptor[i] === "string")
                            return;
                        if (typeof JavaScriptObjectDescriptor.ignoredFeatureIndex[i] !== "object") {
                            try {
                                descriptor[i].value = object[i];
                            } catch (error) {
                                logger.warn("describe: found quality issue at ", i, "on", object, error);
                                jsd.addIgnoredFeature(i);
                                return;
                            }
                        } else {
                            logger.warn("describe: ignored feature '", i, "' on", object);
                            return;
                        }

                        let type = typeof object[i];
                        if (type === "object" && !(descriptor[i].value === null || descriptor[i].value === undefined)) {
                            if (Array.isArray(object[i]))
                                type = descriptor[i].type = "collection";
                            else {
                                type = descriptor[i].type = "relationship";
                            }
                        }

                        switch (type) {
                            case "undefined":
                                if (!descriptor[i].type)
                                    descriptor[i].type = "attribute";
                                break;
                            case "function":
                                if (Thinglish.isClass(object[i]))
                                    descriptor[i].type = "class:relationship";
                                if (i.startsWith("on"))
                                    descriptor[i].type = "eventHandler";
                                if (i.startsWith("handle"))
                                    descriptor[i].type = "eventHandler";
                                break;
                            case "relationship":
                                if (i.startsWith("on"))
                                    descriptor[i].type = "eventHandler";
                                if (i.startsWith("handle"))
                                    descriptor[i].type = "eventHandler";
                                break;
                            case "collection":
                                break;
                            case "property":
                                break;
                            default:
                                if (descriptor[i].type !== "property")
                                    descriptor[i].type = "attribute";
                            //+descriptor[i].type;
                        }
                        switch (descriptor[i].type) {
                            case "function":
                                descriptor[i].type = "method";
                                jsd.methodIndex[i] = new MethodDescriptor().init(object, i, descriptor[i].type, descriptor[i].feature.propertyDescriptor);
                                break;
                            case "eventHandler":
                                jsd.eventHandlerIndex[i] = new MethodDescriptor().init(object, i, descriptor[i].type, descriptor[i].feature.propertyDescriptor);
                                break;
                            case "property":
                                jsd.propertyIndex[i] = new PropertyDescriptor().init(object, i, descriptor[i].type, descriptor[i].feature.propertyDescriptor);
                                break;
                            case "relationship":
                                jsd.relationshipIndex[i] = new RelationshipDescriptor().init(object, i, descriptor[i].type, descriptor[i].feature.propertyDescriptor);
                                break;
                            case "class:relationship":
                                jsd.relationshipIndex[i] = new RelationshipDescriptor().init(object, i, descriptor[i].type, descriptor[i].feature.propertyDescriptor);
                                break;
                            case "collection":
                                jsd.collectionIndex[i] = new CollectionDescriptor().init(object, i, descriptor[i].type, descriptor[i].feature.propertyDescriptor);
                                break;
                            case "attribute":
                                jsd.attributeIndex[i] = new PropertyDescriptor().init(object, i, descriptor[i].type, descriptor[i].feature.propertyDescriptor);
                                break;
                            default:

                        }
                        jsd.featureIndex[i] = descriptor[i].type;
                        if (log === true)
                            logger.debug(descriptor[i].type, ":", i, descriptor[i].feature /*,"=",descriptor[i].value*/
                            );
                    }
                    );

                    //if (object.type && object.type.extends != undefined)
                    //jsd.super = JavaScriptObjectDescriptor.describe(object.type.extends, merge, force, null, log);

                    return jsd;
                }

                get typeName() {
                    if (!this.object.type)
                        return Thinglish.getTypeName(this.object);
                    if (!this.object.type.name)
                        return Thinglish.getTypeName(this.object);
                    return this.object.type.name.substr(this.object.type.name.lastIndexOf(".") + 1);
                }
                get fullTypeName() {
                    if (!this.object)
                        return "";
                    if (!this.object.type)
                        return Thinglish.getFullTypeName(this.object);
                    return this.object.type.name;
                }
            }
        );



        Thinglish.addLazyGetter(this, "Store", RelatedObjectStore);

        ONCE.state = Once.STATE_INITIALIZED;

        await ONCE.serverLifecycle();
        //logger.log("Once is initialized", ONCE);
    }

    addStatistic(path) {

        if (this?._private?.statisticActive != false) {
            this._private = this._private || {};
            this._private.statistics = this._private.statistics || {};

            let currentValue = Thinglish.lookupInObject(this?._private?.statistics, path) || 0;
            Thinglish.setInObject(this?._private?.statistics, path, currentValue + 1, true);
        }
    }
    getStatistic() {
        return this?._private?.statistics
    }

    static get EVENT() {
        return {
            ON_RESIZE: "onResize",
            NEW_INSTANCE: "newInstance",
        }
    }

    get type() {
        return Once.type;
    }
    set type(newValue) {
        Once.type = newValue;
    }

    async start(ior, config) {
        return await IOR.isIOR(ior).load(config);
    }

    newThing(event, thing) {
        logger.log("new Thing Event:", thing.name);
    }

    /**
    *
    * @param {IOR} ior
    * @return {Promise} response
    */
    async call(ior, parameter) {
        const newIor = new IOR().init(ior.url);
        newIor.loader = ior.loader;
        newIor.headers = ior.headers;
        newIor.queryParameters = parameter;
        return newIor.load();
    }

    checkInstallationMode() {
        switch (ONCE.mode) {
            case Once.MODE_NAVIGATOR:
            case Once.MODE_I_FRAME:
                ONCE.installationMode = Once.INSTALLATION_MODE_TRANSIENT;
                ONCE.pathSeperator = '/';
                //path.sep;
                let dirname = document.currentScript.src;
                ONCE.startPath = Once.getPlatformIndependantPathString(dirname);
                window.addEventListener('resize', function (event) {
                    if (!ONCE.eventSupport) {
                        console.warn("ONCE.eventSupport not ready");
                    } else {
                        ONCE.eventSupport.fire(Once.EVENT.ON_RESIZE, ONCE, event);
                    }
                });
                break;
            case Once.MODE_NODE_SERVER:

                ONCE.global.path = require('path');
                ONCE.pathSeperator = '/';
                //path.sep;
                __dirname = __dirname || window.location.pathname;
                ONCE.startPath = Once.getPlatformIndependantPathString(__dirname + ONCE.pathSeperator);
                //ONCE.installationMode = Once.INSTALLATION_MODE_TRANSIENT;
                module.exports = ONCE;
                ONCE.global.Buffer = ONCE.global.Buffer || require('buffer').Buffer;


                if (typeof atob === 'undefined') {
                    ONCE.global.atob = function (b64Encoded) {
                        return new Buffer.from(b64Encoded, 'base64').toString('binary');
                    };
                }
                ONCE.ENV = process.env;
                ONCE.dynamicPort = ONCE.ENV.ONCE_DOCKER_HTTP_PORT || 7080;
                ONCE.httpsPort = ONCE.ENV.ONCE_DOCKER_HTTPS_PORT || 7443;

                logger.log("Arguments: ", process.argv);
                logger.log("Environment: ", process.env);
                break;
        }

        let repositoryRootIndex = ONCE.startPath.indexOf(Once.REPOSITORY_ROOT);
        switch (repositoryRootIndex) {
            case -1:
                ONCE.installationMode = Once.INSTALLATION_MODE_TRANSIENT;
                break;
            case 0:
                ONCE.installationMode = Once.INSTALLATION_MODE_REPOSITORY_GLOBAL;
                ONCE.repositoryRootPath = ONCE.startPath.substr(0, repositoryRootIndex);
                ONCE.findNamespaceAndVersion(repositoryRootIndex);
                ONCE.basePath = ONCE.repositoryRootPath /* + Once.REPOSITORY_ROOT + Once.REPOSITORY_COMPONENTS + '/'*/
                    + ONCE.path;
                break;
            default:
                ONCE.installationMode = Once.INSTALLATION_MODE_NPM_LOCAL;
                ONCE.repositoryRootPath = ONCE.startPath.substr(0, repositoryRootIndex);
                ONCE.findNamespaceAndVersion(repositoryRootIndex);
                ONCE.basePath = ONCE.repositoryRootPath /* + Once.REPOSITORY_ROOT + Once.REPOSITORY_COMPONENTS + '/'*/
                    + ONCE.path;

        }

        logger.log("ONCE.startPath: ", ONCE.startPath);
        logger.log("ONCE.basePath: ", ONCE.basePath);
        logger.log("ONCE.path: ", ONCE.path);
        logger.log("ONCE.repositoryRootPath: ", ONCE.repositoryRootPath);


    }

    findNamespaceAndVersion(repositoryRootIndex) {
        ONCE.path = ONCE.startPath.substr(repositoryRootIndex, ONCE.startPath.indexOf("/src") - repositoryRootIndex);
        let namespaces = ONCE.path.split(ONCE.pathSeperator);
        ONCE.versionNumber = namespaces.pop();
        namespaces = namespaces.splice(3);
        ONCE.versionNamespace = ONCE.versionNumber.replace(/\./g, "_");
        ONCE.namespaceString = namespaces.join(".");
    }

    startServer(host, dynamicPort) {
        return new Promise((resolve, reject) => {
            const currentURL = new URL(host);
            const port = parseInt(currentURL.port);
            const server = Once.http.createServer(ONCE.experss);
            server.on('error', (err) => {
                logger.error('XXX', err);
                if (err.code !== 'EADDRINUSE') {
                    server.state = Once.STATE_CRASHED;

                    return reject(err)
                }
                logger.log('/////////////');
                if (dynamicPort)
                    server.listen(++dynamicPort)
                logger.log(dynamicPort)
            }
            )
            server.on('listening', () => {
                ONCE.servers.push(server);

                if (dynamicPort)
                    logger.log("ONCE Server listening on dynamic port: http://localhost:" + dynamicPort);
                else
                    logger.log("ONCE Server listening on " + currentURL.toString());
                server.state = Once.STATE_STARTED;
                ONCE.dynamicPort = dynamicPort;
                resolve(port);
            })
            server.addListener('connection', (socket)=>{
                ONCE.sockets.push(socket);
            })
            server.listen(port)
            ONCE.servers.push(server);
        }
        )
    }

    async serverLifecycle() {
        switch (ONCE.mode) {
            case Once.MODE_NAVIGATOR:
            case Once.MODE_I_FRAME:
                await this.initClientsideOnce();
                break;
            case Once.MODE_NODE_SERVER:
                this.initServersideOnce();
                break;
        }
        logger.log({
            level: "user",
            category: "BOOTING"
        }, "ONCE started in ", Date.now() - ONCE.startTime, " milliseconds .... now loading components");

        ONCE.isStarted = true;  // Prevent it to start it again
        await ONCE.global.EAMDucpLoader.loadAndStartAll(Once);

        if (ONCE.mode !== Once.MODE_NODE_SERVER) {
            ONCE.global.dropSupport = DnDSupport.getInstance().init();
        }

        //if (typeof LessSingleton !== "undefined") {
        //    LessSingleton.compile()
        //}

        //await Thinglish.startDependencies(this.constructor);
    }

    async initClientsideOnce() {


        ONCE.global.SecurityContext = Namespace.declare(
            class SecurityContext extends Interface {

                static get defaultImplementationClass() {
                    if (ONCE.mode === Once.MODE_NODE_SERVER) {
                        return UDESecurityContext;
                    } else {
                        throw new Error("No Security Context on Client Side");
                    }
                }

                init(object, sessionManager) {
                    return this;
                }

                async hasRole(roleName) {
                    ONCE.notImplementedYet();
                }

                static factory(ior, sessionManager) {
                    this._private.instances = this._private.instances || {};
                    //@ToDo Need to be Weak store
                    //@ToDo Need to update the objects on DB Change
                    // if (!this._private.instances[ior.iorUniquePath]) {
                    //     this._private.instances[ior.iorUniquePath] = this.defaultImplementationClass.getInstance().init(ior, sessionManager);
                    // }
                    // return this._private.instances[ior.iorUniquePath];

                    if (!Thinglish.isInstanceOf(sessionManager, SessionManager)) {
                        throw new Error("SessionManager is not a SessionManager! " + sessionManager);
                    }

                    return this.defaultImplementationClass.getInstance().init(ior, sessionManager);
                }

            }
        );

        ONCE.global.Client = Namespace.declare("tla.EAM.layer2.OnceServices",
            class Client extends Interface {

                static get eamLayer() {
                    return 2;
                }

                // @ToDo Clean the Client

                static get ACTION_LOGIN() {
                    return "actionId:public:Client.login[Login]:success";
                }
                static get ACTION_LOGOUT() {
                    return "actionId:public:Client.logout[Logout]";
                }
                static get ACTION_ROUTER() {
                    return "actionId:protected:Client.openRouter[Open Router]:default";
                }

                static discover() {
                    return Client.type.implementations || [];
                }

                static findClient(urlObject, directInstance = true) {
                    let clients = Client.type.implementations || [];
                    let mostSuitable = clients.map(classType => {
                        let result = 0;
                        if (typeof classType.canConnect == "function") {
                            result = classType.canConnect(urlObject);
                        }
                        return { result, classType };
                    }).filter(classType => { return classType.result > 0 }).sort((a, b) => b.result - a.result);

                    if (mostSuitable.length > 0) {
                        logger.debug(`==== the most suitable client for ${urlObject.href} is ${mostSuitable[0].classType.name} === `);

                        if (directInstance) {
                            return mostSuitable[0].classType.factory(urlObject);
                        } else {
                            return mostSuitable[0].classType;
                        }
                    }
                    logger.warn(`==== No Client Found for ${urlObject.href} !!! === `);

                    return null;
                }

                async login(name, password) {
                    const postData = {
                        name,
                        password
                    };
                    try {
                        const result = await this.post('login', postData);
                        if (result.result && result.result.type === 'User') {
                            this.loginResult = result.result;
                            return true;
                        }
                        return false;
                    } catch (e) {
                        logger.error(e);
                        return false;
                    }
                }

                canConnect(urlObject) {
                    return (urlObject.origin == this.baseUrl ? 1 : 0);
                }

                async logout() {
                    const result = await this.post('logout', {});
                    return (result.result && Array.isArray(result.result) && result.result.length === 0);
                }

                // getBaseIOR() {
                //     return IOR.getInstance().init(this.baseUrl);
                // }

                notImplementedYet() {
                    throw new Error(`you must implement this method`);
                }

                handleSelection(event, item) {
                    logger.info(this.constructor.name, "selected", item.ucpComponent);
                    Action.do(DetailsView.ACTION_SHOW, this);
                    if (this.isLoggedIn)
                        Action.do(ActionsPanel.ACTION_SET_PRIMARY, this.actionIndex.ACTION_LOGOUT);
                    else
                        Action.do(ActionsPanel.ACTION_SET_PRIMARY, this.actionIndex.ACTION_LOGIN);
                    //Action.do(Workflow.ACTION_SELECT, item);
                }

                get isLoggedIn() {
                    return this.model.session != null;
                }

                async apiCall(data, header, fallbackMethodName) {

                    let route = this.router.lookupOne(Thinglish.currentMethodDescriptor.caller.name, "apiMethod");
                    if (!route && fallbackMethodName) {
                        route = this.router.lookupOne(fallbackMethodName, "apiMethod");
                    } else if (!route) {
                        console.error("Could not Call route! Please set fallbackMethodName!");
                    }

                    let response = await route.call(data, header);
                    if (response.status >= 200 && response.status < 300) {
                        const type = response.headers.get('Content-Type');
                        return (/json/i.test(type)) ? response.clone().json() : response.text();
                    }
                    return new Error(response.statusText);
                    //return result;
                }

                openRouter() {
                    Action.do(OverView.ACTION_OPEN, this.router).then(() => this.router.update());
                }

                addSessionManager(sessionManager) {
                    this.add(sessionManager);
                }

                add(object) {
                    if (Thinglish.isInstanceOf(object, SessionManager)) {
                        this._private.sessionManager = object;
                    }
                }

                static factory(urlObject) {
                    this._private = this._private || {};
                    this._private.instanceStore = this._private.instanceStore || InstanceStore.getInstance().init(this.type.class);

                    let objectArray = Object.values(this._private.instanceStore.registry);

                    if (urlObject) objectArray = objectArray.filter(x => x.canConnect(urlObject));
                    return (objectArray.length > 0 ? objectArray[0] : this.type.class.getInstance().init(urlObject));

                    // if (urlObject) objectArray = objectArray.map(x => [x.canConnect(urlObject), x]).sort((a, b) => b[0] - a[0]);
                    // return (objectArray.length > 0 ? objectArray[0][1] : this.type.class.getInstance().init(urlObject));
                }

                static get instanceStore() {
                    this._private = this._private || {};
                    this._private.instanceStore = this._private.instanceStore || InstanceStore.getInstance().init(this.type.class);
                    return this._private.instanceStore;
                }

                static get connectionStore() {
                    this._private = this._private || {};
                    this._private.connectionStore = this._private.connectionStore || InstanceStore.getInstance().init();
                    return this._private.connectionStore;
                }
                get baseUrl() {
                    return this.model.baseUrl;
                }
                set baseUrl(newValue) {
                    return this.model.baseUrl = newValue;
                }
            }
        );
        ONCE.global.HTMLScriptClient = Namespace.declare("tla.EAM.layer2.OnceServices",
            class HTMLScriptClient extends Thing {
                static get implements() {
                    return [Client];
                }

                canConnect(urlObject) {
                    return HTMLScriptClient.canConnect(urlObject);
                }

                static canConnect(urlObject) {
                    if (ONCE.mode === 'nodeServer') return 0;
                    return ['js', 'css', 'less', 'mjs'].indexOf(urlObject.fileType) !== -1 ? 1 : 0;
                }

                init() {
                    this.type.class.instanceStore.register(0, this);
                    ONCE.register(this);
                    return this;
                }

                load(ior) {
                    if (ONCE.mode === 'nodeServer') {
                        logger.log("ignoring to load", path, "on serverside");
                        return null;
                    }


                    const timeoutError = new Error('Timeout loading File ' + ior.url);
                    const onError = function (promiseHandler) {
                        promiseHandler.setError(timeoutError);
                    }

                    const promiseHandler = Thinglish.createPromise(30000, onError.bind(this));

                    const src = ior.normalizeHref;

                    let domElement = null;
                    if (ior.fileType == 'js' || ior.fileType == 'mjs') {
                        domElement = document.createElement('script');
                        domElement.src = src;

                        if (ior.protocol.hasProtocol('jsModule') || ior.fileType == 'mjs') {
                            domElement.type = "module";
                        }
                    } else if (ior.fileType == 'less' || ior.fileType == 'css') {
                        domElement = document.createElement('link');
                        domElement.href = src;
                        domElement.rel = "stylesheet" + (ior.fileType == 'less' ? '/less' : '');
                        domElement.type = "text/" + ior.fileType;

                        // Register new Style
                        if (typeof LessSingleton !== "undefined") {
                            LessSingleton.addNewStyle(domElement);
                        }
                    } else {
                        onError(new Error(`Filetype ${ior.fileType} unknown`));
                        return;
                    }

                    domElement.id = Namespace.path2namespace(src);

                    const onLoad = function (event) {
                        return promiseHandler.setSuccess({ script: domElement }, event);
                    }
                    domElement.onload = onLoad;
                    domElement.onerror = onError;
                    document.head.appendChild(domElement);

                    // There is no callback in case of less WODA-2077
                    if (ior.fileType == 'less') promiseHandler.setSuccess({ script: domElement })

                    return promiseHandler.promise;
                }

            });

        ONCE.global.WebSocketClient = Namespace.declare("tla.EAM.layer2.OnceServices",
            class WebSocketClient extends Thing {
                static get implements() {
                    return [Client];
                }

                static get MESSAGE_ERROR() { return 'ERROR' }
                static get MESSAGE_INFO() { return 'INFO' }
                static get MESSAGE_REQUEST() { return 'REQUEST' }
                static get MESSAGE_RESPONSE() { return 'RESPONSE' }
                static get MESSAGE_UPDATE_TOKEN() { return 'UPDATE_TOKEN' }
                static get MESSAGE_KEEP_ALIVE() { return 'KEEP_ALIVE' }



                canConnect(urlObject) {
                    if (this.componentState == UcpComponent.COMPONENT_STATES.DESTROYED) return 0;

                    return this._private.urlObject.origin == urlObject.origin ? 1 : 0;
                }

                static canConnect(urlObject) {
                    if (ONCE.mode == Once.MODE_NODE_SERVER) return 0;
                    if (urlObject.protocol.hasProtocol('ws') || urlObject.protocol.hasProtocol('wss')) return 1;
                    return 0;
                }

                async init(urlObject) {
                    super.init();
                    if (ONCE.mode == Once.MODE_NODE_SERVER) return null;

                    this._private.timeout = 20000;

                    this._private.urlObject = urlObject.clone();

                    this.connectionId = UUID.uuidv4();
                    //this._private.get(this).id = this.connectionId;

                    const sessionManager = ONCE.Store.lookup(SessionManager);
                    if (sessionManager) {
                        this.sessionManager = sessionManager[0];
                    } else {
                        ONCE.eventSupport.addEventListener("newInstance", this, this.onNewInstance.bind(this));
                    }


                    this.type.class.instanceStore.register(urlObject.normalizeHref, this);

                    this._private.transactionStore = new InstanceStore().init();

                    await this.connect();

                    Client.connectionStore.register(this.connectionId, this);
                    ONCE.register(this);

                    let intervalTask;
                    const keepAlive = () => {
                        if (this.componentState === UcpComponent.COMPONENT_STATES.DESTROYED) {
                            clearInterval(intervalTask);
                            return;
                        }
                        this._private.webSocket.send(WebSocketClient.MESSAGE_KEEP_ALIVE);
                    }
                    intervalTask = setInterval(keepAlive, 60000)

                    return this;
                }

                onNewInstance(event, thing) {
                    if (typeof DefaultKeycloakSessionManager !== 'undefined' && thing instanceof DefaultKeycloakSessionManager) {
                        if (!this.sessionManager) {
                            this.sessionManager = thing;
                        }
                    }
                }

                set connectionId(value) { this._private.connectionId = value }
                get connectionId() { return this._private.connectionId }

                set timeout(value) { this._private.timeout = value; }
                get timeout() { return this._private.timeout };

                get callbackOnMessage() { return this._private.callbackOnMessage }
                set callbackOnMessage(callback) {
                    this._private.callbackOnMessage = callback;
                }

                get callbackOnSocketClose() { return this._private.callbackOnSocketClose }
                set callbackOnSocketClose(callback) {
                    this._private.callbackOnSocketClose = callback;
                }

                get sessionManager() { return this._private.sessionManager }
                set sessionManager(sessionManager) {
                    this._private.sessionManager = sessionManager;
                    sessionManager.eventSupport.addEventListener(KeycloakSessionManager.EVENT_LOGIN, this, this.onSessionKeyUpdate.bind(this));
                    sessionManager.eventSupport.addEventListener(KeycloakSessionManager.EVENT_LOGOUT, this, this.onLogout.bind(this));
                    sessionManager.eventSupport.addEventListener(KeycloakSessionManager.EVENT_ON_UPDATE_TOKEN, this, this.onSessionKeyUpdate.bind(this));
                }

                onLogout() {
                    this.disconnect();
                }

                connect() {

                    if (this.sessionManager) {
                        let headers = this.sessionManager.addSessionHeader({});
                        if (headers) {
                            this._private.urlObject.searchParameters = headers;
                        }
                    }

                    let socket = new WebSocket(this._private.urlObject.normalizeHref); //.replace(/^wss?:\/\//, '')


                    socket.onerror = function (error) {
                        logger.error(`Websocket [error] ${error.message}`, error);
                    };

                    const thisProxy = this;

                    socket.onclose = function (event) {
                        // @ToDo Check if reconnect is needed
                        if (event.wasClean) {
                            logger.log(`Websocket [close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                        } else {
                            // e.g. server process killed or network down
                            // event.code is usually 1006 in this case
                            logger.error('Websocket [close] Connection died', event);
                        }
                        Client.connectionStore.remove(thisProxy.connectionId);

                        if (thisProxy._private.callbackOnSocketClose) {
                            thisProxy._private.callbackOnSocketClose(thisProxy);
                        }
                    };

                    let proxyFunction = (...data) => {
                        return thisProxy.dataReceived(...data);
                    }

                    socket.onmessage = proxyFunction;

                    this._private.webSocket = socket;

                    this._private.startupPromise = Thinglish.createPromise();

                    return this._private.startupPromise.promise;
                    // @ToDo Add Timeout and recect

                    // return new Promise((resolve, reject) => {
                    //     socket.onopen = function (e) {
                    //         logger.log("Websocket [open] Connection established", e);
                    //         // socket.send("My name is John");
                    //         resolve();

                    //     };
                    // })


                }

                async onSessionKeyUpdate() {
                    if (this.componentState === UcpComponent.COMPONENT_STATES.ACTIVE) {
                        this.send(this.sessionManager.accessToken, undefined, WebSocketClient.MESSAGE_UPDATE_TOKEN)
                    }
                }

                async dataReceived(arg) {
                    let data;
                    if (typeof MessageEvent != "undefined" && arg instanceof MessageEvent) {
                        data = arg.data;
                    } else {
                        data = arg;
                    }

                    if (!data.startsWith("KEEP_ALIVE")) {
                        logger.log('Received from Websocket at ' + ONCE.now() + ' : ' + this.connectionId + ' : ' + data);
                    }


                    let transactionId;
                    try {
                        // Check direction
                        let direction;
                        if (data.startsWith(WebSocketClient.MESSAGE_REQUEST)) {
                            direction = WebSocketClient.MESSAGE_REQUEST;
                            data = data.substr(9);
                        } else if (data.startsWith(WebSocketClient.MESSAGE_RESPONSE)) {
                            direction = WebSocketClient.MESSAGE_RESPONSE;
                            data = data.substr(10);
                        } else if (data.startsWith(WebSocketClient.MESSAGE_INFO)) {
                            data = data.substr(10);
                            logger.info("Websocket Message: " + data);
                            return;

                        } else if (data.startsWith(WebSocketClient.MESSAGE_UPDATE_TOKEN)) {
                            direction = WebSocketClient.MESSAGE_UPDATE_TOKEN;
                            data = data.substr(14);
                            logger.info("Websocket Update Token: " + data);

                        } else if (data.startsWith(WebSocketClient.MESSAGE_KEEP_ALIVE)) {
                            return;

                        } else if (data.startsWith(WebSocketClient.MESSAGE_ERROR)) {
                            data = data.substr(7);
                            transactionId = data.substr(0, 36);
                            data = data.substr(38);

                            let error = new Error("Get an Error on the Websocket for Transaction " + transactionId +
                                ' ' + (this._private.urlObject ? this._private.urlObject.origin + this._private.urlObject.pathName : '') + data)
                            const target = this._private.transactionStore.lookup(transactionId);
                            if (target) {
                                target.rejectTransaction(error);
                            } else {
                                logger.error("Get an Error on the Websocket " + (this._private.urlObject ? this._private.urlObject.origin + this._private.urlObject.pathName : ''), data, this);
                            }
                            return;
                        } else if (data.startsWith('CONNECTION_READY')) {
                            if (this._private.startupPromise) {
                                this._private.startupPromise.setSuccess();
                            }
                            return;
                        } else {
                            logger.error("Can not find the Direction of the Message! Throw it away!" + data, this);
                            this.send('Can not Parse the Message ' + data, 'unknown', WebSocketClient.MESSAGE_ERROR);
                            return;
                        }

                        // Check Transaction ID
                        transactionId = data.substr(0, 36);
                        if (!UUID.isUuidv4(transactionId)) {
                            logger.error("Received Data don't have a correct TransactionID!", data);
                            return;
                        }

                        data = data.substr(38);
                        if (direction == WebSocketClient.MESSAGE_REQUEST) {
                            let functionArgs = [];

                            let requestIOR = IOR.getInstance().init(data);
                            requestIOR.sessionManager = this.sessionManager;

                            let sourceIOR = requestIOR.clone();
                            sourceIOR.search = '';
                            sourceIOR.hash = '';
                            sourceIOR.connection = this;
                            sourceIOR.protocol.remove(/^https?$/);
                            sourceIOR.protocol.push('wss');
                            if (requestIOR.searchParameters.functionArgs) {
                                functionArgs = requestIOR.searchParameters.functionArgs;
                                delete requestIOR.searchParameters.functionArgs;
                                if (!Array.isArray(functionArgs)) {
                                    throw new Error('Invalid functionArgs. Expect an Array');
                                }
                                functionArgs.push(sourceIOR);

                            }
                            if (!requestIOR.hash) {
                                throw new Error('Invalid hash value in the url');
                            }
                            let action = requestIOR.hash;
                            requestIOR.hash = undefined;


                            requestIOR.protocol.remove(/^wss?$/);
                            requestIOR.protocol.push('local');

                            let result;

                            const processAction = async function processAction() {
                                try {
                                    return await requestIOR.callAction(action, functionArgs);
                                } catch (error) {
                                    throw error;
                                } finally {
                                    // Do Cleanup 
                                    // if (ONCE.mode == Once.MODE_NODE_SERVER && this.sessionManager) {
                                    //     this.sessionManager.cleanupSecurityContexts();
                                    // }
                                }
                            }
                            if (ONCE.mode === Once.MODE_NODE_SERVER) {
                                result = await this.sessionManager.processQueue.enqueue(processAction.bind(this));
                            } else {
                                result = await processAction();
                            }



                            //let result = await this._private.callbackOnMessage(requestIOR, sourceIOR);
                            //let result2Send = Thinglish.serialize2IORDataStructure(result);
                            this.send(result, transactionId, WebSocketClient.MESSAGE_RESPONSE);

                        } else if (direction == WebSocketClient.MESSAGE_RESPONSE) {
                            let target = this._private.transactionStore.lookup(transactionId);
                            if (!target) {
                                logger.error("Can not find the WS Transaction in the Store! " + transactionId, data);
                                return;
                            }
                            // @ToDo need deserialize2IORDataStructure
                            logger.debug('Resolve: ' + data);
                            target.resolveTransaction(JSON.parse(data));
                        } else if (direction == WebSocketClient.MESSAGE_UPDATE_TOKEN) {
                            const result = await this.sessionManager.setAccessToken(data.substring(1, data.length - 1));
                            this.send(result, transactionId, WebSocketClient.MESSAGE_RESPONSE);
                        }
                    } catch (error) {
                        logger.error(error.stack);
                        this.send(error.message, transactionId, WebSocketClient.MESSAGE_ERROR);
                    } finally {
                        if (ONCE.mode === Once.MODE_NODE_SERVER && this?.sessionManager) {
                            this.sessionManager.cleanupSecurityContexts();
                        }
                    }



                }

                get componentState() {
                    if (this._private.destroy === true) {
                        return UcpComponent.COMPONENT_STATES.DESTROYED;
                    } else {
                        return UcpComponent.COMPONENT_STATES.ACTIVE;
                    }
                }

                disconnect(code = 1000, reason = 'success') {
                    this._private.webSocket.close([code], [reason]);
                    this.destroy();
                }

                destroy() {
                    if (this.componentState === UcpComponent.COMPONENT_STATES.DESTROYED) return true;
                    this._private.destroy = true;
                    ONCE.Store.remove(this);
                    return true;
                }

                async send(data, originalTransactionId, prefix = WebSocketClient.MESSAGE_REQUEST) {
                    if (prefix == WebSocketClient.MESSAGE_REQUEST) {
                        if (data instanceof IOR) {
                            data = data.href;
                        }
                    } else {
                        data = JSON.stringify(Thinglish.serialize2IORDataStructure(data));
                    }

                    if (this._private.startupPromise && Thinglish.isPromise(this._private.startupPromise.promise)) {
                        await this._private.startupPromise.promise;
                    }

                    return new Promise((resolve, reject) => {
                        const transactionId = originalTransactionId || UUID.uuidv4();
                        let resolveTransaction = (event) => {
                            this._private.transactionStore.remove(transactionId);
                            return resolve(event);
                        }
                        let rejectTransaction = (error) => {
                            this._private.transactionStore.remove(transactionId);
                            return reject(error);
                        }


                        let string2Send = prefix + '##' + transactionId + '##' + data;
                        logger.log('send to Websocket at ' + ONCE.now() + ' : ' + this.connectionId + ' : ' + string2Send);
                        this._private.webSocket.send(string2Send);


                        if (prefix == WebSocketClient.MESSAGE_REQUEST || prefix == WebSocketClient.MESSAGE_UPDATE_TOKEN) {
                            logger.log('Create Promise: ' + data);
                            // Store Transaction
                            this._private.transactionStore.register(transactionId, { resolveTransaction, rejectTransaction });
                            setTimeout(() => {
                                if (this._private.transactionStore.lookup(transactionId)) {
                                    this._private.transactionStore.remove(transactionId);
                                    logger.error("Timeout on the Websocket Transaction " + transactionId, data);
                                    resolve('Timeout on the Websocket Transaction ' + transactionId);
                                }
                            }, this._private.timeout);
                        } else {
                            resolve();
                        }
                    })



                }

                async create(iorObject) {
                    return await iorObject.callAction(`actionId:global:.API.create`);
                }

                async retrieve(iorObject) {
                    return await iorObject.callAction(`actionId:global:.API.retrieve`);
                }

                async update(iorObject) {
                    return await iorObject.callAction(`actionId:global:.API.update`);
                }

                async delete(iorObject) {
                    return await iorObject.callAction(`actionId:global:.API.delete`);
                }

                async load(iorObject) {
                    return await iorObject.callAction(`actionId:global:.API.retrieve`);
                }


            });


        ONCE.global.WebSocketConnectionHandler = Namespace.declare("tla.EAM.layer2.OnceServices",
            class WebSocketConnectionHandler extends WebSocketClient {
                static get implements() {
                    return [Client];
                }

                canConnect(urlObject) {
                    return 0;
                }

                static canConnect(urlObject) {
                    return 0;
                }

                async init(webSocket, req) {
                    super.init();

                    if (ONCE.mode !== Once.MODE_NODE_SERVER) return null;


                    this._private.webSocket = webSocket;
                    this._private.timeout = 10000;
                    this._private.transactionStore = new InstanceStore().init();
                    this._private.req = req;


                    this.connectionId = UUID.uuidv4();
                    //this._private.get(this).id = this.connectionId;

                    const inputUrl = Url.getInstance().init(req.url);
                    let token;
                    if (inputUrl.searchParameters.Authorization) token = inputUrl.searchParameters.Authorization.substr(7);
                    this.sessionManager = await ServerSideKeycloakSessionManager.factory(token);

                    //const sessionManager = await ONCE.createSessionManagerFromRequest(req, undefined);

                    const thisProxy = this;

                    webSocket.on('close', () => {
                        logger.log('disconnected Websocket');
                        Client.connectionStore.remove(thisProxy.connectionId);
                        thisProxy._private.callbackOnSocketClose(thisProxy);
                    });

                    webSocket.on('message', (...data) => {
                        return thisProxy.dataReceived(...data);
                    });


                    Client.connectionStore.register(this.connectionId, this);

                    return this;
                }

                connect() { ONCE.notImplementedYet() }


            });

        //serverside load a scrip files content and start it in node.js vm
        ONCE.global.FileScriptClient = Namespace.declare("tla.EAM.layer2.OnceServices",
            class FileScriptClient extends Thing {
                static get implements() {
                    return [Client];
                }

                canConnect(urlObject) {
                    return HTMLScriptClient.canConnect(urlObject);
                }

                static canConnect(urlObject) {
                    if (ONCE.mode !== 'nodeServer') return 0;
                    if (['js'].indexOf(urlObject.fileType) !== -1) {
                        if (!urlObject.origin) {
                            return 1;
                        }
                        if (urlObject.hostName == ONCE.ENV.ONCE_DEFAULT_HOST) return 1;
                        if (urlObject.origin == ONCE.ENV.ONCE_DEFAULT_URL) return 1;
                        // @ToDo Analyse origin if it match the own Server
                    }
                    return 0;
                }

                init() {
                    if (ONCE.mode !== 'nodeServer') return null;

                    let fs = require("fs");
                    let vm = require('vm');
                    this._private = { fs, vm };

                    this.type.class.instanceStore.register(0, this);
                    ONCE.register(FileScriptClient, this);
                    return this;
                }

                async load(ior) {
                    if (ONCE.mode !== Once.MODE_NODE_SERVER) {
                        logger.log("ignoring to load", path, "on serverside");
                        return null;
                    }
                    //const storedScript = this.staticStore.lookup(ior);

                    let filename = ONCE.repositoryRootPath + ior.pathName;

                    var content = this._private.fs.readFileSync(filename);
                    let code = content.toString();
                    //if (!Thinglish.isES6Module(code)) {
                    //    code = Thinglish.migrateCodeToES6Module(code);
                    //};
                    //Namespace.script4declare = {src: ior.pathName, id: Namespace.path2namespace(ior.pathName) , exists: true, ior};
                    let script = new this._private.vm.Script(code, {
                        filename: filename,
                        lineOffset: 0,
                        columnOffset: 0,
                        //  cachedData: new Buffer([]),
                        //  produceCachedData: false,
                        //  importModuleDynamically: null
                    });
                    let scriptInfo = {
                        script,
                        mainClass: null,
                        declarationListPerScript: [],
                        id: ior.normalizeHref,
                        exists: true,
                        ior
                    };
                    script.src = filename;
                    ior.referencedObject = scriptInfo;
                    ONCE.currentScriptInfo = scriptInfo;
                    script.runInThisContext();

                    //this._private.vm.runInThisContext(content);
                    //Namespace.script4declare = undefined;
                    //this.staticStore.register(ior, script);


                    return scriptInfo;
                }


            });

        ONCE.global.DocumentScriptLoader = Namespace.declare("tla.EAM.layer3.OnceServices",
            class DocumentScriptLoader {
                static get implements() {
                    return [Loader];
                }
                static canLoad(urlObject) {
                    return ['js', 'css', 'less', 'mjs'].indexOf(urlObject.fileType) !== -1 ? 1 : 0;
                }



                init(path) {

                    this.type.class.instanceStore.register(0, this);
                    return this;
                }

                client() {
                    if (ONCE.mode === Once.MODE_NODE_SERVER) {
                        return FileScriptClient.factory();
                    } else {
                        return HTMLScriptClient.factory();
                    }
                }

                async load(ior) {
                    const storedScript = this.staticStore.lookup(ior);

                    if (storedScript) {
                        return Promise.resolve(this.scriptLoaded(storedScript));
                    }

                    let script = await this.client().load(ior);
                    script.ior = ior;
                    this.staticStore.register(ior, script);
                    //script.declarationListPerScript = script.declarationListPerScript || [];
                    return script;

                    // const willBeLoaded = new Promise((resolve, reject) => {
                    //     let script = null;
                    //     const onLoad = function (event) {
                    //         return resolve(script, event);
                    //     }

                    //     const onError = function (error) {
                    //         return reject(script, error);
                    //     }

                    //     if (document) {
                    //         script = this.addScriptTag(path, path, onLoad, onError);
                    //         //ONCE.Store.register(DocumentScriptLoader, path);
                    //         DocumentScriptLoader.storeScript(path, script);
                    //     } else {
                    //         logger.log("ignoring to load", path, "on serverside");
                    //         //require(path);
                    //     }
                    // }
                    // );
                    // return await willBeLoaded.then(this.scriptLoaded, this.scriptFailedToLoad);
                }

                scriptLoaded(script, event) {
                    //script.parentElement.removeChild(script);

                    script.declarationListPerScript = script.declarationListPerScript || [];

                    return script;
                }

                // scriptFailedToLoad(script, error) {
                //     logger.error(error, script);
                //     return script;
                // }

                namespace2path(namespace) {
                    return Namespaces.namespace2path(namespace);
                }

                path2namespace(path) {
                    return Namespaces.path2namespace(path);
                }

            }
        );


        ONCE.global.UcpDomainEntityLoader = Namespace.declare("tla.EAM.layer3.OnceServices",
            class UcpDomainEntityLoader {
                static get implements() {
                    return [Loader];
                }

                static canLoad(urlObject) {
                    return (urlObject.protocol.hasProtocol('ude') ? 1 : 0);
                }

                getIOR(path) {

                    if (!this.ior || path) {
                        this.ior = new IOR().init(path);
                    }

                    return this.ior;
                }

                static clearObjectStore() {
                    this.objectStore.clear();
                }

                static createNewPath(server) {
                    server = server || ONCE.ENV.ONCE_DEFAULT_UDE_STORE || ONCE.ENV.ONCE_DEFAULT_URL || 'https://localhost:8443';
                    logger.log("using ONCE_DEFAULT_UDE_STORE:", server)
                    return 'ior:ude:rest:' + server + '/ior/' + UUID.uuidv4();
                }

                static get objectStore() {
                    this._private = this._private || {};
                    if (!this._private.objectStore) {
                        this._private.objectStore = WeakRefPromiseStore.getInstance().init();
                    }
                    return this._private.objectStore;
                }

                init() {
                    this._private = this._private || {};
                    this.type.class.instanceStore.register(0, this);
                }

                // config = {data, ucpComponent}
                async create(ior, config) {
                    let promise = this.client(ior).create(ior, config.data, {}, true);
                    UcpDomainEntityLoader.objectStore.register(ior.iorUniquePath, config.ucpComponent);
                    return await promise;
                }

                update(ior, config) {
                    return this.client(ior).update(ior, config.data, {}, true);

                }

                retrieve(ior) {
                    return this.client(ior).retrieve(ior, {}, {}, true);
                }

                client(ior) {
                    return Client.findClient(ior);
                }

                async delete(ior, config) {
                    UcpDomainEntityLoader.objectStore.remove(ior.iorUniquePath);
                    let result = await this.client(ior).delete(ior, config.data, {}, true);
                    return result;
                }

                load(ior, force = false) {

                    const iorStoreString = ior.iorUniquePath;
                    // Shortcut to get already Loaded Object in Sync Mode
                    if (ONCE.mode !== Once.MODE_NODE_SERVER) {
                        let storedObject = UcpDomainEntityLoader.objectStore.lookup(iorStoreString);
                        if (storedObject) return storedObject;
                    }

                    let loadingPromiseHandler = Thinglish.createPromise();
                    let asyncLoader = async () => {

                        // Create Security Context
                        let securityContext;
                        if (ONCE.mode == Once.MODE_NODE_SERVER) {
                            securityContext = await ior.getSecurityContext();
                            //await securityContext.ucpModel;
                            let readAccess = securityContext.hasRole('ANY');
                            if (!readAccess) {
                                let error = new Error('Access Denied');
                                error.httpCause = 403;
                                throw error;
                            }
                        }

                        if (!force) {
                            // The duplicate lookup is needed because of the async.. First lookup is sync, second async
                            const exists = UcpDomainEntityLoader.objectStore.lookup(iorStoreString);
                            if (exists) {
                                const storedObject = await exists;
                                if (storedObject) {
                                    if (ONCE.mode == Once.MODE_NODE_SERVER) {
                                        if (storedObject.securityContext && storedObject.securityContext !== securityContext && storedObject.securityContext.sessionManager != securityContext.sessionManager && storedObject.securityContext.sessionManager.userId != securityContext.sessionManager.userId) {
                                            throw new Error("Wrong securityContext! ");
                                        }
                                        if (securityContext) storedObject.securityContext = securityContext;
                                        storedObject.IOR = ior;
                                    }
                                    return storedObject;
                                }
                            }
                        }


                        let internalLoader = async () => {
                            //@todo search for existing Client with the path
                            const client = await this.client(ior);
                            let ucpDomainEntity = await client.load(ior);

                            if (!ucpDomainEntity?.iorId) {
                                return undefined;
                            }

                            //if (!ucpDomainEntity.iorId) throw new Error("No entityIOR in the ucpDomainEntity data structure",ucpDomainEntity);
                            if (!ucpDomainEntity.objectIor) throw new Error("No objectIor in the ucpDomainEntity data structure", ucpDomainEntity);
                            if (!ucpDomainEntity.version) throw new Error("No version in the ucpDomainEntity data structure", ucpDomainEntity);
                            if (!ucpDomainEntity.particle) throw new Error("No particle in the ucpDomainEntity data structure", ucpDomainEntity);


                            // Load Type
                            let objectIor = new IOR().init(ucpDomainEntity.objectIor);
                            let ucpComponentClass = await objectIor.load();

                            let ucpComponent = await ucpComponentClass.getInstance();
                            await ucpComponent.init();
                            await ucpComponent.ucpModel;
                            if (ONCE.mode === Once.MODE_NODE_SERVER && securityContext) ucpComponent.securityContext = securityContext;

                            await ucpComponent.initUcpDomainEntity({ 'ior': ior, initData: ucpDomainEntity });

                            if (client.sessionManager && typeof client.sessionManager.addLoadedObject == 'function') {
                                client.sessionManager.addLoadedObject(ucpComponent);
                            }

                            return ucpComponent;
                        }

                        let storePromise = internalLoader();
                        UcpDomainEntityLoader.objectStore.register(iorStoreString, loadingPromiseHandler.promise);
                        let ucpComponent = await storePromise;
                        return ucpComponent;
                    }
                    let loadingPromise = asyncLoader();
                    loadingPromise.then(ucpComponent => {
                        loadingPromiseHandler.setSuccess(ucpComponent);
                    }).catch(e => {
                        loadingPromiseHandler.setError(e);
                    })

                    return loadingPromiseHandler.promise;

                }


                namespace2path(namespace) {
                    logger.error("Not yet Implemented", namespace);
                }
                path2namespace(namespace) {
                    return null;
                }
            });



        ONCE.global.UcpDomainEntityDBLoader = Namespace.declare("tla.EAM.layer3.OnceServices",
            class UcpDomainEntityDBLoader {
                static get implements() {
                    return [Loader, Client];
                }

                static canConnect(urlObject) {
                    if (ONCE.mode !== "nodeServer") return 0;
                    if (urlObject.protocol.hasProtocol('ude')) {
                        if (!urlObject.origin) return 1;
                        if (urlObject.hostName == 'localhost') return 1;
                        if (urlObject.hostName == ONCE.ENV.ONCE_DEFAULT_HOST) return 1;
                    }
                    return 0;
                }

                static canLoad(urlObject) {
                    // @ToDo Need to be enhanced if Once Client and Server are merged
                    return 0;
                    if (ONCE.mode !== "nodeServer") return 0;
                    if (urlObject.protocol.hasProtocol('ude')) {
                        if (!urlObject.origin) return 1;
                        if (urlObject.hostName == 'localhost') return 1;
                        if (urlObject.hostName == ONCE.ENV.ONCE_DEFAULT_HOST) return 1;
                    }
                    return 0;
                }

                static clearObjectStore() {
                    this._private.store = {};
                }

                static createNewPath(server) {
                    server = server || ONCE.ENV.ONCE_LOCAL_SERVER;
                    return 'ior:ude:rest:' + server + '/ior/' + UUID.uuidv4();
                }

                init(path) {
                    //this.type = { class: { name: 'UcpDomainEntityLoader' } }
                    this._private = this._private || {};
                    this.type.class.instanceStore.register(0, this);

                    return this;
                }


                async _getIorId4Alias(alias, throwError = false) {

                    let result = await ONCE.DBClient.query(`select ior from ucp_domain_entity_alias where alias_ior = $1`, [alias]);
                    if (result.rowCount > 0) {
                        return result.rows[0].ior;
                    }
                    if (throwError) {
                        let error = new Error("No Domain Entity Found for IOR ID " + alias);
                        error.httpCause = 404;
                        throw error;
                    }
                    return undefined;
                }

                // config = {data, ucpComponent}
                async create(ior, config) {
                    // @ToDo Check if ior already exists

                    if (!config.particle) throw new Error("Empty particle is not allowed")
                    let insertSQL = `INSERT INTO ucp_domain_entity 
                                                (ior_id, "type", "version",predecessor_version, object_ior, "time", particle) VALUES 
                                                ($1,$2,$3,'{}',$4,$5,$6)`;

                    var iorId = ior.id;
                    var alias = [iorId];
                    if (!UUID.isUuidv4(ior.id)) {
                        iorId = UUID.uuidv4();
                        alias.push(iorId);
                    }

                    let existingAlias = await ONCE.DBClient.query('select * from ucp_domain_entity_alias where alias_ior = ANY($1::varchar[])', [alias]);

                    if (existingAlias.rowCount > 0) {
                        let error = new Error("Alias already exists!");
                        error.httpCause = 409;
                        throw error;
                    }

                    for (let key of alias) {
                        await ONCE.DBClient.query('INSERT INTO ucp_domain_entity_alias VALUES ($1,$2)', [iorId, key]);
                    }
                    await ONCE.DBClient.query(insertSQL, [iorId, 'Entity', config.version, config.objectIor, config.time, config.particle]);
                    return config;
                }

                async update(ior, config) {

                    if (!config.particle) {
                        throw new Error("Empty particle is not allowed")
                    }

                    let iorId = await this._getIorId4Alias(ior.id, true);

                    let insertSQL = `INSERT INTO ucp_domain_entity 
                                                (ior_id, "type", "version", predecessor_version, object_ior, "time", particle) VALUES 
                                                ($1,$2,$3,$4,$5,$6,$7)`;
                    await ONCE.DBClient.query(insertSQL, [iorId, 'Entity', config.version, config.predecessorVersion, config.objectIor, config.time, Thinglish.serialize2IORDataStructure(config.particle)]);
                    return config;
                }

                async load(ior) {
                    return await this.retrieve(ior);
                }

                async retrieve(ior) {
                    let iorId = await this._getIorId4Alias(ior.id, true);

                    let selectSql = `select * from ucp_domain_entity 
                                                where ior_id = $1 order by "time" desc limit 1`;
                    let res = await ONCE.DBClient.query(selectSql, [iorId]);


                    if (res.rowCount) {
                        let line = res.rows[0];
                        let result = {
                            iorId: line.ior_id,
                            type: line.type,
                            version: line.version,
                            predecessorVersion: line.predecessor_version,
                            objectIor: line.object_ior,
                            time: line.time,
                            particle: line.particle
                        }
                        return result;
                    } else {
                        return {};
                    }
                }

                async delete(ior, config) {
                    let iorId = await this._getIorId4Alias(ior.id, true);

                    await ONCE.DBClient.query('delete from ucp_domain_entity where ior_id = $1', [iorId]);
                    await ONCE.DBClient.query('delete from ucp_domain_entity_alias where ior = $1', [iorId]);

                    return { status: 'ok' };
                }

                namespace2path(namespace) {
                    logger.error("Not yet Implemented", namespace);
                }
                path2namespace(namespace) {
                    return null;
                }
            }
        );

        ONCE.global.WeBeanLoader = Namespace.declare("tla.EAM.layer3.OnceServices",

            class WeBeanLoader {
                static get implements() {
                    return [Loader];
                }
                static get WeBeanDir() {
                    return "/src/html/weBean";
                }
                static get WeBeanTemplateExtension() {
                    return ".weBean.html";
                }
                static canLoad(urlObject) {
                    if (!urlObject.fileName) {
                        return 0;
                    }
                    if (urlObject.fileName && urlObject.fileName.endsWith(WeBeanLoader.WeBeanTemplateExtension)) {
                        return 1;
                    }
                    return 0;
                }

                init(path) {
                    //this.type = { class: { name: 'UcpDomainEntityLoader' } }
                    this._private = this._private || {};
                    this.type.class.instanceStore.register(0, this);

                    return this;
                }

                async load(iorObject) {

                    const storedObject = this.staticStore.lookup(iorObject);
                    if (storedObject) {
                        return await storedObject;
                    }

                    const iorLoadingPromise = Thinglish.createPromise();
                    this.staticStore.register(iorObject, iorLoadingPromise.promise);


                    let href = iorObject.normalizeHref;

                    if (ONCE.mode === Once.MODE_NODE_SERVER) {
                        if (href.startsWith('/')) href = ONCE.ENV.ONCE_DEFAULT_URL + href;
                    }
                    const response = await fetch(href);
                    if (response.ok) {
                        const type = response.headers.get('Content-Type');

                        const result = (/json/i.test(type)) ? response.clone().json() : response.text()
                        iorLoadingPromise.setSuccess(result);
                        this.staticStore.register(iorObject, result);
                        return result;
                    } else {

                        iorLoadingPromise.setError();
                        this.staticStore.remove(iorObject);
                        logger.error('Http Fehler', response);
                        throw new Error(`Error during loading of WeBean ${href}: ${(await response.text())}`);

                    }


                }

                namespace2path(namespace) {
                    logger.error("Not yet Implemented", namespace);
                }
                path2namespace(namespace) {
                    return null;
                }
            }
        );


        ONCE.global.EAMDucpLoader = Namespace.declare("tla.EAM.layer3.OnceServices",
            class EAMDucpLoader {
                static get implements() {
                    return [Loader];
                }
                static get EAMDucpDir() {
                    return "/EAMD.ucp";
                }
                static get EAMDcomponentDir() {
                    return EAMDucpLoader.EAMDucpDir + "/Components";
                }
                static get JSdir() {
                    return "/src/js";
                }
                static get DefaultClass() {
                    return ".class.js";
                }
                static get ComponentXML() {
                    return ".component.xml";
                }
                static get ControllerExtension() {
                    return ".controller.class.js";
                }

                static path2namespace(path) {
                    if (!path) return "";

                    var EAMDcomponentDir = EAMDucpLoader.EAMDcomponentDir + "/";
                    var index = path.indexOf(EAMDcomponentDir);
                    if (index >= 0) {
                        index += EAMDcomponentDir.length;
                        path = path.substring(index);
                    }

                    // var index = path.indexOf(WeBeanLoader.WeBeanJsDir + "/");
                    // if (index > 0) {
                    //     path = path.substring(0, index);
                    // }

                    var paths = path.split("/");
                    if (path.endsWith(EAMDucpLoader.ComponentXML)) {
                        paths = paths.slice(0, -1);
                    }

                    var namespace = null;
                    var name = null;

                    for (var i in paths) {
                        name = paths[i];
                        var index = name.indexOf(".");
                        if (index > 0) {
                            // is version
                            // var version = new Version().init(name);
                            name = name.replace(/\./g, "_");
                            namespace += "." + name;
                            name = paths[paths.length - 2];
                            //get the Name before the version
                            //                break; //skip version
                        }
                        if (namespace)
                            namespace += "." + name;
                        else
                            namespace = name;
                    }
                    namespace = namespace.replace(/^Namespaces\./, "");
                    return namespace;
                }

                static canLoad(urlObject) {
                    if (!urlObject.href) {
                        return 0;
                    }
                    const reg = new RegExp(EAMDucpLoader.EAMDcomponentDir + '/(.*)/[\\w\\-]*' + EAMDucpLoader.ComponentXML);
                    if (urlObject.href.match(reg)) {
                        return 1;
                    }
                    if (urlObject.protocol.hasProtocol('ior') && urlObject.protocol.hasProtocol('local')) {
                        return 0.95;
                    }
                    return 0;
                }

                static storeObject(object) {
                    this._private = this._private || {};
                    this._private[object.url] = object;
                }
                static loockupObject(url) {
                    this._private = this._private || {};
                    return this._private[url];
                }

                init(ior) {
                    this.type.class.instanceStore.register(0, this);
                    this.parse(ior);
                    return this;
                }


                path2namespace(path) {
                    return this.constructor.path2namespace(path);
                }
                constructor() {
                    //super();
                    //ONCE.global.EAMDucpLoaderSingleton = this;
                }

                getJsFile(ior, config) {
                    let jsFileName = ior.basePath;
                    jsFileName += EAMDucpLoader.JSdir + "/";
                    jsFileName += config.domainObjectName
                    //jsFileName += ior.fileName.split('.')[0];
                    jsFileName += EAMDucpLoader.DefaultClass;

                    return jsFileName;
                }

                static dependencyLoopDetection(usedByClass, dependencyUrlObject) {
                    this._private = this._private || {};
                    this._private.dependencyStore = this._private.dependencyStore || {};
                    let classUrl = usedByClass?.IOR?.normalizeHref || 'Unknown';
                    this._private.dependencyStore[classUrl] = this._private.dependencyStore[classUrl] || {};

                    if (!this._private.dependencyStore[dependencyUrlObject.normalizeHref]) {
                        this._private.dependencyStore[dependencyUrlObject.normalizeHref] = {};
                    }

                    this._private.dependencyStore[classUrl][dependencyUrlObject.normalizeHref] = this._private.dependencyStore[dependencyUrlObject.normalizeHref];

                    const detectLoop = function (object, urlList = []) {
                        if (typeof object === "string") return;
                        for (const [key, value] of Object.entries(object)) {
                            if (urlList.includes(key)) {
                                urlList.push(key);
                                throw new Error('Dependency loop detected! \n' + urlList.join(' -> \n'));
                            }
                            urlList.push(key);
                            detectLoop(value, urlList)
                            urlList.pop();
                        }
                    }

                    detectLoop(this._private.dependencyStore[classUrl]);
                }

                async load(ior, config) {
                    ior = IOR.isIOR(ior);
                    // try to load from staticStore
                    const storedObject = this.staticStore.lookup(ior);
                    if (Thinglish.isPromise(storedObject)) {
                        EAMDucpLoader.dependencyLoopDetection(config?.usedByClass, ior);
                    }
                    // EAMDucpLoader.loading.push((config?.usedByClass?.IOR?.url || 'NaN') + ' --> ' + ior.url);
                    if (storedObject) {
                        logger.info("Wait for Loading of " + ior.normalizeHref)
                        return await storedObject;
                    }

                    const iorLoadingPromise = Thinglish.createPromise();

                    this.staticStore.register(ior, iorLoadingPromise.promise);

                    try {

                        // if (ior.class) {
                        //     //@todo tidy up! objet is an IOR...always???
                        //     return ior.class;
                        // }

                        //let path = null;

                        // @ToDo To be removed after migration
                        if (Thinglish.lookupInObject(ior, "type.name") === "IOR") {
                            logger.error("Use IOR.getInstance().init instead of new IOR().init!");
                            ior = IOR.getInstance().init(ior.url);
                        }
                        //let scriptInfo = null;
                        let jsFile = null;
                        const iorConfig = this.parse(ior);
                        //if (this.parse(ior)) {
                        jsFile = Url.getInstance().init(this.getJsFile(ior, iorConfig));
                        let client = Client.findClient(jsFile);
                        if (!client) return null;
                        let scriptInfo = await client.load(jsFile);
                        //}
                        ///// IMPORTANT!!!
                        // this was reused by multiple other ior after await
                        // ior is still the same but all values in this are from the last reused script
                        // IT IS IMPORTANT to repare the ior for correct values
                        let aClass = null;

                        //if (this.parse(ior)) {
                        let className = iorConfig.domainObjectName;
                        scriptInfo.mainClassTypeName = this.path2namespace(ior.pathName);

                        if (scriptInfo.mainClassTypeName) {
                            aClass = Namespaces.lookup(scriptInfo.mainClassTypeName);
                        }


                        // Check if is is an Interface
                        aClass = aClass || ONCE.global[className];
                        if (aClass) {
                            // logger.warn("#### SCRIPTINFO setting scriptInfo.script.mainClass: ",aClass.name,"on script",aClass.scriptInfo.script.src);
                            aClass.scriptInfo.script.mainClassTypeName = scriptInfo.mainClassTypeName;
                            aClass.scriptInfo.script.mainClass = aClass;
                        }

                        if (Interface.isInterface(aClass)) {
                            const defaultClass = aClass.defaultImplementationClass;
                            if (Thinglish.isClass(defaultClass)) {
                                defaultClass.type.originalClass = aClass;
                                defaultClass.scriptInfo = aClass.scriptInfo;
                                defaultClass.scriptInfo.script.mainClass = defaultClass;
                                // logger.warn("#### SCRIPTINFO setting scriptInfo.script.mainClass: ",defaultClass.name,"on script",defaultClass.scriptInfo.script.src);
                                aClass = defaultClass;
                            }
                        }

                        if (aClass) {
                            let ownIOR = Object.getOwnPropertyDescriptor(aClass, "IOR");
                            if (!ownIOR) {
                                Object.defineProperty(aClass, "IOR", { "value": ior, "writable": true, "enumerable": true, "configurable": true });
                            }

                            logger.info({
                                level: "debug",
                                category: "LOADER"
                            }, "declared " + aClass.package + " loaded from " + jsFile.href);
                        } else {
                            logger.warn('script loaded but class not found: ' + jsFile.href);
                            return null;
                        }

                        aClass.namespace.script = scriptInfo.script;

                        //}

                        if (aClass.isStarted === false) {
                            try {
                                await EAMDucpLoader.initComponent(aClass, config);
                            } catch (err) {
                                logger.error(`Fail to initComponent ${aClass.name}`, err);
                            }
                        }

                        iorLoadingPromise.setSuccess(aClass);
                        this.staticStore.register(ior, aClass);

                        return aClass;
                    } catch (err) {
                        this.staticStore.remove(ior);
                        throw err;
                    }
                }

                parse(ior) {
                    ior = IOR.isIOR(ior);
                    if (!ior)
                        return false;

                    let config = {};

                    // let fileName = ior.fileName;
                    // let extensions = fileName.split(".");
                    config.domainObjectName = ior.fileName.split(".").shift();
                    // let folders = ior.pathName.split("/");
                    // let file = folders.pop();
                    // if (file == fileName) {
                    //     let versionFolder = folders.pop();
                    //     if (Namespace.isVersionName(versionFolder)) {
                    //         config.version = Version.parse(versionFolder);
                    //         config.versionNamespace = config.version.versionNamespace;
                    //         config.versionNumber = config.version.versionNumber;
                    //     }
                    //     folders.push(versionFolder);
                    //     config.path = folders.join("/");
                    // }
                    // else {
                    //     folders.push(file);
                    //     config.path = folders.join("/");
                    // }
                    // if (ior.origin == '') {
                    //     config.origin = ior.defaultOrigin;
                    //     config.localOrigin = ior.localFileOrigin;
                    // }
                    // config.basePath = ior.basePath;
                    // config.localHref = config.localOrigin + ior.pathName;
                    // config.normalizeHref = config.origin + ior.pathName;


                    return config;
                }

                get basePath() {
                    throw new Error("Refactor: Do not use the basePath of the Loader. Use the basePath of the IOR instead")
                }

                get baseUrl() {
                    throw new Error("Refactor: Do not use the baseUrl of the Loader. Use the origin of the IOR instead or the basePath")
                }

                namespace2path(namespace) {
                    logger.error("Not yet Implemented", namespace);
                }

                static async initComponent(aClass, config) {
                    const usedByClass = config?.usedByClass;

                    // logger.info("Loading ", ior.url);
                    // logger.info("   using loader ", ior.loader.name);
                    // let aClass = await ior.load();

                    //logger.log("   loaded: ", aClass.name);

                    let name = aClass.name ? aClass.name : aClass.script.src;
                    logger.info("   loaded: ", name);
                    //aClass.type.usedBy = aClass.type.usedBy || [];


                    // if (ONCE.global.removeHack.findIndex(e => e.name === name) > -1) {
                    //     logger.warn("##### again in",aClass.name);
                    // }

                    if (!Thinglish.isClass(aClass)) {
                        Once.scriptInfo.otherScripts = Once.scriptInfo.otherScripts || [];
                        let scriptInfo = aClass;
                        Once.scriptInfo.otherScripts.push(scriptInfo);

                        scriptInfo.usedBy = scriptInfo.usedBy || [];
                        scriptInfo.usedBy.push(usedByClass.IOR.pathName);
                        logger.log("   loaded script: ", scriptInfo.script.src);
                        return scriptInfo;
                    }
                    if (usedByClass) {
                        aClass.type.usedBy.push(usedByClass.IOR.pathName);
                    }

                    let descriptor = aClass.type.ucpComponentDescriptor;
                    if (descriptor) {
                        logger.debug("   prevented loading twice:", aClass.name, "used by:", usedByClass?.name);
                        return aClass;
                    }

                    if (aClass.isLoadingDepencencies === true) {
                        logger.warn("   dependency LOOP detected on:", aClass.name, "used by:", usedByClass?.name, "used by:", usedByClass.type.usedBy);
                        return aClass;
                    }

                    if (typeof UcpComponent !== "undefined")
                        UcpComponent.type.usedBy.push(aClass.IOR.pathName);

                    //logger.info("      now loading dependencies: ", aClass.name, aClass.dependencies);
                    await EAMDucpLoader.loadAndStartAll(aClass);
                    //logger.info("      loaded all dependencies: ", aClass.name, aClass.dependencies);

                    await EAMDucpLoader.loadDescriptor(aClass);

                    await EAMDucpLoader.initUnits(aClass, usedByClass);


                    //await Thinglish.initWebeanUnits(aClass, ior);

                    let d = aClass.scriptInfo.script.declarationListPerScript || [];
                    //let d = aClass.scriptInfo.declarationListPerScript || [];
                    logger.info("starting classes", aClass.name, d.map(c => c.name));
                    let startResultsPromises = d.map(async aSubClass => {

                        // Adds IOR to Other UcpComponent Objects inside of the Component
                        if (!Object.getOwnPropertyDescriptor(aSubClass, "IOR")) {
                            Object.defineProperty(aSubClass, "IOR", { "value": aClass.IOR, "writable": true, "enumerable": true, "configurable": true });
                        }

                        let startResult = await EAMDucpLoader.startClass(aSubClass);
                        return { aSubClass, startResult }
                    });
                    let startResults = await Promise.all(startResultsPromises);
                    aClass.type.startResults = startResults;

                    // Start Less Compile if required
                    //logger.error(usedByClass.name + ' = > ' + aClass.name + ' : ' + usedByClass.isStarted)
                    if ((!usedByClass || usedByClass.isStarted) && typeof LessSingleton !== "undefined") {
                        try {
                            await LessSingleton.compile();
                        } catch (err) {
                            logger.error("Error during Less compile: " + err.message, err);
                        }
                    }

                    return aClass;
                }

                static async startClass(aClass) {
                    if (!aClass) {
                        return false;
                    }

                    // if (Interface.isInterface(aClass) && aClass.defaultImplementationClass) {
                    //     aClass = aClass.defaultImplementationClass;
                    // }

                    var className = aClass;
                    if (aClass.type) {
                        className = aClass.type.name;
                    } else if (aClass.name) {
                        className = aClass.name;
                    }
                    logger.debug({
                        level: "debug",
                        category: "ONCE"
                    }, "ALL dependencies loaded for ", className);

                    let ownStartPD = Object.getOwnPropertyDescriptor(aClass, "start");
                    if (aClass.start) {
                        if (ownStartPD) {
                            let ownIsStarted = Object.getOwnPropertyDescriptor(aClass, "isStarted");
                            if (!ownIsStarted) {
                                Object.defineProperty(aClass, "isStarted", { "value": false, "writable": true, "enumerable": true, "configurable": true });
                            }
                        }
                        if (aClass.isStarted) {
                            //                    logger.debug("   already started "+aClass.name+" ...");
                            return aClass.startResult;
                        }
                        //aClass.hasStartFunction = true;
                        logger.info({
                            level: "info",
                            category: "ONCE"
                        }, "starting ", className);

                        let result;
                        if (aClass !== Once) {
                            result = await aClass.start();
                        } else {
                            result = true;
                        }
                        aClass.startResult = result;
                        if (result !== false) aClass.isStarted = true;

                    }
                    //aClass.hasStartFunction = false;
                    logger.debug({
                        level: "info",
                        category: "ONCE"
                    }, className, "does not have a start function!");
                    return false;

                }

                static async loadDescriptor(aClass) {
                    let descriptor = {
                        name: "Not loaded Descriptor " + aClass.name + ".component.xml",
                        class: aClass,
                        IOR: aClass.IOR,
                        units: [],
                        runtimeUnits: [],
                        webBeanUnits: [],
                        uses: [],
                        usedBy: [],
                        isDescriptorLoaded: false
                    };
                    if (ONCE.global.DefaultUcpComponentDescriptor && Thinglish.isClass(aClass)) {
                        if (!aClass.type.ucpComponentDescriptor) {
                            //if (aClass.overwriteServerDescriptor) {
                            descriptor = DefaultUcpComponentDescriptor.getLocalDescriptor(aClass, aClass.webBeanUnits);
                            aClass.type.ucpComponentDescriptor = descriptor;
                            aClass.scriptInfo.script.mainClass.type.ucpComponentDescriptor = descriptor;
                            // aClass.scriptInfo.script.ucpComponentDescriptor = descriptor;
                            //} else {
                            //    descriptor = await ONCE.global.UcpComponentSupport.DefaultUcpComponentRepository.loadDescriptorFromStructr(aClass);
                            //}
                        } else {
                            descriptor = aClass.type.ucpComponentDescriptor;
                            return descriptor;
                        }
                    } else {
                        logger.log({
                            level: "warn",
                            category: "BOOTING"
                        }, "cannot load Descriptor for ", aClass.name, " because UcpComponent is not yet ready");
                        //let getter = async function() {
                        //    return await Thinglish.loadDescriptor(this.class,this.class.IOR);
                        //}
                        //Thinglish.defineAccessors(aClass.type, "ucpComponentDescriptor", getter.bind(aClass.type), null);
                        aClass.type.ucpComponentDescriptor = descriptor;
                        return descriptor;
                    }

                    if (descriptor && descriptor.isDescriptorLoaded) {
                        if (this.level >= DefaultLogger.LEVELS["debug"]) logger.log({ level: "debug", category: "ONCE" }, "Descriptor loaded for ", descriptor.model.path, descriptor);
                        //return descriptor.getDependencyDiff();
                        return descriptor;
                    } else {
                        logger.log({
                            level: "warn",
                            category: "DESCRIPTOR"
                        }, "Descriptor not found for:", ior.descriptorPath);
                    }
                    // no dependencies
                    return descriptor;

                }

                static async loadAndStartAll(aClass, IORList) {
                    if (!IORList && !aClass.dependencies) {
                        logger.info("no dependencies to looad for ", aClass.name);
                        return null;
                    }
                    IORList = IORList || aClass.dependenciesGroups || aClass.dependencies;

                    const mapFunction = (value) => {
                        if (Array.isArray(value)) {
                            return value.map(e => IOR.isIOR(e, true))
                        }
                        return [IOR.isIOR(value, true)]
                    }

                    let IORsGroups = IORList.map(mapFunction);

                    aClass.isLoadingDepencencies = true;
                    for (let group of IORsGroups) {
                        let promiseList = [];
                        for (let ior of group) {
                            promiseList.push(ior.load({ usedByClass: aClass }));
                        }

                        try {
                            let promiseResultList = await Promise.all(promiseList);
                            aClass.type.uses = [...aClass.type.uses, ...promiseResultList];
                        } catch (err) {
                            logger.error(err, aClass);
                        }
                    }
                    aClass.isLoadingDepencencies = false;
                    logger.info("all dependencies loaded for", aClass.name);
                  let usedByClass = {};
                  
                    
                  //await EAMDucpLoader.loadDescriptor(aClass);
                  //await EAMDucpLoader.initUnits(aClass, usedByClass);

                    return aClass;

                }

                static async initUnits(aClass) {
                    let unitList = [];

                    if (typeof aClass.discoverUnits === 'function') {
                        unitList = aClass.discoverUnits();
                    }
                    if (!Array.isArray(unitList)) {
                        throw new Error("Expect a Array of Units. Got: " + unitList);
                    }

                    let descriptor = Thinglish.lookupInObject(aClass, "type.ucpComponentDescriptor");
                    if (descriptor) {
                        descriptor.units = unitList;
                    }


                    // Load Style Units
                    if (ONCE.mode !== Once.MODE_NODE_SERVER) {
                        this.initLegacyWeBeansPathsList(aClass, unitList);

                        if (aClass.isWebComponentTemplate) {
                            await aClass.getInstance().init().defaultView.getWeBean();
                        }

                        for (const unit of unitList.filter(u => u.model.type === Unit.TYPE.VIEW_CLASS)) {
                            if (unit.model.class.discoverUnits) {
                                // if (unit.model.class.isWebComponentTemplate) {
                                //   await aClass.getInstance().init().defaultView.getWeBean();
                                // }
                                for (let styleUnit of unit.model.class.discoverUnits().filter(u => [Unit.TYPE.LESS, Unit.TYPE.CSS].includes(u.model.type))) {
                                    await styleUnit.targetIOR.load();
                                }
                            }
                        }
                    }


                }

                static async initLegacyWeBeansPathsList(aClass, unitList) {
                    if (ONCE.global.Unit) {

                        let weBeanUnitList = unitList.filter(unit => unit.data.type === Unit.TYPE.WE_BEAN);
                  
                        if (weBeanUnitList.length > 0) {
                          if (weBeanUnitList.length > 1) logger.warn("Have more then one WeBean. Use only the First one.", this.name, weBeanUnitList);
                          weBeanUnitList.forEach(async weBean => {
                            let textTemplate = await weBean.targetIOR.load();
                            if (textTemplate instanceof Error) {
                              throw new Error("Failed to load WeBean: " + weBean.targetIOR.href);
                            }
                            if (UcpComponentSupport.weBeanRegistry && typeof textTemplate === "string" ) {
                              let weBean = UcpComponentSupport.weBeanRegistry.register(textTemplate, aClass.controller);
                              logger.warn("Successfully registered WeBean", weBean.customTag,"for:", weBean.customClass.name);
                            }
                            else logger.warn("Could not register WeBean for",aClass.name,"\n  because UcpComponentSupport is not yet ready");
                          })
                  
  
                        }
                    }

                }

                //                 static async initWebeanUnits(aClass, ior) {
                //                     loaderContext.weBeanList = weBeanList;
                //                     if (loaderContext.interfaceClass && !loaderContext.aClass.type.ucpComponentDescriptor) {
                //                         loaderContext.aClass.type.ucpComponentDescriptor = loaderContext.interfaceClass.type.ucpComponentDescriptor;
                //                     }
                //                     var aClass = loaderContext.aClass;
                //                     if (Namespace.lookupInObject(aClass, "type.ucpComponentDescriptor.webBeanUnits") && loaderContext.aClass.overwriteServerDescriptor !== true) {
                //                         aClass.controller = new UcpController().init(aClass);
                //                         aClass.type.ucpComponentDescriptor.webBeanUnits.map(unit => {

                //                             aClass.controller.registerView(unit);
                //                         }
                //                         );
                //                     } else if (Array.isArray(weBeanList) && ONCE.global.UcpController) {
                //                         aClass.controller = new UcpController().init(aClass);
                //                         weBeanList.forEach(w => w.model = w);
                //                         aClass.type.ucpComponentDescriptor.webBeanUnits = weBeanList;
                //                         aClass.type.ucpComponentDescriptor.defaultWebBeanUnit = weBeanList[0];
                //                         aClass.type.ucpComponentDescriptor.isLocal = loaderContext.aClass.overwriteServerDescriptor;
                //                         weBeanList.map(unit => {

                //                             aClass.controller.registerView(unit);
                //                         }
                //                         );
                //                     }

                //                 }


            });

        let onceIOR = IOR.getInstance().init(Once.namespace.script.src)
        onceIOR.referencedObject = Once;
        Once.namespace.script.ior = onceIOR;
        Once.IOR = onceIOR;

        if (document) {
            const serverUrl = Url.getInstance().init(document.baseURI);
            serverUrl.pathName = '';
            ONCE.ENV = await Once.loadENV(Url.getInstance().init());
        }

        EAMDucpLoader.loadDescriptor(Once);



    }
    async initServersideOnce() {
        await this.initClientsideOnce()
        //ONCE.installationMode = Once.INSTALLATION_MODE_TRANSIENT;
        module.exports = ONCE;



        process.on('uncaughtException', function (err) {
            logger.error("Unhandled exception follows");
            logger.error(err, err.stack);
        })

        //const { once } = require('events');
        //const { resourceLimits } = require('worker_threads');
        //const { Z_BUF_ERROR } = require('zlib');

        ONCE.global.fetch = require('node-fetch');

        ONCE.global.url = require('url');
        ONCE.global.fs = require('fs');
        ONCE.global.os = require('os');
        ONCE.global.dns = require('dns');

        //ONCE.global.Joi = require('joi');


        const cors = require('cors');
        ONCE.global.WebSocketServer = require('ws').Server;

        //fs.realpath(".", (error, result) => { ONCE.startPath = result +"/" });
        //ONCE.startPath = fs.realpathSync(".")+"/";
        //ONCE.startPath = fs.realpathSync("./../..");

        Once.express = require('express');
        Once.express.serveIndex = require('serve-index');
        Once.expressBodyParser = require('body-parser')

        //let routes = require('./routes');
        //let user = require('./routes/user');
        Once.http = require('http');
        Once.https = require('https');

        // https://www.npmjs.com/package/express-http-to-https
        //Once.httpsForwarder = require('express-force-https');

        // https://www.npmjs.com/package/routes
        //Once.upload = require('./routes/upload');

        //let path = require('path');

        ONCE.experss = Once.express();

        // Add Body parser for json
        ONCE.experss.use(cors());
        ONCE.experss.use(Once.expressBodyParser.json());
        ONCE.experss.use(Once.REPOSITORY_ROOT, Once.express.serveIndex(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT));
        ONCE.experss.use(Once.REPOSITORY_ROOT, Once.express.static(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT));



        ONCE.jwt = require('jsonwebtoken');


        const session = require('express-session');
        const Keycloak = require('keycloak-connect');
        const memoryStore = new session.MemoryStore();

        ONCE.keycloakServerConnector = new Keycloak({
            store: memoryStore,
        });

        // ONCE.experss.use(session({
        //     secret: 'mySecret',
        //     resave: false,
        //     saveUninitialized: true,
        //     store: memoryStore
        // }));


        // ONCE.experss.use(ONCE.keycloakServerConnector.middleware({
        //     logout: '/logout',
        //     admin: '/auth'
        // }));
        ONCE.experss.get('/', ONCE.handleHTTPRequest); // 
        ONCE.experss.get('/test', ONCE.handleHTTPRequest); // 
        ONCE.experss.get('/woda', ONCE.handleHTTPRequest); // 
        ONCE.experss.get('/once', ONCE.handleHTTPRequest); // 

        ONCE.experss.get('/once/env', ONCE.handleHTTPRequest); // 
        ONCE.experss.get('/once/mocha/getMochaTestToken/*', ONCE.getMochaTestToken); // 

        // Required for testing
        ONCE.experss.get('/once/clearUDECash', async (request, response) => {
            request.sessionManager = await ServerSideKeycloakSessionManager.factory(request)
            if (request.sessionManager.username.match(/^mocha\d$/)) {
                UcpDomainEntityLoader.staticStore.registry = {};
                response.status(200);
                response.write('ok');
            } else {
                response.status(401);
                response.write('No Access');
            }

            response.end();
        });

        ONCE.experss.use('/ior/*', ONCE.handleIORRestRequest); // ONCE.keycloakServerConnector.protect(),
        ONCE.experss.use('/once/findUde/*', ONCE.handleUdeFind); // ONCE.keycloakServerConnector.protect(),

        ONCE.experss.all('/q-nnect/*', ONCE.forwardHTTPRequest.bind({ apiUrl: ONCE.ENV.ONCE_Q_SERVER || "https://qworld-woda.q-nnect.com", prefix: "/q-nnect" }));
        // ONCE.keycloakServerConnector.protect('realm:admin'), 



        // Setup Mail
        const OnceMailer = require("./OnceMailer")
        ONCE.mailer = new OnceMailer()


        // Setup local DB
        const { Client } = require('pg');


        const connectionString = ONCE.ENV.ONCE_POSTGRES_CONNECTION_STRING || `postgresql://root:qazwsx123@192.168.178.198:5433/oncestore`;

        ONCE.DBClient = new Client({ connectionString: connectionString });
        await ONCE.DBClient.connect(err => {
            if (err) {
                logger.error('connection error', err.stack);
            } else {
                logger.log('Local DB connected');
            }
        });

        ONCE.PGquery = function (queryString, values) {

            let promiseHandler = Thinglish.createPromise();

            ONCE.DBClient.query(queryString, values, (err, res) => {
                if (err) promiseHandler.setSuccess(err);
                promiseHandler.setSuccess(res);
            });
            return promiseHandler.promise;
        }



        ONCE.experss.enable('trust proxy');
        //ONCE.experss.use(ONCE.experss.favicon());
        //ONCE.experss.use(ONCE.experss.logger('dev'));

        // https://www.npmjs.com/package/express-fileupload
        //ONCE.experss.post('/upload', Once.upload.s3);

        //ONCE.experss.use(Once.express.errorHandler());
        /* https://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
            ONCE.experss.get("*", function (req, res, next) {
                var host = req.get('Host');
                // replace the port in the host
                host = host.replace(/:\d+$/, ":"+app.get('port'));
                // determine the redirect destination
                var destination = ['https://', host, req.url].join('');
                return res.redirect(destination);
     
                //res.redirect("https://" + ONCE.httpsPort + "/" + req.path);
            });
            */
        //ONCE.experss.use(Once.httpsForwarder);




        ONCE.servers = [];
        ONCE.sockets = [];
        let httpsServer = null;
        /*
            Once.REPOSITORY_HOSTS.forEach(host => {
                ONCE.startServer(host);
            });
            */
        let dynamicPort = await ONCE.startServer("http://localhost:" + ONCE.dynamicPort, ONCE.dynamicPort);
        try {
            const httpsOptions = {
                key: fs.readFileSync(path.join(ONCE.ENV.ONCE_DEFAULT_SCENARIO, "once.key.pem")),
                cert: fs.readFileSync(path.join(ONCE.ENV.ONCE_DEFAULT_SCENARIO, "once.cert.pem"))
                //pfx: fs.readFileSync(path.join(ONCE.basePath, "localhost.pfx"))
            };
            /** @type {module:https.Server} httpsServer */
            httpsServer = Once.https.createServer(httpsOptions, ONCE.experss).listen(ONCE.httpsPort, function () {
                logger.log('ONCE HTTPS server listening on port ' + ONCE.httpsPort);
            });
            httpsServer.addListener('connection', (socket)=>{
                ONCE.sockets.push(socket);
            })
            ONCE.servers.push(httpsServer);

            ONCE.wss = new WebSocketServer({
                server: httpsServer,
                perMessageDeflate: {
                    zlibDeflateOptions: {
                        // See zlib defaults.
                        chunkSize: 1024,
                        memLevel: 7,
                        level: 3
                    },
                    zlibInflateOptions: {
                        chunkSize: 10 * 1024
                    },
                    // Other options settable:
                    clientNoContextTakeover: true, // Defaults to negotiated value.
                    serverNoContextTakeover: true, // Defaults to negotiated value.
                    serverMaxWindowBits: 10, // Defaults to negotiated value.
                    // Below options specified as default values.
                    concurrencyLimit: 10, // Limits zlib concurrency for perf.
                    threshold: 1024 // Size (in bytes) below which messages
                    // should not be compressed.
                }
            });
            logger.log('Websocket Server Runns');

            ONCE.wss.on('connection', this.handleWebsocketConnection);

        } catch (error) {
            logger.log("Did not start HTTPS Server:", error);
        }
        if (httpsServer) {
            httpsServer.addListener('connection', (socket)=>{
                ONCE.sockets.push(socket);
            })
            ONCE.servers.push(httpsServer);
        }

        try {
            ONCE.wsHttp = new WebSocketServer({
                server: ONCE.servers[0],
                perMessageDeflate: {
                    zlibDeflateOptions: {
                        // See zlib defaults.
                        chunkSize: 1024,
                        memLevel: 7,
                        level: 3
                    },
                    zlibInflateOptions: {
                        chunkSize: 10 * 1024
                    },
                    // Other options settable:
                    clientNoContextTakeover: true, // Defaults to negotiated value.
                    serverNoContextTakeover: true, // Defaults to negotiated value.
                    serverMaxWindowBits: 10, // Defaults to negotiated value.
                    // Below options specified as default values.
                    concurrencyLimit: 10, // Limits zlib concurrency for perf.
                    threshold: 1024 // Size (in bytes) below which messages
                    // should not be compressed.
                }
            });
            ONCE.wsHttp.on('connection', this.handleWebsocketConnection);


        } catch (error) {
            logger.log("WebSocket Server did not start:", error);
        }

        //ONCE.server = http.createServer(ONCE.handleHTTPRequest);
        /*
            ONCE.server = Once.http.createServer(ONCE.experss);
            ONCE.server2 = Once.http.createServer(ONCE.experss);
            ONCE.server.on('error', error => {
                ONCE.state = Once.STATE_CRASHED;
                logger.error(error);
            });
     
            while (ONCE.state === Once.STATE_INITIALIZED || ONCE.autoRestart) {
                try {
                    ONCE.state = Once.STATE_STARTED;
                    ONCE.server.listen(parseInt(urls[0].port), () => {
                        logger.log("ONCE Server listening on ", urls[0].toString());
     
                        ONCE.server2.listen(8888, () =>
                            logger.log("ONCE Server2 listening on http://localhost:8888/")
                        );
     
                    });
                }
                catch (error) {
                    ONCE.state = Once.STATE_CRASHED;
                    logger.error(error);
                }
            }
            */

        //this.startCORSAnywhereproxy();
        this.startReverseProxy();


    }

    startReverseProxy() {
        try {
            // Reverse Proxy
            ONCE.reverseProxy = Once.express();
            ONCE.httpProxy = require('http-proxy');
            ONCE.apiProxy = ONCE.httpProxy.createProxyServer();
            ONCE.httpsApiProxy = ONCE.httpProxy.createProxyServer({
                ssl: {
                    key: fs.readFileSync(path.join(ONCE.ENV.ONCE_DEFAULT_SCENARIO, "once.key.pem")),
                    cert: fs.readFileSync(path.join(ONCE.ENV.ONCE_DEFAULT_SCENARIO, "once.cert.pem"))
                    //pfx: fs.readFileSync(path.join(ONCE.basePath, "localhost.pfx")),
                },
                secure: false
            });

            const rport = ONCE.ENV.ONCE_REV_PROXY_PORT || 5002;
            const rsport = ONCE.ENV.ONCE_REV_PROXY_HTTPS_PORT || 5005;
            const rhost = ONCE.ENV.ONCE_REV_PROXY_HOST || '0.0.0.0';

            logger.log("ProxyConfig1: ", ONCE.ENV.ONCE_REVERSE_PROXY_CONFIG);

            const getProxyConfig = () => {
                try {
                    return JSON.parse(ONCE.ENV.ONCE_REVERSE_PROXY_CONFIG) || [['auth', 'test.wo-da.de'], ['snet', 'test.wo-da.de']];
                } catch (e) {
                    //logger.error(e);
                    return [['auth', 'test.wo-da.de'], ['snet', 'test.wo-da.de']];
                }
            }

            const ProxyConfig = getProxyConfig();
            logger.log("ProxyConfig2: ", ProxyConfig);


            ProxyConfig.forEach(config => {
                ONCE.reverseProxy.all('/' + config[0] + '/*', function (req, res) {
                    logger.log('redirect ' + req.protocol + ":" + req.port + ": " + req.url + ' to ' + config[1]);
                    // ONCE.apiProxy.web(req, res, {
                    //     "target": `${req.protocol}://` + config[1]
                    // });
                    ONCE.httpsApiProxy.web(req, res, {
                        "target": `${req.protocol}://` + config[1]
                    });
                });
            });

            // ProxyConfig.forEach(config => {
            //     ONCE.reverseProxy.all('/' + config[0] + '/*', function (req, res) {
            //         logger.log('redirect ' + req.url + ' to ' + config[1]);
            //         ONCE.apiProxy.web(req, res, {
            //             "target": `${req.protocol}://`+config[1]
            //         });
            //         // ONCE.httpsApiProxy.web(req, res, {
            //         //     "target": `${req.protocol}://` + config[1]
            //         // });
            //     });
            // });


            ONCE.apiProxy.on('error', function (e) {
                logger.error("Error in http proxy call", e);
            });

            ONCE.httpsApiProxy.on('error', function (e) {
                logger.error("Error in https proxy call", e);
            });

            const httpsSrv = Once.https.createServer({
                key: fs.readFileSync(path.join(ONCE.ENV.ONCE_DEFAULT_SCENARIO, "once.key.pem")),
                cert: fs.readFileSync(path.join(ONCE.ENV.ONCE_DEFAULT_SCENARIO, "once.cert.pem"))
                //pfx: fs.readFileSync(path.join(ONCE.basePath, "localhost.pfx")),
            }, ONCE.reverseProxy);
            httpsSrv.addListener('connection', (socket)=>{
                ONCE.sockets.push(socket);
            })
            ONCE.servers.push(httpsSrv);

            httpsSrv.listen(rsport, rhost, () => {
                logger.log('Running reverse https proxy on ' + rhost + ':' + rsport);
            });
            const revProxy = ONCE.reverseProxy.listen(rport, rhost, () => {
                logger.log('Running reverse http proxy on ' + rhost + ':' + rport);
            });
            revProxy.addListener('connection', (socket)=>{
                ONCE.sockets.push(socket);
            })
            ONCE.servers.push(revProxy);
        } catch (error) {
            logger.log("Did not start Reverse Proxy:", error);
        }
    }

    async getMochaTestToken(request, response) {

        const user = request.originalUrl.split("/").pop();

        const config = JSON.parse(ONCE.ENV.ONCE_DEFAULT_KEYCLOAK_SERVER);
        let url = config.url + "/realms/master/protocol/openid-connect/token?";


        const params = new URLSearchParams();

        params.append("client_id", config.testClient.client_id);
        params.append("grant_type", 'password');
        params.append("client_secret", config.testClient.client_secret);
        params.append("scope", 'openid');
        params.append("username", user);
        params.append("password", 'Mocha-12345');

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        };
        let result, loginResult
        try {
            loginResult = await fetch(url, options,);
            result = await loginResult.text()
        } catch (err) {
            logger.error(err);
        }
        response.status(loginResult.status);

        response.write(result);
        response.end();

    }

    startCORSAnywhereproxy() {
        try {
            // CORS Proxy
            const originWhitelist = ['', 'localhost', 'test.wo-da.de'];

            const port = ONCE.ENV.ONCE_PROXY_PORT || 5001;
            const host = ONCE.ENV.ONCE_PROXY_HOST || '0.0.0.0';

            Once.corsAnywhere = require('cors-anywhere');

            // Create CORS Anywhere server
            const corsSrv = Once.corsAnywhere.createServer({
                originWhitelist: originWhitelist
            }).listen(port, host, () => {
                logger.log('Running CORS Anywhere on ' + host + ':' + port);
            }
            );
            corsSrv.addListener('connection', (socket)=>{
                ONCE.sockets.push(socket);
            })
            ONCE.servers.push(corsSrv);
        } catch (error) {
            logger.log("Did not start Proxy:", error);
        }
    }

    async handleWebsocketConnection(ws, req) {
        try {
            logger.log("Websocket Connected");
            let wsch = await WebSocketConnectionHandler.getInstance().init(ws, req);

            wsch.callbackOnMessage = UDECommunicationDispatcher.receiveAction.bind(UDECommunicationDispatcher);
            wsch.callbackOnSocketClose = UDECommunicationDispatcher.onWebsocketSocketClose.bind(UDECommunicationDispatcher);

            ws.isAlive = true;

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.send('CONNECTION_READY# Welcome to the ONCE Eco System');
        } catch (err) {
            ws.send("ERROR: " + err.message + err.stack);
            ws.close();
        }
    }

    async createSessionManagerFromRequest(request, response) {
        let url;
        if (!request.headers.authorization) {
            url = Url.getInstance().init(request.originalUrl);
            //if (!url.searchParameters.Authorization) return null;

        }
        try {

            let sessionManager = await ServerSideKeycloakSessionManager.factory(request);

            //let initResult = await sessionManager.initGrant(request, response);
            //if (initResult === true) {

            // let userInfo = await sessionManager.getUserInfo();
            // let profile = await sessionManager.getProfile();
            // sessionManager.hasRole('Shifter');

            return sessionManager;
            //}
            // if (initResult) {

            // }

        } catch (e) {
            console.warn("Unable to find the token in KC response ", request.session)
            //throw new Error(e)
            return null;
        }
        return null;

    }

    async handleUdeFind(request, response) {

        const formatQueryKey = (key) => {
            if (key.includes('.')) {
                const keyList = key.split('.');
                let result = keyList.shift();
                const last = keyList.pop();
                if (keyList.length > 0) result += `->'${keyList.join("'->'")}'`
                result += `->>'${last}'`
                return result
            } else {
                return key;
            }
        }

        try {
            request.sessionManager = await ONCE.createSessionManagerFromRequest(request, response);

            let userId = request.sessionManager?.userId;
            let userRoles = request.sessionManager?.userRoles;

            let data = request.body;

            let valueList = [];
            const ph = (value) => {
                valueList.push(value);
                return '$' + valueList.length;
            }

            if (!data.config?.type) throw new Error('Missing : config.type');
            const type = IOR.getInstance().init(data.config.type).iorUniquePath;
            if (!data.config.pagination) data.config.pagination = {};
            if (!data.config.pagination.size || Number.NaN(data.config.pagination.size)) data.config.pagination.size = 10;
            if (!data.config.pagination.page || Number.NaN(data.config.pagination.page)) data.config.pagination.page = 0;
            if (!data.comparator) data.comparator = [{ 'attributeName': 'time', 'order': 'desc' }];

            let queryArray = [];
            if (data.filter) {
                for (const [key, value] of Object.entries(data.filter)) {
                    if (!key.match(/^[\.\-\d\w]+$/) || key.match(/ /)) throw new Error(`Invalid Key ${key}`)
                    if (value.match(/[']/)) throw new Error(`Invalid value ${value}`)
                    queryArray.push(`${formatQueryKey(key)} ~ ${ph(value)}`)
                }
            }
            let queryString = queryArray.join(' and ');
            let queryStringInner = queryString ? ' and ' + queryString : '';

            queryString = queryString ? 'where ' + queryString : '';

            //valueList = [type, ...valueList, ...valueList]

            const allowedOrderBy = ['asc', 'desc', 'nulls', 'first', 'last'];
            let order = data.comparator.map(x => {
                if (!x.attributeName.match(/^[\.\_\-0-9a-zA-Z]+$/)) throw new Error(`Invalid attributeName ${x.attributeName}`)
                x.order.split(' ').forEach(v => { if (!allowedOrderBy.includes(v.toLowerCase())) throw new Error(`Invalid order Parameter ${v}`) })
                return ` ${formatQueryKey(x.attributeName)} ${x.order}`
            }).join(', ');

            let sql = `select udeExtern.* from (
                        select distinct on (ude.ior_id) udeAccessValidation(ude."version" ,null , ${ph(userId)}, ${ph(userRoles)}, ARRAY[]::text[]) as access_right, * 
                        from ucp_domain_entity ude join (
                            select distinct on (ior_id) ior_id
                            from ucp_domain_entity 
                            where 
                              object_ior = ${ph(type)}
                              ${queryStringInner}
                            order by ior_id, time desc
                        ) udeVersion on ude."ior_id"  = udeVersion."ior_id"
                        ${queryString} 
                        order by ude.ior_id, time desc
                    ) udeExtern
                    where access_right = 'true'
                    order by ${order}
                    limit ${ph(data.config.pagination.size)} OFFSET ${ph(data.config.pagination.page * data.config.pagination.size)}
                    `

            let result = await ONCE.DBClient.query(sql, valueList);
            data.result = result.rows.map(x => { return 'ior:ude:' + ONCE.ENV.ONCE_DEFAULT_URL + '/ior/' + x.ior_id });
            return response.send(data);

        } catch (err) {
            response.status((err.httpCause ? err.httpCause : 500));
            logger.error(err);
            return response.send({ status: 'error', message: err.toString(), 'stack': err.stack });
        } finally {
            // Do Cleanup 
            if (request?.sessionManager) {
                request.sessionManager.cleanupSecurityContexts();
            }
        }
    }

    async handleIORRestRequest(request, response) {
        let iorObject
        try {

            const crudMapper = { 'GET': 'retrieve', 'POST': 'create', 'PUT': 'update', 'DELETE': 'delete' };
            request.sessionManager = await ServerSideKeycloakSessionManager.factory(request)


            const processUDERequest = async function processUDERequest() {
                try {

                    if (crudMapper[request.method] == undefined) {
                        logger.error(`Method ${request.method} is not allowed`);
                        response.status(500);
                        response.send('Not allowed Method');
                    }

                    let data = request.body;

                    let actionCall = data && data.actionCall ? true : false;
                    if (actionCall) {
                        if (!data.actionCall.actionId) throw new Error("ActionId Missing");
                    }

                    iorObject = IOR.getInstance().init(request.originalUrl);
                    iorObject.protocol.push('ude');

                    let component;
                    iorObject.add(request.sessionManager);
                    if (request.method === 'POST' && !actionCall) {

                        const iorClass = IOR.getInstance().init(data.objectIor);
                        const aClass = await iorClass.load();
                        component = await aClass.getInstance().init();
                        if (!component.API) component.initUcpDomainEntity();
                        component.IOR = iorObject;


                    } else {
                        component = await iorObject.load();
                    }

                    if (!component) throw new Error("UDE not Loaded")
                    let actionId;
                    let actionData;
                    if (actionCall) {

                        actionId = data.actionCall.actionId;
                        actionData = data.actionCall.functionArgs || [];
                    } else {
                        actionId = `actionId:global:${component.type.class.name}.API.${crudMapper[request.method]}`
                        actionData = [data];
                    }



                    const result = await iorObject.callAction(actionId, actionData);

                    return response.send(result);
                } catch (err) {
                    throw err;
                } finally {
                    if (request?.sessionManager) {
                        request.sessionManager.cleanupSecurityContexts();
                    }
                }
            }

            return await request.sessionManager.processQueue.enqueue(processUDERequest.bind(this));


        } catch (err) {
            response.status((err.httpCause ? err.httpCause : 500));
            if (response.statusCode === 403) {
                logger.error(err.message + ' for IOR: ' + iorObject.url);
            } else if (response.statusCode < 200 || response.statusCode > 300) {
                logger.error(err.stack);
            }
            return response.send({ status: 'error', message: err.toString(), 'stack': err.stack });

        }
    }


    async forwardHTTPRequest(request, response) {
        var path = url.parse(request.url).pathname;

        if (!path.startsWith(this.prefix)) {
            response.writeHead(501);
            response.write(`Path has bad Format: it should start with ${prefix} but path is ${path}`);
            response.end();
            return;
        }

        // // auto generated header, will be generated again ;)
        // delete request.headers['content-length']
        // delete request.headers['host']
        // delete request.headers['accept-encoding']

        // TODO info@pb
        // on deployed Server more headers are generated like cookie
        // so for reuse of old proxied request, a header filter have to be implemented...
        // then the old way would be better, in order to have a working demo, this filter
        // is implemented as only authorization, so if you need more then this header, 
        // the forwarding is not working
        const header = {
            authorization: request.headers.authorization
        }

        require('request')({
            'method': request.method,
            'url': request.url.replace(this.prefix, this.apiUrl),
            'headers': header,
            // 'headers': request.headers,
            body: JSON.stringify(request.body)
        }, function (error, response, body) {
            //TODO handle error
            console.log(error)
            this.writeHead(response.statusCode, response.headers)
            this.write(body)
            this.end()
        }.bind(response));
    }

    // @todo move to HTTPServer
    async handleHTTPRequest(request, response) {




        var path = url.parse(request.url).pathname;
        logger.log("Received " + request.method + " to:", request.headers.host, path, "from", request.connection.remoteAddress);
        ONCE.hostnames.add(request.headers.host);
        ONCE.clients.add(request.connection.remoteAddress);
        // dns.reverse(request.connection.remoteAddress, function (err, hostnames) {
        //     if (err)
        //         logger.error("No problem, but:", err);
        //     else
        //         logger.log("Client hostname(s) are " + hostnames.join("; "));
        // });
        if (path.startsWith('/ior/')) {
            return ONCE.handleIORRestRequest(request, response);
        }
        switch (request.method) {
            case 'GET':
                switch (path) {
                    case '/':
                        // @TODO check domain   === domain router --- path router === configure by client
                        if (request.hostname.indexOf('220.ag') > -1 || request.hostname.indexOf('localhost') > -1) {
                            ONCE.renderHTML(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT + '/Components/ag/220/udxd/CityManagement/1.0.0/src/html/CityManagement.html', 'text/html', response);
                        }
                        if (request.hostname.indexOf('wo-da') > -1 )  {
                            ONCE.renderHTML(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT + '/apps/woda/WODA.html', 'text/html', response);
                        }
                        break;
                    case '/once':
                        ONCE.renderHTML(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT + '/Components/tla/EAM/layer1/Thinglish/Once/3.1.0/src/html/Once.html', 'text/html', response);
                        break;
                    case '/test':
                        response.redirect(ONCE.path + '/test/html/Once.mochaTest.html');
                        //ONCE.renderHTML(ONCE.basePath + '/test/html/Once.mochaTest.html', 'text/html', response);
                        break;
                    case "/once/env":
                        response.writeHead(200, {
                            'Content-Type': "application/json"
                        });

                        // Marcel: does not work over the ngx proxy on test.wo-da.de   will fallback to http and the produce a cors error 20210804

                        // let clientEnv = {};
                        // Object.assign(clientEnv, ONCE.ENV);
                        // clientEnv.ONCE_DEFAULT_URL = request.protocol + '://' + request.headers.host;

                        response.write(JSON.stringify(ONCE.ENV));
                        response.end();
                        break;
                    case '/wodaQ':
                        ONCE.renderHTML(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT + Once.REPOSITORY_COMPONENTS + '/com/ceruleanCircle/EAM/5_ux/WODA/1.0.0/src/html/WODA.Q!.html', 'text/html', response);
                        break;
                    case '/woda':
                        ONCE.renderHTML(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT + '/apps/woda/WODA.3.1.0.html', 'text/html', response);
                        break;
                    case '/favicon.ico':
                        ONCE.renderHTML(ONCE.repositoryRootPath + Once.REPOSITORY_ROOT + '/favicon.ico', 'image/x-icon', response);
                        break;
                    /*
                                    case Once.REPOSITORY_ROOT:
                                        ONCE.renderHTML('./login.html', response);
                                        break;
                        */
                    default:
                        response.writeHead(404);
                        response.write('Route not defined: ' + path);
                        response.end();

                }
                break;
        }
    }

    renderHTML(path, contentType, response) {
        let thePath = path;
        fs.readFile(path, null, (error, data) => {
            if (error) {
                response.writeHead(404);
                response.write('File ' + thePath + ' not found!');
                logger.error('File ' + thePath + ' not found!');
            } else {
                response.writeHead(200, {
                    'Content-Type': contentType
                });
                response.write(data);
            }
            response.end();
        }
        );
    }

    static getPlatformIndependantPathString(pathString) {
        let piPArray = pathString.split(ONCE.pathSeperator);
        return piPArray.join("/");
    }

    static getPlatformSpecificPathString(pathString) {
        let piPArray = Once.getPlatformIndependantPathString(pathString).split('/');
        return piPArray.join(ONCE.pathSeperator);
    }

    register(anInterface, anInstance) {
        return ONCE.Store.register(anInterface, anInstance);
    }

}

// class HttpForwarding {
//     static getInstance(apiUrl, prefix) {
//         let instance = new HttpForwarding();
//         apiUrl && instance.setApiUrl(apiUrl)
//         prefix && instance.setPrefix(prefix)
//         return instance;
//     }

//     setApiUrl(value) {
//         this._apiUrl = value;
//     }

//     setPrefix(value) {
//         this._prefix = value;
//     }

// }
Once.start();
//logger.log("ONCE is in mode:", ONCE.mode);
