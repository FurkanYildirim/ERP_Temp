sap.ui.define(["sap/ui/thirdparty/jquery","../../library","sap/ui/core/Control","sap/m/List","sap/ui/model/json/JSONModel","sap/m/ListMode","sap/ui/core/CustomData","sap/ui/model/Sorter","sap/rules/ui/parser/infrastructure/util/utilsBase","./AutoSuggestionArrayOperatorPanelRenderer"],function(jQuery,e,t,a,r,s,i,n,u,l){"use strict";var o=t.extend("sap.rules.ui.ast.autoCompleteContent.AutoSuggestionArrayOperatorPanel",{metadata:{library:"sap.rules.ui",properties:{reference:{type:"object",defaultValue:null},data:{type:"object",defaultValue:null},expand:{type:"boolean",defaultValue:false}},aggregations:{PanelLayout:{type:"sap.m.Panel",multiple:false}},events:{}},init:function(){this.oBundle=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");this.infraUtils=new sap.rules.ui.parser.infrastructure.util.utilsBase.utilsBaseLib;this.needCreateLayout=true;this.AttributeSegmentSelected=true;this.dataObjectName=""},onBeforeRendering:function(){this._reference=this.getReference();if(this.needCreateLayout){var e=this._createLayout();this.setAggregation("PanelLayout",e,true);this.needCreateLayout=false}},initializeVariables:function(){},_createLayout:function(){var e=this;var t=this.getData();var a=new sap.ui.model.json.JSONModel;a.setData(t);this.arrayOperatorslist=new sap.m.List({growing:true,growingScrollToLoad:true,enableBusyIndicator:true});this.arrayOperatorslist.bindItems({path:"/array",sorter:new sap.ui.model.Sorter("name"),rememberSelections:false,mode:s.SingleSelectMaster,template:new sap.m.DisplayListItem({label:"{name}",value:"{label}",type:"Active",press:function(t){e._reference(t)}})});this.arrayOperatorslist.setModel(a);var e=this;var r=new sap.m.Panel({headerText:this.oBundle.getText("arrayOperatorsPanelTitle"),expandable:true,expanded:this.getExpand(),content:this.arrayOperatorslist,width:"auto"});return r},renderer:l});return o},true);
//# sourceMappingURL=AutoSuggestionArrayOperatorPanel.js.map