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
var EventService = Namespace.declare("tla.EAM.layer1.OnceServices",
    class EventService extends Thing {
        static get implements() { return null; }

        static start() {
            // logger.log({ level: "user", category: "EVENTS", callback: (m) => { m.level = "console.warn"; return m } }, "update EVENTS to log level 'console.warn;");
        }

        constructor() {
            super();
            this.registry = {};
        }

        addEventListener(eventName, eventTarget, handlerFunction) {
            if (Thinglish.isEmpty(handlerFunction)) return;
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

            event.addHandler({
                id: `${eventTarget.id}:${handlerFunction.name}`,
                handler: handlerFunction
            });
            event.target = eventTarget;
        }

        getEvent(eventName) {
            return this.registry[eventName];
        }


        fire(eventName, eventSource, item) {
            const event = this.getEvent(eventName);
            if (event) {
                event.fire(eventSource, item);
            }
        }


    }
);

var MyEvent = Namespace.declare("tla.EAM.layer1.OnceServices",
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
            this.handlers.set(handler.id, handler.handler);
            //console.warn("added handler ", this.name, handler.id, this.handlers.size);
        }

        fire(eventSource, item) {
            this.source = eventSource;

            if (eventSource.duringFire === true) {
                return;
            }
            try {
                eventSource.duringFire = true;
                logger.log({ level: "verbose", category: "EVENTS" }, "About to fire ", this.name, " to ", this.handlers.size, "handlers...");
                if (this.handlers.size > 5) {
                    logger.warn({ level: "warn", category: "EVENTS" }, "More handlers than usual:", this.handlers.size);
                }

                this.handlers.forEach(handler => {
                    logger.log({ level: "verbose", category: "EVENTS" }, "fire ", this.name, " from ", eventSource.id, "to", this.target.id, " item: ", item);
                    handler(this, item);
                });
            } catch (error) {
                logger.error("EVENTS", "Error during fire: ", error);
                // eventSource.duringFire = false;
            }
            eventSource.duringFire = false;
            this.processed = false;
        }

    }
);

var EventSupport = Namespace.declare("tla.EAM.layer1.OnceServices",
    class EventSupport extends Interface {
        static get implements() { return null; }
        get eventSupport() {
            if (!this._private) {
                return null;
            }

            if (!this._private.eventSupport) {
                this._private.eventSupport = new EventService();
                //this._eventSupport = this._private.eventSupport;
            }
            return this._private.eventSupport;
        }
    }
);
