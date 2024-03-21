sap.ui.define(["exports","sap/ui/webc/common/thirdparty/base/UI5Element","sap/ui/webc/common/thirdparty/base/renderer/LitRenderer","sap/ui/webc/common/thirdparty/base/i18nBundle","sap/ui/webc/common/thirdparty/base/Keys","./generated/templates/AvatarTemplate.lit","./generated/i18n/i18n-defaults","./generated/themes/Avatar.css","./Icon","./types/AvatarSize","./types/AvatarShape","./types/AvatarColorScheme"],function(e,t,i,a,n,r,s,u,l,c,o,d){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.default=void 0;t=p(t);i=p(i);r=p(r);u=p(u);l=p(l);c=p(c);o=p(o);d=p(d);function p(e){return e&&e.__esModule?e:{default:e}}const f={tag:"ui5-avatar",languageAware:true,managedSlots:true,properties:{interactive:{type:Boolean},focused:{type:Boolean},icon:{type:String},initials:{type:String},shape:{type:o.default,defaultValue:o.default.Circle},size:{type:c.default,defaultValue:c.default.S},_size:{type:String,defaultValue:c.default.S},colorScheme:{type:d.default,defaultValue:d.default.Accent6},_colorScheme:{type:String,defaultValue:d.default.Accent6},accessibleName:{type:String},ariaHaspopup:{type:String},_tabIndex:{type:String,noAttribute:true},_hasImage:{type:Boolean}},slots:{default:{propertyName:"image",type:HTMLElement}},events:{click:{}}};class h extends t.default{static get metadata(){return f}static get render(){return i.default}static get styles(){return u.default}static get template(){return r.default}static get dependencies(){return[l.default]}static async onDefine(){h.i18nBundle=await(0,a.getI18nBundle)("@ui5/webcomponents")}get tabindex(){return this._tabIndex||(this.interactive?"0":"-1")}get _effectiveSize(){return this.getAttribute("size")||this._size}get _effectiveBackgroundColor(){return this.getAttribute("_color-scheme")||this._colorScheme}get _role(){return this.interactive?"button":undefined}get _ariaHasPopup(){return this._getAriaHasPopup()}get validInitials(){const e=/^[a-zA-Z]{1,2}$/;if(this.initials&&e.test(this.initials)){return this.initials}return null}get accessibleNameText(){if(this.accessibleName){return this.accessibleName}return h.i18nBundle.getText(s.AVATAR_TOOLTIP)||undefined}get hasImage(){this._hasImage=!!this.image.length;return this._hasImage}onBeforeRendering(){this._onclick=this.interactive?this._onClickHandler.bind(this):undefined}_onClickHandler(e){e.stopPropagation();this.fireEvent("click")}_onkeydown(e){if(!this.interactive){return}if((0,n.isEnter)(e)){this.fireEvent("click")}if((0,n.isSpace)(e)){e.preventDefault()}}_onkeyup(e){if(this.interactive&&!e.shiftKey&&(0,n.isSpace)(e)){this.fireEvent("click")}}_onfocusout(){this.focused=false}_onfocusin(){if(this.interactive){this.focused=true}}_getAriaHasPopup(){if(!this.interactive||this.ariaHaspopup===""){return}return this.ariaHaspopup}}h.define();var g=h;e.default=g});
//# sourceMappingURL=Avatar.js.map