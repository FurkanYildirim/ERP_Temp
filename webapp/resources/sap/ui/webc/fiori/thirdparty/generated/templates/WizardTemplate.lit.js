sap.ui.define(["exports","sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"],function(e,i){"use strict";Object.defineProperty(e,"__esModule",{value:true});e.default=void 0;const t=(e,t,n)=>(0,i.html)`<div class="ui5-wiz-root" aria-label="${(0,i.ifDefined)(e.ariaLabelText)}" role="region"><nav class="ui5-wiz-nav" aria-label="${(0,i.ifDefined)(e.navAriaLabelText)}" tabindex="-1"><div class="ui5-wiz-nav-list" role="list" aria-label="${(0,i.ifDefined)(e.listAriaLabelText)}" aria-describedby="wiz-nav-descr" aria-controls="${(0,i.ifDefined)(e._id)}-wiz-content">${(0,i.repeat)(e._stepsInHeader,(e,i)=>e._id||i,(i,d)=>a(i,d,e,t,n))}</div></nav><span id="wiz-nav-descr" class="ui5-hidden-text">${(0,i.ifDefined)(e.navAriaDescribedbyText)}</span><div id="${(0,i.ifDefined)(e._id)}-wiz-content" class="ui5-wiz-content" @scroll="${e.onScroll}">${(0,i.repeat)(e._steps,(e,i)=>e._id||i,(i,a)=>d(i,a,e,t,n))}</div></div>`;const a=(e,t,a,d,n)=>n?(0,i.html)`<${(0,i.scopeTag)("ui5-wizard-tab",d,n)} title-text="${(0,i.ifDefined)(e.titleText)}" subtitle-text="${(0,i.ifDefined)(e.subtitleText)}" icon="${(0,i.ifDefined)(e.icon)}" number="${(0,i.ifDefined)(e.number)}" ?disabled="${e.disabled}" ?selected="${e.selected}" ?hide-separator="${e.hideSeparator}" ?active-separator="${e.activeSeparator}" ?branching-separator="${e.branchingSeparator}" ._wizardTabAccInfo="${(0,i.ifDefined)(e.accInfo)}" data-ui5-content-ref-id="${(0,i.ifDefined)(e.refStepId)}" data-ui5-index="${(0,i.ifDefined)(e.pos)}" _tab-index="${(0,i.ifDefined)(e.tabIndex)}" @ui5-selection-change-requested="${(0,i.ifDefined)(a.onSelectionChangeRequested)}" @ui5-focused="${(0,i.ifDefined)(a.onStepInHeaderFocused)}" @click="${a._onGroupedTabClick}" style=${(0,i.styleMap)(e.styles)}></${(0,i.scopeTag)("ui5-wizard-tab",d,n)}>`:(0,i.html)`<ui5-wizard-tab title-text="${(0,i.ifDefined)(e.titleText)}" subtitle-text="${(0,i.ifDefined)(e.subtitleText)}" icon="${(0,i.ifDefined)(e.icon)}" number="${(0,i.ifDefined)(e.number)}" ?disabled="${e.disabled}" ?selected="${e.selected}" ?hide-separator="${e.hideSeparator}" ?active-separator="${e.activeSeparator}" ?branching-separator="${e.branchingSeparator}" ._wizardTabAccInfo="${(0,i.ifDefined)(e.accInfo)}" data-ui5-content-ref-id="${(0,i.ifDefined)(e.refStepId)}" data-ui5-index="${(0,i.ifDefined)(e.pos)}" _tab-index="${(0,i.ifDefined)(e.tabIndex)}" @ui5-selection-change-requested="${(0,i.ifDefined)(a.onSelectionChangeRequested)}" @ui5-focused="${(0,i.ifDefined)(a.onStepInHeaderFocused)}" @click="${a._onGroupedTabClick}" style=${(0,i.styleMap)(e.styles)}></ui5-wizard-tab>`;const d=(e,t,a,d,n)=>(0,i.html)`<div class="ui5-wiz-content-item" ?hidden="${e.disabled}" ?selected="${e.selected}" ?stretch="${e.stretch}" aria-label="${(0,i.ifDefined)(e.stepContentAriaLabel)}" role="region" data-ui5-content-item-ref-id="${(0,i.ifDefined)(e._id)}"><div class="ui5-wiz-content-item-wrapper"><slot name="${(0,i.ifDefined)(e._individualSlot)}"></slot></div></div>`;var n=t;e.default=n});
//# sourceMappingURL=WizardTemplate.lit.js.map