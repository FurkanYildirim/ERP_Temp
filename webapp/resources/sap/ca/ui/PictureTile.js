/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.PictureTile");jQuery.sap.require("sap.ca.ui.library");jQuery.sap.require("sap.m.CustomTile");sap.m.CustomTile.extend("sap.ca.ui.PictureTile",{metadata:{deprecated:true,library:"sap.ca.ui",properties:{height:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"32px"},width:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"32px"}},associations:{tileContent:{type:"sap.ca.ui.PictureViewerItem",multiple:false}},events:{pictureDelete:{}}}});sap.ca.ui.PictureTile.prototype.init=function(e){this._oDeletePictureButton=new sap.m.Button({icon:"sap-icon://sys-cancel",press:jQuery.proxy(this._deletePictureRequestHandler,this),type:sap.m.ButtonType.Transparent}).addStyleClass("sapCaUiPTDeleteButton");if(!jQuery.device.is.desktop){this.attachPress(this._tilePressedHandler);this.attachBrowserEvent("swipe",jQuery.proxy(this._tileSwipedHandler,this));this._oDeletePictureButton.addStyleClass("hide")}};sap.ca.ui.PictureTile.prototype.setTileContent=function(e){this.setContent(null);if(e){var t=e.getImage();if(jQuery.device.is.desktop){this.setContent(t)}else{this.setContent(new sap.ca.ui.ZoomableScrollContainer({content:e.getImage()}))}}else{this.setContent(null)}this.setAssociation("tileContent",e)};sap.ca.ui.PictureTile.prototype.setSize=function(e,t){this._width=e;this._height=t;var i=this.$();if(i){i.css({width:e+"px",height:t+"px"});jQuery.sap.byId(this.getId()+"-wrapper").addClass("sapCaUiPTWrapper")}};sap.ca.ui.PictureTile.prototype._tilePressedHandler=function(e){this.switchVisibility()};sap.ca.ui.PictureTile.prototype.switchVisibility=function(e){var t=this._oDeletePictureButton.$();if(e===undefined){t.toggleClass("hide")}else{t.toggleClass("hide",!e)}};sap.ca.ui.PictureTile.prototype._tileSwipedHandler=function(e){var t=this._oDeletePictureButton.$();if(t&&!t.hasClass("hide")){t.addClass("hide")}};sap.ca.ui.PictureTile.prototype._deletePictureRequestHandler=function(){this.firePictureDelete()};
//# sourceMappingURL=PictureTile.js.map