/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/rules/ui/Constants","sap/ui/core/LocaleData"],function(e,t){"use strict";var a={};a._createCpValueHelp=function(e,t,a,r){this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");var i=false;var l="";if(e&&e.valueListObject){this.basicMode=true;this.valueHelpMetadata=e.valueListObject.metadata;l=e.expressionLanguage.getModel().sServiceUrl}else{this.advancedMode=true;this.valueHelpMetadata=e.metadata;var s=this.getExpressionTokens();if(s&&s.length>0){i=s[s.length-1].tokenType!=="whitespace"}l=sap.ui.getCore().byId(this.getExpressionLanguage()).getModel().sServiceUrl}this.businessDataType=this.valueHelpMetadata.businessDataType;this.serviceUrl=this.valueHelpMetadata.serviceURL;this.attributeId=this.valueHelpMetadata.attributeId;this.dataObjectId=this.valueHelpMetadata.dataObjectId;this.vocabularyId=this.valueHelpMetadata.vocabularyId;this._updateModal(true);if(this.oDialog){this.oDialog.destroy()}sap.ui.core.BusyIndicator.show(0);this._createDialog(l,e,t,this.businessDataType,i,a,r)};a._createDialog=function(e,t,a,r,i,l,s){this._createValueHelpDialog(e,t,a,r,i,l,s);this._createSmartFilterBar(e,t);this.oValueHelpDialog.setFilterBar(this.oFilterBar);this.oValueHelpDialog.open();this.oValueHelpDialog.getTable().setBusy(true)};a._createValueHelpDialogOLD=function(t,a,r){var i=this;var l=new sap.ui.model.json.JSONModel(t.results);this.oValueHelpDialog=new sap.ui.comp.valuehelpdialog.ValueHelpDialog({supportMultiselect:false,supportRanges:false,horizontalScrolling:false,title:i.oBundle.getText("valueHelpTitle"),key:"Name",descriptionKey:"Description",beforeOpen:function(){this.oValueHelpDialog.setModel(l,"valueHelpModel");this.oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({label:new sap.m.Text({text:i.oBundle.getText("valueHelpKeyColumnHeader")}),template:new sap.m.Text({text:"{valueHelpModel>Value}"})})).addColumn(new sap.ui.table.Column({label:new sap.m.Text({text:i.oBundle.getText("valueHelpDescriptionColumnHeader")}),template:new sap.m.Text({text:"{valueHelpModel>Description}"})})).bindRows({path:"valueHelpModel>/"})},ok:function(t){var a=t.getParameter("tokens")[0].data("row");var l=a.Value;if(r===e.DATE_BUSINESS_TYPE){l=i._formatDate(l)}if(l){i.sKey=l;i.setIntructionToken(l);i.valueHelpCtrl.setValue(l);i.valueHelpCtrl.fireChange()}this.oValueHelpDialog.close();i._updateModal(false);i.focus(i.codeMirror)},cancel:function(){i._updateModal(false);this.oValueHelpDialog.close();i.focus(i.codeMirror)},afterClose:function(){i._updateModal(false);this.oValueHelpDialog.destroy();i.focus(i.codeMirror)}});this.oValueHelpDialog.setModel(l);this.oValueHelpDialog.open()};a._createValueHelpDialog=function(t,a,r,i,l,s,o){var u=this;var n=a.expressionLanguage.getModel();var p="Attributes(Id='"+this.attributeId+"',VocabularyId='"+this.vocabularyId+"',DataObjectId='"+this.dataObjectId+"')";if(p.includes(":")){p=p=p.replace(":","%3A")}this.attributeName=n.oData[p].Name;sap.ui.core.BusyIndicator.show(0);this.oValueHelpDialog=new sap.ui.comp.valuehelpdialog.ValueHelpDialog({supportMultiselect:false,supportRanges:false,horizontalScrolling:false,title:u.attributeName,resizable:false,beforeOpen:function(){u._bindTable(t,a)},ok:function(t){var a=t.getParameter("tokens")[0].data("row");var n=a.Value;if(i===e.DATE_BUSINESS_TYPE){n=u._formatDate(n)}if(i===e.NUMBER){n=parseInt(n)}if(u.basicMode){var p=sap.ui.getCore().byId("valueHelpCtrl");p.setValue(n);p.fireChange()}else{u.setTextOnCursor(n,r,s,i,l,o)}u._updateModal(false);u.oValueHelpDialog.close();u.focus(u.codeMirror)},cancel:function(){u._updateModal(false);u.oValueHelpDialog.close();u.focus(u.codeMirror)},afterClose:function(){u._updateModal(false);u.oValueHelpDialog.destroy();u.focus(u.codeMirror);u.oFilterBar.destroy();sap.ui.core.BusyIndicator.hide()}})};a.setTextOnCursor=function(e,t,a,r,i,l){function s(e,t){var a=e+1;for(var r=a;r<t.length;r++){if(t[r].length===0){a++}else{break}}return a}var o="String",u="Date",n="Timestamp",p="Time";var d;var c=r===o||r===u||r===n||r===p?"'"+e+"'":e;var h=this.getExpressionTokens();var f=this.getValue().split("\n");var g=-1;var F={start:{line:t.line,ch:t.ch},end:{line:t.line,ch:t.ch}};for(var v=0;v<h.length;v++){g=h[v].start===0?s(g,f):g;if(g===t.line&&h[v].end>t.ch||h[v].end>=t.ch&&l){F.start.ch=h[v].start;F.end.ch=h[v].end;a=true;break}}if(a){this.codeMirror.replaceRange(c,F.start,F.end);d=this.codeMirror.findPosH(F.start,c.length,"char",true);this.codeMirror.setCursor(d)}else{c=i?" "+c:c;this.codeMirror.replaceRange(c,t);d=this.codeMirror.findPosH(t,c.length,"char",true);this.codeMirror.setCursor(d)}var m=sap.ui.getCore().byId(this.getExpressionLanguage());this.getFormattingTokens(m);this.ValueHelpRequested=false};a.focus=function(){if(this.codeMirror){var e=this.codeMirror.getLine(this.codeMirror.lastLine());var t=e.length;this.codeMirror.setCursor({line:this.codeMirror.lastLine(),ch:t});this.codeMirror.focus()}};a._updateModal=function(e){var t=sap.ui.getCore().byId("popover");if(t){t.setModal(e)}};a._formatDate=function(e){var a=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();var r=t.getInstance(a);this.oFormatDate=sap.ui.core.format.DateFormat.getInstance({pattern:r.getDatePattern("short"),calendarType:sap.ui.core.CalendarType.Gregorian},a);return this.oFormatDate.format(this.oFormatDate.parse(e))};a._createSmartFilterBar=function(e,t){var a=this;if(this.basicMode){this.entitySet=t.valueListObject.metadata.entitySet;t=t.valueListObject}else{this.entitySet=t.metadata.entitySet}this.oFilterBar=new sap.ui.comp.smartfilterbar.SmartFilterBar({entitySet:a.entitySet,enableBasicSearch:true,advancedMode:true,filterBarExpanded:true,search:function(){a.onSearch(e,t)},filterChange:function(e){a.setValueStateFilter(e)},controlConfiguration:[a._createControlConfiguration()]});var r=new sap.ui.model.odata.v2.ODataModel(e);this.oFilterBar.setModel(r)};a._createControlConfiguration=function(){var e=[new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"Value",label:"Value",visibleInAdvancedArea:true,width:"100px",index:1}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"Description",label:"Description",visibleInAdvancedArea:true,width:"100px",index:2}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"VocabularyId",label:"VocabularyId",width:"100px",visible:false,index:3}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"DataObjectId",label:"DataObjectId",visible:false,width:"100px",groupId:"abc",index:4}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"AttributeId",label:"AttributeId",visible:false,width:"100px",index:5}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"Version",label:"Version",visible:false,width:"100px",index:6})];return e};a.onSearch=function(e,t){this.oValueHelpDialog.getTable().setBusy(true);this._unBindTable();this._bindTable(e,t)};a._bindTable=function(t,a){var r=this.serviceUrl;var i=this._fetchFilterParams(a);var l={valueHelp:{collection:r,properties:[e.PROPERTY_VALUE,e.PROPERTY_DESCRIPTION]}};var s=this.oValueHelpDialog.getTable();s.setThreshold(10);for(var o=0;o<l.valueHelp.properties.length;o++){this._addValueHelpColumn(l.valueHelp.properties[o],s)}var u=new sap.ui.model.odata.v2.ODataModel(t);s.setModel(u);s.bindRows(l.valueHelp.collection,null,i);s.getBinding("rows").attachDataReceived(this._handleRowsDataReceived,this)};a._handleRowsDataReceived=function(e){var t=this;var a=e.getParameter("data");if(jQuery.isEmptyObject(a)||a&&a.results&&a.results.length===0){this.oValueHelpDialog.getTable().setNoData(t.oBundle.getText("no_data"))}else{this.oValueHelpDialog.getTable().setNoData(t.oBundle.getText("searching"))}this.oValueHelpDialog.getTable().setBusy(false)};a._addValueHelpColumn=function(t,a){var r=(new sap.ui.table.Column).setLabel(new sap.m.Label({text:t}));if(t===e.PROPERTY_VALUE){r.setSortProperty(t)}a.addColumn(r.setTemplate((new sap.m.Text).bindProperty("text",t)))};a._unBindTable=function(){var e=this.oValueHelpDialog.getTable();e.destroyColumns();e.unbindRows()};a._fetchFilterParams=function(e){var t=this;var a=[];var r=[new sap.ui.model.Filter("AttributeId",sap.ui.model.FilterOperator.EQ,this.attributeId),new sap.ui.model.Filter("DataObjectId",sap.ui.model.FilterOperator.EQ,this.dataObjectId),new sap.ui.model.Filter("VocabularyId",sap.ui.model.FilterOperator.EQ,this.vocabularyId)];var i=this.oFilterBar.getFilters();var l=this.oFilterBar.getParameters();if(!jQuery.isEmptyObject(l)&&i&&i.length>0){l=this.oFilterBar.getParameters().custom.search;a=this._getSearchFilters(l);i=t._formatFilterParams(i);r.push(new sap.ui.model.Filter({filters:[new sap.ui.model.Filter(i),new sap.ui.model.Filter(a)],and:true}))}else if(!jQuery.isEmptyObject(l)){l=this.oFilterBar.getParameters().custom.search;a=this._getSearchFilters(l);r.push(a)}else if(i&&i.length>0){i=t._formatFilterParams(i);r.push(i[0])}return r};a._formatFilterParams=function(e){var t=this;if(e[0]&&e.length===1&&e[0].aFilters[0]&&e[0].aFilters[0].sOperator){e=t._formatSingleFilter(e)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[0].aFilters[0]&&e[0].aFilters[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters[0].aFilters){e=t._formatMultiFilter(e,0,true);e=t._formatMultiFilter(e,1,true)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[1]&&e[0].aFilters[0].aFilters[0]&&e[0].aFilters[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters){e=t._formatMultiFilter(e,0,true);e=t._formatMultiFilter(e,1,false)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[1]&&e[0].aFilters[1].aFilters[0]&&e[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters[0].aFilters){e=t._formatMultiFilter(e,0,false);e=t._formatMultiFilter(e,1,true)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[1]&&e[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters){e=t._formatMultiFilter(e,0,false);e=t._formatMultiFilter(e,1,false)}return e};a._formatSingleFilter=function(t){var a=this;var r=null;for(var i=0;i<t[0].aFilters.length;i++){if(t[0].aFilters[i].sOperator==="Contains"){t[0].aFilters[i].sOperator="EQ"}else if(t[0].aFilters[i].sOperator==="BT"){var l=a._manageParam(t[0].aFilters[i].sPath,t[0].aFilters[i].sOperator,t[0].aFilters[i].oValue1,t[0].aFilters[i].oValue2);delete t[0].aFilters[i];t[0].aFilters[i]=l}else if(t[0].aFilters[i].sOperator==="StartsWith"){r=t[0].aFilters[i].sPath===e.PROPERTY_VALUE?this._valueFieldValue:this._valueFieldDescription;r.setValueState("Error");r.setValueStateText(t[0].aFilters[i].sOperator+" operator not supported")}else if(t[0].aFilters[i].sOperator==="EndsWith"){r=t[0].aFilters[i].sPath===e.PROPERTY_VALUE?this._valueFieldValue:this._valueFieldDescription;r.setValueState("Error");r.setValueStateText(t[0].aFilters[i].sOperator+" operator not supported")}}return t};a._formatMultiFilter=function(t,a,r){var i=this;var l=null;var s=[];if(r){s=t[0].aFilters[a].aFilters[0].aFilters}else{s=t[0].aFilters[a].aFilters}for(var o=0;o<s.length;o++){if(s[o].sOperator==="Contains"){s[o].sOperator="EQ"}else if(s[o].sOperator==="BT"){var u=i._manageParam(s[o].sPath,s[o].sOperator,s[o].oValue1,s[o].oValue2);delete s[o];s[o]=u}else if(s[o].sOperator==="StartsWith"){l=s[o].sPath===e.PROPERTY_VALUE?this._valueFieldValue:this._valueFieldDescription;l.setValueState("Error");l.setValueStateText(s[o].sOperator+" operator not supported")}else if(s[o].sOperator==="EndsWith"){l=s[o].sPath===e.PROPERTY_VALUE?this._valueFieldValue:this._valueFieldDescription;l.setValueState("Error");l.setValueStateText(s[o].sOperator+" operator not supported")}}return t};a._manageParam=function(e,t,a,r){var i=[];if(a&&r){i=new sap.ui.model.Filter({filters:[new sap.ui.model.Filter(e,sap.ui.model.FilterOperator.GT,a),new sap.ui.model.Filter(e,sap.ui.model.FilterOperator.LT,r)],and:true})}return i};a._getSearchFilters=function(t){return new sap.ui.model.Filter({filters:[new sap.ui.model.Filter(e.PROPERTY_VALUE,sap.ui.model.FilterOperator.EQ,t),new sap.ui.model.Filter(e.PROPERTY_DESCRIPTION,sap.ui.model.FilterOperator.EQ,t)],and:false})};a.setValueStateFilter=function(e){var t=e.getSource().sId;this._valueFieldValue=sap.ui.getCore().byId(t+"-filterItemControlA_-Value");if(this._valueFieldValue){this._valueFieldValue.setValueState("None");this._valueFieldValue.setValueStateText("")}this._valueFieldDescription=sap.ui.getCore().byId(t+"-filterItemControlA_-Description");if(this._valueFieldDescription){this._valueFieldDescription.setValueState("None");this._valueFieldDescription.setValueStateText("")}};return a},true);
//# sourceMappingURL=ValueHelpDialogProvider.js.map