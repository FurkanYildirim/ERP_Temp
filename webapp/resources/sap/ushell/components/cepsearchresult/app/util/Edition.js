// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/model/resource/ResourceModel","sap/m/IconTabFilter","./controls/Category"],function(t,e,n){"use strict";var i=new t({bundleName:"sap.ushell.components.cepsearchresult.app.util.i18n.i18n"});var r={standard:null,advanced:null};var o=function(t){this._sEdition=t;this._mCategories={};if(!r[t]){r[t]=new Promise(function(e,n){var i=t.charAt(0).toUpperCase()+t.slice(1);sap.ui.require(["sap/ushell/components/cepsearchresult/app/util/Edition"+i],function(t){e(t)},function(){n()})})}this._loaded=r[t].then(function(t){this._oConfig=t;this._oConfig.categories.map(function(t){this._mCategories[t.name]=Object.assign({},t)}.bind(this))}.bind(this))};o.prototype.loaded=function(){return this._loaded};o.prototype.getConfiguration=function(){return this._oConfig};o.prototype.getResourceModel=function(){return i};o.prototype.getCategoryList=function(){return this._oConfig.categories};o.prototype.createCategoryInstance=function(t,e){var i=this._mCategories[t];if(!i.class){i.class=n}return new i.class(i,this,e)};o.prototype.getCategoryInstance=function(t){var e=this._mCategories[t];if(!e){return null}if(e.instance&&!e.instance.isDestroyed()){return e.instance}e.instance=this.createCategoryInstance(t);return e.instance};o.prototype.getDefaultCategory=function(){var t=this._oConfig.defaultCategory||"all";return this.getCategoryInstance(t)};o.prototype.getAppMenuItems=function(){var t=[];if(this._mCategories.all){var e=this.createMenuItem(this._mCategories.all);if(e){t.push(e)}var n=this.getSubMenuItems(this._mCategories.all);if(n.length===1){return n}return t.concat(this.getSubMenuItems(this._mCategories.all))}return[]};o.prototype.getSubMenuItems=function(t){var e=[];if(t&&t.subCategories){t.subCategories.map(function(t){this.addMenuItem(this._mCategories[t.name],e)}.bind(this))}return e};o.prototype.addMenuItem=function(t,e){var n=this.createMenuItem(t);if(n){e.push(n)}};o.prototype.createMenuItem=function(t){if(t){var n=[];if(t.name!=="all"){n=this.getSubMenuItems(t)}var i=new e({key:t.name,text:t.shortTitle,icon:t.icon.src,count:"{counts>/"+t.name+"}",tooltip:t.title,items:n});i._getCategoryInstance=function(){return this.getCategoryInstance(t.name)}.bind(this);return i}return null};o.getEditionName=function(){if(window["sap-ushell-config"]&&window["sap-ushell-config"].ushell&&window["sap-ushell-config"].ushell.cepSearchConfig){return window["sap-ushell-config"].ushell.cepSearchConfig||"standard"}return"standard"};o.prototype.translate=function(t){var e=this.getResourceModel().getResourceBundle();try{return e.getText(t)}catch(e){return t}};o.prototype.getCategoryListItems=function(){var t=this.getCategoryList(),e=[];t.forEach(function(t){if(t.name==="all"){return}e.push({key:t.name,icon:t.icon.src,text:this.translate(t.title.substring(6,t.title.length-1))})}.bind(this));return e};o.prototype.getCategoryViews=function(t){var e=typeof t==="string"?this.createCategoryInstance(t):t,n=e.getViewSettings();n.views.sort(function(t,e){if(t.key===n.default){return-1}return t.key>e}).forEach(function(t){var e=t.key.charAt(0).toUpperCase()+t.key.slice(1);t.text=this.translate("CATEGORY.Views."+e+"ButtonText")}.bind(this));return n};return o});
//# sourceMappingURL=Edition.js.map