// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/service/ServiceFactory","sap/ui/core/service/Service","sap/base/Log","sap/base/util/ObjectPath","sap/base/util/isPlainObject"],function(e,t,n,r,c){"use strict";var i;function o(e){i=e}function u(){return i}function a(e){return!!/^[^_].+/.test(e)}function s(e){var t,n=[];for(t in e){n.push(t)}return n}function f(e,t,r){var c=t[r];t[r]=function(){var i,o,a=u();if(!e||e.scopeObject.getId()!==a){n.warning("Call to "+r+" is not allowed","This may be caused by an app component other than the active '"+a+"' that tries to call the method","sap.ushell.Ui5ServiceFactory");return undefined}o=new Array(arguments.length);for(i=0;i<o.length;++i){o[i]=arguments[i]}return c.apply(t,o)}}function p(e,t,n,r){s(e).filter(a).filter(function(n){var r=e[n];t[n]=r;return typeof r==="function"}).forEach(function(c){t[c]=t[c].bind(e);if(r){f(n,t,c)}})}function l(e){var t;if(typeof e==="undefined"){return true}if(!c(e)){return false}if(!e.scopeType){return false}t=r.get("scopeObject.getId",e);if(typeof t!=="function"){return false}return true}function v(e,t,n){var r={};if(n){n=typeof e==="object"}p(t,r,e,n);if(n&&e.scopeType==="component"&&e.scopeObject&&e.scopeObject.getId){o(e.scopeObject.getId())}return r}function h(e){return sap.ushell.Container.getServiceAsync(e)}function y(r,c){var i=e.extend("sap.ushell.ui5service."+r+"Factory",{createInstance:function(e){return new Promise(function(i,o){h(r).then(function(u){var a,s,f;if(!l(e)){n.error("Invalid context for "+r+" service interface","The context must be empty or an object like { scopeType: ..., scopeObject: ... }","sap.ushell.Ui5ServiceFactory");o("Invalid Context for "+r+" service");return}s=v(e,u,c);f=t.extend("sap.ushell.ui5service."+r,{getInterface:function(){return s}});a=new f(e);i(a)},function(e){o(e)})})}});return new i}return{createServiceFactory:y}});
//# sourceMappingURL=Ui5ServiceFactory.js.map