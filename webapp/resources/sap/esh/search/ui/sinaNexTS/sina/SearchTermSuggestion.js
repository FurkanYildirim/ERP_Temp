/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./Suggestion","./SuggestionType"],function(e,t){function r(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function n(e,t,n){if(t)r(e.prototype,t);if(n)r(e,n);Object.defineProperty(e,"prototype",{writable:false});return e}function o(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function i(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)u(e,t)}function u(e,t){u=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return u(e,t)}function c(e){var t=a();return function r(){var n=s(e),o;if(t){var i=s(this).constructor;o=Reflect.construct(n,arguments,i)}else{o=n.apply(this,arguments)}return f(this,o)}}function f(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return l(e)}function l(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function a(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function s(e){s=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return s(e)}function p(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var y=e["Suggestion"];var b=t["SuggestionType"];var h=function(e){i(r,e);var t=c(r);function r(e){var n,i,u;var c;o(this,r);c=t.call(this,e);p(l(c),"type",b.SearchTerm);p(l(c),"childSuggestions",[]);c.searchTerm=(n=e.searchTerm)!==null&&n!==void 0?n:c.searchTerm;c.filter=(i=e.filter)!==null&&i!==void 0?i:c.filter;c.childSuggestions=(u=e.childSuggestions)!==null&&u!==void 0?u:c.childSuggestions;return c}return n(r)}(y);var d={__esModule:true};d.SearchTermSuggestion=h;return d})})();
//# sourceMappingURL=SearchTermSuggestion.js.map