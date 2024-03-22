/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4330.olap.catalog.impl","sap/sac/df/firefly/ff4340.olap.reference","sap/sac/df/firefly/ff4410.olap.ip.providers","sap/sac/df/firefly/ff8050.application.ui"
],
function(oFF)
{
"use strict";

oFF.Ui5GridCellContextProvider = function() {};
oFF.Ui5GridCellContextProvider.prototype = new oFF.XObject();
oFF.Ui5GridCellContextProvider.prototype._ff_c = "Ui5GridCellContextProvider";

oFF.Ui5GridCellContextProvider.create = function(queryManager)
{
	var instance = new oFF.Ui5GridCellContextProvider();
	instance.setup();
	instance.m_queryManager = queryManager;
	return instance;
};
oFF.Ui5GridCellContextProvider.prototype.m_queryManager = null;
oFF.Ui5GridCellContextProvider.prototype.releaseObject = function()
{
	this.m_queryManager = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.Ui5GridCellContextProvider.prototype.getCellContext = function(syncType, listener, indexInfo)
{
	var clonedQueryManager = this.m_queryManager.cloneQueryManager();
	return oFF.CellContextGetAction.createAndRunAction(syncType, listener, clonedQueryManager, indexInfo);
};

oFF.Ui5GridExport = function() {};
oFF.Ui5GridExport.prototype = new oFF.XObject();
oFF.Ui5GridExport.prototype._ff_c = "Ui5GridExport";

oFF.Ui5GridExport.create = function(table, tableDefinition)
{
	var instance = new oFF.Ui5GridExport();
	instance.m_table = table;
	instance.m_tableDefinition = tableDefinition;
	return instance;
};
oFF.Ui5GridExport.getDimensionMemberName = function(dimensionMember)
{
	var name = null;
	var dimension = dimensionMember.getDimension();
	if (dimension.isStructure())
	{
		var structureMember = dimension.getStructureMember(dimensionMember.getName());
		var displayKeyField = structureMember.getDimension().getDisplayKeyField();
		var fieldValue = structureMember.getFieldValue(displayKeyField);
		if (oFF.notNull(fieldValue))
		{
			name = fieldValue.getValue().getStringRepresentation();
		}
	}
	if (oFF.isNull(name))
	{
		name = dimensionMember.getName();
	}
	return name;
};
oFF.Ui5GridExport.prototype.m_table = null;
oFF.Ui5GridExport.prototype.m_tableDefinition = null;
oFF.Ui5GridExport.prototype._export = function()
{
	var rowList = this.m_table.getRowList();
	var colList = this.m_table.getColumnList();
	var rows = rowList.size();
	var cols = colList.size();
	var endRow = rows - 1;
	var endCol = cols - 1;
	var grid = oFF.PrFactory.createStructure();
	grid.putInteger(oFF.Ui5GridExportConstants.TOTAL_ROWS, this.m_table.getRowsTotalCount());
	grid.putInteger(oFF.Ui5GridExportConstants.TOTAL_COLUMNS, this.m_table.getColumnsTotalCount());
	var headerRowList = this.m_table.getHeaderRowList();
	var cellsList = grid.putNewList("Cells");
	if (this.m_table.getColumnsTotalCount() !== 0 || this.m_table.getRowsTotalCount() !== 0)
	{
		var headerRowSize = headerRowList.size();
		var colEndIndex = oFF.XMath.min(colList.size(), endCol + 1);
		var rowEndIndex = oFF.XMath.min(rowList.size(), endRow + 1);
		var row;
		var effectiveIndex = 0;
		var index;
		for (index = 0; index < headerRowSize; index++)
		{
			row = headerRowList.get(index);
			if (oFF.notNull(row) && !row.isEffectivelyHidden())
			{
				this.renderRow(cellsList, row, effectiveIndex++, colEndIndex);
			}
			else if (oFF.isNull(row))
			{
				effectiveIndex++;
			}
		}
		for (index = 0; index < rowEndIndex; index++)
		{
			row = rowList.get(index);
			if (oFF.notNull(row) && !row.isEffectivelyHidden())
			{
				this.renderRow(cellsList, row, effectiveIndex++, colEndIndex);
			}
			else if (oFF.isNull(row))
			{
				effectiveIndex++;
			}
		}
	}
	return grid;
};
oFF.Ui5GridExport.prototype.renderRow = function(cellList, row, rowIndex, colEndIndex)
{
	var effectiveIndex = 0;
	var preColumnsAmount = this.m_table.getPreColumnsAmount();
	for (var i = 0; i < preColumnsAmount + colEndIndex; i++)
	{
		var cell = row.getCells().get(i);
		if (oFF.notNull(cell) && cell.getParentColumn() !== null && !cell.getParentColumn().isEffectivelyHidden())
		{
			this.renderCell(cellList, cell, rowIndex, effectiveIndex++);
		}
		else if (oFF.isNull(cell))
		{
			effectiveIndex++;
		}
	}
};
oFF.Ui5GridExport.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var cellJson = cellList.addNewStructure();
	cellJson.putInteger(oFF.Ui5GridExportConstants.ROW, rowIndex);
	cellJson.putInteger(oFF.Ui5GridExportConstants.COLUMN, colIndex);
	var mergedColumns = cellBase.getMergedColumns();
	var mergedRows = cellBase.getMergedRows();
	if (mergedColumns !== 0 || mergedRows !== 0)
	{
		var mergerStructure = cellJson.putNewStructure(oFF.Ui5GridExportConstants.MERGED);
		if (mergedColumns >= 0 && mergedRows >= 0)
		{
			if (cellBase.getMergedColumns() > 0)
			{
				mergerStructure.putInteger(oFF.Ui5GridExportConstants.MERGED_COLUMNS, cellBase.getMergedColumns());
			}
			if (cellBase.getMergedRows() > 0)
			{
				mergerStructure.putInteger(oFF.Ui5GridExportConstants.MERGED_ROWS, cellBase.getMergedRows());
			}
		}
		else
		{
			mergerStructure.putInteger(oFF.Ui5GridExportConstants.ORIGINAL_COLUMN, colIndex + cellBase.getMergedColumns());
			mergerStructure.putInteger(oFF.Ui5GridExportConstants.ORIGINAL_ROW, rowIndex + cellBase.getMergedRows());
		}
	}
	if (cellBase.getCommentDocumentId() !== null)
	{
		cellJson.putString(oFF.Ui5GridExportConstants.DOCUMENT_ID, cellBase.getCommentDocumentId());
	}
	var formattingPattern;
	if (!cellBase.isRepeatedHeader() || cellBase.isEffectiveRepetitiveHeaderCells())
	{
		cellJson.putString(oFF.Ui5GridExportConstants.FORMATTED, cellBase.getFormatted());
		formattingPattern = cellBase.getFormattingPattern();
	}
	else
	{
		cellJson.putString(oFF.Ui5GridExportConstants.FORMATTED, "");
		formattingPattern = "";
	}
	if (!cellBase.isHeaderCell())
	{
		cellJson.putString(oFF.Ui5GridExportConstants.FORMAT_STRING, formattingPattern);
	}
	if (cellBase.getPlain() !== null)
	{
		var valueType = cellBase.getPlain().getValueType();
		cellJson.putString(oFF.Ui5GridExportConstants.CELL_DATA_TYPE, valueType.getName());
		if (!cellBase.isHeaderCell())
		{
			if (valueType === oFF.XValueType.BOOLEAN)
			{
				cellJson.putBoolean(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getBoolean(cellBase.getPlain(), false, true));
			}
			else if (valueType === oFF.XValueType.DOUBLE)
			{
				cellJson.putDouble(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
			}
			else if (valueType === oFF.XValueType.LONG)
			{
				cellJson.putLong(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getLong(cellBase.getPlain(), false, true));
			}
			else if (valueType === oFF.XValueType.INTEGER)
			{
				cellJson.putInteger(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getInteger(cellBase.getPlain(), false, true));
			}
			else
			{
				cellJson.putString(oFF.Ui5GridExportConstants.CELL_PLAIN, cellBase.getPlain().getStringRepresentation());
			}
		}
	}
	var effectiveCellType = cellBase.getEffectiveCellType();
	var cellType = this.getCellType(effectiveCellType);
	cellJson.putString(oFF.Ui5GridExportConstants.CELL_TYPE, cellType);
	var tupleElement;
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_VALUE))
	{
		var parentColumn = cellBase.getParentColumn();
		var colTupleIndex = parentColumn.getTupleIndex();
		cellJson.putInteger("TupleIndexCol", colTupleIndex);
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_VALUE))
	{
		var parentRow = cellBase.getParentRow();
		var rowTupleIndex = parentRow.getTupleIndex();
		cellJson.putInteger("TupleIndexRow", rowTupleIndex);
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_HEADER_COL))
	{
		var columnDimension = this.m_tableDefinition.getColumnDimension(rowIndex);
		if (oFF.notNull(columnDimension))
		{
			cellJson.putString("Dimension", this.getDimensionName(columnDimension));
		}
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_HEADER_ROW))
	{
		var rowDimension = this.m_tableDefinition.getRowDimension(colIndex);
		if (oFF.notNull(rowDimension))
		{
			cellJson.putString("Dimension", this.getDimensionName(rowDimension));
		}
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL))
	{
		tupleElement = this.m_tableDefinition.getColumnTupleElement(colIndex, rowIndex);
		var dimensionMember = tupleElement.getDimensionMember();
		cellJson.putString("Member", oFF.Ui5GridExport.getDimensionMemberName(dimensionMember));
		cellJson.putBoolean(oFF.Ui5GridExportConstants.REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW))
	{
		tupleElement = this.m_tableDefinition.getRowTupleElement(colIndex, rowIndex);
		cellJson.putString("Member", oFF.Ui5GridExport.getDimensionMemberName(tupleElement.getDimensionMember()));
		cellJson.putBoolean(oFF.Ui5GridExportConstants.REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	}
	if (cellBase.isEffectiveTotalsContext())
	{
		cellJson.putBoolean(oFF.Ui5GridExportConstants.TOTALS, true);
	}
	var inHierarchy = cellBase.isInHierarchy();
	cellJson.putBoolean(oFF.Ui5GridExportConstants.IN_HIERARCHY, inHierarchy);
	if (inHierarchy)
	{
		cellJson.putInteger(oFF.Ui5GridExportConstants.HIERARCHY_LEVEL, cellBase.getHierarchyLevel());
		cellJson.putBoolean(oFF.Ui5GridExportConstants.HIERARCHY_NODE_EXPANDED, cellBase.isExpanded());
	}
	this.fillSemanticObjects(cellJson, cellBase, rowIndex, colIndex, oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_VALUE));
	if (cellBase.getValueException() !== null)
	{
		cellJson.putString(oFF.Ui5GridExportConstants.VAL_EXPT, cellBase.getValueException().getName());
	}
};
oFF.Ui5GridExport.prototype.fillSemanticObjects = function(cell, cellBase, rowIndex, colIndex, isDataCell)
{
	var semanticObjects = oFF.PrFactory.createList();
	this.addSemanticObjectFromTupleElement(semanticObjects, this.m_tableDefinition.getColumnTupleElement(colIndex, rowIndex));
	this.addSemanticObjectFromTupleElement(semanticObjects, this.m_tableDefinition.getRowTupleElement(colIndex, rowIndex));
	if (isDataCell)
	{
		var tuple = this.m_tableDefinition.getColumnTuple(colIndex);
		var i;
		if (oFF.notNull(tuple))
		{
			for (i = 0; i < tuple.size(); i++)
			{
				this.addSemanticObjectFromTupleElement(semanticObjects, tuple.getTupleElementAt(i));
			}
		}
		tuple = this.m_tableDefinition.getRowTuple(rowIndex);
		if (oFF.notNull(tuple))
		{
			for (i = 0; i < tuple.size(); i++)
			{
				this.addSemanticObjectFromTupleElement(semanticObjects, tuple.getTupleElementAt(i));
			}
		}
	}
	var dataCellRef = cellBase.getDataCellRef();
	if (oFF.notNull(dataCellRef))
	{
		var queryDataCell = this.m_tableDefinition.getQueryModel().getQueryDataCell(dataCellRef);
		if (oFF.notNull(queryDataCell) && queryDataCell.getSemanticObject() !== null)
		{
			semanticObjects.addString(queryDataCell.getSemanticObject());
		}
	}
	if (semanticObjects.hasElements())
	{
		cell.put("SemanticObjects", semanticObjects);
	}
};
oFF.Ui5GridExport.prototype.addSemanticObjectFromTupleElement = function(semanticObjects, tupleElement)
{
	if (oFF.notNull(tupleElement))
	{
		var dimension = this.m_tableDefinition.getQueryModel().getDimensionByName(tupleElement.getDimension().getName());
		var semanticObject = dimension.getSemanticObject();
		if (oFF.notNull(semanticObject))
		{
			semanticObjects.addString(semanticObject);
		}
		if (dimension.isStructure())
		{
			var dimensionMember = tupleElement.getDimensionMember();
			if (oFF.notNull(dimensionMember))
			{
				var structureMember = dimension.getStructureMember(dimensionMember.getName());
				semanticObject = structureMember.getSemanticObject();
				if (oFF.notNull(semanticObject))
				{
					semanticObjects.addString(semanticObject);
				}
			}
		}
	}
};
oFF.Ui5GridExport.prototype.getDimensionName = function(dimension)
{
	var mdDimension = this.m_tableDefinition.getQueryModel().getDimensionByName(dimension.getName());
	if (mdDimension.isMeasureStructure())
	{
		return "MeasureStructure";
	}
	if (mdDimension.isStructure())
	{
		return "NonMeasureStructure";
	}
	return mdDimension.getExternalName() !== null ? mdDimension.getExternalName() : dimension.getName();
};
oFF.Ui5GridExport.prototype.getCellType = function(effectiveCellType)
{
	if (effectiveCellType === oFF.SacTableConstants.CT_VALUE)
	{
		return oFF.Ui5GridExportConstants.CT_VALUE;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_INPUT)
	{
		return oFF.Ui5GridExportConstants.CT_VALUE;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_UNBOOKED)
	{
		return oFF.Ui5GridExportConstants.CT_VALUE;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_HEADER;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_HEADER_ROW;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_HEADER_COL;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_MEMBER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_MEMBER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_EMPTY_AXIS_ROW_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_EMPTY_AXIS_HEADER_ROW;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_EMPTY_AXIS_COLUMN_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_EMPTY_AXIS_HEADER_COL;
	}
	else
	{
		return oFF.XInteger.convertToString(effectiveCellType);
	}
};

