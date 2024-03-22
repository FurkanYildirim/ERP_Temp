// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/m/TileContent","sap/m/TileContentRenderer","sap/ui/core/Control"],function(e,t,i){"use strict";var n=i.extend("numeric.TileContent_Timestamp",{ontap:function(e){if(this.getParent().getRefreshOption()){e.preventDefault();e.cancelBubble=true;if(e.stopPropagation){e.stopPropagation()}this.getParent().fireRefresh()}},renderer:function(e,t){e.write("<div");e.writeElementData(t);e.addClass("sapMTileCntFtrTxt");if(t.getParent().getRefreshOption()){e.addClass("sapMLnk")}e.writeClasses();e.addStyle("position","absolute");e.addStyle("z-index","2");e.addStyle(e.getConfiguration().getRTL()?"left":"right","auto");e.writeStyles();e.write(">");var i=t.getParent().getTimestamp();if(i){if(!t.getParent().getRefreshOption()){e.writeEscaped(i)}else if(e.getConfiguration().getRTL()){e.writeEscaped(i+" ");e.writeIcon("sap-icon://refresh","sapMCmpTileUnitInner")}else{e.writeIcon("sap-icon://refresh","sapMCmpTileUnitInner");e.writeEscaped(" "+i)}}e.write("</div>")}});return e.extend("sap.ushell.components.tiles.sbtilecontent",{metadata:{properties:{timestamp:{type:"string"},refreshOption:{type:"boolean"}},events:{refresh:{}}},init:function(){this.addDependent(this._oTimestamp=new n)},getAltText:function(){var t=e.prototype.getAltText.apply(this,arguments);if(this.getTimestamp()){t+=(t===""?"":"\n")+this.getTimestamp()}return t},renderer:{_renderFooter:function(e,i){t._renderFooter.apply(this,arguments);e.renderControl(i._oTimestamp)}}})},true);
//# sourceMappingURL=sbtilecontent.js.map