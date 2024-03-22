/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/mdc/enums/FieldEditMode","sap/ui/mdc/enums/ContentMode","sap/ui/mdc/util/loadModules","sap/ui/mdc/field/content/DefaultContent","sap/ui/mdc/field/content/SearchContent","sap/ui/mdc/field/content/DateContent","sap/ui/mdc/field/content/TimeContent","sap/ui/mdc/field/content/DateTimeContent","sap/ui/mdc/field/content/LinkContent","sap/ui/mdc/field/content/BooleanContent","sap/ui/mdc/field/content/UnitContent","sap/ui/mdc/field/ConditionType","sap/ui/mdc/field/ConditionsType","sap/ui/base/SyncPromise"],function(t,e,n,i,o,a,s,r,p,d,l,y,u,h,c){"use strict";var f=t.extend("sap.ui.mdc.field.content.ContentFactory",{metadata:{library:"sap.ui.mdc"},constructor:function(e,n){this.init();this._oField=n?n.field:null;this._fnHandleTokenUpdate=n?n.handleTokenUpdate:null;this._fnHandleContentChange=n?n.handleContentChange:null;this._fnHandleContentLiveChange=n?n.handleContentLiveChange:null;this._fnHandleValueHelpRequest=n?n.handleValueHelpRequest:null;this._fnHandleEnter=n?n.handleEnter:null;this._fnHandleContentPress=n?n.handleContentPress:null;t.prototype.constructor.apply(this,arguments)}});var C={Default:o,Search:a,Date:s,Time:r,DateTime:p,Link:d,Boolean:l,Unit:y};f.prototype.init=function(){this._oContentTypeClass=undefined;this._sOperator=undefined;this._bNoFormatting=false;this._bHideOperator=false};f.prototype.exit=function(){this._oField=undefined;this._fnHandleTokenUpdate=undefined;this._fnHandleContentChange=undefined;this._fnHandleContentLiveChange=undefined;this._fnHandleValueHelpRequest=undefined;this._fnHandleEnter=undefined;this._fnHandleContentPress=undefined;this._oContentTypeClass=undefined;this._sOperator=undefined;if(this._oConditionType&&this._oConditionType._bCreatedByField){this._oConditionType.destroy();this._oConditionType=undefined}if(this._oConditionsType&&this._oConditionsType._bCreatedByField){this._oConditionsType.destroy();this._oConditionsType=undefined}};f.prototype.createContent=function(t,e,n){var o=t.getControlNames(e,this._sOperator);var a;this.setNoFormatting(t.getNoFormatting(e));if(o.every(function(t){return!t})){return Promise.resolve([])}if(!this.getDataType()){var s=this.getField().getDataType();if(s){s=this.getField().getTypeMap().getDataTypeClassName(s);o.push(s.replaceAll(".","/"))}}try{a=i(o).catch(function(t){throw new Error("loadModules promise rejected in sap.ui.mdc.field.content.ContentFactory:createContent function call - could not load data type "+JSON.stringify(o))}).then(function(i){if(this.getField()&&!this.getField().isFieldDestroyed()){this.updateConditionType();return t.create(this,e,this._sOperator,i,n)}else{return[]}}.bind(this)).unwrap()}catch(t){throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:createContent function call ErrorMessage: '"+t.message+"'")}if(a.then){a.catch(function(t){throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:createContent function call ErrorMessage: '"+t.message+"'")});return a}return c.resolve(a)};f.prototype.getContentMode=function(t,i,o,a,s){var r=n.Edit;if(i===e.Display){if(o!==1){r=n.DisplayMultiValue}else if(a){r=n.DisplayMultiLine}else{r=n.Display}}else if(o!==1){r=n.EditMultiValue}else if(a){r=n.EditMultiLine}else if(s.length===1&&t.getEditOperator()&&t.getEditOperator()[s[0]]){this._sOperator=s[0];r=n.EditOperator}else if(this.getField()._getValueHelp()){r=n.EditForHelp}return r};f.prototype.getContentType=function(t,e,n){var i=this.getField();var o=C[t]?C[t]:null;if(!o){if(i.getFieldInfo()&&n){o=C.Link}else if(i.isSearchField()){o=C.Search}else{o=C.Default}}return o};f._updateLink=function(t,e){if(e){t.setHref(e.href);t.setTarget(e.target)}};f._getEnabled=function(t){return t&&t!==e.Disabled};f._getEditable=function(t){return t===e.Editable||t===e.EditableReadOnly||t===e.EditableDisplay};f._getDisplayOnly=function(t){return t&&t!==e.Editable};f._getEditableUnit=function(t){return t===e.Editable};f.prototype.getField=function(){return this._oField};f.prototype.getFieldHelpIcon=function(){return this.getField()._getFieldHelpIcon()};f.prototype.getHandleTokenUpdate=function(){return this._fnHandleTokenUpdate};f.prototype.getHandleContentChange=function(){return this._fnHandleContentChange};f.prototype.getHandleContentLiveChange=function(){return this._fnHandleContentLiveChange};f.prototype.getHandleValueHelpRequest=function(){return this._fnHandleValueHelpRequest};f.prototype.getHandleEnter=function(){return this._fnHandleEnter};f.prototype.getHandleContentPress=function(){return this._fnHandleContentPress};f.prototype.setAriaLabelledBy=function(t){if(t.addAriaLabelledBy){var e=this.getField().getAriaLabelledBy();for(var n=0;n<e.length;n++){var i=e[n];t.addAriaLabelledBy(i)}}};f.prototype.setHideOperator=function(t){this._bHideOperator=t};f.prototype.getHideOperator=function(){return this._bHideOperator};function g(t,e,n,i){if(!i){if(this[t]&&this[t].getMetadata().getName()!==e.getMetadata().getName()){this[t].destroy();this[t]=undefined}if(!this[t]){var o=n();this[t]=new e(o);this[t]._bCreatedByField=true}}return this[t]}f.prototype.getConditionType=function(t){return g.call(this,"_oConditionType",u,this.getField().getFormatOptions.bind(this.getField()),t)};f.prototype.setConditionType=function(t){this._oConditionType=t};f.prototype.getConditionsType=function(t,e){var n=e||h;return g.call(this,"_oConditionsType",n,this.getField().getFormatOptions.bind(this.getField()),t)};f.prototype.setConditionsType=function(t){this._oConditionsType=t};f.prototype.getUnitConditionsType=function(t){return g.call(this,"_oUnitConditionsType",h,this.getField().getUnitFormatOptions.bind(this.getField()),t)};f.prototype.getContentConditionTypes=function(){return this._oContentConditionTypes};f.prototype.setContentConditionTypes=function(t){this._oContentConditionTypes=t};f.prototype._setUsedConditionType=function(t,n,o,a){if(this._oConditionType&&!this._oConditionType._bCreatedByField){this._oConditionType=undefined}if(this._oConditionsType&&!this._oConditionsType._bCreatedByField){this._oConditionsType=undefined}var s;var r;if(t){if(this._oContentConditionTypes.content){s=this._oContentConditionTypes.content.oConditionType;r=this._oContentConditionTypes.content.oConditionsType}}else if(a===e.Display&&o){if(this._oContentConditionTypes.contentDisplay){s=this._oContentConditionTypes.contentDisplay.oConditionType;r=this._oContentConditionTypes.contentDisplay.oConditionsType}}else if(a!==e.Display&&n){if(this._oContentConditionTypes.contentEdit){s=this._oContentConditionTypes.contentEdit.oConditionType;r=this._oContentConditionTypes.contentEdit.oConditionsType}}if(s){if(this._oConditionType&&this._oConditionType._bCreatedByField){this._oConditionType.destroy()}this._oConditionType=s}if(r){if(this._oConditionsType&&this._oConditionsType._bCreatedByField){this._oConditionsType.destroy()}this._oConditionsType=r}if(s||r){if(!this.getDataType()){var p=this.getField().getDataType();if(p){p=this.getField().getTypeMap().getDataTypeClassName(p);p=p.replaceAll(".","/");try{i([p]).catch(function(t){throw new Error("loadModules promise rejected in sap.ui.mdc.field.content.ContentFactory:_setUsedConditionType function call - could not load controls "+p)}).then(function(t){if(this.getField()&&!this.getField().isFieldDestroyed()){this.updateConditionType()}}.bind(this)).unwrap()}catch(t){throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:_setUsedConditionType function call ErrorMessage: '"+t.message+"'")}}}else{this.updateConditionType()}}};f.prototype.getDataType=function(){return this._oDataType};f.prototype.setDataType=function(t){this._oDataType=t};f.prototype.checkDataTypeChanged=function(t){t=this.getField().getTypeMap().getDataTypeClassName(t);try{return i([t.replaceAll(".","/")]).catch(function(e){throw new Error("loadModules promise rejected in sap.ui.mdc.field.content.ContentFactory:checkDataTypeChanged function call - could not load data type "+t)}).then(function(e){return!this._oDataType||this._oDataType.getMetadata().getName()!==t}.bind(this))}catch(t){throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:checkDataTypeChanged function call ErrorMessage: '"+t.message+"'")}};f.prototype.retrieveDataType=function(){if(!this._oDataType){var t=this.getField().getDataType();if(typeof t==="string"){this._oDataType=this.getField().getTypeMap().getDataTypeInstance(t,this.getField().getDataTypeFormatOptions(),this.getField().getDataTypeConstraints());this._oDataType._bCreatedByField=true}}return this._oDataType};f.prototype.getDateOriginalType=function(){return this._oDateOriginalType};f.prototype.setDateOriginalType=function(t){this._oDateOriginalType=t};f.prototype.getUnitOriginalType=function(){return this._oUnitOriginalType};f.prototype.setUnitOriginalType=function(t){this._oUnitOriginalType=t};f.prototype.getUnitType=function(){return this._oUnitType};f.prototype.setUnitType=function(t){this._oUnitType=t};f.prototype.getCompositeTypes=function(){return this._aCompositeTypes};f.prototype.setCompositeTypes=function(t){this._aCompositeTypes=t};f.prototype.isMeasure=function(){return this._bIsMeasure};f.prototype.setIsMeasure=function(t){this._bIsMeasure=t};f.prototype.getDisplayFormat=function(){return this._sDisplayFormat};f.prototype.setDisplayFormat=function(t){this._sDisplayFormat=t};f.prototype.getValueFormat=function(){return this._sValueFormat};f.prototype.setValueFormat=function(t){this._sValueFormat=t};f.prototype.getCalendarType=function(){return this._sCalendarType};f.prototype.setCalendarType=function(t){this._sCalendarType=t};f.prototype.getSecondaryCalendarType=function(){return this._sSecondaryCalendarType};f.prototype.setSecondaryCalendarType=function(t){this._sSecondaryCalendarType=t};f.prototype.getFieldTypeInitialization=function(){return this.getField()._oTypeInitialization};f.prototype.updateConditionType=function(){var t=this._oConditionType;var e=this._oConditionsType;if(t||e){var n=this.getField().getFormatOptions();if(t){t.setFormatOptions(n)}if(e){e.setFormatOptions(n)}if(this._oUnitConditionsType){n=this.getField().getUnitFormatOptions();this._oUnitConditionsType.setFormatOptions(n)}}};f.prototype.setNoFormatting=function(t){this._bNoFormatting=t};f.prototype.getNoFormatting=function(){return this._bNoFormatting};return f});
//# sourceMappingURL=ContentFactory.js.map