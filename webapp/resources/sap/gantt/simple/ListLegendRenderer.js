/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/misc/Utility","./RenderUtils","sap/gantt/simple/LegendShapeGroupOrientation","sap/ui/core/IconPool"],function(e,t,a,i){"use strict";var r={apiVersion:2};var s=function(){var t=32;var a=e.findSapUiSizeClass();return e.scaleBySapUiSize(a,t)};r.render=function(e,t){e.openStart("div",t);e.attr("role","listbox");e.attr("tabindex",-1);e.openEnd();if(t.getParent().isA("sap.gantt.simple.LegendContainer")&&t.getParent().getEnableFlatLegends()&&!t.getParent()._isSingleVisibleList()){this.renderSubHeader(e,t)}var a=t.getItems();var i=a.some(function(e){return e.getInteractive()});for(var r=0;r<a.length;r++){if(a[r].getVisible()){this.renderLegendItem(e,a[r],i,r)}}e.close("div")};r.renderSubHeader=function(e,t){e.openStart("div",t.getId());e.class("sapGanttLLItemSectionTitle");e.class("sapUiSmallMarginBegin");e.class("sapUiSmallMarginTop");e.openEnd();e.text(t.getTitle());e.close("div");e.voidStart("hr");e.voidEnd()};r.renderLegendItem=function(e,t,a,i){var r=t.getAggregation("legendShapeGroup");var s=t.getAggregation("shape");if(r){this.renderShapeGroup(e,t,a,i)}else if(s){this.renderShape(e,t,a,i)}};r.renderShape=function(e,t,a,i){var r=t.getShape();var n=s(),g=n+"px";var o=n/2,p=o;var l=r.getYBias();if(r.isA("sap.gantt.simple.BaseConditionalShape")&&r._getActiveShapeElement()){var h=r._getActiveShapeElement();var d=h.getYBias()?h.getYBias():l;this.normalizeShape(h,p,o,d)}else{this.normalizeShape(r,p,o,l)}e.openStart("div",t);e.attr("title",r.getTitle());e.attr("tabindex",-1);e.attr("role","option");e.attr("aria-posinset",i+1);e.class("sapGanttLLItem");e.style("height",g);e.style("line-height",g);var f="margin-"+(sap.ui.getCore().getConfiguration().getRTL()?"right":"left");if(a&&!t.getInteractive()){e.style(f,g)}else if(!t.getInteractive()){e.style(f,p/2+"px")}e.openEnd();e.renderControl(t.getAggregation("_checkbox"));this.renderSvgPart(e,[r],p);this.renderLegendText(e,r.getTitle());e.close("div")};r.renderShapeGroup=function(e,t,a,i){var r=t.getAggregation("legendShapeGroup");var n=r.getAggregation("shapes");var g=r.getOrientation();var o=r.getYBias();var p=r.getTitle();var l=s(),h=l+"px";var d=l/2,f=d;e.openStart("div",t);e.attr("tabindex",-1);e.attr("role","option");e.attr("aria-posinset",i+1);e.attr("title",p);e.class("sapGanttLLItem");e.style("height",h).style("line-height",h);var c="margin-"+(sap.ui.getCore().getConfiguration().getRTL()?"right":"left");if(a&&!t.getInteractive()){e.style(c,h)}else if(!t.getInteractive()){e.style(c,f/2+"px")}e.openEnd();e.renderControl(t.getAggregation("_checkbox"));n.forEach(function(e,t){var a=e.getYBias()?e.getYBias():o;this.normalizeShapeGroup(n,e,g,f,d,t,a)}.bind(this));this.renderSvgPart(e,n,f);this.renderLegendText(e,p,true,h);e.close("div")};r.normalizeShapeGroup=function(e,t,i,r,s,n,g){if(t.isA("sap.gantt.simple.BaseConditionalShape")&&t._getActiveShapeElement()){var o=t._getActiveShapeElement();if(o.isA("sap.gantt.simple.LegendShapeGroup")){this.normalizeLegendShapeGroup(o,r,s,g)}else{this.normalizeShape(o,r,s,g)}return}if(t.isA("sap.gantt.simple.LegendShapeGroup")){this.normalizeLegendShapeGroup(t,r,s,g);return}var p=s/2;var l=t.getStrokeWidth()||0;var h=0;var d=0;var f=0;var c=0;var v=g?g:p;if(i===a.Vertical){if(n>0){if(e[n-1].isA("sap.gantt.simple.BaseLine")){h=parseFloat(e[n-1].getStrokeWidth())+Math.max(parseFloat(e[n-1].getY1()),parseFloat(e[n-1].getY2()))}else if(e[n-1].isA("sap.gantt.simple.BaseCursor")){h=e[n-1].getLength()+(e[n-1].getRowYCenter()-r/4)}else if(e[n-1].isA("sap.gantt.simple.BaseImage")){h=parseFloat(e[n-1].getY())}else if(e[n-1].isA("sap.gantt.simple.BasePath")){h=0}else{h=parseFloat(e[n-1].getHeight())+parseFloat(e[n-1].getY())}}}else if(i===a.Horizontal){if(n>0){if(e[n-1].isA("sap.gantt.simple.BaseLine")){d=parseFloat(e[n-1].getStrokeWidth())+Math.max(parseFloat(e[n-1].getX1()),parseFloat(e[n-1].getX2()))}else if(e[n-1].isA("sap.gantt.simple.BaseDiamond")){d=parseFloat(e[n-1].getWidth())+parseFloat(e[n-1].getX());d-=e[n-1].getWidth()/2}else if(e[n-1].isA("sap.gantt.simple.BaseCursor")){d=parseFloat(e[n-1].getWidth())+parseFloat(e[n-1].getX());d-=e[n-1].getLength()}else if(e[n-1].isA("sap.gantt.simple.BasePath")){d=0}else{d=parseFloat(e[n-1].getWidth())+parseFloat(e[n-1].getX())}}if(t.isA("sap.gantt.simple.BaseCursor")){d+=t.getLength()/2}}if(t.isA("sap.gantt.simple.BaseLine")){d=t.getX1();f=t.getX2();h=t.getY1();c=t.getY2()}var u={x:d,y:h,x1:d,y1:h,x2:f,y2:c,yBias:v,rowYCenter:parseFloat(h)};if(t.getWidth){if(!t.getWidth()){u.width=r-2*l}else{u.width=t.getWidth()}}if(t.getHeight){if(!t.getHeight()){u.height=s-2*l}else{u.height=t.getHeight()}}if(t.isA("sap.gantt.simple.BaseCursor")){if(i===a.Horizontal){u.rowYCenter=parseFloat((t.getWidth()+t.getPointHeight())/2)}else if(i===a.Vertical){u.x=r/2;u.rowYCenter=h+r/4}}else if(t.isA("sap.gantt.simple.BaseDiamond")){u.x+=u.width/2;if(i===a.Vertical){u.rowYCenter=h+r/4}else if(i===a.Horizontal){u.rowYCenter=parseFloat(u.height/2)}}else if(t.isA("sap.gantt.simple.BaseChevron")){u.rowYCenter=h+parseFloat(u.height/2)}else if(t.isA("sap.gantt.simple.BaseImage")){if(i===a.Vertical){u.y=h+parseFloat(u.height)}else if(i===a.Horizontal){u.y=h+parseFloat(u.height/2)}}Object.keys(u).forEach(function(e){var a=e.split("-").reduce(function(e,t){return e+t.charAt(0).toUpperCase()+t.slice(1)},"set");if(t[a]){t[a](u[e])}})};r.normalizeLegendShapeGroup=function(e,t,a,i){var r=e.getAggregation("shapes");var s=e.getOrientation();r.forEach(function(e,n){var g=e.getYBias()?e.getYBias():i;this.normalizeShapeGroup(r,e,s,t,a,n,g)}.bind(this))};r.normalizeShape=function(e,t,a,i){var r=a/2;var s=i?i:r;var n=e.getStrokeWidth()||0;var g={x:n,y:n,x1:n,y1:r+n,x2:t,y2:r,yBias:s,rowYCenter:r};if(e.getWidth){if(!e.getWidth()){g.width=t-2*n}else{g.width=e.getWidth()}}if(e.getHeight){if(!e.getHeight()){g.height=a-2*n}else{g.height=e.getHeight()}}if(e.isA("sap.gantt.simple.BaseCursor")||e.isA("sap.gantt.simple.BaseDiamond")){g.x+=t/2}if(e.isA("sap.gantt.simple.BaseTriangle")){g.rowYCenter=0}if(e.isA("sap.gantt.simple.shapes.Shape")){e.setWidth(t);e.setHeight(a);e.setStartX(0);e.setRowYCenter(a)}else{Object.keys(g).forEach(function(t){var a=t.split("-").reduce(function(e,t){return e+t.charAt(0).toUpperCase()+t.slice(1)},"set");if(e[a]){e[a](g[t])}})}};r.renderSvgPart=function(e,t,a){e.openStart("svg");e.class("sapGanttLLSvg");e.style("width",a+"px");e.openEnd();t.forEach(function(t){this.renderShapeGroupRecursively(e,t)}.bind(this));e.close("svg")};r.renderShapeGroupRecursively=function(e,t){if(t.isA("sap.gantt.simple.LegendShapeGroup")){this.renderLegendShapeGroup(t,e)}else if(t.isA("sap.gantt.simple.BaseConditionalShape")&&t._getActiveShapeElement()){var a=t._getActiveShapeElement();if(a.isA("sap.gantt.simple.LegendShapeGroup")){this.renderLegendShapeGroup(a,e)}}e.openStart("g").openEnd();if(t.isA("sap.gantt.simple.BaseImage")){this.renderImage(e,t)}else{t.renderElement(e,t)}e.close("g")};r.renderLegendShapeGroup=function(e,t){var a=e.getAggregation("shapes");a.forEach(function(e){this.renderShapeGroupRecursively(t,e)}.bind(this));return};r.renderLegendText=function(e,t,a,i){e.openStart("div");e.class("sapGanttLLItemTxt");if(a){e.style("line-height",i)}e.openEnd();if(t){e.text(t)}e.close("div")};r.renderImage=function(e,a){if(i.isIconURI(a.getSrc())){var r=["x","y","text-anchor","style","filter","transform"];e.openStart("text",a);t.renderAttributes(e,a,r);e.openEnd();var s=i.getIconInfo(a.getSrc());if(s){e.text(s.content)}e.close("text")}else{var n=["x","y","width","height"];e.openStart("image",a);t.renderAttributes(e,a,n);e.attr("href",a.getProperty("src"));e.openEnd();t.renderTooltip(e,a);e.close("image")}};return r},true);
//# sourceMappingURL=ListLegendRenderer.js.map