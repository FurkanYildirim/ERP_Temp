// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Core","sap/ushell/EventHub","sap/base/Log"],function(e,t,n){"use strict";function i(n){setTimeout(function(){e.getEventBus().publish("sap.ushell","rendererLoaded",{rendererName:"fiori2"})},0);t.emit("RendererLoaded",{rendererName:"fiori2"})}function r(t,n){setTimeout(function(){e.getEventBus().publish("sap.ushell.renderers.fiori2.Renderer",t,n)},0)}sap.ushell.renderers.fiori2.utils={};sap.ushell.renderers.fiori2.utils.publishExternalEvent=r;sap.ushell.renderers.fiori2.utils.init=i;function s(e,t,n){sap.ushell.Container.getRenderer("fiori2").hideHeaderItem(e.getId(),false,[t,n])}function o(e,t,n){sap.ushell.Container.getRenderer("fiori2").showActionButton(e.getId(),false,[t,n])}function a(e,t,n){sap.ushell.Container.getRenderer("fiori2").hideActionButton(e.getId(),false,[t,n])}function d(e,t,n){sap.ushell.Container.getRenderer("fiori2").showLeftPaneContent(e.getId(),false,[t,n])}function u(e,t){sap.ushell.Container.getRenderer("fiori2").hideLeftPaneContent(false,[e,t])}function l(e,t,n){sap.ushell.Container.getRenderer("fiori2").showFloatingActionButton(e.getId(),false,[t,n])}function f(e,t,n){sap.ushell.Container.getRenderer("fiori2").hideFloatingActionButton(e.getId(),false,[t,n])}function h(e,t,n){sap.ushell.Container.getRenderer("fiori2").showHeaderEndItem(e.getId(),false,[t,n])}function c(e,t,n){sap.ushell.Container.getRenderer("fiori2").hideHeaderEndItem(e.getId(),false,[t,n])}function g(){return sap.ushell.Container.getRenderer("fiori2").getModelConfiguration()}function p(){n.info("Application calls sap.ushell.Renderer.addEndUserFeedbackCustomUI. This function is deprecated. The call has no effect.")}function C(e){sap.ushell.Container.getRenderer("fiori2").addUserPreferencesEntry(e)}function m(e){sap.ushell.Container.getRenderer("fiori2").addUserPreferencesGroupedEntry(e)}function I(e){sap.ushell.Container.getRenderer("fiori2").setHeaderTitle(e)}function R(e,t){sap.ushell.Container.getRenderer("fiori2").setLeftPaneVisibility(e,t)}function H(e){sap.ushell.Container.getRenderer("fiori2").setHeaderHiding(e)}function b(e){sap.ushell.Container.getRenderer("fiori2").setFooter(e)}function E(){sap.ushell.Container.getRenderer("fiori2").removeFooter()}function v(){this.addHeaderItem=function(e,t,n){sap.ushell.Container.getRenderer("fiori2").showHeaderItem(e.getId(),false,[t,n])};this.setHeaderItemVisibility=function(t,n,i,r){var s=e.byId(t);if(r){sap.ushell.Container.getRenderer("fiori2").showHeaderItem(s.getId(),i,[n])}};this.addSubHeader=function(e,t,n){sap.ushell.Container.getRenderer("fiori2").showSubHeader(e.getId(),false,[t,n])};this.removeSubHeader=function(e,t,n){sap.ushell.Container.getRenderer("fiori2").hideSubHeader(e.getId(),false,[t,n])};this.addHeaderEndItem=h;this.removeHeaderItem=s;this.removeHeaderEndItem=c;this.addEndUserFeedbackCustomUI=p;this.addOptionsActionSheetButton=o;this.removeOptionsActionSheetButton=a;this.setFooter=b;this.removeFooter=E;this.addUserPreferencesEntry=C;this.addUserPreferencesGroupedEntry=m;this.setHeaderTitle=I;this.setHeaderHiding=H;this.LaunchpadState={App:"app",Home:"home"};this.addFloatingActionButton=l;this.removeFloatingActionButton=f;this.setLeftPaneContent=d;this.removeLeftPaneContent=u;this.setLeftPaneVisibility=R;this.getConfiguration=g}var A=new v;return A},true);
//# sourceMappingURL=RendererExtensions.js.map