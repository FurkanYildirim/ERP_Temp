/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_omit","sap/base/util/restricted/_pick","sap/base/util/UriParameters","sap/ui/core/Core","sap/ui/fl/Change","sap/ui/fl/Layer","sap/ui/fl/Utils","sap/ui/fl/apply/_internal/flexObjects/CompVariant","sap/ui/fl/apply/_internal/flexObjects/CompVariantRevertData","sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory","sap/ui/fl/apply/_internal/flexObjects/RevertData","sap/ui/fl/apply/_internal/flexObjects/States","sap/ui/fl/apply/_internal/flexObjects/UpdatableChange","sap/ui/fl/apply/_internal/flexState/FlexState","sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger","sap/ui/fl/registry/Settings","sap/ui/fl/write/_internal/Storage","sap/ui/fl/write/_internal/Versions","sap/ui/fl/write/api/Version"],function(e,t,n,a,r,i,o,s,c,p,u,f,l,v,g,d,y,C,h){"use strict";function S(e,t){var n=m("/draftFilenames",t);if(n){return e.getState()===r.states.NEW||n.includes(e.getId())}return true}function m(e,t){var t={reference:o.normalizeReference(t.reference),layer:t.layer};if(C.hasVersionsModel(t)){return C.getVersionsModel(t).getProperty(e)}return undefined}function V(e,t){var n=e.getFlexObjectMetadata?e.getFlexObjectMetadata().changeType:e.getChangeType();if(!["defaultVariant","updateVariant"].includes(n)){return false}var a=e.getLayer()===t.layer;var r=e.getPackage();var i=!r||r==="$TMP";return a&&i&&S(e,t)}function x(e,t){if(t.isVariant()){return e.variants}var n=t.getChangeType();switch(n){case"defaultVariant":return e.defaultVariants;case"standardVariant":return e.standardVariants;default:return e.changes}}function O(e,t){for(var n=0;n<e.length;n++){if(e[n].fileName===t.fileName){e.splice(n,1,t);break}}}function T(e,t,n){return y.update({flexObject:e.convertToFileContent?e.convertToFileContent():e.getDefinition(),layer:e.getLayer(),transport:e.getRequest(),parentVersion:n}).then(function(t){if(t&&t.response){e.setResponse(t.response);if(n){C.onAllChangesSaved({reference:t.response.reference,layer:t.response.layer})}}else{e.setState(f.PERSISTED)}}).then(function(){var n=x(t.changes.comp,e);var a=e.convertToFileContent?e.convertToFileContent():e.getDefinition();O(n,a);return a})}function D(e,t){for(var n=e.length-1;n>=0;n--){var a=e[n].fileName||e[n].getId()&&e[n].getId();if((a||e[n].getId())===t){e.splice(n,1);break}}}function b(e,t){delete t.byId[e.getId()];if(e.getChangeType()==="standardVariant"){t.standardVariantChange=undefined}else{D(x(t,e),e.getId())}}function I(e,t,n,a){var r=e.convertToFileContent?e.convertToFileContent():e.getDefinition();return y.remove({flexObject:r,layer:e.getLayer(),transport:e.getRequest(),parentVersion:a}).then(function(){b(e,t)}).then(function(){D(x(n.changes.comp,e),r.fileName);return r})}function E(e){var t={};if(typeof e.texts==="object"){Object.keys(e.texts).forEach(function(n){t[n]={value:e.texts[n],type:"XFLD"}})}return t}function R(e){return e&&[f.NEW,f.DIRTY,f.DELETED].includes(e.getState())}function U(e){return e.variants.concat(e.changes).concat(e.defaultVariants).concat(e.standardVariantChange)}function F(e){if(e.layer){return e.layer}if(e.isUserDependent){return i.USER}var t=n.fromQuery(window.location.search).get("sap-ui-layer")||"";t=t.toUpperCase();if(t){return t}if(!e.fileType==="variant"){return i.CUSTOMER}var a=d.getInstanceOrUndef().isPublicLayerAvailable();return a?i.PUBLIC:i.CUSTOMER}function N(e){var t=v.getCompVariantsMap(e.reference)._getOrCreate(e.persistencyKey);return t.byId[e.id]}function j(e){if(e instanceof s){e.removeAllRevertData()}}function M(e,t){e.storeExecuteOnSelection(t.executeOnSelection);e.storeFavorite(t.favorite);e.storeContexts(t.contexts);e.storeName(t.name);e.storeContent(t.content||e.getContent());return e}function w(e,t){e.setExecuteOnSelection(t.executeOnSelection);e.setFavorite(t.favorite);e.setContexts(t.contexts);e.setName(t.name);e.setContent(t.content||e.getContent());return e}var A={};A.setDefault=function(e){var t={defaultVariantName:e.defaultVariantId};e.layer=e.layer||n.fromQuery(window.location.search).get("sap-ui-layer")||i.USER;var r=v.getCompVariantsMap(e.reference)._getOrCreate(e.persistencyKey);var s="defaultVariant";var c=r.defaultVariants;var p=c[c.length-1];if(!p||!V(p,e)){var f={fileName:o.createDefaultFileName(s),fileType:"change",changeType:s,layer:e.layer,content:t,namespace:o.createNamespace(e,"changes"),reference:e.reference,selector:{persistencyKey:e.persistencyKey},support:e.support||{}};f.support.generator=f.support.generator||"CompVariantState."+s;f.support.sapui5Version=a.getConfiguration().getVersion().toString();p=new l(f);r.defaultVariants.push(p);r.byId[p.getId()]=p;p.addRevertInfo(new u({type:A.operationType.NewChange}))}else{p.addRevertInfo(new u({type:A.operationType.ContentUpdate,content:{previousState:p.getState(),previousContent:p.getContent()}}));p.setContent(t)}return p};A.revertSetDefaultVariantId=function(e){var t=v.getCompVariantsMap(e.reference)._getOrCreate(e.persistencyKey);var n=t.defaultVariants;var a=n[n.length-1];var i=a.popLatestRevertInfo();if(i.getType()===A.operationType.ContentUpdate){a.setContent(i.getContent().previousContent);a.setState(i.getContent().previousState)}else{a.setState(r.states.DELETED);t.defaultVariants.pop()}};A.addVariant=function(t){if(!t){return undefined}var n=t.changeSpecificData;n.layer=F(n);n.changeType=n.type;n.texts=E(n);var a=Object.assign({},n,e(t,"changeSpecificData"));var r=p.createCompVariant(a);var i=v.getCompVariantsMap(t.reference);var o=i._getOrCreate(t.persistencyKey);o.variants.push(r);o.byId[r.getId()]=r;return r};A.updateVariant=function(e){function n(t,n){var a=t.getLayer()===n;var r=t.getPackage();var i=!r||r==="$TMP";var o=t.getChanges().some(function(e){return e.getLayer()===n});return t.getPersisted()&&a&&i&&!o&&S(t,e)}function a(t){return t.getChanges().reverse().find(function(t){return t.getChangeType()==="updateVariant"&&V(t,e)})}function i(e,t,n,a){var r={type:n,change:a,content:{previousState:t.getState(),previousContent:t.getContent(),previousFavorite:t.getFavorite(),previousExecuteOnSelection:t.getExecuteOnSelection(),previousContexts:t.getContexts(),previousName:t.getName(),previousAction:e.action}};t.addRevertData(new c(r))}function o(e,t){i(e,t,A.operationType.ContentUpdate);if(e.executeOnSelection!==undefined){t.storeExecuteOnSelection(e.executeOnSelection)}if(e.favorite!==undefined){t.storeFavorite(e.favorite)}if(e.contexts){t.storeContexts(e.contexts)}if(e.name){t.storeName(e.name)}if(e.transportId){t.setRequest(e.transportId)}t.storeContent(e.content||t.getContent())}function s(e,n,a){var r=a.getRevertData()||[];var o=Object.assign({},a.getContent());var s={previousContent:Object.assign({},o),previousState:a.getState(),change:t(Object.assign({},e),["favorite","executeOnSelection","contexts","content","name"])};r.push(s);a.setRevertData(r);if(e.executeOnSelection!==undefined){o.executeOnSelection=e.executeOnSelection}if(e.favorite!==undefined){o.favorite=e.favorite}if(e.contexts){o.contexts=e.contexts}if(e.content){o.variantContent=e.content}if(e.name){a.setText("variantName",e.name)}a.setContent(o);if(e.transportId){a.setRequest(e.transportId)}i(e,n,A.operationType.UpdateVariantViaChangeUpdate,a);g.applyChangeOnVariant(n,a)}function p(e,t){function n(e){var t=v.getCompVariantsMap(e.getComponent());var n=e.getSelector().persistencyKey;t[n].changes.push(e);t[n].byId[e.getId()]=e}var a=r.createInitialFileContent({changeType:"updateVariant",layer:f,fileType:"change",reference:e.reference,packageName:e.packageName,content:{},selector:{persistencyKey:e.persistencyKey,variantId:t.getVariantId()}});["favorite","executeOnSelection","contexts"].forEach(function(t){if(e[t]!==undefined){a.content[t]=e[t]}});if(e.content!==undefined){a.content.variantContent=e.content}if(e.name){a.texts.variantName={value:e.name,type:"XFLD"}}var o=new r(a);if(e.transportId){o.setRequest(e.transportId)}n(o);i(e,t,A.operationType.NewChange,o);g.applyChangeOnVariant(t,o)}var u=N(e);var f=F(e);if(n(u,f)){o(e,u)}else{var l=a(u);if(l){s(e,u,l)}else{p(e,u)}}return u};A.discardVariantContent=function(e){var t=N(e);var n=t.getRevertData();if(n.length!==0){var a=n.slice().reverse().some(function(t){if(t.getContent().previousAction===A.updateActionType.SAVE){e.content=t.getContent().previousContent;e.action=A.updateActionType.DISCARD;return true}});if(!a){e.content=n[0].getContent().previousContent;e.action=A.updateActionType.DISCARD}A.updateVariant(e)}return t};A.updateActionType={UPDATE:"update",SAVE:"save",DISCARD:"discard",UPDATE_METADATA:"update_metadata"};A.operationType={StateUpdate:"StateUpdate",ContentUpdate:"ContentUpdate",NewChange:"NewChange",UpdateVariantViaChange:"UpdateVariantViaChange",UpdateVariantViaChangeUpdate:"UpdateVariantViaChangeUpdate"};A.removeVariant=function(e){var t=N(e);var n=t.getState();if(!e.revert){var a=new c({type:A.operationType.StateUpdate,content:{previousState:n}});t.addRevertData(a)}if(n===f.NEW){var r=v.getCompVariantsMap(e.reference);var i=r._getOrCreate(e.persistencyKey);b(t,i);return t}t.markForDeletion();return t};A.revert=function(e){function n(e){var t=e.getSelector().persistencyKey;var n=v.getCompVariantsMap(e.getComponent());delete n[t].byId[e.getId()];n[t].changes=n[t].changes.filter(function(t){return t!==e})}var a=N(e);var r=a.getRevertData().pop();a.removeRevertData(r);var i=r.getContent();var o;switch(r.getType()){case A.operationType.ContentUpdate:M(a,Object.assign({name:i.previousName,content:i.previousContent,favorite:i.previousFavorite,executeOnSelection:i.previousExecuteOnSelection,contexts:i.previousContexts},t(e,["reference","persistencyKey","id"])));break;case A.operationType.NewChange:o=r.getChange();a.removeChange(o);n(o);w(a,Object.assign({name:i.previousName,content:i.previousContent,favorite:i.previousFavorite,executeOnSelection:i.previousExecuteOnSelection,contexts:i.previousContexts},t(e,["reference","persistencyKey","id"])));break;case A.operationType.UpdateVariantViaChangeUpdate:o=r.getChange();w(a,Object.assign({name:i.previousName,content:i.previousContent,favorite:i.previousFavorite,executeOnSelection:i.previousExecuteOnSelection,contexts:i.previousContexts},t(e,["reference","persistencyKey","id"])));var s=o.getRevertData().pop();o.setContent(s.previousContent);o.setState(s.previousState);break;case A.operationType.StateUpdate:default:break}a.setState(i.previousState);return a};A.overrideStandardVariant=function(e){var t=v.getCompVariantsMap(e.reference)[e.persistencyKey];var n=t.byId[t.standardVariant.getVariantId()];n.setExecuteOnSelection(!!e.executeOnSelection);var a=n.getChanges();n.removeAllChanges();a.forEach(function(e){g.applyChangeOnVariant(n,e)})};A.persist=function(e){function t(e,t,n){if(e.getLayer()===i.PUBLIC){e.setFavorite(false)}return y.write({flexObjects:[e.convertToFileContent?e.convertToFileContent():e.getDefinition()],layer:e.getLayer(),transport:e.getRequest(),isLegacyVariant:e.isVariant(),parentVersion:n}).then(function(t){if(t&&t.response&&t.response[0]){e.setResponse(t.response[0]);if(n){C.onAllChangesSaved({reference:t.response[0].reference,layer:t.response[0].layer})}}else{e.setState(f.PERSISTED)}}).then(function(){var n=e.convertToFileContent?e.convertToFileContent():e.getDefinition();x(t.changes.comp,e).push(n);return n})}function n(e,n,a,r){switch(e.getState()){case f.NEW:j(e);return t(e,a,r);case f.DIRTY:j(e);return T(e,a,r);case f.DELETED:j(e);return I(e,n,a,r);default:break}}var a=e.reference;var r=e.persistencyKey;var o=v.getCompVariantsMap(a);var s=o._getOrCreate(r);return v.getStorageResponse(a).then(function(e){var t=U(s).filter(R);var a=t.map(function(a,r){if(r===0){var i=m("/persistedVersion",{layer:a.getLayer(),reference:a.getFlexObjectMetadata?a.getFlexObjectMetadata().reference:a.getDefinition().reference});return n(a,s,e,i).then(function(){var a=t.map(function(t,a){if(a!==0){var r=i?h.Number.Draft:undefined;return n(t,s,e,r)}});return a})}});return Promise.all(a)})};A.persistAll=function(t){var n=e(v.getCompVariantsMap(t),"_getOrCreate","_initialize");var a=Object.keys(n).map(function(e){return A.persist({reference:t,persistencyKey:e})});return Promise.all(a)};A.hasDirtyChanges=function(e){var t=v.getCompVariantsMap(e);var n=[];for(var a in t){var r=t[a];for(var i in r.byId){n.push(r.byId[i])}}return n.some(function(e){return e.getState()!==f.PERSISTED&&!(e.getVariantId&&e.getVariantId()==="*standard*")})};return A});
//# sourceMappingURL=CompVariantState.js.map