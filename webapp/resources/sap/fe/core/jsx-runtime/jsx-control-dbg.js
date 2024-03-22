/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit", "sap/m/Text", "sap/ui/base/DataType", "sap/ui/core/mvc/EventHandlerResolver"], function (BindingToolkit, Text, DataType, EventHandlerResolver) {
  "use strict";

  var isConstant = BindingToolkit.isConstant;
  var isBindingToolkitExpression = BindingToolkit.isBindingToolkitExpression;
  var compileExpression = BindingToolkit.compileExpression;
  var compileConstant = BindingToolkit.compileConstant;
  const addChildAggregation = function (aggregationChildren, aggregationName, child) {
    if (child === undefined || typeof child === "string") {
      return;
    }
    if (!aggregationChildren[aggregationName]) {
      aggregationChildren[aggregationName] = [];
    }
    if (isChildAnElement(child)) {
      aggregationChildren[aggregationName].push(child);
    } else if (Array.isArray(child)) {
      child.forEach(subChild => {
        addChildAggregation(aggregationChildren, aggregationName, subChild);
      });
    } else {
      Object.keys(child).forEach(childKey => {
        addChildAggregation(aggregationChildren, childKey, child[childKey]);
      });
    }
  };
  const isChildAnElement = function (children) {
    var _isA, _ref;
    return children === null || children === void 0 ? void 0 : (_isA = (_ref = children).isA) === null || _isA === void 0 ? void 0 : _isA.call(_ref, "sap.ui.core.Element");
  };
  const isAControl = function (children) {
    return !!(children !== null && children !== void 0 && children.getMetadata);
  };
  function processAggregations(metadata, mSettings) {
    const metadataAggregations = metadata.getAllAggregations();
    const defaultAggregationName = metadata.getDefaultAggregationName();
    const aggregationChildren = {};
    addChildAggregation(aggregationChildren, defaultAggregationName, mSettings.children);
    delete mSettings.children;
    // find out which aggregation are bound (both in children and directly under it)
    Object.keys(metadataAggregations).forEach(aggregationName => {
      if (aggregationChildren[aggregationName] !== undefined) {
        if (mSettings.hasOwnProperty(aggregationName)) {
          // always use the first item as template according to UI5 logic
          mSettings[aggregationName].template = aggregationChildren[aggregationName][0];
        } else {
          mSettings[aggregationName] = aggregationChildren[aggregationName];
        }
      }
    });
  }

  /**
   * Processes the properties.
   *
   * If the property is a bindingToolkit expression we need to compile it.
   * Else if the property is set as string (compiled binding expression returns string by default even if it's a boolean, int, etc.) and it doesn't match with expected
   * format the value is parsed to provide expected format.
   *
   * @param metadata Metadata of the control
   * @param settings Settings of the control
   * @returns {void}
   */
  function processProperties(metadata, settings) {
    let settingsKey;
    for (settingsKey in settings) {
      const value = settings[settingsKey];
      if (isBindingToolkitExpression(value)) {
        const bindingToolkitExpression = value;
        if (isConstant(bindingToolkitExpression)) {
          settings[settingsKey] = compileConstant(bindingToolkitExpression, false, true, true);
        } else {
          settings[settingsKey] = compileExpression(bindingToolkitExpression);
        }
      } else if (typeof value === "string" && !value.startsWith("{")) {
        var _metadata$getAllPrope, _metadata$getAllPrope2, _metadata$getAllPrope3;
        const propertyType = (_metadata$getAllPrope = metadata.getAllProperties()[settingsKey]) === null || _metadata$getAllPrope === void 0 ? void 0 : (_metadata$getAllPrope2 = (_metadata$getAllPrope3 = _metadata$getAllPrope).getType) === null || _metadata$getAllPrope2 === void 0 ? void 0 : _metadata$getAllPrope2.call(_metadata$getAllPrope3);
        if (propertyType && propertyType instanceof DataType && ["boolean", "int", "float"].indexOf(propertyType.getName()) > -1) {
          settings[settingsKey] = propertyType.parseValue(value);
        }
      }
    }
  }

  /**
   * Processes the command.
   *
   * Resolves the command set on the control via the intrinsic class attribute "jsx:command".
   * If no command has been set or the targeted event doesn't exist, no configuration is set.
   *
   * @param metadata Metadata of the control
   * @param settings Settings of the control
   * @returns {void}
   */
  function processCommand(metadata, settings) {
    const commandProperty = settings["jsx:command"];
    if (commandProperty) {
      const [command, eventName] = commandProperty.split("|");
      const event = metadata.getAllEvents()[eventName];
      if (event && command.startsWith("cmd:")) {
        settings[event.name] = EventHandlerResolver.resolveEventHandler(command);
      }
    }
    delete settings["jsx:command"];
  }
  const jsxControl = function (ControlType, settings, key, jsxContext) {
    let targetControl;
    if (ControlType !== null && ControlType !== void 0 && ControlType.isFragment) {
      targetControl = settings.children;
    } else if (ControlType !== null && ControlType !== void 0 && ControlType.isRuntime) {
      const runtimeBuildingBlock = new ControlType(settings);
      targetControl = runtimeBuildingBlock.getContent(jsxContext.view, jsxContext.appComponent);
    } else if (isAControl(ControlType)) {
      const metadata = ControlType.getMetadata();
      if (key !== undefined) {
        settings["key"] = key;
      }
      processCommand(metadata, settings);
      processAggregations(metadata, settings);
      const classDef = settings.class;
      const refDef = settings.ref;
      delete settings.ref;
      delete settings.class;
      processProperties(metadata, settings);
      targetControl = new ControlType(settings);
      if (classDef) {
        targetControl.addStyleClass(classDef);
      }
      if (refDef) {
        refDef.setCurrent(targetControl);
      }
    } else if (typeof ControlType === "function") {
      const controlTypeFn = ControlType;
      targetControl = controlTypeFn(settings);
    } else {
      targetControl = new Text({
        text: "Missing component " + ControlType
      });
    }
    return targetControl;
  };
  return jsxControl;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhZGRDaGlsZEFnZ3JlZ2F0aW9uIiwiYWdncmVnYXRpb25DaGlsZHJlbiIsImFnZ3JlZ2F0aW9uTmFtZSIsImNoaWxkIiwidW5kZWZpbmVkIiwiaXNDaGlsZEFuRWxlbWVudCIsInB1c2giLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwic3ViQ2hpbGQiLCJPYmplY3QiLCJrZXlzIiwiY2hpbGRLZXkiLCJjaGlsZHJlbiIsImlzQSIsImlzQUNvbnRyb2wiLCJnZXRNZXRhZGF0YSIsInByb2Nlc3NBZ2dyZWdhdGlvbnMiLCJtZXRhZGF0YSIsIm1TZXR0aW5ncyIsIm1ldGFkYXRhQWdncmVnYXRpb25zIiwiZ2V0QWxsQWdncmVnYXRpb25zIiwiZGVmYXVsdEFnZ3JlZ2F0aW9uTmFtZSIsImdldERlZmF1bHRBZ2dyZWdhdGlvbk5hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsInRlbXBsYXRlIiwicHJvY2Vzc1Byb3BlcnRpZXMiLCJzZXR0aW5ncyIsInNldHRpbmdzS2V5IiwidmFsdWUiLCJpc0JpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiIsImJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiIsImlzQ29uc3RhbnQiLCJjb21waWxlQ29uc3RhbnQiLCJjb21waWxlRXhwcmVzc2lvbiIsInN0YXJ0c1dpdGgiLCJwcm9wZXJ0eVR5cGUiLCJnZXRBbGxQcm9wZXJ0aWVzIiwiZ2V0VHlwZSIsIkRhdGFUeXBlIiwiaW5kZXhPZiIsImdldE5hbWUiLCJwYXJzZVZhbHVlIiwicHJvY2Vzc0NvbW1hbmQiLCJjb21tYW5kUHJvcGVydHkiLCJjb21tYW5kIiwiZXZlbnROYW1lIiwic3BsaXQiLCJldmVudCIsImdldEFsbEV2ZW50cyIsIm5hbWUiLCJFdmVudEhhbmRsZXJSZXNvbHZlciIsInJlc29sdmVFdmVudEhhbmRsZXIiLCJqc3hDb250cm9sIiwiQ29udHJvbFR5cGUiLCJrZXkiLCJqc3hDb250ZXh0IiwidGFyZ2V0Q29udHJvbCIsImlzRnJhZ21lbnQiLCJpc1J1bnRpbWUiLCJydW50aW1lQnVpbGRpbmdCbG9jayIsImdldENvbnRlbnQiLCJ2aWV3IiwiYXBwQ29tcG9uZW50IiwiY2xhc3NEZWYiLCJjbGFzcyIsInJlZkRlZiIsInJlZiIsImFkZFN0eWxlQ2xhc3MiLCJzZXRDdXJyZW50IiwiY29udHJvbFR5cGVGbiIsIlRleHQiLCJ0ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJqc3gtY29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlQ29uc3RhbnQsIGNvbXBpbGVFeHByZXNzaW9uLCBpc0JpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgaXNDb25zdGFudCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IENvbnRyb2xQcm9wZXJ0aWVzLCBKU1hDb250ZXh0LCBOb25Db250cm9sUHJvcGVydGllcywgUmVmIH0gZnJvbSBcInNhcC9mZS9jb3JlL2pzeC1ydW50aW1lL2pzeFwiO1xuaW1wb3J0IFRleHQgZnJvbSBcInNhcC9tL1RleHRcIjtcbmltcG9ydCBEYXRhVHlwZSBmcm9tIFwic2FwL3VpL2Jhc2UvRGF0YVR5cGVcIjtcbmltcG9ydCB0eXBlIE1hbmFnZWRPYmplY3RNZXRhZGF0YSBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdE1ldGFkYXRhXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSB7ICRDb250cm9sU2V0dGluZ3MgfSBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgRWxlbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRWxlbWVudFwiO1xuaW1wb3J0IEV2ZW50SGFuZGxlclJlc29sdmVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvRXZlbnRIYW5kbGVyUmVzb2x2ZXJcIjtcblxuY29uc3QgYWRkQ2hpbGRBZ2dyZWdhdGlvbiA9IGZ1bmN0aW9uIChhZ2dyZWdhdGlvbkNoaWxkcmVuOiBhbnksIGFnZ3JlZ2F0aW9uTmFtZTogc3RyaW5nLCBjaGlsZDogYW55KSB7XG5cdGlmIChjaGlsZCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBjaGlsZCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHJldHVybjtcblx0fVxuXHRpZiAoIWFnZ3JlZ2F0aW9uQ2hpbGRyZW5bYWdncmVnYXRpb25OYW1lXSkge1xuXHRcdGFnZ3JlZ2F0aW9uQ2hpbGRyZW5bYWdncmVnYXRpb25OYW1lXSA9IFtdO1xuXHR9XG5cdGlmIChpc0NoaWxkQW5FbGVtZW50KGNoaWxkKSkge1xuXHRcdGFnZ3JlZ2F0aW9uQ2hpbGRyZW5bYWdncmVnYXRpb25OYW1lXS5wdXNoKGNoaWxkKTtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGNoaWxkKSkge1xuXHRcdGNoaWxkLmZvckVhY2goKHN1YkNoaWxkKSA9PiB7XG5cdFx0XHRhZGRDaGlsZEFnZ3JlZ2F0aW9uKGFnZ3JlZ2F0aW9uQ2hpbGRyZW4sIGFnZ3JlZ2F0aW9uTmFtZSwgc3ViQ2hpbGQpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdE9iamVjdC5rZXlzKGNoaWxkKS5mb3JFYWNoKChjaGlsZEtleSkgPT4ge1xuXHRcdFx0YWRkQ2hpbGRBZ2dyZWdhdGlvbihhZ2dyZWdhdGlvbkNoaWxkcmVuLCBjaGlsZEtleSwgY2hpbGRbY2hpbGRLZXldKTtcblx0XHR9KTtcblx0fVxufTtcbmNvbnN0IGlzQ2hpbGRBbkVsZW1lbnQgPSBmdW5jdGlvbiA8VD4oY2hpbGRyZW4/OiBFbGVtZW50IHwgQ29udHJvbFByb3BlcnRpZXM8VD4pOiBjaGlsZHJlbiBpcyBFbGVtZW50IHtcblx0cmV0dXJuIChjaGlsZHJlbiBhcyBFbGVtZW50KT8uaXNBPy4oXCJzYXAudWkuY29yZS5FbGVtZW50XCIpO1xufTtcbmNvbnN0IGlzQUNvbnRyb2wgPSBmdW5jdGlvbiAoY2hpbGRyZW4/OiB0eXBlb2YgQ29udHJvbCB8IEZ1bmN0aW9uKTogY2hpbGRyZW4gaXMgdHlwZW9mIENvbnRyb2wge1xuXHRyZXR1cm4gISEoY2hpbGRyZW4gYXMgdHlwZW9mIENvbnRyb2wpPy5nZXRNZXRhZGF0YTtcbn07XG5cbmZ1bmN0aW9uIHByb2Nlc3NBZ2dyZWdhdGlvbnMobWV0YWRhdGE6IE1hbmFnZWRPYmplY3RNZXRhZGF0YSwgbVNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXHRjb25zdCBtZXRhZGF0YUFnZ3JlZ2F0aW9ucyA9IG1ldGFkYXRhLmdldEFsbEFnZ3JlZ2F0aW9ucygpO1xuXHRjb25zdCBkZWZhdWx0QWdncmVnYXRpb25OYW1lID0gbWV0YWRhdGEuZ2V0RGVmYXVsdEFnZ3JlZ2F0aW9uTmFtZSgpO1xuXHRjb25zdCBhZ2dyZWdhdGlvbkNoaWxkcmVuOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcblx0YWRkQ2hpbGRBZ2dyZWdhdGlvbihhZ2dyZWdhdGlvbkNoaWxkcmVuLCBkZWZhdWx0QWdncmVnYXRpb25OYW1lLCBtU2V0dGluZ3MuY2hpbGRyZW4pO1xuXHRkZWxldGUgbVNldHRpbmdzLmNoaWxkcmVuO1xuXHQvLyBmaW5kIG91dCB3aGljaCBhZ2dyZWdhdGlvbiBhcmUgYm91bmQgKGJvdGggaW4gY2hpbGRyZW4gYW5kIGRpcmVjdGx5IHVuZGVyIGl0KVxuXHRPYmplY3Qua2V5cyhtZXRhZGF0YUFnZ3JlZ2F0aW9ucykuZm9yRWFjaCgoYWdncmVnYXRpb25OYW1lKSA9PiB7XG5cdFx0aWYgKGFnZ3JlZ2F0aW9uQ2hpbGRyZW5bYWdncmVnYXRpb25OYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAobVNldHRpbmdzLmhhc093blByb3BlcnR5KGFnZ3JlZ2F0aW9uTmFtZSkpIHtcblx0XHRcdFx0Ly8gYWx3YXlzIHVzZSB0aGUgZmlyc3QgaXRlbSBhcyB0ZW1wbGF0ZSBhY2NvcmRpbmcgdG8gVUk1IGxvZ2ljXG5cdFx0XHRcdChtU2V0dGluZ3MgYXMgYW55KVthZ2dyZWdhdGlvbk5hbWVdLnRlbXBsYXRlID0gYWdncmVnYXRpb25DaGlsZHJlblthZ2dyZWdhdGlvbk5hbWVdWzBdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0KG1TZXR0aW5ncyBhcyBhbnkpW2FnZ3JlZ2F0aW9uTmFtZV0gPSBhZ2dyZWdhdGlvbkNoaWxkcmVuW2FnZ3JlZ2F0aW9uTmFtZV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzZXMgdGhlIHByb3BlcnRpZXMuXG4gKlxuICogSWYgdGhlIHByb3BlcnR5IGlzIGEgYmluZGluZ1Rvb2xraXQgZXhwcmVzc2lvbiB3ZSBuZWVkIHRvIGNvbXBpbGUgaXQuXG4gKiBFbHNlIGlmIHRoZSBwcm9wZXJ0eSBpcyBzZXQgYXMgc3RyaW5nIChjb21waWxlZCBiaW5kaW5nIGV4cHJlc3Npb24gcmV0dXJucyBzdHJpbmcgYnkgZGVmYXVsdCBldmVuIGlmIGl0J3MgYSBib29sZWFuLCBpbnQsIGV0Yy4pIGFuZCBpdCBkb2Vzbid0IG1hdGNoIHdpdGggZXhwZWN0ZWRcbiAqIGZvcm1hdCB0aGUgdmFsdWUgaXMgcGFyc2VkIHRvIHByb3ZpZGUgZXhwZWN0ZWQgZm9ybWF0LlxuICpcbiAqIEBwYXJhbSBtZXRhZGF0YSBNZXRhZGF0YSBvZiB0aGUgY29udHJvbFxuICogQHBhcmFtIHNldHRpbmdzIFNldHRpbmdzIG9mIHRoZSBjb250cm9sXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1Byb3BlcnRpZXMobWV0YWRhdGE6IE1hbmFnZWRPYmplY3RNZXRhZGF0YSwgc2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSB7XG5cdGxldCBzZXR0aW5nc0tleToga2V5b2YgdHlwZW9mIHNldHRpbmdzO1xuXHRmb3IgKHNldHRpbmdzS2V5IGluIHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBzZXR0aW5nc1tzZXR0aW5nc0tleV07XG5cdFx0aWYgKGlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uKHZhbHVlKSkge1xuXHRcdFx0Y29uc3QgYmluZGluZ1Rvb2xraXRFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248dW5rbm93bj4gPSB2YWx1ZTtcblx0XHRcdGlmIChpc0NvbnN0YW50KGJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbikpIHtcblx0XHRcdFx0c2V0dGluZ3Nbc2V0dGluZ3NLZXldID0gY29tcGlsZUNvbnN0YW50KGJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgZmFsc2UsIHRydWUsIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0dGluZ3Nbc2V0dGluZ3NLZXldID0gY29tcGlsZUV4cHJlc3Npb24oYmluZGluZ1Rvb2xraXRFeHByZXNzaW9uKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAhdmFsdWUuc3RhcnRzV2l0aChcIntcIikpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5VHlwZSA9IChtZXRhZGF0YS5nZXRBbGxQcm9wZXJ0aWVzKClbc2V0dGluZ3NLZXldIGFzIGFueSk/LmdldFR5cGU/LigpO1xuXHRcdFx0aWYgKHByb3BlcnR5VHlwZSAmJiBwcm9wZXJ0eVR5cGUgaW5zdGFuY2VvZiBEYXRhVHlwZSAmJiBbXCJib29sZWFuXCIsIFwiaW50XCIsIFwiZmxvYXRcIl0uaW5kZXhPZihwcm9wZXJ0eVR5cGUuZ2V0TmFtZSgpKSA+IC0xKSB7XG5cdFx0XHRcdHNldHRpbmdzW3NldHRpbmdzS2V5XSA9IHByb3BlcnR5VHlwZS5wYXJzZVZhbHVlKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzZXMgdGhlIGNvbW1hbmQuXG4gKlxuICogUmVzb2x2ZXMgdGhlIGNvbW1hbmQgc2V0IG9uIHRoZSBjb250cm9sIHZpYSB0aGUgaW50cmluc2ljIGNsYXNzIGF0dHJpYnV0ZSBcImpzeDpjb21tYW5kXCIuXG4gKiBJZiBubyBjb21tYW5kIGhhcyBiZWVuIHNldCBvciB0aGUgdGFyZ2V0ZWQgZXZlbnQgZG9lc24ndCBleGlzdCwgbm8gY29uZmlndXJhdGlvbiBpcyBzZXQuXG4gKlxuICogQHBhcmFtIG1ldGFkYXRhIE1ldGFkYXRhIG9mIHRoZSBjb250cm9sXG4gKiBAcGFyYW0gc2V0dGluZ3MgU2V0dGluZ3Mgb2YgdGhlIGNvbnRyb2xcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29tbWFuZChtZXRhZGF0YTogTWFuYWdlZE9iamVjdE1ldGFkYXRhLCBzZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIHtcblx0Y29uc3QgY29tbWFuZFByb3BlcnR5ID0gc2V0dGluZ3NbXCJqc3g6Y29tbWFuZFwiXTtcblx0aWYgKGNvbW1hbmRQcm9wZXJ0eSkge1xuXHRcdGNvbnN0IFtjb21tYW5kLCBldmVudE5hbWVdID0gKGNvbW1hbmRQcm9wZXJ0eSBhcyBzdHJpbmcpLnNwbGl0KFwifFwiKTtcblx0XHRjb25zdCBldmVudCA9IG1ldGFkYXRhLmdldEFsbEV2ZW50cygpW2V2ZW50TmFtZV07XG5cdFx0aWYgKGV2ZW50ICYmIGNvbW1hbmQuc3RhcnRzV2l0aChcImNtZDpcIikpIHtcblx0XHRcdHNldHRpbmdzW2V2ZW50Lm5hbWVdID0gRXZlbnRIYW5kbGVyUmVzb2x2ZXIucmVzb2x2ZUV2ZW50SGFuZGxlcihjb21tYW5kKTtcblx0XHR9XG5cdH1cblx0ZGVsZXRlIHNldHRpbmdzW1wianN4OmNvbW1hbmRcIl07XG59XG5cbmNvbnN0IGpzeENvbnRyb2wgPSBmdW5jdGlvbiA8VCBleHRlbmRzIEVsZW1lbnQ+KFxuXHRDb250cm9sVHlwZTogdHlwZW9mIENvbnRyb2wgfCBGdW5jdGlvbixcblx0c2V0dGluZ3M6IE5vbkNvbnRyb2xQcm9wZXJ0aWVzPFQ+ICYgeyBrZXk6IHN0cmluZzsgY2hpbGRyZW4/OiBFbGVtZW50IHwgQ29udHJvbFByb3BlcnRpZXM8VD47IHJlZj86IFJlZjxUPjsgY2xhc3M/OiBzdHJpbmcgfSxcblx0a2V5OiBzdHJpbmcsXG5cdGpzeENvbnRleHQ6IEpTWENvbnRleHRcbik6IENvbnRyb2wgfCBDb250cm9sW10ge1xuXHRsZXQgdGFyZ2V0Q29udHJvbDtcblxuXHRpZiAoKENvbnRyb2xUeXBlIGFzIGFueSk/LmlzRnJhZ21lbnQpIHtcblx0XHR0YXJnZXRDb250cm9sID0gc2V0dGluZ3MuY2hpbGRyZW47XG5cdH0gZWxzZSBpZiAoKENvbnRyb2xUeXBlIGFzIHR5cGVvZiBCdWlsZGluZ0Jsb2NrQmFzZSk/LmlzUnVudGltZSkge1xuXHRcdGNvbnN0IHJ1bnRpbWVCdWlsZGluZ0Jsb2NrID0gbmV3IChDb250cm9sVHlwZSBhcyBhbnkpKHNldHRpbmdzKTtcblx0XHR0YXJnZXRDb250cm9sID0gcnVudGltZUJ1aWxkaW5nQmxvY2suZ2V0Q29udGVudChqc3hDb250ZXh0LnZpZXcsIGpzeENvbnRleHQuYXBwQ29tcG9uZW50KTtcblx0fSBlbHNlIGlmIChpc0FDb250cm9sKENvbnRyb2xUeXBlKSkge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gQ29udHJvbFR5cGUuZ2V0TWV0YWRhdGEoKTtcblx0XHRpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHNldHRpbmdzW1wia2V5XCJdID0ga2V5O1xuXHRcdH1cblx0XHRwcm9jZXNzQ29tbWFuZChtZXRhZGF0YSwgc2V0dGluZ3MpO1xuXHRcdHByb2Nlc3NBZ2dyZWdhdGlvbnMobWV0YWRhdGEsIHNldHRpbmdzKTtcblx0XHRjb25zdCBjbGFzc0RlZiA9IHNldHRpbmdzLmNsYXNzO1xuXHRcdGNvbnN0IHJlZkRlZiA9IHNldHRpbmdzLnJlZjtcblx0XHRkZWxldGUgc2V0dGluZ3MucmVmO1xuXHRcdGRlbGV0ZSBzZXR0aW5ncy5jbGFzcztcblx0XHRwcm9jZXNzUHJvcGVydGllcyhtZXRhZGF0YSwgc2V0dGluZ3MpO1xuXHRcdHRhcmdldENvbnRyb2wgPSBuZXcgQ29udHJvbFR5cGUoc2V0dGluZ3MgYXMgJENvbnRyb2xTZXR0aW5ncyk7XG5cdFx0aWYgKGNsYXNzRGVmKSB7XG5cdFx0XHR0YXJnZXRDb250cm9sLmFkZFN0eWxlQ2xhc3MoY2xhc3NEZWYpO1xuXHRcdH1cblx0XHRpZiAocmVmRGVmKSB7XG5cdFx0XHRyZWZEZWYuc2V0Q3VycmVudCh0YXJnZXRDb250cm9sIGFzIGFueSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKHR5cGVvZiBDb250cm9sVHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0Y29uc3QgY29udHJvbFR5cGVGbiA9IENvbnRyb2xUeXBlO1xuXHRcdHRhcmdldENvbnRyb2wgPSBjb250cm9sVHlwZUZuKHNldHRpbmdzIGFzICRDb250cm9sU2V0dGluZ3MpO1xuXHR9IGVsc2Uge1xuXHRcdHRhcmdldENvbnRyb2wgPSBuZXcgVGV4dCh7IHRleHQ6IFwiTWlzc2luZyBjb21wb25lbnQgXCIgKyAoQ29udHJvbFR5cGUgYXMgYW55KSB9KTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXRDb250cm9sO1xufTtcblxuZXhwb3J0IGRlZmF1bHQganN4Q29udHJvbDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7RUFZQSxNQUFNQSxtQkFBbUIsR0FBRyxVQUFVQyxtQkFBd0IsRUFBRUMsZUFBdUIsRUFBRUMsS0FBVSxFQUFFO0lBQ3BHLElBQUlBLEtBQUssS0FBS0MsU0FBUyxJQUFJLE9BQU9ELEtBQUssS0FBSyxRQUFRLEVBQUU7TUFDckQ7SUFDRDtJQUNBLElBQUksQ0FBQ0YsbUJBQW1CLENBQUNDLGVBQWUsQ0FBQyxFQUFFO01BQzFDRCxtQkFBbUIsQ0FBQ0MsZUFBZSxDQUFDLEdBQUcsRUFBRTtJQUMxQztJQUNBLElBQUlHLGdCQUFnQixDQUFDRixLQUFLLENBQUMs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