/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["./library","sap/suite/ui/microchart/MicroChartRenderUtils","sap/ui/core/theming/Parameters","sap/m/library"],function(e,t,a,i){"use strict";var r=i.ValueColor;var s={apiVersion:2};s.render=function(e,t){if(!t._bThemeApplied){return}if(t._hasData()){var a=t.getTooltip_AsString(t.hasListeners("press"));e.openStart("div",t);this._writeMainProperties(e,t);if(t.getShrinkable()){e.class("sapSuiteCpMCShrinkable");e.style("height","auto")}e.openEnd();this._renderInnerContent(e,t,a);e.openStart("div",t.getId()+"-info");e.attr("aria-hidden","true");e.style("display","none");e.openEnd();e.text(a);e.close("div");e.openStart("div",t.getId()+"-hidden");e.attr("aria-hidden","true");e.attr("focusable","false");e.openEnd();e.close("div");e.close("div")}else{this._renderNoData(e,t)}};s._writeMainProperties=function(e,t){var a=t.hasListeners("press");this._renderActiveProperties(e,t);var i=t.getTooltip_AsString(a);e.attr("role","figure");if(t.getAriaLabelledBy().length){e.accessibilityState(t)}else{e.attr("aria-label",i)}e.class("sapSuiteCpMC");e.class("sapSuiteCpMCChartContent");e.class(t._isResponsive()?"sapSuiteCpMCResponsive":"sapSuiteCpMCSize"+t.getSize());e.class("sapSuiteCpMCViewType"+t.getView());e.style("width",t.getWidth());e.style("height",t.getHeight())};s._renderInnerContent=function(e,t){var i=t.getColorPalette().length,r=0,s=t.getData(),n=t._calculateChartData();var l=function(e){if(i){if(r===i){r=0}e=t.getColorPalette()[r++].trim()}return a.get(e)||e};e.openStart("div");e.class("sapSuiteCpMCVerticalAlignmentContainer");e.openEnd();for(var o=0;o<n.length;o++){this._renderChartItem(e,t,n[o],o,l(s[o].getColor()))}e.close("div")};s._renderChartItem=function(e,t,a,i,r){var s=t.getData();e.openStart("div",s[i]);e.class("sapSuiteCpMCChartItem");e.openEnd();this._renderChartTitle(e,t,i);this._renderChartBar(e,t,a,i,r);this._renderChartValue(e,t,i,r);e.close("div")};s._renderChartBar=function(t,a,i,r,s){var n=a.getData()[r];t.openStart("div",a.getId()+"-chart-item-bar-"+r);t.class("sapSuiteCpMCChartBar");if(a.getData()[r].hasListeners("press")){if(r===0){t.attr("tabindex","0")}t.attr("role","presentation");t.attr("aria-label",a._getBarAltText(r));if(!e._isTooltipSuppressed(a._getBarAltText(r))){t.attr("title",a._getBarAltText(r))}else{t.attr("title","")}t.attr("data-bar-index",r);t.class("sapSuiteUiMicroChartPointer")}t.openEnd();if(i.negativeNoValue>0){t.openStart("div");t.attr("data-bar-index",r);t.class("sapSuiteCpMCChartBarNegNoValue");if(i.value>0||i.positiveNoValue>0){t.class("sapSuiteCpMCNotLastBarPart")}t.style("width",i.negativeNoValue+"%");t.openEnd();t.close("div")}if(i.value>0){t.openStart("div");t.attr("data-bar-index",r);t.class("sapSuiteCpMCChartBarValue");t.class("sapSuiteCpMCSemanticColor"+n.getColor());t.style("background-color",s?s:"");t.style("width",i.value+"%");t.openEnd();t.close("div")}if(i.positiveNoValue>0){t.openStart("div");t.attr("data-bar-index",r);t.class("sapSuiteCpMCChartBarNoValue");if(i.negativeNoValue&&!i.value){t.class("sapSuiteCpMCNegPosNoValue")}else if(i.negativeNoValue||i.value){t.class("sapSuiteCpMCNotFirstBarPart")}t.style("width",i.positiveNoValue+"%");t.openEnd();t.close("div")}t.close("div")};s._renderChartTitle=function(e,t,a){var i=t.getData()[a];e.openStart("div",t.getId()+"-chart-item-"+a+"-title");e.class("sapSuiteCpMCChartItemTitle");e.openEnd();e.text(i.getTitle());e.close("div")};s._renderChartValue=function(e,t,a,i){var s=t.getData()[a];var n=t.getScale();var l=s.getDisplayValue();var o=l?l:""+s.getValue();var p=o+n;e.openStart("div",t.getId()+"-chart-item-"+a+"-value");e.class("sapSuiteCpMCChartItemValue");if(r[i]){e.class("sapSuiteCpMCSemanticColor"+s.getColor())}if(s.getTitle()){e.class("sapSuiteCpMCTitle")}e.openEnd();if(!isNaN(s.getValue())){e.text(p)}e.close("div")};t.extendMicroChartRenderer(s);return s},true);
//# sourceMappingURL=ComparisonMicroChartRenderer.js.map