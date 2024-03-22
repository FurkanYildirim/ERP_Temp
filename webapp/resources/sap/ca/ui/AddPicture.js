/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.AddPicture");jQuery.sap.require("sap.ca.ui.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.ca.ui.AddPicture",{metadata:{deprecated:true,library:"sap.ca.ui",properties:{buttonPageType:{type:"string",group:"Appearance",defaultValue:"Tab"},editable:{type:"boolean",group:"Appearance",defaultValue:true},maxPictureNumber:{type:"int",group:"Behavior",defaultValue:10},uploadUrl:{type:"string",group:"Misc",defaultValue:null},width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"100%"},text:{type:"string",group:"Appearance",defaultValue:null},pictureAlign:{type:"sap.ui.core.TextAlign",group:"Appearance",defaultValue:sap.ui.core.TextAlign.Left},itemSize:{type:"int",group:"Appearance",defaultValue:64},compression:{type:"string",group:"Appearance",defaultValue:"low"}},aggregations:{pictures:{type:"sap.ca.ui.PictureItem",multiple:true,singularName:"picture",bindable:"bindable"}},events:{show:{},pictureAdded:{},maxPictureLimitReached:{},imageUploadFailed:{},fileNotSupported:{parameters:{fileNames:{type:"any"}}}}}});jQuery.sap.require("sap.ca.ui.utils.resourcebundle");jQuery.sap.require("sap.ca.ui.PictureItem");jQuery.sap.require("sap.ca.ui.utils.CanvasHelper");sap.ca.ui.AddPicture.BUTTON_PAGE_TYPE={TAB:"Tab",FORM:"Form"};sap.ca.ui.AddPicture.prototype.init=function(){var e=jQuery.proxy(this._clickCaptureInput,this);this._oButton=new sap.m.Button(this.getId()+"-add",{press:e,icon:"sap-icon://add",type:sap.m.ButtonType.Transparent,width:"100%",enabled:true}).setParent(this).addStyleClass("sapCaUiAddPictureButton");this.setText(sap.ca.ui.utils.resourcebundle.getText("addPicture.text"));this._forceUpload=false};sap.ca.ui.AddPicture.prototype.exit=function(){if(this._oButton){this._oButton.destroy()}if(!window.FileReader||this._forceUpload){jQuery.sap.byId(this.getId()+"-capture").fileupload("destroy")}};sap.ca.ui.AddPicture.prototype.onAfterRendering=function(){if(!window.FileReader||this._forceUpload){var e=this.getUploadUrl();if(e==null||e.length==0){jQuery.sap.log.error("AddPicture: The 'uploadUrl' property has not been set or is empty, and is required for this browser")}else{jQuery.sap.byId(this.getId()+"-capture").fileupload({url:e,add:jQuery.proxy(this._handleServerUpload,this),done:jQuery.proxy(this._handleServerUploadComplete,this),fail:jQuery.proxy(this._handleServerUploadFail,this)})}}else{var t=jQuery.sap.domById(this.getId()+"-capture");if(t){t.onchange=jQuery.proxy(this._handleClientUpload,this)}}var i=this.getPictures().length;if(t){t.visibility=i>=this.getMaxPictureNumber()}};sap.ca.ui.AddPicture.prototype.setText=function(e){this._oButton.setText(e);this.setProperty("text",e)};sap.ca.ui.AddPicture.prototype._getButton=function(){return this._oButton};sap.ca.ui.AddPicture.prototype._handleClientUpload=function(){var e=jQuery.sap.domById(this.getId()+"-capture");var t=e.files;var i=[];if(!t){jQuery.sap.log.error("HTML5 files property not supported on input element for this browser")}else{var r,a;for(r=0;a=t[r];r++){if(!a.type.match("image.*")){i.push(a.name);continue}this._readFile(a)}if(i.length>0){this.fireFileNotSupported({fileNames:i})}}};sap.ca.ui.AddPicture.prototype._handleServerUpload=function(e,t){try{this._enableUpload(false);t.submit()}catch(e){this._enableUpload(true);this.fireImageUploadFailed({reason:"Submit Error",response:t})}};sap.ca.ui.AddPicture.prototype._handleServerUploadComplete=function(e,t){this._enableUpload(true);var i=null;if(t!=null&&t.result!=null){var r=null;if(t.files!=null&&t.files.length===1){r=t.files[0].name}try{var a=t.result.find("pre");if(a.length===0){a=jQuery("pre",t.result)}var u=a.text();if(u!=null&&u.indexOf("data:image/")===0){this._createAndAddPictureItem(u,r)}else if(t.result.indexOf!=null&&t.result.indexOf("data:image/")===0){this._createAndAddPictureItem(t.result,r)}else if(t.result[0]!=null&&t.result[0].title!=null){i=t.result[0].title}}catch(e){jQuery.sap.log.error("Error while retrieving upload response from iframe");i="No response found"}}else{i="Invalid response"}if(i!=null){this.fireImageUploadFailed({reason:i,response:t})}};sap.ca.ui.AddPicture.prototype._handleServerUploadFail=function(e,t){this._enableUpload(true);this.fireImageUploadFailed({reason:"Upload Failed",response:t})};sap.ca.ui.AddPicture.prototype._readFile=function(e){this._createAndAddPictureItemFromFile(e)};sap.ca.ui.AddPicture.prototype._clickCaptureInput=function(e){var t=this.getPictures().length;if(t>=this.getMaxPictureNumber()){this.fireMaxPictureLimitReached({Limit:t})}else{jQuery.sap.domById(this.getId()+"-capture").click()}};sap.ca.ui.AddPicture.prototype._createAndAddPictureItem=function(e,t){var i=new sap.ca.ui.PictureItem({status:sap.ca.ui.PictureItem.STATUS.ADD,name:t,source:e});this.addPicture(i);this.firePictureAdded({pictureItem:i})};sap.ca.ui.AddPicture.prototype._createAndAddPictureItemFromFile=function(e){var t=new sap.ca.ui.PictureItem({status:sap.ca.ui.PictureItem.STATUS.ADD,name:e.name});var i=this;t.attachLoaded(function(){i.addPicture(t);i.firePictureAdded({pictureItem:t})});t.setFile(e,this._getConfig())};sap.ca.ui.AddPicture.prototype._getConfig=function(){var e=this.getCompression();var t={};switch(e){case"high":t={width:320,height:320,crop:sap.ui.getCore().isMobile(),quality:72};t.minWeight=50;break;case"low":default:if(jQuery.device.is.desktop){t={width:1024,height:1024,crop:false,quality:144}}else{t={width:800,height:800,crop:false,quality:144}}t.minWeight=150;break}return t};sap.ca.ui.AddPicture.prototype._pictureTapped=function(e){this.fireShow({pictureItem:e})};sap.ca.ui.AddPicture.prototype.ontouchstart=function(e){if(!jQuery.device.is.desktop&&e.target.id===this.getId()+"-capture"){this._oButton._activeButton()}};sap.ca.ui.AddPicture.prototype.ontouchend=function(e){if(!jQuery.device.is.desktop){this._oButton._inactiveButton()}};sap.ca.ui.AddPicture.prototype.ontouchcancel=function(e){if(!jQuery.device.is.desktop){this._oButton._inactiveButton()}};sap.ca.ui.AddPicture.prototype.ontap=function(e){if(!jQuery.device.is.desktop&&e.target.id===this.getId()+"-capture"){this._oButton.fireTap()}};sap.ca.ui.AddPicture.prototype._enableUpload=function(e){e=!!e;var t=jQuery.sap.domById(this.getId()+"-capture");if(t){t.style.width=e?"auto":"0px"}this._oButton.setEnabled(e)};
//# sourceMappingURL=AddPicture.js.map