/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/collaboration/ActivityBase","sap/fe/core/controllerextensions/collaboration/CollaborationCommon","sap/fe/core/converters/MetaModelConverter","sap/m/MessageBox"],function(t,e,n,o,i,s){"use strict";var r={};var c=o.getActivityKeyFromPath;var a=o.CollaborationUtils;var l=o.Activity;var d=n.isCollaborationConnected;var g=n.initializeCollaboration;var f=n.endCollaboration;var u=n.broadcastCollaborationMessage;const p="/collaboration/myActivity";const C="/collaboration/activeUsers";const v="/collaboration/activities";const h="$auto.sync";const y=function(t){const e=t.getModel("internal");return d(e)};r.isConnected=y;const M=function(t,e,n,o,i,s){if(y(t)){const r=t.getModel("internal");const c=Array.isArray(n)?n.join("|"):n;const a=s===null||s===void 0?void 0:s.join("|");const d=r.getProperty(p);if(e===l.LiveChange){if(d===c){return}else{r.setProperty(p,c)}}else{if(e===l.Undo&&d===null){return}r.setProperty(p,null)}u(e,c,r,o,i,a)}};r.send=M;const P=function(t){return t.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL")};const b=function(t){const e=(t===null||t===void 0?void 0:t.getBindingContext)&&t.getBindingContext();return!!(e&&P(e))};r.isCollaborationEnabled=b;const m=async function(t){const e=t.getModel("internal");const n=a.getMe(t);if(!n){return}const o=t.getBindingContext();const i=P(o);const s=o.getModel().getServiceUrl();if(!i){return}const r=await o.requestProperty("DraftAdministrativeData/DraftUUID");if(!r){return}g(n,i,r,s,e,e=>{x(e,t)});e.setProperty(p,null)};r.connect=m;const A=function(t){const e=t.getModel("internal");f(e)};r.disconnect=A;function x(t,e){var n;const o=e.getModel("internal");let i=o.getProperty(C);let s;let r;const d=R(e,t.clientContent);t.userAction=t.userAction||t.clientAction;const g={id:t.userID,name:t.userDescription,initials:a.formatInitials(t.userDescription),color:a.getUserColor(t.userID,i,[])};let f=g;switch(t.userAction){case l.Join:case l.JoinEcho:if(i.findIndex(t=>t.id===g.id)===-1){i.unshift(g);o.setProperty(C,i)}if(t.userAction===l.Join){u(l.JoinEcho,o.getProperty(p),o)}if(t.userAction===l.JoinEcho){if(t.clientContent){t.userAction=l.LiveChange;x(t,e)}}break;case l.Leave:i=i.filter(t=>t.id!==g.id||t.me);o.setProperty(C,i);const h=o.getProperty(v)||{};const y=function(t){if(Array.isArray(t)){return t.filter(t=>t.id!==g.id)}else{for(const e in t){t[e]=y(t[e])}return t}};y(h);o.setProperty(v,h);break;case l.Change:D(e,t);break;case l.Create:I(e,t);break;case l.Delete:O(e,t);break;case l.Activate:E(e,t.clientContent,a.getText("C_COLLABORATIONDRAFT_ACTIVATE",g.name));break;case l.Discard:E(e,t.clientContent,a.getText("C_COLLABORATIONDRAFT_DISCARD",g.name));break;case l.Action:k(e,t);break;case l.LiveChange:f=g;f.key=c(t.clientContent);let M="";const P=d.split("/");for(let t=1;t<P.length-1;t++){M+=`/${P[t]}`;if(!o.getProperty(v+M)){o.setProperty(v+M,{})}}s=o.getProperty(v+d);s=(n=s)!==null&&n!==void 0&&n.slice?s.slice():[];s.push(f);o.setProperty(v+d,s);break;case l.Undo:s=o.getProperty(v+d);r=c(t.clientContent);o.setProperty(v+d,s.filter(t=>t.key!==r));break}}function E(e,n,o){A(e);s.information(o);e.getBindingContext().getBinding().resetChanges().then(function(){T(n,e)}).catch(function(){t.error("Pending Changes could not be reset - still navigating to active instance");T(n,e)})}function D(t,e){const n=e.clientContent.split("|");const o=t.getModel().getMetaModel();const i=t.getModel("internal");n.forEach(t=>{var e;const n=o.getMetaPath(t);const s=c(t);let r=i.getProperty(v+n)||[];r=((e=r)===null||e===void 0?void 0:e.filter)&&r.filter(t=>t.key!==s);if(r){i.setProperty(v+n,r)}});const s=w(t);const r=s.getBindingContext();const a=n.map(e=>B(t,e));s.getController().editFlow.updateDocument(r,Promise.all(a))}async function B(e,n){const o=e.getModel().getMetaModel();const s=o.getMetaContext(n);const r=i.getInvolvedDataModelObjects(s);const c=n.substring(0,n.lastIndexOf("/"));const l=L(e,c);const d=c.substring(0,c.lastIndexOf("("));const g=d.substring(0,d.lastIndexOf("/"));const f=g?L(e,g):undefined;if(!l&&!f){return}try{const t=[];const i=a.getAppComponent(e).getSideEffectsService();if(l){const e=o.getMetaPath(l.getPath());const s=o.getMetaPath(n).replace(e,"").slice(1);t.push(i.requestSideEffects([s],l,h))}const s=i.computeFieldGroupIds(r.targetEntityType.fullyQualifiedName,r.targetObject.fullyQualifiedName);if(s.length){const n=e.getController();const o=n._sideEffects.getSideEffectsMapForFieldGroups(s,l||f);Object.keys(o).forEach(e=>{const i=o[e];t.push(n._sideEffects.requestSideEffects(i.sideEffects,i.context,h))})}await Promise.all(t)}catch(e){t.error("Failed to update data after change:"+e);throw e}}function O(t,e){const n=w(t);const o=n.getBindingContext();const i=o.getPath();const r=e.clientContent.split("|");const c=r.find(t=>i.startsWith(t));if(c){s.information(a.getText("C_COLLABORATIONDRAFT_DELETE",e.userDescription),{onClose:()=>{const e=o.getModel().getKeepAliveContext(c);e.setKeepAlive(false);const i=S(t,r[0]);n.getController().editFlow.updateDocument(n.getBindingContext(),i);n.getController()._routing.navigateBackFromContext(e)}})}else{const e=S(t,r[0]);n.getController().editFlow.updateDocument(n.getBindingContext(),e)}}function I(t,e){const n=w(t);const o=e.clientContent.split("|");const i=S(t,o[0]);n.getController().editFlow.updateDocument(n.getBindingContext(),i)}async function S(e,n){const o=a.getAppComponent(e);const i=n.substring(0,n.lastIndexOf("/"));const s=L(e,i);if(s){try{const t=[];const e=s.getModel().getMetaModel();const i=e.getMetaPath(n);const r=e.getMetaPath(s.getPath());const c=i.replace(`${r}/`,"");const a=o.getSideEffectsService();t.push(a.requestSideEffects([c],s,h));t.push(a.requestSideEffectsForNavigationProperty(c,s,h));await Promise.all(t)}catch(e){t.error("Failed to update data after collection update:"+e)}}}function k(t,e){var n;const o=w(t);const i=e.clientContent.split("|");const s=e.clientTriggeredActionName||"";const r=(n=e.clientRequestedProperties)===null||n===void 0?void 0:n.split("|");const c=e.clientRefreshListBinding==="true";let a=[];if(c){a.push(S(t,i[0]))}else{a=i.map(e=>F(t,e,s,r))}o.getController().editFlow.updateDocument(o.getBindingContext(),Promise.all(a))}async function F(t,e,n,o){const s=L(t,e);if(!s){return}const r=a.getAppComponent(t);const c=r.getSideEffectsService();const l=c.getODataActionSideEffects(n,s);const d=[];if(l){var g;if((g=l.pathExpressions)!==null&&g!==void 0&&g.length){d.push(c.requestSideEffects(l.pathExpressions,s,h))}}if(o&&o.length>0){const n=t.getModel().getMetaModel();const r=R(t,e);const a=i.getInvolvedDataModelObjects(n.getContext(r));const l=a.targetEntityType.entityProperties.map(t=>t.name).filter(t=>o.includes(t));if(l.length>0){d.push(c.requestSideEffects(l,s,h))}}await Promise.all(d)}function L(t,e){if(!e){return undefined}const n=[];while(!e.endsWith(")")){n.unshift(e);e=e.substring(0,e.lastIndexOf("/"))}n.unshift(e);const o=e.substring(0,e.lastIndexOf("("));let i;let s=w(t).getBindingContext();while(s&&!i){var r;if(n.indexOf(s.getPath())>=0){i=s}s=(r=s.getBinding())===null||r===void 0?void 0:r.getContext()}if(i){return i}const c=w(t).getBindingContext().getModel();const a=c.getAllBindings().find(t=>{const e=t.isRelative()?t.getResolvedPath():t.getPath();return t.isA("sap.ui.model.odata.v4.ODataListBinding")&&e===o});i=a===null||a===void 0?void 0:a.getAllCurrentContexts().find(t=>n.indexOf(t.getPath())>=0);return i}function T(t,e){const n=w(e);const o=e.getModel().bindContext(t).getBoundContext();n.getController().routing.navigate(o)}function w(t){const n=a.getAppComponent(t);return e.getCurrentPageView(n)}function R(t,e){let n="";if(e){const o=e.split("|")[0];n=t.getModel().getMetaModel().getMetaPath(o)}return n}return{connect:m,disconnect:A,isConnected:y,isCollaborationEnabled:b,send:M}},false);
//# sourceMappingURL=ActivitySync.js.map