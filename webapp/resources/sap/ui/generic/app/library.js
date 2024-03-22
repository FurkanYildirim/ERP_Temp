/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/library","sap/m/library","sap/fe/navigation/library"],function(i){"use strict";var a=i.initLibrary({name:"sap.ui.generic.app",version:"1.115.0",dependencies:["sap.ui.core","sap.m","sap.fe.navigation"],types:["sap.ui.generic.app.navigation.service.NavType","sap.ui.generic.app.navigation.service.ParamHandlingMode","sap.ui.generic.app.navigation.service.SuppressionBehavior"],interfaces:[],controls:[],elements:[],noLibraryCSS:true});a.navigation=a.navigation||{};a.navigation.service=a.navigation.service||{};a.navigation.service.ParamHandlingMode={SelVarWins:"SelVarWins",URLParamWins:"URLParamWins",InsertInSelOpt:"InsertInSelOpt"};a.navigation.service.NavType={initial:"initial",URLParams:"URLParams",xAppState:"xAppState",iAppState:"iAppState",hybrid:"hybrid"};a.navigation.service.SuppressionBehavior={standard:0,ignoreEmptyString:1,raiseErrorOnNull:2,raiseErrorOnUndefined:4};sap.ui.require("sap.ui.generic.app.AppComponent");return a});
//# sourceMappingURL=library.js.map