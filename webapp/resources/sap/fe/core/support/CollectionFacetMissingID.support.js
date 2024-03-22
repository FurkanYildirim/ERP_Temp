/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/support/CommonHelper"], function (IssueManager, CommonHelper) {
  "use strict";

  var _exports = {};
  var getIssueByCategory = CommonHelper.getIssueByCategory;
  var Categories = CommonHelper.Categories;
  var Audiences = CommonHelper.Audiences;
  var IssueCategory = IssueManager.IssueCategory;
  const oCollectionFacetMissingIDIssue = {
    id: "collectionFacetMissingId",
    title: "CollectionFacet: Missing IDs",
    minversion: "1.85",
    audiences: [Audiences.Application],
    categories: [Categories.Usage],
    description: "A collection facet requires an ID in the annotation file to derive a control ID from it.",
    resolution: "Always provide a unique ID to a collection facet.",
    resolutionurls: [{
      text: "CollectionFacets",
      href: "https://ui5.sap.com/#/topic/facfea09018d4376acaceddb7e3f03b6"
    }],
    check: function (oIssueManager, oCoreFacade) {
      getIssueByCategory(oIssueManager, oCoreFacade, IssueCategory.Facets, "MissingID");
    }
  };
  function getRules() {
    return [oCollectionFacetMissingIDIssue];
  }
  _exports.getRules = getRules;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvQ29sbGVjdGlvbkZhY2V0TWlzc2luZ0lESXNzdWUiLCJpZCIsInRpdGxlIiwibWludmVyc2lvbiIsImF1ZGllbmNlcyIsIkF1ZGllbmNlcyIsIkFwcGxpY2F0aW9uIiwiY2F0ZWdvcmllcyIsIkNhdGVnb3JpZXMiLCJVc2FnZSIsImRlc2NyaXB0aW9uIiwicmVzb2x1dGlvbiIsInJlc29sdXRpb251cmxzIiwidGV4dCIsImhyZWYiLCJjaGVjayIsIm9Jc3N1ZU1hbmFnZXIiLCJvQ29yZUZhY2FkZSIsImdldElzc3VlQnlDYXRlZ29yeSIsIklzc3VlQ2F0ZWdvcnkiLCJGYWNldHMiLCJnZXRSdWxlcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29sbGVjdGlvbkZhY2V0TWlzc2luZ0lELnN1cHBvcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSXNzdWVDYXRlZ29yeSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBBdWRpZW5jZXMsIENhdGVnb3JpZXMsIGdldElzc3VlQnlDYXRlZ29yeSB9IGZyb20gXCJzYXAvZmUvY29yZS9zdXBwb3J0L0NvbW1vbkhlbHBlclwiO1xuY29uc3Qgb0NvbGxlY3Rpb25GYWNldE1pc3NpbmdJRElzc3VlID0ge1xuXHRpZDogXCJjb2xsZWN0aW9uRmFjZXRNaXNzaW5nSWRcIixcblx0dGl0bGU6IFwiQ29sbGVjdGlvbkZhY2V0OiBNaXNzaW5nIElEc1wiLFxuXHRtaW52ZXJzaW9uOiBcIjEuODVcIixcblx0YXVkaWVuY2VzOiBbQXVkaWVuY2VzLkFwcGxpY2F0aW9uXSxcblx0Y2F0ZWdvcmllczogW0NhdGVnb3JpZXMuVXNhZ2VdLFxuXHRkZXNjcmlwdGlvbjogXCJBIGNvbGxlY3Rpb24gZmFjZXQgcmVxdWlyZXMgYW4gSUQgaW4gdGhlIGFubm90YXRpb24gZmlsZSB0byBkZXJpdmUgYSBjb250cm9sIElEIGZyb20gaXQuXCIsXG5cdHJlc29sdXRpb246IFwiQWx3YXlzIHByb3ZpZGUgYSB1bmlxdWUgSUQgdG8gYSBjb2xsZWN0aW9uIGZhY2V0LlwiLFxuXHRyZXNvbHV0aW9udXJsczogW3sgdGV4dDogXCJDb2xsZWN0aW9uRmFjZXRzXCIsIGhyZWY6IFwiaHR0cHM6Ly91aTUuc2FwLmNvbS8jL3RvcGljL2ZhY2ZlYTA5MDE4ZDQzNzZhY2FjZWRkYjdlM2YwM2I2XCIgfV0sXG5cdGNoZWNrOiBmdW5jdGlvbiAob0lzc3VlTWFuYWdlcjogYW55LCBvQ29yZUZhY2FkZTogYW55IC8qb1Njb3BlOiBhbnkqLykge1xuXHRcdGdldElzc3VlQnlDYXRlZ29yeShvSXNzdWVNYW5hZ2VyLCBvQ29yZUZhY2FkZSwgSXNzdWVDYXRlZ29yeS5GYWNldHMsIFwiTWlzc2luZ0lEXCIpO1xuXHR9XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJ1bGVzKCkge1xuXHRyZXR1cm4gW29Db2xsZWN0aW9uRmFjZXRNaXNzaW5nSURJc3N1ZV07XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztFQUVBLE1BQU1BLDhCQUE4QixHQUFHO0lBQ3RDQyxFQUFFLEVBQUUsMEJBQTBCO0lBQzlCQyxLQUFLLEVBQUUsOEJBQThCO0lBQ3JDQyxVQUFVLEVBQUUsTUFBTTtJQUNsQkMsU0FBUyxFQUFFLENBQUNDLFNBQVMsQ0FBQ0MsV0FBVyxDQUFDO0lBQ2xDQyxVQUFVLEVBQUUsQ0FBQ0MsVUFBVSxDQUFDQyxLQUFLLENBQUM7SUFDOUJDLFdBQVcsRUFBRSwwRkFBMEY7SUFDdkdDLFVBQVUsRUFBRSxtREFBbUQ7SUFDL0RDLGNBQWMsRUFBRSxDQUFDO01BQUVDLElBQUksRUFBRSxrQkFBa0I7TUFBRUMsSUFBSSxFQUFFO0lBQStELENBQUMsQ0FBQztJQUNwSEMsS0FBSyxFQUFFLFVBQVVDLGFBQWtCLEVBQUVDLFdBQWdCLEVBQWtCO01BQ3RFQyxrQkFBa0IsQ0FBQ0YsYUFBYSxFQUFFQyxXQUFXLEVBQUVFLGFBQWEsQ0FBQ0MsTUFBTSxFQUFFLFdBQVcsQ0FBQztJQUNsRjtFQUNELENBQUM7RUFDTSxTQUFTQyxRQUFRLEdBQUc7SUFDMUIsT0FBTyxDQUFDckIsOEJBQThCLENBQUM7RUFDeEM7RUFBQztFQUFBO0FBQUEifQ==