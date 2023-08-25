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
            // logger.log({ level: "user", category: "EVENTS", callback: (m) => { m.level = "console.warn"; return m } }, "update EVENTS to log level 'console.warn;");
        }
        static get weBeanUnitPaths() {
            return [];
        }

        constructor() {
            super();
            this.registry = {};
        }

        addEventListener(eventName, eventTarget, handlerFunction) {
            if (eventName === undefined) throw new Error("eventName can not be undefined");
            if (eventTarget === undefined) throw new Error("eventTarget can not be undefined");
            if (typeof handlerFunction !== 'function') throw new Error("handlerFunction needs to be a function");


            const event = this.registry[eventName] = this.registry[eventName] || new MyEvent().init(eventName);
            /*
            let id = eventTarget.id || Thinglish.lookupInObject(eventTarget, "_private.id");
            if (!id) {
                id = Thinglish.lookupInObject(eventTarget, "_private.id");
            }
            if (!id) {
                id = Thinglish.lookupInObject(eventTarget, "_private.id");
            }
            */

            let id = eventTarget.id;
            //if (Thinglish.isInstanceOf(eventTarget,UcpView)) {
            //                id = eventTarget.viewId;
            //            } else {
            //                id = eventTarget.id;
            //            }
            if (id == undefined) {
                logger.error(new Error(`ID of the Object is undefined! No event registration possible for ${eventTarget.name}`));

            }

            event.addHandler({
                id: `${id}:${handlerFunction.name}`,
                handler: handlerFunction,
                target: eventTarget
            });
        }

        getEvent(eventName) {
            return this.registry[eventName];
        }


        fire(eventName, eventSource, item) {
            if (eventName === undefined) throw new Error("eventName can not be undefined");
            const event = this.getEvent(eventName);
            if (event) {
                return event.fire(eventSource, item);
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

        init(name) {
            this.name = name;
            return this;
        }

        addHandler(handler) {
            let oldHandler = this.handlers.get(handler.id)
            if (oldHandler) {
                if (handler.handler !== oldHandler) logger.info("Event was already set and was overwritten " + handler.id)
            }
            this.handlers.set(handler.id, handler);
            //console.warn("added handler ", this.name, handler.id, this.handlers.size);
        }

        fire(eventSource, item) {
            this.source = eventSource;

            let promises = [];

            if (eventSource.duringFire === true) {
                return;
            }
            try {
                eventSource.duringFire = true;
                logger.info({ level: "verbose", category: "EVENTS" }, "About to fire ", this.name, " to ", this.handlers.size, "handlers...");
                if (this.handlers.size > 5) {
                    logger.info({ level: "info", category: "EVENTS" }, "More handlers than usual:", this.handlers.size);
                }

                for (const [key, handler] of this.handlers) {
                    if (this.level >= DefaultLogger.LEVELS["verbose"]) logger.log({ level: "verbose", category: "EVENTS" }, "fire ", this.name, " from ", eventSource.id, "to", this.target.id, " item: ", item);

                    // Check if the Target is already Destroyed
                    if (handler.target.componentStatus && handler.target.componentStatus === UcpComponent.COMPONENT_STATES.DESTROYED) {
                        this.handlers.delete(key);
                    } else if (handler.target.ucpComponent && handler.target.ucpComponent.componentState === UcpComponent.COMPONENT_STATES.DESTROYED) {
                        this.handlers.delete(key);

                    } else {

                        let result = handler.handler(this, item);

                        if (Thinglish.isPromise(result)) {
                            promises.push(result);
                        }
                    }
                };
            } catch (error) {
                logger.error("EVENTS", "Error during fire: ", error);
                // eventSource.duringFire = false;
            }

            if (promises.length === 0) {
                eventSource.duringFire = false;
                this.processed = false;
                return;
            } else {
                let resultPromise = Promise.allSettled(promises);
                const thisProxy = this;
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
            this._private = this._private || {};
            // || new Private({
            //     name: "secret",
            //     id: "uninitialized",
            //     eventSupport: null
            // }, this);

            if (!this._private.eventSupport) {
                this._private.eventSupport = new EventService();
                //this._eventSupport = this._private.eventSupport;
            }
            return this._private.eventSupport;
        }
    }
);
