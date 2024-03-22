/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./PropertyHelper","sap/m/Button","sap/m/Bar","sap/m/Title","sap/base/util/merge","sap/m/MessageBox","sap/ui/Device","sap/ui/fl/write/api/FieldExtensibility","sap/ui/core/Configuration","sap/ui/core/library"],function(e,t,n,r,i,o,a,s,u,l){"use strict";var c=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");var p=l.TitleLevel;var g={createP13nPopover:function(e,t){return new Promise(function(n,r){sap.ui.require(["sap/m/ResponsivePopover"],function(i){g["_checkSettings"](e,t,r);var o=new i({title:t.title,horizontalScrolling:t.hasOwnProperty("horizontalScrolling")?t.horizontalScrolling:false,verticalScrolling:t.hasOwnProperty("verticalScrolling")?t.verticalScrolling:false,contentWidth:t.contentWidth?t.contentWidth:"24rem",resizable:t.hasOwnProperty("resizable")?t.resizable:true,contentHeight:t.contentHeight?t.contentHeight:"35rem",placement:t.placement?t.placement:"Bottom",content:e,afterClose:t.afterClose?t.afterClose:function(){}});if(t.reset){var a=g._createResetHeader({title:t.title,reset:t.reset.onExecute,idResetButton:t.reset.idButton,warningText:t.reset.warningText});o.setCustomHeader(a)}n(o)},r)})},createP13nDialog:function(e,t){return new Promise(function(n,r){g["_checkSettings"](e,t,r);var i=t.id;sap.ui.require(["sap/m/Dialog","sap/m/Button"],function(o,s){var u=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");var l=new o(i,{title:t.title,horizontalScrolling:t.hasOwnProperty("horizontalScrolling")?t.horizontalScrolling:false,verticalScrolling:t.hasOwnProperty("verticalScrolling")?t.verticalScrolling:true,contentWidth:t.contentWidth?t.contentWidth:"40rem",contentHeight:t.contentHeight?t.contentHeight:"55rem",draggable:true,resizable:true,stretch:a.system.phone,content:e,afterClose:t.afterClose?t.afterClose:function(){},buttons:[new s(i?i+"-confirmBtn":undefined,{text:t.confirm&&t.confirm.text?t.confirm.text:u.getText("p13nDialog.OK"),type:"Emphasized",press:function(){if(t.confirm&&t.confirm.handler){t.confirm.handler.apply(l,arguments)}}}),new s(i?i+"-cancelBtn":undefined,{text:u.getText("p13nDialog.CANCEL"),press:function(){t.cancel.apply(l,arguments)}})]});if(t.reset){var c=g._createResetHeader({title:t.title,idResetButton:t.reset.idButton,reset:t.reset.onExecute,warningText:t.reset.warningText});l.setCustomHeader(c)}var p=t.additionalButtons;if(p instanceof Array){p.forEach(function(e){if(!e.isA("sap.m.Button")){r("Please only provide sap.m.Button instances as 'additionalButtons'")}l.addButton(e)})}n(l)},r)})},_createResetHeader:function(e){var i=new n({contentLeft:[new r({text:e.title,level:p.H1})]});if(e.reset){var a=e.idResetButton;i.addContentRight(new t(a,{text:sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("p13nDialog.RESET"),press:function(t){var n=t.getSource().getParent().getParent();var r=n.getParent();var i=e.warningText?e.warningText:sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("filterbar.ADAPT_RESET_WARNING");o.warning(i,{actions:[o.Action.OK,o.Action.CANCEL],emphasizedAction:o.Action.OK,onClose:function(t){if(t===o.Action.OK){n.getButtons()[0].focus();e.reset(r)}}})}}))}return i},prepareAdaptationData:function(t,n,r){var i=t&&t.getProperties instanceof Function?t:new e(t);var o=[];var a=r?{}:null;var s=n instanceof Function;i.getProperties().forEach(function(e){var t={};t.name=e.name;if(s){var r=n(t,e);if(!r){return}}t.label=e.label||e.name;t.tooltip=e.tooltip;if(a){t.group=e.group?e.group:"BASIC";t.groupLabel=e.groupLabel;a[t.group]=a[t.group]?a[t.group]:[];a[t.group].push(t)}o.push(t)});var u={items:o};if(a){u.itemsGrouped=this._buildGroupStructure(a)}return u},sortP13nData:function(e,t){var n=e;var r=n.position;var i=n.visible;var o=u.getLocale().toString();var a=window.Intl.Collator(o,{});t.sort(function(e,t){if(e[i]&&t[i]){return(e[r]||0)-(t[r]||0)}else if(e[i]){return-1}else if(t[i]){return 1}else if(!e[i]&&!t[i]){return a.compare(e.label,t.label)}})},_buildGroupStructure:function(e){var t=[];Object.keys(e).forEach(function(n){this.sortP13nData("generic",e[n]);t.push({group:n,groupLabel:e[n][0].groupLabel||c.getText("p13nDialog.FILTER_DEFAULT_GROUP"),groupVisible:true,items:e[n]})}.bind(this));return t},_isExcludeProperty:function(e,t){return t.some(function(t){var n=t.ignoreKey;var r=t.ignoreValue;return e[n]===r})},_checkSettings:function(e,t,n){if(!t){n("Please provide a settings object for p13n creation")}if(!t.title&&!t.customHeader){n("Please provide a title or customHeader in the settings object for p13n creation")}},arrayToMap:function(e){return e.reduce(function(e,t,n){e[t.name]=t;e[t.name].position=n;return e},{})},addRTACustomFieldButton:function(e,i){var o=false,a=e.getParent();if(i&&i.isA("sap.ui.comp.smarttable.SmartTable")){a=i}return sap.ui.getCore().loadLibrary("sap.ui.rta",{async:true}).then(function(){return new Promise(function(u){sap.ui.require(["sap/ui/rta/Utils"],function(l){var c=Promise.all([l.isServiceUpToDate(a),s.isExtensibilityEnabled(a)]);return c.then(function(e){o=!!e[1]}).then(function(){var c=e.getCustomHeader(),g=a&&a.getId?a.getId():undefined,f=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");if(!c){var d=new n({contentLeft:[new r({text:e.getTitle(),level:p.H1})]});e.setCustomHeader(d);c=e.getCustomHeader()}if(o){c.addContentRight(new t(g+"-addCustomField",{icon:"sap-icon://add",enabled:o,tooltip:f.getText("p13nDialog.rtaAddTooltip"),press:function(e){var t=l.getRtaStyleClassName(),n=e.getSource().getParent().getParent(),r=n.getParent();if(i&&i.isA("sap.ui.comp.smarttable.SmartTable")){r=i}s.onControlSelected(r).then(function(e){s.getExtensionData().then(function(e){s.onTriggerCreateExtensionData(e,t);n.close()})})}}));e.setCustomHeader(c);u(e)}})})})})}};return g});
//# sourceMappingURL=P13nBuilder.js.map