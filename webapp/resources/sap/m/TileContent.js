/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/library","sap/ui/core/Control","./TileContentRenderer","sap/ui/core/Configuration"],function(t,e,i,r,n){"use strict";var a=t.Priority;var s=t.LoadState;var o=t.GenericTileMode;var l=i.extend("sap.m.TileContent",{metadata:{library:"sap.m",properties:{footer:{type:"string",group:"Appearance",defaultValue:null},footerColor:{type:"sap.m.ValueColor",group:"Appearance",defaultValue:"Neutral"},size:{type:"sap.m.Size",group:"Appearance",defaultValue:"Auto",deprecated:true},unit:{type:"string",group:"Data",defaultValue:null},disabled:{type:"boolean",group:"Behavior",defaultValue:false},frameType:{type:"sap.m.FrameType",group:"Appearance",defaultValue:"Auto"},priority:{type:"sap.m.Priority",group:"Misc",defaultValue:a.None},priorityText:{type:"string",group:"Misc",defaultValue:null},state:{type:"sap.m.LoadState",group:"Misc",defaultValue:s.Loaded}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:false,bindable:"bindable"}}},renderer:r});l.prototype.init=function(){this._bRenderFooter=true;this._bRenderContent=true;this._bStateSetManually=false};l.prototype.onBeforeRendering=function(){var t=this.mProperties.hasOwnProperty("state");if(t&&!this._bStateSetManually){if(this.getParent()&&this.getParent().isA("sap.m.GenericTile")){if(this.getParent().getState()===s.Failed){this.setState(s.Loaded)}else if(this.getParent().getState()===s.Disabled){this.setState(s.Loaded);this.setDisabled(this.getState()===s.Disabled)}}}else{if(this.getParent()&&this.getParent().isA("sap.m.GenericTile")){if(this.getParent().getState()===s.Failed){this.setState(s.Loaded)}else if(this.getParent().getState()===s.Disabled){this.setState(s.Loaded);this.setDisabled(this.getState()===s.Disabled)}else{this.setState(this.getParent().getState())}}this._bStateSetManually=true}if(this.getContent()&&this._oDelegate){if(this.getDisabled()){this.getContent().addDelegate(this._oDelegate)}else{this.getContent().removeDelegate(this._oDelegate)}}};l.prototype.onAfterRendering=function(){var t=this.getContent();if(t){var e=this.$();var i=e.find("*");var r=e.attr("title")||"";var n=t.getTooltip_AsString()||"";if(r===n){r=""}var a="";i.toArray().forEach(function(t){if(t.title){a=a.concat(t.title+" ")}});if(a.trim()!==0){n=n+" "+a}if(n&&n.trim().length!==0){if(this._getFooterText().trim()!==0){n=n+"\n"+this._getFooterText()}r.trim().length!==0?e.attr("title",r+"\n"+n):e.attr("title",n)}if(this.getParent()&&this.getParent().isA("sap.m.ActionTile")&&this.getContent().isA("sap.m.FormattedText")&&this.getContent().getDomRef()){this._applyStyleClassesOnContent(this.getContent().getDomRef())}i.removeAttr("title").off("mouseenter")}};l.prototype._getContentType=function(){if(this.getContent()){var t=this.getContent().getMetadata().getName();if(t==="sap.m.NewsContent"||t==="sap.suite.ui.commons.NewsContent"){return"News"}}};l.prototype._getFooterText=function(){var t=sap.ui.getCore().getLibraryResourceBundle("sap.m");var e=this.getFooter();var i=this.getUnit();if(i){if(e){if(n.getRTL()){return t.getText("TILECONTENT_FOOTER_TEXT",[e,i])}else{return t.getText("TILECONTENT_FOOTER_TEXT",[i,e])}}else{return i}}else{return e}};l.prototype.getAltText=function(){var t="";var e=true;var i=this.getContent();var r=this.getParent();var n=this.getPriorityText();if(n&&this.getPriority()!==a.None){t+=n;e=false}if(i&&i.getVisible()){var s=i.getDomRef();if(i.getAltText){t+=i.getAltText();e=false}else if(i.getTooltip_AsString()){t+=i.getTooltip_AsString();e=false}else if(r&&r.isA("sap.m.ActionTile")&&s){t+=(e?"":"\n")+this._getInnerText(s);e=false}else if(r&&r.isA("sap.m.GenericTile")&&r.getMode()===o.ActionMode){if(i.isA("sap.m.Text")){t+=(e?"":"\n")+i.getText();e=false}else if(s&&i.isA("sap.m.FormattedText")){t+=(e?"":"\n")+s.innerText;e=false}}}if(this.getUnit()){t+=(e?"":"\n")+this.getUnit();e=false}if(this.getFooter()){t+=(e?"":"\n")+this.getFooter()}return t};l.prototype._getInnerText=function(t){var e="";var i=[].slice.call(t.children);i.forEach(function(t,i){e+=t.innerText+"\n"});return e.trim()};l.prototype.getTooltip_AsString=function(){var t=this.getTooltip();var e="";if(typeof t==="string"||t instanceof String){return t}e=this.getAltText();return e?e:""};l.prototype.setRenderFooter=function(t){this._bRenderFooter=t;return this};l.prototype.setRenderContent=function(t){this._bRenderContent=t;return this};l.prototype._applyStyleClassesOnContent=function(t){var e=this._filterElements(t.childNodes);e.forEach(function(t){var e=t.tagName==="P"&&t.innerHTML.includes("br");if(e){t.classList.add("sapMbrPresent")}})};l.prototype._filterElements=function(t){return[].slice.call(t).filter(function(t){return t.nodeType===1})};return l});
//# sourceMappingURL=TileContent.js.map