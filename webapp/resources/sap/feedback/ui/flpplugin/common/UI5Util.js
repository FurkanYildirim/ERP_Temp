"use strict";sap.ui.define(["sap/feedback/ui/thirdparty/sap-px/pxapi","sap/base/util/ObjectPath"],function(e,t){function r(e){"@babel/helpers - typeof";return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r(e)}function n(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function i(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,o(n.key),n)}}function u(e,t,r){if(t)i(e.prototype,t);if(r)i(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function o(e){var t=a(e,"string");return typeof t==="symbol"?t:String(t)}function a(e,t){if(r(e)!=="object"||e===null)return e;var n=e[Symbol.toPrimitive];if(n!==undefined){var i=n.call(e,t||"default");if(r(i)!=="object")return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var f=e["ThemeId"];var c=function(){function e(){n(this,e)}u(e,null,[{key:"getShellContainer",value:function e(){return t.get("sap.ushell.Container")}},{key:"getAppLifeCycleService",value:function e(){try{var t=this;return Promise.resolve(t.getShellContainer().getServiceAsync("AppLifeCycle")).then(function(e){return e})}catch(e){return Promise.reject(e)}}},{key:"getCurrentApp",value:function e(){try{var t=this;return Promise.resolve(t.getAppLifeCycleService()).then(function(e){return e.getCurrentApplication()})}catch(e){return Promise.reject(e)}}},{key:"getAppConfig",value:function e(){return sap.ui.getCore().getConfiguration()}},{key:"getTheme",value:function e(){return this.getAppConfig().getTheme()}},{key:"getThemeId",value:function e(){var t=this.getAppConfig().getTheme();return f[t]}},{key:"getLanguage",value:function e(){return this.getAppConfig().getLanguageTag()}},{key:"getEventBus",value:function e(){return sap.ui.getCore().getEventBus()}}]);return e}();return c});
//# sourceMappingURL=UI5Util.js.map