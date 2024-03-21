sap.ui.define(["exports","sap/ui/webc/common/thirdparty/base/types/ValueState","./ListItem","./Icon","./Avatar","./types/WrappingType","./generated/templates/StandardListItemTemplate.lit"],function(e,t,a,n,i,d,s){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.default=void 0;t=r(t);a=r(a);n=r(n);i=r(i);d=r(d);s=r(s);function r(e){return e&&e.__esModule?e:{default:e}}const l={tag:"ui5-li",properties:{description:{type:String},icon:{type:String},iconEnd:{type:Boolean},image:{type:String},additionalText:{type:String},additionalTextState:{type:t.default,defaultValue:t.default.None},accessibleName:{type:String},wrappingType:{type:d.default,defaultValue:d.default.None},hasTitle:{type:Boolean}},slots:{default:{type:Node}}};class o extends a.default{static get template(){return s.default}static get metadata(){return l}onBeforeRendering(...e){super.onBeforeRendering(...e);this.hasTitle=!!this.textContent}get displayImage(){return!!this.image}get displayIconBegin(){return this.icon&&!this.iconEnd}get displayIconEnd(){return this.icon&&this.iconEnd}static get dependencies(){return[...a.default.dependencies,n.default,i.default]}}o.define();var u=o;e.default=u});
//# sourceMappingURL=StandardListItem.js.map