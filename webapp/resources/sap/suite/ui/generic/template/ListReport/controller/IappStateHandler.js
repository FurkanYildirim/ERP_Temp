sap.ui.define(["sap/ui/base/Object","sap/ui/core/mvc/ControllerExtension","sap/ui/generic/app/navigation/service/NavError","sap/suite/ui/generic/template/listTemplates/listUtils","sap/ui/generic/app/navigation/service/SelectionVariant","sap/ui/comp/state/UIState","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/base/util/deepEqual","sap/base/util/extend","sap/base/util/isEmptyObject","sap/suite/ui/generic/template/genericUtilities/FeError","sap/ui/Device","sap/suite/ui/generic/template/listTemplates/semanticDateRangeTypeHelper","sap/suite/ui/generic/template/ListReport/controller/LegacyStateHandler","sap/suite/ui/generic/template/genericUtilities/testableHelper","sap/suite/ui/generic/template/js/StableIdHelper"],function(e,t,a,r,n,i,o,s,l,p,c,u,f,d,m,S){"use strict";var g="ListReport.controller.IappStateHandler";var v=new o(g);var y=v.getLogger();var b=v.Level;var D="sap.suite.ui.generic.template.customData",h="sap.suite.ui.generic.template.extensionData",V="sap.suite.ui.generic.template.genericData";function C(e,t){if(sap.ui.support){var a=y.getLevel();if(a<b.INFO){y.setLevel(b.INFO)}}var r;if(typeof t==="string"){r=t}else{r="";var n="";for(var i in t){r=r+n+i+": "+t[i];n="; "}}y.info(e,r,"sap.suite.ui.generic.template.ListReport.controller.IappStateHandler")}function O(e,a,o){var m=new d(a);var v;var b=new Promise(function(e){v=e});var O=[];var E=[];var F=a.byId(S.getStableId({type:"ListReportTable",subType:"SmartTable"}));if(F){O.push(o.oCommonUtils.getControlStateWrapper(F))}var P=a.byId(S.getStableId({type:"ListReportAction",subType:"SearchField"}));if(P){O.push(o.oCommonUtils.getControlStateWrapper(P))}var w=e.oMultipleViewsHandler.getGeneralContentStateWrapper();if(w){w.getLocalId=function(){return"$multipleViewsGeneralContent"};O.push(w)}if(a.getOwnerComponent().getSmartVariantManagement()&&!a.getOwnerComponent().getVariantManagementHidden()){E=O;O=[]}var N=e.oMultipleViewsHandler.getSFBVariantContentStateWrapper();if(N){N.getLocalId=function(){return"$multipleViewsSFBVariantContent"};E.push(N)}var I=[];function x(){I.forEach(function(e){e()})}var L={getLocalId:function(){return"$customFilters"},getState:function(){var e={appExtension:Object.create(null),adaptationExtensions:Object.create(null)};if(o.oComponentUtils.isDraftEnabled()){var r=o.oComponentUtils.getTemplatePrivateModel();e.editState=r.getProperty("/listReport/vDraftState")}a.getCustomAppStateDataExtension(e.appExtension);var n=true;var i=function(a,r){if(!(a instanceof t)){throw new c(g,"State must always be set with respect to a ControllerExtension")}if(!n){throw new c(g,"State must always be provided synchronously")}e.adaptationExtensions[a.getMetadata().getNamespace()]=r};a.templateBaseExtension.provideExtensionAppStateData(i);n=false;return e},setState:function(e){if(o.oComponentUtils.isDraftEnabled()){var r=o.oComponentUtils.getTemplatePrivateModel();r.setProperty("/listReport/vDraftState",e.editState)}a.restoreCustomAppStateDataExtension(e.appExtension);var n=true;var i=function(a){if(!(a instanceof t)){throw new c(g,"State must always be retrieved with respect to a ControllerExtension")}if(!n){throw new c(g,"State must always be restored synchronously")}return e.adaptationExtensions[a.getMetadata().getNamespace()]};a.templateBaseExtension.restoreExtensionAppStateData(i);n=false},attachStateChanged:function(e){if(a.byId("editStateFilter")){a.byId("editStateFilter").attachChange(e)}I.push(e)}};var A=o.oCommonUtils.getControlStateWrapper(e.oSmartFilterbar,{oCustomFiltersWrapper:L});var T=a.byId(S.getStableId({type:"ListReportPage",subType:"DynamicPage"}));var U=o.oCommonUtils.getControlStateWrapper(T);O.push(U);var M=e.oSmartFilterbar.getSmartVariant();if(M){var H=o.oCommonUtils.getControlStateWrapper(M,{managedControlWrappers:E.concat([A]),dynamicPageWrapper:U});O.push(H)}else{O.push(A)}function W(){var t=o.oComponentUtils.getTemplatePrivateModel();function a(e){t.setProperty("/generic/bDataAreShownInTable",e)}function r(){return t.getProperty("/generic/bDataAreShownInTable")}function n(e,t){if(e===r()){return}a(e);t()}return{getLocalId:function(){return"$dataLoaded"},setState:a,getState:r,attachStateChanged:function(t){e.oSmartFilterbar.attachSearch(n.bind(null,true,t));e.oSmartFilterbar.attachFilterChange(n.bind(null,false,t))}}}var J=W();O.push(J);O.forEach(function(e){e.attachStateChanged(Z)});var k=o.oServices.oApplication.getNavigationHandler();var R=a.getOwnerComponent().getSmartVariantManagement();var j=o.oComponentUtils.getSettings();if(!o.oComponentUtils.isStateHandlingSuspended()){e.oSmartFilterbar.setSuppressSelection(true)}var _=true;function B(e){J.setState(e)}function Q(){var e=o.oComponentUtils.getTemplatePrivateModel();return e.getProperty("/generic/bDataAreShownInTable")}function K(){e.oSmartFilterbar.search()}function $(){var e={};O.forEach(function(t){if(t.getLocalId()){e[t.getLocalId()]=t.getState()}});return{version:sap.ui.version,controlStates:e}}function G(e){if(o.oComponentUtils.isDraftEnabled()){var t=e["IsActiveEntity"];if(t&&t[0]){var a=o.oComponentUtils.getTemplatePrivateModel();a.setProperty("/listReport/vDraftState",t[0])}}}function q(e){if(R){var t=e["sap-ui-fe-variant-id"];if(t&&t[0]){M.setCurrentVariantId(t[0])}}else{var a=e["sap-ui-fe-variant-id"],r=e["sap-ui-fe-filterbar-variant-id"],n=e["sap-ui-fe-chart-variant-id"],i=e["sap-ui-fe-table-variant-id"];z(r&&r[0],n&&n[0],i&&i[0],a&&a[0])}}function z(t,a,r,n){if(t||n){M.setCurrentVariantId(t||n)}if(r||n){e.oPresentationControlHandler.setCurrentVariantId(r||n);e.oMultipleViewsHandler.setControlVariant(a,r)}}function X(e){a.restoreCustomAppStateDataExtension(e||{})}function Y(){if(!te()){return}e.refreshModel();if(u.system.phone){me()}J.setState(true);Z()}function Z(){C("changeIappState called",{bDataAreShownInTable:Q()});if(e.oSmartFilterbar.isDialogOpen()||_){return}o.oComponentUtils.stateChanged()}function ee(t){var a=e.oSmartFilterbar.determineMandatoryFilterItems(),r;for(var n=0;n<a.length;n++){if(a[n].getName().indexOf("P_DisplayCurrency")!==-1){if(t.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency")&&t.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency")[0]&&t.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency")[0].Low){r=t.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency")[0].Low;if(r){t.oSelectionVariant.addParameter("P_DisplayCurrency",r)}}break}}}function te(){var t=e.oSmartFilterbar.determineMandatoryFilterItems();var a=e.oSmartFilterbar.getFiltersWithValues();return t.every(function(e){return a.includes(e)})}function ae(t){var a=typeof t==="string"?JSON.parse(t):t;var r=a&&a.SortOrder;e.oPresentationControlHandler.applyNavigationSortOrder(r)}function re(e){pe(e.controlStates);if(Q()){K()}else{o.oComponentUtils.hidePlaceholder()}if(!te()){o.oComponentUtils.hidePlaceholder()}}function ne(t,r,n){q(r);G(r);if(t.presentationVariant!==undefined){ae(t.presentationVariant)}if(t.oSelectionVariant.getSelectOptionsPropertyNames().indexOf("DisplayCurrency")===-1&&t.oSelectionVariant.getSelectOptionsPropertyNames().indexOf("P_DisplayCurrency")===-1&&t.oSelectionVariant.getParameterNames().indexOf("P_DisplayCurrency")===-1){ee(t)}var i={viaExternalNavigation:true,selectionVariant:t.oSelectionVariant,urlParameters:r,selectedQuickVariantSelectionKey:n,semanticDates:(typeof t.semanticDates==="string"?JSON.parse(t.semanticDates):t.semanticDates)||{}};if(!e.oWorklistData.bWorkListEnabled){a.modifyStartupExtension(i);if(e.oSmartFilterbar.isCurrentVariantStandard()){i.semanticDates=f.addSemanticDateRangeDefaultValue(j,e.oSmartFilterbar,i.semanticDates,i.urlParameters||{},i.selectionVariant,true);i.semanticDates.Dates.forEach(function(e){i.selectionVariant.addSelectOption(e.PropertyName,"I","EQ","")})}De(i.selectionVariant,t.selectionVariant||"",true,i.semanticDates,false)}X();e.oMultipleViewsHandler.handleStartUpObject(i);Ve(e.oSmartFilterbar.isCurrentVariantStandard())}function ie(t,r){q(t);var i={viaExternalNavigation:false,selectionVariant:"",urlParameters:t,selectedQuickVariantSelectionKey:r,semanticDates:{}};var o=e.oSmartFilterbar.getUiState();var l=new n(JSON.stringify(o.getSelectionVariant()));ge(l);var p=JSON.parse(JSON.stringify(l));var c=o.getSemanticDates();i.selectionVariant=l;i.semanticDates=c;a.modifyStartupExtension(i);if(!(s(JSON.parse(JSON.stringify(i.selectionVariant)),p)&&s(i.semanticDates,c))){De(i.selectionVariant,"",true,i.semanticDates,true)}X();e.oMultipleViewsHandler.handleStartUpObject(i);if(!e.oWorklistData.bWorkListEnabled&&!e.oSmartFilterbar.getLiveMode()&&e.oSmartFilterbar.isCurrentVariantStandard()){i.semanticDates=f.addSemanticDateRangeDefaultValue(j,e.oSmartFilterbar,i.semanticDates||{},i.urlParameters,i.selectionVariant);i.semanticDates.Dates.forEach(function(e){i.selectionVariant.addSelectOption(e.PropertyName,"I","EQ","")})}Ve();M&&M.currentVariantSetModified(false)}function oe(e,t){return s(e.map(JSON.stringify).sort(),t.map(JSON.stringify).sort())}function se(t,i,o){q(i);var l=e.oSmartFilterbar.getUiState();var p=l.getSemanticDates();var c={viaExternalNavigation:false,selectionVariant:t.oSelectionVariant,urlParameters:i,selectedQuickVariantSelectionKey:o,semanticDates:(typeof t.semanticDates==="string"?JSON.parse(t.semanticDates):t.semanticDates)||p||{}};if(t.presentationVariant!==undefined){ae(t.presentationVariant)}var u=new n(JSON.stringify(l.getSelectionVariant()));ge(u);var d=JSON.parse(JSON.stringify(u));if(t.oSelectionVariant.getSelectOptionsPropertyNames().indexOf("DisplayCurrency")===-1&&t.oSelectionVariant.getSelectOptionsPropertyNames().indexOf("P_DisplayCurrency")===-1&&t.oSelectionVariant.getParameterNames().indexOf("P_DisplayCurrency")===-1){ee(t)}if(!e.oWorklistData.bWorkListEnabled){if(e.oSmartFilterbar.isCurrentVariantStandard()){a.modifyStartupExtension(c);c.semanticDates=f.addSemanticDateRangeDefaultValue(j,e.oSmartFilterbar,c.semanticDates,c.urlParameters,c.selectionVariant);c.semanticDates.Dates.forEach(function(e){c.selectionVariant.addSelectOption(e.PropertyName,"I","EQ","")});var m=e.oSmartFilterbar.getAllFilterItems().map(function(e){return e.getName()});var S=function(e){return m.includes(e.PropertyName)};var g=e.oSmartFilterbar.getAnalyticalParameters().map(function(e){return e.name});var v=function(e){return g.includes(e.PropertyName)};var y=r.getMergedVariants([u,c.selectionVariant]);var b=y.toJSONObject();var D=u.toJSONObject();if(!oe(D.SelectOptions.filter(S),b.SelectOptions.filter(S))||!oe(D.Parameters.filter(v),b.Parameters.filter(v))){De(y,t.selectionVariant,true,c.semanticDates,false);M.currentVariantSetModified(true)}}else{c.selectionVariant=u;c.semanticDates=p;a.modifyStartupExtension(c);if(!(s(JSON.parse(JSON.stringify(c.selectionVariant)),d)&&s(c.semanticDates,p))){De(c.selectionVariant,t.selectionVariant,true,c.semanticDates,false)}}}X();e.oMultipleViewsHandler.handleStartUpObject(c);Ve()}function le(t,r,n){C("fnAdaptToAppState called",{sNavType:n});e.oSmartFilterbar.setSuppressSelection(false);_=false;if(n===sap.ui.generic.app.navigation.service.NavType.hybrid){t=t.iAppState;t.controlStates=t.data.permanentEntries.permanentState.data.controlStates;re(t);return}if(n===sap.ui.generic.app.navigation.service.NavType.iAppState){re(t);return}var i=o.oComponentUtils.getSelectionInfo();var s=i&&i.pageEntitySet;var l=e.oMultipleViewsHandler.getPreferredKey(s);switch(n){case sap.ui.generic.app.navigation.service.NavType.initial:ie(r,l);break;case sap.ui.generic.app.navigation.service.NavType.xAppState:case sap.ui.generic.app.navigation.service.NavType.URLParams:if(t.bNavSelVarHasDefaultsOnly){se(t,r,l)}else{ne(t,r,l)}break;default:throw new c(g,"Invalid navigation type: "+n)}if(Q()){e.oSmartFilterbar.search();if(u.system.desktop){o.oCommonUtils.getControlStateWrapper(a.byId(S.getStableId({type:"ListReportPage",subType:"DynamicPage"}))).setHeaderState(a,true)}else{me()}}else{o.oComponentUtils.hidePlaceholder()}Z()}function pe(e){O.forEach(function(t){t.setState(e[t.getLocalId()])})}function ce(e){if(!e){return b.then(ue)}var t;if(p(e)){t=sap.ui.generic.app.navigation.service.NavType.initial}else{t=sap.ui.generic.app.navigation.service.NavType.iAppState;e=m.getStateInCurrentFormat(e)}var a=l({oDefaultedSelectionVariant:new n,oSelectionVariant:new n(e&&e.selectionVariant)},e);b.then(function(){le(a,{},t)});return b}function ue(){var e=new Promise(function(e){try{var t=k.parseNavigation();t.done(function(t,a,r){if(r!==sap.ui.generic.app.navigation.service.NavType.iAppState){le(t,a,r)}e()});t.fail(function(t,a,r){y.warning(t.getErrorCode()+"app state could not be parsed - continuing with empty state");le({},a,sap.ui.generic.app.navigation.service.NavType.initial);e()})}catch(t){le({},{},sap.ui.generic.app.navigation.service.NavType.initial);e()}});return e}function fe(t){if(e.oWorklistData.bWorkListEnabled&&t.getParameter("context")!=="SET_VM_ID"){K()}}function de(e){fe(e)}function me(){var e=a.getOwnerComponent().getModel("_templPriv");e.setProperty("/listReport/isHeaderExpanded",false)}function Se(t,a,r,n){var o=new i({selectionVariant:t,semanticDates:n});e.oSmartFilterbar.setUiState(o,{replace:a,strictMode:r})}function ge(e){[h,D,V].forEach(e.removeSelectOption.bind(e))}function ve(t,a,r){if(t&&(a!==""||r)){var n=t.getParameterNames().concat(t.getSelectOptionsPropertyNames());for(var i=0;i<n.length;i++){e.oSmartFilterbar.addFieldToAdvancedArea(n[i])}}}function ye(e,t,a){if(e.getParameter(t)&&!e.getParameter(a)){e.addParameter(a,e.getParameter(t))}if(e.getSelectOption(t)&&!e.getSelectOption(a)){var r=e.getSelectOption(t);r.forEach(function(t){e.addSelectOption(a,t.Sign,t.Option,t.Low,t.High)})}}function be(e){var t=a.getOwnerComponent().getModel().getMetaModel();var r=a.getOwnerComponent().getEntitySet();var n=t.getODataEntityType(t.getODataEntitySet(r).entityType);n.property.forEach(function(t){if(t["com.sap.vocabularies.Common.v1.EditableFieldFor"]){var a=t["com.sap.vocabularies.Common.v1.EditableFieldFor"].PropertyPath||t["com.sap.vocabularies.Common.v1.EditableFieldFor"].String;var r=t.name;ye(e,a,r);ye(e,r,a)}})}function De(t,a,r,n,i){be(t);if(r){e.oSmartFilterbar.clearVariantSelection()}ve(t,a,i);Se(t.toJSONObject(),r,false,n)}function he(){var t={loadDataOnAppLaunch:"ifAnyFilterExist"};var r=e.oMultipleViewsHandler.getOriginalEnableAutoBinding();if(r!==undefined&&r!==null){t.loadDataOnAppLaunch=r?"always":"never"}var n=a.getOwnerComponent().getDataLoadSettings();if(n&&n.loadDataOnAppLaunch===""){n.loadDataOnAppLaunch=undefined}return l(t,n)}function Ve(t){var r=e.oWorklistData.bWorkListEnabled||e.oSmartFilterbar.getLiveMode()||e.bLoadListAndFirstEntryOnStartup;var n=he().loadDataOnAppLaunch;if(!M||a.getOwnerComponent().getVariantManagementHidden()){r=r||n==="always";r=r||n==="ifAnyFilterExist"&&e.oSmartFilterbar.getFiltersWithValues().length>0}else{var i=(r||n!=="never")&&te();M&&M.setExecuteOnStandard(i);if(e.oSmartFilterbar.isCurrentVariantStandard()){var o=M.getExecuteOnStandard();if(i!==o){r=o}else{r=r||n==="always";r=r||n==="ifAnyFilterExist"&&e.oSmartFilterbar.getFiltersWithValues().length>0}}else{r=r||e.oSmartFilterbar.isCurrentVariantExecuteOnSelectEnabled()}}r=r||t;r=r&&te();J.setState(!!r)}return{areDataShownInTable:Q,setDataShownInTable:B,onSearchPressed:Y,customAppStateChange:x,changeIappState:Z,onSmartFilterBarInitialized:v,onAfterSFBVariantLoad:de,applyState:ce,getCurrentAppState:$,setFiltersUsingUIState:Se}}return e.extend("sap.suite.ui.generic.template.ListReport.controller.IappStateHandler",{constructor:function(e,t,a){l(this,O(e,t,a))}})});
//# sourceMappingURL=IappStateHandler.js.map