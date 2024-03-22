/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2650.visualization.impl","sap/sac/df/firefly/ff2200.ui"
],
function(oFF)
{
"use strict";

oFF.GenericTableRenderer = function() {};
oFF.GenericTableRenderer.prototype = new oFF.XObject();
oFF.GenericTableRenderer.prototype._ff_c = "GenericTableRenderer";

oFF.GenericTableRenderer.create = function(sacTable)
{
	var instance = new oFF.GenericTableRenderer();
	instance.m_table = sacTable;
	instance.m_tableWidgetRenderHelper = oFF.SacTableWidgetRenderHelper.createTableRenderHelper(sacTable);
	return instance;
};
oFF.GenericTableRenderer.prototype.m_table = null;
oFF.GenericTableRenderer.prototype.m_tableJson = null;
oFF.GenericTableRenderer.prototype.m_rowList = null;
oFF.GenericTableRenderer.prototype.m_tableWidgetRenderHelper = null;
oFF.GenericTableRenderer.prototype.setGridConfigration = function(gridConfig)
{
	if (oFF.notNull(gridConfig))
	{
		this.m_table.setStripeDataColumns(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_STRIPE_DATA_COLUMNS));
		this.m_table.setStripeDataRows(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_STRIPE_DATA_ROWS));
		this.m_table.setFreezeHeaderRows(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_FREEZE_ROWS));
		this.m_table.setFreezeHeaderColumns(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_FREEZE_COLUMNS));
		this.m_table.setShowFreezeLines(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_SHOW_FREEZE_LINES));
		this.m_table.setShowGrid(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_GRID, true));
		this.m_table.setShowTableTitle(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_TABLE_TITLE, true));
		this.m_table.setShowTableDetails(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_TABLE_DETAILS, false));
		this.m_table.setShowSubTitle(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_SUBTITLE, false));
		this.m_table.setShowCoordinateHeader(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_COORDINATE_HEADER, true));
		this.m_table.setHeaderColor(gridConfig.getStringByKey(oFF.SacTableConstants.S_HEADER_COLOR));
		this.m_table.setTitle(gridConfig.getStringByKey(oFF.SacTableConstants.S_TITLE));
		this.m_table.setWidth(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_WIDTH, 1257));
		this.m_table.setHeight(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_HEIGHT, 451));
		this.m_table.setMinCellWidth(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_MIN_CELL_WIDTH, 60));
		this.m_table.setMaxCellWidth(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_MAX_CELL_WIDTH, 300));
		this.m_table.setRepetitiveHeaderNames(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_REPETITIVE_MEMBER_NAMES));
		this.m_table.setMergeRepetitiveHeaderCells(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_MERGE_REPETITIVE_HEADERS));
		this.m_table.setTotalLevel6Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_6_COLOR));
		this.m_table.setTotalLevel5Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_5_COLOR));
		this.m_table.setTotalLevel4Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_4_COLOR));
		this.m_table.setTotalLevel3Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_3_COLOR));
		this.m_table.setTotalLevel2Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_2_COLOR));
		this.m_table.setTotalLevel1Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_1_COLOR));
		this.m_table.setTotalLevel0Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_0_COLOR));
	}
};
oFF.GenericTableRenderer.prototype.render = function()
{
	this.prepareJsonStructure();
	this.m_table.formatHeaderColumnWidths();
	this.m_table.formatDataColumnWidths();
	this.fillRows();
	this.postRender();
	return this.m_tableJson;
};
oFF.GenericTableRenderer.prototype.prepareJsonStructure = function()
{
	this.m_tableJson = oFF.PrFactory.createStructure();
	this.m_rowList = this.m_tableJson.putNewList(oFF.SacTableConstants.TD_L_ROWS);
};
oFF.GenericTableRenderer.prototype.fillRows = function()
{
	this.m_tableWidgetRenderHelper.fillRowsFromList(this.m_table.getHeaderRowList(), this.m_rowList, 0, this.m_table.isFreezeHeaderRows(), this.m_table.getFreezeUpToRow());
	this.m_tableWidgetRenderHelper.fillRowsFromList(this.m_table.getRowList(), this.m_rowList, this.m_table.getHeaderRowList().size(), false, this.m_table.getFreezeUpToRow());
};
oFF.GenericTableRenderer.prototype.postRender = function()
{
	return this.m_tableWidgetRenderHelper.renderGenericSettings(this.m_tableJson);
};
oFF.GenericTableRenderer.prototype.releaseObject = function()
{
	this.m_table = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.GenericTableRenderer.prototype.getTableJson = function()
{
	return this.m_tableJson;
};

oFF.RenderThemingHelper = {

	THEME_PREFIX:"theme?",
	THEME_DELIMINATOR:":",
	remapColor:function(color)
	{
			var resultColor = color;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(color))
		{
			var colorKey = color;
			var colorFallback = color;
			if (oFF.XString.startsWith(colorKey, oFF.RenderThemingHelper.THEME_PREFIX) && oFF.XString.containsString(color, oFF.RenderThemingHelper.THEME_DELIMINATOR))
			{
				var delminitationIndex = oFF.XString.indexOf(color, oFF.RenderThemingHelper.THEME_DELIMINATOR);
				colorKey = oFF.XString.substring(color, oFF.XString.size(oFF.RenderThemingHelper.THEME_PREFIX), delminitationIndex);
				colorFallback = oFF.XString.substring(color, delminitationIndex + 1, oFF.XString.size(color));
			}
			var mappedColor = oFF.UiFramework.currentFramework().getThemeParameter(colorKey);
			resultColor = oFF.XStringUtils.isNotNullAndNotEmpty(mappedColor) ? mappedColor : colorFallback;
		}
		return resultColor;
	}
};

oFF.SacTableCsvRenderHelper = function() {};
oFF.SacTableCsvRenderHelper.prototype = new oFF.XObject();
oFF.SacTableCsvRenderHelper.prototype._ff_c = "SacTableCsvRenderHelper";

