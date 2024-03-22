/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/f/GridContainer",
    "sap/f/GridContainerSettings",
    "sap/f/dnd/GridDropInfo",
    "sap/m/Button",
    "sap/m/IllustratedMessage",
    "sap/m/IllustratedMessageSize",
    "sap/m/IllustratedMessageType",
    "sap/ui/core/Control",
    "sap/ui/core/dnd/DragInfo",
    "sap/ui/core/library",
    "sap/ushell/ui/launchpad/ExtendedChangeDetection"
], function (
    GridContainer,
    GridContainerSettings,
    GridDropInfo,
    Button,
    IllustratedMessage,
    IllustratedMessageSize,
    IllustratedMessageType,
    Control,
    DragInfo,
    coreLibrary,
    ExtendedChangeDetection
) {
    "use strict";


    // shortcut for sap.ui.core.dnd.DropLayout
    var DropLayout = coreLibrary.dnd.DropLayout;

    // shortcut for sap.ui.core.dnd.DropPosition
    var DropPosition = coreLibrary.dnd.DropPosition;

    /**
     * Constructor for a new WorkPageCell.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * The WorkPageCell represents a collection of WidgetContainers.
     * @extends sap.ui.core.Control
     *
     *
     * @version 1.115.1
     *
     * @private
     * @experimental
     * @alias sap.ushell.components.workPageBuilder.controls.WorkPageCell
     */
    var WorkPageCell = Control.extend("sap.ushell.components.workPageBuilder.controls.WorkPageCell",
        /** @lends sap.ushell.components.workPageBuilder.controls.WorkPageCell.prototype */ {
            metadata: {
                library: "sap.ushell",
                properties: {
                    /**
                     * Tooltip to display for the "Delete Widget" button
                     */
                    deleteWidgetTooltip: { type: "string", defaultValue: "", bindable: true },
                    /**
                     * The button text to display
                     */
                    addApplicationButtonText: { type: "string", defaultValue: "", bindable: true },
                    /**
                     * Flag to show / hide the edit mode controls.
                     */
                    editMode: { type: "boolean", defaultValue: false, bindable: true },
                    /**
                     * Flag to enable / disable Drag and Drop of Widgets in the widgets aggregation.
                     */
                    tileMode: { type: "boolean", defaultValue: false, bindable: true },
                    /**
                     * Specifies the default value for the grid container's gap property for different screen sizes
                     */
                    gridContainerGap: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },
                    gridContainerGapXS: { type: "string", group: "Appearance", defaultValue: "0.475rem", bindable: true },
                    gridContainerGapS: { type: "string", group: "Appearance", defaultValue: "0.475rem", bindable: true },
                    gridContainerGapM: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },
                    gridContainerGapL: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },
                    gridContainerGapXL: { type: "string", group: "Appearance", defaultValue: "0.5rem", bindable: true },

                    /**
                     * Specifies the default value for the row size for different screen sizes
                     */
                    gridContainerRowSize: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                    gridContainerRowSizeXS: { type: "string", group: "Appearance", defaultValue: "4.375rem", bindable: true },
                    gridContainerRowSizeS: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                    gridContainerRowSizeM: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                    gridContainerRowSizeL: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },
                    gridContainerRowSizeXL: { type: "string", group: "Appearance", defaultValue: "5.25rem", bindable: true },

                    /**
                     * Title to display in the empty cell illustration
                     */
                    emptyIllustrationTitle: { type: "string", group: "Misc", defaultValue: "", bindable: true },
                    /**
                     * Message to display in the empty cell illustration
                     */
                    emptyIllustrationMessage: { type: "string", group: "Misc", defaultValue: "", bindable: true }
                },
                defaultAggregation: "widgets",
                aggregations: {
                    /**
                     * A set of widgets.
                     */
                    widgets: {
                        type: "sap.ui.core.Control",
                        multiple: true,
                        singularName: "widget",
                        bindable: true,
                        dnd: true,
                        forwarding: {
                            getter: "getGridContainer",
                            aggregation: "items"
                        }
                    },
                    /**
                     * Internal aggregation to hold the grid container
                     */
                    _gridContainer: {
                        type: "sap.f.GridContainer",
                        multiple: false,
                        visibility: "hidden"
                    },
                    /**
                     * The header toolbar that contains the delete and add buttons of the WorkPageCell.
                     */
                    headerBar: { type: "sap.m.OverflowToolbar", multiple: false },

                    /**
                     * Private aggregation for the Illustrated Message that is displayed if the WorkPageCell is empty.
                     * @private
                     */
                    _emptyIllustration: { type: "sap.m.IllustratedMessage", multiple: false, visibility: "hidden" }
                },
                events: {
                    /**
                     * Fired when a viz is moved via drag and drop
                     */
                    moveVisualization: {},
                    /**
                     * Fired when the gridContainer adds or removes grid columns (the grid is resized)
                     */
                    gridColumnsChange: {},
                    /**
                     * Fired when the border of a GridContainer is reached when using keyboard navigation
                     */
                    gridContainerBorderReached: {}
                }
            },

            renderer: {
                apiVersion: 2,

                /**
                 * Renders the HTML for the WorkPageCell, using the provided {@link sap.ui.core.RenderManager}.
                 *
                 * @param {sap.ui.core.RenderManager} rm The RenderManager.
                 * @param {sap.ushell.components.workPageBuilder.controls.WorkPageCell} workPageCell The WorkPageCell to be rendered.
                 */
                render: function (rm, workPageCell) {
                    rm.openStart("div", workPageCell);
                    rm.class("sapCepWorkPageCell");
                    // To avoid having a padding around cards in the grid container in the cell we need to set an additional class here
                    if (workPageCell.getTileMode()) {
                        rm.class("sapCepWorkPageCellTileMode");
                    } else {
                        rm.class("sapCepWorkPageCellCardMode");
                    }
                    rm.openEnd(); // div - tag


                    rm.openStart("div");
                    rm.class("sapCepWidgetToolbar");
                    rm.openEnd(); // div - tag

                    rm.renderControl(workPageCell.getHeaderBar());

                    rm.close("div");



                    var aWidgets = workPageCell.getAggregation("widgets");
                    if (aWidgets.length <= 0) {
                        rm.renderControl(workPageCell.getIllustratedMessage());
                    } else {
                        rm.renderControl(workPageCell.getGridContainer());
                    }

                    rm.close("div");
                }
            }
        });

    /**
     * Initializes the control
     * Extended Change Detection for the widgets aggregation
     */
    WorkPageCell.prototype.init = function () {
        this._oWidgetsChangeDetection = new ExtendedChangeDetection("widgets", this);
        Control.prototype.init.apply(this, arguments);
    };

    /**
     * Called if the control is destroyed.
     * Detaches event handlers.
     */
    WorkPageCell.prototype.exit = function () {
        this._oWidgetsChangeDetection.destroy();
        Control.prototype.exit.apply(this, arguments);
    };

    /**
     * Creates a new GridContainer if it does not exist yet and saves it to the _gridContainer aggregation.
     * Applies layout data and drag & drop config accordingly.
     *
     * @return {sap.f.GridContainer} The GridContainer control instance.
     */
    WorkPageCell.prototype.getGridContainer = function () {
        var oGridContainer = this.getAggregation("_gridContainer");
        if (!oGridContainer) {
            oGridContainer = this._createGridContainer()
                .attachColumnsChange(function (oEvent) {
                    this.fireEvent("gridColumnsChange", oEvent.getParameters());
                }.bind(this));
            this.setAggregation("_gridContainer", oGridContainer.addStyleClass("sapCepWorkPageGridContainer"));
        }

        // Prevent drop target if we are not in edit mode, if the widgets contain a card inside or if the cell is empty (in this case an Illustrated Message will be shown in the future)
        if (!this.getEditMode() ||!this.getTileMode() || oGridContainer.getItems().length === 0) {
            oGridContainer.removeAllDragDropConfig();
        } else if (oGridContainer.getDragDropConfig().length === 0) {
            oGridContainer
                .addDragDropConfig(new DragInfo({
                    sourceAggregation: "items"
                }))
                .addDragDropConfig(new GridDropInfo({
                    targetAggregation: "items",
                    dropIndicatorSize: function (oDraggedControl) {
                        var iColumns = 2;
                        if (oDraggedControl.getLayoutData() && oDraggedControl.getLayoutData().getColumns()) {
                            iColumns = oDraggedControl.getLayoutData().getColumns();
                        }
                        return {
                            rows: 1,
                            columns: iColumns
                        };
                    },
                    dropPosition: DropPosition.Between,
                    dropLayout: DropLayout.Horizontal,
                    drop: this.onDrop.bind(this)
                }));
        }

        return oGridContainer
            .setInlineBlockLayout(true)
            .setSnapToRow(false)
            .setLayoutXL(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeXL(),
                rowSize: this.getGridContainerRowSizeXL(),
                gap: this.getGridContainerGapXL()
            }))
            .setLayoutL(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeL(),
                rowSize: this.getGridContainerRowSizeL(),
                gap: this.getGridContainerGapL()
            }))
            .setLayoutM(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeM(),
                rowSize: this.getGridContainerRowSizeM(),
                gap: this.getGridContainerGapM()
            }))
            .setLayoutS(new GridContainerSettings({
                columnSize: this.getGridContainerRowSizeS(),
                rowSize: this.getGridContainerRowSizeS(),
                gap: this.getGridContainerGapS()
            }))
            .setLayout(new GridContainerSettings({
                columnSize: this.getGridContainerRowSize(),
                rowSize: this.getGridContainerRowSize(),
                gap: this.getGridContainerGap()
            }));
    };

    /**
     * Creates a new GridContainer and saves it to the aggregation.
     * If it already exists, returns the existing instance.
     *
     * @return {sap.f.GridContainer} The GridContainer control instance.
     * @private
     */
    WorkPageCell.prototype._createGridContainer = function () {
        return new GridContainer(this.getId() + "--sapCepWorkPageCellGridContainer", {
            containerQuery: false,
            minHeight: "0",
            borderReached: this.onBorderReached.bind(this)
        });
    };

    /**
     * Called when the border of a GridContainer is reached using keyboard navigation
     *
     * @param {sap.base.Event} oEvent The original Event of the GridContainer
     */
    WorkPageCell.prototype.onBorderReached = function (oEvent) {
        this.fireEvent("gridContainerBorderReached", oEvent.getParameters());
    };

    /**
     * Called when a viz is dropped into the cell.
     * @param {sap.f.dnd.GridDropInfo} oEvent The GridDropInfo
     */
    WorkPageCell.prototype.onDrop = function (oEvent) {
        this.fireEvent("moveVisualization", oEvent.getParameters());
    };

    /**
     * Checks if the private aggregation "_emptyIllustration" exists.
     * If not, the control is created and stored in the aggregation.
     *
     * @return {sap.m.IllustratedMessage} The IllustratedMessage control.
     */
    WorkPageCell.prototype.getIllustratedMessage = function () {
        if (!this.getAggregation("_emptyIllustration")) {
            this.setAggregation("_emptyIllustration", this._createIllustratedMessage());
        }
        return this.getAggregation("_emptyIllustration");
    };

    /**
     * Creates an IllustratedMessage control.
     * This control is displayed if the WorkPageCell is empty.
     *
     * @return {sap.m.IllustratedMessage} The IllustratedMessage control.
     * @private
     */
    WorkPageCell.prototype._createIllustratedMessage = function () {
        return new IllustratedMessage({
            illustrationType: IllustratedMessageType.NoColumnsSet,
            illustrationSize: IllustratedMessageSize.Spot,
            title: this.getEmptyIllustrationTitle(),
            description: this.getEmptyIllustrationMessage(),
            visible: "{/editMode}"
        });
    };

    /**
     * Called when the control or any child element of the control gains focus.
     * Adds focused class to control.
     */
    WorkPageCell.prototype.onfocusin = function () {
        if (!this.hasStyleClass("sapCepWorkPageCellFocused")) {
            this.addStyleClass("sapCepWorkPageCellFocused");
        }
    };

    /**
     * Called when focus leaves the control and any child element of the control.
     * Removes focused class from control.
     */
    WorkPageCell.prototype.onfocusout = function () {
        if (this.hasStyleClass("sapCepWorkPageCellFocused")) {
            this.removeStyleClass("sapCepWorkPageCellFocused");
        }
    };

    return WorkPageCell;
});
