/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise */
sap.ui.define(
  "sap/sac/df/olap/MultiDimDataProvider",
  [
    "sap/base/Log",
    "sap/ui/core/format/DateFormat",
    "sap/sac/df/types/Axis",
    "sap/sac/df/types/DimensionType",
    "sap/sac/df/types/DisplayType",
    "sap/sac/df/types/ComparisonOperator",
    "sap/sac/df/utils/SyncActionHelper",
    "sap/sac/df/utils/ListHelper",
    "sap/sac/df/utils/TokenHelper",
    "sap/sac/df/utils/ResourceBundle",
    "sap/sac/df/thirdparty/lodash",
    "sap/sac/df/firefly/library",
    "sap/sac/df/olap/Capability"
  ], /*eslint-disable max-params*/
  function (
    Log, UiCoreDateFormat, Axis, DimensionType, DisplayType,
    ComparisonOperator, SyncActionHelper, ListHelper, TokenHelper,
    ResourceBundle, _, FF, Capability
  ) {
    "use strict";
    /*eslint-disable max-statements*/
    /**
     * Constructor for a new MultiDimDataProvider.
     *
     * A MultiDimDataProvider represents a navigable queryManager and allows to access and change
     * data from servers providing the <a href="https://wiki.scn.sap.com/wiki/display/BI/OT-BICS-INA" target="_blank">InA Protocol</a>.
     *
     * @class
     * A <code>MultiDimDataProvider</code> is a Analytical query exposed via an OLAP engine and accessed via InA protocol
     * HANA - MDS
     * BW Query. In BW it could be done via a CDS view that is
     * annotated as an <a href="https://help.sap.com/viewer/cc0c305d2fab47bd808adcad3ca7ee9d/LATEST/en-US/c2dd92fb83784c4a87e16e66abeeacbd.html" target="_blank">AnalyticQuery</a>.
     *
     * Instances of this class should only be created by the {sap.sac.df.olap.MultiDimModel}.
     * The <code>MultiDimModel</code> populates it's exposed data via Binding to Controls. The structure of
     * data exposed by a <ode>MultiDimDataProvider</code> is as follows:
     *
     *  <b>Structure of Exposed Data</b>
     *
     * <ul>
     * <li><code>Grid/Cells</code>: The list of all <code>Cell</code> representing the data retrieved via <code>MultiDimDataProvider</code></li>
     * <li><code>FreeDimensions</code>: The list of all Dimensions lying in the Free Axis
     * <ul>
     * <li><code>Name</code>: the external name of the dimension
     * <li> <code>Description</code>: the language dependant description of the dimension
     * <li> <code>IsStructure</code>: boolean flag indicating whether the dimension is a structure
     * </ul>
     * </li>
     * <li>RowsDimensions: The list of all Dimensions lying on the Rows Axis
     * <ul>
     * <li> Name: the external name of the dimension
     * <li> Description: the language dependant description of the dimension
     * <li> IsStructure: boolean flag indicating whether the dimension is a structure
     * </ul>
     * </li>
     *  * <li>ColumnsDimensions: The list of all Dimensions lying on the Columns Axis
     * <ul>
     * <li> Name: the external name of the dimension
     * <li> Description: the language dependant description of the dimension
     * <li> IsStructure: boolean flag indicating whether the dimension is a structure
     * </ul>
     * </li>
     * <li>Conditions: list of conditions (result set filters)</li>
     * <li>Exceptions: list of exceptions (conditional formats)</li>
     * <li>StructureMembers: list of structure members (collection of Members of all Structure Dimension)</li>
     * </ul>
     * @param  {sap.sac.df.olap.MultiDimModel} oMultiDimModel the model to which the MultiDimDataProvider belongs
     * @param {string} sMultiDimDataProviderName name of the MultiDimDataProvider
     * @param {object} oApplication the firefly application associated to the <code>MultiDimModel</code>
     * @param {object} oQueryManager the firefly queryManager that is wrapped by the <code>MultiDimDataProvider</code>
     * @author SAP SE
     * @version 1.115.0
     * @public
     * @experimental
     * @alias sap.sac.df.olap.MultiDimDataProvider
     */
    var MultiDimDataProvider = function (oMultiDimModel, oApplication, oQueryManager, sMultiDimDataProviderName) {
      this.MEASURE_DIM = "MeasureStructure";
      this.STRUCTURE_DIM = "NonMeasureStructure";
      var that = this;
      var reinitPromise;
      var oQueryModel = oQueryManager.getQueryModel();
      var oResultSet;
      that.OffsetCol = 0;
      that.Messages = [];
      that.Name = sMultiDimDataProviderName;
      that.OffsetRow = 0;
      that.SuppressRepetition = true;
      that.Variables = {};
      var oVariableMapping = {};

      var _addMessagesToModel = function (oResult) {
        if (oResult && oResult.getMessages().length) {
          oMultiDimModel.addMessages(tranfromMessages(oResult));
        }
      };

      oQueryModel.registerChangedListener({
        onModelComponentChanged: function (oQueryModel, oDataProvider) {
          // Update MultiDimModel when external changes are made to the query model
          oDataProvider.callUpdateDimensionData();
          oMultiDimModel.checkUpdate();
        },
        isReleased: function () {
          return false;
        }
      }, this);

      oQueryManager.attachBeforeQueryExecutionListener({
        onBeforeQueryExecuted: function () {
          oMultiDimModel.propagateVariableGroupValues(that.Name);
          if (oQueryManager.isReinitNeeded() && that.variableChanged) {
            oQueryManager.setVariableProcessorState(FF.VariableProcessorState.PROCESSING_AUTO_SUBMIT);
            that.variableChanged = false;
          }
        },
        isEqualTo: FF.XObject.prototype.isEqualTo
      });
      oQueryManager.attachQueryExecutedListener({
        onQueryExecuted: function (extResult) {
          that.Grid = {};
          _addMessagesToModel(extResult);
          if (extResult.hasErrors()) {
            oMultiDimModel.checkUpdate();
            oMultiDimModel.fireRequestFailed({});

          } else {
            updateMetaData();
          }
          that._processVisualization();
        },
        isEqualTo: function (other) {
          return this === other;
        }

      }, "UI5GridViz");
      that.setOffsetCol = function (n) {
        that.virtualOffsetCol = n;
        return that;
      };
      that.setOffsetRow = function (n) {
        that.virtualOffsetRow = n;
        return that;
      };
      that.getStructureMembers = function (sDim) {
        var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
        var oKeyField = oDim.getDisplayKeyField();
        var oDynFilter = _.reduce(
          that.getFilterOfDim(sDim),
          function (oCurr, oMember) {
            oCurr[oMember.Low] = true;
            return oCurr;
          }, {});
        return _.map(
          ListHelper.arrayFromList(oDim.getAllStructureMembers()),
          function (oMem) {
            var convertedMember = convertMember(oMem, oDim, oKeyField);
            convertedMember.isInFilter = !!oDynFilter[oMem.getName()];
            return convertedMember;
          }
        );
      };

      updateMetaData();

      that.openCellDialog = function (sDim1, sMember1, sDim2, sMember2) {
        var o = that.Dimensions[sDim1];
        if (!o || !o.IsStructure) {
          throw new Error("Dimension is not a structure:" + sDim1);
        }
        var oField1 = oQueryModel.getDimensionByName(o.TechName).getDisplayKeyField();
        var oM1 = _.find(ListHelper.arrayFromList(oQueryManager.getQueryModel().getDimensionByName(that.Dimensions[sDim1].TechName).getAllStructureMembers()), function (o) {
          var oVal = o.getFieldValue(oField1);
          var s = oVal ? oVal.getString() : o.getName();
          return s === sMember1;
        });
        if (!oM1) {
          throw new Error("Member " + sMember1 + " not found in structure: " + sDim1);
        }
        var oM2;
        if (sDim2) {
          var oD2 = that.Dimensions[sDim2];
          if (!oD2 || !oD2.IsStructure) {
            throw new Error("Dimension is not a structure:" + sDim2);
          }
          var oField2 = oQueryModel.getDimensionByName(that.Dimensions[sDim2].TechName).getDisplayKeyField();
          oM2 = _.find(ListHelper.arrayFromList(oQueryManager.getQueryModel().getDimensionByName(that.Dimensions[sDim2].TechName).getAllStructureMembers()), function (o) {
            var oVal = o.getFieldValue(oField2);
            var s = oVal ? oVal.getString() : o.getName();
            return s === sMember2;
          });
          if (!oM2) {
            throw new Error("Member " + sMember2 + " not found in structure: " + sDim2);
          }
        }
        var fResolve;

        function handleDialog(resolve) {
          fResolve = resolve;
        }

        var oProm = new Promise(handleDialog);
        var oCD = FF.DataCellDialogDragonflyEntryPoint.createEntryPoint(oQueryManager);
        oCD.openDataCellPropertiesDialog(
          {
            onDataCellOk: function () {
              var fLocalResolve = fResolve;
              fResolve = null;
              return fLocalResolve(true);
            },
            onDataCellClose: function () {
              if (fResolve) {
                fResolve(false);
              }
              oCD.close();
            }
          },
          oQueryManager,
          oM1.getName(),
          oM2 ? oM2.getName() : null
        );
        return oProm;
      };
      that.openDimDialog = function (sDim) {
        return new Promise(function (resolve) {
          var runner = FF.ProgramRunner.createRunner(oApplication.getProcess(), FF.OuDimensionDialog2.DEFAULT_PROGRAM_NAME);
          runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_QUERY_MANAGER, oQueryManager);
          runner.setArgument(FF.OuDimensionDialog2.PARAM_DIMENSION_NAME, that.Dimensions[sDim].TechName);
          runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_OK_PROCEDURE, {
            execute: function () {
              resolve(true);
            }
          });
          runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_CANCEL_PROCEDURE, {
            execute: function () {
              resolve(false);
            }
          });
          return runner.runProgram(null);

        });
      };
      that.setResultVisibility = function (sDim, sResultVisibility) {
        executeModelOperation(function () {
          oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName).setResultVisibility(FF.ResultVisibility[sResultVisibility]);
        });
        return that;
      };
      that.setDimensionDisplay = function (sDim, sDisplayType) {
        executeModelOperation(function () {
          var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
          var oKeyField = oDim.getDisplayKeyField() || oDim.getKeyField();
          var oTextField = oDim.getTextField();
          var oRF = oDim.getResultSetFields();
          var aField =
            _.filter(
              ListHelper.arrayFromList(oRF).map(function (o) {
                return o;
              }),
              function (oField) {
                return oField !== oDim.getKeyField() && oField !== oDim.getTextField() && oField !== oDim.getDisplayKeyField();
              }
            );
          oRF.clear();
          switch (sDisplayType) {
            case DisplayType.Key:
              oRF.add(oKeyField);
              break;
            case DisplayType.Text:
              oRF.add(oTextField);
              break;
            case DisplayType.KeyText:
              oRF.add(oKeyField);
              oRF.add(oTextField);
              break;
            case DisplayType.TextKey:
              oRF.add(oTextField);
              oRF.add(oKeyField);
              break;
          }
          _.forEach(aField, function (oField) {
            oRF.add(oField);
          });
        });

        return that;
      };
      that.isVariableInputEnabled = function (sVar) {
        var sName = oVariableMapping[sVar];
        if (!sName) {
          return false;
        }
        var oVariable = oQueryModel.getVariable(sName);
        return !!oVariable && oVariable.isInputEnabled && oVariable.isInputEnabled();
      };
      that.hasVariableValueHelp = function (sVar) {
        var oVariable = oQueryModel.getVariable(sVar);
        return !!oVariable && oVariable.supportsValueHelp && oVariable.supportsValueHelp();
      };

      function addSupplement(valueBag, field, value) {
        if (field != null && value != null) {
          valueBag.addSupplementValue(field.getName(), value);
        }
      }

      function updateMemberFilter(oDim, filter, oSel) {
        filter.queueEventing();
        var keyField = oDim.getKeyField();
        var displayKeyField = oDim.getDisplayKeyField() !== keyField ? oDim.getDisplayKeyField() : null;
        var textField = oDim.getTextField();

        filter.addSupplementField(displayKeyField);
        filter.addSupplementField(textField);
        for (var i = 0; i < oSel.size(); i++) {
          var selectedItem = oSel.get(i);
          var filterElement = filter.addNewCartesianElement();
          filterElement.setComparisonOperator(FF.ComparisonOperator.EQUAL);
          filterElement.setField(keyField);
          var low = filterElement.getLow();
          low.setValue(FF.XValueUtil.getValueFromString(selectedItem.getKey(), keyField.getValueType()));
          addSupplement(low, displayKeyField, selectedItem.getDisplayKey());
          addSupplement(low, textField, selectedItem.getText());
        }
        filter.resumeEventing();
      }

      function getVariableByExternalName(sExternalVariableName) {
        var sInternalName = oVariableMapping[sExternalVariableName];
        if (!sInternalName) {
          return false;
        }
        return oQueryModel.getVariable(sInternalName);
      }

      that.applySelectionToVariable = function (sVar, aSelectedFdItems) {
        var updateVariable = function (variable) {

          if (!variable) {
            return;
          }
          executeModelOperation(function () {
            if (variable.getVariableType().isTypeOf(FF.VariableType.DIMENSION_MEMBER_VARIABLE)) {
              var oDim = variable.getDimension();
              var oMemberFilter = variable.getMemberFilter();
              oMemberFilter.clear();
              updateMemberFilter(oDim, oMemberFilter, aSelectedFdItems);
            } else {
              if (!aSelectedFdItems.isEmpty()) {
                variable.setValueByStringExt(aSelectedFdItems.get(0).getKey(), true);
              }
            }
            that.variableChanged = true;
          });
        };
        return new Promise(function (resolve, reject) {
          var variable = getVariableByExternalName(sVar);
          if (!variable || !variable.isInputEnabled()) {
            reject("Variable=" + sVar + " is not input enabled");
          }
          resolve(variable);
        }).then(updateVariable);
      };

      that.openVariableSelector = function (sVar, bSuppresModelUpdate) {
        var variable = getVariableByExternalName(sVar);
        if (!(variable && variable.supportsValueHelp && variable.supportsValueHelp())) {
          throw new Error("No Value help for variable " + sVar);
        }
        var tempQmManager = oQueryManager.clone();
        if (tempQmManager.isReinitNeeded()) {
          tempQmManager.reInitVariablesAfterSubmit(FF.SyncType.BLOCKING, null, null);
        }

        var fResolve;

        function handleDialog(resolve) {
          fResolve = resolve;
        }

        var runner = FF.ProgramRunner.createRunner(oApplication.getProcess(), FF.FilterDialog.DEFAULT_PROGRAM_NAME_VARIABLE);
        runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_QUERY_MANAGER, tempQmManager);
        runner.setArgument(FF.FilterDialog.PARAM_TITLE, ResourceBundle.getText("SELECTOR", [variable.getText()]));
        runner.setArgument(FF.FilterDialog.PARAM_VARIABLE_NAME, variable.getName());
        runner.setArgument(FF.FilterDialog.PARAM_SELECTION_MODE, variable.supportsMultipleValues() ? FF.UiSelectionMode.MULTI_SELECT.getName() : FF.UiSelectionMode.SINGLE_SELECT_LEFT.getName());
        runner.setBooleanArgument(FF.FilterDialog.PARAM_ALWAYS_SHOW_SELECTION_CONTAINER, true);
        runner.setObjectArgument(FF.FilterDialog.PARAM_DEFAULT_SELECTION, FF.FilterDialogValueFactory.createSelectionFromVariable(variable));
        runner.setObjectArgument(FF.FilterDialog.PARAM_LISTENER_CLOSE, {
          onFilterDialogOk: function (oSel) {
            fResolve(oSel);
          },
          onFilterDialogCancel: function () {
            fResolve(null);
          }
        });
        runner.runProgram();

        var oDefer = new Promise(handleDialog);
        return oDefer.then(function (oSel) {
          if (!oSel) {
            return false;
          }
          return oSel;
        }).then(function (oSel) {
          if (oSel && !bSuppresModelUpdate) {
            return that.applySelectionToVariable(sVar, oSel).then(function () {
              updateVariables();
              return oSel;
            });
          }
          return oSel;
        }).finally(function () {
          FF.XObjectExt.release(tempQmManager);
        });
      };
      that.openCurrencyTranslationDialog = function () {
        return new Promise(function (resolve) {
          var runner = FF.ProgramRunner.createRunner(oApplication.getProcess(), FF.OuCurrencyConversionDialog.DEFAULT_PROGRAM_NAME);
          runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_QUERY_MANAGER, oQueryManager);
          runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_OK_PROCEDURE, {
            execute: function () {
              resolve(true);
            }
          });
          runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_CANCEL_PROCEDURE, {
            execute: function () {
              resolve(false);
            }
          });
          return runner.runProgram(null);

        });

      };
      that.getFilterOfDim = function (sDim) {
        var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);

        function getFilterElementText(filterOperation) {
          var keyField = oDim.getKeyField();
          var displayKeyField = oDim.getDisplayKeyField() !== keyField ? oDim.getDisplayKeyField() : null;
          var textField = oDim.getTextField();
          var low = filterOperation.getLow();
          var filterElementValue = null;
          if (displayKeyField != null) {
            filterElementValue = low.getSupplementValueString(displayKeyField.getName());
          }
          if (!filterElementValue && textField) {
            filterElementValue = low.getSupplementValueString(textField.getName());
          }
          return filterElementValue;
        }

        return _.map(
          ListHelper.arrayFromList(
            oQueryModel.getFilter().getDynamicFilter().getCartesianListByField(oDim.getKeyField())),
          function (filterOperation) {
            return {
              ComparisonOperator: getOperatorFromComparisonOperator(filterOperation.getComparisonOperator()),
              Text: getFilterElementText(filterOperation),
              Low: filterOperation.getLow().getString(),
              High: filterOperation.getHigh().getString(),
              IsExcluding: filterOperation.getSetSign() === FF.SetSign.EXCLUDING
            };
          });
      };

      that.openSelector = function (sDimensionName) {
        var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDimensionName].TechName);
        if (!oQueryModel.getFilter().getDynamicFilter().isCartesianProduct()) {
          throw new Error("Filter to complex");
        }
        var fResolve;

        function handleDialog(resolve) {
          fResolve = resolve;
        }

        return Promise.resolve(null).then(
          function () {
            var runner = FF.ProgramRunner.createRunner(oApplication.getProcess(), FF.FilterDialog.DEFAULT_PROGRAM_NAME_DIMENSION);
            runner.setObjectArgument(FF.DfOuDialogProgram.PARAM_QUERY_MANAGER, oQueryModel.getQueryManager());
            runner.setArgument(FF.FilterDialog.PARAM_TITLE, ResourceBundle.getText("SELECTOR", [oDim.getText()]));
            runner.setArgument(FF.FilterDialog.PARAM_DIMENSION_NAME, oDim.getName());
            runner.setArgument(FF.FilterDialog.PARAM_SELECTION_MODE, FF.UiSelectionMode.MULTI_SELECT.getName());
            runner.setObjectArgument(FF.FilterDialog.PARAM_DEFAULT_SELECTION, FF.FilterDialogValueFactory.createSelectionFromFilter(oDim, oDim.getFilter()));
            runner.setObjectArgument(FF.FilterDialog.PARAM_LISTENER_CLOSE, {
              onFilterDialogOk: function (oSel) {
                fResolve(oSel);
              },
              onFilterDialogCancel: function () {
                fResolve(false);
              }
            });
            runner.runProgram();

            var oDefer = new Promise(handleDialog);
            return oDefer.then(
              function (oSel) {
                if (!oSel) {
                  return false;
                }
                executeModelOperation(function () {
                  var dynamicFilter = oDim.getQueryModel().getFilter().getDynamicFilter();
                  dynamicFilter.stopEventing();
                  var filter = oDim.getFilter();
                  if (filter != null) {
                    filter.clear();
                  } else {
                    filter = dynamicFilter.getCartesianListWithDefault(oDim);
                  }
                  updateMemberFilter(oDim, filter, oSel);
                  dynamicFilter.resumeEventing();
                });
                return true;
              }
            );
          }
        );
      };
      that.setAxesLayout = function (oLayout) {
        executeModelOperation(function () {
          _.forEach(_.map(that.Dimensions, "Name"), function (sDim) {
            oQueryModel.getAxis(FF.AxisType.FREE).add(
              oQueryModel.getDimensionByName(
                that.Dimensions[sDim].TechName
              )
            );
          });
          _.forEach(oLayout.rows, function (sDim) {
            moveToAxis(FF.AxisType.ROWS, sDim, false);
          });
          _.forEach(oLayout.columns, function (sDim) {
            moveToAxis(FF.AxisType.COLUMNS, sDim, false);
          });
        });
        return that;
      };
      that.removeDrilldown = function (sDim) {
        executeModelOperation(function () {
          oQueryModel.getAxis(FF.AxisType.FREE).add(
            oQueryModel.getDimensionByName(
              that.Dimensions[sDim].TechName
            )
          );
        });
        return that;
      };
      that.drilldown = function (sDim1, sDim2) {
        executeModelOperation(function () {
          if (sDim1) {
            var oDim = oQueryModel.getDimensionByName(
              that.Dimensions[sDim1].TechName
            );
            var oAxis = oQueryModel.getAxesManager().getRowsAxis().getDimensionCount() ? oDim.getAxis() : oQueryModel.getAxesManager().getRowsAxis();
            var nPosit = !oAxis.getDimensionCount() ? 0 : oDim.getDimension().getAxis().getDimensionIndex(oDim.getName()) + 1;
            oAxis.insert(nPosit, oQueryModel.getDimensionByName(
              that.Dimensions[sDim2].TechName
            ));
          } else {
            oQueryModel.getAxesManager().getRowsAxis().insert(
              oQueryModel.getAxesManager().getRowsAxis().getDimensionCount(), oQueryModel.getDimensionByName(
                that.Dimensions[sDim2].TechName
              )
            );
          }
        });
        return that;
      };
      that.moveUp = function (sDim) {
        executeModelOperation(function () {
          var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
          var oAxis = oDim.getAxis();
          var nPosit = oAxis.getDimensionIndex(oDim.getName()) - 1;
          oAxis.insert(nPosit, oDim);
        });
        return that;
      };
      that.moveDown = function (sDim) {
        executeModelOperation(function () {
          var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
          var oAxis = oDim.getAxis();
          var nPosit = oAxis.getDimensionIndex(oDim.getName()) + 1;
          oAxis.insert(nPosit, oDim);
        });
        return that;
      };
      that.setDisplayHierarchy = function (sDim, bActive, sName, sVersion) {
        executeModelOperation(function () {
          var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
          if (sName) {
            oDim.setHierarchyName(sName);
            if (sVersion) {
              oDim.setHierarchyVersion(sVersion);
            }
          }
          oDim.setHierarchyActive(bActive);
        });
        return that;
      };
      that.getScalingFactor = function (sMeasureMember, sNonMeasureMember) {
        var measureStructure = that.Dimensions.MeasureStructure;
        if (!measureStructure) {
          throw new Error("No measure Structure");
        }
        var oNonMeasureStructure = sNonMeasureMember ? that.Dimensions.NonMeasureStructure : null;
        var sMeasureDimName = measureStructure.TechName;
        var aMeasureMembers = ListHelper.arrayFromList(
          oQueryModel.getDimensionByName(sMeasureDimName).getAllStructureMembers()
        );
        var oMeasureDimDisplayField = oQueryModel.getDimensionByName(sMeasureDimName).getDisplayKeyField();
        var oMeasureMember = (function () {
          var oM = _.find(aMeasureMembers, function (o) {
            var oVal = o.getFieldValue(oMeasureDimDisplayField);
            var s = oVal ? oVal.getString() : o.getName();
            return s === sMeasureMember;
          });
          if (!oM) {
            throw new Error("Member " + sMeasureMember + " not found in structure: " + sMeasureDimName);
          }
          return oM;
        }());
        if (!oNonMeasureStructure) {
          return oMeasureMember.getNumericShift() ? -1 * oMeasureMember.getNumericShift().getInteger() : 0;
        } else {
          var sNonMeasureDimName = oNonMeasureStructure.TechName;
          var aNonMeasureMembers = ListHelper.arrayFromList(
            oQueryModel.getDimensionByName(sNonMeasureDimName).getAllStructureMembers()
          );
          var oNonMeasureDimDisplayField = oQueryModel.getDimensionByName(sNonMeasureDimName).getDisplayKeyField();
          var oNonMeasureMember = (function () {
            var oM = _.find(aNonMeasureMembers, function (o) {
              var oVal = o.getFieldValue(oNonMeasureDimDisplayField);
              var s = oVal ? oVal.getString() : o.getName();
              return s === sNonMeasureMember;
            });
            if (!oM) {
              throw new Error("Member " + sMeasureMember + " not found in structure: " + sMeasureDimName);
            }
            return oM;
          }());
          var aQC = ListHelper.arrayFromIter(oQueryManager.getQueryModel().getQueryDataCells().getIterator());
          var oQC = _.find(aQC, function (o) {
            return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oNonMeasureMember);
          });
          if (!oQC) {
            throw new Error("Invalid Query Cell");
          }
          return oQC.getScalingFactor();
        }
      };

      that.setScalingFactor = function (nFactor, sMeasureMember, sNonMeasureMember) {
        executeModelOperation(function () {
          var oMeasureStructure = that.Dimensions.MeasureStructure;
          if (!oMeasureStructure) {
            throw new Error("No measure Structure");
          }
          var oNonMeasureStructure = sNonMeasureMember ? that.Dimensions.NonMeasureStructure : null;
          var sMeasureDimName = oMeasureStructure.TechName;
          var aStructureMembers = ListHelper.arrayFromList(
            oQueryModel.getDimensionByName(sMeasureDimName).getAllStructureMembers()
          );
          var oField = oQueryModel.getDimensionByName(sMeasureDimName).getDisplayKeyField();
          var oMeasureMember = (function () {
            var oM = _.find(aStructureMembers, function (o) {
              var oVal = o.getFieldValue(oField);
              var s = oVal ? oVal.getString() : o.getName();
              return s === sMeasureMember;
            });
            if (!oM) {
              throw new Error("Member " + sMeasureMember + " not found in structure: " + sMeasureDimName);
            }
            return oM;
          }());
          if (!oNonMeasureStructure) {
            oMeasureMember.setNumericShift(-1 * nFactor);
            return that;
          } else {
            var nonMeasureDimName = oNonMeasureStructure.TechName;
            var aNonMeasureStructureMembers = ListHelper.arrayFromList(
              oQueryModel.getDimensionByName(nonMeasureDimName).getAllStructureMembers()
            );
            oField = oQueryModel.getDimensionByName(nonMeasureDimName).getDisplayKeyField();
            var oM2 = (function () {
              var oM = _.find(aNonMeasureStructureMembers, function (o) {
                var oVal = o.getFieldValue(oField);
                var s = oVal ? oVal.getString() : o.getName();
                return s === sNonMeasureMember;
              });
              if (!oM) {
                throw new Error("Member " + sNonMeasureMember + " not found in structure: " + nonMeasureDimName);
              }
              return oM;
            }());
            var aQueryCells = ListHelper.arrayFromIter(oQueryManager.getQueryModel().getQueryDataCells().getIterator());
            aQueryCells = _.filter(aQueryCells, function (o) {
              return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oM2);
            });
            if (!aQueryCells || aQueryCells.length < 1) {
              throw new Error("Invalid Query Cell");
            }
            return _.forEach(aQueryCells, function (oQueryCell) {
              oQueryCell.setScalingFactor(nFactor);
            });
          }
        });

      };
      that.setDecimalPlaces = function (nNumberOfDecimalPlaces, sMeasureMember, sNonMeasureMember) {
        executeModelOperation(function () {
          var oMeasureStructure = that.Dimensions.MeasureStructure;
          if (!oMeasureStructure) {
            throw new Error("No measure Structure");
          }
          var oNonMeasureStructure = sNonMeasureMember ? that.Dimensions.NonMeasureStructure : null;
          var sMeasureDimName = oMeasureStructure.TechName;
          var aStructureMembers = ListHelper.arrayFromList(
            oQueryModel.getDimensionByName(sMeasureDimName).getAllStructureMembers()
          );
          var oField = oQueryModel.getDimensionByName(sMeasureDimName).getDisplayKeyField();
          var oMeasureMember = (function () {
            var oM = _.find(aStructureMembers, function (o) {
              var oVal = o.getFieldValue(oField);
              var s = oVal ? oVal.getString() : o.getName();
              return s === sMeasureMember;
            });
            if (!oM) {
              throw new Error("Member " + sMeasureMember + " not found in structure: " + sMeasureDimName);
            }
            return oM;
          }());
          if (!oNonMeasureStructure) {
            oMeasureMember.setNumericScale(nNumberOfDecimalPlaces);
            return that;
          } else {
            var nonMeasureDimName = oNonMeasureStructure.TechName;
            var aNonMeasureStructureMembers = ListHelper.arrayFromList(
              oQueryModel.getDimensionByName(nonMeasureDimName).getAllStructureMembers()
            );
            oField = oQueryModel.getDimensionByName(nonMeasureDimName).getDisplayKeyField();
            var oStructureMember = (function () {
              var oM = _.find(aNonMeasureStructureMembers, function (o) {
                var oVal = o.getFieldValue(oField);
                var s = oVal ? oVal.getString() : o.getName();
                return s === sNonMeasureMember;
              });
              if (!oM) {
                throw new Error("Member " + sNonMeasureMember + " not found in structure: " + nonMeasureDimName);
              }
              return oM;
            }());
            var aQueryCells = ListHelper.arrayFromIter(oQueryManager.getQueryModel().getQueryDataCells().getIterator());
            aQueryCells = _.filter(aQueryCells, function (o) {
              return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oStructureMember);
            });
            if (!aQueryCells || aQueryCells.length < 1) {
              throw new Error("Invalid Query Cell");
            }
            return _.forEach(aQueryCells, function (oQueryCell) {
              oQueryCell.setDecimalPlaces(nNumberOfDecimalPlaces);
            });
          }
        });

      };
      that.getDecimalPlaces = function (sMeasureMember, sNonMeasureMember) {
        var measureDim = that.Dimensions.MeasureStructure;
        if (!measureDim) {
          throw new Error("No measure Structure");
        }
        var oNonMeasureDim = sNonMeasureMember ? that.Dimensions.NonMeasureStructure : null;
        var sMeasureDimName = measureDim.TechName;
        var aMeasureMembers = ListHelper.arrayFromList(
          oQueryModel.getDimensionByName(sMeasureDimName).getAllStructureMembers()
        );
        var oMeasureDisplayField = oQueryModel.getDimensionByName(sMeasureDimName).getDisplayKeyField();
        var oMeasureMember = (function () {
          var oM = _.find(aMeasureMembers, function (o) {
            var oVal = o.getFieldValue(oMeasureDisplayField);
            var s = oVal ? oVal.getString() : o.getName();
            return s === sMeasureMember;
          });
          if (!oM) {
            throw new Error("Member " + sMeasureMember + " not found in measureDim: " + sMeasureDimName);
          }
          return oM;
        }());
        if (!oNonMeasureDim) {
          return oMeasureMember.getNumericScale();
        } else {
          var sNonMeasureDimName = oNonMeasureDim.TechName;
          var aNonMeasureMembers = ListHelper.arrayFromList(
            oQueryModel.getDimensionByName(sNonMeasureDimName).getAllStructureMembers()
          );
          var oNonMeasureDisplayField = oQueryModel.getDimensionByName(sNonMeasureDimName).getDisplayKeyField();
          var oNonMeasureMember = (function () {
            var oM = _.find(aNonMeasureMembers, function (o) {
              var oVal = o.getFieldValue(oNonMeasureDisplayField);
              var s = oVal ? oVal.getString() : o.getName();
              return s === sNonMeasureMember;
            });
            if (!oM) {
              throw new Error("Member " + sNonMeasureMember + " not found in measureDim: " + sNonMeasureDimName);
            }
            return oM;
          }());
          var aQC = ListHelper.arrayFromIter(oQueryManager.getQueryModel().getQueryDataCells().getIterator());
          var oQC = _.find(aQC, function (o) {
            return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oNonMeasureMember);
          });
          if (!oQC) {
            throw new Error("Invalid Query Cell");
          }
          return oQC.getDecimalPlaces();
        }
      };
      that.setFilter = function (sDim, oVariant) {
        executeModelOperation(function () {
          var oDimension = that.Dimensions[sDim];
          var aMem = [];
          if (typeof oVariant === "string") {
            aMem.push(oVariant);
          } else {
            aMem = oVariant;
          }
          FF.QFilterUtil.clearSelectionsInContainerByDimension(
            that.Dimensions[sDim].TechName,
            oQueryModel.getFilter().getDynamicFilter()
          );
          var sDimName = that.Dimensions[sDim].TechName;
          var oFFDimension = oQueryModel.getDimensionByName(sDimName);
          var allStructureMembers = oDimension.IsStructure ? ListHelper.arrayFromList(oFFDimension.getAllStructureMembers()) : [];
          var oField = oDimension.IsStructure ? oFFDimension.getDisplayKeyField() : null;
          _.forEach(aMem, function (sMember) {
            var s = oDimension.IsStructure ? (function () {
              var oM = _.find(allStructureMembers, function (o) {
                var oVal = o.getFieldValue(oField);
                var s = oVal ? oVal.getString() : o.getName();
                return s === sMember;
              });
              if (!oM) {
                throw new Error("Member " + sMember + " not found in structure: " + sDimName);
              }
              return oM.getName();
            }()) : sMember;
            oQueryModel.getFilter().getDynamicFilter().addSingleMemberFilterByName(
              sDimName, s, FF.ComparisonOperator.EQUAL
            );
          });
        });

        return that;
      };
      that.removeFilter = function (sDim) {
        executeModelOperation(function () {
          FF.QFilterUtil.clearSelectionsInContainerByDimension(
            that.Dimensions[sDim].TechName,
            oQueryModel.getFilter().getDynamicFilter()
          );
        });
        return that;
      };
      that.sort = function (sDim, direction, type, sMember) {
        executeModelOperation(function () {
          var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
          if (that.Dimensions[sDim].IsStructure) {
            var oCC = oQueryManager.getConvenienceCommands();
            oCC.clearSort(null, null);
            oCC.sortByMeasure(_.find(that.Dimensions[sDim].Members, function (oM) {
              return oM.Name === sMember;
            }).TechName, FF.XSortDirection[direction]);
          } else {
            oDim.getResultSetSorting().setDirection(FF.XSortDirection[direction]);
            if (type) {
              oDim.getResultSetSorting().setSortType(FF.SortType[type]);
            }
          }
        });
        return that;
      };

      function moveToAxis(oAxisType, sDim, bUpdateMetadataParam) {
        var getFields = function (oDim) {
          var oKF1 = oDim.getKeyField();
          var oKF = oDim.getDisplayKeyField() || oKF1;
          var oTF = oDim.getTextField() || oKF;
          return {oKeyField: oKF1, oDisplayKeyField: oKF, oTextField: oTF};
        };
        executeModelOperation(function () {
          var oQM = oQueryModel;
          var sDimName = that.Dimensions[sDim].TechName;
          var oDim = oQM.getQueryModel().getDimensionByName(sDimName);
          oQM.getAxis(oAxisType).add(oDim);
          var fields = getFields(oDim);
          var resultSetFields = oDim.getResultSetFields();
          var oTextField = fields.oTextField;
          if (oTextField && !resultSetFields.contains(oTextField)) {
            resultSetFields.add(oTextField);
            oTextField.setObtainability(FF.ObtainabilityType.USER_INTERFACE);
          }

          var oDisplayKeyField = fields.oDisplayKeyField;
          if (!resultSetFields.contains(oDisplayKeyField)) {
            resultSetFields.add(oDisplayKeyField);
            oDisplayKeyField.setObtainability(FF.ObtainabilityType.USER_INTERFACE);
          }
        }, bUpdateMetadataParam, bUpdateMetadataParam);
      }

      that.toRows = function (sDim) {
        moveToAxis(FF.AxisType.ROWS, sDim);
        return that;
      };
      that.toColumns = function (sDim) {
        moveToAxis(FF.AxisType.COLUMNS, sDim);
        return that;
      };
      that.drill = function (sDim, nIndex) {
        executeModelOperation(function () {
          var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
          var oTE = oResultSet.getAxis(oDim.getAxisType()).getTupleAt(nIndex).getTupleElementByDimension(
            oDim
          );
          oTE.setNextDrillState(
            oTE.getDrillState() !== FF.DrillState.COLLAPSED ? FF.DrillState.COLLAPSED : FF.DrillState.EXPANDED
          );
        });
        return that;
      };
      that.submitVariables = function () {
        return SyncActionHelper.syncActionToPromise(
          oQueryManager.submitVariables,
          oQueryManager,
          []
        ).then(
          function (oRes) {
            updateMetaData();
            if (oRes && oRes.getMessages().length) {
              oMultiDimModel.addMessages(ListHelper.arrayFromList(
                oRes.getMessages()
              ).map(function (o) {
                var sSeverity = o.getSeverity().getName();
                if (sSeverity === "Info") {
                  sSeverity = "Information";
                }
                return {
                  Text: o.getText(),
                  Severity: sSeverity,
                  Code: o.getCode(),
                  MessageClass: o.getMessageClass(),
                  LongTextUri: o.getMessageClass() ? [
                    "/sap/opu/odata/iwbep/message_text;o=LOCAL/T100_longtexts(MSGID='",
                    encodeURIComponent(o.getMessageClass()), "',MSGNO='", encodeURIComponent(o.getCode()), ",',MESSAGE_V1='',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value"
                  ].join("") : null
                };
              }));
            }
          }
        ).catch(
          function (oError) {
            oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
            if (!oError.getMessages) {
              throw oError;
            }
            that.Grid = null;
          }
        );
      };

      that.getResultSet = function (bKeepOffset) {

        if (oQueryManager.getResultSetSyncState() === FF.SyncState.IN_SYNC_WITH_ERROR) {
          oQueryManager.getResultsetContainer(true);
        }
        if (!bKeepOffset) {
          that.setOffsetCol(0);
          that.setOffsetRow(0);
        }

        if (oQueryManager.hasChangedCells()) {
          oQueryManager.transferNewValues();
        }

        oQueryManager.setOffsetColumns(that.virtualOffsetCol);
        oQueryManager.setOffsetRows(that.virtualOffsetRow);
        oQueryManager.setMaxRows(oMultiDimModel.getLimit().RowLimit);
        oQueryManager.setMaxColumns(oMultiDimModel.getLimit().ColLimit);

        return new Promise(function (resolve) {
          var tableDefinition = oQueryModel.getVisualizationManager().getOrCreateVisualisationDefinition(that.Name, FF.ProtocolBindingType.SAC_TABLE_GRID, FF.SemanticBindingType.TABLE);
          var listener = {
            "onVisualizationObjectFilled": function () {
              tableDefinition.detachVisualizationDataProvidedListener(listener);
              resolve();
            },
            "isEqualTo": function (o) {
              return o === listener;
            }
          };
          tableDefinition.attachVisualizationDataProvidedListener(listener);
          oMultiDimModel.fireRequestSent({infoObject: that.Name});
          oQueryManager.processQueryExecution(FF.SyncType.NON_BLOCKING);
        }).catch(function (oError) {
          if (!oError.getMessages) {
            throw oError;
          }
          oMultiDimModel.fireRequestFailed({infoObject: that.Name});
        });

      };


      that.getRRITargets = function (nRow, nColumn) {
        var rriTargetManager = oQueryManager.getRriTargetManager();
        if (!rriTargetManager) {
          return Promise.resolve([]);
        }
        rriTargetManager.setResultSetContext(nRow, nColumn);
        var fResolve, fReject;

        function handleDialog(resolve, reject) {
          fResolve = resolve;
          fReject = reject;
        }

        rriTargetManager.processRriTargetResolution(FF.SyncType.NON_BLOCKING, {
          onRriTargetResolution: function (oRes) {
            if (oRes.hasErrors()) {
              fReject(oRes.getMessages());
            } else {
              var oUrlParsing = sap.ushell ? sap.ushell.Container.getService(
                "URLParsing"
              ) : {
                isIntentUrl: _.constant(false)
              };
              fResolve(_.filter(
                oRes.getData().getListFromImplementation().map(
                  function (o) {
                    return o.getParameters().getMapFromImplementation();
                  }),
                function (o) {
                  return oUrlParsing.isIntentUrl(o.URL) || !!o.URL.match(/#/);
                }
              ).map(
                function (o) {
                  o.URL = o.URL.split("#")[1];
                  return o;
                }));
            }
          }
        });
        return new Promise(handleDialog);
      };
      that.synchronize = function (bKeepOffset) {
        oMultiDimModel.clearMessages();
        return that.getResultSet(bKeepOffset);
      };

      that.readHierarchy = function (sDim, nLevel) {
        var oHelpValueProvider = oQueryManager.getValueHelpProvider();
        var oDim = oQueryModel.getDimensionByName(that.Dimensions[sDim].TechName);
        var nOldLevel = oDim.getInitialDrillLevel();
        oDim.setSelectorInitialDrillLevel(nLevel);
        var oProm = new Promise(function (resolve, reject) {
          oHelpValueProvider.processValueHelp(oDim, FF.SyncType.NON_BLOCKING, {
            onValuehelpExecuted: function (oExtResult) {
              return oExtResult.hasErrors() ? reject(SyncActionHelper.reject(oExtResult.getErrors())) : resolve(oExtResult.getData());
            }
          }, null, null);
        });

        return oProm.then(function (oData) {
          function prodNode(oNode) {
            if (!oNode) {
              return {};
            }
            var oChildren = oNode.getChildren();
            return {
              Name: oNode.getName(),
              Text: oNode.getDimensionMember().getText() || oNode.getDimensionMember(oNode.getDimension().getHierarchyDisplayKeyField()).getValue().getString(),
              hierNodes: oChildren ? _.map(oChildren.getListFromImplementation(), prodNode) : null
            };
          }

          oDim.setSelectorInitialDrillLevel(nOldLevel);
          var aRoots = _.filter(
            oData.getListFromImplementation(),
            function (oNode) {
              return !oNode.getParentNode();
            });
          return aRoots.length === 1 ? prodNode(
            aRoots[0]
          ) : {
            Name: "$Root",
            Text: ResourceBundle.getText("ARTIFICIAL_ROOT"),
            hierNodes: _.map(aRoots, prodNode)
          };
        });
      };

      function reinitIfNeededPromise() {
        if (reinitPromise) {
          return reinitPromise;
        }
        reinitPromise = new Promise(
          function (resolve, reject) {

            oQueryManager.reInitVariablesAfterSubmit(FF.SyncType.NON_BLOCKING,
              {
                onVariableProcessorExecuted: function (oExtResult) {
                  return oExtResult.hasErrors() ? reject(SyncActionHelper.reject(oExtResult.getErrors())) : resolve();
                }
              });

          });
        return reinitPromise.then(function () {
          reinitPromise = null;
        });
      }

      that.setVariableValueDirect = function (sVariable, aRange, bSuppresEvent) {
        var oVariable = getVariableByExternalName(sVariable);
        if (!oVariable && !oVariable.isInputEnabled()) {
          throw new Error("Variable is not input enabled");
        }
        oQueryModel.stopEventing();
        executeModelOperation(function () {
          that.variableChanged = true;
          oVariable.clear();
          if (aRange) {
            var oMemberFilter = oVariable.getMemberFilter ? oVariable.getMemberFilter() : null;
            _.forEach(aRange, function (oRange) {
              if (oMemberFilter) {
                var filterElement = oMemberFilter.addNewCartesianElement();
                var oAccess = FF.XValueAccess.createWithType(oVariable.getValueType());
                oAccess.parseString(oRange.Low);
                filterElement.getLow().setValue(oAccess.getValue());
                if (oRange.High) {
                  oAccess = FF.XValueAccess.createWithType(oVariable.getValueType());
                  oAccess.parseString(oRange.High);
                  filterElement.getHigh().setValue(oAccess.getValue());
                }
                filterElement.setComparisonOperator(FF.ComparisonOperator[oRange.Comparison]);
                var signElement = FF.SetSign[oRange.IsExcluding] || FF.SetSign[oRange.IsExcluding ? "EXCLUDING" : "INCLUDING"];
                filterElement.setSetSign(signElement);
                var oKNC = oVariable.getDimension().getFirstFieldByType(FF.PresentationType.KEY_NOT_COMPOUND);
                oKNC = oKNC || oVariable.getDimension().getKeyField(FF.PresentationType.KEY);
                if (oKNC) {
                  filterElement.setField(oKNC);
                }
              } else {
                oVariable.setValueByStringExt(oRange.Low, true);
              }
            }, false, true);
          }
          oQueryModel.resumeEventing();
          that.invalidate();
          updateVariables();
        }, false, bSuppresEvent);
      };


      that.setVariableValue = function (sVariable, aRange) {

        return new Promise(function (resolve) {
          that.setVariableValueDirect(sVariable, aRange);
          resolve();
        });
      };

      function transformValueHelpNode(node, hierarchyName, sSearchString) {
        var dimensionMember = node.getDimensionMember();
        var resultNode = {
          Key: dimensionMember.getName(),
          Text: dimensionMember.getText()
        };

        if (hierarchyName) {
          var children = node.getChildren();
          if (children && children.hasElements()) {
            var transformedChildren = ListHelper.arrayFromList(children).map(function (childrenNode) {
              return transformValueHelpNode(childrenNode, hierarchyName, sSearchString);
            }).filter(function (item) {
              return item !== null;
            });
            if (transformedChildren.length !== 0) {
              resultNode.Children = transformedChildren;
            }
          }
        }
        // Check exactness
        if (sSearchString && !resultNode.Children) {
          if (resultNode.Key !== sSearchString && resultNode.Text !== sSearchString) {
            return null;
          }
        }
        return resultNode;
      }

      /**
       * Performs the search in values of a given Variable
       *
       * @param {string} sVariable the name of the Variable to search
       * @param {string} sSearchString string to search for
       * @param {boolean} bFuzzy if a fuzzy search is performed
       * @param {boolean} bText if to search in text/description (default true)
       * @param {boolean} bKey if to search in key/id (default true)
       * @return {Promise<object[]>} array with found values
       * @public
       */
      that.searchVariableValues = function (sVariable, sSearchString, bFuzzy, bText, bKey) {
        // Mimic the defaults
        if (bText === undefined) {
          bText = true;
        }
        if (bKey === undefined) {
          bKey = true;
        }
        var oVariable = getVariableByExternalName(sVariable);
        if (!oVariable) {
          return Promise.reject(new Error("Variable " + sVariable + " is not known"));
        }
        var searchFields = FF.XList.create();
        var fields = FF.XList.create();
        var oDim = oVariable.getDimension();
        var textField = oDim.getTextField();
        if (textField) {
          fields.add(textField);
          if (bText) {
            searchFields.add(textField);
          }
        }
        if (oDim.getDisplayKeyField() && bKey) {
          searchFields.add(oDim.getDisplayKeyField());
        }
        return reinitIfNeededPromise().then(function () {
          return new Promise(function (resolve, reject) {
            FF.OlapUiValueHelpVariable.create(oVariable).processSearch(sSearchString, searchFields, fields, 20, true, FF.OlapUiReadMode.BOOKED, {
              onValuehelpExecuted: function (extResult) {
                if (extResult.hasErrors()) {
                  reject(tranfromMessages(extResult));
                } else {
                  var varType = oVariable.getVariableType();
                  var hierarchyName = varType != null && varType.isTypeOf(FF.VariableType.HIERARCHY_NODE_VARIABLE) ? oVariable.getHierarchyName() : null;
                  var iterator = extResult.getData().getIterator();
                  var result = [];
                  while (iterator.hasNext()) {
                    var node = iterator.next();
                    if (!hierarchyName || node.getDisplayLevel() === 0) {
                      var transformedNode = transformValueHelpNode(node, hierarchyName, !bFuzzy ? sSearchString : null);
                      if (transformedNode) {
                        result.push(transformedNode);
                      }
                    }
                  }
                  resolve(result);
                }
              }
            });
          });
        });
      };

      function tranfromMessages(oResult) {
        return ListHelper.arrayFromList(
          oResult.getMessages()
        ).map(function (o) {
          var sSeverity = o.getSeverity().getName();
          if (sSeverity === "Info") {
            sSeverity = "Information";
          }
          return {
            Text: o.getText(),
            Severity: sSeverity,
            Code: o.getCode(),
            MessageClass: o.getMessageClass(),
            LongTextUri: o.getMessageClass() ? [
              "/sap/opu/odata/iwbep/message_text;o=LOCAL/T100_longtexts(MSGID='",
              encodeURIComponent(o.getMessageClass()), "',MSGNO='", encodeURIComponent(o.getCode()), ",',MESSAGE_V1='',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value"
            ].join("") : null
          };
        });
      }

      that.getCellContext = function (nRowIndex, nColumnIndex) {
        var oCCProvider = FF.Ui5GridCellContextProvider.create(oQueryManager);
        var oCellIndexInfo = FF.RsCellIndexInfo.create();
        oCellIndexInfo.initialize(nRowIndex, nColumnIndex);
        return SyncActionHelper.syncActionToPromise(
          oCCProvider.getCellContext,
          oCCProvider,
          oCellIndexInfo
        ).then(function (oCellContext) {
          var oResult = oCellContext ? oCellContext.convertToNative() : null;
          return Promise.resolve(oResult);
        }).catch(function (oError) {
          oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
          return Promise.reject(oError);
        });
      };

      that.createDocumentId = function (nRowIndex, nColumnIndex) {
        var oDocumentIdManager = oQueryManager.getResultsetContainer().getDocumentIdManager();
        var oCellIndexInfo = FF.RsCellIndexInfo.create();
        oCellIndexInfo.initialize(nRowIndex, nColumnIndex);
        return SyncActionHelper.syncActionToPromise(
          oDocumentIdManager.createCellDocumentId,
          oDocumentIdManager,
          oCellIndexInfo
        ).then(function (oExtResult) {
          _addMessagesToModel(oExtResult);
          return oExtResult.getData().getCellDocumentId();
        }).catch(function (oError) {
          oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
          return Promise.reject(oError);
        });
      };

      that.getDocumentId = function (nRowIndex, nColumnIndex) {
        var oDocumentIdManager = oQueryManager.getResultsetContainer().getDocumentIdManager();
        var oCellIndexInfo = FF.RsCellIndexInfo.create();
        oCellIndexInfo.initialize(nRowIndex, nColumnIndex);
        return SyncActionHelper.syncActionToPromise(
          oDocumentIdManager.getCellDocumentId,
          oDocumentIdManager,
          oCellIndexInfo
        ).then(function (oExtResult) {
          _addMessagesToModel(oExtResult);
          return oExtResult.getData().getCellDocumentId();
        }).catch(function (oError) {
          oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
          return Promise.reject(oError);
        });
      };

      that.deleteDocumentId = function (nRowIndex, nColumnIndex) {
        var oDocumentIdManager = oQueryManager.getResultsetContainer().getDocumentIdManager();
        var oCellIndexInfo = FF.RsCellIndexInfo.create();
        oCellIndexInfo.initialize(nRowIndex, nColumnIndex);
        return SyncActionHelper.syncActionToPromise(
          oDocumentIdManager.deleteCellDocumentId,
          oDocumentIdManager,
          oCellIndexInfo
        ).then(function (oExtResult) {
          _addMessagesToModel(oExtResult);
          return oExtResult.getData().isCellDocumentIdDeleted();
        }).catch(function (oError) {
          oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
          return Promise.reject(oError);
        });
      };

      that._extractProperties = function (oDocVersion) {
        if (oDocVersion) {
          var oContent = oDocVersion.getContent();
          var oTimestamp = oDocVersion.getTimeStamp();
          return {
            "version": oDocVersion.getVersion(),
            "owner": oDocVersion.getOwner(),
            "timestamp": oTimestamp ? oTimestamp.toString() : null,
            "content": oContent ? oContent.getStringContentExt() : null
          };
        }
        return null;
      };

      that.createDocument = function (sDocumentId, sContent) {
        if (!sDocumentId) {
          throw new Error("Cannot create document without document ID");
        }

        try {
          return that.updateDocument(sDocumentId, sContent);
        } catch (oError) {
          return Promise.reject(oError);
        }
      };

      that.retrieveDocument = function (sDocumentId, sVersion) {
        if (!sDocumentId) {
          throw new Error("Cannot retrieve document without document ID");
        }

        var oDocumentsInfo = that.getQueryManager().getQueryModel().getDocumentsInfo();
        if (oDocumentsInfo) {
          var oDocSupport = oDocumentsInfo.getSupportsDocuments();
          if (oDocSupport && oDocSupport.getName() !== "None") {
            var oDocStoreService = oDocumentsInfo.getOrCreateDocumentsStoreService(false);
            oDocStoreService.addToFetchList(sDocumentId);

            return SyncActionHelper.syncActionToPromise(
              oDocStoreService.performRequests,
              oDocStoreService,
              [null, null]
            ).then(function () {
              var aDocumentContents = [];
              if (!sVersion) {
                // Retrieve all versions
                var aDocVersions = oDocStoreService.getDocumentVersionsForFile(sDocumentId);
                if (aDocVersions) {
                  aDocVersions.forEach(function (oDocVersion) {
                    var oProperties = that._extractProperties(oDocVersion);
                    if (oProperties) {
                      aDocumentContents.push(oProperties);
                    }
                  });
                }
              } else {
                // Retrieve specific version
                var oDocVersion = oDocStoreService.getDocumentVersionForFileAndVersion(sDocumentId, sVersion);
                var oProperties = that._extractProperties(oDocVersion);
                if (oProperties) {
                  aDocumentContents.push(oProperties);
                }
              }
              return Promise.resolve({
                "documentId": sDocumentId,
                "versions": aDocumentContents
              });
            }).catch(function (oError) {
              oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
              return Promise.reject(oError);
            });
          } else {
            throw new Error("No document support. Unable to retrieve document.");
          }
        }
      };

      that.retrieveMultipleDocuments = function (aDocumentIds) {
        if (!aDocumentIds) {
          throw new Error("Cannot retrieve documents without document IDs array");
        } else if (!Array.isArray(aDocumentIds)) {
          aDocumentIds = [aDocumentIds];
        }
        var oDocumentsInfo = that.getQueryManager().getQueryModel().getDocumentsInfo();
        if (oDocumentsInfo) {
          var oDocSupport = oDocumentsInfo.getSupportsDocuments();
          if (oDocSupport && oDocSupport.getName() !== "None") {
            var oDocStoreService = oDocumentsInfo.getOrCreateDocumentsStoreService(false);
            aDocumentIds.forEach(function (sDocumentId) {
              oDocStoreService.addToFetchList(sDocumentId);
            });
            return SyncActionHelper.syncActionToPromise(
              oDocStoreService.performRequests,
              oDocStoreService,
              [null, null]
            ).then(function () {
              var aDocumentsCollection = [];
              aDocumentIds.forEach(function (sDocumentId) {
                var aDocumentContents = [];
                var aDocVersions = oDocStoreService.getDocumentVersionsForFile(sDocumentId);
                if (aDocVersions) {
                  aDocVersions.forEach(function (oDocVersion) {
                    var oProperties = that._extractProperties(oDocVersion);
                    if (oProperties) {
                      aDocumentContents.push(oProperties);
                    }
                  });
                }
                aDocumentsCollection.push({
                  "documentId": sDocumentId,
                  "versions": aDocumentContents
                });
              });
              return Promise.resolve(aDocumentsCollection);
            }).catch(function (oError) {
              oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
              return Promise.reject(oError);
            });
          } else {
            throw new Error("No document support. Unable to retrieve documents.");
          }
        }
      };

      that.updateDocument = function (sDocumentId, sContent) {
        if (!sDocumentId) {
          throw new Error("Cannot update document without document ID");
        }

        var oDocumentsInfo = that.getQueryManager().getQueryModel().getDocumentsInfo();
        if (oDocumentsInfo) {
          var oDocSupport = oDocumentsInfo.getSupportsDocuments();
          if (oDocSupport && oDocSupport.getName() === "ReadWrite") {
            var oDocStoreService = oDocumentsInfo.getOrCreateDocumentsStoreService(false);
            oDocStoreService.addToPutList(sDocumentId, FF.XContent.createStringContent(FF.ContentType.TEXT_PLAIN, sContent));
            oDocStoreService.addToFetchList(sDocumentId);

            return SyncActionHelper.syncActionToPromise(
              oDocStoreService.performRequests,
              oDocStoreService,
              [null, null]
            ).then(function () {
              var oContent = oDocStoreService.getContentForFile(sDocumentId);
              return Promise.resolve(oContent ? oContent.getStringContentExt() === sContent : oContent === sContent);
            }).catch(function (oError) {
              oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
              return Promise.reject(oError);
            });
          } else {
            throw new Error("No 'ReadWrite' document support. Unable to update document.");
          }
        }
      };

      that.deleteDocument = function (sDocumentId) {
        if (!sDocumentId) {
          throw new Error("Cannot delete document without document ID");
        }

        var oDocumentsInfo = that.getQueryManager().getQueryModel().getDocumentsInfo();
        if (oDocumentsInfo) {
          var oDocSupport = oDocumentsInfo.getSupportsDocuments();
          if (oDocSupport && oDocSupport.getName() === "ReadWrite") {
            var oDocStoreService = oDocumentsInfo.getOrCreateDocumentsStoreService(false);
            oDocStoreService.addToDeleteList(sDocumentId);

            return SyncActionHelper.syncActionToPromise(
              oDocStoreService.performRequests,
              oDocStoreService,
              [null, null]
            ).then(function () {
              oDocStoreService.evictAllDocuments();
              return Promise.resolve(true);
            }).catch(function (oError) {
              oMultiDimModel.addMessages(oError.getMessages ? oError.getMessages() : []);
              return Promise.reject(oError);
            });
          } else {
            throw new Error("No 'ReadWrite' document support. Unable to delete document.");
          }
        }
      };

      that.supportsCapability = function (sCapability) {
        if (sCapability === Capability.SupportsDocuments) {
          var oDocumentsInfo = that.getQueryManager().getQueryModel().getDocumentsInfo();
          return !!oDocumentsInfo && oDocumentsInfo.getSupportsDocuments() !== FF.DocumentsSupportType.NONE;
        }

        // ToDo : Add more capabilities based on requirement.
        throw new Error("Unhandled capability : " + sCapability);
      };

      that.getDocumentsSupportType = function () {
        var bSupportsCellDocumentId = that.getQueryManager().getModelCapabilities().supportsCellDocumentId();
        if (bSupportsCellDocumentId) {
          var oDocumentsInfo = that.getQueryManager().getQueryModel().getDocumentsInfo();
          if (oDocumentsInfo) {
            var oSupportsDocuments = oDocumentsInfo.getSupportsDocuments();
            if (oSupportsDocuments) {
              return oSupportsDocuments.getName();
            }
          }
        }
        return FF.DocumentsSupportType.NONE.getName();
      };

      that.deserialize = function (repoJson) {
        return Promise.resolve().then(function () {
          that.variableChanged = true;
          executeModelOperation(function () {
            oQueryModel.deserializeExt(FF.QModelFormat.INA_REPOSITORY, repoJson);
          }, true);
        });
      };
      that.serialize = function () {
        return oQueryModel.serializeToContentExt(FF.QModelFormat.INA_REPOSITORY, null).getString();
      };

      that.getResultRequest = function () {
        return oQueryManager.getResultsetContainer().getResultSetManager().getDataRequest().convertToNative();
      };
      that.getQueryView = function () {
        return oQueryModel.serializeToElement(FF.QModelFormat.INA_DATA).convertToNative();
      };
      that.getQueryManager = function () {
        return oQueryManager;
      };
      that.callUpdateDimensionData = function () {
        updateDimensionData();
      };
      that.addCondition = function (oData) {
        return Promise.resolve(null).then(function () {
          var sId = ["COND_", Date.now()].join("");
          var oCond = oQueryModel.getConditionManager().addNewCondition(
            sId);
          oCond.setDescription(oData.Description);
          oCond.setText(oData.Description);
          var oStru = oQueryModel.getDimensionByName(that.Dimensions[oData.Structure1Key].TechName);
          var sEltId = _.find(that.Dimensions[oData.Structure1Key].Members, function (oM) {
            return oData.measure1 === oM.Name;
          }).TechName;
          if (!sEltId) {
            throw new Error("Invalid measure");
          }
          oCond.setDimensionEvaluationType(FF.ConditionDimensionEvaluationType.ALL_IN_DRILL_DOWN);
          var oThreshold = oCond.createThreshold();
          var oStruMem = oStru.getStructureMember(sEltId);
          if (!oStruMem) {
            throw new Error("Invalid measure");
          }
          oThreshold.addMeasureCoordinate(oStruMem);
          //Top N
          oThreshold.setComparisonOperator(FF.ConditionComparisonOperator[oData.operator]);
          oThreshold.getLow().setString(oData.Value);
          return that;
        });
      };
      that.resetToDefault = function () {
        return Promise.resolve().then(function () {
          that.variableChanged = true;
          executeModelOperation(function () {
            oQueryManager.getConvenienceCommands().resetToDefault();
          }, true);
        });
      };
      that.logoff = function () {
        return new Promise(function (resolve) {
          oQueryManager.processShutdown(FF.SyncType.NON_BLOCKING, {
            onQueryManagerRelease: function (extResult, shutdownQueryManager) {
              FF.XObjectExt.release(shutdownQueryManager);
              resolve();
            }
          });
        });
      };
      that.invalidate = function () {
        oQueryManager.invalidateState();
      };
      that.isValid = function () {
        var resultSetSyncState = oQueryManager.getResultSetSyncState();
        return resultSetSyncState !== FF.SyncState.OUT_OF_SYNC && resultSetSyncState !== FF.SyncState.IN_SYNC_WITH_ERROR;
      };
      that.exportData = function (dataExportConfig) {
        return new Promise(function (resolve, reject) {
          var oTableDef = oQueryModel.getVisualizationManager().getOrCreateVisualisationDefinition(that.Name, FF.ProtocolBindingType.SAC_TABLE_GRID, FF.SemanticBindingType.TABLE);
          dataExportConfig.addMissingOverwriteTexts(oTableDef.getApplicationSettings());
          var oDataExportHelper = FF.DataExportHelper.create(this.getQueryManager(), oTableDef, reject, resolve);
          if (dataExportConfig.getDisplayDialog()) {
            oDataExportHelper.showExportDialog(dataExportConfig.getType(), dataExportConfig.getFileName(), resolve);
          } else {
            var export_config = dataExportConfig.getFireflyConfig();
            oDataExportHelper.exportData(export_config);
          }
        }.bind(this));
      };

      function updateVariables() {
        var aFlatVar = _.map(
          ListHelper.arrayFromList(oQueryModel.getVariables()),
          transformVariable
        ).filter(function (oV) {
          return oV.InputEnabled;
        });
        that.Variables = _.reduce(
          aFlatVar,
          function (oVariables, oVar) {
            oVariables[oVar.Name] = oVar;
            return oVariables;
          }, that.Variables);
        oVariableMapping = _.reduce(
          ListHelper.arrayFromIter(oQueryModel.getVariables().getIterator()),
          function (oC, o) {
            oC[o.getNameExternal() || o.getName()] = o.getName();
            return oC;
          }, oVariableMapping);
      }

      function convertMember(oMem, oDim, oKeyField) {
        return {
          Key: oMem.getFieldValue(oDim.getKeyField()).getValue().getString(),
          Name: oMem.getFieldValue(oDim.getDisplayKeyField()) ? oMem.getFieldValue(oKeyField).getValue().getString() : oMem.getName(),
          TechName: oMem.getName(),
          Description: oMem.getText(),
          SemanticObject: oMem.getSemanticObject()
        };
      }

      function updateDimensionData() {
        oQueryModel.stopEventing();

        function readSorting(oDimension) {
          var oSortingManager = oQueryModel.getSortingManager();
          if (oSortingManager.supportsDimensionSorting(oDimension, null) && oDimension.hasSorting()) {
            return oDimension.getResultSetSorting().getDirection().getName();
          } else {
            return null;
          }
        }

        function readDimensionValueType(oDimension) {
          var valueType = FF.XValueType.STRING;
          var flatKeyField = oDimension.getFlatKeyField();
          if (flatKeyField && (flatKeyField.getValueType().isNumber()|| FF.QFilterUtil.supportsDateRangeFilter(flatKeyField))) {
            valueType = flatKeyField.getValueType();
          }
          return valueType.getName();
        }

        that.Dimensions = _.reduce(ListHelper.arrayFromList(oQueryModel.getDimensions()),
          function (oResult, oDim) {
            var oAxisType = oDim.getAxisType();
            if (oAxisType != FF.AxisType.COLUMNS && oAxisType != FF.AxisType.ROWS && oAxisType != FF.AxisType.FREE) {
              return oResult;
            }
            var oAxis = oDim.getAxis();
            var isMeasureStructure = oDim.isMeasureStructure();
            var isStructure = oDim.isStructure();
            if (isMeasureStructure) {
              oDim.getExternalName = _.constant(that.MEASURE_DIM);
            } else if (isStructure && !isMeasureStructure) {
              oDim.getExternalName = _.constant(that.STRUCTURE_DIM);
            }
            if (!oDim.getExternalName() || oDim.getExternalName().trim() === "") {
              oDim.getExternalName = oDim.getName;
            }
            var hasFilter = !!oDim.getFilter();
            var memberFilter = hasFilter ? transformMemberFilterList(oDim.getFilter()) : [];
            oResult[oDim.getExternalName()] = {
              Name: oDim.getExternalName(),
              TechName: oDim.getName(),
              Description: oDim.getText(),
              Axis: oAxis.getName(),
              Type: oDim.getDimensionType().getName(),
              HierarchyActive: oDim.isHierarchyActive(),
              HasFilter: hasFilter,
              MemberFilter: memberFilter,
              SortDirection: readSorting(oDim),
              Position: oAxis.getDimensionIndex(oDim.getName()),
              LastPosition: oAxis.getDimensionCount() - 1,
              IsStructure: isStructure,
              IsMeasureStructure: isMeasureStructure,
              ValueType: readDimensionValueType(oDim),
              SemanticObject: oDim.getSemanticObject()
            };
            if (isStructure) {
              var oKeyField = oDim.getDisplayKeyField();
              oResult[oDim.getExternalName()].Members = _.map(
                ListHelper.arrayFromList(oDim.getAllStructureMembers()),
                function (oMem) {
                  return convertMember(oMem, oDim, oKeyField);
                }
              );
            }
            return oResult;
          }, {});
        that.FreeAxis = {};
        that.FreeAxis.Dimensions = _.sortBy(
          _.filter(that.Dimensions, {
            Axis: Axis.Free
          }), "Description");
        that.ColumnsAxis = {};
        that.ColumnsAxis.Dimensions = _.sortBy(
          _.filter(that.Dimensions, {
            Axis: Axis.Columns
          }), "Position");
        that.RowsAxis = {};
        that.RowsAxis.Dimensions = _.sortBy(
          _.filter(that.Dimensions, {
            Axis: Axis.Rows
          }), "Position"
        );
        that.UsedDimensions = _.filter(
          _.concat(that.RowsAxis.Dimensions, that.ColumnsAxis.Dimensions),
          function (oD) {
            return !oD.IsMeasureStructure;
          });
        oQueryModel.resumeEventing();
      }

      that._processVisualization = function () {
        var tableDefinition = oQueryModel.getVisualizationManager().getOrCreateVisualisationDefinition(that.Name, FF.ProtocolBindingType.SAC_TABLE_GRID, FF.SemanticBindingType.TABLE);
        var tableContainer = tableDefinition.getActiveTableContainer();
        if (tableContainer != null) {
          tableContainer.processExecution(FF.SyncType.NON_BLOCKING, {
            "onVisualizationObjectFilled": function (extResult, visualisationContainer) {
              if (extResult.isValid()) {
                onVisualizationObjectFilled(visualisationContainer);
              } else {
                _addMessagesToModel(extResult);
              }
            }
          }
          );

        } else {
          oMultiDimModel.fireRequestCompleted({infoObject: that.Name});
        }

        function onVisualizationObjectFilled(visualisationContainer) {
          var table = visualisationContainer.getVisualizationData();
          try {
            var ui5Grid = FF.Ui5GridExport.create(table, visualisationContainer)._export();
            that.Grid = ui5Grid.convertToNative();
            oMultiDimModel.checkUpdate();
          } catch (e) {
            Log.error("Grid Update failed", e);
          }
          oMultiDimModel.fireRequestCompleted({infoObject: that.Name});
        }
      };

      function executeModelOperation(operation, fullUpdate, supressUpdate) {
        operation();
        if (fullUpdate) {
          updateMetaData();
        } else {
          updateDimensionData();
        }
        if (!supressUpdate) {
          oQueryManager.invalidateState();
          oQueryManager.getResultsetContainer(true);
          oMultiDimModel.fireDataProviderUpdated({dataProviderName: that.Name});
        }
      }

      function updateMetaData() {
        updateQueryInfo();
        updateVariables();
        that.HasVariables = oQueryModel.getVariableContainer().hasVariables();
        updateDimensionData();
        oQueryModel.stopEventing();
        var ffMeasureDimension = oQueryModel.getMeasureDimension();
        var measureName = ffMeasureDimension ? ffMeasureDimension.getExternalName() : null;
        var oMD = ffMeasureDimension ? that.Dimensions[measureName] : null;
        var aM = ffMeasureDimension && oMD.Members || [];
        that.Measures = aM;

        that.Conditions = _.map(
          oQueryModel.getConditionManager() ? ListHelper.arrayFromList(oQueryManager.getQueryModel().getConditionManager()) : [],
          function (o) {
            return {
              Name: o.getName(),
              Description: o.getText(),
              StatusText: ResourceBundle.getText(o.isActive() ? "ACTIVE" : "INACTIVE"),
              active: o.isActive()
            };
          });
        that.Exceptions = _.map(oQueryManager.getQueryModel().getExceptionManager() ? ListHelper.arrayFromList(oQueryManager.getQueryModel().getExceptionManager()) : [],
          function (o) {
            return {
              Name: o.getName(),
              Description: o.getText(),
              StatusText: ResourceBundle.getText(o.isActive() ? "ACTIVE" : "INACTIVE"),
              active: o.isActive()
            };
          });
        oQueryModel.resumeEventing();
      }

      function updateQueryInfo() {
        var queryInfo = {};
        that.QueryInfo = queryInfo;

        queryInfo.QueryTitle = oQueryModel.getText() || oQueryModel.getDataSource().getName();
        queryInfo.QueryName = oQueryModel.getDataSource().getName();
        queryInfo.QueryType = oQueryModel.getDataSource().getType().getName();
        queryInfo.SystemName = oQueryManager.getSystemDescription().getName();

        if (oQueryModel.getCubeInfo()) {
          queryInfo.CreatedBy = oQueryModel.getCubeInfo().getCreatedBy();
          queryInfo.CreatedOn = (function () {
            var oD = oQueryModel.getCubeInfo().getCreatedOn();
            return oD ? new Date(
              [
                oD.getYear(),
                oD.getMonthOfYear(),
                oD.getDayOfMonth()
              ].join("-")
            ) : new Date();
          }());
          queryInfo.CreatedOnText = queryInfo.QueryDueDateText = UiCoreDateFormat.getDateInstance({
            style: "medium"
          }).format(
            queryInfo.CreatedOn
          );
          queryInfo.QueryDueDate = (function () {
            var oD = oQueryModel.getCubeInfo().getDueDate();
            return oD ? new Date(
              [
                oD.getYear(),
                oD.getMonthOfYear(),
                oD.getDayOfMonth()
              ].join("-")
            ) : new Date();
          }());
          queryInfo.QueryDueDateText = UiCoreDateFormat.getDateInstance({
            style: "medium"
          }).format(
            queryInfo.QueryDueDate
          );
          if (oQueryModel.getResultAlignment()) {
            queryInfo.ResultAlignmentRows = oQueryModel.getResultAlignment().getName();
            queryInfo.ResultAlignmentColumns = oQueryModel.getResultAlignment().getName();
          }
          queryInfo.LastUpdated = (function () {
            var oD = oQueryModel.getCubeInfo().getUpdatedOn();
            return oD ? new Date(
              [
                oD.getYear(),
                oD.getMonthOfYear(),
                oD.getDayOfMonth()
              ].join("-")
            ) : new Date();
          }());
          queryInfo.LastUpdatedBy = oQueryModel.getCubeInfo().getUpdatedBy();
          queryInfo.LastUpdatedText = UiCoreDateFormat.getDateInstance({
            style: "medium"
          }).format(
            queryInfo.LastUpdated
          );
        }
      }

      function transformMemberFilter(filterOperation) {
        var oDim = filterOperation.getDimension();
        var getText = function (filterValue, bTextKey) {
          var text;
          if (filterValue && oDim) {
            if (oDim.getTextField() && bTextKey) {
              text = filterValue.getSupplementValueString(oDim.getTextField().getName());
            }
            if (!text && oDim.getDisplayKeyField()) {
              text = filterValue.getSupplementValueString(oDim.getDisplayKeyField().getName());
            }
            if (!text) {
              text = filterValue.getString();
            }
          }
          return text;
        };

        var low = filterOperation.getLow();
        var sTextLow = getText(low, true);
        var high = filterOperation.getHigh();
        var sTextHigh = getText(high, true);
        var sText = sTextHigh ? [sTextLow, sTextHigh].join(" - ") : sTextLow;
        var isExcluding = filterOperation.getSetSign() === FF.SetSign.EXCLUDING;
        if (isExcluding) {
          sText = "!( " + sText + ")";
        }
        var hierarchyInfo = {};
        if (filterOperation.getHierarchyName()) {
          hierarchyInfo.name = filterOperation.getHierarchyName();
          hierarchyInfo.version = filterOperation.getHierarchyVersion();
          hierarchyInfo.dueDate = filterOperation.getHierarchyDueDate();
          hierarchyInfo.levelOffset = filterOperation.getLevelOffset();
          hierarchyInfo.depth = filterOperation.getDepth();
        }

        return {
          Low: low.getString(),
          LowDisplayKey: getText(low, false),
          LowText: sTextLow,
          High: high.getString(),
          HighDisplayKey: getText(high, false),
          HighText: sTextHigh,
          ComparisonOperator: filterOperation.getComparisonOperator().getName(),
          Text: sText,
          IsExcluding: isExcluding,
          Hierarchy: hierarchyInfo
        };
      }


      function transformMemberFilterList(memberFilterList) {
        return _.map(
          ListHelper.arrayFromList(memberFilterList),
          transformMemberFilter
        );
      }

      function transformVariable(oVariable) {
        return {
          Name: oVariable.getNameExternal() || oVariable.getName(),
          Dimension: oVariable.getDimension && oVariable.getDimension() && (oVariable.getDimension().getExternalName() || oVariable.getDimension().getName()),
          ValueType: oVariable.getValueType().getName(),
          VariableType: oVariable.getVariableType().getName(),
          Description: oVariable.getText(),
          Mandatory: oVariable.isMandatory(),
          SupportsMultipleValues: oVariable.supportsMultipleValues(),
          TechName: oVariable.getName(),
          InputEnabled: oVariable.isInputEnabled(),
          Position: oVariable.getVariableOrder(),
          SupportsValueHelp: oVariable.supportsValueHelp && oVariable.supportsValueHelp(),
          DataProviderName: sMultiDimDataProviderName,
          MemberFilter: oVariable.getMemberFilter ? transformMemberFilterList(oVariable.getMemberFilter()) : (function () {
            var s = oVariable.getValueByString();
            if (!oVariable.getValue() || !s) {
              return [];
            }
            return [{
              Low: s,
              ComparisionOperator: "EQUAL",
              Text: s,
              IsExcluding: false
            }];
          }())
        };
      }
    };

    function getOperatorFromComparisonOperator(ffOperator) {
      switch (ffOperator) {
        case FF.ComparisonOperator.EQUAL:
          return "EQ";
        case FF.ComparisonOperator.LESS_THAN:
          return "LT";
        case FF.ComparisonOperator.LESS_EQUAL:
          return "LE";
        case FF.ComparisonOperator.GREATER_THAN:
          return "GT";
        case FF.ComparisonOperator.GREATER_EQUAL:
          return "GE";
        case FF.ComparisonOperator.BETWEEN:
          return "BT";
        case FF.ComparisonOperator.NOT_EQUAL:
          return "NE";
        default:
          throw new Error("Invalid Operator: " + ffOperator.getName());
      }
    }

    /**
     * hasVariable Checks whether a Variable is influencing the MultiDimDataProvider
     * @param {string} the Name of the Variable
     * @return {boolean} Whether the vairable influences the MultiDimDataProvider
     * @public
     */
    MultiDimDataProvider.prototype.hasVariable = function () {
    };
    /**
     * Distribute the dimension among the rows and columns
     * @param {object} mLayout an Object containing a <code>rows</code> member referencing a string array containing the names of the dimensions
     *                       and a <code>columns</code> member referencing a string array containing the dimension on the columns. The order in the array
     *                       control the positon on the axis.
     * @return {this} resolving to the <code>MultiDimDataProvider</code> to allow chaining. In case that a the Currency Translation Settings have been changed
     * in the dialog, the new resultset was retrieved before the promise gets resolved.
     * @public
     */
    MultiDimDataProvider.prototype.setAxesLayout = function () {
    };
    /**
     * Open a dialog that allows to display and change the property of a <code>Query Cell</code> of the <code>MultiDimDataProvider</code>.
     * @param {string} [sDim1] the external name of the first structure
     * @param {string} [sMem1] the external name of the member of the first structure
     * @param {string} [sDim2] the external name of the second structure
     * @param {string} [sMem2] the external name of the member of the second structure
     * @return {Promise<this>} resolving to the <code>MultiDimDataProvider</code> to allow chaining. In case that a the Currency Translation Settings have been changed
     * in the dialog, the new resultset was retrieved before the promise gets resolved.
     * @public
     */
    MultiDimDataProvider.prototype.openCellDialog = function () {
    };
    /**
     * Open a dialog that allows to display and change the property of an <code>Axis</code> of the <code>MultiDimDataProvider</code>.
     * @param {string} sDim the external name of the Dimension
     * @return {Promise<boolean>} indicator whether the dialog was confirmed or canceled
     * @public
     */
    MultiDimDataProvider.prototype.openAxisDialog = function () {
    };
    /**
     * Open a dialog that allows to display and change the currency translation settings of the <code>MultiDimDataProvider</code>.
     * @return {Promise<boolean>} indicator whether the dialog was confirmed or canceled
     * in the dialog, the new resultset was retrieved before the promise gets resolved.
     * @public
     */
    MultiDimDataProvider.prototype.openCurrencyTranslationDialog = function () {
    };

    /**
     * Open a dialog to display and change the settings of a dimension of the <code>MultiDimDataProvider</code>
     * @param {string} sDim the external name of the Dimension
     * @return {Promise<boolean>} indicator whether the dialog was confirmed or canceled
     * @public
     */
    MultiDimDataProvider.prototype.openDimDialog = function () {
    };
    /**
     * Open a dialog to display and change the filter on a dimension of the <code>MultiDimDataProvider</code>
     * @param {string} sDimensionName the external name of the Dimension
     * @return {Promise} resolving to a boolean which is false when the dialog is cancelled and true if is was closed with Ok and dynamic filters of the given dimension are updated
     * @public
     */
    MultiDimDataProvider.prototype.openSelector = function () {
    };
    /**
     * Set the filter for a dimension
     * @param {string} sDim the external name
     * @param {object} oFilter the filter
     * @return {{this} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.setFilter = function () {
    };
    /**
     * Remove the filter of a dimension
     * @param {string} sDim the external name
     * @return {this} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.removeFilter = function () {
    };
    /**
     * Sort the members of a dimension
     * @param {string} sDim the external name of the  Dimension
     * @param {sap.sac.df.types.SortType} type of sorting
     * @param {sap.sac.df.types.SortDirection} direction of sorting
     * @param {string} [sMember] in case of a structure the measure according to which is sorted
     * @return {Promise<this>} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.sort = function () {
    };
    /**
     * Move a dimension to the rows axis
     * @param {string} sDim the external name of the  Dimension
     * @return {this} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.toRows = function () {
    };
    /**
     * Move a dimension to the columns axis
     * @param {string} sDim the external name of the  Dimension
     * @return {this} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.toColumns = function () {
    };
    /**
     * Do a drill operation on a dimension member on an Axis
     * @param {string} sDim the external name of the  Dimension
     * @param {int} nIndex the Tuple Index of the member in the resultset.
     * @return {this} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.drill = function () {
    };
    /**
     * submit the value of the input enabled queries to the InA Server
     * @return {Promise<this>} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.submitVariables = function () {
    };

    /**
     * get the current resultset from the InA Server
     * @return {Promise<this>} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.getResultSet = function () {
    };
    /**
     * get the list of the jump targets associated to a datacell defined via
     * the report report interface.
     * @param {int} nRow Row of the data cell
     * @param {int} nColumn Column of the data cell
     * @return {Promise<this>} resolving to the List of jump targets.
     * @public
     */
    MultiDimDataProvider.prototype.getRRITargets = function () {
    };
    /**
     * add a new condition (aka resultset filter).
     * @param {object} oData Condition Definiton
     * @param {boolean} bActive Target state of the condition
     * @return {Promise<this>} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.addCondition = function () {
    };
    /**
     * move a dimension one position up on it's axis
     * @param {string} sName name of the dimension
     * @param {boolean} bActive Target state of the condition
     * @return {this} the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.moveUp = function () {
    };
    /**
     * move a dimension one position down on it's axis
     * @param {string} sName name of the dimension
     * @param {boolean} bActive Target state of the condition
     * @return {this} the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.moveDown = function () {
    };
    /**
     * open the dialog that allows to display and change the axis layout.
     * @return {Promise<this>} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @public
     */
    /**
     * Set Display Hierachy
     * @return {this} resolving to the <code>MultiDimDataProvider</code> to allow chaining.
     * @param {string} sDim  the external name of the structure on which the new restriction is created
     * @param {boolean} bActive whether the hierarchy should be activated
     * @param {string} sHierachy the  name of the hierarchy (optional)
     * @param {string} sVersion the version of the hierarchy (optional)
     * @public
     */
    MultiDimDataProvider.prototype.setDisplayHierarchy = function () {
    };
    /**
     * get the list of filters of a dimension
     * @param {string} sDim the name of the dimension
     * from which the filter is retrieved
     * @return {object[]} list of a range with components
     * <ul>
     * <li><code>Low</code>: The Low value of the range
     * <li><code>High</code>: The High value of the range
     * <li><code>Operator</code>: The Operator: EQ,LE,..,BT
     * <ul>
     * @public
     */
    MultiDimDataProvider.prototype.getFilterOfDim = function () {
    };
    /**
     * retrieve the data of the current naviation state <code>MultiDimDataProvider</code> from the InA Server.
     * @return {Promise<this>} to allow chaining.
     * @public
     */
    MultiDimDataProvider.prototype.synchronize = function () {
    };
    /**
     * Gets the scaling factor of a measure
     * @param {string} sMeasureMember the Member of the Measure Structure
     * @param {string} sNonMeasureMember the Member of the Non Measure Structure
     * @return {int} the exponent of the scaling factor in Base 10
     * @public
     */
    MultiDimDataProvider.prototype.getScalingFactor = function () {
    };
    /**
     * Sets the scaling factor of a measure/query cell
     * @param {int} nFactor the exponential of the scaling factor
     * @param {string} sMeasureMember the Member of the Measure Structure
     * @param {string} sNonMeasureMember the Member of the Non Measure Structure
     * @return {this} the MultiDimDataProvider
     * @public
     */
    MultiDimDataProvider.prototype.setScalingFactor = function () {
    };
    /**
     * Gets the scaling factor of a measure or data cell
     * @param {string} sMeasureMember the Member of the Measure Structure
     * @param {string} sNonMeasureMember the Member of the Non Measure Structure, if this is not given the value for the sMeasureMember is returned
     * @return {int} the current decimal places setting
     * @public
     */
    MultiDimDataProvider.prototype.getDecimalPlaces = function () {
    };
    /**
     * Sets the number of decimal  of a measure/query cell
     * @param {int} nNumberOfDecimalPlaces number of the decimal palaces to be shown after the separator
     * @param {string} sMeasureMember the Member of the Measure Structure
     * @param {string} the Member of the Non Measure Structure, if this is not given the setting is applied for the whole sMeasureMember
     * @return {this} the MultiDimDataProvider
     * @public
     */
    MultiDimDataProvider.prototype.setDecimalPlaces = function () {
    };
    /**
     * Gets the cell context for a data cell in the result set
     * @param {int} nRowIndex the row index
     * @param {int} nColumnIndex the column index
     * @returns {Promise<Object>} a promise which resolves with the retrieved cell context
     */
    MultiDimDataProvider.prototype.getCellContext = function () {
    };
    /**
     * Creates a document ID for a data cell in the result set
     * @param {int} nRowIndex the row index
     * @param {int} nColumnIndex the column index
     * @returns {Promise<String>} a promise which resolves with the newly created document ID
     */
    MultiDimDataProvider.prototype.createDocumentId = function () {
    };
    /**
     * Gets a document ID of a data cell in the result set
     * @param {int} nRowIndex the row index
     * @param {int} nColumnIndex the column index
     * @returns {Promise<String>} a promise which resolves with the document ID
     */
    MultiDimDataProvider.prototype.getDocumentId = function () {
    };
    /**
     * Deletes a document ID for a data cell in the result set
     * @param {int} nRowIndex the row index
     * @param {int} nColumnIndex the column index
     * @returns {Promise<boolean>} a promise which resolves to true if the delete operation is successful, otherwise false.
     */
    MultiDimDataProvider.prototype.deleteDocumentId = function () {
    };

    /**
     * Creates a document in the document store
     * @param sDocumentId the document ID
     * @param sContent the content of the document
     * @returns {Promise<boolean>} a promise which resolves to true if create operation is successful, otherwise false.
     */
    MultiDimDataProvider.prototype.createDocument = function () {
    };

    /**
     * Retrieves a document from the document store
     * @param sDocumentId the document ID
     * @param sVersion the version of the document - if version is not supplied, returns all versions.
     * @returns {Promise<object>} a promise which resolves with the version(s) of the document.
     */
    MultiDimDataProvider.prototype.retrieveDocument = function () {
    };

    /**
     * Retrieves multiple documents from the document store
     * @param aDocumentIds the array of document IDs
     * @returns {Promise<object>} a promise which resolves with all documents and its versions.
     */
    MultiDimDataProvider.prototype.retrieveMultipleDocuments = function () {
    };

    /**
     * Updates a document in the document store
     * @param sDocumentId the document ID
     * @param sContent the content of the document
     * @returns {Promise<boolean>} a promise which resolves to true if update operation is successful, otherwise false.
     */
    MultiDimDataProvider.prototype.updateDocument = function () {
    };

    /**
     * Deletes a document in the document store
     * @param sDocumentId the document ID
     * @returns {Promise<boolean>} a promise which resolves to true if delete operation is successful, otherwise false.
     */
    MultiDimDataProvider.prototype.deleteDocument = function () {
    };

    /**
     * Checks whether an InA capability is supported by the backend.
     * Throws an error for unhandled capabilities.
     * List of handled capabilities can be seen in type sap.sac.df.olap.Capability
     * @param sCapability the capability name
     * @returns {boolean} returns true, if the capability is supported, else false
     */
    MultiDimDataProvider.prototype.supportsCapability = function () {

    };

    /**
     * Gets the type of DocumentsSupport.
     * @returns {string} DocumentsSupport type
     */
    MultiDimDataProvider.prototype.getDocumentsSupportType = function () {

    };

    return MultiDimDataProvider;
  }
);
