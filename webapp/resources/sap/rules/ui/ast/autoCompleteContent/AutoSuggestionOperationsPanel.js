sap.ui.define(["sap/ui/thirdparty/jquery","../../library","sap/ui/core/Control","sap/m/List","sap/ui/model/json/JSONModel","sap/m/ListMode","sap/ui/core/CustomData","sap/ui/model/Sorter","sap/rules/ui/parser/infrastructure/util/utilsBase","./AutoSuggestionOperationsPanelRenderer"],function(jQuery,e,t,a,r,i,s,n,u,l){"use strict";var o=t.extend("sap.rules.ui.ast.autoCompleteContent.AutoSuggestionOperationsPanel",{metadata:{library:"sap.rules.ui",properties:{reference:{type:"object",defaultValue:null},data:{type:"object",defaultValue:null}},aggregations:{PanelLayout:{type:"sap.m.Panel",multiple:false}},events:{}},init:function(){this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this.infraUtils=new sap.rules.ui.parser.infrastructure.util.utilsBase.utilsBaseLib;this.needCreateLayout=true;this.AttributeSegmentSelected=true;this.dataObjectName=""},onBeforeRendering:function(){this._reference=this.getReference();if(this.needCreateLayout){var e=this._createLayout();this.setAggregation("PanelLayout",e,true);this.needCreateLayout=false}},initializeVariables:function(){},_createLayout:function(){var e=this;var t=this.getData();var a=new sap.ui.model.json.JSONModel;a.setData(t);this.Operationslist=new sap.m.List({growing:true,growingScrollToLoad:true,enableBusyIndicator:true});this.Operationslist.bindItems({path:"/",sorter:new sap.ui.model.Sorter("name"),rememberSelections:false,mode:i.SingleSelectMaster,template:new sap.m.DisplayListItem({label:"{name}",value:"{label}",type:"Active",press:function(t){e._reference(t)}})});this.Operationslist.setModel(a);var e=this;var r=new sap.m.Panel({headerText:this.oBundle.getText("OperationsPanelTitle"),expandable:true,expanded:true,content:this.Operationslist,width:"auto"});return r},renderer:l});return o},true);
//# sourceMappingURL=AutoSuggestionOperationsPanel.js.map