oFF.SacTableCsvRenderHelper.DEFAULT_ESCAPOR = "\"";
oFF.SacTableCsvRenderHelper.DEFAULT_CELL_SEPARATOR = ",";
oFF.SacTableCsvRenderHelper.DEFAULT_LINE_SEPARATOR = "\n";
oFF.SacTableCsvRenderHelper.createDefaultTableRenderHelper = function(tableObject)
{
	var instance = new oFF.SacTableCsvRenderHelper();
	instance.initializeRH(tableObject, oFF.SacTableCsvRenderHelper.DEFAULT_LINE_SEPARATOR, oFF.SacTableCsvRenderHelper.DEFAULT_CELL_SEPARATOR, oFF.SacTableCsvRenderHelper.DEFAULT_ESCAPOR);
	return instance;
};
oFF.SacTableCsvRenderHelper.createTableRenderHelper = function(tableObject, lineSeparator, separator, escapor)
{
	var instance = new oFF.SacTableCsvRenderHelper();
	instance.initializeRH(tableObject, lineSeparator, separator, escapor);
	return instance;
};
oFF.SacTableCsvRenderHelper.prototype.m_escapor = null;
oFF.SacTableCsvRenderHelper.prototype.m_cellSeparator = null;
oFF.SacTableCsvRenderHelper.prototype.m_lineSeparator = null;
oFF.SacTableCsvRenderHelper.prototype.m_escapedEscapor = null;
oFF.SacTableCsvRenderHelper.prototype.initializeRH = function(tableObject, lineSeparator, separator, escapor)
{
	this.m_lineSeparator = lineSeparator;
	this.m_cellSeparator = separator;
	this.m_escapor = escapor;
};
oFF.SacTableCsvRenderHelper.prototype.releaseObject = function()
{
	this.m_lineSeparator = null;
	this.m_cellSeparator = null;
	this.m_escapor = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacTableCsvRenderHelper.prototype.fillRowsFromList = function(rowList, stringBuffer)
{
	for (var i = 0; i < rowList.size(); i++)
	{
		var row = rowList.get(i);
		if (oFF.notNull(row) && !row.isEffectivelyHidden())
		{
			this.fillCellsFromList(row.getCells(), stringBuffer);
		}
		stringBuffer.append(this.m_lineSeparator);
	}
};
oFF.SacTableCsvRenderHelper.prototype.fillCellsFromList = function(cells, stringBuffer)
{
	if (oFF.XCollectionUtils.hasElements(cells))
	{
		var cellsSize = cells.size();
		for (var i = 0; i < cellsSize; i++)
		{
			var cellObject = cells.get(i);
			if (oFF.notNull(cellObject) && cellObject.getParentColumn() !== null && !cellObject.getParentColumn().isEffectivelyHidden())
			{
				stringBuffer.append(this.resolveCell(cellObject));
				stringBuffer.append(this.m_cellSeparator);
			}
		}
	}
};
oFF.SacTableCsvRenderHelper.prototype.resolveCell = function(tableCell)
{
	var cellBase = tableCell;
	var formattedString;
	if (!cellBase.isRepeatedHeader() || cellBase.isEffectiveRepetitiveHeaderCells())
	{
		formattedString = cellBase.getFormatted();
	}
	else
	{
		formattedString = "";
	}
	var needsEscape = oFF.XString.containsString(formattedString, this.m_cellSeparator) || oFF.XString.containsString(formattedString, this.m_lineSeparator);
	if (oFF.XString.containsString(formattedString, this.m_escapor))
	{
		needsEscape = true;
		formattedString = oFF.XString.replace(formattedString, this.m_escapor, this.getEscapedEscapor());
	}
	if (needsEscape)
	{
		formattedString = oFF.XStringUtils.concatenate3(this.m_escapor, formattedString, this.m_escapor);
	}
	return formattedString;
};
oFF.SacTableCsvRenderHelper.prototype.getEscapedEscapor = function()
{
	if (oFF.isNull(this.m_escapedEscapor))
	{
		this.m_escapedEscapor = oFF.XStringUtils.concatenate2(this.m_escapor, this.m_escapor);
	}
	return this.m_escapedEscapor;
};

oFF.SacTableExportHelper = function() {};
oFF.SacTableExportHelper.prototype = new oFF.XObject();
oFF.SacTableExportHelper.prototype._ff_c = "SacTableExportHelper";

oFF.SacTableExportHelper.createTableExportHelper = function(table, niceTitle)
{
	var instance = new oFF.SacTableExportHelper();
	instance.initializeRH(table, niceTitle);
	return instance;
};
oFF.SacTableExportHelper.prototype.m_tableObject = null;
oFF.SacTableExportHelper.prototype.m_niceTitle = null;
oFF.SacTableExportHelper.prototype.initializeRH = function(tableObject, niceTitle)
{
	this.m_tableObject = tableObject;
	this.m_niceTitle = niceTitle;
};
oFF.SacTableExportHelper.prototype.releaseObject = function()
{
	this.m_tableObject = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacTableExportHelper.prototype.getTableObject = function()
{
	return this.m_tableObject;
};
oFF.SacTableExportHelper.prototype.getExportableStructure = function(startRow, endRow, startCol, endCol)
{
	var tableJson = oFF.PrFactory.createStructure();
	var index;
	var headerRowList = this.m_tableObject.getHeaderRowList();
	var rowList = this.m_tableObject.getRowList();
	var colList = this.m_tableObject.getColumnList();
	var prRowList = tableJson.putNewList(oFF.SacTableConstants.TD_L_ROWS);
	var headerRowSize = headerRowList.size();
	var colEndIndex = oFF.XMath.min(colList.size(), endCol + 1);
	var rowEndIndex = oFF.XMath.min(rowList.size(), endRow + 1);
	this.renderGenericSettings(tableJson, startCol, colEndIndex, startRow);
	var row;
	var effectiveIndex = 0;
	for (index = 0; index < headerRowSize; index++)
	{
		row = headerRowList.get(index);
		if (oFF.notNull(row) && !row.isEffectivelyHidden())
		{
			this.renderRow(prRowList, row, effectiveIndex++, startCol, colEndIndex);
		}
		else if (oFF.isNull(row))
		{
			effectiveIndex++;
		}
	}
	for (index = startRow; index < rowEndIndex; index++)
	{
		row = rowList.get(index);
		if (oFF.notNull(row) && !row.isEffectivelyHidden())
		{
			this.renderRow(prRowList, row, effectiveIndex++, startCol, colEndIndex);
		}
		else if (oFF.isNull(row))
		{
			effectiveIndex++;
		}
	}
	return tableJson;
};
oFF.SacTableExportHelper.prototype.renderGenericSettings = function(tableJson, startCol, colEndIndex, startRow)
{
	tableJson.putString(oFF.SacTableConstants.S_PRETTY_PRINTED_TITLE, this.m_niceTitle);
	var style = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_STYLE);
	var font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	font.putInteger(oFF.SacTableConstants.FS_N_SIZE, 42);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_REVERSED_HIERARCHY, this.m_tableObject.isReversedHierarchy());
	var title = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_TITLE);
	var titleStyle = title.putNewStructure(oFF.SacTableConstants.TD_M_TITLE_STYLE);
	title.putNewStructure(oFF.SacTableConstants.TD_M_SUBTITLE_STYLE);
	var titleFont = titleStyle.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	titleFont.putInteger(oFF.SacTableConstants.FS_N_SIZE, 17);
	var titleText = this.m_tableObject.getTitle();
	title.putStringNotNullAndNotEmpty(oFF.SacTableConstants.TD_S_TITLE_TEXT, titleText);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(titleText))
	{
		title.putNewList(oFF.SacTableConstants.TD_L_TITLE_CHUNKS).addString(titleText);
	}
	var titleTokens = title.putNewStructure(oFF.SacTableConstants.TD_M_TOKEN_DATA);
	var titelTokenStyles = titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_STYLES);
	titelTokenStyles.putString("line-height", "");
	titelTokenStyles.putString("text-align", "left");
	titelTokenStyles.putString("font-size", "13px");
	titelTokenStyles.putString("align-items", "center");
	titelTokenStyles.putString("margin-top", "3px");
	titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_ATTRIBUTES);
	titleTokens.putNewList(oFF.SacTableConstants.TE_L_CLASSES).addString("sapReportEngineTokenContainer");
	titleTokens.putString(oFF.SacTableConstants.TE_S_TAG, "div");
	var titleVisible = this.m_tableObject.isShowTableTitle();
	var subtitleVisible = this.m_tableObject.isShowSubTitle();
	var detailsVisible = this.m_tableObject.isShowTableDetails();
	title.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, titleVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, subtitleVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, detailsVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_EDITABLE, false);
	var titleAreaHeight = 40;
	if (titleVisible && (detailsVisible || subtitleVisible))
	{
		titleAreaHeight = 52;
	}
	else if (!titleVisible && !detailsVisible && !subtitleVisible)
	{
		titleAreaHeight = 0;
	}
	titleStyle.putInteger(oFF.SacTableConstants.TS_N_HEIGHT, titleAreaHeight);
	var i;
	var tableHeight = this.m_tableObject.getHeight();
	var tableWidth = this.m_tableObject.getWidth();
	tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_HEIGHT, tableHeight);
	var showGrid = this.m_tableObject.isShowGrid();
	var freezingColumns = this.m_tableObject.isFreezeHeaderColumns() || this.m_tableObject.getFreezeUpToColumn() > -1;
	var freezing = this.m_tableObject.isFreezeHeaderRows() || this.m_tableObject.getFreezeUpToRow() > -1 || freezingColumns;
	var freezeUpToColumn = this.m_tableObject.getFreezeUpToColumn();
	if (freezeUpToColumn > -1 || !this.m_tableObject.isFreezeHeaderColumns())
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, freezeUpToColumn);
	}
	else
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, this.m_tableObject.getPreColumnsAmount() - 1);
	}
	var freezeUpToRow = this.m_tableObject.getFreezeUpToRow();
	if (freezeUpToRow > -1 || !this.m_tableObject.isFreezeHeaderRows())
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, freezeUpToRow);
	}
	else
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
	}
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_FREEZE_LINES, freezing && this.m_tableObject.isShowFreezeLines());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_HAS_FIXED_ROWS_COLS, freezing);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, showGrid);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_COORDINATE_HEADER, this.m_tableObject.isShowCoordinateHeader());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, this.m_tableObject.isShowGrid());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, this.m_tableObject.isShowSubTitle());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, this.m_tableObject.isShowTableTitle());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, this.m_tableObject.isShowTableDetails());
	var columnSettings = tableJson.putNewList(oFF.SacTableConstants.TD_L_COLUMN_SETTINGS);
	var availableWidth = tableWidth - 100;
	var columnWidths = this.m_tableObject.getColumnEmWidths();
	var overallSizeUnits = oFF.XStream.of(columnWidths).reduce(oFF.XIntegerValue.create(1),  function(a, b){
		return oFF.XIntegerValue.create(a.getInteger() + b.getInteger());
	}.bind(this)).getInteger();
	var factor = oFF.XMath.div(availableWidth, overallSizeUnits);
	if (factor > 15)
	{
		factor = 15;
	}
	if (factor < 10)
	{
		factor = 10;
	}
	var minPixelCellWidth = this.m_tableObject.getMinCellWidth();
	var maxPixelCellWidth = this.m_tableObject.getMaxCellWidth();
	var preciseWidth;
	var columnObject;
	var headerWidth = 0;
	var dataWidth = 0;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		preciseWidth = minPixelCellWidth;
		if (i < columnWidths.size())
		{
			preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
		}
		columnObject = this.m_tableObject.getHeaderColumnList().get(i);
		columnObject.setDefaultWidth(preciseWidth);
		headerWidth = headerWidth + preciseWidth;
	}
	if (this.m_tableObject.getDataColumnsAmount() > 0)
	{
		for (i = this.m_tableObject.getPreColumnsAmount() + startCol; i < this.m_tableObject.getPreColumnsAmount() + colEndIndex; i++)
		{
			preciseWidth = minPixelCellWidth;
			if (i < columnWidths.size())
			{
				preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
			}
			dataWidth = dataWidth + preciseWidth;
			columnObject = this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount());
			if (oFF.notNull(columnObject))
			{
				columnObject.setDefaultWidth(preciseWidth);
			}
		}
	}
	var totalWidth = 20;
	var columnStructure;
	var effectiveIndex = 0;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		columnObject = this.m_tableObject.getHeaderColumnList().get(i);
		if (oFF.isNull(columnObject) || !columnObject.isEffectivelyHidden())
		{
			preciseWidth = oFF.isNull(columnObject) ? 0 : columnObject.getWidth();
			totalWidth = totalWidth + preciseWidth;
			columnStructure = columnSettings.addNewStructure();
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, effectiveIndex);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
			columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(effectiveIndex));
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, false);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.isFreezeHeaderColumns() && freezeUpToColumn < 0 || freezeUpToColumn >= effectiveIndex);
			this.renderColumn(columnObject, columnStructure);
			effectiveIndex++;
		}
	}
	if (this.m_tableObject.getDataColumnsAmount() > startCol)
	{
		for (i = startCol; i < colEndIndex; i++)
		{
			columnObject = this.m_tableObject.getColumnList().get(i);
			if (oFF.isNull(columnObject) || !columnObject.isEffectivelyHidden())
			{
				preciseWidth = oFF.isNull(columnObject) ? 0 : columnObject.getWidth();
				totalWidth = totalWidth + preciseWidth;
				columnStructure = columnSettings.addNewStructure();
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, effectiveIndex);
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
				columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(effectiveIndex + startCol));
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.getFreezeUpToColumn() >= effectiveIndex + startCol);
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
				this.renderColumn(columnObject, columnStructure);
				effectiveIndex++;
			}
		}
	}
	var dataRowAmount = this.m_tableObject.getDataRowAmount();
	var headerRowAmount = this.m_tableObject.getHeaderRowList().size();
	var totalHeight = 20 + this.m_tableObject.getOverallHeight();
	if (showGrid)
	{
		totalHeight = totalHeight + dataRowAmount + headerRowAmount;
	}
	var cellChartInfo = this.m_tableObject.getCellChartInfo();
	if (oFF.XCollectionUtils.hasElements(cellChartInfo))
	{
		var cellChartInfoStructure = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_CELL_CHART_DATA);
		var memberNames = cellChartInfo.getKeysAsIteratorOfString();
		while (memberNames.hasNext())
		{
			var memberName = memberNames.next();
			var cellChartMemberInfo = cellChartInfo.getByKey(memberName);
			var memberCellChartData = cellChartInfoStructure.putNewStructure(memberName);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_COL, cellChartMemberInfo.getStartColumn() - startCol);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_COL, cellChartMemberInfo.getEndColumn() - startCol);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_ROW, cellChartMemberInfo.getStartRow() - startRow);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_ROW, cellChartMemberInfo.getEndRow() - startRow);
			memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MIN, cellChartMemberInfo.getMinValue());
			memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MAX, cellChartMemberInfo.getMaxValue());
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_HEIGHT, oFF.SacTableConstants.DF_R_N_HEIGHT);
			var columnsList = memberCellChartData.putNewList(oFF.SacTableConstants.CCD_L_COLUMNS);
			var columnsIterator = cellChartMemberInfo.getColumns().getIterator();
			var maxTextWidth = 0;
			while (columnsIterator.hasNext())
			{
				var columnIndex = columnsIterator.next().getInteger();
				columnsList.addInteger(columnIndex);
				maxTextWidth = oFF.XMath.max(oFF.XMath.div(columnSettings.getStructureAt(columnIndex).getIntegerByKey(oFF.SacTableConstants.CS_N_WIDTH), 2), maxTextWidth);
			}
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_WIDTH, maxTextWidth);
		}
	}
	tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_WIDTH, totalWidth);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_HEIGHT, totalHeight);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_COL, 0);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_ROW, 0);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_COL, this.m_tableObject.getPreColumnsAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_COL, this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getDataColumnsAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_ROW, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_LAST_ROW_INDEX, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_WIDTH, totalWidth + 20);
	return titleTokens.putNewList(oFF.SacTableConstants.TE_L_CHILDREN);
};
oFF.SacTableExportHelper.prototype.renderColumn = function(sacTableColumn, columnStructure) {};
oFF.SacTableExportHelper.prototype.renderRow = function(rowList, row, rowIndex, startCol, colEndIndex)
{
	var structure = rowList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.R_N_HEIGHT, row.getHeight());
	var localId = row.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XInteger.convertToHexString(rowIndex);
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	structure.putInteger(oFF.SacTableConstants.R_N_ROW, rowIndex);
	structure.putBoolean(oFF.SacTableConstants.R_B_FIXED, row.isFixed());
	structure.putBoolean(oFF.SacTableConstants.R_B_CHANGED_ON_THE_FLY_UNRESPONSIVE, row.isChangedOnTheFlyUnresponsive());
	var cellList = structure.putNewList(oFF.SacTableConstants.R_L_CELLS);
	var stripeColumns = row.getParentTable().isStripeDataColumns();
	var stripeRows = row.getParentTable().isStripeDataRows();
	var i;
	var cell;
	var cellStructure;
	var effectiveIndex = 0;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		cell = row.getCells().get(i);
		if (oFF.notNull(cell) && cell.getParentColumn() !== null && !cell.getParentColumn().isEffectivelyHidden())
		{
			cellStructure = this.renderCell(cellList, cell, rowIndex, effectiveIndex++);
			this.format(cell, cellStructure);
			this.applyStriping(stripeRows, stripeColumns, i, row, cellStructure, rowIndex);
		}
		else if (oFF.isNull(cell))
		{
			effectiveIndex++;
		}
	}
	for (i = startCol + this.m_tableObject.getPreColumnsAmount(); i < this.m_tableObject.getPreColumnsAmount() + colEndIndex; i++)
	{
		cell = row.getCells().get(i);
		if (oFF.notNull(cell) && cell.getParentColumn() !== null && !cell.getParentColumn().isEffectivelyHidden())
		{
			cellStructure = this.renderCell(cellList, cell, rowIndex, effectiveIndex++);
			this.format(cell, cellStructure);
			this.applyStriping(stripeRows, stripeColumns, i - startCol, row, cellStructure, rowIndex);
		}
		else if (oFF.isNull(cell))
		{
			effectiveIndex++;
		}
	}
	return structure;
};
oFF.SacTableExportHelper.prototype.applyStriping = function(stripeRows, stripeColumns, i, row, cellStructure, rowIndex)
{
	var stripeAny = stripeColumns || stripeRows;
	if (stripeAny && i >= row.getParentTable().getPreColumnsAmount() && row.getParentTable().getRowList().contains(row))
	{
		var style = this.getStyle(cellStructure);
		if (oFF.XStringUtils.isNullOrEmpty(style.getStringByKey(oFF.SacTableConstants.ST_S_FILL_COLOR)))
		{
			if (stripeRows && oFF.XMath.mod(rowIndex, 2) === 0)
			{
				style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_ROW_STRIPE_COLOR);
			}
			else if (stripeColumns && oFF.XMath.mod(i, 2) === 0)
			{
				style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_COLUMN_STRIPE_COLOR);
			}
		}
	}
};
oFF.SacTableExportHelper.prototype.getStyle = function(structure)
{
	if (!structure.containsKey(oFF.SacTableConstants.C_M_STYLE))
	{
		structure.putBoolean(oFF.SacTableConstants.C_B_STYLE_UPDATED_BY_USER, true);
		structure.putNewStructure(oFF.SacTableConstants.C_M_STYLE);
	}
	return structure.getStructureByKey(oFF.SacTableConstants.C_M_STYLE);
};
oFF.SacTableExportHelper.prototype.format = function(cellBase, structureToFormat)
{
	var styles = cellBase.getPrioritizedStylesList();
	if (cellBase.isEffectiveTotalsContext())
	{
		structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_INA_TOTALS_CONTEXT, true);
	}
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_IN_HIERARCHY, cellBase.isInHierarchy());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_ALLOW_DRAG_DROP, cellBase.isAllowDragDrop());
	structureToFormat.putInteger(oFF.SacTableConstants.C_N_LEVEL, cellBase.getHierarchyLevel());
	structureToFormat.putInteger(cellBase.getHierarchyPaddingType(), cellBase.getHierarchyPaddingValue() * (1 + cellBase.getHierarchyLevel()));
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_SHOW_DRILL_ICON, cellBase.isShowDrillIcon());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_EXPANDED, cellBase.isExpanded());
	var color = oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveFillColor(styles));
	if (oFF.notNull(color))
	{
		var style = this.getStyle(structureToFormat);
		style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, color);
	}
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineTop(styles), oFF.SacTableConstants.LP_TOP, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyleLineBottom(styles), oFF.SacTableConstants.LP_BOTTOM, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineLeft(styles), oFF.SacTableConstants.LP_LEFT, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineRight(styles), oFF.SacTableConstants.LP_RIGHT, structureToFormat);
	if (cellBase.isEffectiveFontItalic(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_ITALIC, true);
	}
	if (cellBase.isEffectiveFontBold(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_BOLD, true);
	}
	if (cellBase.isEffectiveFontUnderline(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_UNDERLINE, true);
	}
	if (cellBase.isEffectiveFontStrikeThrough(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_STRIKETHROUGH, true);
	}
	var effectiveFontSize = cellBase.getEffectiveFontSize(styles);
	if (effectiveFontSize > 0)
	{
		this.getFont(structureToFormat).putDouble(oFF.SacTableConstants.FS_N_SIZE, effectiveFontSize);
	}
	var effectiveFontFamily = cellBase.getEffectiveFontFamily(styles);
	if (oFF.notNull(effectiveFontFamily))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_FAMILY, effectiveFontFamily);
	}
	color = oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveFontColor(styles));
	if (oFF.notNull(color))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_COLOR, color);
	}
	var effectiveThresholdColor = oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveThresholdColor(styles));
	if (oFF.notNull(effectiveThresholdColor))
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_COLOR, effectiveThresholdColor);
	}
	var effectiveThresholdType = cellBase.getEffectiveThresholdType(styles);
	if (effectiveThresholdType === oFF.SacAlertSymbol.GOOD)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_GOOD);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.WARNING)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_WARNING);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.ALERT)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_ALERT);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.DIAMOND)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_DIAMOND);
	}
	var hAlignment = cellBase.getEffectiveHorizontalAlignment(styles);
	var vAlignment = cellBase.getEffectiveVerticalAlignment(styles);
	if (oFF.notNull(hAlignment) || oFF.notNull(vAlignment))
	{
		var alignmentStructure = this.getStyle(structureToFormat).putNewStructure(oFF.SacTableConstants.ST_M_ALIGNMENT);
		if (hAlignment === oFF.SacTableCellHorizontalAlignment.LEFT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_LEFT);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.CENTER)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_CENTER);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.RIGHT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_RIGHT);
		}
		if (vAlignment === oFF.SacTableCellVerticalAlignment.TOP)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_TOP);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.MIDDLE)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_MIDDLE);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.BOTTOM)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_BOTTOM);
		}
	}
	var backgroundPatternType = cellBase.getEffectiveBackgroundPatternType(styles);
	if (backgroundPatternType === oFF.SacLinePatternType.BACKGROUND_IMAGE)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putStringNotNullAndNotEmpty(oFF.SacTableConstants.C_S_FORMATTED, cellBase.getEffectiveBackgroundContent(styles));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_1)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_1));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_2)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_2));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_3)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_3));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_4)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_4));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_5)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_5));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_6)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_6));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_7)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_7));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_8)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_8));
	}
	return structureToFormat;
};
oFF.SacTableExportHelper.prototype.transferStyledLineToJson = function(effectiveLineStyle, lpKey, structureToFormat)
{
	if (!effectiveLineStyle.isEmpty())
	{
		var line = this.getLineInternal(lpKey, structureToFormat);
		line.putStringNotNullAndNotEmpty(oFF.SacTableConstants.SL_S_COLOR, oFF.RenderThemingHelper.remapColor(effectiveLineStyle.getColor()));
		if (effectiveLineStyle.getWidth() > -1)
		{
			line.putDouble(oFF.SacTableConstants.SL_N_SIZE, effectiveLineStyle.getWidth());
		}
		if (effectiveLineStyle.hasPadding())
		{
			var paddingStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
			this.applyPadding(paddingStructure, effectiveLineStyle.getLeftPadding(), oFF.SacTableConstants.SLP_N_LEFT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getRightPadding(), oFF.SacTableConstants.SLP_N_RIGHT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getTopPadding(), oFF.SacTableConstants.SLP_N_TOP);
			this.applyPadding(paddingStructure, effectiveLineStyle.getBottomPadding(), oFF.SacTableConstants.SLP_N_BOTTOM);
		}
		var lineStyle = effectiveLineStyle.getLineStyle();
		if (lineStyle === oFF.SacTableLineStyle.DASHED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DASHED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.DOTTED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DOTTED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.SOLID)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_SOLID);
		}
		else if (lineStyle === oFF.SacTableLineStyle.NONE)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_NONE);
		}
		var linePatternType = effectiveLineStyle.getPatternType();
		if (oFF.notNull(linePatternType))
		{
			var patternStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PATTERN);
			if (linePatternType === oFF.SacLinePatternType.WHITE_FILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_WHITE_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.NOFILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_NON_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.SOLID)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_SOLID);
			}
			else if (linePatternType === oFF.SacLinePatternType.BACKGROUND_IMAGE)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BACKGROUND, effectiveLineStyle.getPatternBackground());
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_1)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_1, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_2)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_2, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_3)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_3, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_4)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_4, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_5)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_5, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_6)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_6, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_7)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_7, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_8)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_8, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			if (effectiveLineStyle.getPatternWidth() > 0)
			{
				patternStructure.putDouble(oFF.SacTableConstants.LP_N_WIDTH, effectiveLineStyle.getPatternWidth());
			}
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_COLOR, oFF.RenderThemingHelper.remapColor(effectiveLineStyle.getPatternColor()));
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BORDER_COLOR, oFF.RenderThemingHelper.remapColor(effectiveLineStyle.getPatternBorderColor()));
		}
	}
};
oFF.SacTableExportHelper.prototype.applyPadding = function(paddingStructure, padding, paddingKey)
{
	if (padding > -1)
	{
		paddingStructure.putDouble(paddingKey, padding);
	}
};
oFF.SacTableExportHelper.prototype.getLineInternal = function(position, structure)
{
	var style = this.getStyle(structure);
	if (!style.containsKey(oFF.SacTableConstants.ST_L_LINES))
	{
		style.putNewList(oFF.SacTableConstants.ST_L_LINES);
	}
	var lines = style.getListByKey(oFF.SacTableConstants.ST_L_LINES);
	var line = null;
	for (var i = 0; i < lines.size(); i++)
	{
		if (lines.getStructureAt(i).getIntegerByKey(oFF.SacTableConstants.SL_N_POSITION) === position)
		{
			line = lines.getStructureAt(i);
		}
	}
	if (oFF.isNull(line))
	{
		line = lines.addNewStructure();
		line.putInteger(oFF.SacTableConstants.SL_N_SIZE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_STYLE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_POSITION, position);
		var padding = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
		if (position === oFF.SacTableConstants.LP_BOTTOM || position === oFF.SacTableConstants.LP_TOP)
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_RIGHT, oFF.SacTableConstants.LP_RIGHT);
			padding.putInteger(oFF.SacTableConstants.SLP_N_LEFT, oFF.SacTableConstants.LP_RIGHT);
		}
		else
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_BOTTOM, oFF.SacTableConstants.LP_BOTTOM);
			padding.putInteger(oFF.SacTableConstants.SLP_N_TOP, oFF.SacTableConstants.LP_TOP);
		}
	}
	return line;
};
oFF.SacTableExportHelper.prototype.getFont = function(structure)
{
	var style = this.getStyle(structure);
	var font = style.getStructureByKey(oFF.SacTableConstants.ST_M_FONT);
	if (oFF.isNull(font))
	{
		font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	}
	return font;
};
oFF.SacTableExportHelper.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var structure = cellList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.C_N_ROW, rowIndex);
	structure.putInteger(oFF.SacTableConstants.C_N_COLUMN, colIndex);
	var mergedColumns = cellBase.getMergedColumns();
	var mergedRows = cellBase.getMergedRows();
	if (mergedColumns !== 0 || mergedRows !== 0)
	{
		var mergerStructure = structure.putNewStructure(oFF.SacTableConstants.C_M_MERGED);
		if (mergedColumns >= 0 && mergedRows >= 0)
		{
			if (cellBase.getMergedColumns() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_COLUMNS, cellBase.getMergedColumns());
			}
			if (cellBase.getMergedRows() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ROWS, cellBase.getMergedRows());
			}
		}
		else
		{
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_COLUMN, colIndex + cellBase.getMergedColumns());
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_ROW, rowIndex + cellBase.getMergedRows());
		}
	}
	if (cellBase.getCommentDocumentId() !== null)
	{
		structure.putInteger(oFF.SacTableConstants.C_N_COMMENT_TYPE, oFF.SacTableConstants.CT_CHILD);
		structure.putString(oFF.SacTableConstants.CS_COMMENT_DOCUMENT_ID, cellBase.getCommentDocumentId());
	}
	var localId = cellBase.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XStringUtils.concatenate2(oFF.XInteger.convertToHexString(rowIndex), oFF.XInteger.convertToHexString(colIndex));
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	if (!cellBase.isRepeatedHeader() || cellBase.isEffectiveRepetitiveHeaderCells())
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, cellBase.getFormatted());
		structure.putString(oFF.SacTableConstants.C_S_FORMAT_STRING, cellBase.getFormattingPattern());
	}
	else
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, "");
		structure.putString(oFF.SacTableConstants.C_S_FORMAT_STRING, "");
	}
	structure.putBoolean(oFF.SacTableConstants.C_B_REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	if (cellBase.getPlain() !== null)
	{
		var valueType = cellBase.getPlain().getValueType();
		if (valueType === oFF.XValueType.BOOLEAN)
		{
			structure.putBoolean(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getBoolean(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.DOUBLE)
		{
			structure.putDouble(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.LONG)
		{
			structure.putLong(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getLong(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.INTEGER)
		{
			structure.putInteger(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getInteger(cellBase.getPlain(), false, true));
		}
		else
		{
			structure.putString(oFF.SacTableConstants.C_SN_PLAIN, cellBase.getPlain().getStringRepresentation());
		}
	}
	var effectiveCellType = cellBase.getEffectiveCellType();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, effectiveCellType);
	structure.putBoolean(oFF.SacTableConstants.C_B_DRAGGABLE, effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_HEADER);
	if (cellBase.isEffectiveShowCellChart())
	{
		this.preFormatCellChart(cellBase, structure, rowIndex, colIndex);
	}
	return structure;
};
oFF.SacTableExportHelper.prototype.preFormatCellChart = function(cellBase, structure, rowIndex, colIndex)
{
	var styles = cellBase.getPrioritizedStylesList();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_CHART);
	var cellChart = structure.putNewStructure(oFF.SacTableConstants.C_M_CELL_CHART);
	cellChart.putString(oFF.SacTableConstants.CC_S_MEMBER_ID, cellBase.getEffectiveCellChartMemberName(styles));
	var cellChartType = cellBase.getEffectiveCellChartType();
	if (cellChartType === oFF.SacCellChartType.BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.VARIANCE_BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.PIN)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_PIN);
	}
	cellChart.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveCellChartBarColor(styles)));
	cellChart.putString(oFF.SacTableConstants.CC_SU_LINE_COLOR, oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveCellChartLineColor(styles)));
	cellChart.putBoolean(oFF.SacTableConstants.CC_B_SHOW_VALUE, !cellBase.isEffectiveHideNumberForCellChart());
	cellChart.putString(oFF.SacTableConstants.CC_S_CELL_CHART_ORIENTATION, cellBase.getEffectiveCellChartOrientation() === oFF.SacCellChartOrientation.VERTICAL ? oFF.SacTableConstants.CCO_VERTICAL : oFF.SacTableConstants.CCO_HORIZONTAL);
	var cellChartInfo = this.m_tableObject.getCellChartInfo();
	if (!cellChartInfo.containsKey(cellBase.getEffectiveCellChartMemberName(styles)))
	{
		cellChartInfo.put(cellBase.getEffectiveCellChartMemberName(styles), oFF.CellChartInfo.create(cellBase.getEffectiveCellChartOrientation(), colIndex, rowIndex, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true)));
	}
	else
	{
		var cellChartMeasureInfo = cellChartInfo.getByKey(cellBase.getEffectiveCellChartMemberName(styles));
		cellChartMeasureInfo.addColumn(colIndex);
		cellChartMeasureInfo.addRow(rowIndex);
		cellChartMeasureInfo.registerValue(oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
	}
	return cellChart;
};

