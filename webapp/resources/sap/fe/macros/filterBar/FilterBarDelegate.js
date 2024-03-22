/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/merge","sap/fe/core/CommonUtils","sap/fe/core/converters/controls/ListReport/FilterBar","sap/fe/core/helpers/MetaModelFunction","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/ResourceModelHelper","sap/fe/core/helpers/StableIdHelper","sap/fe/core/TemplateModel","sap/fe/core/templating/PropertyFormatters","sap/fe/core/type/EDM","sap/fe/core/type/TypeUtil","sap/fe/macros/CommonHelper","sap/fe/macros/DelegateUtil","sap/fe/macros/filter/FilterUtils","sap/ui/mdc/FilterBarDelegate","sap/ui/model/json/JSONModel"],function(e,t,n,o,i,r,a,l,s,c,u,f,d,p,g,m,v){"use strict";var h=u.getModelType;var P=c.hasValueHelp;var y=l.generate;var F=a.getResourceModel;var C=a.getLocalizedText;var b=i.isPropertyFilterable;var x=o.processSelectionFields;const M=Object.assign({},m);M.apiVersion=2;const I="$editState",T="$search",w="FilterFieldValueHelp",D="sap_fe_FilterBarDelegate_propertyInfoMap",S=/[+*]/g;function A(e,t,n){const o=new v({id:e,isDraftCollaborative:r.isCollaborationDraftSupported(t)}),i={bindingContexts:{this:o.createBindingContext("/")},models:{this:o}};return p.templateControlFragment("sap.fe.macros.filter.DraftEditState",i,undefined,n).finally(function(){o.destroy()})}M._templateCustomFilter=async function(e,t,o,i,r){const a=await p.getCustomData(e,"entityType",r);const l=new v({id:t}),c=new s(o,i),u={bindingContexts:{contextPath:i.createBindingContext(a),this:l.createBindingContext("/"),item:c.createBindingContext("/")},models:{contextPath:i,this:l,item:c}},f=n.getTargetView(e),d=f?f.getController():undefined,g={controller:d?d:undefined,view:f};return p.templateControlFragment("sap.fe.macros.filter.CustomFilter",u,g,r).finally(function(){l.destroy();c.destroy()})};function E(e){return e.replace(S,"")}M._findSelectionField=function(e,t){return e.find(function(e){return(e.conditionPath===t||e.conditionPath.replaceAll(/\*/g,"")===t)&&e.availability!=="Hidden"})};function L(e,t,n){return n?y([e,t,n]):y([e,t])}function $(n,o){const i=new v({idPrefix:o.sVhIdPrefix,conditionModel:"$filters",navigationPrefix:o.sNavigationPrefix?`/${o.sNavigationPrefix}`:"",filterFieldValueHelp:true,useSemanticDateRange:o.bUseSemanticDateRange});const r=t({},n,{bindingContexts:{this:i.createBindingContext("/")},models:{this:i}});return Promise.resolve(p.templateControlFragment("sap.fe.macros.internal.valuehelp.ValueHelp",r,{isXML:n.isXML})).then(function(e){if(e){const t="dependents";if(e.length){e.forEach(function(e){if(o.oModifier){o.oModifier.insertAggregation(o.oControl,t,e,0)}else{o.oControl.insertAggregation(t,e,0,false)}})}else if(o.oModifier){o.oModifier.insertAggregation(o.oControl,t,e,0)}else{o.oControl.insertAggregation(t,e,0,false)}}}).catch(function(t){e.error("Error while evaluating DelegateUtil.isValueHelpRequired",t)}).finally(function(){i.destroy()})}async function _(t,n,o){try{const e=await Promise.resolve(n.getAggregation(t,"dependents"));let i;if(e&&e.length>1){for(i=0;i<=e.length;i++){const t=e[i];if(t&&t.isA("sap.ui.mdc.FilterField")){const e=t.getFieldPath(),n=t.getId();if(o===e&&n.indexOf("CustomFilterField")){return Promise.resolve(t)}}}}}catch(t){e.error("Filter Cannot be added",t)}}function B(e,n,o){const i=new v({idPrefix:n.sIdPrefix,vhIdPrefix:n.sVhIdPrefix,propertyPath:n.sPropertyName,navigationPrefix:n.sNavigationPrefix?`/${n.sNavigationPrefix}`:"",useSemanticDateRange:n.bUseSemanticDateRange,settings:n.oSettings,visualFilter:n.visualFilter});const r=n.oMetaModel;const a=new s(n.visualFilter,r);const l=t({},e,{bindingContexts:{this:i.createBindingContext("/"),visualFilter:a.createBindingContext("/")},models:{this:i,visualFilter:a,metaModel:r,converterContext:o}});return p.templateControlFragment("sap.fe.macros.internal.filterField.FilterFieldTemplate",l,{isXML:e.isXML}).finally(function(){i.destroy()})}async function V(t,n,o,i){try{i=i.replace("*","");const e=y([i]);if(n&&!n.modifier){throw"FilterBar Delegate method called without modifier."}const r=await n.modifier.getProperty(t,"delegate");const a=await n.modifier.getProperty(t,"propertyInfo");if(a){const l=a.some(function(t){return t.key===e||t.name===e});if(!l){const e=r.payload.entityTypePath;const l=g.createConverterContext(t,e,o,n.appComponent);const s=l.getEntityType();let c=g.getFilterField(i,l,s);c=g.buildProperyInfo(c,l);a.push(c);n.modifier.setProperty(t,"propertyInfo",a)}}}catch(n){e.warning(`${t.getId()} : ${n}`)}}M.addItem=async function(e,t,n){if(!n){return M._addP13nItem(t,e)}const o=n.modifier;const i=n&&n.appComponent&&n.appComponent.getModel();const r=i&&i.getMetaModel();if(!r){return Promise.resolve(null)}const a=o&&o.targets==="xmlTree";if(a){await V(e,n,r,t)}return M._addFlexItem(t,e,r,o,n.appComponent)};M.removeItem=async function(e,t,n){let o=true;const i=n.modifier;const r=i&&i.targets==="xmlTree";if(r&&!e.data("sap_fe_FilterBarDelegate_propertyInfoMap")){const o=n&&n.appComponent&&n.appComponent.getModel();const i=o&&o.getMetaModel();if(!i){return Promise.resolve(null)}if(typeof t!=="string"&&t.getFieldPath()){await V(e,n,i,t.getFieldPath())}else{await V(e,n,i,t)}}if(typeof t!=="string"&&t.isA&&t.isA("sap.ui.mdc.FilterField")){if(t.data("isSlot")==="true"&&n){i.insertAggregation(e,"dependents",t);o=false}}return Promise.resolve(o)};M.addCondition=async function(e,t,n){const o=n.modifier;const i=o&&o.targets==="xmlTree";if(i){const o=n&&n.appComponent&&n.appComponent.getModel();const i=o&&o.getMetaModel();if(!i){return Promise.resolve(null)}await V(e,n,i,t)}return Promise.resolve()};M.removeCondition=async function(e,t,n){if(!e.data("sap_fe_FilterBarDelegate_propertyInfoMap")){const o=n.modifier;const i=o&&o.targets==="xmlTree";if(i){const o=n&&n.appComponent&&n.appComponent.getModel();const i=o&&o.getMetaModel();if(!i){return Promise.resolve(null)}await V(e,n,i,t)}}return Promise.resolve()};M.clearFilters=async function(e){return g.clearFilterValues(e)};M._addP13nItem=function(t,n){return p.fetchModel(n).then(function(e){return M._addFlexItem(t,n,e.getMetaModel(),undefined)}).catch(function(t){e.error("Model could not be resolved",t);return null})};M.fetchPropertiesForEntity=function(e,t,o){const i=t.getObject(e);const a=o.isA("sap.ui.mdc.filterbar.vh.FilterBar")?true:undefined;if(!o||!i){return[]}const l=g.createConverterContext(o,e);const s=r.getEntitySetPath(e);const c=g.getConvertedFilterFields(o,e,a);let u=[];c.forEach(function(e){const n=e.annotationPath;if(n){var o,i,r,a;const s=l.getConvertedTypes().resolvePath(n).target;const c=d.getLocationForPropertyPath(t,n);const f=n.replace(`${c}/`,"");const p=l.getEntityType();const g=(o=p.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:i.SelectionFields;const m=(r=p.annotations)===null||r===void 0?void 0:(a=r.UI)===null||a===void 0?void 0:a.FilterFacets;if(M._isFilterAdaptable(e,s,g,m)&&b(t,c,E(f),true)){u.push(e)}}else{u.push(e)}});const m=[];const v=x(u,l);const y=[];v.forEach(function(e){if(e.key){y.push(e.key)}});u=u.filter(function(e){return y.includes(e.key)});const I=n.getFilterRestrictionsByPath(s,t),T=I.FilterAllowedExpressions;v.forEach(function(e,o){const i=u[o];if(!i||!i.conditionPath){return}const r=E(i.conditionPath);e=Object.assign(e,{group:i.group,groupLabel:i.groupLabel,path:i.conditionPath,tooltip:null,removeFromAppState:false,hasValueHelp:false});if(i.annotationPath){const n=i.annotationPath;const o=t.getObject(n),r=t.getObject(`${n}@`),a=t.createBindingContext(n);const l=r["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"]||r["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"]||r["@com.sap.vocabularies.Analytics.v1.Measure"];const s=d.getLocationForPropertyPath(t,i.annotationPath);const c=n.replace(`${s}/`,"");let u;let f;if(b(t,s,E(c),true)){u=r["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];if(u){f=u[`$${h(o.$Type)}`]}e=Object.assign(e,{tooltip:r["@com.sap.vocabularies.Common.v1.QuickInfo"]||undefined,removeFromAppState:l,hasValueHelp:P(a.getObject(),{context:a}),defaultFilterConditions:f?[{fieldPath:i.conditionPath,operator:"EQ",values:[f]}]:undefined})}}if(e){if(T[r]&&T[r].length>0){e.filterExpression=n.getSpecificAllowedExpression(T[r])}else{e.filterExpression="auto"}e=Object.assign(e,{visible:i.availability==="Default"})}v[o]=e});v.forEach(function(e){if(e.path==="$editState"){e.label=F(o).getText("FILTERBAR_EDITING_STATUS")}e.typeConfig=f.getTypeConfig(e.dataType,e.formatOptions,e.constraints);e.label=C(e.label,o)||"";if(e.isParameter){m.push(e.name)}});u=v;p.setCustomData(o,"parameters",m);return u};function U(e,t){var n;if(e.isA("sap.fe.macros.table.TableAPI")){const o=e.getMetaPath().split("#")[0].split("/");switch(o[o.length-1]){case`@${"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"}`:case`@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`:return(n=t.getObject(e.getMetaPath()).Visualizations)===null||n===void 0?void 0:n.find(e=>e.$AnnotationPath.includes(`@${"com.sap.vocabularies.UI.v1.LineItem"}`)).$AnnotationPath;case`@${"com.sap.vocabularies.UI.v1.LineItem"}`:const o=e.getMetaPath().split("/");return o[o.length-1]}}return undefined}M._isFilterAdaptable=function(e,t,n,o){var i,r;let a,l;if(n){a=n.some(function(t){if(t.value===e.key){return true}return false})}else{a=false}if(o){l=o.some(function(t){var n;const o=(n=t.Target)===null||n===void 0?void 0:n.$target;return o===null||o===void 0?void 0:o.Data.some(function(t){if(t.Value.path===e.key){return true}return false})})}else{l=false}return a||l||!((i=t.annotations)!==null&&i!==void 0&&(r=i.UI)!==null&&r!==void 0&&r.AdaptationHidden)};M._addFlexItem=function(e,t,o,i,a){const l=i?i.getId(t):t.getId(),s=i?"":"Adaptation",c=g.getConvertedFilterFields(t,null,undefined,o,a,i,i?undefined:U(t.getParent(),o)),u=M._findSelectionField(c,e),f=E(e),m=!!i&&i.targets==="xmlTree";if(e===I){return A(L(l,`${s}FilterField`),o,i)}else if(e===T){return Promise.resolve(null)}else if(u!==null&&u!==void 0&&u.template){return M._templateCustomFilter(t,L(l,`${s}FilterField`),u,o,i)}if((u===null||u===void 0?void 0:u.type)==="Slot"&&i){return _(t,i,f)}const v=d.getNavigationPath(f);let h;let P;let y;let F;let C;return Promise.resolve().then(function(){if(u!==null&&u!==void 0&&u.isParameter){const e=u.annotationPath;return e.substr(0,e.lastIndexOf("/")+1)}return p.getCustomData(t,"entityType",i)}).then(function(e){h=e;return p.getCustomData(t,"useSemanticDateRange",i)}).then(function(e){P=e;const n=o.createBindingContext(h+f);const a=i?i.getId(t):t.getId();y={bindingContexts:{contextPath:o.createBindingContext(h),property:n},models:{contextPath:o,property:o},isXML:m};F=`/${r.getEntitySetPath(h).split("/").filter(r.filterOutNavPropBinding).join("/")}`;C={sPropertyName:f,sBindingPath:F,sValueHelpType:s+w,oControl:t,oMetaModel:o,oModifier:i,sIdPrefix:L(a,`${s}FilterField`,v),sVhIdPrefix:L(a,s+w),sNavigationPrefix:v,bUseSemanticDateRange:P,oSettings:(u===null||u===void 0?void 0:u.settings)??{},visualFilter:u===null||u===void 0?void 0:u.visualFilter};return p.doesValueHelpExist(C)}).then(function(e){if(!e){return $(y,C)}return Promise.resolve()}).then(function(){let e;if(C.visualFilter){e=n.getTargetView(t).getController()._getPageModel()}return B(y,C,e)})};function H(e){if(e instanceof window.Element){return null}return p.getCustomData(e,D)}function O(e,t){if(e instanceof window.Element){return}p.setCustomData(e,D,t)}function R(e,t,n){let o=H(n);let i;if(!o){o=M.fetchPropertiesForEntity(e,t,n);o.forEach(function(e){i=null;if(e.groupLabel){i=C(e.groupLabel,n);e.groupLabel=i===null?e.groupLabel:i}});o.sort(function(e,t){if(e.groupLabel===undefined||e.groupLabel===null){return-1}if(t.groupLabel===undefined||t.groupLabel===null){return 1}return e.groupLabel.localeCompare(t.groupLabel)});O(n,o)}return o}M.fetchProperties=function(e){const t=p.getCustomData(e,"entityType");return p.fetchModel(e).then(function(n){if(!n){return[]}return R(t,n.getMetaModel(),e)})};M.getTypeUtil=function(){return f};return M},false);
//# sourceMappingURL=FilterBarDelegate.js.map