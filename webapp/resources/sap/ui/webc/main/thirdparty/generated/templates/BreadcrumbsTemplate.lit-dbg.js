sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<nav class="ui5-breadcrumbs-root" aria-label="${(0, _LitRenderer.ifDefined)(context._accessibleNameText)}"><ol @focusin="${context._onfocusin}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}"><li class="ui5-breadcrumbs-dropdown-arrow-link-wrapper" ?hidden="${context._isOverflowEmpty}"><${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)} @click="${context._openRespPopover}" accessible-role="button" aria-label="${(0, _LitRenderer.ifDefined)(context._dropdownArrowAccessibleNameText)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(context._ariaHasPopup)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} name="slim-arrow-down" title="${(0, _LitRenderer.ifDefined)(context._dropdownArrowAccessibleNameText)}"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)}></li>${(0, _LitRenderer.repeat)(context._linksData, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}${context._endsWithCurrentLocationLabel ? block2(context, tags, suffix) : undefined}</ol></nav>` : (0, _LitRenderer.html)`<nav class="ui5-breadcrumbs-root" aria-label="${(0, _LitRenderer.ifDefined)(context._accessibleNameText)}"><ol @focusin="${context._onfocusin}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}"><li class="ui5-breadcrumbs-dropdown-arrow-link-wrapper" ?hidden="${context._isOverflowEmpty}"><ui5-link @click="${context._openRespPopover}" accessible-role="button" aria-label="${(0, _LitRenderer.ifDefined)(context._dropdownArrowAccessibleNameText)}" aria-haspopup="${(0, _LitRenderer.ifDefined)(context._ariaHasPopup)}"><ui5-icon name="slim-arrow-down" title="${(0, _LitRenderer.ifDefined)(context._dropdownArrowAccessibleNameText)}"></ui5-icon></ui5-link></li>${(0, _LitRenderer.repeat)(context._linksData, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}${context._endsWithCurrentLocationLabel ? block2(context, tags, suffix) : undefined}</ol></nav>`;
  const block1 = (item, index, context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li class="ui5-breadcrumbs-link-wrapper" id="${(0, _LitRenderer.ifDefined)(item._id)}-link-wrapper"><${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)} @ui5-click="${(0, _LitRenderer.ifDefined)(context._onLinkPress)}" href="${(0, _LitRenderer.ifDefined)(item.href)}" target="${(0, _LitRenderer.ifDefined)(item.target)}" id="${(0, _LitRenderer.ifDefined)(item._id)}-link" accessible-name="${(0, _LitRenderer.ifDefined)(item._accessibleNameText)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}">${(0, _LitRenderer.ifDefined)(item.innerText)}</${(0, _LitRenderer.scopeTag)("ui5-link", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li class="ui5-breadcrumbs-link-wrapper" id="${(0, _LitRenderer.ifDefined)(item._id)}-link-wrapper"><ui5-link @ui5-click="${(0, _LitRenderer.ifDefined)(context._onLinkPress)}" href="${(0, _LitRenderer.ifDefined)(item.href)}" target="${(0, _LitRenderer.ifDefined)(item.target)}" id="${(0, _LitRenderer.ifDefined)(item._id)}-link" accessible-name="${(0, _LitRenderer.ifDefined)(item._accessibleNameText)}" data-ui5-stable="${(0, _LitRenderer.ifDefined)(item.stableDomRef)}">${(0, _LitRenderer.ifDefined)(item.innerText)}</ui5-link></li>`;
  const block2 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<li class="ui5-breadcrumbs-current-location" @click="${context._onLabelPress}"><span aria-current="page" aria-label="${(0, _LitRenderer.ifDefined)(context._currentLocationAccName)}" role="link" id="${(0, _LitRenderer.ifDefined)(context._id)}-labelWrapper"><${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}>${(0, _LitRenderer.ifDefined)(context._currentLocationText)}</${(0, _LitRenderer.scopeTag)("ui5-label", tags, suffix)}></span></li>` : (0, _LitRenderer.html)`<li class="ui5-breadcrumbs-current-location" @click="${context._onLabelPress}"><span aria-current="page" aria-label="${(0, _LitRenderer.ifDefined)(context._currentLocationAccName)}" role="link" id="${(0, _LitRenderer.ifDefined)(context._id)}-labelWrapper"><ui5-label>${(0, _LitRenderer.ifDefined)(context._currentLocationText)}</ui5-label></span></li>`;
  var _default = block0;
  _exports.default = _default;
});