oFF.GenericHiChartRenderer = function() {};
oFF.GenericHiChartRenderer.prototype = new oFF.XObject();
oFF.GenericHiChartRenderer.prototype._ff_c = "GenericHiChartRenderer";

oFF.GenericHiChartRenderer.create = function(chartVisualization)
{
	var instance = new oFF.GenericHiChartRenderer();
	instance.m_chartVisualization = chartVisualization;
	return instance;
};
oFF.GenericHiChartRenderer.prototype.m_chartVisualization = null;
oFF.GenericHiChartRenderer.prototype.m_chartJson = null;
oFF.GenericHiChartRenderer.prototype.setChartConfigration = function(chartConfig) {};
oFF.GenericHiChartRenderer.prototype.render = function()
{
	this.m_chartJson = oFF.PrFactory.createStructure();
	var chartTypeInfo = this.m_chartJson.putNewStructure(oFF.HighChartConstants.K_CHART);
	if (this.m_chartVisualization.isInverted() && !oFF.XString.isEqual(this.m_chartVisualization.getChartType(), oFF.HighChartConstants.V_CHART_TYPE_BAR))
	{
		chartTypeInfo.putBoolean(oFF.HighChartConstants.K_INVERTED, true);
	}
	chartTypeInfo.putBoolean(oFF.HighChartConstants.K_POLAR, this.m_chartVisualization.isPolar());
	chartTypeInfo.putString(oFF.HighChartConstants.K_TYPE, this.m_chartVisualization.getChartType());
	chartTypeInfo.putBoolean(oFF.HighChartConstants.K_ANIMATION, false);
	var chartlang = this.m_chartJson.putNewStructure(oFF.HighChartConstants.K_LANG);
	chartlang.putString(oFF.HighChartConstants.K_DECIMAL_POINT, ",");
	chartlang.putString(oFF.HighChartConstants.K_THOUSANDS_SEP, ".");
	var backgroundColor = this.m_chartVisualization.getBackgroundColor();
	if (oFF.XStringUtils.isNullOrEmpty(backgroundColor))
	{
		backgroundColor = "rgba(0,0,0,0)";
	}
	chartTypeInfo.putString(oFF.HighChartConstants.K_BACKGROUND_COLOR, backgroundColor);
	var chartTypeInfostyle = chartTypeInfo.putNewStructure(oFF.HighChartConstants.K_STYLE);
	chartTypeInfostyle.putString(oFF.HighChartConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	var boost = this.m_chartJson.putNewStructure(oFF.HighChartConstants.K_BOOST);
	var credits = this.m_chartJson.putNewStructure(oFF.HighChartConstants.K_CREDITS);
	credits.putBoolean(oFF.HighChartConstants.K_ENABLED, false);
	boost.putBoolean(oFF.HighChartConstants.K_USER_GPU_TRANSLATIONS, true);
	this.buildTitle();
	this.buildXAxes();
	this.buildYAxes();
	this.buildZAxes();
	this.buildCoordinateSystems();
	return this.m_chartJson;
};
oFF.GenericHiChartRenderer.prototype.buildCoordinateSystems = function()
{
	var coordinateSystems = this.m_chartVisualization.getCoordinateSystems();
	var seriesList = this.m_chartJson.putNewList(oFF.HighChartConstants.K_SERIES);
	for (var i = 0; i < coordinateSystems.size(); i++)
	{
		var coordinateSystem = coordinateSystems.get(i);
		var seriesGroups = coordinateSystem.getSeriesGroups();
		for (var j = 0; j < seriesGroups.size(); j++)
		{
			var seriesGroup = seriesGroups.get(j);
			var series = seriesGroup.getSeries();
			for (var k = 0; k < series.size(); k++)
			{
				this.buildSeries(seriesList.addNewStructure(), coordinateSystem, seriesGroup, series.get(k));
			}
		}
	}
};
oFF.GenericHiChartRenderer.prototype.buildSeries = function(seriesStructure, coordinateSystem, seriesGroup, series)
{
	if (coordinateSystem.getXAxisReference() !== null)
	{
		seriesStructure.putString(oFF.HighChartConstants.K_X_AXIS, coordinateSystem.getXAxisReference().getName());
	}
	if (coordinateSystem.getYAxisReference() !== null)
	{
		seriesStructure.putString(oFF.HighChartConstants.K_Y_AXIS, coordinateSystem.getYAxisReference().getName());
	}
	seriesStructure.putString(oFF.HighChartConstants.K_NAME, series.getText());
	seriesStructure.putString(oFF.HighChartConstants.K_STACK, seriesGroup.getName());
	seriesStructure.putString(oFF.HighChartConstants.K_TYPE, seriesGroup.getChartType());
	seriesStructure.putString(oFF.HighChartConstants.K_STACKING, seriesGroup.getStackingType());
	var chartDataPoints = series.getChartDataPoints();
	var data = seriesStructure.putNewList(oFF.HighChartConstants.K_DATA);
	for (var i = 0; i < chartDataPoints.size(); i++)
	{
		this.buildDataPoint(data.addNewStructure(), chartDataPoints.get(i));
	}
};
oFF.GenericHiChartRenderer.prototype.buildDataPoint = function(pointStructure, chartDataPoint)
{
	pointStructure.putString(oFF.HighChartConstants.K_NAME, chartDataPoint.getText());
	var coordinates = chartDataPoint.getCoordinates();
	for (var i = 0; i < coordinates.size(); i++)
	{
		var coordinate = coordinates.get(i);
		var value = coordinate.getValue();
		if (value.getValueType().isNumber())
		{
			pointStructure.putDouble(coordinate.getName(), oFF.XValueUtil.getDouble(value, false, true));
		}
		else
		{
			pointStructure.putString(coordinate.getName(), oFF.XValueUtil.getString(value));
		}
	}
};
oFF.GenericHiChartRenderer.prototype.buildXAxes = function()
{
	this.buildAxes(this.m_chartVisualization.getXAxes(), oFF.HighChartConstants.K_X_AXIS);
};
oFF.GenericHiChartRenderer.prototype.buildYAxes = function()
{
	this.buildAxes(this.m_chartVisualization.getYAxes(), oFF.HighChartConstants.K_Y_AXIS);
};
oFF.GenericHiChartRenderer.prototype.buildZAxes = function()
{
	this.buildAxes(this.m_chartVisualization.getZAxes(), oFF.HighChartConstants.K_Z_AXIS);
};
oFF.GenericHiChartRenderer.prototype.buildAxes = function(axes, kAxis)
{
	if (oFF.XCollectionUtils.hasElements(axes))
	{
		var maxPosition = oFF.XStream.of(axes).reduce(oFF.XIntegerValue.create(0),  function(a, b){
			return oFF.XIntegerValue.create(oFF.XMath.max(a.getInteger(), oFF.XMath.max(b.getFrom(), b.getTo())));
		}.bind(this)).getInteger();
		var axesSize = axes.size();
		var axisObject;
		if (axesSize === 1)
		{
			axisObject = this.m_chartJson.putNewStructure(kAxis);
			this.buildAxis(axes.get(0), axisObject, maxPosition);
		}
		else
		{
			var axesList = this.m_chartJson.putNewList(kAxis);
			for (var i = 0; i < axesSize; i++)
			{
				axisObject = axesList.addNewStructure();
				this.buildAxis(axes.get(i), axisObject, maxPosition);
			}
		}
	}
};
oFF.GenericHiChartRenderer.prototype.buildAxis = function(chartAxis, axisObject, maxPosition)
{
	var maxValue = oFF.XDoubleValue.create(maxPosition).getDouble();
	var offset = oFF.XDoubleValue.create(chartAxis.getFrom()).getDouble();
	var cutoff = oFF.XDoubleValue.create(chartAxis.getTo()).getDouble();
	var widthPercent = oFF.XStringUtils.concatenate2(oFF.XDouble.convertToString(100.0 * (cutoff - offset) / maxValue - 2), "%");
	if (chartAxis.getAxisDomain().getAxisDomainType().isTypeOf(oFF.ChartAxisDomainType.CATEGORIAL))
	{
		axisObject.putNewList(oFF.HighChartConstants.K_CATEGORIES).addAllStrings(oFF.XStream.of(chartAxis.getAxisDomain().getCategories()).collect(oFF.XStreamCollector.toListOfString( function(cat){
			return cat.getText();
		}.bind(this))));
	}
	else
	{
		var scalarDomain = chartAxis.getAxisDomain();
		axisObject.putDouble(oFF.HighChartConstants.K_MIN, scalarDomain.getMin());
		axisObject.putDouble(oFF.HighChartConstants.K_MAX, scalarDomain.getMax());
	}
	axisObject.putNewStructure(oFF.HighChartConstants.K_TITLE).putString(oFF.HighChartConstants.K_TEXT, chartAxis.getText());
	axisObject.putBoolean(oFF.HighChartConstants.K_OPPOSITE, chartAxis.isScaleOpposite());
	axisObject.putBoolean(oFF.HighChartConstants.K_REVERSED, chartAxis.isScaleReversed());
	if (chartAxis.getPosition().isTypeOf(oFF.ChartAxisPosition.X))
	{
		axisObject.putString(oFF.HighChartConstants.V_POSITION_LEFT, oFF.XStringUtils.concatenate2(oFF.XDouble.convertToString(100.0 * offset / maxValue + 2), "%"));
		axisObject.putString(oFF.HighChartConstants.K_WIDTH, widthPercent);
	}
	else if (chartAxis.getPosition().isTypeOf(oFF.ChartAxisPosition.Y))
	{
		axisObject.putString(oFF.HighChartConstants.V_POSITION_TOP, oFF.XStringUtils.concatenate2(oFF.XDouble.convertToString(100.0 * (maxValue - cutoff) / maxValue + 2), "%"));
		axisObject.putString(oFF.HighChartConstants.K_HEIGHT, widthPercent);
	}
	axisObject.putString(oFF.HighChartConstants.K_ID, chartAxis.getName());
	var i;
	var plotBands = chartAxis.getPlotBands();
	if (oFF.XCollectionUtils.hasElements(plotBands))
	{
		var plotBandsList = axisObject.putNewList(oFF.HighChartConstants.K_PLOT_BANDS);
		for (i = 0; i < plotBands.size(); i++)
		{
			this.buildPlotBand(plotBandsList.addNewStructure(), plotBands.get(i));
		}
	}
	var plotLines = chartAxis.getPlotLines();
	if (oFF.XCollectionUtils.hasElements(plotLines))
	{
		var plotLinesList = axisObject.putNewList(oFF.HighChartConstants.K_PLOT_LINES);
		for (i = 0; i < plotLines.size(); i++)
		{
			this.buildPlotLine(plotLinesList.addNewStructure(), plotLines.get(i));
		}
	}
};
oFF.GenericHiChartRenderer.prototype.buildPlotLine = function(structure, plotLine)
{
	structure.putDouble(oFF.HighChartConstants.K_VALUE, plotLine.getValue());
	structure.putDouble(oFF.HighChartConstants.K_WIDTH, plotLine.getWidth());
	structure.putStringNotNullAndNotEmpty(oFF.HighChartConstants.K_COLOR, plotLine.getColor());
	structure.putStringNotNullAndNotEmpty(oFF.HighChartConstants.K_DASH_STYLE, plotLine.getDashStyle());
	var label = structure.putNewStructure(oFF.HighChartConstants.K_LABEL);
	label.putStringNotNullAndNotEmpty(oFF.HighChartConstants.K_TEXT, plotLine.getText());
};
oFF.GenericHiChartRenderer.prototype.buildPlotBand = function(structure, plotBand)
{
	structure.putDouble(oFF.HighChartConstants.K_FROM, plotBand.getFrom());
	structure.putDouble(oFF.HighChartConstants.K_TO, plotBand.getTo());
	structure.putDouble(oFF.HighChartConstants.K_BORDER_WIDTH, plotBand.getBorderWidth());
	structure.putStringNotNullAndNotEmpty(oFF.HighChartConstants.K_COLOR, plotBand.getColor());
	structure.putStringNotNullAndNotEmpty(oFF.HighChartConstants.K_BORDER_COLOR, plotBand.getBorderColor());
	var label = structure.putNewStructure(oFF.HighChartConstants.K_LABEL);
	label.putStringNotNullAndNotEmpty(oFF.HighChartConstants.K_TEXT, plotBand.getText());
};
oFF.GenericHiChartRenderer.prototype.buildTitle = function()
{
	var chartTitle = this.m_chartVisualization.getTitle();
	var chartSubTitle = this.m_chartVisualization.getSubtitle();
	if (oFF.notNull(chartTitle))
	{
		var title = this.m_chartJson.putNewStructure(oFF.HighChartConstants.K_TITLE);
		title.putString(oFF.HighChartConstants.K_TEXT, chartTitle);
		title.putString(oFF.HighChartConstants.K_ALIGN, oFF.HighChartConstants.V_LEFT);
	}
	if (oFF.notNull(chartSubTitle))
	{
		var subtitle = this.m_chartJson.putNewStructure(oFF.HighChartConstants.K_SUBTITLE);
		subtitle.putString(oFF.HighChartConstants.K_TEXT, chartSubTitle);
		subtitle.putString(oFF.HighChartConstants.K_ALIGN, oFF.HighChartConstants.V_LEFT);
	}
};
oFF.GenericHiChartRenderer.prototype.getChartJson = function()
{
	return this.m_chartJson;
};

oFF.HighChartConstants = {

	K_MEMBER:"member",
	K_FORMULA_ALIASES:"formulaAliases",
	K_GLOBAL_OBJECT_CALCULATIONS:"Calculations",
	K_GLOBAL_OBJECT_CALCULATION_VARIABLES:"CalculationVariables",
	K_HIDDEN:"hidden",
	K_SHOW_IN_LEGEND:"showInLegend",
	K_BORDER_COLOR:"borderColor",
	K_TRANSPARENT:"transparent",
	K_SPACING_BOTTOM:"spacingBottom",
	K_ITEM_STYLE:"itemStyle",
	K_VERTICAL_ALIGN:"verticalAlign",
	K_SPACING_TOP:"spacingTop",
	K_IS_HIDDEN_WHEN_OVERLAP:"isHideWhenOverlap",
	K_ALIGN:"align",
	V_LEFT:"left",
	V_RIGHT:"right",
	V_VERTICAL:"vertical",
	K_STORY_WIDE_SETTINGS:"storyWideSettings",
	K_CUSTOM_COLOR_PALETTES:"custom.color.palettes",
	K_GRADIENT:"gradient",
	K_COLORS:"colors",
	K_COLOR_SCHEME:"colorScheme",
	K_COLOR_SYNC:"colorSync",
	K_IS_EXCLUDE_COLOR_SYNC:"isExcludeColorSync",
	K_LEVELS:"levels",
	K_MIN_COLOR:"minColor",
	K_MAX_COLOR:"maxColor",
	K_REVERSED:"reversed",
	K_MAX:"max",
	K_MIN:"min",
	K_VARIANCE:"variance",
	K_TOOLTIP:"tooltip",
	K_POINT_FORMAT:"pointFormat",
	K_HEADER_FORMAT:"headerFormat",
	K_INNER_SIZE:"innerSize",
	K_DISTANCE:"distance",
	K_WEIGHT:"weight",
	K_WEIGHT_FORMATTED:"weightFormatted",
	V_CENTER:"center",
	V_HORIZONTAL:"horizontal",
	K_SQUARE_SYMBOL:"squareSymbol",
	K_SYMBOL_RADIUS:"symbolRadius",
	K_ROTATION:"rotation",
	K_FROM:"from",
	K_TO:"to",
	K_PLACEMENT_STRATEGY:"placementStrategy",
	K_BOLD:"bold",
	K_BORDER_WIDTH:"borderWidth",
	K_MAX_ELEMENT:"maxElement",
	K_FULL_SCREEN_ENABLED:"fullscreenEnabled",
	K_NO_DATA:"noData",
	K_X:"x",
	K_VALUE_FORMATTED:"valueFormatted",
	K_X_CATEGORY:"xCategory",
	K_Y_CATEGORY:"yCategory",
	K_T_HEADER:"tHeader",
	K_T_FORMATTED:"tFormatted",
	K_LANG:"lang",
	K_CATEGORY_AXIS2:"categoryAxis2",
	K_TOOLTIP_VALUE_AXIS:"tooltipValueAxis",
	K_FILL_COLOR:"fillColor",
	K_CATEGORY_NAME:"categoryName",
	K_BUBBLE_WIDTH:"bubbleWidth",
	K_CATEGORY:"category",
	K_DATE_TIME:"datetime",
	K_ERRORBAR:"errorbar",
	K_OPPOSITE:"opposite",
	K_WIDTH:"width",
	K_HEIGHT:"height",
	K_SCROLL_BAR:"scrollbar",
	K_SHOW_FULL:"showFull",
	K_ERRORBAR_MIN:".errorbar.min",
	K_ERRORBAR_MAX:".errorbar.max",
	K_AXIS:"axis",
	K_ERROR_RANGE:"errorRange",
	V_NORMAL:"normal",
	K_MARKER:"marker",
	K_SYMBOL:"symbol",
	V_MIDDLE:"middle",
	K_SOLID_GAUGE:"solidgauge",
	K_STACK_LABELS:"stackLabels",
	K_SUBTITLE:"subtitle",
	K_AXIS_LABEL:"axisLabel",
	K_GRID_LINE_WIDTH:"gridLineWidth",
	K_COLOR_BY_POINT:"colorByPoint",
	K_POINT_PADDING:"pointPadding",
	K_TICK_AMOUNT:"tickAmount",
	K_DASH_STYLE:"dashStyle",
	K_SHORT_DOT:"ShortDot",
	K_PLOT_BANDS:"plotBands",
	K_TEXT_OUTLINE:"textOutline",
	K_FONT_STYLE:"fontStyle",
	K_AGGREGATION_TYPE:"aggregationType",
	K_MEASURE:"measure",
	V_BLACK:"black",
	K_COLOR_AXIS:"colorAxis",
	K_STOPS:"stops",
	K_GRADIENT_KEYS:"gradientKeys",
	K_THRESHOLDS:"thresholds",
	K_LOW:"low",
	K_PALETTE_COLORS:"paletteColors",
	K_MAX_HEIGHT:"maxHeight",
	V_CIRCLE:"circle",
	K_SHAPE_OPTIONS:"shapeOptions",
	K_STROKE:"stroke",
	K_SIZE_BY_ABSOLUTE_VALUE:"sizeByAbsoluteValue",
	K_X_FORMATTED:"xFormatted",
	K_Z:"z",
	K_Z_FORMATTED:"zFormatted",
	K_SERIES_X:"SeriesX",
	K_SERIES_Y:"SeriesY",
	K_SERIES_Z:"SeriesZ",
	K_TARGET_VALUES:"targetValues",
	K_TARGET_FORMATTED:"targetFormatted",
	K_THOUSANDS_SEP:"thousandsSep",
	K_PANE:"pane",
	K_BACKGROUND_COLOR:"backgroundColor",
	K_INNER_RADIUS:"innerRadius",
	K_OUTER_RADIUS:"outerRadius",
	K_SHAPE:"shape",
	K_END_ANGLE:"endAngle",
	K_START_ANGLE:"startAngle",
	K_ANIMATION:"animation",
	K_X_NAME:"xName",
	K_Y_NAME:"yName",
	K_RULES:"rules",
	K_CONDITION:"condition",
	K_CHART_OPTIONS:"chartOptions",
	K_MAX_WIDTH:"maxWidth",
	K_MIN_HEIGHT:"minHeight",
	K_CONNECTOR_WIDTH:"connectorWidth",
	K_INSIDE:"inside",
	K_FLOATING:"floating",
	K_MIN_SIZE:"minSize",
	K_EXPLICIT_COLOR_ASSIGNMENTS:"explicitColorAssignments",
	K_CROP_THRESHOLD:"cropThreshold",
	K_GROUPING:"grouping",
	K_Z_NAME:"zName",
	V_BASE_PLOTLINE_ID:"BASE_PLOTLINE_ID",
	K_Z_INDEX:"zIndex",
	K_COLOR_VALUE:"colorValue",
	K_COLOR_VALUE_FORMATTED:"colorValueFormatted",
	K_COLOR_NAME:"colorName",
	K_VALUE_NAME:"valueName",
	V_ARC:"arc",
	K_TIME_AXIS:"timeAxis",
	K_IS_TIME_SERIES:"istimeSeries",
	K_Y_FORM:"yForm",
	K_PERCENT:"percent",
	K_CATEGORY_FORM:"categoryForm",
	K_PALETTE_DESC:"paletteDesc",
	K_PALETTE:"palette",
	K_SCATTER_PLOT:"scatterplot",
	K_RADAR:"radar",
	K_METRIC:"metric",
	K_COMB_BCL:"combbcl",
	K_USER_PREFERENCES:"userPreferences",
	K_ORIENTATION:"orientation",
	K_FULL_STACKING:"fullStacking",
	K_MARIMEKKO:"marimekko",
	K_BAR_COLUMN:"barcolumn",
	K_STACKED_BAR:"stackedbar",
	K_STACKED_COLUMN:"stackedcolumn",
	K_COMB_STACKED_BCL:"combstackedbcl",
	K_TIME_SERIES:"timeseries",
	K_CLUSTER_BUBBLE:"clusterbubble",
	K_DECIMAL_POINT:"decimalPoint",
	K_BBACKGROUND_COLOR:"BackgroundColor",
	K_BOOST:"boost",
	K_CREDITS:"credits",
	K_USER_GPU_TRANSLATIONS:"useGPUTranslations",
	K_GLOBAL_OBJECT_STORY_FILTERS:"StoryFilters",
	K_GLOBAL_OBJECT_PAGE_FILTER:"pageFilter",
	K_GLOBAL_OBJECT_PAGE_FILTERS:"PageFilters",
	K_PAGE_ID:"pageId",
	K_REFERENCE_MEASURE_ID:"referenceMeasureId",
	K_MEASURE_ID:"measureId",
	K_SELECTED_DIMENSION_ID:"selectedDimensionId",
	K_START_DATE:"startDate",
	K_END_DATE:"endDate",
	V_ABSOLUTE:"absolute",
	V_PERCENT:"percent",
	V_PERCENTAGE:"percentage",
	K_START_DATE_CURRENT_IF_NULL:"startDateCurrentIfNULL",
	K_END_DATE_CURRENT_IF_NULL:"endDateCurrentIfNULL",
	K_RESULT_GRANULARITY:"resultGranularity",
	V_DAY:"DAY",
	V_MONTH:"MONTH",
	V_YEAR:"YEAR",
	K_CALC_DAYS_BETWEEN:"CALCDAYSBETWEEN",
	K_CALC_MONTHS_BETWEEN:"CALCMONTHSBETWEEN",
	K_CALC_YEARS_BETWEEN:"CALCYEARSBETWEEN",
	K_CALCULATION:"calculation",
	K_RESTRICTED_MEASURE:"restrictedMeasure",
	K_CONSTANT:"constant",
	V_CURRENT_DATE:"CURRENT_DATE",
	K_CALCULATION_VARIABLE:"calculation.variable",
	K_NNAME:"Name",
	K_SELECTION_INFOS:"selectionInfos",
	K_ORIGINAL_VALUES:"originalValues",
	K_ARGUMENT_KEY_INFO:"argumentKeyInfo",
	K_START:"start",
	K_END:"end",
	K_S_KEY:"sKey",
	K_SELECTIONS:"selections",
	K_FORMATTING_INFO:"formatingInfo",
	K_SIGNED_DATA:"SignedData",
	K_CALCULATION_VARIABLE_ENTITY_ID:"calculationVariableEntityId",
	K_FORMULA:"formula",
	K_FORMULA_AST:"ast",
	K_FORMULA_JSON:"formulaJson",
	K_DESCRIPTION:"description",
	K_OPTIONS:"options",
	K_MINIMUM_FRACTION_DIGITS:"minimumFractionDigits",
	K_MAXIMUM_FRACTION_DIGITS:"maximumFractionDigits",
	K_SCALE:"scale",
	K_MULTIPLIER:"multiplier",
	K_UNIT:"unit",
	K_EXCEPTION_AGGREGATION:"exceptionAggregation",
	K_EXCEPTION_AGGREGATION_DIMENSIONS:"exceptionAggregationDimensions",
	K_DP_NAME:"dpName",
	K_USER_DEFINED_NUMERIC_SCALES:"userDefinedNumberScales",
	K_MEASURE_SELECTIONS:"measureSelections",
	V_ALL:"all",
	V_THOUSAND:"Thousand",
	V_MILLION:"Million",
	V_BILLION:"Billion",
	K_CUSTOM_FORMATTING:"customFormatting",
	K_FEED_MEMBERS:"feedMembers",
	K_PLACEHOLDER_2_ID:"placeholder2Id",
	K_GLOBAL_OBJECTS:"GlobalObjects",
	K_GLOBAL_OBJECT_FIELD_SELECTIONS:"FieldSelections",
	K_MEMBER_DEFINITIONS:"memberDefinitions",
	K_ERRORBAR_INFIX:".errorbar.",
	K_WIDGET_ID:"widgetId",
	K_MEMBERS:"members",
	K_VIZDEF_FILTERS:"VizdefFilters",
	K_MAIN_VALUE:"mainValue",
	K_TARGET_VALUE:"targetValue",
	K_THRESHOLD_REFERENCE:"thresholdReference",
	V_OK:"OK",
	V_WARNING:"Warning",
	V_CRITICAL:"Critical",
	V_ERROR:"Error",
	V_BAD:"Bad",
	K_HIGH:"high",
	K_LOW_INCLUSIVE:"lowInclusive",
	K_HIGH_INCLUSIVE:"highInclusive",
	K_KEY:"key",
	K_NODEDEPTH:"nodedepth",
	K_ENTITIES:"entities",
	K_RANK_BY:"rankBy",
	K_SELECTED_MEASURE:"selectedMeasure",
	K_NUMBER_FORMATTING:"numberFormatting",
	K_PATTERN_FORMATTING:"patternFormatting",
	K_COLOR_FORMATTING:"colorFormatting",
	K_DRILL_LEVEL:"drillLevel",
	K_DRILL_MODE:"drillMode",
	K_INCLUDE_ONLY_CHILDREN:"includeOnlyChildren",
	K_DP_NAMES:"dpNames",
	K_MEASURE_SYNC:"measureSync",
	K_PATH:"path",
	K_MIN_ELEMENT:"minElement",
	K_USER_DEFINED_DECIMAL_FORMAT:"userDefinedDecimalFormat",
	K_DECIMAL_PLACES:"decimalPlaces",
	K_USER_DEFINED_SHOW_SIGN_AS:"userDefinedShowSignAs",
	K_SHOW_SIGN_AS:"showSignAs",
	K_PARENT:"parent",
	V_TREEMAP_LAYOUT_SQUARIFIED:"squarified",
	V_TREEMAP_LAYOUT_STRIP:"strip",
	K_LAYOUT_ALGORITHM:"layoutAlgorithm",
	K_MAX_PADDING:"maxPadding",
	K_MIN_PADDING:"minPadding",
	K_ACCOUNT_ENTITY_ID:"accountEntityId",
	K_ACCOUNT_ID:"accountId",
	K_AXIS_LINE:"axisLine",
	K_AXIS_TICK:"axisTick",
	K_ARGUMENTS:"arguments",
	K_ANSWERS:"answers",
	K_AREA:"area",
	K_BUBBLE_STYLE:"BubbleStyle",
	K_BUBBLE_STYLING:"bubbleStyling",
	V_CHART_TYPE_BELLCURVE:"bellcurve",
	K_BINDINGS:"bindings",
	V_CHART_TYPE_BAR:"bar",
	V_CHART_TYPE_BUBBLE:"bubble",
	K_BACKGROUND:"background",
	V_CHART_TYPE_BOXPLOT:"boxplot",
	K_CALC_DEF:"def",
	K_CALCULATION_ID:"calculationId",
	K_CHART:"chart",
	V_CHART_TYPE_COLUMN:"column",
	K_COLOR:"color",
	K_CATEGORY_AXIS:"categoryAxis",
	K_COLLISION_DETECTION:"collisionDetection",
	K_CATEGORIES:"categories",
	K_CALCULATIONS:"calculations",
	K_CUSTOM_TITLE:"customTitle",
	K_COMPARISON_MEASURE_ID:"comparisonMeasureId",
	K_DATA:"data",
	K_DIMENSION:"dimension",
	K_DATA_LABEL:"dataLabel",
	K_DIRECTION:"direction",
	V_DIRECTION_ASC:"ascending",
	V_DIRECTION_DESC:"descending",
	K_DRILL:"drill",
	K_DYNAMIC_VALUE:"dynamicValue",
	K_ENTITY_ID:"entityId",
	K_ATTRIBUTE_ID:"attributeId",
	K_EXCLUDE:"exclude",
	K_ENABLED:"enabled",
	K_ENTITY_FORMAT_INFO:"entityFormatInfos",
	K_FORMAT_INFO:"formatInfo",
	K_FEED:"feed",
	V_FEED_DATA_CONTEXT:"dataContext",
	V_FEED_DATA_CONTEXT2:"dataContext2",
	V_FEED_VALUE_AXIS:"valueAxis",
	V_FEED_VALUE_AXIS2:"valueAxis2",
	V_FEED_CATEGORY_AXIS:"categoryAxis",
	V_FEED_CATEGORY_AXIS2:"categoryAxis2",
	V_FEED_COLOR:"color",
	V_FEED_PATTERN2:"pattern2",
	V_FEED_TRELLIS:"trellis",
	V_FEED_TOOLTIP_VALUE_AXIS:"tooltipValueAxis",
	V_FEED_TOOLTIP_CATEGORY_AXIS:"tooltipCategoryAxis",
	V_FEED_SIZE:"size",
	V_FEED_WEIGHT:"weight",
	V_FEED_TITLE:"title",
	V_FEED_BUBBLE_WEIGHT:"bubbleWidth",
	V_FEED_TIME_AXIS:"timeAxis",
	K_FILL:"fill",
	K_FILTERS:"filters",
	K_FUNCTION:"function",
	K_FONT_FAMILY:"fontFamily",
	K_FONT_SIZE:"fontSize",
	K_FONT_WEIGHT:"fontWeight",
	V_FONT_WEIGHT_NORMAL:"normal",
	V_FONT_WEIGHT_BOLD:"bold",
	K_FORMAT:"format",
	K_FORMAT_STRING:"formatString",
	K_GAP:"gap",
	K_GRIDLINE:"gridline",
	K_GRIDLINE_WIDTH:"gridLineWidth",
	K_GENERAL:"general",
	K_GROUP:"group",
	K_HEATMAP:"heatmap",
	K_HIDE_WHEN_OVERLAP:"hideWhenOverlap",
	K_ID:"id",
	V_ID:"id",
	V_ID_AND_DESCRIPTION:"idAndDescription",
	K_INCOMPLETE_DATA_INFO:"incompleteDataInfo",
	K_INVERTED:"inverted",
	K_INNER_GROUP_SPACING:"innerGroupSpacing",
	K_INTERVALS:"intervals",
	K_IS_AUTO_TOP_N:"isAutoTopN",
	K_IS_INCOMPLETE:"isIncomplete",
	K_LABELS:"labels",
	K_LAYOUT:"layout",
	K_LABEL:"label",
	K_LEGEND:"legend",
	K_LEGEND_GROUP:"legendGroup",
	K_LINE_WIDTH:"lineWidth",
	K_LEVEL:"level",
	K_LIMIT:"limit",
	K_LINE:"line",
	K_LINE_COLOR:"lineColor",
	K_NODE_FILTER:"nodeFilter",
	K_ORIGINAL_BINDINGS:"originalBindings",
	K_PACKED_BUBBLE:"packedbubble",
	K_POSITION:"position",
	K_PATTERN:"pattern",
	K_PARENT_KEY:"parentKey",
	K_PROPERTIES:"properties",
	K_PLOT_AREA:"plotArea",
	K_PADDING_BOTTOM:"paddingBottom",
	K_PLOT_OPTIONS:"plotOptions",
	K_PIE:"pie",
	V_POSITION_LEFT:"left",
	V_POSITION_TOP:"top",
	K_ROW_LIMIT:"rowLimit",
	K_RESPONSIVE:"responsive",
	K_RANK:"ranking",
	K_SERIES:"series",
	K_SOURCE:"source",
	K_SHOW_FULL_LABEL:"showFullLabel",
	K_STYLE:"style",
	K_SIZE:"size",
	K_SHOW_LABEL_GRIDS:"showLabelGrids",
	K_SUGGESTED_TITLE:"suggestedTitle",
	K_SUB_TITLE:"subTitle",
	K_SUGGESTED_SUB_TITLE:"suggestedSubTitle",
	K_STACK_COLUMN_LABEL:"stackColumnLabel",
	K_SHOW_LABEL_NAMES:"showLabelNames",
	K_SCATTER:"scatter",
	K_SPLINE:"spline",
	K_SORT:"sort",
	K_SORT_BY:"sortBy",
	V_STACKED_BAR:"stackedbar",
	V_STACKED_COLUMN:"stackedcolumn",
	K_TREEMAP:"treemap",
	K_TYPE:"type",
	K_THRESHOLD:"threshold",
	K_TITLE:"title",
	K_TICK_COLOR:"tickColor",
	K_TICK_WIDTH:"tickWidth",
	K_TICK_LENGTH:"tickLength",
	V_TYPE_AXIS_MEMBER_DIM:"dimension",
	V_TYPE_AXIS_MEMBER_MEMBER:"member",
	V_TYPE_AXIS_MEMBER_RESTRICTED:"restrictedMeasure",
	V_TYPE_AXIS_MEMBER_CALCULATION:"calculation",
	V_TYPE_AXIS_MEMBER_CALCDIM:"calculatedDimension",
	V_TYPE_BARCOLUMN:"barcolumn",
	V_TYPE_CHART_DONUT:"donut",
	V_TYPE_CHART_PIE:"pie",
	V_TYPE_DATASET:"dataset",
	V_TYPE_DIMENSION:"dimension",
	V_TYPE_FILTER_FILTER:"filter",
	V_TYPE_FILTER_COMPLEX:"complex",
	V_TYPE_FILTER_MEMBER:"member",
	V_TYPE_HIERCHY_PCH:"hierarchy.pch",
	V_TYPE_DIMENSION_SELECTION:"dimension.selection",
	V_TYPE_MEASURE_SELECTION:"measure.selection",
	V_TYPE_MEMBER:"member",
	V_TYPE_CALCULATION:"calculation",
	V_TYPE_SORT_DIMENSION:"dimension",
	K_VALUE_AXIS:"valueAxis",
	K_VALUE_AXIS2:"valueAxis2",
	K_VALUE:"value",
	K_VALUES:"values",
	K_VARIANCE_CHART:"varianceChart",
	K_VARIANCE_LABEL:"varianceLabel",
	K_VARIANCES:"variances",
	K_VISIBLE:"visible",
	K_VARIPIE:"variablepie",
	K_VARIWIDE:"variwide",
	K_WORDCLOUD:"wordcloud",
	K_REFERENCELINES:"referenceLines",
	K_MARKERS:"markers",
	K_ERRORBARS:"errorbars",
	K_ANALYTIC_OBJECTS:"analyticObjects",
	K_STACK:"stack",
	K_STACKING:"stacking",
	K_PLOT_LINES:"plotLines",
	K_POLAR:"polar",
	K_MARGIN_TOP:"marginTop",
	K_TEXT:"text",
	K_DATA_LABELS:"dataLabels",
	K_NAME:"name",
	K_X_AXIS:"xAxis",
	K_Y_AXIS:"yAxis",
	K_Y:"y",
	K_Y_FORMATTED:"yFormatted",
	K_Z_AXIS:"zAxis",
	K_PATTERN_HATCHING1:"hatching1",
	K_PATTERN_HATCHING2:"hatching2",
	K_PATTERN_HATCHING3:"hatching3",
	K_PATTERN_HATCHING4:"hatching4",
	K_PATTERN_HATCHING5:"hatching5",
	K_PATTERN_HATCHING6:"hatching6",
	K_PATTERN_HATCHING7:"hatching7",
	K_PATTERN_HATCHING8:"hatching8",
	K_PATTERN_NON_FILL:"nonFill",
	V_PATTERN_PATH_HATCHING1:"M 12 0 L 0 12 M -12 12 L 12 -12 M 24 0 L 0 24",
	V_PATTERN_SIZE_HATCHING1:12,
	V_PATTERN_PATH_HATCHING2:"M 12 0 L 0 12 M -12 12 L 12 -12 M 24 0 L 0 24 M 13 1 L 1 13 M -11 13 L 13 -11 M 25 1 L 1 25 M 1 -11 L -11 1",
	V_PATTERN_SIZE_HATCHING2:12,
	V_PATTERN_PATH_HATCHING3:"M 12 0 L 0 12 M -12 12 L 12 -12 M 24 0 L 0 24 M 13 1 L 1 13 M -11 13 L 13 -11 M 25 1 L 1 25 M 1 -11 L -11 1 M 14 2 L 2 14 M -10 14 L 14 -10 M 26 2 L 2 26 M 2 -10 L -10 2 M 11 -1 L -1 11 M -13 11 L 11 -13 M 23 -1 L -1 23 M 23 11 L 11 23",
	V_PATTERN_SIZE_HATCHING3:12,
	V_PATTERN_PATH_HATCHING4:"M 1 1 L 1 2 Z M 3 3 L 3 4 Z",
	V_PATTERN_SIZE_HATCHING4:5,
	V_PATTERN_PATH_HATCHING5:"M 1 1 L 1 2 Z M 4 4 L 4 5 Z",
	V_PATTERN_SIZE_HATCHING5:7,
	V_PATTERN_PATH_HATCHING6:"M 1 1 L 1 2 Z M 5 5 L 5 6 Z",
	V_PATTERN_SIZE_HATCHING6:9,
	V_PATTERN_PATH_HATCHING7:"M 1 1 L 1 2 Z M 5 5 L 7 6 L 6 6 L 6 5 L 5 5 Z",
	V_PATTERN_SIZE_HATCHING7:9,
	V_PATTERN_PATH_HATCHING8:"M 0 0 L 0 5 L 4 5 L 4 0 L 3 0 L 3 5 L 2 5 L 2 0 L 1 0 L 1 5 L 5 5 L 5 0 L 0 0 Z M 6 6 L 6 5 L 10 11 L 10 6 L 9 6 L 9 11 L 8 11 L 8 6 L 7 6 L 7 11 L 11 11 L 11 6 L 6 6 Z",
	V_PATTERN_SIZE_HATCHING8:12,
	V_COLOR_1:"#9dc3e6",
	V_COLOR_2:"#4EA3D6",
	V_COLOR_3:"#0f7daf",
	V_COLOR_4:"#0c648c",
	V_COLOR_5:"#094d6b",
	V_COLOR_6:"#ffe699",
	V_COLOR_7:"#ffd966",
	V_COLOR_8:"#bf9000",
	V_COLOR_9:"#7f6000",
	V_COLOR_10:"#dbdbdb",
	V_COLOR_11:"#c9c9c9",
	V_COLOR_12:"#7c7c7c",
	V_COLOR_13:"#6c6c6c",
	V_COLOR_14:"#222a35",
	V_COLOR_15:"#000000",
	V_COLOR_16:"#4a3f93",
	V_COLOR_17:"#c9024a",
	V_COLOR_18:"#37962d"
};

oFF.SacGridRendererFactoryImpl = function() {};
oFF.SacGridRendererFactoryImpl.prototype = new oFF.XObject();
oFF.SacGridRendererFactoryImpl.prototype._ff_c = "SacGridRendererFactoryImpl";

oFF.SacGridRendererFactoryImpl.create = function()
{
	return new oFF.SacGridRendererFactoryImpl();
};
oFF.SacGridRendererFactoryImpl.prototype.newGridRenderer = function(table)
{
	return oFF.GenericTableRenderer.create(table);
};

oFF.SacTableWidgetRenderHelper = function() {};
oFF.SacTableWidgetRenderHelper.prototype = new oFF.XObject();
oFF.SacTableWidgetRenderHelper.prototype._ff_c = "SacTableWidgetRenderHelper";

oFF.SacTableWidgetRenderHelper.createTableRenderHelper = function(table)
{
	var instance = new oFF.SacTableWidgetRenderHelper();
	instance.initializeRH(table);
	return instance;
};
oFF.SacTableWidgetRenderHelper.prototype.m_tableObject = null;
oFF.SacTableWidgetRenderHelper.prototype.initializeRH = function(tableObject)
{
	this.m_tableObject = tableObject;
};
oFF.SacTableWidgetRenderHelper.prototype.releaseObject = function()
{
	this.m_tableObject = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacTableWidgetRenderHelper.prototype.getTableObject = function()
{
	return this.m_tableObject;
};
oFF.SacTableWidgetRenderHelper.prototype.fillRowsFromList = function(rowList, prRowList, offset, freezeRows, freezeUpToRows)
{
	var index;
	var effectiveIndex = offset;
	var rowAmount = rowList.size();
	for (index = 0; index < rowAmount; index++)
	{
		var row = rowList.get(index);
		if (oFF.notNull(row) && !row.isEffectivelyHidden())
		{
			var headerRowStructure = this.renderRow(prRowList, row, effectiveIndex);
			if (freezeRows && freezeUpToRows < 0 || freezeUpToRows >= effectiveIndex)
			{
				headerRowStructure.putBoolean(oFF.SacTableConstants.R_B_FIXED, true);
			}
			effectiveIndex++;
		}
		else if (oFF.isNull(row))
		{
			effectiveIndex++;
		}
	}
};
oFF.SacTableWidgetRenderHelper.prototype.fillRowsFromListKeepGaps = function(rowList, prRowList, offset)
{
	var index;
	var rowAmount = rowList.size();
	var effectiveIndex = offset;
	for (index = 0; index < rowAmount; index++)
	{
		var row = rowList.get(index);
		if (oFF.notNull(row) && !row.isEffectivelyHidden())
		{
			this.renderRow(prRowList, row, effectiveIndex++);
		}
		else if (oFF.isNull(row))
		{
			prRowList.addNull();
			effectiveIndex++;
		}
	}
};
oFF.SacTableWidgetRenderHelper.prototype.renderGenericSettings = function(tableJson)
{
	var result;
	if (oFF.notNull(this.m_tableObject))
	{
		var featureToggles = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_FEATURE_TOGGLES);
		featureToggles.putBoolean(oFF.SacTableConstants.TD_M_FEATURE_TOGGLES_DIM_HEADER_CELLS_WITH_ICONS, true);
		featureToggles.putBoolean(oFF.SacTableConstants.TD_M_FEATURE_TOGGLES_ACCESSIBILITY_KEYBOARD_SUPPORT, true);
		featureToggles.putBoolean(oFF.SacTableConstants.TD_M_FEATURE_TOGGLES_ACCESSIBILITY_SCREEN_READER_SUPPORT, true);
		var style = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_STYLE);
		var font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
		font.putInteger(oFF.SacTableConstants.FS_N_SIZE, 42);
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_REVERSED_HIERARCHY, this.m_tableObject.isReversedHierarchy());
		var title = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_TITLE);
		var titleStyle = title.putNewStructure(oFF.SacTableConstants.TD_M_TITLE_STYLE);
		title.putNewStructure(oFF.SacTableConstants.TD_M_SUBTITLE_STYLE);
		var titleFont = titleStyle.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
		titleFont.putInteger(oFF.SacTableConstants.FS_N_SIZE, 17);
		var titleText = this.m_tableObject.getTitle();
		title.putStringNotNullAndNotEmpty(oFF.SacTableConstants.TD_S_TITLE_TEXT, titleText);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(titleText))
		{
			title.putNewList(oFF.SacTableConstants.TD_L_TITLE_CHUNKS).addString(titleText);
		}
		var titleTokens = title.putNewStructure(oFF.SacTableConstants.TD_M_TOKEN_DATA);
		var titelTokenStyles = titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_STYLES);
		titelTokenStyles.putString("line-height", "");
		titelTokenStyles.putString("text-align", "left");
		titelTokenStyles.putString("font-size", "13px");
		titelTokenStyles.putString("align-items", "center");
		titelTokenStyles.putString("margin-top", "3px");
		titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_ATTRIBUTES);
		titleTokens.putNewList(oFF.SacTableConstants.TE_L_CLASSES).addString("sapReportEngineTokenContainer");
		titleTokens.putString(oFF.SacTableConstants.TE_S_TAG, "div");
		var titleVisible = this.m_tableObject.isShowTableTitle();
		var subtitleVisible = this.m_tableObject.isShowSubTitle();
		var detailsVisible = this.m_tableObject.isShowTableDetails();
		title.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, titleVisible);
		title.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, subtitleVisible);
		title.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, detailsVisible);
		title.putBoolean(oFF.SacTableConstants.TD_B_EDITABLE, false);
		var titleAreaHeight = 40;
		if (titleVisible && (detailsVisible || subtitleVisible))
		{
			titleAreaHeight = 52;
		}
		else if (!titleVisible && !detailsVisible && !subtitleVisible)
		{
			titleAreaHeight = 0;
		}
		titleStyle.putInteger(oFF.SacTableConstants.TS_N_HEIGHT, titleAreaHeight);
		var i;
		var tableHeight = this.m_tableObject.getHeight();
		var tableWidth = this.m_tableObject.getWidth();
		tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_HEIGHT, tableHeight);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_WIDTH, tableWidth);
		var showGrid = this.m_tableObject.isShowGrid();
		var freezingColumns = this.m_tableObject.isFreezeHeaderColumns() || this.m_tableObject.getFreezeUpToColumn() > -1;
		var freezing = this.m_tableObject.isFreezeHeaderRows() || this.m_tableObject.getFreezeUpToRow() > -1 || freezingColumns;
		var freezeUpToColumn = this.m_tableObject.getFreezeUpToColumn();
		if (freezeUpToColumn > -1 || !this.m_tableObject.isFreezeHeaderColumns())
		{
			tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, freezeUpToColumn);
		}
		else
		{
			tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, this.m_tableObject.getPreColumnsAmount() - 1);
		}
		var freezeUpToRow = this.m_tableObject.getFreezeUpToRow();
		if (freezeUpToRow > -1 || !this.m_tableObject.isFreezeHeaderRows())
		{
			tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, freezeUpToRow);
		}
		else
		{
			tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
		}
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_FREEZE_LINES, freezing && this.m_tableObject.isShowFreezeLines());
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_HAS_FIXED_ROWS_COLS, freezing);
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, showGrid);
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_COORDINATE_HEADER, this.m_tableObject.isShowCoordinateHeader());
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, this.m_tableObject.isShowGrid());
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, this.m_tableObject.isShowSubTitle());
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, this.m_tableObject.isShowTableTitle());
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, this.m_tableObject.isShowTableDetails());
		var columnSettings = tableJson.putNewList(oFF.SacTableConstants.TD_L_COLUMN_SETTINGS);
		var availableWidth = tableWidth - 100;
		var columnWidths = this.m_tableObject.getColumnEmWidths();
		var overallSizeUnits = oFF.XStream.of(columnWidths).reduce(oFF.XIntegerValue.create(1),  function(a, b){
			return oFF.XIntegerValue.create(a.getInteger() + b.getInteger());
		}.bind(this)).getInteger();
		var factor = oFF.XMath.div(availableWidth, overallSizeUnits);
		if (factor > 15)
		{
			factor = 15;
		}
		if (factor < 10)
		{
			factor = 10;
		}
		var minPixelCellWidth = this.m_tableObject.getMinCellWidth();
		var maxPixelCellWidth = this.m_tableObject.getMaxCellWidth();
		var preciseWidth;
		var columnObject;
		var headerWidth = 0;
		var dataWidth = 0;
		for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
		{
			preciseWidth = minPixelCellWidth;
			if (i < columnWidths.size())
			{
				preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
			}
			columnObject = this.m_tableObject.getHeaderColumnList().get(i);
			columnObject.setDefaultWidth(preciseWidth);
			headerWidth = headerWidth + preciseWidth;
		}
		var averageWidth = minPixelCellWidth;
		if (this.m_tableObject.getDataColumnsAmount() > 0)
		{
			var accumulator = 0;
			var divisor = oFF.XMath.min(columnWidths.size(), this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getColumnList().size());
			for (var j = 0; j < divisor; j++)
			{
				accumulator = accumulator + oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(j).getInteger() * factor, minPixelCellWidth));
			}
			averageWidth = oFF.XMath.div(accumulator, divisor);
			for (; i < this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getColumnList().size(); i++)
			{
				preciseWidth = averageWidth;
				if (i < columnWidths.size())
				{
					preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
				}
				dataWidth = dataWidth + preciseWidth;
				columnObject = this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount());
				if (oFF.notNull(columnObject))
				{
					columnObject.setDefaultWidth(preciseWidth);
				}
			}
		}
		if (freezingColumns && dataWidth + headerWidth > tableWidth && tableWidth < headerWidth * 2)
		{
			var availableHeaderWidth = oFF.XMath.max(tableWidth / 2, tableWidth - dataWidth);
			var headerCorrectionFactor = oFF.XMath.div(availableHeaderWidth * 1000, headerWidth);
			for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
			{
				columnObject = this.m_tableObject.getHeaderColumnList().get(i);
				preciseWidth = columnObject.getWidth();
				columnObject.setDefaultWidth(oFF.XMath.div(headerCorrectionFactor * preciseWidth, 1000));
			}
		}
		var totalWidth = 20;
		var columnStructure;
		var effectiveIndex = 0;
		for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
		{
			columnObject = this.m_tableObject.getHeaderColumnList().get(i);
			if (oFF.isNull(columnObject) || !columnObject.isEffectivelyHidden())
			{
				preciseWidth = columnObject.getWidth();
				totalWidth = totalWidth + preciseWidth;
				columnStructure = columnSettings.addNewStructure();
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, effectiveIndex);
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
				columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(effectiveIndex));
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, false);
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.isFreezeHeaderColumns() && freezeUpToColumn < 0 || freezeUpToColumn >= effectiveIndex);
				this.renderColumn(columnObject, columnStructure);
				effectiveIndex++;
			}
		}
		if (this.m_tableObject.getDataColumnsAmount() > 0)
		{
			for (i = 0; i < this.m_tableObject.getColumnList().size(); i++)
			{
				columnObject = this.m_tableObject.getColumnList().get(i);
				if (oFF.isNull(columnObject) || !columnObject.isEffectivelyHidden())
				{
					preciseWidth = oFF.isNull(columnObject) ? averageWidth : columnObject.getWidth();
					totalWidth = totalWidth + preciseWidth;
					columnStructure = columnSettings.addNewStructure();
					columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, effectiveIndex);
					columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
					columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
					columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(effectiveIndex));
					columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.getFreezeUpToColumn() >= effectiveIndex);
					columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
					columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
					this.renderColumn(columnObject, columnStructure);
					effectiveIndex++;
				}
			}
			for (i = this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getColumnList().size(); i < columnWidths.size(); i++)
			{
				columnStructure = columnSettings.addNewStructure();
				totalWidth = totalWidth + averageWidth;
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, i);
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
				columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, averageWidth);
				columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(i));
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.getFreezeUpToColumn() >= i);
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
				columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
			}
		}
		var dataRowAmount = this.m_tableObject.getDataRowAmount();
		var headerRowAmount = this.m_tableObject.getHeaderRowList().size();
		var totalHeight = 20 + this.m_tableObject.getOverallHeight();
		if (showGrid)
		{
			totalHeight = totalHeight + dataRowAmount + headerRowAmount;
		}
		var cellChartInfo = this.m_tableObject.getCellChartInfo();
		if (oFF.XCollectionUtils.hasElements(cellChartInfo))
		{
			var cellChartInfoStructure = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_CELL_CHART_DATA);
			var memberNames = cellChartInfo.getKeysAsIteratorOfString();
			while (memberNames.hasNext())
			{
				var memberName = memberNames.next();
				var cellChartMemberInfo = cellChartInfo.getByKey(memberName);
				var memberCellChartData = cellChartInfoStructure.putNewStructure(memberName);
				memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_COL, cellChartMemberInfo.getStartColumn());
				memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_COL, cellChartMemberInfo.getEndColumn());
				memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_ROW, cellChartMemberInfo.getStartRow());
				memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_ROW, cellChartMemberInfo.getEndRow());
				memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MIN, cellChartMemberInfo.getMinValue());
				memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MAX, cellChartMemberInfo.getMaxValue());
				memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_HEIGHT, oFF.SacTableConstants.DF_R_N_HEIGHT);
				var columnsList = memberCellChartData.putNewList(oFF.SacTableConstants.CCD_L_COLUMNS);
				var columnsIterator = cellChartMemberInfo.getColumns().getIterator();
				var maxTextWidth = 0;
				while (columnsIterator.hasNext())
				{
					var columnIndex = columnsIterator.next().getInteger();
					columnsList.addInteger(columnIndex);
					maxTextWidth = oFF.XMath.max(oFF.XMath.div(columnSettings.getStructureAt(columnIndex).getIntegerByKey(oFF.SacTableConstants.CS_N_WIDTH), 2), maxTextWidth);
				}
				memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_WIDTH, maxTextWidth);
			}
		}
		tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_WIDTH, totalWidth);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_HEIGHT, totalHeight);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_COL, 0);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_ROW, 0);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_COL, this.m_tableObject.getPreColumnsAmount() - 1);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_COL, this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getDataColumnsAmount() - 1);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_ROW, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
		tableJson.putInteger(oFF.SacTableConstants.TD_N_LAST_ROW_INDEX, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
		result = titleTokens.putNewList(oFF.SacTableConstants.TE_L_CHILDREN);
	}
	else
	{
		result = oFF.PrFactory.createList();
	}
	return result;
};
oFF.SacTableWidgetRenderHelper.prototype.renderColumn = function(sacTableColumn, columnStructure) {};
oFF.SacTableWidgetRenderHelper.prototype.renderRow = function(rowList, row, rowIndex)
{
	var structure = rowList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.R_N_HEIGHT, row.getHeight());
	var localId = row.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XInteger.convertToHexString(rowIndex);
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	structure.putInteger(oFF.SacTableConstants.R_N_ROW, rowIndex);
	structure.putBoolean(oFF.SacTableConstants.R_B_FIXED, row.isFixed());
	structure.putBoolean(oFF.SacTableConstants.R_B_CHANGED_ON_THE_FLY_UNRESPONSIVE, row.isChangedOnTheFlyUnresponsive());
	var cellList = structure.putNewList(oFF.SacTableConstants.R_L_CELLS);
	var stripeColumns = row.getParentTable().isStripeDataColumns();
	var stripeRows = row.getParentTable().isStripeDataRows();
	var stripeAny = stripeColumns || stripeRows;
	var cellsSize = row.getCells().size();
	var effectiveIndex = 0;
	for (var i = 0; i < cellsSize; i++)
	{
		var cell = row.getCells().get(i);
		if (oFF.isNull(cell))
		{
			this.renderEmptyCell(cellList, rowIndex, effectiveIndex++);
		}
		else if (cell.getParentColumn() !== null && !cell.getParentColumn().isEffectivelyHidden())
		{
			var cellStructure = this.renderCell(cellList, cell, rowIndex, effectiveIndex);
			this.format(cell, cellStructure);
			if (stripeAny && i >= row.getParentTable().getPreColumnsAmount() && row.getParentTable().getRowList().contains(row))
			{
				var style = this.getStyle(cellStructure);
				if (oFF.XStringUtils.isNullOrEmpty(style.getStringByKey(oFF.SacTableConstants.ST_S_FILL_COLOR)))
				{
					if (stripeRows && oFF.XMath.mod(rowIndex, 2) === 0)
					{
						style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_ROW_STRIPE_COLOR);
					}
					else if (stripeColumns && oFF.XMath.mod(effectiveIndex, 2) === 0)
					{
						style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_COLUMN_STRIPE_COLOR);
					}
				}
			}
			effectiveIndex++;
		}
	}
	return structure;
};
oFF.SacTableWidgetRenderHelper.prototype.renderEmptyCell = function(cellList, rowIndex, colIndex)
{
	var structure = cellList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.C_N_ROW, rowIndex);
	structure.putInteger(oFF.SacTableConstants.C_N_COLUMN, colIndex);
	return structure;
};
oFF.SacTableWidgetRenderHelper.prototype.getStyle = function(structure)
{
	if (!structure.containsKey(oFF.SacTableConstants.C_M_STYLE))
	{
		structure.putBoolean(oFF.SacTableConstants.C_B_STYLE_UPDATED_BY_USER, true);
		structure.putNewStructure(oFF.SacTableConstants.C_M_STYLE);
	}
	return structure.getStructureByKey(oFF.SacTableConstants.C_M_STYLE);
};
oFF.SacTableWidgetRenderHelper.prototype.format = function(cellBase, structureToFormat)
{
	var styles = cellBase.getPrioritizedStylesList();
	if (cellBase.isEffectiveTotalsContext())
	{
		structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_INA_TOTALS_CONTEXT, true);
	}
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_IN_HIERARCHY, cellBase.isInHierarchy());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_ALLOW_DRAG_DROP, cellBase.isAllowDragDrop());
	structureToFormat.putInteger(oFF.SacTableConstants.C_N_LEVEL, cellBase.getHierarchyLevel());
	structureToFormat.putInteger(cellBase.getHierarchyPaddingType(), cellBase.getHierarchyPaddingValue() * (1 + cellBase.getHierarchyLevel()));
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_SHOW_DRILL_ICON, cellBase.isShowDrillIcon());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_EXPANDED, cellBase.isExpanded());
	var color = oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveFillColor(styles));
	if (oFF.notNull(color))
	{
		var style = this.getStyle(structureToFormat);
		style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, color);
	}
	if (cellBase.isWrap())
	{
		this.getStyle(structureToFormat).putBoolean(oFF.SacTableConstants.ST_B_WRAP, true);
	}
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineTop(styles), oFF.SacTableConstants.LP_TOP, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyleLineBottom(styles), oFF.SacTableConstants.LP_BOTTOM, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineLeft(styles), oFF.SacTableConstants.LP_LEFT, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineRight(styles), oFF.SacTableConstants.LP_RIGHT, structureToFormat);
	if (cellBase.isEffectiveFontItalic(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_ITALIC, true);
	}
	if (cellBase.isEffectiveFontBold(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_BOLD, true);
	}
	if (cellBase.isEffectiveFontUnderline(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_UNDERLINE, true);
	}
	if (cellBase.isEffectiveFontStrikeThrough(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_STRIKETHROUGH, true);
	}
	var effectiveFontSize = cellBase.getEffectiveFontSize(styles);
	if (effectiveFontSize > 0)
	{
		this.getFont(structureToFormat).putDouble(oFF.SacTableConstants.FS_N_SIZE, effectiveFontSize);
	}
	var effectiveFontFamily = cellBase.getEffectiveFontFamily(styles);
	if (oFF.notNull(effectiveFontFamily))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_FAMILY, effectiveFontFamily);
	}
	color = oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveFontColor(styles));
	if (oFF.notNull(color))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_COLOR, color);
	}
	var effectiveThresholdColor = oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveThresholdColor(styles));
	if (oFF.notNull(effectiveThresholdColor))
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_COLOR, effectiveThresholdColor);
	}
	var effectiveThresholdType = cellBase.getEffectiveThresholdType(styles);
	if (effectiveThresholdType === oFF.SacAlertSymbol.GOOD)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_GOOD);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.WARNING)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_WARNING);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.ALERT)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_ALERT);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.DIAMOND)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_DIAMOND);
	}
	var hAlignment = cellBase.getEffectiveHorizontalAlignment(styles);
	var vAlignment = cellBase.getEffectiveVerticalAlignment(styles);
	if (oFF.notNull(hAlignment) || oFF.notNull(vAlignment))
	{
		var alignmentStructure = this.getStyle(structureToFormat).putNewStructure(oFF.SacTableConstants.ST_M_ALIGNMENT);
		if (hAlignment === oFF.SacTableCellHorizontalAlignment.LEFT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_LEFT);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.CENTER)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_CENTER);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.RIGHT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_RIGHT);
		}
		if (vAlignment === oFF.SacTableCellVerticalAlignment.TOP)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_TOP);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.MIDDLE)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_MIDDLE);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.BOTTOM)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_BOTTOM);
		}
	}
	var backgroundPatternType = cellBase.getEffectiveBackgroundPatternType(styles);
	if (backgroundPatternType === oFF.SacLinePatternType.BACKGROUND_IMAGE)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putStringNotNullAndNotEmpty(oFF.SacTableConstants.C_S_FORMATTED, cellBase.getEffectiveBackgroundContent(styles));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_1)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_1));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_2)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_2));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_3)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_3));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_4)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_4));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_5)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_5));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_6)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_6));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_7)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_7));
	}
	else if (backgroundPatternType === oFF.SacLinePatternType.HATCHIING_8)
	{
		structureToFormat.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_IMAGE);
		structureToFormat.putString(oFF.SacTableConstants.C_S_FORMATTED, oFF.XStringUtils.concatenate2(oFF.SacTableConstants.IMG_B64_PREFIX_SHORT, oFF.SacTableConstants.BASE64_SVG_HATCHING_8));
	}
	return structureToFormat;
};
oFF.SacTableWidgetRenderHelper.prototype.transferStyledLineToJson = function(effectiveLineStyle, lpKey, structureToFormat)
{
	if (!effectiveLineStyle.isEmpty())
	{
		var line = this.getLineInternal(lpKey, structureToFormat);
		line.putStringNotNullAndNotEmpty(oFF.SacTableConstants.SL_S_COLOR, oFF.RenderThemingHelper.remapColor(effectiveLineStyle.getColor()));
		if (effectiveLineStyle.getWidth() > -1)
		{
			line.putDouble(oFF.SacTableConstants.SL_N_SIZE, effectiveLineStyle.getWidth());
		}
		if (effectiveLineStyle.hasPadding())
		{
			var paddingStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
			this.applyPadding(paddingStructure, effectiveLineStyle.getLeftPadding(), oFF.SacTableConstants.SLP_N_LEFT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getRightPadding(), oFF.SacTableConstants.SLP_N_RIGHT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getTopPadding(), oFF.SacTableConstants.SLP_N_TOP);
			this.applyPadding(paddingStructure, effectiveLineStyle.getBottomPadding(), oFF.SacTableConstants.SLP_N_BOTTOM);
		}
		var lineStyle = effectiveLineStyle.getLineStyle();
		if (lineStyle === oFF.SacTableLineStyle.DASHED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DASHED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.DOTTED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DOTTED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.SOLID)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_SOLID);
		}
		else if (lineStyle === oFF.SacTableLineStyle.NONE)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_NONE);
		}
		var linePatternType = effectiveLineStyle.getPatternType();
		if (oFF.notNull(linePatternType))
		{
			var patternStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PATTERN);
			if (linePatternType === oFF.SacLinePatternType.WHITE_FILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_WHITE_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.NOFILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_NON_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.SOLID)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_SOLID);
			}
			else if (linePatternType === oFF.SacLinePatternType.BACKGROUND_IMAGE)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BACKGROUND, effectiveLineStyle.getPatternBackground());
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_1)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_1, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_2)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_2, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_3)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_3, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_4)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_4, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_5)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_5, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_6)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_6, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_7)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_7, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_8)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_8, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			if (effectiveLineStyle.getPatternWidth() > 0)
			{
				patternStructure.putDouble(oFF.SacTableConstants.LP_N_WIDTH, effectiveLineStyle.getPatternWidth());
			}
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_COLOR, oFF.RenderThemingHelper.remapColor(effectiveLineStyle.getPatternColor()));
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BORDER_COLOR, oFF.RenderThemingHelper.remapColor(effectiveLineStyle.getPatternBorderColor()));
		}
	}
};
oFF.SacTableWidgetRenderHelper.prototype.applyPadding = function(paddingStructure, padding, paddingKey)
{
	if (padding > -1)
	{
		paddingStructure.putDouble(paddingKey, padding);
	}
};
oFF.SacTableWidgetRenderHelper.prototype.getLineInternal = function(position, structure)
{
	var style = this.getStyle(structure);
	if (!style.containsKey(oFF.SacTableConstants.ST_L_LINES))
	{
		style.putNewList(oFF.SacTableConstants.ST_L_LINES);
	}
	var lines = style.getListByKey(oFF.SacTableConstants.ST_L_LINES);
	var line = null;
	for (var i = 0; i < lines.size(); i++)
	{
		if (lines.getStructureAt(i).getIntegerByKey(oFF.SacTableConstants.SL_N_POSITION) === position)
		{
			line = lines.getStructureAt(i);
		}
	}
	if (oFF.isNull(line))
	{
		line = lines.addNewStructure();
		line.putInteger(oFF.SacTableConstants.SL_N_SIZE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_STYLE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_POSITION, position);
		var padding = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
		if (position === oFF.SacTableConstants.LP_BOTTOM || position === oFF.SacTableConstants.LP_TOP)
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_RIGHT, oFF.SacTableConstants.LP_RIGHT);
			padding.putInteger(oFF.SacTableConstants.SLP_N_LEFT, oFF.SacTableConstants.LP_RIGHT);
		}
		else
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_BOTTOM, oFF.SacTableConstants.LP_BOTTOM);
			padding.putInteger(oFF.SacTableConstants.SLP_N_TOP, oFF.SacTableConstants.LP_TOP);
		}
	}
	return line;
};
oFF.SacTableWidgetRenderHelper.prototype.getFont = function(structure)
{
	var style = this.getStyle(structure);
	var font = style.getStructureByKey(oFF.SacTableConstants.ST_M_FONT);
	if (oFF.isNull(font))
	{
		font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	}
	return font;
};
oFF.SacTableWidgetRenderHelper.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var structure = cellList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.C_N_ROW, rowIndex);
	structure.putInteger(oFF.SacTableConstants.C_N_COLUMN, colIndex);
	var mergedColumns = cellBase.getMergedColumns();
	var mergedRows = cellBase.getMergedRows();
	if (mergedColumns !== 0 || mergedRows !== 0)
	{
		var mergerStructure = structure.putNewStructure(oFF.SacTableConstants.C_M_MERGED);
		if (mergedColumns >= 0 && mergedRows >= 0)
		{
			if (cellBase.getMergedColumns() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_COLUMNS, cellBase.getMergedColumns());
			}
			if (cellBase.getMergedRows() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ROWS, cellBase.getMergedRows());
			}
		}
		else
		{
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_COLUMN, colIndex + cellBase.getMergedColumns());
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_ROW, rowIndex + cellBase.getMergedRows());
		}
	}
	if (cellBase.getCommentDocumentId() !== null)
	{
		structure.putInteger(oFF.SacTableConstants.C_N_COMMENT_TYPE, oFF.SacTableConstants.CT_CHILD);
		structure.putString(oFF.SacTableConstants.CS_COMMENT_DOCUMENT_ID, cellBase.getCommentDocumentId());
	}
	var localId = cellBase.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XStringUtils.concatenate2(oFF.XInteger.convertToHexString(rowIndex), oFF.XInteger.convertToHexString(colIndex));
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	if (!cellBase.isRepeatedHeader() || cellBase.isEffectiveRepetitiveHeaderCells())
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, cellBase.getFormatted());
	}
	else
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, "");
	}
	structure.putBoolean(oFF.SacTableConstants.C_B_REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	if (cellBase.getPlain() !== null)
	{
		var valueType = cellBase.getPlain().getValueType();
		if (valueType === oFF.XValueType.BOOLEAN)
		{
			structure.putBoolean(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getBoolean(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.DOUBLE)
		{
			structure.putDouble(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.LONG)
		{
			structure.putLong(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getLong(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.INTEGER)
		{
			structure.putInteger(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getInteger(cellBase.getPlain(), false, true));
		}
		else
		{
			structure.putString(oFF.SacTableConstants.C_SN_PLAIN, cellBase.getPlain().getStringRepresentation());
		}
	}
	var effectiveCellType = cellBase.getEffectiveCellType();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, effectiveCellType);
	structure.putBoolean(oFF.SacTableConstants.C_B_DRAGGABLE, effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_HEADER);
	if (cellBase.isEffectiveShowCellChart())
	{
		this.preFormatCellChart(cellBase, structure, rowIndex, colIndex);
	}
	return structure;
};
oFF.SacTableWidgetRenderHelper.prototype.preFormatCellChart = function(cellBase, structure, rowIndex, colIndex)
{
	var styles = cellBase.getPrioritizedStylesList();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_CHART);
	var cellChart = structure.putNewStructure(oFF.SacTableConstants.C_M_CELL_CHART);
	cellChart.putString(oFF.SacTableConstants.CC_S_MEMBER_ID, cellBase.getEffectiveCellChartMemberName(styles));
	var cellChartType = cellBase.getEffectiveCellChartType();
	if (cellChartType === oFF.SacCellChartType.BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.VARIANCE_BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.PIN)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_PIN);
	}
	cellChart.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveCellChartBarColor(styles)));
	cellChart.putString(oFF.SacTableConstants.CC_SU_LINE_COLOR, oFF.RenderThemingHelper.remapColor(cellBase.getEffectiveCellChartLineColor(styles)));
	cellChart.putBoolean(oFF.SacTableConstants.CC_B_SHOW_VALUE, !cellBase.isEffectiveHideNumberForCellChart());
	cellChart.putString(oFF.SacTableConstants.CC_S_CELL_CHART_ORIENTATION, cellBase.getEffectiveCellChartOrientation() === oFF.SacCellChartOrientation.VERTICAL ? oFF.SacTableConstants.CCO_VERTICAL : oFF.SacTableConstants.CCO_HORIZONTAL);
	var cellChartInfo = this.m_tableObject.getCellChartInfo();
	if (!cellChartInfo.containsKey(cellBase.getEffectiveCellChartMemberName(styles)))
	{
		cellChartInfo.put(cellBase.getEffectiveCellChartMemberName(styles), oFF.CellChartInfo.create(cellBase.getEffectiveCellChartOrientation(), colIndex, rowIndex, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true)));
	}
	else
	{
		var cellChartMeasureInfo = cellChartInfo.getByKey(cellBase.getEffectiveCellChartMemberName(styles));
		cellChartMeasureInfo.addColumn(colIndex);
		cellChartMeasureInfo.addRow(rowIndex);
		cellChartMeasureInfo.registerValue(oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
	}
	return cellChart;
};

