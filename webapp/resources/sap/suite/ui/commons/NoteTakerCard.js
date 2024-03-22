/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/commons/library","sap/ui/ux3/library","sap/ui/commons/Link","sap/ui/commons/MessageBox","sap/ui/core/Control","sap/ui/core/format/DateFormat","sap/ui/ux3/OverlayContainer","sap/ui/commons/Button","sap/ui/core/ListItem","sap/ui/commons/layout/VerticalLayout","sap/ui/commons/layout/HorizontalLayout","sap/ui/layout/HorizontalLayout","sap/ui/core/HTML","sap/ui/commons/TextField","sap/ui/commons/InPlaceEdit","sap/ui/commons/Label","sap/ui/commons/ListBox","sap/ui/commons/TextArea","sap/base/security/encodeXML","sap/base/security/URLListValidator","./NoteTakerCardRenderer"],function(jQuery,t,e,a,o,r,s,n,i,l,d,u,y,p,C,T,_,h,g,v,m,c){"use strict";var O=r.extend("sap.suite.ui.commons.NoteTakerCard",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{header:{type:"string",group:"Misc",defaultValue:null},body:{type:"string",group:"Misc",defaultValue:null},timestamp:{type:"object",group:"Misc",defaultValue:new Date},tags:{type:"object",group:"Misc",defaultValue:[]},viewAllTrigger:{type:"int",group:"Misc",defaultValue:1800},uid:{type:"string",group:"Misc",defaultValue:null},isFiltered:{type:"boolean",group:"Misc",defaultValue:false},thumbUp:{type:"boolean",group:"Misc",defaultValue:null},thumbDown:{type:"boolean",group:"Misc",defaultValue:null},allTags:{type:"object",group:"Misc",defaultValue:[]},attachmentFilename:{type:"string",group:"Misc",defaultValue:null},attachmentUrl:{type:"string",group:"Misc",defaultValue:null}},events:{editNote:{parameters:{title:{type:"string"},body:{type:"string"},timestamp:{type:"string"},uid:{type:"string"},thumbUp:{type:"boolean"},thumbDown:{type:"boolean"},tags:{type:"object"}}},deleteNote:{parameters:{cardId:{type:"string"},title:{type:"string"},body:{type:"string"},timestamp:{type:"string"},uid:{type:"string"},thumbUp:{type:"boolean"},thumbDown:{type:"boolean"}}},attachmentClick:{parameters:{uid:{type:"string"},url:{type:"string"},filename:{type:"string"}}}}}});O.prototype.init=function(){this._rb=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var t=this;this._oEditButton=new i({id:this.getId()+"-edit-button",press:function(e){t._handleEdit()},tooltip:this._rb.getText("NOTETAKERCARD_BUTTON_OPEN_EDIT_TOOLTIP")});this._oEditButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton");this._oDeleteButton=new i({id:this.getId()+"-delete-button",tooltip:this._rb.getText("NOTETAKERCARD_BUTTON_DELETE_TOOLTIP"),press:function(){t._handleDelete()}});this._oDeleteButton.addStyleClass("sapSuiteUiCommonsNoteTakerCardDeleteButton");this._oViewAllLink=new a({id:this.getId()+"-viewAll-link",text:this._rb.getText("NOTETAKERCARD_LINK_VIEW_ALL_TEXT"),tooltip:this._rb.getText("NOTETAKERCARD_LINK_VIEW_ALL_TOOLTIP"),press:function(){t._openOverlay()}});this._oOverlayCard=new n(this.getId()+"-overlay",{openButtonVisible:false,close:function(e){t._handleOverlayCloseEvent(e.getSource());e.preventDefault()}});this._oOverlayCard.addDelegate({onAfterRendering:function(){var e=jQuery(document.getElementById(t.getId()+"-overlayTimestamp"));if(e){e.html(t.getFormattedTimestamp())}}});this._oOverlayCard._superOnsapselect=this._oOverlayCard.onsapselect;this._oOverlayCard.onsapselect=function(e){var a=e.srcControl.getId();if(a.indexOf("-overlayBody")<0&&a.indexOf("-inputTag")<0&&a.indexOf("-overlayCardTitle")<0){e.stopPropagation();e.preventDefault()}setTimeout(function(){t._oOverlayCard._superOnsapselect(e)},10)};this._oOverlayCard.addStyleClass("sapSuiteCommonsNoteTakerCardOverlayWindow");this._oOverlayCard._tagControls={}};O.prototype.exit=function(){this._oDeleteButton.destroy();this._oDeleteButton=null;this._oEditButton.destroy();this._oEditButton=null;this._oViewAllLink.destroy();this._oViewAllLink=null;this._oOverlayCard.destroy();this._oOverlayCard=null};O.prototype.getFormattedTimestamp=function(){var t=sap.ui.getCore().getConfiguration().getLocale();var e=s.getDateTimeInstance({style:"medium"},t);return e.format(this.getTimestamp())};O.prototype._handleOverlayCloseEvent=function(t){if(t.bEditMode){var e=this;o.show(this._rb.getText("NOTETAKERCARD_CONFIRMATION_CANCEL_EDIT_MESSAGE"),o.Icon.QUESTION,this._rb.getText("NOTETAKERCARD_CONFIRMATION_CANCEL_EDIT_TITLE"),[o.Action.YES,o.Action.NO],function(t){if(t===o.Action.YES){e._closeOverlay();e._oEditButton.focus()}else{if(e.getId()+"-overlayBody"?window.document.getElementById(e.getId()+"-overlayBody"):null){(e.getId()+"-overlayBody"?window.document.getElementById(e.getId()+"-overlayBody"):null).focus()}}},o.Action.NO)}else{this._closeOverlay()}};O.prototype._closeOverlay=function(){this._oOverlayCard.close();this._destroyTagControls();this._oOverlayCard.bEditMode=false;this._oOverlayCard.destroyContent()};O.prototype._openOverlay=function(t){var e;if(!this._oOverlayCard.isOpen()){this._oOverlayCard.bThumbUp=this.getThumbUp();this._oOverlayCard.bThumbDown=this.getThumbDown();this._prepareOverlayLayouts();this._prepareOverlayToolbar(t);this._prepareOverlayHeaderBtns(t);this._prepareOverlayBody();this._prepareOverlayButtons(t);if(t){e=this.getId()+"-overlayBody"}else{e=this.getId()+"-overlay-close"}this._oOverlayCard.open(e);jQuery(document.getElementById(this.getId()+"-overlay-thumb-down-button")).attr("aria-pressed",this.getThumbDown());jQuery(document.getElementById(this.getId()+"-overlay-thumb-up-button")).attr("aria-pressed",this.getThumbUp())}};O.prototype._getFormattedBody=function(){var t=[];var e=this.getBody();var a;do{a=e.search(/[\s<>]/);var o="",r="";if(a<0){r=e}else{r=e.slice(0,a);o=e.slice(a,a+1);e=e.slice(a+1)}switch(true){case this._isFullUrl(r):this.wrapFullUrl(t,r,o);break;case this._isShortUrl(r):this._wrapShortUrl(t,r,o);break;case this._isEmail(r):this._wrapEmail(t,r,o);break;default:t.push(v(r+o))}}while(a>=0);return t.join("")};O.prototype._isFullUrl=function(t){return/^(https?|ftp):\/\//i.test(t)&&m.validate(t)};O.prototype._isShortUrl=function(t){return/^(www\.)/i.test(t)&&m.validate("http://"+t)};O.prototype._isEmail=function(t){return/^[\w\.=-]+@[\w\.-]+\.[\w]{2,5}$/.test(t)};O.prototype.wrapFullUrl=function(t,e,a){t.push('<a class="sapUiLnk" ');t.push("href = "+'"'+v(e)+'"');t.push(' target = "_blank" rel="noopener noreferrer"');t.push(">");t.push(v(e));t.push("</a>"+a)};O.prototype._wrapShortUrl=function(t,e,a){t.push('<a class="sapUiLnk" ');t.push("href = "+'"'+v("http://"+e)+'"');t.push(' target = "_blank" rel="noopener noreferrer"');t.push(">");t.push(v(e));t.push("</a>"+a)};O.prototype._wrapEmail=function(t,e,a){t.push('<a class="sapUiLnk" ');t.push('href = "mailto:'+v(e)+'"');t.push(">");t.push(v(e));t.push("</a>"+a)};O.prototype._wrapBodyToDiv=function(t){return"<div class='sapSuiteUiCommonsNoteTakerCardBody'>"+t+"</div>"};O.prototype._wrapTagPanelToDiv=function(t,e){if(e){return"<div class='suiteUiNtcOverlayTagPanelEditMode'>"+t+"</div>"}else{return"<div class='suiteUiNtcOverlayTagPanelViewMode'>"+t+"</div>"}};O.prototype._handleEdit=function(){this._openOverlay(true)};O.prototype._getFormattedTags=function(){var t=[];var e;if(this._oOverlayCard.isOpen()){e=this._oOverlayCard._selectedTags}else{e=this.getTags()}t.push("<div id='"+this.getId()+"-tag-list' class='sapSuiteUiCommonsNoteTakerCardTagList'>");if(e.length===0){t.push(this._rb.getText("NOTETAKERCARD_LABEL_TAGS_EMPTY"))}else{t.push(this._rb.getText("NOTETAKERCARD_LABEL_TAGS_FULL")+": ");var a=v(e.sort().join(" "));t.push("<span title='"+a+"'>");t.push(a);t.push("</span>")}t.push("</div>");return t.join("")};O.prototype._handleDelete=function(t){var e=this;o.show(this._rb.getText("NOTETAKERCARD_CONFIRMATION_DELETE_MESSAGE"),o.Icon.QUESTION,this._rb.getText("NOTETAKERCARD_CONFIRMATION_DELETE_TITLE"),[o.Action.YES,o.Action.NO],function(a){if(a===o.Action.YES){if(t){e._closeOverlay()}e._handleDeleteClick()}},o.Action.NO)};O.prototype._handleDeleteClick=function(){var t={};t.uid=this.getUid();t.cardId=this.getId();t.title=this.getHeader();t.timestamp=this.getTimestamp();t.body=this.getBody();t.thumbUp=this.getThumbUp();t.thumbDown=this.getThumbDown();this.fireDeleteNote(t)};O.prototype.setUid=function(t){this.setProperty("uid",t,true);return this};O.prototype._wrapThumbToDiv=function(t){var e=null;var a=null;if(this.getThumbUp()&&!this.getThumbDown()){e="sapSuiteUiCommonsNoteTakerCardThumbUp";a=this._rb.getText("NOTETAKERCARD_ICON_THUMB_UP_TOOLTIP");this._oOverlayCard.removeStyleClass("suiteUiNtcNegativeCard");this._oOverlayCard.addStyleClass("suiteUiNtcPositiveCard")}else if(!this.getThumbUp()&&this.getThumbDown()){e="sapSuiteUiCommonsNoteTakerCardThumbDown";a=this._rb.getText("NOTETAKERCARD_ICON_THUMB_DOWN_TOOLTIP");this._oOverlayCard.removeStyleClass("suiteUiNtcPositiveCard");this._oOverlayCard.addStyleClass("suiteUiNtcNegativeCard")}else{this._oOverlayCard.removeStyleClass("suiteUiNtcPositiveCard");this._oOverlayCard.removeStyleClass("suiteUiNtcNegativeCard")}var o=[];o.push("<div");if(t){o.push(" id='");o.push(t);o.push("'")}if(e){o.push(" class='");o.push(e);o.push("'");o.push(" title='");o.push(a);o.push("'")}o.push("></div>");return o.join("")};O.prototype._handleAddTag=function(t){this._oOverlayCard._selectedTags=[];var e=t.split(new RegExp("\\s+"));var a={};for(var o=0;o<e.length;o++){if(e[o].length!==0){a[e[o]]=0}}for(var r in a){this._oOverlayCard._selectedTags.push(r)}var s=sap.ui.getCore().byId(this.getId()+"-overlayTagPanel");s.setContent(this._wrapTagPanelToDiv(this._getFormattedTags(),true));this._adjustTagButton()};O.prototype._adjustTagButton=function(){var t=this._oOverlayCard._tagControls.tagButton;if(this._oOverlayCard._selectedTags.length){t.addStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected")}else{t.removeStyleClass("sapSuiteUiCommonsNoteTakerFeederButtonSelected")}};O.prototype._toggleTagPopup=function(){var t=this._oOverlayCard._selectedTags;if(this._bTagPopupOpen){jQuery(document.getElementById(this.getId()+"-selectTag-panel")).slideToggle();this._focusDefaultControl();this._bTagPopupOpen=false}else{this._addTagsToListBox(this.getAllTags());jQuery(document.getElementById(this.getId()+"-selectTag-panel")).slideToggle();jQuery(document.getElementById(this.getId()+"-inputTag")).val(t.length===0?"":t.join(" ")+" ");this._oOverlayCard._tagControls.tagInput.focus();this._bTagPopupOpen=true}};O.prototype._focusDefaultControl=function(){this._oOverlayCard._tagControls.tagButton.focus()};O.prototype._handleTagInputLive=function(t){var e=t.getParameter("liveValue");var a=e.split(" ");var o=a[a.length-1];this._filterListBox(o)};O.prototype._filterListBox=function(t){if(t.length===0){this._addTagsToListBox(this.getAllTags());return}var e=jQuery.grep(this.getAllTags(),function(e){if(e.indexOf(t)>=0){return true}});this._addTagsToListBox(e)};O.prototype._addTagsToListBox=function(t){var e=jQuery.map(t,function(t,e){return new l({text:t})});this._oOverlayCard._tagControls.tagList.setItems(e,true);this._oOverlayCard._tagControls.tagList.rerender()};O.prototype._handleListSelect=function(t){var e=t.getParameter("selectedItem").getText();var a=this._oOverlayCard._tagControls.tagInput;var o=a.getValue();var r=o.split(" ");r.pop();if(r.length===0){a.setValue(e+" ")}else{a.setValue(r.join(" ")+" "+e+" ")}this._oOverlayCard._tagControls.tagList.setSelectedIndex(-1);a.focus()};O.prototype._destroyTagControls=function(){var t=this._oOverlayCard._tagControls;for(var e in t){t[e].destroy()}this._oOverlayCard._tagControls={}};O.prototype._createTagSelectorControl=function(){var t=this._oOverlayCard._tagControls;var e=new d({id:this.getId()+"-selectTag-panel"});e.addStyleClass("sapSuiteUiCommonsNoteTakerFeederSelectTagPanel");e.addStyleClass("sapUiShd");t.tagSelectorLayout=e;e.addContent(new p(this.getId()+"-selectTag-arrow",{content:"<div class='sapSuiteUiCommonsNoteTakerFeederSelectTagArrow' ></div>"}));e.addContent(new p(this.getId()+"-selectTag-header",{content:["<div class='sapSuiteUiCommonsNoteTakerFeederSelectTagHeader' >",this._rb.getText("NOTETAKERFEEDER_TOOLPOPUP_TITLE"),"</div>"].join("")}));e.addContent(t.tagInput);e.addContent(t.tagList);var a=new u;a.addStyleClass("sapSuiteUiCommonsNoteTakerFeederSelectTagButtons");a.addContent(t.tagApplyBtn);a.addContent(t.tagCancelBtn);e.addContent(a);return e};O.prototype._prepareAttachmentPanel=function(t){var e=t?"-overlay":"";var o=t?"Overlay":"";var r=[this.getId(),e,"-attachmentPanel"].join("");var s=sap.ui.getCore().byId(r);if(s){s.destroy()}var n=new u(r);n.addStyleClass(["suiteUiNtc",o,"AttachmentPanel"].join(""));n.addContent(new p({content:"<div class='suiteUiNtcAttachmentIcon'></div>"}));var i=new a({id:[this.getId(),e,"-attachmentLink"].join(""),text:this.getAttachmentFilename(),tooltip:this._rb.getText("NOTETAKERCARD_LINK_ATTACHMENT_TOOLTIP"),press:this._handleAttachmentDownload,href:this.getAttachmentUrl()});i._ntc=this;n.addContent(i);return n};O.prototype._prepareOverlayLayouts=function(){var t=new d;var e=new d;e.addStyleClass("sapSuiteUiCommonsNtcOverlayTitle");var a=new u;a.addStyleClass("sapSuiteUiCommonsNtcHeaderButtons");var o=new u(this.getId()+"-overlayHeader",{content:[e,a]});o.addStyleClass("sapSuiteUiCommonsNtcOverlayHeader");t.addContent(o);var r=new u(this.getId()+"-overlayToolbar");r.addStyleClass("suiteUiNtcToolbar");var s=new u;s.addStyleClass("suiteUiNtcOverlayToolbarLeftPanel");var n=new u;n.addStyleClass("suiteUiNtcOverlayToolbarRightPanel");r.addContent(s);r.addContent(n);t.addContent(r);this._oOverlayCard.addContent(t);var i=new y;i.addStyleClass("sapSuiteUiCommonsNoteTakerCardContent");var l=new u(this.getId()+"-buttons");l.addStyleClass("sapSuiteUiCommonsNoteTakerCardOverlayButtonPanel");this._oOverlayCard.layouts={topSection:t,headerLeft:e,headerRight:a,toolbar:r,toolbarLeft:s,toolbarRight:n,body:i,buttons:l}};O.prototype._prepareOverlayHeaderBtns=function(t){var e=this;var a=new i(this.getId()+"-editButton",{tooltip:this._rb.getText("NOTETAKERCARD_BUTTON_EDIT_TOOLTIP"),press:function(){e._fnEdit()}});e._oOverlayCard.layouts.headerRight.addContent(a,0);if(t){a.setEnabled(false);a.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButtonDsbl")}else{a.setEnabled(true);a.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton")}var o=new i(this.getId()+"-deleteButton",{tooltip:this._rb.getText("NOTETAKERCARD_BUTTON_DELETE_TOOLTIP"),press:function(){e._handleDelete(true)}});o.addStyleClass("sapSuiteUiCommonsNoteTakerCardDeleteButton");e._oOverlayCard.layouts.headerRight.addContent(o,1);var r=new _(this.getId()+"-overlayTimestamp",{text:e.getFormattedTimestamp()});r.addStyleClass("sapSuiteUiCommonsNoteTakerCardTimestamp");e._oOverlayCard.layouts.headerLeft.addContent(r,1)};O.prototype._prepareOverlayToolbar=function(t){this._oOverlayCard._selectedTags=this.getTags();if(this.getAttachmentFilename()!==""){var e=this._prepareAttachmentPanel(true);this._oOverlayCard.layouts.topSection.addContent(e);this._oOverlayCard.layouts.body.addStyleClass("suiteUiNtcOverlayWithAttachment")}else{this._oOverlayCard.layouts.body.addStyleClass("suiteUiNtcOverlayWithoutAttachment")}};O.prototype._prepareOverlayBody=function(){this._oOverlayCard.addContent(this._oOverlayCard.layouts.body)};O.prototype._prepareOverlayButtons=function(t){var e=this;var a=new i(this.getId()+"-closeButton",{text:this._rb.getText("NOTETAKERCARD_BUTTON_CLOSE_OVERLAY"),tooltip:this._rb.getText("NOTETAKERCARD_BUTTON_CLOSE_OVERLAY_TOOLTIP"),press:function(){e._handleOverlayCloseEvent(e._oOverlayCard)}});a.addStyleClass("sapSuiteUiCommonsNoteTakerCardOverlayButtonClose");var o=new i(this.getId()+"-saveButton",{text:this._rb.getText("NOTETAKERCARD_BUTTON_SAVE_TEXT"),tooltip:this._rb.getText("NOTETAKERCARD_BUTTON_SAVE_TOOLTIP"),press:function(){e._fnSave()}});o.addStyleClass("sapSuiteUiCommonsNoteTakerCardOverlayButtonSave");e._oOverlayCard.layouts.buttons.addContent(a,0);e._oOverlayCard.layouts.buttons.addContent(o,1);if(t){o.setEnabled(true);this._fnCreateInEditMode()}else{o.setEnabled(false);this._fnCreateInViewMode()}this._oOverlayCard.addContent(this._oOverlayCard.layouts.buttons)};O.prototype._fnCreateInViewMode=function(){var t=this;t._oOverlayCard.bEditMode=false;var e=new _(t.getId()+"-overlayCardHeader",{text:t.getHeader()});e.addStyleClass("sapSuiteUiCommonsNoteTakerCardTitle");t._oOverlayCard.layouts.headerLeft.insertContent(e,0);var a=new p(t.getId()+"-overlayTagPanel");a.setContent(t._wrapTagPanelToDiv(t._getFormattedTags(),t._oOverlayCard.bEditMode));t._oOverlayCard.layouts.toolbarLeft.addContent(a);var o=new p({id:t.getId()+"-overlay-thumb",content:t._wrapThumbToDiv()});t._oOverlayCard.layouts.toolbarRight.addContent(o);var r=new p(t.getId()+"-overlayBody");r.setContent(t._wrapBodyToDiv(t._getFormattedBody()));r.addStyleClass("sapSuiteUiCommonsNoteTakerCardBody");t._oOverlayCard.layouts.body.addContent(r);var s=t._oOverlayCard.layouts.buttons.getContent()[1];s.setEnabled(false);var n=t._oOverlayCard.layouts.headerRight.getContent()[0];n.setEnabled(true);n.removeStyleClass("sapSuiteUiCommonsNoteTakerCardEditButtonDsbl");n.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton")};O.prototype._fnCreateInEditMode=function(){var e=this;e._oOverlayCard.bEditMode=true;var a=new C(e.getId()+"-overlayCardTitle",{maxLength:50});a.setValue(e.getHeader());a.addStyleClass("sapSuiteUiCommonsNoteTakerCardTitle");var o=new T(e.getId()+"-overlayCardTitleEdit",{content:a,tooltip:e._rb.getText("NOTETAKERCARD_EDITFIELD_TITLE_TOOLTIP"),design:t.TextViewDesign.H2,undoEnabled:false});o.addStyleClass("sapSuiteUiCommonsNtcdTitleEdit");e._oOverlayCard.layouts.headerLeft.insertContent(o,0);var r=new p(e.getId()+"-overlayTagPanel");r.setContent(e._wrapTagPanelToDiv(e._getFormattedTags(),e._oOverlayCard.bEditMode));e._oOverlayCard.layouts.toolbarLeft.addContent(r);var s=new i({id:e.getId()+"-tag-button",tooltip:e._rb.getText("NOTETAKERCARD_BUTTON_TAG_TOOLTIP"),press:function(){e._toggleTagPopup()}});s.addStyleClass("sapSuiteUiCommonsNoteTakerFeederTagButton");var n=new h({id:e.getId()+"-tagListBox",visibleItems:10,width:"100%",height:"194px",select:function(t){e._handleListSelect(t)}});var l=new C({id:e.getId()+"-inputTag",liveChange:function(t){e._handleTagInputLive(t)}});l.onsapdown=function(t){t.preventDefault();t.stopPropagation();jQuery("#"+e.getId()+"-tagListBox li:eq(0)").focus()};var d=new i({id:e.getId()+"-cancel-tags-button",text:e._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS"),tooltip:e._rb.getText("NOTETAKERFEEDER_BUTTON_CANCEL_TAGS_TOOLTIP"),press:function(){e._toggleTagPopup()}});d.addStyleClass("sapSuiteUiCommonsNoteTakerFeederCancelTagButton");var u=new i({id:e.getId()+"-add-tags-button",text:e._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TAGS"),tooltip:e._rb.getText("NOTETAKERFEEDER_BUTTON_ADD_TAGS_TOOLTIP"),press:function(){e._handleAddTag(l.getValue());s.rerender();e._toggleTagPopup()}});e._oOverlayCard._tagControls={tagButton:s,tagList:n,tagInput:l,tagCancelBtn:d,tagApplyBtn:u};e._oOverlayCard.addContent(e._createTagSelectorControl());var y=new i({id:e.getId()+"-overlay-thumb-up-button",press:function(t){e._oOverlayCard.bThumbUp=!e._oOverlayCard.bThumbUp;if(e._oOverlayCard.bThumbUp){e._oOverlayCard.bThumbDown=false}m()},tooltip:e._rb.getText("NOTETAKERFEEDER_BUTTON_THUMB_UP_TOOLTIP")});y.addStyleClass("sapSuiteUiCommonsNoteTakerThumbUpBtn");var v=new i({id:e.getId()+"-overlay-thumb-down-button",press:function(t){e._oOverlayCard.bThumbDown=!e._oOverlayCard.bThumbDown;if(e._oOverlayCard.bThumbDown){e._oOverlayCard.bThumbUp=false}m()},tooltip:e._rb.getText("NOTETAKERFEEDER_BUTTON_THUMB_DOWN_TOOLTIP")});v.addStyleClass("sapSuiteUiCommonsNoteTakerThumbDownBtn");function m(){if(e._oOverlayCard.bThumbUp){y.addStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");e._oOverlayCard.addStyleClass("suiteUiNtcPositiveCard")}else{y.removeStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");e._oOverlayCard.removeStyleClass("suiteUiNtcPositiveCard")}if(e._oOverlayCard.bThumbDown){v.addStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");e._oOverlayCard.addStyleClass("suiteUiNtcNegativeCard")}else{v.removeStyleClass("sapSuiteUiCommonsNoteTakerCardSelectedBtn");e._oOverlayCard.removeStyleClass("suiteUiNtcNegativeCard")}jQuery(document.getElementById(y.getId())).attr("aria-pressed",e._oOverlayCard.bThumbUp);jQuery(document.getElementById(v.getId())).attr("aria-pressed",e._oOverlayCard.bThumbDown)}m();e._oOverlayCard.layouts.toolbarLeft.insertContent(s,0);e._oOverlayCard.layouts.toolbarRight.addContent(y);e._oOverlayCard.layouts.toolbarRight.addContent(v);var c=e._oOverlayCard.layouts.buttons.getContent()[1];c.setEnabled(true);var O=new g(e.getId()+"-overlayBody",{required:true,liveChange:function(t){var e=t.getParameter("liveValue");var a=e!==null&&!/^\s*$/.test(e);if(a!==c.getEnabled()){c.setEnabled(a)}}});O.setValue(e.getBody());O.addStyleClass("sapSuiteUiCommonsNoteTakerCardBody");e._oOverlayCard.layouts.body.addContent(O);e._oOverlayCard.layouts.body.addContent(new _({required:true}).addStyleClass("sapSuiteRequiredLbl"));var b=e._oOverlayCard.layouts.headerRight.getContent()[0];b.setEnabled(false);b.removeStyleClass("sapSuiteUiCommonsNoteTakerCardEditButton");b.addStyleClass("sapSuiteUiCommonsNoteTakerCardEditButtonDsbl")};O.prototype._fnSave=function(){var t=this;var e=t._oOverlayCard.layouts.headerLeft.getContent()[0];var a=e.getContent();var o=t._oOverlayCard.layouts.body.getContent()[0];if(o.getValue()){if(!this.getBinding("body")){t.setHeader(a.getValue());t.setBody(o.getValue());t.setTimestamp(new Date);t.setThumbUp(t._oOverlayCard.bThumbUp);t.setThumbDown(t._oOverlayCard.bThumbDown);t.setTags(t._oOverlayCard._selectedTags)}var r={};r.uid=t.getUid();r.title=a.getValue();r.body=o.getValue();r.timestamp=new Date;r.thumbUp=t._oOverlayCard.bThumbUp;r.thumbDown=t._oOverlayCard.bThumbDown;r.tags=t._oOverlayCard._selectedTags;t.fireEditNote(r);t._oOverlayCard.layouts.headerLeft.removeContent(e);e.destroy();a.destroy();t._oOverlayCard.layouts.body.removeAllContent();o.destroy();t._destroyTagControls();t._oOverlayCard.layouts.toolbarLeft.destroyContent();t._oOverlayCard.layouts.toolbarRight.destroyContent();t._fnCreateInViewMode();jQuery(document.getElementById(t.getId()+"-overlayTimestamp")).html(t.getFormattedTimestamp());jQuery(document.getElementById(t.getId()+"-overlay-close")).focus()}};O.prototype._fnEdit=function(){var t=this;var e=t._oOverlayCard.layouts.headerLeft.getContent()[0];var a=t._oOverlayCard.layouts.body.getContent()[0];t._oOverlayCard.layouts.topSection.removeContent(e);e.destroy();t._oOverlayCard.layouts.body.removeContent(a);a.destroy();t._oOverlayCard.layouts.toolbarLeft.destroyContent();t._oOverlayCard.layouts.toolbarRight.destroyContent();t._fnCreateInEditMode();t._oOverlayCard.layouts.topSection.rerender();t._oOverlayCard.layouts.body.rerender();if(t.getId()+"-overlayBody"?window.document.getElementById(t.getId()+"-overlayBody"):null){(t.getId()+"-overlayBody"?window.document.getElementById(t.getId()+"-overlayBody"):null).focus()}};O.prototype._handleAttachmentDownload=function(){var t={};t.uid=this._ntc.getUid();t.url=this._ntc.getAttachmentUrl();t.filename=this._ntc.getAttachmentFilename();this._ntc.fireAttachmentClick(t)};return O});
//# sourceMappingURL=NoteTakerCard.js.map