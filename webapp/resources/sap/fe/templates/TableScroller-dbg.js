/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  const TableScroller = {
    /**
     * Scrolls an MDCTable to a given row, identified by its context path.
     * If the row with the path can't be found, the table stays unchanged.
     *
     * @param oTable The table that is being scrolled through
     * @param sRowPath The path identifying the row to scroll to
     */
    scrollTableToRow: function (oTable, sRowPath) {
      var _oTable$getGroupCondi, _oTable$getGroupCondi2;
      const oTableRowBinding = oTable.getRowBinding();
      const getTableContexts = function () {
        if (oTable.data("tableType") === "GridTable") {
          return oTableRowBinding.getContexts(0);
        } else {
          return oTableRowBinding.getCurrentContexts();
        }
      };
      const findAndScroll = function () {
        const oTableRow = getTableContexts().find(function (item) {
          return item && item.getPath() === sRowPath;
        });
        if (oTableRow && oTableRow.getIndex() !== undefined) {
          oTable.scrollToIndex(oTableRow.getIndex());
        }
      };
      if ((oTable.getGroupConditions() === undefined || ((_oTable$getGroupCondi = oTable.getGroupConditions()) === null || _oTable$getGroupCondi === void 0 ? void 0 : (_oTable$getGroupCondi2 = _oTable$getGroupCondi.groupLevels) === null || _oTable$getGroupCondi2 === void 0 ? void 0 : _oTable$getGroupCondi2.length) === 0) && oTableRowBinding) {
        // we only scroll if there are no grouping otherwise scrollToIndex doesn't behave as expected
        const oTableRowBindingContexts = getTableContexts();
        if (oTableRowBindingContexts.length === 0 && oTableRowBinding.getLength() > 0 || oTableRowBindingContexts.some(function (context) {
          return context === undefined;
        })) {
          // The contexts are not loaded yet --> wait for a change event before scrolling
          oTableRowBinding.attachEventOnce("dataReceived", findAndScroll);
        } else {
          // Contexts are already loaded --> we can try to scroll immediately
          findAndScroll();
        }
      }
    }
  };
  return TableScroller;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZVNjcm9sbGVyIiwic2Nyb2xsVGFibGVUb1JvdyIsIm9UYWJsZSIsInNSb3dQYXRoIiwib1RhYmxlUm93QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJnZXRUYWJsZUNvbnRleHRzIiwiZGF0YSIsImdldENvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwiZmluZEFuZFNjcm9sbCIsIm9UYWJsZVJvdyIsImZpbmQiLCJpdGVtIiwiZ2V0UGF0aCIsImdldEluZGV4IiwidW5kZWZpbmVkIiwic2Nyb2xsVG9JbmRleCIsImdldEdyb3VwQ29uZGl0aW9ucyIsImdyb3VwTGV2ZWxzIiwibGVuZ3RoIiwib1RhYmxlUm93QmluZGluZ0NvbnRleHRzIiwiZ2V0TGVuZ3RoIiwic29tZSIsImNvbnRleHQiLCJhdHRhY2hFdmVudE9uY2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlU2Nyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgTWRjVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5jb25zdCBUYWJsZVNjcm9sbGVyID0ge1xuXHQvKipcblx0ICogU2Nyb2xscyBhbiBNRENUYWJsZSB0byBhIGdpdmVuIHJvdywgaWRlbnRpZmllZCBieSBpdHMgY29udGV4dCBwYXRoLlxuXHQgKiBJZiB0aGUgcm93IHdpdGggdGhlIHBhdGggY2FuJ3QgYmUgZm91bmQsIHRoZSB0YWJsZSBzdGF5cyB1bmNoYW5nZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgVGhlIHRhYmxlIHRoYXQgaXMgYmVpbmcgc2Nyb2xsZWQgdGhyb3VnaFxuXHQgKiBAcGFyYW0gc1Jvd1BhdGggVGhlIHBhdGggaWRlbnRpZnlpbmcgdGhlIHJvdyB0byBzY3JvbGwgdG9cblx0ICovXG5cdHNjcm9sbFRhYmxlVG9Sb3c6IGZ1bmN0aW9uIChvVGFibGU6IE1kY1RhYmxlLCBzUm93UGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb1RhYmxlUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkgYXMgT0RhdGFMaXN0QmluZGluZztcblxuXHRcdGNvbnN0IGdldFRhYmxlQ29udGV4dHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAob1RhYmxlLmRhdGEoXCJ0YWJsZVR5cGVcIikgPT09IFwiR3JpZFRhYmxlXCIpIHtcblx0XHRcdFx0cmV0dXJuIG9UYWJsZVJvd0JpbmRpbmcuZ2V0Q29udGV4dHMoMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gb1RhYmxlUm93QmluZGluZy5nZXRDdXJyZW50Q29udGV4dHMoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgZmluZEFuZFNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IG9UYWJsZVJvdyA9IGdldFRhYmxlQ29udGV4dHMoKS5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRcdHJldHVybiBpdGVtICYmIGl0ZW0uZ2V0UGF0aCgpID09PSBzUm93UGF0aDtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKG9UYWJsZVJvdyAmJiBvVGFibGVSb3cuZ2V0SW5kZXgoKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdG9UYWJsZS5zY3JvbGxUb0luZGV4KG9UYWJsZVJvdy5nZXRJbmRleCgpIGFzIG51bWJlcik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChcblx0XHRcdChvVGFibGUuZ2V0R3JvdXBDb25kaXRpb25zKCkgPT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0XHQob1RhYmxlLmdldEdyb3VwQ29uZGl0aW9ucygpIGFzIHsgZ3JvdXBMZXZlbHM/OiBvYmplY3RbXSB9KT8uZ3JvdXBMZXZlbHM/Lmxlbmd0aCA9PT0gMCkgJiZcblx0XHRcdG9UYWJsZVJvd0JpbmRpbmdcblx0XHQpIHtcblx0XHRcdC8vIHdlIG9ubHkgc2Nyb2xsIGlmIHRoZXJlIGFyZSBubyBncm91cGluZyBvdGhlcndpc2Ugc2Nyb2xsVG9JbmRleCBkb2Vzbid0IGJlaGF2ZSBhcyBleHBlY3RlZFxuXHRcdFx0Y29uc3Qgb1RhYmxlUm93QmluZGluZ0NvbnRleHRzID0gZ2V0VGFibGVDb250ZXh0cygpO1xuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdChvVGFibGVSb3dCaW5kaW5nQ29udGV4dHMubGVuZ3RoID09PSAwICYmIG9UYWJsZVJvd0JpbmRpbmcuZ2V0TGVuZ3RoKCkgPiAwKSB8fFxuXHRcdFx0XHRvVGFibGVSb3dCaW5kaW5nQ29udGV4dHMuc29tZShmdW5jdGlvbiAoY29udGV4dCkge1xuXHRcdFx0XHRcdHJldHVybiBjb250ZXh0ID09PSB1bmRlZmluZWQ7XG5cdFx0XHRcdH0pXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gVGhlIGNvbnRleHRzIGFyZSBub3QgbG9hZGVkIHlldCAtLT4gd2FpdCBmb3IgYSBjaGFuZ2UgZXZlbnQgYmVmb3JlIHNjcm9sbGluZ1xuXHRcdFx0XHRvVGFibGVSb3dCaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZWNlaXZlZFwiLCBmaW5kQW5kU2Nyb2xsKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIENvbnRleHRzIGFyZSBhbHJlYWR5IGxvYWRlZCAtLT4gd2UgY2FuIHRyeSB0byBzY3JvbGwgaW1tZWRpYXRlbHlcblx0XHRcdFx0ZmluZEFuZFNjcm9sbCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVGFibGVTY3JvbGxlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUVBLE1BQU1BLGFBQWEsR0FBRztJQUNyQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxnQkFBZ0IsRUFBRSxVQUFVQyxNQUFnQixFQUFFQyxRQUFnQixFQUFFO01BQUE7TUFDL0QsTUFBTUMsZ0JBQWdCLEdBQUdGLE1BQU0sQ0FBQ0csYUFBYSxFQUFzQjtNQUVuRSxNQUFNQyxnQkFBZ0IsR0FBRyxZQUFZO1FBQ3BDLElBQUlKLE1BQU0sQ0FBQ0ssSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLFdBQVcsRUFBRTtVQUM3QyxPQUFPSCxnQkFBZ0IsQ0FBQ0ksV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN2QyxDQUFDLE1BQU07VUFDTixPQUFPSixnQkFBZ0IsQ0FBQ0ssa0JBQWtCLEVBQUU7UUFDN0M7TUFDRCxDQUFDO01BRUQsTUFBTUMsYUFBYSxHQUFHLFlBQVk7UUFDakMsTUFBTUMsU0FBUyxHQUFHTCxnQkFBZ0IsRUFBRSxDQUFDTSxJQUFJLENBQUMsVUFBVUMsSUFBSSxFQUFFO1VBQ3pELE9BQU9BLElBQUksSUFBSUEsSUFBSSxDQUFDQyxPQUFPLEVBQUUsS0FBS1gsUUFBUTtRQUMzQyxDQUFDLENBQUM7UUFDRixJQUFJUSxTQUFTLElBQUlBLFNBQVMsQ0FBQ0ksUUFBUSxFQUFFLEtBQUtDLFNBQVMsRUFBRTtVQUNwRGQsTUFBTSxDQUFDZSxhQUFhLENBQUNOLFNBQVMsQ0FBQ0ksUUFBUSxFQUFFLENBQVc7UUFDckQ7TUFDRCxDQUFDO01BRUQsSUFDQyxDQUFDYixNQUFNLENBQUNnQixrQkFBa0IsRUFBRSxLQUFLRixTQUFTLElBQ3pDLDBCQUFDZCxNQUFNLENBQUNnQixrQkFBa0IsRUFBRSxvRkFBNUIsc0JBQTZEQyxXQUFXLDJEQUF4RSx1QkFBMEVDLE1BQU0sTUFBSyxDQUFDLEtBQ3ZGaEIsZ0JBQWdCLEVBQ2Y7UUFDRDtRQUNBLE1BQU1pQix3QkFBd0IsR0FBR2YsZ0JBQWdCLEVBQUU7UUFFbkQsSUFDRWUsd0JBQXdCLENBQUNELE1BQU0sS0FBSyxDQUFDLElBQUloQixnQkFBZ0IsQ0FBQ2tCLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFDMUVELHdCQUF3QixDQUFDRSxJQUFJLENBQUMsVUFBVUMsT0FBTyxFQUFFO1VBQ2hELE9BQU9BLE9BQU8sS0FBS1IsU0FBUztRQUM3QixDQUFDLENBQUMsRUFDRDtVQUNEO1VBQ0FaLGdCQUFnQixDQUFDcUIsZUFBZSxDQUFDLGNBQWMsRUFBRWYsYUFBYSxDQUFDO1FBQ2hFLENBQUMsTUFBTTtVQUNOO1VBQ0FBLGFBQWEsRUFBRTtRQUNoQjtNQUNEO0lBQ0Q7RUFDRCxDQUFDO0VBQUMsT0FFYVYsYUFBYTtBQUFBIn0=