oFF.Ui5GridExportConstants = {

	TOTAL_ROWS:"TotalRows",
	TOTAL_COLUMNS:"TotalColumns",
	IN_HIERARCHY:"InHierarchy",
	HIERARCHY_LEVEL:"HierarchyLevel",
	HIERARCHY_NODE_EXPANDED:"HierarchyNodeExpanded",
	ROW:"Row",
	COLUMN:"Column",
	MERGED:"Merged",
	MERGED_COLUMNS:"MergedColumns",
	MERGED_ROWS:"MergedRows",
	ORIGINAL_COLUMN:"OriginalColumn",
	ORIGINAL_ROW:"OriginalRow",
	DOCUMENT_ID:"DocumentId",
	FORMATTED:"Value",
	FORMAT_STRING:"FormatString",
	REPEATED_MEMBER_NAME:"RepeatedMemberName",
	CELL_DATA_TYPE:"Type",
	CELL_PLAIN:"PlainValue",
	CELL_TYPE:"CellType",
	CT_VALUE:"Value",
	CT_HEADER:"Header",
	CT_DIM_HEADER_ROW:"DimHeaderRow",
	CT_DIM_HEADER_COL:"DimHeaderCol",
	CT_DIM_MEMBER_COL:"DimMemberCol",
	CT_DIM_MEMBER_ROW:"DimMemberRow",
	CT_EMPTY_AXIS_HEADER_ROW:"EmptyAxisHeaderRow",
	CT_EMPTY_AXIS_HEADER_COL:"EmptyAxisHeaderCol",
	DATA_ROW:"DataRow",
	DATA_COLUMN:"DataColumn",
	TOTALS:"Totals",
	VAL_EXPT:"ValueException"
};

