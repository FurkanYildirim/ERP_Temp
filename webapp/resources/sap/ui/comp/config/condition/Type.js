/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/date/UI5Date","sap/ui/base/EventProvider","sap/ui/model/json/JSONModel","sap/m/Select","sap/ui/core/ListItem","sap/m/Label","sap/ui/model/Sorter","sap/ui/model/Filter","sap/ui/core/date/UniversalDate"],function(t,e,o,i,n,r,a,s,l){"use strict";var u=e.extend("sap.ui.comp.config.condition.Type",{constructor:function(t,i,n){e.call(this);this.oFilterProvider=i;var r={condition:{operation:"",value1:null,value2:null,key:t},operations:[],controls:[],currentoperation:{},pending:false};this.oModel=new o(r);var a=this.oModel.checkUpdate;this.oModel.suspend=function(){this.bSuspended=true;this.checkUpdate=function(){}};this.oModel.resume=function(){this.bSuspended=false;this.checkUpdate=a;this.checkUpdate()};this.oContext=this.oModel.getContext("/");this.oConditionContext=this.oModel.getContext("/condition");this.sFieldName=t;var s=this.oModel.bindProperty("operation",this.oConditionContext),l=this;s.attachChange(function(){var t=l.oModel.getProperty("operation",l.getConditionContext()),e=l.getOperation(t);if(e){e=Object.assign({},e);if(!l.bIgnoreBindingChange){var o=l.getDefaultValues(e);if(l._bSingleFilterRestriction&&o[0]){l.setDefaultValues(o[0].oDate,o[1])}else{l.setDefaultValues(o[0],o[1])}}}l.setControls([]);l.setControls(l.getControls(e));if(e){if(e.getValueList){e.valueList=e.getValueList()}l.oModel.setProperty("/currentoperation",e)}if(!l.bIgnoreBindingChange){l.serialize(false,l.bFireFilterChange)}});var u=this.oModel.bindProperty("value1",this.oConditionContext);u.attachChange(function(){if(!l.bIgnoreBindingChange){l.serialize(false,l.bFireFilterChange)}});var d=this.oModel.bindProperty("value2",this.oConditionContext);d.attachChange(function(){if(!l.bIgnoreBindingChange){l.serialize(false,l.bFireFilterChange)}});var p=this.oModel.bindProperty("pending",this.oContext);p.attachChange(function(){if(l.bAsync){if(l._iPendingTimer){clearTimeout(l._iPendingTimer)}l._iPendingTimer=setTimeout(l["fireEvent"].bind(l,"PendingChange",{oSource:l,pending:l.oModel.getProperty("/pending")}),10)}});this._oOperationSelect=null;this.oFieldMetadata=n;this.oOperationFilter=null;this.bAsync=false}});u._createStableId=function(t,e){if(t&&t.oFilterProvider&&t.oFieldMetadata){return t.oFilterProvider._createFilterControlId(t.oFieldMetadata)+(e?e:"")}else{return undefined}};u.getTranslatedText=function(t,e){if(typeof t==="object"){e=t.bundle;t=t.key}if(!e){e="sap.ui.comp"}return sap.ui.getCore().getLibraryResourceBundle(e).getText(t)||t};u.prototype.getTranslatedText=u.getTranslatedText;u.prototype.applySettings=function(e){if(e&&e.defaultOperation){this._sSettingsDefaultOperation=e.defaultOperation}if(e&&e.defaultDate&&!e.defaultOperation){var o=t.getInstance(e.defaultDate);if(o instanceof Date){this._sSettingsDefaultOperation="DATE";this._defaultDate=e.defaultDate}}if(e&&e.operations&&e.operations.filter){this.oOperationFilter=e.operations.filter}else{this.oOperationFilter=null}};u.prototype.getParent=function(){return this.oFilterProvider._oSmartFilter};u.prototype.getModel=function(){return this.oModel};u.prototype.getConditionContext=function(){return this.oConditionContext};u.prototype.setDefaultValues=function(t,e){this.oModel.setProperty("value1",t,this.getConditionContext(),true);this.oModel.setProperty("value2",e,this.getConditionContext(),true)};u.prototype.getContext=function(){return this.oContext};u.prototype.getControls=function(t){return[]};u.prototype.getOperations=function(){return[]};u.prototype.isPending=function(){return this.getModel().getProperty("pending",this.getContext())};u.prototype.attachPendingChange=function(t){this.attachEvent("PendingChange",t)};u.prototype.detachPendingChange=function(t){this.detachEvent("PendingChange",t)};u.prototype.setPending=function(t){if(this.bAsync){this.getModel().setProperty("pending",t,this.getContext())}};u.prototype._filterOperation=function(t){if(!this.oOperationFilter){return true}var e=Array.isArray(this.oOperationFilter)?this.oOperationFilter:[this.oOperationFilter],o;e.some(function(e){if(!e.path){return false}var i=t[e.path];var n=e.exclude||false;var r;if(e.contains&&i){r=typeof e.contains==="string"?e.contains.split(","):e.contains;o=n;for(var a=0;a<r.length;a++){if(n&&i.indexOf(r[a])>-1){o=false;return true}else if(!n&&i.indexOf(r[a])>-1){o=true;return true}}}if(e.equals&&i){r=typeof e.equals==="string"?e.equals.split(","):e.equals;o=n;for(var a=0;a<r.length;a++){if(n&&i===r[a]){o=false;return true}else if(!n&&i===r[a]){o=true;return true}}}return false});return o};u.prototype._updateOperation=function(t){if(!t.textValue){t.textValue=""}if(!t.languageText&&t.textKey){t.languageText=this.getTranslatedText(t.textKey)}};u.prototype.updateOperations=function(){this.oModel.setProperty("operations",[],this.getContext())};u.prototype.getOperation=function(t){var e=this.oModel.getProperty("operations",this.getContext())||[];for(var o=0;o<e.length;o++){if(t===e[o].key){return e[o]}}return null};u.prototype.getDefaultOperation=function(){var t=this.getOperations();if(!t||t.length===0){return null}for(var e=0;e<t.length;e++){if(this._sSettingsDefaultOperation===t[e].key){if(this._defaultDate&&t[e].key==="DATE"){t[e].defaultValues=[new l(this._defaultDate).oDate];this._defaultDate=null}return t[e]}if(!this._sSettingsDefaultOperation&&t[e].defaultOperation){if(!this._defaultDate&&t[e].key==="DATE"&&t[e].defaultValues&&t[e].defaultValues[0]){t[e].defaultValues=[null]}return t[e]}}return t[0]};u.prototype.setControls=function(t){var e=this.oModel.getProperty("controls",this.getContext());var o;if(e){for(o=0;o<e.length;o++){e[o].destroy()}}this.oModel.setProperty("controls",t,this.getContext());if(t){for(o=0;o<t.length;o++){t[o].setBindingContext(this.getConditionContext(),"$smartEntityFilter")}this._setAriaLabeledByToControls(t)}};u.prototype._setAriaLabeledByToControls=function(t){if(this._oOperationLabel&&t){for(var e=0;e<t.length;e++){if(t[e].addAriaLabelledBy){if(t[e].getAriaLabelledBy().indexOf(this._oOperationLabel.getId())===-1){t[e].addAriaLabelledBy(this._oOperationLabel)}}}}};u.prototype.setOperation=function(t){var e=this.getOperation(t);if(e){this.setCondition({operation:e.key,key:this.sFieldName,value1:e.defaultValues[0]||null,value2:e.defaultValues[1]||null});this.getModel().checkUpdate(true)}else{}};u.prototype.isValidCondition=function(){return false};u.prototype.setCondition=function(t){this.oModel.setProperty("key",t.key,this.oConditionContext);this.oModel.setProperty("operation",t.operation,this.oConditionContext);this.oModel.setProperty("value1",t.value1,this.oConditionContext);this.oModel.setProperty("value2",t.value2,this.oConditionContext);this.oModel.setProperty("tokenText",this.getTokenText(t),this.oConditionContext);return this};u.prototype.setAsync=function(t){this.bAsync=t};u.prototype.getAsync=function(t){return this.bAsync};u.prototype.initialize=function(t){this.updateOperations()};u.prototype.serialize=function(){};u.prototype.validate=function(t){this._bForceError=t!==false;var e=this.getModel().getProperty("inputstate",this.getContext())||"NONE";if(!this.isPending()&&this.oFieldMetadata&&this.oFieldMetadata.isMandatory&&(!this.isValidCondition()||e!=="NONE")&&this._bForceError){this.getModel().setProperty("inputstate","ERROR",this.getContext());return false}this.getModel().setProperty("inputstate","NONE",this.getContext());return true};u.prototype.getCondition=function(){var t=Object.assign({},this.oModel.getProperty("",this.oConditionContext));return t};u.prototype.providerDataUpdated=function(t,e){};u.prototype.getFilter=function(t){return null};u.prototype.getFilterRanges=function(t){return null};u.prototype.getTokenText=function(t){return""};u.prototype.getName=function(){return this.getMetadata().getName()};u.prototype.getType=function(){return"Edm"};u.prototype._initializeFilterItemPopoverContent=function(t){var e=new r({text:u.getTranslatedText("CONDITION_DATERANGETYPE_POPOVER_LABEL")});t.addItem(e);this._oOperationLabel=e;var o=new i(u._createStableId(this,"select"),{width:"100%"});if(o._oList&&o._oList.setShowSecondaryValues){o._oList.setShowSecondaryValues(true)}o.bindProperty("selectedKey",{path:"$smartEntityFilter>condition/operation"});o.bindAggregation("items",{path:"$smartEntityFilter>operations",sorter:new a("order",false,false),filters:new s("order",function(t){return t!==undefined&&t>-1}),template:new n({text:{path:"$smartEntityFilter>languageText"},key:{path:"$smartEntityFilter>key"},additionalText:{path:"$smartEntityFilter>textValue"}})});o.setBindingContext(this.getContext(),"$smartEntityFilter");var l=this.getModel().bindList("controls",this.getContext());l.attachChange(function(){var e=l.getModel().getProperty("controls",l.getContext());if(e){for(var o=0;o<e.length;o++){t.addItem(e[o])}}});t.addItem(o);e.setLabelFor(o);this._oOperationSelect=o;t.setModel(this.getModel(),"$smartEntityFilter");this.bIgnoreBindingChange=true;this.getModel().checkUpdate(true);this.bIgnoreBindingChange=false;this.oLayout=t};u.prototype.destroy=function(){this.setControls([]);this.oLayout=null;e.prototype.destroy.apply(this,arguments)};return u});
//# sourceMappingURL=Type.js.map