/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/rta/plugin/BaseCreate","sap/ui/fl/Utils","sap/ui/dt/Util","sap/base/util/uid","sap/ui/core/IconPool","sap/ui/rta/plugin/iframe/AddIFrameDialog"],function(e,t,a,i,r,n){"use strict";function s(e,t,a,i){var r=!e;var n=this.getCreateAction(r,i,e);return a.getText(t,n.text)}function o(e,a,r,n){var s=t.getViewForControl(e);var o=s.createId(i());var g;var d;if(a.frameWidth){g=a.frameWidth+a.frameWidthUnit}else{g="100%"}if(a.frameHeight){d=a.frameHeight+a.frameHeightUnit}else{d="100%"}return this.getCommandFactory().getCommandFor(e,"addIFrame",{targetAggregation:a.aggregation,baseId:o,index:a.index,url:a.frameUrl,width:g,height:d,title:a.title},r,n)}function g(e,t){var i=t[0];var r=!e;var s=this.getCreateAction(r,i,e);var g=this._getParentOverlay(r,i);var d=g.getElement();var l=g.getDesignTimeMetadata();var u=0;if(r){var c=i.getElement();var h=l.getAggregation(s.aggregation).getIndex;u=this._determineIndex(d,c,s.aggregation,h)}var f=this.getVariantManagementReference(g);var m=!!s.getCreatedContainerId;var v=new n;var p;n.buildUrlBuilderParametersFor(d).then(function(e){var t={parameters:e,asContainer:m};return v.open(t)}).then(function(e){if(!e){return Promise.reject()}e.index=u;e.aggregation=s.aggregation;p=e.title;return o.call(this,d,e,l,f)}.bind(this)).then(function(e){this.fireElementModified({command:e,newControlId:e.getBaseId(),action:m?s:undefined,title:p})}.bind(this)).catch(function(e){if(e){throw a.createError("AddIFrame#handler",e,"sap.ui.rta")}})}var d=e.extend("sap.ui.rta.plugin.AddIFrame",{metadata:{library:"sap.ui.rta",properties:{},associations:{},events:{}}});d.prototype.isEnabled=function(e,t){var a=t[0];var i=!e;var r=this.getCreateAction(i,a,e);return this.isActionEnabled(r,i,a)};d.prototype.getMenuItems=function(e){function t(e){var t=sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");var a=t.getText("CTX_ADDIFRAME_GROUP");return{text:s.bind(this,e,"CTX_ADDIFRAME",t),handler:g.bind(this,e),enabled:this.isEnabled.bind(this,e),isSibling:!e,icon:"sap-icon://tnt/content-enricher",group:a}}r.registerFont({collectionName:"tnt",fontFamily:"SAP-icons-TNT",fontURI:sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),lazy:true});var a=140;var i=[];var n=true;if(this.isAvailable(e,n)){var o=this.getCreateAction(n,e[0]);if(o){var d=Object.assign({id:"CTX_CREATE_SIBLING_IFRAME",rank:a,action:o},t.call(this));i.push(this.enhanceItemWithResponsibleElement(d,e));a+=10}}n=false;if(this.isAvailable(e,n)){i=i.concat(this.getCreateActions(n,e[0]).map(function(i,r){var n=Object.assign({action:i,id:"CTX_CREATE_CHILD_IFRAME_"+i.aggregation.toUpperCase(),rank:a+10*r},t.call(this,i.aggregation));return this.enhanceItemWithResponsibleElement(n,e)},this))}return i};d.prototype.getActionName=function(){return"addIFrame"};return d});
//# sourceMappingURL=AddIFrame.js.map