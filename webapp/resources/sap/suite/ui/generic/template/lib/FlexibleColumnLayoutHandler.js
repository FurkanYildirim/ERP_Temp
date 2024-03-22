sap.ui.define(["sap/ui/base/Object","sap/f/FlexibleColumnLayoutSemanticHelper","sap/f/library","sap/base/util/extend","sap/suite/ui/generic/template/genericUtilities/controlHelper"],function(e,t,r,n,a){"use strict";var o=r.LayoutType;var i=2;var l=["begin","mid","end"];var u=["fullScreen","exitFullScreen","closeColumn"];var s=["messagePageBeginColumn","messagePageMidColumn","messagePageEndColumn"];function f(e){return l[e]?e:i}function v(e){return l[f(e)]+"ColumnPages"}function c(e){for(var t=0;t<l.length;t++){e(s[t],v(t))}}function d(e){return s[f(e)]}function L(e){return l[f(e)]}function m(e){var t;if(e instanceof sap.ui.table.Table){t=e.getRows()}else if(e instanceof sap.m.Table||e instanceof sap.m.List){t=e.getItems()}return t}function C(e){var t=m(e);var r=t?t[0]:false;return r}function p(e){return e&&(Array.isArray(e.FCLLayout)?e.FCLLayout.sort()[0]:e.FCLLayout)||""}function y(e,r){var n=r.oTemplateContract;var i=n.oAppComponent.getFlexibleColumnLayout();var s=t.getInstanceFor(e,i);var m;var y;var g;var N=Object.create(null);var b=sap.ui.Device.system.phone?1:i.maxColumnsCount||3;var F=b>1&&i.initialColumnsCount===2;var T;var h=function(){var e=s.getDefaultLayouts();return[F?e.defaultTwoColumnLayoutType:e.defaultLayoutType,e.defaultTwoColumnLayoutType,e.defaultThreeColumnLayoutType]}();var P=i.displayNextObjectAfterDelete===true;function S(e){return e.fCLLevel===1||e.fCLLevel===2||e.level===0&&F}function R(e){if(e.fCLLevel===3||b===1||e.fCLLevel===0&&e.level>0){return 1}var t=i.initialColumnsCount||1;var r=Math.max(e.fCLLevel+1,t);return sap.ui.Device.system.tablet&&r>2?2:r}function x(e,t,r,n){var a=R(n);e.showBeginColumn=n.fCLLevel===0||a>1;e.showMidColumn=n.fCLLevel===1||a>1;e.showEndColumn=n.fCLLevel>1;if(a===1){e.target=t}else if(n.level===0){T=n.page.pages[0].entitySet;e.target=[t,T]}else{e.target=r.concat([t])}return v(n.fCLLevel)}function I(e,t){if(e===o.OneColumn&&F){return false}var r=t&&n.mRoutingTree[t];var a=r&&r.defaultLayoutType;if(a){return e===a}return e===h[0]||e===h[1]||e===h[2]}function E(e,t,a){var o=n.mRoutingTree[a];return o.componentCreated.then(function(n){return r.activateOneComponent(t,e,n)})}function A(e){var t=r.getCurrentIdentity();if(!t){return null}var a={};var o=true;for(var i=t.treeNode;o;i=n.mRoutingTree[i.parentRoute]){var l=i.fCLLevel;var u=L(l);a[u]={route:i.sRouteName,path:e?"-":i.getPath(2,t.keys),isVisible:l>2||m.columnsVisibility[u+"Column"]};o=l===1||l===2;e=false}return a}function V(e,t){var a=A(e.isNonDraftCreate);if(!a){return Promise.resolve()}var o=[];var i=t||a;for(var l in i){if(i[l]){var u=a[l];if(u.isVisible){o.push(E(e,u.path,u.route))}else{var s=n.oTemplatePrivateGlobalModel.getProperty("/generic/routeLevel");var f=n.mRoutingTree[u.route];var v=s===f.level?2:3+U(y);r.setVisibilityOfRoute(u.route,v)}}}return Promise.all(o).then(r.afterActivation)}function M(){return!(m.columnsVisibility.beginColumn?m.columnsVisibility.midColumn:m.columnsVisibility.midColumn&&m.columnsVisibility.endColumn)}function B(e){if(!m&&!e){return}var t=s.getCurrentUIState();var a=r.getCurrentIdentity();var i=a&&a.treeNode;if(a&&y!==t.layout){var f=I(t.layout,i.sRouteName)?null:t.layout;r.navigateByExchangingQueryParam("FCLLayout",f);return}var v=!e&&{};var c=false;l.forEach(function(e){var r=e+"Column";if(v){var a=m&&m.columnsVisibility[r]!==t.columnsVisibility[r];v[e]=a;c=c||a}if(e!=="begin"){var o={};u.forEach(function(e){o[e]=t.actionButtonsInfo[r][e]!==null});n.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/"+e+"ActionButtons",o)}});m=t;if(a){var d=M();var L=i.level-(i.fCLLevel===2&&!m.columnsVisibility.endColumn);var C=L-(L>1&&!d)-(m.columnsVisibility.endColumn&&m.columnsVisibility.beginColumn&&L>2);n.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/isVisuallyFullScreen",d);n.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/highestViewLevel",L);n.oTemplatePrivateGlobalModel.setProperty("/generic/FCL/lowestDetailViewLevel",C)}var p=r.getActiveComponents();p.forEach(function(e){var t=N[e];var r=y;var a=n.componentRegistry[e];if(r===o.ThreeColumnsMidExpanded){var i=n.mRoutingTree[a.route];if(i.fCLLevel===0){r=o.ThreeColumnsEndExpanded}}if(t!==r){N[e]=r;if(t){a.utils.layoutChanged()}}});if(c||e){return V(e||r.getActivationInfo(),v)}}var w=false;function O(t){for(var a=t.treeNode;a.fCLLevel===1||a.fCLLevel===2;){a=n.mRoutingTree[a.parentRoute];r.prepareHostView(a)}if(F&&t.treeNode.level===0){var i=n.mRoutingTree[T];r.prepareHostView(i)}var l=function(){if(S(t.treeNode)){y=k(t);if(!y){switch(t.treeNode.fCLLevel){case 0:var a=s.getNextUIState(0).columnsVisibility;if(a.midColumn){y=h[1]}else{y=h[0];r.navigateByExchangingQueryParam("FCLLayout",y)}break;case 1:y=h[1];break;case 2:y=h[2];break;default:}}}else{y=t.treeNode.fCLLevel===0?h[0]:o.EndColumnFullScreen}e.setLayout(y);e.setAutoFocus(false);e.setRestoreFocusOnBackNavigation(true);if(t.treeNode.fCLLevel===1||t.treeNode.fCLLevel===2){var i=s.getCurrentUIState();if(i.columnsVisibility.midColumn){var l=1-i.columnsVisibility.beginColumn;for(var u=t.treeNode;u.fCLLevel>l;){u=n.mRoutingTree[u.parentRoute];t.componentsDisplayed[u.sRouteName]=1;u.display()}}}};if(w){l();return Promise.resolve()}return s.whenReady().then(function(){w=true;l()})}function D(e){return B(e)}function k(e){return p(e.appStates)||e.treeNode.defaultLayoutType||h[f(e.treeNode.fCLLevel)]}function H(e,t,r){if(!I(t,r)){e.FCLLayout=t}}function U(e){return e===o.EndColumnFullScreen||e===o.MidColumnFullScreen}function j(e){return e===o.ThreeColumnsBeginExpandedEndHidden||e===o.ThreeColumnsMidExpandedEndHidden}function G(e,t,n,a){var o={treeNode:e,keys:t,appStates:a};var i=r.getApplicableStateForIdentityAddedPromise(o);n.push(i)}function Q(e,t,r,a){H(e,r,t.sRouteName);var o=[];if(!j(r)){G(t,a,o,e)}if(!U(r)){for(var i=t;i.fCLLevel>0;){i=n.mRoutingTree[i.parentRoute];G(i,a,o,e)}}return Promise.all(o)}function q(e){return U(y)?J(e.fCLLevel):e.defaultLayoutType||s.getNextUIState(e.fCLLevel).layout}function K(e,t){var r=t.treeNode.fCLLevel===1&&e&&e.treeNode.parentRoute===t.treeNode.sRouteName&&e.treeNode.fCLLevel===2?m.actionButtonsInfo.endColumn.closeColumn:q(t.treeNode);return Q(t.appStates,t.treeNode,r,t.keys)}function z(e,t,r){var n;if(e.treeNode.fCLLevel===t.treeNode.fCLLevel){n=y}else if(e.treeNode.fCLLevel===2){n=m.actionButtonsInfo.endColumn.closeColumn}else{n=q(t.treeNode)}return Q(r,t.treeNode,n,t.keys)}function J(e){if(e===0){return o.OneColumn}else if(e===1){return o.MidColumnFullScreen}else if(e===2){return o.EndColumnFullScreen}else{return""}}function W(e,t){var a=n.mRoutingTree[e];if(!S(a)){return null}var o=g||a.defaultLayoutType||s.getNextUIState(a.fCLLevel).layout;H(t,o,e);g=null;if(U(o)){return null}var i=[];for(var l=a.fCLLevel;l>0;l--){var u=a.parentRoute;i.push(r.addUrlParameterInfoForRoute(u,t));a=n.mRoutingTree[u]}return Promise.all(i)}function X(e,t){if(e.treeNode.fCLLevel===0||e.treeNode.fCLLevel===3){return true}var r=k(e);var n=k(t);return U(r)===U(n)}function Y(e,t,o){var i=function(){var i=L(e.fCLLevel);var l=m.actionButtonsInfo[i+"Column"][t];var u=o?n.mRoutingTree[e.parentRoute]:e;var s=r.getCurrentIdentity();var f=Object.create(null);if(t==="fullScreen"||t==="exitFullScreen"){n.oApplicationProxy.setNextFocus(function(){var e=t==="fullScreen"?"exitFullScreen":"fullScreen";var r=n.componentRegistry[s.treeNode.componentId];setTimeout(function(){a.focusControl(r.oController.createId(e))})})}var v=Q(f,u,l,s.keys);var c=v.then(function(){r.navigateToIdentity({treeNode:u,keys:u===s.treeNode?s.keys:s.keys.slice(0,u.level+1),appStates:f})});n.oBusyHelper.setBusy(c)};if(o){var l=n.oNavigationControllerProxy.getCurrentIdentity();if(l.treeNode.isDraft&&l.treeNode.level===1){n.oPageLeaveHandler.performAfterDiscardOrKeepDraft(i,Function.prototype,"LeavePage")}else{n.oDataLossHandler.performIfNoDataLoss(i,Function.prototype,"LeavePage")}}else{n.oApplicationProxy.performAfterSideEffectExecution(i,true)}}function Z(e){return{onCloseColumnPressed:Y.bind(null,e,"closeColumn",true),onFullscreenColumnPressed:Y.bind(null,e,"fullScreen",false),onExitFullscreenColumnPressed:Y.bind(null,e,"exitFullScreen",false)}}n.oTemplatePrivateGlobalModel.setProperty("/generic/FCL",{});function $(t){y=s.getNextUIState(t).layout;e.setLayout(y)}function _(){return!M()}function ee(e,t){var a=0;for(var o in t){var i=n.mRoutingTree[o];if(i.level>=e.viewLevel&&t[o]===1){if(i.level===e.viewLevel){a=i.fCLLevel}t[o]=5+(i.level>e.viewLevel)}}$(a);var l=r.oRouter.getTargets();var u=d(a);l.display(u)}function te(e,t){if(!S(t)){return}var r=J(t.fCLLevel);if(I(r,t.sRouteName)){return}e.FCLLayout=r}function re(e,t,r){if(r&&r.appStates&&r.appStates.FCLLayout){e.FCLLayout=r.appStates.FCLLayout}else{delete e.FCLLayout}}function ne(e,t){if(e.page.defaultLayoutTypeIfExternalNavigation&&!I(e.page.defaultLayoutTypeIfExternalNavigation,e.sRouteName)){t.FCLLayout=e.page.defaultLayoutTypeIfExternalNavigation}else{delete t.FCLLayout}}function ae(e){return e.treeNode.fCLLevel==0||e.treeNode.fCLLevel==3||U(k(e))}function oe(e){return!ae(e)}function ie(){return b}function le(e,t){if(!F){return}var n=false;var a=s.getNextUIState(0).columnsVisibility;if(a.midColumn){var i=r.getCurrentIdentity();var l=i&&i.treeNode;n=l&&l.level===0&&p(i.appStates)!==o.OneColumn}if(n){if(e){t(e)}else{r.navigateByExchangingQueryParam("FCLLayout",o.OneColumn)}}}function ue(){return P}function se(){return F}function fe(e,t){if(a.isSmartTable(e)){e=e.getTable()}else if(a.isSmartList(e)){e=e.getList()}var r=C(e);le(r,t)}function ve(e){if(e>2){g=""}else{g=J(e)}}function ce(e){var t={};if(e.fCLLevel===1||e.fCLLevel===2){t.oActionButtonHandlers=Z(e)}if(e.level===0){t.handleDataReceived=se&&se()?fe:Function.prototype;t.isListAndFirstEntryLoadedOnStartup=se}t.isNextObjectLoadedAfterDelete=ue;return t}function de(e){var t=e||U(y);for(var a=e||r.getCurrentIdentity().treeNode;a;a=!t&&a.fCLLevel&&n.mRoutingTree[a.parentRoute]){var o={aggregation:v(a.fCLLevel)};n.oNavigationHost.hidePlaceholder(o);if(a.level===0){var i=r.oRouter.getTargets();var l=i.getTarget("root");delete l.placeholder}}}e.attachStateChange(B.bind(null,false));function Le(e){return q(e)===J(e.fCLLevel)}return{hidePlaceholder:de,adaptRoutingInfo:x,createMessagePageTargets:c,displayMessagePage:ee,handleBeforeRouteMatched:O,handleRouteMatched:D,areIdentitiesLayoutEquivalent:X,getAppStatesPromiseForNavigation:K,getSpecialDraftCancelPromise:z,getFCLAppStatesPromise:W,adaptBreadCrumbUrlParameters:te,adaptPreferredLayout:re,isAppTitlePrefered:_,hasIdentityFullscreenLayout:ae,hasNavigationMenuSelfLink:oe,getMaxColumnCountInFCL:ie,isNextObjectLoadedAfterDelete:ue,getFclProxy:ce,isListAndFirstEntryLoadedOnStartup:se,setStoredTargetLayoutToFullscreen:ve,adaptAppStatesForExternalNavigation:ne,willBeOpenedInFullscreen:Le}}return e.extend("sap.suite.ui.generic.template.lib.FlexibleColumnLayoutHandler",{constructor:function(e,t){n(this,y(e,t))}})});
//# sourceMappingURL=FlexibleColumnLayoutHandler.js.map