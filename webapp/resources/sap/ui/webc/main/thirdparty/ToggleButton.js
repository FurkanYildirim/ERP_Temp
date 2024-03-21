sap.ui.define(["exports","sap/ui/webc/common/thirdparty/base/Keys","sap/ui/webc/common/thirdparty/base/Device","./Button","./generated/templates/ToggleButtonTemplate.lit","./generated/themes/ToggleButton.css"],function(e,t,s,a,u,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.default=void 0;a=r(a);u=r(u);i=r(i);function r(e){return e&&e.__esModule?e:{default:e}}const o={tag:"ui5-toggle-button",altTag:"ui5-togglebutton",properties:{pressed:{type:Boolean}}};class n extends a.default{static get metadata(){return o}static get template(){return u.default}static get styles(){return[a.default.styles,i.default]}_onclick(){this.pressed=!this.pressed;if((0,s.isSafari)()){this.getDomRef().focus()}}_onkeyup(e){if((0,t.isSpaceShift)(e)){e.preventDefault();return}super._onkeyup(e)}}n.define();var l=n;e.default=l});
//# sourceMappingURL=ToggleButton.js.map