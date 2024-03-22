//@ui5-bundle sap/ui/fl/designtime/library-preload.designtime.js
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/library.designtime", [],function(){"use strict";return{}});
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/util/IFrame.designtime", ["sap/ui/core/Core","sap/ui/rta/plugin/iframe/AddIFrameDialog","sap/m/library"],function(e,t){"use strict";function r(r){var i=new t;var a=r.get_settings();var n=r.getRenameInfo();var h;var o;if(n){o=e.byId(n.sourceControlId);a.title=o.getProperty(n.propertyName)}return t.buildUrlBuilderParametersFor(r).then(function(e){h={parameters:e,frameUrl:a.url,frameWidth:a.width,frameHeight:a.height,title:a.title,asContainer:!!a.title,updateMode:true};return i.open(h)}).then(function(t){if(!t){return[]}var i=[];var h=false;var o={url:a.url,height:a.height,width:a.width};if(t.frameHeight+t.frameHeightUnit!==a.height){h=true;o.height=t.frameHeight+t.frameHeightUnit}if(t.frameWidth+t.frameWidthUnit!==a.width){h=true;o.width=t.frameWidth+t.frameWidthUnit}if(t.frameUrl!==a.url){h=true;o.url=t.frameUrl}if(h){i.push({selectorControl:r,changeSpecificData:{changeType:"updateIFrame",content:o}})}if(t.title!==a.title){var l={selectorControl:e.byId(n.selectorControlId),changeSpecificData:{changeType:"rename",content:{value:t.title}}};i.push(l)}return i})}return{actions:{settings:function(){return{icon:"sap-icon://write-new",name:"CTX_EDIT_IFRAME",isEnabled:true,handler:r}},remove:{changeType:"hideControl"},reveal:{changeType:"unhideControl"}}}});
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/variants/VariantManagement.designtime", ["sap/ui/fl/apply/api/ControlVariantApplyAPI","sap/ui/fl/Utils"],function(e,t){"use strict";var r=function(r,n){var a=t.getAppComponentForControl(r);var o=r.getId();var i=a.getModel(e.getVariantModelName());var l=a.getLocalId(o)||o;if(!i){return}if(n){i.waitForVMControlInit(l).then(function(){i.setModelPropertiesForControl(l,n,r);i.checkUpdate(true)})}else{i.setModelPropertiesForControl(l,n,r);i.checkUpdate(true)}};return{annotations:{},properties:{showSetAsDefault:{ignore:false},manualVariantKey:{ignore:true},inErrorState:{ignore:false},editable:{ignore:false},modelName:{ignore:false},updateVariantInURL:{ignore:true},resetOnContextChange:{ignore:true},executeOnSelectionForStandardDefault:{ignore:false},displayTextForExecuteOnSelectionForStandardVariant:{ignore:false},headerLevel:{ignore:false}},variantRenameDomRef:function(e){return e.getTitle().getDomRef("inner")},customData:{},tool:{start:function(e){var t=true;r(e,t);e.enteringDesignMode()},stop:function(e){var t=false;r(e,t);e.leavingDesignMode()}},actions:{controlVariant:function(r){var n=t.getAppComponentForControl(r);var a=r.getId();var o=n.getModel(e.getVariantModelName());var i=n.getLocalId(a)||a;return{validators:["noEmptyText",{validatorFunction:function(e){var t=o._getVariantTitleCount(e,i)||0;return t===0},errorMessage:sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE")}]}}}}});
//# sourceMappingURL=library-preload.designtime.js.map
