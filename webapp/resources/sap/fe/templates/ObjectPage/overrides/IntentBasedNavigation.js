/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils","sap/fe/navigation/SelectionVariant"],function(t,e){"use strict";const n={adaptNavigationContext:function(n,i){const o=this.getView(),a=o.getController(),s=a.intentBasedNavigation.adaptContextPreparationStrategy(i),r=this.getView().getBindingContext("internal"),g=r.getProperty("externalNavigationContext");const p=t.getAppComponent(o);const c=p.getModel().getMetaModel();if(g.page&&s==="default"){const s=o.getBindingContext(),r=c.getMetaPath(s.getPath());const g=a._intentBasedNavigation.removeSensitiveData(s.getObject(),r),p=a._intentBasedNavigation.prepareContextForExternalNavigation(g,s),l=p.propertiesWithoutConflict,d=t.addPageContextToSelectionVariant(new e,p.semanticAttributes,o),f=i.propertiesWithoutConflict;const C=d.getSelectOptionsPropertyNames();C.forEach(function(t){if(!n.getSelectOption(t)){n.massAddSelectOption(t,d.getSelectOption(t))}else{if(f&&t in f){n.massAddSelectOption(f[t],n.getSelectOption(t))}if(t in l){n.massAddSelectOption(l[t],d.getSelectOption(t))}}});delete i.propertiesWithoutConflict}r.setProperty("externalNavigationContext",{page:true})}};return n},false);
//# sourceMappingURL=IntentBasedNavigation.js.map