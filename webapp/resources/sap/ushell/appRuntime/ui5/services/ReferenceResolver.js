// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/appRuntime/ui5/AppRuntimeService"],function(e){"use strict";function s(){this.resolveReferences=function(s,r){return e.sendMessageToOuterShell("sap.ushell.services.ReferenceResolver.resolveReferences",{aReferences:s})}}s.hasNoAdapter=true;return s});
//# sourceMappingURL=ReferenceResolver.js.map