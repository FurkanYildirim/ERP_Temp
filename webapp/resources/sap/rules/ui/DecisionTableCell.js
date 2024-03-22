/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","./library","sap/rules/ui/DecisionTableCellExpressionAdvanced","sap/rules/ui/type/DecisionTableCell","sap/rules/ui/DecisionTableCellExpressionBasic","sap/m/Popover","sap/rules/ui/Constants","sap/rules/ui/ast/constants/Constants","sap/rules/ui/services/AstExpressionLanguage","sap/rules/ui/ast/util/AstUtil","sap/ui/core/LocaleData","./DecisionTableCellRenderer"],function(jQuery,e,t,a,i,s,r,n,o,l,u,g){"use strict";var p=sap.ui.core.Control.extend("sap.rules.ui.DecisionTableCell",{metadata:{library:"sap.rules.ui",properties:{valuePath:{type:"string",defaultValue:"",bindable:"bindable"},valueOnlyPath:{type:"string",defaultValue:"",bindable:"bindable"},headerValuePath:{type:"string",defaultValue:"",bindable:"bindable"},fixedOperatorPath:{type:"string",defaultValue:"",bindable:"bindable"},typePath:{typePath:"string",bindable:"bindable"},valueStatePath:{type:"string",defaultValue:"null",bindable:"bindable"},valueStateTextPath:{type:"string",defaultValue:"null",bindable:"bindable"},valueModelName:{type:"string",defaultValue:"",bindable:"bindable"},displayModelName:{type:"string",defaultValue:"",bindable:"bindable"},editable:{type:"boolean",defaultValue:true},inFocus:{type:"boolean",defaultValue:false},decisionTableCellType:{type:"sap.rules.ui.type.DecisionTableCell",multiple:false},ruleFormatPath:{type:"string",defaultValue:"null",bindable:"bindable"},decisionTableFormat:{type:"sap.rules.ui.DecisionTableFormat",defaultValue:sap.rules.ui.DecisionTableFormat.CellFormat},keyProperties:{type:"object",defaultValue:"{}"},attributeInfoPath:{type:"string",defaultValue:null,bindable:"bindable"},attributeNamePath:{type:"string",defaultValue:null,bindable:"bindable"},headerInfo:{type:"object",defaultValue:{}}},aggregations:{_displayedControl:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}},associations:{expressionLanguage:{type:"sap.rules.ui.services.ExpressionLanguage",multiple:false,validateOnLoad:true,singularName:"expressionLanguage"},astExpressionLanguage:{type:"sap.rules.ui.services.AstExpressionLanguage",multiple:false,singularName:"astExpressionLanguage"},ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}}},renderer:g});p.prototype._addNodeObject=function(e){var t=[];var a=sap.ui.getCore().byId(this.getAstExpressionLanguage());var i=a._astBunldeInstance.ASTUtil;var s=[];s.Root=e.Root;s.SequenceNumber=e.Sequence;s.ParentId=e.ParentId;s.Reference=e.Reference;s.Id=e.NodeId;s.Type=e.Type;s.Value=e.Value?e.Value:"";if(e.Type==="I"){s.Value=e.IncompleteExpression}if(e.Function){s.Function=e.Function}if(e.Type!=="P"&&!e.Function){var r=[];r.BusinessDataType=e.Output?e.Output.BusinessDataType:e.BusinessDataType;r.DataObjectType=e.Output?e.Output.DataObjectType:e.DataObjectType;s.Output=r}i.createNode(s)};p.prototype._bindPopOverFragment=function(e){var t=this;var a=this.getExpressionLanguage()&&this.getDisplayModelName()?this.getDisplayModelName()+">"+this.getValuePath():this.getValuePath();var i=this.getValueModelName()?this.getValueModelName()+">"+this.getValuePath():this.getValuePath();var s=this.getExpressionLanguage()&&this.getDisplayModelName()?this.getDisplayModelName()+">"+this.getHeaderValuePath():this.getHeaderValuePath();var r=this.getExpressionLanguage()&&this.getDisplayModelName()?this.getDisplayModelName()+">"+this.getFixedOperatorPath():this.getFixedOperatorPath();var n=this.getModel().getProperty(this.getFixedOperatorPath());var o=this.getAggregation("_displayedControl");if(i&&i!=="null"){if(!this.getTypePath()){if(this.getAstExpressionLanguage()){e.setHeaderInfo(this.getHeaderInfo());e.markerString=this._getMarkerString().trim();var l="";n=this.astUtil._getCapitalOperatorName(n);if(o.relString){if(this.includes(o.relString,e.markerString)){l=o.relString.replace(e.markerString,"")}else{l=o.relString}}if(l.startsWith(n+" ")){l=l.split(n+" ")[1]}var u=o.JSON;e.setValue(l);e.setJsonData(u);e.setValueState(o.getValueState())}else{e.bindValue({parts:[{path:s},{path:r},{path:i},{path:a}],type:this.getDecisionTableCellType()})}}else{if(this.getAstExpressionLanguage()){e.setAttributeInfo(this.getAttributeInfoPath());e.setValue(o.relString);e.setJsonData(o.JSON);e.setValueState(o.getValueState())}else{e.bindValue({parts:[{path:i},{path:this.getTypePath()},{path:a}],type:this.getDecisionTableCellType()});if(this.getTypePath()){e.bindType(this.getTypePath())}}}}if(s){e.bindHeaderValue(s);if(r){e.bindFixedOperator(r)}}if("getAttributeInfo"in e&&this.getAttributeInfoPath()&&this.getExpressionLanguage()){e.bindAttributeInfo(this.getAttributeInfoPath())}if("getAttributeName"in e&&this.getAttributeNamePath()){e.bindAttributeName(this.getAttributeNamePath())}};p.prototype._createStaticControl=function(){var e=this;var t=this.getModel("dtModel").getProperty("/editable");var a=this.getModel().getProperty(this.getFixedOperatorPath());var i=this.getAstExpressionLanguage()?this.astUtil._getCapitalOperatorName(a):a;var s=this.getAggregation("_displayedControl");if(s){s.destroy()}s=new sap.m.Input({ariaLabelledBy:this.getAriaLabelledBy(),editable:false});if(t){s.addStyleClass("sapRULDecisionTableSCellEditable")}else{s.removeStyleClass("sapRULDecisionTableSCellEditable")}s.addDelegate({onclick:function(e){if(t){this.onFocusIn()}}.bind(this),onkeyup:function(e){if(e.keyCode===13&&t){this.onFocusIn()}else{return}}.bind(this)});var r=this.getValuePath();var n;var o="/"+r.split("/")[1];var l=new sap.ui.model.Context(this.getModel(),o);if(this.getExpressionLanguage()){r=this.getDisplayModelName()+">"+r}if(r&&r!=="null"){var u=this.getTypePath()?false:true;var g="";if(u&&this.getAstExpressionLanguage()){g=this._getMarkerString()}s.bindValue({path:r,formatter:function(t){if(e.getAstExpressionLanguage()){var a=e._getExpressionFromAstNodes(l,true);if(a&&u){if(g!==""&&e.includes(a,g)){return a.split(g)[1]}else if(a.startsWith(i+" ")){return a.split(i+" ")[1]}else{return a}}else{return a}}else{return t}}});s.bindProperty("tooltip",{path:r,formatter:function(t){if(e.getAstExpressionLanguage()){var a=e._getExpressionFromAstNodes(l,true);if(a&&u){if(g!==""&&e.includes(a,g)){return a.split(g)[1]}else if(a.startsWith(i+" ")){return a.split(i+" ")[1]}else{return a}}else{return a}}else{return t}}})}var p=this.getValueStatePath();if(p&&p!=="null"&&!this.getAstExpressionLanguage()){s.bindProperty("valueState",{path:p,formatter:function(e){var t=sap.ui.core.ValueState.None;if(e===sap.ui.core.ValueState.Error){t=sap.ui.core.ValueState.Error}return t}.bind(this)})}return s};p.prototype._getLocaleData=function(){var e=sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();return u.getInstance(e)};p.prototype._getDateFormatter=function(){var e=this._getLocaleData();var t=e.getDatePattern("medium");var a=sap.ui.core.format.DateFormat.getDateInstance({pattern:t});return a};p.prototype._getDateTimeFormatter=function(){var e=this._getLocaleData();var t=e.getDatePattern("medium");var a=e.getTimePattern("medium");var i=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:t+" "+a});return i};p.prototype._getExpressionFromAstNodes=function(e,t){var a=this;var i=sap.ui.getCore().byId(this.getAstExpressionLanguage());var s=i._astBunldeInstance.TermsProvider.TermsProvider;var o="";var l="";var u=this.getModel("displayModel");var g=e.getModel();var p=e.getPath();var d=g.getObject(p);var h=0;var c=0;var f=d?d.DecisionTableRowCellASTs:[];var b=i._astBunldeInstance.ASTUtil;var v=[n.AVG,n.SUM,n.COUNT,n.COUNTDISTINCT,n.DISTINCT,n.MIN,n.MAX,n.FILTER,n.TOP,n.BOTTOM,n.FIRST,n.SELECT,n.SORTASC,n.SORTDESC];b.clearNodes();if(f&&f.__list&&f.__list.length>0){f=f.__list;for(var y in f){this._addNodeObject(e.getObject("/"+f[y]))}var m=b.getNodes();if(t){var T=this._getDateFormatter();var S=this._getDateTimeFormatter();o=b.toAstExpressionStringForDt(m,T,S)}else{o=b.toAstExpressionString(m)}c=o.JSON.length;if(o&&o.relString){o.relString=o.relString.replace(/\\/g,"\\\\").replace(/{/g,"\\{").replace(/}/g,"\\}")}this.getAggregation("_displayedControl").relString=o?o.relString:"";this.getAggregation("_displayedControl").shortRELString=o?o.shortRELString:"";this.getAggregation("_displayedControl").JSON=o?o.JSON:[];a.getAggregation("_displayedControl").displayString=o?o.displayString:"";if(m&&m[0].Type==="I"&&m[0].Value!=""){this.getAggregation("_displayedControl").setValueState("Error")}else{this.getAggregation("_displayedControl").setValueState("None")}var A=o.shortRELString?o.shortRELString.split(" "):[];A=o.displayString?o.displayString.split(" "):[];for(var C in A){var _="";if(A[C].startsWith("./")||A[C].startsWith("/")&&!a.includes(A[C],r.MARKER_STRING)){_=s.getTermNameFromASTNodeReference(A[C])}if(_!==""){l=l+" "+_}else{if(a.includes(A[C],"/"+r.MARKER_STRING)){A[C]=A[C].replace("/"+r.MARKER_STRING,"")}if(this.getAggregation("_displayedControl").getValueState()==="Error"&&a.includes(A[C],"====")){A[C]=A[C].replace("====","")}if(a.includes(A[C],r.MARKER_STRING)){A[C]=A[C].replace(r.MARKER_STRING,"")}var N=A[C].split("(");if(a.includes(v,N[0])&&h<c){A[C]=A[C].replace(o.JSON[h].dataObject,s.getTermNameFromASTNodeReference(o.JSON[h].dataObject));h++}l=l+" "+A[C]}}if(l!=""){o=l.trim()}}return o instanceof Object?o.shortRELString:o.trim()};p.prototype._getMarkerString=function(){var e;var t=this.getHeaderInfo().headerValue;if(t===undefined||t.trim()===""){return""}var a=t.split(" ");var i=a[a.length-1]!==""?a[a.length-1]:a[a.length-2];var s=["=","!=",">",">=","<","<=","IN","NOTIN","EXISTSIN","NOTEXISTSIN","MATCHES","NOTMATCHES","CONTAINS","NOTCONTAINS","STARTSWITH","NOTSTARTSWITH","ENDSWITH","NOTENDSWITH","ISWITHIN","ISNOTWITHIN","+","-","/","*"];var n=["AND","OR"];if(n.indexOf(i)>-1){e=""}else if(s.indexOf(i)>-1){e="/"+r.MARKER_STRING+" ==== "}else{e="/"+r.MARKER_STRING+" "}return e};p.prototype._setDisplayedControl=function(){var e=this._createStaticControl();this.setAggregation("_displayedControl",e,true)};p.prototype.init=function(){this.astUtil=new l;this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n")};p.prototype.onAfterRendering=function(){this.bColumnResized=false;var e=sap.ui.getCore().getEventBus();e.unsubscribe("sap.ui.rules","_onColumnResized",this._setColumnResized,this)};p.prototype.onBeforeRendering=function(){var e=sap.ui.getCore().getEventBus();e.subscribeOnce("sap.ui.rules","_onColumnResized",this._setColumnResized,this);if(!this.bColumnResized){this._setDisplayedControl()}};p.prototype._setColumnResized=function(e,t){this.bColumnResized=true};p.prototype.onFocusIn=function(){var e=function(e){var t=e.getSource().getAggregation("content")[1];t.setVisible(true);var a=this.getAggregation("_displayedControl");a.setEnabled(false)}.bind(this);var t=function(e){var t=this.getAggregation("_displayedControl");if(t){t.setEnabled(true)}}.bind(this);var a=function(e){if(this._oPopover){var t=this._oPopover.getAggregation("content")[1];if(t instanceof sap.rules.ui.ExpressionAdvanced){if(t.codeMirror){var a=t.codeMirror.getValue();t.setValue(a)}}else if(t instanceof sap.rules.ui.AstExpressionBasic){t._fireChange(t._input.text())}this._oPopover.destroy();this._oPopover=null;var i=this.getAggregation("_displayedControl");i.focus()}}.bind(this);this._oPopover=null;if(!this._oPopover){var i=this.getModel().getProperty(this.getValueOnlyPath());var s=this.getModel().getProperty(this.getRuleFormatPath());var r=this.getDecisionTableFormat();if(sap.ui.getCore().byId("popover")){sap.ui.getCore().byId("popover").destroy()}if(this.getAstExpressionLanguage()){this._oPopover=sap.ui.xmlfragment("sap.rules.ui.fragments.DecisionTableCellAstExpressionBasic",this);this._oPopover.setTooltip(this.oBundle.getText("ctrlSpaceCue"));var n=this._oPopover.getAggregation("content")[1];n.setAstExpressionLanguage(this.getAstExpressionLanguage());n.attachChange(sap.rules.ui.DecisionTableCellAstExpressionBasic.prototype._changeValue)}else{if(r===sap.rules.ui.DecisionTableFormat.RuleFormat){if(s.toUpperCase()===sap.rules.ui.RuleFormat.Advanced){this._oPopover=sap.ui.xmlfragment("sap.rules.ui.fragments.DecisionTableCellExpressionAdvanced",this)}else{this._oPopover=sap.ui.xmlfragment("sap.rules.ui.fragments.DecisionTableCellExpressionBasic",this)}}else if(i){this._oPopover=sap.ui.xmlfragment("sap.rules.ui.fragments.DecisionTableCellExpressionBasic",this)}else{this._oPopover=sap.ui.xmlfragment("sap.rules.ui.fragments.DecisionTableCellExpressionAdvanced",this)}var n=this._oPopover.getAggregation("content")[1];n.setExpressionLanguage(this.getExpressionLanguage())}this._oPopover.attachAfterOpen(e);this._oPopover.attachBeforeClose(t);this._oPopover.attachAfterClose(a);this.addDependent(this._oPopover);var o=jQuery.sap.byId(this.getId()).closest("td").width()*.93;var l=o+"px";var u=this._oPopover.getAggregation("content")[0];u.setWidth(l);if(this.getModel("settingModel")&&this.getModel("settingModel").oData){n.resultDataObjectId=this.getModel("settingModel").oData.ResultDataObjectId;n.resultDataObjectName=this.getModel("settingModel").oData.ResultDataObjectName}this._bindPopOverFragment(n);var g=this.getAggregation("_displayedControl");this._oPopover.openBy(g)}};p.prototype.includes=function(e,t){var a=false;if(e.indexOf(t)!==-1){a=true}return a};return p},true);
//# sourceMappingURL=DecisionTableCell.js.map