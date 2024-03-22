sap.ui.define(["sap/ui/thirdparty/jquery","../../library","sap/ui/core/Control","sap/m/List","sap/ui/model/json/JSONModel","sap/m/ListMode","sap/ui/core/CustomData","sap/ui/model/Sorter","sap/rules/ui/parser/infrastructure/util/utilsBase","sap/ui/core/LocaleData","sap/rules/ui/Constants","sap/m/DatePicker","sap/m/DateTimePicker","sap/m/TimePicker","sap/m/Dialog","sap/m/Button","./AutoSuggestionFixedValuePanelRenderer"],function(jQuery,e,t,a,r,i,s,l,o,n,u,p,d,c,f,h,g){"use strict";var m=t.extend("sap.rules.ui.ast.autoCompleteContent.AutoSuggestionFixedValuePanel",{metadata:{library:"sap.rules.ui",properties:{reference:{type:"object",defaultValue:null},vocabularyInfo:{type:"object",defaultValue:null},data:{type:"object",defaultValue:null},dialogOpenedCallbackReference:{type:"object",defaultValue:null},inputValue:{type:"string",defaultValue:""}},aggregations:{PanelLayout:{type:"sap.m.Panel",multiple:false}},events:{}},init:function(){this.infraUtils=new sap.rules.ui.parser.infrastructure.util.utilsBase.utilsBaseLib;this.needCreateLayout=true;this.businessDataType="S";this._propertyValue="Value";this._propertyDescription="Description";this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this.vocabularyInfo=this.getVocabularyInfo();this.autoSuggestionData=this.getData();var e=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();var t=n.getInstance(e);this.oFormatDate=sap.ui.core.format.DateFormat.getInstance({pattern:t.getDatePattern("short"),calendarType:sap.ui.core.CalendarType.Gregorian},e)},onBeforeRendering:function(){this._reference=this.getReference();this._dialogOpenedCallbackReference=this.getDialogOpenedCallbackReference();this.vocabularyInfo=this.getVocabularyInfo();this.valueHelpData=this.getData();if(this.needCreateLayout){var e=this._createLayout(this.vocabularyInfo);this.setAggregation("PanelLayout",e,true);this.needCreateLayout=false}},onAfterRendering:function(){var e="#"+this.fixedValueTextArea.getId();$(e).on("keydown",function(e){if(e.key=="Enter"){e.preventDefault()}})},initializeVariables:function(){},_createLayout:function(e){var t=this;var a=false;if(this.getData().valuehelp){a=true}else{a=false}this._invisibleTextLabel=new sap.ui.core.InvisibleText({text:this.oBundle.getText("fixedValuePanelTitle")});this._invisibleTextDescription=new sap.ui.core.InvisibleText({text:this.oBundle.getText("fixedValueInvisibleText")});this.fixedValueTextArea=new sap.m.Input({showValueHelp:a,showSuggestion:true,autocomplete:false,ariaLabelledBy:this._invisibleTextLabel.getId(),ariaDescribedBy:this._invisibleTextDescription.getId(),valueHelpRequest:function(){t._dialogOpenedCallbackReference(true);t._setModal(true);t._generateValueHelpInfoAndCreateDialog(e)},value:this.getInputValue(),change:function(e){t._setModal(false);var a=t._formatText(e);a.oSource.mProperties.forceFireChange=true;t._reference(a)}.bind(this),width:"auto"});var r=new sap.m.Panel({headerText:this.oBundle.getText("fixedValuePanelTitle"),expandable:true,expanded:false,content:[this._invisibleTextLabel,this._invisibleTextDescription,this.fixedValueTextArea],width:"auto"});this.toolBarSpacerAfterInput=new sap.m.ToolbarSpacer({width:"1em"});this.toolBarSpacerAfterDateLink=new sap.m.ToolbarSpacer({width:"1em"});this.dateContent=this._createDateLink();this.timeContent=this._createTimeStampLink();r.addContent(this.toolBarSpacerAfterInput);r.addContent(this.dateContent);r.addContent(this.toolBarSpacerAfterDateLink);r.addContent(this.timeContent);return r},_setModal:function(e){var t=sap.ui.getCore().byId("popover");if(t){t.setModal(e)}},_generateValueHelpInfoAndCreateDialog:function(e){var t=this;var a=this.getData().valuehelp;if(a){a.expressionLanguage=e;a.HasValueSource=true;if(a.sourceType==="U"){a.entitySet="Enumerations";a.serviceURL="/Enumerations"}else{a.entitySet="ExternalValues";a.serviceURL="/ExternalValues"}var r=e.getModel().sServiceUrl;t._createDialog(r,a)}},_createDialog:function(e,t,a){this._createValueHelpDialog(e,t);this._createSmartFilterBar(e,t);this.oValueHelpDialog.setFilterBar(this.oFilterBar);this._openValueHelpDialog()},_openValueHelpDialog:function(){this.oValueHelpDialog.open();this.oValueHelpDialog.getTable().setBusy(true)},_createValueHelpDialog:function(e,t){var a=this;var r=t.expressionLanguage.getModel();var i="Attributes(Id='"+t.attributeId+"',VocabularyId='"+t.vocabularyId+"',DataObjectId='"+t.dataObjectId+"')";if(i.includes(":")){i=i=i.replace(":","%3A")}this.attributeName=t.attributeName;if(!r.oData[i]){t.dataObjectId=this._getStructureObjectForTableType(t.attributeId,t)}sap.ui.core.BusyIndicator.show(0);this.oValueHelpDialog=new sap.ui.comp.valuehelpdialog.ValueHelpDialog({supportMultiselect:false,supportRanges:false,horizontalScrolling:false,title:a.attributeName,resizable:false,beforeOpen:function(){a._bindTable(e,t)},ok:function(e){var t=e.getParameter("tokens")[0].data("row");var r=t.Value;if(a.businessDataType==="D"||a.businessDataType==="U"){r=a._getValidValue(r)}var i=this._syncToken(r,a.businessDataType);e.getParameter("tokens")[0].data("row").Value=i;e.oSource.mProperties.forceFireChange=true;a._dialogOpenedCallbackReference(false);a.oValueHelpDialog.close();a._setModal(false);a.oValueHelpDialog.destroy();sap.ui.core.BusyIndicator.hide();a._reference(e)}.bind(this),cancel:function(){a.oFilterBar.destroy();a._setModal(false);a.oValueHelpDialog.close();a.oValueHelpDialog.destroy();sap.ui.core.BusyIndicator.hide()},afterClose:function(){a._dialogOpenedCallbackReference(false);a.oFilterBar.destroy();sap.ui.core.BusyIndicator.hide()}})},_getStructureObjectForTableType:function(e,t){var a=t.expressionLanguage.getData().ValueSources;for(var r in a){if(e===a[r].AttributeId){return a[r].DataObjectId}}return t.dataObjectId},_syncToken:function(e,t){var a=false;var r=false;t=this.getData().valuehelp.attributeDataType;if(t!="G"){var i=e.replace(/'/g,"").replace(/"/g,"")}else{i="'"+e+"'"}if(t==="N"){var s=parseFloat(i);var l=s.toString();if(l!=i){t="Operations"}else if(l==="NaN"){t="S"}else{i=s}}if(t==="S"||t==="D"||t==="U"){if(!(t==="S")){if(t==="D"){this._dateBusinessDataType="D"}else if(t==="U"){this._dateBusinessDataType="U"}i=this._getValidDateValue(i)}i=i.toString();if(i==="'"){a=true}if(i.substr(0,"'")!=="'"){a=true}if(i.substr(i.length-1,"'")!=="'"){r=true}if(a){i="'"+i}if(r){i=i+"'"}}if(t==="B"){i=i==="true"}return i},_getValidDateValue:function(e){var t,a;var r="";var i=this._getDateTimeFormatterForParsing();if(i){t=i.parse(e)}if(this._dateBusinessDataType==="D"){a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"yyyy-MM-dd"});r=a.format(t)}else if(this._dateBusinessDataType==="U"){a=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",UTC:true});r=a.format(t)}if(r!==""){r}return e},_createSmartFilterBar:function(e,t){var a=this;this.oFilterBar=new sap.ui.comp.smartfilterbar.SmartFilterBar({entitySet:t.entitySet,enableBasicSearch:true,advancedMode:true,filterBarExpanded:true,search:function(){a.onSearch(e,t)},filterChange:function(e){a.setValueStateFilter(e,t)},controlConfiguration:[a._createControlConfiguration()]});var r=new sap.ui.model.odata.v2.ODataModel(e);this.oFilterBar.setModel(r)},_createControlConfiguration:function(){var e=[new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"Value",label:this.oBundle.getText("value"),visibleInAdvancedArea:true,width:"100px",index:1}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"Description",label:this.oBundle.getText("description"),visibleInAdvancedArea:true,width:"100px",index:2}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"VocabularyId",label:"VocabularyId",width:"100px",visible:false,index:3}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"DataObjectId",label:"DataObjectId",visible:false,width:"100px",groupId:"abc",index:4}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"AttributeId",label:"AttributeId",visible:false,width:"100px",index:5}),new sap.ui.comp.smartfilterbar.ControlConfiguration({hasValueHelpDialog:true,key:"Version",label:"Version",visible:false,width:"100px",index:6})];return e},onSearch:function(e,t){this.oValueHelpDialog.getTable().setBusy(true);this._unBindTable();this._bindTable(e,t)},_bindTable:function(e,t){var a=t.serviceURL;var r=this._fetchFilterParams(t);var i={valueHelp:{collection:a,properties:[this._propertyValue,this._propertyDescription]}};var s=this.oValueHelpDialog.getTable();s.setThreshold(10);for(var l=0;l<i.valueHelp.properties.length;l++){var o="";if(i.valueHelp.properties[l]==="Value"){o=this.oBundle.getText("value")}else if(i.valueHelp.properties[l]==="Description"){o=this.oBundle.getText("description")}this._addValueHelpColumn(i.valueHelp.properties[l],s,o)}var n=new sap.ui.model.odata.v2.ODataModel(e);s.setModel(n);s.bindRows(i.valueHelp.collection,null,r);s.getBinding("rows").attachDataReceived(this._handleRowsDataReceived,this)},_handleRowsDataReceived:function(e){var t=this;var a=e.getParameter("data");if(jQuery.isEmptyObject(a)||a&&a.results&&a.results.length===0){this.oValueHelpDialog.getTable().setNoData(t.oBundle.getText("no_data"))}else{this.oValueHelpDialog.getTable().setNoData(t.oBundle.getText("searching"))}this.oValueHelpDialog.getTable().setBusy(false)},_addValueHelpColumn:function(e,t,a){var r=(new sap.ui.table.Column).setLabel(new sap.m.Label({text:a}));if(e===this._propertyValue){r.setSortProperty(a)}t.addColumn(r.setTemplate((new sap.m.Text).bindProperty("text",e)))},_unBindTable:function(){var e=this.oValueHelpDialog.getTable();e.destroyColumns();e.unbindRows()},_fetchFilterParams:function(e){var t=this;var a=[];var r=[new sap.ui.model.Filter("AttributeId",sap.ui.model.FilterOperator.EQ,e.attributeId),new sap.ui.model.Filter("DataObjectId",sap.ui.model.FilterOperator.EQ,e.dataObjectId),new sap.ui.model.Filter("VocabularyId",sap.ui.model.FilterOperator.EQ,e.vocabularyId)];var i=this.oFilterBar.getFilters();var s=this.oFilterBar.getParameters();if(!jQuery.isEmptyObject(s)&&i&&i.length>0){s=this.oFilterBar.getParameters().custom.search;a=this._getSearchFilters(s);i=t._formatFilterParams(i,e.sourceType);r.push(new sap.ui.model.Filter({filters:[new sap.ui.model.Filter(i),new sap.ui.model.Filter(a)],and:true}))}else if(!jQuery.isEmptyObject(s)){s=this.oFilterBar.getParameters().custom.search;a=this._getSearchFilters(s);r.push(a)}else if(i&&i.length>0){i=t._formatFilterParams(i,e.sourceType);r.push(i[0])}return r},_formatFilterParams:function(e,t){var a=this;if(e[0]&&e.length===1&&e[0].aFilters[0]&&e[0].aFilters[0].sOperator){e=a._formatSingleFilter(e)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[0].aFilters[0]&&e[0].aFilters[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters[0].aFilters){e=a._formatMultiFilter(e,0,true);e=a._formatMultiFilter(e,1,true)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[1]&&e[0].aFilters[0].aFilters[0]&&e[0].aFilters[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters){e=a._formatMultiFilter(e,0,true);e=a._formatMultiFilter(e,1,false)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[1]&&e[0].aFilters[1].aFilters[0]&&e[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters[0].aFilters){e=a._formatMultiFilter(e,0,false);e=a._formatMultiFilter(e,1,true)}else if(e[0]&&e[0].aFilters[0]&&e[0].aFilters[1]&&e[0].aFilters[0].aFilters&&e[0].aFilters[1].aFilters){e=a._formatMultiFilter(e,0,false);e=a._formatMultiFilter(e,1,false)}return e},_formatSingleFilter:function(e){var t=this;var a=null;for(var r=0;r<e[0].aFilters.length;r++){if(e[0].aFilters[r].sOperator==="Contains"){a=e[0].aFilters[r].sPath===this._propertyValue?this._valueFieldValue:this._valueFieldDescription}else if(e[0].aFilters[r].sOperator==="BT"){var i=t._manageParam(e[0].aFilters[r].sPath,e[0].aFilters[r].sOperator,e[0].aFilters[r].oValue1,e[0].aFilters[r].oValue2);delete e[0].aFilters[r];e[0].aFilters[r]=i}else if(e[0].aFilters[r].sOperator==="StartsWith"){a=e[0].aFilters[r].sPath===this._propertyValue?this._valueFieldValue:this._valueFieldDescription;a.setValueState("Error");a.setValueStateText(e[0].aFilters[r].sOperator+" operator not supported")}else if(e[0].aFilters[r].sOperator==="EndsWith"){a=e[0].aFilters[r].sPath===this._propertyValue?this._valueFieldValue:this._valueFieldDescription;a.setValueState("Error");a.setValueStateText(e[0].aFilters[r].sOperator+" operator not supported")}}return e},_formatMultiFilter:function(e,t,a){var r=this;var i=null;var s=[];if(a){s=e[0].aFilters[t].aFilters[0].aFilters}else{s=e[0].aFilters[t].aFilters}for(var l=0;l<s.length;l++){if(s[l].sOperator==="Contains"){i=s[l].sPath===this._propertyValue?this._valueFieldValue:this._valueFieldDescription}else if(s[l].sOperator==="BT"){var o=r._manageParam(s[l].sPath,s[l].sOperator,s[l].oValue1,s[l].oValue2);delete s[l];s[l]=o}else if(s[l].sOperator==="StartsWith"){i=s[l].sPath===this._propertyValue?this._valueFieldValue:this._valueFieldDescription;i.setValueState("Error");i.setValueStateText(s[l].sOperator+" operator not supported")}else if(s[l].sOperator==="EndsWith"){i=s[l].sPath===this._propertyValue?this._valueFieldValue:this._valueFieldDescription;i.setValueState("Error");i.setValueStateText(s[l].sOperator+" operator not supported")}}return e},_manageParam:function(e,t,a,r){var i=[];if(a&&r){i=new sap.ui.model.Filter({filters:[new sap.ui.model.Filter(e,sap.ui.model.FilterOperator.GT,a),new sap.ui.model.Filter(e,sap.ui.model.FilterOperator.LT,r)],and:true})}return i},_getSearchFilters:function(e){return new sap.ui.model.Filter({filters:[new sap.ui.model.Filter(this._propertyValue,sap.ui.model.FilterOperator.EQ,e),new sap.ui.model.Filter(this._propertyDescription,sap.ui.model.FilterOperator.EQ,e)],and:false})},setValueStateFilter:function(e,t){var a=e.getSource().getAllFilterItems();var r=e.getSource().getFilterData();for(var i=0;i<a.length;i++){if(a[i].getName()==="Value"&&r&&r.Value&&r.Value.ranges){var s=this.filterUnSupportedOperator(r.Value.ranges,t);if(s){a[i].getControl().setValueState("Error");a[i].getControl().setValueStateText(s)}else{a[i].getControl().setValueState("None");a[i].getControl().setValueStateText("")}}else if(a[i].getName()==="Description"&&r&&r.Description&&r.Description.ranges){var l=this.filterUnSupportedOperator(r.Description.ranges,t);if(l){a[i].getControl().setValueState("Error");a[i].getControl().setValueStateText(l)}else{a[i].getControl().setValueState("None");a[i].getControl().setValueStateText("")}}else if(a[i].getName()==="Value"){a[i].getControl().setValueState("None");a[i].getControl().setValueStateText("")}else if(a[i].getName()==="Description"){a[i].getControl().setValueState("None");a[i].getControl().setValueStateText("")}}},filterUnSupportedOperator:function(e,t){var a=[];var r="";for(var i=0;i<e.length;i++){var s=u.OPERATOR_MAPPING.find(function(a){return e[i].operation===a.operator&&e[i].exclude===a.exclude&&t.sourceType===a.valueHelpType});if(!s.supported&&a.indexOf("'"+s.message+"'")===-1){a.push("'"+s.message+"'")}}if(a.length>1){r=a.join(",")+" are not supported"}else if(a.length===1){r=a.join(",")+" is not supported"}return r},_formatText:function(e){var t=this;var a=this.getData().businessDataTypeList;if(a&&a.length>0){this.businessDataType=this.getData().businessDataTypeList[0]}else{this.businessDataType="N"}var r=e.getSource().getValue();e.getSource().setValue(r);return e},_createDateLink:function(){var e=this;this.dateContent=new sap.m.Link({wrapping:true,text:this.oBundle.getText("select_date"),press:function(t){e.dateContext="D";e._createDateTimeDialog()}});return this.dateContent},_createTimeStampLink:function(){var e=this;this.timeContent=new sap.m.Link({wrapping:true,text:this.oBundle.getText("select_date_time"),press:function(t){e.dateContext="U";e._createDateTimeDialog()}});return this.timeContent},_createDateTimeDialog:function(){var e=this;var t=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();var a=n.getInstance(t);var r=a.getDatePattern("medium");var i=a.getTimePattern("medium");var s=r+" "+i;if(this.dateContext){this._dateBusinessDataType=this.dateContext}if(this._dateBusinessDataType==="D"){this.control=new p({width:"auto",valueFormat:r})}if(this._dateBusinessDataType==="U"){var e=this;this.control=new d({width:"auto",valueFormat:s})}this._oSelectNewDateDialog=new f({title:this.oBundle.getText("calendarTitle"),afterClose:function(){e._dialogOpenedCallbackReference(false)},content:[this.control],beginButton:new h({text:this.oBundle.getText("okBtn"),enabled:true,press:function(t){var a=this._updateText(this.control);t.oSource.mProperties.value="'"+a+"'";t.oSource.mProperties.dateSelected=this._dateBusinessDataType;t.oSource.mProperties.forceFireChange=true;e._reference(t);e._setModal(false);e._oSelectNewDateDialog.close()}.bind(this)}),endButton:new h({text:this.oBundle.getText("clsBtn"),press:function(){e._setModal(false);e._oSelectNewDateDialog.close()}.bind(this)})});this._dialogOpenedCallbackReference(true);this._setModal(true);this._oSelectNewDateDialog.open()},_updateText:function(e){var t=e._getInputValue();var a=this._getValidValue(t);return a},_getValidValue:function(e){var t,a;var r="";if(this.dateContext){this._dateBusinessDataType=this.dateContext}var i=this._getDateTimeFormatterForParsing();if(i){t=i.parse(e)}if(this._dateBusinessDataType==="D"){a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"yyyy-MM-dd"});r=a.format(t)}else if(this._dateBusinessDataType==="U"){a=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",UTC:true});r=a.format(t)}if(r!==""){return r}return e},_getDateTimeFormatterForParsing:function(){var e;var t=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();var a=n.getInstance(t);var r=a.getDatePattern("medium");var i=a.getTimePattern("medium");if(this.dateContext==="D"){e=sap.ui.core.format.DateFormat.getDateInstance({pattern:r})}else if(this.dateContext==="U"){e=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:r+" "+i})}return e},renderer:g});return m},true);
//# sourceMappingURL=AutoSuggestionFixedValuePanel.js.map