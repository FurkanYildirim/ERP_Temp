/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/Log","sap/ui/thirdparty/jquery","./library","sap/m/Label","sap/rules/ui/RuleBase","sap/m/Panel","sap/ui/core/Title","sap/ui/layout/form/Form","sap/m/Toolbar","sap/m/ToolbarSpacer","sap/m/Text","sap/m/Button","sap/ui/layout/Grid","sap/ui/layout/form/FormContainer","sap/ui/layout/form/FormElement","sap/rules/ui/ExpressionAdvanced","sap/m/Link","sap/m/FlexBox","sap/m/Dialog","sap/rules/ui/TextRuleSettings","sap/rules/ui/oldast/lib/AstYamlConverter","sap/rules/ui/Constants","sap/rules/ui/AstExpressionBasic","sap/rules/ui/services/ExpressionLanguage","sap/rules/ui/services/AstExpressionLanguage","./TextRuleRenderer"],function(e,jQuery,t,n,s,i,o,r,a,l,u,d,g,p,c,f,h,x,v,y,T,R,C,m,b,_){"use strict";var E=s.extend("sap.rules.ui.TextRule",{metadata:{properties:{enableSettings:{type:"boolean",group:"Misc",defaultValue:false},enableSettingResult:{type:"boolean",defaultValue:true},enableElse:{type:"boolean",defaultValue:true},enableElseIf:{type:"boolean",defaultValue:true}},aggregations:{_toolbar:{type:"sap.m.Toolbar",multiple:false,singularName:"_toolbar"},_verticalLayout:{type:"sap.ui.core.Control",multiple:false,visibility:"visible",singularName:"_verticalLayout"}}},_addConditionBlock:function(t,n){if(this._isAddCallInProgress){return}var s=this;var o=this._getModel();var r=t.getSource();var a=r.getParent();if(n===this.typeElseIf&&!(a instanceof i)){a=r.getParent().getParent()}var l=a.getParent();var u=l.indexOfContent(a);var d=this._internalModel.getProperty("/ruleId");var g=this._internalModel.getProperty("/ruleVersion");var p=u+1;var c=false;var f;var h;var x={RuleId:d,RuleVersion:g};if(n===s.typeElse){h="/TextRuleDefaultBranches";c=true}else{h="/TextRuleBranches";if(r.getParent()instanceof i){f=p;c=true}else{f=p+1}x.Sequence=f}this._updateBusyState(true);var v={};v.properties=x;v.success=function(e){var t={};t.verticalLayout=l;t.nIndex=u;t.bfirst=c;s._addConditionSuccess(e,s,t);if(c){r.destroy()}};v.error=function(){e.info("Error creating "+h+"entity")};this._isAddCallInProgress=true;o.createEntry(h,v)},_addConditionSuccess:function(t,n,s){var i;var o;var r=false;var a=t.Id;var l=n._getModel();var u={RuleId:t.RuleId,Id:a,RuleVersion:t.RuleVersion};var d=l.createKey("/TextRuleConditions",u);var g=new sap.ui.model.Context(l,d);var p="TextRuleResultExpressions";if(this.getAstExpressionLanguage()){p="TextRuleResultExpressions/TextRuleResultExpressionASTs,TextRuleConditionASTs"}l.read(d,{urlParameters:{$expand:p},success:function(e){var t=s.verticalLayout;n.getModel("displayModel").getProperty("/textRuleConditions").push(e);n.getModel("displayModel").setProperty("/bCancelButtonVisible("+e.Id+")",e.TextRuleResultExpressions.results.length>1);if(e.Type===n.typeElse){n.getModel("displayModel").getProperty("/textRuleConditions/Else").push(e);var a=n._createElseFormLayout(g,n.oBundle.getText("titleElse"),true);t.removeContent(s.nIndex);t.insertContent(a,s.nIndex);a.addEventDelegate({onAfterRendering:function(){if(s&&s.bfirst&&!r&&a.getContent().length>0&&a.getContent()[0].getFormContainers()&&a.getContent()[0].getFormContainers().length>0&&a.getContent()[0].getFormContainers()[0].getFormElements()&&a.getContent()[0].getFormContainers()[0].getFormElements().length>0&&a.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()&&a.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields().length>0&&a.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0]._input){a.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0]._input.focus();r=true}}})}else if(e.Type===n.typeElseIf){n.getModel("displayModel").getProperty("/textRuleConditions/ElseIf").push(e);if(s.bfirst){o=s.nIndex;t.removeContent(s.nIndex)}else{o=s.nIndex+1}i=" ("+o+")";var l=n._createFormLayout(g,n.oBundle.getText("titleElseIf")+i,true);t.insertContent(l,o);n._adjustElseIfTitle(s.verticalLayout,o,true);l.addEventDelegate({onAfterRendering:function(){if(s&&s.bfirst&&!r&&l.getContent().length>0&&l.getContent()[0].getFormContainers()&&l.getContent()[0].getFormContainers().length>0&&l.getContent()[0].getFormContainers()[0].getFormElements()&&l.getContent()[0].getFormContainers()[0].getFormElements().length>0&&l.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()&&l.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields().length>0&&l.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0]._input){l.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0]._input.focus();r=true}}})}n._isAddCallInProgress=false;n._updateBusyState(false);sap.m.MessageToast.show(n.oBundle.getText("branchCreatedSuccess"))},error:function(){e.info("Error reading TextRuleResultExpressions");n._isAddCallInProgress=false}})},_adjustElseIfTitle:function(e,t,n){var s=e.getContent();var i=this.oBundle.getText("titleElseIf");var o;if(n){o=t+1}else{o=t}for(;o<s.length;o++){var r=s[o];if(r.getHeaderText().indexOf(i)>-1&&r.getHeaderToolbar()){r.getHeaderToolbar().getContent()[0].setText(i+" ("+o+")")}}},_addToolBar:function(){var e=new a({design:"Transparent",enabled:"{TextRuleModel>/editable}"});var t=new sap.m.Title({text:this.oBundle.getText("textRule")});var n=new d({text:"",press:this._openTextRuleSettings.bind(this),visible:{parts:[{path:"TextRuleModel>/enableSettings"},{path:"TextRuleModel>/editable"}],formatter:this._decideSettingsEnablement},enabled:{parts:[{path:"TextRuleModel>/enableSettings"},{path:"TextRuleModel>/editable"}],formatter:this._decideSettingsEnablement}}).setTooltip(this.oBundle.getText("settings"));n.setIcon("sap-icon://action-settings");e.addContent(t);e.addContent(new l({}));e.addContent(n);e.addContent(new l({width:"1em"}));this.setAggregation("_toolbar",e,true)},_addTextRuleControl:function(){this.verticalLayout=new sap.ui.layout.VerticalLayout({width:"100%"});this.setAggregation("_verticalLayout",this.verticalLayout,true)},_bindRule:function(){var t=this;var n=this._getModel();var s=[this._getBindModelName(),this.getBindingContextPath()].join("");if(s&&n){n.setDeferredGroups(["read"]);n.read(s,{groupId:"read",urlParameters:{$expand:"TextRule"}});var i=[s,"/TextRule/TextRuleResults"].join("");var o={groupId:"read"};if(this.getAstExpressionLanguage()){o.urlParameters={$expand:"TextRuleResultASTs"}}n.read(i,o);var r="TextRuleResultExpressions";if(this.getAstExpressionLanguage()){r="TextRuleResultExpressions/TextRuleResultExpressionASTs,TextRuleConditionASTs"}i=[s,"/TextRule/TextRuleConditions"].join("");n.read(i,{groupId:"read",urlParameters:{$expand:r}});n.submitChanges({groupId:"read",success:function(e){t._handleVerticalLayoutDataReceived(e)},error:function(){e.info("Error reading TextRule data from backend")}})}},_bindVerticalLayout:function(){var e=this._getIfPanel();this.verticalLayout.addContent(e);if(this.getEnableElseIf()===true){var t=this._getElseIfPanel();for(var n=0;n<t.length;n++){this.verticalLayout.addContent(t[n])}}if(this.getEnableElse()===true){var s=this._getElsePanel();this.verticalLayout.addContent(s[0])}},_createFormLayout:function(e,t,n){var s=this;var o=new a({design:"Transparent"});var u=new sap.m.Title({text:t});o.addContent(u);var g=new i({expandable:true,expanded:n,height:"100%",backgroundDesign:"Translucent",content:[new r({editable:true,layout:new sap.ui.layout.form.ResponsiveGridLayout({labelSpanXL:2,labelSpanL:2,labelSpanM:2,labelSpanS:12,adjustLabelSpan:false,emptySpanXL:4,emptySpanL:4,emptySpanM:4,emptySpanS:4,columnsL:1,columnsM:1}),formContainers:[s._createIfBlockFormContainer(e,t)]}),new r({editable:true,layout:new sap.ui.layout.form.ResponsiveGridLayout({labelSpanXL:2,labelSpanL:2,labelSpanM:2,labelSpanS:12,adjustLabelSpan:false,emptySpanXL:3,emptySpanL:3,emptySpanM:3,emptySpanS:3,columnsL:1,columnsM:1}),formContainers:[s._createThenFormContainer(e,this.oBundle.getText("then"))]})]}).addStyleClass("sapTextRulePanel");if(t!==this.typeIf){var p=new d({visible:"{TextRuleModel>/editable}",text:this.oBundle.getText("addButton"),tooltip:this.oBundle.getText("addNewElseIf"),press:function(e){s._addConditionBlock(e,s.typeElseIf)}}).setBindingContext(e);var c=new d({text:this.oBundle.getText("deleteButton"),tooltip:this.oBundle.getText("deleteElseIf"),visible:"{TextRuleModel>/editable}",press:function(e){s.showDeleteConfirmationDialogMessage(e.getSource())}}).setBindingContext(e);o.addContent(new l);o.addContent(p);o.addContent(new l({width:"0.5px"}));o.addContent(c)}g.setHeaderToolbar(o);return g},_createElseFormLayout:function(e,t,n){var s=this;var o=new a({design:"Transparent"});var u=new sap.m.Title({text:t});var g=new d({text:this.oBundle.getText("deleteButton"),tooltip:this.oBundle.getText("deleteElse"),visible:"{TextRuleModel>/editable}",press:function(e){s.showDeleteConfirmationDialogMessage(e.getSource())}}).setBindingContext(e);o.addContent(u);o.addContent(new l);o.addContent(g);var p=new i({expandable:true,expanded:n,height:"100%",backgroundDesign:"Translucent",content:new r({editable:true,layout:new sap.ui.layout.form.ResponsiveGridLayout({labelSpanXL:2,labelSpanL:2,labelSpanM:2,labelSpanS:12,adjustLabelSpan:false,emptySpanXL:3,emptySpanL:3,emptySpanM:3,emptySpanS:3,columnsL:1,columnsM:1}),formContainers:[this._createThenFormContainer(e,t)]})}).addStyleClass("sapTextRulePanel");p.setHeaderToolbar(o);return p},showDeleteConfirmationDialogMessage:function(e){var t=this;var n=new v({title:this.oBundle.getText("warning_title"),type:sap.m.DialogType.Message,state:sap.ui.core.ValueState.Warning,content:new u({text:this.oBundle.getText("condition_delete_confirmation_message")}),afterClose:function(){n.destroy()}});n.setBeginButton(new d({text:this.oBundle.getText("textrule_confirmation_dialog_delete"),press:function(){t._deleteConditionBlock(e);n.close()}}));n.setEndButton(new d({text:this.oBundle.getText("textrule_confirmation_dialog_cancel"),press:function(){n.close()}}));n.open()},_createIfBlockFormContainer:function(e,t){var s=e?e.getProperty("Expression"):"";var i=true;var o=new p({formElements:[new c({label:new n({text:""}),fields:[this._getExpressionAdvancedText(e,s,undefined,undefined,i)]})]});return o},_createThenFormContainer:function(e,t){var s=new p({visible:false});if(e.getProperty("Type")!==this.typeElse){var i=new a({content:[new l({width:"2em"}),new n({text:t}).addStyleClass("sapTextRuleFontSize")]});s.setToolbar(i)}var o=e.getProperty("Id");var r=this.getModel("displayModel").getProperty("/textRuleConditions");for(var u=0;u<r.length;u++){if(o===r[u].Id){var d=r[u].TextRuleResultExpressions.results;if(d){for(var g=0;g<d.length;g++){var c={RuleId:d[g].RuleId,ConditionId:d[g].ConditionId,ResultId:d[g].ResultId,RuleVersion:d[g].RuleVersion};var f=this._getModel().createKey("/TextRuleResultExpressions",c);var h=new sap.ui.model.Context(this._getModel(),f);var x=d[g].BusinessDataType;if(this.getExpressionLanguage()){if(x===R.DATE_BUSINESS_TYPE||x===R.TIMESTAMP_BUSINESS_TYPE||x===R.NUMBER||x===R.STRING||x===R.BOOLEAN_BUSINESS_TYPE||x===R.BOOLEAN_ENHANCED_BUSINESS_TYPE){s.addFormElement(this._formElementsFactory(t+"result"+g,h))}}else{s.addFormElement(this._formElementsFactory(t+"result"+g,h))}}}}}var v=s.getFormElements();for(var y in v){if(v[y].getVisible()){s.setVisible(true);break}}return s},_createTextRuleSettings:function(){var e=this._getModel();var t=this.getBindingContext();var n=new y({newTextRule:this._internalModel.getProperty("/newTextRule"),enableSettingResult:this.getEnableSettingResult()});if(this.getAstExpressionLanguage()){n.setAstExpressionLanguage(this.getAstExpressionLanguage())}else{n.setExpressionLanguage(this.getExpressionLanguage())}var s=JSON.stringify(this._settingsModel.getData());var i=JSON.parse(s);var o=new sap.ui.model.json.JSONModel(i);n.setModel(o);n.setModel(this._internalModel,"TextRuleModel");n.setModel(e,"oDataModel");n.setBindingContext(t,"dummy");return n},_decideSettingsEnablement:function(e,t){return e&&t},_deleteConditionBlock:function(t){var n=this;var s=this._getModel();var i=t.getParent().getParent();var o=i.getParent();var r=o.indexOfContent(i);var a=t.getBindingContext();var l=a.getProperty("Id");var u=a.getProperty("Type");var d;var g=o.getContent().length;var p=false;if(u===n.typeElse){d="/TextRuleDefaultBranches"}else if(u===n.typeElseIf){d="/TextRuleBranches"}var c={RuleId:a.getProperty("RuleId"),Id:l,RuleVersion:a.getProperty("RuleVersion")};var f=s.createKey(d,c);var h=function(){var e;o.removeContent(r);if(u===n.typeElse){n.getModel("displayModel").setProperty("/textRuleConditions/Else",[]);e=n._getElsePanel();o.insertContent(e[0],r)}else{if(r===1&&o.getContent().length<=2){n.getModel("displayModel").setProperty("/textRuleConditions/ElseIf",[]);e=n._getElseIfPanel();o.insertContent(e[0],r)}else{var t=n.getModel("displayModel").getProperty("/textRuleConditions/ElseIf");for(var s in t){if(t[s].Id===l){t.splice(s,1);n.getModel("displayModel").setProperty("/textRuleConditions/ElseIf",t);break}}}n._adjustElseIfTitle(o,r,false)}n._updateBusyState(false);o.addEventDelegate({onAfterRendering:function(){if(!p){if(g===3&&(r===1||r===2)){o.getContent()[r].getContent()[0].focus()}else if(r===g-2&&o.getContent().length>0&&o.getContent()[r]&&o.getContent()[r].getContent().length>0&&o.getContent()[r].getContent()[0].getMetadata().getName()==="sap.m.Button"){o.getContent()[g-2].getContent()[0].focus()}else if(o.getContent().length>0&&o.getContent()[r]&&o.getContent()[r].getContent().length>0&&o.getContent()[r].getContent()[0].getFormContainers().length>0){o.getContent()[r].getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0]._input.focus()}p=true}}});sap.m.MessageToast.show(n.oBundle.getText("branchDeletedSuccess"))};this._updateBusyState(true);s.remove(f,{success:function(e){h()},error:function(){e.info("Error deleting "+d+"entity")}})},_formRuleData:function(e,t){var n=this.getBindingContextPath();var s=n.split("/")[2];var i=e.getProperty("RuleId");var o=e.getProperty("Version");var r=jQuery.extend({},this.getModel().oData);r=r[s];if(!r){r={}}if(!r.DecisionTable){r.DecisionTable={}}r.Type="DT";r.DecisionTable.metadata={};r.DecisionTable.RuleID=i;r.DecisionTable.version=o;r.DecisionTable.HitPolicy="FM";r.DecisionTable.DecisionTableColumns={};r.DecisionTable.DecisionTableColumns.results=[];r.DecisionTable.DecisionTableColumns.results.push({metadata:{},RuleId:i,Id:1,Version:o,Sequence:1,Type:"CONDITION",Condition:{metadata:{},RuleId:i,Id:1,Version:o,Expression:t,Description:null,ValueOnly:false,FixedOperator:null},Result:null});r.DecisionTable.DecisionTableRows={};r.DecisionTable.DecisionTableRows.results=[];r.DecisionTable.DecisionTableColumnsCondition={};r.DecisionTable.DecisionTableColumnsCondition.results=[];r.DecisionTable.DecisionTableColumnsResult={};r.DecisionTable.DecisionTableColumnsResult.results=[];return r},_addTextRuleResultExpression:function(t){var n=this;var s=this._getModel();var i=t.getSource();var o=i.getParent();var r=o.getParent();var a=r.getParent().indexOfFormElement(r)+1;var l=this._internalModel.getProperty("/ruleId");var u=this._internalModel.getProperty("/ruleVersion");var d=a+1;var g=null;if(t&&t.oSource&&t.oSource.getBindingContext()&&t.oSource.getBindingContext().getModel()&&t.oSource.getBindingContext().getPath()&&t.oSource.getBindingContext().getModel().getProperty(t.oSource.getBindingContext().getPath())){g=t.oSource.getBindingContext().getModel().getProperty(t.oSource.getBindingContext().getPath()).ConditionId}var p="/TextRuleResultExpressions";var c={RuleId:l,RuleVersion:u,ConditionId:g,Sequence:d};var f={};f.properties=c;f.success=function(e){var t={RuleId:e.RuleId,ConditionId:e.ConditionId,ResultId:e.ResultId,RuleVersion:e.RuleVersion};var s=n._getModel().createKey("/TextRuleResultExpressions",t);var i=new sap.ui.model.Context(n._getModel(),s);var o=n.getModel("displayModel").getProperty("/textRuleConditions");for(var l=0;l<o.length;l++){if(g===o[l].Id&&o[l].TextRuleResultExpressions){var u=o[l].TextRuleResultExpressions.results;if(u&&i){u.push(i.getModel().getProperty(i.getPath()));n.getModel("displayModel").setProperty("/bCancelButtonVisible("+g+")",u.length>1)}r.getParent().insertFormElement(n._formElementsFactory(n.oBundle.getText("then")+"result"+a,i),a);break}}};f.error=function(){e.info(n.oBundle.getText("errorCreating")+p+n.oBundle.getText("entity"))};s.createEntry(p,f)},_deleteTextRuleResultExpression:function(t){var n=this;var s=this._getModel();var i=t.getSource();var o=i.getParent();var r=o.getParent();var a=r.getParent().indexOfFormElement(r);var l=this._internalModel.getProperty("/ruleId");var u=this._internalModel.getProperty("/ruleVersion");var d=i.getBindingContext();var g=d.getProperty("ConditionId");var p=d.getProperty("ResultId");var c="/TextRuleResultExpressions";var f={RuleId:l,RuleVersion:u,ConditionId:g,ResultId:p};var h=s.createKey(c,f);s.remove(h,{success:function(e){var t=n.getModel("displayModel").getProperty("/textRuleConditions");for(var s=0;s<t.length;s++){if(g===t[s].Id&&t[s].TextRuleResultExpressions){var i=t[s].TextRuleResultExpressions.results;if(i){for(var o in i){if(i[o].ResultId===p){i.splice(o,1)}}}n.getModel("displayModel").setProperty("/bCancelButtonVisible("+g+")",i.length>1);r.getParent().removeFormElement(a);break}}},error:function(){e.info(n.oBundle.getText("errorDeleting")+sKeytext+n.oBundle.getText("entity"))}})},_decideCancelButtonEnablement:function(e,t,n){return e&&!t&&n==="2.0"?true:false},_formElementsFactory:function(e,t){var s=this;var i=t.getProperty("ResultId"),o=t.getProperty("RuleId"),r=t.getProperty("RuleVersion"),a=t.getProperty("ConditionId"),l=true;var u={RuleId:o,Id:i,RuleVersion:r};if(this.getAstExpressionLanguage()){this._internalModel.setProperty("/expressionLanguageVersion","2.0")}else{this._internalModel.setProperty("/expressionLanguageVersion","1.0")}var d=t.getProperty("Expression");var g=t.getModel().createKey("/TextRuleResults",u);this._internalModel.getProperty("/textRuleResultExpressions").push(t.getModel().getProperty(t.getPath()));var p=t.getModel().getProperty(g+"/BusinessDataType");var f=t.getModel().getProperty(g+"/DataObjectAttributeName");var h=t.getModel().getProperty(g+"/DataObjectAttributeLabel");var x=h?h:f;var v=t.getModel().getProperty(g+"/AccessMode");var y=t.getModel().getProperty(g+"/DataObjectAttributeId");if(v===R.EDITABLE){l=true}else if(v===R.HIDDEN){l=false}var T=new n({text:x,tooltip:x,labelFor:m});var C=this._getExpressionAdvancedText(t,d,p,y,false,T.getId());var m=C.getId();var b=new c({visible:l,label:T,fields:[C,new sap.ui.layout.HorizontalLayout({layoutData:new sap.ui.layout.GridData({span:"L1 M1 S1"}),content:[new sap.m.Button({enabled:"{TextRuleModel>/editable}",type:sap.m.ButtonType.Transparent,icon:sap.ui.core.IconPool.getIconURI("sys-cancel"),visible:{parts:[{path:"displayModel>/bCancelButtonVisible("+a+")"},{path:"TextRuleModel>/resultDataObjectId"},{path:"TextRuleModel>/expressionLanguageVersion"}],formatter:this._decideCancelButtonEnablement},press:function(e){s._deleteTextRuleResultExpression(e)}.bind(this)}).setTooltip(this.oBundle.getText("removeColumn")),new sap.m.Button({enabled:"{TextRuleModel>/editable}",type:sap.m.ButtonType.Transparent,icon:sap.ui.core.IconPool.getIconURI("add"),visible:s.bOperationsContext,press:function(e){s._addTextRuleResultExpression(e)}.bind(this)}).setTooltip(this.oBundle.getText("addColumn"))]})]}).setBindingContext(t);return b},_getBindModelName:function(){var e="";var t=this.getModelName();if(t){e=t+">"}return e},_getBlankContent:function(){var e=new n({text:this.oBundle.getText("startTextRule")});var t=new u;t.setText(" ");var s=new h({enabled:{parts:[{path:"TextRuleModel>/enableSettings"},{path:"TextRuleModel>/editable"}],formatter:this._decideSettingsEnablement},text:" "+this.oBundle.getText("settings"),press:[this._openTextRuleSettings,this]}).addStyleClass("sapTextRuleLink");var i=new x({justifyContent:"Center",items:[e,t,s],visible:{parts:[{path:"TextRuleModel>/enableSettings"},{path:"TextRuleModel>/editable"}],formatter:this._decideSettingsEnablement}}).addStyleClass("sapUiMediumMargin");return i},_getConvertedExpression:function(e,t,n){var s=sap.ui.getCore().byId(this.getExpressionLanguage());var i=this._formRuleData(n,e);var o;if(t){o=s.convertRuleToCodeValues(i)}else{o=s.convertRuleToDisplayValues(i)}i.Type="TextRule";return o},_getDataLoadedPromise:function(){if(!this._dataLoaded){this._setDataLoadedPromise()}return this._dataLoaded.promise()},_getElseButton:function(){var e=this;if(!sap.ui.getCore().getElementById("_elseButton")){this.oElseButton=new sap.m.Button({id:"_elseButton",text:this.oBundle.getText("addElse"),tooltip:this.oBundle.getText("addElse"),enabled:"{TextRuleModel>/editable}",press:function(t){e._addConditionBlock(t,e.typeElse)}})}return this.oElseButton},_getElseIfButton:function(){var e=this;if(!sap.ui.getCore().getElementById("_elseIfButton")){this.oElseIfButton=new sap.m.Button({id:"_elseIfButton",text:this.oBundle.getText("addElseIf"),tooltip:this.oBundle.getText("addElseIf"),enabled:"{TextRuleModel>/editable}",press:function(t){e._addConditionBlock(t,e.typeElseIf)}})}return this.oElseIfButton},_getElseIfPanel:function(){var e=this.oBundle.getText("titleElseIf");var t=[];var n=this._displayModel.getProperty("/textRuleConditions/ElseIf");if(n.length>0){for(var s=0;s<n.length;s++){var o={RuleId:n[s].RuleId,Id:n[s].Id,RuleVersion:n[s].RuleVersion};var r=this._getModel().createKey("/TextRuleConditions",o);var a=new sap.ui.model.Context(this._getModel(),r);var l=s+1;var u=" ("+l+")";t.push(this._createFormLayout(a,e+u,false))}}else{var d=new i({headerText:e,visible:"{TextRuleModel>/editable}",content:this._getElseIfButton()});t.push(d)}return t},_getElsePanel:function(){var e=this.oBundle.getText("titleElse");var t=[];var n=this._displayModel.getProperty("/textRuleConditions/Else");if(n.length>0){var s={RuleId:n[0].RuleId,Id:n[0].Id,RuleVersion:n[0].RuleVersion};var o=this._getModel().createKey("/TextRuleConditions",s);var r=new sap.ui.model.Context(this._getModel(),o);t.push(this._createElseFormLayout(r,e),false)}else{var a=new i({headerText:e,visible:"{TextRuleModel>/editable}",content:this._getElseButton()});t.push(a)}return t},_getExpressionAdvancedText:function(t,n,s,i,o,r){var a=this;var l=null;var u="";var d=s?s:sap.rules.ui.ExpressionType.BooleanEnhanced;this.valueState="None";this.bOperationsContext=false;if(this.getAstExpressionLanguage()){l=sap.ui.getCore().byId(this.getAstExpressionLanguage());var g=this._getExpressionFromAstNodes(t);if(g&&g.relString){g.relString=g.relString.replace(/\\/g,"\\\\").replace(/{/g,"\\{").replace(/}/g,"\\}")}var p=this._internalModel.getProperty("/ruleBindingPath").split("/")[2];var c=t.getObject("/"+p).ResultDataObjectId;this._internalModel.setProperty("/resultDataObjectId",c);if(i){u="/"+c+"/"+this._formatAttributeId(i)}if(c){c=c}if(!c&&!o){this.bOperationsContext=true}return new C({astExpressionLanguage:l,value:g.relString,jsonData:g.JSON,attributeInfo:u,resultDataObjectId:c,conditionContext:o,operationsContext:this.bOperationsContext,editable:"{TextRuleModel>/editable}",placeholder:this.oBundle.getText("expressionPlaceHolder"),valueState:this.valueState,ariaLabelledBy:r,change:function(e){var s=e.getSource();var i=sap.ui.getCore().getEventBus();t=s.getBindingContext();var o=t.getPath();var r=e.getParameter("astNodes");if(r&&r.length>0&&r[0].Type==="I"&&r[0].Value!=""&&r[0].Value!=undefined){e.oSource.setValueState("Error")}else{e.oSource.setValueState("None")}i.publish("sap.ui.rules","astCreating");var l=t.getModel();if(!l.hasPendingChanges()){a._removeAndUpdateExisitingNodes(o,t,r,n,l)}}.bind(this)}).setBindingContext(t)}else if(this.getExpressionLanguage()){l=sap.ui.getCore().byId(this.getExpressionLanguage());var h=a._getConvertedExpression(n,false,t);var g=a._getExpressionFromParseResults(n,h);g=g?g:n;return new f({expressionLanguage:l,placeholder:this.oBundle.getText("expressionPlaceHolder"),validateOnLoad:true,type:d,value:g,attributeInfo:i,editable:"{TextRuleModel>/editable}",change:function(n){var s=n.getSource();t=s.getBindingContext();var i=t.getPath();h=a._getConvertedExpression(s.getValue(),true,t);var o=a._getExpressionFromParseResults(s.getValue(),h);o=o?o:s.getValue();a._updateModelExpression(i,t,o);var r=h.output.decisionTableData.DecisionTable.DecisionTableColumns.results["0"].Condition.parserResults;if(r.status!=="Error"){a._astUtils.Id=0;var l=r.converted.ASTOutput;try{var u=JSON.stringify(a._astUtils.parseConditionStatement(l));var d=t.oModel.oMetadata.mEntityTypes["/TextRuleConditions"].property;var g=0;if(d){for(var p=0;p<d.length;p++){if(d[p].name==="AST"){g=d[p].maxLength}}if(u&&u.length<=g){a._updateModelExpressionModelAst(i,t,u)}}}catch(t){e.error("Exception while converting ast for expression"+s.getValue()+" :"+t.message)}}}.bind(this)}).setBindingContext(t)}},_formatAttributeId:function(e){var t=e;if(t&&t.indexOf(":")>-1){t=t.replace(/:/g,"/")}return t},_removeAndUpdateExisitingNodes:function(e,t,n,s,i){var o=this;var r=sap.ui.getCore().getEventBus();i.setDeferredGroups(["astGroupId"]);i.update(t.getPath(),{Expression:t.getProperty("Expression")},{groupId:"astGroupId"});o._removeExistingAstNodes(e,t,n,s,i);o._updateModelAstNodes(e,t,n,i);i.submitChanges({groupId:"astGroupId",success:function(e){r.publish("sap.ui.rules","astCreated")}})},_getExpressionFromParseResults:function(e,t){if(t&&t.output.decisionTableData.DecisionTable.DecisionTableColumns.results[0].Condition.parserResults&&t.output.decisionTableData.DecisionTable.DecisionTableColumns.results[0].Condition.parserResults.converted){return t.output.decisionTableData.DecisionTable.DecisionTableColumns.results[0].Condition.parserResults.converted.Expression}else{return e}},_getExpressionFromAstNodes:function(e){var t=this;var n=sap.ui.getCore().byId(this.getAstExpressionLanguage());var s="";var i=[];var o=[];if(t.includes(e.sPath,"TextRuleConditions")){i=e.getObject(e.sPath).TextRuleConditionASTs}else{i=e.getObject(e.sPath).TextRuleResultExpressionASTs}var r=n._astBunldeInstance.ASTUtil;r.clearNodes();i=i.__list;if(i&&i.length>0){for(var a in i){var l=i[a];t._addNodeObject(e.getObject("/"+l))}o=r.getNodes();s=r.toAstExpressionString(o);if(o&&o[0].Type==="I"&&o[0].Value!=""&&o[0].Value!=undefined){this.valueState="Error"}else{this.valueState="None"}}return s},_addNodeObject:function(e){var t=[];var n=sap.ui.getCore().byId(this.getAstExpressionLanguage());var s=n._astBunldeInstance.ASTUtil;var i=[];i.Root=e.Root;i.SequenceNumber=e.Sequence;i.ParentId=e.ParentId;i.Reference=e.Reference;i.Id=e.NodeId;i.Type=e.Type;i.Value=e.Value?e.Value:"";if(e.Type==="I"){i.Value=e.IncompleteExpression}if(e.Function){i.Function=e.Function}if(e.Type!=="P"&&!e.Function){var o=[];o.BusinessDataType=e.Output?e.Output.BusinessDataType:e.BusinessDataType;o.DataObjectType=e.Output?e.Output.DataObjectType:e.DataObjectType;i.Output=o}s.createNode(i)},_getIfPanel:function(){var e=this.oBundle.getText("titleIf");var t=this._displayModel.getProperty("/textRuleConditions/If");var n={RuleId:t[0].RuleId,Id:t[0].Id,RuleVersion:t[0].RuleVersion};var s=this._getModel()?this._getModel().createKey("/TextRuleConditions",n):"";var i=new sap.ui.model.Context(this._getModel(),s);return this._createFormLayout(i,e,true)},_getModel:function(){var e=this.getModelName();if(e){return this.getModel(e)}return this.getModel()},_handleVerticalLayoutDataReceived:function(e){var t=e.__batchResponses[1].data;if(t&&t.results){this._internalModel.setProperty("/textRuleResults",t.results)}var n=e.__batchResponses[2].data;var s;if(!n){return}var i=this.getAggregation("_verticalLayout");if(n.results&&n.results.length===0){s=this._getBlankContent();i.addContent(s);this._internalModel.setProperty("/newTextRule",true);this._updateBusyState(false)}else{this._segregateTextRuleData(n.results);if(this._displayModel.getProperty("/textRuleConditions/If").length===0){s=this._getBlankContent();i.addContent(s);this._internalModel.setProperty("/newTextRule",true);this._updateBusyState(false)}else{this._bindVerticalLayout();this._internalModel.setProperty("/newTextRule",false)}}},_initDisplayModel:function(){var e={};e.textRuleConditions=[];e.textRuleConditions.If=[];e.textRuleConditions.ElseIf=[];e.textRuleConditions.Else=[];this._displayModel=new sap.ui.model.json.JSONModel(e);this.setModel(this._displayModel,"displayModel")},_initInternalModel:function(){var e={};e.editable=this.getEditable();e.newTextRule=true;e.enableSettings=true;e.projectId="";e.projectVersion="";e.ruleId="";e.ruleVersion="";e.ruleBindingPath="";e.textRuleResults=[];e.textRuleResultExpressions=[];e.resultDataObjectId="";e.expressionLanguageVersion="";this._internalModel=new sap.ui.model.json.JSONModel(e);this.setModel(this._internalModel,"TextRuleModel");var t=this.getModel("ruleBuilderInternalModel");var n=this.getModel("TextRuleModel");if(t&&n){var s=t&&t.getObject("/textRuleConfiguration")?t.getObject("/textRuleConfiguration").enableSettings:true;n.setProperty("/enableSettings",s)}},_initSettingsModel:function(){this._settingsModel=new sap.ui.model.json.JSONModel;this.setModel(this._settingsModel,"settingModel")},_openTextRuleSettings:function(){var e=this._createTextRuleSettings();var t=new v({contentWidth:"70%",contentHeight:"315px",title:this.oBundle.getText("textRuleSettings")});t.addContent(e);var n=e.getButtons(t);for(var s=0;s<n.length;s++){t.addButton(n[s])}t.attachBeforeClose(function(e){var n=t.getState();if(n===sap.ui.core.ValueState.Success){if(this._internalModel.getProperty("/resultChanged")){var s=sap.ui.getCore().getEventBus();s.publish("sap.ui.rules","refreshTextRuleModel")}this._resetControl()}t.destroy()},this);t.open()},_resetControl:function(){this._unbindVerticalLayout();this._initInternalModel();this._initSettingsModel();this._initDisplayModel();var e=this._getModel();var t=this.getBindingContextPath();if(!t||!e){return}this._updateBusyState(true);e.removeData();this._resetContent=false;var n=t.split("'");this._internalModel.setProperty("/projectId",n[1]);this._internalModel.setProperty("/projectVersion",n[3]);this._internalModel.setProperty("/ruleId",n[5]);this._internalModel.setProperty("/ruleVersion",n[7]);this._internalModel.setProperty("/ruleBindingPath",t);var s=new sap.ui.model.Context(e,t);this.setBindingContext(s);this._bindRule()},_segregateTextRuleData:function(e){var t=[];t.If=[];t.ElseIf=[];t.Else=[];if(e.length>0){e[0].Type=this.typeIf}for(var n=0;n<e.length;n++){t.push(e[n]);this.getModel("displayModel").setProperty("/bCancelButtonVisible("+e[n].Id+")",e[n].TextRuleResultExpressions.results.length>1);if(e[n].Type===this.typeIf){t.If.push(e[n])}else if(e[n].Type===this.typeElseIf){t.ElseIf.push(e[n])}else if(e[n].Type===this.typeElse){t.Else.push(e[n])}}this.getModel("displayModel").setProperty("/textRuleConditions",t)},_updateBusyState:function(e){var t=this;if(e){this.setBusy(true)}else{setTimeout(function(){t.setBusy(false)},1500)}},_unbindVerticalLayout:function(){var e=this.getAggregation("_verticalLayout");if(e){e.destroyContent()}},_updateModelExpression:function(e,t,n){t.getModel().setProperty(e+"/Expression",n,t,true)},_updateModelAstNodes:function(e,t,n,s){var e=t.getPath();var i=this.getModel().getObject(e);var o=i.RuleId;var r=i.RuleVersion;var a="";var l={};if(this.includes(e,"TextRuleConditions")){l.Id=i.Id;a="/TextRuleConditionASTs"}else{l.ConditionId=i.ConditionId;l.ResultId=i.ResultId;a="/TextRuleResultExpressionASTs"}for(var u in n){var d={};if(n[u].Root){d.Sequence=1;d.Root=true}else{d.Sequence=n[u].SequenceNumber;d.ParentId=n[u].ParentId}if(n[u].Reference){d.Reference=n[u].Reference}if(n[u].Function){d.Function=n[u].Function?n[u].Function:""}if(n[u].Type!=="P"&&!n[u].Function){d.BusinessDataType=n[u].Output?n[u].Output.BusinessDataType:n[u].BusinessDataType;d.DataObjectType=n[u].Output?n[u].Output.DataObjectType:n[u].DataObjectType;d.Value=n[u].Value?n[u].Value:""}if(n[u].Type==="I"){d.IncompleteExpression=n[u].Value}d.NodeId=n[u].Id;d.Type=n[u].Type;d.RuleId=o;d.RuleVersion=r;for(var g in l){d[g]=l[g]}var p={};p.properties=d;p.groupId="astGroupId";s.createEntry(a,p)}},_removeExistingAstNodes:function(e,t,n,s,i){var o=this;var r=this.getModel().getObject(e);var a=r.RuleId;var l=r.RuleVersion;var u="";var d={};if(o.includes(e,"TextRuleConditions")){d.Id=r.Id;u="/DeleteTextRuleConditionASTDraft"}else if(o.includes(e,"TextRuleResultExpression")){d.ConditionId=r.ConditionId;d.ResultId=r.ResultId;u="/DeleteTextRuleResultExpressionASTDraft"}else{d.Id=r.Id;u="/DeleteTextRuleResultASTDraft"}d.RuleId=a;d.RuleVersion=l;i.callFunction(u,{method:"POST",groupId:"astGroupId",urlParameters:d})},_updateModelExpressionModelAst:function(e,t,n){if(t.getModel().getProperty(e+"/AST")){t.getModel().setProperty(e+"/AST",n,t,true)}},init:function(){this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this.typeIf="If";this.typeElseIf="ElseIf";this.typeElse="Else";this._resetContent=true;this._initInternalModel();this._initDisplayModel();this._initSettingsModel();this._addToolBar();this._addTextRuleControl();this._astUtils=T},onAfterRendering:function(){var e=this.getAggregation("_verticalLayout");var t=this;e.addEventDelegate({onAfterRendering:function(){t._updateBusyState(false)}},this)},onBeforeRendering:function(){if(this._resetContent){this._resetControl()}},setEnableSettings:function(e){this.setProperty("enableSettings",e,true);this._internalModel.setProperty("/enableSettings",e);return this},setEnableSettingResult:function(e){this.setProperty("enableSettingResult",e,true);return this},setModelName:function(e){this.setProperty("modelName",e);this._resetContent=true;return this},setExpressionLanguage:function(e){this.setAssociation("expressionLanguage",e,true);var t=e instanceof Object?e:sap.ui.getCore().byId(e);if(!t){return this}var n=this.getAggregation("_verticalLayout");if(n){var s=n.getBinding("content");if(s){s.refresh()}}return this},setAstExpressionLanguage:function(e){this.setAssociation("astExpressionLanguage",e,true);var t=e instanceof Object?e:sap.ui.getCore().byId(e);if(!t){return this}var n=this.getAggregation("_verticalLayout");if(n){var s=n.getBinding("content");if(s){s.refresh()}}return this},setEditable:function(e){this.setProperty("editable",e,true);this._internalModel.setProperty("/editable",e);return this},setBindingContextPath:function(e){var t=this.getBindingContextPath();if(e&&t!==e){this._unbindVerticalLayout();this.setProperty("bindingContextPath",e);this._resetContent=true}return this},includes:function(e,t){var n=false;if(e.indexOf(t)!==-1){n=true}return n},renderer:_});return E},true);
//# sourceMappingURL=TextRule.js.map