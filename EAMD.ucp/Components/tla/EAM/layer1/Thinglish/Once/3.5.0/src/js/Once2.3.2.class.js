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

// ONCE 2.5.0 feat/uses

/* global ONCE, UcpController, JavaScriptObject, DefaultUcpComponentDescriptor,
DefaultFolder, EAMDucpLoader, WeBeanLoader, HTTPClient */
var iframeSupport = false;
var trace = trace || console.log;
var preventOnceInit = preventOnceInit || false;
var Namespaces; // it will be defined in Namespace.declare like window[Namespace.RootNamespace]


/// use typeof global !== 'undefined'

if (typeof global !== 'undefined') {
    console.debug("starting in a node environment");
    var rootWindow = window;
    global.window = global;
    global.document = null;
    //    var url = require('url');
    //    const URL = url.URL;
}
else {
    console.debug("not in a node environment");
    if (window.frameElement && iframeSupport) {
        console.debug("running in an iFrame");
        var rootWindow = window.frameElement.contentWindow.parent;
        var ONCE = rootWindow.ONCE;
        Namespaces = rootWindow.Namespaces;
        var UcpComponentSupport = rootWindow.UcpComponentSupport;
        window.frameElement.onload = UcpComponentSupport.onload.bind(UcpComponentSupport);
        //var ucp = UcpComponentSupport.findUcpComponentLinks(document)
        //UcpComponentSupport.loadAndStartAll(ucp);
        console.debug("iFrame initialized");
    } else {

        class SavetySwitch {
            static get implements() {
                return null
            }
            constructor() {
                this.i = 0;
                this.limit = 100;
            }

            check() {
                if (this.i++ < this.limit) {
                    console.debug("SafetySwitch(" + this.i + ") ok...")
                    return true;
                } else {
                    console.error("SafetySwitch(" + this.i + ") over Limit!")
                    return false;
                }
            }
        }

        TheSafetySwitch = new SavetySwitch();

        class Loader {
            static get implements() {
                return null;
            }
            static discover() {
                return this.type.implementations;
            }
            static canLoad(url) {
                // returns 0 if cannot
                // returns 1 if really can
                // returns between 0 and 1 if probbably can
                if (typeof (url) !== 'string') {
                    return 0;
                }
                return 0;
            }

            constructor() { }

            getIOR() {
                const ior = new IOR();
                ior.loader = this;
                return ior;
            }

            load(namespace) {
                const path = (typeof namespace === "string") ? namespace : this.namespace2path(namespace);
                return path;
            }

            namespace2path(namespace) {
                return this.constructor.namespace2path(namespace);
            }

            path2namespace(path) {
                return this.constructor.path2namespace(path);
            }

            checkLoader(object) {
                console.error("Not yet Implemented");
            }

            async call(ior, parameter) {
                return ONCE.call(ior, parameter);
            }
        }

        var DocumentScriptLoader = class DocumentScriptLoader extends Loader {
            static get implements() {
                return null;
            }
            static canLoad(url) {
                if (typeof (url) !== 'string') {
                    return 0;
                }
                if (url.match(/\.js$/)) {
                    return 0.91;
                }
                return 0;
            }
            static storeScript(path, script) {
                this._private = this._private || {};
                this._private[path] = script;
            }
            static lookupScript(path) {
                this._private = this._private || {};
                return this._private[path];
            }
            constructor() {
                super();
                this.script = null;
                if (document) {
                    this.script = document.currentScript;
                }
                let src = Namespace.lookupInObject(this, "script.src");
                if (src) {
                    let index = src.indexOf(EAMDucpLoader.EAMDcomponentDir + "/");
                    if (index > 0) {
                        this.urlBasePath = src.substring(0, index);
                        index += EAMDucpLoader.EAMDcomponentDir.length;
                        this.repositoryPath = src.substring(0, index);
                        src = src.substring(index);
                    }

                    index = src.indexOf(WeBeanLoader.WeBeanJsDir);
                    if (index > 0) {
                        src = src.substring(0, index);
                    }
                    this.namespaceInRepository = Namespace.path2namespace(src);
                }
            }

            addScriptTag(id, src, onLoad, onError) {
                const element = document.createElement('script');
                //Thinglish.createSmartEvent(element, "onload");
                element.id = id;
                element.src = src;

                // @todo #marcel what is neeedet
                //element.type = "module";                

                //element.setAttribute("onload", onLoad);
                //element.setAttribute("onerror", onError);
                element.onload = onLoad;
                element.onerror = onError;
                const script = document.head.appendChild(element);
                script.loader = this;
                return script;
            }

            load(path) {
                const storedScript = DocumentScriptLoader.lookupScript(path);
                if (storedScript) {
                    return Promise.resolve(this.scriptLoaded(storedScript));
                }
                //var path = this.namespace2path(namespace);
                if (path instanceof IOR) {
                    path = path.url;
                }

                const willBeLoaded = new Promise((resolve, reject) => {
                    let script = null;
                    const onLoad = function (event) {
                        return resolve(script, event);
                    }

                    const onError = function (error) {
                        return reject(script, error);
                    }

                    if (document) {
                        script = this.addScriptTag(Namespace.path2namespace(path), path, onLoad, onError);
                        DocumentScriptLoader.storeScript(path, script);
                    } else {
                        require(path);
                    }
                }
                );
                return willBeLoaded.then(this.scriptLoaded, this.scriptFailedToLoad);
            }

            scriptLoaded(script, event) {
                //script.parentElement.removeChild(script);
                return script;
            }

            scriptFailedToLoad(script, error) {
                console.error(error, script);
                return script;
            }

            namespace2path(namespace) {
                return Namespaces.namespace2path(namespace);
            }

            path2namespace(path) {
                return Namespaces.path2namespace(path);
            }

        };


        window.WeBeanLoader = class WeBeanLoader extends Loader {
            static get implements() {
                return null;
            }
            static get WeBeanDir() {
                return "/src/html/weBean";
            }
            static get WeBeanTemplateExtension() {
                return ".weBean.html";
            }
            static get WeBeanJsDir() {
                return "/src/js";
            }
            static get WeBeanModelExtension() {
                return ".ucpModel.js";
            }
            static canLoad(url) {
                if (typeof (url) !== 'string') {
                    return 0;
                }
                const result = [WeBeanLoader.WeBeanDir, //WeBeanLoader.WeBeanDir + '/[\\w\\-]*' + WeBeanLoader.WeBeanTemplateExtension + '$'
                WeBeanLoader.WeBeanTemplateExtension.replace(/\./g, "\\.") + '$'].every(reg => url.match(new RegExp(reg)));
                return result ? 1 : 0;
            }

            constructor() {
                super();
            }

            getIOR(path) {
                /*
                if (!this.ior || path) {
                    this.ior = super.getIOR();
                    //        ior.objectID = id;
                    if (typeof window.StructrRESTLoader === 'function') {
                        this.ior.credentials = {
                            user: window.StructrRESTLoader.defaultUser,Fshif
                            password: window.StructrRESTLoader.defaultPassword
                        };
                    }
                    this.ior.url = path;
                    this.ior.headers = null;
                    this.ior.HTTPmethod = "GET";
                }
                return this.ior;
                */
                if (!this.ior || path) {
                    this.ior = new IOR().init(path);
                }

                return this.ior;
            }

            async load(ior) {
                const response = await fetch(ior.url);
                if (response.status >= 200 && response.status < 300) {
                    const type = response.headers.get('Content-Type');
                    return (/json/i.test(type)) ? response.clone().json() : response.text();
                }
                return new Error(response.statusText);
                //return this.httpClient.GET(ior.url);  // Removed because of probles the HTTPClient is not already loaded
            }

            namespace2path(namespace) {
                console.error("Not yet Implemented", namespace);
            }
            path2namespace(namespace) {
                return null;
            }
        }


        window.EAMDucpLoader = class EAMDucpLoader extends DocumentScriptLoader {
            static get implements() {
                return null;
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

                var index = path.indexOf(WeBeanLoader.WeBeanJsDir + "/");
                if (index > 0) {
                    path = path.substring(0, index);
                }

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
                        // var version = new VersionNamespace().init(name);
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

            static canLoad(url) {
                if (typeof (url) !== 'string') {
                    return 0;
                }
                const reg = new RegExp(EAMDucpLoader.EAMDcomponentDir + '/(.*)/[\\w\\-]*' + EAMDucpLoader.ComponentXML);
                if (url.match(reg)) {
                    return 1;
                }
                if (url.match(/^ior:local:/)) {
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

            init(path) {
                this.origin = "";
                if (path.indexOf("://") !== -1) {
                    this.url = new URL(path);
                    this.origin = this.url.origin;
                    path = this.url.pathname;
                }
                if (!this.origin) {
                    this.origin = document.location.origin;
                }

                this.baseUrl = this.origin;

                this.descriptorPath = path;
                this.pathElements = path.split("/");
                this.descriptorName = this.pathElements[this.pathElements.length - 1];
                this.name = this.descriptorName.split(".")[0];
                this.extension = EAMDucpLoader.DefaultClass;
                this.path = EAMDucpLoader.JSdir;

                if (this.descriptorName.endsWith(EAMDucpLoader.ComponentXML)) {
                    this.descriptorName = this.name + EAMDucpLoader.ComponentXML;
                    this.basePath = this.descriptorPath.substr(0, this.descriptorPath.indexOf(this.descriptorName) - 1);
                    this.basePath = this.basePath.substr(this.basePath.indexOf(EAMDucpLoader.EAMDcomponentDir));
                    this.descriptorPath = this.basePath + "/" + this.descriptorName;
                } else {
                    this.basePath = this.descriptorPath.substr(0, this.descriptorPath.indexOf(this.path));
                    const paths = this.basePath.split("/");
                    this.name = paths[paths.length - 2];

                    this.descriptorName = this.name + EAMDucpLoader.ComponentXML;
                    this.descriptorPath = this.basePath + "/" + this.descriptorName;
                }

                this.filename = this.basePath + this.path + "/" + this.name + this.extension;
                this.urlString = this.origin + this.filename;


                return this;
            }


            path2namespace(path) {
                return this.constructor.path2namespace(path);
            }
            constructor() {
                super();
                window.EAMDucpLoaderSingleton = this;
            }

            normalizeUrl(url) {
                if (!url) {
                    url = this.urlString;
                }
                url = url.replace(/^ior:/, '');
                url = url.replace(/^local:/, '');
                return url;
            }




            load(object) {
                const storedObject = EAMDucpLoader.loockupObject(object.url);
                if (storedObject) {
                    return Promise.resolve(storedObject.class);
                }
                if (object.class) {
                    //@todo tidy up! objet is an IOR...always???
                    return object.class;
                }

                let path = null;
                if (Namespace.lookupInObject(object, "type.name") === "IOR") {
                    path = object.url;
                    this.init(path);

                    let loadedType = object.loader.path2namespace(path);
                    let versionedType = null;
                    if (loadedType.indexOf("_") !== -1) {
                        //contains version
                        object.class = Namespaces.lookup(loadedType);
                        if (object.class) {
                            return Promise.resolve(object.class);
                        }

                        versionedType = loadedType.split(".").slice(0, -1).join(".");
                        loadedType = loadedType.split(".").slice(0, -2).join(".");
                    }
                    object.loader = this;

                    object.class = (versionedType) ? Namespaces.lookup(versionedType + "." + this.name) : Namespaces.lookup(loadedType);
                    if (object.class) {
                        return object.class;
                    }

                    //@todo here the descripor is loaded from the loaction you have opened, not from origin.
                    // try to load loacl first, when it failes try to load from origin
                    object.class = super.load(this.filename)
                        .then(script => {
                            object.loader.script = script;

                            if (versionedType) {
                                object.class = Namespaces.lookup(versionedType + "." + this.name);
                            }
                            object.class = object.class || Namespaces.lookup(loadedType);
                            if (object.class && object.class.constructor.name === "Namespace") {
                                // const namespaceToFix = object.class;
                                object.class = null;
                            }

                            object.class = object.class || window[this.name];
                            if (object.class
                                && object.class.type
                                && object.class.type.extends
                                && object.class.type.extends.name === "Interface"
                            ) {
                                const defaultClass = object.class.defaultImplementationClass;
                                if (Thinglish.isClass(defaultClass)) {
                                    defaultClass.type.originalClass = object.class;
                                    object.class = defaultClass;
                                }
                            }

                            if (object.class) {
                                let ownIOR = Object.getOwnPropertyDescriptor(object.class, "IOR");
                                if (!ownIOR) {
                                    Object.defineProperty(object.class, "IOR", { "value": object, "writable": true, "enumerable": true, "configurable": true });
                                }
                                //object.class.IOR = object.class.IOR || object;
                                Namespace.declare(versionedType, object.class);
                            }
                            // Account.defaultImplementationClass is DefaultAccount
                            // DefaultAccount.type.originalClass should be Account


                            if (object.class) {
                                if (versionedType) {
                                    Namespace.declare(versionedType, object.class);
                                }

                                //if (!object.class.IOR)
                                //    object.class.IOR = object;

                                /**
                                     * @deprecated since version 0.5.0, here for backward compatibility
                                     if (window["UcpComponentSupport"]) {
                                                        //UcpComponentSupport.load(object);
    
    
    
                                                        if (Namespaces.lookupInObject(object, "class.controller.singleton"))
                                                            object.class.controller.singleton.init(object.class.controller);
                                                        //                        object.class.loader = object.loader;
                                                    }
                                     */

                                logger.log({
                                    level: "debug",
                                    category: "LOADER"
                                }, "declared " + object.class.package + " loaded from " + object.class.IOR.loader.script.src);
                                object.referencedObject = object.class;
                                /*
                                                            if (object.class.dependencies) {
                                                                object.class.startDependencies(object.class);
                                                            }
                                    */
                            } else {
                                console.warn('script loaded but class not found: ' + loadedType);
                                return loadedType;
                            }
                            if (object.class && object.class.constructor.name === "Namespace") {
                                object.class = Namespaces.lookup(versionedType + "." + this.name);
                            }
                            EAMDucpLoader.storeObject(object);
                            return object.class;
                        }
                        );

                }
                return object.class;
            }

            namespace2path(namespace) {
                console.error("Not yet Implemented", namespace);
            }


        };



        var TypeDescriptor = class TypeDescriptor {
            static get implements() {
                return null;
            }
            static counter = 0;

            constructor() {
                this.id = "TypeDescriptor[" + (TypeDescriptor.counter++) + "]";
                this.class = undefined;
                this.dependencies = undefined;
                this.extends = undefined;
                //this.interfaces = undefined;
                this.implements = undefined;
                this.isInstance = undefined;
                this.name = undefined;
                this.namespace = undefined;
                this.package = undefined;
                this.ucpComponentDescriptor = undefined;
                this.weBeans = undefined;
                this.actionIndex = undefined;
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
                        if (object.class.type
                            && object.class?.type?.class == this.class) {
                            return object.class.type;
                        }

                        this.actionIndex = null;

                        //  start initExtends
                        let extending = Object.getPrototypeOf(object.class);
                        extending = (extending && extending.name !== "") ? extending : null;

                        if (!extending && object.class._instanceCounter !== undefined) {
                            console.warn(`type ${object.class.name} already declared  in ${object.package}`);
                        }

                        if (!extending && object.class.type) {
                            console.warn(`${object.class.type.name} type will be overwritten: ${this.name}`);
                        }
                        if (object.class.type && object.class.type.originalClass) {
                            this.originalClass = object.class.type.originalClass;
                        }

                        object.class.type = this;

                        if (extending) {
                            object.class.type.extends = extending;
                            if (window.Thinglish) {
                                Thinglish._addImplementation(object.class, extending);
                            }
                        }
                        //  done initExtends


                        //  start setup getInstance behaviour                        
                        object.class.getInstance = () => {
                            let newType = object.class;

                            if (
                                newType.defaultImplementationClass instanceof Function
                                && !(window.StructrFolder && newType.defaultImplementationClass === window.StructrFolder)
                            ) {
                                newType = newType.defaultImplementationClass;
                            }
                            if (newType.onNewInstance instanceof Function) {
                                const { aTypeName, newObject } = newType.onNewInstance(object.class, object);
                                if (newObject) {
                                    object = newObject;
                                }
                                if (Thinglish.isClass(window[aTypeName])) {
                                    newType = window[aTypeName];
                                }
                            }

                            const newInstance = new newType();
                            Thinglish.initType(newInstance);
                            if (ONCE.eventSupport) {
                                ONCE.eventSupport.fire("newInstance", ONCE, newInstance);
                            }
                            return newInstance;
                        };

                        object.class._instanceCounter = object.class._instanceCounter || 0;
                        //  done setup getInstance behaviour   


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


                        let interfaces = null;
                        if (
                            !object.class.implements
                            && object.class.implements !== null
                            && !object.class.type.extends
                        ) {
                            console.warn("Please consider to add 'static get implements() { return null }' to your class:", object.name);
                        } else {
                            interfaces = object.class.implements;
                        }

                        if (interfaces === null) {
                            interfaces = [];
                        }

                        let superClass = object.class.type.extends;
                        while (superClass) {
                            if (superClass.type.class.implements) {
                                interfaces = interfaces.concat(superClass.type.class.implements);
                            }
                            superClass = superClass.type.class.extends;
                        }

                        if (interfaces) {
                            interfaces.forEach(anInterface => {
                                Thinglish._addInterface(object, anInterface);
                                Thinglish._addImplementation(object.class, anInterface);

                            });
                        }
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

            get interfaces() {
                return this.class.implements;
            }

            get version() {
                return this.namespace;
            }

            get versionString() {
                return this.namespace.name.replace(/_/ig, ".");
            }

            get script() {
                return this.class.IOR.loader.script;
            }

        };


        class Namespace {
            static get implements() {
                return null;
            }
            static discover() {
                if (window.DefaultFolder) {
                    return [DefaultFolder];
                }
                return null;
            }

            static get RootNamespace() {
                console.error('do not use it');
                return "Namespaces";
            }

            /*

            static get defaultImplementationClass() {
                if (!this._private) this._private = {};
                if (!this._private.defaultImplementationClass) {
                    try {
                        let defaultClass = eval("Default" + this.name);
                        if (Thinglish.isClass(defaultClass))
                            this._private.defaultImplementationClass = defaultClass;
                    } catch (error) {
                        console.debug("no DefaultImplementationClass for Interface: ", this.name);
                        return null;
                    }
                }
                return this._private.defaultImplementationClass;
            }
            static set defaultImplementationClass(newValue) {
                if (!this._private) this._private = {};
                this._private.defaultImplementationClass = newValue;
            }
            */

            static declare(packageName, classOrFunction) {
                Namespaces = Namespaces || new Namespace().init('Namespaces');
                let fullQualifiedClassname;
                if (packageName) {
                    fullQualifiedClassname = packageName + "." + classOrFunction.name;
                    const existing = Namespaces.lookup(fullQualifiedClassname);
                    if (existing) {
                        if (existing.constructor.name === "Namespace") {
                            classOrFunction.WARNINGnamespaceOverwritten = true;
                            return classOrFunction;
                        }
                        return existing;
                    }
                } else {
                    fullQualifiedClassname = classOrFunction.name;
                }
                classOrFunction.displayName = "Class: " + classOrFunction.name;

                const namespace = Namespaces.setPackage(classOrFunction, fullQualifiedClassname);

                const getter = () => classOrFunction.namespace.package + "." + classOrFunction.name;
                const setter = newValue => {
                    console.warn("trying to set package to ", newValue);
                };

                Object.defineProperty(classOrFunction, "package", {
                    enumerable: false,
                    configurable: true,
                    get: getter.bind(classOrFunction),
                    set: setter.bind(classOrFunction)
                });
                //classOrFunction._instanceCounter = 0;

                new TypeDescriptor().init({
                    class: classOrFunction,
                    name: classOrFunction.package,
                    package: namespace.package,
                    namespace,
                    isInstance: false
                });

                if (window["Thinglish"]) {
                    let name = Thinglish.lookupInObject(document, "currentScript.loader.descriptorName");
                    if (name) {
                        name = name.replace(".component.xml", "");

                        if (classOrFunction.name != name && classOrFunction.name != "Default" + name) {
                            let result = ONCE.start(classOrFunction).catch(error => {
                                console.error("Starting", name, "failed...", error);
                            });
                        }
                    }
                }
                return classOrFunction;
            }

            static bootstrapLoaderInterface(namespace, classOrFunction) {
                if (window["Loader"])
                    return classOrFunction;
                var namespace = this.declare(namespace, classOrFunction);
                namespace.type.extends = Interface;
                window.Loader = namespace;

                Thinglish._addImplementation(DocumentScriptLoader, Loader);
                Thinglish._addImplementation(EAMDucpLoader, Loader);
                Thinglish._addImplementation(WeBeanLoader, Loader);

                return namespace;
            }

            static lookupInObject(object, thingName) {
                if (!thingName) {
                    return null;
                }
                const packages = thingName.split(".");
                let currentNamespace = object;

                for (const name of packages) {
                    const nextNamespace = currentNamespace[name];
                    if (!nextNamespace) {
                        return null;
                    }
                    currentNamespace = nextNamespace;
                }
                return currentNamespace;

            }

            lookupInObject(object, thingName) {
                return Thinglish.lookupInObject(object, thingName);
            }

            static path2namespace(path) {
                if (!path) {
                    return null;
                }
                var EAMDcomponentDir = `${EAMDucpLoader.EAMDcomponentDir}/`;
                let index = path.indexOf(EAMDucpLoader.EAMDcomponentDir);
                if (index > 0) {
                    index += EAMDcomponentDir.length;
                    path = path.substring(index);
                }

                index = path.indexOf(`${WeBeanLoader.WeBeanJsDir}/`);
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
                        // var version = new VersionNamespace().init(name);
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

            path2namespace(path) {
                return Namespace.path2namespace(path);
            }

            constructor() {
                this.namespace = null;
                this.idCounter = 0;
                if (document) {
                    this.loader = new DocumentScriptLoader();
                }
            }

            init(name, namespace) {
                this.name = name;

                if (!namespace && Namespaces) {
                    namespace = Namespaces;
                }

                this.namespace = (this.name === 'Namespaces') ? null : namespace;

                return this;
            }

            get name() {
                return this._name;
            }

            set name(newName) {
                if (this.namespace) {
                    this.namespace[newName] = this;
                    delete this.namespace[this._name];
                }
                this._name = newName;

            }

            setPackage(aClass, fullQualifiedClassname) {
                const existing = Namespaces.lookup(fullQualifiedClassname);
                if (existing) {
                    return existing;
                }
                //        console.debug("set Package: "+packageName)
                const packages = fullQualifiedClassname.split(".");
                let currentNamespace = Namespaces;
                let name = null;
                for (let i in packages) {
                    i = Number(i);
                    name = packages[i];
                    let nextNamespace = currentNamespace[name];
                    if (!nextNamespace) {
                        const overNext = (i + 1 < packages.length) ? packages[i + 1] : null;

                        const useClass = (i > 0 && overNext === packages[i - 1]) ? VersionNamespace : Namespace;
                        nextNamespace = new useClass().init(name, currentNamespace);

                        currentNamespace[name] = nextNamespace;
                        currentNamespace.isPackage = true;
                        if (currentNamespace.type) {
                            currentNamespace.type.isPackage = true;
                        }
                    }
                    currentNamespace = nextNamespace;
                }
                currentNamespace.namespace[name] = aClass;

                aClass.namespace = currentNamespace.namespace;

                return aClass.namespace;
            }

            import(thingName) {
                return this.lookup(thingName);
            }

            lookup(thingName) {
                return Namespace.lookupInObject(Namespaces, thingName);
            }

            get package() {
                /*        if (!TheSafetySwitch.check()) {
                            console.debug(this.name);
                            throw Error("SavetySwitch");
                        }
                */
                var packageName = this.name;
                // @BUG: at some point in time the version ....Panel.3_3_7.Panel is accidently changed to
                //   ....Panel.namespace.Panel   the Panel.type.name is the "type"
                // @todo  debug where it happens an fix it.

                if (!packageName || packageName === "namespace")
                    return "";
                //console.debug("  get package:",packageName);

                if (this.namespace) {
                    var next = this.namespace.package;
                    if (!next) {
                        next = this.namespace.name;
                        packageName = next + "." + this.name;
                        //next = this.namespace.namespace.package;
                        //packageName = next + "." + this.name;

                    }
                    packageName = next + "." + this.name;
                }

                packageName = packageName.replace(/^Namespaces\./, "");
                //        TheSafetySwitch.i=0;
                // console.debug(packageName);
                return packageName;

            }

            set package(newPackage) {
                this.setPackage(this.constructor, newPackage + "." + this.constructor.name);
            }

            namespace2path(namespace) {
                namespace = this.lookup(namespace);
                if (!namespace)
                    return "";
                var type = namespace.name;
                namespace = namespace.namespace.namespace.package;
                var names = namespace.split(".");

                var path = null;
                var namespace = null;
                var name = null;

                for (var i in names) {
                    name = names[i];
                    var index = name.indexOf("_");
                    if (index > 0) {
                        // is version
                        // var version = new VersionNamespace().init(name);
                        name = name.replace(/_/g, ".");
                    }
                    if (path)
                        path += "/" + name;
                    else
                        path = name;
                }
                var repoPath = Namespace.lookupInObject(this, "loader.repositoryPath");
                if (!repoPath)
                    repoPath = EAMDucpLoader.EAMDcomponentDir;
                path = repoPath + "/" + path + "/" + type + WeBeanLoader.WeBeanJsDir + "/" + type + WeBeanLoader.WeBeanModelExtension;
                return path;
            }

            discover() {
                var objects = [];
                return this._getObjects(objects, this);
                //        return this._getObjects(objects, window[Namespace.RootNamespace]);
            }

            /*
            // it's pre version
             _getObjects(objects, object) {
                if (Thinglish.isClass(object)) {
                    logger.log({
                        level: "debug",
                        category: "NAMESPACE"
                    }, "Class: " + object.type.name );
                    objects.push(object);
                    window[object.name] = window[object.name] || object;
                }
                if (object instanceof Namespace || object.isPackage) {

                    // @todo find similar legacy code and replace with Verion check: if (object.name.indexOf("_0") != -1)
                    if (object instanceof VersionNamespace && Thinglish.isClass(object.namespace)) {
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

                    logger.log({
                        level: "debug",
                        category: "NAMESPACE"
                    }, object.package);

                    for (var i in object) {
                        var o = object[i];
                        if (i !== "namespace" && i !== "type" && !(o instanceof VersionNamespace)) {
                            this._getObjects(objects, o);
                        }
                    }
                }

                return objects;
            }
             */

            _getObjects(objects, object) {
                if (Thinglish.isClass(object)) {
                    console.log({
                        level: "debug",
                        category: "NAMESPACE"
                    }, "Class: " + object.type.name);
                    objects.push(object);
                    window[object.name] = window[object.name] || object;
                }
                if (object instanceof Namespace || object.isPackage) {

                    // @todo find similar legacy code and replace with Verion check: if (object.name.indexOf("_0") != -1)
                    if (object instanceof VersionNamespace && Thinglish.isClass(object.namespace)) {
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

                    console.log({
                        level: "debug",
                        category: "NAMESPACE"
                    }, object.package);


                    const arr = Object.values(object)
                        .filter(item => item && item.name !== 'type' && item.name !== 'namespace')
                        .filter(item => item instanceof Namespace || item instanceof VersionNamespace || item.isPackage);

                    if (object.parent) {
                        // console.log(` =========== ${object.parent? object.parent.parent.name : ''} ${object.parent.name} ${object.name}  ===============`);
                    }

                    //console.log(arr.map(item => item.name).join(','));
                    // arr.forEach(item => {
                    //     this._getObjects(objects, item);
                    // });

                    for (var i in object) {
                        var o = object[i];
                        if (i !== "namespace" && i !== "type" && !(o instanceof VersionNamespace)) {
                            this._getObjects(objects, o);
                        }
                    }



                }

                return objects;
            }

            get parent() {
                return this.namespace;
            }

        }

        Namespace.declare("tla.EAM.layer1.ThinglishHelper", TypeDescriptor);

        var JavaScriptObjectDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
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
                    JavaScriptObjectDescriptor.ignoredFeatureIndex[newValue].push(Thinglish.getTypeName(JavaScriptObjectDescriptor.previousObject));
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
                    return Object.keys(this.propertyIndex).map(k => {
                        // filter duplicate model relationships

                        if (k.startsWith("model.")) {
                            //debugger
                            let checkKey = k.replace("model.", "");
                            if (this.propertyIndex[checkKey]) return null;
                        }
                        return this.propertyIndex[k]
                    }).filter(item => item !== null);
                    //Object.keys(this.propertyIndex).map(k => this.propertyIndex[k]);
                }
                get attributes() {
                    return Object.keys(this.attributeIndex).map(k => this.attributeIndex[k]);
                }
                get relationships() {
                    return Object.keys(this.relationshipIndex).map(k => {
                        // filter duplicate model relationships

                        if (k.startsWith("model.")) {
                            //debugger
                            let checkKey = k.replace("model.", "");
                            if (this.relationshipIndex[checkKey]) return null;
                        }
                        return this.relationshipIndex[k]
                    }).filter(item => item !== null);
                }
                get collections() {
                    return Object.keys(this.collectionIndex).map(k => {
                        // filter duplicate model relationships

                        if (k.startsWith("model.")) {
                            //debugger
                            let checkKey = k.replace("model.", "");
                            if (this.collectionIndex[checkKey]) return null;
                        }
                        return this.collectionIndex[k]
                    }).filter(item => item !== null);

                    //return Object.keys(this.collectionIndex).map(k => this.collectionIndex[k]);
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
                            console.debug("Prevented infinite recursion...");
                            console.warn("Not describable: ", object, JavaScriptObjectDescriptor.lastFeature);
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
                                //console.debug("describe: skipping proto", k);
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
                        if (typeof JavaScriptObjectDescriptor.ignoredFeatureIndex[i] !== "object"
                            || JavaScriptObjectDescriptor.ignoredFeatureIndex[i].indexOf(jsd.typeName) == -1) {
                            try {
                                descriptor[i].value = object[i];
                            } catch (error) {
                                console.error("describe: found quality issue at ", i, "on", object, error);
                                jsd.addIgnoredFeature(i);
                                return;
                            }
                        } else {
                            console.warn("describe: ignored feature '", i, "' on", object);
                            return;
                        }

                        let type = typeof object[i];
                        // null is a relationship, because null is an empty object BY DEFINITION
                        if (type === "object" && !(/*descriptor[i].value === null || */descriptor[i].value === undefined)) {
                            if (Array.isArray(object[i])
                                || Thinglish.isTypeOf(object[i], Collection))
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
                            console.debug(descriptor[i].type, ":", i, descriptor[i].feature /*,"=",descriptor[i].value*/
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
            });

        var Thinglish = Namespace.declare("tmp.light",
            class Thinglish {
                static get implements() {
                    return null;
                }

                static createSmartEvent(/* element, eventName */) { }

                static initType(object /*, packageName */) {
                    if (Thinglish.isClass(object)) {
                        console.debug("initType only for objects, not for classes");
                    }
                    if (object.type && object.type.isInstance) {
                        return;
                    }
                    if (object._private && object._private.typeInited) {// to avoid call more than once
                        return;
                    }
                    if (!object.type)
                        object.type = object.constructor.type;

                    Thinglish.defineAccessors(object, "package",
                        () => {
                            if (!object || !object.namespace) {
                                return null;
                            }
                            return object.namespace.package;
                            // + "." + object.constructor.name;
                        },
                        newValue => console.warn("trying to set package to ", newValue)
                    );
                    Thinglish.defineAlias(object, "constructor.namespace", "namespace");
                    Thinglish.defineAlias(object, "constructor.type", "type");

                    object._private = object._private || { id: "undefined" };
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

                        if (object.type.implements) {
                            //console.log("INTERFACE:  Class",object.type.name,"ALREADY implements all Interfaces: ",object.type.implements);
                            return;
                        }

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
                        });
                    }
                    object._private.typeInited = true;

                }

                static implement(object, anInterface, silent) {
                    const typeMaches = Thinglish.isTypeOf(anInterface, Interface);
                    if (!typeMaches) {
                        Thinglish.throwTypeError("anInterface", anInterface, "Interface", "Implement " + anInterface.name + "  ");
                    }

                    if (object.type && object.type.implements && object.type.implements.indexOf(anInterface) != -1) {
                        //console.log(anInterface.name, "is already implemented");
                        return;
                    }

                    //console.log( "Class", object.type.name, "implement", anInterface.name, "    ...already implementing:",object.type.implements);

                    // @todo for classes: on Object creation initialize all implemented interfaces
                    /*
                        if (Thinglish.isClass(object))
                            console.error("implement is for objects not for classes: ",object);
                        */

                    const prototype = anInterface.prototype ? Object.getOwnPropertyDescriptors(anInterface.prototype) : null;
                    //                     const prototype = anInterface.prototype ? Object.getOwnPropertyDescriptors(new anInterface.prototype.constructor()) : null;

                    let descriptor = null;
                    let objectPrototype = Object.getPrototypeOf(object);
                    let objectProperty = null;
                    if (!object.type) {
                        Thinglish.initType(object);
                    }
                    let objectDescriptors = Namespaces.tla.EAM.layer1.Thinglish.getAllDescriptors(object);

                    if (!object._private.interfaces)
                        object._private.interfaces = {};
                    for (const name in prototype) {
                        descriptor = prototype[name];
                        objectProperty = Object.getOwnPropertyDescriptor(objectPrototype, name);
                        if (name === "init") {
                            continue;
                        }
                        if (name === "constructor") {
                            /*
                                var interfaceInitialization = new anInterface();
                                if (interfaceInitialization.init)
                                    interfaceInitialization.init(object);
                                object.type.intefaceDelegate[anInterface.name] = interfaceInitialization;
                                */
                            continue;
                        }

                        if (!object._private.interfaces[anInterface.name])
                            object._private.interfaces[anInterface.name] = {
                                eamLayer: 3
                            };
                        if (descriptor.value)
                            // @todo assign the original function of the interface
                            object._private.interfaces[anInterface.name][name] = descriptor.value.bind(object);
                        else if (!object._private.interfaces[anInterface.name][name])
                            object._private.interfaces[anInterface.name][name] = anInterface.name + "." + name + "() not found. Its a property.";

                        let feature = objectDescriptors.find(d => d.name === name);
                        if (!objectProperty && !feature) {

                            Object.defineProperty(objectPrototype, name, descriptor);
                            if (!(silent == true)) {
                                Thinglish.throwTypeError(object.name, objectProperty, name, "Class " + object.type.name + " did not implement method: ")
                                logger.log({
                                    level: "debug",
                                    category: "INTERFACE"
                                }, "Class", object.type.name, "implement", anInterface.name + "." + name);
                            }
                        }
                    }
                    if (object.constructor.type) {
                        if (!Thinglish.isClass(object))
                            Thinglish._addInterface(object.constructor.type, anInterface);
                        if (object.type) {
                            Thinglish._addInterface(object.type, anInterface);

                            Thinglish._addImplementation(object.type.class, anInterface);
                        }
                    }
                }

                static _addInterface(type, anInterface) {
                    if (!type) {
                        return;
                    }
                    const interfaces = type.implements = type.implements || [];

                    /*
                                        let typePropertyDescriptors = Object.getOwnPropertyDescriptors(type.class);
                                        let anInterfacePropertyDescriptors = Object.getOwnPropertyDescriptors(anInterface);
                    
                                        const excludeList = ['defaultImplementationClass', 'overwriteServerDescriptor','dependencies','IOR'];
                    
                                        Object.keys(anInterfacePropertyDescriptors).forEach( name => {
                                            if (excludeList.indexOf(name) === -1) {
                                                if (typePropertyDescriptors[name] === undefined) {
                                                    Object.defineProperty(type.class, name, anInterfacePropertyDescriptors[name]);
                                                }
                                            } 
                                        })
                    */
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
                            console.debug(message);
                            return true;
                        case Thinglish.WARN_ON_TYPE_ERROR:
                            console.warn(message);
                            return true;
                        case Thinglish.STOP_ON_TYPE_ERROR:
                            throw new TypeError(message);
                        default:
                            break;
                    }
                    return false;
                }
                static isInstanceOf(argValue, expectedArgType /*, warnOrError */) {
                    if (Thinglish.isClass(argValue)) {
                        return false;
                    }
                    return Thinglish.isTypeOf(argValue, expectedArgType);
                }

                static isInstanceOfold(argValue, expectedArgType, warnOrError) {

                    //console.log("instanceof ",argValue.name,expectedArgType.name);
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
                        //                    console.debug(argName + ":" + argType + "  = " + argValue);
                        return true;
                    } else {
                        if (argType === "function") {
                            if (argValue.name === expectedArgType) {
                                //                    console.debug(argName + ":" + argType + "  = " + argValue);
                                return true;
                            }
                            if (argValue.name === expectedArgType.name) {
                                //                    console.debug(argName + ":" + argType + "  = " + argValue);
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
                            //console.warn("get: " , _object, _propertyName);
                            return Thinglish.lookupInObject(_object, _propertyName) || _defaultValue;
                        }
                        ,
                        set: (newValue) => {
                            //console.debug("set '" + _object.id + "." + _propertyName + "' to ", newValue);
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
                            console.debug("set '" + _propertyName + "' to '" + newValue + "'");
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

                static addLazyGetter(object, name) {
                    // @todo specify setter better
                    let propertyValue = null;

                    Object.defineProperty(object, name, {
                        enumerable: true,
                        configurable: false,
                        get: () => {
                            //_propertyValue = _propertyValue || eval("new " + name + "();");
                            propertyValue = propertyValue || new window[name]();
                            return propertyValue;
                        },
                        set: newValue => {
                            console.debug("set '" + name + "' to '" + newValue + "'");
                            propertyValue = newValue;
                        }
                    });
                }

                static loadAndStartAllParallel(aClass, IORs) {
                    if (!IORs && aClass.dependencies)
                        IORs = aClass.dependencies;
                    //@todo convert to IORs by IOR.findLoader after finding loader has ben generalized as proposesed at Loader

                    return Promise.all(IORs.map(Thinglish.initComponent));
                }

                static loadAndStartAll(aClass, IORs, options) {
                    if (!IORs) {
                        IORs = aClass.dependencies || [];
                    }

                    let parentClass = aClass;
                    let className = aClass;
                    if (aClass.type) {
                        className = aClass.type.name;
                    }

                    if (Array.isArray(IORs) && IORs.length === 0) {
                        return Thinglish.startClass(aClass);
                    }

                    return IORs.reduce((promise, ior, currentIndex, IORs) => {
                        ior = (ior instanceof IOR) ? ior : new IOR().init(ior);
                        //bad hack IOR parentClass
                        ior.parentClass = parentClass;

                        return promise.then(() => {

                            //console.debug(something);
                            logger.log({
                                level: "user",
                                category: "ONCE"
                            }, "loading ", ior.url, "for", className);
                            return Thinglish.startThing(ior, options).then(() => {
                                //console.log(className,currentIndex+1);
                                if (currentIndex === IORs.length - 1) {
                                    return Thinglish.startClass(aClass);
                                } else {

                                    //console.debug("@todo notify", className, " about successfull loading of ", ior.url);
                                    return undefined;
                                }
                            }
                            );
                        });
                    }
                        , Promise.resolve());
                }

                static async startThing(ior, options) {
                    if (!(ior instanceof IOR)) {
                        ior = new IOR().init(ior);
                    }

                    if (ior.isLoaded && ior.class && ior.class.type && ior.class.type.ucpComponentDescriptor) {
                        if (options && options.traceCategory) {
                            trace(options.traceCategory, `${ior.class.name} is already loaded`);
                        }
                        return Promise.resolve(ior.class);
                    }

                    const loaderContext = {
                        ior: ior
                    };

                    let aClass = await ior.load();
                    if (!Thinglish.isClass(aClass)) {
                        logger.log({
                            level: "info",
                            category: "LOADER"
                        }, "looaded a script", ior.url);
                        if (aClass.src && aClass.src.indexOf("class.js") > 0) {
                            console.error("Did you want to load a Descriptor?, You loaded the class directly: ", aClass.src);
                        }

                        return undefined;
                    }
                    if (Interface.isRealInterface(aClass)) {
                        //try {
                        const defaultClass = aClass.defaultImplementationClass;

                        if (Thinglish.isClass(defaultClass)) {
                            if (options && options.traceCategory) {
                                trace(options.traceCategory, `${aClass.name} has defaultImplementaion ${aClass.defaultImplementationClass.name}`);
                            }
                            loaderContext.interfaceClass = aClass;
                            aClass = defaultClass;
                        }
                    }

                    // load the Class for the UcpComponent
                    if (aClass) {
                        let className = aClass;
                        if (aClass.type) {
                            className = aClass.type.name;
                        }
                        logger.log({
                            level: "debug",
                            category: "LOADER"
                        }, className + " loaded...");
                    }
                    loaderContext.aClass = aClass;

                    // load the Descriptor when UcpComponentSupport is ready
                    if (loaderContext.interfaceClass) {
                        aClass = loaderContext.interfaceClass;
                    }
                    let descriptor = {
                        class: aClass
                    };
                    if (window.UcpComponentSupport && Thinglish.isClass(aClass)) {
                        if (!aClass.type.ucpComponentDescriptor) {
                            if (aClass.overwriteServerDescriptor) {
                                descriptor = DefaultUcpComponentDescriptor.getLocalDescriptor(aClass, ior.path, aClass.webBeanUnits);
                            } else {
                                descriptor = await window.UcpComponentSupport.DefaultUcpComponentRepository.loadDescriptorFromStructr(aClass);
                            }
                        } else {
                            descriptor = aClass.type.ucpComponentDescriptor;
                            loaderContext.alreadyLoaded = true;
                            ior.class = aClass;
                            return aClass;
                        }
                    } else {
                        logger.log({
                            level: "info",
                            category: "BOOTING"
                        }, "cannot load Descriptor for ", aClass.name, " because UcpComponent is not yet ready");
                    }

                    loaderContext.descriptor = descriptor;
                    return Promise.resolve(descriptor).then(descriptor => {

                        if (descriptor && descriptor.isDescriptorLoaded) {
                            loaderContext.descriptor = descriptor = descriptor.local;

                            if (loaderContext.aClass.overwriteServerDescriptor === true) {
                                return [];
                            }

                            logger.log({
                                level: "debug",
                                category: "ONCE"
                            }, "Descriptor loaded for ", descriptor.model.path, descriptor);
                            return descriptor.getDependencyDiff();
                        } else {
                            logger.log({
                                level: "warn",
                                category: "DESCRIPTOR"
                            }, "Descriptor not found for:", loaderContext.ior.loader.descriptorPath);
                            //console.warn("Descriptor not found for: " + componentClass.IOR.loader.descriptorPath);
                            // @todo import Descriptor into Repository
                            loaderContext.descriptor = null;
                            // @ToDo: 
                            if (loaderContext.aClass.overwriteServerDescriptor === undefined)
                                loaderContext.aClass.overwriteServerDescriptor = true;
                        }
                        // no dependencies
                        return [];
                    }
                    ).then(dependencyDiff => {
                        if (loaderContext.aClass.overwriteServerDescriptor !== true) {
                            loaderContext.dependencyDiff = dependencyDiff;
                            dependencyDiff.forEach(d => {
                                const location = (d.properties.type) ? "missing in " + loaderContext.aClass.name + ".dependencies" : "missing in Descriptor";
                                logger.log({
                                    level: "warn",
                                    category: "DESCRIPTOR"
                                }, "missing dependency: ", location, d.properties.path);
                            }
                            );
                        }
                        return loaderContext.descriptor;
                    }
                    ).then(descriptor => {
                        if (descriptor && descriptor.isDescriptorLoaded && loaderContext.aClass.overwriteServerDescriptor !== true) {
                            return descriptor.initializeUnits();
                        }
                        return loaderContext.aClass;
                    }
                    ).then(unitList => {
                        if (!Array.isArray(unitList))
                            unitList = [];
                        loaderContext.unitList = unitList;

                        let declaredWeBeanUnits = loaderContext.aClass.weBeanUnitPaths;
                        if (declaredWeBeanUnits === undefined)
                            declaredWeBeanUnits = ["src/html/weBeans/" + loaderContext.aClass.name + ".weBean.html"];

                        let weBeanList = [];
                        if (Array.isArray(declaredWeBeanUnits)) {
                            let basePath = "";
                            if (loaderContext.aClass.type.extends === window.UcpComponent && loaderContext.aClass.IOR)
                                basePath = loaderContext.aClass.IOR.loader.basePath + "/";
                            else
                                basePath = loaderContext.ior.loader.basePath + "/";

                            weBeanList = declaredWeBeanUnits.map(weBeanPath => ({
                                name: weBeanPath.substr(weBeanPath.lastIndexOf("/") + 1),
                                absolutePath: basePath + weBeanPath
                            }));
                        }
                        if (!loaderContext.descriptor && window["DefaultUcpComponentDescriptor"] && typeof loaderContext.aClass.type != "string") {
                            loaderContext.descriptor = DefaultUcpComponentDescriptor.getLocalDescriptor(loaderContext.aClass, loaderContext.ior.loader.descriptorPath, weBeanList);
                            logger.log({
                                level: "info",
                                category: "DESCRIPTOR"
                            }, "using local UcpComponentDescriptor: ", loaderContext.descriptor, loaderContext.descriptor.model.path);
                            loaderContext.aClass.type.ucpComponentDescriptor = loaderContext.descriptor;
                        }
                        if (!loaderContext.descriptor)
                            return unitList;

                        if (loaderContext.descriptor.webBeanUnits && loaderContext.aClass.overwriteServerDescriptor !== true)
                            weBeanList = weBeanList.concat(loaderContext.descriptor.webBeanUnits);

                        if (weBeanList.length > 0) {
                            loaderContext.weBeanList = weBeanList;

                            return Promise.all(weBeanList.map(unit => {
                                return loaderContext.descriptor.loadWeBean(unit).then(template => {
                                    if (unit instanceof StructrComponent)
                                        return unit;

                                    // @todo BUG: only occurs on ActionsPanel....
                                    if (unit instanceof StructrObject)
                                        return unit;
                                    //check why and repair

                                    let localUnit = {
                                        name: unit.name,
                                        description: "localUint: declared in Class " + loaderContext.aClass.name + " and described in ONCE.startThing(aThing)",
                                        absolutePath: unit.absolutePath,
                                        template: template,
                                        loadedFor: loaderContext.ior,
                                        ucpComponentClass: loaderContext.aClass
                                    }
                                    return localUnit;
                                }
                                );
                            }
                            ));

                        }

                        return null;
                    })
                        .then(weBeanList => {
                            loaderContext.weBeanList = weBeanList;
                            if (loaderContext.interfaceClass && !loaderContext.aClass.type.ucpComponentDescriptor) {
                                loaderContext.aClass.type.ucpComponentDescriptor = loaderContext.interfaceClass.type.ucpComponentDescriptor;
                            }
                            var aClass = loaderContext.aClass;
                            if (Namespace.lookupInObject(aClass, "type.ucpComponentDescriptor.webBeanUnits") && loaderContext.aClass.overwriteServerDescriptor !== true) {
                                aClass.controller = new UcpController().init(aClass);
                                aClass.type.ucpComponentDescriptor.webBeanUnits.map(unit => aClass.controller.registerView(unit));
                            } else if (Array.isArray(weBeanList) && window.UcpController) {
                                aClass.controller = new UcpController().init(aClass);
                                weBeanList.forEach(w => w.model = w);
                                aClass.type.ucpComponentDescriptor.webBeanUnits = weBeanList;
                                aClass.type.ucpComponentDescriptor.defaultWebBeanUnit = weBeanList[0];
                                aClass.type.ucpComponentDescriptor.isLocal = loaderContext.aClass.overwriteServerDescriptor;
                                weBeanList.map(unit => {

                                    aClass.controller.registerView(unit);
                                }
                                );
                            }

                            return aClass;
                        }
                        ).then(() => {
                            if (loaderContext.descriptor && loaderContext.descriptor.isDescriptorLoaded) {
                                logger.log({
                                    level: "log",
                                    category: "DEPENDENCIES"
                                }, "starting Dependencies for ", loaderContext.aClass.type.name);
                            }
                            //console.log('startDependencies', aClass.name);

                            return Thinglish.startDependencies(loaderContext.aClass);
                        }
                        ).then(() => {
                            if (ONCE.eventSupport) {
                                ONCE.eventSupport.fire("newThing", ONCE, loaderContext.aClass);
                            }
                            //bad hack IOR parentClass
                            if (loaderContext.ior.parentClass) {
                                loaderContext.aClass.type.usedBy = loaderContext.ior.parentClass;
                            }

                            return loaderContext.aClass;

                        }
                        ).catch(error => {
                            console.error(error);
                            return error;
                        });
                }

                static startDependencies(aClass) {
                    if (!aClass) {
                        return null;
                    }
                    logger.log({
                        level: "log",
                        category: "DEPENDENCIES"
                    }, 'start dependencies for ', aClass.name);
                    const dependencies = aClass.dependencies || [];
                    dependencies.forEach(d =>
                        logger.log({
                            level: "log",
                            category: "DEPENDENCIES"
                        }, aClass.name, "depends on", d)
                    );

                    /* @todo comment in to see how multiple versions will be loaded if there is a dependency diff
                        if (Namespace.lookupInObject(aClass,"type.ucpComponentDescriptor"))
                            dependencies = aClass.type.ucpComponentDescriptor.getAllDependencies();
                        */
                    const IORs = dependencies.map(d => (d instanceof IOR) ? d : new IOR().init(d));

                    ONCE.state = "loading";
                    console.log("set ONCE.state", ONCE.state);

                    return Thinglish.loadAndStartAll(aClass, IORs);
                }

                static startClass(aClass) {
                    if (!aClass) {
                        return false;
                    }

                    var className = aClass;
                    if (aClass.type) {
                        className = aClass.type.name;
                    }
                    else if (aClass.name) {
                        className = aClass.name;
                    }
                    logger.log({
                        level: "info",
                        category: "DEPENDENCIES"
                    }, "ALL dependencies loaded for ", className);
                    logger.log({
                        level: "info",
                        category: "ONCE"
                    }, "starting ", className);

                    if (window["Interface"] && Interface.isInterface(aClass) && aClass.defaultImplementationClass) {
                        aClass = aClass.defaultImplementationClass;
                    }

                    //console.debug("ALL dependencies loaded for ", className);
                    //console.info("starting ", className);                    let ownStartPD = Object.getOwnPropertyDescriptor(aClass, "start");
                    let ownStartPD = Object.getOwnPropertyDescriptor(aClass, "start");

                    if (aClass.start) {
                        if (ownStartPD) {
                            let ownIsStarted = Object.getOwnPropertyDescriptor(aClass, "isStarted");
                            if (!ownIsStarted) {
                                Object.defineProperty(aClass, "isStarted", { "value": false, "writable": true, "enumerable": true, "configurable": true });
                            }
                        }


                        if (aClass.isStarted) {
                            //                    console.debug("   already started "+aClass.name+" ...");
                            return aClass.startResult;
                        }
                        aClass.hasStartFunction = true;
                        return Promise.all([aClass.start(aClass)]).then(array => {
                            if (aClass.hasStartFunction) {
                                aClass.isStarted = true;
                            }
                            if (window.LessSingleton && ONCE.state === "running") {
                                LessSingleton.compile();
                            }
                            aClass.startResult = array;
                        });
                    }
                    return false;

                }

                static _addImplementation(type, anInterface) {
                    if (!anInterface.type) {
                        Namespace.declare(null, anInterface);
                    }

                    anInterface.type.implementations = anInterface.type.implementations || [];
                    //const implementations = anInterface.type.implementations;

                    // if (anInterface.type.implementations.indexOf(type) === -1) {
                    //     anInterface.type.implementations.push(type);
                    // }
                    let allInterfaces = Thinglish.getAllTypes(anInterface);
                    allInterfaces.forEach(anInterface => {
                        if (anInterface.type.implementations.indexOf(type) === -1) {
                            anInterface.type.implementations.push(type);
                        }
                    });
                }


                static lookupInObject(object, thingName) {
                    //console.warn("lookupInObject", thingName);
                    if (thingName === '') return object;
                    var objectPath = thingName.split(".");

                    var currentObject = object;
                    var name = null;
                    for (var i in objectPath) {
                        name = objectPath[i];
                        if (currentObject == undefined) {
                            return null;
                        }

                        var nextObject = currentObject[name];
                        if (nextObject == undefined) {
                            //                console.warn(currentNamespace.package, name + " not found");
                            return null;
                        }
                        currentObject = nextObject;
                    }
                    return currentObject;

                }

                static setInObject(object, thingName, newValue) {
                    var objectPath = thingName.split(".");
                    var setter = objectPath.pop();
                    var currentObject = object;
                    var name = null;
                    for (var i in objectPath) {
                        name = objectPath[i];
                        var nextObject = currentObject[name];
                        if (nextObject == undefined) {
                            //                console.warn(currentObject.package, name + " not found");
                            return null;
                        }
                        currentObject = nextObject;
                    }
                    let pd = Object.getOwnPropertyDescriptor(currentObject, setter);
                    if (!pd) {
                        try {
                            return currentObject[setter] = newValue;

                        }
                        catch (error) {
                            if (Thinglish.onTypeError > Thinglish.SILENT_ON_TYPE_ERROR) {
                                console.warn(error, "on setting: ", setter, "on", currentObject.constructor.name);
                                console.warn("error mitigated successful. Consider to fix setter on", currentObject.constructor.name);
                            }
                            return false;
                        }
                    }
                    //    return false;
                    if (pd && !pd.writable && !pd.set)
                        return true;

                    return currentObject[setter] = newValue;

                }

                static isTypeOf(object, aClass) {
                    if (!object)
                        return false;
                    if (aClass == Any) return true;

                    var types = this.getAllTypes(object);
                    return types.indexOf(aClass) != -1;
                }

                static getAllTypes(object) {
                    //console.log("getAllTypes starting for: ",object.name);
                    // @todo  make sure that there is a recurion check and reuse exisitng results
                    if (!object) return [];
                    var types = [];
                    if (window["ArraySet"]) types = new ArraySet();

                    let currentClass = object;
                    if (!Thinglish.isClass(currentClass))
                        if (object.type)
                            currentClass = object.type.class;
                        else
                            currentClass = null;

                    while (currentClass) {
                        types.push(currentClass);

                        // declaration time implements via static implements
                        if (currentClass.implements) {
                            types = types.concat(currentClass.implements);
                            currentClass.implements.forEach(i => {
                                //console.log("getAllTypes start concat subtype for: ",object.name," on ",i.name);
                                types = types.concat(this.getAllTypes(i));
                                let ifcIdx = types.indexOf(Interface);
                                if (ifcIdx != -1)
                                    types.splice(ifcIdx, 1);
                            }
                            );
                        }
                        // runtime implements via Thinglish.implements (e.g. Namespace in DefaultFolder)

                        if (currentClass.type?.implements) {
                            types = types.concat(currentClass.type.implements);
                            currentClass.type.implements.forEach(i => {
                                //console.log("getAllTypes start concat subtype for: ",object.name," on ",i.name);
                                types = types.concat(this.getAllTypes(i));

                                let ifcIdx = types.indexOf(Interface);
                                if (ifcIdx != -1)
                                    types.splice(ifcIdx, 1);
                            }
                            );
                        }

                        //console.log("getAllTypes: ",object.name,"   ...checking:",currentClass.name);
                        currentClass = currentClass.type?.extends;
                    }
                    //console.log("getAllTypes done for: ",object.name);
                    return types;
                }

                // static wait(ms) {
                //     return new Promise(resolve => {
                //         setTimeout(() => {
                //             resolve();
                //         }, ms);
                //     });
                // }
            });

        var VersionNamespace = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class VersionNamespace extends Namespace {
                static get implements() {
                    return null;
                }
                constructor() {
                    super();
                    //            this.parentNamespace = this.namespace.namespace;
                }

                get package() {
                    var parentPackage = this.parentNamespace.package;
                    return parentPackage + "." + this.namespace.name + "." + this.name;
                }

                init(name, namespace) {
                    super.init(name, namespace);
                    this.parentNamespace = this.namespace.namespace;
                    return this;
                }
            });

        var ArraySet = Namespace.declare("com.ceruleanCircle.EAM.2_systems.BasicDataTypes",
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
        var DefaultLogger = Namespace.declare("tla.EAM.layer1.OnceServices",
            class DefaultLogger {
                static get implements() {
                    return null
                }
                static get LEVELS() {
                    // only needed while BasicDataTypes not yet loaded
                    return {
                        "silent": 0,
                        "error": 1,
                        "testing": 1,
                        "warn": 2,
                        "user": 3,
                        "log": 3,
                        "info": 4,
                        "verbose": 5,
                        "debug": 5
                    };
                }

                // can only be called after BasicDataTypes are loaded as a dependency
                static start() {
                    Enum.declareEnumConstants(this, "LEVEL_", DefaultLogger.LEVELS);
                }

                constructor() {
                    this.currentCssClass = "DefaultLogger",
                        this.consoleLogFunction = console.log;
                    this.consoleErrorFunction = console.error;
                    this.consoleWarnFunction = console.warn;
                    this.consoleInfoFunction = console.info;
                    this.consoleDebugFunction = console.debug;
                    this.categoryCallbacks = {};
                    this.level = DefaultLogger.LEVELS["user"];
                    this.mirrorWebOnConsole = true;
                    this._private = { loggerElement: null };

                    this.useConsoleLog();
                    //this.useDocumentDebugDiv();
                    //this.forceLogger();
                }

                forceLogger() {
                    this.force = true;
                    console.log = this.logNormal.bind(this);
                    console.error = this.logError.bind(this);
                    console.warn = this.logWarn.bind(this);
                    console.info = this.logInfo.bind(this);
                    console.debug = this.logDebug.bind(this);
                }

                loggerOff() {
                    this.logFunction = noop;
                    this.logErrorFunction = console.error;
                    this.logWarnFunction = console.warn;
                }

                useConsoleLog() {
                    this.useConsole = true;
                    this.logFunction = this.consoleLogFunction;
                    this.logErrorFunction = this.consoleErrorFunction;
                    this.logWarnFunction = this.consoleWarnFunction;
                    this.logInfoFunction = this.consoleInfoFunction;
                    this.logDebugFunction = this.consoleDebugFunction;
                }

                useDocumentDebugDiv() {
                    this.useConsole = false;
                    this.logFunction = this.documentLog.bind(this);
                    this.logWarnFunction = this.documentlogWarn.bind(this);
                    this.logErrorFunction = this.documentLogError.bind(this);
                    this.logInfoFunction = this.documentLogInfo.bind(this);
                    this.logDebugFunction = this.documentLogDebug.bind(this);
                }

                object2message(message) {
                    if (typeof message === "object") {
                        var object = message;
                        if (message === null) return "null";



                        message = "";

                        //                if (!object.type)
                        //                    Thinglish.initType(message);
                        //var type = Namespaces.lookupInObject(object, "constructor.type.name");
                        //if (!type)
                        //    type = object.constructor.name;
                        message = Thinglish.getTypeName(object) + "{";
                        var seperator = "";
                        var value = null;
                        for (var i in object) {
                            if (object[i] instanceof HTMLElement)
                                value = "\n" + object[i].outerHTML.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            else
                                value = object[i];
                            if (value && value !== "undefined") {
                                //value = this.object2message(object[i]);
                                if (typeof value === "object") {
                                    value = Thinglish.getTypeName(value) + "{...}"
                                }
                                if (parseInt(i) === NaN) {
                                    message += seperator + value
                                    seperator = " ";
                                } else {
                                    message += seperator + i + "=" + value
                                    seperator = ", ";
                                }
                            }
                        }
                        message += "}"
                        return message;
                    }
                    if (typeof message === "function") {
                        message = message.name + "()";
                        return message;
                    }
                    if (message === undefined) return "undefined";
                    return message;
                }

                get loggerElement() {
                    var loggerElement = document.getElementById("Logger");
                    //if (!loggerElement && document)
                    //    this._private.loggerElement = document.getElementById("Logger");

                    if (!loggerElement) {
                        loggerElement = document.createElement('div');
                        loggerElement.setAttribute('style', 'overflow: auto');
                        loggerElement.setAttribute('id', 'Logger');
                        if (document.body) {
                            document.body.append(loggerElement);

                        }
                    }
                    return document.getElementById("Logger");

                }

                noop() { }

                logLevel() {
                    if (this.level < DefaultLogger.LEVELS[this.currentLevel])
                        return;
                    let args = [];
                    for (let i in arguments)
                        args.push(arguments[i]);

                    let category = args[0];
                    if (args[0].category != undefined) {
                        this.currentLogMetaInfo = args[0];
                        args.shift();
                        args.unshift(this.currentLogMetaInfo.category + ": ");
                    } else
                        this.currentLogMetaInfo = {
                            category: category
                        };
                    args.shift();

                    if (!this.currentLogMetaInfo.level)
                        this.currentLogMetaInfo.level = this.currentLevel;

                    this.log(this.currentLogMetaInfo, ...args);
                }

                warn() {
                    this.currentLevel = "warn";
                    this.logLevel(...arguments);
                }

                info() {
                    this.currentLevel = "info";
                    this.logLevel(...arguments);
                }

                debug() {
                    this.currentLevel = "debug";
                    this.logLevel(...arguments);
                }

                error() {
                    this.currentLevel = "error";
                    this.logLevel(...arguments);
                }

                getCaller(...args) {
                    if (this.level === DefaultLogger.LEVELS["silent"]) return args;

                    let caller = Thinglish.currentMethodDescriptor;
                    if (caller) {
                        caller = caller.caller;
                        //if (caller.type+"."+caller.name === "DefaultLogger.log") caller = caller.caller;
                        while (caller.type === this.constructor.name) caller = caller.caller;
                        args.push(" | caller: " + caller.href);
                        if (caller.href === "<anonymous>" && caller.caller) {
                            caller = caller.caller;
                            if (caller.href !== "") args.push("in: " + caller.href);
                        }
                        /*
                        if (caller.href === "" && caller.caller) {
                                caller = caller.caller;
                                args.push("in: "+caller.href);
                        }
                        */
                        //args.push("caller: <a href='"+caller.href+"'>"+caller.type+"."+caller.name+"</a>");
                    }
                    return args;
                }

                log(...args) {
                    //args = this.getCaller(...args)


                    if (args[0].category !== undefined) {
                        this.currentLogMetaInfo = args.shift();
                        args.unshift(this.currentLogMetaInfo.category + ": ");

                        if (this.currentLogMetaInfo.callback instanceof Function) {
                            this.categoryCallbacks[this.currentLogMetaInfo.category] = this.currentLogMetaInfo.callback;
                        }

                        if (this.categoryCallbacks[this.currentLogMetaInfo.category] instanceof Function) {
                            this.currentLogMetaInfo = this.categoryCallbacks[this.currentLogMetaInfo.category](this.currentLogMetaInfo, ...args);
                        }

                        if (!this.currentLogMetaInfo) {
                            return;
                        }

                        let message = null;
                        switch (this.currentLogMetaInfo.level) {
                            case "silent":
                                break;
                            case "log":
                            case "user":
                                this.logNormal(...args);
                                break;
                            case "warn":
                                this.logWarn(...args);
                                break;
                            case "error":
                                this.logError(...args);
                                break;
                            case "info":
                                this.logInfo(...args);
                                break;
                            case "debug":
                            case "verbose":
                                this.logDebug(...args);
                                break;

                            case "console.log":
                                this.consoleLogFunction(...args);
                                break;
                            case "console.warn":
                                this.consoleWarnFunction(...args);
                                break;
                            case "console.error":
                                this.consoleErrorFunction(...args);
                                break;
                            case "console.info":
                                this.consoleInfoFunction(...args);
                                break;
                            case "console.debug":
                                this.consoleDebugFunction(...args);
                                break;

                            case "web.log":
                                message = this.arguments2Message(...args);
                                this.documentLog(message);
                                break;
                            case "web.warn":
                                message = this.arguments2Message(...args);
                                this.documentlogWarn(message);
                                break;
                            case "web.error":
                                message = this.arguments2Message(...args);
                                this.documentLogError(message);
                                break;
                            case "web.info":
                                message = this.arguments2Message(...args);
                                this.documentLogInfo(message);
                                break;
                            case "web.debug":
                                message = this.arguments2Message(...args);
                                this.documentLogDebug(message);
                                break;

                            default:
                                args.shift();
                                args.unshift(this.currentLogMetaInfo);
                                args.unshift("LOGGER: do not know log.level: " + this.currentLogMetaInfo.level);

                                this.consoleWarnFunction(...args);
                                break;
                        }
                        if (this.mirrorWebOnConsole === true && this.useConsole !== true) {
                            switch (this.currentLogMetaInfo.level) {
                                case "silent":
                                    break;
                                case "log":
                                case "user":
                                    if (this.level < DefaultLogger.LEVELS.log) {
                                        return;
                                    }
                                    this.consoleLogFunction(...args);
                                    break;
                                case "warn":
                                    if (this.level < DefaultLogger.LEVELS.warn) {
                                        return;
                                    }
                                    this.consoleWarnFunction(...args);
                                    break;
                                case "error":
                                    if (this.level < DefaultLogger.LEVELS.error) {
                                        return;
                                    }
                                    this.consoleErrorFunction(...args);
                                    break;
                                case "info":
                                    if (this.level < DefaultLogger.LEVELS["info"])
                                        return;
                                    this.consoleInfoFunction(...args);
                                    break;
                                case "debug":
                                    if (this.level < DefaultLogger.LEVELS["debug"])
                                        return;
                                    this.consoleDebugFunction(...args);
                                    break;

                                case "console.log":
                                    break;
                                case "console.warn":
                                    break;
                                case "console.error":
                                    break;
                                case "console.info":
                                    break;
                                case "console.debug":
                                    break;

                                case "web.log":
                                    if (this.level < DefaultLogger.LEVELS["log"])
                                        return;
                                    this.consoleLogFunction(...args);
                                    break;
                                case "web.warn":
                                    if (this.level < DefaultLogger.LEVELS["warn"])
                                        return;
                                    this.consoleWarnFunction(...args);
                                    break;
                                case "web.error":
                                    if (this.level < DefaultLogger.LEVELS["error"])
                                        return;
                                    this.consoleErrorFunction(...args);
                                    break;
                                case "web.info":
                                    if (this.level < DefaultLogger.LEVELS["info"])
                                        return;
                                    this.consoleInfoFunction(...args);
                                    break;
                                case "web.debug":
                                    if (this.level < DefaultLogger.LEVELS["dabug"])
                                        return;
                                    this.consoleDebugFunction(...args);
                                    break;
                            }
                        }
                    } else
                        console.log(...arguments);
                }

                logNormal(...args) {
                    if (this.level < DefaultLogger.LEVELS["log"])
                        return;
                    args = this.getCaller(...args);

                    if (this.useConsole === true)
                        return this.logFunction(...args);

                    let message = this.arguments2Message(args);
                    this.currentCssClass = "log";
                    if (this.logFunction)
                        this.logFunction(message);
                }

                logError(...args) {
                    if (this.level < DefaultLogger.LEVELS["error"])
                        return;
                    args = this.getCaller(...args);

                    if (this.useConsole === true)
                        return this.logErrorFunction(...args);

                    let message = this.arguments2Message(...args);
                    this.currentCssClass = "log-error";
                    this.logErrorFunction(message);
                }

                logWarn(...args) {
                    if (this.level < DefaultLogger.LEVELS["warn"])
                        return;
                    args = this.getCaller(...args);

                    if (this.useConsole === true)
                        return this.logWarnFunction(...args);

                    let message = this.arguments2Message(...args);
                    this.currentCssClass = "log-warn";
                    this.logWarnFunction(message);
                }

                logInfo(...args) {
                    if (this.level < DefaultLogger.LEVELS["info"])
                        return;
                    args = this.getCaller(...args);

                    if (this.useConsole === true)
                        return this.logInfoFunction(...args);

                    let message = this.arguments2Message(...args);
                    this.currentCssClass = "log-info";
                    this.logInfoFunction(message);
                }
                logDebug(...args) {
                    if (this.level < DefaultLogger.LEVELS["debug"])
                        return;
                    args = this.getCaller(...args);

                    if (this.useConsole === true)
                        return this.logDebugFunction(...args);

                    let message = this.arguments2Message(...args);
                    this.currentCssClass = "log-debug";
                    this.logDebugFunction(message);
                }

                documentLog(message) {
                    //let message = this.arguments2Message(arguments);
                    //message = arguments.callee.caller.toString() + ": "+message;
                    var messageElement = document.createElement('pre');
                    messageElement.innerHTML = message;
                    messageElement.setAttribute("classes", this.currentCssClass);
                    var l = this.loggerElement;
                    l.prepend(messageElement);
                }

                documentlogWarn(message) {
                    if (this.level < DefaultLogger.LEVELS["warn"])
                        return;
                    //let message = this.arguments2Message(arguments);
                    this.documentLog("<font color='brown '>WARN: " + message + "</font>");
                }

                documentLogError(message) {
                    if (this.level < DefaultLogger.LEVELS["error"])
                        return;
                    //let message = this.arguments2Message(arguments);
                    this.documentLog("<font color='red '><b>ERROR:</b> " + message + "</font>");
                }

                documentLogInfo(message) {
                    if (this.level < DefaultLogger.LEVELS["info"])
                        return;
                    //let message = this.arguments2Message(arguments);
                    this.documentLog("<font color='darkblue '><b>Info:</b> " + message + "</font>");
                }
                documentLogDebug(message) {
                    if (this.level < DefaultLogger.LEVELS["debug"])
                        return;
                    //let message = this.arguments2Message(arguments);
                    this.documentLog("<font color='darkgrey '><b>Details:</b> " + message + "</font>");
                }

                arguments2Message() {
                    let now = new Date();

                    let message = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds() + ": ";
                    let length = 0;
                    for (let i in arguments) {
                        let argString = this.object2message(arguments[i]) || "";
                        if (typeof argString !== "string")
                            argString = argString.toString();
                        if (argString.startsWith(" | ")) {
                            length = message.length;
                            let fill = " ".repeat(Math.max(0, 200 - length));
                            argString = fill + argString;
                        }
                        message += argString + " ";
                    }
                    return message;
                }

            });

        var UUID = Namespace.declare("tla.EAM.layer1",
            class UUID {
                static get implements() {
                    return null;
                }

                static uuidv4() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }
            })

        var IOR = Namespace.declare("tla.EAM.layer1.OnceHelpers",
            class IOR {
                static get implements() {
                    return null;
                }
                static createFromObject(object) {
                    const ior = new IOR();
                    if (!object.type) {
                        Thinglish.initType(object);
                    }

                    object.type.name = "IOR:" + object.type.name;
                    ior.type = object.type;

                    return ior;
                }

                constructor() {
                    //            this.location = new URL('ior:local:javascript://' + window.location.host + "/");
                    this.referencedObject = null;

                    this.type = {
                        name: "IOR"
                    };
                    this.objectID = "";
                    this.model = { name: "new IOR" };

                    //this.headers = {};
                    //this.HTTPmethod = "GET";
                    this._private = this._private || {};
                }

                init(url, queryParameters) {
                    if (url instanceof IOR) {
                        return url;
                    }
                    this.url = url;
                    if (!this.url) this.url = "/";

                    if (queryParameters) {
                        this.queryParameters = queryParameters;
                    }
                    const loadedType = this.loader.path2namespace(url);

                    if (loadedType) {
                        const aClass = Namespaces.lookup(loadedType);
                        if (aClass) {
                            if (!this.queryParameters)
                                return aClass.IOR;
                            else
                                this.loader = aClass.IOR.loader;
                        }
                    }
                    return this;
                }

                set queryParameters(parameter) {
                    if (!this._private) {
                        return;
                    }
                    this._private.queryParameters = parameter;
                }

                get queryParameters() {
                    if (!this._private) {
                        return "";
                    }
                    return this._private.queryParameters;
                }

                get isLoaded() {
                    if (this.class) {
                        this.referencedObject = this.class;
                    }
                    return this.referencedObject != null;
                }

                // not supported by safari if the url ist just a path
                //        get url() { return this.location.href; }
                //        set url(newURL) { return this.location.href = newURL; }

                get url() {
                    if (!this._private) {
                        return "";
                    }
                    if (!this._private.url) {
                        this._private.url = this.loader.namespace2path(this.type.name);
                    }
                    //            if (this.objectID)
                    //                return this._url + "?id=" + this.objectID;
                    return this._private.url;
                }

                set url(newURL) {
                    if (!this._private) {
                        return;
                    }
                    this._private.url = newURL;
                }

                get URL() {
                    if (this.loader.baseUrl)
                        return new URL(this.loader.baseUrl + this.loader.normalizeUrl(this.url).replace(this.loader.baseUrl, ""));
                    return new URL(this.loader.IOR.url);
                }
                set URL(newURL) {
                    return this.url = newURL.href;
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

                toString() {
                    if (!this.url) {
                        return "IOR:uninitialized";
                    }
                    if (!this.url.startsWith("ior:")) {
                        return 'ior:' + this.url.toString();
                    }
                    return this.url.toString();
                }

                toJSON() {
                    return {
                        objectID: this.objectID,
                        url: this.toString(),
                        queryParameters: this.queryParameters
                    };
                }

                findLoader() {
                    if (!window.Loader) {
                        logger.log({ level: "info", category: "LOADER" }, "findLoader for", this._private.url);
                        this.loader = (window.EAMDucpLoader.canLoad(this._private.url) > 0) ? new window.EAMDucpLoader() : Namespaces.loader;
                        return this.loader;
                    }
                    const loaders = window.Loader.discover().filter(l => {
                        if (!(l.canLoad instanceof Function)) {
                            console.warn(l.name, 'does not have canLoad method');
                            return false;
                        }
                        if (!this._private.url || typeof this._private.url != "string")
                            return false;
                        return l.canLoad(this._private.url) > 0;
                    }
                    );
                    let [mostSuitable] = loaders;
                    if (!mostSuitable) {
                        // not found
                        this.loader = Namespaces.loader;
                        return this.loader;
                    }
                    //console.info(`trying to find loader for ${this._private.url}`);
                    loaders.forEach(l => {
                        const loadProbability = l.canLoad(this._private.url);
                        logger.log({ level: "verbose", category: "LOADER" }, l.name, "returns:", loadProbability, "for", this._private.url);

                        if (loadProbability > mostSuitable.canLoad(this._private.url)) {
                            mostSuitable = l;
                            logger.log({ level: "verbose", category: "LOADER" }, "found better loader", l.name);

                        }
                    }
                    );
                    logger.log({ level: "debug", category: "LOADER" }, "==== the most suitable loader for", this._private.url, "is", mostSuitable.name, "initialized with", this._private.url, " === ");
                    this.loader = new mostSuitable();
                    this.loader.IOR = this;
                    if (this.loader.init instanceof Function) {
                        this.loader.init(this._private.url);
                    }
                    return this.loader;
                }

                load() {
                    // return Promise.resolve(this.loader.load(this));
                    return this.loader.load(this);
                }

                head() {
                    return this.loader.head(this);
                }
                call(ior, parameter) {
                    return ONCE.call(ior, parameter);
                }

                execute(method, ...rest) {
                    if (!(this.loader[method] instanceof Function)) {
                        console.warn(`method ${method} is not defined in ${this.loader.name}`);
                        return false;
                    }

                    return this.loader[method].call(this.loader, this, ...rest);
                }

                get description() {
                    return this.toString();
                }

                get badge() {
                    if (this.isLoaded)
                        return "is loaded";

                    return "NOT loaded";
                }

                get displayName() {
                    return "IOR with loader: " + Thinglish.lookupInObject(this, "loader.constructor.name");
                }

                get basePath() {
                    return this.url.substring(0, this.url.lastIndexOf("/"));
                }
            });

        var Thing = Namespace.declare("tla.EAM.layer1",
            class Thing {
                static get implements() {
                    return null;
                }
                static get dependencies() {
                    return [];
                }

                static start() {
                    logger.log({
                        level: "debug",
                        category: "ONCE"
                    }, this.type.name + " can be started");
                    this.canBeStarted = true;
                    this.hasStartFunction = false;
                    this.isStarted = false;
                }

                static discover() {
                    //            var anInterface = Namespaces.lookup(this.type.name);
                    return this.type.implementations;
                }

                constructor() {
                    const packageName = Namespaces.lookupInObject(this, "constructor.namespace.package");
                    Thinglish.addLazyGetter(this, "Store");
                    Thinglish.initType(this, packageName);

                    this._private.id = this.type.name + "[" + (this.type.class._instanceCounter++) + "]";

                }

                init() {
                    return Object.freeze(this);
                }

                //        implement() {}

                load(object) {
                    //            console.debug(this.type.name + " is loading " + object.toString());
                    if (!object) {
                        return null;
                    }
                    if (Namespace.lookupInObject(object, "type.name") === "IOR") {
                        return object.load();
                    }

                    return Namespaces.loader.load(object);
                }

                // TODO: sync with 3.1.0  and 4.3.4  
                lookup(aClass) {
                    let result = this.Store.lookup(aClass);
                    if (Array.isArray(result)
                        && result.length == 1) { result = result[0]; }
                    return result;
                }

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
                            console.debug("set '" + name + "' to '" + newValue + "'");
                            if (onWillChange) {
                                newValue = onWillChange();
                            }
                            _propertyValue = newValue;
                        }
                    });
                }

                defaultOnChange(name, oldValue, newValue) {
                    console.debug("property '" + name + "' changes from '" + oldValue + "' to '" + newValue + "'");
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

                discover() {
                    return [this.Store];
                }

                /**
                     *
                     * @param {IOR} ior
                     * @return {Promise} response
                     */
                call(ior, parameter) {
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
                        dependencies.displayName = "Dependencies of " + this.type.class.name + " - " + this.type.versionString;
                        //dependencies.displayName = "Dependencies of "+this.type.class.name+"["+this.type.versionString+"]";
                        dependencies.description = "Class: " + this.package;

                        return dependencies;
                    }
                    return this.ucpComponentDescriptor.data.uses;
                }

            });

        var Store = Namespace.declare("tla.EAM.layer1.OnceServices",
            class Store {
                static get implements() {
                    return null;
                }
                constructor() {
                    Thinglish.initType(this, "tla.EAM.layer1.OnceServices." + this.constructor.name);
                    //            super();
                    if (window.IndexedObjectsMap) {
                        this.registry = new window.IndexedObjectsMap();
                        this.registry.init("type.name");
                        this.registry.allowCollections = true;
                    }
                }

                init() { }

                register(aType, anImplementation) {
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
                }

                remove(aType, anImplementation) {
                    //if (anInterface.constructor.name === "String");
                    //anInterface = Namespaces.lookup(anInterface);
                    if (!this.registry) {
                        return false;
                    }
                    if (!aType) {
                        return false;
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

        var FeatureDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
            class FeatureDescriptor extends Thing {
                static get implements() {
                    return null
                }
                constructor() {
                    super();
                    this.name = undefined;
                    this.feature = undefined;
                    //this.typeof = undefined;

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

                get typeof() {
                    return Thinglish.getTypeName(this.value);
                }
                set typeof(newValue) {
                    return false;
                }

                get typeName() {
                    if (!this.type.name)
                        return this.constructor.name;
                    return this.type.name.substr(this.type.name.lastIndexOf(".") + 1);
                }
                get fullTypeName() {
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

        var PropertyDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
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
            });

        var RelationshipDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
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
            });

        var CollectionDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
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
            });

        var MethodDescriptor = Namespace.declare("tla.EAM.layer1.ThinglishHelper",
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
                        console.error(error);
                        return error;
                    }
                    return result;
                }

            });

        var DropSupport = Namespace.declare("tla.EAM.layer1.OnceServices",
            class DropSupport {
                static get implements() {
                    return null
                }
                static get ACTION_GET_DND_BY_SELECTED_TYPE() {
                    return "actionId:protected:DropSupport.getLastTransferData[Get droped data]:success";
                }

                constructor() {
                    this.dropTargetContainerElement = null;
                }

                init(element) {
                    if (!element) {
                        element = document;
                    }
                    element.addEventListener("dragstart", this.onDragStart.bind(this), false);
                    element.addEventListener("dragend", this.onDragEnd.bind(this), false);

                    element.addEventListener("drop", this.onDrop.bind(this), false);
                    element.addEventListener("dragover", this.onDragover.bind(this), false);
                    element.addEventListener("dragenter", this.onDragenter.bind(this), false);
                    element.addEventListener("dragleave", this.onDragleave.bind(this), false);

                    //element.addEventListener("touchmove", this.onDragStart.bind(this), false);
                    return this;
                }

                async loadDescriptor(descriptorUrl) {
                    let aClass = ONCE.lookupClass4Descriptor(descriptorUrl);
                    if (aClass) {
                        return aClass;
                    }

                    const ior = new IOR().init(descriptorUrl);

                    aClass = await ONCE.start(ior);
                    if (!aClass) {
                        return;
                    }
                    console.debug("loaded ", aClass.type.name);
                    //this.current.class = aClass;
                    //this.maintainOptions(this.current);
                    ONCE.state = "running";
                    console.log("set ONCE.state", ONCE.state);

                    if (window.LessSingleton) {
                        LessSingleton.data.compile = true;
                        LessSingleton.compile();
                    }

                    if (aClass.demo) {
                        aClass.demo();
                    }
                    return aClass;
                }

                pushToWhat(targetUcpView, instance) {
                    if (instance && window.What) {
                        let what = ONCE.discover(window.What);
                        if (targetUcpView.ucpComponent !== what[0]/*&& what[0].items.indexOf(instance)==-1*/
                        ) {
                            Action.do(What.ACTION_PUSH, instance);
                            Action.do(Workflow.ACTION_SELECT, instance, null, instance._private.actionArray);
                        }
                    }
                }

                append(aClass, element, model) {
                    if (!aClass) {

                        return;
                    }

                    if (aClass.onDropCreate instanceof Function) {
                        const instance = aClass.onDropCreate(model);
                    }

                    const instance = aClass.getInstance().init();
                    if (model instanceof Object) {
                        if (Array.isArray(model))
                            instance.model = model;
                        else
                            instance.model = Object.assign(instance.model, model);
                        //instance.rerender();  // former someView-update(); md
                    }
                    if (!element) {
                        const defaultView = instance.defaultView;
                        defaultView.append(element);
                    } else {
                        const ucpView = UcpComponentSupport.getUcpView4Element(element);
                        if (window.JavaScriptObject && ucpView.ucpComponent instanceof JavaScriptObject) {
                            // TODO: @Marcel Compare with 3.1
                            //debugger;
                            ucpView.ucpComponent.add(instance);
                        } else {
                            // TODO: @Marcel Compare with 3.1
                            //debugger;
                            ucpView.add(instance);
                        }

                        this.pushToWhat(ucpView, instance);
                    }

                }

                onDragStart(event) {
                    console.log("onDragStart", event);

                    // none, copy, copyLink, copyMove,http://localhost:8888/EAMD.ucp/Components/com/ceruleanCircle/EAM/5_ux/WODA/1.0.0/src/html/WODA.html# link, linkMove, move, all und uninitialized
                    if (!event.dataTransfer) {
                        return;
                    }
                    event.dataTransfer.effectAllowed = "all";
                    let ucpComponent;
                    let ucpView = Current(event.srcElement);
                    if (!ucpView) {
                        return;
                    }
                    ucpComponent = ucpView.ucpComponent;
                    /*
                    if (ucpComponent instanceof JavaScriptObject) {
                        ucpComponent = ucpComponent.ucpModel.value;
                    }
                    */
                    ucpView.documentElement.classList.add("dragging");
                    ucpView.documentElement.style.opacity = '0.9';
                    //ucpView.documentElement.style.transform = "scale(0.8)";
                    ucpView.documentElement.style.zIndex = "999";


                    event.dataTransfer.setDragImage(ucpView.documentElement, -10, -10);
                    event.dataTransfer.setData("text/ucpViewId".toDash(), ucpView.id);
                    event.dataTransfer.setData("application/ucpView", ucpView);



                    let url = ucpComponent?.type?.class?.IOR?.url;
                    if (!url) url = ucpComponent?.model?.path;
                    if (!url) url = ucpComponent?.IOR?.url;
                    event.dataTransfer.setData("text/uri-list", url);
                    let iorUrl = ucpComponent?.IOR?.url;
                    if (iorUrl) event.dataTransfer.setData("text/ior-url", iorUrl);
                    event.dataTransfer.setData("URL", url);

                    event.dataTransfer.setData("text/url", url);
                    event.dataTransfer.setData("text/ucp-component-descriptor-path", url);
                    let ucpLocalReferenceString = JSON.stringify({
                        name: "UcpComponent JSON",
                        descriptorPath: url,
                        ucpViewId: ucpView.id,
                        modelId: ucpView.model.id
                    });
                    event.dataTransfer.setData("application/json/ucp-component", ucpLocalReferenceString);

                    let ucpRemoteReferenceString = ucpComponent.ucpModel.viewToJson(ucpView);
                    event.dataTransfer.setData("application/json/ucp-component-value-object", ucpRemoteReferenceString);
                    event.dataTransfer.setData("application/json", ucpRemoteReferenceString);
                    event.dataTransfer.setData("text/plain", ucpRemoteReferenceString);

                    if (ucpComponent.onDragStart instanceof Function) {
                        let effectAllowed = ucpComponent.onDragStart(event.dataTransfer, ucpView);
                        if (typeof effectAllowed === "string") {
                            event.dataTransfer.effectAllowed = effectAllowed;
                        }
                    }


                }

                onDragEnd(event) {
                    console.log("onDragEnd", event);
                    UcpComponentSupport.toggleCssClass("onDragenter", document.body, false);
                    event.srcElement.classList.remove("dragging");

                    event.srcElement.style.opacity = '1';
                    event.srcElement.style.transform = "scale(1)";
                }

                async onDrop(event) {
                    //UcpComponentSupport.toggleCssClass("onDragenter", document.body, false);
                    UcpComponentSupport.toggleCssClass("onDragenter", document.body, false);
                    if (this.dropTargetContainerElement) {
                        this.dropTargetContainerElement.classList.remove("drop-target");
                        this.dropTargetContainerElement = "";
                    }
                    event.preventDefault();
                    event.stopPropagation();

                    let url = event.dataTransfer.getData("URL");
                    if (!url) url = event.dataTransfer.getData("text/url");
                    if (!url && event.dataTransfer.types.indexOf("text/ucp-component-descriptor-path") > -1) {
                        url = event.dataTransfer.getData("text/ucp-component-descriptor-path");
                    }

                    let ucpComponentJson = null;
                    if (event.dataTransfer.types.indexOf("application/json/ucp-component-value-object") > -1) {
                        ucpComponentJson = JSON.parse(event.dataTransfer.getData("application/json/ucp-component-value-object"));
                        if (typeof ucpComponentJson === "string") {
                            url = ucpComponentJson
                        } else {
                            if (ucpComponentJson.ior)
                                url = ucpComponentJson.ior.url;
                            ucpComponentJson.ucpView = UcpComponentSupport.findUcpViewByValueObject(ucpComponentJson);
                        }
                    } else if (event.dataTransfer.types.indexOf("application/json/ucp-component") > -1) {
                        ucpComponentJson = JSON.parse(event.dataTransfer.getData("application/json/ucp-component"));
                        url = ucpComponentJson.descriptorPath;

                        ucpComponentJson.ucpView = UcpComponentSupport.findUcpViewByValueObject(ucpComponentJson);

                    }

                    if (ucpComponentJson) {
                        if (ucpComponentJson.ucpView) {
                            ucpComponentJson.ucpComponent = ucpComponentJson.ucpView.ucpComponent;
                        }

                        if (ucpComponentJson.ucpComponent instanceof JavaScriptObject) {
                            ucpComponentJson.model = ucpComponentJson.ucpComponent.ucpModel.value;
                        }

                        if (ucpComponentJson.model && ucpComponentJson.model.ucpComponent) {
                            ucpComponentJson.ucpComponent = ucpComponentJson.model.ucpComponent;
                        }

                        if (ucpComponentJson.ucpComponent && ucpComponentJson.ucpComponent.model instanceof UcpComponent) {
                            ucpComponentJson.ucpComponent = ucpComponentJson.ucpComponent.model;
                        }

                        if (ucpComponentJson.ucpComponent && !ucpComponentJson.ucpComponent.IOR?.queryParameters) {
                            ucpComponentJson.ucpComponent.IOR = new IOR().init(ucpComponentJson.ior.url, ucpComponentJson.ior);
                        }
                    }

                    /*
                        if(event.dataTransfer.types.indexOf('Files') > -1) {
                            Array.prototype.forEach.call(event.dataTransfer.items, item => {
                                if(item.type.indexOf('image/') === 0 ) {
                                    console.log("it's an image");
    
                                }
                            });
    
                            console.log('Files');
                        }
                        */

                    console.debug("URL:", url, "    dataTransfer: ", event.dataTransfer);

                    //document.getElementById("component").value = url;

                    // @todo refactor: new Method:  processDropTarget
                    console.debug(event.target);
                    const dropTargetElement = event.target;
                    const targetUcpView = Current(dropTargetElement);

                    if (targetUcpView.ucpComponent.onDrop instanceof Function) {
                        let done = targetUcpView.ucpComponent.onDrop(event.dataTransfer);
                        if (done === true) {
                            return;
                        }
                    }

                    let element = null;
                    if (targetUcpView) {
                        element = targetUcpView.container;
                        if (!element) {
                            element = targetUcpView.documentElement;
                        }
                    }
                    if (element && element.element) {
                        element = element.element;
                    }

                    /*
                        // yes, add the defaultView to the targetUcpView....
                        const targetUcpComponent = targetUcpView ? targetUcpView.ucpComponent : null;
                        if (targetUcpComponent &&
                            targetUcpComponent.onDrop instanceof Function &&
                            await targetUcpComponent.onDrop(url, ucpComponentJson)
                        ) {
                            return;
                        }
                        */

                    if (ucpComponentJson) {

                        let view = ucpComponentJson.ucpView;
                        if (view instanceof ItemView) {
                            view = view.ucpComponent.itemView;
                        }

                        if (ucpComponentJson.ucpComponent) {

                            if (ucpComponentJson.ucpComponent instanceof DefaultUcpComponentDescriptor) {
                                let aClass = ucpComponentJson.ucpComponent.isComponentLoaded;
                                if (!aClass) {
                                    aClass = await ucpComponentJson.ucpComponent.load();
                                }
                                if (aClass) {
                                    let aComponent = aClass.getInstance().init();
                                    targetUcpView.ucpComponent.add(aComponent);
                                    this.pushToWhat(targetUcpView, aComponent);

                                    return aComponent;
                                }
                            }

                            // @todo refactor: this.append(targetUcpView) shoud handle the next if clause
                            if (targetUcpView) {
                                if (Thinglish.isInstanceOf(targetUcpView, ItemView)) {
                                    targetUcpView.add(view.ucpComponent);
                                } else
                                    targetUcpView.ucpComponent.add(ucpComponentJson.ucpComponent);
                            }
                            return ucpComponentJson.ucpComponent;
                        }
                        if (ucpComponentJson.ucpView && targetUcpView) {
                            targetUcpView.add(view);
                            this.pushToWhat(targetUcpView, view);
                            return view;
                        }
                    }
                    if (!url) {
                        console.warn('url is not defined');
                        console.warn(event);
                        let getDataAction = Action.parse(DropSupport.ACTION_GET_DND_BY_SELECTED_TYPE);
                        getDataAction.setObject(this);
                        this.lastDataTransfer = Array.from(event.dataTransfer.items).map(item => {
                            item.name = item.type;
                            item.description = "DataTransferItem of Type: " + item.type;
                            item.getAsString(theString => item.asString = theString);
                            try {
                                item.json = JSON.parse(item.asString);
                            } catch (error) {
                                console.debug(error);
                            }
                            item.file = item.getAsFile();
                            item.data = event.dataTransfer.getData(item.type);
                            return item;
                        }
                        );

                        Action.do(Workflow.ACTION_SELECT, this.lastDataTransfer, DetailsView.ACTION_SHOW);
                        Action.do(OverView.ACTION_SHOW, this.lastDataTransfer);
                        return this.lastDataTransfer;
                    }
                    let aClass = ONCE.lookupClass4Descriptor(url);
                    // is class already loaded?

                    let model = ucpComponentJson;
                    // this
                    if (ucpComponentJson && (ucpComponentJson === url || ucpComponentJson.type === "UcpComponentDescriptor"))
                        model = null;

                    if (!aClass) {
                        // no, so load and append it....
                        aClass = await this.loadDescriptor(url);
                    }
                    if (!aClass) {
                        const discoverResult = await this.discoverSuitableClass(event.dataTransfer);
                        if (discoverResult instanceof Object) {
                            ({ url, model } = discoverResult);
                        }
                    }


                    if (aClass) {
                        this.append(aClass, element, model);
                    }
                    return aClass;

                    /*
                        if (aClass) {
                            const view = UcpComponentSupport.getUcpView4Element(element);
                            if (
                                view &&
                                view.ucpComponent instanceof UcpComponent &&
                                view.ucpComponent.append instanceof Function
                            ) {
                                view.ucpComponent.append(url);
                            }
                        }
                        */

                }

                async discoverSuitableClass(dataTransfer) {
                    if (dataTransfer.types.indexOf('text/plain') > -1) {
                        //
                        const plainText = dataTransfer.getData('text/plain');
                        const ior = new IOR().init(plainText);
                        ior.loader = HTTPClient.getInstance().init(plainText);
                        const response = await ior.head();
                        const contentType = response.get('Content-Type');
                        return this.getClassDescriptorByType(contentType, plainText);

                        /* const loadedContent = */
                        // await ior.load();
                        // if (ior.loader.model && ior.loader.model.xhr) {
                        //     const contentType = ior.loader.model.xhr.getResponseHeader('Content-Type');
                        //
                        //     if (contentType.indexOf('image/') === 0) {
                        //         //it's an image
                        //         return {
                        //             url: '/EAMD.ucp/Components/com/twitter/Bootstrap/Image/1.0.0/Image.component.xml',
                        //             model: {
                        //                 src: plainText
                        //             }
                        //         };
                        //     }
                        // }

                    }
                    return null;
                }

                getClassDescriptorByType(type, text) {
                    if (type.indexOf('image') === 0) {
                        return {
                            url: '/EAMD.ucp/Components/com/twitter/Bootstrap/Image/1.0.0/Image.component.xml',
                            model: {
                                src: text
                            }
                        };
                    }
                    return {
                        url: '/EAMD.ucp/Components/tla/EAM/layer2/JavaScriptObject/2.0.0/JavaScriptObject.component.xml',
                        model: {
                            description: "DataTransferItem of Type: " + type,
                            name: type,
                            data: '',
                        }
                    };
                    // return null;
                }

                onDragover(event) {
                    // prevent default to allow drop
                    event.preventDefault();
                }

                onDragenter(event) {
                    // highlight potential drop target when the draggable element enters it
                    UcpComponentSupport.toggleCssClass("onDragenter", document.body, true);
                    if (this.dropTargetContainerElement) {
                        this.dropTargetContainerElement.classList.remove("drop-target");
                        this.dropTargetContainerElement = "";
                    }

                    this.dropTargetContainerElement = UcpComponentSupport.getUcpView4Element(event.target);
                    if (this.dropTargetContainerElement && this.dropTargetContainerElement.container) {
                        console.log("drop target", this.dropTargetContainerElement.ucpComponent.id);
                        let container = this.dropTargetContainerElement.container;

                        this.dropTargetContainerElement = container.element ? container.element : container;
                        this.dropTargetContainerElement.classList.add("drop-target");
                    } else {
                        this.dropTargetContainerElement = event.target;
                        event.target.classList.add("drop-target");
                    }
                }

                onDragleave(event) {
                    // reset background of potential drop target when the draggable element leaves it
                    event.target.classList.remove("drop-target");
                }

                getLastTransferData() {
                    let transferType = Action.theSelection.model.value;
                    let data = this.lastDataTransfer.getData(transferType);
                    Action.do(Workflow.ACTION_NEXT_STEP, "WORKFLOW DND getData done", data, What.ACTION_PUSH);

                }

            });

        var Once = Namespace.declare("tla.EAM.layer1",
            class Once extends Thing {
                static get implements() {
                    return null;
                }
                static start() {
                    //logger.log({ level: "user", category: "ONCE", callback: (m) => { m.level = "console.warn"; return m } }, "update ONCE to log level 'console.warn;");
                    //logger.log({ level: "user", category: "LOADER", callback: (m) => { m.level = "console.warn"; return m } }, "update LOADER to log level 'console.warn;");
                    //logger.log({ level: "user", category: "TYPE", callback: (m) => { m.level = "console.warn"; return m } }, "update TYPE to log level 'console.warn;");

                    logger.log({
                        level: "user",
                        category: "BOOTING"
                    }, "Once uppon a time ONCE made everyThing speak Thinglish...");
                    window.ONCE.Store.register(Once, window.ONCE);
                    window.ONCE.Store.register(document.constructor, document);
                    window.ONCE.Store.register(window.constructor, window);
                    window.ONCE.dropSupport = new DropSupport().init();
                    return "Once uppon a time ONCE made everyThing speak Thinglish...";
                }

                static get dependencies() {
                    this.type.dependencies = this.type.dependencies || [
                        "/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/1.0.0/Thinglish.component.xml",
                        "/EAMD.ucp/Components/com/ceruleanCircle/EAM/2_systems/BasicDataTypes/0.4.0/BasicDataTypes.component.xml",
                        "/EAMD.ucp/Components/tla/EAM/layer1/OnceServices/EventService/1.0.0/EventService.component.xml",
                        "/EAMD.ucp/Components/tla/EAMD/UcpComponentSupport/2.3.2/UcpComponentSupport.component.xml",
                        "/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/2.3.2/src/js/DragDropTouch.js"
                    ];
                    return this.type.dependencies;
                }

                static discover() {
                    return window.ONCE;
                }

                constructor() {
                    super();
                    //        this.package = "tla.EAM.layer1";
                    this.document = document;
                    window.ONCE = window.ONCE || this;
                }

                init(start) {
                    logger.log({
                        level: "user",
                        category: "BOOTING"
                    }, "ONCE started... now initializing");

                    return Thinglish.startDependencies(this.constructor)
                        .then(() => {
                            if (start) {
                                start();
                            }
                            return this;
                        });

                }

                now() {
                    if (ONCE.global.performance == undefined) {
                        //console.warn('No ONCE.global.performance');
                        return Date.now();
                    }
                    return ONCE.global.performance.now() + ONCE.global.performance.timing.navigationStart;
                }

                discover(aType) {
                    let result = window.ONCE.Store.lookup(aType);
                    if (Array.isArray(result) && result.length == 1)
                        result = result[0];
                    return result;
                }
                register(aType, anImplementation) {
                    return ONCE.Store.register(aType, anImplementation);
                }


                async start(classOrIOR) {
                    if (Thinglish.isClass(classOrIOR)) {
                        await Thinglish.loadAndStartAll(classOrIOR);
                        if (window.LessSingleton) {
                            let reult = await LessSingleton.compile();
                        }
                        if (window.ONCE.eventSupport)
                            window.ONCE.eventSupport.fire("newThing", this, classOrIOR);
                        return classOrIOR;
                    }

                    if (typeof classOrIOR === "string") {
                        classOrIOR = new IOR().init(classOrIOR);
                    }

                    if (classOrIOR instanceof IOR) {
                        // TODO: @Marcel Compare with 3.1
                        //debugger;
                        await Thinglish.startThing(classOrIOR);
                        if (window.LessSingleton) {
                            let reult = await LessSingleton.compile();
                        }
                        return classOrIOR.class;
                    }
                    return undefined;
                }

                lookupClass4Descriptor(descriptorUrl) {
                    return Namespaces.lookup(EAMDucpLoaderSingleton.path2namespace(descriptorUrl));
                }

                newThing(event, thing) {
                    console.info("new Thing Event:", thing.name);
                }



            });


        var logger = new DefaultLogger();
        logger.forceLogger();
        //production mode
        //logger.level = DefaultLogger.LEVELS["silent"];

        //dev mode
        logger.level = DefaultLogger.LEVELS["log"];

        try {
            if (!preventOnceInit) {
                new Once().init();
            }

            if (window.frameElement && iframeSupport) {
                var rootWindow = window.frameElement.contentWindow.parent;
                rootWindow.ONCE.Store.register(Once, ONCE);
            }
            ONCE.global = window;
            ONCE.assumeOffline = true;
            //ONCE.requestFailed = {status: true, onLine: false, areadyWarned: true}

            /*
                        Object.defineProperty(HTMLElement, "ucpView", {
                                    enumerable: false,
                                    configurable: true,
                                    get: () => {
                                    return UcpComponentSupport.getUcpView4Element(this);
                                    },
                                    set: (newValue) => {}
                        });
            */
        } catch (err) {
            logger.logError(err);
        }

    }
}
