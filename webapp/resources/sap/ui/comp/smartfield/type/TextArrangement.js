/*
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/model/CompositeType","sap/ui/comp/util/FormatUtil","sap/ui/model/ParseException","sap/ui/model/ValidateException","sap/base/util/isPlainObject","sap/base/assert"],function(t,e,i,r,n,s,a){"use strict";var o=e.extend("sap.ui.comp.smartfield.type.TextArrangement",{constructor:function(t,i,r){this.getPrimaryType().call(this,t,i);e.call(this,t,i);this.init(t,i,r);a(r.keyField!==undefined,"Missing value for the keyField. - "+this.getName())},metadata:{abstract:true}});o.prototype.init=function(t,e,i){this.sName="TextArrangement";this.bParseWithValues=true;this.async=true;var r={textArrangement:"idOnly"};var n={onBeforeValidateValue:function(){}};this.oSettings=Object.assign(n,i);this.oFormatOptions=Object.assign(r,t);this.fnParser=this.getValidator({textArrangement:this.oFormatOptions.textArrangement,prefix:"parse"});this.fnValidator=this.getValidator({textArrangement:this.oFormatOptions.textArrangement,prefix:"validate"});this.bValueListNoValidation=i.valueListNoValidation;this.bIsInvalid=false;this._sSelectedValue=null};o.prototype.getSettings=function(){return this.oSettings};o.prototype.parseValue=function(t,e,i){var r,n=t===""&&!this._isValueSelected(t),s=this.oFormatOptions.textArrangement;if(n){t=null}if(typeof t==="string"){t=t.replace(/\u0020+$/,"")}if(s==="idOnly"){r=this.parseIDOnly(t,e)}else{r=this.fnParser(t,e,i,this.oFormatOptions,this.oSettings)}if(r[0]&&r[0].toUpperCase&&this.oFormatOptions.displayFormat==="UpperCase"){r[0]=r[0].toUpperCase()}return r};o.prototype.parseIDOnly=function(t,e){t=this.getPrimaryType().prototype.parseValue.call(this,t,e);return[t,undefined]};o.prototype.setSelectedValue=function(t){this._sSelectedValue=t};o.prototype._isValueSelected=function(t){return this._sSelectedValue===t};o.prototype.parseIDAndDescription=function(t,e,i,r){var n;if(!this._isValueSelected(t)){if(r&&r.textArrangement==="idAndDescription"){n=/^([\S\s]+?)\s\([\S\s]+\)$/.exec(t)}else{n=/^[\S\s]+\s\(([\S\s]+?)\)$/.exec(t)}}this.setSelectedValue(null);if(Array.isArray(n)&&n[1]){t=n[1]}return this.parseIDOnly(t,e)};o.prototype.parseDescriptionOnly=function(t,e,i,r,s){return new Promise(function(i,r){var a=this.oConstraints&&this.oConstraints.maxLength?this.oConstraints.maxLength:0;if(t===null||t===""){return i([t,""])}if(t&&t.toUpperCase&&this.oFormatOptions.displayFormat==="UpperCase"){t=t.toUpperCase()}if(t&&a&&t.length>a){r(new n(this.getCoreResourceBundleText("EnterTextMaxLength",[a])));return}function o(a){var o,u=s.keyField,p=s.descriptionField;var d=l(t,{key:p,value:u,data:a});var h=d.length;if(h===1){o=this.getPrimaryType().prototype.parseValue.call(this,d[0],e);i([o,undefined]);return}if(h===0){d=l(t,{key:u,value:p,data:a});h=d.length}if(!this.bValueListNoValidation){if(h===0){r(new n(this.getResourceBundleText("SMARTFIELD_NOT_FOUND")));return}if(h>1){r(new n(this.getResourceBundleText("SMARTFIELD_DUPLICATE_VALUES")));return}}o=this.getPrimaryType().prototype.parseValue.call(this,t,e);i([o,undefined])}function u(t){r(new n(this.getResourceBundleText("SMARTFIELD_INVALID_ENTRY")))}var p={filterFields:this.getFilterFields(),success:o.bind(this),error:u.bind(this)};this.onBeforeValidateValue(t,p)}.bind(this))};o.prototype.validateValue=function(t,e){this.validateIDOnly(t);var i=t[0];if(i===null){return}if(this.oFormatOptions.textArrangement==="descriptionOnly"){this.validateDescriptionOnly(t,this.oSettings);return}var r=new Promise(function(r,s){function a(e){var i=Object.assign({},this.oSettings,{data:e,reject:s});var n=this.fnValidator(t,i);if(n){r(t)}}function o(t){s(new n(this.getResourceBundleText("SMARTFIELD_INVALID_ENTRY")))}var l={filterFields:this.getFilterFields(),success:a.bind(this),error:o.bind(this),bCheckValuesValidity:e};this.onBeforeValidateValue(i,l)}.bind(this));if(this.bValueListNoValidation){return}else{return r}};o.prototype.validateIDOnly=function(t,e){var i=t[0],r,s;this.getPrimaryType().prototype.validateValue.call(this,i);if(this.getSettings().valueList&&e){r=e.data;s=e.reject;if(r.length===0){s(new n(this.getResourceBundleText("SMARTFIELD_NOT_FOUND")));return false}if(r.length>1){s(new n(this.getResourceBundleText("SMARTFIELD_DUPLICATE_VALUES")));return false}}return true};o.prototype.validateIDAndDescription=function(t,e){var i={key:e.keyField,value:e.descriptionField,data:e.data};if(this.oFormatOptions&&this.oFormatOptions.displayFormat){i.displayFormat=this.oFormatOptions.displayFormat}var r=l(t[0],i,this.oConstraints);var s=e.reject;if(!this.bValueListNoValidation){if(r.length===0){s(new n(this.getResourceBundleText("SMARTFIELD_NOT_FOUND")));return false}if(r.length>1){s(new n(this.getResourceBundleText("SMARTFIELD_DUPLICATE_VALUES")));return false}}return true};o.prototype.validateDescriptionOnly=function(t,e){};o.prototype.formatValue=function(t,e){var r;if(!Array.isArray(t)){return t}if(this.bValueListNoValidation&&t[1]===undefined){t.splice(1,1)}r=this.getPrimaryType().prototype.formatValue.call(this,t[0],e);if(r===null){return r}if(r&&this.oFormatOptions.displayFormat==="UpperCase"){r=r.toUpperCase()}var n=t[1];if(n===""&&this.oFormatOptions.textArrangement!=="idOnly"&&this.oSettings.delegate){this.oSettings.delegate._sTextArrangementLastReadValue=null}if(!n&&this.oFormatOptions.textArrangement==="descriptionOnly"){return r}if(s(n)||this.bIsInvalid){n=""}return i.getFormattedExpressionFromDisplayBehaviour(this.oFormatOptions.textArrangement,r,n)};o.prototype.setDescriptionIsInvalid=function(t){this.bIsInvalid=t};o.prototype.getDescriptionIsInvalid=function(){return this.bIsInvalid};o.prototype.destroy=function(){this.oFormatOptions=null;this.oSettings=null;this.fnParser=null;this.fnValidator=null};o.prototype.getName=function(){return"sap.ui.comp.smartfield.type.TextArrangement"};o.prototype.onBeforeValidateValue=function(t,e){this.oSettings.onBeforeValidateValue(t,e)};o.prototype.getResourceBundleText=function(e,i){return t.getLibraryResourceBundle("sap.ui.comp").getText(e,i)};o.prototype.getCoreResourceBundleText=function(e,i){return t.getLibraryResourceBundle("sap.ui.core").getText(e,i)};o.prototype.getPrimaryType=function(){};o.prototype.getValidator=function(t){switch(t.textArrangement){case"idAndDescription":case"descriptionAndId":return this[t.prefix+"IDAndDescription"];case"descriptionOnly":return this[t.prefix+"DescriptionOnly"];default:return this[t.prefix+"IDOnly"]}};o.prototype.getFilterFields=function(t){return["keyField"]};function l(t,e,i){var r=[];if(e.displayFormat==="UpperCase"){t=t.toLowerCase()}e.data.forEach(function(n,s,a){var o=e.displayFormat==="UpperCase"?n[e.key].toLowerCase():n[e.key],l=i&&i.isDigitSequence&&i.maxLength&&t.lastIndexOf(o)!==-1;if(l||o===t){r.push(n[e.value])}});return r}return o});
//# sourceMappingURL=TextArrangement.js.map