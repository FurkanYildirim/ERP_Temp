/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./SinaObject","../core/Log","../core/core"],function(e,t,r){function n(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function o(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function i(e,t,r){if(t)o(e.prototype,t);if(r)o(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function u(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)f(e,t)}function f(e,t){f=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return f(e,t)}function c(e){var t=s();return function r(){var n=p(e),o;if(t){var i=p(this).constructor;o=Reflect.construct(n,arguments,i)}else{o=n.apply(this,arguments)}return l(this,o)}}function l(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return a(e)}function a(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function s(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function p(e){p=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return p(e)}function y(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var b=e["SinaObject"];var v=t["Log"];var d=function(e){u(o,e);var t=c(o);function o(e){var i,u,f,c,l;var s;n(this,o);s=t.call(this,e);y(a(s),"id",r.generateId());y(a(s),"items",[]);y(a(s),"log",new v);s.id=(i=e.id)!==null&&i!==void 0?i:s.id;s.title=(u=e.title)!==null&&u!==void 0?u:s.title;s.items=(f=e.items)!==null&&f!==void 0?f:s.items;s.query=(c=e.query)!==null&&c!==void 0?c:s.query;s.log=(l=e.log)!==null&&l!==void 0?l:s.log;return s}i(o,[{key:"toString",value:function e(){var t=[];for(var r=0;r<this.items.length;++r){var n=this.items[r];t.push(n.toString())}return t.join("\n")}}]);return o}(b);var h={__esModule:true};h.ResultSet=d;return h})})();
//# sourceMappingURL=ResultSet.js.map