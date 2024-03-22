/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/ui/fl/apply/_internal/flexState/ManifestUtils","sap/ui/fl/FlexController","sap/ui/fl/Utils"],function(e,r,t,n){"use strict";var a={};a._instanceCache={};a.create=function(e){var r=a._instanceCache[e];if(!r){r=new t(e);a._instanceCache[e]=r}return r};a.createForControl=function(t){try{var o=n.getAppComponentForControl(t);var i=r.getFlexReferenceForControl(o||t);return a.create(i)}catch(r){e.error(r.message,undefined,"sap.ui.fl.FlexControllerFactory")}};return a},true);
//# sourceMappingURL=FlexControllerFactory.js.map