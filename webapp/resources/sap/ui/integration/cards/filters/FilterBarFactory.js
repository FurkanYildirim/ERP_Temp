/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./FilterBar","./SearchFilter","./SelectFilter","./DateRangeFilter","sap/ui/base/Object","sap/m/library","sap/m/HBox","sap/ui/layout/AlignedFlowLayout"],function(e,t,a,r,n,i,s,l){"use strict";var o=i.FlexWrap;var u=i.FlexRendertype;var c=n.extend("sap.ui.integration.util.FilterBarFactory",{metadata:{library:"sap.ui.integration"},constructor:function(e){n.call(this);this._oCard=e}});c.prototype.create=function(t,a){var r=[],n=[],i,c,d,p,f=null;for(c in t){i=t[c];f=this._getClass(i.type);d=new f({card:this._oCard,key:c,config:i,value:{model:"filters",path:"/"+c},visible:i.visible});a.setProperty("/"+c,d.getValueForModel());this._awaitEvent(n,d,"_ready");d._setDataConfiguration(i.data);r.push(d)}if(!r.length){return null}if(r.length>1){p=new l({content:r,minItemWidth:"10rem",maxItemWidth:"20rem"});r.forEach(function(e){e.getField().setWidth("100%")});p.addStyleClass("sapFCardFilterBarAFLayout")}else{p=new s({wrap:o.Wrap,renderType:u.Bare,items:r})}p.addStyleClass("sapFCardFilterBarContent");var h=new e({content:p});Promise.all(n).then(function(){h.fireEvent("_filterBarDataReady")});return h};c.prototype._awaitEvent=function(e,t,a){e.push(new Promise(function(e){t.attachEventOnce(a,function(){e()})}))};c.prototype._getClass=function(e){e=e||"select";switch(e.toLowerCase()){case"string":case"integer":case"select":return a;case"daterange":return r;case"search":return t;default:return undefined}};return c});
//# sourceMappingURL=FilterBarFactory.js.map