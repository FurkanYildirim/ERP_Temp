// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell_abap/pbServices/ui2/Chip","sap/ushell_abap/pbServices/ui2/Error","sap/ushell_abap/pbServices/ui2/Utils"],function(t,i,n){"use strict";t.addContract("configuration",function(t){var e;this.getParameterValueAsString=function(i){return t.getConfigurationParameter(i)};this.attachConfigurationUpdated=function(t){if(typeof t!=="function"){throw new i("The given handler is not a function","chip.configuration")}e=t};return{fireConfigurationUpdated:function(t){if(!n.isArray(t)||t.length<1){throw new i("At least one configuration property key must be given","contract.configuration")}if(e){e(t)}}}});t.addContract("writeConfiguration",function(t){this.setParameterValues=function(i,n,e){t.updateConfiguration(i,n,e)}})});
//# sourceMappingURL=configuration.js.map