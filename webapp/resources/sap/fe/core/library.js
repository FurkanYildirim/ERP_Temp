/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/formatters/FPMFormatter","sap/fe/core/formatters/StandardFormatter","sap/fe/core/formatters/ValueFormatter","sap/fe/core/services/AsyncComponentServiceFactory","sap/fe/core/services/CacheHandlerServiceFactory","sap/fe/core/services/EnvironmentServiceFactory","sap/fe/core/services/NavigationServiceFactory","sap/fe/core/services/ResourceModelServiceFactory","sap/fe/core/services/RoutingServiceFactory","sap/fe/core/services/ShellServicesFactory","sap/fe/core/services/SideEffectsServiceFactory","sap/fe/core/services/TemplatedViewServiceFactory","sap/fe/core/type/DateTimeWithTimezone","sap/fe/core/type/Email","sap/fe/core/type/FiscalDate","sap/fe/navigation/library","sap/fe/placeholder/library","sap/ui/base/DataType","sap/ui/core/Core","sap/ui/core/library","sap/ui/core/service/ServiceFactoryRegistry","sap/ui/fl/library","sap/ui/mdc/library"],function(e,a,r,i,o,t,s,n,c,l,p,f,d,v,u,y,S,m,g,C,b,F,w,D){"use strict";var E={};var M=s.EnvironmentServiceFactory;const N="sap.fe";E.feNamespace=N;const I="sap.fe.core";E.feCoreNamespace=I;const h="sap.fe.controllerextensions";E.feCextNamespace=h;const A="sap.fe.core.fpm";E.feFpmNamespace=A;const R=C.initLibrary({name:"sap.fe.core",dependencies:["sap.ui.core","sap.fe.navigation","sap.fe.placeholder","sap.ui.fl","sap.ui.mdc","sap.f"],types:["sap.fe.core.CreationMode","sap.fe.core.VariantManagement"],interfaces:[],controls:[],elements:[],version:"1.115.1",noLibraryCSS:true,extensions:{"sap.ui.support":{publicRules:true,internalRules:true},flChangeHandlers:{"sap.fe.core.controls.FilterBar":"sap/ui/mdc/flexibility/FilterBar"}}});R.InvocationGrouping={Isolated:"Isolated",ChangeSet:"ChangeSet"};R.CreationMode={NewPage:"NewPage",Sync:"Sync",Async:"Async",Deferred:"Deferred",Inline:"Inline",CreationRow:"CreationRow",InlineCreationRows:"InlineCreationRows",External:"External"};R.VariantManagement={None:"None",Page:"Page",Control:"Control"};R.Constants={CancelActionDialog:"cancel",ActionExecutionFailed:"actionExecutionFailed",CreationFailed:"creationFailed"};R.ProgrammingModel={Draft:"Draft",Sticky:"Sticky",NonDraft:"NonDraft"};R.DraftStatus={Saving:"Saving",Saved:"Saved",Clear:"Clear"};R.EditMode={Display:"Display",Editable:"Editable"};R.TemplateContentView={Hybrid:"Hybrid",Chart:"Chart",Table:"Table"};let L;(function(e){e["Enabled"]="Enabled";e["Disabled"]="Disabled";e["Auto"]="Auto"})(L||(L={}));E.InitialLoadMode=L;R.InitialLoadMode=L;R.StartupMode={Normal:"Normal",Deeplink:"Deeplink",Create:"Create",AutoCreate:"AutoCreate"};const T=g.createType("sap.fe.core.InitialLoadMode",{defaultValue:R.InitialLoadMode.Auto,isValid:function(a){if(typeof a==="boolean"){e.warning("DEPRECATED: boolean value not allowed for 'initialLoad' manifest setting - supported values are: Disabled|Enabled|Auto")}return a===undefined||a===null||typeof a==="boolean"||R.InitialLoadMode.hasOwnProperty(a)}});T.setNormalizer(function(e){if(!e){return R.InitialLoadMode.Disabled}return e===true?R.InitialLoadMode.Enabled:e});F.register("sap.fe.core.services.TemplatedViewService",new d);F.register("sap.fe.core.services.ResourceModelService",new c);F.register("sap.fe.core.services.CacheHandlerService",new t);F.register("sap.fe.core.services.NavigationService",new n);F.register("sap.fe.core.services.RoutingService",new l);F.register("sap.fe.core.services.SideEffectsService",new f);F.register("sap.fe.core.services.ShellServices",new p);F.register("sap.fe.core.services.EnvironmentService",new M);F.register("sap.fe.core.services.AsyncComponentService",new o);return R},false);
//# sourceMappingURL=library.js.map