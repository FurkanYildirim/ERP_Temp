/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,i){"use strict";return e.extend("sap.ovp.cards.rta.SelectLinks",{onInit:function(){},onAfterRendering:function(){},_filterTable:function(e,n,r){var a=e.getParameter("query"),o=null,l=[];for(var s=0;s<n.length;s++){l.push(new t(n[s],i.Contains,a))}if(a){o=new t(l,false)}this.getView().byId(r).getBinding("items").filter(o,"Application")},filterTable:function(e){var t=this.getView(),i=t.getModel(),n;this._filterTable(e,["name","value"],"LinkTable");n=t.byId("LinkTable").getBinding("items").getLength();i.setProperty("/NoOfLinks",n);i.refresh(true)},onItemPress:function(e){var t=e.getSource(),i=t.getBindingContext(),n=i.getProperty("value");this.updateLinkPath(n)}})});
//# sourceMappingURL=SelectLinks.controller.js.map