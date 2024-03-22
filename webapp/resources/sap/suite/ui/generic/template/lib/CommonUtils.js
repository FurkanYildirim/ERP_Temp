sap.ui.define(["sap/ui/base/Object","sap/ui/base/Event","sap/ui/core/mvc/ControllerExtension","sap/ui/model/Context","sap/ui/model/Filter","sap/m/MessageBox","sap/ui/generic/app/navigation/service/SelectionVariant","sap/suite/ui/generic/template/genericUtilities/controlHelper","sap/suite/ui/generic/template/genericUtilities/metadataAnalyser","sap/suite/ui/generic/template/genericUtilities/testableHelper","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/ui/model/analytics/odata4analytics","sap/base/util/extend","sap/base/util/deepExtend","sap/suite/ui/generic/template/genericUtilities/FeError","sap/suite/ui/generic/template/js/StableIdHelper","sap/suite/ui/generic/template/genericUtilities/ControlStateWrapperFactory","sap/suite/ui/generic/template/genericUtilities/oDataModelHelper","sap/ui/core/IconPool","sap/ui/export/util/Filter","sap/ui/model/odata/ODataUtils"],function(e,t,r,a,n,i,o,s,l,c,u,p,f,g,v,d,m,y,b,h,E){"use strict";var P="lib.CommonUtils";var S=new u(P).getLogger();var C={0:[{property:"IsActiveEntity",operator:"==",value:false},{property:"SiblingEntity/IsActiveEntity",operator:"==",value:null}],1:[{property:"IsActiveEntity",operator:"==",value:true},{property:"HasDraftEntity",operator:"==",value:false}],2:[{property:"IsActiveEntity",operator:"==",value:false}],3:[{property:"IsActiveEntity",operator:"==",value:true},{property:"SiblingEntity/IsActiveEntity",operator:"==",value:null},{property:"DraftAdministrativeData/InProcessByUser",operator:"!=",value:""}],4:[{property:"IsActiveEntity",operator:"==",value:true},{property:"SiblingEntity/IsActiveEntity",operator:"==",value:null},{property:"DraftAdministrativeData/InProcessByUser",operator:"==",value:""}],5:[{property:"IsActiveEntity",operator:"==",value:true}]};function D(e,t,a){var n=new m(e);var u=Object.create(null);function d(e){var t;if(s.isSmartTable(e)){t=e.getCustomToolbar()}else if(s.isSmartChart(e)){t=e.getToolbar()}if(t){var r=N(t);if(r&&r.annotatedActionIds){u[e.getId()]=JSON.parse(atob(r.annotatedActionIds))}if(r&&r.deleteButtonId){u[e.getId()].push({ID:r.deleteButtonId,RecordType:"CRUDActionDelete"})}if(r&&r.multiEditButtonId){u[e.getId()].push({ID:r.multiEditButtonId,RecordType:"CRUDActionMultiEdit"})}}}function D(e){var t=e.getId();if(!u[t]){d(e)}return u[t]||[]}function A(t){var r,a,n;r=e.getOwnerComponent().getModel().getMetaModel();a=r.getODataEntitySet(t);n=r.getODataEntityType(a.entityType);return n}function I(r){t.oApplication.attachControlToParent(r,e.getView())}function O(t,r,a){var n=function(e,t){if(e===t){return 0}var a=s.byId(e);var n=s.byId(t);if(!a){if(n){return 1}return e>t?1:-1}if(!n){return-1}if(r){var i=s.isTable(a);var o=s.isTable(n);if(i!==o){return i?1:-1}}var l=a.isFocusable();var c=n.isFocusable();if(l!==c){return l?-1:1}return e>t?1:-1};t=t.concat().sort(n);var i=e.getView();var o=t.find(function(e){var t;var r=a&&function(r){a(e,r,t);t=r};return s.isElementVisibleOnView(e,i,r)});return o}function T(r,a,n,i){return t.oApplication.getDialogFragmentForView(e.getView(),r,a,n,i)}function x(r,a,n,i,o){return t.oApplication.getDialogFragmentForViewAsync(e.getView(),r,a,n,i,o)}var M;function B(t,r,a){var n=e.getOwnerComponent();M=M||n.getModel("i18n").getResourceBundle();return M.getText(t,r,a)}function w(e,t,r,a){var n=r||e,i=t&&t!="|"?e+"|"+t:n;var o=B(i,a,true);if(!o&&i!=n){o=B(n,a)}return o}function R(t,r,a,n){var i=e.getOwnerComponent();var o=r.indexOf("::"+i.getEntitySet()+"--")+2;var s=r.substring(o,r.lastIndexOf("::")),s=s.replace(/--/g,"|").replace(/::/g,"|");return w(t,s,a,n)}function F(e,t){var t=t||e.getSelectionBehavior();if(t==="DATAPOINT"){return{dataPoints:e.getSelectedDataPoints().dataPoints,count:e.getSelectedDataPoints().count}}else if(t==="CATEGORY"){return{dataPoints:e.getSelectedCategories().categories,count:e.getSelectedCategories().count}}else if(t==="SERIES"){return{dataPoints:e.getSelectedSeries().series,count:e.getSelectedSeries().count}}}function N(e){var t={};if(e instanceof sap.ui.core.Element){e.getCustomData().forEach(function(e){t[e.getKey()]=e.getValue()})}return t}function V(e){var r,a;var n=z(e,true);var i=t.oPresentationControlHandlerFactory.getPresentationControlHandler(n).getSelectedContexts();var o=n.getModel();G(i,o,n);r=D(n);for(var s=0;s<r.length;s++){a=r[s];k(a,o,i,n)}}function k(t,r,n,i){var o;if(t.RecordType==="CRUDActionDelete"){var s=H(r,n,i);a.getTemplatePrivateModel().setProperty("/listReport/deleteEnabled",s);o=Promise.resolve(s)}else if(t.RecordType==="com.sap.vocabularies.UI.v1.DataFieldForAction"||t.RecordType==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){var l=r.getMetaModel();o=j(r,l,n,t.RecordType,t.Action,i)}else if(t.RecordType==="CRUDActionMultiEdit"){a.getTemplatePrivateModel().setProperty("/listReport/multiEditEnabled",n.filter(K).length>0)}var c=e.getView().byId(t.ID);if(c&&/generic\/controlProperties/.test(c.getBindingPath("enabled"))){o.then(U.bind(null,t.ID,"enabled"))}}function L(e){var r=Y(e);G(t.oPresentationControlHandlerFactory.getPresentationControlHandler(r).getSelectedContexts(),e.getModel(),r)}function U(e,t,r){var n=a.getTemplatePrivateModel();var i=n.getProperty("/generic/controlProperties/"+e);if(!i){i={};i[t]=r;n.setProperty("/generic/controlProperties/"+e,i)}else{n.setProperty("/generic/controlProperties/"+e+"/"+t,r)}}function j(e,t,r,a,n,i){var o,l,c,u;var p=false;if(a==="com.sap.vocabularies.UI.v1.DataFieldForAction"){o=t.getODataFunctionImport(n);c=o&&o["sap:action-for"];if(c&&c!==""&&c!==" "){if(r.length>0){u=o["sap:applicable-path"];if(u&&u!==""&&u!==" "){for(var f=0;f<r.length;f++){if(!r[f]||r[f].isTransient()){continue}l=e.getObject(r[f].getPath());if(l&&l[u]){p=true;break}}}else{p=true}}}else{p=true}}else if(a==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){if(De(r).length>0){p=true}else if(s.isSmartChart(i)){return i.getChartAsync().then(function(){return i.getDrillStackFilters().length>0})}}return Promise.resolve(p)}function H(e,t,r){if(t.length===0){return false}var a=_(r);var n=a&&a.Deletable&&a.Deletable.Path;return t.some(function(t){var r=e.getObject(t.getPath()+"/DraftAdministrativeData");var a=!(r&&r.InProcessByUser&&!r.DraftIsProcessedByMe);return a&&!t.isTransient()&&!(n&&!e.getProperty(n,t))})}function _(e){var t=e.getModel()&&e.getModel().getMetaModel();var r=t&&t.getODataEntitySet(e.getEntitySet());var a=r&&r["Org.OData.Capabilities.V1.DeleteRestrictions"];return a}function K(e){var r=e.getModel();var a=r.getObject(e.getPath()+"/DraftAdministrativeData");var n=y.analyseContext(e);var i=t.oApplication.isObjectInEditMode(n.entitySet,n.key);if(!a&&!i){var o=r.getMetaModel().getODataEntitySet(y.analyseContext(e).entitySet);var s=o["Org.OData.Capabilities.V1.UpdateRestrictions"]&&o["Org.OData.Capabilities.V1.UpdateRestrictions"].Updatable;if(s){if(s.Path){return!!r.getProperty(s.Path,e)}else if(s.Bool!=="false"){return true}}else{return true}}}function G(t,r,n){var i=W(n);var o=a.getTemplatePrivateModel();var s=o.getProperty("/generic/listCommons/breakoutActionsEnabled");if(i){var l=e.byId("template::IconTabBar");var c="";if(l){c=l.getSelectedKey()}J(s,i,t,r,c,n)}o.setProperty("/generic/listCommons/breakoutActionsEnabled",s)}function J(e,t,r,a,n,i){var o;for(var l in t){o=true;var c=t[l].id+(n&&!t[l].determining?"-"+n:"");if(i&&i.getId().indexOf("AnalyticalListPage")>-1){o=!!e[c].enabled}if(t[l].requiresSelection){if(r.length>0){if(i&&s.isSmartChart(i)){if(t[l].filter==="chart"){o=true}}else if(i&&s.isSmartTable(i)){if(t[l].filter!=="chart"){o=true}}if(t[l].applicablePath!==undefined&&t[l].applicablePath!==""){o=false;for(var u=0;u<r.length;u++){var p="";var f=t[l].applicablePath.split("/");if(f.length>1){for(var g=0;g<f.length-1;g++){p+="/"+f[g]}}var v=a.getObject(r[u].getPath()+p);var d=f[f.length-1];if(v[d]===true){o=true;break}}}}else if(s.isSmartChart(i)){if(i.getId().indexOf("AnalyticalListPage")>-1?t[l].filter==="chart":true){if(i.getDrillStackFilters().length>0){o=true}else{o=false}}}else{if(t[l].filter!=="chart"){o=false}}}e[c]={enabled:o}}}function W(e){var t=a.getControllerExtensions();var r=N(e).sectionId;if(!r){return t&&t["Actions"]}else{return t&&t.Sections&&t.Sections[r]&&t.Sections[r].Actions}}function z(e,t){var r=[s.isSmartTable,s.isSmartChart,s.isSmartList];if(!t){r.push(s.isMTable);r.push(s.isUiTable)}var a=function(e,t){return t(e)};for(var n=e;n;n=n.getParent&&n.getParent()){var i=r.some(a.bind(null,n));if(i){return n}}return null}function Y(e){var t=e;while(t){if(s.isSmartTable(t)||s.isSmartChart(t)||s.isSmartList(t)){return t}t=t.getParent&&t.getParent()}return null}function q(r){if(!t.oApplication.checkEtags(r)){var a=e.getOwnerComponent();var n=a.getModel();var i=n.getMetaModel().getODataEntitySet(r);if(e.getMetadata().getName()==="sap.suite.ui.generic.template.AnalyticalListPage.view.AnalyticalListPage"&&Q(n,i)){n.invalidateEntityType(i.entityType)}else{var o=function(e){return y.analyseContextPath(e,n).entitySet===r};n.invalidate(o)}var s=a.getId();var l=Object.create(null);l[s]=true;t.oApplication.refreshAllComponents(l);return true}return false}function Q(e,t){var r=new p.Model(p.Model.ReferenceByModel(e));var a=r.findQueryResultByName(t.name);var n=a&&a.getParameterization();return!!n}function Z(r,n,i){var o;if(a.isDraftEnabled()){o=t.oDraftController.isActiveEntity(r)?1:6}else{var s=e.getOwnerComponent();o=s.getModel("ui").getProperty("/editable")?6:1}if(i){t.oApplication.setObjectInEditMode(true)}a.navigateAccordingToContext(r,o,n)}function X(e){if(e instanceof sap.ui.generic.app.navigation.service.NavError){if(e.getErrorCode()==="NavigationHandler.isIntentSupported.notSupported"){i.show(B("ST_NAV_ERROR_NOT_AUTHORIZED_DESC"),{title:B("ST_GENERIC_ERROR_TITLE"),icon:i.Icon.ERROR})}else{i.show(e.getErrorCode(),{title:B("ST_GENERIC_ERROR_TITLE"),icon:i.Icon.ERROR})}}}function $(r,a){ge(function(){var a=t.oApplication.getNavigationHandler();var n={semanticObject:r.semanticObject,action:r.action};var i=a.mixAttributesAndSelectionVariant(r.parameters);if(typeof e.adaptNavigationParameterExtension==="function"){e.adaptNavigationParameterExtension(i,n)}Pe(r);t.oApplication.navigateExternal(r.semanticObject,r.action,i.toJSONString(),null,X)},Function.prototype,"LeaveApp")}function ee(t){var r=[],a,n,i;var o=e.getOwnerComponent();var s=o.getModel().getMetaModel();if(!t){return{}}var l=o.getAppComponent().getConfig().pages[0];if(!l){return{}}var c=function(e){i=s.getODataEntitySet(e.entitySet).entityType;n=s.getODataEntityType(i);a={};a={entitySet:e.entitySet,aKeys:s.getODataEntityType(i).key.propertyRef,navigationProperty:e.navigationProperty};for(var t=0,r=a.aKeys.length;t<r;t++){var o=0,l=n.property.length;for(o;o<l;o++){if(a.aKeys[t].name===n.property[o].name){a.aKeys[t].type=n.property[o].type;break}}}};var u=function(e,t){if(!t.pages){return r}for(var n=0,i=t.pages.length;n<i;n++){if(!t.pages[n]){break}if(e===t.pages[n].entitySet){c(t.pages[n]);r.splice(0,0,a);break}r=u(e,t.pages[n]);if(r.length>0){c(t.pages[n]);r.splice(0,0,a)}}return r};return u(t,l)}function te(e,t){var r,a,n,i;for(n=0,i=e.length;n<i;n++){if(e[n].navigationProperty){a+="/"+e[n].navigationProperty}else{a="/"+e[n].entitySet}for(var o=0,s=e[n].aKeys.length;o<s;o++){if(o===0){a+="(";r=""}else{r=","}var l=e[n].aKeys[o];switch(l.type){case"Edm.Guid":if(t.DraftAdministrativeData&&t.DraftAdministrativeData.DraftIsCreatedByMe){a+=r+l.name+"="+"guid'"+t.DraftAdministrativeData.DraftUUID+"'"}else{a+=r+l.name+"="+"guid'"+t[l.name]+"'"}break;case"Edm.Boolean":if(t.DraftAdministrativeData&&t.DraftAdministrativeData.DraftIsCreatedByMe){a+=r+l.name+"="+false}else{a+=r+l.name+"="+t[l.name]}break;case"Edm.Decimal":case"Edm.Int16":case"Edm.Int32":case"Edm.Int64":case"Edm.Byte":case"Edm.DateTimeOffset":case"Edm.SByte":var c=E.formatValue(t[l.name],l.type);a+=r+l.name+"="+c;break;default:if(typeof t[l.name]==="string"){a+=r+l.name+"="+"'"+t[l.name]+"'"}else{a+=r+l.name+"="+t[l.name]}break}if(o===s-1){a+=")"}}}return a}function re(e){var r=e.getParameter("originalId"),a=sap.ui.getCore().byId(r),n=z(a,true),i=Object.create(null);i.smartLink=a;if(s.isSmartTable(n)){var o=t.oPresentationControlHandlerFactory.getPresentationControlHandler(n);i.smartTable=n;i.column=o.getColumnForCell(a)}return i}function ae(e,t,r){var a={getSourceInfo:re.bind(null,e),oSelectionVariant:t};return!!r.beforeSmartLinkPopoverOpensExtension(a)}function ne(e,r,a,n){var i,o,s,l,c,u,p;var f=e.getParameters();var g=t.oApplication.getNavigationHandler();i=g.mixAttributesAndSelectionVariant({},r);if(ae(e,i,a)){return}var v=false;for(l in f.semanticAttributesOfSemanticObjects){v=v||l===f.semanticObject;var d=f.semanticAttributesOfSemanticObjects[l];for(s in d){if(!i.getSelectOption(s)){i.addParameter(s,"")}}c=i.getPropertyNames();u=i.getSelectOptionsPropertyNames();p=i.getParameterNames();for(var m=0,y=c.length;m<y;m++){var b=c[m];if(u.indexOf(b)<0&&p.indexOf(b)<0){delete d[b];i.removeSelectOption(b)}}}if(v){var h=f.semanticAttributesOfSemanticObjects[""];var E=f.semanticAttributesOfSemanticObjects[f.semanticObject];p=i.getParameterNames();p.forEach(function(e){i.removeParameter(e);if(!(e in h)){var t=E[e];t=typeof t==="undefined"||t===null?"":String(t);i.addParameter(e,t)}});i=g.mixAttributesAndSelectionVariant(E,i.toJSONString());i=ie(i,e.getSource(),n);var P={semanticObject:f.semanticObject,action:""};a.adaptNavigationParameterExtension(i,P);o=i.toJSONString()}delete f.semanticAttributes;g.processBeforeSmartLinkPopoverOpens(f,o)}function ie(t,r,a){var n;var i=[];var o=e.getOwnerComponent().getEntitySet();if(s.isSemanticObjectController(r)||s.isSmartTable(r)){n=r.getEntitySet()}else{var l=z(r);var c=l&&l.getParent();if(s.isSmartTable(c)){r=c;n=r.getEntitySet()}else{n=o}}i.push(n);var u=a&&a.oMultipleViewsHandler&&a.oMultipleViewsHandler.getMode&&a.oMultipleViewsHandler.getMode()==="multi";if(n!==o&&!u){i.push(o)}i.forEach(function(e){if(r){var a=r.getModel().getMetaModel();var n=a.getODataEntityType(a.getODataEntitySet(e).entityType);t.getPropertyNames().forEach(function(e){var r=a.getODataProperty(n,e);if(r&&(r["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"]&&r["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"].Bool!=="false"||r["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"]&&r["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"].Bool!=="false")){t.removeSelectOption(e)}})}});return t}function oe(r,a){var n=function(e){for(var t=0;t<e.length;t++){a(e[t].name)}};var i=e.getView().getModel().getMetaModel();var o=i.getODataEntitySet(r,false);var s=i.getODataEntityType(o.entityType,false);n(s.key.propertyRef);var l=t.oDraftController.getDraftContext();if(l.isDraftEnabled(r)){n(l.getSemanticKey(r));a("IsActiveEntity");a("HasDraftEntity");a("HasActiveEntity")}}function se(t,r,a,n){if(n&&a&&a.getAnalyticBindingPath&&a.getConsiderAnalyticalParameters()){try{var i=a.getAnalyticBindingPath();var o=t.getEntitySet();var s=t.getModel();var c=s.getMetaModel();var u=c.getODataEntitySet(o);var p=e.getOwnerComponent();var f=p.getAppComponent();var g=l.getParametersByEntitySet(f.getModel(),o);if(c.getODataEntityType(u.entityType)["sap:semantics"]!=="aggregate"){if(r){var v=r(u,g);i=v||i}}if(i){n(i)}}catch(e){S.warning("Mandatory parameters have no values")}}}function le(e,r,a){for(var n=0;n<r.length;n++){var i=r[n];var o=i.lastIndexOf("/");var s;if(o<0){if(t.oApplication.getNavigationProperty(e,i)){s=i}else{continue}}else{s=i.substring(0,o)}if(a.indexOf(s)===-1){a.push(s)}}}function ce(t,n,i){var o=t.getParameter("bindingParams"),s=t.getSource().getId();o.parameters=o.parameters||{};o.parameters.transitionMessagesOnly=a.getNoStateMessagesForTables();var l=function(e,t,a){if(n&&n[e]){var i=true;var o=function(){var a=arguments[0];if(!(a instanceof r)){throw new v(P,"Please provide a valid ControllerExtension in order to execute extension "+e)}if(!i){throw new v(P,"Extension "+e+" must be executed synchronously")}var n=Array.prototype.slice.call(arguments,1);t.apply(null,n)};n[e](o,a);i=false}};var c=function(r){if(!s||e.byId(s)===t.getSource()){o.filters.push(r)}};if(n.addTemplateSpecificFilters){n.addTemplateSpecificFilters(o.filters)}l("addExtensionFilters",c,s);var u=t.getSource();if(e.getMetadata().getName()!=="sap.suite.ui.generic.template.ObjectPage.view.Details"){se(u,n.resolveParamaterizedEntitySet,i,n.setBindingPath)}var p=u.getEntitySet();var f=o.parameters.select&&o.parameters.select.split(",")||[];var g=o.parameters.expand&&o.parameters.expand.split(",")||[];var d=function(r,a){if(r&&(!a||e.byId(a)===t.getSource())){var n=r.split(",");n.forEach(function(e){if(e&&f.indexOf(e)===-1){f.push(e)}})}};if(n.isMandatoryFiltersRequired){oe(p,d)}l("ensureExtensionFields",d,s);(n.addNecessaryFields||Function.prototype)(f,d,p);le(p,f,g);if(g.length>0){o.parameters.expand=g.join(",")}if(f.length>0){o.parameters.select=f.join(",")}}function ue(e,t,r){if(!e){return B("DRAFT_OBJECT")}else if(t){return B(r?"LOCKED_OBJECT":"UNSAVED_CHANGES")}else{return""}}function pe(){return new Promise(function(e){var t;x("sap.suite.ui.generic.template.fragments.DraftAdminDataPopover",{formatText:function(){var e=Array.prototype.slice.call(arguments,1);var t=arguments[0];if(!t){return""}if(e.length>0&&(e[0]===null||e[0]===undefined||e[0]==="")){if(e.length>3&&(e[3]===null||e[3]===undefined||e[3]==="")){return e.length>2&&(e[1]===null||e[1]===undefined||e[1]==="")?"":e[2]}else{return B(t,e[3])}}else{return B(t,e[0])}},closeDraftAdminPopover:function(){t.close()},formatDraftLockText:ue},"admin").then(function(r){t=r;e(t)})})}function fe(e,r,a,n){return t.oDataLossHandler.performIfNoDataLoss(e,r,n,true,true)}function ge(e,r,n,i){n=n||"LeavePage";if(a.isDraftEnabled()){return t.oPageLeaveHandler.performAfterDiscardOrKeepDraft(e,r,n,i,false)}else{return t.oDataLossHandler.performIfNoDataLoss(e,r,n,i,false)}}function ve(e,r){r=g({busy:{set:true,check:true},dataloss:{popup:true,navigation:false}},r);var n,i;var o=new Promise(function(e,t){n=e;i=t});var s=r.busy.set?function(){if(!a.isDraftEnabled()){t.oApplication.getBusyHelper().setBusy(o,false,{actionLabel:r.sActionLabel})}return e()}:e;var l=r.mConsiderObjectsAsDeleted?function(){t.oApplication.prepareDeletion(r.mConsiderObjectsAsDeleted);return s()}:s;var c=function(){var e;if(a.isDraftEnabled()){t.oApplication.getBusyHelper().setBusy(o,false,{actionLabel:r.sActionLabel});e=t.oApplicationController.synchronizeDraftAsync().then(function(){return l()})}else{e=r.dataloss.popup?ge(l,i,null,r.dataloss.navigation?"LeavePage":"Proceed",true):l()}if(e instanceof Promise){e.then(n,i)}else{n(e)}};t.oApplication.performAfterSideEffectExecution(c,r.busy.check&&i);return o}function de(e){var t=e.getId()+"-variant";var r=sap.ui.getCore().byId(t);var a=r.getDefaultVariantKey();return a===r.STANDARDVARIANTKEY?"":a}function me(e){var t=e.getId()+"-variant";var r=sap.ui.getCore().byId(t);var a=r.getDefaultVariantKey();return a===r.STANDARDVARIANTKEY?"":a}function ye(t){var r;var n=a.getTemplatePrivateModel();var i=e.getOwnerComponent();var o,l,c,u,p,g=[],v=[],d,m,y,b,h,E,P;var S,C;o=i.getAppComponent();l=sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService&&sap.ushell.Container.getService("CrossApplicationNavigation");c=n.getProperty("/generic/supportedIntents/");if(s.isSmartChart(t)){r=t.getToolbar()}else if(s.isSmartTable(t)){r=t.getCustomToolbar()}u=r.getContent();p=u.length;for(d=0;d<p;d++){m=N(u[d]);if(m.hasOwnProperty("SemanticObject")&&m.hasOwnProperty("Action")){y=m.SemanticObject;b=m.Action;h={semanticObject:y,action:b,ui5Component:o};g.push([h]);E=f({},h);E.bLinkIsSupported=false;v.push(E)}}if(g.length>0&&l){P=l.getLinks(g);P.done(function(e){c=n.getProperty("/generic/supportedIntents/");S=e.length;for(d=0;d<S;d++){if(e[d][0].length>0){v[d].bLinkIsSupported=true}y=v[d].semanticObject;b=v[d].action;C=n.getProperty("/generic/supportedIntents/"+y);if(!C){c[y]={};c[y][b]={visible:v[d].bLinkIsSupported}}else if(!C[b]){C[b]={visible:v[d].bLinkIsSupported}}else{C[b]["visible"]=v[d].bLinkIsSupported}}n.updateBindings()})}}function be(r,a){var n=a&&e.byId(a);var i=a&&!n?Promise.reject():new Promise(function(e,a){t.oApplication.performAfterSideEffectExecution(function(){var i=t.oApplication.getBusyHelper();if(i.isBusy()){a();return}if(n&&(!n.getVisible()||n.getEnabled&&!n.getEnabled())){a();return}var o=n?r(n):r();if(o instanceof Promise){o.then(e,a);i.setBusy(o)}else{e(o)}})});i.catch(Function.prototype);return i}function he(e,r,n,i,o){var s,l={};if(!r){s=[]}else if(Array.isArray(r)){s=r}else{s=[r]}if(n){l.urlParameters=n}if(i&&i.bInvocationGroupingChangeSet){l.operationGrouping="com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"}l.triggerChanges=a.isDraftEnabled();a.executeBeforeInvokeActionFromExtensionAPI(o);var c=t.oApplicationController.invokeActions(e,s,l);if(i&&i.bSetBusy){a.getBusyHelper().setBusy(c)}c.then(a.executeAfterInvokeActionFromExtensionAPI.bind(null,o));return c}function Ee(e){var r=t.oApplication.getChevronNavigationRefreshBehaviour(e);if(r!==Object.create(null)){t.oViewDependencyHelper.setRefreshBehaviour(r)}}function Pe(e){var r=t.oApplication.getComponentRefreshBehaviour(e);t.oViewDependencyHelper.setRefreshBehaviour(r)}function Se(e,t){var r=t.getModel();var a=t.getPath().split("/")[1];var n=r.oData[a];if(e){var i=n&&n[e]&&n[e].__ref;var o=r.oData[i];return o}else{return n}}function Ce(t,r){if(t&&t.__metadata){var n=t.__metadata.edit_media;var i=t.__metadata.content_type;var o=n&&new URL(n);var s=o&&o.pathname;var l=b.getIconForMimeType(i);var c={url:s,fileType:i,icon:l};var u=a.getTemplatePrivateModel();var p=e.getOwnerComponent().getEntitySet();if(!u.getProperty("/generic/controlProperties/fileUploader")){u.setProperty("/generic/controlProperties/"+"fileUploader",{})}if(r){u.setProperty("/generic/controlProperties/"+"fileUploader/"+r,c)}else{u.setProperty("/generic/controlProperties/"+"fileUploader/"+p,c)}}}function De(e){return e.filter(function(e){return!e||!e.isTransient()})}function Ae(t,r,a,n){var i=e.getOwnerComponent().getModel().getMetaModel();var o=l.getNavigationPropertyRelationship(i,t,r);var s=l.getNavigationPropertyRelationship(i,a,n);return o.relationship===s.relationship&&o.fromRole===s.toRole&&o.toRole===s.fromRole}function Ie(t){var r=t.getSource();return s.isButton(r)?r.data():sap.ui.getCore().byId(e.createId(N(r)["ActionId"])).data()}function Oe(t){if(!a.isDraftEnabled()){return}var r=e.getView().byId("editStateFilter");if(!r){return}var n=r.getSelectedKey(),i=C[n];i.forEach(function(e){var r=t.findIndex(function(t){return e.property===t.property&&e.operator===t.rawValues[0].operator&&e.value===t.rawValues[0].value&&t.rawValues.length===1});if(r!==-1){t.splice(r,1)}});var o=r.getLabels().at(0).getText(),s=r.getSelectedItem().getText(),l={operator:"==",value:s};var c=new h("editStateFilter",l,o);t.push(c)}function Te(t,r){var a=t.getSmartFilterId();if(!a){return}var n=e.getView().byId(a);var i=n.getAnalyticalParameters();if(!i.length){return}var s=n&&n.getUiState({allFilters:false});var l=s?JSON.stringify(s.getSelectionVariant()):"{}";var c=new o(l);i.forEach(function(e){var t=c.getParameter(e.name);if(!t){return}if(e.type==="Edm.DateTime"||e.type==="Edm.DateTimeOffset"){t=new Date(t)}var a=new h(e.name,{operator:"==",value:t},e.fieldLabel);a.setType(e.ui5Type);r.push(a)})}var G=c.testable(G,"fillEnabledMapForBreakoutActions");var z=c.testable(z,"getOwnerControl");var D=c.testable(D,"fnGetToolbarCustomData");var ie=c.testable(ie,"removePropertiesFromNavigationContext");return{getPositionableControlId:O,getMetaModelEntityType:A,getText:B,getSpecializedText:w,getContextText:R,getNavigationKeyProperties:ee,mergeNavigationKeyPropertiesWithValues:te,executeGlobalSideEffect:function(){if(a.isDraftEnabled()){var r=e.getView();var n=e.getOwnerComponent();var i=n.getAppComponent();var o=i.getForceGlobalRefresh();var l=n.getModel("ui");r.attachBrowserEvent("keydown",function(e){var n=e.target.type==="search";var i=e.target.type==="textarea";var c=e.target.id.indexOf("rowAction")>-1;var u=e.target.id.indexOf("ColumnListItem")>-1;if(e.keyCode===13&&e.ctrlKey!==true&&l.getProperty("/editable")&&!n&&!i&&!c&&!u){t.oApplication.addSideEffectPromise(new Promise(function(n,i){var l,c,u,p=false,f={draftRootContext:a.getMainComponentDetails().bindingContext,callPreparationOnDraftRoot:true};c=s.getControlWithFocus();while(c){if(s.isSmartField(c)){u=c.getBindingContext&&c.getBindingContext();if(u.isTransient&&u.isTransient()){return n()}}else if(s.isOverflowToolbar(c)||s.isButton(c)||s.isLink(c)||s.isMultiInputField(c)&&(c._sTypedInValue&&c._sTypedInValue.length>0)){p=true}else if(s.isSmartForm(c)){l=c;break}else if(s.isSmartTable(c)){break}c=c.getParent()}if(p){f={}}u=u||c&&c.getBindingContext&&c.getBindingContext()||r.getBindingContext();var g=l?l.check():Promise.resolve();g.then(function(){setTimeout(function(){var r=t.oApplicationController.executeSideEffects(u,null,null,o,f);r.then(function(){n();setTimeout(function(){var t=document.getElementById(e.target.id);if(t){t.focus()}})},i)})})}))}})}},setEnabledToolbarButtons:V,setEnabledFooterButtons:L,fillEnabledMapForBreakoutActions:G,getBreakoutActions:W,getSelectionPoints:F,getDeleteRestrictions:_,getSmartTableDefaultVariant:de,getSmartChartDefaultVariant:me,setPrivateModelControlProperty:U,removePropertiesFromNavigationContext:ie,navigateFromListItem:Z,navigateExternal:$,semanticObjectLinkNavigation:ne,getCustomData:function(e){var t=e.getSource().getCustomData();var r={};for(var a=0;a<t.length;a++){r[t[a].getKey()]=t[a].getValue()}return r},getCustomDataText:function(e){return new Promise(function(t,r){e.getCustomData().forEach(function(e){var r=e.getKey();if(r==="text"){var a=e.getBinding("value");var n=!a&&e.getBindingInfo("value");if(!a&&!n){t(e.getValue());return}var i=function(e){var r=e.getSource();r.detachChange(i);t(r.getExternalValue());return};if(a){if(!a.isInitial()){t(a.getExternalValue());return}a.attachChange(i)}else{n.events={change:i};for(var o=0;o<n.parts.length;o++){n.parts[o].targetType="string"}}}})})},onBeforeRebindTableOrChart:ce,formatDraftLockText:ue,showDraftPopover:function(e,t){pe().then(function(r){var a=r.getModel("admin");a.setProperty("/IsActiveEntity",e.getProperty("IsActiveEntity"));a.setProperty("/HasDraftEntity",e.getProperty("HasDraftEntity"));r.bindElement({path:e.getPath()+"/DraftAdministrativeData"});if(r.getBindingContext()){r.openBy(t)}else{r.getObjectBinding().attachDataReceived(function(){r.openBy(t)})}})},getContentDensityClass:function(){return t.oApplication.getContentDensityClass()},attachControlToView:I,getDialogFragment:T,getDialogFragmentAsync:x,fnProcessDataLossOrDraftDiscardConfirmation:ge,processDataLossTechnicalErrorConfirmation:fe,securedExecution:ve,getOwnerControl:z,getOwnerPresentationControl:Y,refreshModel:q,getElementCustomData:N,triggerAction:function(r,a,n,i){t.oDataLossHandler.performIfNoDataLoss(function(){t.oCRUDManager.callAction({functionImportPath:n.Action,contexts:r,sourceControlHandler:i,label:n.Label,operationGrouping:""}).then(function(r){if(r&&r.length>0){var n=r[0];var i=n.response&&n.response.context||n.context;var o=i&&(!n.actionContext||i.getPath()!==n.actionContext.getPath());if(o){t.oViewDependencyHelper.setMeToDirty(e.getOwnerComponent(),a)}}})},Function.prototype,"Proceed",undefined,false)},checkToolbarIntentsSupported:ye,executeIfControlReady:be,invokeActionsForExtensionAPI:he,isContextEditable:K,setExternalChevronRefreshBehaviour:Ee,setComponentRefreshBehaviour:Pe,getStreamData:Se,setStreamData:Ce,getControlStateWrapper:n.getControlStateWrapper,filterActiveContexts:De,checkInverseNavigation:Ae,getCustomDataFromEvent:Ie,getControlStateWrapperById:n.getControlStateWrapperById,handleError:X,transformTechnicalPropsOnExportedFile:Oe,includeEntitySetParametersToExportedFile:Te}}return e.extend("sap.suite.ui.generic.template.lib.CommonUtils",{constructor:function(e,t,r){f(this,D(e,t,r))}})});
//# sourceMappingURL=CommonUtils.js.map