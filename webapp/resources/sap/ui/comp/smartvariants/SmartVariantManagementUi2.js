/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/library","./PersonalizableInfo","sap/ui/comp/variants/VariantItem","sap/ui/comp/variants/VariantManagement","sap/base/Log"],function(t,e,a,i,r){"use strict";var n=i.extend("sap.ui.comp.smartvariants.SmartVariantManagementUi2",{metadata:{library:"sap.ui.comp",aggregations:{personalizableControl:{type:"sap.ui.comp.smartvariants.PersonalizableInfo",multiple:false}},events:{initialise:{},afterSave:{}}},renderer:{apiVersion:2}});n.prototype.init=function(){i.prototype.init.apply(this);this._oStandardVariant=null;this._oPersController=null;this._sKeyName=null;this._oContainer=null;this._oVariantSet=null;if(this.setLifecycleSupport){this.setLifecycleSupport(false)}this._setBackwardCompatibility(false)};n.prototype.isPageVariant=function(){return false};n.prototype.getVariantContent=function(t,e){var a=null;if(e===this.STANDARDVARIANTKEY){a=this._getStandardVariant()}else{if(this._oVariantSet){var i=this._oVariantSet.getVariant(e);if(i){a=this._getContent(i)}}}return a};n.prototype.getCurrentVariantId=function(){var t="";var e=this._getSelectedItem();if(e){t=e.getKey();if(t===this.STANDARDVARIANTKEY){t=""}}return t};n.prototype.setCurrentVariantId=function(t,e){var a;var i=t;if(!i){i=this.STANDARDVARIANTKEY}else{if(!this.getItemByKey(i)){i=this.STANDARDVARIANTKEY}}if(this._oVariantSet){a=this.getVariantContent(this._oPersController,i);if(a){this._setSelectionByKey(i);if(e!==true){this._applyVariantContent(a)}}}};n.prototype.addPersonalizableControl=function(t){this.setAggregation("personalizableControl",t,true);if(t.getControl()){this._oPersController=sap.ui.getCore().byId(t.getControl())}this._sKeyName=t.getKeyName();return this};n.prototype.initialise=function(){var t=this._getPersistencyKey();if(!t){r.warning("PersistencyKey not set");this.fireEvent("initialise");return}if(sap.ushell&&sap.ushell.Container){var e=this;sap.ushell.Container.getService("Personalization").getContainer(t,{validity:Infinity}).fail(function(){r.error("Loading personalization container failed");e._setErrorValueState(e.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"));e.fireEvent("initialise")}).done(function(t){e._readPersonalization(t);e.fireEvent("initialise");e._setStandardVariant();e._setSelectedVariant()});return}r.error("Could not obtain the personalization container");this._setErrorValueState(this.oResourceBundle.getText("VARIANT_MANAGEMENT_READ_FAILED"));this.fireEvent("initialise")};n.prototype._setSelectedVariant=function(){var t=null;if(this._oVariantSet){var e=this.getSelectionKey();if(e){t=this._oVariantSet.getVariant(e);if(t){this._applyVariant(t)}}}};n.prototype._reCreateVariantEntries=function(){var t=null;var e=null;var i,r;this.removeAllVariantItems();if(this._oVariantSet){var n=this._oVariantSet.getVariantNamesAndKeys();if(n){for(t in n){if(t){r=new a({text:t,key:n[t]});this.addVariantItem(r)}}e=this._oVariantSet.getCurrentVariantKey();i=this._oVariantSet.getVariant(e);if(i){this.setDefaultVariantKey(e);this.setInitialSelectionKey(e)}}}};n.prototype._getVariantSetAdapter=function(t){if(!t){return Promise.resolve(null)}return new Promise(function(e){sap.ui.require(["sap/ushell/services/personalization/VariantSetAdapter"],function(a){e(new a(t))})})};n.prototype._createVariantEntries=function(){return this._getVariantSetAdapter(this._oContainer).then(function(t){if(t){this._oVariantSet=t.getVariantSet("filterBarVariantSet");if(this._oVariantSet){this._reCreateVariantEntries()}else{this._oVariantSet=t.addVariantSet("filterBarVariantSet")}}}.bind(this))};n.prototype._readPersonalization=function(t){this._oContainer=t;if(this._oContainer){this._createVariantEntries()}};n.prototype._savePersonalizationContainer=function(){var t=this;if(this._oContainer){this._oContainer.save().fail(function(){r.error("Saving personalization data failed");t._setErrorValueState(t.oResourceBundle.getText("VARIANT_MANAGEMENT_SAVE_FAILED"))}).done(function(){r.info("Saving personalization data succeeded");t.fireEvent("afterSave")})}};n.prototype.fireSave=function(t){var e=null,a=null;var i;if(!this._oVariantSet){return}if(t){if(t.overwrite){if(t.key){e=this._oVariantSet.getVariant(t.key)}}else{if(t.name){e=this._oVariantSet.addVariant(t.name);a=e;i=a.getVariantKey();this.replaceKey(t.key,i);this.setInitialSelectionKey(i)}}if(e){this.fireEvent("save",t);var r=this._fetchVariant();if(r){e.setItemValue("filterBarVariant",r.filterBarVariant);e.setItemValue("filterbar",r.filterbar);e.setItemValue("basicSearch","");if(r.basicSearch){e.setItemValue("basicSearch",r.basicSearch)}i=e.getVariantKey();if(t.def){if(i){this._oVariantSet.setCurrentVariantKey(i)}}else{var n=this._oVariantSet.getCurrentVariantKey();if(i===n){this._oVariantSet.setCurrentVariantKey(null)}}}this._savePersonalizationContainer()}}};n.prototype._setStandardVariant=function(){if(this._oPersController&&this._oPersController.fireBeforeVariantSave){this._oPersController.fireBeforeVariantSave(i.STANDARD_NAME)}this._oStandardVariant=this._fetchVariant()};n.prototype._getStandardVariant=function(){return this._oStandardVariant};n.prototype.getStandardVariant=function(){return this._getStandardVariant()};n.prototype._setVariantName=function(t,e,a){var i;var r,n;if(this._oVariantSet){var o=this._oVariantSet.addVariant(a);r=t.getItemValue("filterBarVariant");o.setItemValue("filterBarVariant",r);n=t.getItemValue("filterbar");o.setItemValue("filterbar",n);i=this._oVariantSet.getCurrentVariantKey();if(i===e){this._oVariantSet.setCurrentVariantKey(o.getVariantKey())}this._oVariantSet.delVariant(e);i=o.getVariantKey();this.replaceKey(e,i);this.setInitialSelectionKey(i)}};n.prototype._getVariantNamesAndKeys=function(){return this._oVariantSet.getVariantNamesAndKeys()};n.prototype.fireManage=function(t){var e;var a=null,i=null;var r;if(!this._oVariantSet){return}if(t){a=t.renamed;i=t.deleted;if(a){for(e=0;e<a.length;e++){r=this._oVariantSet.getVariant(a[e].key);if(r){if(r.setVariantName){r.setVariantName(a[e].name)}else{this._setVariantName(r,a[e].key,a[e].name)}}}}if(i){var n=this._oVariantSet.getCurrentVariantKey();for(e=0;e<i.length;e++){r=this._oVariantSet.getVariant(i[e]);if(r){if(n&&n===r.getVariantKey()){this._oVariantSet.setCurrentVariantKey(null)}this._oVariantSet.delVariant(i[e])}}}if(t.def){r=this._oVariantSet.getVariant(t.def);if(r||t.def===this.STANDARDVARIANTKEY){this._oVariantSet.setCurrentVariantKey(t.def)}}if(i&&i.length>0||a&&a.length>0||t.def){this._savePersonalizationContainer()}}};n.prototype.fireSelect=function(t){var e=null;if(t&&t.key){if(this._oVariantSet){if(t.key===this.STANDARDVARIANTKEY){e=this._getStandardVariant()}else{e=this._oVariantSet.getVariant(t.key)}}}if(e){this._applyVariant(e)}};n.prototype._getContent=function(t){var e=null;if(t){if(t.getItemValue){e={filterbar:t.getItemValue("filterbar"),filterBarVariant:t.getItemValue("filterBarVariant")};var a=t.getItemValue("basicSearch");if(a){e.basicSearch=a}}else{e=t}}return e};n.prototype._applyVariant=function(t){var e=this._getContent(t);this._applyVariantContent(e)};n.prototype._applyVariantContent=function(t){if(t&&this._oPersController&&this._oPersController.applyVariant){this._oPersController.applyVariant(t)}};n.prototype._fetchVariant=function(){if(this._oPersController&&this._oPersController.fetchVariant){return this._oPersController.fetchVariant()}return null};n.prototype._getPersistencyKey=function(){if(this._oPersController&&this._sKeyName){return this._oPersController.getProperty(this._sKeyName)}return null};n.prototype._setErrorValueState=function(t){this.setEnabled(false)};n.prototype.exit=function(){i.prototype.exit.apply(this,arguments);this._oStandardVariant=null;this._oPersController=null;this._sKeyName=null;this._oContainer=null;this._oVariantSet=null};return n});
//# sourceMappingURL=SmartVariantManagementUi2.js.map