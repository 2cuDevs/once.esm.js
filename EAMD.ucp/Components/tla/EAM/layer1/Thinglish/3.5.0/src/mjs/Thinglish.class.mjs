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

class Thinglish {

    static get implements() {
        return [];
    }
    static start() {
        this._private = {};
        var Loader = Object.getPrototypeOf(Namespaces.loader.constructor).name;
        if (Loader && Loader !== "") {
            Loader = Object.getPrototypeOf(Namespaces.loader.constructor);
        } else {
            return;
        }

        Namespace.bootstrapLoaderInterface("tla.EAM.layer3.OnceServices", Loader);

        Thinglish._addImplementation(VersionNamespace, Version);
        Thinglish._addInterface(VersionNamespace.type, Version);

        //Thinglish.implement(Namespaces.loader, Loader);
        //Thinglish.implement(this.IOR.loader, Loader);
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
        const result = new ArraySet();
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
            if (typeNameDetails === "Any") {
                return typeName + typeNameDetails
            }
            if (!Thinglish.isClass(object)) {
                typeName = "function ";
            } else typeNameDetails = object.package;
        }

        if (!typeNameDetails && object)
            typeNameDetails = this.constructor.name + "of undefined type";

        if (object instanceof StructrObject) {
            typeNameDetails = ": " + object.structrType;
        }
        if (object && object.type && typeof object.type === "string")
            typeNameDetails = object.type;

        if (!typeNameDetails || typeName.endsWith(typeNameDetails))
            typeNameDetails = "";

