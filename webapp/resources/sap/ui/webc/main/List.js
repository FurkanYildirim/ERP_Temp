/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/webc/common/WebComponent","./library","./thirdparty/List"],function(e,t){"use strict";var a=t.ListGrowingMode;var i=t.ListMode;var r=t.ListSeparators;var s=e.extend("sap.ui.webc.main.List",{metadata:{library:"sap.ui.webc.main",tag:"ui5-list-ui5",properties:{accessibleName:{type:"string",defaultValue:""},accessibleRole:{type:"string",defaultValue:"list"},busy:{type:"boolean",defaultValue:false},busyDelay:{type:"int",defaultValue:1e3},footerText:{type:"string",defaultValue:""},growing:{type:"sap.ui.webc.main.ListGrowingMode",defaultValue:a.None},headerText:{type:"string",defaultValue:""},height:{type:"sap.ui.core.CSSSize",mapping:"style"},indent:{type:"boolean",defaultValue:false},mode:{type:"sap.ui.webc.main.ListMode",defaultValue:i.None},noDataText:{type:"string",defaultValue:""},separators:{type:"sap.ui.webc.main.ListSeparators",defaultValue:r.All},width:{type:"sap.ui.core.CSSSize",mapping:"style"}},defaultAggregation:"items",aggregations:{header:{type:"sap.ui.core.Control",multiple:true,slot:"header"},items:{type:"sap.ui.webc.main.IListItem",multiple:true}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,mapping:{type:"property",to:"accessibleNameRef",formatter:"_getAriaLabelledByForRendering"}}},events:{itemClick:{allowPreventDefault:true,parameters:{item:{type:"HTMLElement"}}},itemClose:{parameters:{item:{type:"HTMLElement"}}},itemDelete:{parameters:{item:{type:"HTMLElement"}}},itemToggle:{parameters:{item:{type:"HTMLElement"}}},loadMore:{parameters:{}},selectionChange:{parameters:{selectedItems:{type:"Array"},previouslySelectedItems:{type:"Array"}}}},designtime:"sap/ui/webc/main/designtime/List.designtime"}});return s});
//# sourceMappingURL=List.js.map