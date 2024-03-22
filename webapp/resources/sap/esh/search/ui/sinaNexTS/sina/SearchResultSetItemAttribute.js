/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./SearchResultSetItemAttributeBase"],function(t){function e(t,e){if(!(t instanceof e)){throw new TypeError("Cannot call a class as a function")}}function r(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(t,n.key,n)}}function n(t,e,n){if(e)r(t.prototype,e);if(n)r(t,n);Object.defineProperty(t,"prototype",{writable:false});return t}function o(t,e){if(typeof e!=="function"&&e!==null){throw new TypeError("Super expression must either be null or a function")}t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:true,configurable:true}});Object.defineProperty(t,"prototype",{writable:false});if(e)i(t,e)}function i(t,e){i=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,r){e.__proto__=r;return e};return i(t,e)}function u(t){var e=c();return function r(){var n=l(t),o;if(e){var i=l(this).constructor;o=Reflect.construct(n,arguments,i)}else{o=n.apply(this,arguments)}return a(this,o)}}function a(t,e){if(e&&(typeof e==="object"||typeof e==="function")){return e}else if(e!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return f(t)}function f(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function c(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(t){return false}}function l(t){l=Object.setPrototypeOf?Object.getPrototypeOf.bind():function t(e){return e.__proto__||Object.getPrototypeOf(e)};return l(t)}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var s=t["SearchResultSetItemAttributeBase"];var p=function(t){o(i,t);var r=u(i);function i(t){var n;e(this,i);n=r.call(this,t);n.value=t.value;n.valueFormatted=t.valueFormatted;n.valueHighlighted=t.valueHighlighted;n.isHighlighted=t.isHighlighted;n.unitOfMeasure=t.unitOfMeasure;n.description=t.description;n.defaultNavigationTarget=t.defaultNavigationTarget;n.navigationTargets=t.navigationTargets;n.metadata=t.metadata;n.iconUrl=t.iconUrl;return n}n(i,[{key:"toString",value:function t(){return this.label+":"+this.valueFormatted}},{key:"getSubAttributes",value:function t(){return[this]}}]);return i}(s);var b={__esModule:true};b.SearchResultSetItemAttribute=p;return b})})();
//# sourceMappingURL=SearchResultSetItemAttribute.js.map