oFF.SacTableXlsRenderHelper = function() {};
oFF.SacTableXlsRenderHelper.prototype = new oFF.XObject();
oFF.SacTableXlsRenderHelper.prototype._ff_c = "SacTableXlsRenderHelper";

oFF.SacTableXlsRenderHelper.createTableRenderHelper = function(tableObject)
{
	var instance = new oFF.SacTableXlsRenderHelper();
	instance.initializeRH(tableObject);
	return instance;
};
oFF.SacTableXlsRenderHelper.prototype.m_tableObject = null;
oFF.SacTableXlsRenderHelper.prototype.initializeRH = function(tableObject)
{
	this.m_tableObject = tableObject;
};
oFF.SacTableXlsRenderHelper.prototype.getTableObject = function()
{
	return this.m_tableObject;
};

oFF.VisualizationUiModule = function() {};
oFF.VisualizationUiModule.prototype = new oFF.DfModule();
oFF.VisualizationUiModule.prototype._ff_c = "VisualizationUiModule";

oFF.VisualizationUiModule.s_module = null;
oFF.VisualizationUiModule.getInstance = function()
{
	if (oFF.isNull(oFF.VisualizationUiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.VisualizationImplModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.UiModule.getInstance());
		oFF.VisualizationUiModule.s_module = oFF.DfModule.startExt(new oFF.VisualizationUiModule());
		oFF.SacGridRendererFactory.setInstance(oFF.SacGridRendererFactoryImpl.create());
		oFF.DfModule.stopExt(oFF.VisualizationUiModule.s_module);
	}
	return oFF.VisualizationUiModule.s_module;
};
oFF.VisualizationUiModule.prototype.getName = function()
{
	return "ff2670.visualization.ui";
};

oFF.VisualizationUiModule.getInstance();

return sap.firefly;
	} );