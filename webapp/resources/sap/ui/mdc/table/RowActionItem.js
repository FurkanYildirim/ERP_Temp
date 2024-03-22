/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","sap/ui/core/IconPool","sap/ui/core/Core","sap/ui/mdc/enums/TableRowAction"],function(e,t,i,n){"use strict";var o=e.extend("sap.ui.mdc.table.RowActionItem",{metadata:{library:"sap.ui.mdc",properties:{type:{type:"sap.ui.mdc.enums.TableRowAction"},text:{type:"string"},icon:{type:"sap.ui.core.URI"},visible:{type:"boolean",defaultValue:true}},events:{press:{parameters:{bindingContext:{type:"sap.ui.model.Context"}}}}}});var a={navigationIcon:"navigation-right-arrow"};o.prototype._getText=function(){var e;if(this.getText()){e=this.getText()}else{var t=i.getLibraryResourceBundle("sap.ui.mdc");if(this.getType()===n.Navigation){e=t.getText("table.ROW_ACTION_ITEM_NAVIGATE")}}return e};o.prototype._getIcon=function(){var e;if(this.getIcon()){e=this.getIcon()}else if(this.getType()===n.Navigation){e=t.getIconURI(a["navigationIcon"])}return e};o.prototype._onPress=function(e){this.firePress({bindingContext:e.bindingContext})};return o});
//# sourceMappingURL=RowActionItem.js.map