/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../TypeMap","sap/ui/mdc/enums/BaseType"],function(e,t){"use strict";var a=Object.assign({},e);a.addV4Constraint=function(e,t,a){return[e,Object.assign({},t,{V4:true})]};a.import(e);a.set("sap.ui.model.odata.type.DateTimeOffset",t.DateTime,a.addV4Constraint);a.freeze();return a});
//# sourceMappingURL=TypeMap.js.map