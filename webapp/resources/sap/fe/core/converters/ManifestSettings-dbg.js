/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  // ENUMS
  let TemplateType;
  (function (TemplateType) {
    TemplateType["ListReport"] = "ListReport";
    TemplateType["ObjectPage"] = "ObjectPage";
    TemplateType["AnalyticalListPage"] = "AnalyticalListPage";
  })(TemplateType || (TemplateType = {}));
  _exports.TemplateType = TemplateType;
  let ActionType;
  (function (ActionType) {
    ActionType["DataFieldForAction"] = "ForAction";
    ActionType["DataFieldForIntentBasedNavigation"] = "ForNavigation";
    ActionType["Default"] = "Default";
    ActionType["Primary"] = "Primary";
    ActionType["Secondary"] = "Secondary";
    ActionType["SwitchToActiveObject"] = "SwitchToActiveObject";
    ActionType["SwitchToDraftObject"] = "SwitchToDraftObject";
    ActionType["DraftActions"] = "DraftActions";
    ActionType["CollaborationAvatars"] = "CollaborationAvatars";
    ActionType["DefaultApply"] = "DefaultApply";
    ActionType["Menu"] = "Menu";
    ActionType["ShowFormDetails"] = "ShowFormDetails";
    ActionType["Copy"] = "Copy";
  })(ActionType || (ActionType = {}));
  _exports.ActionType = ActionType;
  let SelectionMode;
  (function (SelectionMode) {
    SelectionMode["Auto"] = "Auto";
    SelectionMode["None"] = "None";
    SelectionMode["Multi"] = "Multi";
    SelectionMode["Single"] = "Single";
  })(SelectionMode || (SelectionMode = {}));
  _exports.SelectionMode = SelectionMode;
  let VariantManagementType;
  (function (VariantManagementType) {
    VariantManagementType["Page"] = "Page";
    VariantManagementType["Control"] = "Control";
    VariantManagementType["None"] = "None";
  })(VariantManagementType || (VariantManagementType = {}));
  _exports.VariantManagementType = VariantManagementType;
  let CreationMode;
  (function (CreationMode) {
    CreationMode["NewPage"] = "NewPage";
    CreationMode["Inline"] = "Inline";
    CreationMode["CreationRow"] = "CreationRow";
    CreationMode["InlineCreationRows"] = "InlineCreationRows";
    CreationMode["External"] = "External";
  })(CreationMode || (CreationMode = {}));
  _exports.CreationMode = CreationMode;
  let VisualizationType; // Table
  (function (VisualizationType) {
    VisualizationType["Table"] = "Table";
    VisualizationType["Chart"] = "Chart";
  })(VisualizationType || (VisualizationType = {}));
  _exports.VisualizationType = VisualizationType;
  let Importance;
  (function (Importance) {
    Importance["High"] = "High";
    Importance["Medium"] = "Medium";
    Importance["Low"] = "Low";
    Importance["None"] = "None";
  })(Importance || (Importance = {}));
  _exports.Importance = Importance;
  let HorizontalAlign; // TYPES
  (function (HorizontalAlign) {
    HorizontalAlign["End"] = "End";
    HorizontalAlign["Begin"] = "Begin";
    HorizontalAlign["Center"] = "Center";
  })(HorizontalAlign || (HorizontalAlign = {}));
  _exports.HorizontalAlign = HorizontalAlign;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZVR5cGUiLCJBY3Rpb25UeXBlIiwiU2VsZWN0aW9uTW9kZSIsIlZhcmlhbnRNYW5hZ2VtZW50VHlwZSIsIkNyZWF0aW9uTW9kZSIsIlZpc3VhbGl6YXRpb25UeXBlIiwiSW1wb3J0YW5jZSIsIkhvcml6b250YWxBbGlnbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWFuaWZlc3RTZXR0aW5ncy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEZvcm1FbGVtZW50VHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9Gb3JtXCI7XG5pbXBvcnQgdHlwZSB7IEZsZXhTZXR0aW5ncywgSGVhZGVyRmFjZXRUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvT2JqZWN0UGFnZS9IZWFkZXJGYWNldFwiO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFRhYmxlUm93Q291bnRNb2RlLCBUYWJsZVR5cGUgfSBmcm9tIFwiLi9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlUmVjb3JkLCBQb3NpdGlvbiwgUG9zaXRpb25hYmxlIH0gZnJvbSBcIi4vaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcblxuLy8gRU5VTVNcblxuZXhwb3J0IGVudW0gVGVtcGxhdGVUeXBlIHtcblx0TGlzdFJlcG9ydCA9IFwiTGlzdFJlcG9ydFwiLFxuXHRPYmplY3RQYWdlID0gXCJPYmplY3RQYWdlXCIsXG5cdEFuYWx5dGljYWxMaXN0UGFnZSA9IFwiQW5hbHl0aWNhbExpc3RQYWdlXCJcbn1cblxuZXhwb3J0IGVudW0gQWN0aW9uVHlwZSB7XG5cdERhdGFGaWVsZEZvckFjdGlvbiA9IFwiRm9yQWN0aW9uXCIsXG5cdERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiA9IFwiRm9yTmF2aWdhdGlvblwiLFxuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsXG5cdFByaW1hcnkgPSBcIlByaW1hcnlcIixcblx0U2Vjb25kYXJ5ID0gXCJTZWNvbmRhcnlcIixcblx0U3dpdGNoVG9BY3RpdmVPYmplY3QgPSBcIlN3aXRjaFRvQWN0aXZlT2JqZWN0XCIsXG5cdFN3aXRjaFRvRHJhZnRPYmplY3QgPSBcIlN3aXRjaFRvRHJhZnRPYmplY3RcIixcblx0RHJhZnRBY3Rpb25zID0gXCJEcmFmdEFjdGlvbnNcIixcblx0Q29sbGFib3JhdGlvbkF2YXRhcnMgPSBcIkNvbGxhYm9yYXRpb25BdmF0YXJzXCIsXG5cdERlZmF1bHRBcHBseSA9IFwiRGVmYXVsdEFwcGx5XCIsXG5cdE1lbnUgPSBcIk1lbnVcIixcblx0U2hvd0Zvcm1EZXRhaWxzID0gXCJTaG93Rm9ybURldGFpbHNcIixcblx0Q29weSA9IFwiQ29weVwiXG59XG5cbmV4cG9ydCBlbnVtIFNlbGVjdGlvbk1vZGUge1xuXHRBdXRvID0gXCJBdXRvXCIsXG5cdE5vbmUgPSBcIk5vbmVcIixcblx0TXVsdGkgPSBcIk11bHRpXCIsXG5cdFNpbmdsZSA9IFwiU2luZ2xlXCJcbn1cblxuZXhwb3J0IGVudW0gVmFyaWFudE1hbmFnZW1lbnRUeXBlIHtcblx0UGFnZSA9IFwiUGFnZVwiLFxuXHRDb250cm9sID0gXCJDb250cm9sXCIsXG5cdE5vbmUgPSBcIk5vbmVcIlxufVxuXG5leHBvcnQgZW51bSBDcmVhdGlvbk1vZGUge1xuXHROZXdQYWdlID0gXCJOZXdQYWdlXCIsXG5cdElubGluZSA9IFwiSW5saW5lXCIsXG5cdENyZWF0aW9uUm93ID0gXCJDcmVhdGlvblJvd1wiLFxuXHRJbmxpbmVDcmVhdGlvblJvd3MgPSBcIklubGluZUNyZWF0aW9uUm93c1wiLFxuXHRFeHRlcm5hbCA9IFwiRXh0ZXJuYWxcIlxufVxuXG5leHBvcnQgZW51bSBWaXN1YWxpemF0aW9uVHlwZSB7XG5cdFRhYmxlID0gXCJUYWJsZVwiLFxuXHRDaGFydCA9IFwiQ2hhcnRcIlxufVxuXG4vLyBUYWJsZVxuZXhwb3J0IHR5cGUgQXZhaWxhYmlsaXR5VHlwZSA9IFwiRGVmYXVsdFwiIHwgXCJBZGFwdGF0aW9uXCIgfCBcIkhpZGRlblwiO1xuZXhwb3J0IGVudW0gSW1wb3J0YW5jZSB7XG5cdEhpZ2ggPSBcIkhpZ2hcIixcblx0TWVkaXVtID0gXCJNZWRpdW1cIixcblx0TG93ID0gXCJMb3dcIixcblx0Tm9uZSA9IFwiTm9uZVwiXG59XG5cbmV4cG9ydCBlbnVtIEhvcml6b250YWxBbGlnbiB7XG5cdEVuZCA9IFwiRW5kXCIsXG5cdEJlZ2luID0gXCJCZWdpblwiLFxuXHRDZW50ZXIgPSBcIkNlbnRlclwiXG59XG5cbi8vIFRZUEVTXG5cbmV4cG9ydCB0eXBlIENvbnRlbnREZW5zaXRpZXNUeXBlID0ge1xuXHRjb21wYWN0PzogYm9vbGVhbjtcblx0Y296eT86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBNYW5pZmVzdFNpZGVDb250ZW50ID0ge1xuXHR0ZW1wbGF0ZTogc3RyaW5nO1xuXHRlcXVhbFNwbGl0PzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvZiBhIEtQSSBpbiB0aGUgbWFuaWZlc3RcbiAqL1xuZXhwb3J0IHR5cGUgS1BJQ29uZmlndXJhdGlvbiA9IHtcblx0bW9kZWw/OiBzdHJpbmc7XG5cdGVudGl0eVNldDogc3RyaW5nO1xuXHRxdWFsaWZpZXI6IHN0cmluZztcblx0ZGV0YWlsTmF2aWdhdGlvbj86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIENvbnRyb2xDb25maWd1cmF0aW9uID0ge1xuXHRbYW5ub3RhdGlvblBhdGg6IHN0cmluZ106IENvbnRyb2xNYW5pZmVzdENvbmZpZ3VyYXRpb247XG59ICYge1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbVwiPzogVGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb247XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0c1wiPzogRmFjZXRzQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckZhY2V0c1wiPzogSGVhZGVyRmFjZXRzQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiPzogRmlsdGVyTWFuaWZlc3RDb25maWd1cmF0aW9uO1xufTtcblxuLyoqXG4gKiBAdHlwZWRlZiBCYXNlTWFuaWZlc3RTZXR0aW5nc1xuICovXG5leHBvcnQgdHlwZSBCYXNlTWFuaWZlc3RTZXR0aW5ncyA9IHtcblx0Y29udGVudD86IHtcblx0XHRoZWFkZXI/OiB7XG5cdFx0XHRmYWNldHM/OiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RIZWFkZXJGYWNldD47XG5cdFx0XHRhY3Rpb25zPzogQ29uZmlndXJhYmxlUmVjb3JkPE1hbmlmZXN0QWN0aW9uPjtcblx0XHR9O1xuXHRcdGZvb3Rlcj86IHtcblx0XHRcdGFjdGlvbnM/OiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RBY3Rpb24+O1xuXHRcdH07XG5cdH07XG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdGNvbnZlcnRlclR5cGU6IFRlbXBsYXRlVHlwZTtcblx0ZW50aXR5U2V0OiBzdHJpbmc7XG5cdG5hdmlnYXRpb24/OiB7XG5cdFx0W25hdmlnYXRpb25QYXRoOiBzdHJpbmddOiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uO1xuXHR9O1xuXHR2aWV3TGV2ZWw/OiBudW1iZXI7XG5cdGZjbEVuYWJsZWQ/OiBib29sZWFuO1xuXHRjb250ZXh0UGF0aD86IHN0cmluZztcblx0dmFyaWFudE1hbmFnZW1lbnQ/OiBWYXJpYW50TWFuYWdlbWVudFR5cGU7XG5cdGRlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoPzogc3RyaW5nO1xuXHRjb250ZW50RGVuc2l0aWVzPzogQ29udGVudERlbnNpdGllc1R5cGU7XG5cdHNoZWxsQ29udGVudERlbnNpdHk/OiBzdHJpbmc7XG5cdGlzRGVza3RvcD86IGJvb2xlYW47XG5cdGlzUGhvbmU/OiBib29sZWFuO1xuXHRlbmFibGVMYXp5TG9hZGluZz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBOYXZpZ2F0aW9uVGFyZ2V0Q29uZmlndXJhdGlvbiA9IHtcblx0b3V0Ym91bmQ/OiBzdHJpbmc7XG5cdG91dGJvdW5kRGV0YWlsPzoge1xuXHRcdHNlbWFudGljT2JqZWN0OiBzdHJpbmc7XG5cdFx0YWN0aW9uOiBzdHJpbmc7XG5cdFx0cGFyYW1ldGVycz86IGFueTtcblx0fTtcblx0cm91dGU/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IHR5cGUgTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbiA9IHtcblx0Y3JlYXRlPzogTmF2aWdhdGlvblRhcmdldENvbmZpZ3VyYXRpb247XG5cdGRldGFpbD86IE5hdmlnYXRpb25UYXJnZXRDb25maWd1cmF0aW9uO1xuXHRkaXNwbGF5Pzoge1xuXHRcdG91dGJvdW5kPzogc3RyaW5nO1xuXHRcdHRhcmdldD86IHN0cmluZzsgLy8gZm9yIGNvbXBhdGliaWxpdHlcblx0XHRyb3V0ZT86IHN0cmluZztcblx0fTtcbn07XG5cbnR5cGUgSGVhZGVyRmFjZXRzQ29udHJvbENvbmZpZ3VyYXRpb24gPSB7XG5cdGZhY2V0czogQ29uZmlndXJhYmxlUmVjb3JkPE1hbmlmZXN0SGVhZGVyRmFjZXQ+O1xufTtcblxudHlwZSBGYWNldHNDb250cm9sQ29uZmlndXJhdGlvbiA9IHtcblx0c2VjdGlvbnM6IENvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdFNlY3Rpb24+O1xufTtcblxudHlwZSBNYW5pZmVzdEZvcm1FbGVtZW50ID0gUG9zaXRpb25hYmxlICYge1xuXHR0eXBlOiBGb3JtRWxlbWVudFR5cGU7XG5cdHRlbXBsYXRlOiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHRmb3JtYXRPcHRpb25zPzogRm9ybWF0T3B0aW9uc1R5cGU7XG59O1xuXG5leHBvcnQgdHlwZSBGb3JtTWFuaWZlc3RDb25maWd1cmF0aW9uID0ge1xuXHRmaWVsZHM6IENvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdEZvcm1FbGVtZW50Pjtcbn07XG5cbmV4cG9ydCB0eXBlIENvbnRyb2xNYW5pZmVzdENvbmZpZ3VyYXRpb24gPVxuXHR8IFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uXG5cdHwgQ2hhcnRNYW5pZmVzdENvbmZpZ3VyYXRpb25cblx0fCBGYWNldHNDb250cm9sQ29uZmlndXJhdGlvblxuXHR8IEhlYWRlckZhY2V0c0NvbnRyb2xDb25maWd1cmF0aW9uXG5cdHwgRm9ybU1hbmlmZXN0Q29uZmlndXJhdGlvblxuXHR8IEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbjtcblxuLyoqIE9iamVjdCBQYWdlICovXG5cbmV4cG9ydCB0eXBlIE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzID0gQmFzZU1hbmlmZXN0U2V0dGluZ3MgJiB7XG5cdGNvbnRlbnQ/OiB7XG5cdFx0aGVhZGVyPzoge1xuXHRcdFx0dmlzaWJsZT86IGJvb2xlYW47XG5cdFx0XHRhbmNob3JCYXJWaXNpYmxlPzogYm9vbGVhbjtcblx0XHRcdGZhY2V0cz86IENvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdEhlYWRlckZhY2V0Pjtcblx0XHR9O1xuXHRcdGJvZHk/OiB7XG5cdFx0XHRzZWN0aW9ucz86IENvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdFNlY3Rpb24+O1xuXHRcdH07XG5cdH07XG5cdGVkaXRhYmxlSGVhZGVyQ29udGVudDogYm9vbGVhbjtcblx0c2VjdGlvbkxheW91dDogXCJUYWJzXCIgfCBcIlBhZ2VcIjtcbn07XG5cbi8qKlxuICogQHR5cGVkZWYgTWFuaWZlc3RIZWFkZXJGYWNldFxuICovXG5leHBvcnQgdHlwZSBNYW5pZmVzdEhlYWRlckZhY2V0ID0ge1xuXHR0eXBlPzogSGVhZGVyRmFjZXRUeXBlO1xuXHRuYW1lPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZT86IHN0cmluZztcblx0cG9zaXRpb24/OiBQb3NpdGlvbjtcblx0dmlzaWJsZT86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR0aXRsZT86IHN0cmluZztcblx0c3ViVGl0bGU/OiBzdHJpbmc7XG5cdHN0YXNoZWQ/OiBib29sZWFuO1xuXHRmbGV4U2V0dGluZ3M/OiBGbGV4U2V0dGluZ3M7XG5cdHJlcXVlc3RHcm91cElkPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZUVkaXQ/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIE1hbmlmZXN0U2VjdGlvblxuICovXG5leHBvcnQgdHlwZSBNYW5pZmVzdFNlY3Rpb24gPSB7XG5cdHRpdGxlPzogc3RyaW5nO1xuXHRpZD86IHN0cmluZztcblx0bmFtZT86IHN0cmluZztcblx0dmlzaWJsZT86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRwb3NpdGlvbj86IFBvc2l0aW9uO1xuXHR0ZW1wbGF0ZT86IHN0cmluZztcblx0c3ViU2VjdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdFN1YlNlY3Rpb24+O1xuXHRhY3Rpb25zPzogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RBY3Rpb24+O1xufTtcblxuZXhwb3J0IHR5cGUgTWFuaWZlc3RTdWJTZWN0aW9uID0ge1xuXHRpZD86IHN0cmluZztcblx0bmFtZT86IHN0cmluZztcblx0dGVtcGxhdGU/OiBzdHJpbmc7XG5cdHRpdGxlPzogc3RyaW5nO1xuXHRwb3NpdGlvbj86IFBvc2l0aW9uO1xuXHR2aXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGFjdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdEFjdGlvbj47XG5cdHNpZGVDb250ZW50PzogTWFuaWZlc3RTaWRlQ29udGVudDtcblx0ZW5hYmxlTGF6eUxvYWRpbmc/OiBib29sZWFuO1xuXHRlbWJlZGRlZENvbXBvbmVudD86IE1hbmlmZXN0UmV1c2VDb21wb25lbnRTZXR0aW5ncztcbn07XG5cbmV4cG9ydCB0eXBlIE1hbmlmZXN0UmV1c2VDb21wb25lbnRTZXR0aW5ncyA9IHtcblx0bmFtZTogc3RyaW5nO1xuXHRzZXR0aW5ncz86IGFueTtcbn07XG5cbi8qKiBMaXN0IFJlcG9ydCAqL1xuXG5leHBvcnQgdHlwZSBMaXN0UmVwb3J0TWFuaWZlc3RTZXR0aW5ncyA9IEJhc2VNYW5pZmVzdFNldHRpbmdzICYge1xuXHRzdGlja3lNdWx0aVRhYkhlYWRlcj86IGJvb2xlYW47XG5cdGluaXRpYWxMb2FkPzogYm9vbGVhbjtcblx0dmlld3M/OiBNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbjtcblx0a2V5UGVyZm9ybWFuY2VJbmRpY2F0b3JzPzoge1xuXHRcdFtrcGlOYW1lOiBzdHJpbmddOiBLUElDb25maWd1cmF0aW9uO1xuXHR9O1xuXHRoaWRlRmlsdGVyQmFyPzogYm9vbGVhbjtcblx0dXNlSGlkZGVuRmlsdGVyQmFyPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFZpZXdQYXRoQ29uZmlndXJhdGlvbiA9IFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbiB8IENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXG5leHBvcnQgdHlwZSBWaWV3Q29uZmlndXJhdGlvbiA9IFZpZXdQYXRoQ29uZmlndXJhdGlvbiB8IEN1c3RvbVZpZXdUZW1wbGF0ZUNvbmZpZ3VyYXRpb247XG5cbmV4cG9ydCB0eXBlIEN1c3RvbVZpZXdUZW1wbGF0ZUNvbmZpZ3VyYXRpb24gPSB7XG5cdGtleT86IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0dGVtcGxhdGU6IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbiA9IHtcblx0a2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uPzogYm9vbGVhbjtcblx0a2V5Pzogc3RyaW5nO1xuXHRlbnRpdHlTZXQ/OiBzdHJpbmc7XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdGNvbnRleHRQYXRoPzogc3RyaW5nO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24gPSB7XG5cdHByaW1hcnk6IFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbltdO1xuXHRzZWNvbmRhcnk6IFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbltdO1xuXHRkZWZhdWx0UGF0aD86IFwiYm90aFwiIHwgXCJwcmltYXJ5XCIgfCBcInNlY29uZGFyeVwiO1xuXHRrZXk/OiBzdHJpbmc7XG5cdHZpc2libGU/OiBzdHJpbmc7XG5cdGFubm90YXRpb25QYXRoPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBAdHlwZWRlZiBNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvblxuICovXG5leHBvcnQgdHlwZSBNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbiA9IHtcblx0cGF0aHM6IFZpZXdDb25maWd1cmF0aW9uW107XG5cdHNob3dDb3VudHM/OiBib29sZWFuO1xufTtcblxuLyoqIEZpbHRlciBDb25maWd1cmF0aW9uICovXG5cbi8qKiBAdHlwZWRlZiBGaWx0ZXJNYW5pZmVzdENvbmZpZ3VyYXRpb24gKi9cbmV4cG9ydCB0eXBlIEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IHtcblx0ZmlsdGVyRmllbGRzPzogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGRNYW5pZmVzdENvbmZpZ3VyYXRpb24+O1xuXHRuYXZpZ2F0aW9uUHJvcGVydGllcz86IHN0cmluZ1tdO1xuXHR1c2VTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW47XG5cdHNob3dDbGVhckJ1dHRvbj86IGJvb2xlYW47XG5cdGluaXRpYWxMYXlvdXQ/OiBzdHJpbmc7XG5cdGxheW91dD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZpZWxkTWFuaWZlc3RDb25maWd1cmF0aW9uID0gUG9zaXRpb25hYmxlICYge1xuXHR0eXBlPzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcblx0dGVtcGxhdGU/OiBzdHJpbmc7XG5cdGF2YWlsYWJpbGl0eT86IEF2YWlsYWJpbGl0eVR5cGU7XG5cdHNldHRpbmdzPzogRmlsdGVyU2V0dGluZ3M7XG5cdHZpc3VhbEZpbHRlcj86IHZpc3VhbEZpbHRlckNvbmZpZ3VyYXRpb247XG5cdHJlcXVpcmVkPzogYm9vbGVhbjtcblx0c2xvdE5hbWU/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSB2aXN1YWxGaWx0ZXJDb25maWd1cmF0aW9uID0ge1xuXHR2YWx1ZUxpc3Q/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBPcGVyYXRvckNvbmZpZ3VyYXRpb24gPSB7XG5cdHBhdGg6IHN0cmluZztcblx0ZXF1YWxzPzogc3RyaW5nO1xuXHRjb250YWlucz86IHN0cmluZztcblx0ZXhjbHVkZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIERlZmF1bHRPcGVyYXRvciA9IHtcblx0b3BlcmF0b3I6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEZpbHRlclNldHRpbmdzID0ge1xuXHRvcGVyYXRvckNvbmZpZ3VyYXRpb24/OiBPcGVyYXRvckNvbmZpZ3VyYXRpb25bXTtcblx0ZGVmYXVsdFZhbHVlcz86IERlZmF1bHRPcGVyYXRvcltdO1xufTtcblxuLyoqIENoYXJ0IENvbmZpZ3VyYXRpb24gKi9cblxuZXhwb3J0IHR5cGUgQ2hhcnRQZXJzb25hbGl6YXRpb25NYW5pZmVzdFNldHRpbmdzID1cblx0fCBib29sZWFuXG5cdHwge1xuXHRcdFx0c29ydDogYm9vbGVhbjtcblx0XHRcdHR5cGU6IGJvb2xlYW47XG5cdFx0XHRpdGVtOiBib29sZWFuO1xuXHRcdFx0ZmlsdGVyOiBib29sZWFuO1xuXHQgIH07XG5cbmV4cG9ydCB0eXBlIENoYXJ0TWFuaWZlc3RDb25maWd1cmF0aW9uID0ge1xuXHRjaGFydFNldHRpbmdzPzoge1xuXHRcdHBlcnNvbmFsaXphdGlvbjogQ2hhcnRQZXJzb25hbGl6YXRpb25NYW5pZmVzdFNldHRpbmdzO1xuXHR9O1xuXHRlbmFibGVBZGRDYXJkVG9JbnNpZ2h0cz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBBY3Rpb25BZnRlckV4ZWN1dGlvbkNvbmZpZ3VyYXRpb24gPSB7XG5cdG5hdmlnYXRlVG9JbnN0YW5jZT86IGJvb2xlYW47XG5cdGVuYWJsZUF1dG9TY3JvbGw/OiBib29sZWFuO1xufTtcblxuLyoqIFRhYmxlIENvbmZpZ3VyYXRpb24gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiBNYW5pZmVzdEFjdGlvblxuICovXG5leHBvcnQgdHlwZSBNYW5pZmVzdEFjdGlvbiA9IHtcblx0ZGVmYXVsdEFjdGlvbj86IHN0cmluZztcblx0bWVudT86IHN0cmluZ1tdO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xuXHRlbmFibGVkPzogc3RyaW5nO1xuXHRwb3NpdGlvbj86IFBvc2l0aW9uO1xuXHRwcmVzcz86IHN0cmluZztcblx0dGV4dD86IHN0cmluZztcblx0X19ub1dyYXA/OiBib29sZWFuO1xuXHRlbmFibGVPblNlbGVjdD86IHN0cmluZztcblx0ZGVmYXVsdFZhbHVlc0Z1bmN0aW9uPzogc3RyaW5nO1xuXHRyZXF1aXJlc1NlbGVjdGlvbj86IGJvb2xlYW47XG5cdGFmdGVyRXhlY3V0aW9uPzogQWN0aW9uQWZ0ZXJFeGVjdXRpb25Db25maWd1cmF0aW9uO1xuXHRpbmxpbmU/OiBib29sZWFuO1xuXHRkZXRlcm1pbmluZz86IGJvb2xlYW47XG5cdGZhY2V0TmFtZT86IHN0cmluZztcblx0Y29tbWFuZD86IHN0cmluZyB8IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCB0eXBlIEJhc2VDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gPSBQb3NpdGlvbmFibGUgJiB7XG5cdHdpZHRoPzogc3RyaW5nO1xuXHRpbXBvcnRhbmNlPzogSW1wb3J0YW5jZTtcblx0aG9yaXpvbnRhbEFsaWduPzogSG9yaXpvbnRhbEFsaWduO1xuXHRhdmFpbGFiaWxpdHk/OiBBdmFpbGFiaWxpdHlUeXBlO1xuXHR0b29sdGlwPzogc3RyaW5nO1xufTtcblxuLy8gQ2FuIGJlIGVpdGhlciBDdXN0b20gQ29sdW1uIGZyb20gTWFuaWZlc3Qgb3IgU2xvdCBDb2x1bW4gZnJvbSBCdWlsZGluZyBCbG9ja1xuZXhwb3J0IHR5cGUgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uID0gQmFzZUN1c3RvbURlZmluZWRUYWJsZUNvbHVtbiAmIHtcblx0dHlwZT86IHN0cmluZztcblx0aGVhZGVyOiBzdHJpbmc7XG5cdHRlbXBsYXRlOiBzdHJpbmc7XG5cdHByb3BlcnRpZXM/OiBzdHJpbmdbXTtcbn07XG5cbi8vIEZvciBvdmVyd3JpdGluZyBBbm5vdGF0aW9uIENvbHVtbiBwcm9wZXJ0aWVzXG5leHBvcnQgdHlwZSBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZSA9IEJhc2VDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gJiB7XG5cdGFmdGVyRXhlY3V0aW9uPzogQWN0aW9uQWZ0ZXJFeGVjdXRpb25Db25maWd1cmF0aW9uO1xuXHRzZXR0aW5ncz86IFRhYmxlQ29sdW1uU2V0dGluZ3M7XG5cdGZvcm1hdE9wdGlvbnM/OiBGb3JtYXRPcHRpb25zVHlwZTtcblx0c2hvd0RhdGFGaWVsZHNMYWJlbD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBUYWJsZUNvbHVtblNldHRpbmdzID0ge1xuXHRtaWNyb0NoYXJ0U2l6ZT86IHN0cmluZztcblx0c2hvd01pY3JvQ2hhcnRMYWJlbD86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIENvbGxlY3Rpb24gb2YgZm9ybWF0IG9wdGlvbnMgZm9yIG11bHRpbGluZSB0ZXh0IGZpZWxkcyBvbiBhIGZvcm0gb3IgaW4gYSB0YWJsZVxuICovXG5leHBvcnQgdHlwZSBGb3JtYXRPcHRpb25zVHlwZSA9IHtcblx0aGFzRHJhZnRJbmRpY2F0b3I/OiBib29sZWFuO1xuXHR0ZXh0TGluZXNFZGl0PzogbnVtYmVyO1xuXHR0ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXk/OiBudW1iZXI7XG5cdHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXk/OiBzdHJpbmc7XG5cdHRleHRNYXhMZW5ndGg/OiBudW1iZXI7XG5cdHNob3dFcnJvck9iamVjdFN0YXR1cz86IHN0cmluZztcblx0ZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSB7XG5cdHRhYmxlU2V0dGluZ3M/OiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uO1xuXHRhY3Rpb25zPzogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RBY3Rpb24+O1xuXHRjb2x1bW5zPzogUmVjb3JkPHN0cmluZywgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uIHwgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGU+O1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVQZXJzb25hbGl6YXRpb25Db25maWd1cmF0aW9uID1cblx0fCBib29sZWFuXG5cdHwge1xuXHRcdFx0c29ydDogYm9vbGVhbjtcblx0XHRcdGNvbHVtbjogYm9vbGVhbjtcblx0XHRcdGZpbHRlcjogYm9vbGVhbjtcblx0XHRcdGdyb3VwOiBib29sZWFuO1xuXHRcdFx0YWdncmVnYXRlOiBib29sZWFuO1xuXHQgIH07XG5cbmV4cG9ydCB0eXBlIFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24gPSB7XG5cdGNyZWF0aW9uTW9kZT86IHtcblx0XHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhPzogYm9vbGVhbjtcblx0XHRjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24/OiBzdHJpbmc7XG5cdFx0Y3JlYXRlQXRFbmQ/OiBib29sZWFuO1xuXHRcdG5hbWU/OiBDcmVhdGlvbk1vZGU7XG5cdFx0aW5saW5lQ3JlYXRpb25Sb3dDb3VudD86IG51bWJlcjtcblx0XHRpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlPzogYm9vbGVhbjtcblx0fTtcblx0ZW5hYmxlRXhwb3J0PzogYm9vbGVhbjtcblx0ZnJvemVuQ29sdW1uQ291bnQ/OiBudW1iZXI7XG5cdHF1aWNrVmFyaWFudFNlbGVjdGlvbj86IHtcblx0XHRwYXRoczogW1xuXHRcdFx0e1xuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHRcdFx0fVxuXHRcdF07XG5cdFx0aGlkZVRhYmxlVGl0bGU/OiBib29sZWFuO1xuXHRcdHNob3dDb3VudHM/OiBib29sZWFuO1xuXHR9O1xuXHRwZXJzb25hbGl6YXRpb24/OiBUYWJsZVBlcnNvbmFsaXphdGlvbkNvbmZpZ3VyYXRpb247XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGhvdyBtYW55IGl0ZW1zIGluIGEgdGFibGUgY2FuIGJlIHNlbGVjdGVkLiBZb3UgaGF2ZSB0aGUgZm9sbG93aW5nIG9wdGlvbnM6XG5cdCAqID0+IGJ5IGRlZmluaW5nICdOb25lJyB5b3UgY2FuIGZ1bGx5IGRpc2FibGUgdGhlIGxpc3Qgc2VsZWN0aW9uXG5cdCAqID0+IGJ5IGRlZmluaW5nICdTaW5nbGUnIHlvdSBhbGxvdyBvbmx5IG9uZSBpdGVtIHRvIGJlIHNlbGVjdGVkXG5cdCAqID0+IGJ5IGRlZmluaW5nICdNdWx0aScgeW91IGFsbG93IHNldmVyYWwgaXRlbXMgdG8gYmUgc2VsZWN0ZWRcblx0ICogPT4gYnkgdXNpbmcgJ0F1dG8nIHlvdSBsZWF2ZSB0aGUgZGVmYXVsdCBkZWZpbml0aW9uICdOb25lJywgZXhjZXB0IGlmIHRoZXJlIGlzIGFuIGFjdGlvbiB0aGF0IHJlcXVpcmVzIGEgc2VsZWN0aW9uIChzdWNoIGFzIGRlbGV0aW5nLCBvciBJQk4pXG5cdCAqL1xuXHRzZWxlY3Rpb25Nb2RlPzogU2VsZWN0aW9uTW9kZTtcblx0dHlwZT86IFRhYmxlVHlwZTtcblx0cm93Q291bnRNb2RlPzogVGFibGVSb3dDb3VudE1vZGU7XG5cdHJvd0NvdW50PzogbnVtYmVyO1xuXHRjb25kZW5zZWRUYWJsZUxheW91dD86IGJvb2xlYW47XG5cdHNlbGVjdEFsbD86IGJvb2xlYW47XG5cdHNlbGVjdGlvbkxpbWl0PzogbnVtYmVyO1xuXHRlbmFibGVQYXN0ZT86IGJvb2xlYW47XG5cdGVuYWJsZUZ1bGxTY3JlZW4/OiBib29sZWFuO1xuXHRlbmFibGVNYXNzRWRpdD86IGJvb2xlYW47XG5cdGVuYWJsZUFkZENhcmRUb0luc2lnaHRzPzogYm9vbGVhbjtcblx0aGllcmFyY2h5UXVhbGlmaWVyPzogc3RyaW5nO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFNQTtFQUFBLElBRVlBLFlBQVk7RUFBQSxXQUFaQSxZQUFZO0lBQVpBLFlBQVk7SUFBWkEsWUFBWTtJQUFaQSxZQUFZO0VBQUEsR0FBWkEsWUFBWSxLQUFaQSxZQUFZO0VBQUE7RUFBQSxJQU1aQyxVQUFVO0VBQUEsV0FBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0VBQUEsR0FBVkEsVUFBVSxLQUFWQSxVQUFVO0VBQUE7RUFBQSxJQWdCVkMsYUFBYTtFQUFBLFdBQWJBLGFBQWE7SUFBYkEsYUFBYTtJQUFiQSxhQUFhO0lBQWJBLGFBQWE7SUFBYkEsYUFBYTtFQUFBLEdBQWJBLGFBQWEsS0FBYkEsYUFBYTtFQUFBO0VBQUEsSUFPYkMscUJBQXFCO0VBQUEsV0FBckJBLHFCQUFxQjtJQUFyQkEscUJBQXFCO0lBQXJCQSxxQkFBcUI7SUFBckJBLHFCQUFxQjtFQUFBLEdBQXJCQSxxQkFBcUIsS0FBckJBLHFCQUFxQjtFQUFBO0VBQUEsSUFNckJDLFlBQVk7RUFBQSxXQUFaQSxZQUFZO0lBQVpBLFlBQVk7SUFBWkEsWUFBWTtJQUFaQSxZQUFZO0lBQVpBLFlBQVk7SUFBWkEsWUFBWTtFQUFBLEdBQVpBLFlBQVksS0FBWkEsWUFBWTtFQUFBO0VBQUEsSUFRWkMsaUJBQWlCLEVBSzdCO0VBQUEsV0FMWUEsaUJBQWlCO0lBQWpCQSxpQkFBaUI7SUFBakJBLGlCQUFpQjtFQUFBLEdBQWpCQSxpQkFBaUIsS0FBakJBLGlCQUFpQjtFQUFBO0VBQUEsSUFPakJDLFVBQVU7RUFBQSxXQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7RUFBQSxHQUFWQSxVQUFVLEtBQVZBLFVBQVU7RUFBQTtFQUFBLElBT1ZDLGVBQWUsRUFNM0I7RUFBQSxXQU5ZQSxlQUFlO0lBQWZBLGVBQWU7SUFBZkEsZUFBZTtJQUFmQSxlQUFlO0VBQUEsR0FBZkEsZUFBZSxLQUFmQSxlQUFlO0VBQUE7RUFBQTtBQUFBIn0=