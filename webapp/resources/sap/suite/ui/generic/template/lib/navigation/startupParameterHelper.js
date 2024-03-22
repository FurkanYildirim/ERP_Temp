sap.ui.define(["sap/base/util/extend","sap/base/util/isEmptyObject","sap/base/util/each","sap/m/MessageBox","sap/ui/core/date/UI5Date","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/analytics/odata4analytics","sap/ui/generic/app/util/ModelUtil","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/suite/ui/generic/template/genericUtilities/oDataModelHelper","sap/suite/ui/generic/template/genericUtilities/testableHelper","sap/suite/ui/generic/template/lib/CRUDHelper","sap/base/util/deepExtend","sap/suite/ui/generic/template/genericUtilities/CacheHelper"],function(e,t,r,n,o,a,i,u,l,s,c,p,v,f,m){"use strict";var g="lib.navigation.startupParameterHelper";var d=new s(g).getLogger();function y(e,t){return{mode:e&&t&&t!==e?"inconsistent":t||e||"display",force:!!t}}function b(e,t,r,n){var o=E(t,r,"Edm.DateTime");T(o,n);var a=e.oAppComponent.getModel("_templPrivGlobal");a.setProperty("/generic/forceFullscreenCreate",true)}function R(e,r){if(t(r)){return}e.forEach(function(e){var t=r[e.name];if(t){var n=t[0];n=n.toLowerCase().replace(/(guid')([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(')/,"$2");if(!n.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)){n=n.replace(/([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})/,"$1-$2-$3-$4-$5")}t[0]=n}})}function T(e,r){if(t(r)){return}e.forEach(function(e){var t=r[e.name];if(t&&typeof t[0]==="string"&&e["sap:display-format"]==="Date"){var n=o.getInstance(t[0]);t[0]=n}})}function E(e,t,r){var n=e.getMetaModel();var o=n.getODataEntitySet(t);var a=o&&o.entityType;var i=n.getODataEntityType(a);var u=i&&i.property||[];var l=[];u.forEach(function(e){if(r===e.type){l.push(e)}});return l}function C(e,r,n){if(t(n)){return}var o=E(e,r,"Edm.Guid");R(o,n)}function P(e){var t=e.oAppComponent.getInboundParameters();return t?Object.keys(t).filter(function(e){return t[e].useForCreate}):[]}function N(e,t){var r;var n=P(e);for(var o=0;o<n.length;o++){var a=n[o];var i=t[a];if(i&&i.length===1){r=r||Object.create(null);r[a]=i[0]}}return r}function x(e,t,r){var n=e.getODataEntityType(e.getODataEntitySet(t).entityType);n.property.forEach(function(e){if(e["com.sap.vocabularies.Common.v1.EditableFieldFor"]){var t=e["com.sap.vocabularies.Common.v1.EditableFieldFor"].PropertyPath||e["com.sap.vocabularies.Common.v1.EditableFieldFor"].String;var n=e.name;if(r[t]&&!r[n]){r[n]=r[t]}if(r[n]&&!r[t]){r[t]=r[n]}}})}function h(e,t){return!(e.page.navigation&&e.page.navigation[t.mode])}function S(e,t){return!!e&&e.every(function(e){var r=e.name||e.PropertyPath;var n=t[r]||[];return n.length===1})}function O(e){var t=c.splitCanonicalPath(e);return t.key}function I(e,t,r,n,o){if(r.noKey){return{treeNode:r,navigationPossible:true,keyValue:""}}if(r.noOData&&r.page.routingSpec.semanticKey){var a=n[r.page.routingSpec.semanticKey];return a&&{treeNode:r,navigationPossible:true,keyValue:a[0]}}var i=t.getODataEntitySet(r.entitySet);if(!i){return null}var u=t.getODataEntityType(i.entityType);var l=S(u.key.propertyRef,n);if(r.isDraft||!l||!o){var s=u["com.sap.vocabularies.Common.v1.SemanticKey"];if(S(s,n)){return{treeNode:r,key:s,isSemantic:true}}}return o&&u.key.propertyRef&&l&&{treeNode:r,navigationPossible:true,keyValue:O(e.createKey(r.entitySet,n))}}function A(e,t,r,n,o,a,i){n.children.forEach(function(n){var u=r.mEntityTree[n];if(u.page.component.settings&&u.page.component.settings.allowDeepLinking&&h(u,a)){var l=I(e,t,u,o,false);if(l){i[u.sRouteName]=l;A(e,t,r,u,o,a,i)}}})}function F(e,t,r,n,o){var a=Object.create(null);var i=t.mEntityTree[r];if(i&&!(i.page.component.settings&&i.page.component.settings.allowDeepLinking===false)&&h(i,o)){var u=e.getMetaModel();for(var l=i;l.level>0;l=t.mRoutingTree[l.parentRoute]){var s=I(e,u,l,n,true);if(s){a[l.sRouteName]=s}else{a=Object.create(null)}}if(o.mode==="display"&&a[i.sRouteName]){A(e,u,t,i,n,o,a)}}a.root={treeNode:t.mRoutingTree.root,navigationPossible:true,keyValue:""};return a}function w(e,t){var r=t.key.map(function(t){var r=t.PropertyPath;var n=e[r][0];return new a(r,i.EQ,n)});if(t.treeNode.isDraft){var n=new a({filters:[new a("IsActiveEntity","EQ",false),new a("SiblingEntity/IsActiveEntity","EQ",null)],and:false});r.push(n)}return new a(r,true)}function _(e,t,n){var o=n.treeNode.entitySet;var a="/"+o;try{var i=new u.Model(u.Model.ReferenceByModel(e));var l=i.findQueryResultByName(o);var s=new u.QueryResultRequest(l);var c=l&&l.getParameterization();var p=false;if(c){s.setParameterizationRequest(new u.ParameterizationRequest(c));var v=c.getAllParameterNames();r(v,function(){if(t.hasOwnProperty(this)){p=true;s.getParameterizationRequest().setParameterValue(this,t[this][0])}});for(var f=0;f<v.length;f++){if(v[f].startsWith("P_")){var m=v[f].substr(2);if(t.hasOwnProperty(m)){p=true;s.getParameterizationRequest().setParameterValue(v[f],t[m][0])}}}if(p){a=s.getURIToQueryResultEntitySet()}}}catch(e){d.info(e.name+":"+e.message)}return a}function D(e){if(!(e&&e.results)){return null}var t;e.results.some(function(e){t=e;return e.IsActiveEntity});return t}function M(e,t,r){var n=w(t,r);var o=_(e,t,r);return new Promise(function(t){e.read(o,{filters:[n],success:function(r){var n=D(r);var o=n&&e.getKey(n);var a=o&&O(o);t(a)},error:function(){t()}})})}function k(e,t,n,o){var a=Object.keys(n).filter(function(e){return!n[e].navigationPossible});var i=a.map(function(e){var r=n[e];return M(t,o,r)});return Promise.all(i).then(function(t){for(var o=0;o<a.length;o++){var i=n[a[o]];i.keyValue=t[o]}var u=function(e){var t=n[e];if(t.navigationPossible===undefined){t.navigationPossible=!!t.keyValue&&u(t.treeNode.parentRoute)}return t.navigationPossible};var l;r(n,function(e){if(u(e)){var t=n[e].treeNode;l=!l||l.level<t.level?t:l}});var s=[];for(var c=l;c;c=c.level&&e.mRoutingTree[c.parentRoute]){s[c.level]=n[c.sRouteName].keyValue}var p=Object.create(null);if(e.oFlexibleColumnLayoutHandler){e.oFlexibleColumnLayoutHandler.adaptAppStatesForExternalNavigation(l,p)}var v={treeNode:l,keys:s,appStates:p};return e.oNavigationControllerProxy.navigateToIdentity(v,true,1).then(Function.prototype)})}function L(e){var t=e.oAppComponent.getInboundParameters();return t?Object.keys(t).filter(function(e){return t[e].useForTargetResolution}):[]}function U(e,t,r){if(t==="create"&&e.mRoutingTree.root.page.component.settings&&e.mRoutingTree.root.page.component.settings.creationEntitySet){return Promise.resolve(e.mRoutingTree.root.page.component.settings.creationEntitySet)}var n=L(e);if(n.length){for(var o in e.mRoutingTree){var a=e.mRoutingTree[o].page.component.settings;if(a&&a.targetResolution){var i=a.targetResolution;for(var u in i){for(var l=0;l<n.length;l++){if(n[l]===u&&i[u]===(r[u]&&r[u][0])){return Promise.resolve(e.mRoutingTree[o].entitySet)}}}}}}return e.myIntentPromise?e.myIntentPromise.then(function(t){var r=e.mRoutingTree.root.children;for(var n=0;n<r.length;n++){var o=r[n];if(e.mEntityTree[o].semanticObject===t.semanticObject){return o}}return e.mRoutingTree.root.entitySet}):Promise.resolve(e.mRoutingTree.root.entitySet)}function H(e,t,r,n){t=f({},t);b(e,r,n,t);var o=N(e,t);var a=e.oAppComponent.getTransactionController().getDraftController();var i=a.getDraftContext().isDraftEnabled(n);if(i){var u=e.mEntityTree[n]||e.mRoutingTree.root;e.oNavigationControllerProxy.prepareHostView(u);var l=e.oNavigationControllerProxy.oRouter.getTargets();l.display(u.sRouteName);return u.componentCreated.then(function(t){var i=e.componentRegistry[t.getId()];return i.viewRegistered.then(function(){var t=m.getInfoForContentIdPromise(n,r,e.oAppComponent.getId(),i.utils.getRootExpand);return t.then(function(t){var u=t.contentIdRequestPossible?t.parametersForContentIdRequest.sRootExpand:null;var l=i.oController;var s=e.oAppComponent.getApplicationController();var c=!!(e.mRoutingTree.root.page.component.settings&&e.mRoutingTree.root.page.component.settings.useNewActionForCreate);var p={sRootExpand:u,oController:l,oApplicationController:s,bUseNewActionForCreate:c};var f=v.create(a,n,"/"+n,r,e.oApplicationProxy,o,p,i.oControllerUtils.oCommonUtils);return f.then(function(t){var r=Object.create(null);if(e.oFlexibleColumnLayoutHandler){var o=e.mEntityTree[n];e.oFlexibleColumnLayoutHandler.adaptAppStatesForExternalNavigation(o,r)}return e.oNavigationControllerProxy.navigateToSubContext(t,true,4,null,r).then(Function.prototype)},function(t){return{title:e.getText("ST_GENERIC_ERROR_TITLE"),text:t.messageText,description:"",icon:"sap-icon://message-error"}})})})})}var s=Object.create(null);if(e.oFlexibleColumnLayoutHandler){e.oFlexibleColumnLayoutHandler.adaptAppStatesForExternalNavigation(e.mEntityTree[n],s)}return e.oNavigationControllerProxy.navigateForNonDraftCreate(n,o,null,s).then(Function.prototype)}function j(e,t,r,n,o){var a={};var i=t.parameter?t.parameter.length:0;for(var u=0;u<i;u++){var s=t.parameter[u];var c=s.mode==="In"&&r[s.name]&&r[s.name][0];if(c){a[s.name]=c}}d.debug("Call function import "+t.name+" on startup");e.callFunction("/"+t.name,{success:function(r,a){var i=new l(e);var u=i.getContextFromResponse(r);if(u){d.debug("Function import "+t.name+" called successfully");n(u)}else{d.warning("Function import "+t.name+" did not return a valid context");o()}},error:o,method:"POST",expand:r.expand,urlParameters:a})}function V(e,t,r,n){t=f({},t);b(e,r,n,t);return new Promise(function(o){var a=function(t){o({title:e.getText("ST_ERROR"),text:t&&t.messageText||e.getText("ST_GENERIC_UNKNOWN_NAVIGATION_TARGET"),icon:"sap-icon://message-error",description:""})};var i=r.getMetaModel().getODataEntitySet(n);var u=i["com.sap.vocabularies.Common.v1.DraftRoot"];if(u&&u.NewAction){var l=r.getMetaModel().getODataFunctionImport(u.NewAction.String.split("/")[1]);if(l){var s=function(t){e.oNavigationControllerProxy.navigateToSubContext(t,true,4).then(o.bind(null,null))};j(r,l,t,s,a);return}}a()})}function B(t,r,o,a,i){var u=e({},r);x(a.getMetaModel(),o,u);var l=F(a,t,o,u,i);var s;for(var c in l){if(c!=="root"){s=l[c];break}}if(s){var p=t.oAppComponent.getTransactionController();var f=s.isSemantic?"":"/"+a.createKey(o,u);var m=s.isSemantic&&s.key;var g=v.edit(p,o,f,a,t,t.oNavigationControllerProxy.fnInitializationResolve,m,u);return g.then(function(e){var r=Object.create(null);if(t.oFlexibleColumnLayoutHandler){var n=t.mEntityTree[o];t.oFlexibleColumnLayoutHandler.adaptAppStatesForExternalNavigation(n,r)}return t.oNavigationControllerProxy.navigateToSubContext(e.context,true,2,null,r).then(Function.prototype)},function(e){if(e.lockedByUser){if(i.force){return{title:t.getText("LOCKED_OBJECT_POPOVER_TITLE"),text:t.getText("LOCKED_OBJECT_POPOVER_TITLE"),description:t.getText("ST_GENERIC_LOCKED_OBJECT_POPOVER_TEXT",[e.lockedByUser]),icon:"sap-icon://message-error"}}return k(t,a,l,u)}if(e.draftAdminReadResponse){return null}return new Promise(function(e){var r=t.getText("ST_GENERIC_ERROR_NOT_AUTORIZED_EDIT");n.warning(r,{onClose:function(){k(t,a,l,u).then(e)}})})})}return Promise.resolve()}function K(t,r,n,o,a){var i=e({},r);x(o.getMetaModel(),n,i);var u=F(o,t,n,i,a);return k(t,o,u,i)}function G(e,t){var r=e.oAppComponent.getInboundParameters();if(!r){d.error("No inbound parameters configured -> mode 'callUnboundAction' cannot be used");return null}var n=null;var o=function(e,t){n=e[t];if(n){d.debug("Use function import "+n+" as implementation for "+t)}else{d.warning("No function import configured as implementation for "+t)}return n};for(var a in r){var i=r[a];var u=i.useForActionResolution;d.debug("Inbound parameter "+a+" will be checked");if(!u){d.debug("Inbound parameter "+a+" is not used for action resolution -> ignore");continue}var l=t[a];if(!l){d.warning("Startup parameters do not specify a value for inbound parameter "+a);continue}if(l.some(o.bind(null,u))){break}d.warning("No function import could be derived from inbound parameter "+a)}return n}function q(e,t,r){var n=G(e,t);var o=n&&r.getMetaModel();var a=o&&o.getODataFunctionImport(n);if(!a||a["sap:action-for"]){d.error(a?"specified action "+n+" is bound":"no suitable action could be determined");return null}var i=e.mEntityTree[a.entitySet];if(!i||i.level!==1){d.error("No top-level detail page configured for entity set "+a.entitySet);return null}var u=o.getODataEntitySet(a.entitySet);var l=u&&u["com.sap.vocabularies.Common.v1.DraftRoot"];var s=0;if(l){var c="/"+n;var p=l.NewAction&&l.NewAction.String&&l.NewAction.String.endsWith(c)||(l.AdditionalNewActions||[]).some(function(e){return e.String&&e.String.endsWith(c)});if(p){var v=(a.parameter||[]).find(function(e){return e.name==="ResultIsActiveEntity"});s=v&&v.mode==="In"&&t.ResultIsActiveEntity&&t.ResultIsActiveEntity[0]==="true"?1:4}}return{action:a,treeNode:i,displayMode:s}}function z(e,t,r){var n=q(e,t,r);if(!n){d.error("mode is callUnboundAction, but no suitable action could be identified -> navigate to root");var o={treeNode:e.mRoutingTree.root,keys:[""],appStates:Object.create(null)};return e.oNavigationControllerProxy.navigateToIdentity(o,true,1).then(Function.prototype)}var a=new Promise(function(o){var a=o.bind(null,null);var i=function(t){var r=Object.create(null);if(e.oFlexibleColumnLayoutHandler){e.oFlexibleColumnLayoutHandler.adaptAppStatesForExternalNavigation(n.treeNode,r)}return e.oNavigationControllerProxy.navigateToSubContext(t,true,n.displayMode,null,r).then(a)};var u=function(){d.error(n.action.name+" was not successfully called -> navigate to root");var t={treeNode:e.mRoutingTree.root,keys:[""],appStates:Object.create(null)};return e.oNavigationControllerProxy.navigateToIdentity(t,true,1).then(a)};var l=m.getInfoForContentIdPromise(n.treeNode.sRouteName,r,e.oAppComponent.getId());l.then(function(e){var o=e.contentIdRequestPossible?e.parametersForContentIdRequest.sRootExpand:null;t.expand=o;j(r,n.action,t,i,u)})});e.oBusyHelper.setBusy(a);e.oNavigationControllerProxy.preloadComponent(n.treeNode.sRouteName);return a}function Q(e,t){var r=t&&t.route&&t.route.length===1&&t.route[0];if(r){e.oNavigationControllerProxy.navigate(r,true);return Promise.resolve()}var n=t&&t.preferredMode&&t.preferredMode[0];var o=t&&t.mode&&t.mode[0];var a=y(n,o);var i=a.mode==="callUnboundAction"?Promise.resolve():U(e,a.mode,t);return i.then(function(r){var i=e.oAppComponent.getModel();C(i,r,t);switch(a.mode){case"create":return H(e,t,i,r);case"createWithContext":return V(e,t,i,r);case"edit":return B(e,t,r,i,a);case"display":return K(e,t,r,i,a);case"callUnboundAction":return z(e,t,i);default:break}return{title:e.getText("ST_GENERIC_ERROR_TITLE"),text:e.getText("ST_GENERIC_ERROR_TITLE"),description:e.getText("PARAMETER_COMBINATION_NOT_SUPPORTED",[o,n]),icon:"sap-icon://message-error",replaceURL:true}})}var C=p.testableStatic(C,"startupParameterHelper_fnTransformStartupParameters");var U=p.testableStatic(U,"startupParameterHelper_fnDetermineEntitySetForStartup");return{parametersToNavigation:Q}});
//# sourceMappingURL=startupParameterHelper.js.map