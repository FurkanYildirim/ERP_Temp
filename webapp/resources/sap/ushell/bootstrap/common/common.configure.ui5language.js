// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/ObjectPath","sap/ui/core/Configuration"],function(a,e){"use strict";function i(i){var n=a.get("services.Container.adapter.config.userProfile.defaults",i);var t=n&&n.languageBcp47;var r=n&&n.language;if(t){e.setLanguage(t,r)}}return i});
//# sourceMappingURL=common.configure.ui5language.js.map