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



/* global Namespaces, StructrObject, ArraySet, Thing, JavaScriptObjectDescriptor, JavaScriptObject */
//var Namespace = Namespaces.constructor;

ONCE.global.Thinglish = Namespace.declare(
    class Thinglish extends ONCE.global.Thinglish {

        static get implements() {
            return [];
        }
        static get weBeanUnitPaths() {
            return [];
        }
        static start() {
            this._private = {};
            /*
            var Loader = Object.getPrototypeOf(Namespaces.loader.constructor).name;
            if (Loader && Loader !== "") {
                Loader = Object.getPrototypeOf(Namespaces.loader.constructor);
            } else {
                return;
            }

            Namespace.bootstrapLoaderInterface("tla.EAM.layer3.OnceServices", Loader);
            */

            //Thinglish.implement(Namespaces.loader, Loader);
            //Thinglish.implement(this.IOR.loader, Loader);
            /*
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
            window.Any = Thinglish.ANY;
            */
            if (!ONCE.model == Once.MODE_NODE_SERVER) {
                (function (supported) { // some browsers don't support this property of Node
                    if (supported) {
                        return;
                    }
                    Object.defineProperty(window.Node.prototype, 'isConnected', {
                        get
                    });

                    function get() {
                        return document.contains(this);
                    }
                })('isConnected' in window.Node.prototype);
            }


            //Array.prototype.first = new Function(" return this[0];");
            //Array.prototype.last = new Function(" return this[this.length-1];");

            /*
            var test = Namespaces.test.Thinglish.Test.getInstance();
            test.untypedMethod(
                "Hallo Welt",
                3,
                test.untypedMethod,
                Namespaces.loader,
                test
            );
           */
            ONCE.global.Any = this.ANY;

        }

        static get SILENT_ON_TYPE_ERROR() {
            return "0";
        }
        static get WARN_ON_TYPE_ERROR() {
            return "1";
        }
        static get STOP_ON_TYPE_ERROR() {
            return "2";
        }
        static get VERBOSE_ON_TYPE_ERROR() {
            return "3";
        }
        static get onTypeError() {
            if (!Thinglish._onTypeError)
                Thinglish._onTypeError = Thinglish.VERBOSE_ON_TYPE_ERROR;
            return Thinglish._onTypeError;
        }
        static set onTypeError(value) {
            Thinglish._onTypeError = value;
        }


        constructor() {
            console.debug("Thinglish is unloadable");
        }

        init() {
            super.init();
            return Object.freeze(object);
        }


        static discover(anInterface) {
            const result = new Set();
            anInterface = anInterface || this;
            const implementations = anInterface.type.implementations;
            if (implementations) {
                implementations.forEach(i => {
                    result.add(i);
                });
            }
            return Array.from(result);
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

        static getTypeName(object) {
            if (!object) {
                let typename = typeof object;
                switch (typename) {
                    case "object":
                        if (object === undefined)
                            return "undefined object";
                        if (object === null)
                            return "empty object";
                    default:
                        return typename;
                }

            }
            // @ToDo Bene to Marcel. Please check that
            if (object?.type?.class?.name) return object.type.class.name;

            let fullTypeName = Thinglish.getFullTypeName(object);
            if (fullTypeName) {
                return /*(Thinglish.isClass(object)?"class ":"")+*/ fullTypeName.substr(fullTypeName.lastIndexOf(".") + 1);
            } else {
                return null;
            }
        }


        static getFullTypeName(object) {
            var typeName = Thinglish.lookupInObject(object, "type.name");
            var typeNameDetails = null;

            if (object === undefined) {
                return null;
            }

            if (Thinglish.isClass(object)) {
                typeName = "class ";
            }

            if (Array.isArray(object)) {
                if (object.length === 0) {
                    typeName = "Empty Array";
                    object = null;
                } else {
                    typeName = "Array of ";
                    typeNameDetails = Thinglish.getTypeName(object[0]);
                    object = object[0];
                }
            }


            if (!typeName) {
                typeName = "";
            }

            if (!typeName && object && object.typeName && typeof object.typeName === "string") {
                typeNameDetails = object.typeName;
            }

            if (!typeNameDetails && object)
                typeNameDetails = object[Symbol.toStringTag];

            if (!typeNameDetails && object)
                typeNameDetails = object.constructor.name;

            if (typeNameDetails === "Function" && object.name) {
                typeNameDetails = object.name;
                if (!Thinglish.isClass(object)) {
                    typeName = "function ";
                } else typeNameDetails = object.package;
            }

            if (!typeNameDetails && object)
                typeNameDetails = this.constructor.name + "of undefined type";

            if (typeof StructrObject != "undefined" && object instanceof StructrObject)
                typeNameDetails = "StructrObject: " + object.structrType;
            if (object && object.type && typeof object.type === "string")
                typeNameDetails = object.type;

            if (!typeNameDetails || typeName.endsWith(typeNameDetails))
                typeNameDetails = "";

            return typeName + typeNameDetails;
        }

        static get ANY() {
            return Object.freeze(class Any { })
        };

        static get AsyncFunction() { return Object.getPrototypeOf(async function () { }).constructor }

        static stringToHash(string) {
            let hash = 0, i, chr;
            if (string.length === 0) return hash;
            for (i = 0; i < string.length; i++) {
                chr = string.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }

        static async sha256(message) {

            // encode as UTF-8
            const msgBuffer = new TextEncoder('utf-8').encode(message);

            // hash the message
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

            // convert ArrayBuffer to Array
            const hashArray = Array.from(new Uint8Array(hashBuffer));

            // convert bytes to hex string
            const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
            return hashHex;
        }

        static serialize2IORDataStructure(data2convert, keyFilter = []) {
            if (!data2convert) return null;

            let convert2IORStructure = (data, visitorList = []) => {
                if (Thinglish.isPrimitive(data)) return data;

                let responseData = (Array.isArray(data) ? [] : {});

                if (visitorList.indexOf(data) !== -1) {
                    throw new Error("Loop in iorDataStructure serialize found!", data);
                }
                visitorList.push(data);


                Object.keys(data).forEach(key => {
                    //if (key.startsWith("_") || key == "ucpComponent") return;
                    let currentValue = data[key];

                    if (keyFilter.indexOf(key) !== -1) {
                        return;

                    } else if (Thinglish.isPrimitive(currentValue)) {
                        responseData[key] = currentValue;

                    } else if (currentValue && currentValue.IOR && currentValue.IOR.url) {
                        responseData[key] = currentValue.IOR.url;

                    } else if (Thinglish.isTypeOf(currentValue, UcpComponent)) {
                        responseData[key] = currentValue.IOR.url;

                    } else if (currentValue.type && currentValue.type.class && currentValue.type.class.name && currentValue.type.class.name == "EmptyRelationship") {
                        responseData[key] = {};

                    } else if (currentValue instanceof IOR) {
                        responseData[key] = currentValue.href;
                    } else if (typeof currentValue == "function") {
                        return
                    } else {
                        responseData[key] = convert2IORStructure(currentValue, visitorList);
                    }
                })

                return responseData;
            }

            return convert2IORStructure(data2convert);
        }

        static jsonCopy(source, target) {
            if (!source) {
                return undefined;
            }
            return Object.getOwnPropertyNames(target).reduce((result, key) => {
                if (source[key] !== undefined) {
                    target[key] = source[key];
                }
                return result;
            }, target);
        }

        static toJSONvalue(object) {
            switch (Thinglish.getTypeName(object)) {
                case "undefined object":
                    return null;
                case "empty object":
                    return null;

                case "String":
                    try {
                        object = JSON.parse(routeJSON);
                    }
                    catch (error) {
                        console.warn(routeJSON, "is not a valid JSON...but maybe should not at all be...");
                    }
                case "Object":
                    return object;

                default:
                    return object;

            }

        }

        static getOwnDescriptors(object) {
            var descriptors = [];
            var c = object;

            let pd = Object.getOwnPropertyDescriptors(c);
            var names = Object.keys(pd);
            for (var m in names) {
                //console.debug(names[m]);
                var descriptor = {
                    name: names[m],
                    kind: "",
                    object: c,
                    method2Call: undefined,
                    type: {
                        name: c.constructor.name,
                        class: c.constructor
                    }
                };
                descriptor.typeName = descriptor.type.name;

                if (pd[descriptor.name].value && typeof pd[descriptor.name].value === "function") {
                    descriptor.feature = "method";
                    descriptor.method2Call = pd[descriptor.name].value;
                } else {
                    if (pd[descriptor.name].value) {
                        if (typeof pd[descriptor.name].value === "object") {
                            if (Array.isArray(pd[descriptor.name].value)) descriptor.feature = "collection";
                            else descriptor.feature = "relationship";
                        } else descriptor.feature = "attribute";
                    } else descriptor.feature = "property";
                    descriptor.property = pd[descriptor.name];
                }
                descriptors.push(descriptor);

                //console.info("getOwnDescriptors", descriptor.feature, descriptor.type.name +"."+ descriptor.name, descriptor);

            }
            return descriptors;
        }

        static getOwnMethodDescriptors(object) {
            const c = Object.getPrototypeOf(object);
            const descriptors = Thinglish.getOwnDescriptors(c);
            const methods = descriptors.filter(d => d.feature === "method");
            return methods;
        }

        static getAllMethodDescriptors(object) {
            var methods = [];
            var c = object;
            while (c.constructor.name !== "Object" && c.constructor.name !== "Thing") {

                methods = methods.concat(this.getOwnMethodDescriptors(c));
                c = Object.getPrototypeOf(c);
            }

            return methods;
        }

        static getAllDescriptors(object) {
            var descriptors = [];
            var c = object;
            while (c.constructor.name !== "Object" && c.constructor.name !== "Thing" && c.constructor.name !== "Interface") {
                let ownDescriptors = this.getOwnDescriptors(c);
                ownDescriptors.forEach(d => {
                    d.super = d.object;
                    d.object = object;
                });
                descriptors = descriptors.concat(ownDescriptors);
                c = Object.getPrototypeOf(c);
            }

            return descriptors;
        }


        static createPromise(timeoutMS, timeoutCallback) {
            // Need to create a native Promise which also preserves the
            // interface of the custom promise type previously used by the API
            const p = {
                setSuccess: function (result) {
                    clearTimeout(p.timeout);
                    p.resolve(result);
                },

                setError: function (result) {
                    clearTimeout(p.timeout);
                    p.reject(result);
                }
            };
            p.promise = new Promise(function (resolve, reject) {
                p.resolve = resolve;
                p.reject = reject;
            });


            if (timeoutMS > 0) {
                const timeoutFunction = function () {
                    if (timeoutCallback) {
                        timeoutCallback(p);
                    } else {
                        p.setError(`Timeout after ${timeoutMS} milliseconds`)
                    }
                }
                p.timeout = setTimeout(timeoutFunction, timeoutMS);
            }
            return p;
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


        static definePrivateAttribute(object, name, defaultValue) {
            Object.defineProperty(object, name, {
                enumerable: false,
                configurable: false,
                writable: true,
                value: defaultValue
            });
        }

        static defineProperty(object, name, defaultValue, onWillChange) {
            var _propertyValue = defaultValue;
            if (!onWillChange)
                onWillChange = object.defaultOnChange;
            var _onWillChangeFunction = onWillChange;

            Object.defineProperty(object, name, {
                enumerable: false,
                configurable: true,
                get: () => {
                    return _propertyValue;
                },
                set: newValue => {
                    console.debug("set '" + name + "' to '" + newValue + "'");
                    if (_onWillChangeFunction) {
                        newValue = _onWillChangeFunction(name, _propertyValue, newValue);
                    }
                    _propertyValue = newValue;
                }
            });
        }


        static async defineWeBeanProperty(ucpView, weBeanProperty, parentUcpView = ucpView.parent) {

            let _ucpView = ucpView;
            let _weBeanProperty = weBeanProperty;
            let webBeanPropertyId = _ucpView.viewId + "_" + weBeanProperty;

            let _initCallbackName = "onInit" + ("_" + _weBeanProperty).toCamelCase();
            let _changeCallbackName = "onChange" + ("_" + _weBeanProperty).toCamelCase();

            _ucpView.weBeanProperty = weBeanProperty;

            Object.defineProperty(parentUcpView, weBeanProperty + "Element", {
                enumerable: false,
                configurable: true,
                get: () => {
                    //return _ucpView.lookupWebBeanPropertyId(_weBeanProperty);
                    return _ucpView.documentElement;
                },
                set: newValue => {
                    console.warn("set '" + _weBeanProperty + "Element' to '" + newValue + "' is not supported");
                }
            });
            Object.defineProperty(parentUcpView, weBeanProperty, {
                enumerable: false,
                configurable: true,
                get: () => {
                    //return _ucpView.lookupWebBeanPropertyId(_weBeanProperty).ucpView;

                    return _ucpView;
                },
                set: newValue => {
                    console.warn("set '" + _weBeanProperty + "' to '" + newValue + "' is not supported");
                    if (_ucpView.isDomReady !== true && parentUcpView[_changeCallbackName] instanceof Function)
                        parentUcpView[_changeCallbackName]();
                }
            });
            Object.defineProperty(parentUcpView.ucpComponent, weBeanProperty, {
                enumerable: false,
                configurable: true,
                get: () => {
                    //return _ucpView.lookupWebBeanPropertyId(_weBeanProperty).ucpView;
                    return _ucpView.ucpComponent;
                },
                set: newValue => {
                    console.warn("set '" + _weBeanProperty + "' to '" + newValue + "' is not supported");
                    if (_ucpView.isDomReady !== true && parentUcpView.ucpComponent[_changeCallbackName] instanceof Function)
                        parentUcpView.ucpComponent[_changeCallbackName](_ucpView);
                }
            });

            if (_ucpView.isDomReady !== true && parentUcpView.ucpComponent[_initCallbackName] instanceof Function)
                parentUcpView.ucpComponent[_initCallbackName](_ucpView);

            if (_ucpView.isDomReady !== true && parentUcpView[_initCallbackName] instanceof Function)
                parentUcpView[_initCallbackName]();

            await _ucpView.startRendering()
            _ucpView.documentElement.setAttribute("webBeanPropertyId".toDash(), webBeanPropertyId);
            _ucpView.documentElement.setAttribute("webeanProperty".toDash(), weBeanProperty);

        }

        static getPropertyOverwrite(object, propertyName) {
            if (!object) return null;
            let prototype = Object.getPrototypeOf(object);
            if (prototype == null) return null;

            return Object.getOwnPropertyDescriptor(prototype, propertyName);
        }


        static addLazyGetter(...args) {
            return Namespaces.tmp.light.Thinglish.addLazyGetter(...args);
        }

        static addConstant(object, name, constantValue) {
            Object.defineProperty(object, name, {
                enumerable: true,
                configurable: false,
                value: constantValue
            });
        }

        /*
        static fireMouseEvent(type, elem, centerX, centerY) {
          const event = document.createEvent('MouseEvents');
          event.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
          elem.dispatchEvent(event);
          return event;
        }
        
        static triggerDragAndDrop(selectorDrag, selectorDrop) {
        
            // fetch target elements
            const elemDrag = selectorDrag instanceof HTMLElement ? selectorDrag: document.querySelector(selectorDrag);
            const elemDrop = selectorDrop instanceof HTMLElement ? selectorDrop : document.querySelector(selectorDrop);
            if (!elemDrag || !elemDrop) {
                return false;
            }
        
            // calculate positions
            let pos = elemDrag.getBoundingClientRect();
            const center1X = Math.floor((pos.left + pos.right) / 2);
            const center1Y = Math.floor((pos.top + pos.bottom) / 2);
            pos = elemDrop.getBoundingClientRect();
            const center2X = Math.floor((pos.left + pos.right) / 2);
            const center2Y = Math.floor((pos.top + pos.bottom) / 2);
        
        
            // mouse over dragged element and mousedown
            Thinglish.fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
            Thinglish.fireMouseEvent('mouseenter', elemDrag, center1X, center1Y);
            Thinglish.fireMouseEvent('mouseover', elemDrag, center1X, center1Y);
            Thinglish.fireMouseEvent('mousedown', elemDrag, center1X, center1Y);
        
            // start dragging process over to drop target
            Thinglish.fireMouseEvent('dragstart', elemDrag, center1X, center1Y);
            Thinglish.fireMouseEvent('drag', elemDrag, center1X, center1Y);
            Thinglish.fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
            Thinglish.fireMouseEvent('drag', elemDrag, center2X, center2Y);
            Thinglish.fireMouseEvent('mousemove', elemDrop, center2X, center2Y);
        
            // trigger dragging process on top of drop target
            Thinglish.fireMouseEvent('mouseenter', elemDrop, center2X, center2Y);
            Thinglish.fireMouseEvent('dragenter', elemDrop, center2X, center2Y);
            Thinglish.fireMouseEvent('mouseover', elemDrop, center2X, center2Y);
            Thinglish.fireMouseEvent('dragover', elemDrop, center2X, center2Y);
        
            // release dragged element on top of drop target
            Thinglish.fireMouseEvent('drop', elemDrop, center2X, center2Y);
            Thinglish.fireMouseEvent('dragend', elemDrag, center2X, center2Y);
            Thinglish.fireMouseEvent('mouseup', elemDrag, center2X, center2Y);
        
            return true;
        }
        */


        defaultOnChange(name, oldValue, newValue) {
            console.debug("property '" + name + "' changes from '" + oldValue + "' to '" + newValue + "'");
            return newValue;
        }


        static addTypeing(theFunctionOwner, theFunction, theArguments) {
            if (theFunction.name === "bound defaultTypedFunction") return;

            var newTypedFunction = new TypedFunction().init(theFunctionOwner, theArguments, theFunction);
            theFunctionOwner[theFunction.name] = newTypedFunction.defaultTypedFunction.bind(newTypedFunction);
        }

        static isDomElement(obj) {
            try {
                //Using W3 DOM2 (works for FF, Opera and Chrome)
                return obj instanceof HTMLElement;
            }
            catch (e) {
                //Browsers not supporting W3 DOM2 don't have HTMLElement and
                //an exception is thrown and we end up here. Testing some
                //properties that all elements have (works on IE7)
                return (typeof obj === "object") &&
                    (obj.nodeType === 1) && (typeof obj.style === "object") &&
                    (typeof obj.ownerDocument === "object");
            }
        }

        static isInterface(anInterface, createInterface) {
            if (!anInterface.type)
                Thinglish.initType(anInterface);
            if (createInterface) {
                anInterface.type.extends = Interface;
            }
            return Thinglish.isTypeOf(anInterface, Interface);
        }

        static isClass(aClass) {
            if (!aClass) return false;

            if (Array.isArray(aClass)) return false;

            if (!aClass instanceof Function) return false;

            if (!aClass.toString) return false;

            const string = aClass.toString();

            if (!string) return false;

            return string.substring(0, 6) === 'class ';
        }
        isClass(aClass) {
            if (!aClass)
                aClass = this;
            return Thinglish.isClass(aClass);
        }

        static isFunction(aFunction) {
            return typeof (aFunction) === "function";
        }

        static isPrimitive(aPrimitive) {
            return (aPrimitive !== Object(aPrimitive)) ||
                (typeof (aPrimitive) === "string" || aPrimitive instanceof String) ||
                (typeof (aPrimitive) === "number" || aPrimitive instanceof Number) ||
                (typeof (aPrimitive) === "boolean" || aPrimitive instanceof Boolean);
        }

        static isEmpty(object) {
            let result = false;
            if (!object) return true;
            if (ONCE.global["EmptyRelationship"] && object.constructor.name === EmptyRelationship.name) return true;
            if (ONCE.global["EmptyCollection"] && object.constructor.name === EmptyCollection.name) return true;
            return result;
        }

        static getCompatibleTypes(oneClass, otherClass) {
            let oneTypes = Thinglish.getAllTypes(oneClass);
            let otherTypes = Thinglish.getAllTypes(otherClass);
            let compatibleTypes = new ArraySet();
            oneTypes.forEach(t => {
                if (otherTypes.indexOf(t) !== -1) {
                    compatibleTypes.push(t);
                }
            });
            return compatibleTypes;
        }

        static getOwnPropertyDescriptorArray(object) {
            const ownPropertyDescriptors = Object.getOwnPropertyDescriptors(object);
            const array = [];
            for (let prop in ownPropertyDescriptors) {
                ownPropertyDescriptors[prop].propertyName = prop;
                array.push(ownPropertyDescriptors[prop]);
            }
            if (array.length === 0) {
                for (let prop in object) { // how it is possible?
                    if (prop) {
                        array.push({
                            propertyName: prop,
                            value: object[prop]
                        });
                    }
                }
            }
            return array;
        }

        static cloneValue(source, target, template) {
            this.getOwnPropertyDescriptorArray(source).forEach(
                descriptor => {
                    if (!descriptor.propertyName.startsWith("_")) {
                        if (template) {
                            if (template[descriptor.propertyName] !== undefined) {
                                target[descriptor.propertyName] = source[descriptor.propertyName];
                            }
                        } else {
                            target[descriptor.propertyName] = source[descriptor.propertyName];
                        }
                    }
                });
            return target;
        }

        static combineValue(source, newValue) {
            this.getOwnPropertyDescriptorArray(source).forEach(
                descriptor => {
                    if (newValue[descriptor.propertyName] === undefined)
                        newValue[descriptor.propertyName] = source[descriptor.propertyName];
                });
            return newValue;
        }

        static getDescriptor(object, merge, force) {
            if (force === undefined) {
                force = true;
            }
            let jsd = JavaScriptObjectDescriptor.describe(object, merge, force);
            if (object instanceof UcpComponent) {
                if (!object.ucpModel) {
                    // Component is not initialized!
                    return undefined;
                }
                let modelJsd = JavaScriptObjectDescriptor.describe(object.ucpModel.model, merge, force);
                modelJsd.attributes.forEach(pd => {
                    if (!jsd.propertyIndex[pd.name]) {
                        if (!pd.name.startsWith("model.")) pd.name = "model." + pd.name;
                        jsd.attributeIndex[pd.name] = pd;
                        if (!jsd.featureIndex[pd.name]) jsd.featureIndex[pd.name.replace("model.", "")] = pd.feature;
                    }
                });
                modelJsd.properties.forEach(pd => {
                    if (!pd.name.startsWith("model.")) pd.name = "model." + pd.name;
                    jsd.propertyIndex[pd.name] = pd;
                    if (!jsd.featureIndex[pd.name]) jsd.featureIndex[pd.name.replace("model.", "")] = pd.feature;
                });
                modelJsd.relationships.forEach(pd => {
                    if (!pd.name.startsWith("model.")) pd.name = "model." + pd.name;
                    jsd.relationshipIndex[pd.name] = pd;
                    if (!jsd.featureIndex[pd.name]) jsd.featureIndex[pd.name.replace("model.", "")] = pd.feature;
                });
                modelJsd.collections.forEach(pd => {
                    if (!pd.name.startsWith("model.")) pd.name = "model." + pd.name;
                    jsd.collectionIndex[pd.name] = pd;
                    if (!jsd.featureIndex[pd.name]) jsd.featureIndex[pd.name.replace("model.", "")] = pd.feature;
                });
                modelJsd.methods.forEach(pd => {
                    if (!pd.name.startsWith("model.")) pd.name = "model." + pd.name;
                    jsd.methodIndex[pd.name] = pd;
                    if (!jsd.featureIndex[pd.name]) jsd.featureIndex[pd.name.replace("model.", "")] = pd.feature;
                });

            }
            return jsd;
        }

        static getName(object) {
            let name = undefined;
            if (!object)
                object = this;

            if (object instanceof UcpView) {
                name = object.name;
                object = object.ucpComponent;
            }

            if (object instanceof JavaScriptObject)
                object = object.ucpModel.model;



            if (!name) name = object[Symbol.toStringTag];
            if (!name && Array.isArray(object) && object.length > 0) {
                let arrayTypeName = object[0].constructor.name;
                if (arrayTypeName === "Function" && Thinglish.isClass(object[0])) arrayTypeName = "Classes";
                name = "Array of " + arrayTypeName;
            }

            if (!name && object.ucpModel && object.ucpModel.model && object.ucpModel.model.name) name = object.ucpModel.model.name;
            if (!name && object._private) name = object._private.name;
            if (!name) name = object.name;
            if (!name) name = object.title;
            if (!name && !Thinglish.isClass(object)) name = object.constructor.name;

            return name;
        }
        static setName(object, secondParameter) {
            let newValue = secondParameter;
            if (!newValue) {
                newValue = object;
                object = this;
            }

            object.name = newValue;
        }

        static getDisplayName(object) {
            if (!object) object = this;

            if (object instanceof JavaScriptObject)
                object = object.ucpModel.model;

            let name = object.displayName;
            if (!name && object.model) name = object.model.displayName;
            if (!name && object.ucpComponent)
                name = object.ucpComponent.displayName;
            if (!name)
                name = Thinglish.getName(object);
            return name;
        }
        static getBadge(object) {
            if (!object) object = this;
            return object.badge;
        }
        static getDescription(object) {
            if (!object) object = this;
            return object.description;
        }

        static super(object, anInterface) {

            if (object.type && object.type.implements && object.type.implements.indexOf(anInterface) == -1) {
                console.warn(object.type.name, "does not implement ", anInterface.name, "! Thinglis.super NOT executed...");
                return;
            }
            if (!object._private.interfaces) object._private.interfaces = {};
            if (object._private.interfaces[anInterface.name]) {
                //console.warn(object.type.name,"is already initialized with ",anInterface.name, "! Thinglis.super NOT executed...");
                return;
            }

            const typeMaches = Thinglish.isTypeOf(anInterface, Interface);
            if (!typeMaches) {
                Thinglish.throwTypeError("anInterface", anInterface, "Interface",
                    "Implement " + anInterface.name + "  "
                );
            }

            const prototype = anInterface.prototype ? Object.getOwnPropertyDescriptors(anInterface.prototype) : null;

            let descriptor = null;
            let objectPrototype = Object.getPrototypeOf(object);
            let objectProperty = null;
            if (!object.type) {
                Thinglish.initType(object);
            }
            let objectDescriptors = Thinglish.getAllDescriptors(object);

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

                if (!object._private.interfaces[anInterface.name]) object._private.interfaces[anInterface.name] = {
                    eamLayer: 3
                };
                if (descriptor.value) // @todo assign the original function of the interface
                    object._private.interfaces[anInterface.name][name] = descriptor.value.bind(object);
                else
                    if (!object._private.interfaces[anInterface.name][name])
                        object._private.interfaces[anInterface.name][name] = anInterface.name + "." + name + "() not found. Its a property.";


            }
        }

        // single Interface action index
        static createActionIndex(anInterface) {
            let props = Object.getOwnPropertyDescriptors(anInterface);
            let workflowConst = Object.keys(props).filter(name => name.startsWith("WORKFLOW_"));
            let actionConst = Object.keys(props).filter(name => name.startsWith("ACTION_"));
            let actions = workflowConst.concat(actionConst).map(name => {
                return {
                    name: name,
                    value: props[name].get(),
                    descriptor: props[name]
                };
            });

            let actionIndex = actions.reduce(
                (result, current /*, index, array*/) => {
                    let action = Action.parse(current.value);
                    //action.setObject(forThisObject);
                    result[current.name] = action;
                    if (action.visibility === "public" && Action.theWorkflow)
                        Action.theWorkflow.registerAction(action);
                    return result;
                }, {} /*initial result*/);

            if (!anInterface.type.actionIndex)
                anInterface.type.actionIndex = actionIndex;


            return actions;
        }

        // Adds a Action to an existing ActionIndex
        static addAction2ActionIndex(actionName, actionString, forThisObject) {
            let action = Action.parse(actionString);
            action.setObject(forThisObject);
            if (action.visibility === "public" && Action.theWorkflow) Action.theWorkflow.registerAction(action);
            forThisObject.actionIndex[actionName] = action;
            return action;
        }

        // Interface hirarchy action index
        static createActionIndexOf(anInterface, forThisObject) {
            let allInterfaces = Thinglish.getAllTypes(anInterface);

            let allActions = null;
            if (Array.isArray(allInterfaces)) {
                //if (allInterfaces.indexOf(anInterface) == -1) 
                //    allInterfaces.push(anInterface);
                allActions = allInterfaces.map(anInterface => Thinglish.createActionIndex(anInterface, forThisObject));
            }
            else
                allActions = Thinglish.createActionIndex(anInterface);

            //@TODO fix for serverside
            let actions = Array.prototype.concat.apply([], allActions);



            let actionIndex = actions.reduce(
                (result, current /*, index, array*/) => {
                    let action = Action.parse(current.value);
                    action.setObject(forThisObject);
                    result[current.name] = action;
                    if (action.visibility === "public" && Action.theWorkflow)
                        Action.theWorkflow.registerAction(action);
                    return result;
                }, {} /*initial result*/);

            /*
            let type = Thinglish.lookupInObject(forThisObject, "type.originalClass.type.actionIndex");
            if (type && !Object.keys(type).length)
                    forThisObject.type.originalClass.type.actionIndex = actionIndex;
            
            type = Thinglish.lookupInObject(forThisObject, "type.actionIndex");
            if (!Object.keys(type).length)
                    forThisObject.type.actionIndex = actionIndex;
            */

            // Add existing Actions
            if (forThisObject.actionIndex) {
                actionIndex = { ...forThisObject.actionIndex, ...actionIndex, }
            }

            return actionIndex;
        }

        static getCookie(name) {
            const matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }

        static text2DomElement(text) {
            let divTemplate = document.createElement('div');
            divTemplate.innerHTML = text;
            const element = divTemplate.children[0];
            // Remove it as the parent of element should not be a div
            divTemplate.removeChild(element);
            return element;
        }

        static setCookie(name, value, options) {
            options = options || {};

            let {
                expires
            } = options;

            if (expires && typeof expires === "number") {
                const d = new Date();
                d.setTime(d.getTime() + expires * 1000);
                expires = options.expires = d;
            }
            if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
            }

            if (typeof value === "object")
                value = JSON.stringify(value);

            value = encodeURIComponent(value);

            let updatedCookie = `${name}=${value}`;

            for (let propName in options) {
                updatedCookie += "; " + propName;
                const propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }

            document.cookie = updatedCookie;
        }

        static nexttick() {
            return Thinglish.wait(0);
        }


        static initRecursion(argIndexOfRecursiveObject, recursiveFunction, ...args) {
            let recursiveObject = arguments[argIndexOfRecursiveObject];
            if (Thinglish._private.currentRecursion) {
                console.error("Already in a recusion: ", Thinglish._private.currentRecursion);
                return null;
            }
            Thinglish._private.currentRecursion = {
                loopArray: [],
                argIndexOfRecursiveObject,
                recursiveFunction
            };
            try {
                return recursiveFunction(...args);
            } catch (error) {
                console.error(error);
                Thinglish.cleanupRecursion();
                return error;
            }
        }

        static recursion(currentObject, ...args) {
            let currentRecursion = Thinglish._private.currentRecursion;
            if (!currentRecursion) {
                console.error("no current Recursion. pleas init one...");
                return null;
            }

            let nextObject = args[Thinglish._private.currentRecursion.argIndexOfRecursiveObject];
            if (nextObject instanceof EmptyRelationship)
                return null;


            if (currentRecursion.loopArray.indexOf(nextObject) !== -1) {
                console.warn("recursion infinite loop detected on ", currentObject, "in", currentRecursion);
                currentRecursion.infiniteObject = nextObject;
                return Infinity;
            }
            currentRecursion.loopArray.push(currentObject);
            return Thinglish._private.currentRecursion.recursiveFunction(...args);
        }
        static cleanupRecursion() {
            Thinglish._private.currentRecursion = null;
        }


    }
);



var TypedFunction = Namespace.declare(null,
    class TypedFunction {
        static get implements() {
            return null;
        }
        constructor() {
            this.name = "uninitalizedTypedFunction";
            //                Object.defineProperty(this,"name",{value:untypedFunction.name, writable:false})
            this.type = {
                name: this.constructor.name,
                "extends": ["function"]
            };
            this.owner = null;
            this.untypedFunction = null;
            this.argumentTypes = null;
        }
        init(owner, argumentDescriptor, untypedFunction) {
            this.name = this.defaultTypedFunction;
            this.owner = owner;

            this.untypedFunction = untypedFunction;
            this.argumentDescriptor = argumentDescriptor;
            this.argumentTypes = [];
            this.argumentNames = [];
            this.returnDescriptor = null;
            for (var name in argumentDescriptor) {
                //console.log(name + ": " + argumentDescriptor[name]);
                if (name !== "return") {
                    this.argumentNames.push(name);
                    this.argumentTypes.push(argumentDescriptor[name]);
                } else
                    this.returnDescriptor = {
                        "return": argumentDescriptor[name]
                    };
            }

            return this;
        }

        defaultTypedFunction() {

            //console.log(this.type.name + " defaultTypedFunction arguments:"
            var expectedArgType = this.argumentTypes;

            if (arguments.length !== expectedArgType.length)
                Thinglish.throwTypeError(expectedArgType, arguments.length, expectedArgType.length,
                    "call " + this.owner.type.name + "." + this.untypedFunction.name + "( WRONG NUMBER OF ARGUMENTS )   "
                )

            var argValue = null;
            var argName = null;
            var argType = null;
            for (var argIndex in arguments) {
                argValue = arguments[argIndex];
                argName = this.argumentNames[argIndex];
                argType = typeof argValue;
                expectedArgType = this.argumentTypes[argIndex];

                var typeMaches = Thinglish.isInstanceOf(argValue, expectedArgType, false);
                if (!typeMaches) {
                    Thinglish.throwTypeError(argName, argValue, expectedArgType,
                        "call " + this.owner.type.name + "." + this.untypedFunction.name + "(...Parameter#" + argIndex + " " + argName + ", ...)   "
                    )
                }

            }
            var result = this.untypedFunction.apply(this.owner, arguments);
            if (this.returnDescriptor) {
                var typeMaches = Thinglish.isInstanceOf(result, this.returnDescriptor.return, false);
                if (!typeMaches) {
                    Thinglish.throwTypeError(argName, argValue, expectedArgType,
                        "Invalid ReturnType " + this.owner.type.name + "." + this.untypedFunction.name + "():" + this.returnDescriptor.return + "   "
                    )
                }
            }
        }
    }
);




var TestInterface = Namespace.declare(null,
    class TestInterface extends Interface {
        constructor() {
            //            throw Error("cannot instanciate an interface: " + this.constructor.name);
            super();
        }
        init() {
            //throw Error("cannot instanciate an interface: " + this.constructor.name);
            return this;
        }
        testInterfaceMethod() {
            return "TestInferface Hello World";
        }
    }
);


Namespace.declare(null,
    class Test extends Thing {
        static get implements() {
            return [TestInterface];
        }
        constructor() {
            super();
            //Thinglish.implement(this, TestInterface);

            Thinglish.addTypeing(this, this.untypedMethod, {
                aString: "string",
                aNumber: "number",
                aFunction: "function",
                anLoader: "Loader",
                aThing: "Thing",
                "return": "Promise"
            });

        }
        init() {
            return this;
        }

        untypedMethod(aString, aNuber, aFunction, anInterface, aThing) {
            console.debug(this.type.name + " untypedMethod arguments:")
            for (var a in arguments) {
                console.debug(a + ": " + arguments[a]);
            }
        }
    }
);
