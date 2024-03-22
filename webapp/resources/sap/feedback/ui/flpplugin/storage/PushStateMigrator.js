"use strict";sap.ui.define(["sap/base/Log","./LocalStorageHandler","../common/Constants"],function(e,t,r){function n(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function u(e){"@babel/helpers - typeof";return u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},u(e)}function a(e){return l(e)||f(e)||o(e)||i()}function i(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function o(e,t){if(!e)return;if(typeof e==="string")return s(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor)r=e.constructor.name;if(r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return s(e,t)}function f(e){if(typeof Symbol!=="undefined"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function l(e){if(Array.isArray(e))return s(e)}function s(e,t){if(t==null||t>e.length)t=e.length;for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function c(e,t,r){t=m(t);if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}function y(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function p(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,m(n.key),n)}}function b(e,t,r){if(t)p(e.prototype,t);if(r)p(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function m(e){var t=d(e,"string");return typeof t==="symbol"?t:String(t)}function d(e,t){if(u(e)!=="object"||e===null)return e;var r=e[Symbol.toPrimitive];if(r!==undefined){var n=r.call(e,t||"default");if(u(n)!=="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var S=n(t);var v=n(r);var h=function(){function t(){y(this,t)}b(t,null,[{key:"migrate",value:function t(){var r=S.getUserState();if(r){if(this.isOldPushStateAvailable(r)){var n=this.getNewUserState(r);return S.updateUserState(n)}else{e.debug(v.DEBUG.NO_OLD_PUSH_STATE,undefined,v.COMPONENT.PUSH_STATE_MIGRATOR)}}return true}},{key:"isOldPushStateAvailable",value:function e(t){if(t.dynamicPushDate||t.inAppPushDate||t.featurePushStates){return true}return false}},{key:"getNewUserState",value:function e(t){var r=this;var n=Object.keys(t).map(function(e){var n=r.pushStateKeyMap[e]||e;return c({},n,t[e])});return Object.assign.apply(Object,[{}].concat(a(n)))}},{key:"pushStateKeyMap",get:function e(){return{dynamicPushDate:"timedPushDate",inAppPushDate:"appPushDate",featurePushStates:"appPushStates"}}}]);return t}();return h});
//# sourceMappingURL=PushStateMigrator.js.map