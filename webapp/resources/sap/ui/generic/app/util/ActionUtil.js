/*
 * ! SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/base/ManagedObject","sap/m/MessageBox","sap/ui/comp/smartform/SmartForm","sap/ui/comp/smartform/Group","sap/ui/comp/smartform/GroupElement","sap/ui/comp/smartfield/SmartField","sap/ui/comp/smartfield/SmartLabel","sap/m/Dialog","sap/ui/generic/app/util/ModelUtil","sap/m/VBox","sap/m/Text","sap/base/strings/formatMessage","sap/base/Log"],function(jQuery,e,t,a,r,o,n,i,s,l,u,c,p,f){"use strict";var m=e.extend("sap.ui.generic.app.util.ActionUtil",{metadata:{properties:{controller:{type:"object",group:"Misc",defaultValue:null},applicationController:{type:"object",group:"Misc",defaultValue:null},contexts:{type:"object",group:"Misc",defaultValue:null},successCallback:{type:"function",group:"Misc",defaultValue:null},operationGrouping:{type:"string",group:"Misc",defaultValue:null}}}});m.prototype._getObjectsDifference=function(e,t){var a=[];var r=Object.keys(e);for(var o=0;o<r.length;o++){if(e[r[o]]!==t[r[o]]){a.push(r[o])}}return a};m.prototype.call=function(e,a,r,o,n,i,s){var l=this;return new Promise(function(u,c){var f;l._oActionPromiseCallback={resolve:u,reject:c};l._sFunctionImportPath=e;var m=l.getController();if(!m||!m.getView()){c("No View Controller provided")}l._oMetaModel=m.getView().getModel().getMetaModel();var d=e.split("/")[1];l._oFunctionImport=l._oMetaModel.getODataFunctionImport(d);l._sFunctionImportLabel=a;l._sFunctionImportButtonActionButtonText=s||a;l._oSkipProperties=o||{};var g=function(){var e=l.getContexts();f=l._prepareParameters(e,r,i);f=f||[{}];f.expand=i?i.expand:undefined;var t=l.getApplicationController().getTransactionController().getDefaultValues(e,f.map(function(e){return e.parameterData}),undefined,d);if(t instanceof Promise){var a=function(e){for(var t=0;t<f.length;t++){f[t].propertiesOverridenByDefault=l._getObjectsDifference(f[t].parameterData,e[t]);f[t].parameterData=e[t]}l._initiateCall(f,r,n)};t.then(a,a)}else{if(i.predefinedValues){var o=Object.keys(i.predefinedValues);f.forEach(function(e){var t=e.additionalParameters.map(function(e){return e.name});o.forEach(function(a){if(t.includes(a)){e.parameterData[a]=i.predefinedValues[a]}});e.isCreationScenario=i.isCreationScenario})}l._initiateCall(f,r,n)}};if(!l._oFunctionImport){c("Unknown Function Import "+d)}if(l._isActionCritical()){var v="ACTION_CONFIRM|"+d;var h;var y=m.getOwnerComponent().getAppComponent&&m.getOwnerComponent().getAppComponent().getModel("i18n")&&m.getOwnerComponent().getAppComponent().getModel("i18n").getResourceBundle();if(y&&y.hasText(v)){h=y.getText(v)}else{h=sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app").getText("ACTION_CONFIRM");h=p(h,l._sFunctionImportLabel)}t.confirm(h,{title:l._sFunctionImportLabel,onClose:function(e){if(e==="OK"){g()}else if(e==="CANCEL"){l._oActionPromiseCallback.reject()}},sClass:l._getCompactModeStyleClass()})}else{g()}})};m.prototype._getCompactModeStyleClass=function(){if(this.getController().getView().$().closest(".sapUiSizeCompact").length){return"sapUiSizeCompact"}return""};m.prototype._cleanUpContext=function(e){e.forEach(function(e){var t=e.getModel();var a=e.sPath;t.resetChanges([a],true,true)})};m.prototype._isActionCritical=function(){var e=this._oFunctionImport["com.sap.vocabularies.Common.v1.IsActionCritical"];if(!e){return false}if(e.Bool===undefined){return true}return this._toBoolean(e.Bool)};m.prototype._toBoolean=function(e){if(typeof e==="string"){var t=e.toLowerCase();return!(t=="false"||t==""||t==" ")}return!!e};m.prototype._prepareParameters=function(e,t,a){if(!Array.isArray(e)&&!e.length){return undefined}var r=[];e.forEach(function(e){var o=null;var n=e.getObject();if(e&&e.getPath()){var i=l.getEntitySetFromContext(e);var s=e.getModel().getMetaModel().getODataEntitySet(i,false);o=e.getModel().getMetaModel().getODataEntityType(s.entityType,false)}var u=this._getPropertyKeys(o);var c;var p={parameterData:{},additionalParameters:[],isDraftEnabled:t};if(this._oFunctionImport.parameter){for(var m=0;m<this._oFunctionImport.parameter.length;m++){var d=this._oFunctionImport.parameter[m];this._addParameterLabel(d,o);var g=d.name;var v=!!u[g];c=undefined;if(g==="ResultIsActiveEntity"){if(d.nullable!=="false"){continue}c=false}if(n&&n.hasOwnProperty(g)){c=n[g]}else if(v&&n&&this._oFunctionImport["sap:action-for"]){f.error("Key parameter of action not found in current context: "+g);throw new Error("Key parameter of action not found in current context: "+g)}if(a&&(a[g]||a[g]==="")){p.parameterData[g]=a[g]}else{p.parameterData[g]=c}var h=!!this._oSkipProperties[g];if(!h&&(!v||!this._oFunctionImport["sap:action-for"])&&d.mode.toUpperCase()=="IN"){p.additionalParameters.push(d)}}r.push(p)}else{r.push(p)}}.bind(this));return r};m.prototype._getPropertyKeys=function(e){var t={};if(e&&e.key&&e.key.propertyRef){for(var a=0;a<e.key.propertyRef.length;a++){var r=e.key.propertyRef[a].name;t[r]=true}}return t};m.prototype._setAdditionalParameters=function(e,t,a,r,o){e.forEach(function(e){if(t===e.name){if(e.hasOwnProperty("com.sap.vocabularies.UI.v1.Hidden")||o&&o.includes(t)){r.oModel.setProperty(t,a[t],r)}else{r.oModel.setProperty(t,undefined,r)}}})};m.prototype._initiateCall=function(e,t,a){var r=e[0];var o=a?"strict":"lenient";var i={Prefer:"handling="+o};if(r!=undefined&&(r.additionalParameters&&r.additionalParameters.length==0||r.isCreationScenario&&Object.values(r.parameterData).every(function(e){return!!e}))){this._call(r.parameterData,r.isDraftEnabled,i)}else if(r!=undefined&&r.additionalParameters&&r.additionalParameters.length>0){var l=this;var u=this.getApplicationController();(t?u.synchronizeDraftAsync():Promise.resolve()).then(function(){var t={urlParameters:{},headers:i,expand:e.expand};var o=l.getContexts();var c=u._getChangeSetFunc(o,l.getOperationGrouping());var p=o.map(function(e,a){t.changeSetId=c(a);return u.getNewActionContext(l._sFunctionImportPath,e,t)});var f=p.map(function(e){return e.context});Promise.all(f).then(function(t){var i=t[0];var u=r.additionalParameters.map(function(e){return e.name});t.forEach(function(a,r){var o=e[r].parameterData;for(var n in o){if(t.length>1&&u.indexOf(n)>-1){l._setAdditionalParameters(e[r].additionalParameters,n,o,a,e[r].propertiesOverridenByDefault)}else{a.oModel.setProperty(n,o[n],a)}}});if(a){var c=l._buildParametersForm(r,i);var f=false;var m=new s({title:l._sFunctionImportLabel,content:[c.form],beginButton:new sap.m.Button({text:l._sFunctionImportButtonActionButtonText,type:"Emphasized",press:function(){var e=c.form?c.form.check():Promise.resolve();e.then(function(){if(c.hasNoClientErrors()){m.close();f=l._triggerActionPromise(p,o,r,t,a)}})}}),endButton:new sap.m.Button({text:sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app").getText("ACTION_CANCEL"),press:function(){p[0].abort();m.close();l._cleanUpContext(t);l._oActionPromiseCallback.reject();f=true}}),afterClose:function(){m.destroy();if(!f){l._oActionPromiseCallback.reject()}}}).addStyleClass("sapUiNoContentPadding");m.addStyleClass(l._getCompactModeStyleClass());m.setModel(i.oModel);if(l.getController().getView().getModel("@i18n")){m.setModel(l.getController().getView().getModel("@i18n"),"@i18n")}var d=m.getAggregation("content")[0].mAggregations["content"];var g=d.getFormContainers()[0].getFormElements();var v=true;for(var h=0;h<g.length;h++){var y=g[h].getFields()[0];if(y instanceof n&&y.getVisible()===true){v=false;break}}if(g.length===0||v){l._triggerActionPromise(p,o,r,t,a);m.destroy()}else{m.open()}}else{l._triggerActionPromise(p,o,r,t)}})})}else{this._call(null,r!=undefined?r.isDraftEnabled:t,i)}};m.prototype._triggerActionPromise=function(e,t,a,r,o){var n=this;var i={};n._oActionPromiseCallback.resolve({executionPromise:n.getApplicationController()._newPromiseAll(e.map(function(e){return e.result})).then(function(e){n._bExecutedSuccessfully=n.getApplicationController()._checkAtLeastOneSuccess(t,e);if(o){e.forEach(function(e){e.userEnteredAdditionalParams=i})}if(n._bExecutedSuccessfully){return e}else{n._cleanUpContext(r);return Promise.reject(e)}},function(e){n._bExecutedSuccessfully=false;e.forEach(function(e){e.userEnteredAdditionalParams=i});throw e})});var s=r[0].getObject();a.additionalParameters.forEach(function(e){var t=s[e.name]===null?"":s[e.name];if(e.type=="Edm.Boolean"&&t==undefined){s[e.name]=false;t=false}i[e.name]=t;r.forEach(function(a){a.oModel.setProperty(e.name,t,a)})});var l=n._sFunctionImportPath.split("/")[1];t.forEach(function(e,t){n.getApplicationController().submitActionContext(e,r[t],l)});if(o){return true}};m.prototype._call=function(e,t,a){var r=this.getContexts();var o={urlParameters:e,operationGrouping:this.getOperationGrouping(),triggerChanges:t,headers:a};var n=this.getController();var i=this.getApplicationController()||n.getApplicationController();var s=this;s._oActionPromiseCallback.resolve({executionPromise:i.invokeActions(this._sFunctionImportPath,r,o).then(function(e){s._bExecutedSuccessfully=true;return e},function(e){s._bExecutedSuccessfully=false;throw e})})};m.prototype._getActionParameterData=function(e){var t=[];var a=e.getObject("/");var r={};for(var o=0;o<this._oFunctionImport.parameter.length;o++){var n=this._oFunctionImport.parameter[o];var i=n.name;if(a.hasOwnProperty(i)){var s=a[i];if(s===undefined){if(!this._toBoolean(n.nullable)){if(n.type==="Edm.Boolean"){r[i]=false}else{t.push(n)}}}else{r[i]=s}}else{throw new Error("Unknown parameter: "+i)}}return{preparedParameterData:r,missingMandatoryParameters:t}};m.prototype._buildParametersForm=function(e,t){var s=new a({editable:true,validationMode:"Async"});s.setBindingContext(t);var l;var u=[];var c;var p;var f=new r;for(var m=0;m<e.additionalParameters.length;m++){var d=e.additionalParameters[m];if(d["com.sap.vocabularies.UI.v1.Hidden"]&&!d["com.sap.vocabularies.UI.v1.Hidden"].Path&&!(d["com.sap.vocabularies.UI.v1.Hidden"].Bool==="false")){continue}p=d["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"]?"fixed-values":undefined;if(p==undefined){p=d["sap:value-list"]=="fixed-values"?"fixed-values":undefined}if(!d["com.sap.vocabularies.UI.v1.TextArrangement"]){d["com.sap.vocabularies.UI.v1.TextArrangement"]={EnumMember:"com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"}}l=new n("ActionUtil-"+this._sFunctionImportPath.replace("/","-")+"-"+d.name,{value:"{"+d.name+"}",textLabel:this._getParameterName(d),width:"100%"});l.data("configdata",{configdata:{isInnerControl:false,path:d.name,entitySetObject:{},annotations:{valuelist:d["com.sap.vocabularies.Common.v1.ValueList"],valuelistType:p},modelObject:t.oModel,entityType:d.type,property:{property:d,typePath:d.name}}});if(d.nullable=="false"){l.setMandatory(true)}u.push(l);c=new i;c.setLabelFor(l);var g=new o;g.addElement(l);f.addGroupElement(g)}s.addGroup(f);var v=function(){var e=true;for(var t=0;t<u.length;t++){if(u[t].getValueState()!="None"){e=false;break}}return e};return{form:s,hasNoClientErrors:v}};m.prototype._getParameterName=function(e){return e["com.sap.vocabularies.Common.v1.Label"]?e["com.sap.vocabularies.Common.v1.Label"].String:e.name};m.prototype._addParameterLabel=function(e,t){if(t&&e&&!e["com.sap.vocabularies.Common.v1.Label"]){var a=this._oMetaModel.getODataProperty(t,e.name,false);if(a&&a["com.sap.vocabularies.Common.v1.Label"]){e["com.sap.vocabularies.Common.v1.Label"]=a["com.sap.vocabularies.Common.v1.Label"]}}};m.prototype.getFunctionImportLabel=function(){return this._sFunctionImportLabel};m.prototype.getExecutedSuccessfully=function(){return this._bExecutedSuccessfully};return m});
//# sourceMappingURL=ActionUtil.js.map