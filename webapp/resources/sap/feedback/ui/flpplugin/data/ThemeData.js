"use strict";sap.ui.define(["sap/feedback/ui/thirdparty/sap-px/pxapi","../common/UI5Util","../storage/LocalStorageHandler"],function(e,t,r){function n(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function o(e){"@babel/helpers - typeof";return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o(e)}function a(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function u(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,f(n.key),n)}}function i(e,t,r){if(t)u(e.prototype,t);if(r)u(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function f(e){var t=l(e,"string");return typeof t==="symbol"?t:String(t)}function l(e,t){if(o(e)!=="object"||e===null)return e;var r=e[Symbol.toPrimitive];if(r!==undefined){var n=r.call(e,t||"default");if(o(n)!=="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var c=e["ThemeId"];var p=n(t);var s=n(r);var m=function(){function e(){a(this,e)}i(e,null,[{key:"initLastTheme",value:function e(){var t=p.getThemeId()||c.none;var r=t;var n=s.getUserState();if(n&&n.lastTheme){r=c[n.lastTheme];if(!r){r=t}}this.updateThemeState(r,t)}},{key:"updateCurrentTheme",value:function e(t){var r=c[t]||c.none;var n=s.getUserState();if(n){var o=c[n.currentTheme]||c.none;if(o!==r){this.updateThemeState(o,r)}}}},{key:"updateThemeState",value:function e(t,r){s.updateLastTheme(t);s.updateCurrentTheme(r)}},{key:"getPreviousTheme",value:function e(){var t=s.getUserState();if(t){return c[t.lastTheme]||c.none}return c.none}}]);return e}();return m});
//# sourceMappingURL=ThemeData.js.map