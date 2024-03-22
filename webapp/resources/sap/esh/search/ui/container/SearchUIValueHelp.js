/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function t(e,t){for(var a=0;a<t.length;a++){var r=t[a];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function a(e,a,r){if(a)t(e.prototype,a);if(r)t(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}window.onload=function(){sap.ui.loader.config({baseUrl:"../../../../../../resources/",paths:{"sap/esh/search/ui":"/resources/sap/esh/search/ui"}});sap.ui.require(["sap/esh/search/ui/SearchCompositeControl","sap/ui/core/dnd/DragDropInfo","sap/ui/core/dnd/DropInfo","sap/m/Table","sap/m/Column","sap/m/ColumnListItem","sap/m/Label","sap/m/ListMode","sap/m/Button","sap/m/OverflowToolbar","sap/m/MessageBox"],function(t,r,n,i,o,u,s,c,l,p,d){var f=[];var h=function e(t){var a=t.sinaNext;return new Promise(function(e){for(var t in a.dataSourceMap){var r=a.dataSourceMap[t];if(r.id==="$$APPS$$"){continue}f.push(a.createDataSource({id:r.id+"1",label:r.labelPlural,icon:r.icon,type:a.DataSourceType.BusinessObject,subType:a.DataSourceSubType.Filtered,dataSource:r}))}var n=a.dataSourceMap["Urban_Legends"].id+"_desc_the";var i=a.createDataSource({id:n,label:"Urban Legends -> Summary(DESC) '...the...'",icon:"sap-icon://thumb-up",type:a.DataSourceType.BusinessObject,subType:a.DataSourceSubType.Filtered,dataSource:a.dataSourceMap["Urban_Legends"],filterCondition:a.createSimpleCondition({operator:a.ComparisonOperator.Co,attribute:"DESC",value:"the"})});f.push(i);e()})};var g=function e(t){};var v=function e(t){var a=t.getParameter("draggedControl");if(a){var r=a.getBindingContext();if(!r){return}var n=r.getObject();var i=t.getParameter("droppedControl");var o;if(i instanceof u){o=i.getParent()}else{o=i}var c=[];c.push(new s({text:n.title.replace("<b>","").replace("</b>","")}));for(var l=0;l<3;l++){if(n.itemattributes[l]){c.push(new s({text:n.itemattributes[l].valueWithoutWhyfound}))}}o.addItem(new u({cells:c}))}};var m=function e(t){t.addDragDropConfig(new r({sourceAggregation:"items",dragStart:g.bind(this)}))};var w=function e(t){t.addDragDropConfig(new n({targetAggregation:"items",drop:v.bind(this)}))};var b=function(){function t(){e(this,t)}a(t,[{key:"formatAsync",value:function e(t){for(var a=0;a<t.items.length;++a){var r=t.items[a];var n=this.createTargetFunctionShowInfo(r);if(n){if(typeof r.navigationTargets==="undefined"){r.navigationTargets=[]}r.navigationTargets.push(t.sina._createNavigationTarget({label:"Info",targetFunction:n}))}var i=this.createTargetFunctionLookupAtWikipedia(r);if(i){if(typeof r.navigationTargets==="undefined"){r.navigationTargets=[]}r.navigationTargets.push(t.sina._createNavigationTarget({label:"Lookup at Wikipedia",targetFunction:i}))}}return Promise.resolve(t)}},{key:"createTargetFunctionShowInfo",value:function e(t){var a=this;var r=function e(r){a.showInfo(t)};return r}},{key:"showInfo",value:function e(t){d.information("'Show Info' not yet implemented for item '".concat(t.titleAttributes[0].valueFormatted,"'"))}},{key:"lookupAtWikipedia",value:function e(t){window.open("https://wikipedia.org/wiki/".concat(t.titleAttributes[0].valueFormatted))}},{key:"createTargetFunctionLookupAtWikipedia",value:function e(t){var a=this;var r=function e(r){a.lookupAtWikipedia(t)};return r}}]);return t}();var y={optimizeForValueHelp:true,facetPanelWidthInPercent:0,pageSize:15,updateUrl:false,sinaConfiguration:{provider:"sample",searchResultSetFormatters:[new b]},quickSelectDataSources:f,initAsync:h};var S=new t("ValueHelpEshComp",y);window.addEventListener("hashchange",function(){S.getModel().parseURL()},false);S.attachSearchFinished(function(){S.setResultViewTypes(["searchResultList"]);S.setResultViewType("searchResultList")});S.placeAt("panelLeft");var T=[];T.push(new o({header:new s({text:"Title",width:"8rem"})}));T.push(new o({header:new s({text:"Attribute 1",width:"8rem"})}));T.push(new o({header:new s({text:"Attribute 2",width:"8rem"})}));T.push(new o({header:new s({text:"Attribute 3",width:"8rem"})}));var D={headerToolbar:new p({content:[new s({text:"Drag&Drop from Result List to 'Shopping Cart' ..."}),new l({text:"Delete",press:function e(){return alert("'Delete' not implemented")}}),new l({text:"Proceed to Checkout",icon:"sap-icon://cart",press:function e(){return alert("'Proceed to Checkout' not implemented")}})]}),mode:c.MultiSelect,columns:T,delete:function e(){return alert("'Delete' not implemented")}};var k=new i("ValueHelpDropTarget",D);m(S);w(k);k.placeAt("panelRight")});jQuery("html").css("overflow-y","auto");jQuery("html").css("height","100%")}})();
//# sourceMappingURL=SearchUIValueHelp.js.map