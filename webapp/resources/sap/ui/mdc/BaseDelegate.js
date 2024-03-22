/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/enums/BaseType","sap/ui/mdc/DefaultTypeMap","sap/base/Log"],function(e,t,i){"use strict";var p={};p.getTypeUtil=function(e){if(this.getTypeMap&&this.getTypeMap.__mapped){return this.getTypeMap.getOriginalMethod().call(this,e)}else{return this.getTypeMap(e)}};p.getTypeMap=function(e){var i=this.getTypeUtil&&this.getTypeUtil.__mapped?this.getTypeUtil.getOriginalMethod():this.getTypeUtil;var a=p.getTypeUtil&&p.getTypeUtil.__mapped?p.getTypeUtil.getOriginalMethod():p.getTypeUtil;var g=i&&i!==a;return g?i.call(this,e):t};return p});
//# sourceMappingURL=BaseDelegate.js.map