// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Controller for the NavigationBarMenu Popover. It is responsible for Popover handling, model binding, persistence
 * logic to pin, unpin and rearrange pinned spaces as well as executing navigation.
 *
 * @version 1.115.1
 * @private
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ushell/utils/WindowUtils"
], function (
    Controller,
    Fragment,
    Filter,
    FilterOperator,
    Sorter,
    WindowUtils
) {
    "use strict";

    /**
     * Controller of the NavigationBarMenu view.
     * It is responsible for the popover handling, pinning / unpinning spaces, rearranging spaces via DnD and do persistence of these changes.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameter
     *
     * @class
     * @extends sap.ui.core.mvc.Controller
     *
     * @private
     * @since 1.114.0
     * @alias sap.ushell.components.shell.NavigationBarMenu.controller.NavigationBarMenu
     */
    return Controller.extend("sap.ushell.components.shell.NavigationBarMenu.controller.NavigationBarMenu", {
        /**
         * Initializes the controller. ResourceBundle and Menu service promise are set.
         *
         * @private
         * @since 1.114.0
         */
        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.pMenuServicePromise = sap.ushell.Container.getServiceAsync("Menu");
        },

        /**
         * Updates the the title of the pinned spaces tree to show the current number of spaces pinned.
         * @param {sap.ui.base.Event} oEvent Update Event from the Pinned Spaces Tree
         *
         * @since 1.114.0
         * @private
         */
        _onPinnedSpacesUpdateFinished: function (oEvent) {
            this.byId("PinnedSpacesTreeTitle").setText(this.oResourceBundle.getText("NavigationBarMenu.PinnedSpaces.Title", [oEvent.getParameter("total") || 0]));
        },

        /**
         * Opens the Navigation Bar Menu Popover. Sets the menu model from the menu bar to the popover.
         * @param {sap.ui.base.Event} oEvent Press Event of the Button to open the Popover.
         *
         * @since 1.114.0
         * @private
         */
        openNavigationBarMenuPopover: function (oEvent) {
            var oNavigationBarMenuButton = oEvent.getSource();
            if (!this._pPopoverPromise) {
                this._pPopoverPromise = Fragment.load({
                    type: "XML",
                    id: this.getView().getId(),
                    controller: this,
                    name: "sap.ushell.components.shell.NavigationBarMenu.view.NavigationBarMenuPopover"
                }).then(function (oNavigationBarMenuPopover) {
                    this.oModel = this.getOwnerComponent().oPropagatedProperties.oModels.menu;
                    oNavigationBarMenuPopover.setModel(this.oModel, "spaces");
                    this.getView().addDependent(oNavigationBarMenuPopover);
                    return oNavigationBarMenuPopover;
                }.bind(this));
            }
            this._pPopoverPromise.then(function (oNavigationBarMenuPopover) {
                this._bindPinnedSpaces();
                oNavigationBarMenuPopover.openBy(oNavigationBarMenuButton);
            }.bind(this));
        },

        /**
         * Closes the navigation bar menu popover.
         *
         * @since 1.114.0
         * @private
         */
        closeNavigationBarMenuPopover: function () {
            this._pPopoverPromise.then(function (oPopover) {
                oPopover.close();
            });
        },

        /**
         * Handles the click Event of the Pin Button. If the Space is pinned it will be unpinned and vice versa.
         * @param {sap.ui.base.Event} oEvent Klick Event of the List Item Pin
         *
         * @since 1.114.0
         * @private
         */
        handlePinButtonPress: function (oEvent) {
            var sSpacePath = oEvent.getSource().getBindingContext("spaces").getPath();
            var isPinned = this.oModel.getProperty(sSpacePath + "/pinned");
            if (!isPinned) {
                this._pinSpace(sSpacePath);
            } else {
                this._unpinSpace(sSpacePath, true);
            }
        },

        /**
         * Unpins all pinnes Spaces.
         *
         * @since 1.114.0
         * @private
         */
        unpinAllSpaces: function () {
            var oPinnedSpaces = this.byId("PinnedSpaces");
            var aSpacesToUnpin = oPinnedSpaces.getItems();
            oPinnedSpaces.unbindItems();
            aSpacesToUnpin.forEach(function (oSpaceToUnpin) {
                this._unpinSpace(oSpaceToUnpin.getBindingContextPath("spaces"), false);
            }.bind(this));
            this._savePinnedSpaces();
            this._bindPinnedSpaces();
        },

        /**
         * Rearranges the pinned spaces by using the Menu service.
         *
         * @param {sap.ui.base.Event} oEvent Drop Event to rearrange the pinned spaces
         *
         * @since 1.115.0
         * @private
         */
        rearrangePinnedSpaces: function (oEvent) {
            var oDraggedSpaceContext = oEvent.getParameter("draggedControl").getBindingContext("spaces");
            var iSourcePinnedSortOrder = this.oModel.getProperty(oDraggedSpaceContext.getPath()).pinnedSortOrder;
            var oDroppedSpaceContext = oEvent.getParameter("droppedControl").getBindingContext("spaces");
            var iDroppedPinnedSortOrder = this.oModel.getProperty(oDroppedSpaceContext.getPath()).pinnedSortOrder;
            var sDropPosition = oEvent.getParameter("dropPosition");
            var iTargetPinnedSortOrder = iDroppedPinnedSortOrder + (sDropPosition === "After" ? 1 : 0);

            this.pMenuServicePromise.then(function (oMenu) {
                oMenu.moveMenuEntry(iSourcePinnedSortOrder, iTargetPinnedSortOrder);
                this._savePinnedSpaces();
            }.bind(this));
        },

        /**
         * Binds the pinned spaces to the Tree for pinned spaces.
         *
         * @since 1.114.0
         * @private
         */
        _bindPinnedSpaces: function () {
            var oPinnedSpaces = this.byId("PinnedSpaces");
            Fragment.load({
                type: "XML",
                async: true,
                controller: this,
                name: "sap.ushell.components.shell.NavigationBarMenu.view.CustomTreeItem"
            }).then(function (oCustomTreeItem) {
                oPinnedSpaces.bindItems({
                    path: "spaces>/",
                    filters: [
                        new Filter({ path: "pinned", operator: FilterOperator.EQ, value1: true }),
                        new Filter({ path: "type", operator: FilterOperator.NE, value1: "separator" }),
                        new Filter({ path: "isHomeEntry", operator: FilterOperator.EQ, value1: false })],
                    sorter: [new Sorter({ path: "pinnedSortOrder", descending: false })],
                    parameters: {
                        arrayNames: ["menuEntries"]
                    },
                    template: oCustomTreeItem,
                    templateShareable: false
                });
            });
        },

        /**
         * Creates a CustomTreeItem that only shows its expander and is navigateable if the space has more than one pages.
         * @param {string} sId The id of the instantiating source.
         * @param {object} oContext of the instantiating source.
         * @returns {sap.m.CustomTreeItem} A CustomTreeItem that only shows the expander and is navigateable if more than one pages exist inside of the given space,
         *
         * @since 1.114.0
         * @private
         */
        allSpacesFactory: function (sId, oContext) {
            var oContextModel = oContext.getModel().getProperty(oContext.sPath);
            var oSpaceItem = this.byId("AllSpaces").getDependents()[0].clone(sId);
            var aMenuEntries = oContext.getModel().getProperty(oContext.sPath).menuEntries || [];
            oSpaceItem.setType("Active");
            oSpaceItem.attachPress(this.onMenuItemSelection, this);
            // If the space has only one page, this means no sub menu:
            // Hide expander & enable navigation
            if (aMenuEntries.length < 1) {
                oSpaceItem.addStyleClass("sapMTreeItemBaseLeaf");
            }

            if (oContextModel.type === "separator" || oContextModel.isHomeEntry) {
                oSpaceItem.setVisible(false);
            }

            return oSpaceItem;
        },

        /**
         * Unpins a single Space.
         * @param {string} sSpacePath Path of the space in the model
         * @param {boolean} bSaveUnpinning Shall the unpinning of a given space be saved to the personalization?
         *
         * @since 1.114.0
         * @private
         */
        _unpinSpace: function (sSpacePath, bSaveUnpinning) {
            var oNavigationBarMenuPopover = this.byId("NavigationBarMenuPopover");
            oNavigationBarMenuPopover.focus();
            this.oModel.setProperty(sSpacePath + "/pinned", false);
            this.oModel.setProperty(sSpacePath + "/pinnedSortOrder", "-1");
            if (bSaveUnpinning) {
                this._savePinnedSpaces();
            }
        },

        /**
         * Pins a single Space. The pinnedSortOrder is set by taking the pinnedSortOrder of the last tree item and raising it by 1.
         * @param {string} sSpacePath Path of the space in the model
         *
         * @since 1.114.0
         * @private
         */
        _pinSpace: function (sSpacePath) {
            var iNumberOfPinnedSpaces = this.byId("PinnedSpaces").getItems().length;
            // Since the MyHome and separator are part of the model (pinnedSortOrder 0 and 1), the 1st new pinned space starts with 2.
            var iNewPinnedSortOrder = 2;
            if (iNumberOfPinnedSpaces > 0) {
                var oLastPinnedSpace = this.byId("PinnedSpaces").getItems()[iNumberOfPinnedSpaces - 1];
                var sLastPinnedSpacePath = oLastPinnedSpace.getBindingContextPath("spaces");
                iNewPinnedSortOrder = this.oModel.getProperty(sLastPinnedSpacePath + "/pinnedSortOrder") + 1;
            }
            this.oModel.setProperty(sSpacePath + "/pinnedSortOrder", iNewPinnedSortOrder);
            this.oModel.setProperty(sSpacePath + "/pinned", true);
            this._savePinnedSpaces();
        },

        /**
         * Performs a Cross Application Navigation to the provided intent using the
         * CrossApplicationNavigation service.
         *
         * @param {object} oDestinationTarget
         *  The destination target which is used for the Cross Application Navigation
         *
         * @returns {Promise}
         *  A promise which is resolved after the CrossAppNavigation is performed
         *
         * @private
         * @since 1.114.0
         */
        _performCrossApplicationNavigation: function (oDestinationTarget) {
            return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation")
                .then(function (oCANService) {
                    var oParams = {};
                    oDestinationTarget.parameters.forEach(function (oParameter) {
                        if (oParameter.name && oParameter.value) {
                            oParams[oParameter.name] = [oParameter.value];
                        }
                    });

                    return oCANService.toExternal({
                        target: {
                            semanticObject: oDestinationTarget.semanticObject,
                            action: oDestinationTarget.action
                        },
                        params: oParams
                    });
                });
        },

        /**
          * Opens the provided URL in a new browser tab.
          *
          * @param {object} oDestinationTarget
          *  The destination target which is used to determine the URL which should be
          *  opened in a new browser tab
          *
          * @private
          * @since 1.114.0
          */
        _openURL: function (oDestinationTarget) {
            WindowUtils.openURL(oDestinationTarget.url, "_blank");
        },

        /**
         * Determines the selected menu entry with the required navigation action
         * according to the navigation type.
         *
         * @param {sap.ui.base.Event} oEvent The event containing the selected menu intent
         *
         * @private
         * @since 1.114.0
         */
        onMenuItemSelection: function (oEvent) {

            // Access menu entry
            var allSpaces = oEvent.getSource().getParent();
            var oListItem = oEvent.getSource();
            var oItemContextPath = oListItem.getBindingContextPath("spaces");
            var oListItemModelEntry = this.oModel.getProperty(oItemContextPath);
            var bAmIAllSpacesItem = oEvent.getParameter("id").includes("AllSpaces");
            if (!bAmIAllSpacesItem) {
                return;
            }
            if (!oListItem.isLeaf()) {
                if (oListItem.getExpanded()) {
                    allSpaces.collapse(allSpaces.indexOfItem(oListItem));
                } else {
                    allSpaces.expand(allSpaces.indexOfItem(oListItem));
                }
            } else {
                // Intent based navigation
                if (oListItemModelEntry.type === "IBN") {
                    this._performCrossApplicationNavigation(oListItemModelEntry.target)
                        .then(this.closeNavigationBarMenuPopover.bind(this));
                }

                // URL
                if (oListItemModelEntry.type === "URL") {
                    this._openURL(oListItemModelEntry.target);
                    this.closeNavigationBarMenuPopover();
                }
                return;
            }
            this._savePinnedSpaces();
        },

        /**
         * Saves the pinning, unpinning and rearranging changes to the personalization by using the Menu Service.
         *
         * @since 1.114.0
         * @private
         */
        _savePinnedSpaces: function () {
            this.pMenuServicePromise.then(function (oMenu) {
                this.oModel.refresh(true);
                return oMenu.savePersonalization();
            }.bind(this));
        }
    });
});
