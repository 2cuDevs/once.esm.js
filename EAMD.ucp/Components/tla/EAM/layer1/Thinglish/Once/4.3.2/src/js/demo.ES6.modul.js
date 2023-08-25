/* JS Module Mess
 *
 * https://medium.com/backticks-tildes/introduction-to-es6-modules-49956f580da
 * 
 * JS Mdoule pattern
 * http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
 *
 
(function () {
    var $ = this.jQuery;

    this.myExample = function () {};
}() || {});

 * RequireJS Modules
 *   https://requirejs.org/docs/whyamd.html#commonjs

 * CommonJS Modules
 * ================

var $ = require('jquery');
exports.myExample = function () {};

 * Asynchronous Module Definition (AMD)
 *    Options Calling define with module ID, dependency array, and factory function

define('myModule', ['dep1', 'dep2'], function (dep1, dep2) {

    //Define the module value by returning a value.
    return function () {};
});

define([ "require", "jquery", "blade/object", "blade/fn", "rdapi",
         "oauth", "blade/jig", "blade/url", "dispatch", "accounts",
         "storage", "services", "widgets/AccountPanel", "widgets/TabButton",
         "widgets/AddAccount", "less", "osTheme", "jquery-ui-1.8.7.min",
         "jquery.textOverflow"],
function (require,   $,        object,         fn,         rdapi,
          oauth,   jig,         url,         dispatch,   accounts,
          storage,   services,   AccountPanel,           TabButton,
          AddAccount,           less,   osTheme) {

});

define(['require', 'dependency1', 'dependency2'], function (require) {
    var dependency1 = require('dependency1'),
        dependency2 = require('dependency2');

    return function () {};
});

* and finally:
* Check out UMD (universal module definition). Namely, this example
* https://github.com/umdjs/umd/blob/master/templates/commonjsStrictGlobal.js

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'b'], function (exports, b) {
            factory((root.commonJsStrictGlobal = exports), b);
        });
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('b'));
    } else {
        // Browser globals
        factory((root.commonJsStrictGlobal = {}), root.b);
    }
}(typeof self !== 'undefined' ? self : this, function (exports, b) {
    // Use b in some fashion.

    // attach properties to the exports object to define
    // the exported module properties.
    exports.action = function () {};
}));



 */




/* ES6 Module export
 * ================
https://stackoverflow.com/questions/38296667/getting-unexpected-token-export
 */

import * as dependency from "./DragDropTouch"

let  localExampleValueAndExternalName = function hasBeenExported() {
    return {
        "name":             "exported Funtion with name: hasBeenExported",
        "hasBeenExported":  true
    };
}

let isImported = function localHiddenName() {
    console.log(this.hasBeenExported);
    return true;
}


export default {localExampleValueAndExternalName, isImported}