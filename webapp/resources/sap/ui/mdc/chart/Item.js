/*
 * !OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","sap/base/Log"],function(e,t){"use strict";var r=e.extend("sap.ui.mdc.chart.Item",{metadata:{abstract:false,library:"sap.ui.mdc",properties:{name:{type:"string"},propertyKey:{type:"string"},label:{type:"string"},type:{type:"string",defaultValue:""},role:{type:"string"}}}});r.prototype.getPropertyKey=function(){var e=this.getProperty("propertyKey");return e||this.getName()};return r});
//# sourceMappingURL=Item.js.map