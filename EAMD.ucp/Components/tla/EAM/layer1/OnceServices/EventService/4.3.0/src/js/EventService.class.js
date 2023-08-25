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



/* global logger, Thing */
var EventService = Namespace.declare(null,
    class EventService extends Thing {
        static get implements() { return null; }

        static start() {
            ONCE.global.globalEventService = this.getInstance().init();
            // logger.log({ level: "user", category: "EVENTS", callback: (m) => { m.level = "console.warn"; return m } }, "update EVENTS to log level 'console.warn;");
        }
        static get weBeanUnitPaths() {
            return [];
        }


        init() {
            super.init();
            this._private.eventServiceStore = WeakMapPromiseStore.getInstance().init();
            return this;
        }

        addEventListener(eventName, eventTarget, handlerFunction, sourceObject) {
            if (eventName === undefined) throw new Error("eventName can not be undefined");
            if (eventTarget === undefined) throw new Error("eventTarget can not be undefined");
            if (typeof handlerFunction !== 'function') throw new Error("handlerFunction needs to be a function");

            if (!sourceObject.id) throw new Error("sourceObject.id must be specified");

            // Lookup source Component in the Store
            let sourceEvents = this.getEvents(sourceObject);
            if (!sourceEvents) {
                sourceEvents = {};
                //logger.warn(`register ${sourceObject.id}`);
                //this._private.test = this._private.test || new Map();
                //this._private.test.set(sourceObject, sourceEvents);
                this._private.eventServiceStore.register(sourceObject, sourceEvents);
            }

            //lookup Event
            let event = sourceEvents[eventName];
            if (!event) {
                sourceEvents[eventName] = event = new MyEvent().init(sourceObject, eventName)
            }


            const targetId = eventTarget.id;
            if (targetId === undefined) logger.error(new Error(`ID of the Object is undefined! No event registration possible for ${eventTarget.name}`));

            event.addHandler({
                id: `${targetId}:${handlerFunction.name}`,
                targetFunction: handlerFunction,
                targetObject: eventTarget
            });
        }

        getEvents(object) {
            return this._private.eventServiceStore.lookup(object)
        }

        fire(eventName, eventSource, ...args) {
            if (eventName === undefined) throw new Error("eventName can not be undefined");
            if (!eventSource) throw new Error("Missing eventSource");

            const sourceEvents = this.getEvents(eventSource);
            if (!sourceEvents) return false;


            const event = sourceEvents[eventName];
            if (event) {
                return event.fire(eventSource, ...args);
            }
        }


    }
);

var MyEvent = Namespace.declare(null,
    class Event {
        static get implements() { return null }

        constructor() {
            this.name = "";
            this.handlers = new Map();
        }

        init(sourceObject, name) {
            this.source = sourceObject;
            this.name = name;
            return this;
        }

        makeWeakRef(value) {
            return value;
            return typeof WeakRef === 'undefined' ? value : new WeakRef(value);
        }

        getWeakRef(value) {
            return value;

            return typeof WeakRef === 'undefined' ? value : value.deref();
        }

        addHandler(handler) {
            let oldHandler = this.handlers.get(handler.id)
            if (oldHandler) {
                if (handler.handler !== oldHandler) logger.info("Event was already set and was overwritten " + handler.id)
            }
            handler.targetFunction = this.makeWeakRef(handler.targetFunction);
            handler.targetObject = this.makeWeakRef(handler.targetObject);

            this.handlers.set(handler.id, handler);
            //console.warn("added handler ", this.name, handler.id, this.handlers.size);
        }

        fire(eventSource, ...args) {

            let promises = [];
            let resultList = [];


            if (eventSource.duringFire === true) return;

            try {
                eventSource.duringFire = true;
                logger.info({ level: "verbose", category: "EVENTS" }, "About to fire ", this.name, " to ", this.handlers.size, "handlers...");
                if (this.handlers.size > 5) {
                    logger.info({ level: "info", category: "EVENTS" }, "More handlers than usual:", this.handlers.size);
                }

                for (const [key, handler] of this.handlers) {
                    if (this.level >= DefaultLogger.LEVELS["verbose"]) logger.log({ level: "verbose", category: "EVENTS" }, "fire ", this.name, " from ", eventSource.id, "to", this.target.id, " item: ", item);

                    const targetFunction = this.getWeakRef(handler.targetFunction);
                    const targetObject = this.getWeakRef(handler.targetObject);
                    // Check if the Target is already Destroyed
                    if (!targetObject) {
                        //Object is no longer referenced
                        this.handlers.delete(key);

                        //UcpComponent
                    } else if (targetObject.componentStatus && targetObject.componentStatus === UcpComponent.COMPONENT_STATES.DESTROYED) {
                        this.handlers.delete(key);

                        //UcpView
                    } else if (targetObject.ucpComponent && targetObject.ucpComponent.componentState === UcpComponent.COMPONENT_STATES.DESTROYED) {
                        this.handlers.delete(key);

                    } else {

                        let result = targetFunction(this, ...args);

                        if (Thinglish.isPromise(result)) {
                            promises.push(result);
                        } else {
                                resultList.push(result);
                        }
                    }
                }
            } catch (error) {
                logger.error("EVENTS", "Error during fire: ", error);
                // eventSource.duringFire = false;
            }

            if (promises.length === 0) {
                eventSource.duringFire = false;
                this.processed = false;
                return resultList;
            } else {
                let resultPromise = Promise.allSettled(promises, resultList);
                //const thisProxy = this;
                resultPromise.then((results) => {
                    for (const result of results) {
                        if (result.status = "rejected" && result.reason instanceof Error) logger.error(result.reason.stack);
                    }
                    //eventSource.duringFire = false;
                    //this.processed = false;
                }).catch(err => {
                    err;
                });
                eventSource.duringFire = false;
                this.processed = false;
                return resultPromise;
            }
        }

    }
);

var EventSupport = Namespace.declare(null,
    class EventSupport extends Interface {
        static get implements() { return null; }
        get eventSupport() {
            if (!this._private) this._private = {};
            if (!this._private.eventSupport) {
                const thisProxy = this;
                this._private.eventSupport = {
                    addEventListener(...args) { return ONCE.global.globalEventService.addEventListener(...args, thisProxy) },
                    fire(...args) { 
                    args[1] = thisProxy;
                    return ONCE.global.globalEventService.fire(...args) 
                    }, //It could be removed the source from the args but that change the Interface
                }

                Object.defineProperty(this._private.eventSupport, 'eventRegistry', {
                    get: function () { return ONCE.global.globalEventService.getEvents(thisProxy) }
                });
            }
            return this._private.eventSupport;
        }
    }
);
