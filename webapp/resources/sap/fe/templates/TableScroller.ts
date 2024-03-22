import type MdcTable from "sap/ui/mdc/Table";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
const TableScroller = {
	/**
	 * Scrolls an MDCTable to a given row, identified by its context path.
	 * If the row with the path can't be found, the table stays unchanged.
	 *
	 * @param oTable The table that is being scrolled through
	 * @param sRowPath The path identifying the row to scroll to
	 */
	scrollTableToRow: function (oTable: MdcTable, sRowPath: string) {
		const oTableRowBinding = oTable.getRowBinding() as ODataListBinding;

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
				oTable.scrollToIndex(oTableRow.getIndex() as number);
			}
		};

		if (
			(oTable.getGroupConditions() === undefined ||
				(oTable.getGroupConditions() as { groupLevels?: object[] })?.groupLevels?.length === 0) &&
			oTableRowBinding
		) {
			// we only scroll if there are no grouping otherwise scrollToIndex doesn't behave as expected
			const oTableRowBindingContexts = getTableContexts();

			if (
				(oTableRowBindingContexts.length === 0 && oTableRowBinding.getLength() > 0) ||
				oTableRowBindingContexts.some(function (context) {
					return context === undefined;
				})
			) {
				// The contexts are not loaded yet --> wait for a change event before scrolling
				oTableRowBinding.attachEventOnce("dataReceived", findAndScroll);
			} else {
				// Contexts are already loaded --> we can try to scroll immediately
				findAndScroll();
			}
		}
	}
};

export default TableScroller;
