/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.define(["sap/apf/utils/utils","sap/apf/ui/utils/constants","sap/apf/ui/utils/wrappedChartWithCornerTexts","sap/ui/core/mvc/Controller","sap/ui/thirdparty/jquery"],function(e,t,n,r,jQuery){"use strict";var i,o,a,s,u,p,d,l;var c=sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION;function f(e){var t=e&&s.getTextPool().get(e),n;if(t!==undefined){n=t.TextElementDescription}return n}function g(e){var t=f(o[e]());if(t===undefined){t=f(a[e]())}return t}function v(e,t){return e.sort(function(e,n){var r,i;for(i=0;i<t.length;i++){if(e[t[i].property]<n[t[i].property]){r=-1}else if(e[t[i].property]>n[t[i].property]){r=1}r=r*[1,-1][+!t[i].ascending];if(r!==0){return r}}})}function y(e,t){var n=jQuery.Deferred();d.getEntityTypeMetadataAsPromise().done(function(r){var i,o,a=[];t.forEach(function(t){if(t.sProperty!==u("none")&&t.sProperty!==""){o=e(t.sProperty);if(o!==undefined){i=s.getTextPool().get(o).TextElementDescription}else{i=d.getDefaultLabel(r,t.sProperty)}a.push({fieldName:t.sProperty,fieldDesc:i,kind:t.sContext})}});n.resolve(a)});return n.promise()}function T(e){var t=jQuery.Deferred();var n=[];if(e==="properties"&&o.getRepresentationType()===c){y(o.getPropertyTextLabelKey,p.getActualProperties()).done(function(e){n=e})}else if(e==="dimensions"&&o.getRepresentationType()!==c){d.getEntityTypeMetadataAsPromise().done(function(e){y(o.getDimensionTextLabelKey,p.getActualDimensions().concat(p.getActualLegends())).done(function(e){n=e})})}else if(e==="measures"&&o.getRepresentationType()!==c){d.getEntityTypeMetadataAsPromise().done(function(e){y(o.getMeasureTextLabelKey,p.getActualMeasures()).done(function(e){n=e;n.forEach(function(e){var t=o.getMeasureDisplayOption(e.fieldName);if(t){e.measureDisplayOption=t}})})})}t.resolve(n);return t.promise()}function h(){var t=jQuery.Deferred();var n=[],r=[],i=0,a=3;var s=d.getProperties();d.getEntityTypeMetadataAsPromise().done(function(u){var p=d.getDimensionsProperties(u);var l=d.getMeasures(u);var f=o.getRepresentationType();var g=f!==c?Math.pow(a,p.length):7;for(i=0;i<g;i++){var y={};if(f===c){s.forEach(function(t){var n=t+" - "+e.createRandomNumberString(4);y[t]=n})}else{p.forEach(function(e,t){var n=e+" - "+(Math.floor(i/Math.pow(a,t))%a+1);y[e]=n});l.forEach(function(t){var n=e.createRandomNumberString(4);y[t]=n})}n.push(y)}r=o.getOrderbySpecifications();if(r&&r.length){n=v(n,r)}t.resolve(n)});return t.promise()}function w(){var t=l.getConstructorOfRepresentationType(o.getRepresentationType());var n=t.replaceAll(".","/");var r=sap.ui.requireSync(n)||e.extractFunctionFromModulePathString(t);var a={};a.requiredFilters=[];function s(e){return e}function u(){}var p={getTextNotHtmlEncoded:s,getTextHtmlEncoded:s,getEventCallback:u,getExits:function(){var e={};return e},getUiApi:function(){var e={};e.getStepContainer=function(){return undefined};return e},createFilter:function(){return{getOperators:function(){return{EQ:true}},getTopAnd:function(){return{addOr:u}},getInternalFilter:function(){return{getProperties:function(){return[]}}}}},createMessageObject:u,putMessage:u,updatePath:u,selectionChanged:u,getActiveStep:function(){return{getSelectedRepresentation:function(){return{bIsAlternateView:true}}}}};T("dimensions").done(function(e){a.dimensions=e});T("measures").done(function(e){a.measures=e});T("properties").done(function(e){a.properties=e});i=new r(p,a);if(i.chartType===c){i.oTableRepresentation.removeEventDelegate();i.oTableRepresentation.onAfterRendering(function(){return})}var d={getPropertyMetadata:function(e){return{label:e}}};h().done(function(e){i.setData(e,d)})}function C(e){var t=e.byId("idPreviewContentDialog");t.setTitle(u("preview"));t.getEndButton().setText(u("close"))}var m=r.extend("sap.apf.modeler.ui.controller.previewContent",{onInit:function(){var e=this;var t=e.byId("idPreviewContentDialog");o=e.getView().getViewData().oRepresentation;a=e.getView().getViewData().oParentStep;s=e.getView().getViewData().oConfigurationHandler;u=e.getView().getViewData().oCoreApi.getText;p=e.getView().getViewData().oRepresentationHandler;d=e.getView().getViewData().oStepPropertyMetadataHandler;l=e.getView().getViewData().oRepresentationTypeHandler;C(e);w();e._drawContent();t.open()},_drawContent:function(){this._drawMainChart();this._drawLikeStepInCarousel()},_drawLikeStepInCarousel:function(){var e=a.getTitleId();var t=f(e);var r={getSelectedRepresentation:function(){return i}};var o=n.getClonedChart(r);var s={rightLower:g("getRightLowerCornerTextKey"),rightUpper:g("getRightUpperCornerTextKey"),leftLower:g("getLeftLowerCornerTextKey"),leftUpper:g("getLeftUpperCornerTextKey")};var u={mode:"preview",titleText:t,oCornerTexts:s};var p=new n.constructor(null,a,o,u);this._addChart(p.getContent())},_drawMainChart:function(){var e=a.getLongTitleId();var t=s.getTextPool().isInitialTextKey(e);var n=e&&!t?e:a.getTitleId();var r=i.getMainContent(f(n),480,330);var o={interaction:{selectability:{axisLabelSelection:true,legendSelection:true,plotLassoSelection:true,plotStdSelection:true}}};if(r.setVizProperties!==undefined)r.setVizProperties(o);this.byId("idMainChart").addItem(r)},handleCloseButtonOfDialog:function(){var e=this;e.byId("idPreviewContentDialog").close()},handleClose:function(){var e=this;e.byId("idPreviewContentDialog").destroy();e.getView().destroy()},_addChart:function(e){this.byId("idThumbnail").addItem(e)}});return m},true);
//# sourceMappingURL=previewContent.controller.js.map