/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/ui/core/InvisibleText","sap/m/Button","sap/m/library","sap/m/Menu","sap/m/MenuItem","sap/m/FlexBox","sap/m/FlexItemData","sap/esh/search/ui/controls/SearchInput","sap/esh/search/ui/controls/SearchButton","sap/ui/core/Control","./SearchSelect","./SearchSelectQuickSelectDataSource","../i18n"],function(t,e,n,i,o,s,r,a,u,c,l,h,f){function g(t){return t&&t.__esModule&&typeof t.default!=="undefined"?t.default:t}function p(t,e){var n=typeof Symbol!=="undefined"&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=d(t))||e&&t&&typeof t.length==="number"){if(n)t=n;var i=0;var o=function(){};return{s:o,n:function(){if(i>=t.length)return{done:true};return{done:false,value:t[i++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var s=true,r=false,a;return{s:function(){n=n.call(t)},n:function(){var t=n.next();s=t.done;return t},e:function(t){r=true;a=t},f:function(){try{if(!s&&n.return!=null)n.return()}finally{if(r)throw a}}}}function d(t,e){if(!t)return;if(typeof t==="string")return y(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);if(n==="Object"&&t.constructor)n=t.constructor.name;if(n==="Map"||n==="Set")return Array.from(t);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return y(t,e)}function y(t,e){if(e==null||e>t.length)e=t.length;for(var n=0,i=new Array(e);n<e;n++){i[n]=t[n]}return i}var v=n["ButtonType"];var B=n["FlexAlignItems"];var A=g(l);var x=g(h);var m=g(f);var M=c.extend("sap.esh.search.ui.controls.SearchFieldGroup",{renderer:{apiVersion:2,render:function t(e,n){e.openStart("div",n);e["class"]("SearchFieldGroup");e.openEnd();e.renderControl(n.getAggregation("_topFlexBox"));e.renderControl(n.getAggregation("_flexBox"));e.renderControl(n.getAggregation("_buttonAriaText"));e.close("div")}},metadata:{properties:{selectActive:{defaultValue:true,type:"boolean"},selectQsDsActive:{defaultValue:false,type:"boolean"},inputActive:{defaultValue:true,type:"boolean"},buttonActive:{defaultValue:true,type:"boolean"},cancelButtonActive:{defaultValue:true,type:"boolean"},actionsMenuButtonActive:{defaultValue:false,type:"boolean"}},aggregations:{_topFlexBox:{type:"sap.m.FlexBox",multiple:false,visibility:"hidden"},_flexBox:{type:"sap.m.FlexBox",multiple:false,visibility:"hidden"},_buttonAriaText:{type:"sap.ui.core.InvisibleText",multiple:false,visibility:"hidden"}}},constructor:function t(e,n){c.prototype.constructor.call(this,e,n);this.initSelect();this.initSelectQsDs();this.initInput();this.initButton();this.initCancelButton();this.initActionsMenuButton();this.initFlexBox()},setCancelButtonActive:function t(e){if(e===this.getProperty("cancelButtonActive")){return}this.setProperty("cancelButtonActive",e);this.initFlexBox()},setActionsMenuButtonActive:function t(e){if(e===this.getProperty("actionsMenuButtonActive")){return}this.setProperty("actionsMenuButtonActive",e);this.initFlexBox()},setSelectQsDsActive:function t(e){if(e===this.getProperty("selectQsDsActive")){return}this.setProperty("selectQsDsActive",e);this.initFlexBox()},initFlexBox:function t(){if(!this.select){return}if(!this.selectQsDs){return}var e=[];var n=[];if(this.getProperty("selectActive")){this.select.setLayoutData(new r("",{growFactor:0}));n.push(this.select)}if(this.getProperty("selectQsDsActive")){this.selectQsDs.setLayoutData(new r("",{growFactor:1}));e.push(this.selectQsDs)}if(this.getProperty("inputActive")){this.input.setLayoutData(new r("",{growFactor:1}));n.push(this.input)}if(this.getProperty("buttonActive")){this.button.setLayoutData(new r("",{growFactor:0}));n.push(this.button)}if(this.getProperty("cancelButtonActive")){this.cancelButton.setLayoutData(new r("",{growFactor:0}));n.push(this.cancelButton)}if(this.getProperty("actionsMenuButtonActive")){this.actionsMenuButton.setLayoutData(new r("",{growFactor:0}));n.push(this.actionsMenuButton)}if(this.getProperty("selectQsDsActive")){var i=this.getAggregation("_topFlexBox");if(!i){i=new s("",{items:e});this.setAggregation("_topFlexBox",i)}else{i.removeAllAggregation("items");var o=p(e),a;try{for(o.s();!(a=o.n()).done;){var u=a.value;i.addItem(u)}}catch(t){o.e(t)}finally{o.f()}}}var c=this.getAggregation("_flexBox");if(!c){c=new s("",{alignItems:B.Start,items:n});this.setAggregation("_flexBox",c)}else{c.removeAllAggregation("items");var l=p(n),h;try{for(l.s();!(h=l.n()).done;){var f=h.value;c.addItem(f)}}catch(t){l.e(t)}finally{l.f()}}},initSelect:function t(){this.select=new A(this.getId()+"-select",{});this.select.attachChange(function(){if(this.getAggregation("input")){var t=this.getAggregation("input");t.destroySuggestionRows()}})},initSelectQsDs:function t(){this.selectQsDs=new x(this.getId()+"-selectQsDs",{});this.selectQsDs.attachChange(function(){if(this.getAggregation("input")){var t=this.getAggregation("input");t.destroySuggestionRows()}})},initInput:function t(){this.input=new a(this.getId()+"-input")},initButton:function e(){var n=this;this.button=new u(this.getId()+"-button",{tooltip:{parts:[{path:"/searchButtonStatus"}],formatter:function t(e){return m.getText("searchButtonStatus_"+e)}},press:function t(e){var i=n.button.getModel();if(i.config.isUshell){if(n.input.getValue()===""&&i.getDataSource()===i.getDefaultDataSource()){return}}i.invalidateQuery();n.input.destroySuggestionRows();n.input.triggerSearch()}});var i=new t(this.getId()+"-buttonAriaText",{text:{parts:[{path:"/searchButtonStatus"}],formatter:function t(e){return m.getText("searchButtonStatus_"+e)}}});this.setAggregation("_buttonAriaText",i);this.button.addAriaLabelledBy(this.getAggregation("_buttonAriaText"))},initCancelButton:function t(){this.cancelButton=new e(this.getId()+"-buttonCancel",{text:"{i18n>cancelBtn}"});this.cancelButton.addStyleClass("sapUshellSearchCancelButton")},initActionsMenuButton:function t(){var n=this;var s=this.getId();this.actionsMenuButton=new e(s+"-actionsMenuButton",{icon:"sap-icon://overflow",type:v.Emphasized,press:function t(){if(!n.actionsMenu){var e=[];var r=new o(s+"-menuItemSort",{text:"{i18n>actionsMenuSort}",icon:"sap-icon://sort",press:function t(){var e=n.getModel();var i=e.getSearchCompositeControlInstanceByChildControl(n.actionsMenuButton);if(i){i.openSortDialog()}else{}}});e.push(r);var a=new o((n.getId()?n.getId()+"-":"")+"menuItemFilter",{text:"{i18n>actionsMenuFilter}",icon:"sap-icon://filter",press:function t(){var e=n.getModel();var i=e.getSearchCompositeControlInstanceByChildControl(n.actionsMenuButton);if(i){i.openShowMoreDialog()}else{}}});e.push(a);n.actionsMenu=new i({items:e});n.actionsMenu.setModel(n.getModel("i18n"),"i18n")}n.actionsMenu.openBy(n.actionsMenuButton,true)},visible:{parts:[{path:"/facets"},{path:"/facetVisibility"}],formatter:function t(e,n){if((e===null||e===void 0?void 0:e.length)>0&&e.filter(function(t){return t.facetType==="attribute"||t.facetType==="hierarchy"||t.facetType==="hierarchyStatic"}).length>0){return true}else{return false}}}});this.actionsMenuButton.addStyleClass("sapUiTinyMarginBegin")},setModel:function t(e,n){this.select.setModel(e,n);this.input.setModel(e,n);this.button.setModel(e,n);this.cancelButton.setModel(e,n);this.actionsMenuButton.setModel(e,n);this.getAggregation("_buttonAriaText").setModel(e,n);return this},destroy:function t(){c.prototype.destroy.call(this);if(this.select){this.select.destroy()}if(this.selectQsDs){this.selectQsDs.destroy()}if(this.cancelButton){this.cancelButton.destroy()}if(this.actionsMenuButton){this.actionsMenuButton.destroy()}if(this.actionsMenu){this.actionsMenu.destroy()}}});return M})})();
//# sourceMappingURL=SearchFieldGroup.js.map