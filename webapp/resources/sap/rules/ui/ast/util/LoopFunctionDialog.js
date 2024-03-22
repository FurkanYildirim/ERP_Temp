sap.ui.define(["sap/ui/core/Control","sap/m/List","sap/ui/model/json/JSONModel","sap/rules/ui/ast/constants/Constants","sap/rules/ui/ast/provider/TermsProvider"],function(e,t,a,o,n){"use strict";var s;var i=function(){this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this.functionLabelDisplay="";this.functionLabel="";this._loopFunctionSelected="";this._whereExpressionId="";this.dataObjectId="";this.dataObjectLabel="";this.dataObjectIdSelected="";this.selectedData=[{operationSelected:"",preSuggestionContext:"",cancelButton:false,addButton:true}];this.enabledData={enabled:false};this.dataObjectIdData={dataObjectId:""}};i.prototype._filterloopFunctionVocabulary=function(e){var t=[];var a=n.getInstance();if(e&&e.length>0){for(var s=0;s<e.length;s++){var i=e[s].ResultDataObjectId;if(e[s].type&&e[s].type==="T"){t.push(e[s])}else if(i){var l=a.getTermByTermId(i);if(l&&l.getDataObjectType()===o.Table){t.push(e[s])}}}return{terms:t}}};i.prototype._createLoopFunctionDropDown=function(e,t){var a=this;var n=new sap.ui.model.json.JSONModel(e);this.functionLoop=new sap.m.Select({width:"200px",selectedKey:this._loopFunctionSelected,forceSelection:false,showSecondaryValues:true,layoutData:new sap.ui.layout.GridData({span:"L3 M3 S3"}),ariaLabelledBy:t,change:function(e){a._loopFunctionSelected=e.getSource().getSelectedItem().getText();if(a.dataObjectId&&a._loopFunctionSelected){a.functionLabelDisplay=a._loopFunctionSelected+"("+a.dataObjectLabel+")";a.functionLabel=a._loopFunctionSelected+"("+a.dataObjectId+")";a.functionLabelField.setValue(a.functionLabelDisplay);if(a.oModel.getData().selectionData[0].operationSelected!==""&&a._loopFunctionSelected===o.FOREACH){a.applyButton.setEnabled(true)}else{a.applyButton.setEnabled(false)}a.astExpressionBasicForWhere.setEditable(true)}else{a.applyButton.setEnabled(false);a.astExpressionBasicForWhere.setEditable(false);a.astExpressionBasicForWhere.setValue("");a.functionLabelField.setValue("")}}.bind(this)}).addStyleClass("sapAstExpressionDialogField");this.functionLoop.setModel(n);this.functionLoop.bindItems({path:"/loop",template:new sap.ui.core.ListItem({text:"{name}",key:"{name}",additionalText:"{label}"})});return this.functionLoop};i.prototype._getOperationAstExpressionBasic=function(e,t){var a=this;this.astExpressionBasicForOperation=new sap.rules.ui.AstExpressionBasic({astExpressionLanguage:this._oAstExpressionLanguage,value:"{operationSelected}",conditionContext:false,operationsContext:true,editable:true,placeholder:this.oBundle.getText("expressionPlaceHolder"),ariaLabelledBy:t,dataObjectInfo:"{preSuggestionContext}",change:function(e){var t=parseInt(e.getSource().getBindingContext().sPath.split("/")[2]);a._expressionForOperationInput=e.getParameter("newValue");var n=a.oModel.getData().selectionData;if(a._expressionForOperationInput){n[t].operationSelected=a._expressionForOperationInput.trim()}if(a.oModel.getData().selectionData[0].operationSelected!==""&&a._loopFunctionSelected===o.FOREACH){a.applyButton.setEnabled(true)}else{a.applyButton.setEnabled(false)}a._setPreSuggestionContextChange(t)}.bind(this)});this.astExpressionBasicForOperation.addStyleClass("sapAstExpressionDialog");return this.astExpressionBasicForOperation};i.prototype._tableColumnsFactory=function(e,t){var a=this;var o=new sap.m.ColumnListItem({cells:[a._getOperationAstExpressionBasic("loopOperationsLabelId"),new sap.ui.layout.HorizontalLayout({content:[new sap.m.Button({type:sap.m.ButtonType.Transparent,icon:sap.ui.core.IconPool.getIconURI("sys-cancel"),visible:"{cancelButton}",enabled:"{/enabledData/enabled}",press:function(e){var t=e.getSource().getIdForLabel().split("-")[2];a._removeColumnFromJsonModel(parseInt(t))}.bind(this)}),new sap.m.Button({type:sap.m.ButtonType.Transparent,icon:sap.ui.core.IconPool.getIconURI("add"),visible:"{addButton}",enabled:"{/enabledData/enabled}",press:function(e){var t=e.getSource().getIdForLabel().split("-")[2];a._addColumnToJsonModel(parseInt(t))}.bind(this)})]})]});return o};i.prototype._addColumnToJsonModel=function(e){var t={operationSelected:"",preSuggestionContext:"",cancelButton:true,addButton:true};this.selectedData.splice(e+1,0,t);if(this.selectedData.length>1){this.selectedData[0].cancelButton=true}this._setPreSuggestionContext();this.oModel.setData({selectionData:this.selectedData,enabledData:this.enabledData,dataObjectIdData:this.dataObjectIdData})};i.prototype._setPreSuggestionContext=function(){for(var e=1;e<this.selectedData.length;e++){for(var t=0;t<e;t++){this.selectedData[e].preSuggestionContext=this.selectedData[t].preSuggestionContext+this.selectedData[t].operationSelected+","}}};i.prototype._setPreSuggestionContextChange=function(e){if(e>=0&&e<this.selectedData.length-1){for(var t=e;t<this.selectedData.length-1;t++){this.selectedData[t+1].preSuggestionContext=this.selectedData[t].preSuggestionContext+this.selectedData[t].operationSelected+","}}};i.prototype._removeColumnFromJsonModel=function(e){this.selectedData.splice(e,1);if(this.selectedData.length===1){this.selectedData[0].cancelButton=false}if(e!==1){this._setPreSuggestionContext()}this.oModel.setData({selectionData:this.selectedData,enabledData:this.enabledData,dataObjectIdData:this.dataObjectIdData})};i.prototype._getSuggestionsForTheGivenInput=function(e){var t=this._oAstExpressionLanguage.getTokensForGivenStringInput(e);var a=this._oAstExpressionLanguage.convertTokensToUiModelForAutoSuggestion(t);var o={};o.AttributeContext=true;o.OperationsContext=false;var n=this._oAstExpressionLanguage.getSuggesstions(a,o);return n};i.prototype._createVocabularyDropDown=function(e){var t=this;var a=this._getSuggestionsForTheGivenInput("");var n=this._filterloopFunctionVocabulary(a.autoComplete.categories.terms);var s=new sap.ui.model.json.JSONModel(n);this.vocabularySelect=new sap.m.Select({width:"100%",selectedKey:this.dataObjectIdSelected,forceSelection:false,ariaLabelledBy:e,change:function(e){t.dataObjectIdSelected=e.getSource().getSelectedItem().getKey();t.dataObjectId="/"+e.getSource().getSelectedItem().getKey();t.dataObjectLabel=e.getSource().getSelectedItem().getText();if(t.dataObjectId){t.oModel.getData().dataObjectIdData.dataObjectId=t.dataObjectId;t.oModel.getData().enabledData.enabled=true}this.selectedData=[{operationSelected:"",preSuggestionContext:"",cancelButton:false,addButton:true}];t.selectedData[0].preSuggestionContext=this._loopFunctionSelected+"("+t.dataObjectId+",";t._bindOperations();var a=t._setDataObjectInfoForWhereConditionAutoSuggestion();t.astExpressionBasicForWhere.setDataObjectInfo(a);if(t.dataObjectId&&t._loopFunctionSelected){t.functionLabelDisplay=t._loopFunctionSelected+"("+t.dataObjectLabel+")";t.functionLabel=t._loopFunctionSelected+"("+t.dataObjectId+")";t.functionLabelField.setValue(t.functionLabelDisplay);if(t.oModel.getData().selectionData[0].operationSelected!==""&&t._loopFunctionSelected===o.FOREACH){t.applyButton.setEnabled(true)}else{t.applyButton.setEnabled(false)}t.astExpressionBasicForWhere.setValue("");t._whereExpressionId="";t.astExpressionBasicForWhere.setEditable(true)}else{t.applyButton.setEnabled(false);t.astExpressionBasicForWhere.setEditable(false);t.astExpressionBasicForWhere.setValue("");t.functionLabelField.setValue("")}}.bind(this)}).addStyleClass("sapAstExpressionDialogField");this.vocabularySelect.setModel(s);this.vocabularySelect.bindItems({path:"/terms",template:new sap.ui.core.ListItem({text:"{label}",key:"{id}"})});var i=a.autoComplete.categories.vocabularyRules;for(var l in i){var r=new sap.ui.core.ListItem({text:i[l].label,key:i[l].id});this.vocabularySelect.addItem(r)}return this.vocabularySelect};i.prototype._bindOperations=function(){this.oModel=new sap.ui.model.json.JSONModel;this.oModel.setData({selectionData:this.selectedData,enabledData:this.enabledData,dataObjectIdData:this.dataObjectIdData});this.conditionsTable.setModel(this.oModel)};i.prototype._createWhereAstExpressionBasic=function(e){var t=this;this.astExpressionBasicForWhere=new sap.rules.ui.AstExpressionBasic({astExpressionLanguage:this._oAstExpressionLanguage,enableAggregateFunctionWhereClause:true,value:this._whereExpressionId,editable:"{/value}",dataObjectInfo:this._setDataObjectInfoForWhereConditionAutoSuggestion(),ariaLabelledBy:e,change:function(e){t._whereExpressionId=e.getParameter("newValue");if(t.selectedData.length===1&&t._whereExpressionId){t.selectedData[0].preSuggestionContext=t._loopFunctionSelected+"("+o.FILTER+"("+t.dataObjectId+","+t._whereExpressionId+") ,"}else if(t.selectedData.length===1&&!t._whereExpressionId){t.selectedData[0].preSuggestionContext=t._loopFunctionSelected+"("+t.dataObjectId+","}else if(t.selectedData.length>1&&t._whereExpressionId){t.selectedData[0].preSuggestionContext=t._loopFunctionSelected+"("+o.FILTER+"("+t.dataObjectId+","+t._whereExpressionId+") ,";t._setPreSuggestionContextChange(0)}else if(t.selectedData.length>1&&!t._whereExpressionId){t.selectedData[0].preSuggestionContext=t._loopFunctionSelected+"("+t.dataObjectId+",";t._setPreSuggestionContextChange(0)}t._bindOperations()}.bind(this)});this.astExpressionBasicForWhere.addStyleClass("sapAstExpressionDialog");return this.astExpressionBasicForWhere};i.prototype._setDataObjectInfoForWhereConditionAutoSuggestion=function(){if(this.dataObjectId){var e=this.dataObjectId;return this._loopFunctionSelected+"("+o.FILTER+"("+e+","}};i.prototype._createFunctionLabel=function(){this.functionLabelField=new sap.m.TextArea({value:this.functionLabelDisplay,enabled:false,width:"100%"}).addStyleClass("sapAstExpressionDialogTextField");return this.functionLabelField};i.prototype._clearData=function(){this.functionLabelDisplay="";this.functionLabel="";this._loopFunctionSelected="";this._whereExpressionId="";this.dataObjectId="";this.dataObjectLabel="";this.dataObjectIdSelected="";this.operationsPreExpression="";this.selectedData=[{operationSelected:"",preSuggestionContext:"",cancelButton:false,addButton:true}];this.enabledData={enabled:false};this.dataObjectIdData={dataObjectId:""}};i.prototype._createTable=function(){var e=this;this.conditionsTable=new sap.m.Table({backgroundDesign:sap.m.BackgroundDesign.Solid,showSeparators:sap.m.ListSeparators.None,layoutData:new sap.ui.layout.form.GridContainerData({halfGrid:false}),columns:[new sap.m.Column({width:"89%"}).setStyleClass("sapAstOperationColumn"),new sap.m.Column({width:"11%"})]}).addStyleClass("sapAstOperationTable");this._bindOperations();var t=e._tableColumnsFactory();this.conditionsTable.bindItems("/selectionData",t);return this.conditionsTable};i.prototype._convertFunctionLabelToText=function(e,t){this.termsProvider=this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;var a=this.termsProvider.getTermNameFromASTNodeReference(e);t=t.replace(e,a);return t};i.prototype._createLoopFunctionDialog=function(e,t,a,n,s){var i=this;var l=0;this._clearData();this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this._oAstExpressionLanguage=a;this._loopFunctionSelected=o.FOREACH;if(s){this._loopFunctionSelected=s.function;this._whereExpressionId=s.filter;this.dataObjectId=s.dataObject;this.functionLabel=s.functionLabel;this.dataObjectIdSelected=s.dataObject.replace("/","");this.operationArray=s.actions;i.functionLabelDisplay=this._convertFunctionLabelToText(s.dataObject,s.functionLabel);if(this.dataObjectId){this.dataObjectIdData.dataObjectId=this.dataObjectId;this.enabledData.enabled=true;this.termsProvider=this._oAstExpressionLanguage._astBunldeInstance.TermsProvider.TermsProvider;this.dataObjectLabel=this.termsProvider.getTermNameFromASTNodeReference(this.dataObjectId)}if(this.operationArray&&this.operationArray.length>0){this.selectedData=[];for(var r=0;r<this.operationArray.length;r++){var d={operationSelected:"",preSuggestionContext:"",cancelButton:true,addButton:true};d.operationSelected=this.operationArray[r];this.selectedData.push(d);l++}if(l===1){this.selectedData[0].cancelButton=false}if(!this._whereExpressionId){i.selectedData[0].preSuggestionContext=this._loopFunctionSelected+"("+this.dataObjectId+","}else{i.selectedData[0].preSuggestionContext=this._loopFunctionSelected+"("+o.FILTER+"("+this.dataObjectId+","+i._whereExpressionId+") ,"}i._setPreSuggestionContextChange(0)}}var c=i._createLoopFunctionDropDown(e,"LoopFuntionLabelId");var u=new sap.m.Text({text:i.oBundle.getText("vocabulary"),tooltip:i.oBundle.getText("vocabulary"),textAlign:"End",layoutData:new sap.ui.layout.GridData({span:"L2 M2 S2"})});var p=i._createTable();var h=i._createWhereAstExpressionBasic("loopWhereLabelId");var b=i._createFunctionLabel();var g=new sap.ui.layout.form.SimpleForm({layout:sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,editable:true,content:[new sap.m.Label("loopFunctionSelectionLabelId",{text:i.oBundle.getText("function"),tooltip:i.oBundle.getText("function"),labelFor:c.getId()}),c,u,i._createVocabularyDropDown(u.getId()),new sap.m.Label("loopWhereLabelId",{text:i.oBundle.getText("where"),tooltip:i.oBundle.getText("where"),labelFor:h.getId()}),h,new sap.m.Label("loopOperationsLabelId",{text:"",tooltip:"",labelFor:p.getId()}).addStyleClass(""),p,new sap.m.Label({text:i.oBundle.getText("function_label"),tooltip:i.oBundle.getText("function_label"),labelFor:b.getId()}),b]});var f=new sap.m.Dialog({title:this.oBundle.getText("loopFunctionTitle"),contentWidth:"800px",showHeader:true,draggable:true,beforeClose:function(){n(false)},content:[g],buttons:[this.applyButton=new sap.m.Button({text:this.oBundle.getText("apply"),tooltip:this.oBundle.getText("applyChangesBtnTooltip"),press:function(e){var a=i._createJson();e.getSource().mProperties={value:i.functionLabel,jsonData:a};t(e);i._setModal(false);f.close();f.destroy()}}),new sap.m.Button({text:this.oBundle.getText("cancel"),tooltip:this.oBundle.getText("cancelBtnTooltip"),press:function(e){i._setModal(false);f.close();f.destroy()}})]}).addStyleClass("sapUiSizeCompact");i._setModal(true);f.open()};i.prototype._setModal=function(e){var t=sap.ui.getCore().byId("popover");if(t){t.setModal(e)}};i.prototype._getOperations=function(){var e=[];for(var t=0;t<this.oModel.getData().selectionData.length;t++){if(this.oModel.getData().selectionData[t].operationSelected!==""){e.push(this.oModel.getData().selectionData[t].operationSelected)}}return e};i.prototype._createJson=function(){var e=this._getOperations();var t=this._whereExpressionId;var a={function:this._loopFunctionSelected,filter:t,functionLabel:this.functionLabel,dataObject:this.dataObjectId,actions:e,doVocabId:this.dataObjectId};return a};i.prototype.includes=function(e,t){var a=false;if(e.indexOf(t)!==-1){a=true}return a};return{getInstance:function(){s=new i;return s}}},true);
//# sourceMappingURL=LoopFunctionDialog.js.map