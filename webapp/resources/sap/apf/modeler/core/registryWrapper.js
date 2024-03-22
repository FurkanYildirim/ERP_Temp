/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.define(["sap/apf/utils/exportToGlobal","sap/ui/thirdparty/jquery"],function(t,jQuery){"use strict";function e(t){function e(e){var r=[];t.each(function(t,i){if(i.type===e){r.push(i)}});return r}this.getItem=function(e){return t.getItem(e)};this.getSteps=function(){var t=e("step");t=jQuery.merge(t,e("hierarchicalStep"));return t};this.getCategories=function(){return e("category")};this.getFacetFilters=function(){if(t.getItem(sap.apf.core.constants.existsEmptyFacetFilterArray)===true){return{emptyArray:true}}return e("facetFilter")};this.getNavigationTargets=function(){return e("navigationTarget")}}t("sap.apf.modeler.core.RegistryWrapper",e);return e});
//# sourceMappingURL=registryWrapper.js.map