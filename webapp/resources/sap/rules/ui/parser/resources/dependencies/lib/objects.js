sap.ui.define(["sap/rules/ui/parser/resources/dependencies/lib/constants"],function(t){"use strict";function i(i,a){this.category=t.CATEGORY_VOCA_DO;this.DOName=i;this.vocaName=a}function a(i,a,s){this.category=t.CATEGORY_VOCA_DO_ATTRIBUTE;this.DOName=i;this.attribute=a;this.vocaName=s}function s(i,a,s){this.category=t.CATEGORY_VOCA_DO_ASSOC;this.DOName=i;this.association=a;this.vocaName=s}function e(i,a){this.category=t.CATEGORY_VOCA_ACTIONS;this.actionName=i;if(a){this.vocaName=a}}function o(i,a){this.category=t.CATEGORY_VOCA_ALIASES;this.aliasName=i;this.vocaName=a}return{VocaDOInfo:i,VocaDOAttributes:a,VocaDOAssociation:s,VocaAction:e,VocaAlias:o}},true);
//# sourceMappingURL=objects.js.map