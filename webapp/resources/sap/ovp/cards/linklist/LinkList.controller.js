/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/cards/generic/base/linklist/BaseLinklist.controller","sap/ovp/filter/FilterUtils","sap/ui/core/Core"],function(i,t,e){"use strict";return i.extend("sap.ovp.cards.linklist.LinkList",{onInit:function(){i.prototype.onInit.apply(this,arguments);var n=this;this.eventhandler=function(i,e,s){t.applyFiltersToV2Card(s,n)};this.GloabalEventBus=e.getEventBus();if(this.oMainComponent&&this.oMainComponent.isMacroFilterBar){this.GloabalEventBus.subscribe("OVPGlobalfilter","OVPGlobalFilterSeacrhfired",n.eventhandler)}}})});
//# sourceMappingURL=LinkList.controller.js.map