/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/base/Log","sap/zen/dsh/utils/request","sap/sac/df/thirdparty/lodash","sap/zen/dsh/utils/BaseHandler","sap/viz/library"],function(jQuery,t,e,a){"use strict";function i(){}i.prototype.create=function(a,i,r){this._oldData={};this.info_ctrl=r;try{this._vizframe=new sap.viz.vizframe.VizFrame({type:i.type,data:i.data,container:a,bindings:i.bindings,properties:i.properties,template:i.template},{controls:{morpher:{enabled:false}}});a.on("mousedown",function(t){t.stopPropagation()}).on("touchstart",function(t){t.stopPropagation()}).on("touchend",function(t){t.stopPropagation()});var n=this;this._metadata=i;this._doSelectActions=true;if(this._metadata.selection){this.selection(this._metadata.selection)}this._vizframe.on("selectData",function(){n.selectDeselect()});this._vizframe.on("deselectData",function(){n.selectDeselect()});this._vizframe.on("contextualData",function(t){if(t.type==="legend"){return}var a=n.info_ctrl.sId;var i=a.substring(0,a.lastIndexOf("_"));var r=n.getCharacteristic(t.data,t.type);var s=[["BI_COMMAND_TYPE","CREATE_CONTEXT_MENU",0],["ID","CONTEXT_MENU",0],["DOM_REF_ID",a,0],["TARGET_ITEM_REF",i,0],["CHARACTERISTIC_NAME",r.name,0],["CHARACTERISTIC_MEMBER_NAME",r.memberName,0]];var o=e.zenSendCommandArrayWoEventWZenPVT(s);var c=new Function(o);c()})}catch(e){t.error(e)}};i.prototype.getCharacteristic=function(t,e){var i={name:"",memberName:""};if(t.length!==0&&e==="axisLabel"){var r=jQuery(".v-axis-item").find(".v-hovershadow").parent();if(!r||!r.attr("class")){return i}var n=r.attr("class").slice(-1);var s=r.text();var o=this._metadata.bindings;var c=a.find(o,{feed:"categoryAxis"});if(c&&a.isArray(c.source)){var d=c.source.length-1-n;var l=c.source[d];i.name=l;var f=a.find(t,function(t){return t.data[l+".d"]===s});if(!f){return i}if(f.data[l].indexOf("HIERARCHY_NODE/")===0){i.memberName=f.data[l]}else{i.memberName="MEMBER/"+l+"/"+f.data[l]}}}return i};i.prototype.selectDeselect=function(){if(!this._doSelectActions){this._doSelectActions=true;return}var t=this._vizframe.selection();if(!a.isEqual(this._oldData,t)){this.info_ctrl.fireDesignStudioPropertiesChangedAndEvent(["chartSelection","dataSelected"],"onSelect");this._oldData=t}};i.prototype.update=function(t){this._vizframe.update({type:t.type,data:t.data,bindings:t.bindings,properties:t.properties});this._metadata=t};i.prototype.destroy=function(){if(this._vizframe){this._vizframe.destroy()}};i.prototype.selection=function(t){if(t===undefined){return this._vizframe&&this._vizframe.selection()}else{this._doSelectActions=false;if(t==="CLEAR"){this._vizframe.selection([],{clearSelection:true});this._oldData={};this._doSelectActions=true}else{var e=this._vizframe.selection(t);if(!e){this._doSelectActions=true}}}return null};return i});
//# sourceMappingURL=info_vizframe.js.map