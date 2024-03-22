/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/base/Log","sap/ui/commons/Carousel","sap/zen/dsh/utils/BaseHandler"],function(jQuery,e,t,i){"use strict";t.extend("com.sap.ip.bi.FragmentGallery",{initDesignStudio:function(){this.setAnimationDuration(100)},previousContentLength:{},renderer:{},orientations:{HORIZONTAL:"horizontal",VERTICAL:"vertical"},mode:{IMAGE:"image",TEXT:"text",IMAGETEXT:"imagetext"},afterDesignStudioUpdate:function(){var e=this.getItemSize();if(this.orientation===this.orientations.HORIZONTAL){this.removeStyleClass("zenFragmentGallery-Vertical");this.addStyleClass("zenFragmentGallery-Horizontal");if(e!==undefined){this.setDefaultItemWidth(e)}}else{this.removeStyleClass("zenFragmentGallery-Horizontal");this.addStyleClass("zenFragmentGallery-Vertical");if(e!==undefined){this.setDefaultItemHeight(e)}}this.setOrientation(this.orientation);this.addStyleClass("zenFragmentGallery");var t=this.items;if(!t||t.length===0){this.destroyContent();var i=this.createItem("","","");this.addContent(i);this.setProperty("firstVisibleIndex",0);this.previousContentLength=JSON.parse(t).length}else{this.destroyContent();var s=JSON.parse(t);this.createItemContent(s,this.oControlProperties.dragDrop);this.refreshSelection();if(this.previousContentLength>JSON.parse(t).length&&this.getFirstVisibleIndex()>0){var n=this.previousContentLength-JSON.parse(t).length;if(n>0){this.setProperty("firstVisibleIndex",this.getFirstVisibleIndex()-n)}else{this.setProperty("firstVisibleIndex",0)}}this.previousContentLength=JSON.parse(t).length;return this}this.refreshSelection()},refreshSelection:function(){var e=this.getContent();for(var t=0;t<e.length;t++){var i=e[t];if(i.zenKey===this.selectedId){i.zenSelected=true}else{i.zenSelected=false}if(i.getDomRef()!=null){if(i.zenSelected){jQuery(i.getDomRef().parentElement).addClass("selectedItem")}else{jQuery(i.getDomRef().parentElement).removeClass("selectedItem")}}}},createItemContent:function(e,t){var s=this.getGalleryMode().toLowerCase();if(this.orientation===this.orientations.HORIZONTAL){this.removeStyleClass("zenFragmentGallery-Vertical");this.addStyleClass("zenFragmentGallery-Horizontal")}else{this.removeStyleClass("zenFragmentGallery-Horizontal");this.addStyleClass("zenFragmentGallery-Vertical")}for(var n=0;n<e.length;n++){var r;if(s===this.mode.IMAGE){r=this.createItem(e[n].key,e[n].text,e[n].image,"")}else if(s===this.mode.TEXT||s===this.mode.IMAGETEXT){r=this.createItem(e[n].key,e[n].text,e[n].image,e[n].description)}if(t){var a=new i.dispatcher.dragArea(r,"",{bmid:e[n].key,title:e[n].text},null,null,null,null,null,null);i.dispatcher.dragHandlerInstance.registerDragArea(a)}this.addContent(r)}},createImage:function(e,t,i,s,n){if(i===""||i.indexOf("/aad/")===0||i.indexOf("http")===0){}else{i=this.ImagePrefix+i}s.src=i;s.alt=t;if(n!=null&&n.length>0){s.tooltip=n}else{s.tooltip=t}var r=new sap.ui.commons.Image(s);r.addStyleClass("zenFragmentGallery-Image-thumb");r.addDelegate({onAfterRendering:function(e){jQuery(e.srcControl.getFocusDomRef()).attr("draggable","false")}});r.zenKey=e;return r},createText:function(e,t,i,s){var n=new sap.ui.commons.TextView(this.sId+"txt-"+e,{text:t,width:"100%",height:"100%",wrapping:true,enabled:true,visible:true,textAlign:sap.ui.core.TextAlign.Center,tooltip:s});n.zenKey=e;return n},createItem:function(e,t,i,s){var n=this;var r=n.items;if(r){var a=JSON.parse(r);if(a.length>0&&a[0].key==="ZEN_BLANK"){a.splice(0,1);this.setItems(JSON.stringify(a))}}var l=this.getGalleryMode().toLowerCase();var o;if(l===this.mode.IMAGE){o=t}else{o=s}var h=new sap.zen.commons.layout.AbsoluteLayout(this.sId+"ly-"+e,{width:"100%",height:"100%",tooltip:o}).attachBrowserEvent("click",function(){n.setSelectedId(e);n.fireDesignStudioPropertiesChanged(["selectedId"]);n.fireDesignStudioEvent("onSelectionChange")});var d,g;if(l===this.mode.IMAGE){d=this.createImage(e,t,i,{width:"80%",height:"80%"},"");if(d!=null){h.addContent(d);h.zenImage=d;h.addStyleClass("zenFragmentGallery-Image")}}else if(l===this.mode.TEXT){g=this.createText(e,t,i,s);if(g!=null){h.addStyleClass("zenFragmentGallery-Txt");h.addContent(g,{})}}else if(l===this.mode.IMAGETEXT){h.addStyleClass("zenFragmentGallery-ImgTxt");var m=new sap.zen.commons.layout.AbsoluteLayout(this.sId+"image"+e,{width:"50%",height:"100%"});var f=new sap.zen.commons.layout.AbsoluteLayout(this.sId+"text"+e,{width:"50%",height:"100%"});d=this.createImage(e,t,i,{width:"50%",height:"50%"},s);g=this.createText(e,t,i,s);m.addContent(d,{top:"25%",left:"25%"});f.addContent(g);var u=new sap.ui.commons.Image({src:"zen.rt.components.ui5/fragmentgallery/images/delete/delete_normal.svg",visible:true});h.attachBrowserEvent("mouseenter",function(){u.setVisible(true)}).attachBrowserEvent("mouseleave",function(){u.setVisible(false)});u.attachBrowserEvent("mouseenter",function(){u.setVisible(true);u.setSrc("zen.rt.components.ui5/fragmentgallery/images/delete/delete_hover.svg")});u.attachBrowserEvent("mouseleave",function(){u.setSrc("zen.rt.components.ui5/fragmentgallery/images/delete/delete_normal.svg")});u.attachPress(function(){n.setSelectedId(e);n.fireDesignStudioPropertiesChanged(["selectedId"]);n.fireDesignStudioEvent("onDeletion")});h.addContent(m,{left:"0px"}).addContent(f,{right:"0px"});if(e!==""&&this.oControlProperties.deletionAllowed){f.addContent(u,{right:"0px"});u.setVisible(false)}h.zenImage=d}h.onAfterRendering=function(){if(h.zenSelected){jQuery(h.getDomRef().parentElement).addClass("selectedItem")}else{jQuery(h.getDomRef().parentElement).removeClass("selectedItem")}};h.layoutID=this.sId+"ly-"+e;h.zenKey=e;h.zenText=t;h.zenURL=i;return h},createImageLayout:function(e){var t=this;if(e!=null){var i=new sap.zen.commons.layout.AbsoluteLayout(this.sId+"ly-"+e.key,{width:"45%"}).attachBrowserEvent("click",function(){t.setSelectedId(e.key);t.fireDesignStudioPropertiesChanged(["selectedId"]);t.fireDesignStudioEvent("onSelectionChange")});var s=this.createImage(e.key,e.text,e.image,{width:"100%",height:"100%"},"");i.addContent(s);i.addStyleClass("hover");i.onAfterRendering=function(){if(i.zenSelected){jQuery(i.getDomRef().parentElement).addClass("selectedItem")}else{jQuery(i.getDomRef().parentElement).removeClass("selectedItem")}};i.zenKey=e.key;i.zenText=e.text;return i}},setGalleryMode:function(e){e=e.toLowerCase();if(e===""){e=this.mode.IMAGE}if(this.galleryMode!==e){this.galleryMode=e}},setItems:function(e){if(this.items===e){return}else{this.items=e}},getItems:function(){return this.items},removeItem:function(e){if(this.itemKeyExists(e)){var t=this.items;var i=JSON.parse(t);for(var s=0;s<i.length;s++){if(i[s].key===e){this.setDeletionKey(i[s].key)}}this.setItems(JSON.stringify(i));this.fireDesignStudioPropertiesChanged(["deletionKey"])}},itemKeyExists:function(e){if(this.items!==undefined){var t=JSON.parse(this.items);for(var i=0;i<t.length;i++){if(t[i].key===e){return true}}}return false},getGalleryMode:function(){return this.galleryMode.toLowerCase()},getItemSize:function(){return this.itemSize},setItemSize:function(e){this.itemSize=e},setImageUrl:function(e){this.ImageUrl=e;this.ImagePrefix=this.ImageUrl.substring(0,this.ImageUrl.indexOf("DUMMY.PNG"))},getImageUrl:function(){return this.ImageUrl},setGalleryOrientation:function(e){if(!e){e=this.orientations.HORIZONTAL}this.orientation=e},getGalleryOrientation:function(){return this.orientation},setSelectedId:function(e){if(e){this.selectedId=e}},getSelectedId:function(){return this.selectedId},selectedIdExists:function(e){var t=this;var i=t.getContent();for(var s=0;s<i.length;s++){if(i[s].zenKey===e){return true}}return false},setDeletionKey:function(e){if(e==null){e=""}this.deletionKey=e},getDeletionKey:function(){if(this.deletionKey==null||this.deletionKey===undefined){return""}return this.deletionKey},updateLastItemStyle:function(){var t={};var i=jQuery(document.getElementById(this.sId+"-contentarea"));var s=jQuery(document.getElementById(this.sId+"-scrolllist"));var n=10;var r,a,l;if(this.orientation===this.orientations.HORIZONTAL){for(r=0;r<this.getContent().length;r++){var o;try{o=this.getContent()[r].getWidth();if(o.substr(-1)==="%"){o=this.getItemSize()}}catch(t){e.error(t);o=this.getItemSize()}}var h=Math.max(0,parseInt(o,n));var d=Math.floor(this.getDomRef().clientWidth);a=d-this.getHandleSize()*2-1;l=this.getVisibleItems();if(l===0){l=Math.floor(a/h)}var g=i.width();var m=this._iMaxWidth*l+l*n;if(m+n>g){if(this.getFirstVisibleIndex()===0){t["margin-left"]=0}else{t["margin-left"]=-(m+n-g)}}}else{for(r=0;r<this.getContent().length;r++){var f;try{f=this.getContent()[r].getHeight();if(f.substr(-1)==="%"){f=this.getItemSize()}}catch(t){e.error(t);f=this.getItemSize()}}var u=Math.max(0,parseInt(f,n));var c=Math.floor(this.getDomRef().clientHeight);a=c-this.getHandleSize()*2-1;l=this.getVisibleItems();if(l===0){l=Math.floor(a/u)}this._iMaxHeight=a/l;var I=i.height();var v=this._iMaxHeight*l+l*n;if(v+10>I){if(this.getFirstVisibleIndex()===0){t["margin-top"]=0}else{t["margin-top"]=-(v+n-I)}}}s.animate(t,this.getAnimationDuration())},showPrevious:function(){if(this.getFirstVisibleIndex()>0&&this.getContent()[this.getFirstVisibleIndex()]!==this.getContent()[0]){var e={};e[this._sAnimationAttribute]=0;var t=jQuery.sap.byId(this.getId()+"-scrolllist");if(t.children("li").length<2){return}t.stop(true,true);t.css(this._sAnimationAttribute,-this._iMaxWidth);var i=t.children("li:last");var s=t.children("li:first");this._showAllItems();i.insertBefore(s);t.append(i.sapExtendedClone(true));var n=this;t.children("li:last").remove();n.setProperty("firstVisibleIndex",n._getContentIndex(t.children("li:first").attr("id")),true);n._hideInvisibleItems();t.animate(e,this.getAnimationDuration())}},showNext:function(){var t=10;var i={};var s,n;if(this.orientation===this.orientations.HORIZONTAL){i=this.getDomRef().clientWidth;for(n=0;n<this.getContent().length;n++){try{s=this.getContent()[n].getWidth();if(s.substr(-1)==="%"){s=this.getItemSize()}}catch(t){e.error(t);s=this.getItemSize()}}}else if(this.orientation===this.orientations.VERTICAL){i=this.getDomRef().clientHeight;for(n=0;n<this.getContent().length;n++){try{s=this.getContent()[n].getHeight();if(s.substr(-1)==="%"){s=this.getItemSize()}}catch(t){e.error(t);s=this.getItemSize()}}}var r=Math.max(0,parseInt(s,t));var a=i-this.getHandleSize()*2-1;var l=this.getVisibleItems();if(l===0){l=Math.floor(a/r)}if(this.getFirstVisibleIndex()+l<this.getContent().length){var o={};o[this._sAnimationAttribute]=-this._iMaxWidth;var h=jQuery.sap.byId(this.getId()+"-scrolllist");h.stop(true,true);var d=this._sAnimationAttribute;var g=h.children("li:first");var m=this;this._showAllItems();g.appendTo(h);g.sapExtendedClone(true).insertBefore(h.children("li:first"));h.animate(o,this.getAnimationDuration(),function(){h.children("li:first").remove();jQuery(this).css(d,"0px");m.setProperty("firstVisibleIndex",m._getContentIndex(h.children("li:first").attr("id")),true);m._hideInvisibleItems()})}else{this.updateLastItemStyle()}}})});
//# sourceMappingURL=fragmentgallery.js.map