oFF.QFilterCartesianListTransformer = function() {};
oFF.QFilterCartesianListTransformer.prototype = new oFF.XObject();
oFF.QFilterCartesianListTransformer.prototype._ff_c = "QFilterCartesianListTransformer";

oFF.QFilterCartesianListTransformer.create = function(filterCartesianList)
{
	var transformer = new oFF.QFilterCartesianListTransformer();
	transformer.setup();
	transformer.m_cartesianList = filterCartesianList;
	return transformer;
};
oFF.QFilterCartesianListTransformer.prototype.m_cartesianList = null;
oFF.QFilterCartesianListTransformer.prototype.releaseObject = function()
{
	this.m_cartesianList = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.QFilterCartesianListTransformer.prototype.convertMemberFilterList = function()
{
	var filterList = oFF.PrList.create();
	if (oFF.notNull(this.m_cartesianList))
	{
		for (var j = 0; j < this.m_cartesianList.size(); j++)
		{
			var filterElement = this.m_cartesianList.getCartesianElement(j);
			if (oFF.notNull(filterElement))
			{
				var lowFilterValue = filterElement.getLow();
				var highFilterValue = filterElement.getHigh();
				var isExcluding = filterElement.getSetSign() === oFF.SetSign.EXCLUDING;
				var filterInfo = filterList.addNewStructure();
				filterInfo.putString("Low", lowFilterValue.getString());
				filterInfo.putString("High", highFilterValue.getString());
				filterInfo.putString("ComparisonOperator", filterElement.getComparisonOperator().getName());
				filterInfo.putString("Text", this.computeFilterValueText(filterElement, isExcluding));
				filterInfo.putBoolean("IsExcluding", isExcluding);
				filterInfo.put("Hierarchy", this.getHierarchyInfo(filterElement));
			}
		}
	}
	return filterList;
};
oFF.QFilterCartesianListTransformer.prototype.computeFilterValueText = function(filterElement, isExcluding)
{
	var textLow = this.getFilterElementValueText(filterElement, filterElement.getLow());
	var textHigh = this.getFilterElementValueText(filterElement, filterElement.getHigh());
	var text = oFF.notNull(textHigh) ? oFF.XStringUtils.concatenate3(textLow, " - ", textHigh) : textLow;
	if (isExcluding)
	{
		text = oFF.XStringUtils.concatenate3("!( ", text, " )");
	}
	return text;
};
oFF.QFilterCartesianListTransformer.prototype.getFilterElementValueText = function(filterElement, filterValueBag)
{
	var filterText = filterValueBag.getString();
	var dimension = filterElement.getDimension();
	var textField = dimension.getTextField();
	if (oFF.notNull(textField))
	{
		var supplementValue = filterValueBag.getSupplementValueString(textField.getName());
		if (oFF.XStringUtils.isNotNullAndNotEmpty(supplementValue))
		{
			filterText = supplementValue;
		}
	}
	return filterText;
};
oFF.QFilterCartesianListTransformer.prototype.getHierarchyInfo = function(filterElement)
{
	var hierarchyInfo = oFF.PrStructure.create();
	var hierarchyName = filterElement.getHierarchyName();
	if (oFF.notNull(hierarchyName))
	{
		hierarchyInfo.putString("name", hierarchyName);
		hierarchyInfo.putString("version", filterElement.getHierarchyVersion());
		hierarchyInfo.putString("dueDate", filterElement.getHierarchyDueDate().getStringRepresentation());
		hierarchyInfo.putInteger("levelOffset", filterElement.getLevelOffset());
		hierarchyInfo.putInteger("depth", filterElement.getDepth());
	}
	return hierarchyInfo;
};

oFF.CellContextGetAction = function() {};
oFF.CellContextGetAction.prototype = new oFF.DfRsSyncAction();
oFF.CellContextGetAction.prototype._ff_c = "CellContextGetAction";

oFF.CellContextGetAction.createAndRunAction = function(syncType, listener, queryManager, indexInfo)
{
	var obj = new oFF.CellContextGetAction();
	obj.setupActionAndRun(syncType, listener, indexInfo, queryManager);
	return obj;
};
oFF.CellContextGetAction.prototype.m_queryManager = null;
oFF.CellContextGetAction.prototype.m_indexInfo = null;
oFF.CellContextGetAction.prototype.setupAction = function(syncType, listener, customIdentifier, context)
{
	oFF.DfRsSyncAction.prototype.setupAction.call( this , syncType, listener, customIdentifier, context);
	this.m_queryManager = context;
	this.m_indexInfo = customIdentifier;
};
oFF.CellContextGetAction.prototype.releaseObject = function()
{
	this.m_queryManager = null;
	this.m_indexInfo = null;
	oFF.DfRsSyncAction.prototype.releaseObject.call( this );
};
oFF.CellContextGetAction.prototype.processSynchronization = function(syncType)
{
	try
	{
		var columnIndex = this.m_indexInfo.getColumnIndex();
		var rowIndex = this.m_indexInfo.getRowIndex();
		var classicResultSet = this.m_queryManager.getClassicResultSet();
		var queryModel = this.m_queryManager.getQueryModel();
		var cellContextManager = queryModel.getCellContextManager();
		cellContextManager.addCellContextFromResultSetTuples("rsTuple", classicResultSet.getColumnsAxis().getTupleAt(columnIndex), classicResultSet.getRowsAxis().getTupleAt(rowIndex));
		this.m_queryManager.invalidateState();
		this.m_queryManager.processQueryExecution(syncType, this, null);
		return true;
	}
	catch (t)
	{
		this.addError(oFF.ErrorCodes.CELL_CONTEXT_ACTION_FAILED, oFF.XException.getMessage(t));
		return false;
	}
};
oFF.CellContextGetAction.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	var result = oFF.PrStructure.create();
	if (extResult.isValid())
	{
		this.addAllMessages(extResult);
		var cellContextNames = resultSetContainer.getCellContextNames().getIterator();
		while (cellContextNames.hasNext())
		{
			var cellContextName = cellContextNames.next();
			var currentCellContext = resultSetContainer.getCellContextByName(cellContextName);
			var cartesianProduct = currentCellContext.getCartesianProduct();
			if (oFF.notNull(cartesianProduct))
			{
				for (var i = 0; i < cartesianProduct.size(); i++)
				{
					var cartesianList = cartesianProduct.getCartesianChild(i);
					var dimension = cartesianList.getDimension();
					if (oFF.notNull(dimension))
					{
						var key = dimension.getExternalName();
						if (oFF.XStringUtils.isNullOrEmpty(key))
						{
							key = dimension.getName();
						}
						result.put(key, this.populateDimensionStructure(dimension, cartesianList));
					}
				}
			}
		}
	}
	this.setData(result);
	this.endSync();
};
oFF.CellContextGetAction.prototype.populateDimensionStructure = function(dimension, cartesianList)
{
	var dimensionStructure = oFF.PrStructure.create();
	dimensionStructure.putString("Name", dimension.getExternalName());
	dimensionStructure.putString("TechName", dimension.getName());
	dimensionStructure.putBoolean("HierarchyActive", dimension.isHierarchyActive());
	dimensionStructure.put("Filter", oFF.QFilterCartesianListTransformer.create(cartesianList).convertMemberFilterList());
	return dimensionStructure;
};

oFF.DragonflyModule = function() {};
oFF.DragonflyModule.prototype = new oFF.DfModule();
oFF.DragonflyModule.prototype._ff_c = "DragonflyModule";

oFF.DragonflyModule.s_module = null;
oFF.DragonflyModule.getInstance = function()
{
	if (oFF.isNull(oFF.DragonflyModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.ProviderModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapReferenceModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapCatalogImplModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ApplicationUiModule.getInstance());
		oFF.DragonflyModule.s_module = oFF.DfModule.startExt(new oFF.DragonflyModule());
		oFF.DfModule.stopExt(oFF.DragonflyModule.s_module);
	}
	return oFF.DragonflyModule.s_module;
};
oFF.DragonflyModule.prototype.getName = function()
{
	return "ff8120.dragonfly";
};

oFF.DragonflyModule.getInstance();

return sap.firefly;
	} );