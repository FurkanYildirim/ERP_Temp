/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/library"],function(a,e){"use strict";const n={SelVarWins:"SelVarWins",URLParamWins:"URLParamWins",InsertInSelOpt:"InsertInSelOpt"};const i={initial:"initial",URLParams:"URLParams",xAppState:"xAppState",iAppState:"iAppState",hybrid:"hybrid"};const r={standard:0,ignoreEmptyString:1,raiseErrorOnNull:2,raiseErrorOnUndefined:4};const t={ODataV2:"ODataV2",ODataV4:"ODataV4"};const s=a.initLibrary({name:"sap.fe.navigation",version:"1.115.1",dependencies:["sap.ui.core"],types:["sap.fe.navigation.NavType","sap.fe.navigation.ParamHandlingMode","sap.fe.navigation.SuppressionBehavior"],interfaces:[],controls:[],elements:[],noLibraryCSS:true});s.ParamHandlingMode=n;s.NavType=i;s.SuppressionBehavior=r;s.Mode=t;return s},false);
//# sourceMappingURL=library.js.map