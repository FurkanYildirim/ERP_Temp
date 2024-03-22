/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/cards/generic/base/linklist/BaseLinklist.controller","sap/ovp/cards/OVPCardAsAPIUtils","sap/ovp/cards/Filterhelper","sap/ovp/filter/FilterUtils","sap/ui/core/Core"],function(t,e,i,n,r){"use strict";return t.extend("sap.ovp.cards.v4.linklist.LinkList",{onInit:function(){t.prototype.onInit.apply(this,arguments);var e=this;this.eventhandler=function(t,i,r){n.applyFiltersToV4Card(r,e)};this.GloabalEventBus=r.getEventBus();if(this.oMainComponent&&(this.oMainComponent.isMacroFilterBar||this.oMainComponent.oGlobalFilter)){this.GloabalEventBus.subscribe("OVPGlobalfilter","OVPGlobalFilterSeacrhfired",e.eventhandler)}},onAfterRendering:function(){t.prototype.onAfterRendering.apply(this,arguments);if(!e.checkIfAPIIsUsed(this)){var n=this.getCardPropertiesModel();var r=this.getOwnerComponent().getModel("ui").getData().cards;var a=[];var s=this.getEntitySet()&&this.getEntitySet()["$Type"];var l=s&&this.getMetaModel().getContext("/"+s);if(l){var o=l.getObject();this.selectionVaraintFilter=i.getSelectionVariantFilters(r,n,this.getEntityType())}var p=this.oCardComponentData.mainComponent;if(p.getGlobalFilter()){a=i._getEntityRelevantFilters(o,p.oGlobalFilter.getFilters())}if(p.getMacroFilterBar()){var g=p.aFilters;a=i._getEntityRelevantFilters(o,g)}a=i.mergeFilters(a,this.selectionVaraintFilter);if(this.getCardItemsBinding()){this.getCardItemsBinding().filter(a)}if(this.getKPIBinding()){this.getKPIBinding().filter(a)}}}})});
//# sourceMappingURL=LinkList.controller.js.map