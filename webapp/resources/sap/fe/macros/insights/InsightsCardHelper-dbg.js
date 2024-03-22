/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/navigation/SelectionVariant", "sap/insights/CardHelper", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/mdc/p13n/StateUtil", "sap/ui/VersionInfo"], function (Log, CommonUtils, ResourceModelHelper, SelectionVariant, CardHelper, MessageBox, Core, StateUtil, VersionInfo) {
  "use strict";

  var _exports = {};
  let IntegrationCardType;
  (function (IntegrationCardType) {
    IntegrationCardType["table"] = "Table";
    IntegrationCardType["analytical"] = "Analytical";
  })(IntegrationCardType || (IntegrationCardType = {}));
  _exports.IntegrationCardType = IntegrationCardType;
  const MAX_TABLE_RECORDS = 15;
  const tableContentTopQuery = `$top=${MAX_TABLE_RECORDS}`;

  /**
   * Constructs an array of columns in the format expected by the insights card.
   *
   * @param selectedColumns
   * @returns The card columns that are to be displayed on the insights card.
   */
  function getColumnsToShow(selectedColumns) {
    const cardColumns = [];
    selectedColumns.forEach(function (column) {
      cardColumns.push({
        title: column.label,
        value: column.name,
        visible: column.visible
      });
    });
    return cardColumns;
  }

  /**
   * Constructs the card content for the insights card.
   * Includes the configuration of a navigation action and the creation of bindings to read the data from the response of the back end.
   *
   * @param insightsParams
   * @returns The card content for the insights card.
   */
  function getCardContent(insightsParams) {
    const columns = getColumnsToShow(insightsParams.content.insightsRelevantColumns);
    const cardContent = {
      data: {
        path: "/response/value"
      },
      maxItems: 15,
      row: {
        columns: columns,
        actions: [{
          type: "Navigation",
          parameters: "{= extension.formatters.getNavigationContext(${parameters>/state/value}, ${})}"
        }]
      }
    };
    if (insightsParams.requestParameters.groupBy) {
      const groupConditionName = insightsParams.requestParameters.groupBy.property;
      const groupDescending = insightsParams.requestParameters.groupBy.descending;
      cardContent.group = {
        title: "{" + groupConditionName + "}",
        order: {
          path: groupConditionName,
          dir: groupDescending === true ? "DESC" : "ASC"
        }
      };
    }
    return cardContent;
  }

  /**
   * Creates the chart card content for the insights card.
   *
   * @param insightsParams
   * @returns The chart card content
   */
  function getChartCardContent(insightsParams) {
    return {
      chartType: insightsParams.content.chartType,
      chartProperties: insightsParams.content.chartProperties,
      data: {
        path: "/response/value"
      },
      dimensions: insightsParams.content.dimensions,
      measures: insightsParams.content.measures,
      feeds: insightsParams.content.feeds,
      actions: [{
        type: "Navigation",
        parameters: "{= extension.formatters.getNavigationContext(${parameters>/state/value}, ${})}"
      }],
      actionableArea: "Chart"
    };
  }

  /**
   * Constructs the request object to fetch data for the insights card.
   *
   * @param insightsParams
   * @returns The request data for the insights card.
   */
  function getCardData(insightsParams) {
    let queryUrl = insightsParams.requestParameters.queryUrl;
    // fetch only the first 15 records
    queryUrl = insightsParams.type === IntegrationCardType.table ? `${queryUrl}&${tableContentTopQuery}` : queryUrl;
    return {
      request: {
        url: "{{destinations.service}}" + insightsParams.requestParameters.serviceUrl + "$batch",
        method: "POST",
        headers: {
          "X-CSRF-Token": "{{csrfTokens.token1}}"
        },
        batch: {
          response: {
            method: "GET",
            url: queryUrl,
            headers: {
              Accept: "application/json"
            }
          }
        }
      }
    };
  }

  /**
   * Constructs the card header for the insights card.
   * Includes the status to be shown and the navigation action to be configured on the insights card.
   *
   * @param insightsParams
   * @returns The card header
   */
  function getCardHeader(insightsParams) {
    const cardHeader = {
      title: insightsParams.content.cardTitle,
      actions: [{
        type: "Navigation",
        parameters: "{= extension.formatters.getNavigationContext(${parameters>/state/value})}"
      }]
    };
    if (insightsParams.type === IntegrationCardType.table) {
      cardHeader.status = {
        text: "{/response/@odata.count}" // number of records on LR received as part of the request
      };
    }

    return cardHeader;
  }

  /**
   * Construct the action object that is required by the insights card.
   * This is used to configure the navigation from the card to the source application.
   *
   * @param appComponent
   * @returns The action object
   */
  function getActionObject(appComponent) {
    const shellServiceHelper = appComponent.getShellServices();
    const hash = shellServiceHelper.getHash();
    const parsedHash = shellServiceHelper.parseShellHash(hash);
    const navigationService = appComponent.getNavigationService();
    const actionParams = {
      parameters: {
        ibnTarget: {
          semanticObject: parsedHash.semanticObject,
          action: parsedHash.action
        },
        ibnParams: {
          sensitiveProps: [],
          nhHybridIAppStateKey: navigationService.getIAppStateKey()
        }
      }
    };
    return JSON.stringify(actionParams);
  }

  /**
   * Construct the card configuration parameters required by the insights card.
   * This includes filters, parameters, sensitive properties and the action object for the navigation.
   *
   * @param filters The record of filters
   * @param appComponent Application component
   * @param entitySetPath Entity set path
   * @returns The card configuration parameters
   */
  async function getCardConfigParameters(filterbarID, appComponent, entitySetPath) {
    const cardConfigParams = {
      state: {
        value: getActionObject(appComponent)
      },
      _relevantODataFilters: {
        value: []
      },
      _relevantODataParameters: {
        value: []
      },
      _mandatoryODataFilters: {
        value: []
      },
      _mandatoryODataParameters: {
        value: []
      },
      sensitiveProps: [],
      _entitySet: {
        value: entitySetPath
      }
    };
    const filterBarState = filterbarID ? await StateUtil.retrieveExternalState(Core.byId(filterbarID)) : undefined;
    const filters = filterBarState === null || filterBarState === void 0 ? void 0 : filterBarState.filter;
    if (filters !== undefined) {
      for (const filterProp of Object.keys(filters)) {
        let filterPropSV = new SelectionVariant();
        const newFilterObject = {
          filterConditions: {
            [filterProp]: filters[filterProp]
          }
        };
        filterPropSV = CommonUtils.addExternalStateFiltersToSelectionVariant(filterPropSV, newFilterObject, Core.byId(filterbarID), undefined);
        if (filterPropSV.getSelectOptionsPropertyNames().length) {
          // add to insights only if filters exist
          const reconstructedSV = {
            id: filterPropSV.getID(),
            Parameters: [],
            SelectOptions: [{
              PropertyName: filterProp,
              Ranges: filterPropSV.getSelectOption(filterProp)
            }]
          };
          cardConfigParams[filterProp] = {
            value: JSON.stringify(reconstructedSV),
            type: "string"
          };
          cardConfigParams._relevantODataFilters.value.push(filterProp);
        }
      }
    }
    return cardConfigParams;
  }

  /**
   * Construct the card configuration for the insights card.
   *
   * @param insightsParams
   * @returns The card configuration for the insights card.
   */
  async function getCardConfig(insightsParams) {
    const cardConfiguration = {};
    const serviceUrl = insightsParams.requestParameters.serviceUrl;
    cardConfiguration.destinations = {
      service: {
        name: "(default)",
        defaultUrl: "/"
      }
    };
    cardConfiguration.csrfTokens = {
      token1: {
        data: {
          request: {
            url: serviceUrl,
            method: "HEAD",
            headers: {
              "X-CSRF-Token": "Fetch"
            }
          }
        }
      }
    };
    const filterbarID = insightsParams.parameters.filterbarID;
    const cardConfigParams = await getCardConfigParameters(filterbarID, insightsParams.appComponent, insightsParams.entitySetPath);
    cardConfiguration.parameters = cardConfigParams;
    return cardConfiguration;
  }

  /**
   * Construct the manifest entry for sap.card namespace of the insights card.
   *
   * @param insightsParams
   * @returns The card manifest entry for the sap.card namespace
   */
  async function getIntegrationCardManifest(insightsParams) {
    const cardConfig = {
      type: insightsParams.type
    };
    cardConfig.configuration = await getCardConfig(insightsParams);
    cardConfig.header = getCardHeader(insightsParams);
    cardConfig.data = getCardData(insightsParams);
    if (insightsParams.type === IntegrationCardType.analytical) {
      cardConfig.content = getChartCardContent(insightsParams);
    } else {
      cardConfig.content = getCardContent(insightsParams);
    }
    cardConfig.extension = "module:sap/insights/CardExtension";
    return cardConfig;
  }

  /**
   * Construct the manifest entry for sap.insights namespace of the insights card.
   *
   * @param insightsParams
   * @returns The card manifest entry for the sap.insights namespace
   */
  async function getManifestSapInsights(insightsParams) {
    const ui5Version = await VersionInfo.load();
    const manifestParams = {
      parentAppId: insightsParams.parentAppId,
      cardType: "RT",
      versions: {
        ui5: ui5Version.version + "-" + ui5Version.buildTimestamp
      },
      filterEntitySet: insightsParams.entitySetPath
    };
    if (insightsParams.type === IntegrationCardType.analytical) {
      manifestParams.allowedChartTypes = insightsParams.content.allowedChartTypes;
    }
    return manifestParams;
  }
  /**
   * Creates the card manifest for the insights card.
   *
   * @param insightsParams
   * @returns The insights card
   */
  async function createCardManifest(insightsParams) {
    const appComponent = insightsParams.appComponent,
      appManifest = {
        ...appComponent.getManifestEntry("sap.app")
      },
      ui5Manifest = {
        ...appComponent.getManifestEntry("sap.ui5")
      };
    const defaultModel = ui5Manifest.models[""];
    const dataSourceService = defaultModel.dataSource ? defaultModel.dataSource : "";
    const insightsCardManifest = {};
    const sapAppId = `user.${appManifest.id}.${Date.now()}`;
    appManifest.id = sapAppId;
    appManifest.type = "card";
    appManifest.dataSources.filterService = {
      ...appManifest.dataSources[dataSourceService]
    };
    insightsCardManifest["sap.app"] = appManifest;
    insightsCardManifest["sap.card"] = await getIntegrationCardManifest(insightsParams);
    insightsCardManifest["sap.insights"] = await getManifestSapInsights(insightsParams);
    return insightsCardManifest;
  }

  /**
   * Create the manifest of the insights card and show a preview of the card that is created.
   *
   * @param insightsParams
   */
  _exports.createCardManifest = createCardManifest;
  async function showInsightsCardPreview(insightsParams) {
    try {
      const cardHelperInstance = await CardHelper.getServiceAsync("UIService");
      const card = await createCardManifest(insightsParams);
      cardHelperInstance.showCardPreview(card, true);
    } catch (e) {
      genericErrorMessageForInsightsCard(insightsParams.appComponent);
      Log.error("Card creation failed");
    }
  }

  /**
   * Display a message box for the scenarios where the insights card cannot be created.
   *
   * @param controlType
   * @param resourceModel
   */
  _exports.showInsightsCardPreview = showInsightsCardPreview;
  function showErrorMessageForInsightsCard(controlType, resourceModel) {
    const headerText = `<strong>
		${resourceModel.getText("M_CARD_POSSIBLE_CAUSES")}
		</strong>`;
    let contentText = "";
    const footerText = `${resourceModel.getText("M_CARD_FOOTER_INFO")}`;
    if (controlType === IntegrationCardType.table) {
      contentText = `<ul><li>
			${resourceModel.getText("M_CARD_FAILURE_REASON_DATE_RANGE_FILTERS")}
			</li><li>
			${resourceModel.getText("M_CARD_FAILURE_TABLE_REASON_TABLE_LEVEL_FILTERS")}
			</li><li>
			${resourceModel.getText("M_CARD_FAILURE_TABLE_REASON_UNSUPPORTED_COLUMNS")}
			</li></ul>`;
    } else {
      contentText = `<ul><li>
			${resourceModel.getText("M_CARD_FAILURE_REASON_DATE_RANGE_FILTERS")}
			</li><li>
			${resourceModel.getText("M_CARD_FAILURE_CHART_REASON_CHART_LEVEL_FILTERS")}
			</li></ul>`;
    }
    const formattedTextString = headerText + contentText + footerText;
    MessageBox.error(resourceModel.getText("M_CARD_CREATION_FAILURE"), {
      onClose: function () {
        throw new Error("Insights is not supported");
      },
      details: formattedTextString
    });
  }
  _exports.showErrorMessageForInsightsCard = showErrorMessageForInsightsCard;
  function genericErrorMessageForInsightsCard(scope) {
    const resourceModel = ResourceModelHelper.getResourceModel(scope);
    MessageBox.error(resourceModel.getText("M_CARD_FAILURE_GENERIC"));
  }
  _exports.genericErrorMessageForInsightsCard = genericErrorMessageForInsightsCard;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlZ3JhdGlvbkNhcmRUeXBlIiwiTUFYX1RBQkxFX1JFQ09SRFMiLCJ0YWJsZUNvbnRlbnRUb3BRdWVyeSIsImdldENvbHVtbnNUb1Nob3ciLCJzZWxlY3RlZENvbHVtbnMiLCJjYXJkQ29sdW1ucyIsImZvckVhY2giLCJjb2x1bW4iLCJwdXNoIiwidGl0bGUiLCJsYWJlbCIsInZhbHVlIiwibmFtZSIsInZpc2libGUiLCJnZXRDYXJkQ29udGVudCIsImluc2lnaHRzUGFyYW1zIiwiY29sdW1ucyIsImNvbnRlbnQiLCJpbnNpZ2h0c1JlbGV2YW50Q29sdW1ucyIsImNhcmRDb250ZW50IiwiZGF0YSIsInBhdGgiLCJtYXhJdGVtcyIsInJvdyIsImFjdGlvbnMiLCJ0eXBlIiwicGFyYW1ldGVycyIsInJlcXVlc3RQYXJhbWV0ZXJzIiwiZ3JvdXBCeSIsImdyb3VwQ29uZGl0aW9uTmFtZSIsInByb3BlcnR5IiwiZ3JvdXBEZXNjZW5kaW5nIiwiZGVzY2VuZGluZyIsImdyb3VwIiwib3JkZXIiLCJkaXIiLCJnZXRDaGFydENhcmRDb250ZW50IiwiY2hhcnRUeXBlIiwiY2hhcnRQcm9wZXJ0aWVzIiwiZGltZW5zaW9ucyIsIm1lYXN1cmVzIiwiZmVlZHMiLCJhY3Rpb25hYmxlQXJlYSIsImdldENhcmREYXRhIiwicXVlcnlVcmwiLCJ0YWJsZSIsInJlcXVlc3QiLCJ1cmwiLCJzZXJ2aWNlVXJsIiwibWV0aG9kIiwiaGVhZGVycyIsImJhdGNoIiwicmVzcG9uc2UiLCJBY2NlcHQiLCJnZXRDYXJkSGVhZGVyIiwiY2FyZEhlYWRlciIsImNhcmRUaXRsZSIsInN0YXR1cyIsInRleHQiLCJnZXRBY3Rpb25PYmplY3QiLCJhcHBDb21wb25lbnQiLCJzaGVsbFNlcnZpY2VIZWxwZXIiLCJnZXRTaGVsbFNlcnZpY2VzIiwiaGFzaCIsImdldEhhc2giLCJwYXJzZWRIYXNoIiwicGFyc2VTaGVsbEhhc2giLCJuYXZpZ2F0aW9uU2VydmljZSIsImdldE5hdmlnYXRpb25TZXJ2aWNlIiwiYWN0aW9uUGFyYW1zIiwiaWJuVGFyZ2V0Iiwic2VtYW50aWNPYmplY3QiLCJhY3Rpb24iLCJpYm5QYXJhbXMiLCJzZW5zaXRpdmVQcm9wcyIsIm5oSHlicmlkSUFwcFN0YXRlS2V5IiwiZ2V0SUFwcFN0YXRlS2V5IiwiSlNPTiIsInN0cmluZ2lmeSIsImdldENhcmRDb25maWdQYXJhbWV0ZXJzIiwiZmlsdGVyYmFySUQiLCJlbnRpdHlTZXRQYXRoIiwiY2FyZENvbmZpZ1BhcmFtcyIsInN0YXRlIiwiX3JlbGV2YW50T0RhdGFGaWx0ZXJzIiwiX3JlbGV2YW50T0RhdGFQYXJhbWV0ZXJzIiwiX21hbmRhdG9yeU9EYXRhRmlsdGVycyIsIl9tYW5kYXRvcnlPRGF0YVBhcmFtZXRlcnMiLCJfZW50aXR5U2V0IiwiZmlsdGVyQmFyU3RhdGUiLCJTdGF0ZVV0aWwiLCJyZXRyaWV2ZUV4dGVybmFsU3RhdGUiLCJDb3JlIiwiYnlJZCIsInVuZGVmaW5lZCIsImZpbHRlcnMiLCJmaWx0ZXIiLCJmaWx0ZXJQcm9wIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlclByb3BTViIsIlNlbGVjdGlvblZhcmlhbnQiLCJuZXdGaWx0ZXJPYmplY3QiLCJmaWx0ZXJDb25kaXRpb25zIiwiQ29tbW9uVXRpbHMiLCJhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudCIsImdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwibGVuZ3RoIiwicmVjb25zdHJ1Y3RlZFNWIiwiaWQiLCJnZXRJRCIsIlBhcmFtZXRlcnMiLCJTZWxlY3RPcHRpb25zIiwiUHJvcGVydHlOYW1lIiwiUmFuZ2VzIiwiZ2V0U2VsZWN0T3B0aW9uIiwiZ2V0Q2FyZENvbmZpZyIsImNhcmRDb25maWd1cmF0aW9uIiwiZGVzdGluYXRpb25zIiwic2VydmljZSIsImRlZmF1bHRVcmwiLCJjc3JmVG9rZW5zIiwidG9rZW4xIiwiZ2V0SW50ZWdyYXRpb25DYXJkTWFuaWZlc3QiLCJjYXJkQ29uZmlnIiwiY29uZmlndXJhdGlvbiIsImhlYWRlciIsImFuYWx5dGljYWwiLCJleHRlbnNpb24iLCJnZXRNYW5pZmVzdFNhcEluc2lnaHRzIiwidWk1VmVyc2lvbiIsIlZlcnNpb25JbmZvIiwibG9hZCIsIm1hbmlmZXN0UGFyYW1zIiwicGFyZW50QXBwSWQiLCJjYXJkVHlwZSIsInZlcnNpb25zIiwidWk1IiwidmVyc2lvbiIsImJ1aWxkVGltZXN0YW1wIiwiZmlsdGVyRW50aXR5U2V0IiwiYWxsb3dlZENoYXJ0VHlwZXMiLCJjcmVhdGVDYXJkTWFuaWZlc3QiLCJhcHBNYW5pZmVzdCIsImdldE1hbmlmZXN0RW50cnkiLCJ1aTVNYW5pZmVzdCIsImRlZmF1bHRNb2RlbCIsIm1vZGVscyIsImRhdGFTb3VyY2VTZXJ2aWNlIiwiZGF0YVNvdXJjZSIsImluc2lnaHRzQ2FyZE1hbmlmZXN0Iiwic2FwQXBwSWQiLCJEYXRlIiwibm93IiwiZGF0YVNvdXJjZXMiLCJmaWx0ZXJTZXJ2aWNlIiwic2hvd0luc2lnaHRzQ2FyZFByZXZpZXciLCJjYXJkSGVscGVySW5zdGFuY2UiLCJDYXJkSGVscGVyIiwiZ2V0U2VydmljZUFzeW5jIiwiY2FyZCIsInNob3dDYXJkUHJldmlldyIsImUiLCJnZW5lcmljRXJyb3JNZXNzYWdlRm9ySW5zaWdodHNDYXJkIiwiTG9nIiwiZXJyb3IiLCJzaG93RXJyb3JNZXNzYWdlRm9ySW5zaWdodHNDYXJkIiwiY29udHJvbFR5cGUiLCJyZXNvdXJjZU1vZGVsIiwiaGVhZGVyVGV4dCIsImdldFRleHQiLCJjb250ZW50VGV4dCIsImZvb3RlclRleHQiLCJmb3JtYXR0ZWRUZXh0U3RyaW5nIiwiTWVzc2FnZUJveCIsIm9uQ2xvc2UiLCJFcnJvciIsImRldGFpbHMiLCJzY29wZSIsIlJlc291cmNlTW9kZWxIZWxwZXIiLCJnZXRSZXNvdXJjZU1vZGVsIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJJbnNpZ2h0c0NhcmRIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuXG5pbXBvcnQgKiBhcyBSZXNvdXJjZU1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSB7XG5cdEFsbG93ZWRDaGFydFR5cGVzLFxuXHRDYXJkQ29uZmlnUGFyYW1zVHlwZSxcblx0Q2FyZEhlbHBlckluc3RhbmNlVHlwZSxcblx0SW5zaWdodHNDYXJkQ29sdW1uc1R5cGUsXG5cdEluc2lnaHRzQ2FyZE1hbmlmZXN0LFxuXHRJbnNpZ2h0c01hbmlmZXN0VHlwZVxufSBmcm9tIFwic2FwL2luc2lnaHRzL0NhcmRIZWxwZXJcIjtcbmltcG9ydCBDYXJkSGVscGVyIGZyb20gXCJzYXAvaW5zaWdodHMvQ2FyZEhlbHBlclwiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEFjdGlvblBhcmFtc1R5cGUsXG5cdENhcmRDb25maWdUeXBlLFxuXHRDYXJkQ29uZmlndXJhdGlvblR5cGUsXG5cdENhcmRDb250ZW50VHlwZSxcblx0Q2FyZERhdGFUeXBlLFxuXHRDYXJkSGVhZGVyVHlwZSxcblx0Q2hhcnRDYXJkQ29udGVudFR5cGUsXG5cdENoYXJ0UHJvcGVydHlUeXBlLFxuXHREaW1lbnNpb25UeXBlLFxuXHRGZWVkVHlwZSxcblx0SW50ZWdyYXRpb25DYXJkQ29sdW1uc1R5cGUsXG5cdE1lYXN1cmVUeXBlXG59IGZyb20gXCJzYXAvdWkvaW50ZWdyYXRpb24vd2lkZ2V0cy9DYXJkXCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCBTdGF0ZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvcDEzbi9TdGF0ZVV0aWxcIjtcbmltcG9ydCBWZXJzaW9uSW5mbyBmcm9tIFwic2FwL3VpL1ZlcnNpb25JbmZvXCI7XG5pbXBvcnQgdHlwZSB7IFBhcnNlZEhhc2hUeXBlIH0gZnJvbSBcInNhcC91c2hlbGxcIjtcblxuZXhwb3J0IGVudW0gSW50ZWdyYXRpb25DYXJkVHlwZSB7XG5cdHRhYmxlID0gXCJUYWJsZVwiLFxuXHRhbmFseXRpY2FsID0gXCJBbmFseXRpY2FsXCJcbn1cblxuZXhwb3J0IHR5cGUgSW5zaWdodFJlcXVlc3RQYXJhbWV0ZXJzID0ge1xuXHQvLyBhbGwgcGFyYW1ldGVycyByZWxhdGVkIHRvIHJlcXVlc3QgZm9yIHRoZSBkYXRhXG5cdHNlcnZpY2VVcmw6IHN0cmluZztcblx0cXVlcnlVcmw6IHN0cmluZztcblx0Z3JvdXBCeT86IEdyb3VwQnlUeXBlO1xufTtcblxuZXhwb3J0IHR5cGUgR3JvdXBCeVR5cGUgPSB7XG5cdHByb3BlcnR5OiBzdHJpbmc7XG5cdGRlc2NlbmRpbmc/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVDb250ZW50VHlwZSA9IHtcblx0Y2FyZFRpdGxlOiBzdHJpbmc7XG5cdGluc2lnaHRzUmVsZXZhbnRDb2x1bW5zOiBJbnNpZ2h0c0NhcmRDb2x1bW5zVHlwZVtdO1xufTtcblxuZXhwb3J0IHR5cGUgUGFyYW1ldGVyVHlwZSA9IHtcblx0ZmlsdGVyYmFySUQ/OiBzdHJpbmc7IC8vIEZpbHRlcmJhciBJRFxuXHRzZW5zaXRpdmVQcm9wZXJ0aWVzPzogW3N0cmluZ107XG59O1xuXG5leHBvcnQgdHlwZSBDaGFydENvbnRlbnRUeXBlID0ge1xuXHRjYXJkVGl0bGU6IHN0cmluZztcblx0ZGltZW5zaW9uczogRGltZW5zaW9uVHlwZVtdO1xuXHRtZWFzdXJlczogTWVhc3VyZVR5cGVbXTtcblx0ZmVlZHM6IEZlZWRUeXBlW107XG5cdGNoYXJ0VHlwZTogc3RyaW5nO1xuXHRsZWdlbmRWaXNpYmxlOiBib29sZWFuO1xuXHRhbGxvd2VkQ2hhcnRUeXBlczogQWxsb3dlZENoYXJ0VHlwZXNbXTtcblx0Y2hhcnRQcm9wZXJ0aWVzOiBDaGFydFByb3BlcnR5VHlwZTtcbn07XG5cbmV4cG9ydCB0eXBlIEluc2lnaHRzUGFyYW1zVHlwZSA9IHtcblx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQ7XG5cdHR5cGU6IEludGVncmF0aW9uQ2FyZFR5cGU7XG5cdHJlcXVlc3RQYXJhbWV0ZXJzOiBJbnNpZ2h0UmVxdWVzdFBhcmFtZXRlcnM7XG5cdGNvbnRlbnQ6IFRhYmxlQ29udGVudFR5cGUgfCBDaGFydENvbnRlbnRUeXBlO1xuXHRwYXJlbnRBcHBJZDogc3RyaW5nO1xuXHRwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJUeXBlO1xuXHRlbnRpdHlTZXRQYXRoOiBzdHJpbmc7XG59O1xuXG5jb25zdCBNQVhfVEFCTEVfUkVDT1JEUyA9IDE1O1xuY29uc3QgdGFibGVDb250ZW50VG9wUXVlcnkgPSBgJHRvcD0ke01BWF9UQUJMRV9SRUNPUkRTfWA7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhbiBhcnJheSBvZiBjb2x1bW5zIGluIHRoZSBmb3JtYXQgZXhwZWN0ZWQgYnkgdGhlIGluc2lnaHRzIGNhcmQuXG4gKlxuICogQHBhcmFtIHNlbGVjdGVkQ29sdW1uc1xuICogQHJldHVybnMgVGhlIGNhcmQgY29sdW1ucyB0aGF0IGFyZSB0byBiZSBkaXNwbGF5ZWQgb24gdGhlIGluc2lnaHRzIGNhcmQuXG4gKi9cbmZ1bmN0aW9uIGdldENvbHVtbnNUb1Nob3coc2VsZWN0ZWRDb2x1bW5zOiBJbnNpZ2h0c0NhcmRDb2x1bW5zVHlwZVtdKTogSW50ZWdyYXRpb25DYXJkQ29sdW1uc1R5cGVbXSB7XG5cdGNvbnN0IGNhcmRDb2x1bW5zOiBJbnRlZ3JhdGlvbkNhcmRDb2x1bW5zVHlwZVtdID0gW107XG5cdHNlbGVjdGVkQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uIChjb2x1bW46IEluc2lnaHRzQ2FyZENvbHVtbnNUeXBlKSB7XG5cdFx0Y2FyZENvbHVtbnMucHVzaCh7XG5cdFx0XHR0aXRsZTogY29sdW1uLmxhYmVsLFxuXHRcdFx0dmFsdWU6IGNvbHVtbi5uYW1lLFxuXHRcdFx0dmlzaWJsZTogY29sdW1uLnZpc2libGVcblx0XHR9KTtcblx0fSk7XG5cdHJldHVybiBjYXJkQ29sdW1ucztcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIHRoZSBjYXJkIGNvbnRlbnQgZm9yIHRoZSBpbnNpZ2h0cyBjYXJkLlxuICogSW5jbHVkZXMgdGhlIGNvbmZpZ3VyYXRpb24gb2YgYSBuYXZpZ2F0aW9uIGFjdGlvbiBhbmQgdGhlIGNyZWF0aW9uIG9mIGJpbmRpbmdzIHRvIHJlYWQgdGhlIGRhdGEgZnJvbSB0aGUgcmVzcG9uc2Ugb2YgdGhlIGJhY2sgZW5kLlxuICpcbiAqIEBwYXJhbSBpbnNpZ2h0c1BhcmFtc1xuICogQHJldHVybnMgVGhlIGNhcmQgY29udGVudCBmb3IgdGhlIGluc2lnaHRzIGNhcmQuXG4gKi9cbmZ1bmN0aW9uIGdldENhcmRDb250ZW50KGluc2lnaHRzUGFyYW1zOiBJbnNpZ2h0c1BhcmFtc1R5cGUpOiBDYXJkQ29udGVudFR5cGUge1xuXHRjb25zdCBjb2x1bW5zID0gZ2V0Q29sdW1uc1RvU2hvdygoaW5zaWdodHNQYXJhbXMuY29udGVudCBhcyBUYWJsZUNvbnRlbnRUeXBlKS5pbnNpZ2h0c1JlbGV2YW50Q29sdW1ucyk7XG5cdGNvbnN0IGNhcmRDb250ZW50OiBDYXJkQ29udGVudFR5cGUgPSB7XG5cdFx0ZGF0YToge1xuXHRcdFx0cGF0aDogXCIvcmVzcG9uc2UvdmFsdWVcIlxuXHRcdH0sXG5cdFx0bWF4SXRlbXM6IDE1LFxuXHRcdHJvdzoge1xuXHRcdFx0Y29sdW1uczogY29sdW1ucyxcblx0XHRcdGFjdGlvbnM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblwiLFxuXHRcdFx0XHRcdHBhcmFtZXRlcnM6IFwiez0gZXh0ZW5zaW9uLmZvcm1hdHRlcnMuZ2V0TmF2aWdhdGlvbkNvbnRleHQoJHtwYXJhbWV0ZXJzPi9zdGF0ZS92YWx1ZX0sICR7fSl9XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH1cblx0fTtcblx0aWYgKGluc2lnaHRzUGFyYW1zLnJlcXVlc3RQYXJhbWV0ZXJzLmdyb3VwQnkpIHtcblx0XHRjb25zdCBncm91cENvbmRpdGlvbk5hbWUgPSBpbnNpZ2h0c1BhcmFtcy5yZXF1ZXN0UGFyYW1ldGVycy5ncm91cEJ5LnByb3BlcnR5O1xuXHRcdGNvbnN0IGdyb3VwRGVzY2VuZGluZyA9IGluc2lnaHRzUGFyYW1zLnJlcXVlc3RQYXJhbWV0ZXJzLmdyb3VwQnkuZGVzY2VuZGluZztcblx0XHRjYXJkQ29udGVudC5ncm91cCA9IHtcblx0XHRcdHRpdGxlOiBcIntcIiArIGdyb3VwQ29uZGl0aW9uTmFtZSArIFwifVwiLFxuXHRcdFx0b3JkZXI6IHtcblx0XHRcdFx0cGF0aDogZ3JvdXBDb25kaXRpb25OYW1lLFxuXHRcdFx0XHRkaXI6IGdyb3VwRGVzY2VuZGluZyA9PT0gdHJ1ZSA/IFwiREVTQ1wiIDogXCJBU0NcIlxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIGNhcmRDb250ZW50O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGNoYXJ0IGNhcmQgY29udGVudCBmb3IgdGhlIGluc2lnaHRzIGNhcmQuXG4gKlxuICogQHBhcmFtIGluc2lnaHRzUGFyYW1zXG4gKiBAcmV0dXJucyBUaGUgY2hhcnQgY2FyZCBjb250ZW50XG4gKi9cbmZ1bmN0aW9uIGdldENoYXJ0Q2FyZENvbnRlbnQoaW5zaWdodHNQYXJhbXM6IEluc2lnaHRzUGFyYW1zVHlwZSk6IENoYXJ0Q2FyZENvbnRlbnRUeXBlIHtcblx0cmV0dXJuIHtcblx0XHRjaGFydFR5cGU6IChpbnNpZ2h0c1BhcmFtcy5jb250ZW50IGFzIENoYXJ0Q29udGVudFR5cGUpLmNoYXJ0VHlwZSxcblx0XHRjaGFydFByb3BlcnRpZXM6IChpbnNpZ2h0c1BhcmFtcy5jb250ZW50IGFzIENoYXJ0Q29udGVudFR5cGUpLmNoYXJ0UHJvcGVydGllcyBhcyB1bmtub3duIGFzIENoYXJ0UHJvcGVydHlUeXBlLFxuXHRcdGRhdGE6IHsgcGF0aDogXCIvcmVzcG9uc2UvdmFsdWVcIiB9LFxuXHRcdGRpbWVuc2lvbnM6IChpbnNpZ2h0c1BhcmFtcy5jb250ZW50IGFzIENoYXJ0Q29udGVudFR5cGUpLmRpbWVuc2lvbnMsXG5cdFx0bWVhc3VyZXM6IChpbnNpZ2h0c1BhcmFtcy5jb250ZW50IGFzIENoYXJ0Q29udGVudFR5cGUpLm1lYXN1cmVzLFxuXHRcdGZlZWRzOiAoaW5zaWdodHNQYXJhbXMuY29udGVudCBhcyBDaGFydENvbnRlbnRUeXBlKS5mZWVkcyxcblx0XHRhY3Rpb25zOiBbXG5cdFx0XHR7XG5cdFx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblwiLFxuXHRcdFx0XHRwYXJhbWV0ZXJzOiBcIns9IGV4dGVuc2lvbi5mb3JtYXR0ZXJzLmdldE5hdmlnYXRpb25Db250ZXh0KCR7cGFyYW1ldGVycz4vc3RhdGUvdmFsdWV9LCAke30pfVwiXG5cdFx0XHR9XG5cdFx0XSxcblx0XHRhY3Rpb25hYmxlQXJlYTogXCJDaGFydFwiXG5cdH07XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyB0aGUgcmVxdWVzdCBvYmplY3QgdG8gZmV0Y2ggZGF0YSBmb3IgdGhlIGluc2lnaHRzIGNhcmQuXG4gKlxuICogQHBhcmFtIGluc2lnaHRzUGFyYW1zXG4gKiBAcmV0dXJucyBUaGUgcmVxdWVzdCBkYXRhIGZvciB0aGUgaW5zaWdodHMgY2FyZC5cbiAqL1xuZnVuY3Rpb24gZ2V0Q2FyZERhdGEoaW5zaWdodHNQYXJhbXM6IEluc2lnaHRzUGFyYW1zVHlwZSk6IENhcmREYXRhVHlwZSB7XG5cdGxldCBxdWVyeVVybCA9IGluc2lnaHRzUGFyYW1zLnJlcXVlc3RQYXJhbWV0ZXJzLnF1ZXJ5VXJsO1xuXHQvLyBmZXRjaCBvbmx5IHRoZSBmaXJzdCAxNSByZWNvcmRzXG5cdHF1ZXJ5VXJsID0gaW5zaWdodHNQYXJhbXMudHlwZSA9PT0gSW50ZWdyYXRpb25DYXJkVHlwZS50YWJsZSA/IGAke3F1ZXJ5VXJsfSYke3RhYmxlQ29udGVudFRvcFF1ZXJ5fWAgOiBxdWVyeVVybDtcblx0cmV0dXJuIHtcblx0XHRyZXF1ZXN0OiB7XG5cdFx0XHR1cmw6IFwie3tkZXN0aW5hdGlvbnMuc2VydmljZX19XCIgKyBpbnNpZ2h0c1BhcmFtcy5yZXF1ZXN0UGFyYW1ldGVycy5zZXJ2aWNlVXJsICsgXCIkYmF0Y2hcIixcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFwiWC1DU1JGLVRva2VuXCI6IFwie3tjc3JmVG9rZW5zLnRva2VuMX19XCJcblx0XHRcdH0sXG5cdFx0XHRiYXRjaDoge1xuXHRcdFx0XHRyZXNwb25zZToge1xuXHRcdFx0XHRcdG1ldGhvZDogXCJHRVRcIixcblx0XHRcdFx0XHR1cmw6IHF1ZXJ5VXJsLFxuXHRcdFx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0XHRcdEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyB0aGUgY2FyZCBoZWFkZXIgZm9yIHRoZSBpbnNpZ2h0cyBjYXJkLlxuICogSW5jbHVkZXMgdGhlIHN0YXR1cyB0byBiZSBzaG93biBhbmQgdGhlIG5hdmlnYXRpb24gYWN0aW9uIHRvIGJlIGNvbmZpZ3VyZWQgb24gdGhlIGluc2lnaHRzIGNhcmQuXG4gKlxuICogQHBhcmFtIGluc2lnaHRzUGFyYW1zXG4gKiBAcmV0dXJucyBUaGUgY2FyZCBoZWFkZXJcbiAqL1xuZnVuY3Rpb24gZ2V0Q2FyZEhlYWRlcihpbnNpZ2h0c1BhcmFtczogSW5zaWdodHNQYXJhbXNUeXBlKTogQ2FyZEhlYWRlclR5cGUge1xuXHRjb25zdCBjYXJkSGVhZGVyOiBDYXJkSGVhZGVyVHlwZSA9IHtcblx0XHR0aXRsZTogKGluc2lnaHRzUGFyYW1zLmNvbnRlbnQgYXMgVGFibGVDb250ZW50VHlwZSkuY2FyZFRpdGxlLFxuXHRcdGFjdGlvbnM6IFtcblx0XHRcdHtcblx0XHRcdFx0dHlwZTogXCJOYXZpZ2F0aW9uXCIsXG5cdFx0XHRcdHBhcmFtZXRlcnM6IFwiez0gZXh0ZW5zaW9uLmZvcm1hdHRlcnMuZ2V0TmF2aWdhdGlvbkNvbnRleHQoJHtwYXJhbWV0ZXJzPi9zdGF0ZS92YWx1ZX0pfVwiXG5cdFx0XHR9XG5cdFx0XVxuXHR9O1xuXHRpZiAoaW5zaWdodHNQYXJhbXMudHlwZSA9PT0gSW50ZWdyYXRpb25DYXJkVHlwZS50YWJsZSkge1xuXHRcdGNhcmRIZWFkZXIuc3RhdHVzID0ge1xuXHRcdFx0dGV4dDogXCJ7L3Jlc3BvbnNlL0BvZGF0YS5jb3VudH1cIiAvLyBudW1iZXIgb2YgcmVjb3JkcyBvbiBMUiByZWNlaXZlZCBhcyBwYXJ0IG9mIHRoZSByZXF1ZXN0XG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gY2FyZEhlYWRlcjtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgdGhlIGFjdGlvbiBvYmplY3QgdGhhdCBpcyByZXF1aXJlZCBieSB0aGUgaW5zaWdodHMgY2FyZC5cbiAqIFRoaXMgaXMgdXNlZCB0byBjb25maWd1cmUgdGhlIG5hdmlnYXRpb24gZnJvbSB0aGUgY2FyZCB0byB0aGUgc291cmNlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBwYXJhbSBhcHBDb21wb25lbnRcbiAqIEByZXR1cm5zIFRoZSBhY3Rpb24gb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGdldEFjdGlvbk9iamVjdChhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCk6IHN0cmluZyB7XG5cdGNvbnN0IHNoZWxsU2VydmljZUhlbHBlciA9IGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdGNvbnN0IGhhc2ggPSBzaGVsbFNlcnZpY2VIZWxwZXIuZ2V0SGFzaCgpO1xuXHRjb25zdCBwYXJzZWRIYXNoID0gc2hlbGxTZXJ2aWNlSGVscGVyLnBhcnNlU2hlbGxIYXNoKGhhc2gpIGFzIFBhcnNlZEhhc2hUeXBlO1xuXHRjb25zdCBuYXZpZ2F0aW9uU2VydmljZSA9IGFwcENvbXBvbmVudC5nZXROYXZpZ2F0aW9uU2VydmljZSgpO1xuXHRjb25zdCBhY3Rpb25QYXJhbXM6IEFjdGlvblBhcmFtc1R5cGUgPSB7XG5cdFx0cGFyYW1ldGVyczoge1xuXHRcdFx0aWJuVGFyZ2V0OiB7XG5cdFx0XHRcdHNlbWFudGljT2JqZWN0OiBwYXJzZWRIYXNoLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRhY3Rpb246IHBhcnNlZEhhc2guYWN0aW9uXG5cdFx0XHR9LFxuXHRcdFx0aWJuUGFyYW1zOiB7XG5cdFx0XHRcdHNlbnNpdGl2ZVByb3BzOiBbXSxcblx0XHRcdFx0bmhIeWJyaWRJQXBwU3RhdGVLZXk6IG5hdmlnYXRpb25TZXJ2aWNlLmdldElBcHBTdGF0ZUtleSgpXG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoYWN0aW9uUGFyYW1zKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgdGhlIGNhcmQgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzIHJlcXVpcmVkIGJ5IHRoZSBpbnNpZ2h0cyBjYXJkLlxuICogVGhpcyBpbmNsdWRlcyBmaWx0ZXJzLCBwYXJhbWV0ZXJzLCBzZW5zaXRpdmUgcHJvcGVydGllcyBhbmQgdGhlIGFjdGlvbiBvYmplY3QgZm9yIHRoZSBuYXZpZ2F0aW9uLlxuICpcbiAqIEBwYXJhbSBmaWx0ZXJzIFRoZSByZWNvcmQgb2YgZmlsdGVyc1xuICogQHBhcmFtIGFwcENvbXBvbmVudCBBcHBsaWNhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSBlbnRpdHlTZXRQYXRoIEVudGl0eSBzZXQgcGF0aFxuICogQHJldHVybnMgVGhlIGNhcmQgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldENhcmRDb25maWdQYXJhbWV0ZXJzKFxuXHRmaWx0ZXJiYXJJRDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0ZW50aXR5U2V0UGF0aDogc3RyaW5nXG4pOiBQcm9taXNlPENhcmRDb25maWdQYXJhbXNUeXBlPiB7XG5cdGNvbnN0IGNhcmRDb25maWdQYXJhbXM6IENhcmRDb25maWdQYXJhbXNUeXBlID0ge1xuXHRcdHN0YXRlOiB7XG5cdFx0XHR2YWx1ZTogZ2V0QWN0aW9uT2JqZWN0KGFwcENvbXBvbmVudClcblx0XHR9LFxuXHRcdF9yZWxldmFudE9EYXRhRmlsdGVyczoge1xuXHRcdFx0dmFsdWU6IFtdIGFzIHN0cmluZ1tdXG5cdFx0fSxcblx0XHRfcmVsZXZhbnRPRGF0YVBhcmFtZXRlcnM6IHtcblx0XHRcdHZhbHVlOiBbXSBhcyBzdHJpbmdbXVxuXHRcdH0sXG5cdFx0X21hbmRhdG9yeU9EYXRhRmlsdGVyczoge1xuXHRcdFx0dmFsdWU6IFtdIGFzIHN0cmluZ1tdXG5cdFx0fSxcblx0XHRfbWFuZGF0b3J5T0RhdGFQYXJhbWV0ZXJzOiB7XG5cdFx0XHR2YWx1ZTogW10gYXMgc3RyaW5nW11cblx0XHR9LFxuXHRcdHNlbnNpdGl2ZVByb3BzOiBbXSBhcyBzdHJpbmdbXSxcblx0XHRfZW50aXR5U2V0OiB7XG5cdFx0XHR2YWx1ZTogZW50aXR5U2V0UGF0aFxuXHRcdH1cblx0fTtcblxuXHRjb25zdCBmaWx0ZXJCYXJTdGF0ZSA9IGZpbHRlcmJhcklEXG5cdFx0PyAoKGF3YWl0IFN0YXRlVXRpbC5yZXRyaWV2ZUV4dGVybmFsU3RhdGUoQ29yZS5ieUlkKGZpbHRlcmJhcklEKSBhcyBGaWx0ZXJCYXIpKSBhcyBSZWNvcmQ8c3RyaW5nLCBPYmplY3Q+KVxuXHRcdDogdW5kZWZpbmVkO1xuXHRjb25zdCBmaWx0ZXJzID0gZmlsdGVyQmFyU3RhdGU/LmZpbHRlciBhcyBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25PYmplY3RbXT47XG5cdGlmIChmaWx0ZXJzICE9PSB1bmRlZmluZWQpIHtcblx0XHRmb3IgKGNvbnN0IGZpbHRlclByb3Agb2YgT2JqZWN0LmtleXMoZmlsdGVycykpIHtcblx0XHRcdGxldCBmaWx0ZXJQcm9wU1YgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXHRcdFx0Y29uc3QgbmV3RmlsdGVyT2JqZWN0ID0ge1xuXHRcdFx0XHRmaWx0ZXJDb25kaXRpb25zOiB7XG5cdFx0XHRcdFx0W2ZpbHRlclByb3BdOiBmaWx0ZXJzW2ZpbHRlclByb3BdXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRmaWx0ZXJQcm9wU1YgPSBDb21tb25VdGlscy5hZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudChcblx0XHRcdFx0ZmlsdGVyUHJvcFNWLFxuXHRcdFx0XHRuZXdGaWx0ZXJPYmplY3QgYXMgeyBmaWx0ZXJDb25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25PYmplY3RbXT4gfSxcblx0XHRcdFx0Q29yZS5ieUlkKGZpbHRlcmJhcklEKSBhcyBGaWx0ZXJCYXIsXG5cdFx0XHRcdHVuZGVmaW5lZFxuXHRcdFx0KTtcblx0XHRcdGlmIChmaWx0ZXJQcm9wU1YuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKS5sZW5ndGgpIHtcblx0XHRcdFx0Ly8gYWRkIHRvIGluc2lnaHRzIG9ubHkgaWYgZmlsdGVycyBleGlzdFxuXHRcdFx0XHRjb25zdCByZWNvbnN0cnVjdGVkU1YgPSB7XG5cdFx0XHRcdFx0aWQ6IGZpbHRlclByb3BTVi5nZXRJRCgpLFxuXHRcdFx0XHRcdFBhcmFtZXRlcnM6IFtdLFxuXHRcdFx0XHRcdFNlbGVjdE9wdGlvbnM6IFtcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0UHJvcGVydHlOYW1lOiBmaWx0ZXJQcm9wLFxuXHRcdFx0XHRcdFx0XHRSYW5nZXM6IGZpbHRlclByb3BTVi5nZXRTZWxlY3RPcHRpb24oZmlsdGVyUHJvcClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRdXG5cdFx0XHRcdH07XG5cdFx0XHRcdGNhcmRDb25maWdQYXJhbXNbZmlsdGVyUHJvcF0gPSB7XG5cdFx0XHRcdFx0dmFsdWU6IEpTT04uc3RyaW5naWZ5KHJlY29uc3RydWN0ZWRTViksXG5cdFx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0XHR9O1xuXHRcdFx0XHRjYXJkQ29uZmlnUGFyYW1zLl9yZWxldmFudE9EYXRhRmlsdGVycy52YWx1ZS5wdXNoKGZpbHRlclByb3ApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gY2FyZENvbmZpZ1BhcmFtcztcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgdGhlIGNhcmQgY29uZmlndXJhdGlvbiBmb3IgdGhlIGluc2lnaHRzIGNhcmQuXG4gKlxuICogQHBhcmFtIGluc2lnaHRzUGFyYW1zXG4gKiBAcmV0dXJucyBUaGUgY2FyZCBjb25maWd1cmF0aW9uIGZvciB0aGUgaW5zaWdodHMgY2FyZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0Q2FyZENvbmZpZyhpbnNpZ2h0c1BhcmFtczogSW5zaWdodHNQYXJhbXNUeXBlKTogUHJvbWlzZTxDYXJkQ29uZmlndXJhdGlvblR5cGU+IHtcblx0Y29uc3QgY2FyZENvbmZpZ3VyYXRpb246IENhcmRDb25maWd1cmF0aW9uVHlwZSA9IHt9O1xuXHRjb25zdCBzZXJ2aWNlVXJsID0gaW5zaWdodHNQYXJhbXMucmVxdWVzdFBhcmFtZXRlcnMuc2VydmljZVVybDtcblx0Y2FyZENvbmZpZ3VyYXRpb24uZGVzdGluYXRpb25zID0geyBzZXJ2aWNlOiB7IG5hbWU6IFwiKGRlZmF1bHQpXCIsIGRlZmF1bHRVcmw6IFwiL1wiIH0gfTtcblx0Y2FyZENvbmZpZ3VyYXRpb24uY3NyZlRva2VucyA9IHtcblx0XHR0b2tlbjE6IHtcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0cmVxdWVzdDoge1xuXHRcdFx0XHRcdHVybDogc2VydmljZVVybCxcblx0XHRcdFx0XHRtZXRob2Q6IFwiSEVBRFwiLFxuXHRcdFx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0XHRcdFwiWC1DU1JGLVRva2VuXCI6IFwiRmV0Y2hcIlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0Y29uc3QgZmlsdGVyYmFySUQgPSBpbnNpZ2h0c1BhcmFtcy5wYXJhbWV0ZXJzLmZpbHRlcmJhcklEO1xuXHRjb25zdCBjYXJkQ29uZmlnUGFyYW1zID0gYXdhaXQgZ2V0Q2FyZENvbmZpZ1BhcmFtZXRlcnMoZmlsdGVyYmFySUQsIGluc2lnaHRzUGFyYW1zLmFwcENvbXBvbmVudCwgaW5zaWdodHNQYXJhbXMuZW50aXR5U2V0UGF0aCk7XG5cdGNhcmRDb25maWd1cmF0aW9uLnBhcmFtZXRlcnMgPSBjYXJkQ29uZmlnUGFyYW1zO1xuXHRyZXR1cm4gY2FyZENvbmZpZ3VyYXRpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0IHRoZSBtYW5pZmVzdCBlbnRyeSBmb3Igc2FwLmNhcmQgbmFtZXNwYWNlIG9mIHRoZSBpbnNpZ2h0cyBjYXJkLlxuICpcbiAqIEBwYXJhbSBpbnNpZ2h0c1BhcmFtc1xuICogQHJldHVybnMgVGhlIGNhcmQgbWFuaWZlc3QgZW50cnkgZm9yIHRoZSBzYXAuY2FyZCBuYW1lc3BhY2VcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0SW50ZWdyYXRpb25DYXJkTWFuaWZlc3QoaW5zaWdodHNQYXJhbXM6IEluc2lnaHRzUGFyYW1zVHlwZSk6IFByb21pc2U8Q2FyZENvbmZpZ1R5cGU+IHtcblx0Y29uc3QgY2FyZENvbmZpZzogQ2FyZENvbmZpZ1R5cGUgPSB7XG5cdFx0dHlwZTogaW5zaWdodHNQYXJhbXMudHlwZVxuXHR9O1xuXHRjYXJkQ29uZmlnLmNvbmZpZ3VyYXRpb24gPSBhd2FpdCBnZXRDYXJkQ29uZmlnKGluc2lnaHRzUGFyYW1zKTtcblx0Y2FyZENvbmZpZy5oZWFkZXIgPSBnZXRDYXJkSGVhZGVyKGluc2lnaHRzUGFyYW1zKTtcblx0Y2FyZENvbmZpZy5kYXRhID0gZ2V0Q2FyZERhdGEoaW5zaWdodHNQYXJhbXMpO1xuXHRpZiAoaW5zaWdodHNQYXJhbXMudHlwZSA9PT0gSW50ZWdyYXRpb25DYXJkVHlwZS5hbmFseXRpY2FsKSB7XG5cdFx0Y2FyZENvbmZpZy5jb250ZW50ID0gZ2V0Q2hhcnRDYXJkQ29udGVudChpbnNpZ2h0c1BhcmFtcyk7XG5cdH0gZWxzZSB7XG5cdFx0Y2FyZENvbmZpZy5jb250ZW50ID0gZ2V0Q2FyZENvbnRlbnQoaW5zaWdodHNQYXJhbXMpO1xuXHR9XG5cdGNhcmRDb25maWcuZXh0ZW5zaW9uID0gXCJtb2R1bGU6c2FwL2luc2lnaHRzL0NhcmRFeHRlbnNpb25cIjtcblx0cmV0dXJuIGNhcmRDb25maWc7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IHRoZSBtYW5pZmVzdCBlbnRyeSBmb3Igc2FwLmluc2lnaHRzIG5hbWVzcGFjZSBvZiB0aGUgaW5zaWdodHMgY2FyZC5cbiAqXG4gKiBAcGFyYW0gaW5zaWdodHNQYXJhbXNcbiAqIEByZXR1cm5zIFRoZSBjYXJkIG1hbmlmZXN0IGVudHJ5IGZvciB0aGUgc2FwLmluc2lnaHRzIG5hbWVzcGFjZVxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRNYW5pZmVzdFNhcEluc2lnaHRzKGluc2lnaHRzUGFyYW1zOiBJbnNpZ2h0c1BhcmFtc1R5cGUpOiBQcm9taXNlPEluc2lnaHRzTWFuaWZlc3RUeXBlPiB7XG5cdGNvbnN0IHVpNVZlcnNpb24gPSBhd2FpdCBWZXJzaW9uSW5mby5sb2FkKCk7XG5cdGNvbnN0IG1hbmlmZXN0UGFyYW1zOiBJbnNpZ2h0c01hbmlmZXN0VHlwZSA9IHtcblx0XHRwYXJlbnRBcHBJZDogaW5zaWdodHNQYXJhbXMucGFyZW50QXBwSWQsXG5cdFx0Y2FyZFR5cGU6IFwiUlRcIixcblx0XHR2ZXJzaW9uczoge1xuXHRcdFx0dWk1OiB1aTVWZXJzaW9uLnZlcnNpb24gKyBcIi1cIiArIHVpNVZlcnNpb24uYnVpbGRUaW1lc3RhbXBcblx0XHR9LFxuXHRcdGZpbHRlckVudGl0eVNldDogaW5zaWdodHNQYXJhbXMuZW50aXR5U2V0UGF0aFxuXHR9O1xuXHRpZiAoaW5zaWdodHNQYXJhbXMudHlwZSA9PT0gSW50ZWdyYXRpb25DYXJkVHlwZS5hbmFseXRpY2FsKSB7XG5cdFx0bWFuaWZlc3RQYXJhbXMuYWxsb3dlZENoYXJ0VHlwZXMgPSAoaW5zaWdodHNQYXJhbXMuY29udGVudCBhcyBDaGFydENvbnRlbnRUeXBlKS5hbGxvd2VkQ2hhcnRUeXBlcztcblx0fVxuXHRyZXR1cm4gbWFuaWZlc3RQYXJhbXM7XG59XG4vKipcbiAqIENyZWF0ZXMgdGhlIGNhcmQgbWFuaWZlc3QgZm9yIHRoZSBpbnNpZ2h0cyBjYXJkLlxuICpcbiAqIEBwYXJhbSBpbnNpZ2h0c1BhcmFtc1xuICogQHJldHVybnMgVGhlIGluc2lnaHRzIGNhcmRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUNhcmRNYW5pZmVzdChpbnNpZ2h0c1BhcmFtczogSW5zaWdodHNQYXJhbXNUeXBlKTogUHJvbWlzZTxJbnNpZ2h0c0NhcmRNYW5pZmVzdD4ge1xuXHRjb25zdCBhcHBDb21wb25lbnQgPSBpbnNpZ2h0c1BhcmFtcy5hcHBDb21wb25lbnQsXG5cdFx0YXBwTWFuaWZlc3QgPSB7IC4uLmFwcENvbXBvbmVudC5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKSB9LFxuXHRcdHVpNU1hbmlmZXN0ID0geyAuLi5hcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC51aTVcIikgfTtcblx0Y29uc3QgZGVmYXVsdE1vZGVsID0gdWk1TWFuaWZlc3QubW9kZWxzW1wiXCJdO1xuXHRjb25zdCBkYXRhU291cmNlU2VydmljZSA9IGRlZmF1bHRNb2RlbC5kYXRhU291cmNlID8gZGVmYXVsdE1vZGVsLmRhdGFTb3VyY2UgOiBcIlwiO1xuXHRjb25zdCBpbnNpZ2h0c0NhcmRNYW5pZmVzdDogSW5zaWdodHNDYXJkTWFuaWZlc3QgPSB7fTtcblx0Y29uc3Qgc2FwQXBwSWQgPSBgdXNlci4ke2FwcE1hbmlmZXN0LmlkfS4ke0RhdGUubm93KCl9YDtcblx0YXBwTWFuaWZlc3QuaWQgPSBzYXBBcHBJZDtcblx0YXBwTWFuaWZlc3QudHlwZSA9IFwiY2FyZFwiO1xuXHRhcHBNYW5pZmVzdC5kYXRhU291cmNlcy5maWx0ZXJTZXJ2aWNlID0geyAuLi5hcHBNYW5pZmVzdC5kYXRhU291cmNlc1tkYXRhU291cmNlU2VydmljZV0gfTtcblx0aW5zaWdodHNDYXJkTWFuaWZlc3RbXCJzYXAuYXBwXCJdID0gYXBwTWFuaWZlc3Q7XG5cdGluc2lnaHRzQ2FyZE1hbmlmZXN0W1wic2FwLmNhcmRcIl0gPSBhd2FpdCBnZXRJbnRlZ3JhdGlvbkNhcmRNYW5pZmVzdChpbnNpZ2h0c1BhcmFtcyk7XG5cdGluc2lnaHRzQ2FyZE1hbmlmZXN0W1wic2FwLmluc2lnaHRzXCJdID0gYXdhaXQgZ2V0TWFuaWZlc3RTYXBJbnNpZ2h0cyhpbnNpZ2h0c1BhcmFtcyk7XG5cdHJldHVybiBpbnNpZ2h0c0NhcmRNYW5pZmVzdDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIG1hbmlmZXN0IG9mIHRoZSBpbnNpZ2h0cyBjYXJkIGFuZCBzaG93IGEgcHJldmlldyBvZiB0aGUgY2FyZCB0aGF0IGlzIGNyZWF0ZWQuXG4gKlxuICogQHBhcmFtIGluc2lnaHRzUGFyYW1zXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaG93SW5zaWdodHNDYXJkUHJldmlldyhpbnNpZ2h0c1BhcmFtczogSW5zaWdodHNQYXJhbXNUeXBlKSB7XG5cdHRyeSB7XG5cdFx0Y29uc3QgY2FyZEhlbHBlckluc3RhbmNlID0gKGF3YWl0IENhcmRIZWxwZXIuZ2V0U2VydmljZUFzeW5jKFwiVUlTZXJ2aWNlXCIpKSBhcyBDYXJkSGVscGVySW5zdGFuY2VUeXBlO1xuXHRcdGNvbnN0IGNhcmQ6IEluc2lnaHRzQ2FyZE1hbmlmZXN0ID0gYXdhaXQgY3JlYXRlQ2FyZE1hbmlmZXN0KGluc2lnaHRzUGFyYW1zKTtcblx0XHRjYXJkSGVscGVySW5zdGFuY2Uuc2hvd0NhcmRQcmV2aWV3KGNhcmQsIHRydWUpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Z2VuZXJpY0Vycm9yTWVzc2FnZUZvckluc2lnaHRzQ2FyZChpbnNpZ2h0c1BhcmFtcy5hcHBDb21wb25lbnQpO1xuXHRcdExvZy5lcnJvcihcIkNhcmQgY3JlYXRpb24gZmFpbGVkXCIpO1xuXHR9XG59XG5cbi8qKlxuICogRGlzcGxheSBhIG1lc3NhZ2UgYm94IGZvciB0aGUgc2NlbmFyaW9zIHdoZXJlIHRoZSBpbnNpZ2h0cyBjYXJkIGNhbm5vdCBiZSBjcmVhdGVkLlxuICpcbiAqIEBwYXJhbSBjb250cm9sVHlwZVxuICogQHBhcmFtIHJlc291cmNlTW9kZWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvck1lc3NhZ2VGb3JJbnNpZ2h0c0NhcmQoY29udHJvbFR5cGU6IEludGVncmF0aW9uQ2FyZFR5cGUsIHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwpIHtcblx0Y29uc3QgaGVhZGVyVGV4dCA9IGA8c3Ryb25nPlxuXHRcdCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9DQVJEX1BPU1NJQkxFX0NBVVNFU1wiKX1cblx0XHQ8L3N0cm9uZz5gO1xuXHRsZXQgY29udGVudFRleHQgPSBcIlwiO1xuXHRjb25zdCBmb290ZXJUZXh0ID0gYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9DQVJEX0ZPT1RFUl9JTkZPXCIpfWA7XG5cdGlmIChjb250cm9sVHlwZSA9PT0gSW50ZWdyYXRpb25DYXJkVHlwZS50YWJsZSkge1xuXHRcdGNvbnRlbnRUZXh0ID0gYDx1bD48bGk+XG5cdFx0XHQke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fQ0FSRF9GQUlMVVJFX1JFQVNPTl9EQVRFX1JBTkdFX0ZJTFRFUlNcIil9XG5cdFx0XHQ8L2xpPjxsaT5cblx0XHRcdCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9DQVJEX0ZBSUxVUkVfVEFCTEVfUkVBU09OX1RBQkxFX0xFVkVMX0ZJTFRFUlNcIil9XG5cdFx0XHQ8L2xpPjxsaT5cblx0XHRcdCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9DQVJEX0ZBSUxVUkVfVEFCTEVfUkVBU09OX1VOU1VQUE9SVEVEX0NPTFVNTlNcIil9XG5cdFx0XHQ8L2xpPjwvdWw+YDtcblx0fSBlbHNlIHtcblx0XHRjb250ZW50VGV4dCA9IGA8dWw+PGxpPlxuXHRcdFx0JHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0NBUkRfRkFJTFVSRV9SRUFTT05fREFURV9SQU5HRV9GSUxURVJTXCIpfVxuXHRcdFx0PC9saT48bGk+XG5cdFx0XHQke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fQ0FSRF9GQUlMVVJFX0NIQVJUX1JFQVNPTl9DSEFSVF9MRVZFTF9GSUxURVJTXCIpfVxuXHRcdFx0PC9saT48L3VsPmA7XG5cdH1cblx0Y29uc3QgZm9ybWF0dGVkVGV4dFN0cmluZyA9IGhlYWRlclRleHQgKyBjb250ZW50VGV4dCArIGZvb3RlclRleHQ7XG5cdE1lc3NhZ2VCb3guZXJyb3IocmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9DQVJEX0NSRUFUSU9OX0ZBSUxVUkVcIiksIHtcblx0XHRvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnNpZ2h0cyBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuXHRcdH0sXG5cdFx0ZGV0YWlsczogZm9ybWF0dGVkVGV4dFN0cmluZ1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyaWNFcnJvck1lc3NhZ2VGb3JJbnNpZ2h0c0NhcmQoc2NvcGU6IEFwcENvbXBvbmVudCB8IENvbnRyb2wpIHtcblx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IFJlc291cmNlTW9kZWxIZWxwZXIuZ2V0UmVzb3VyY2VNb2RlbChzY29wZSk7XG5cdE1lc3NhZ2VCb3guZXJyb3IocmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9DQVJEX0ZBSUxVUkVfR0VORVJJQ1wiKSk7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O01BdUNZQSxtQkFBbUI7RUFBQSxXQUFuQkEsbUJBQW1CO0lBQW5CQSxtQkFBbUI7SUFBbkJBLG1CQUFtQjtFQUFBLEdBQW5CQSxtQkFBbUIsS0FBbkJBLG1CQUFtQjtFQUFBO0VBZ0QvQixNQUFNQyxpQkFBaUIsR0FBRyxFQUFFO0VBQzVCLE1BQU1DLG9CQUFvQixHQUFJLFFBQU9ELGlCQUFrQixFQUFDOztFQUV4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTRSxnQkFBZ0IsQ0FBQ0MsZUFBMEMsRUFBZ0M7SUFDbkcsTUFBTUMsV0FBeUMsR0FBRyxFQUFFO0lBQ3BERCxlQUFlLENBQUNFLE9BQU8sQ0FBQyxVQUFVQyxNQUErQixFQUFFO01BQ2xFRixXQUFXLENBQUNHLElBQUksQ0FBQztRQUNoQkMsS0FBSyxFQUFFRixNQUFNLENBQUNHLEtBQUs7UUFDbkJDLEtBQUssRUFBRUosTUFBTSxDQUFDSyxJQUFJO1FBQ2xCQyxPQUFPLEVBQUVOLE1BQU0sQ0FBQ007TUFDakIsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBQ0YsT0FBT1IsV0FBVztFQUNuQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNTLGNBQWMsQ0FBQ0MsY0FBa0MsRUFBbUI7SUFDNUUsTUFBTUMsT0FBTyxHQUFHYixnQkFBZ0IsQ0FBRVksY0FBYyxDQUFDRSxPQUFPLENBQXNCQyx1QkFBdUIsQ0FBQztJQUN0RyxNQUFNQyxXQUE0QixHQUFHO01BQ3BDQyxJQUFJLEVBQUU7UUFDTEMsSUFBSSxFQUFFO01BQ1As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