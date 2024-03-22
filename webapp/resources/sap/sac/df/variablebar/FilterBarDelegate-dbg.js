/*global sap,Promise*/
sap.ui.define("sap/sac/df/variablebar/FilterBarDelegate", [
  "sap/ui/mdc/FilterBarDelegate",
  "sap/sac/df/variablebar/FilterBarHandler",
  "sap/sac/df/variablebar/TypeUtil",
  "sap/sac/df/thirdparty/lodash"
], function (FilterBarDelegate, FilterHandler, DragonFlyTypeUtil, _) {
  "use strict";
  var DragonFlyFilterBarDelegate = Object.assign({}, FilterBarDelegate);
  DragonFlyFilterBarDelegate.apiVersion = 2;

  DragonFlyFilterBarDelegate._getDataProvider = function (oFilterBar) {
    var oDataProvider = oFilterBar._oFilterBarHandler._getDataProvider();
    if (oDataProvider) {
      return Promise.resolve(oDataProvider);
    }

    //when user variant as default variant, the method is called before query added
    return new Promise(function (resolve) {
      oFilterBar._getMultiDimModel().attachEventOnce("queryAdded", null, function () {
        resolve(oFilterBar._oFilterBarHandler._getDataProvider());
      }, DragonFlyFilterBarDelegate);
    });
  };

  DragonFlyFilterBarDelegate.fetchProperties = function (oFilterBar) {
    return DragonFlyFilterBarDelegate._getDataProvider(oFilterBar).then(function () {
      var aProperties = [];
      _.forEach(oFilterBar._oFilterBarHandler._getVariables(), function (oVariableDefinition) {
        var oVariable = oVariableDefinition.MergedVariable ? oVariableDefinition.MergedVariable : oVariableDefinition;
        var oFormatOptions = DragonFlyTypeUtil.getFormatOptions(oVariable.ValueType);
        var bIsDate = oVariable.ValueType.includes("Date");
        var oProperty = {
          name: oVariable.Name,
          label: oVariable.Description,
          //path: oFilterBar._oFilterBarHandler._getPathToVariable(oVariable.Name),
          typeConfig: DragonFlyFilterBarDelegate.getTypeUtil().getTypeConfig(oVariable.ValueType, oFormatOptions ? oFormatOptions : null, null),
          dataType: oVariable.ValueType,
          maxConditions: bIsDate || !oVariable.SupportsMultipleValues ? 1 : -1,
          group: oVariableDefinition.Group ? oVariableDefinition.Group : "_basicSearch",
          groupLabel: oFilterBar.getModel("i18n").getResourceBundle().getText(oVariableDefinition.Group ? oVariableDefinition.Group : ""),
          required: oVariable.Mandatory,
          hasValueHelp: oVariable.SupportsValueHelp,
          caseSensitive: false
        };
        aProperties.push(oProperty);
      });
      return aProperties;
    });
  };

  DragonFlyFilterBarDelegate.addItem = function (oFilterBar, sVariableName, mPropertyBag) {
    return DragonFlyFilterBarDelegate._getDataProvider(oFilterBar).then(function () {
      var oVariable = oFilterBar._oFilterBarHandler._getVariable(sVariableName);
      var bIsFilterFieldCreated = mPropertyBag ? mPropertyBag.modifier.checkControlId(FilterHandler.getFilterFieldId(oFilterBar, sVariableName)) : false;
      var oFilterField = bIsFilterFieldCreated && sap.ui.getCore().byId(FilterHandler.getFilterFieldId(oFilterBar, sVariableName));
      oFilterField = oFilterField ? oFilterField : FilterHandler.createFilterField(oVariable, oFilterBar);
      return oFilterField;
    });
  };

  DragonFlyFilterBarDelegate.addCondition = function (oFilterBar, sVariableName) {
    return DragonFlyFilterBarDelegate._getDataProvider(oFilterBar).then(function (oDataProvider) {
      var oVariable = oFilterBar._oFilterBarHandler._getVariable(sVariableName);
      var aMemberFilter = oVariable.MemberFilter;
      var aConditions = oFilterBar.getConditions()[sVariableName];
      var aValidMemberFilter = [];
      var aCurrentMemberFilter = [];
      aMemberFilter.forEach(function (oMemberFilter) {
        if (oMemberFilter.Low || oMemberFilter.LowText) {
          aValidMemberFilter.push(oMemberFilter);
        }
      });
      if (aValidMemberFilter.length) {
        aCurrentMemberFilter = [].concat(aValidMemberFilter);
      }
      var oNewMemberFilter = {
        "ComparisonOperator": "EQUAL"
      };
      var bHasNewFilter = false;
      if (aConditions) {
        aConditions.forEach(function(oCondition){
          var bExist = aMemberFilter.find(function(oMemberFilter){
            return oCondition.values[0] === oMemberFilter.Low;
          });

          if (!bExist || !aMemberFilter.length) {
            bHasNewFilter = true;
            oNewMemberFilter.Low = oCondition.values[0];

            if (oCondition.values[1]) {
              oNewMemberFilter.LowText = oCondition.values[1];
            }
            aCurrentMemberFilter.push(oNewMemberFilter);
          }
        });
      }
      if (bHasNewFilter) {
        oFilterBar.fireBeforeFilterChange({beforeValueHelpOpen: false});
      }
      return Promise.resolve(bHasNewFilter ? oDataProvider.setVariableValue(sVariableName, aCurrentMemberFilter) : true);
    });
  };

  DragonFlyFilterBarDelegate.removeCondition = function (oFilterBar, sVariableName) {
    return DragonFlyFilterBarDelegate._getDataProvider(oFilterBar).then(function (oDataProvider) {
      var oVariable = oFilterBar._oFilterBarHandler._getVariable(sVariableName);
      var aConditions = oFilterBar.getConditions()[sVariableName];
      var aMemberFilter = oVariable.MemberFilter;
      var aCurrentMemberFilter = [];
      aMemberFilter.forEach(function (oMemberFilter) {
        var oCondition = aConditions.find(function (oItem) {
          return oItem.values[0] === oMemberFilter.Low;
        });
        if (oCondition) {
          aCurrentMemberFilter.push(oMemberFilter);
        }
      });

      oFilterBar.fireBeforeFilterChange({beforeValueHelpOpen: false});
      return Promise.resolve(oDataProvider.setVariableValue(sVariableName, aCurrentMemberFilter));
    });
  };

  DragonFlyFilterBarDelegate.getTypeUtil = function () {
    return DragonFlyTypeUtil;
  };

  return DragonFlyFilterBarDelegate;
});