        return typeName + typeNameDetails;
    }

    static get ANY() {
        return Object.freeze(class Any { })
    };

    // static get(object, thingName) {
    //     return Namespaces.tmp.light.Thinglish.lookupInObject(object, thingName);
    // }
    // static set(object, thingName, newValue, forceSetter) {
    //     return Namespaces.tmp.light.Thinglish.setInObject(object, thingName, newValue, forceSetter);
    // }
    // static lookupInObject(object, thingName) {
    //     return Namespaces.tmp.light.Thinglish.lookupInObject(object, thingName);
    // }
    // static setInObject(object, thingName, newValue, forceSetter) {
    //     return Namespaces.tmp.light.Thinglish.setInObject(object, thingName, newValue, forceSetter);
    // }
    // static initType(object, packageName) {
    //     return Namespaces.tmp.light.Thinglish.initType(object, packageName);
    // }

    // static defineAlias(object, name, alias) {
    //     return Namespaces.tmp.light.Thinglish.defineAlias(object, name, alias);
    // }

    // static defineAccessors(object, name, getter, setter) {
    //     return Namespaces.tmp.light.Thinglish.defineAccessors(object, name, getter, setter);
    // }
    // static startThing(ior, options) {
    //     return Namespaces.tmp.light.Thinglish.startThing(ior, options);
    // }
    // static loadAndStartAll(aClass, IORs, options) {
    //     return Namespaces.tmp.light.Thinglish.loadAndStartAll(aClass, IORs, options);
    // }

    // static startAll(classes) {
    //     return Namespaces.tmp.light.Thinglish.startAll(classes);
    // }

    // static startDependencies(aClass) {
    //     return Namespaces.tmp.light.Thinglish.startDependencies(aClass);
    // }
    // static startClass(aClass) {
    //     return Namespaces.tmp.light.Thinglish.startClass(aClass);
    // }

    static serialize2IORDataStructure(data2convert, keyFilter = []) {
        if (!data2convert) return null;

        let convert2IORStructure = (data, visitorList = []) => {
            let responseData = (Array.isArray(data) ? [] : {});

            if (visitorList.indexOf(data) !== -1) {
                throw new Error("Loop in iorDataStructure serialize found!", data);
            }
            visitorList.push(data);


            Object.keys(data).forEach(key => {
                if (key.startsWith("_") || key == "ucpComponent") return;
                let currentValue = data[key];

                if (keyFilter.indexOf(key) !== -1) {
                    return;
                } else if (typeof currentValue == "function") {
                    return
                } else if (Thinglish.isPrimitive(currentValue)) {
                    responseData[key] = currentValue;

                } else if (currentValue && currentValue.IOR && currentValue.IOR.url) {
                    responseData[key] = currentValue.IOR.url;

                } else if (Thinglish.isTypeOf(currentValue, UcpComponent)) {
                    responseData[key] = currentValue.IOR.url;

                } else if (currentValue.type && currentValue.type.class && currentValue.type.class.name && currentValue.type.class.name == "EmptyRelationship") {
                    responseData[key] = {};

                } else if (currentValue instanceof IOR) {
                    responseData[key] = currentValue.url;

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


    static defineWeBeanProperty(ucpView, weBeanProperty) {
        let parentUcpView = ucpView.parent;

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

        _ucpView.documentElement.setAttribute("webBeanPropertyId".toDash(), webBeanPropertyId);
        _ucpView.documentElement.setAttribute("webeanProperty".toDash(), weBeanProperty);

    }

    static getPropertyOverwrite(object, propertyName) {
        if (!object) return null;
        let prototype = Object.getPrototypeOf(object);
        if (prototype == null) return null;

        return Object.getOwnPropertyDescriptor(prototype, propertyName);
    }


    // static addLazyGetter(object, name) {
    //     return Namespaces.tmp.light.Thinglish.addLazyGetter(object, name);
    // }

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

    static isInterface(anInterface, createInterface) {
        if (!anInterface.type)
            Thinglish.initType(anInterface);
        if (createInterface) {
            anInterface.type.extends = Interface;
        }
        return Thinglish.isTypeOf(anInterface, Interface);
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
        if (Array.isArray(object) && object.length == 0) return true;
        if (object.isEmpty instanceof Function) result = object.isEmpty();
        return result;
    }

    static isArray(object) {
        let result = false;
        if (!object) return false;
        if (Array.isArray(object)) return true;
        if (ONCE.global["JavaScriptObject"] && object instanceof JavaScriptObject && Array.isArray(object.data)) return true;
        if (ONCE.global["EmptyCollection"] && object.constructor.name === EmptyCollection.name) return true;
        if (ONCE.global["EmptyCollection"] && object instanceof EmptyCollection) return true;
        return result;
    }

    static isTypeOf(object, aClass) {
        return Namespaces.tmp.light.Thinglish.isTypeOf(object, aClass);
    }

    static isPromise(obj) {
        return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }

    static findType(object) {
        let typeName = Thinglish.getTypeName(object);
        if (typeName == "String") typeName = object;

        let result = ONCE.global[typeName];
        if (Thinglish.isClass(result)) return result;

        return null;
    };

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
            let modelJsd = JavaScriptObjectDescriptor.describe(object.ucpModel.value, merge, force);
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
            object = object.ucpModel.value;



        if (!name) name = object?.[Symbol.toStringTag];
        if (!name && Array.isArray(object) && object.length > 0) {
            let arrayTypeName = object[0].constructor.name;
            if (arrayTypeName === "Function" && Thinglish.isClass(object[0])) arrayTypeName = "Classes";
            name = "Array of " + arrayTypeName;
        }

        if (!name && object.ucpModel) name = object.ucpModel.value.name;
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
            object = object.ucpModel.value;

        let name = object.displayName;
        if (!name && object.model) name = object.model.displayName;
        if (!name && object.ucpComponent)
            name = object.ucpComponent.displayName;
        if (Thinglish.isEmpty(name))
            name = Thinglish.getName(object);
        if (!name)
            name = Thinglish.getName(object);
        return name;
    }
    static getBadge(object) {
        if (!object) object = this;
        return object.badge;
    }
    static getDescription(object) {
        if (!object) return "Empty";

        if (!object.properties) {
            return "---";
        }
        let { description } = object.properties;
        description = description || Thinglish.lookupInObject(object, "ucpComponent.type.ucpComponentDescriptor.properties.description");


        // if (!description) {
        //   description = object.ucpComponent.description;
        // }
        if (description === undefined && object.ucpModel.value.badge !== undefined) {
            description = object.ucpModel.value.description;
        }

        if (Thinglish.isEmpty(description)) {
            description = null;
        }

        if (!description && Thinglish.lookupInObject(object, "model.type.name")) {
            description = object.model.type.name;
        }

        if (!description && object.ucpModel instanceof StructrObject) {
            description = "StructrObject: " + object.ucpModel.structrType;
        }

        if (!description) {
            description = "";
        }

        return description;

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
        let objectDescriptors = Namespaces.tla.EAM.layer1.Thinglish.getAllDescriptors(object);

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

        let actions = allActions.flat();



        let actionIndex = actions.reduce(
            (result, current /*, index, array*/) => {

                let action = Action.lookup(current.value);
                if (!action) action = Action.parse(current.value);
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
        return actionIndex;
    }

    static getCookie(name) {
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
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

    static deleteCookie(name, options) {
        options = options || {
            expires: -1,
            path: "/",
            domain: document.location.hostname
        }
        Thinglish.setCookie(name, "", options);
    }

    static nexttick() {
        return Thinglish.wait(0);
    }

    // TODO: @Marcel FIXME: HACK: WTF       
    // static wait(ms) {
    //     console.error("Thinglish.wait");
    //     return Namespaces.tmp.light.Thinglish.wait(ms);
    // }

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

    static serialize(object, ignoredAttributes) {
        let ior = null;
        if (!object) return null;

        ior = object.IOR?.queryParameters || {};
        ior.url = object.IOR?.url;

        let valueObject = Thinglish.initRecursion(0, this._serialize, object, ignoredAttributes);
        // if (typeof valueObject === "object")
        //   valueObject.ior = ior;
        Thinglish.cleanupRecursion();
        return valueObject;
    }

    static _serialize(object, ignoredAttributes) {
        let valueObject = {};
        let ucpComponent = null;
        let ucpView = null;
        ignoredAttributes = ignoredAttributes || null;

        // if (object instanceof StructrObject) {

        //     // if (object.serialize instanceof Function)
        //     //     return object.serialize();

        //     if (object?._private?.ignoreAttributesOnSerialize) 
        //       ignoredAttributes = object._private.ignoreAttributesOnSerialize;            


        //     valueObject.ior = object.IOR?.queryParameters || {};
        //     valueObject.ior.url = object.IOR?.url;

        //     object = object.value;
        // }

        if (object instanceof UcpComponent) {
            if (object instanceof StructrCollection) {
                object = object.value;
            }
            else if (object instanceof StructrRelationship) {
                object = object.value;
            }
            else {
                ucpComponent = object;
                if (ucpComponent.serialize instanceof Function)
                    return object.serialize();

                valueObject.ior = object.IOR?.queryParameters || {};
                valueObject.ior.url = object.IOR?.url;

                object = object.ucpModel;
            }
        }
        if (object instanceof UcpView) {
            ucpView = object;
            if (ucpView.ucpComponent.serialize instanceof Function)
                return object.ucpComponent.serialize();

            valueObject.ior = object.ucpComponent?.IOR?.queryParameters || {};
            valueObject.ior.url = object.ucpComponent?.IOR?.url || "";
            valueObject.ior.viewClassName = object.type.class.name;
            valueObject.ior.viewId = object.viewId;

            object = object.ucpModel;
        }
        if (object instanceof UcpModel) {

            // if (object.serialize instanceof Function)
            //     return object.serialize();

            if (object?._private?.ignoreAttributesOnSerialize)
                ignoredAttributes = object._private.ignoreAttributesOnSerialize;


            valueObject.modelIOR = object.ucpComponent?.modelIOR?.queryParameters || {};
            valueObject.modelIOR.url = object.ucpComponent?.modelIOR?.url;

            object = object.value;
        }
        if (Thinglish.isTypeOf(object, EmptyRelationship)) {
            return null;
        }
        if (Thinglish.isTypeOf(object, EmptyRelationship)) {
            return [];
        }

        if (Array.isArray(object))
            valueObject = [];

        //console.log("serialize: ",object);
        if (Thinglish.isClass(object))
            return "Class " + object.name;

        let keys = Object.keys(object);
        if (object?._private?.ignoreAttributesOnSerialize && !ignoredAttributes) ignoredAttributes = object._private.ignoreAttributesOnSerialize;
        if (Array.isArray(ignoredAttributes)) keys = keys.filter(key => ignoredAttributes.indexOf(key) === -1);

        keys.forEach(key => {
            if (["ucpComponent"].indexOf(key) !== -1 || key.startsWith("_"))
                return;
            let currentValue = object[key];
            //console.log(" serialize:",key," value:",currentValue);

            if (Thinglish.isPrimitive(currentValue)) {
                valueObject[key] = currentValue;
            } else {
                let current = ucpComponent || ucpView || object;
                let result = Thinglish.recursion(current, currentValue);
                if (result === Infinity) {
                    //console.warn("Infinity detected");
                    if (Thinglish._private.currentRecursion.infiniteObject.IOR)
                        result = Thinglish._private.currentRecursion.infiniteObject.IOR.queryParameters;
                    else {
                        result = "undefined result";
                        //console.log("undefined result for ",Thinglish._private.currentRecursion.infiniteObject);
                    }
                }
                valueObject[key] = result;
            }
        });
        return valueObject;
    }



}





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




class Interface {
    static get implements() {
        return null;
    }

    static discover(type) {
        if (!type)
            type = Thinglish.lookupInObject(this, "type.class") || Interface;
        return Thinglish.discover(type);
    }

    static isInterface(object) {
        if (!object) {
            return true;
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
        return object.type && object.type.extends && object.type.extends === Interface;
    }
    constructor() {
        //console.error("Interface cannot be instanciated");
    }
    init(object) {
        if (!object) {
            console.error("cannot instanciate an Interface");
            return null;
        }
        if (!object.type)
            Thinglish.initType(object);

        Thinglish.implement(object, Interface);
        this.implementation = object;
        return this;
    }

    static get eamLayer() {
        return 3;
    }

    get eamLayer() {
        return Interface.eamLayer;
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
    static set defaultImplementationClass(newValue) { // so abstract class Interface will have a default implementation?
        if (!this._private)
            this._private = {};

        this._private.defaultImplementationClass = newValue;
    }

    static get defaultInstance() {
        if (window.Interface && this === Interface) {
            return null;
        }
        return new this.defaultImplementationClass();
    }

    static get ACTION_DISCOVER() { return "actionId:public:Interface.discover[Discover]:primary"; }

}



class Version extends Interface {
}



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



// class Test extends Thing {
//     static get implements() {
//         return [TestInterface];
//     }
//     constructor() {
//         super();
//         //Thinglish.implement(this, TestInterface);

//         Thinglish.addTypeing(this, this.untypedMethod, {
//             aString: "string",
//             aNumber: "number",
//             aFunction: "function",
//             anLoader: "Loader",
//             aThing: "Thing",
//             "return": "Promise"
//         });

//     }
//     init() {
//         return this;
//     }

//     untypedMethod(aString, aNuber, aFunction, anInterface, aThing) {
//         console.debug(this.type.name + " untypedMethod arguments:")
//         for (var a in arguments) {
//             console.debug(a + ": " + arguments[a]);
//         }
//     }
// }


// ONCE.global.Thinglish = Namespace.declare("tmp.light",
// class Thinglish {
//     static get implements() {
//         return null;
//     }



// }
// );

export { Interface, Version };
export default Thinglish;