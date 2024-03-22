/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../core/core","./Configurator"],function(e,t){function r(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function o(e,t,r){if(t)n(e.prototype,t);if(r)n(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function i(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)u(e,t)}function u(e,t){u=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return u(e,t)}function c(e){var t=s();return function r(){var n=l(e),o;if(t){var i=l(this).constructor;o=Reflect.construct(n,arguments,i)}else{o=n.apply(this,arguments)}return f(this,o)}}function f(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return a(e)}function a(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function s(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function l(e){l=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return l(e)}var p=t["Configurator"];var y=function(t){i(u,t);var n=c(u);function u(){r(this,u);return n.apply(this,arguments)}o(u,[{key:"initAsync",value:function e(){this.resourceKey=this.configuration.resourceKey;this.force=this.configuration.force}},{key:"isSuitable",value:function t(r){if(e.isString(r.type)&&["string"].indexOf(r.type)>=0&&e.isObject(r.configuration)&&r.configuration.resourceKey){return true}return false}},{key:"configure",value:function e(t,r){if(this.isInitialOrForced(t)){var n=this.resourceBundle||this.getResourceBundle(r);return n.getText(this.resourceKey)}return t}}]);return u}(p);var b={__esModule:true};b.TextResourceConfigurator=y;return b})})();
//# sourceMappingURL=TextResourceConfigurator.js.map