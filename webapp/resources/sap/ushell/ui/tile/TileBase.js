/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ushell/library","sap/ui/core/Control","sap/ushell/library","./TileBaseRenderer"],function(e,t,a,r){"use strict";var l=e.ui.tile.State;var u=t.extend("sap.ushell.ui.tile.TileBase",{metadata:{library:"sap.ushell",properties:{title:{type:"string",group:"Data",defaultValue:null},subtitle:{type:"string",group:"Data",defaultValue:null},icon:{type:"string",group:"Data",defaultValue:null},info:{type:"string",group:"Data",defaultValue:null},infoState:{type:"sap.ushell.ui.tile.State",defaultValue:l.Neutral},targetURL:{type:"string",group:"Behavior",defaultValue:null},highlightTerms:{type:"any",group:"Appearance",defaultValue:[]}},aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"}},events:{press:{}}},renderer:r});u.prototype.ontap=function(e){this.firePress({})};u.prototype.onsapenter=function(e){this.firePress({})};u.prototype.onsapspace=function(e){this.firePress({})};return u});
//# sourceMappingURL=TileBase.js.map