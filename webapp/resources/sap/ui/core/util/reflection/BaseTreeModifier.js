/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/base/ManagedObjectMetadata","sap/ui/util/XMLHelper","sap/ui/core/XMLTemplateProcessor","sap/ui/core/util/XMLPreprocessor","sap/base/util/isPlainObject","sap/base/Log"],function(e,t,n,r,i,o,a){"use strict";return{bySelectorExtensionPointEnabled:function(e,t,n){return Promise.resolve(this.bySelector(e,t,n))},bySelectorTypeIndependent:function(e,t,n){var r;return Promise.resolve().then(function(){if(e&&e.name){n=n||this.bySelector(e.viewSelector,t);return this.getExtensionPointInfo(e.name,n).then(function(e){return e?e.parent:undefined})}r=this.getControlIdBySelector(e,t);return this._byId(r,n)}.bind(this))},bySelector:function(e,t,n){var r=this.getControlIdBySelector(e,t);return this._byId(r,n)},getControlIdBySelector:function(e,t){if(!e){return undefined}if(typeof e==="string"){e={id:e}}var n=e.id;if(e.idIsLocal){if(t){n=t.createId(n)}else{throw new Error("App Component instance needed to get a control's ID from selector")}}return n},getSelector:function(e,t,n){var r=e;if(typeof r!=="string"){r=e?this.getId(e):undefined}else if(!t){throw new Error("App Component instance needed to get a selector from string ID")}if(n&&(n.id||n.idIsLocal)){throw new Error("A selector of control with the ID '"+r+"' was requested, "+"but core properties were overwritten by the additionally passed information.")}var i=this.checkControlId(r,t);if(!i){throw new Error("Generated ID attribute found - to offer flexibility a stable control ID is needed to assign the changes to, but for this control the ID was generated by SAPUI5 "+r)}var o=Object.assign({},n,{id:"",idIsLocal:false});if(this.hasLocalIdSuffix(r,t)){var a=t.getLocalId(r);o.id=a;o.idIsLocal=true}else{o.id=r}return o},checkControlId:function(n,r){var i=n instanceof e?n.getId():n;var o=t.isGeneratedId(i);return!o||this.hasLocalIdSuffix(n,r)},hasLocalIdSuffix:function(t,n){var r=t instanceof e?t.getId():t;if(!n){return false}return!!n.getLocalId(r)},_checkAndPrefixIdsInFragment:function(e,t){var r=n.getParseError(e);if(r.errorCode!==0){return Promise.reject(new Error(e.parseError.reason))}var i=e.documentElement;var o=[],a=[];if(i.localName==="FragmentDefinition"){o=this._getElementNodeChildren(i)}else{o=[i]}a=[].concat(o);function s(e){a.push(e)}var u=Promise.resolve();for(var c=0,f=o.length;c<f;c++){u=u.then(this._traverseXmlTree.bind(this,s,o[c]))}return u.then(function(){for(var e=0,n=a.length;e<n;e++){if(a[e].getAttribute("id")){a[e].setAttribute("id",t+"."+a[e].getAttribute("id"))}else{throw new Error("At least one control does not have a stable ID")}}return i})},_getElementNodeChildren:function(e){var t=[];var n=e.childNodes;for(var r=0,i=n.length;r<i;r++){if(n[r].nodeType===1){t.push(n[r])}}return t},_getControlMetadataInXml:function(e){var t=this._getControlTypeInXml(e).replace(/\./g,"/");var n=sap.ui.require(t);if(n&&n.getMetadata){return Promise.resolve(n.getMetadata())}return new Promise(function(e,n){sap.ui.require([t],function(t){if(t.getMetadata){e(t.getMetadata())}n(new Error("getMetadata function is not available on control type"))},function(){n(new Error("Required control '"+t+"' couldn't be found"))})})},getControlMetadata:function(e){},getLibraryName:function(e){return this.getControlMetadata(e).then(function(e){return e.getLibraryName()})},_getControlTypeInXml:function(e){var t=e.namespaceURI;t=t?t+".":"";t+=e.localName;return t},_traverseXmlTree:function(e,t){function n(t,r,i){return Promise.resolve().then(function(){if(!i){return this._getControlMetadataInXml(r,true)}return undefined}.bind(this)).then(function(e){return e&&e.getAllAggregations()}).then(function(t){var i=this._getElementNodeChildren(r);var o=Promise.resolve();i.forEach(function(i){var a=t&&t[i.localName];o=o.then(function(){return n.call(this,r,i,a).then(function(){if(!a){e(i)}})}.bind(this))}.bind(this));return o}.bind(this))}return n.call(this,t,t,false)},_getSerializedValue:function(e){if(this._isSerializable(e)&&typeof e!=="string"){return JSON.stringify(e)}return e},_isSerializable:function(e){return o(e)||Array.isArray(e)||Object(e)!==e},_escapeCurlyBracketsInString:function(e){return typeof e==="string"?e.replace(/({|})/g,"\\$&"):e},_templateFragment:function(e,t){return Promise.resolve(i.process(r.loadTemplate(e,"fragment"),{name:e},t))},getPropertyBindingOrProperty:function(e,t){var n=this.getPropertyBinding(e,t);if(n){return Promise.resolve(n)}return this.getProperty(e,t)},setPropertyBindingOrProperty:function(e,t,n){var r=n&&(n.path||n.parts);var i=n&&typeof n==="string"&&n.substring(0,1)==="{"&&n.slice(-1)==="}";var o=r||i?"setPropertyBinding":"setProperty";this[o](e,t,n)},setVisible:function(e,t){},getVisible:function(e){},setStashed:function(e,t){},getStashed:function(e){},bindProperty:function(e,t,n){},unbindProperty:function(e,t){},bindAggregation:function(e,t,n){},unbindAggregation:function(e,t){},setProperty:function(e,t,n){},getProperty:function(e,t){},isPropertyInitial:function(e,t){},setPropertyBinding:function(e,t,n){},getPropertyBinding:function(e,t){},createAndAddCustomData:function(e,t,n,r){},getCustomDataInfo:function(e,t){},createControl:function(e,t,n,r,i){},applySettings:function(e,t){},_byId:function(e,t){},getId:function(e){},getParent:function(e){},getControlType:function(e){},setAssociation:function(e,t,n){},getAssociation:function(e,t){},getAllAggregations:function(e){},getAggregation:function(e,t){},insertAggregation:function(e,t,n,r,i,o){},removeAggregation:function(e,t,n){},removeAllAggregation:function(e,t){},getBindingTemplate:function(e,t){},updateAggregation:function(e,t){},findIndexInParentAggregation:function(e){},getParentAggregationName:function(e,t){},findAggregation:function(e,t){},validateType:function(e,t,n,r,i){},instantiateFragment:function(e,t,n){},templateControlFragment:function(e,t,n){},destroy:function(e){},getChangeHandlerModulePath:function(e){return this._getFlexCustomData(e,"flexibility")},_getFlexCustomData:function(e){},getFlexDelegate:function(e){var t;var n=this._getFlexCustomData(e,"delegate");if(typeof n==="string"){try{t=JSON.parse(n);if(t.payload===undefined){t.payload={}}}catch(t){a.error("Flex Delegate for control "+this.getId(e)+" is malformed",t.message)}}return t},attachEvent:function(e,t,n,r){},detachEvent:function(e,t,n){},getExtensionPointInfo:function(e,t){}}});
//# sourceMappingURL=BaseTreeModifier.js.map