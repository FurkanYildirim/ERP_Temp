/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/m/MultiComboBox","sap/m/MultiComboBoxRenderer","sap/ui/comp/util/ComboBoxUtils","sap/m/inputUtils/ListHelpers"],function(e,t,r,i){"use strict";var o=i.CSS_CLASS+"Token";var s=e.extend("sap.ui.comp.smartfilterbar.SFBMultiComboBox",{metadata:{library:"sap.ui.comp",interfaces:["sap.ui.comp.IDropDownTextArrangement"],properties:{textArrangement:{type:"string",group:"Misc",defaultValue:""}}},renderer:t});s.prototype.onBeforeRendering=function(){e.prototype.onBeforeRendering.apply(this,arguments);this._parseCurrentValue();this._processTextArrangement()};s.prototype._processTextArrangement=function(){var e,t,i,s,a,n=this.getSelectedKeys(),p=this.getTextArrangement();if(!p||n.length===0){return}for(e=0;e<n.length;e++){i=n[e];s=this.getItemByKey(""+i);a=r.formatDisplayBehaviour(s,p);if(a){t=s.data(o);if(t&&t.isA("sap.m.Token")){t.setText(a)}}}};s.prototype._parseCurrentValue=function(){var e=this.getValue();if(e){this.addSelectedKeys([e]);this.setValue("")}};return s});
//# sourceMappingURL=SFBMultiComboBox.js.map