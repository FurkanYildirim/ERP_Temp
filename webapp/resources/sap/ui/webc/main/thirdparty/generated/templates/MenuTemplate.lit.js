sap.ui.define(["exports","sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"],function(e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.default=void 0;const n=(e,n,s)=>s?(0,i.html)`<${(0,i.scopeTag)("ui5-responsive-popover",n,s)} id="${(0,i.ifDefined)(e._id)}-menu-rp" class="ui5-menu-rp" horizontal-align="Left" placement-type=${(0,i.ifDefined)(e.placementType)} vertical-align=${(0,i.ifDefined)(e.verticalAlign)} hide-arrow allow-target-overlap ?sub-menu=${e._isSubMenu} @before-close=${e._beforePopoverClose}>${e.isPhone?t(e,n,s):undefined}<div id="${(0,i.ifDefined)(e._id)}-menu-main">${e._currentItems.length?a(e,n,s):undefined}</div></${(0,i.scopeTag)("ui5-responsive-popover",n,s)}><div class="ui5-menu-submenus"></div>`:(0,i.html)`<ui5-responsive-popover id="${(0,i.ifDefined)(e._id)}-menu-rp" class="ui5-menu-rp" horizontal-align="Left" placement-type=${(0,i.ifDefined)(e.placementType)} vertical-align=${(0,i.ifDefined)(e.verticalAlign)} hide-arrow allow-target-overlap ?sub-menu=${e._isSubMenu} @before-close=${e._beforePopoverClose}>${e.isPhone?t(e,n,s):undefined}<div id="${(0,i.ifDefined)(e._id)}-menu-main">${e._currentItems.length?a(e,n,s):undefined}</div></ui5-responsive-popover><div class="ui5-menu-submenus"></div>`;const t=(e,n,t)=>t?(0,i.html)`<div slot="header" class="ui5-menu-dialog-header">${e.isSubMenuOpened?s(e,n,t):undefined}<div class="ui5-menu-dialog-title"><div>${(0,i.ifDefined)(e.menuHeaderTextPhone)}</div></div><${(0,i.scopeTag)("ui5-button",n,t)} icon="decline" design="Transparent" aria-label="${(0,i.ifDefined)(e.labelClose)}" @click=${e.close}></${(0,i.scopeTag)("ui5-button",n,t)}></div>`:(0,i.html)`<div slot="header" class="ui5-menu-dialog-header">${e.isSubMenuOpened?s(e,n,t):undefined}<div class="ui5-menu-dialog-title"><div>${(0,i.ifDefined)(e.menuHeaderTextPhone)}</div></div><ui5-button icon="decline" design="Transparent" aria-label="${(0,i.ifDefined)(e.labelClose)}" @click=${e.close}></ui5-button></div>`;const s=(e,n,t)=>t?(0,i.html)`<${(0,i.scopeTag)("ui5-button",n,t)} icon="nav-back" class="ui5-menu-back-button" design="Transparent" aria-label="${(0,i.ifDefined)(e.labelBack)}" @click=${e._navigateBack}></${(0,i.scopeTag)("ui5-button",n,t)}>`:(0,i.html)`<ui5-button icon="nav-back" class="ui5-menu-back-button" design="Transparent" aria-label="${(0,i.ifDefined)(e.labelBack)}" @click=${e._navigateBack}></ui5-button>`;const a=(e,n,t)=>t?(0,i.html)`<${(0,i.scopeTag)("ui5-list",n,t)} id="${(0,i.ifDefined)(e._id)}-menu-list" mode="None" separators="None" accessible-role="menu" @ui5-item-click=${(0,i.ifDefined)(e._itemClick)}>${(0,i.repeat)(e._currentItems,(e,i)=>e._id||i,(i,s)=>o(i,s,e,n,t))}</${(0,i.scopeTag)("ui5-list",n,t)}>`:(0,i.html)`<ui5-list id="${(0,i.ifDefined)(e._id)}-menu-list" mode="None" separators="None" accessible-role="menu" @ui5-item-click=${(0,i.ifDefined)(e._itemClick)}>${(0,i.repeat)(e._currentItems,(e,i)=>e._id||i,(i,s)=>o(i,s,e,n,t))}</ui5-list>`;const o=(e,n,t,s,a)=>a?(0,i.html)`<${(0,i.scopeTag)("ui5-li",s,a)} .associatedItem="${(0,i.ifDefined)(e.item)}" class="ui5-menu-item" id="${(0,i.ifDefined)(t._id)}-menu-item-${n}" icon="${(0,i.ifDefined)(e.item.icon)}" accessible-role="menuitem" ._ariaHasPopup=${(0,i.ifDefined)(e.ariaHasPopup)} ?disabled=${e.item.disabled} ?starts-section=${e.item.startsSection} ?selected=${e.item.subMenuOpened} ?is-phone=${t.isPhone} @mouseover=${t._itemMouseOver} @mouseout=${t._itemMouseOut} @keydown=${t._itemKeyDown}>${e.item.hasDummyIcon?u(e,n,t,s,a):undefined}${(0,i.ifDefined)(e.item.text)}${e.item.hasChildren?d(e,n,t,s,a):l(e,n,t,s,a)}</${(0,i.scopeTag)("ui5-li",s,a)}>`:(0,i.html)`<ui5-li .associatedItem="${(0,i.ifDefined)(e.item)}" class="ui5-menu-item" id="${(0,i.ifDefined)(t._id)}-menu-item-${n}" icon="${(0,i.ifDefined)(e.item.icon)}" accessible-role="menuitem" ._ariaHasPopup=${(0,i.ifDefined)(e.ariaHasPopup)} ?disabled=${e.item.disabled} ?starts-section=${e.item.startsSection} ?selected=${e.item.subMenuOpened} ?is-phone=${t.isPhone} @mouseover=${t._itemMouseOver} @mouseout=${t._itemMouseOut} @keydown=${t._itemKeyDown}>${e.item.hasDummyIcon?u(e,n,t,s,a):undefined}${(0,i.ifDefined)(e.item.text)}${e.item.hasChildren?d(e,n,t,s,a):l(e,n,t,s,a)}</ui5-li>`;const u=(e,n,t,s,a)=>(0,i.html)`<div class="ui5-menu-item-dummy-icon"></div>`;const d=(e,n,t,s,a)=>a?(0,i.html)`<${(0,i.scopeTag)("ui5-icon",s,a)} part="icon" name="slim-arrow-right" class="ui5-menu-item-icon-end"></${(0,i.scopeTag)("ui5-icon",s,a)}>`:(0,i.html)`<ui5-icon part="icon" name="slim-arrow-right" class="ui5-menu-item-icon-end"></ui5-icon>`;const l=(e,n,t,s,a)=>(0,i.html)`${e.item._siblingsWithChildren?c(e,n,t,s,a):undefined}`;const c=(e,n,t,s,a)=>(0,i.html)`<div class="ui5-menu-item-no-icon-end"></div>`;var m=n;e.default=m});
//# sourceMappingURL=MenuTemplate.lit.js.map