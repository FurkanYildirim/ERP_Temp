/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/model/Context","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/VariantItem","sap/m/VariantManagement","sap/ui/fl/apply/api/ControlVariantApplyAPI","sap/ui/fl/registry/Settings","sap/ui/core/Control","sap/ui/core/library","sap/base/Log"],function(t,e,a,n,i,o,r,s,l,h){"use strict";var p=l.TitleLevel;var c=s.extend("sap.ui.fl.variants.VariantManagement",{metadata:{interfaces:["sap.ui.core.IShrinkable","sap.m.IOverflowToolbarContent","sap.m.IToolbarInteractiveControl"],library:"sap.ui.fl",designtime:"sap/ui/fl/designtime/variants/VariantManagement.designtime",properties:{updateVariantInURL:{type:"boolean",group:"Misc",defaultValue:false},resetOnContextChange:{type:"boolean",group:"Misc",defaultValue:true},modelName:{type:"string",group:"Misc",defaultValue:""},editable:{type:"boolean",group:"Misc",defaultValue:true},showSetAsDefault:{type:"boolean",group:"Misc",defaultValue:true},manualVariantKey:{type:"boolean",group:"Misc",defaultValue:false},inErrorState:{type:"boolean",group:"Misc",defaultValue:false},executeOnSelectionForStandardDefault:{type:"boolean",group:"Misc",defaultValue:false},displayTextForExecuteOnSelectionForStandardVariant:{type:"string",group:"Misc",defaultValue:""},headerLevel:{type:"sap.ui.core.TitleLevel",group:"Appearance",defaultValue:p.Auto},titleStyle:{type:"sap.ui.core.TitleLevel",group:"Appearance",defaultValue:p.Auto},maxWidth:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"100%"}},events:{initialized:{},save:{parameters:{name:{type:"string"},overwrite:{type:"boolean"},key:{type:"string"},execute:{type:"boolean"},public:{type:"boolean"},def:{type:"boolean"},tile:{type:"boolean"}}},cancel:{},manage:{parameters:{renamed:{type:"object[]"},deleted:{type:"string[]"},exe:{type:"object[]"},def:{type:"string"}}},select:{parameters:{key:{type:"string"}}}},associations:{for:{type:"sap.ui.core.Control",multiple:true}},aggregations:{_embeddedVM:{type:"sap.m.VariantManagement",multiple:false,visibility:"hidden"}}},renderer:{apiVersion:2,render:function(t,e){t.openStart("div",e);t.style("max-width",e.getMaxWidth());t.openEnd();t.renderControl(e._oVM);t.close("div")}}});c.prototype.init=function(){s.prototype.init.apply(this);this.addStyleClass("sapUiFlVarMngmt");this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");this.setModelName(o.getVariantModelName());this.attachModelContextChange(this._setModel,this);this._oVM=new i(this.getId()+"-vm");this.setAggregation("_embeddedVM",this._oVM,true);this._aCancelEventHandlers=[];this._aSaveEventHandlers=[];this._aManageEventHandlers=[];this._aSelectEventHandlers=[];this._oVM.attachManage(this._fireManage,this);this._oVM.attachCancel(this._fireCancel,this);this._oVM.attachSave(this._fireSave,this);this._oVM.attachSelect(this._fireSelect,this);this._updateWithSettingsInfo()};c.prototype.getOverflowToolbarConfig=function(){return{canOverflow:false,invalidationEvents:["save","manage","select"]}};c.prototype.attachCancel=function(t,e,a){this.attachEvent("cancel",t,e,a);return this};c.prototype._findCallback=function(t,e,a){var n=-1;t.some(function(t,i){if(t.fCallback===e&&t.oObj===a){n=i}return n>=0});return n};c.prototype.detachCancel=function(t,e){var a=this._findCallback(this._aCancelEventHandlers,t,e);if(a>=0){this.detachEvent("cancel",t,e);this._aCancelEventHandlers.splice(a,1)}return this};c.prototype.fireManage=function(t){this._oVM.fireManage(t)};c.prototype.fireSave=function(t){this._oVM.fireSave(t)};c.prototype._fireCancel=function(t){for(var e=0;e<this._aCancelEventHandlers.length;e++){t.oSource=this;this._aCancelEventHandlers[e].fCallbackBound(t,this._aCancelEventHandlers[e].mProps)}};c.prototype.attachSave=function(t,e,a){this.attachEvent("save",t,e,a);return this};c.prototype.detachSave=function(t,e){var a=this._findCallback(this._aSaveEventHandlers,t,e);if(a>-1){this.detachEvent("save",t,e);this._aSaveEventHandlers.splice(a,1)}return this};c.prototype._fireSave=function(t){this._handleAllListeners(t,this._aSaveEventHandlers)};c.prototype.hasListeners=function(t){var e=["save","select","cancel","manage"];if(e.indexOf(t)>-1){var a=null;if(t==="select"){a=this._aSelectEventHandlers}else if(t==="save"){a=this._aSaveEventHandlers}else if(t==="manage"){a=this._aManageEventHandlers}else if(t==="cancel"){a=this._aCancelEventHandlers}return a.length>0}return s.prototype.hasListeners.apply(this,arguments)};c.prototype.attachEvent=function(t,e,a,n){var i=["save","select","cancel","manage"];if(i.indexOf(t)>-1){var o=null;var r=a;if(typeof e==="function"){r=e;n=a;e=undefined}n=n===this?undefined:n;if(t==="select"){o=this._aSelectEventHandlers}else if(t==="save"){o=this._aSaveEventHandlers}else if(t==="manage"){o=this._aManageEventHandlers}else if(t==="cancel"){o=this._aCancelEventHandlers}o.push({fCallback:r,fCallbackBound:n?r.bind(n):r,oObj:n,mProps:e})}else{s.prototype.attachEvent.apply(this,arguments)}};c.prototype.attachEventOnce=function(t,e,a,n){var i;if(t==="manage"){i=this._findCallback(this._aManageEventHandlers,a,n);if(i>-1&&this._aManageEventHandlers[i].bOnce){this._aManageEventHandlers.splice(i,1)}this.attachManage(e,a,n);i=this._findCallback(this._aManageEventHandlers,a,n);if(i>-1){this._aManageEventHandlers[i].bOnce=true}}else if(t==="save"){i=this._findCallback(this._aSaveEventHandlers,a,n);if(i>-1&&this._aSaveEventHandlers[i].bOnce){this._aSaveEventHandlers.splice(i,1)}this.attachSave(e,a,n);i=this._findCallback(this._aSaveEventHandlers,a,n);if(i>-1){this._aSaveEventHandlers[i].bOnce=true}}else if(t==="select"){i=this._findCallback(this._aSelectEventHandlers,a,n);if(i>-1&&this._aSelectEventHandlers[i].bOnce){this._aSelectEventHandlers.splice(i,1)}this.attachSelect(e,a,n);i=this._findCallback(this._aSelectEventHandlers,a,n);if(i>-1){this._aSelectEventHandlers[i].bOnce=true}}else{s.prototype.attachEventOnce.apply(this,arguments)}};c.prototype.attachManage=function(t,e,a){this.attachEvent("manage",t,e,a);return this};c.prototype._handleAllListeners=function(t,e){var a=0;var n=[];while(a<e.length){t.oSource=this;e[a].fCallbackBound(t,e[a].mProps);if(e[a]){if(e[a].hasOwnProperty("bOnce")&&e[a].bOnce){n.push(a)}a+=1}}for(a=n.length-1;a>-1;a--){e.splice(n[a],1)}};c.prototype._fireManage=function(t){this._handleAllListeners(t,this._aManageEventHandlers)};c.prototype.detachManage=function(t,e){var a=this._findCallback(this._aManageEventHandlers,t,e);if(a>-1){this.detachEvent("manage",t,e);this._aManageEventHandlers.splice(a,1)}return this};c.prototype.attachSelect=function(t,e,a){this.attachEvent("select",t,e,a);return this};c.prototype._fireSelect=function(t){this._handleAllListeners(t,this._aSelectEventHandlers)};c.prototype.detachSelect=function(t,e){var a=this._findCallback(this._aSelectEventHandlers,t,e);if(a>-1){this.detachEvent("select",t,e);this._aSelectEventHandlers.splice(a,1)}return this};c.prototype._createSaveAsDialog=function(){this._oVM._createSaveAsDialog()};c.prototype._handleVariantSaveAs=function(t){this._oVM._handleVariantSaveAs(t)};c.prototype.getFocusDomRef=function(){if(this._oVM){return this._oVM.oVariantPopoverTrigger.getFocusDomRef()}return null};c.prototype.getManageDialog=function(){if(this._oVM){return this._oVM.oManagementDialog}return null};c.prototype.getVariants=function(){var t=[];if(this.oContext&&this.oContext.getObject()){t=this.oContext.getObject().variants.filter(function(t){if(!t.hasOwnProperty("visible")){return true}return t.visible})}return t};c.prototype.getTitle=function(){return this._oVM.getTitle()};c.prototype.refreshTitle=function(){this._oVM.refreshTitle()};c.prototype.setPopoverTitle=function(t){this._oVM.setPopoverTitle(t);return this};c.prototype.setHeaderLevel=function(t){this.setProperty("headerLevel",t);this._oVM.setLevel(t);return this};c.prototype.setTitleStyle=function(t){this.setProperty("titleStyle",t);this._oVM.setTitleStyle(t);return this};c.prototype.setEditable=function(t){this.setProperty("editable",t);this._oVM.setShowFooter(t);return this};c.prototype.setShowExecuteOnSelection=function(t){this._oVM.setSupportApplyAutomatically(t);return this};c.prototype.setShowSetAsDefault=function(t){this.setProperty("showSetAsDefault",t);this._oVM.setSupportDefault(t);return this};c.prototype.setExecuteOnSelectionForStandardDefault=function(t){this.setProperty("executeOnSelectionForStandardDefault",t);this._oVM.setExecuteOnSelectionForStandardDefault(t);return this};c.prototype.setDisplayTextForExecuteOnSelectionForStandardVariant=function(t){this.setProperty("displayTextForExecuteOnSelectionForStandardVariant",t);this._oVM.setDisplayTextForExecuteOnSelectionForStandardVariant(t);return this};c.prototype.setManualVariantKey=function(t){this.setProperty("manualVariantKey",t);this._oVM._setShowManualVariantKey(t);return this};c.prototype.setInErrorState=function(t){this.setProperty("inErrorState",t);this._oVM.setInErrorState(t);return this};c.prototype.openManagementDialog=function(t,e,a){this._oVM.openManagementDialog(t,e,a)};c.prototype.openSaveAsDialogForKeyUser=function(t,e){this._oVM.openSaveAsDialog(t,e)};c.prototype.setEditable=function(t){this._oVM.setProperty("showFooter",t);return this};c.prototype.setCurrentVariantKey=function(t){this._oVM.setSelectedKey(t)};c.prototype.getCurrentVariantKey=function(){return this._oVM.getSelectedKey()};c.prototype.setDefaultVariantKey=function(t){this._oVM.setDefaultKey(t)};c.prototype.getDefaultVariantKey=function(){return this._oVM.getDefaultKey()};c.prototype.enteringDesignMode=function(){this._oVM.setDesignMode(true)};c.prototype.leavingDesignMode=function(){this._oVM.setDesignMode(false)};c.prototype.getModified=function(){return this._oVM.getModified()};c.prototype.setModified=function(t){this._oVM.setModified(t)};c.prototype.getStandardVariantKey=function(){return this._oVM.getStandardVariantKey()};c.prototype._getEmbeddedVM=function(){return this._oVM};c.prototype._updateWithSettingsInfo=function(){r.getInstance().then(function(t){if(this._oVM){this._oVM.setShowSaveAs(t.isVariantPersonalizationEnabled());this._oVM.setSupportPublic(t.isPublicFlVariantEnabled())}}.bind(this)).catch(function(t){h.error(t)})};c.prototype.getModelName=function(){return this.getProperty("modelName")};c.prototype.setModelName=function(t){if(this.getModelName()){this.oContext=null;this._aCancelEventHandlers=[];this._aSaveEventHandlers=[];this._aManageEventHandlers=[];this._aSelectEventHandlers=[]}this.setProperty("modelName",t);return this};c.prototype.reinitialize=function(){this.oContext=null;this._setModel()};c.prototype._setModel=function(){this._setBindingContext()};c.prototype._setBindingContext=function(){var e;var a;var n=this.getModelName();if(!this.oContext){e=this.getModel(n);if(e){a=this._getLocalId(e);if(a){this.oContext=new t(e,"/"+a);this.setBindingContext(this.oContext,n);if(e.registerToModel){e.registerToModel(this)}this.fireInitialized();this._oVM.setModel(e,n);this._oVM.setSupportDefault(true);this._createItemsModel(n);this._oVM.bindProperty("selectedKey",{path:this.oContext+"/currentVariant",model:n});this._oVM.bindProperty("defaultKey",{path:this.oContext+"/defaultVariant",model:n});this._oVM.bindProperty("modified",{path:this.oContext+"/modified",model:n});this._oVM.bindProperty("supportFavorites",{path:this.oContext+"/showFavorites",model:n});this._oVM.bindProperty("supportApplyAutomatically",{path:this.oContext+"/showExecuteOnSelection",model:n});this._oVM.bindProperty("showFooter",{path:this.oContext+"/variantsEditable",model:n});this._oVM.setPopoverTitle(this._oRb.getText("VARIANT_MANAGEMENT_VARIANTS"))}}}};c.prototype._createItemsModel=function(t){var i=new n({key:"{"+t+">key}",title:"{"+t+">title}",sharing:"{"+t+">sharing}",remove:"{"+t+">remove}",favorite:"{"+t+">favorite}",originalFavorite:"{"+t+">originalFavorite}",executeOnSelect:"{"+t+">executeOnSelect}",originalExecuteOnSelect:"{"+t+">originalExecuteOnSelect}",rename:"{"+t+">rename}",originalTitle:"{"+t+">originalTitle}",visible:"{"+t+">visible}",changeable:"{"+t+">change}",author:"{"+t+">author}",contexts:"{"+t+">contexts}",originalContexts:"{"+t+">originalContexts}"});this._oVM.bindAggregation("items",{path:this.oContext+"/variants",model:t,template:i,filters:new e({path:"visible",operator:a.EQ,value1:true})})};c.prototype._getLocalId=function(t){var e=this.getModelName();if(!e){return null}if(e!==o.getVariantModelName()){return this.getId()}return t.getVariantManagementReferenceForControl(this)};c.prototype._getInnerItems=function(){var t=[];if(this.oContext&&this.oContext.getObject()){t=this.oContext.getObject().variants.filter(function(t){if(!t.hasOwnProperty("visible")){return true}return t.visible})}return t};c.prototype._getInnerItemByKey=function(t){var e=null;var a=this._getInnerItems();a.some(function(a){if(a.key===t){e=a}return e!==null});return e};c.prototype.registerApplyAutomaticallyOnStandardVariant=function(t){this._fRegisteredApplyAutomaticallyOnStandardVariant=t;return this};c.prototype.getApplyAutomaticallyOnVariant=function(t){var e=false;if(t){e=t.executeOnSelect;if(this._fRegisteredApplyAutomaticallyOnStandardVariant&&this.getDisplayTextForExecuteOnSelectionForStandardVariant()&&t.key===this._oVM.getStandardVariantKey()){try{e=this._fRegisteredApplyAutomaticallyOnStandardVariant(t)}catch(t){h.error("callback for determination of apply automatically on standard variant failed")}}}return e};c.prototype.exit=function(){this._oVM.detachManage(this._fireManage,this);this._oVM.detachCancel(this._fireCancel,this);this._oVM.detachSelect(this._fireSelect,this);this._oVM.detachSave(this._fireSave,this);s.prototype.exit.apply(this,arguments);this._oVM=undefined;this._fRegisteredApplyAutomaticallyOnStandardVariant=null;this.oContext=undefined;this._oRb=undefined;this._aCancelEventHandlers=undefined;this._aSaveEventHandlers=undefined;this._aManageEventHandlers=undefined;this._aSelectEventHandlers=undefined};c.prototype.addFor=function(t){this.addAssociation("for",t);return this};c.prototype._getToolbarInteractive=function(){return true};return c});
//# sourceMappingURL=VariantManagement.js.map