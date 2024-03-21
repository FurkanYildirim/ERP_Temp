sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<div class="ui5-calheader-root"><div data-ui5-cal-header-btn-prev class="${(0, _LitRenderer.classMap)(context.classes.prevButton)}" @mousedown=${context.onPrevButtonClick} title="${(0, _LitRenderer.ifDefined)(context._prevButtonText)}"><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-calheader-arrowicon" name="slim-arrow-left"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div><div class="ui5-calheader-midcontainer"><div data-ui5-cal-header-btn-month class="ui5-calheader-arrowbtn ui5-calheader-middlebtn" ?hidden="${context.isMonthButtonHidden}" tabindex="0" aria-label="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaLabelMonthButton)}" @click=${context.onMonthButtonClick} @keydown=${context.onMonthButtonKeyDown} @keyup=${context.onMonthButtonKeyUp}><span>${(0, _LitRenderer.ifDefined)(context._monthButtonText)}</span>${context.hasSecondaryCalendarType ? block1(context, tags, suffix) : undefined}</div><div data-ui5-cal-header-btn-year class="ui5-calheader-arrowbtn ui5-calheader-middlebtn" ?hidden="${context.isYearButtonHidden}" tabindex="0" @click=${context.onYearButtonClick} @keydown=${context.onYearButtonKeyDown} @keyup=${context.onYearButtonKeyUp}><span>${(0, _LitRenderer.ifDefined)(context._yearButtonText)}</span>${context.hasSecondaryCalendarType ? block2(context, tags, suffix) : undefined}</div></div><div data-ui5-cal-header-btn-next class="${(0, _LitRenderer.classMap)(context.classes.nextButton)}" @mousedown=${context.onNextButtonClick} title=${(0, _LitRenderer.ifDefined)(context._nextButtonText)}><${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)} class="ui5-calheader-arrowicon" name="slim-arrow-right"></${(0, _LitRenderer.scopeTag)("ui5-icon", tags, suffix)}></div></div>` : (0, _LitRenderer.html)`<div class="ui5-calheader-root"><div data-ui5-cal-header-btn-prev class="${(0, _LitRenderer.classMap)(context.classes.prevButton)}" @mousedown=${context.onPrevButtonClick} title="${(0, _LitRenderer.ifDefined)(context._prevButtonText)}"><ui5-icon class="ui5-calheader-arrowicon" name="slim-arrow-left"></ui5-icon></div><div class="ui5-calheader-midcontainer"><div data-ui5-cal-header-btn-month class="ui5-calheader-arrowbtn ui5-calheader-middlebtn" ?hidden="${context.isMonthButtonHidden}" tabindex="0" aria-label="${(0, _LitRenderer.ifDefined)(context.accInfo.ariaLabelMonthButton)}" @click=${context.onMonthButtonClick} @keydown=${context.onMonthButtonKeyDown} @keyup=${context.onMonthButtonKeyUp}><span>${(0, _LitRenderer.ifDefined)(context._monthButtonText)}</span>${context.hasSecondaryCalendarType ? block1(context, tags, suffix) : undefined}</div><div data-ui5-cal-header-btn-year class="ui5-calheader-arrowbtn ui5-calheader-middlebtn" ?hidden="${context.isYearButtonHidden}" tabindex="0" @click=${context.onYearButtonClick} @keydown=${context.onYearButtonKeyDown} @keyup=${context.onYearButtonKeyUp}><span>${(0, _LitRenderer.ifDefined)(context._yearButtonText)}</span>${context.hasSecondaryCalendarType ? block2(context, tags, suffix) : undefined}</div></div><div data-ui5-cal-header-btn-next class="${(0, _LitRenderer.classMap)(context.classes.nextButton)}" @mousedown=${context.onNextButtonClick} title=${(0, _LitRenderer.ifDefined)(context._nextButtonText)}><ui5-icon class="ui5-calheader-arrowicon" name="slim-arrow-right"></ui5-icon></div></div>`;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-calheader-btn-sectext">${(0, _LitRenderer.ifDefined)(context._secondMonthButtonText)}</span>`;

  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-calheader-btn-sectext">${(0, _LitRenderer.ifDefined)(context._secondYearButtonText)}</span>`;

  var _default = block0;
  _exports.default = _default;
});