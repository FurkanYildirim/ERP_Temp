/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define("sap/sac/df/FlexAnalysis", [
  "sap/sac/df/types/SystemType",
  "sap/ui/core/Control",
  "sap/base/Log",
  "sap/ui/model/json/JSONModel",
  "jquery.sap.global",
  "sap/sac/df/olap/MultiDimModel",
  "sap/sac/df/firefly/library",
  "sap/sac/df/fa/FlexAnalysisContextMenuProvider"
],
function (SystemType, Control, Log, JSONModel, jQuery, MultiDimModel, FF, FlexAnalysisContextMenuProvider) {
  "use strict";
  var programName = "GalaxyDataStudio";
  var emptyDP = "FA.emptyDP";
  var NO_DS = "FA.NO_DS";
  var EMPTY_STYLE = "empty";


  /**
     * Constructor for a new <code>FlexAnalysis</code>.
     * @public
     * @experimental
     * @class
     * Enables users to view, navigate and change multidimensional data exposed via InA.
     *
     * <h3>Overview</h3>
     *
     * The user can view the data in a Table, navigate in the data via a context menu or builder panels
     * The data source that the FlexAnalysis consumes or renders has to be provided as a property value.
     *
     * @extends sap.ui.core.Control
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @author SAP SE
     * @version 1.115.0
     *
     * @constructor
     * @public
     * @alias sap.sac.df.FlexAnalysis
     **/
  var FA = Control.extend("sap.sac.df.FlexAnalysis", {
    metadata: {
      properties: {
        /**
           * Sets title to be shown in the control. If not set the name of the corresponding back-end query is used
           */
        title: {
          type: "string"
        },
        /**
           * Indicates  Flexible Analysis component should display the component title
           */
        showTitle: {
          type: "boolean", defaultValue: false
        },

        /**
           * Indicates if Flexible Analysis component automatically requests the ResultSet for the shown data source
           */
        autoUpdate: {
          type: "boolean", defaultValue: true
        },
        /**
           * URI of the advanced configuration to be fetched
           */
        configurationURI: {
          type: "string"
        },
        /**
           * JSON object containing the configuration (alternative to configurationURI)
           */
        configObject: {
          type: "object"
        },
        /**
           configuration Id
           */
        configId: {
          type: "string"
        },
        /**
           * Width of the component
           */
        width: {
          type: "sap.ui.core.CSSSize", defaultValue: "100%",
        },
        /**
           * Height of the component
           */
        height: {
          type: "sap.ui.core.CSSSize", defaultValue: "100%",
        },
        /**
           * Sets if the Design Panel of FlexAnalysis is hidden
           */
        hideDesignPanel: {
          type: "boolean", defaultValue: true
        },
        /**
           * Sets if the Style Panel of FlexAnalysis is hidden
           */
        hideStylePanel: {
          type: "boolean", defaultValue: true
        },
        /**
           * Sets if the menu bar of FlexAnalysis is hidden
           */
        hideMenuBar: {
          type: "boolean", defaultValue: true
        },
        /**
           * Sets if the status bar of FlexAnalysis is hidden
           */
        hideStatusBar: {
          type: "boolean", defaultValue: true
        },
        /**
           * Sets if the toolbar of FlexAnalysis is hidden
           */
        hideToolBar: {
          type: "boolean", defaultValue: true
        },
        /**
           * Sets if the filter of FlexAnalysis is hidden
           */
        hideFilterLine: {
          type: "boolean", defaultValue: false
        },
        /**
           * Sets if the side navigation bar of FlexAnalysis is hidden
           */
        hideSideNavigation: {
          type: "boolean", defaultValue: false
        },
        /**
           * Sets if the landing page of FlexAnalysis is hidden
           */
        hideLandingPage: {
          type: "boolean", defaultValue: true
        },

        /**
           * Additional Flag to be passed to the control
           * TODO: Document the possibilities
           */
        environment: {
          type: "string[]",
          defaultValue: [],
        },
        /**
           * System to take data from. If not set or set to "local" current url will be used to determine the system
           */
        systemName: {
          type: "string"
        },
        /**
           * Data source (Query name/ View, InA model etc) to be used to get the data from
           */
        dataSource: {
          type: "string", defaultValue: "$datasource"
        },
        /**
           * Type the system to connect to get data
           *
           */
        systemType: {
          type: "sap.sac.df.types.SystemType", defaultValue: SystemType.BW
        },
        /**
           * Interval to keep the InA session alive. values less than 1 deactivates the keep alive handling
           */
        keepAliveInterval: {
          type: "int",
          defaultValue: 0
        },
        /**
           * Client Identifier to be used for underlying InA queries
           */
        clientIdentifier: {
          type: "string"
        },
        /**
           * Name of the Data Provider from the corresponding MultiDimModel to be used
           */
        dataProvider: {
          type: "any",
          bindable: true
        },
        /**
           * Id of the MultiDimModel to use
           */
        multiDimModelId: {
          type: "string",
          defaultValue: "om"
        },
        /**
           * Indicates if the variable are handled internal handling by FlexAnalysis. If set to false it is done via corresponding MultiDimModel
           */
        implicitVariableHandling: {
          type: "boolean",
          defaultValue: true,
          bindable: false
        },
        /**
           * Indicates if the variable are handled internal handling by FlexAnalysis. If set to false it is done via corresponding MultiDimModel
           */
        styleTemplateName: {
          type: "string"
        }
      },
      events: {},
      aggregations: {
        /**
           * Custom panels for the flexible analysis control
           */
        customPanels: {
          type: "sap.sac.df.FlexAnalysisPanel",
          multiple: true
        }
      },
      defaultAggregation: "customPanels"
    },
    logActive: false,
    init: function () {
      this.programContainerID = this.getId() + "--program";
      this.programContainer = jQuery("<div id=\"" + this.programContainerID + "\"/>");
      this.contextMenuProvider = new FlexAnalysisContextMenuProvider(this);
      this.log("Created");
    },


    renderer: {
      apiVersion: 2,
      render: function (oRm, oControl) {
        if (oControl._error) {
          oRm.openStart("span", oControl.getId() + "-error");
          oRm.openEnd();
          oRm.text(oControl._error.toString());
          oRm.close("span");
        } else {
          oRm.openStart("div", oControl);
          oRm.style("flex", "auto");
          oRm.style("width", oControl.getWidth());
          oRm.style("height", oControl.getHeight());
          oRm.attr("data-sap-ui-preserve", oControl.getId());

          oRm.openEnd();
          oRm.close("div");
        }
      }
    },

    onAfterRendering: function () {
      if (Control.prototype.onAfterRendering) {
        Control.prototype.onAfterRendering.apply(this, arguments); //run the super class's method first
      }

      // attached the div the program is using to the ui5 Controls div
      var ui5Div = this.$();
      this.programContainer.appendTo(ui5Div);
      if (this.closed) {
        ui5Div.css("visibility", "hidden");
      }
      this.log("On after rendering");
      if (!this.isProgramRunning) {
        this.runProgram();
      } else if (this._rerender) {
        this._checkAutoUpdate();
      }
      ui5Div.css("position", "relative");
    },

    updateProgramSettings: function () {
      this.log("Update program settings");
      var application = this.program.getProcess().getApplication();
      application.setClientInfo(null, this.getClientIdentifier(), null);
      this.program.setShowToolbar(!this.getHideToolBar());

      var activeDocument = this.program.getActiveDocument();

      activeDocument.setFilterLineVisible(!this.getHideFilterLine());
      activeDocument.setDesignerPanelVisible(!this.getHideDesignPanel());
      activeDocument.setStylePanelVisible(!this.getHideStylePanel());
      activeDocument.setSideNavigationVisible(!this.getHideSideNavigation());
      this.applyAutoUpdate();
      this.updateStyleTemplate();
      this.updateTitle();
      this._rerender = true;
    },

    registerCustomPanels: function () {
      var aCustomPanels = this.getCustomPanels();
      aCustomPanels.forEach(function (oCustomPanel) {
        this.program.registerCustomPanel(oCustomPanel);
      }.bind(this));
    },

    /**
       * The callback invoked upon UiStateChange of the program
       * @param oUiStateStructure the ui state
       */
    onUiStateChange: function (oUiStateStructure) {
      this.log("UI state changed");
      var oUiState = oUiStateStructure.convertToNative();
      if (oUiState) {
        var vOpenPanelTypes = oUiState[FF.AuGdsQbConstants.QD_UI_STATE_OPEN_PANELS];
        if (vOpenPanelTypes) {
          // Design panel
          var sDesignerPanelName = FF.AuGdsPanelType.DESIGNER.getName();
          var bIsDesignPanelOpen = Object.prototype.hasOwnProperty.call(vOpenPanelTypes, sDesignerPanelName) ? vOpenPanelTypes[sDesignerPanelName] : false;
          this.setProperty("hideDesignPanel", !bIsDesignPanelOpen, true);

          // Style panel
          var sStylePanelName = FF.AuGdsPanelType.STYLE.getName();
          var bIsStylePanelOpen = Object.prototype.hasOwnProperty.call(vOpenPanelTypes, sStylePanelName) ? vOpenPanelTypes[sStylePanelName] : false;
          this.setProperty("hideStylePanel", !bIsStylePanelOpen, true);
        }
        // Update autoUpdate status
        if (Object.prototype.hasOwnProperty.call(oUiState, FF.AuGdsQbConstants.QD_UI_STATE_AUTO_UPDATE)) {
          this.setProperty("autoUpdate", oUiState[FF.AuGdsQbConstants.QD_UI_STATE_AUTO_UPDATE], true);
        }
      }
    },

    /**
       * Registers a callback to the UiStateChange hook on the document
       */
    registerUiStateChange: function () {
      var oActiveDocument = this.program.getActiveDocument();
      if (oActiveDocument && oActiveDocument.addUiStateChangeCallback) {
        oActiveDocument.addUiStateChangeCallback(this.onUiStateChange.bind(this));
      }
    },

    updateTitle: function () {
      if (this.program) {

        var activeDocument = this.program.getActiveDocument();
        if (typeof this.getTitle() == "string") {
          activeDocument.setDocumentTitle(this.getTitle());
        }
        // Move hack into Firefly code
        activeDocument.createQueryDetailsIfNeeded();
        activeDocument.setTableTitleVisible(this.getShowTitle());
      }
    },
    getMultiDimModel: function () {
      var modelId = this.getMultiDimModelId();
      return this.getParent().getModel(modelId);
    },
    runProgram: function () {
      this.log("Run UI5 program");
      this.isProgramRunning = true;
      this._error = undefined;
      return this._initModel()
        .then(this._initQuery.bind(this))
        .then(function () {
          var model = this.getMultiDimModel();
          this.programInstance = FF.ProgramRunner.createRunner(model.getSession(), programName);
          return this._processConfigURI()
            .then(function () {
              this._setClientArgs();
              this._setClientEnvironment(this.programInstance);
              this.programInstance.setNativeAnchorId(this.programContainerID);
              var queryManager = this.dataProviderInstance && this.dataProviderInstance.getQueryManager();
              if (queryManager) {
                this.programInstance.setObjectArgument("queryManager", queryManager);
              }
              this.programInstance.runProgram()
                .then(function (oProgram) {
                  this.log("GDS created");
                  this.program = oProgram;
                  this.registerCustomPanels();
                  this.registerUiStateChange();
                  this.program.registerDynamicMenuActionsProvider("UI5ContextMenuProvider", this.contextMenuProvider);
                  this.updateTitle();
                  this.updateProgramSettings();

                }.bind(this))
                .onCatch(function (oError) {
                  throw new Error(oError);
                });
            }.bind(this));
        }.bind(this)).catch(this._handleInitalisationErrors.bind(this));
    },

    exit: function () {
      if (this.programInstance) {
        this._cleanUpProgram();
      }
    },

    getProgram: function () {
      return this.program;
    },

    /**
       * Sets the visibility of a panel
       * @param sPanelId the ID of the panel
       * @param bVisible <code>true</code> if panel is to be shown, else <code>false</code>
       */
    setPanelVisible: function (sPanelId, bVisible) {
      if (this.program) {
        var oActiveDocument = this.program.getActiveDocument();
        if (oActiveDocument && oActiveDocument.setPanelVisible) {
          var oPanelType = FF.AuGdsPanelType.lookup(sPanelId);
          if (oPanelType) {
            oActiveDocument.setPanelVisible(oPanelType, bVisible);
          } else {
            throw new Error("Cannot resolve panel type to adjust visibility!");
          }
        }
      }
    },

    setDataProvider: function (sDataProviderName) {
      var that = this;
      that.closed = false;
      if (!sDataProviderName) {
        sDataProviderName = emptyDP;
      }
      that.setProperty("dataProvider", sDataProviderName);
      // TODO remove Query Manager when dataProvider is null and the according API is provided
      if (that.program) {
        that._initQuery().then(function () {
          if (that.dataProviderInstance) {
            var qm = that.dataProviderInstance.getQueryManager();
            {
              if (qm && !qm.isReleased()) {
                that.program.getActiveDocument().setExternalQueryManager(that.dataProviderInstance.getQueryManager());
              }
            }

          }
        });
      }
      return this;
    },
    /**
       * Register a Context Menu action
       * @param sActionId
       * @param actionDefinition
       */
    addContextMenuAction: function (sActionId, actionDefinition) {
      this.contextMenuProvider.registerAction(sActionId, actionDefinition);
    },

    setDataSource: function (sDataSource) {
      var that = this;
      that.closed = false;
      if (sDataSource === null) {
        sDataSource = NO_DS;
      }
      if (sDataSource && sDataSource.startsWith("$")) {
        sDataSource = this.getUrlParams("datasource");
      }
      var oldValue = this.getProperty("dataSource");
      if (oldValue === sDataSource) {
        return this;
      }

      if (sDataSource === NO_DS) {
        if (oldValue) {
          that._removeQuery(oldValue).then(function () {
            if (that.program) {
              that.program.getActiveDocument().setExternalQueryManager(null);
              //hat.program.closeActiveDocumentSafe();
              that.closed = true;
              that.invalidate();
            }
          });
        }

      } else if (that.program) {
        that._initQuery().then(function () {
          that.program.getActiveDocument().setExternalQueryManager(that.dataProviderInstance.getQueryManager());
        });
      }
      that.setProperty("dataSource", sDataSource, true);
      that.setProperty("dataProvider", undefined);
      return this;
    },
    setHideFilterLine: function (bHideFilterLine) {
      this.setProperty("hideFilterLine", bHideFilterLine, true);
      if (this.program) {
        this.program.getActiveDocument().setFilterLineVisible(!bHideFilterLine);
      }
      return this;
    },
    setStyleTemplateName: function (sStyleTemplateName) {
      this.setProperty("styleTemplateName", sStyleTemplateName, true);
      this.updateStyleTemplate();
      return this;
    },
    setAutoUpdate: function (bAutoUpdate) {
      this.setProperty("autoUpdate", bAutoUpdate, true);
      if (this.program) {
        this.program.getActiveDocument().setAutoUpdatesEnabled(bAutoUpdate);
      }
      return this;
    },
    setHideToolBar: function (bHideToolBar) {
      this.setProperty("hideToolBar", bHideToolBar, true);
      if (this.program) {
        this.program.setShowToolbar(!bHideToolBar);
      }
      return this;
    },
    setTitle: function (sTitle) {
      this.setProperty("title", sTitle, true);
      this.updateTitle();
      return this;
    },
    setShowTitle: function (bShowTitle) {
      this.setProperty("showTitle", bShowTitle, true);
      this.updateTitle();
      return this;
    },
    setHideSideNavigation: function (bHideSideNavigation) {
      this.setProperty("hideSideNavigation", bHideSideNavigation, true);
      if (this.program) {
        this.program.getActiveDocument().setSideNavigationVisible(!bHideSideNavigation);
      }
      return this;
    },
    setHideDesignPanel: function (bHideDesignPanel) {
      this.setProperty("hideDesignPanel", bHideDesignPanel, true);
      if (this.program) {
        this.program.getActiveDocument().setDesignerPanelVisible(!bHideDesignPanel);
      }
      return this;
    },
    setHideStylePanel: function (bHideStylePanel) {
      this.setProperty("hideStylePanel", bHideStylePanel, true);
      if (this.program) {
        this.program.getActiveDocument().setStylePanelVisible(!bHideStylePanel);
      }
      return this;
    },
    _cleanUpProgram: function () {
      FF.XObjectExt.release(this.programInstance);
      FF.XObjectExt.release(this.program);
      this.programInstance = null;
      this.program = null;
      var programmUiArea = sap.ui.core.UIArea.registry.get(this.programContainerID);
      if (programmUiArea) {
        programmUiArea.destroy();
      }
      this.isProgramRunning = false;
    },
    _initModel: function () {
      var that = this;
      return Promise.resolve().then(function () {
        that.log("Start init model");
        var model = that.getMultiDimModel();
        if (!model) {
          var modelSettings = {
            masterSystem: that._getSystemName(),
            systemType: that.getSystemType(),
            keepAliveInterval: that.getKeepAliveInterval() || -1
          };
          model = new MultiDimModel(modelSettings);
          that.getParent().setModel(model, that.getMultiDimModelId());
        }
        model.attachEvent("dataProviderAdded", null, function (evt) {
          var dataProviderName = evt.getParameter("dataProviderName");
          that.log("DP added '" + dataProviderName + "'");
          // update DataProvider
          if (dataProviderName === that.getDataProvider()) {
            this.dataProviderInstance = model.getDataProvider(dataProviderName);
            if (this.dataProviderInstance) {
              if (this.program && this.program.getActiveDocument()) {
                //Stop rerendeing and enable it async as the setting of query manager will cause a lot of events which are not needed
                this._rerender = false;
                this.program.getActiveDocument().getQueryController().initWithExistingQueryManager(this.dataProviderInstance.getQueryManager());
                // Once query manager is ready, update program settings
                setTimeout(10, function () {

                  this.updateProgramSettings();
                  this._rerender = true;
                }.bind(this));
              }
            }
          }
        }, that);
        model.attachEvent("dataProviderUpdated", null, function (evt) {
          var dataProviderName = evt.getParameter("dataProviderName");
          that.log("DP changed '" + dataProviderName + "'");
          // update DataProvider
          if (dataProviderName === that.getDataProvider()) {
            this.dataProviderInstance = model.getDataProvider(dataProviderName);
            if (this.dataProviderInstance) {
              if (this.program && this.program.getActiveDocument()) {
                this.program.getActiveDocument().notifyQueryManagerStateChange();
              }
            }
          }
        }, that);
        return model.loaded();
      });

    },
    _parseDataSource: function (ds) {
      var dataSource = FF.QFactory.createDataSource();
      var dataSourceName = ds || this.getDataSource();
      if (dataSourceName.indexOf(":[") > 0) {
        dataSource.setFullQualifiedName(dataSourceName);
      } else {
        dataSource.setObjectName(dataSourceName);
        dataSource.setType(this.getSystemType() === SystemType.BW ? FF.MetaObjectType.QUERY : FF.MetaObjectType.DBVIEW);
      }
      return dataSource;
    },
    _initQuery: function () {
      var model = this.getMultiDimModel();
      return Promise.resolve().then(function () {
        this.log("Start init query");
        if (this.getDataProvider()) {
          var dataProviderTxt = this.getDataProvider();
          if (dataProviderTxt === emptyDP) {
            this.dataProviderInstance = null;
            if (this.program) {
              var oArgsJson = this.programInstance.getCurrentStartConfig().getArguments().getArgumentStructure();
              this.program.openDocument(FF.AuGdsDocumentType.QUERY_BUILDER, null, null, oArgsJson);
            }
          } else {
            this.log("Update DP instance to '" + dataProviderTxt + "'");
            this.dataProviderInstance = model.getProperty("/DataProvider/" + dataProviderTxt);
          }
        } else if (this.getDataSource()) {
          var dataSourceObject = this._parseDataSource();
          var dataProviderName = dataSourceObject.getObjectName();
          this.dataProviderInstance = model.getDataProvider(dataProviderName);
          if (this.dataProviderInstance) {
            return;
          }
          return model.addDataProvider(dataProviderName, dataProviderName, this._getSystemName(), dataSourceObject.getPackageName(), dataSourceObject.getSchemaName(), dataSourceObject.getType())
            .then(function (dataProvider) {
              this.dataProviderInstance = dataProvider;
              this.setProperty("dataProvider", dataProviderName, true);
            }.bind(this));
        } else {
          throw new Error("A dataProvider or dataSource must be specified");
        }
      }.bind(this));

    },

    _removeQuery: function (oldDs) {
      var model = this.getMultiDimModel();
      return Promise.resolve().then(function () {
        if (this.getDataSource() === NO_DS) {
          var dataSourceObject = this._parseDataSource(oldDs);
          var dataProviderName = dataSourceObject.getObjectName();
          this.dataProviderInstance = model.getDataProvider(dataProviderName);
          if (!this.dataProviderInstance) {
            return;
          }
          return model.removeDataProvider(dataProviderName)
            .then(function () {
              this.dataProviderInstance = null;
              this.setProperty("dataProvider", null, true);
            }.bind(this));
        }
      }.bind(this));

    },

    _setClientArgs: function () {
      this.log("setClientArgs");
      this.programInstance.setArgument(FF.AuGdsConstants.GDF_FILE_DOC_TYPE, this.getDocType());
      this.programInstance.setArgument(FF.AuGdsConstants.PARAM_SYSTEM, this._getSystemName());
      // Disable multi-documents for the moment
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_MULTI_DOCUMENTS, false);
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_HIDE_STATUS_BAR, this.getHideStatusBar());
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_HIDE_MENU_BAR, this.getHideMenuBar());
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_HIDE_TOOLBAR, this.getHideToolBar());
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_QUERY_BUILDER_MULTI_VIEWS, false);
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_QUERY_BUILDER_AUTO_OPEN_DATA_SOURCE_PICKER, false);
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_IMPLICIT_VARIABLE_HANDLING, this.getImplicitVariableHandling());
      this.programInstance.setBooleanArgument(FF.AuGdsConstants.PARAM_SUPPRESS_LANDING_PAGE, this.getHideLandingPage());
      this.programInstance.setArgument(FF.AuGdsConstants.PARAM_INTEGRATION, "ui5");
      this.programInstance.setArgument(FF.AuGdsConstants.PARAM_MODE, FF.AuGdsConstants.VALUE_MODE_SAP_UI5_GA);
    },
    _handleInitalisationErrors: function (e) {
      this._error = e;
      this.invalidate();
    },
    isEqualTo: function () {
      return false;
    },

    onQueryExecuted: function () {
      if (this.getParent().getModel(this.getModelId())) {
        this.getParent().getModel(this.getModelId()).fireRequestCompleted({infoObject: this.getDataProvider()});
      }
      this.fireQueryExecuted();
    },

    getDocType: function () {
      return "QueryBuilder";
    },
    _getSystemName: function () {
      var systemName = this.getSystemName();
      if (systemName && systemName.startsWith("$")) {
        systemName = this.getUrlParams("system");
      }
      return systemName ? systemName : "local" + this.getSystemType();
    },

    _updateSupportedPanelsConfiguration: function (configModel, disableformatingPanel) {
      var aCustomPanels = this.getCustomPanels();
      if (aCustomPanels.length) {
        var aCustomPanelTypes = aCustomPanels.map(function (oCustomPanel) {
            return oCustomPanel.getPanelId();
          }),
          sConfigModelPath = "/QueryBuilder/SideNavigation/SupportedPanels",
          aSupportedPanelTypes = configModel.getProperty(sConfigModelPath);
        if (aSupportedPanelTypes) {
          aSupportedPanelTypes = aSupportedPanelTypes.concat(aCustomPanelTypes);
        } else {
          aSupportedPanelTypes = aCustomPanelTypes;
        }
        configModel.setProperty(sConfigModelPath, aSupportedPanelTypes);
        if (disableformatingPanel) {
          configModel.setProperty("/QueryBuilder/PanelSettings/StylePanel/ConditionalFormatting", false);
        }
      }
    },

    _processConfigURI: function () {
      var programInstance = this.programInstance;
      return new Promise(function (resolve) {
        var configObject = this.getConfigObject();
        if (configObject) {
          resolve(JSON.stringify(configObject));
        } else {
          var configFile = this.getConfigurationURI();
          var configId = this.getConfigId();
          var disableFormatingPanel = false;
          if (configId) {

            if (configId == "reviewbooklet-op") {
              disableFormatingPanel = true;
              configId = "reviewbooklet";
            }
            configFile = sap.ui.require.toUrl("sap/sac/df/fa/configs/" + configId + "-config.json");
          }
          if (!configFile) {
            configFile = sap.ui.require.toUrl("sap/sac/df/fa/configs/sap-ui5-config.json");
          }
          var jsonTemplate = new JSONModel(configFile);
          jsonTemplate.attachRequestCompleted(function (oEvent) {
            var configModel = oEvent.getSource();
            // Append custom panels to control's supported panels configuration.
            this._updateSupportedPanelsConfiguration(configModel, disableFormatingPanel);
            resolve(JSON.stringify(configModel.getData()));
          }.bind(this));
        }
      }.bind(this)).then(function (configJson) {
        if (configJson) {
          programInstance.setArgument(FF.AuGdsConstants.PARAM_CONFIGURATION, configJson);
        }
      });
    },

    getUrlParams: function (key) {
      return (window.location.href.split(key + "=")[1] || "").split("&")[0];
    },

    _setClientEnvironment: function (program) {
      var aEnvArgs = this.getEnvironment();
      aEnvArgs.forEach(function (element) {
        var parts = element.split("=");
        program.setEnvironmentVariable(parts[0], parts[1]);
      }.bind(this));
    },
    log: function (message) {
      if (this.logActive) {
        console.log(this.getId() + ": " + message);
      }
    },
    updateStyleTemplate: function () {
      if (this.program) {
        var activeDocument = this.program.getActiveDocument();
        if (activeDocument.getTableView() && activeDocument.getTableView().getTableDefinition()) {
          var styleTemplateName = this.getStyleTemplateName();
          if (!styleTemplateName) {
            return;
          }
          var tableDefinition = activeDocument.getTableView().getTableDefinition();

          if (styleTemplateName === EMPTY_STYLE) {
            if (tableDefinition.getLinkedDefinition("FA")) {
              tableDefinition.unlinkDefinition("FA");
            }
          } else {
            var styleTemplate = this.getMultiDimModel().getStylingProvider().getTemplate(styleTemplateName);
            if (styleTemplate.getStyleForDataProvider) {
              styleTemplate = styleTemplate.getStyleForDataProvider(this.dataProviderInstance);
            }
            var faTableDefinition = FF.QFactory.createTableDefinition();
            faTableDefinition.deserializeFromElementExt(FF.QModelFormat.INA_REPOSITORY, new FF.NativeJsonProxyElement(styleTemplate));
            tableDefinition.putLinkedDefinition("FA", faTableDefinition);
          }
          activeDocument.getTableView().reRenderTableStyling();
        }
      }
    },
    applyAutoUpdate: function () {
      var autoUpdate = this.getAutoUpdate();
      var activeDocument = this.program.getActiveDocument();
      if (!autoUpdate && activeDocument.getQueryManager() && activeDocument.getQueryManager().getResultSetSyncState() === FF.SyncState.IN_SYNC) {
        activeDocument.setAutoUpdatesEnabled(true);
        setTimeout(function () {
          activeDocument.setAutoUpdatesEnabled(false);
        }, 35);
      } else {
        activeDocument.setAutoUpdatesEnabled(autoUpdate);
      }
    },
    _checkAutoUpdate: function () {
      if (this.getAutoUpdate() && this.dataProviderInstance && !this.dataProviderInstance.isValid()) {
        this.dataProviderInstance.getResultSet();
      }
    }
  });
  return FA;
});
