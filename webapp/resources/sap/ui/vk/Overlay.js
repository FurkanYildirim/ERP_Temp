/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./library","sap/ui/core/Control","sap/ui/vbm/library","sap/ui/vbm/VBI","sap/ui/unified/Menu","./Messages","./OverlayRenderer","./getResourceBundle","./OverlayArea","sap/base/Log"],function(e,t,i,n,a,o,r,s,h,l){"use strict";var f=t.extend("sap.ui.vk.Overlay",{metadata:{library:"sap.ui.vk",properties:{zoomOnResize:{type:"boolean",group:"Behavior",defaultValue:true}},aggregations:{areas:{type:"sap.ui.vk.OverlayArea",multiple:true,singularName:"area"}},associations:{target:{type:"sap.ui.core.Control",multiple:false}},events:{click:{parameters:{clientX:{type:"int"},clientY:{type:"int"},pos:{type:"string"}}},contextMenu:{parameters:{pos:{type:"string"},menu:{type:"sap.ui.unified.Menu"}}}}}});f.prototype.getPositionInteractive=function(e,t){if(!this.mIACreateCB&&t&&typeof t==="function"){this.mIACreateCB=t;var i="POS";if(e){i+="ARRAY"}var n={SAPVB:{Automation:{Call:{handler:"OBJECTCREATIONHANDLER",name:"CreateObject",object:"MainScene",scene:"MainScene",instance:"",Param:{name:"data","#":"{"+i+"}"}}}}};this._load(n);return true}else{return false}};f.prototype.openContextMenu=function(e){this._openContextMenu("Overlay",this,e)};f.prototype.setPanAndZoom=function(e,t,i){if(e===0&&t===0&&i===1){return}var n=this.mVBIContext.GetMainScene();this.totalCenterOffset.dx+=e;this.totalCenterOffset.dy+=t;if(i===1){n.MoveMap(e,t)}else{var a=n.m_Canvas[0];var o=a.m_nExactLOD+Math.log(i)*Math.LOG2E;n.ZoomToGeoPosition(VBI.MathLib.DegToRad([.5,.5]),o);n.MoveMap(this.totalCenterOffset.dx,this.totalCenterOffset.dy)}};f.prototype.reset=function(){this.totalCenterOffset.dx=this.totalCenterOffset.dy=0;var e=this.mVBIContext.GetMainScene();if(e){e.ZoomToGeoPosition(VBI.MathLib.DegToRad([.5,.5]),this.initialZoom)}return this};f.prototype.init=function(){this.aLoadQueue=null;this.oTargetDomRef=null;this.mVBIContext=new VBI.VBIContext(this);this.resizeID="";this.resizeIDTarget="";this.bVosDirty=true;this.bWindowsDirty=true;this.bSceneDirty=true;this.bDataDeltaUpdate=false;this.bHandleDataChangeActive=false;this.bForceDataUpdate=false;this.mAddMenuItems=[];this.totalCenterOffset={dx:0,dy:0};this.initialZoom=10};f.prototype.exit=function(){if(this.mVBIContext){this.mVBIContext.clear()}if(this.resizeID!=""){sap.ui.core.ResizeHandler.deregister(this.resizeID);this.resizeID=""}if(this.resizeIDTarget!=""){sap.ui.core.ResizeHandler.deregister(this.resizeIDTarget);this.resizeIDTarget=""}};f.prototype.resize=function(e){var t=this.oControl!=undefined?this.oControl:this;var i=t.mVBIContext;if(i){var n=i.GetMainScene();if(n){if(t.getZoomOnResize()&&e&&e.oldSize.width>0){var a=Math.log(e.size.width/e.oldSize.width)*Math.LOG2E;n.ZoomToGeoPosition(n.GetCenterPos(),n.GetCurrentZoomlevel()+a,false,true,true)}n.resizeCanvas(e,true,true)}}};f.prototype.setTarget=function(e){if(!e){return}this.setAssociation("target",e);this.reset();if(e instanceof sap.m.Image){e.addDelegate({onAfterRendering:function(t){this.oTargetDomRef=e.getDomRef();this.oTargetDomRef.addEventListener("load",jQuery.proxy(this._adaptSizeOfTarget,this))}.bind(this)})}else{e.addDelegate({onAfterRendering:function(t){this.oTargetDomRef=e.getDomRef();this._adaptSizeOfTarget()}.bind(this)})}if(this.resizeIDTarget!=""){sap.ui.core.ResizeHandler.deregister(this.resizeIDTarget);this.resizeIDTarget=""}this.resizeIDTarget=sap.ui.core.ResizeHandler.register(e,this._adaptSizeOfTarget.bind(this))};f.prototype._adaptSizeOfTarget=function(){var e=this.oTargetDomRef;var t=this.getDomRef();if(e){try{var i=jQuery(e);var n={top:i.offset().top,left:i.offset().left,width:i.outerWidth(),height:i.outerHeight()};jQuery(t).width(n.width).height(n.height).css("position","absolute");jQuery(t).css("top","0px").css("left","0px").css("visibility","")}catch(e){l.error(e)}}else{jQuery(t).css("position","fixed").width("0px").height("0px").css("top","0px").css("left","0px").css("visibility","hidden")}};f.prototype.onAfterRendering=function(){if(this.$oldContent.length>0){this.$().append(this.$oldContent)}this._adaptSizeOfTarget();if(this.aLoadQueue){var e;for(e=0;e<this.aLoadQueue.length;++e){this._load(this.aLoadQueue[e])}this.aLoadQueue=null}if(this.resizeID==""){this.resize();this.resizeID=sap.ui.core.ResizeHandler.register(this,this.resize)}var t=this.getId();if(this.mVBIContext.m_Windows){this.mVBIContext.m_Windows.Awake(t)}};f.prototype.onBeforeRendering=function(){this.$oldContent=sap.ui.core.RenderManager.findPreservedContent(this.getId())};f.prototype.invalidate=function(e){this.bSceneDirty=true;if(e instanceof h){this.bVosDirty=true;this.bDataDeltaUpdate=this.bHandleDataChangeActive}sap.ui.core.Control.prototype.invalidate.apply(this,arguments)};f.prototype._load=function(e){if(!this.isRendered()){if(!this.aLoadQueue){this.aLoadQueue=[]}this.aLoadQueue.push(e);return}this._loadHtml(e)};f.prototype._loadHtml=function(e){var t=this.getId();var i=null;if(typeof e=="string"){i=JSON.parse(e.indexOf("{")?e.substr(e.indexOf("{")):e)}else if(typeof e=="object"){i=e}if(!i){return}if(!i["SAPVB"]){var n;if(this.mVBIContext&&(n=new VBI.Adaptor(this.mVBIContext).CreateLoadData(i))){this.loadHtml(n);return}else{return}}var a=false;var o=false;var r=false;if(jQuery.type(i)=="object"){if(i.SAPVB){if(i.SAPVB.Config){this.mVBIContext.GetConfig().load(i.SAPVB.Config,this.mVBIContext)}if(i.SAPVB.Resources){this.mVBIContext.GetResources().load(i.SAPVB.Resources,this.mVBIContext)}if(i.SAPVB.DataTypes){if(!this.mVBIContext["m_DataTypeProvider"]){this.mVBIContext["m_DataTypeProvider"]=new VBI.DataTypeProvider}this.mVBIContext["m_DataTypeProvider"].load(i.SAPVB.DataTypes,this.mVBIContext)}if(i.SAPVB.Data){if(!this.mVBIContext["m_DataProvider"]){this.mVBIContext["m_DataProvider"]=new VBI.DataProvider}this.mVBIContext["m_DataProvider"].load(i.SAPVB.Data,this.mVBIContext);a=true}if(i.SAPVB.Windows){if(!this.mVBIContext["m_Windows"]){this.mVBIContext["m_Windows"]=new VBI.Windows}this.mVBIContext["m_Windows"].load(i.SAPVB.Windows,this.mVBIContext);r=true}if(i.SAPVB.Actions){if(!this.mVBIContext["m_Actions"]){this.mVBIContext["m_Actions"]=new VBI.Actions}this.mVBIContext["m_Actions"].load(i.SAPVB.Actions,this.mVBIContext)}if(i.SAPVB.Automation){if(!this.mVBIContext["m_Automations"]){this.mVBIContext["m_Automations"]=new VBI.Automations}this.mVBIContext["m_Automations"].load(i.SAPVB.Automation,this.mVBIContext)}if(i.SAPVB.Menus){if(!this.mVBIContext["m_Menus"]){this.mVBIContext["m_Menus"]=new VBI.Menus}this.mVBIContext["m_Menus"].load(i.SAPVB.Menus,this.mVBIContext)}if(i.SAPVB.Scenes){if(!this.mVBIContext["m_SceneManager"]){this.mVBIContext["m_SceneManager"]=new VBI.SceneManager}this.mVBIContext["m_SceneManager"].load(i.SAPVB.Scenes,this.mVBIContext);o=true}}if(a){if(this.mVBIContext["m_Windows"]){this.mVBIContext["m_Windows"].NotifyDataChange()}}if(o||r){if(this.mVBIContext["m_Windows"]){this.mVBIContext["m_Windows"].Awake(t)}}if(o||a){if(this.mVBIContext["m_Windows"]){this.mVBIContext["m_Windows"].RenderAsync()}}}};f.prototype._openContextMenu=function(e,t,i){if(i&&i.vbi_data&&i.vbi_data.VBIName=="DynContextMenu"){if(!this.mVBIContext["m_Menus"]){this.mVBIContext["m_Menus"]=new window.VBI.Menus}for(var n=0;n<this.mAddMenuItems.length;++n){i.addItem(this.mAddMenuItems[n])}this.mVBIContext.m_Menus.m_menus.push(i);this._loadHtml({SAPVB:{version:"2.0",Automation:{Call:{earliest:"0",handler:"CONTEXTMENUHANDLER",instance:t.sId,name:"SHOW",object:e,refID:"CTM",Param:[{name:"x","#":t.mClickPos[0]},{name:"y","#":t.mClickPos[1]},{name:"scene","#":"MainScene"}]}}}})}this.mAddMenuItems=[]};f.prototype._update=function(){var e={SAPVB:{}};if(this.bSceneDirty){this._updateScene(e)}this._updateWindows(e);if(e.SAPVB.Actions){var t=this._getActionArray();for(var i=0;i<t.length;i++){e.SAPVB.Actions.Set.Action.push(t[i])}}return this._minimizeApp(e)};f.prototype._minimizeApp=function(e){var t,i;var n;i=null;if(!this.bWindowsDirty){n=(t=e)&&(t=t.SAPVB)&&(t=t.Windows)&&(i=JSON.stringify(t))&&i==this.mCurWindows&&delete e.SAPVB.Windows;if(!n){this.mCurWindows=i?i:this.mCurWindows}}else{this.bWindowsDirty=false}i=null;n=(t=e)&&(t=t.SAPVB)&&(t=t.Scenes)&&(i=JSON.stringify(t))&&i==this.mCurScenes&&delete e.SAPVB.Scenes;if(!n){this.mCurScenes=i?i:this.mCurScenes}i=null;n=(t=e)&&(t=t.SAPVB)&&(t=t.Actions)&&(i=JSON.stringify(t))&&i==this.mCurActions&&delete e.SAPVB.Actions;if(!n){this.mCurActions=i?i:this.mCurActions}i=null;n=(t=e)&&(t=t.SAPVB)&&(t=t.DataTypes)&&(i=JSON.stringify(t))&&i==this.mCurDataTypes&&delete e.SAPVB.DataTypes;if(!n){this.mCurDataTypes=i?i:this.mCurDataTypes}if(!this.bForceDataUpdate){i=null;n=(t=e)&&(t=t.SAPVB)&&(t=t.Data)&&(i=JSON.stringify(t))&&i==this.mCurData&&delete e.SAPVB.Data;if(!n){this.mCurData=i?i:this.mCurData}}else{this.bForceDataUpdate=false}return e};f.prototype._updateWindows=function(e){e.SAPVB.Windows={Set:[{name:"Main",Window:{id:"Main",caption:"MainWindow",type:"geo",refParent:"",refScene:"MainScene",modal:"true"}}]}};f.prototype._updateScene=function(e){var t=[];var i=[];var n=[];var a=[];this._updateVOData(t,i,n,a);var o=JSON.stringify(t);var r=true;if(!this.saVO){(((e.SAPVB.Scenes={}).Set={}).SceneGeo={id:"MainScene",scaleVisible:"false",navControlVisible:"false",VisualFrame:{minLOD:5},NavigationDisablement:{move:"true",zoom:"true"},initialZoom:this.initialZoom.toString(),initialStartPosition:"0.5;0.5;0"}).VO=t}else if(this.bRefMapLayerStackDirty||!(this.saVO===o)){e.SAPVB.Scenes=this._getSceneVOdelta(JSON.parse(this.m_saVO),t)}else{r=false}this.saVO=o;if(this.bDataDeltaUpdate){e.SAPVB.Data=[];for(var s=0;s<i.length;++s){e.SAPVB.Data.push({Set:{name:i[s].name,type:"N",N:i[s]}})}}else{((e.SAPVB.Data={}).Set={}).N=i}if(r){((e.SAPVB.DataTypes={}).Set={}).N=n}((e.SAPVB.Actions={}).Set={}).Action=a;this.bSceneDirty=this.bVosDirty=this.bDataDeltaUpdate=false};f.prototype._isEventRegistered=function(e,t){var i=this.getAggregation(e);if(!i){return false}for(var n=0;n<i.length;++n){var a=i[n];if(a.hasListeners(t)){return true}}return false};f.prototype._getTemplateBindingInfo=function(e){var t=this.getBindingInfo(e);if(t&&t.template){return t.template.mBindingInfos}};f.prototype._getBindInfo=function(e){var t={};var i=this._getTemplateBindingInfo(e);t.C=i?i.hasOwnProperty("color"):true;t.CB=i?i.hasOwnProperty("colorBorder"):true;t.DCH=i?i.hasOwnProperty("deltaColorHot"):true;t.CS=i?i.hasOwnProperty("colorSelect"):true;t.CNS=i?i.hasOwnProperty("colorNonSelect"):true;t.TT=i?i.hasOwnProperty("tooltip"):true;t.M=i?i.hasOwnProperty("changeable"):true;t.hasTemplate=i?true:false;return t};f.prototype._updateVOData=function(e,t,i,n){var a,o;this.AreaBindInfo=a=this.AreaBindInfo?this.AreaBindInfo:this._getBindInfo("areas");o=a.hasTemplate?this.getBindingInfo("areas").template:null;var r={id:"OverlayArea",datasource:"OverlayArea",type:"{00100000-2012-0004-B001-F311DE491C77}"};r["posarray.bind"]=r.id+".P";if(a.C){r["color.bind"]=r.id+".C"}else{r.color=o.getColor()}if(a.CB){r["colorBorder.bind"]=r.id+".C"}else{r.colorBorder=o.getColorBorder()}if(a.DCH){r["hotDeltaColor.bind"]=r.id+".DCH"}else{r.hotDeltaColor=o.getDeltaColorHot()}if(a.CS){r["colorSelect.bind"]=r.id+".C"}else{r.colorSelect=o.getColorSelect()}if(a.CNS){r["colorNonSelect.bind"]=r.id+".C"}else{r.colorNonSelect=o.getColorNonSelect()}if(!a.M){r["VB:c"]=o.getChangeable()}e.push(r);var s={name:r.id,key:"K"};s.A=[{name:"K",alias:"K",type:"string"},{name:"VB:s",alias:"VB:s",type:"boolean"},{name:"P",alias:"P",type:"vectorarray",changeable:"true"}];if(a.C){s.A.push({name:"C",alias:"C",type:"color"})}if(a.CB){s.A.push({name:"CB",alias:"CB",type:"string"})}if(a.DCH){s.A.push({name:"DCH",alias:"DCH",type:"string"})}if(a.CS){s.A.push({name:"CS",alias:"CS",type:"string"})}if(a.CNS){s.A.push({name:"CNS",alias:"CNS",type:"string"})}if(a.TT){s.A.push({name:"TT",alias:"TT",type:"string"})}i.push(s);var h=r.id;if(this._isEventRegistered("areas","click")){n.push({id:h+"1",name:"click",refScene:"MainScene",refVO:h,refEvent:"Click",AddActionProperty:[{name:"pos"}]})}if(this._isEventRegistered("areas","contextMenu")){n.push({id:h+"2",name:"contextMenu",refScene:"MainScene",refVO:h,refEvent:"ContextMenu"})}if(this._isEventRegistered("areas","edgeClick")){n.push({id:h+"7",name:"edgeClick",refScene:"MainScene",refVO:h,refEvent:"EdgeClick"})}n.push({id:h+"4",name:"handleMoved",refScene:"MainScene",refVO:h,refEvent:"HandleMoved"});n.push({id:h+"5",name:"handleContextMenu",refScene:"MainScene",refVO:h,refEvent:"HandleContextMenu"});n.push({id:h+"8",name:"edgeContextMenu",refScene:"MainScene",refVO:h,refEvent:"EdgeContextMenu"});if(this._isEventRegistered("areas","handleClick")){n.push({id:h+"6",name:"handleClick",refScene:"MainScene",refVO:h,refEvent:"HandleClick"})}var l={name:r.id,E:[]};var f=this.getAreas();for(var d=0;d<f.length;++d){l.E.push(f[d].getDataElement())}t.push(l)};f.prototype._getSceneVOdelta=function(e,t){var i=[];var n=[];var a={};for(var o=0,r=e.length;o<r;++o){a[e[o].id]=e[o]}for(var s=0;s<t.length;++s){if(a[t[s].id]){if(JSON.stringify(t[s])!=JSON.stringify(a[t[s].id])){n.push({id:t[s].id,type:"VO"});i.push(t[s])}}else{i.push(t[s])}delete a[t[s].id]}for(var h in a){n.push({id:h,type:"VO"})}var l={Merge:{name:"MainScene",type:"SceneGeo",SceneGeo:{id:"MainScene"}}};if(n.length){l.Merge.SceneGeo.Remove=n}if(i.length){l.Merge.SceneGeo.VO=i}return l};f.prototype._getActionArray=function(){var e=[];if(this.mEventRegistry["click"]){e.push({id:"Overlay1",name:"click",refScene:"MainScene",refVO:"Map",refEvent:"Click",AddActionProperty:[{name:"pos"}]})}if(this.mEventRegistry["contextMenu"]){e.push({id:"Overlay2",name:"contextMenu",refScene:"MainScene",refVO:"Map",refEvent:"ContextMenu",AddActionProperty:[{name:"pos"}]})}e.push({id:"Overlay3",name:"GetPosComplete",refScene:"MainScene",refVO:"General",refEvent:"CreateComplete"});return e};f.prototype._handleChangedData=function(e){try{this.bHandleDataChangeActive=true;if(e&&e.length){for(var t=0,i;t<e.length;++t){i=e[t];if(i.E&&i.E.length){for(var n=0,a,o;n<i.E.length;++n){a=i.E[n];o=this._findInstance(a.K);if(o){o.handleChangedData(a)}}}}}this.bHandleDataChangeActive=false}catch(e){this.bHandleDataChangeActive=false;throw e}};f.prototype._findInstance=function(e){var t=e.indexOf(".")!==-1?e.split(".")[1]:e;var i=this.getAreas();for(var n=0;n<i.length;++n){var a=i[n];if(a.getId()===t){return a}}return null};f.prototype._handleAggregationEvent=function(e){var t;if(t=this._findInstance(e.Action.instance)){try{t.handleEvent(e)}catch(e){l.error(s().getText(o.VIT11.summary),o.VIT11.code,"sap.ui.vk.Overlay")}}};f.prototype.isRendered=function(){return this.getDomRef()?true:false};f.prototype.fireSubmit=function(e){var t=JSON.parse(e.data);if(t.Data&&t.Data.Merge){this._handleChangedData(t.Data.Merge.N)}if(t.Action.object==="OverlayArea"){this._handleAggregationEvent(t)}else{var i=t.Action.name,n;if(i==="click"||i==="contextMenu"){n=[t.Action.Params.Param[0]["#"],t.Action.Params.Param[1]["#"]]}switch(i){case"GetPosComplete":if(this.mIACreateCB){try{this.mIACreateCB(t.Action.Params.Param[0]["#"]);this.mIACreateCB=null}catch(e){this.mIACreateCB=null;throw e}}break;case"click":this.fireClick({clientX:n[0],clientY:n[1],pos:t.Action.AddActionProperties.AddActionProperty[0]["#"]});break;case"contextMenu":if(this.mVBIContext.m_Menus){this.mVBIContext.m_Menus.deleteMenu("DynContextMenu")}var o=new a;o["vbi_data"]={};o["vbi_data"].menuRef="CTM";o["vbi_data"].VBIName="DynContextMenu";this.mClickPos=n;this.fireContextMenu({pos:t.Action.AddActionProperties.AddActionProperty[0]["#"],menu:o});break;default:break}}};f.prototype.fireRender=function(e){};f.prototype.fireMove=function(e){};f.prototype.fireZoom=function(e){};f.prototype.fireOpenWindow=function(e){};f.prototype.fireCloseWindow=function(e){};return f});
//# sourceMappingURL=Overlay.js.map