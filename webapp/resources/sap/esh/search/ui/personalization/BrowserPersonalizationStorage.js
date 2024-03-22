/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/ui/util/Storage"],function(e){function t(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function r(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function n(e,t,n){if(t)r(e.prototype,t);if(n)r(e,n);Object.defineProperty(e,"prototype",{writable:false});return e}var i=function(){function r(){var n=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"default";var i=arguments.length>1&&arguments[1]!==undefined?arguments[1]:"local";t(this,r);this.prefix=n;this.storage=new e(i);if(!this.storage.isSupported()){throw new Error("Storage of type ".concat(i," is not supported by UI5 in this environment"))}}n(r,[{key:"isStorageOfPersonalDataAllowed",value:function e(){return true}},{key:"save",value:function e(){return Promise.resolve()}},{key:"getItem",value:function e(t){return this.storage.get(this.prefix+".Search.Personalization."+t)}},{key:"setItem",value:function e(t,r){return this.storage.put(this.prefix+".Search.Personalization."+t,r)}},{key:"deleteItem",value:function e(t){this.storage.remove(t)}}],[{key:"create",value:function e(t){try{return Promise.resolve(new r(t))}catch(e){return Promise.reject(e)}}}]);return r}();return i})})();
//# sourceMappingURL=BrowserPersonalizationStorage.js.map