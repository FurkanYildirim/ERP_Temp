/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards", "./AnnotationEnum"], function (TypeGuards, AnnotationEnum) {
  "use strict";

  var _exports = {};
  var resolveEnumValue = AnnotationEnum.resolveEnumValue;
  var isProperty = TypeGuards.isProperty;
  const EDM_TYPE_MAPPING = {
    "Edm.Boolean": {
      type: "sap.ui.model.odata.type.Boolean"
    },
    "Edm.Byte": {
      type: "sap.ui.model.odata.type.Byte"
    },
    "Edm.Date": {
      type: "sap.ui.model.odata.type.Date"
    },
    "Edm.DateTimeOffset": {
      constraints: {
        $Precision: "precision",
        $V4: "V4"
      },
      type: "sap.ui.model.odata.type.DateTimeOffset"
    },
    "Edm.Decimal": {
      constraints: {
        "@Org.OData.Validation.V1.Minimum/$Decimal": "minimum",
        "@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive": "minimumExclusive",
        "@Org.OData.Validation.V1.Maximum/$Decimal": "maximum",
        "@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive": "maximumExclusive",
        $Precision: "precision",
        $Scale: "scale"
      },
      type: "sap.ui.model.odata.type.Decimal"
    },
    "Edm.Double": {
      type: "sap.ui.model.odata.type.Double"
    },
    "Edm.Guid": {
      type: "sap.ui.model.odata.type.Guid"
    },
    "Edm.Int16": {
      type: "sap.ui.model.odata.type.Int16"
    },
    "Edm.Int32": {
      type: "sap.ui.model.odata.type.Int32"
    },
    "Edm.Int64": {
      type: "sap.ui.model.odata.type.Int64"
    },
    "Edm.SByte": {
      type: "sap.ui.model.odata.type.SByte"
    },
    "Edm.Single": {
      type: "sap.ui.model.odata.type.Single"
    },
    "Edm.Stream": {
      type: "sap.ui.model.odata.type.Stream"
    },
    "Edm.Binary": {
      type: "sap.ui.model.odata.type.Stream"
    },
    "Edm.String": {
      constraints: {
        "@com.sap.vocabularies.Common.v1.IsDigitSequence": "isDigitSequence",
        $MaxLength: "maxLength",
        $Nullable: "nullable"
      },
      type: "sap.ui.model.odata.type.String"
    },
    "Edm.TimeOfDay": {
      constraints: {
        $Precision: "precision"
      },
      type: "sap.ui.model.odata.type.TimeOfDay"
    }
  };

  /**
   * An expression that evaluates to type T, or a constant value of type T
   */
  _exports.EDM_TYPE_MAPPING = EDM_TYPE_MAPPING;
  const unresolvableExpression = {
    _type: "Unresolvable"
  };
  _exports.unresolvableExpression = unresolvableExpression;
  function escapeXmlAttribute(inputString) {
    return inputString.replace(/'/g, "\\'");
  }
  function hasUnresolvableExpression() {
    for (var _len = arguments.length, expressions = new Array(_len), _key = 0; _key < _len; _key++) {
      expressions[_key] = arguments[_key];
    }
    return expressions.find(expr => expr._type === "Unresolvable") !== undefined;
  }
  /**
   * Check two expressions for (deep) equality.
   *
   * @param a
   * @param b
   * @returns `true` if the two expressions are equal
   * @private
   */
  _exports.hasUnresolvableExpression = hasUnresolvableExpression;
  function _checkExpressionsAreEqual(a, b) {
    if (a._type !== b._type) {
      return false;
    }
    switch (a._type) {
      case "Unresolvable":
        return false;
      // Unresolvable is never equal to anything even itself
      case "Constant":
      case "EmbeddedBinding":
      case "EmbeddedExpressionBinding":
        return a.value === b.value;
      case "Not":
        return _checkExpressionsAreEqual(a.operand, b.operand);
      case "Truthy":
        return _checkExpressionsAreEqual(a.operand, b.operand);
      case "Set":
        return a.operator === b.operator && a.operands.length === b.operands.length && a.operands.every(expression => b.operands.some(otherExpression => _checkExpressionsAreEqual(expression, otherExpression)));
      case "IfElse":
        return _checkExpressionsAreEqual(a.condition, b.condition) && _checkExpressionsAreEqual(a.onTrue, b.onTrue) && _checkExpressionsAreEqual(a.onFalse, b.onFalse);
      case "Comparison":
        return a.operator === b.operator && _checkExpressionsAreEqual(a.operand1, b.operand1) && _checkExpressionsAreEqual(a.operand2, b.operand2);
      case "Concat":
        const aExpressions = a.expressions;
        const bExpressions = b.expressions;
        if (aExpressions.length !== bExpressions.length) {
          return false;
        }
        return aExpressions.every((expression, index) => {
          return _checkExpressionsAreEqual(expression, bExpressions[index]);
        });
      case "Length":
        return _checkExpressionsAreEqual(a.pathInModel, b.pathInModel);
      case "PathInModel":
        return a.modelName === b.modelName && a.path === b.path && a.targetEntitySet === b.targetEntitySet;
      case "Formatter":
        return a.fn === b.fn && a.parameters.length === b.parameters.length && a.parameters.every((value, index) => _checkExpressionsAreEqual(b.parameters[index], value));
      case "ComplexType":
        return a.type === b.type && a.bindingParameters.length === b.bindingParameters.length && a.bindingParameters.every((value, index) => _checkExpressionsAreEqual(b.bindingParameters[index], value));
      case "Function":
        const otherFunction = b;
        if (a.obj === undefined || otherFunction.obj === undefined) {
          return a.obj === otherFunction;
        }
        return a.fn === otherFunction.fn && _checkExpressionsAreEqual(a.obj, otherFunction.obj) && a.parameters.length === otherFunction.parameters.length && a.parameters.every((value, index) => _checkExpressionsAreEqual(otherFunction.parameters[index], value));
      case "Ref":
        return a.ref === b.ref;
    }
    return false;
  }

  /**
   * Converts a nested SetExpression by inlining operands of type SetExpression with the same operator.
   *
   * @param expression The expression to flatten
   * @returns A new SetExpression with the same operator
   */
  _exports._checkExpressionsAreEqual = _checkExpressionsAreEqual;
  function flattenSetExpression(expression) {
    return expression.operands.reduce((result, operand) => {
      const candidatesForFlattening = operand._type === "Set" && operand.operator === expression.operator ? operand.operands : [operand];
      candidatesForFlattening.forEach(candidate => {
        if (result.operands.every(e => !_checkExpressionsAreEqual(e, candidate))) {
          result.operands.push(candidate);
        }
      });
      return result;
    }, {
      _type: "Set",
      operator: expression.operator,
      operands: []
    });
  }

  /**
   * Detects whether an array of boolean expressions contains an expression and its negation.
   *
   * @param expressions Array of expressions
   * @returns `true` if the set of expressions contains an expression and its negation
   */
  function hasOppositeExpressions(expressions) {
    const negatedExpressions = expressions.map(not);
    return expressions.some((expression, index) => {
      for (let i = index + 1; i < negatedExpressions.length; i++) {
        if (_checkExpressionsAreEqual(expression, negatedExpressions[i])) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Logical `and` expression.
   *
   * The expression is simplified to false if this can be decided statically (that is, if one operand is a constant
   * false or if the expression contains an operand and its negation).
   *
   * @param operands Expressions to connect by `and`
   * @returns Expression evaluating to boolean
   */
  function and() {
    for (var _len2 = arguments.length, operands = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      operands[_key2] = arguments[_key2];
    }
    const expressions = flattenSetExpression({
      _type: "Set",
      operator: "&&",
      operands: operands.map(wrapPrimitive)
    }).operands;
    if (hasUnresolvableExpression(...expressions)) {
      return unresolvableExpression;
    }
    let isStaticFalse = false;
    const nonTrivialExpression = expressions.filter(expression => {
      if (isFalse(expression)) {
        isStaticFalse = true;
      }
      return !isConstant(expression);
    });
    if (isStaticFalse) {
      return constant(false);
    } else if (nonTrivialExpression.length === 0) {
      // Resolve the constant then
      const isValid = expressions.reduce((result, expression) => result && isTrue(expression), true);
      return constant(isValid);
    } else if (nonTrivialExpression.length === 1) {
      return nonTrivialExpression[0];
    } else if (hasOppositeExpressions(nonTrivialExpression)) {
      return constant(false);
    } else {
      return {
        _type: "Set",
        operator: "&&",
        operands: nonTrivialExpression
      };
    }
  }

  /**
   * Logical `or` expression.
   *
   * The expression is simplified to true if this can be decided statically (that is, if one operand is a constant
   * true or if the expression contains an operand and its negation).
   *
   * @param operands Expressions to connect by `or`
   * @returns Expression evaluating to boolean
   */
  _exports.and = and;
  function or() {
    for (var _len3 = arguments.length, operands = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      operands[_key3] = arguments[_key3];
    }
    const expressions = flattenSetExpression({
      _type: "Set",
      operator: "||",
      operands: operands.map(wrapPrimitive)
    }).operands;
    if (hasUnresolvableExpression(...expressions)) {
      return unresolvableExpression;
    }
    let isStaticTrue = false;
    const nonTrivialExpression = expressions.filter(expression => {
      if (isTrue(expression)) {
        isStaticTrue = true;
      }
      return !isConstant(expression) || expression.value;
    });
    if (isStaticTrue) {
      return constant(true);
    } else if (nonTrivialExpression.length === 0) {
      // Resolve the constant then
      const isValid = expressions.reduce((result, expression) => result && isTrue(expression), true);
      return constant(isValid);
    } else if (nonTrivialExpression.length === 1) {
      return nonTrivialExpression[0];
    } else if (hasOppositeExpressions(nonTrivialExpression)) {
      return constant(true);
    } else {
      return {
        _type: "Set",
        operator: "||",
        operands: nonTrivialExpression
      };
    }
  }

  /**
   * Logical `not` operator.
   *
   * @param operand The expression to reverse
   * @returns The resulting expression that evaluates to boolean
   */
  _exports.or = or;
  function not(operand) {
    operand = wrapPrimitive(operand);
    if (hasUnresolvableExpression(operand)) {
      return unresolvableExpression;
    } else if (isConstant(operand)) {
      return constant(!operand.value);
    } else if (typeof operand === "object" && operand._type === "Set" && operand.operator === "||" && operand.operands.every(expression => isConstant(expression) || isComparison(expression))) {
      return and(...operand.operands.map(expression => not(expression)));
    } else if (typeof operand === "object" && operand._type === "Set" && operand.operator === "&&" && operand.operands.every(expression => isConstant(expression) || isComparison(expression))) {
      return or(...operand.operands.map(expression => not(expression)));
    } else if (isComparison(operand)) {
      // Create the reverse comparison
      switch (operand.operator) {
        case "!==":
          return {
            ...operand,
            operator: "==="
          };
        case "<":
          return {
            ...operand,
            operator: ">="
          };
        case "<=":
          return {
            ...operand,
            operator: ">"
          };
        case "===":
          return {
            ...operand,
            operator: "!=="
          };
        case ">":
          return {
            ...operand,
            operator: "<="
          };
        case ">=":
          return {
            ...operand,
            operator: "<"
          };
      }
    } else if (operand._type === "Not") {
      return operand.operand;
    }
    return {
      _type: "Not",
      operand: operand
    };
  }

  /**
   * Evaluates whether a binding expression is equal to true with a loose equality.
   *
   * @param operand The expression to check
   * @returns The resulting expression that evaluates to boolean
   */
  _exports.not = not;
  function isTruthy(operand) {
    if (isConstant(operand)) {
      return constant(!!operand.value);
    } else {
      return {
        _type: "Truthy",
        operand: operand
      };
    }
  }

  /**
   * Creates a binding expression that will be evaluated by the corresponding model.
   *
   * @param path
   * @param modelName
   * @param visitedNavigationPaths
   * @param pathVisitor
   * @returns An expression representating that path in the model
   * @deprecated use pathInModel instead
   */
  _exports.isTruthy = isTruthy;
  function bindingExpression(path, modelName) {
    let visitedNavigationPaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    return pathInModel(path, modelName, visitedNavigationPaths, pathVisitor);
  }

  /**
   * Creates a binding expression that will be evaluated by the corresponding model.
   *
   * @template TargetType
   * @param path The path on the model
   * @param [modelName] The name of the model
   * @param [visitedNavigationPaths] The paths from the root entitySet
   * @param [pathVisitor] A function to modify the resulting path
   * @returns An expression representating that path in the model
   */
  _exports.bindingExpression = bindingExpression;
  function pathInModel(path, modelName) {
    let visitedNavigationPaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    if (path === undefined) {
      return unresolvableExpression;
    }
    let targetPath;
    if (pathVisitor) {
      targetPath = pathVisitor(path);
      if (targetPath === undefined) {
        return unresolvableExpression;
      }
    } else {
      const localPath = visitedNavigationPaths.concat();
      localPath.push(path);
      targetPath = localPath.join("/");
    }
    return {
      _type: "PathInModel",
      modelName: modelName,
      path: targetPath
    };
  }
  _exports.pathInModel = pathInModel;
  /**
   * Creates a constant expression based on a primitive value.
   *
   * @template T
   * @param value The constant to wrap in an expression
   * @returns The constant expression
   */
  function constant(value) {
    let constantValue;
    if (typeof value === "object" && value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        constantValue = value.map(wrapPrimitive);
      } else if (isPrimitiveObject(value)) {
        constantValue = value.valueOf();
      } else {
        constantValue = Object.entries(value).reduce((plainExpression, _ref) => {
          let [key, val] = _ref;
          const wrappedValue = wrapPrimitive(val);
          if (wrappedValue._type !== "Constant" || wrappedValue.value !== undefined) {
            plainExpression[key] = wrappedValue;
          }
          return plainExpression;
        }, {});
      }
    } else {
      constantValue = value;
    }
    return {
      _type: "Constant",
      value: constantValue
    };
  }
  _exports.constant = constant;
  function resolveBindingString(value, targetType) {
    if (value !== undefined && typeof value === "string" && value.startsWith("{")) {
      const pathInModelRegex = /^{(.*)>(.+)}$/; // Matches model paths like "model>path" or ">path" (default model)
      const pathInModelRegexMatch = pathInModelRegex.exec(value);
      if (value.startsWith("{=")) {
        // Expression binding, we can just remove the outer binding things
        return {
          _type: "EmbeddedExpressionBinding",
          value: value
        };
      } else if (pathInModelRegexMatch) {
        return pathInModel(pathInModelRegexMatch[2] || "", pathInModelRegexMatch[1] || undefined);
      } else {
        return {
          _type: "EmbeddedBinding",
          value: value
        };
      }
    } else if (targetType === "boolean" && typeof value === "string" && (value === "true" || value === "false")) {
      return constant(value === "true");
    } else if (targetType === "number" && typeof value === "string" && (!isNaN(Number(value)) || value === "NaN")) {
      return constant(Number(value));
    } else {
      return constant(value);
    }
  }

  /**
   * A named reference.
   *
   * @see fn
   * @param reference Reference
   * @returns The object reference binding part
   */
  _exports.resolveBindingString = resolveBindingString;
  function ref(reference) {
    return {
      _type: "Ref",
      ref: reference
    };
  }

  /**
   * Wrap a primitive into a constant expression if it is not already an expression.
   *
   * @template T
   * @param something The object to wrap in a Constant expression
   * @returns Either the original object or the wrapped one depending on the case
   */
  _exports.ref = ref;
  function wrapPrimitive(something) {
    if (isBindingToolkitExpression(something)) {
      return something;
    }
    return constant(something);
  }

  /**
   * Checks if the expression or value provided is a binding tooling expression or not.
   *
   * Every object having a property named `_type` of some value is considered an expression, even if there is actually
   * no such expression type supported.
   *
   * @param expression
   * @returns `true` if the expression is a binding toolkit expression
   */
  function isBindingToolkitExpression(expression) {
    return (expression === null || expression === void 0 ? void 0 : expression._type) !== undefined;
  }

  /**
   * Checks if the expression or value provided is constant or not.
   *
   * @template T The target type
   * @param  maybeConstant The expression or primitive value that is to be checked
   * @returns `true` if it is constant
   */
  _exports.isBindingToolkitExpression = isBindingToolkitExpression;
  function isConstant(maybeConstant) {
    return typeof maybeConstant !== "object" || maybeConstant._type === "Constant";
  }
  _exports.isConstant = isConstant;
  function isTrue(expression) {
    return isConstant(expression) && expression.value === true;
  }
  function isFalse(expression) {
    return isConstant(expression) && expression.value === false;
  }

  /**
   * Checks if the expression or value provided is a path in model expression or not.
   *
   * @template T The target type
   * @param  maybeBinding The expression or primitive value that is to be checked
   * @returns `true` if it is a path in model expression
   */
  function isPathInModelExpression(maybeBinding) {
    return (maybeBinding === null || maybeBinding === void 0 ? void 0 : maybeBinding._type) === "PathInModel";
  }

  /**
   * Checks if the expression or value provided is a complex type expression.
   *
   * @template T The target type
   * @param  maybeBinding The expression or primitive value that is to be checked
   * @returns `true` if it is a path in model expression
   */
  _exports.isPathInModelExpression = isPathInModelExpression;
  function isComplexTypeExpression(maybeBinding) {
    return (maybeBinding === null || maybeBinding === void 0 ? void 0 : maybeBinding._type) === "ComplexType";
  }

  /**
   * Checks if the expression or value provided is a concat expression or not.
   *
   * @param expression
   * @returns `true` if the expression is a ConcatExpression
   */
  _exports.isComplexTypeExpression = isComplexTypeExpression;
  function isConcatExpression(expression) {
    return (expression === null || expression === void 0 ? void 0 : expression._type) === "Concat";
  }

  /**
   * Checks if the expression provided is a comparison or not.
   *
   * @template T The target type
   * @param expression The expression
   * @returns `true` if the expression is a ComparisonExpression
   */
  function isComparison(expression) {
    return expression._type === "Comparison";
  }

  /**
   * Checks whether the input parameter is a constant expression of type undefined.
   *
   * @param expression The input expression or object in general
   * @returns `true` if the input is constant which has undefined for value
   */
  function isUndefinedExpression(expression) {
    const expressionAsExpression = expression;
    return (expressionAsExpression === null || expressionAsExpression === void 0 ? void 0 : expressionAsExpression._type) === "Constant" && (expressionAsExpression === null || expressionAsExpression === void 0 ? void 0 : expressionAsExpression.value) === undefined;
  }
  _exports.isUndefinedExpression = isUndefinedExpression;
  function isPrimitiveObject(objectType) {
    switch (objectType.constructor.name) {
      case "String":
      case "Number":
      case "Boolean":
        return true;
      default:
        return false;
    }
  }
  /**
   * Check if the passed annotation annotationValue is a ComplexAnnotationExpression.
   *
   * @template T The target type
   * @param  annotationValue The annotation annotationValue to evaluate
   * @returns `true` if the object is a {ComplexAnnotationExpression}
   */
  function isComplexAnnotationExpression(annotationValue) {
    return typeof annotationValue === "object" && !isPrimitiveObject(annotationValue);
  }

  /**
   * Generate the corresponding annotationValue for a given annotation annotationValue.
   *
   * @template T The target type
   * @param annotationValue The source annotation annotationValue
   * @param visitedNavigationPaths The path from the root entity set
   * @param defaultValue Default value if the annotationValue is undefined
   * @param pathVisitor A function to modify the resulting path
   * @returns The annotationValue equivalent to that annotation annotationValue
   * @deprecated use getExpressionFromAnnotation instead
   */
  function annotationExpression(annotationValue) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let defaultValue = arguments.length > 2 ? arguments[2] : undefined;
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    return getExpressionFromAnnotation(annotationValue, visitedNavigationPaths, defaultValue, pathVisitor);
  }
  /**
   * Generate the corresponding annotationValue for a given annotation annotationValue.
   *
   * @template T The target type
   * @param annotationValue The source annotation annotationValue
   * @param visitedNavigationPaths The path from the root entity set
   * @param defaultValue Default value if the annotationValue is undefined
   * @param pathVisitor A function to modify the resulting path
   * @returns The annotationValue equivalent to that annotation annotationValue
   */
  _exports.annotationExpression = annotationExpression;
  function getExpressionFromAnnotation(annotationValue) {
    var _annotationValue;
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let defaultValue = arguments.length > 2 ? arguments[2] : undefined;
    let pathVisitor = arguments.length > 3 ? arguments[3] : undefined;
    if (annotationValue === undefined) {
      return wrapPrimitive(defaultValue);
    }
    annotationValue = (_annotationValue = annotationValue) === null || _annotationValue === void 0 ? void 0 : _annotationValue.valueOf();
    if (!isComplexAnnotationExpression(annotationValue)) {
      return constant(annotationValue);
    }
    switch (annotationValue.type) {
      case "Path":
        return pathInModel(annotationValue.path, undefined, visitedNavigationPaths, pathVisitor);
      case "If":
        return annotationIfExpression(annotationValue.If, visitedNavigationPaths, pathVisitor);
      case "Not":
        return not(parseAnnotationCondition(annotationValue.Not, visitedNavigationPaths, pathVisitor));
      case "Eq":
        return equal(parseAnnotationCondition(annotationValue.Eq[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Eq[1], visitedNavigationPaths, pathVisitor));
      case "Ne":
        return notEqual(parseAnnotationCondition(annotationValue.Ne[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Ne[1], visitedNavigationPaths, pathVisitor));
      case "Gt":
        return greaterThan(parseAnnotationCondition(annotationValue.Gt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Gt[1], visitedNavigationPaths, pathVisitor));
      case "Ge":
        return greaterOrEqual(parseAnnotationCondition(annotationValue.Ge[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Ge[1], visitedNavigationPaths, pathVisitor));
      case "Lt":
        return lessThan(parseAnnotationCondition(annotationValue.Lt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Lt[1], visitedNavigationPaths, pathVisitor));
      case "Le":
        return lessOrEqual(parseAnnotationCondition(annotationValue.Le[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.Le[1], visitedNavigationPaths, pathVisitor));
      case "Or":
        return or(...annotationValue.Or.map(function (orCondition) {
          return parseAnnotationCondition(orCondition, visitedNavigationPaths, pathVisitor);
        }));
      case "And":
        return and(...annotationValue.And.map(function (andCondition) {
          return parseAnnotationCondition(andCondition, visitedNavigationPaths, pathVisitor);
        }));
      case "Apply":
        return annotationApplyExpression(annotationValue, visitedNavigationPaths, pathVisitor);
    }
    return unresolvableExpression;
  }

  /**
   * Parse the annotation condition into an expression.
   *
   * @template T The target type
   * @param annotationValue The condition or value from the annotation
   * @param visitedNavigationPaths The path from the root entity set
   * @param pathVisitor A function to modify the resulting path
   * @returns An equivalent expression
   */
  _exports.getExpressionFromAnnotation = getExpressionFromAnnotation;
  function parseAnnotationCondition(annotationValue) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let pathVisitor = arguments.length > 2 ? arguments[2] : undefined;
    if (annotationValue === null || typeof annotationValue !== "object") {
      return constant(annotationValue);
    } else if (annotationValue.hasOwnProperty("$Or")) {
      return or(...annotationValue.$Or.map(function (orCondition) {
        return parseAnnotationCondition(orCondition, visitedNavigationPaths, pathVisitor);
      }));
    } else if (annotationValue.hasOwnProperty("$And")) {
      return and(...annotationValue.$And.map(function (andCondition) {
        return parseAnnotationCondition(andCondition, visitedNavigationPaths, pathVisitor);
      }));
    } else if (annotationValue.hasOwnProperty("$Not")) {
      return not(parseAnnotationCondition(annotationValue.$Not, visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Eq")) {
      return equal(parseAnnotationCondition(annotationValue.$Eq[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Eq[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Ne")) {
      return notEqual(parseAnnotationCondition(annotationValue.$Ne[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ne[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Gt")) {
      return greaterThan(parseAnnotationCondition(annotationValue.$Gt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Gt[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Ge")) {
      return greaterOrEqual(parseAnnotationCondition(annotationValue.$Ge[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Ge[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Lt")) {
      return lessThan(parseAnnotationCondition(annotationValue.$Lt[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Lt[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Le")) {
      return lessOrEqual(parseAnnotationCondition(annotationValue.$Le[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue.$Le[1], visitedNavigationPaths, pathVisitor));
    } else if (annotationValue.hasOwnProperty("$Path")) {
      return pathInModel(annotationValue.$Path, undefined, visitedNavigationPaths, pathVisitor);
    } else if (annotationValue.hasOwnProperty("$Apply")) {
      return getExpressionFromAnnotation({
        type: "Apply",
        Function: annotationValue.$Function,
        Apply: annotationValue.$Apply
      }, visitedNavigationPaths, undefined, pathVisitor);
    } else if (annotationValue.hasOwnProperty("$If")) {
      return getExpressionFromAnnotation({
        type: "If",
        If: annotationValue.$If
      }, visitedNavigationPaths, undefined, pathVisitor);
    } else if (annotationValue.hasOwnProperty("$EnumMember")) {
      return constant(resolveEnumValue(annotationValue.$EnumMember));
    }
    return constant(false);
  }

  /**
   * Process the {IfAnnotationExpressionValue} into an expression.
   *
   * @template T The target type
   * @param annotationValue An If expression returning the type T
   * @param visitedNavigationPaths The path from the root entity set
   * @param pathVisitor A function to modify the resulting path
   * @returns The equivalent ifElse expression
   */
  function annotationIfExpression(annotationValue) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let pathVisitor = arguments.length > 2 ? arguments[2] : undefined;
    return ifElse(parseAnnotationCondition(annotationValue[0], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue[1], visitedNavigationPaths, pathVisitor), parseAnnotationCondition(annotationValue[2], visitedNavigationPaths, pathVisitor));
  }
  // This type is not recursively transformed from the metamodel content, as such we have some ugly things there
  _exports.annotationIfExpression = annotationIfExpression;
  function convertSubApplyParameters(applyParam) {
    let applyParamConverted = applyParam;
    if (applyParam.hasOwnProperty("$Path")) {
      applyParamConverted = {
        type: "Path",
        path: applyParam.$Path
      };
    } else if (applyParam.hasOwnProperty("$If")) {
      applyParamConverted = {
        type: "If",
        If: applyParam.$If
      };
    } else if (applyParam.hasOwnProperty("$Apply")) {
      applyParamConverted = {
        type: "Apply",
        Function: applyParam.$Function,
        Apply: applyParam.$Apply
      };
    }
    return applyParamConverted;
  }
  function annotationApplyExpression(applyExpression) {
    let visitedNavigationPaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let pathVisitor = arguments.length > 2 ? arguments[2] : undefined;
    switch (applyExpression.Function) {
      case "odata.concat":
        return concat(...applyExpression.Apply.map(applyParam => {
          return getExpressionFromAnnotation(convertSubApplyParameters(applyParam), visitedNavigationPaths, undefined, pathVisitor);
        }));
      case "odata.uriEncode":
        const parameter = getExpressionFromAnnotation(convertSubApplyParameters(applyExpression.Apply[0]), visitedNavigationPaths, undefined, pathVisitor);
        // The second parameter for uriEncode is always a string since the target evaluation is against a formatValue call in ODataUtils which expect the target type as second parameter
        return fn("odata.uriEncode", [parameter, "Edm.String"], undefined, true);
      case "odata.fillUriTemplate":
        const template = applyExpression.Apply[0];
        const templateParams = applyExpression.Apply.slice(1);
        const targetObject = {};
        templateParams.forEach(applyParam => {
          targetObject[applyParam.$Name] = getExpressionFromAnnotation(convertSubApplyParameters(applyParam.$LabeledElement), visitedNavigationPaths, undefined, pathVisitor);
        });
        return fn("odata.fillUriTemplate", [template, targetObject], undefined, true);
    }
    return unresolvableExpression;
  }

  /**
   * Generic helper for the comparison operations (equal, notEqual, ...).
   *
   * @template T The target type
   * @param operator The operator to apply
   * @param leftOperand The operand on the left side of the operator
   * @param rightOperand The operand on the right side of the operator
   * @returns An expression representing the comparison
   */
  _exports.annotationApplyExpression = annotationApplyExpression;
  function comparison(operator, leftOperand, rightOperand) {
    const leftExpression = wrapPrimitive(leftOperand);
    const rightExpression = wrapPrimitive(rightOperand);
    if (hasUnresolvableExpression(leftExpression, rightExpression)) {
      return unresolvableExpression;
    }
    if (isConstant(leftExpression) && isConstant(rightExpression)) {
      switch (operator) {
        case "!==":
          return constant(leftExpression.value !== rightExpression.value);
        case "===":
          return constant(leftExpression.value === rightExpression.value);
        case "<":
          return constant(leftExpression.value < rightExpression.value);
        case "<=":
          return constant(leftExpression.value <= rightExpression.value);
        case ">":
          return constant(leftExpression.value > rightExpression.value);
        case ">=":
          return constant(leftExpression.value >= rightExpression.value);
      }
    } else {
      return {
        _type: "Comparison",
        operator: operator,
        operand1: leftExpression,
        operand2: rightExpression
      };
    }
  }
  function length(expression) {
    if (expression._type === "Unresolvable") {
      return expression;
    }
    return {
      _type: "Length",
      pathInModel: expression
    };
  }

  /**
   * Comparison: "equal" (===).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.length = length;
  function equal(leftOperand, rightOperand) {
    const leftExpression = wrapPrimitive(leftOperand);
    const rightExpression = wrapPrimitive(rightOperand);
    if (hasUnresolvableExpression(leftExpression, rightExpression)) {
      return unresolvableExpression;
    }
    if (_checkExpressionsAreEqual(leftExpression, rightExpression)) {
      return constant(true);
    }
    function reduce(left, right) {
      if (left._type === "Comparison" && isTrue(right)) {
        // compare(a, b) === true ~~> compare(a, b)
        return left;
      } else if (left._type === "Comparison" && isFalse(right)) {
        // compare(a, b) === false ~~> !compare(a, b)
        return not(left);
      } else if (left._type === "IfElse" && _checkExpressionsAreEqual(left.onTrue, right)) {
        // (if (x) { a } else { b }) === a ~~> x || (b === a)
        return or(left.condition, equal(left.onFalse, right));
      } else if (left._type === "IfElse" && _checkExpressionsAreEqual(left.onFalse, right)) {
        // (if (x) { a } else { b }) === b ~~> !x || (a === b)
        return or(not(left.condition), equal(left.onTrue, right));
      } else if (left._type === "IfElse" && isConstant(left.onTrue) && isConstant(left.onFalse) && isConstant(right) && !_checkExpressionsAreEqual(left.onTrue, right) && !_checkExpressionsAreEqual(left.onFalse, right)) {
        return constant(false);
      }
      return undefined;
    }

    // exploit symmetry: a === b <~> b === a
    const reduced = reduce(leftExpression, rightExpression) ?? reduce(rightExpression, leftExpression);
    return reduced ?? comparison("===", leftExpression, rightExpression);
  }

  /**
   * Comparison: "not equal" (!==).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.equal = equal;
  function notEqual(leftOperand, rightOperand) {
    return not(equal(leftOperand, rightOperand));
  }

  /**
   * Comparison: "greater or equal" (>=).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.notEqual = notEqual;
  function greaterOrEqual(leftOperand, rightOperand) {
    return comparison(">=", leftOperand, rightOperand);
  }

  /**
   * Comparison: "greater than" (>).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.greaterOrEqual = greaterOrEqual;
  function greaterThan(leftOperand, rightOperand) {
    return comparison(">", leftOperand, rightOperand);
  }

  /**
   * Comparison: "less or equal" (<=).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.greaterThan = greaterThan;
  function lessOrEqual(leftOperand, rightOperand) {
    return comparison("<=", leftOperand, rightOperand);
  }

  /**
   * Comparison: "less than" (<).
   *
   * @template T The target type
   * @param leftOperand The operand on the left side
   * @param rightOperand The operand on the right side of the comparison
   * @returns An expression representing the comparison
   */
  _exports.lessOrEqual = lessOrEqual;
  function lessThan(leftOperand, rightOperand) {
    return comparison("<", leftOperand, rightOperand);
  }

  /**
   * If-then-else expression.
   *
   * Evaluates to onTrue if the condition evaluates to true, else evaluates to onFalse.
   *
   * @template T The target type
   * @param condition The condition to evaluate
   * @param onTrue Expression result if the condition evaluates to true
   * @param onFalse Expression result if the condition evaluates to false
   * @returns The expression that represents this conditional check
   */
  _exports.lessThan = lessThan;
  function ifElse(condition, onTrue, onFalse) {
    let conditionExpression = wrapPrimitive(condition);
    let onTrueExpression = wrapPrimitive(onTrue);
    let onFalseExpression = wrapPrimitive(onFalse);
    if (hasUnresolvableExpression(conditionExpression, onTrueExpression, onFalseExpression)) {
      return unresolvableExpression;
    }
    // swap branches if the condition is a negation
    if (conditionExpression._type === "Not") {
      // ifElse(not(X), a, b) --> ifElse(X, b, a)
      [onTrueExpression, onFalseExpression] = [onFalseExpression, onTrueExpression];
      conditionExpression = not(conditionExpression);
    }

    // inline nested if-else expressions: onTrue branch
    // ifElse(X, ifElse(X, a, b), c) ==> ifElse(X, a, c)
    if (onTrueExpression._type === "IfElse" && _checkExpressionsAreEqual(conditionExpression, onTrueExpression.condition)) {
      onTrueExpression = onTrueExpression.onTrue;
    }

    // inline nested if-else expressions: onFalse branch
    // ifElse(X, a, ifElse(X, b, c)) ==> ifElse(X, a, c)
    if (onFalseExpression._type === "IfElse" && _checkExpressionsAreEqual(conditionExpression, onFalseExpression.condition)) {
      onFalseExpression = onFalseExpression.onFalse;
    }

    // (if true then a else b)  ~~> a
    // (if false then a else b) ~~> b
    if (isConstant(conditionExpression)) {
      return conditionExpression.value ? onTrueExpression : onFalseExpression;
    }

    // if (isConstantBoolean(onTrueExpression) || isConstantBoolean(onFalseExpression)) {
    // 	return or(and(condition, onTrueExpression as Expression<boolean>), and(not(condition), onFalseExpression as Expression<boolean>)) as Expression<T>
    // }

    // (if X then a else a) ~~> a
    if (_checkExpressionsAreEqual(onTrueExpression, onFalseExpression)) {
      return onTrueExpression;
    }

    // if X then a else false ~~> X && a
    if (isFalse(onFalseExpression)) {
      return and(conditionExpression, onTrueExpression);
    }

    // if X then a else true ~~> !X || a
    if (isTrue(onFalseExpression)) {
      return or(not(conditionExpression), onTrueExpression);
    }

    // if X then false else a ~~> !X && a
    if (isFalse(onTrueExpression)) {
      return and(not(conditionExpression), onFalseExpression);
    }

    // if X then true else a ~~> X || a
    if (isTrue(onTrueExpression)) {
      return or(conditionExpression, onFalseExpression);
    }
    if (isComplexTypeExpression(condition) || isComplexTypeExpression(onTrue) || isComplexTypeExpression(onFalse)) {
      let pathIdx = 0;
      const myIfElseExpression = formatResult([condition, onTrue, onFalse], "sap.fe.core.formatters.StandardFormatter#ifElse");
      const allParts = [];
      transformRecursively(myIfElseExpression, "PathInModel", constantPath => {
        allParts.push(constantPath);
        return pathInModel(`$${pathIdx++}`, "$");
      }, true);
      allParts.unshift(constant(JSON.stringify(myIfElseExpression)));
      return formatResult(allParts, "sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression", undefined, true);
    }
    return {
      _type: "IfElse",
      condition: conditionExpression,
      onTrue: onTrueExpression,
      onFalse: onFalseExpression
    };
  }

  /**
   * Checks whether the current expression has a reference to the default model (undefined).
   *
   * @param expression The expression to evaluate
   * @returns `true` if there is a reference to the default context
   */
  _exports.ifElse = ifElse;
  function hasReferenceToDefaultContext(expression) {
    switch (expression._type) {
      case "Constant":
      case "Formatter":
      case "ComplexType":
        return false;
      case "Set":
        return expression.operands.some(hasReferenceToDefaultContext);
      case "PathInModel":
        return expression.modelName === undefined;
      case "Comparison":
        return hasReferenceToDefaultContext(expression.operand1) || hasReferenceToDefaultContext(expression.operand2);
      case "IfElse":
        return hasReferenceToDefaultContext(expression.condition) || hasReferenceToDefaultContext(expression.onTrue) || hasReferenceToDefaultContext(expression.onFalse);
      case "Not":
      case "Truthy":
        return hasReferenceToDefaultContext(expression.operand);
      default:
        return false;
    }
  }
  /**
   * Calls a formatter function to process the parameters.
   * If requireContext is set to true and no context is passed a default context will be added automatically.
   *
   * @template T
   * @template U
   * @param parameters The list of parameter that should match the type and number of the formatter function
   * @param formatterFunction The function to call
   * @param [contextEntityType] If no parameter refers to the context then we use this information to add a reference to the keys from the entity type.
   * @param [ignoreComplexType] Whether to ignore the transgformation to the StandardFormatter or not
   * @returns The corresponding expression
   */
  function formatResult(parameters, formatterFunction, contextEntityType) {
    let ignoreComplexType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const parameterExpressions = parameters.map(wrapPrimitive);
    if (hasUnresolvableExpression(...parameterExpressions)) {
      return unresolvableExpression;
    }
    if (contextEntityType) {
      // Otherwise, if the context is required and no context is provided make sure to add the default binding
      if (!parameterExpressions.some(hasReferenceToDefaultContext)) {
        contextEntityType.keys.forEach(key => parameterExpressions.push(pathInModel(key.name, "")));
      }
    }
    let functionName = "";
    if (typeof formatterFunction === "string") {
      functionName = formatterFunction;
    } else {
      functionName = formatterFunction.__functionName;
    }
    // FormatterName can be of format sap.fe.core.xxx#methodName to have multiple formatter in one class
    const [formatterClass, formatterName] = functionName.split("#");

    // In some case we also cannot call directly a function because of too complex input, in that case we need to convert to a simpler function call
    if (!ignoreComplexType && (parameterExpressions.some(isComplexTypeExpression) || parameterExpressions.some(isConcatExpression))) {
      let pathIdx = 0;
      const myFormatExpression = formatResult(parameterExpressions, functionName, undefined, true);
      const allParts = [];
      transformRecursively(myFormatExpression, "PathInModel", constantPath => {
        allParts.push(constantPath);
        return pathInModel(`$${pathIdx++}`, "$");
      });
      allParts.unshift(constant(JSON.stringify(myFormatExpression)));
      return formatResult(allParts, "sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression", undefined, true);
    } else if (!!formatterName && formatterName.length > 0) {
      parameterExpressions.unshift(constant(formatterName));
    }
    return {
      _type: "Formatter",
      fn: formatterClass,
      parameters: parameterExpressions
    };
  }
  _exports.formatResult = formatResult;
  function setUpConstraints(targetMapping, property) {
    var _targetMapping$constr, _targetMapping$constr2, _targetMapping$constr3, _targetMapping$constr4, _property$annotations, _property$annotations2, _targetMapping$constr5, _property$annotations5, _property$annotations6, _property$annotations9, _property$annotations10, _targetMapping$constr6, _targetMapping$constr7;
    const constraints = {};
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr = targetMapping.constraints) !== null && _targetMapping$constr !== void 0 && _targetMapping$constr.$Scale && property.scale !== undefined) {
      constraints.scale = property.scale;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr2 = targetMapping.constraints) !== null && _targetMapping$constr2 !== void 0 && _targetMapping$constr2.$Precision && property.precision !== undefined) {
      constraints.precision = property.precision;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr3 = targetMapping.constraints) !== null && _targetMapping$constr3 !== void 0 && _targetMapping$constr3.$MaxLength && property.maxLength !== undefined) {
      constraints.maxLength = property.maxLength;
    }
    if (property.nullable === false) {
      constraints.nullable = false;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr4 = targetMapping.constraints) !== null && _targetMapping$constr4 !== void 0 && _targetMapping$constr4["@Org.OData.Validation.V1.Minimum/$Decimal"] && !isNaN((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Validation) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Minimum)) {
      var _property$annotations3, _property$annotations4;
      constraints.minimum = `${(_property$annotations3 = property.annotations) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Validation) === null || _property$annotations4 === void 0 ? void 0 : _property$annotations4.Minimum}`;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr5 = targetMapping.constraints) !== null && _targetMapping$constr5 !== void 0 && _targetMapping$constr5["@Org.OData.Validation.V1.Maximum/$Decimal"] && !isNaN((_property$annotations5 = property.annotations) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.Validation) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.Maximum)) {
      var _property$annotations7, _property$annotations8;
      constraints.maximum = `${(_property$annotations7 = property.annotations) === null || _property$annotations7 === void 0 ? void 0 : (_property$annotations8 = _property$annotations7.Validation) === null || _property$annotations8 === void 0 ? void 0 : _property$annotations8.Maximum}`;
    }
    if ((_property$annotations9 = property.annotations) !== null && _property$annotations9 !== void 0 && (_property$annotations10 = _property$annotations9.Common) !== null && _property$annotations10 !== void 0 && _property$annotations10.IsDigitSequence && targetMapping.type === "sap.ui.model.odata.type.String" && targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr6 = targetMapping.constraints) !== null && _targetMapping$constr6 !== void 0 && _targetMapping$constr6["@com.sap.vocabularies.Common.v1.IsDigitSequence"]) {
      constraints.isDigitSequence = true;
    }
    if (targetMapping !== null && targetMapping !== void 0 && (_targetMapping$constr7 = targetMapping.constraints) !== null && _targetMapping$constr7 !== void 0 && _targetMapping$constr7.$V4) {
      constraints.V4 = true;
    }
    return constraints;
  }

  /**
   * Generates the binding expression for the property, and sets up the formatOptions and constraints.
   *
   * @param property The Property for which we are setting up the binding
   * @param propertyBindingExpression The BindingExpression of the property above. Serves as the basis to which information can be added
   * @param ignoreConstraints Ignore constraints of the property
   * @returns The binding expression for the property with formatOptions and constraints
   */
  _exports.setUpConstraints = setUpConstraints;
  function formatWithTypeInformation(property, propertyBindingExpression) {
    var _outExpression$type;
    let ignoreConstraints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const outExpression = propertyBindingExpression;
    if (property._type !== "Property" && property._type !== "ActionParameter") {
      return outExpression;
    }
    const targetMapping = EDM_TYPE_MAPPING[property.type];
    if (!targetMapping) {
      return outExpression;
    }
    if (!outExpression.formatOptions) {
      outExpression.formatOptions = {};
    }
    outExpression.constraints = {};
    outExpression.type = targetMapping.type;
    if (!ignoreConstraints) {
      outExpression.constraints = setUpConstraints(targetMapping, property);
    }
    if ((outExpression === null || outExpression === void 0 ? void 0 : (_outExpression$type = outExpression.type) === null || _outExpression$type === void 0 ? void 0 : _outExpression$type.indexOf("sap.ui.model.odata.type.Int")) === 0 && (outExpression === null || outExpression === void 0 ? void 0 : outExpression.type) !== "sap.ui.model.odata.type.Int64" || (outExpression === null || outExpression === void 0 ? void 0 : outExpression.type) === "sap.ui.model.odata.type.Double") {
      outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
        parseAsString: false
      });
    }
    if (outExpression.type === "sap.ui.model.odata.type.String" && isProperty(property)) {
      outExpression.formatOptions.parseKeepsEmptyString = true;
      const fiscalType = getFiscalType(property);
      if (fiscalType) {
        outExpression.formatOptions.fiscalType = fiscalType;
        outExpression.type = "sap.fe.core.type.FiscalDate";
      }
    }
    if (outExpression.type === "sap.ui.model.odata.type.Decimal" || (outExpression === null || outExpression === void 0 ? void 0 : outExpression.type) === "sap.ui.model.odata.type.Int64") {
      outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
        emptyString: ""
      });
    }
    return outExpression;
  }
  _exports.formatWithTypeInformation = formatWithTypeInformation;
  const getFiscalType = function (property) {
    var _property$annotations11, _property$annotations12, _property$annotations13, _property$annotations14, _property$annotations15, _property$annotations16, _property$annotations17, _property$annotations18, _property$annotations19, _property$annotations20, _property$annotations21, _property$annotations22, _property$annotations23, _property$annotations24, _property$annotations25, _property$annotations26;
    if ((_property$annotations11 = property.annotations) !== null && _property$annotations11 !== void 0 && (_property$annotations12 = _property$annotations11.Common) !== null && _property$annotations12 !== void 0 && _property$annotations12.IsFiscalYear) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYear";
    }
    if ((_property$annotations13 = property.annotations) !== null && _property$annotations13 !== void 0 && (_property$annotations14 = _property$annotations13.Common) !== null && _property$annotations14 !== void 0 && _property$annotations14.IsFiscalPeriod) {
      return "com.sap.vocabularies.Common.v1.IsFiscalPeriod";
    }
    if ((_property$annotations15 = property.annotations) !== null && _property$annotations15 !== void 0 && (_property$annotations16 = _property$annotations15.Common) !== null && _property$annotations16 !== void 0 && _property$annotations16.IsFiscalYearPeriod) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod";
    }
    if ((_property$annotations17 = property.annotations) !== null && _property$annotations17 !== void 0 && (_property$annotations18 = _property$annotations17.Common) !== null && _property$annotations18 !== void 0 && _property$annotations18.IsFiscalQuarter) {
      return "com.sap.vocabularies.Common.v1.IsFiscalQuarter";
    }
    if ((_property$annotations19 = property.annotations) !== null && _property$annotations19 !== void 0 && (_property$annotations20 = _property$annotations19.Common) !== null && _property$annotations20 !== void 0 && _property$annotations20.IsFiscalYearQuarter) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYearQuarter";
    }
    if ((_property$annotations21 = property.annotations) !== null && _property$annotations21 !== void 0 && (_property$annotations22 = _property$annotations21.Common) !== null && _property$annotations22 !== void 0 && _property$annotations22.IsFiscalWeek) {
      return "com.sap.vocabularies.Common.v1.IsFiscalWeek";
    }
    if ((_property$annotations23 = property.annotations) !== null && _property$annotations23 !== void 0 && (_property$annotations24 = _property$annotations23.Common) !== null && _property$annotations24 !== void 0 && _property$annotations24.IsFiscalYearWeek) {
      return "com.sap.vocabularies.Common.v1.IsFiscalYearWeek";
    }
    if ((_property$annotations25 = property.annotations) !== null && _property$annotations25 !== void 0 && (_property$annotations26 = _property$annotations25.Common) !== null && _property$annotations26 !== void 0 && _property$annotations26.IsDayOfFiscalYear) {
      return "com.sap.vocabularies.Common.v1.IsDayOfFiscalYear";
    }
  };

  /**
   * Calls a complex type to process the parameters.
   * If requireContext is set to true and no context is passed, a default context will be added automatically.
   *
   * @template T
   * @template U
   * @param parameters The list of parameters that should match the type for the complex type=
   * @param type The complex type to use
   * @param [contextEntityType] The context entity type to consider
   * @param oFormatOptions
   * @returns The corresponding expression
   */
  _exports.getFiscalType = getFiscalType;
  function addTypeInformation(parameters, type, contextEntityType, oFormatOptions) {
    const parameterExpressions = parameters.map(wrapPrimitive);
    if (hasUnresolvableExpression(...parameterExpressions)) {
      return unresolvableExpression;
    }
    // If there is only one parameter and it is a constant and we don't expect the context then return the constant
    if (parameterExpressions.length === 1 && isConstant(parameterExpressions[0]) && !contextEntityType) {
      return parameterExpressions[0];
    } else if (contextEntityType) {
      // Otherwise, if the context is required and no context is provided make sure to add the default binding
      if (!parameterExpressions.some(hasReferenceToDefaultContext)) {
        contextEntityType.keys.forEach(key => parameterExpressions.push(pathInModel(key.name, "")));
      }
    }
    oFormatOptions = _getComplexTypeFormatOptionsFromFirstParam(parameters[0], oFormatOptions);
    if (type === "sap.ui.model.odata.type.Unit") {
      const uomPath = pathInModel("/##@@requestUnitsOfMeasure");
      uomPath.targetType = "any";
      uomPath.mode = "OneTime";
      parameterExpressions.push(uomPath);
    } else if (type === "sap.ui.model.odata.type.Currency") {
      const currencyPath = pathInModel("/##@@requestCurrencyCodes");
      currencyPath.targetType = "any";
      currencyPath.mode = "OneTime";
      parameterExpressions.push(currencyPath);
    }
    return {
      _type: "ComplexType",
      type: type,
      formatOptions: oFormatOptions || {},
      parameters: {},
      bindingParameters: parameterExpressions
    };
  }

  /**
   * Process the formatOptions for a complexType based on the first parameter.
   *
   * @param param The first parameter of the complex type
   * @param formatOptions Initial formatOptions
   * @returns The modified formatOptions
   */
  _exports.addTypeInformation = addTypeInformation;
  function _getComplexTypeFormatOptionsFromFirstParam(param, formatOptions) {
    var _param$type, _param$constraints;
    // if showMeasure is set to false we want to not parse as string to see the 0
    // we do that also for all bindings because otherwise the mdc Field isn't editable
    if (!(formatOptions && formatOptions.showNumber === false) && ((param === null || param === void 0 ? void 0 : (_param$type = param.type) === null || _param$type === void 0 ? void 0 : _param$type.indexOf("sap.ui.model.odata.type.Int")) === 0 || (param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Decimal" || (param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Double")) {
      if ((param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Int64" || (param === null || param === void 0 ? void 0 : param.type) === "sap.ui.model.odata.type.Decimal") {
        var _formatOptions;
        //sap.ui.model.odata.type.Int64 do not support parseAsString false
        formatOptions = ((_formatOptions = formatOptions) === null || _formatOptions === void 0 ? void 0 : _formatOptions.showMeasure) === false ? {
          emptyString: "",
          showMeasure: false
        } : {
          emptyString: ""
        };
      } else {
        var _formatOptions2;
        formatOptions = ((_formatOptions2 = formatOptions) === null || _formatOptions2 === void 0 ? void 0 : _formatOptions2.showMeasure) === false ? {
          parseAsString: false,
          showMeasure: false
        } : {
          parseAsString: false
        };
      }
    }
    if ((param === null || param === void 0 ? void 0 : (_param$constraints = param.constraints) === null || _param$constraints === void 0 ? void 0 : _param$constraints.nullable) !== false) {
      var _formatOptions3;
      (_formatOptions3 = formatOptions) === null || _formatOptions3 === void 0 ? true : delete _formatOptions3.emptyString;
    }
    return formatOptions;
  }
  /**
   * Function call, optionally with arguments.
   *
   * @param func Function name or reference to function
   * @param parameters Arguments
   * @param on Object to call the function on
   * @returns Expression representing the function call (not the result of the function call!)
   */
  function fn(func, parameters, on) {
    let isFormattingFn = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const functionName = typeof func === "string" ? func : func.__functionName;
    return {
      _type: "Function",
      obj: on !== undefined ? wrapPrimitive(on) : undefined,
      fn: functionName,
      isFormattingFn: isFormattingFn,
      parameters: parameters.map(wrapPrimitive)
    };
  }

  /**
   * Shortcut function to determine if a binding value is null, undefined or empty.
   *
   * @param expression
   * @returns A Boolean expression evaluating the fact that the current element is empty
   */
  _exports.fn = fn;
  function isEmpty(expression) {
    const aBindings = [];
    transformRecursively(expression, "PathInModel", expr => {
      aBindings.push(or(equal(expr, ""), equal(expr, undefined), equal(expr, null)));
      return expr;
    });
    return and(...aBindings);
  }
  _exports.isEmpty = isEmpty;
  function concat() {
    for (var _len4 = arguments.length, inExpressions = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      inExpressions[_key4] = arguments[_key4];
    }
    const expressions = inExpressions.map(wrapPrimitive);
    if (hasUnresolvableExpression(...expressions)) {
      return unresolvableExpression;
    }
    if (expressions.every(isConstant)) {
      return constant(expressions.reduce((concatenated, value) => {
        if (value.value !== undefined) {
          return concatenated + value.value.toString();
        }
        return concatenated;
      }, ""));
    } else if (expressions.some(isComplexTypeExpression)) {
      let pathIdx = 0;
      const myConcatExpression = formatResult(expressions, "sap.fe.core.formatters.StandardFormatter#concat", undefined, true);
      const allParts = [];
      transformRecursively(myConcatExpression, "PathInModel", constantPath => {
        allParts.push(constantPath);
        return pathInModel(`$${pathIdx++}`, "$");
      });
      allParts.unshift(constant(JSON.stringify(myConcatExpression)));
      return formatResult(allParts, "sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression", undefined, true);
    }
    return {
      _type: "Concat",
      expressions: expressions
    };
  }
  _exports.concat = concat;
  function transformRecursively(inExpression, expressionType, transformFunction) {
    let includeAllExpression = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let expression = inExpression;
    switch (expression._type) {
      case "Function":
      case "Formatter":
        expression.parameters = expression.parameters.map(parameter => transformRecursively(parameter, expressionType, transformFunction, includeAllExpression));
        break;
      case "Concat":
        expression.expressions = expression.expressions.map(subExpression => transformRecursively(subExpression, expressionType, transformFunction, includeAllExpression));
        expression = concat(...expression.expressions);
        break;
      case "ComplexType":
        expression.bindingParameters = expression.bindingParameters.map(bindingParameter => transformRecursively(bindingParameter, expressionType, transformFunction, includeAllExpression));
        break;
      case "IfElse":
        const onTrue = transformRecursively(expression.onTrue, expressionType, transformFunction, includeAllExpression);
        const onFalse = transformRecursively(expression.onFalse, expressionType, transformFunction, includeAllExpression);
        let condition = expression.condition;
        if (includeAllExpression) {
          condition = transformRecursively(expression.condition, expressionType, transformFunction, includeAllExpression);
        }
        expression = ifElse(condition, onTrue, onFalse);
        break;
      case "Not":
        if (includeAllExpression) {
          const operand = transformRecursively(expression.operand, expressionType, transformFunction, includeAllExpression);
          expression = not(operand);
        }
        break;
      case "Truthy":
        break;
      case "Set":
        if (includeAllExpression) {
          const operands = expression.operands.map(operand => transformRecursively(operand, expressionType, transformFunction, includeAllExpression));
          expression = expression.operator === "||" ? or(...operands) : and(...operands);
        }
        break;
      case "Comparison":
        if (includeAllExpression) {
          const operand1 = transformRecursively(expression.operand1, expressionType, transformFunction, includeAllExpression);
          const operand2 = transformRecursively(expression.operand2, expressionType, transformFunction, includeAllExpression);
          expression = comparison(expression.operator, operand1, operand2);
        }
        break;
      case "Constant":
        const constantValue = expression.value;
        if (typeof constantValue === "object" && constantValue) {
          Object.keys(constantValue).forEach(key => {
            constantValue[key] = transformRecursively(constantValue[key], expressionType, transformFunction, includeAllExpression);
          });
        }
        break;
      case "Ref":
      case "Length":
      case "PathInModel":
      case "EmbeddedBinding":
      case "EmbeddedExpressionBinding":
      case "Unresolvable":
        // Do nothing
        break;
    }
    if (expressionType === expression._type) {
      expression = transformFunction(inExpression);
    }
    return expression;
  }
  _exports.transformRecursively = transformRecursively;
  const needParenthesis = function (expr) {
    return !isConstant(expr) && !isPathInModelExpression(expr) && isBindingToolkitExpression(expr) && expr._type !== "IfElse" && expr._type !== "Function";
  };

  /**
   * Compiles a constant object to a string.
   *
   * @param expr
   * @param isNullable
   * @returns The compiled string
   */
  function compileConstantObject(expr) {
    let isNullable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (isNullable && Object.keys(expr.value).length === 0) {
      return "";
    }
    const objects = expr.value;
    const properties = [];
    Object.keys(objects).forEach(key => {
      const value = objects[key];
      const childResult = compileExpression(value, true, false, isNullable);
      if (childResult && childResult.length > 0) {
        properties.push(`${key}: ${childResult}`);
      }
    });
    return `{${properties.join(", ")}}`;
  }

  /**
   * Compiles a Constant Binding Expression.
   *
   * @param expr
   * @param embeddedInBinding
   * @param isNullable
   * @param doNotStringify
   * @returns The compiled string
   */

  function compileConstant(expr, embeddedInBinding) {
    let isNullable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let doNotStringify = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (expr.value === null) {
      return doNotStringify ? null : "null";
    }
    if (expr.value === undefined) {
      return doNotStringify ? undefined : "undefined";
    }
    if (typeof expr.value === "object") {
      if (Array.isArray(expr.value)) {
        const entries = expr.value.map(expression => compileExpression(expression, true));
        return `[${entries.join(", ")}]`;
      } else {
        return compileConstantObject(expr, isNullable);
      }
    }
    if (embeddedInBinding) {
      switch (typeof expr.value) {
        case "number":
        case "bigint":
        case "boolean":
          return expr.value.toString();
        case "string":
          return `'${escapeXmlAttribute(expr.value.toString())}'`;
        default:
          return "";
      }
    } else {
      return doNotStringify ? expr.value : expr.value.toString();
    }
  }

  /**
   * Generates the binding string for a Binding expression.
   *
   * @param expressionForBinding The expression to compile
   * @param embeddedInBinding Whether the expression to compile is embedded into another expression
   * @param embeddedSeparator The binding value evaluator ($ or % depending on whether we want to force the type or not)
   * @returns The corresponding expression binding
   */
  _exports.compileConstant = compileConstant;
  function compilePathInModelExpression(expressionForBinding, embeddedInBinding, embeddedSeparator) {
    if (expressionForBinding.type || expressionForBinding.parameters || expressionForBinding.targetType || expressionForBinding.formatOptions || expressionForBinding.constraints) {
      // This is now a complex binding definition, let's prepare for it
      const complexBindingDefinition = {
        path: compilePathInModel(expressionForBinding),
        type: expressionForBinding.type,
        targetType: expressionForBinding.targetType,
        parameters: expressionForBinding.parameters,
        formatOptions: expressionForBinding.formatOptions,
        constraints: expressionForBinding.constraints
      };
      const outBinding = compileExpression(complexBindingDefinition, false, false, true);
      if (embeddedInBinding) {
        return `${embeddedSeparator}${outBinding}`;
      }
      return outBinding;
    } else if (embeddedInBinding) {
      return `${embeddedSeparator}{${compilePathInModel(expressionForBinding)}}`;
    } else {
      return `{${compilePathInModel(expressionForBinding)}}`;
    }
  }
  function compileComplexTypeExpression(expression) {
    if (expression.bindingParameters.length === 1) {
      return `{${compilePathParameter(expression.bindingParameters[0], true)}, type: '${expression.type}'}`;
    }
    let outputEnd = `], type: '${expression.type}'`;
    if (hasElements(expression.formatOptions)) {
      outputEnd += `, formatOptions: ${compileExpression(expression.formatOptions)}`;
    }
    if (hasElements(expression.parameters)) {
      outputEnd += `, parameters: ${compileExpression(expression.parameters)}`;
    }
    outputEnd += "}";
    return `{mode:'TwoWay', parts:[${expression.bindingParameters.map(param => compilePathParameter(param)).join(",")}${outputEnd}`;
  }

  /**
   * Wrap the compiled binding string as required depending on its context.
   *
   * @param expression The compiled expression
   * @param embeddedInBinding True if the compiled expression is to be embedded in a binding
   * @param parenthesisRequired True if the embedded binding needs to be wrapped in parethesis so that it is evaluated as one
   * @returns Finalized compiled expression
   */
  function wrapBindingExpression(expression, embeddedInBinding) {
    let parenthesisRequired = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (embeddedInBinding) {
      if (parenthesisRequired) {
        return `(${expression})`;
      } else {
        return expression;
      }
    } else {
      return `{= ${expression}}`;
    }
  }

  /**
   * Compile an expression into an expression binding.
   *
   * @template T The target type
   * @param expression The expression to compile
   * @param embeddedInBinding Whether the expression to compile is embedded into another expression
   * @param keepTargetType Keep the target type of the embedded bindings instead of casting them to any
   * @param isNullable Whether binding expression can resolve to empty string or not
   * @returns The corresponding expression binding
   */
  _exports.wrapBindingExpression = wrapBindingExpression;
  function compileExpression(expression) {
    let embeddedInBinding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let keepTargetType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let isNullable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const expr = wrapPrimitive(expression);
    const embeddedSeparator = keepTargetType ? "$" : "%";
    switch (expr._type) {
      case "Unresolvable":
        return undefined;
      case "Constant":
        return compileConstant(expr, embeddedInBinding, isNullable);
      case "Ref":
        return expr.ref || "null";
      case "Function":
        let hasEmbeddedFunctionCallOrBinding = false;
        if (expr.isFormattingFn) {
          transformRecursively(expr, "Function", subFn => {
            if (subFn !== expr && subFn.obj === undefined) {
              hasEmbeddedFunctionCallOrBinding = true;
            }
            return subFn;
          }, true);
          transformRecursively(expr, "Constant", subFn => {
            if (subFn !== expr && typeof subFn.value === "object") {
              transformRecursively(subFn, "PathInModel", subSubFn => {
                hasEmbeddedFunctionCallOrBinding = true;
                return subSubFn;
              });
            }
            return subFn;
          }, true);
        }
        const argumentString = `${expr.parameters.map(arg => compileExpression(arg, true)).join(", ")}`;
        let fnCall = expr.obj === undefined ? `${expr.fn}(${argumentString})` : `${compileExpression(expr.obj, true)}.${expr.fn}(${argumentString})`;
        if (!embeddedInBinding && hasEmbeddedFunctionCallOrBinding) {
          fnCall = `{= ${fnCall}}`;
        }
        return fnCall;
      case "EmbeddedExpressionBinding":
        return embeddedInBinding ? `(${expr.value.substring(2, expr.value.length - 1)})` : `${expr.value}`;
      case "EmbeddedBinding":
        return embeddedInBinding ? `${embeddedSeparator}${expr.value}` : `${expr.value}`;
      case "PathInModel":
        return compilePathInModelExpression(expr, embeddedInBinding, embeddedSeparator);
      case "Comparison":
        const comparisonExpression = compileComparisonExpression(expr);
        return wrapBindingExpression(comparisonExpression, embeddedInBinding);
      case "IfElse":
        const ifElseExpression = `${compileExpression(expr.condition, true)} ? ${compileExpression(expr.onTrue, true, keepTargetType)} : ${compileExpression(expr.onFalse, true, keepTargetType)}`;
        return wrapBindingExpression(ifElseExpression, embeddedInBinding, true);
      case "Set":
        const setExpression = expr.operands.map(operand => compileExpression(operand, true)).join(` ${expr.operator} `);
        return wrapBindingExpression(setExpression, embeddedInBinding, true);
      case "Concat":
        const concatExpression = expr.expressions.map(nestedExpression => compileExpression(nestedExpression, true, true)).join(" + ");
        return wrapBindingExpression(concatExpression, embeddedInBinding);
      case "Length":
        const lengthExpression = `${compileExpression(expr.pathInModel, true)}.length`;
        return wrapBindingExpression(lengthExpression, embeddedInBinding);
      case "Not":
        const notExpression = `!${compileExpression(expr.operand, true)}`;
        return wrapBindingExpression(notExpression, embeddedInBinding);
      case "Truthy":
        const truthyExpression = `!!${compileExpression(expr.operand, true)}`;
        return wrapBindingExpression(truthyExpression, embeddedInBinding);
      case "Formatter":
        const formatterExpression = compileFormatterExpression(expr);
        return embeddedInBinding ? `$${formatterExpression}` : formatterExpression;
      case "ComplexType":
        const complexTypeExpression = compileComplexTypeExpression(expr);
        return embeddedInBinding ? `$${complexTypeExpression}` : complexTypeExpression;
      default:
        return "";
    }
  }

  /**
   * Compile a comparison expression.
   *
   * @param expression The comparison expression.
   * @returns The compiled expression. Needs wrapping before it can be used as an expression binding.
   */
  _exports.compileExpression = compileExpression;
  function compileComparisonExpression(expression) {
    function compileOperand(operand) {
      const compiledOperand = compileExpression(operand, true) ?? "undefined";
      return wrapBindingExpression(compiledOperand, true, needParenthesis(operand));
    }
    return `${compileOperand(expression.operand1)} ${expression.operator} ${compileOperand(expression.operand2)}`;
  }

  /**
   * Compile a formatter expression.
   *
   * @param expression The formatter expression.
   * @returns The compiled expression.
   */
  function compileFormatterExpression(expression) {
    if (expression.parameters.length === 1) {
      return `{${compilePathParameter(expression.parameters[0], true)}, formatter: '${expression.fn}'}`;
    } else {
      const parts = expression.parameters.map(param => {
        if (param._type === "ComplexType") {
          return compileComplexTypeExpression(param);
        } else {
          return compilePathParameter(param);
        }
      });
      return `{parts: [${parts.join(", ")}], formatter: '${expression.fn}'}`;
    }
  }

  /**
   * Compile the path parameter of a formatter call.
   *
   * @param expression The binding part to evaluate
   * @param singlePath Whether there is one or multiple path to consider
   * @returns The string snippet to include in the overall binding definition
   */
  function compilePathParameter(expression) {
    let singlePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let outValue = "";
    if (expression._type === "Constant") {
      if (expression.value === undefined) {
        // Special case otherwise the JSTokenizer complains about incorrect content
        outValue = `value: 'undefined'`;
      } else {
        outValue = `value: ${compileConstant(expression, true)}`;
      }
    } else if (expression._type === "PathInModel") {
      outValue = `path: '${compilePathInModel(expression)}'`;
      outValue += expression.type ? `, type: '${expression.type}'` : `, targetType: 'any'`;
      if (hasElements(expression.mode)) {
        outValue += `, mode: '${compileExpression(expression.mode)}'`;
      }
      if (hasElements(expression.constraints)) {
        outValue += `, constraints: ${compileExpression(expression.constraints)}`;
      }
      if (hasElements(expression.formatOptions)) {
        outValue += `, formatOptions: ${compileExpression(expression.formatOptions)}`;
      }
      if (hasElements(expression.parameters)) {
        outValue += `, parameters: ${compileExpression(expression.parameters)}`;
      }
    } else {
      return "";
    }
    return singlePath ? outValue : `{${outValue}}`;
  }
  function hasElements(obj) {
    return obj && Object.keys(obj).length > 0;
  }

  /**
   * Compile a binding expression path.
   *
   * @param expression The expression to compile.
   * @returns The compiled path.
   */
  function compilePathInModel(expression) {
    return `${expression.modelName ? `${expression.modelName}>` : ""}${expression.path}`;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFRE1fVFlQRV9NQVBQSU5HIiwidHlwZSIsImNvbnN0cmFpbnRzIiwiJFByZWNpc2lvbiIsIiRWNCIsIiRTY2FsZSIsIiRNYXhMZW5ndGgiLCIkTnVsbGFibGUiLCJ1bnJlc29sdmFibGVFeHByZXNzaW9uIiwiX3R5cGUiLCJlc2NhcGVYbWxBdHRyaWJ1dGUiLCJpbnB1dFN0cmluZyIsInJlcGxhY2UiLCJoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uIiwiZXhwcmVzc2lvbnMiLCJmaW5kIiwiZXhwciIsInVuZGVmaW5lZCIsIl9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwiLCJhIiwiYiIsInZhbHVlIiwib3BlcmFuZCIsIm9wZXJhdG9yIiwib3BlcmFuZHMiLCJsZW5ndGgiLCJldmVyeSIsImV4cHJlc3Npb24iLCJzb21lIiwib3RoZXJFeHByZXNzaW9uIiwiY29uZGl0aW9uIiwib25UcnVlIiwib25GYWxzZSIsIm9wZXJhbmQxIiwib3BlcmFuZDIiLCJhRXhwcmVzc2lvbnMiLCJiRXhwcmVzc2lvbnMiLCJpbmRleCIsInBhdGhJbk1vZGVsIiwibW9kZWxOYW1lIiwicGF0aCIsInRhcmdldEVudGl0eVNldCIsImZuIiwicGFyYW1ldGVycyIsImJpbmRpbmdQYXJhbWV0ZXJzIiwib3RoZXJGdW5jdGlvbiIsIm9iaiIsInJlZiIsImZsYXR0ZW5TZXRFeHByZXNzaW9uIiwicmVkdWNlIiwicmVzdWx0IiwiY2FuZGlkYXRlc0ZvckZsYXR0ZW5pbmciLCJmb3JFYWNoIiwiY2FuZGlkYXRlIiwiZSIsInB1c2giLCJoYXNPcHBvc2l0ZUV4cHJlc3Npb25zIiwibmVnYXRlZEV4cHJlc3Npb25zIiwibWFwIiwibm90IiwiaSIsImFuZCIsIndyYXBQcmltaXRpdmUiLCJpc1N0YXRpY0ZhbHNlIiwibm9uVHJpdmlhbEV4cHJlc3Npb24iLCJmaWx0ZXIiLCJpc0ZhbHNlIiwiaXNDb25zdGFudCIsImNvbnN0YW50IiwiaXNWYWxpZCIsImlzVHJ1ZSIsIm9yIiwiaXNTdGF0aWNUcnVlIiwiaXNDb21wYXJpc29uIiwiaXNUcnV0aHkiLCJiaW5kaW5nRXhwcmVzc2lvbiIsInZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMiLCJwYXRoVmlzaXRvciIsInRhcmdldFBhdGgiLCJsb2NhbFBhdGgiLCJjb25jYXQiLCJqb2luIiwiY29uc3RhbnRWYWx1ZSIsIkFycmF5IiwiaXNBcnJheSIsImlzUHJpbWl0aXZlT2JqZWN0IiwidmFsdWVPZiIsIk9iamVjdCIsImVudHJpZXMiLCJwbGFpbkV4cHJlc3Npb24iLCJrZXkiLCJ2YWwiLCJ3cmFwcGVkVmFsdWUiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsInRhcmdldFR5cGUiLCJzdGFydHNXaXRoIiwicGF0aEluTW9kZWxSZWdleCIsInBhdGhJbk1vZGVsUmVnZXhNYXRjaCIsImV4ZWMiLCJpc05hTiIsIk51bWJlciIsInJlZmVyZW5jZSIsInNvbWV0aGluZyIsImlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIiwibWF5YmVDb25zdGFudCIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwibWF5YmVCaW5kaW5nIiwiaXNDb21wbGV4VHlwZUV4cHJlc3Npb24iLCJpc0NvbmNhdEV4cHJlc3Npb24iLCJpc1VuZGVmaW5lZEV4cHJlc3Npb24iLCJleHByZXNzaW9uQXNFeHByZXNzaW9uIiwib2JqZWN0VHlwZSIsImNvbnN0cnVjdG9yIiwibmFtZSIsImlzQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uIiwiYW5ub3RhdGlvblZhbHVlIiwiYW5ub3RhdGlvbkV4cHJlc3Npb24iLCJkZWZhdWx0VmFsdWUiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJhbm5vdGF0aW9uSWZFeHByZXNzaW9uIiwiSWYiLCJwYXJzZUFubm90YXRpb25Db25kaXRpb24iLCJOb3QiLCJlcXVhbCIsIkVxIiwibm90RXF1YWwiLCJOZSIsImdyZWF0ZXJUaGFuIiwiR3QiLCJncmVhdGVyT3JFcXVhbCIsIkdlIiwibGVzc1RoYW4iLCJMdCIsImxlc3NPckVxdWFsIiwiTGUiLCJPciIsIm9yQ29uZGl0aW9uIiwiQW5kIiwiYW5kQ29uZGl0aW9uIiwiYW5ub3RhdGlvbkFwcGx5RXhwcmVzc2lvbiIsImhhc093blByb3BlcnR5IiwiJE9yIiwiJEFuZCIsIiROb3QiLCIkRXEiLCIkTmUiLCIkR3QiLCIkR2UiLCIkTHQiLCIkTGUiLCIkUGF0aCIsIkZ1bmN0aW9uIiwiJEZ1bmN0aW9uIiwiQXBwbHkiLCIkQXBwbHkiLCIkSWYiLCJyZXNvbHZlRW51bVZhbHVlIiwiJEVudW1NZW1iZXIiLCJpZkVsc2UiLCJjb252ZXJ0U3ViQXBwbHlQYXJhbWV0ZXJzIiwiYXBwbHlQYXJhbSIsImFwcGx5UGFyYW1Db252ZXJ0ZWQiLCJhcHBseUV4cHJlc3Npb24iLCJwYXJhbWV0ZXIiLCJ0ZW1wbGF0ZSIsInRlbXBsYXRlUGFyYW1zIiwic2xpY2UiLCJ0YXJnZXRPYmplY3QiLCIkTmFtZSIsIiRMYWJlbGVkRWxlbWVudCIsImNvbXBhcmlzb24iLCJsZWZ0T3BlcmFuZCIsInJpZ2h0T3BlcmFuZCIsImxlZnRFeHByZXNzaW9uIiwicmlnaHRFeHByZXNzaW9uIiwibGVmdCIsInJpZ2h0IiwicmVkdWNlZCIsImNvbmRpdGlvbkV4cHJlc3Npb24iLCJvblRydWVFeHByZXNzaW9uIiwib25GYWxzZUV4cHJlc3Npb24iLCJwYXRoSWR4IiwibXlJZkVsc2VFeHByZXNzaW9uIiwiZm9ybWF0UmVzdWx0IiwiYWxsUGFydHMiLCJ0cmFuc2Zvcm1SZWN1cnNpdmVseSIsImNvbnN0YW50UGF0aCIsInVuc2hpZnQiLCJKU09OIiwic3RyaW5naWZ5IiwiaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dCIsImZvcm1hdHRlckZ1bmN0aW9uIiwiY29udGV4dEVudGl0eVR5cGUiLCJpZ25vcmVDb21wbGV4VHlwZSIsInBhcmFtZXRlckV4cHJlc3Npb25zIiwia2V5cyIsImZ1bmN0aW9uTmFtZSIsIl9fZnVuY3Rpb25OYW1lIiwiZm9ybWF0dGVyQ2xhc3MiLCJmb3JtYXR0ZXJOYW1lIiwic3BsaXQiLCJteUZvcm1hdEV4cHJlc3Npb24iLCJzZXRVcENvbnN0cmFpbnRzIiwidGFyZ2V0TWFwcGluZyIsInByb3BlcnR5Iiwic2NhbGUiLCJwcmVjaXNpb24iLCJtYXhMZW5ndGgiLCJudWxsYWJsZSIsImFubm90YXRpb25zIiwiVmFsaWRhdGlvbiIsIk1pbmltdW0iLCJtaW5pbXVtIiwiTWF4aW11bSIsIm1heGltdW0iLCJDb21tb24iLCJJc0RpZ2l0U2VxdWVuY2UiLCJpc0RpZ2l0U2VxdWVuY2UiLCJWNCIsImZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24iLCJwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uIiwiaWdub3JlQ29uc3RyYWludHMiLCJvdXRFeHByZXNzaW9uIiwiZm9ybWF0T3B0aW9ucyIsImluZGV4T2YiLCJhc3NpZ24iLCJwYXJzZUFzU3RyaW5nIiwiaXNQcm9wZXJ0eSIsInBhcnNlS2VlcHNFbXB0eVN0cmluZyIsImZpc2NhbFR5cGUiLCJnZXRGaXNjYWxUeXBlIiwiZW1wdHlTdHJpbmciLCJJc0Zpc2NhbFllYXIiLCJJc0Zpc2NhbFBlcmlvZCIsIklzRmlzY2FsWWVhclBlcmlvZCIsIklzRmlzY2FsUXVhcnRlciIsIklzRmlzY2FsWWVhclF1YXJ0ZXIiLCJJc0Zpc2NhbFdlZWsiLCJJc0Zpc2NhbFllYXJXZWVrIiwiSXNEYXlPZkZpc2NhbFllYXIiLCJhZGRUeXBlSW5mb3JtYXRpb24iLCJvRm9ybWF0T3B0aW9ucyIsIl9nZXRDb21wbGV4VHlwZUZvcm1hdE9wdGlvbnNGcm9tRmlyc3RQYXJhbSIsInVvbVBhdGgiLCJtb2RlIiwiY3VycmVuY3lQYXRoIiwicGFyYW0iLCJzaG93TnVtYmVyIiwic2hvd01lYXN1cmUiLCJmdW5jIiwib24iLCJpc0Zvcm1hdHRpbmdGbiIsImlzRW1wdHkiLCJhQmluZGluZ3MiLCJpbkV4cHJlc3Npb25zIiwiY29uY2F0ZW5hdGVkIiwidG9TdHJpbmciLCJteUNvbmNhdEV4cHJlc3Npb24iLCJpbkV4cHJlc3Npb24iLCJleHByZXNzaW9uVHlwZSIsInRyYW5zZm9ybUZ1bmN0aW9uIiwiaW5jbHVkZUFsbEV4cHJlc3Npb24iLCJzdWJFeHByZXNzaW9uIiwiYmluZGluZ1BhcmFtZXRlciIsIm5lZWRQYXJlbnRoZXNpcyIsImNvbXBpbGVDb25zdGFudE9iamVjdCIsImlzTnVsbGFibGUiLCJvYmplY3RzIiwicHJvcGVydGllcyIsImNoaWxkUmVzdWx0IiwiY29tcGlsZUV4cHJlc3Npb24iLCJjb21waWxlQ29uc3RhbnQiLCJlbWJlZGRlZEluQmluZGluZyIsImRvTm90U3RyaW5naWZ5IiwiY29tcGlsZVBhdGhJbk1vZGVsRXhwcmVzc2lvbiIsImV4cHJlc3Npb25Gb3JCaW5kaW5nIiwiZW1iZWRkZWRTZXBhcmF0b3IiLCJjb21wbGV4QmluZGluZ0RlZmluaXRpb24iLCJjb21waWxlUGF0aEluTW9kZWwiLCJvdXRCaW5kaW5nIiwiY29tcGlsZUNvbXBsZXhUeXBlRXhwcmVzc2lvbiIsImNvbXBpbGVQYXRoUGFyYW1ldGVyIiwib3V0cHV0RW5kIiwiaGFzRWxlbWVudHMiLCJ3cmFwQmluZGluZ0V4cHJlc3Npb24iLCJwYXJlbnRoZXNpc1JlcXVpcmVkIiwia2VlcFRhcmdldFR5cGUiLCJoYXNFbWJlZGRlZEZ1bmN0aW9uQ2FsbE9yQmluZGluZyIsInN1YkZuIiwic3ViU3ViRm4iLCJhcmd1bWVudFN0cmluZyIsImFyZyIsImZuQ2FsbCIsInN1YnN0cmluZyIsImNvbXBhcmlzb25FeHByZXNzaW9uIiwiY29tcGlsZUNvbXBhcmlzb25FeHByZXNzaW9uIiwiaWZFbHNlRXhwcmVzc2lvbiIsInNldEV4cHJlc3Npb24iLCJjb25jYXRFeHByZXNzaW9uIiwibmVzdGVkRXhwcmVzc2lvbiIsImxlbmd0aEV4cHJlc3Npb24iLCJub3RFeHByZXNzaW9uIiwidHJ1dGh5RXhwcmVzc2lvbiIsImZvcm1hdHRlckV4cHJlc3Npb24iLCJjb21waWxlRm9ybWF0dGVyRXhwcmVzc2lvbiIsImNvbXBsZXhUeXBlRXhwcmVzc2lvbiIsImNvbXBpbGVPcGVyYW5kIiwiY29tcGlsZWRPcGVyYW5kIiwicGFydHMiLCJzaW5nbGVQYXRoIiwib3V0VmFsdWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkJpbmRpbmdUb29sa2l0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0QWN0aW9uUGFyYW1ldGVyLFxuXHRBbmRBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0QW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRBcHBseUFubm90YXRpb25FeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbENoZWNrT3JWYWx1ZSxcblx0RW50aXR5U2V0LFxuXHRFbnRpdHlUeXBlLFxuXHRFcUFubm90YXRpb25FeHByZXNzaW9uLFxuXHRFcUNvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0R2VBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0R2VDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdEd0QW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdEd0Q29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRJZkFubm90YXRpb25FeHByZXNzaW9uLFxuXHRJZkFubm90YXRpb25FeHByZXNzaW9uVmFsdWUsXG5cdExlQW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdExlQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRMdEFubm90YXRpb25FeHByZXNzaW9uLFxuXHRMdENvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0TmVBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0TmVDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdE5vdEFubm90YXRpb25FeHByZXNzaW9uLFxuXHROb3RDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdE9yQW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdE9yQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24sXG5cdFBhdGhDb25kaXRpb25FeHByZXNzaW9uLFxuXHRQcm9wZXJ0eSxcblx0UHJvcGVydHlBbm5vdGF0aW9uVmFsdWVcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7IHJlc29sdmVFbnVtVmFsdWUgfSBmcm9tIFwiLi9Bbm5vdGF0aW9uRW51bVwiO1xuXG50eXBlIFByaW1pdGl2ZVR5cGUgPSBzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgb2JqZWN0IHwgbnVsbCB8IHVuZGVmaW5lZDtcbnR5cGUgRGVmaW5lZFByaW1pdGl2ZVR5cGUgPSBzdHJpbmcgfCBudW1iZXIgfCBiaWdpbnQgfCBib29sZWFuIHwgb2JqZWN0O1xudHlwZSBQcmltaXRpdmVUeXBlQ2FzdDxQPiA9XG5cdHwgKFAgZXh0ZW5kcyBCb29sZWFuID8gYm9vbGVhbiA6IG5ldmVyKVxuXHR8IChQIGV4dGVuZHMgTnVtYmVyID8gbnVtYmVyIDogbmV2ZXIpXG5cdHwgKFAgZXh0ZW5kcyBTdHJpbmcgPyBzdHJpbmcgOiBuZXZlcilcblx0fCBQO1xudHlwZSBCYXNlRXhwcmVzc2lvbjxfVD4gPSB7XG5cdF90eXBlOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBDb25zdGFudEV4cHJlc3Npb248VD4gPSBCYXNlRXhwcmVzc2lvbjxUPiAmIHtcblx0X3R5cGU6IFwiQ29uc3RhbnRcIjtcblx0dmFsdWU6IFQ7XG59O1xuXG50eXBlIFNldE9wZXJhdG9yID0gXCImJlwiIHwgXCJ8fFwiO1xuZXhwb3J0IHR5cGUgU2V0RXhwcmVzc2lvbiA9IEJhc2VFeHByZXNzaW9uPGJvb2xlYW4+ICYge1xuXHRfdHlwZTogXCJTZXRcIjtcblx0b3BlcmF0b3I6IFNldE9wZXJhdG9yO1xuXHRvcGVyYW5kczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W107XG59O1xuXG5leHBvcnQgdHlwZSBOb3RFeHByZXNzaW9uID0gQmFzZUV4cHJlc3Npb248Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIk5vdFwiO1xuXHRvcGVyYW5kOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG59O1xuXG5leHBvcnQgdHlwZSBUcnV0aHlFeHByZXNzaW9uID0gQmFzZUV4cHJlc3Npb248Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIlRydXRoeVwiO1xuXHRvcGVyYW5kOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPjtcbn07XG5cbmV4cG9ydCB0eXBlIFJlZmVyZW5jZUV4cHJlc3Npb24gPSBCYXNlRXhwcmVzc2lvbjxvYmplY3Q+ICYge1xuXHRfdHlwZTogXCJSZWZcIjtcblx0cmVmOiBzdHJpbmcgfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgRm9ybWF0dGVyRXhwcmVzc2lvbjxUPiA9IEJhc2VFeHByZXNzaW9uPFQ+ICYge1xuXHRfdHlwZTogXCJGb3JtYXR0ZXJcIjtcblx0Zm46IHN0cmluZztcblx0cGFyYW1ldGVyczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT5bXTtcbn07XG5cbnR5cGUgQ29tcGxleFR5cGVFeHByZXNzaW9uPFQ+ID0gQmFzZUV4cHJlc3Npb248VD4gJiB7XG5cdF90eXBlOiBcIkNvbXBsZXhUeXBlXCI7XG5cdHR5cGU6IHN0cmluZztcblx0Zm9ybWF0T3B0aW9uczogYW55O1xuXHRwYXJhbWV0ZXJzOiBvYmplY3Q7XG5cdGJpbmRpbmdQYXJhbWV0ZXJzOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PltdO1xufTtcblxuZXhwb3J0IHR5cGUgRnVuY3Rpb25FeHByZXNzaW9uPFQ+ID0gQmFzZUV4cHJlc3Npb248VD4gJiB7XG5cdF90eXBlOiBcIkZ1bmN0aW9uXCI7XG5cdG9iaj86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxvYmplY3Q+O1xuXHRmbjogc3RyaW5nO1xuXHRpc0Zvcm1hdHRpbmdGbjogYm9vbGVhbjtcblx0cGFyYW1ldGVyczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT5bXTtcbn07XG5cbmV4cG9ydCB0eXBlIENvbmNhdEV4cHJlc3Npb24gPSBCYXNlRXhwcmVzc2lvbjxzdHJpbmc+ICYge1xuXHRfdHlwZTogXCJDb25jYXRcIjtcblx0ZXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+W107XG59O1xuXG5leHBvcnQgdHlwZSBMZW5ndGhFeHByZXNzaW9uID0gQmFzZUV4cHJlc3Npb248c3RyaW5nPiAmIHtcblx0X3R5cGU6IFwiTGVuZ3RoXCI7XG5cdHBhdGhJbk1vZGVsOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248YW55Pjtcbn07XG5cbnR5cGUgVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb24gPSBCYXNlRXhwcmVzc2lvbjxzdHJpbmc+ICYge1xuXHRfdHlwZTogXCJVbnJlc29sdmFibGVcIjtcbn07XG5cbi8qKlxuICogQHR5cGVkZWYgUGF0aEluTW9kZWxFeHByZXNzaW9uXG4gKi9cbmV4cG9ydCB0eXBlIFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxUPiA9IEJhc2VFeHByZXNzaW9uPFQ+ICYge1xuXHRfdHlwZTogXCJQYXRoSW5Nb2RlbFwiO1xuXHRtb2RlbE5hbWU/OiBzdHJpbmc7XG5cdHBhdGg6IHN0cmluZztcblx0dGFyZ2V0RW50aXR5U2V0PzogRW50aXR5U2V0O1xuXHR0eXBlPzogc3RyaW5nO1xuXHRjb25zdHJhaW50cz86IGFueTtcblx0cGFyYW1ldGVycz86IGFueTtcblx0dGFyZ2V0VHlwZT86IHN0cmluZztcblx0bW9kZT86IHN0cmluZztcblx0Zm9ybWF0T3B0aW9ucz86IGFueTtcbn07XG5cbmV4cG9ydCB0eXBlIEVtYmVkZGVkVUk1QmluZGluZ0V4cHJlc3Npb248VD4gPSBCYXNlRXhwcmVzc2lvbjxUPiAmIHtcblx0X3R5cGU6IFwiRW1iZWRkZWRCaW5kaW5nXCI7XG5cdHZhbHVlOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBFbWJlZGRlZFVJNUV4cHJlc3Npb25CaW5kaW5nRXhwcmVzc2lvbjxUPiA9IEJhc2VFeHByZXNzaW9uPFQ+ICYge1xuXHRfdHlwZTogXCJFbWJlZGRlZEV4cHJlc3Npb25CaW5kaW5nXCI7XG5cdHZhbHVlOiBzdHJpbmc7XG59O1xuXG50eXBlIENvbXBhcmlzb25PcGVyYXRvciA9IFwiPT09XCIgfCBcIiE9PVwiIHwgXCI+PVwiIHwgXCI+XCIgfCBcIjw9XCIgfCBcIjxcIjtcbmV4cG9ydCB0eXBlIENvbXBhcmlzb25FeHByZXNzaW9uID0gQmFzZUV4cHJlc3Npb248Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIkNvbXBhcmlzb25cIjtcblx0b3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvcjtcblx0b3BlcmFuZDE6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+O1xuXHRvcGVyYW5kMjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT47XG59O1xuXG5leHBvcnQgdHlwZSBJZkVsc2VFeHByZXNzaW9uPFQ+ID0gQmFzZUV4cHJlc3Npb248VD4gJiB7XG5cdF90eXBlOiBcIklmRWxzZVwiO1xuXHRjb25kaXRpb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPjtcblx0b25UcnVlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdG9uRmFsc2U6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcbn07XG5cbi8qKlxuICogQW4gZXhwcmVzc2lvbiB0aGF0IGV2YWx1YXRlcyB0byB0eXBlIFQuXG4gKlxuICogQHR5cGVkZWYgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uXG4gKi9cbmV4cG9ydCB0eXBlIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiA9XG5cdHwgVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb25cblx0fCBDb25zdGFudEV4cHJlc3Npb248VD5cblx0fCBTZXRFeHByZXNzaW9uXG5cdHwgTm90RXhwcmVzc2lvblxuXHR8IFRydXRoeUV4cHJlc3Npb25cblx0fCBDb25jYXRFeHByZXNzaW9uXG5cdHwgTGVuZ3RoRXhwcmVzc2lvblxuXHR8IFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxUPlxuXHR8IEVtYmVkZGVkVUk1QmluZGluZ0V4cHJlc3Npb248VD5cblx0fCBFbWJlZGRlZFVJNUV4cHJlc3Npb25CaW5kaW5nRXhwcmVzc2lvbjxUPlxuXHR8IENvbXBhcmlzb25FeHByZXNzaW9uXG5cdHwgSWZFbHNlRXhwcmVzc2lvbjxUPlxuXHR8IEZvcm1hdHRlckV4cHJlc3Npb248VD5cblx0fCBDb21wbGV4VHlwZUV4cHJlc3Npb248VD5cblx0fCBSZWZlcmVuY2VFeHByZXNzaW9uXG5cdHwgRnVuY3Rpb25FeHByZXNzaW9uPFQ+O1xuXG5leHBvcnQgY29uc3QgRURNX1RZUEVfTUFQUElORzogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0XCJFZG0uQm9vbGVhblwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuQm9vbGVhblwiIH0sXG5cdFwiRWRtLkJ5dGVcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkJ5dGVcIiB9LFxuXHRcIkVkbS5EYXRlXCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlXCIgfSxcblx0XCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjoge1xuXHRcdGNvbnN0cmFpbnRzOiB7XG5cdFx0XHQkUHJlY2lzaW9uOiBcInByZWNpc2lvblwiLFxuXHRcdFx0JFY0OiBcIlY0XCJcblx0XHR9LFxuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRGF0ZVRpbWVPZmZzZXRcIlxuXHR9LFxuXHRcIkVkbS5EZWNpbWFsXCI6IHtcblx0XHRjb25zdHJhaW50czoge1xuXHRcdFx0XCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWluaW11bS8kRGVjaW1hbFwiOiBcIm1pbmltdW1cIixcblx0XHRcdFwiQE9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1pbmltdW1AT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuRXhjbHVzaXZlXCI6IFwibWluaW11bUV4Y2x1c2l2ZVwiLFxuXHRcdFx0XCJAT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWF4aW11bS8kRGVjaW1hbFwiOiBcIm1heGltdW1cIixcblx0XHRcdFwiQE9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1heGltdW1AT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuRXhjbHVzaXZlXCI6IFwibWF4aW11bUV4Y2x1c2l2ZVwiLFxuXHRcdFx0JFByZWNpc2lvbjogXCJwcmVjaXNpb25cIixcblx0XHRcdCRTY2FsZTogXCJzY2FsZVwiXG5cdFx0fSxcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRlY2ltYWxcIlxuXHR9LFxuXHRcIkVkbS5Eb3VibGVcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRvdWJsZVwiIH0sXG5cdFwiRWRtLkd1aWRcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkd1aWRcIiB9LFxuXHRcIkVkbS5JbnQxNlwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuSW50MTZcIiB9LFxuXHRcIkVkbS5JbnQzMlwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuSW50MzJcIiB9LFxuXHRcIkVkbS5JbnQ2NFwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuSW50NjRcIiB9LFxuXHRcIkVkbS5TQnl0ZVwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU0J5dGVcIiB9LFxuXHRcIkVkbS5TaW5nbGVcIjogeyB0eXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlNpbmdsZVwiIH0sXG5cdFwiRWRtLlN0cmVhbVwiOiB7IHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyZWFtXCIgfSxcblx0XCJFZG0uQmluYXJ5XCI6IHsgdHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJlYW1cIiB9LFxuXHRcIkVkbS5TdHJpbmdcIjoge1xuXHRcdGNvbnN0cmFpbnRzOiB7XG5cdFx0XHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEaWdpdFNlcXVlbmNlXCI6IFwiaXNEaWdpdFNlcXVlbmNlXCIsXG5cdFx0XHQkTWF4TGVuZ3RoOiBcIm1heExlbmd0aFwiLFxuXHRcdFx0JE51bGxhYmxlOiBcIm51bGxhYmxlXCJcblx0XHR9LFxuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCJcblx0fSxcblx0XCJFZG0uVGltZU9mRGF5XCI6IHtcblx0XHRjb25zdHJhaW50czoge1xuXHRcdFx0JFByZWNpc2lvbjogXCJwcmVjaXNpb25cIlxuXHRcdH0sXG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5UaW1lT2ZEYXlcIlxuXHR9XG59O1xuXG4vKipcbiAqIEFuIGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXMgdG8gdHlwZSBULCBvciBhIGNvbnN0YW50IHZhbHVlIG9mIHR5cGUgVFxuICovXG50eXBlIEV4cHJlc3Npb25PclByaW1pdGl2ZTxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4gPSBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4gfCBUO1xuXG5leHBvcnQgY29uc3QgdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjogVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb24gPSB7XG5cdF90eXBlOiBcIlVucmVzb2x2YWJsZVwiXG59O1xuXG5mdW5jdGlvbiBlc2NhcGVYbWxBdHRyaWJ1dGUoaW5wdXRTdHJpbmc6IHN0cmluZykge1xuXHRyZXR1cm4gaW5wdXRTdHJpbmcucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzVW5yZXNvbHZhYmxlRXhwcmVzc2lvbiguLi5leHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT5bXSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gZXhwcmVzc2lvbnMuZmluZCgoZXhwcikgPT4gZXhwci5fdHlwZSA9PT0gXCJVbnJlc29sdmFibGVcIikgIT09IHVuZGVmaW5lZDtcbn1cbi8qKlxuICogQ2hlY2sgdHdvIGV4cHJlc3Npb25zIGZvciAoZGVlcCkgZXF1YWxpdHkuXG4gKlxuICogQHBhcmFtIGFcbiAqIEBwYXJhbSBiXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHR3byBleHByZXNzaW9ucyBhcmUgZXF1YWxcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsPFQ+KGE6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiwgYjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+KTogYm9vbGVhbiB7XG5cdGlmIChhLl90eXBlICE9PSBiLl90eXBlKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0c3dpdGNoIChhLl90eXBlKSB7XG5cdFx0Y2FzZSBcIlVucmVzb2x2YWJsZVwiOlxuXHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBVbnJlc29sdmFibGUgaXMgbmV2ZXIgZXF1YWwgdG8gYW55dGhpbmcgZXZlbiBpdHNlbGZcblx0XHRjYXNlIFwiQ29uc3RhbnRcIjpcblx0XHRjYXNlIFwiRW1iZWRkZWRCaW5kaW5nXCI6XG5cdFx0Y2FzZSBcIkVtYmVkZGVkRXhwcmVzc2lvbkJpbmRpbmdcIjpcblx0XHRcdHJldHVybiBhLnZhbHVlID09PSAoYiBhcyBDb25zdGFudEV4cHJlc3Npb248VD4pLnZhbHVlO1xuXG5cdFx0Y2FzZSBcIk5vdFwiOlxuXHRcdFx0cmV0dXJuIF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoYS5vcGVyYW5kLCAoYiBhcyBOb3RFeHByZXNzaW9uKS5vcGVyYW5kKTtcblx0XHRjYXNlIFwiVHJ1dGh5XCI6XG5cdFx0XHRyZXR1cm4gX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChhLm9wZXJhbmQsIChiIGFzIFRydXRoeUV4cHJlc3Npb24pLm9wZXJhbmQpO1xuXHRcdGNhc2UgXCJTZXRcIjpcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGEub3BlcmF0b3IgPT09IChiIGFzIFNldEV4cHJlc3Npb24pLm9wZXJhdG9yICYmXG5cdFx0XHRcdGEub3BlcmFuZHMubGVuZ3RoID09PSAoYiBhcyBTZXRFeHByZXNzaW9uKS5vcGVyYW5kcy5sZW5ndGggJiZcblx0XHRcdFx0YS5vcGVyYW5kcy5ldmVyeSgoZXhwcmVzc2lvbikgPT5cblx0XHRcdFx0XHQoYiBhcyBTZXRFeHByZXNzaW9uKS5vcGVyYW5kcy5zb21lKChvdGhlckV4cHJlc3Npb24pID0+IF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoZXhwcmVzc2lvbiwgb3RoZXJFeHByZXNzaW9uKSlcblx0XHRcdFx0KVxuXHRcdFx0KTtcblxuXHRcdGNhc2UgXCJJZkVsc2VcIjpcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoYS5jb25kaXRpb24sIChiIGFzIElmRWxzZUV4cHJlc3Npb248VD4pLmNvbmRpdGlvbikgJiZcblx0XHRcdFx0X2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChhLm9uVHJ1ZSwgKGIgYXMgSWZFbHNlRXhwcmVzc2lvbjxUPikub25UcnVlKSAmJlxuXHRcdFx0XHRfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGEub25GYWxzZSwgKGIgYXMgSWZFbHNlRXhwcmVzc2lvbjxUPikub25GYWxzZSlcblx0XHRcdCk7XG5cblx0XHRjYXNlIFwiQ29tcGFyaXNvblwiOlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0YS5vcGVyYXRvciA9PT0gKGIgYXMgQ29tcGFyaXNvbkV4cHJlc3Npb24pLm9wZXJhdG9yICYmXG5cdFx0XHRcdF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoYS5vcGVyYW5kMSwgKGIgYXMgQ29tcGFyaXNvbkV4cHJlc3Npb24pLm9wZXJhbmQxKSAmJlxuXHRcdFx0XHRfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGEub3BlcmFuZDIsIChiIGFzIENvbXBhcmlzb25FeHByZXNzaW9uKS5vcGVyYW5kMilcblx0XHRcdCk7XG5cblx0XHRjYXNlIFwiQ29uY2F0XCI6XG5cdFx0XHRjb25zdCBhRXhwcmVzc2lvbnMgPSBhLmV4cHJlc3Npb25zO1xuXHRcdFx0Y29uc3QgYkV4cHJlc3Npb25zID0gKGIgYXMgQ29uY2F0RXhwcmVzc2lvbikuZXhwcmVzc2lvbnM7XG5cdFx0XHRpZiAoYUV4cHJlc3Npb25zLmxlbmd0aCAhPT0gYkV4cHJlc3Npb25zLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYUV4cHJlc3Npb25zLmV2ZXJ5KChleHByZXNzaW9uLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChleHByZXNzaW9uLCBiRXhwcmVzc2lvbnNbaW5kZXhdKTtcblx0XHRcdH0pO1xuXG5cdFx0Y2FzZSBcIkxlbmd0aFwiOlxuXHRcdFx0cmV0dXJuIF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoYS5wYXRoSW5Nb2RlbCwgKGIgYXMgTGVuZ3RoRXhwcmVzc2lvbikucGF0aEluTW9kZWwpO1xuXG5cdFx0Y2FzZSBcIlBhdGhJbk1vZGVsXCI6XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRhLm1vZGVsTmFtZSA9PT0gKGIgYXMgUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+KS5tb2RlbE5hbWUgJiZcblx0XHRcdFx0YS5wYXRoID09PSAoYiBhcyBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VD4pLnBhdGggJiZcblx0XHRcdFx0YS50YXJnZXRFbnRpdHlTZXQgPT09IChiIGFzIFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxUPikudGFyZ2V0RW50aXR5U2V0XG5cdFx0XHQpO1xuXG5cdFx0Y2FzZSBcIkZvcm1hdHRlclwiOlxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0YS5mbiA9PT0gKGIgYXMgRm9ybWF0dGVyRXhwcmVzc2lvbjxUPikuZm4gJiZcblx0XHRcdFx0YS5wYXJhbWV0ZXJzLmxlbmd0aCA9PT0gKGIgYXMgRm9ybWF0dGVyRXhwcmVzc2lvbjxUPikucGFyYW1ldGVycy5sZW5ndGggJiZcblx0XHRcdFx0YS5wYXJhbWV0ZXJzLmV2ZXJ5KCh2YWx1ZSwgaW5kZXgpID0+IF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoKGIgYXMgRm9ybWF0dGVyRXhwcmVzc2lvbjxUPikucGFyYW1ldGVyc1tpbmRleF0sIHZhbHVlKSlcblx0XHRcdCk7XG5cdFx0Y2FzZSBcIkNvbXBsZXhUeXBlXCI6XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRhLnR5cGUgPT09IChiIGFzIENvbXBsZXhUeXBlRXhwcmVzc2lvbjxUPikudHlwZSAmJlxuXHRcdFx0XHRhLmJpbmRpbmdQYXJhbWV0ZXJzLmxlbmd0aCA9PT0gKGIgYXMgQ29tcGxleFR5cGVFeHByZXNzaW9uPFQ+KS5iaW5kaW5nUGFyYW1ldGVycy5sZW5ndGggJiZcblx0XHRcdFx0YS5iaW5kaW5nUGFyYW1ldGVycy5ldmVyeSgodmFsdWUsIGluZGV4KSA9PlxuXHRcdFx0XHRcdF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoKGIgYXMgQ29tcGxleFR5cGVFeHByZXNzaW9uPFQ+KS5iaW5kaW5nUGFyYW1ldGVyc1tpbmRleF0sIHZhbHVlKVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdGNhc2UgXCJGdW5jdGlvblwiOlxuXHRcdFx0Y29uc3Qgb3RoZXJGdW5jdGlvbiA9IGIgYXMgRnVuY3Rpb25FeHByZXNzaW9uPFQ+O1xuXHRcdFx0aWYgKGEub2JqID09PSB1bmRlZmluZWQgfHwgb3RoZXJGdW5jdGlvbi5vYmogPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gYS5vYmogPT09IG90aGVyRnVuY3Rpb247XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGEuZm4gPT09IG90aGVyRnVuY3Rpb24uZm4gJiZcblx0XHRcdFx0X2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChhLm9iaiwgb3RoZXJGdW5jdGlvbi5vYmopICYmXG5cdFx0XHRcdGEucGFyYW1ldGVycy5sZW5ndGggPT09IG90aGVyRnVuY3Rpb24ucGFyYW1ldGVycy5sZW5ndGggJiZcblx0XHRcdFx0YS5wYXJhbWV0ZXJzLmV2ZXJ5KCh2YWx1ZSwgaW5kZXgpID0+IF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwob3RoZXJGdW5jdGlvbi5wYXJhbWV0ZXJzW2luZGV4XSwgdmFsdWUpKVxuXHRcdFx0KTtcblxuXHRcdGNhc2UgXCJSZWZcIjpcblx0XHRcdHJldHVybiBhLnJlZiA9PT0gKGIgYXMgUmVmZXJlbmNlRXhwcmVzc2lvbikucmVmO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIG5lc3RlZCBTZXRFeHByZXNzaW9uIGJ5IGlubGluaW5nIG9wZXJhbmRzIG9mIHR5cGUgU2V0RXhwcmVzc2lvbiB3aXRoIHRoZSBzYW1lIG9wZXJhdG9yLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBleHByZXNzaW9uIHRvIGZsYXR0ZW5cbiAqIEByZXR1cm5zIEEgbmV3IFNldEV4cHJlc3Npb24gd2l0aCB0aGUgc2FtZSBvcGVyYXRvclxuICovXG5mdW5jdGlvbiBmbGF0dGVuU2V0RXhwcmVzc2lvbihleHByZXNzaW9uOiBTZXRFeHByZXNzaW9uKTogU2V0RXhwcmVzc2lvbiB7XG5cdHJldHVybiBleHByZXNzaW9uLm9wZXJhbmRzLnJlZHVjZShcblx0XHQocmVzdWx0OiBTZXRFeHByZXNzaW9uLCBvcGVyYW5kKSA9PiB7XG5cdFx0XHRjb25zdCBjYW5kaWRhdGVzRm9yRmxhdHRlbmluZyA9XG5cdFx0XHRcdG9wZXJhbmQuX3R5cGUgPT09IFwiU2V0XCIgJiYgb3BlcmFuZC5vcGVyYXRvciA9PT0gZXhwcmVzc2lvbi5vcGVyYXRvciA/IG9wZXJhbmQub3BlcmFuZHMgOiBbb3BlcmFuZF07XG5cdFx0XHRjYW5kaWRhdGVzRm9yRmxhdHRlbmluZy5mb3JFYWNoKChjYW5kaWRhdGUpID0+IHtcblx0XHRcdFx0aWYgKHJlc3VsdC5vcGVyYW5kcy5ldmVyeSgoZSkgPT4gIV9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwoZSwgY2FuZGlkYXRlKSkpIHtcblx0XHRcdFx0XHRyZXN1bHQub3BlcmFuZHMucHVzaChjYW5kaWRhdGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSxcblx0XHR7IF90eXBlOiBcIlNldFwiLCBvcGVyYXRvcjogZXhwcmVzc2lvbi5vcGVyYXRvciwgb3BlcmFuZHM6IFtdIH1cblx0KTtcbn1cblxuLyoqXG4gKiBEZXRlY3RzIHdoZXRoZXIgYW4gYXJyYXkgb2YgYm9vbGVhbiBleHByZXNzaW9ucyBjb250YWlucyBhbiBleHByZXNzaW9uIGFuZCBpdHMgbmVnYXRpb24uXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb25zIEFycmF5IG9mIGV4cHJlc3Npb25zXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHNldCBvZiBleHByZXNzaW9ucyBjb250YWlucyBhbiBleHByZXNzaW9uIGFuZCBpdHMgbmVnYXRpb25cbiAqL1xuZnVuY3Rpb24gaGFzT3Bwb3NpdGVFeHByZXNzaW9ucyhleHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10pOiBib29sZWFuIHtcblx0Y29uc3QgbmVnYXRlZEV4cHJlc3Npb25zID0gZXhwcmVzc2lvbnMubWFwKG5vdCk7XG5cdHJldHVybiBleHByZXNzaW9ucy5zb21lKChleHByZXNzaW9uLCBpbmRleCkgPT4ge1xuXHRcdGZvciAobGV0IGkgPSBpbmRleCArIDE7IGkgPCBuZWdhdGVkRXhwcmVzc2lvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGV4cHJlc3Npb24sIG5lZ2F0ZWRFeHByZXNzaW9uc1tpXSkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG59XG5cbi8qKlxuICogTG9naWNhbCBgYW5kYCBleHByZXNzaW9uLlxuICpcbiAqIFRoZSBleHByZXNzaW9uIGlzIHNpbXBsaWZpZWQgdG8gZmFsc2UgaWYgdGhpcyBjYW4gYmUgZGVjaWRlZCBzdGF0aWNhbGx5ICh0aGF0IGlzLCBpZiBvbmUgb3BlcmFuZCBpcyBhIGNvbnN0YW50XG4gKiBmYWxzZSBvciBpZiB0aGUgZXhwcmVzc2lvbiBjb250YWlucyBhbiBvcGVyYW5kIGFuZCBpdHMgbmVnYXRpb24pLlxuICpcbiAqIEBwYXJhbSBvcGVyYW5kcyBFeHByZXNzaW9ucyB0byBjb25uZWN0IGJ5IGBhbmRgXG4gKiBAcmV0dXJucyBFeHByZXNzaW9uIGV2YWx1YXRpbmcgdG8gYm9vbGVhblxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5kKC4uLm9wZXJhbmRzOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8Ym9vbGVhbj5bXSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGV4cHJlc3Npb25zID0gZmxhdHRlblNldEV4cHJlc3Npb24oe1xuXHRcdF90eXBlOiBcIlNldFwiLFxuXHRcdG9wZXJhdG9yOiBcIiYmXCIsXG5cdFx0b3BlcmFuZHM6IG9wZXJhbmRzLm1hcCh3cmFwUHJpbWl0aXZlKVxuXHR9KS5vcGVyYW5kcztcblxuXHRpZiAoaGFzVW5yZXNvbHZhYmxlRXhwcmVzc2lvbiguLi5leHByZXNzaW9ucykpIHtcblx0XHRyZXR1cm4gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjtcblx0fVxuXHRsZXQgaXNTdGF0aWNGYWxzZSA9IGZhbHNlO1xuXHRjb25zdCBub25Ucml2aWFsRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25zLmZpbHRlcigoZXhwcmVzc2lvbikgPT4ge1xuXHRcdGlmIChpc0ZhbHNlKGV4cHJlc3Npb24pKSB7XG5cdFx0XHRpc1N0YXRpY0ZhbHNlID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuICFpc0NvbnN0YW50KGV4cHJlc3Npb24pO1xuXHR9KTtcblx0aWYgKGlzU3RhdGljRmFsc2UpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoZmFsc2UpO1xuXHR9IGVsc2UgaWYgKG5vblRyaXZpYWxFeHByZXNzaW9uLmxlbmd0aCA9PT0gMCkge1xuXHRcdC8vIFJlc29sdmUgdGhlIGNvbnN0YW50IHRoZW5cblx0XHRjb25zdCBpc1ZhbGlkID0gZXhwcmVzc2lvbnMucmVkdWNlKChyZXN1bHQsIGV4cHJlc3Npb24pID0+IHJlc3VsdCAmJiBpc1RydWUoZXhwcmVzc2lvbiksIHRydWUpO1xuXHRcdHJldHVybiBjb25zdGFudChpc1ZhbGlkKTtcblx0fSBlbHNlIGlmIChub25Ucml2aWFsRXhwcmVzc2lvbi5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gbm9uVHJpdmlhbEV4cHJlc3Npb25bMF07XG5cdH0gZWxzZSBpZiAoaGFzT3Bwb3NpdGVFeHByZXNzaW9ucyhub25Ucml2aWFsRXhwcmVzc2lvbikpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoZmFsc2UpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRfdHlwZTogXCJTZXRcIixcblx0XHRcdG9wZXJhdG9yOiBcIiYmXCIsXG5cdFx0XHRvcGVyYW5kczogbm9uVHJpdmlhbEV4cHJlc3Npb25cblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogTG9naWNhbCBgb3JgIGV4cHJlc3Npb24uXG4gKlxuICogVGhlIGV4cHJlc3Npb24gaXMgc2ltcGxpZmllZCB0byB0cnVlIGlmIHRoaXMgY2FuIGJlIGRlY2lkZWQgc3RhdGljYWxseSAodGhhdCBpcywgaWYgb25lIG9wZXJhbmQgaXMgYSBjb25zdGFudFxuICogdHJ1ZSBvciBpZiB0aGUgZXhwcmVzc2lvbiBjb250YWlucyBhbiBvcGVyYW5kIGFuZCBpdHMgbmVnYXRpb24pLlxuICpcbiAqIEBwYXJhbSBvcGVyYW5kcyBFeHByZXNzaW9ucyB0byBjb25uZWN0IGJ5IGBvcmBcbiAqIEByZXR1cm5zIEV4cHJlc3Npb24gZXZhbHVhdGluZyB0byBib29sZWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvciguLi5vcGVyYW5kczogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPGJvb2xlYW4+W10pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBleHByZXNzaW9ucyA9IGZsYXR0ZW5TZXRFeHByZXNzaW9uKHtcblx0XHRfdHlwZTogXCJTZXRcIixcblx0XHRvcGVyYXRvcjogXCJ8fFwiLFxuXHRcdG9wZXJhbmRzOiBvcGVyYW5kcy5tYXAod3JhcFByaW1pdGl2ZSlcblx0fSkub3BlcmFuZHM7XG5cdGlmIChoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uKC4uLmV4cHJlc3Npb25zKSkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9XG5cdGxldCBpc1N0YXRpY1RydWUgPSBmYWxzZTtcblx0Y29uc3Qgbm9uVHJpdmlhbEV4cHJlc3Npb24gPSBleHByZXNzaW9ucy5maWx0ZXIoKGV4cHJlc3Npb24pID0+IHtcblx0XHRpZiAoaXNUcnVlKGV4cHJlc3Npb24pKSB7XG5cdFx0XHRpc1N0YXRpY1RydWUgPSB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gIWlzQ29uc3RhbnQoZXhwcmVzc2lvbikgfHwgZXhwcmVzc2lvbi52YWx1ZTtcblx0fSk7XG5cdGlmIChpc1N0YXRpY1RydWUpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdH0gZWxzZSBpZiAobm9uVHJpdmlhbEV4cHJlc3Npb24ubGVuZ3RoID09PSAwKSB7XG5cdFx0Ly8gUmVzb2x2ZSB0aGUgY29uc3RhbnQgdGhlblxuXHRcdGNvbnN0IGlzVmFsaWQgPSBleHByZXNzaW9ucy5yZWR1Y2UoKHJlc3VsdCwgZXhwcmVzc2lvbikgPT4gcmVzdWx0ICYmIGlzVHJ1ZShleHByZXNzaW9uKSwgdHJ1ZSk7XG5cdFx0cmV0dXJuIGNvbnN0YW50KGlzVmFsaWQpO1xuXHR9IGVsc2UgaWYgKG5vblRyaXZpYWxFeHByZXNzaW9uLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBub25Ucml2aWFsRXhwcmVzc2lvblswXTtcblx0fSBlbHNlIGlmIChoYXNPcHBvc2l0ZUV4cHJlc3Npb25zKG5vblRyaXZpYWxFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBjb25zdGFudCh0cnVlKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0X3R5cGU6IFwiU2V0XCIsXG5cdFx0XHRvcGVyYXRvcjogXCJ8fFwiLFxuXHRcdFx0b3BlcmFuZHM6IG5vblRyaXZpYWxFeHByZXNzaW9uXG5cdFx0fTtcblx0fVxufVxuXG4vKipcbiAqIExvZ2ljYWwgYG5vdGAgb3BlcmF0b3IuXG4gKlxuICogQHBhcmFtIG9wZXJhbmQgVGhlIGV4cHJlc3Npb24gdG8gcmV2ZXJzZVxuICogQHJldHVybnMgVGhlIHJlc3VsdGluZyBleHByZXNzaW9uIHRoYXQgZXZhbHVhdGVzIHRvIGJvb2xlYW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vdChvcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8Ym9vbGVhbj4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRvcGVyYW5kID0gd3JhcFByaW1pdGl2ZShvcGVyYW5kKTtcblx0aWYgKGhhc1VucmVzb2x2YWJsZUV4cHJlc3Npb24ob3BlcmFuZCkpIHtcblx0XHRyZXR1cm4gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjtcblx0fSBlbHNlIGlmIChpc0NvbnN0YW50KG9wZXJhbmQpKSB7XG5cdFx0cmV0dXJuIGNvbnN0YW50KCFvcGVyYW5kLnZhbHVlKTtcblx0fSBlbHNlIGlmIChcblx0XHR0eXBlb2Ygb3BlcmFuZCA9PT0gXCJvYmplY3RcIiAmJlxuXHRcdG9wZXJhbmQuX3R5cGUgPT09IFwiU2V0XCIgJiZcblx0XHRvcGVyYW5kLm9wZXJhdG9yID09PSBcInx8XCIgJiZcblx0XHRvcGVyYW5kLm9wZXJhbmRzLmV2ZXJ5KChleHByZXNzaW9uKSA9PiBpc0NvbnN0YW50KGV4cHJlc3Npb24pIHx8IGlzQ29tcGFyaXNvbihleHByZXNzaW9uKSlcblx0KSB7XG5cdFx0cmV0dXJuIGFuZCguLi5vcGVyYW5kLm9wZXJhbmRzLm1hcCgoZXhwcmVzc2lvbikgPT4gbm90KGV4cHJlc3Npb24pKSk7XG5cdH0gZWxzZSBpZiAoXG5cdFx0dHlwZW9mIG9wZXJhbmQgPT09IFwib2JqZWN0XCIgJiZcblx0XHRvcGVyYW5kLl90eXBlID09PSBcIlNldFwiICYmXG5cdFx0b3BlcmFuZC5vcGVyYXRvciA9PT0gXCImJlwiICYmXG5cdFx0b3BlcmFuZC5vcGVyYW5kcy5ldmVyeSgoZXhwcmVzc2lvbikgPT4gaXNDb25zdGFudChleHByZXNzaW9uKSB8fCBpc0NvbXBhcmlzb24oZXhwcmVzc2lvbikpXG5cdCkge1xuXHRcdHJldHVybiBvciguLi5vcGVyYW5kLm9wZXJhbmRzLm1hcCgoZXhwcmVzc2lvbikgPT4gbm90KGV4cHJlc3Npb24pKSk7XG5cdH0gZWxzZSBpZiAoaXNDb21wYXJpc29uKG9wZXJhbmQpKSB7XG5cdFx0Ly8gQ3JlYXRlIHRoZSByZXZlcnNlIGNvbXBhcmlzb25cblx0XHRzd2l0Y2ggKG9wZXJhbmQub3BlcmF0b3IpIHtcblx0XHRcdGNhc2UgXCIhPT1cIjpcblx0XHRcdFx0cmV0dXJuIHsgLi4ub3BlcmFuZCwgb3BlcmF0b3I6IFwiPT09XCIgfTtcblx0XHRcdGNhc2UgXCI8XCI6XG5cdFx0XHRcdHJldHVybiB7IC4uLm9wZXJhbmQsIG9wZXJhdG9yOiBcIj49XCIgfTtcblx0XHRcdGNhc2UgXCI8PVwiOlxuXHRcdFx0XHRyZXR1cm4geyAuLi5vcGVyYW5kLCBvcGVyYXRvcjogXCI+XCIgfTtcblx0XHRcdGNhc2UgXCI9PT1cIjpcblx0XHRcdFx0cmV0dXJuIHsgLi4ub3BlcmFuZCwgb3BlcmF0b3I6IFwiIT09XCIgfTtcblx0XHRcdGNhc2UgXCI+XCI6XG5cdFx0XHRcdHJldHVybiB7IC4uLm9wZXJhbmQsIG9wZXJhdG9yOiBcIjw9XCIgfTtcblx0XHRcdGNhc2UgXCI+PVwiOlxuXHRcdFx0XHRyZXR1cm4geyAuLi5vcGVyYW5kLCBvcGVyYXRvcjogXCI8XCIgfTtcblx0XHR9XG5cdH0gZWxzZSBpZiAob3BlcmFuZC5fdHlwZSA9PT0gXCJOb3RcIikge1xuXHRcdHJldHVybiBvcGVyYW5kLm9wZXJhbmQ7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIk5vdFwiLFxuXHRcdG9wZXJhbmQ6IG9wZXJhbmRcblx0fTtcbn1cblxuLyoqXG4gKiBFdmFsdWF0ZXMgd2hldGhlciBhIGJpbmRpbmcgZXhwcmVzc2lvbiBpcyBlcXVhbCB0byB0cnVlIHdpdGggYSBsb29zZSBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0gb3BlcmFuZCBUaGUgZXhwcmVzc2lvbiB0byBjaGVja1xuICogQHJldHVybnMgVGhlIHJlc3VsdGluZyBleHByZXNzaW9uIHRoYXQgZXZhbHVhdGVzIHRvIGJvb2xlYW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVHJ1dGh5KG9wZXJhbmQ6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+KTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0aWYgKGlzQ29uc3RhbnQob3BlcmFuZCkpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoISFvcGVyYW5kLnZhbHVlKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0X3R5cGU6IFwiVHJ1dGh5XCIsXG5cdFx0XHRvcGVyYW5kOiBvcGVyYW5kXG5cdFx0fTtcblx0fVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBiaW5kaW5nIGV4cHJlc3Npb24gdGhhdCB3aWxsIGJlIGV2YWx1YXRlZCBieSB0aGUgY29ycmVzcG9uZGluZyBtb2RlbC5cbiAqXG4gKiBAcGFyYW0gcGF0aFxuICogQHBhcmFtIG1vZGVsTmFtZVxuICogQHBhcmFtIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHNcbiAqIEBwYXJhbSBwYXRoVmlzaXRvclxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiByZXByZXNlbnRhdGluZyB0aGF0IHBhdGggaW4gdGhlIG1vZGVsXG4gKiBAZGVwcmVjYXRlZCB1c2UgcGF0aEluTW9kZWwgaW5zdGVhZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZGluZ0V4cHJlc3Npb248VGFyZ2V0VHlwZSBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRwYXRoOiBhbnksXG5cdG1vZGVsTmFtZT86IHN0cmluZyxcblx0dmlzaXRlZE5hdmlnYXRpb25QYXRoczogc3RyaW5nW10gPSBbXSxcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogUGF0aEluTW9kZWxFeHByZXNzaW9uPFRhcmdldFR5cGU+IHwgVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb24ge1xuXHRyZXR1cm4gcGF0aEluTW9kZWwocGF0aCwgbW9kZWxOYW1lLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGJpbmRpbmcgZXhwcmVzc2lvbiB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIGJ5IHRoZSBjb3JyZXNwb25kaW5nIG1vZGVsLlxuICpcbiAqIEB0ZW1wbGF0ZSBUYXJnZXRUeXBlXG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBvbiB0aGUgbW9kZWxcbiAqIEBwYXJhbSBbbW9kZWxOYW1lXSBUaGUgbmFtZSBvZiB0aGUgbW9kZWxcbiAqIEBwYXJhbSBbdmlzaXRlZE5hdmlnYXRpb25QYXRoc10gVGhlIHBhdGhzIGZyb20gdGhlIHJvb3QgZW50aXR5U2V0XG4gKiBAcGFyYW0gW3BhdGhWaXNpdG9yXSBBIGZ1bmN0aW9uIHRvIG1vZGlmeSB0aGUgcmVzdWx0aW5nIHBhdGhcbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50YXRpbmcgdGhhdCBwYXRoIGluIHRoZSBtb2RlbFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGF0aEluTW9kZWwoXG5cdHBhdGg6IHVuZGVmaW5lZCxcblx0bW9kZWxOYW1lPzogc3RyaW5nLFxuXHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzPzogc3RyaW5nW10sXG5cdHBhdGhWaXNpdG9yPzogRnVuY3Rpb25cbik6IFVucmVzb2x2YWJsZVBhdGhFeHByZXNzaW9uO1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGhJbk1vZGVsPFRhcmdldFR5cGUgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0cGF0aDogc3RyaW5nLFxuXHRtb2RlbE5hbWU/OiBzdHJpbmcsXG5cdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHM/OiBzdHJpbmdbXSxcblx0cGF0aFZpc2l0b3I/OiB1bmRlZmluZWRcbik6IFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxUYXJnZXRUeXBlPjtcbmV4cG9ydCBmdW5jdGlvbiBwYXRoSW5Nb2RlbDxUYXJnZXRUeXBlIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0bW9kZWxOYW1lPzogc3RyaW5nLFxuXHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzPzogc3RyaW5nW10sXG5cdHBhdGhWaXNpdG9yPzogRnVuY3Rpb25cbik6IFVucmVzb2x2YWJsZVBhdGhFeHByZXNzaW9uIHwgUGF0aEluTW9kZWxFeHByZXNzaW9uPFRhcmdldFR5cGU+O1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGhJbk1vZGVsPFRhcmdldFR5cGUgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0cGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRtb2RlbE5hbWU/OiBzdHJpbmcsXG5cdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHM6IHN0cmluZ1tdID0gW10sXG5cdHBhdGhWaXNpdG9yPzogRnVuY3Rpb25cbik6IFVucmVzb2x2YWJsZVBhdGhFeHByZXNzaW9uIHwgUGF0aEluTW9kZWxFeHByZXNzaW9uPFRhcmdldFR5cGU+IHtcblx0aWYgKHBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9XG5cdGxldCB0YXJnZXRQYXRoO1xuXHRpZiAocGF0aFZpc2l0b3IpIHtcblx0XHR0YXJnZXRQYXRoID0gcGF0aFZpc2l0b3IocGF0aCk7XG5cdFx0aWYgKHRhcmdldFBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGxvY2FsUGF0aCA9IHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMuY29uY2F0KCk7XG5cdFx0bG9jYWxQYXRoLnB1c2gocGF0aCk7XG5cdFx0dGFyZ2V0UGF0aCA9IGxvY2FsUGF0aC5qb2luKFwiL1wiKTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIlBhdGhJbk1vZGVsXCIsXG5cdFx0bW9kZWxOYW1lOiBtb2RlbE5hbWUsXG5cdFx0cGF0aDogdGFyZ2V0UGF0aFxuXHR9O1xufVxuXG50eXBlIFBsYWluRXhwcmVzc2lvbk9iamVjdCA9IHsgW2luZGV4OiBzdHJpbmddOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PiB9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjb25zdGFudCBleHByZXNzaW9uIGJhc2VkIG9uIGEgcHJpbWl0aXZlIHZhbHVlLlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0gdmFsdWUgVGhlIGNvbnN0YW50IHRvIHdyYXAgaW4gYW4gZXhwcmVzc2lvblxuICogQHJldHVybnMgVGhlIGNvbnN0YW50IGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0YW50PFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPih2YWx1ZTogVCk6IENvbnN0YW50RXhwcmVzc2lvbjxUPiB7XG5cdGxldCBjb25zdGFudFZhbHVlOiBUO1xuXG5cdGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Y29uc3RhbnRWYWx1ZSA9IHZhbHVlLm1hcCh3cmFwUHJpbWl0aXZlKSBhcyBUO1xuXHRcdH0gZWxzZSBpZiAoaXNQcmltaXRpdmVPYmplY3QodmFsdWUpKSB7XG5cdFx0XHRjb25zdGFudFZhbHVlID0gdmFsdWUudmFsdWVPZigpIGFzIFQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0YW50VmFsdWUgPSBPYmplY3QuZW50cmllcyh2YWx1ZSkucmVkdWNlKChwbGFpbkV4cHJlc3Npb24sIFtrZXksIHZhbF0pID0+IHtcblx0XHRcdFx0Y29uc3Qgd3JhcHBlZFZhbHVlID0gd3JhcFByaW1pdGl2ZSh2YWwpO1xuXHRcdFx0XHRpZiAod3JhcHBlZFZhbHVlLl90eXBlICE9PSBcIkNvbnN0YW50XCIgfHwgd3JhcHBlZFZhbHVlLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRwbGFpbkV4cHJlc3Npb25ba2V5XSA9IHdyYXBwZWRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcGxhaW5FeHByZXNzaW9uO1xuXHRcdFx0fSwge30gYXMgUGxhaW5FeHByZXNzaW9uT2JqZWN0KSBhcyBUO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdGFudFZhbHVlID0gdmFsdWU7XG5cdH1cblxuXHRyZXR1cm4geyBfdHlwZTogXCJDb25zdGFudFwiLCB2YWx1ZTogY29uc3RhbnRWYWx1ZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUJpbmRpbmdTdHJpbmc8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHR2YWx1ZTogc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlcixcblx0dGFyZ2V0VHlwZT86IHN0cmluZ1xuKTogQ29uc3RhbnRFeHByZXNzaW9uPFQ+IHwgUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+IHwgRW1iZWRkZWRVSTVCaW5kaW5nRXhwcmVzc2lvbjxUPiB8IEVtYmVkZGVkVUk1RXhwcmVzc2lvbkJpbmRpbmdFeHByZXNzaW9uPFQ+IHtcblx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlLnN0YXJ0c1dpdGgoXCJ7XCIpKSB7XG5cdFx0Y29uc3QgcGF0aEluTW9kZWxSZWdleCA9IC9eeyguKik+KC4rKX0kLzsgLy8gTWF0Y2hlcyBtb2RlbCBwYXRocyBsaWtlIFwibW9kZWw+cGF0aFwiIG9yIFwiPnBhdGhcIiAoZGVmYXVsdCBtb2RlbClcblx0XHRjb25zdCBwYXRoSW5Nb2RlbFJlZ2V4TWF0Y2ggPSBwYXRoSW5Nb2RlbFJlZ2V4LmV4ZWModmFsdWUpO1xuXG5cdFx0aWYgKHZhbHVlLnN0YXJ0c1dpdGgoXCJ7PVwiKSkge1xuXHRcdFx0Ly8gRXhwcmVzc2lvbiBiaW5kaW5nLCB3ZSBjYW4ganVzdCByZW1vdmUgdGhlIG91dGVyIGJpbmRpbmcgdGhpbmdzXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRfdHlwZTogXCJFbWJlZGRlZEV4cHJlc3Npb25CaW5kaW5nXCIsXG5cdFx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKHBhdGhJbk1vZGVsUmVnZXhNYXRjaCkge1xuXHRcdFx0cmV0dXJuIHBhdGhJbk1vZGVsKHBhdGhJbk1vZGVsUmVnZXhNYXRjaFsyXSB8fCBcIlwiLCBwYXRoSW5Nb2RlbFJlZ2V4TWF0Y2hbMV0gfHwgdW5kZWZpbmVkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0X3R5cGU6IFwiRW1iZWRkZWRCaW5kaW5nXCIsXG5cdFx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSBpZiAodGFyZ2V0VHlwZSA9PT0gXCJib29sZWFuXCIgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmICh2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIikpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQodmFsdWUgPT09IFwidHJ1ZVwiKSBhcyBDb25zdGFudEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAodGFyZ2V0VHlwZSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgJiYgKCFpc05hTihOdW1iZXIodmFsdWUpKSB8fCB2YWx1ZSA9PT0gXCJOYU5cIikpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoTnVtYmVyKHZhbHVlKSkgYXMgQ29uc3RhbnRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBjb25zdGFudCh2YWx1ZSkgYXMgQ29uc3RhbnRFeHByZXNzaW9uPFQ+O1xuXHR9XG59XG5cbi8qKlxuICogQSBuYW1lZCByZWZlcmVuY2UuXG4gKlxuICogQHNlZSBmblxuICogQHBhcmFtIHJlZmVyZW5jZSBSZWZlcmVuY2VcbiAqIEByZXR1cm5zIFRoZSBvYmplY3QgcmVmZXJlbmNlIGJpbmRpbmcgcGFydFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVmKHJlZmVyZW5jZTogc3RyaW5nIHwgbnVsbCk6IFJlZmVyZW5jZUV4cHJlc3Npb24ge1xuXHRyZXR1cm4geyBfdHlwZTogXCJSZWZcIiwgcmVmOiByZWZlcmVuY2UgfTtcbn1cblxuLyoqXG4gKiBXcmFwIGEgcHJpbWl0aXZlIGludG8gYSBjb25zdGFudCBleHByZXNzaW9uIGlmIGl0IGlzIG5vdCBhbHJlYWR5IGFuIGV4cHJlc3Npb24uXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSBzb21ldGhpbmcgVGhlIG9iamVjdCB0byB3cmFwIGluIGEgQ29uc3RhbnQgZXhwcmVzc2lvblxuICogQHJldHVybnMgRWl0aGVyIHRoZSBvcmlnaW5hbCBvYmplY3Qgb3IgdGhlIHdyYXBwZWQgb25lIGRlcGVuZGluZyBvbiB0aGUgY2FzZVxuICovXG5mdW5jdGlvbiB3cmFwUHJpbWl0aXZlPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihzb21ldGhpbmc6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiB7XG5cdGlmIChpc0JpbmRpbmdUb29sa2l0RXhwcmVzc2lvbihzb21ldGhpbmcpKSB7XG5cdFx0cmV0dXJuIHNvbWV0aGluZztcblx0fVxuXG5cdHJldHVybiBjb25zdGFudChzb21ldGhpbmcpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZXhwcmVzc2lvbiBvciB2YWx1ZSBwcm92aWRlZCBpcyBhIGJpbmRpbmcgdG9vbGluZyBleHByZXNzaW9uIG9yIG5vdC5cbiAqXG4gKiBFdmVyeSBvYmplY3QgaGF2aW5nIGEgcHJvcGVydHkgbmFtZWQgYF90eXBlYCBvZiBzb21lIHZhbHVlIGlzIGNvbnNpZGVyZWQgYW4gZXhwcmVzc2lvbiwgZXZlbiBpZiB0aGVyZSBpcyBhY3R1YWxseVxuICogbm8gc3VjaCBleHByZXNzaW9uIHR5cGUgc3VwcG9ydGVkLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV4cHJlc3Npb24gaXMgYSBiaW5kaW5nIHRvb2xraXQgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24oXG5cdGV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjx1bmtub3duPiB8IHVua25vd25cbik6IGV4cHJlc3Npb24gaXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHVua25vd24+IHtcblx0cmV0dXJuIChleHByZXNzaW9uIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjx1bmtub3duPik/Ll90eXBlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBleHByZXNzaW9uIG9yIHZhbHVlIHByb3ZpZGVkIGlzIGNvbnN0YW50IG9yIG5vdC5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSAgbWF5YmVDb25zdGFudCBUaGUgZXhwcmVzc2lvbiBvciBwcmltaXRpdmUgdmFsdWUgdGhhdCBpcyB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgY29uc3RhbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ29uc3RhbnQ8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KG1heWJlQ29uc3RhbnQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPik6IG1heWJlQ29uc3RhbnQgaXMgQ29uc3RhbnRFeHByZXNzaW9uPFQ+IHtcblx0cmV0dXJuIHR5cGVvZiBtYXliZUNvbnN0YW50ICE9PSBcIm9iamVjdFwiIHx8IChtYXliZUNvbnN0YW50IGFzIEJhc2VFeHByZXNzaW9uPFQ+KS5fdHlwZSA9PT0gXCJDb25zdGFudFwiO1xufVxuXG5mdW5jdGlvbiBpc1RydWUoZXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFByaW1pdGl2ZVR5cGU+KSB7XG5cdHJldHVybiBpc0NvbnN0YW50KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb24udmFsdWUgPT09IHRydWU7XG59XG5cbmZ1bmN0aW9uIGlzRmFsc2UoZXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFByaW1pdGl2ZVR5cGU+KSB7XG5cdHJldHVybiBpc0NvbnN0YW50KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb24udmFsdWUgPT09IGZhbHNlO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZXhwcmVzc2lvbiBvciB2YWx1ZSBwcm92aWRlZCBpcyBhIHBhdGggaW4gbW9kZWwgZXhwcmVzc2lvbiBvciBub3QuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gIG1heWJlQmluZGluZyBUaGUgZXhwcmVzc2lvbiBvciBwcmltaXRpdmUgdmFsdWUgdGhhdCBpcyB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgYSBwYXRoIGluIG1vZGVsIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUGF0aEluTW9kZWxFeHByZXNzaW9uPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0bWF5YmVCaW5kaW5nOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD5cbik6IG1heWJlQmluZGluZyBpcyBQYXRoSW5Nb2RlbEV4cHJlc3Npb248VD4ge1xuXHRyZXR1cm4gKG1heWJlQmluZGluZyBhcyBCYXNlRXhwcmVzc2lvbjxUPik/Ll90eXBlID09PSBcIlBhdGhJbk1vZGVsXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBleHByZXNzaW9uIG9yIHZhbHVlIHByb3ZpZGVkIGlzIGEgY29tcGxleCB0eXBlIGV4cHJlc3Npb24uXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gIG1heWJlQmluZGluZyBUaGUgZXhwcmVzc2lvbiBvciBwcmltaXRpdmUgdmFsdWUgdGhhdCBpcyB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgYSBwYXRoIGluIG1vZGVsIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcGxleFR5cGVFeHByZXNzaW9uPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0bWF5YmVCaW5kaW5nOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD5cbik6IG1heWJlQmluZGluZyBpcyBDb21wbGV4VHlwZUV4cHJlc3Npb248VD4ge1xuXHRyZXR1cm4gKG1heWJlQmluZGluZyBhcyBCYXNlRXhwcmVzc2lvbjxUPik/Ll90eXBlID09PSBcIkNvbXBsZXhUeXBlXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBleHByZXNzaW9uIG9yIHZhbHVlIHByb3ZpZGVkIGlzIGEgY29uY2F0IGV4cHJlc3Npb24gb3Igbm90LlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV4cHJlc3Npb24gaXMgYSBDb25jYXRFeHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIGlzQ29uY2F0RXhwcmVzc2lvbihleHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248UHJpbWl0aXZlVHlwZT4pOiBleHByZXNzaW9uIGlzIENvbmNhdEV4cHJlc3Npb24ge1xuXHRyZXR1cm4gKGV4cHJlc3Npb24gYXMgQmFzZUV4cHJlc3Npb248UHJpbWl0aXZlVHlwZT4pPy5fdHlwZSA9PT0gXCJDb25jYXRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGV4cHJlc3Npb24gcHJvdmlkZWQgaXMgYSBjb21wYXJpc29uIG9yIG5vdC5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBleHByZXNzaW9uXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV4cHJlc3Npb24gaXMgYSBDb21wYXJpc29uRXhwcmVzc2lvblxuICovXG5mdW5jdGlvbiBpc0NvbXBhcmlzb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KGV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPik6IGV4cHJlc3Npb24gaXMgQ29tcGFyaXNvbkV4cHJlc3Npb24ge1xuXHRyZXR1cm4gZXhwcmVzc2lvbi5fdHlwZSA9PT0gXCJDb21wYXJpc29uXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGlucHV0IHBhcmFtZXRlciBpcyBhIGNvbnN0YW50IGV4cHJlc3Npb24gb2YgdHlwZSB1bmRlZmluZWQuXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb24gVGhlIGlucHV0IGV4cHJlc3Npb24gb3Igb2JqZWN0IGluIGdlbmVyYWxcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaW5wdXQgaXMgY29uc3RhbnQgd2hpY2ggaGFzIHVuZGVmaW5lZCBmb3IgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWZpbmVkRXhwcmVzc2lvbihleHByZXNzaW9uOiB1bmtub3duKTogZXhwcmVzc2lvbiBpcyBDb25zdGFudEV4cHJlc3Npb248dW5kZWZpbmVkPiB7XG5cdGNvbnN0IGV4cHJlc3Npb25Bc0V4cHJlc3Npb24gPSBleHByZXNzaW9uIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjx1bmtub3duPjtcblx0cmV0dXJuIGV4cHJlc3Npb25Bc0V4cHJlc3Npb24/Ll90eXBlID09PSBcIkNvbnN0YW50XCIgJiYgZXhwcmVzc2lvbkFzRXhwcmVzc2lvbj8udmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxudHlwZSBDb21wbGV4QW5ub3RhdGlvbkV4cHJlc3Npb248UD4gPVxuXHR8IFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IEFwcGx5QW5ub3RhdGlvbkV4cHJlc3Npb248UD5cblx0fCBJZkFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgT3JBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IEFuZEFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgTmVBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IEVxQW5ub3RhdGlvbkV4cHJlc3Npb248UD5cblx0fCBOb3RBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IEd0QW5ub3RhdGlvbkV4cHJlc3Npb248UD5cblx0fCBHZUFubm90YXRpb25FeHByZXNzaW9uPFA+XG5cdHwgTGVBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPlxuXHR8IEx0QW5ub3RhdGlvbkV4cHJlc3Npb248UD47XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlT2JqZWN0KG9iamVjdFR5cGU6IG9iamVjdCk6IGJvb2xlYW4ge1xuXHRzd2l0Y2ggKG9iamVjdFR5cGUuY29uc3RydWN0b3IubmFtZSkge1xuXHRcdGNhc2UgXCJTdHJpbmdcIjpcblx0XHRjYXNlIFwiTnVtYmVyXCI6XG5cdFx0Y2FzZSBcIkJvb2xlYW5cIjpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBhc3NlZCBhbm5vdGF0aW9uIGFubm90YXRpb25WYWx1ZSBpcyBhIENvbXBsZXhBbm5vdGF0aW9uRXhwcmVzc2lvbi5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSAgYW5ub3RhdGlvblZhbHVlIFRoZSBhbm5vdGF0aW9uIGFubm90YXRpb25WYWx1ZSB0byBldmFsdWF0ZVxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3QgaXMgYSB7Q29tcGxleEFubm90YXRpb25FeHByZXNzaW9ufVxuICovXG5mdW5jdGlvbiBpc0NvbXBsZXhBbm5vdGF0aW9uRXhwcmVzc2lvbjxUPihhbm5vdGF0aW9uVmFsdWU6IFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPFQ+KTogYW5ub3RhdGlvblZhbHVlIGlzIENvbXBsZXhBbm5vdGF0aW9uRXhwcmVzc2lvbjxUPiB7XG5cdHJldHVybiB0eXBlb2YgYW5ub3RhdGlvblZhbHVlID09PSBcIm9iamVjdFwiICYmICFpc1ByaW1pdGl2ZU9iamVjdChhbm5vdGF0aW9uVmFsdWUgYXMgb2JqZWN0KTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgY29ycmVzcG9uZGluZyBhbm5vdGF0aW9uVmFsdWUgZm9yIGEgZ2l2ZW4gYW5ub3RhdGlvbiBhbm5vdGF0aW9uVmFsdWUuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gYW5ub3RhdGlvblZhbHVlIFRoZSBzb3VyY2UgYW5ub3RhdGlvbiBhbm5vdGF0aW9uVmFsdWVcbiAqIEBwYXJhbSB2aXNpdGVkTmF2aWdhdGlvblBhdGhzIFRoZSBwYXRoIGZyb20gdGhlIHJvb3QgZW50aXR5IHNldFxuICogQHBhcmFtIGRlZmF1bHRWYWx1ZSBEZWZhdWx0IHZhbHVlIGlmIHRoZSBhbm5vdGF0aW9uVmFsdWUgaXMgdW5kZWZpbmVkXG4gKiBAcGFyYW0gcGF0aFZpc2l0b3IgQSBmdW5jdGlvbiB0byBtb2RpZnkgdGhlIHJlc3VsdGluZyBwYXRoXG4gKiBAcmV0dXJucyBUaGUgYW5ub3RhdGlvblZhbHVlIGVxdWl2YWxlbnQgdG8gdGhhdCBhbm5vdGF0aW9uIGFubm90YXRpb25WYWx1ZVxuICogQGRlcHJlY2F0ZWQgdXNlIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbm5vdGF0aW9uRXhwcmVzc2lvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGFubm90YXRpb25WYWx1ZTogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8VD4sXG5cdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHM6IHN0cmluZ1tdID0gW10sXG5cdGRlZmF1bHRWYWx1ZT86IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPixcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFByaW1pdGl2ZVR5cGVDYXN0PFQ+PiB7XG5cdHJldHVybiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oYW5ub3RhdGlvblZhbHVlLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBkZWZhdWx0VmFsdWUsIHBhdGhWaXNpdG9yKTtcbn1cbi8qKlxuICogR2VuZXJhdGUgdGhlIGNvcnJlc3BvbmRpbmcgYW5ub3RhdGlvblZhbHVlIGZvciBhIGdpdmVuIGFubm90YXRpb24gYW5ub3RhdGlvblZhbHVlLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGFubm90YXRpb25WYWx1ZSBUaGUgc291cmNlIGFubm90YXRpb24gYW5ub3RhdGlvblZhbHVlXG4gKiBAcGFyYW0gdmlzaXRlZE5hdmlnYXRpb25QYXRocyBUaGUgcGF0aCBmcm9tIHRoZSByb290IGVudGl0eSBzZXRcbiAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgRGVmYXVsdCB2YWx1ZSBpZiB0aGUgYW5ub3RhdGlvblZhbHVlIGlzIHVuZGVmaW5lZFxuICogQHBhcmFtIHBhdGhWaXNpdG9yIEEgZnVuY3Rpb24gdG8gbW9kaWZ5IHRoZSByZXN1bHRpbmcgcGF0aFxuICogQHJldHVybnMgVGhlIGFubm90YXRpb25WYWx1ZSBlcXVpdmFsZW50IHRvIHRoYXQgYW5ub3RhdGlvbiBhbm5vdGF0aW9uVmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGFubm90YXRpb25WYWx1ZTogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8VD4sXG5cdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHM6IHN0cmluZ1tdID0gW10sXG5cdGRlZmF1bHRWYWx1ZT86IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPixcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFByaW1pdGl2ZVR5cGVDYXN0PFQ+PiB7XG5cdGlmIChhbm5vdGF0aW9uVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiB3cmFwUHJpbWl0aXZlKGRlZmF1bHRWYWx1ZSBhcyBUKTtcblx0fVxuXHRhbm5vdGF0aW9uVmFsdWUgPSBhbm5vdGF0aW9uVmFsdWU/LnZhbHVlT2YoKSBhcyBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxUPjtcblx0aWYgKCFpc0NvbXBsZXhBbm5vdGF0aW9uRXhwcmVzc2lvbihhbm5vdGF0aW9uVmFsdWUpKSB7XG5cdFx0cmV0dXJuIGNvbnN0YW50KGFubm90YXRpb25WYWx1ZSk7XG5cdH1cblxuXHRzd2l0Y2ggKGFubm90YXRpb25WYWx1ZS50eXBlKSB7XG5cdFx0Y2FzZSBcIlBhdGhcIjpcblx0XHRcdHJldHVybiBwYXRoSW5Nb2RlbChhbm5vdGF0aW9uVmFsdWUucGF0aCwgdW5kZWZpbmVkLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcik7XG5cdFx0Y2FzZSBcIklmXCI6XG5cdFx0XHRyZXR1cm4gYW5ub3RhdGlvbklmRXhwcmVzc2lvbihhbm5vdGF0aW9uVmFsdWUuSWYsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcblx0XHRjYXNlIFwiTm90XCI6XG5cdFx0XHRyZXR1cm4gbm90KHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuTm90LCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcikpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRjYXNlIFwiRXFcIjpcblx0XHRcdHJldHVybiBlcXVhbChcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5FcVswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLkVxWzFdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcilcblx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdGNhc2UgXCJOZVwiOlxuXHRcdFx0cmV0dXJuIG5vdEVxdWFsKFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLk5lWzBdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvciksXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuTmVbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0Y2FzZSBcIkd0XCI6XG5cdFx0XHRyZXR1cm4gZ3JlYXRlclRoYW4oXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuR3RbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5HdFsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRjYXNlIFwiR2VcIjpcblx0XHRcdHJldHVybiBncmVhdGVyT3JFcXVhbChcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5HZVswXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpLFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLkdlWzFdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcilcblx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdGNhc2UgXCJMdFwiOlxuXHRcdFx0cmV0dXJuIGxlc3NUaGFuKFxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlLkx0WzBdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvciksXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuTHRbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0Y2FzZSBcIkxlXCI6XG5cdFx0XHRyZXR1cm4gbGVzc09yRXF1YWwoXG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbm5vdGF0aW9uVmFsdWUuTGVbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZS5MZVsxXSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdFx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRjYXNlIFwiT3JcIjpcblx0XHRcdHJldHVybiBvcihcblx0XHRcdFx0Li4uYW5ub3RhdGlvblZhbHVlLk9yLm1hcChmdW5jdGlvbiAob3JDb25kaXRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uPGJvb2xlYW4+KG9yQ29uZGl0aW9uLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvcik7XG5cdFx0XHRcdH0pXG5cdFx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRjYXNlIFwiQW5kXCI6XG5cdFx0XHRyZXR1cm4gYW5kKFxuXHRcdFx0XHQuLi5hbm5vdGF0aW9uVmFsdWUuQW5kLm1hcChmdW5jdGlvbiAoYW5kQ29uZGl0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbjxib29sZWFuPihhbmRDb25kaXRpb24sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcblx0XHRcdFx0fSlcblx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdGNhc2UgXCJBcHBseVwiOlxuXHRcdFx0cmV0dXJuIGFubm90YXRpb25BcHBseUV4cHJlc3Npb24oXG5cdFx0XHRcdGFubm90YXRpb25WYWx1ZSBhcyBBcHBseUFubm90YXRpb25FeHByZXNzaW9uPHN0cmluZz4sXG5cdFx0XHRcdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsXG5cdFx0XHRcdHBhdGhWaXNpdG9yXG5cdFx0XHQpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fVxuXHRyZXR1cm4gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgYW5ub3RhdGlvbiBjb25kaXRpb24gaW50byBhbiBleHByZXNzaW9uLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGFubm90YXRpb25WYWx1ZSBUaGUgY29uZGl0aW9uIG9yIHZhbHVlIGZyb20gdGhlIGFubm90YXRpb25cbiAqIEBwYXJhbSB2aXNpdGVkTmF2aWdhdGlvblBhdGhzIFRoZSBwYXRoIGZyb20gdGhlIHJvb3QgZW50aXR5IHNldFxuICogQHBhcmFtIHBhdGhWaXNpdG9yIEEgZnVuY3Rpb24gdG8gbW9kaWZ5IHRoZSByZXN1bHRpbmcgcGF0aFxuICogQHJldHVybnMgQW4gZXF1aXZhbGVudCBleHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGFubm90YXRpb25WYWx1ZTogQ29uZGl0aW9uYWxDaGVja09yVmFsdWUsXG5cdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHM6IHN0cmluZ1tdID0gW10sXG5cdHBhdGhWaXNpdG9yPzogRnVuY3Rpb25cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiB7XG5cdGlmIChhbm5vdGF0aW9uVmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIGFubm90YXRpb25WYWx1ZSAhPT0gXCJvYmplY3RcIikge1xuXHRcdHJldHVybiBjb25zdGFudChhbm5vdGF0aW9uVmFsdWUgYXMgVCk7XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJE9yXCIpKSB7XG5cdFx0cmV0dXJuIG9yKFxuXHRcdFx0Li4uKChhbm5vdGF0aW9uVmFsdWUgYXMgT3JDb25kaXRpb25hbEV4cHJlc3Npb24pLiRPci5tYXAoZnVuY3Rpb24gKG9yQ29uZGl0aW9uKSB7XG5cdFx0XHRcdHJldHVybiBwYXJzZUFubm90YXRpb25Db25kaXRpb24ob3JDb25kaXRpb24sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcblx0XHRcdH0pIGFzIHVua25vd24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10pXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEFuZFwiKSkge1xuXHRcdHJldHVybiBhbmQoXG5cdFx0XHQuLi4oKGFubm90YXRpb25WYWx1ZSBhcyBBbmRDb25kaXRpb25hbEV4cHJlc3Npb24pLiRBbmQubWFwKGZ1bmN0aW9uIChhbmRDb25kaXRpb24pIHtcblx0XHRcdFx0cmV0dXJuIHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbihhbmRDb25kaXRpb24sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcblx0XHRcdH0pIGFzIHVua25vd24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10pXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJE5vdFwiKSkge1xuXHRcdHJldHVybiBub3QoXG5cdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oKGFubm90YXRpb25WYWx1ZSBhcyBOb3RDb25kaXRpb25hbEV4cHJlc3Npb24pLiROb3QsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRFcVwiKSkge1xuXHRcdHJldHVybiBlcXVhbChcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEVxQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kRXFbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEVxQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kRXFbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiROZVwiKSkge1xuXHRcdHJldHVybiBub3RFcXVhbChcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIE5lQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTmVbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIE5lQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTmVbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRHdFwiKSkge1xuXHRcdHJldHVybiBncmVhdGVyVGhhbihcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEd0Q29uZGl0aW9uYWxFeHByZXNzaW9uKS4kR3RbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEd0Q29uZGl0aW9uYWxFeHByZXNzaW9uKS4kR3RbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRHZVwiKSkge1xuXHRcdHJldHVybiBncmVhdGVyT3JFcXVhbChcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEdlQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kR2VbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEdlQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kR2VbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRMdFwiKSkge1xuXHRcdHJldHVybiBsZXNzVGhhbihcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEx0Q29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTHRbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEx0Q29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTHRbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRMZVwiKSkge1xuXHRcdHJldHVybiBsZXNzT3JFcXVhbChcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIExlQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTGVbMF0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIExlQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTGVbMV0sIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKVxuXHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0cmV0dXJuIHBhdGhJbk1vZGVsKChhbm5vdGF0aW9uVmFsdWUgYXMgUGF0aENvbmRpdGlvbkV4cHJlc3Npb248VD4pLiRQYXRoLCB1bmRlZmluZWQsIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkQXBwbHlcIikpIHtcblx0XHRyZXR1cm4gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0e1xuXHRcdFx0XHR0eXBlOiBcIkFwcGx5XCIsXG5cdFx0XHRcdEZ1bmN0aW9uOiAoYW5ub3RhdGlvblZhbHVlIGFzIGFueSkuJEZ1bmN0aW9uLFxuXHRcdFx0XHRBcHBseTogKGFubm90YXRpb25WYWx1ZSBhcyBhbnkpLiRBcHBseVxuXHRcdFx0fSBhcyBULFxuXHRcdFx0dmlzaXRlZE5hdmlnYXRpb25QYXRocyxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHBhdGhWaXNpdG9yXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJElmXCIpKSB7XG5cdFx0cmV0dXJuIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdHtcblx0XHRcdFx0dHlwZTogXCJJZlwiLFxuXHRcdFx0XHRJZjogKGFubm90YXRpb25WYWx1ZSBhcyBhbnkpLiRJZlxuXHRcdFx0fSBhcyBULFxuXHRcdFx0dmlzaXRlZE5hdmlnYXRpb25QYXRocyxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHBhdGhWaXNpdG9yXG5cdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEVudW1NZW1iZXJcIikpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQocmVzb2x2ZUVudW1WYWx1ZSgoYW5ub3RhdGlvblZhbHVlIGFzIGFueSkuJEVudW1NZW1iZXIpIGFzIFQpO1xuXHR9XG5cdHJldHVybiBjb25zdGFudChmYWxzZSBhcyBUKTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSB7SWZBbm5vdGF0aW9uRXhwcmVzc2lvblZhbHVlfSBpbnRvIGFuIGV4cHJlc3Npb24uXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gYW5ub3RhdGlvblZhbHVlIEFuIElmIGV4cHJlc3Npb24gcmV0dXJuaW5nIHRoZSB0eXBlIFRcbiAqIEBwYXJhbSB2aXNpdGVkTmF2aWdhdGlvblBhdGhzIFRoZSBwYXRoIGZyb20gdGhlIHJvb3QgZW50aXR5IHNldFxuICogQHBhcmFtIHBhdGhWaXNpdG9yIEEgZnVuY3Rpb24gdG8gbW9kaWZ5IHRoZSByZXN1bHRpbmcgcGF0aFxuICogQHJldHVybnMgVGhlIGVxdWl2YWxlbnQgaWZFbHNlIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFubm90YXRpb25JZkV4cHJlc3Npb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRhbm5vdGF0aW9uVmFsdWU6IElmQW5ub3RhdGlvbkV4cHJlc3Npb25WYWx1ZTxUPixcblx0dmlzaXRlZE5hdmlnYXRpb25QYXRoczogc3RyaW5nW10gPSBbXSxcblx0cGF0aFZpc2l0b3I/OiBGdW5jdGlvblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+IHtcblx0cmV0dXJuIGlmRWxzZShcblx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlWzBdLCB2aXNpdGVkTmF2aWdhdGlvblBhdGhzLCBwYXRoVmlzaXRvciksXG5cdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25WYWx1ZVsxXSBhcyBhbnksIHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsIHBhdGhWaXNpdG9yKSxcblx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oYW5ub3RhdGlvblZhbHVlWzJdIGFzIGFueSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocywgcGF0aFZpc2l0b3IpXG5cdCk7XG59XG4vLyBUaGlzIHR5cGUgaXMgbm90IHJlY3Vyc2l2ZWx5IHRyYW5zZm9ybWVkIGZyb20gdGhlIG1ldGFtb2RlbCBjb250ZW50LCBhcyBzdWNoIHdlIGhhdmUgc29tZSB1Z2x5IHRoaW5ncyB0aGVyZVxudHlwZSBTdWJBcHBseUV4cHJlc3Npb25Gcm9tTWV0YW1vZGVsID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5mdW5jdGlvbiBjb252ZXJ0U3ViQXBwbHlQYXJhbWV0ZXJzKGFwcGx5UGFyYW06IFN1YkFwcGx5RXhwcmVzc2lvbkZyb21NZXRhbW9kZWwpOiBTdWJBcHBseUV4cHJlc3Npb25Gcm9tTWV0YW1vZGVsIHtcblx0bGV0IGFwcGx5UGFyYW1Db252ZXJ0ZWQgPSBhcHBseVBhcmFtO1xuXHRpZiAoYXBwbHlQYXJhbS5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0YXBwbHlQYXJhbUNvbnZlcnRlZCA9IHtcblx0XHRcdHR5cGU6IFwiUGF0aFwiLFxuXHRcdFx0cGF0aDogYXBwbHlQYXJhbS4kUGF0aFxuXHRcdH07XG5cdH0gZWxzZSBpZiAoYXBwbHlQYXJhbS5oYXNPd25Qcm9wZXJ0eShcIiRJZlwiKSkge1xuXHRcdGFwcGx5UGFyYW1Db252ZXJ0ZWQgPSB7XG5cdFx0XHR0eXBlOiBcIklmXCIsXG5cdFx0XHRJZjogYXBwbHlQYXJhbS4kSWZcblx0XHR9O1xuXHR9IGVsc2UgaWYgKGFwcGx5UGFyYW0uaGFzT3duUHJvcGVydHkoXCIkQXBwbHlcIikpIHtcblx0XHRhcHBseVBhcmFtQ29udmVydGVkID0ge1xuXHRcdFx0dHlwZTogXCJBcHBseVwiLFxuXHRcdFx0RnVuY3Rpb246IGFwcGx5UGFyYW0uJEZ1bmN0aW9uLFxuXHRcdFx0QXBwbHk6IGFwcGx5UGFyYW0uJEFwcGx5XG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gYXBwbHlQYXJhbUNvbnZlcnRlZDtcbn1cblxudHlwZSBPRGF0YUZ1bmN0aW9uID0gXCJvZGF0YS5jb25jYXRcIiB8IFwib2RhdGEuZmlsbFVyaVRlbXBsYXRlXCIgfCBcIm9kYXRhLnVyaUVuY29kZVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGFubm90YXRpb25BcHBseUV4cHJlc3Npb24oXG5cdGFwcGx5RXhwcmVzc2lvbjogQXBwbHlBbm5vdGF0aW9uRXhwcmVzc2lvbjxzdHJpbmc+LFxuXHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzOiBzdHJpbmdbXSA9IFtdLFxuXHRwYXRoVmlzaXRvcj86IEZ1bmN0aW9uXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB7XG5cdHN3aXRjaCAoYXBwbHlFeHByZXNzaW9uLkZ1bmN0aW9uIGFzIE9EYXRhRnVuY3Rpb24pIHtcblx0XHRjYXNlIFwib2RhdGEuY29uY2F0XCI6XG5cdFx0XHRyZXR1cm4gY29uY2F0KFxuXHRcdFx0XHQuLi5hcHBseUV4cHJlc3Npb24uQXBwbHkubWFwKChhcHBseVBhcmFtKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdGNvbnZlcnRTdWJBcHBseVBhcmFtZXRlcnMoYXBwbHlQYXJhbSBhcyB1bmtub3duIGFzIFN1YkFwcGx5RXhwcmVzc2lvbkZyb21NZXRhbW9kZWwpLFxuXHRcdFx0XHRcdFx0dmlzaXRlZE5hdmlnYXRpb25QYXRocyxcblx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdHBhdGhWaXNpdG9yXG5cdFx0XHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPjtcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0Y2FzZSBcIm9kYXRhLnVyaUVuY29kZVwiOlxuXHRcdFx0Y29uc3QgcGFyYW1ldGVyID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRjb252ZXJ0U3ViQXBwbHlQYXJhbWV0ZXJzKGFwcGx5RXhwcmVzc2lvbi5BcHBseVswXSBhcyB1bmtub3duIGFzIFN1YkFwcGx5RXhwcmVzc2lvbkZyb21NZXRhbW9kZWwpLFxuXHRcdFx0XHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzLFxuXHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdHBhdGhWaXNpdG9yXG5cdFx0XHQpO1xuXHRcdFx0Ly8gVGhlIHNlY29uZCBwYXJhbWV0ZXIgZm9yIHVyaUVuY29kZSBpcyBhbHdheXMgYSBzdHJpbmcgc2luY2UgdGhlIHRhcmdldCBldmFsdWF0aW9uIGlzIGFnYWluc3QgYSBmb3JtYXRWYWx1ZSBjYWxsIGluIE9EYXRhVXRpbHMgd2hpY2ggZXhwZWN0IHRoZSB0YXJnZXQgdHlwZSBhcyBzZWNvbmQgcGFyYW1ldGVyXG5cdFx0XHRyZXR1cm4gZm4oXCJvZGF0YS51cmlFbmNvZGVcIiwgW3BhcmFtZXRlciwgXCJFZG0uU3RyaW5nXCJdLCB1bmRlZmluZWQsIHRydWUpO1xuXHRcdGNhc2UgXCJvZGF0YS5maWxsVXJpVGVtcGxhdGVcIjpcblx0XHRcdGNvbnN0IHRlbXBsYXRlID0gYXBwbHlFeHByZXNzaW9uLkFwcGx5WzBdO1xuXHRcdFx0Y29uc3QgdGVtcGxhdGVQYXJhbXMgPSBhcHBseUV4cHJlc3Npb24uQXBwbHkuc2xpY2UoMSkgYXMgdW5rbm93biBhcyBTdWJBcHBseUV4cHJlc3Npb25Gcm9tTWV0YW1vZGVsW107XG5cdFx0XHRjb25zdCB0YXJnZXRPYmplY3Q6IFJlY29yZDxzdHJpbmcsIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjx1bmtub3duPj4gPSB7fTtcblx0XHRcdHRlbXBsYXRlUGFyYW1zLmZvckVhY2goKGFwcGx5UGFyYW0pID0+IHtcblx0XHRcdFx0dGFyZ2V0T2JqZWN0W2FwcGx5UGFyYW0uJE5hbWUgYXMgc3RyaW5nXSA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRjb252ZXJ0U3ViQXBwbHlQYXJhbWV0ZXJzKGFwcGx5UGFyYW0uJExhYmVsZWRFbGVtZW50IGFzIFN1YkFwcGx5RXhwcmVzc2lvbkZyb21NZXRhbW9kZWwpLFxuXHRcdFx0XHRcdHZpc2l0ZWROYXZpZ2F0aW9uUGF0aHMsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHBhdGhWaXNpdG9yXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBmbihcIm9kYXRhLmZpbGxVcmlUZW1wbGF0ZVwiLCBbdGVtcGxhdGUsIHRhcmdldE9iamVjdF0sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdH1cblx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG59XG5cbi8qKlxuICogR2VuZXJpYyBoZWxwZXIgZm9yIHRoZSBjb21wYXJpc29uIG9wZXJhdGlvbnMgKGVxdWFsLCBub3RFcXVhbCwgLi4uKS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBvcGVyYXRvciBUaGUgb3BlcmF0b3IgdG8gYXBwbHlcbiAqIEBwYXJhbSBsZWZ0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBvcGVyYXRvclxuICogQHBhcmFtIHJpZ2h0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgb3BlcmF0b3JcbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb21wYXJpc29uXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmlzb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRvcGVyYXRvcjogQ29tcGFyaXNvbk9wZXJhdG9yLFxuXHRsZWZ0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRyaWdodE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3QgbGVmdEV4cHJlc3Npb24gPSB3cmFwUHJpbWl0aXZlKGxlZnRPcGVyYW5kKTtcblx0Y29uc3QgcmlnaHRFeHByZXNzaW9uID0gd3JhcFByaW1pdGl2ZShyaWdodE9wZXJhbmQpO1xuXHRpZiAoaGFzVW5yZXNvbHZhYmxlRXhwcmVzc2lvbihsZWZ0RXhwcmVzc2lvbiwgcmlnaHRFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9XG5cdGlmIChpc0NvbnN0YW50KGxlZnRFeHByZXNzaW9uKSAmJiBpc0NvbnN0YW50KHJpZ2h0RXhwcmVzc2lvbikpIHtcblx0XHRzd2l0Y2ggKG9wZXJhdG9yKSB7XG5cdFx0XHRjYXNlIFwiIT09XCI6XG5cdFx0XHRcdHJldHVybiBjb25zdGFudChsZWZ0RXhwcmVzc2lvbi52YWx1ZSAhPT0gcmlnaHRFeHByZXNzaW9uLnZhbHVlKTtcblx0XHRcdGNhc2UgXCI9PT1cIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRFeHByZXNzaW9uLnZhbHVlID09PSByaWdodEV4cHJlc3Npb24udmFsdWUpO1xuXHRcdFx0Y2FzZSBcIjxcIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRFeHByZXNzaW9uLnZhbHVlIDwgcmlnaHRFeHByZXNzaW9uLnZhbHVlKTtcblx0XHRcdGNhc2UgXCI8PVwiOlxuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQobGVmdEV4cHJlc3Npb24udmFsdWUgPD0gcmlnaHRFeHByZXNzaW9uLnZhbHVlKTtcblx0XHRcdGNhc2UgXCI+XCI6XG5cdFx0XHRcdHJldHVybiBjb25zdGFudChsZWZ0RXhwcmVzc2lvbi52YWx1ZSA+IHJpZ2h0RXhwcmVzc2lvbi52YWx1ZSk7XG5cdFx0XHRjYXNlIFwiPj1cIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRFeHByZXNzaW9uLnZhbHVlID49IHJpZ2h0RXhwcmVzc2lvbi52YWx1ZSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRfdHlwZTogXCJDb21wYXJpc29uXCIsXG5cdFx0XHRvcGVyYXRvcjogb3BlcmF0b3IsXG5cdFx0XHRvcGVyYW5kMTogbGVmdEV4cHJlc3Npb24sXG5cdFx0XHRvcGVyYW5kMjogcmlnaHRFeHByZXNzaW9uXG5cdFx0fTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGV4cHJlc3Npb246IFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxhbnk+IHwgVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb24pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248bnVtYmVyPiB7XG5cdGlmIChleHByZXNzaW9uLl90eXBlID09PSBcIlVucmVzb2x2YWJsZVwiKSB7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb247XG5cdH1cblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJMZW5ndGhcIixcblx0XHRwYXRoSW5Nb2RlbDogZXhwcmVzc2lvblxuXHR9O1xufVxuXG4vKipcbiAqIENvbXBhcmlzb246IFwiZXF1YWxcIiAoPT09KS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBsZWZ0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgbGVmdCBzaWRlXG4gKiBAcGFyYW0gcmlnaHRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb21wYXJpc29uXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgY29tcGFyaXNvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWw8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRsZWZ0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRyaWdodE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3QgbGVmdEV4cHJlc3Npb24gPSB3cmFwUHJpbWl0aXZlKGxlZnRPcGVyYW5kKTtcblx0Y29uc3QgcmlnaHRFeHByZXNzaW9uID0gd3JhcFByaW1pdGl2ZShyaWdodE9wZXJhbmQpO1xuXHRpZiAoaGFzVW5yZXNvbHZhYmxlRXhwcmVzc2lvbihsZWZ0RXhwcmVzc2lvbiwgcmlnaHRFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9XG5cdGlmIChfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGxlZnRFeHByZXNzaW9uLCByaWdodEV4cHJlc3Npb24pKSB7XG5cdFx0cmV0dXJuIGNvbnN0YW50KHRydWUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmVkdWNlKGxlZnQ6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiwgcmlnaHQ6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPikge1xuXHRcdGlmIChsZWZ0Ll90eXBlID09PSBcIkNvbXBhcmlzb25cIiAmJiBpc1RydWUocmlnaHQpKSB7XG5cdFx0XHQvLyBjb21wYXJlKGEsIGIpID09PSB0cnVlIH5+PiBjb21wYXJlKGEsIGIpXG5cdFx0XHRyZXR1cm4gbGVmdDtcblx0XHR9IGVsc2UgaWYgKGxlZnQuX3R5cGUgPT09IFwiQ29tcGFyaXNvblwiICYmIGlzRmFsc2UocmlnaHQpKSB7XG5cdFx0XHQvLyBjb21wYXJlKGEsIGIpID09PSBmYWxzZSB+fj4gIWNvbXBhcmUoYSwgYilcblx0XHRcdHJldHVybiBub3QobGVmdCk7XG5cdFx0fSBlbHNlIGlmIChsZWZ0Ll90eXBlID09PSBcIklmRWxzZVwiICYmIF9jaGVja0V4cHJlc3Npb25zQXJlRXF1YWwobGVmdC5vblRydWUsIHJpZ2h0KSkge1xuXHRcdFx0Ly8gKGlmICh4KSB7IGEgfSBlbHNlIHsgYiB9KSA9PT0gYSB+fj4geCB8fCAoYiA9PT0gYSlcblx0XHRcdHJldHVybiBvcihsZWZ0LmNvbmRpdGlvbiwgZXF1YWwobGVmdC5vbkZhbHNlLCByaWdodCkpO1xuXHRcdH0gZWxzZSBpZiAobGVmdC5fdHlwZSA9PT0gXCJJZkVsc2VcIiAmJiBfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGxlZnQub25GYWxzZSwgcmlnaHQpKSB7XG5cdFx0XHQvLyAoaWYgKHgpIHsgYSB9IGVsc2UgeyBiIH0pID09PSBiIH5+PiAheCB8fCAoYSA9PT0gYilcblx0XHRcdHJldHVybiBvcihub3QobGVmdC5jb25kaXRpb24pLCBlcXVhbChsZWZ0Lm9uVHJ1ZSwgcmlnaHQpKTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0bGVmdC5fdHlwZSA9PT0gXCJJZkVsc2VcIiAmJlxuXHRcdFx0aXNDb25zdGFudChsZWZ0Lm9uVHJ1ZSkgJiZcblx0XHRcdGlzQ29uc3RhbnQobGVmdC5vbkZhbHNlKSAmJlxuXHRcdFx0aXNDb25zdGFudChyaWdodCkgJiZcblx0XHRcdCFfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGxlZnQub25UcnVlLCByaWdodCkgJiZcblx0XHRcdCFfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGxlZnQub25GYWxzZSwgcmlnaHQpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gY29uc3RhbnQoZmFsc2UpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Ly8gZXhwbG9pdCBzeW1tZXRyeTogYSA9PT0gYiA8fj4gYiA9PT0gYVxuXHRjb25zdCByZWR1Y2VkID0gcmVkdWNlKGxlZnRFeHByZXNzaW9uLCByaWdodEV4cHJlc3Npb24pID8/IHJlZHVjZShyaWdodEV4cHJlc3Npb24sIGxlZnRFeHByZXNzaW9uKTtcblx0cmV0dXJuIHJlZHVjZWQgPz8gY29tcGFyaXNvbihcIj09PVwiLCBsZWZ0RXhwcmVzc2lvbiwgcmlnaHRFeHByZXNzaW9uKTtcbn1cblxuLyoqXG4gKiBDb21wYXJpc29uOiBcIm5vdCBlcXVhbFwiICghPT0pLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGxlZnRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSBsZWZ0IHNpZGVcbiAqIEBwYXJhbSByaWdodE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb21wYXJpc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3RFcXVhbDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGxlZnRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4sXG5cdHJpZ2h0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gbm90KGVxdWFsKGxlZnRPcGVyYW5kLCByaWdodE9wZXJhbmQpKTtcbn1cblxuLyoqXG4gKiBDb21wYXJpc29uOiBcImdyZWF0ZXIgb3IgZXF1YWxcIiAoPj0pLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGxlZnRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSBsZWZ0IHNpZGVcbiAqIEBwYXJhbSByaWdodE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb21wYXJpc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncmVhdGVyT3JFcXVhbDxUIGV4dGVuZHMgRGVmaW5lZFByaW1pdGl2ZVR5cGU+KFxuXHRsZWZ0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRyaWdodE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGNvbXBhcmlzb24oXCI+PVwiLCBsZWZ0T3BlcmFuZCwgcmlnaHRPcGVyYW5kKTtcbn1cblxuLyoqXG4gKiBDb21wYXJpc29uOiBcImdyZWF0ZXIgdGhhblwiICg+KS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBsZWZ0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgbGVmdCBzaWRlXG4gKiBAcGFyYW0gcmlnaHRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb21wYXJpc29uXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgY29tcGFyaXNvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JlYXRlclRoYW48VCBleHRlbmRzIERlZmluZWRQcmltaXRpdmVUeXBlPihcblx0bGVmdE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPixcblx0cmlnaHRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBjb21wYXJpc29uKFwiPlwiLCBsZWZ0T3BlcmFuZCwgcmlnaHRPcGVyYW5kKTtcbn1cblxuLyoqXG4gKiBDb21wYXJpc29uOiBcImxlc3Mgb3IgZXF1YWxcIiAoPD0pLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGxlZnRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSBsZWZ0IHNpZGVcbiAqIEBwYXJhbSByaWdodE9wZXJhbmQgVGhlIG9wZXJhbmQgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb21wYXJpc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXNzT3JFcXVhbDxUIGV4dGVuZHMgRGVmaW5lZFByaW1pdGl2ZVR5cGU+KFxuXHRsZWZ0T3BlcmFuZDogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+LFxuXHRyaWdodE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGNvbXBhcmlzb24oXCI8PVwiLCBsZWZ0T3BlcmFuZCwgcmlnaHRPcGVyYW5kKTtcbn1cblxuLyoqXG4gKiBDb21wYXJpc29uOiBcImxlc3MgdGhhblwiICg8KS5cbiAqXG4gKiBAdGVtcGxhdGUgVCBUaGUgdGFyZ2V0IHR5cGVcbiAqIEBwYXJhbSBsZWZ0T3BlcmFuZCBUaGUgb3BlcmFuZCBvbiB0aGUgbGVmdCBzaWRlXG4gKiBAcGFyYW0gcmlnaHRPcGVyYW5kIFRoZSBvcGVyYW5kIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb21wYXJpc29uXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgY29tcGFyaXNvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVzc1RoYW48VCBleHRlbmRzIERlZmluZWRQcmltaXRpdmVUeXBlPihcblx0bGVmdE9wZXJhbmQ6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPixcblx0cmlnaHRPcGVyYW5kOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBjb21wYXJpc29uKFwiPFwiLCBsZWZ0T3BlcmFuZCwgcmlnaHRPcGVyYW5kKTtcbn1cblxuLyoqXG4gKiBJZi10aGVuLWVsc2UgZXhwcmVzc2lvbi5cbiAqXG4gKiBFdmFsdWF0ZXMgdG8gb25UcnVlIGlmIHRoZSBjb25kaXRpb24gZXZhbHVhdGVzIHRvIHRydWUsIGVsc2UgZXZhbHVhdGVzIHRvIG9uRmFsc2UuXG4gKlxuICogQHRlbXBsYXRlIFQgVGhlIHRhcmdldCB0eXBlXG4gKiBAcGFyYW0gY29uZGl0aW9uIFRoZSBjb25kaXRpb24gdG8gZXZhbHVhdGVcbiAqIEBwYXJhbSBvblRydWUgRXhwcmVzc2lvbiByZXN1bHQgaWYgdGhlIGNvbmRpdGlvbiBldmFsdWF0ZXMgdG8gdHJ1ZVxuICogQHBhcmFtIG9uRmFsc2UgRXhwcmVzc2lvbiByZXN1bHQgaWYgdGhlIGNvbmRpdGlvbiBldmFsdWF0ZXMgdG8gZmFsc2VcbiAqIEByZXR1cm5zIFRoZSBleHByZXNzaW9uIHRoYXQgcmVwcmVzZW50cyB0aGlzIGNvbmRpdGlvbmFsIGNoZWNrXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZkVsc2U8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRjb25kaXRpb246IEV4cHJlc3Npb25PclByaW1pdGl2ZTxib29sZWFuPixcblx0b25UcnVlOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4sXG5cdG9uRmFsc2U6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+IHtcblx0bGV0IGNvbmRpdGlvbkV4cHJlc3Npb24gPSB3cmFwUHJpbWl0aXZlKGNvbmRpdGlvbik7XG5cdGxldCBvblRydWVFeHByZXNzaW9uID0gd3JhcFByaW1pdGl2ZShvblRydWUpO1xuXHRsZXQgb25GYWxzZUV4cHJlc3Npb24gPSB3cmFwUHJpbWl0aXZlKG9uRmFsc2UpO1xuXG5cdGlmIChoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uKGNvbmRpdGlvbkV4cHJlc3Npb24sIG9uVHJ1ZUV4cHJlc3Npb24sIG9uRmFsc2VFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9XG5cdC8vIHN3YXAgYnJhbmNoZXMgaWYgdGhlIGNvbmRpdGlvbiBpcyBhIG5lZ2F0aW9uXG5cdGlmIChjb25kaXRpb25FeHByZXNzaW9uLl90eXBlID09PSBcIk5vdFwiKSB7XG5cdFx0Ly8gaWZFbHNlKG5vdChYKSwgYSwgYikgLS0+IGlmRWxzZShYLCBiLCBhKVxuXHRcdFtvblRydWVFeHByZXNzaW9uLCBvbkZhbHNlRXhwcmVzc2lvbl0gPSBbb25GYWxzZUV4cHJlc3Npb24sIG9uVHJ1ZUV4cHJlc3Npb25dO1xuXHRcdGNvbmRpdGlvbkV4cHJlc3Npb24gPSBub3QoY29uZGl0aW9uRXhwcmVzc2lvbik7XG5cdH1cblxuXHQvLyBpbmxpbmUgbmVzdGVkIGlmLWVsc2UgZXhwcmVzc2lvbnM6IG9uVHJ1ZSBicmFuY2hcblx0Ly8gaWZFbHNlKFgsIGlmRWxzZShYLCBhLCBiKSwgYykgPT0+IGlmRWxzZShYLCBhLCBjKVxuXHRpZiAob25UcnVlRXhwcmVzc2lvbi5fdHlwZSA9PT0gXCJJZkVsc2VcIiAmJiBfY2hlY2tFeHByZXNzaW9uc0FyZUVxdWFsKGNvbmRpdGlvbkV4cHJlc3Npb24sIG9uVHJ1ZUV4cHJlc3Npb24uY29uZGl0aW9uKSkge1xuXHRcdG9uVHJ1ZUV4cHJlc3Npb24gPSBvblRydWVFeHByZXNzaW9uLm9uVHJ1ZTtcblx0fVxuXG5cdC8vIGlubGluZSBuZXN0ZWQgaWYtZWxzZSBleHByZXNzaW9uczogb25GYWxzZSBicmFuY2hcblx0Ly8gaWZFbHNlKFgsIGEsIGlmRWxzZShYLCBiLCBjKSkgPT0+IGlmRWxzZShYLCBhLCBjKVxuXHRpZiAob25GYWxzZUV4cHJlc3Npb24uX3R5cGUgPT09IFwiSWZFbHNlXCIgJiYgX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChjb25kaXRpb25FeHByZXNzaW9uLCBvbkZhbHNlRXhwcmVzc2lvbi5jb25kaXRpb24pKSB7XG5cdFx0b25GYWxzZUV4cHJlc3Npb24gPSBvbkZhbHNlRXhwcmVzc2lvbi5vbkZhbHNlO1xuXHR9XG5cblx0Ly8gKGlmIHRydWUgdGhlbiBhIGVsc2UgYikgIH5+PiBhXG5cdC8vIChpZiBmYWxzZSB0aGVuIGEgZWxzZSBiKSB+fj4gYlxuXHRpZiAoaXNDb25zdGFudChjb25kaXRpb25FeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBjb25kaXRpb25FeHByZXNzaW9uLnZhbHVlID8gb25UcnVlRXhwcmVzc2lvbiA6IG9uRmFsc2VFeHByZXNzaW9uO1xuXHR9XG5cblx0Ly8gaWYgKGlzQ29uc3RhbnRCb29sZWFuKG9uVHJ1ZUV4cHJlc3Npb24pIHx8IGlzQ29uc3RhbnRCb29sZWFuKG9uRmFsc2VFeHByZXNzaW9uKSkge1xuXHQvLyBcdHJldHVybiBvcihhbmQoY29uZGl0aW9uLCBvblRydWVFeHByZXNzaW9uIGFzIEV4cHJlc3Npb248Ym9vbGVhbj4pLCBhbmQobm90KGNvbmRpdGlvbiksIG9uRmFsc2VFeHByZXNzaW9uIGFzIEV4cHJlc3Npb248Ym9vbGVhbj4pKSBhcyBFeHByZXNzaW9uPFQ+XG5cdC8vIH1cblxuXHQvLyAoaWYgWCB0aGVuIGEgZWxzZSBhKSB+fj4gYVxuXHRpZiAoX2NoZWNrRXhwcmVzc2lvbnNBcmVFcXVhbChvblRydWVFeHByZXNzaW9uLCBvbkZhbHNlRXhwcmVzc2lvbikpIHtcblx0XHRyZXR1cm4gb25UcnVlRXhwcmVzc2lvbjtcblx0fVxuXG5cdC8vIGlmIFggdGhlbiBhIGVsc2UgZmFsc2Ugfn4+IFggJiYgYVxuXHRpZiAoaXNGYWxzZShvbkZhbHNlRXhwcmVzc2lvbikpIHtcblx0XHRyZXR1cm4gYW5kKGNvbmRpdGlvbkV4cHJlc3Npb24sIG9uVHJ1ZUV4cHJlc3Npb24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH1cblxuXHQvLyBpZiBYIHRoZW4gYSBlbHNlIHRydWUgfn4+ICFYIHx8IGFcblx0aWYgKGlzVHJ1ZShvbkZhbHNlRXhwcmVzc2lvbikpIHtcblx0XHRyZXR1cm4gb3Iobm90KGNvbmRpdGlvbkV4cHJlc3Npb24pLCBvblRydWVFeHByZXNzaW9uIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHR9XG5cblx0Ly8gaWYgWCB0aGVuIGZhbHNlIGVsc2UgYSB+fj4gIVggJiYgYVxuXHRpZiAoaXNGYWxzZShvblRydWVFeHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBhbmQobm90KGNvbmRpdGlvbkV4cHJlc3Npb24pLCBvbkZhbHNlRXhwcmVzc2lvbiBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0fVxuXG5cdC8vIGlmIFggdGhlbiB0cnVlIGVsc2UgYSB+fj4gWCB8fCBhXG5cdGlmIChpc1RydWUob25UcnVlRXhwcmVzc2lvbikpIHtcblx0XHRyZXR1cm4gb3IoY29uZGl0aW9uRXhwcmVzc2lvbiwgb25GYWxzZUV4cHJlc3Npb24gYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdH1cblx0aWYgKGlzQ29tcGxleFR5cGVFeHByZXNzaW9uKGNvbmRpdGlvbikgfHwgaXNDb21wbGV4VHlwZUV4cHJlc3Npb24ob25UcnVlKSB8fCBpc0NvbXBsZXhUeXBlRXhwcmVzc2lvbihvbkZhbHNlKSkge1xuXHRcdGxldCBwYXRoSWR4ID0gMDtcblx0XHRjb25zdCBteUlmRWxzZUV4cHJlc3Npb24gPSBmb3JtYXRSZXN1bHQoW2NvbmRpdGlvbiwgb25UcnVlLCBvbkZhbHNlXSwgXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLlN0YW5kYXJkRm9ybWF0dGVyI2lmRWxzZVwiKTtcblx0XHRjb25zdCBhbGxQYXJ0cyA9IFtdO1xuXHRcdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KFxuXHRcdFx0bXlJZkVsc2VFeHByZXNzaW9uLFxuXHRcdFx0XCJQYXRoSW5Nb2RlbFwiLFxuXHRcdFx0KGNvbnN0YW50UGF0aDogUGF0aEluTW9kZWxFeHByZXNzaW9uPGFueT4pID0+IHtcblx0XHRcdFx0YWxsUGFydHMucHVzaChjb25zdGFudFBhdGgpO1xuXHRcdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoYCQke3BhdGhJZHgrK31gLCBcIiRcIik7XG5cdFx0XHR9LFxuXHRcdFx0dHJ1ZVxuXHRcdCk7XG5cdFx0YWxsUGFydHMudW5zaGlmdChjb25zdGFudChKU09OLnN0cmluZ2lmeShteUlmRWxzZUV4cHJlc3Npb24pKSk7XG5cdFx0cmV0dXJuIGZvcm1hdFJlc3VsdChhbGxQYXJ0cywgXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLlN0YW5kYXJkRm9ybWF0dGVyI2V2YWx1YXRlQ29tcGxleEV4cHJlc3Npb25cIiwgdW5kZWZpbmVkLCB0cnVlKTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIklmRWxzZVwiLFxuXHRcdGNvbmRpdGlvbjogY29uZGl0aW9uRXhwcmVzc2lvbixcblx0XHRvblRydWU6IG9uVHJ1ZUV4cHJlc3Npb24sXG5cdFx0b25GYWxzZTogb25GYWxzZUV4cHJlc3Npb25cblx0fTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBleHByZXNzaW9uIGhhcyBhIHJlZmVyZW5jZSB0byB0aGUgZGVmYXVsdCBtb2RlbCAodW5kZWZpbmVkKS5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgZXhwcmVzc2lvbiB0byBldmFsdWF0ZVxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZXJlIGlzIGEgcmVmZXJlbmNlIHRvIHRoZSBkZWZhdWx0IGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChleHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55Pik6IGJvb2xlYW4ge1xuXHRzd2l0Y2ggKGV4cHJlc3Npb24uX3R5cGUpIHtcblx0XHRjYXNlIFwiQ29uc3RhbnRcIjpcblx0XHRjYXNlIFwiRm9ybWF0dGVyXCI6XG5cdFx0Y2FzZSBcIkNvbXBsZXhUeXBlXCI6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0Y2FzZSBcIlNldFwiOlxuXHRcdFx0cmV0dXJuIGV4cHJlc3Npb24ub3BlcmFuZHMuc29tZShoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KTtcblx0XHRjYXNlIFwiUGF0aEluTW9kZWxcIjpcblx0XHRcdHJldHVybiBleHByZXNzaW9uLm1vZGVsTmFtZSA9PT0gdW5kZWZpbmVkO1xuXHRcdGNhc2UgXCJDb21wYXJpc29uXCI6XG5cdFx0XHRyZXR1cm4gaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChleHByZXNzaW9uLm9wZXJhbmQxKSB8fCBoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KGV4cHJlc3Npb24ub3BlcmFuZDIpO1xuXHRcdGNhc2UgXCJJZkVsc2VcIjpcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQoZXhwcmVzc2lvbi5jb25kaXRpb24pIHx8XG5cdFx0XHRcdGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQoZXhwcmVzc2lvbi5vblRydWUpIHx8XG5cdFx0XHRcdGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQoZXhwcmVzc2lvbi5vbkZhbHNlKVxuXHRcdFx0KTtcblx0XHRjYXNlIFwiTm90XCI6XG5cdFx0Y2FzZSBcIlRydXRoeVwiOlxuXHRcdFx0cmV0dXJuIGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQoZXhwcmVzc2lvbi5vcGVyYW5kKTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbnR5cGUgRm48VD4gPSAoKC4uLnBhcmFtczogYW55KSA9PiBUIHwgUHJvbWlzZTxUPikgJiB7XG5cdF9fZnVuY3Rpb25OYW1lOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIFdyYXBwZWRUdXBsZVxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG50eXBlIFdyYXBwZWRUdXBsZTxUPiA9IHsgW0sgaW4ga2V5b2YgVF06IFdyYXBwZWRUdXBsZTxUW0tdPiB8IEV4cHJlc3Npb25PclByaW1pdGl2ZTxUW0tdPiB9O1xuXG4vLyBTbywgdGhpcyB3b3JrcyBidXQgSSBjYW5ub3QgZ2V0IGl0IHRvIGNvbXBpbGUgOkQsIGJ1dCBpdCBzdGlsbCBkb2VzIHdoYXQgaXMgZXhwZWN0ZWQuLi5cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHJlZmVyZW5jZSBvciBhIGZ1bmN0aW9uIG5hbWUuXG4gKi9cbnR5cGUgRnVuY3Rpb25Pck5hbWU8VD4gPSBGbjxUPiB8IHN0cmluZztcblxuLyoqXG4gKiBGdW5jdGlvbiBwYXJhbWV0ZXJzLCBlaXRoZXIgZGVyaXZlZCBmcm9tIHRoZSBmdW5jdGlvbiBvciBhbiB1bnR5cGVkIGFycmF5LlxuICovXG50eXBlIEZ1bmN0aW9uUGFyYW1ldGVyczxULCBGIGV4dGVuZHMgRnVuY3Rpb25Pck5hbWU8VD4+ID0gRiBleHRlbmRzIEZuPFQ+ID8gUGFyYW1ldGVyczxGPiA6IGFueVtdO1xuXG4vKipcbiAqIENhbGxzIGEgZm9ybWF0dGVyIGZ1bmN0aW9uIHRvIHByb2Nlc3MgdGhlIHBhcmFtZXRlcnMuXG4gKiBJZiByZXF1aXJlQ29udGV4dCBpcyBzZXQgdG8gdHJ1ZSBhbmQgbm8gY29udGV4dCBpcyBwYXNzZWQgYSBkZWZhdWx0IGNvbnRleHQgd2lsbCBiZSBhZGRlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdGVtcGxhdGUgVVxuICogQHBhcmFtIHBhcmFtZXRlcnMgVGhlIGxpc3Qgb2YgcGFyYW1ldGVyIHRoYXQgc2hvdWxkIG1hdGNoIHRoZSB0eXBlIGFuZCBudW1iZXIgb2YgdGhlIGZvcm1hdHRlciBmdW5jdGlvblxuICogQHBhcmFtIGZvcm1hdHRlckZ1bmN0aW9uIFRoZSBmdW5jdGlvbiB0byBjYWxsXG4gKiBAcGFyYW0gW2NvbnRleHRFbnRpdHlUeXBlXSBJZiBubyBwYXJhbWV0ZXIgcmVmZXJzIHRvIHRoZSBjb250ZXh0IHRoZW4gd2UgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gYWRkIGEgcmVmZXJlbmNlIHRvIHRoZSBrZXlzIGZyb20gdGhlIGVudGl0eSB0eXBlLlxuICogQHBhcmFtIFtpZ25vcmVDb21wbGV4VHlwZV0gV2hldGhlciB0byBpZ25vcmUgdGhlIHRyYW5zZ2Zvcm1hdGlvbiB0byB0aGUgU3RhbmRhcmRGb3JtYXR0ZXIgb3Igbm90XG4gKiBAcmV0dXJucyBUaGUgY29ycmVzcG9uZGluZyBleHByZXNzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRSZXN1bHQ8VCwgVSBleHRlbmRzIEZuPFQ+Pihcblx0cGFyYW1ldGVyczogV3JhcHBlZFR1cGxlPFBhcmFtZXRlcnM8VT4+LFxuXHRmb3JtYXR0ZXJGdW5jdGlvbjogVSB8IHN0cmluZyxcblx0Y29udGV4dEVudGl0eVR5cGU/OiBFbnRpdHlUeXBlLFxuXHRpZ25vcmVDb21wbGV4VHlwZSA9IGZhbHNlXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4ge1xuXHRjb25zdCBwYXJhbWV0ZXJFeHByZXNzaW9ucyA9IChwYXJhbWV0ZXJzIGFzIGFueVtdKS5tYXAod3JhcFByaW1pdGl2ZSk7XG5cblx0aWYgKGhhc1VucmVzb2x2YWJsZUV4cHJlc3Npb24oLi4ucGFyYW1ldGVyRXhwcmVzc2lvbnMpKSB7XG5cdFx0cmV0dXJuIHVucmVzb2x2YWJsZUV4cHJlc3Npb247XG5cdH1cblx0aWYgKGNvbnRleHRFbnRpdHlUeXBlKSB7XG5cdFx0Ly8gT3RoZXJ3aXNlLCBpZiB0aGUgY29udGV4dCBpcyByZXF1aXJlZCBhbmQgbm8gY29udGV4dCBpcyBwcm92aWRlZCBtYWtlIHN1cmUgdG8gYWRkIHRoZSBkZWZhdWx0IGJpbmRpbmdcblx0XHRpZiAoIXBhcmFtZXRlckV4cHJlc3Npb25zLnNvbWUoaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dCkpIHtcblx0XHRcdGNvbnRleHRFbnRpdHlUeXBlLmtleXMuZm9yRWFjaCgoa2V5KSA9PiBwYXJhbWV0ZXJFeHByZXNzaW9ucy5wdXNoKHBhdGhJbk1vZGVsKGtleS5uYW1lLCBcIlwiKSkpO1xuXHRcdH1cblx0fVxuXHRsZXQgZnVuY3Rpb25OYW1lID0gXCJcIjtcblx0aWYgKHR5cGVvZiBmb3JtYXR0ZXJGdW5jdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuXHRcdGZ1bmN0aW9uTmFtZSA9IGZvcm1hdHRlckZ1bmN0aW9uO1xuXHR9IGVsc2Uge1xuXHRcdGZ1bmN0aW9uTmFtZSA9IGZvcm1hdHRlckZ1bmN0aW9uLl9fZnVuY3Rpb25OYW1lO1xuXHR9XG5cdC8vIEZvcm1hdHRlck5hbWUgY2FuIGJlIG9mIGZvcm1hdCBzYXAuZmUuY29yZS54eHgjbWV0aG9kTmFtZSB0byBoYXZlIG11bHRpcGxlIGZvcm1hdHRlciBpbiBvbmUgY2xhc3Ncblx0Y29uc3QgW2Zvcm1hdHRlckNsYXNzLCBmb3JtYXR0ZXJOYW1lXSA9IGZ1bmN0aW9uTmFtZS5zcGxpdChcIiNcIik7XG5cblx0Ly8gSW4gc29tZSBjYXNlIHdlIGFsc28gY2Fubm90IGNhbGwgZGlyZWN0bHkgYSBmdW5jdGlvbiBiZWNhdXNlIG9mIHRvbyBjb21wbGV4IGlucHV0LCBpbiB0aGF0IGNhc2Ugd2UgbmVlZCB0byBjb252ZXJ0IHRvIGEgc2ltcGxlciBmdW5jdGlvbiBjYWxsXG5cdGlmICghaWdub3JlQ29tcGxleFR5cGUgJiYgKHBhcmFtZXRlckV4cHJlc3Npb25zLnNvbWUoaXNDb21wbGV4VHlwZUV4cHJlc3Npb24pIHx8IHBhcmFtZXRlckV4cHJlc3Npb25zLnNvbWUoaXNDb25jYXRFeHByZXNzaW9uKSkpIHtcblx0XHRsZXQgcGF0aElkeCA9IDA7XG5cdFx0Y29uc3QgbXlGb3JtYXRFeHByZXNzaW9uID0gZm9ybWF0UmVzdWx0KHBhcmFtZXRlckV4cHJlc3Npb25zLCBmdW5jdGlvbk5hbWUsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdFx0Y29uc3QgYWxsUGFydHMgPSBbXTtcblx0XHR0cmFuc2Zvcm1SZWN1cnNpdmVseShteUZvcm1hdEV4cHJlc3Npb24sIFwiUGF0aEluTW9kZWxcIiwgKGNvbnN0YW50UGF0aDogUGF0aEluTW9kZWxFeHByZXNzaW9uPGFueT4pID0+IHtcblx0XHRcdGFsbFBhcnRzLnB1c2goY29uc3RhbnRQYXRoKTtcblx0XHRcdHJldHVybiBwYXRoSW5Nb2RlbChgJCR7cGF0aElkeCsrfWAsIFwiJFwiKTtcblx0XHR9KTtcblx0XHRhbGxQYXJ0cy51bnNoaWZ0KGNvbnN0YW50KEpTT04uc3RyaW5naWZ5KG15Rm9ybWF0RXhwcmVzc2lvbikpKTtcblx0XHRyZXR1cm4gZm9ybWF0UmVzdWx0KGFsbFBhcnRzLCBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuU3RhbmRhcmRGb3JtYXR0ZXIjZXZhbHVhdGVDb21wbGV4RXhwcmVzc2lvblwiLCB1bmRlZmluZWQsIHRydWUpO1xuXHR9IGVsc2UgaWYgKCEhZm9ybWF0dGVyTmFtZSAmJiBmb3JtYXR0ZXJOYW1lLmxlbmd0aCA+IDApIHtcblx0XHRwYXJhbWV0ZXJFeHByZXNzaW9ucy51bnNoaWZ0KGNvbnN0YW50KGZvcm1hdHRlck5hbWUpKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiRm9ybWF0dGVyXCIsXG5cdFx0Zm46IGZvcm1hdHRlckNsYXNzLFxuXHRcdHBhcmFtZXRlcnM6IHBhcmFtZXRlckV4cHJlc3Npb25zXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRVcENvbnN0cmFpbnRzKHRhcmdldE1hcHBpbmc6IHR5cGVvZiBFRE1fVFlQRV9NQVBQSU5HLCBwcm9wZXJ0eTogUHJvcGVydHkgfCBBY3Rpb25QYXJhbWV0ZXIpIHtcblx0Y29uc3QgY29uc3RyYWludHM6IHtcblx0XHRzY2FsZT86IG51bWJlcjtcblx0XHRwcmVjaXNpb24/OiBudW1iZXI7XG5cdFx0bWF4TGVuZ3RoPzogbnVtYmVyO1xuXHRcdG51bGxhYmxlPzogYm9vbGVhbjtcblx0XHRtaW5pbXVtPzogc3RyaW5nO1xuXHRcdG1heGltdW0/OiBzdHJpbmc7XG5cdFx0aXNEaWdpdFNlcXVlbmNlPzogYm9vbGVhbjtcblx0XHRWND86IGJvb2xlYW47XG5cdH0gPSB7fTtcblx0aWYgKHRhcmdldE1hcHBpbmc/LmNvbnN0cmFpbnRzPy4kU2NhbGUgJiYgcHJvcGVydHkuc2NhbGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0cmFpbnRzLnNjYWxlID0gcHJvcGVydHkuc2NhbGU7XG5cdH1cblx0aWYgKHRhcmdldE1hcHBpbmc/LmNvbnN0cmFpbnRzPy4kUHJlY2lzaW9uICYmIHByb3BlcnR5LnByZWNpc2lvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3RyYWludHMucHJlY2lzaW9uID0gcHJvcGVydHkucHJlY2lzaW9uO1xuXHR9XG5cdGlmICh0YXJnZXRNYXBwaW5nPy5jb25zdHJhaW50cz8uJE1heExlbmd0aCAmJiBwcm9wZXJ0eS5tYXhMZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0cmFpbnRzLm1heExlbmd0aCA9IHByb3BlcnR5Lm1heExlbmd0aDtcblx0fVxuXHRpZiAocHJvcGVydHkubnVsbGFibGUgPT09IGZhbHNlKSB7XG5cdFx0Y29uc3RyYWludHMubnVsbGFibGUgPSBmYWxzZTtcblx0fVxuXHRpZiAodGFyZ2V0TWFwcGluZz8uY29uc3RyYWludHM/LltcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5pbXVtLyREZWNpbWFsXCJdICYmICFpc05hTihwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWluaW11bSkpIHtcblx0XHRjb25zdHJhaW50cy5taW5pbXVtID0gYCR7cHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1pbmltdW19YDtcblx0fVxuXHRpZiAodGFyZ2V0TWFwcGluZz8uY29uc3RyYWludHM/LltcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhpbXVtLyREZWNpbWFsXCJdICYmICFpc05hTihwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWF4aW11bSkpIHtcblx0XHRjb25zdHJhaW50cy5tYXhpbXVtID0gYCR7cHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1heGltdW19YDtcblx0fVxuXHRpZiAoXG5cdFx0cHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNEaWdpdFNlcXVlbmNlICYmXG5cdFx0dGFyZ2V0TWFwcGluZy50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiICYmXG5cdFx0dGFyZ2V0TWFwcGluZz8uY29uc3RyYWludHM/LltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEaWdpdFNlcXVlbmNlXCJdXG5cdCkge1xuXHRcdGNvbnN0cmFpbnRzLmlzRGlnaXRTZXF1ZW5jZSA9IHRydWU7XG5cdH1cblx0aWYgKHRhcmdldE1hcHBpbmc/LmNvbnN0cmFpbnRzPy4kVjQpIHtcblx0XHRjb25zdHJhaW50cy5WNCA9IHRydWU7XG5cdH1cblx0cmV0dXJuIGNvbnN0cmFpbnRzO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgcHJvcGVydHksIGFuZCBzZXRzIHVwIHRoZSBmb3JtYXRPcHRpb25zIGFuZCBjb25zdHJhaW50cy5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIFByb3BlcnR5IGZvciB3aGljaCB3ZSBhcmUgc2V0dGluZyB1cCB0aGUgYmluZGluZ1xuICogQHBhcmFtIHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24gVGhlIEJpbmRpbmdFeHByZXNzaW9uIG9mIHRoZSBwcm9wZXJ0eSBhYm92ZS4gU2VydmVzIGFzIHRoZSBiYXNpcyB0byB3aGljaCBpbmZvcm1hdGlvbiBjYW4gYmUgYWRkZWRcbiAqIEBwYXJhbSBpZ25vcmVDb25zdHJhaW50cyBJZ25vcmUgY29uc3RyYWludHMgb2YgdGhlIHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgcHJvcGVydHkgd2l0aCBmb3JtYXRPcHRpb25zIGFuZCBjb25zdHJhaW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0V2l0aFR5cGVJbmZvcm1hdGlvbjxUPihcblx0cHJvcGVydHk6IFByb3BlcnR5IHwgQWN0aW9uUGFyYW1ldGVyLFxuXHRwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPixcblx0aWdub3JlQ29uc3RyYWludHMgPSBmYWxzZVxuKTogUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+IHtcblx0Y29uc3Qgb3V0RXhwcmVzc2lvbjogUGF0aEluTW9kZWxFeHByZXNzaW9uPGFueT4gPSBwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uIGFzIFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxhbnk+O1xuXHRpZiAocHJvcGVydHkuX3R5cGUgIT09IFwiUHJvcGVydHlcIiAmJiBwcm9wZXJ0eS5fdHlwZSAhPT0gXCJBY3Rpb25QYXJhbWV0ZXJcIikge1xuXHRcdHJldHVybiBvdXRFeHByZXNzaW9uO1xuXHR9XG5cdGNvbnN0IHRhcmdldE1hcHBpbmcgPSBFRE1fVFlQRV9NQVBQSU5HW3Byb3BlcnR5LnR5cGVdO1xuXHRpZiAoIXRhcmdldE1hcHBpbmcpIHtcblx0XHRyZXR1cm4gb3V0RXhwcmVzc2lvbjtcblx0fVxuXHRpZiAoIW91dEV4cHJlc3Npb24uZm9ybWF0T3B0aW9ucykge1xuXHRcdG91dEV4cHJlc3Npb24uZm9ybWF0T3B0aW9ucyA9IHt9O1xuXHR9XG5cdG91dEV4cHJlc3Npb24uY29uc3RyYWludHMgPSB7fTtcblxuXHRvdXRFeHByZXNzaW9uLnR5cGUgPSB0YXJnZXRNYXBwaW5nLnR5cGU7XG5cdGlmICghaWdub3JlQ29uc3RyYWludHMpIHtcblx0XHRvdXRFeHByZXNzaW9uLmNvbnN0cmFpbnRzID0gc2V0VXBDb25zdHJhaW50cyh0YXJnZXRNYXBwaW5nLCBwcm9wZXJ0eSk7XG5cdH1cblxuXHRpZiAoXG5cdFx0KG91dEV4cHJlc3Npb24/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnRcIikgPT09IDAgJiYgb3V0RXhwcmVzc2lvbj8udHlwZSAhPT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQ2NFwiKSB8fFxuXHRcdG91dEV4cHJlc3Npb24/LnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRG91YmxlXCJcblx0KSB7XG5cdFx0b3V0RXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zID0gT2JqZWN0LmFzc2lnbihvdXRFeHByZXNzaW9uLmZvcm1hdE9wdGlvbnMsIHtcblx0XHRcdHBhcnNlQXNTdHJpbmc6IGZhbHNlXG5cdFx0fSk7XG5cdH1cblx0aWYgKG91dEV4cHJlc3Npb24udHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIiAmJiBpc1Byb3BlcnR5KHByb3BlcnR5KSkge1xuXHRcdG91dEV4cHJlc3Npb24uZm9ybWF0T3B0aW9ucy5wYXJzZUtlZXBzRW1wdHlTdHJpbmcgPSB0cnVlO1xuXHRcdGNvbnN0IGZpc2NhbFR5cGUgPSBnZXRGaXNjYWxUeXBlKHByb3BlcnR5KTtcblx0XHRpZiAoZmlzY2FsVHlwZSkge1xuXHRcdFx0b3V0RXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zLmZpc2NhbFR5cGUgPSBmaXNjYWxUeXBlO1xuXHRcdFx0b3V0RXhwcmVzc2lvbi50eXBlID0gXCJzYXAuZmUuY29yZS50eXBlLkZpc2NhbERhdGVcIjtcblx0XHR9XG5cdH1cblx0aWYgKG91dEV4cHJlc3Npb24udHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EZWNpbWFsXCIgfHwgb3V0RXhwcmVzc2lvbj8udHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQ2NFwiKSB7XG5cdFx0b3V0RXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zID0gT2JqZWN0LmFzc2lnbihvdXRFeHByZXNzaW9uLmZvcm1hdE9wdGlvbnMsIHtcblx0XHRcdGVtcHR5U3RyaW5nOiBcIlwiXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gb3V0RXhwcmVzc2lvbjtcbn1cblxuZXhwb3J0IGNvbnN0IGdldEZpc2NhbFR5cGUgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzRmlzY2FsWWVhcikge1xuXHRcdHJldHVybiBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyO1xuXHR9XG5cdGlmIChwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0Zpc2NhbFBlcmlvZCkge1xuXHRcdHJldHVybiBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxQZXJpb2Q7XG5cdH1cblx0aWYgKHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzRmlzY2FsWWVhclBlcmlvZCkge1xuXHRcdHJldHVybiBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyUGVyaW9kO1xuXHR9XG5cdGlmIChwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0Zpc2NhbFF1YXJ0ZXIpIHtcblx0XHRyZXR1cm4gQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsUXVhcnRlcjtcblx0fVxuXHRpZiAocHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNGaXNjYWxZZWFyUXVhcnRlcikge1xuXHRcdHJldHVybiBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyUXVhcnRlcjtcblx0fVxuXHRpZiAocHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNGaXNjYWxXZWVrKSB7XG5cdFx0cmV0dXJuIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFdlZWs7XG5cdH1cblx0aWYgKHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzRmlzY2FsWWVhcldlZWspIHtcblx0XHRyZXR1cm4gQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsWWVhcldlZWs7XG5cdH1cblx0aWYgKHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LklzRGF5T2ZGaXNjYWxZZWFyKSB7XG5cdFx0cmV0dXJuIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0RheU9mRmlzY2FsWWVhcjtcblx0fVxufTtcblxuLyoqXG4gKiBDYWxscyBhIGNvbXBsZXggdHlwZSB0byBwcm9jZXNzIHRoZSBwYXJhbWV0ZXJzLlxuICogSWYgcmVxdWlyZUNvbnRleHQgaXMgc2V0IHRvIHRydWUgYW5kIG5vIGNvbnRleHQgaXMgcGFzc2VkLCBhIGRlZmF1bHQgY29udGV4dCB3aWxsIGJlIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0ZW1wbGF0ZSBVXG4gKiBAcGFyYW0gcGFyYW1ldGVycyBUaGUgbGlzdCBvZiBwYXJhbWV0ZXJzIHRoYXQgc2hvdWxkIG1hdGNoIHRoZSB0eXBlIGZvciB0aGUgY29tcGxleCB0eXBlPVxuICogQHBhcmFtIHR5cGUgVGhlIGNvbXBsZXggdHlwZSB0byB1c2VcbiAqIEBwYXJhbSBbY29udGV4dEVudGl0eVR5cGVdIFRoZSBjb250ZXh0IGVudGl0eSB0eXBlIHRvIGNvbnNpZGVyXG4gKiBAcGFyYW0gb0Zvcm1hdE9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFR5cGVJbmZvcm1hdGlvbjxULCBVIGV4dGVuZHMgRm48VD4+KFxuXHRwYXJhbWV0ZXJzOiBXcmFwcGVkVHVwbGU8UGFyYW1ldGVyczxVPj4sXG5cdHR5cGU6IHN0cmluZyxcblx0Y29udGV4dEVudGl0eVR5cGU/OiBFbnRpdHlUeXBlLFxuXHRvRm9ybWF0T3B0aW9ucz86IGFueVxuKTogVW5yZXNvbHZhYmxlUGF0aEV4cHJlc3Npb24gfCBDb21wbGV4VHlwZUV4cHJlc3Npb248VD4gfCBDb25zdGFudEV4cHJlc3Npb248VD4ge1xuXHRjb25zdCBwYXJhbWV0ZXJFeHByZXNzaW9ucyA9IChwYXJhbWV0ZXJzIGFzIGFueVtdKS5tYXAod3JhcFByaW1pdGl2ZSk7XG5cdGlmIChoYXNVbnJlc29sdmFibGVFeHByZXNzaW9uKC4uLnBhcmFtZXRlckV4cHJlc3Npb25zKSkge1xuXHRcdHJldHVybiB1bnJlc29sdmFibGVFeHByZXNzaW9uO1xuXHR9XG5cdC8vIElmIHRoZXJlIGlzIG9ubHkgb25lIHBhcmFtZXRlciBhbmQgaXQgaXMgYSBjb25zdGFudCBhbmQgd2UgZG9uJ3QgZXhwZWN0IHRoZSBjb250ZXh0IHRoZW4gcmV0dXJuIHRoZSBjb25zdGFudFxuXHRpZiAocGFyYW1ldGVyRXhwcmVzc2lvbnMubGVuZ3RoID09PSAxICYmIGlzQ29uc3RhbnQocGFyYW1ldGVyRXhwcmVzc2lvbnNbMF0pICYmICFjb250ZXh0RW50aXR5VHlwZSkge1xuXHRcdHJldHVybiBwYXJhbWV0ZXJFeHByZXNzaW9uc1swXTtcblx0fSBlbHNlIGlmIChjb250ZXh0RW50aXR5VHlwZSkge1xuXHRcdC8vIE90aGVyd2lzZSwgaWYgdGhlIGNvbnRleHQgaXMgcmVxdWlyZWQgYW5kIG5vIGNvbnRleHQgaXMgcHJvdmlkZWQgbWFrZSBzdXJlIHRvIGFkZCB0aGUgZGVmYXVsdCBiaW5kaW5nXG5cdFx0aWYgKCFwYXJhbWV0ZXJFeHByZXNzaW9ucy5zb21lKGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQpKSB7XG5cdFx0XHRjb250ZXh0RW50aXR5VHlwZS5rZXlzLmZvckVhY2goKGtleSkgPT4gcGFyYW1ldGVyRXhwcmVzc2lvbnMucHVzaChwYXRoSW5Nb2RlbChrZXkubmFtZSwgXCJcIikpKTtcblx0XHR9XG5cdH1cblx0b0Zvcm1hdE9wdGlvbnMgPSBfZ2V0Q29tcGxleFR5cGVGb3JtYXRPcHRpb25zRnJvbUZpcnN0UGFyYW0ocGFyYW1ldGVyc1swXSwgb0Zvcm1hdE9wdGlvbnMpO1xuXG5cdGlmICh0eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlVuaXRcIikge1xuXHRcdGNvbnN0IHVvbVBhdGggPSBwYXRoSW5Nb2RlbChcIi8jI0BAcmVxdWVzdFVuaXRzT2ZNZWFzdXJlXCIpO1xuXHRcdHVvbVBhdGgudGFyZ2V0VHlwZSA9IFwiYW55XCI7XG5cdFx0dW9tUGF0aC5tb2RlID0gXCJPbmVUaW1lXCI7XG5cdFx0cGFyYW1ldGVyRXhwcmVzc2lvbnMucHVzaCh1b21QYXRoKTtcblx0fSBlbHNlIGlmICh0eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkN1cnJlbmN5XCIpIHtcblx0XHRjb25zdCBjdXJyZW5jeVBhdGggPSBwYXRoSW5Nb2RlbChcIi8jI0BAcmVxdWVzdEN1cnJlbmN5Q29kZXNcIik7XG5cdFx0Y3VycmVuY3lQYXRoLnRhcmdldFR5cGUgPSBcImFueVwiO1xuXHRcdGN1cnJlbmN5UGF0aC5tb2RlID0gXCJPbmVUaW1lXCI7XG5cdFx0cGFyYW1ldGVyRXhwcmVzc2lvbnMucHVzaChjdXJyZW5jeVBhdGgpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJDb21wbGV4VHlwZVwiLFxuXHRcdHR5cGU6IHR5cGUsXG5cdFx0Zm9ybWF0T3B0aW9uczogb0Zvcm1hdE9wdGlvbnMgfHwge30sXG5cdFx0cGFyYW1ldGVyczoge30sXG5cdFx0YmluZGluZ1BhcmFtZXRlcnM6IHBhcmFtZXRlckV4cHJlc3Npb25zXG5cdH07XG59XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgZm9ybWF0T3B0aW9ucyBmb3IgYSBjb21wbGV4VHlwZSBiYXNlZCBvbiB0aGUgZmlyc3QgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBwYXJhbSBUaGUgZmlyc3QgcGFyYW1ldGVyIG9mIHRoZSBjb21wbGV4IHR5cGVcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIEluaXRpYWwgZm9ybWF0T3B0aW9uc1xuICogQHJldHVybnMgVGhlIG1vZGlmaWVkIGZvcm1hdE9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gX2dldENvbXBsZXhUeXBlRm9ybWF0T3B0aW9uc0Zyb21GaXJzdFBhcmFtPFQsIFUgZXh0ZW5kcyBGbjxUPj4oXG5cdHBhcmFtOiBQYXJhbWV0ZXJzPFU+LFxuXHRmb3JtYXRPcHRpb25zOiB1bmRlZmluZWQgfCBQYXJ0aWFsPHsgc2hvd051bWJlcjogYm9vbGVhbjsgc2hvd01lYXN1cmU6IGJvb2xlYW47IHBhcnNlQXNTdHJpbmc6IGJvb2xlYW47IGVtcHR5U3RyaW5nOiAwIHwgXCJcIiB8IG51bGwgfT5cbikge1xuXHQvLyBpZiBzaG93TWVhc3VyZSBpcyBzZXQgdG8gZmFsc2Ugd2Ugd2FudCB0byBub3QgcGFyc2UgYXMgc3RyaW5nIHRvIHNlZSB0aGUgMFxuXHQvLyB3ZSBkbyB0aGF0IGFsc28gZm9yIGFsbCBiaW5kaW5ncyBiZWNhdXNlIG90aGVyd2lzZSB0aGUgbWRjIEZpZWxkIGlzbid0IGVkaXRhYmxlXG5cdGlmIChcblx0XHQhKGZvcm1hdE9wdGlvbnMgJiYgZm9ybWF0T3B0aW9ucy5zaG93TnVtYmVyID09PSBmYWxzZSkgJiZcblx0XHQocGFyYW0/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnRcIikgPT09IDAgfHxcblx0XHRcdHBhcmFtPy50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRlY2ltYWxcIiB8fFxuXHRcdFx0cGFyYW0/LnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRG91YmxlXCIpXG5cdCkge1xuXHRcdGlmIChwYXJhbT8udHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQ2NFwiIHx8IHBhcmFtPy50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRlY2ltYWxcIikge1xuXHRcdFx0Ly9zYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnQ2NCBkbyBub3Qgc3VwcG9ydCBwYXJzZUFzU3RyaW5nIGZhbHNlXG5cdFx0XHRmb3JtYXRPcHRpb25zID0gZm9ybWF0T3B0aW9ucz8uc2hvd01lYXN1cmUgPT09IGZhbHNlID8geyBlbXB0eVN0cmluZzogXCJcIiwgc2hvd01lYXN1cmU6IGZhbHNlIH0gOiB7IGVtcHR5U3RyaW5nOiBcIlwiIH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvcm1hdE9wdGlvbnMgPSBmb3JtYXRPcHRpb25zPy5zaG93TWVhc3VyZSA9PT0gZmFsc2UgPyB7IHBhcnNlQXNTdHJpbmc6IGZhbHNlLCBzaG93TWVhc3VyZTogZmFsc2UgfSA6IHsgcGFyc2VBc1N0cmluZzogZmFsc2UgfTtcblx0XHR9XG5cdH1cblx0aWYgKHBhcmFtPy5jb25zdHJhaW50cz8ubnVsbGFibGUgIT09IGZhbHNlKSB7XG5cdFx0ZGVsZXRlIGZvcm1hdE9wdGlvbnM/LmVtcHR5U3RyaW5nO1xuXHR9XG5cdHJldHVybiBmb3JtYXRPcHRpb25zO1xufVxuLyoqXG4gKiBGdW5jdGlvbiBjYWxsLCBvcHRpb25hbGx5IHdpdGggYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSBmdW5jIEZ1bmN0aW9uIG5hbWUgb3IgcmVmZXJlbmNlIHRvIGZ1bmN0aW9uXG4gKiBAcGFyYW0gcGFyYW1ldGVycyBBcmd1bWVudHNcbiAqIEBwYXJhbSBvbiBPYmplY3QgdG8gY2FsbCB0aGUgZnVuY3Rpb24gb25cbiAqIEByZXR1cm5zIEV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBmdW5jdGlvbiBjYWxsIChub3QgdGhlIHJlc3VsdCBvZiB0aGUgZnVuY3Rpb24gY2FsbCEpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbjxULCBVIGV4dGVuZHMgRnVuY3Rpb25Pck5hbWU8VD4+KFxuXHRmdW5jOiBVLFxuXHRwYXJhbWV0ZXJzOiBXcmFwcGVkVHVwbGU8RnVuY3Rpb25QYXJhbWV0ZXJzPFQsIFU+Pixcblx0b24/OiBFeHByZXNzaW9uT3JQcmltaXRpdmU8b2JqZWN0Pixcblx0aXNGb3JtYXR0aW5nRm4gPSBmYWxzZVxuKTogRnVuY3Rpb25FeHByZXNzaW9uPFQ+IHtcblx0Y29uc3QgZnVuY3Rpb25OYW1lID0gdHlwZW9mIGZ1bmMgPT09IFwic3RyaW5nXCIgPyBmdW5jIDogZnVuYy5fX2Z1bmN0aW9uTmFtZTtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJGdW5jdGlvblwiLFxuXHRcdG9iajogb24gIT09IHVuZGVmaW5lZCA/IHdyYXBQcmltaXRpdmUob24pIDogdW5kZWZpbmVkLFxuXHRcdGZuOiBmdW5jdGlvbk5hbWUsXG5cdFx0aXNGb3JtYXR0aW5nRm46IGlzRm9ybWF0dGluZ0ZuLFxuXHRcdHBhcmFtZXRlcnM6IChwYXJhbWV0ZXJzIGFzIGFueVtdKS5tYXAod3JhcFByaW1pdGl2ZSlcblx0fTtcbn1cblxuLyoqXG4gKiBTaG9ydGN1dCBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBiaW5kaW5nIHZhbHVlIGlzIG51bGwsIHVuZGVmaW5lZCBvciBlbXB0eS5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvblxuICogQHJldHVybnMgQSBCb29sZWFuIGV4cHJlc3Npb24gZXZhbHVhdGluZyB0aGUgZmFjdCB0aGF0IHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgZW1wdHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkoZXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBhQmluZGluZ3M6IEV4cHJlc3Npb25PclByaW1pdGl2ZTxib29sZWFuPltdID0gW107XG5cdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGV4cHJlc3Npb24sIFwiUGF0aEluTW9kZWxcIiwgKGV4cHIpID0+IHtcblx0XHRhQmluZGluZ3MucHVzaChvcihlcXVhbChleHByLCBcIlwiKSwgZXF1YWwoZXhwciwgdW5kZWZpbmVkKSwgZXF1YWwoZXhwciwgbnVsbCkpKTtcblx0XHRyZXR1cm4gZXhwcjtcblx0fSk7XG5cdHJldHVybiBhbmQoLi4uYUJpbmRpbmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdCguLi5pbkV4cHJlc3Npb25zOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8c3RyaW5nPltdKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4ge1xuXHRjb25zdCBleHByZXNzaW9ucyA9IGluRXhwcmVzc2lvbnMubWFwKHdyYXBQcmltaXRpdmUpO1xuXHRpZiAoaGFzVW5yZXNvbHZhYmxlRXhwcmVzc2lvbiguLi5leHByZXNzaW9ucykpIHtcblx0XHRyZXR1cm4gdW5yZXNvbHZhYmxlRXhwcmVzc2lvbjtcblx0fVxuXHRpZiAoZXhwcmVzc2lvbnMuZXZlcnkoaXNDb25zdGFudCkpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoXG5cdFx0XHRleHByZXNzaW9ucy5yZWR1Y2UoKGNvbmNhdGVuYXRlZDogc3RyaW5nLCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBjb25jYXRlbmF0ZWQgKyAodmFsdWUgYXMgQ29uc3RhbnRFeHByZXNzaW9uPGFueT4pLnZhbHVlLnRvU3RyaW5nKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGNvbmNhdGVuYXRlZDtcblx0XHRcdH0sIFwiXCIpXG5cdFx0KTtcblx0fSBlbHNlIGlmIChleHByZXNzaW9ucy5zb21lKGlzQ29tcGxleFR5cGVFeHByZXNzaW9uKSkge1xuXHRcdGxldCBwYXRoSWR4ID0gMDtcblx0XHRjb25zdCBteUNvbmNhdEV4cHJlc3Npb24gPSBmb3JtYXRSZXN1bHQoZXhwcmVzc2lvbnMsIFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5TdGFuZGFyZEZvcm1hdHRlciNjb25jYXRcIiwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHRjb25zdCBhbGxQYXJ0cyA9IFtdO1xuXHRcdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KG15Q29uY2F0RXhwcmVzc2lvbiwgXCJQYXRoSW5Nb2RlbFwiLCAoY29uc3RhbnRQYXRoOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248YW55PikgPT4ge1xuXHRcdFx0YWxsUGFydHMucHVzaChjb25zdGFudFBhdGgpO1xuXHRcdFx0cmV0dXJuIHBhdGhJbk1vZGVsKGAkJHtwYXRoSWR4Kyt9YCwgXCIkXCIpO1xuXHRcdH0pO1xuXHRcdGFsbFBhcnRzLnVuc2hpZnQoY29uc3RhbnQoSlNPTi5zdHJpbmdpZnkobXlDb25jYXRFeHByZXNzaW9uKSkpO1xuXHRcdHJldHVybiBmb3JtYXRSZXN1bHQoYWxsUGFydHMsIFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5TdGFuZGFyZEZvcm1hdHRlciNldmFsdWF0ZUNvbXBsZXhFeHByZXNzaW9uXCIsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJDb25jYXRcIixcblx0XHRleHByZXNzaW9uczogZXhwcmVzc2lvbnNcblx0fTtcbn1cblxuZXhwb3J0IHR5cGUgVHJhbnNmb3JtRnVuY3Rpb24gPSA8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGUgfCB1bmtub3duPihleHByZXNzaW9uUGFydDogYW55KSA9PiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5leHBvcnQgdHlwZSBFeHByZXNzaW9uVHlwZSA9IFBpY2s8QmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4sIFwiX3R5cGVcIj5bXCJfdHlwZVwiXTtcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1SZWN1cnNpdmVseTxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZSB8IHVua25vd24+KFxuXHRpbkV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPixcblx0ZXhwcmVzc2lvblR5cGU6IEV4cHJlc3Npb25UeXBlLFxuXHR0cmFuc2Zvcm1GdW5jdGlvbjogVHJhbnNmb3JtRnVuY3Rpb24sXG5cdGluY2x1ZGVBbGxFeHByZXNzaW9uID0gZmFsc2Vcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPiB7XG5cdGxldCBleHByZXNzaW9uID0gaW5FeHByZXNzaW9uO1xuXHRzd2l0Y2ggKGV4cHJlc3Npb24uX3R5cGUpIHtcblx0XHRjYXNlIFwiRnVuY3Rpb25cIjpcblx0XHRjYXNlIFwiRm9ybWF0dGVyXCI6XG5cdFx0XHRleHByZXNzaW9uLnBhcmFtZXRlcnMgPSBleHByZXNzaW9uLnBhcmFtZXRlcnMubWFwKChwYXJhbWV0ZXIpID0+XG5cdFx0XHRcdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KHBhcmFtZXRlciwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbilcblx0XHRcdCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiQ29uY2F0XCI6XG5cdFx0XHRleHByZXNzaW9uLmV4cHJlc3Npb25zID0gZXhwcmVzc2lvbi5leHByZXNzaW9ucy5tYXAoKHN1YkV4cHJlc3Npb24pID0+XG5cdFx0XHRcdHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KHN1YkV4cHJlc3Npb24sIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pXG5cdFx0XHQpO1xuXHRcdFx0ZXhwcmVzc2lvbiA9IGNvbmNhdCguLi5leHByZXNzaW9uLmV4cHJlc3Npb25zKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiQ29tcGxleFR5cGVcIjpcblx0XHRcdGV4cHJlc3Npb24uYmluZGluZ1BhcmFtZXRlcnMgPSBleHByZXNzaW9uLmJpbmRpbmdQYXJhbWV0ZXJzLm1hcCgoYmluZGluZ1BhcmFtZXRlcikgPT5cblx0XHRcdFx0dHJhbnNmb3JtUmVjdXJzaXZlbHkoYmluZGluZ1BhcmFtZXRlciwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbilcblx0XHRcdCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiSWZFbHNlXCI6XG5cdFx0XHRjb25zdCBvblRydWUgPSB0cmFuc2Zvcm1SZWN1cnNpdmVseShleHByZXNzaW9uLm9uVHJ1ZSwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbik7XG5cdFx0XHRjb25zdCBvbkZhbHNlID0gdHJhbnNmb3JtUmVjdXJzaXZlbHkoZXhwcmVzc2lvbi5vbkZhbHNlLCBleHByZXNzaW9uVHlwZSwgdHJhbnNmb3JtRnVuY3Rpb24sIGluY2x1ZGVBbGxFeHByZXNzaW9uKTtcblx0XHRcdGxldCBjb25kaXRpb24gPSBleHByZXNzaW9uLmNvbmRpdGlvbjtcblx0XHRcdGlmIChpbmNsdWRlQWxsRXhwcmVzc2lvbikge1xuXHRcdFx0XHRjb25kaXRpb24gPSB0cmFuc2Zvcm1SZWN1cnNpdmVseShleHByZXNzaW9uLmNvbmRpdGlvbiwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbik7XG5cdFx0XHR9XG5cdFx0XHRleHByZXNzaW9uID0gaWZFbHNlKGNvbmRpdGlvbiwgb25UcnVlLCBvbkZhbHNlKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD47XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiTm90XCI6XG5cdFx0XHRpZiAoaW5jbHVkZUFsbEV4cHJlc3Npb24pIHtcblx0XHRcdFx0Y29uc3Qgb3BlcmFuZCA9IHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGV4cHJlc3Npb24ub3BlcmFuZCwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbik7XG5cdFx0XHRcdGV4cHJlc3Npb24gPSBub3Qob3BlcmFuZCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+O1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlRydXRoeVwiOlxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlNldFwiOlxuXHRcdFx0aWYgKGluY2x1ZGVBbGxFeHByZXNzaW9uKSB7XG5cdFx0XHRcdGNvbnN0IG9wZXJhbmRzID0gZXhwcmVzc2lvbi5vcGVyYW5kcy5tYXAoKG9wZXJhbmQpID0+XG5cdFx0XHRcdFx0dHJhbnNmb3JtUmVjdXJzaXZlbHkob3BlcmFuZCwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbilcblx0XHRcdFx0KTtcblx0XHRcdFx0ZXhwcmVzc2lvbiA9XG5cdFx0XHRcdFx0ZXhwcmVzc2lvbi5vcGVyYXRvciA9PT0gXCJ8fFwiXG5cdFx0XHRcdFx0XHQ/IChvciguLi5vcGVyYW5kcykgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPFQ+KVxuXHRcdFx0XHRcdFx0OiAoYW5kKC4uLm9wZXJhbmRzKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248VD4pO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkNvbXBhcmlzb25cIjpcblx0XHRcdGlmIChpbmNsdWRlQWxsRXhwcmVzc2lvbikge1xuXHRcdFx0XHRjb25zdCBvcGVyYW5kMSA9IHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGV4cHJlc3Npb24ub3BlcmFuZDEsIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pO1xuXHRcdFx0XHRjb25zdCBvcGVyYW5kMiA9IHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGV4cHJlc3Npb24ub3BlcmFuZDIsIGV4cHJlc3Npb25UeXBlLCB0cmFuc2Zvcm1GdW5jdGlvbiwgaW5jbHVkZUFsbEV4cHJlc3Npb24pO1xuXHRcdFx0XHRleHByZXNzaW9uID0gY29tcGFyaXNvbihleHByZXNzaW9uLm9wZXJhdG9yLCBvcGVyYW5kMSwgb3BlcmFuZDIpIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxUPjtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJDb25zdGFudFwiOlxuXHRcdFx0Y29uc3QgY29uc3RhbnRWYWx1ZTogUmVjb3JkPHN0cmluZywgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHVua25vd24+PiA9IGV4cHJlc3Npb24udmFsdWUgYXMgUmVjb3JkPFxuXHRcdFx0XHRzdHJpbmcsXG5cdFx0XHRcdEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjx1bmtub3duPlxuXHRcdFx0Pjtcblx0XHRcdGlmICh0eXBlb2YgY29uc3RhbnRWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBjb25zdGFudFZhbHVlKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKGNvbnN0YW50VmFsdWUpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0YW50VmFsdWVba2V5XSA9IHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGNvbnN0YW50VmFsdWVba2V5XSwgZXhwcmVzc2lvblR5cGUsIHRyYW5zZm9ybUZ1bmN0aW9uLCBpbmNsdWRlQWxsRXhwcmVzc2lvbik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlJlZlwiOlxuXHRcdGNhc2UgXCJMZW5ndGhcIjpcblx0XHRjYXNlIFwiUGF0aEluTW9kZWxcIjpcblx0XHRjYXNlIFwiRW1iZWRkZWRCaW5kaW5nXCI6XG5cdFx0Y2FzZSBcIkVtYmVkZGVkRXhwcmVzc2lvbkJpbmRpbmdcIjpcblx0XHRjYXNlIFwiVW5yZXNvbHZhYmxlXCI6XG5cdFx0XHQvLyBEbyBub3RoaW5nXG5cdFx0XHRicmVhaztcblx0fVxuXHRpZiAoZXhwcmVzc2lvblR5cGUgPT09IGV4cHJlc3Npb24uX3R5cGUpIHtcblx0XHRleHByZXNzaW9uID0gdHJhbnNmb3JtRnVuY3Rpb24oaW5FeHByZXNzaW9uKTtcblx0fVxuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn1cblxuZXhwb3J0IHR5cGUgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbmNvbnN0IG5lZWRQYXJlbnRoZXNpcyA9IGZ1bmN0aW9uIDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oZXhwcjogRXhwcmVzc2lvbk9yUHJpbWl0aXZlPFQ+KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0IWlzQ29uc3RhbnQoZXhwcikgJiZcblx0XHQhaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24oZXhwcikgJiZcblx0XHRpc0JpbmRpbmdUb29sa2l0RXhwcmVzc2lvbihleHByKSAmJlxuXHRcdGV4cHIuX3R5cGUgIT09IFwiSWZFbHNlXCIgJiZcblx0XHRleHByLl90eXBlICE9PSBcIkZ1bmN0aW9uXCJcblx0KTtcbn07XG5cbi8qKlxuICogQ29tcGlsZXMgYSBjb25zdGFudCBvYmplY3QgdG8gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGV4cHJcbiAqIEBwYXJhbSBpc051bGxhYmxlXG4gKiBAcmV0dXJucyBUaGUgY29tcGlsZWQgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGVDb25zdGFudE9iamVjdChleHByOiBDb25zdGFudEV4cHJlc3Npb248b2JqZWN0PiwgaXNOdWxsYWJsZSA9IGZhbHNlKSB7XG5cdGlmIChpc051bGxhYmxlICYmIE9iamVjdC5rZXlzKGV4cHIudmFsdWUpLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cdGNvbnN0IG9iamVjdHMgPSBleHByLnZhbHVlIGFzIFBsYWluRXhwcmVzc2lvbk9iamVjdDtcblx0Y29uc3QgcHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0T2JqZWN0LmtleXMob2JqZWN0cykuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSBvYmplY3RzW2tleV07XG5cdFx0Y29uc3QgY2hpbGRSZXN1bHQgPSBjb21waWxlRXhwcmVzc2lvbih2YWx1ZSwgdHJ1ZSwgZmFsc2UsIGlzTnVsbGFibGUpO1xuXHRcdGlmIChjaGlsZFJlc3VsdCAmJiBjaGlsZFJlc3VsdC5sZW5ndGggPiAwKSB7XG5cdFx0XHRwcm9wZXJ0aWVzLnB1c2goYCR7a2V5fTogJHtjaGlsZFJlc3VsdH1gKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gYHske3Byb3BlcnRpZXMuam9pbihcIiwgXCIpfX1gO1xufVxuXG4vKipcbiAqIENvbXBpbGVzIGEgQ29uc3RhbnQgQmluZGluZyBFeHByZXNzaW9uLlxuICpcbiAqIEBwYXJhbSBleHByXG4gKiBAcGFyYW0gZW1iZWRkZWRJbkJpbmRpbmdcbiAqIEBwYXJhbSBpc051bGxhYmxlXG4gKiBAcGFyYW0gZG9Ob3RTdHJpbmdpZnlcbiAqIEByZXR1cm5zIFRoZSBjb21waWxlZCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVDb25zdGFudDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdGV4cHI6IENvbnN0YW50RXhwcmVzc2lvbjxUPixcblx0ZW1iZWRkZWRJbkJpbmRpbmc6IGJvb2xlYW4sXG5cdGlzTnVsbGFibGU/OiBib29sZWFuLFxuXHRkb05vdFN0cmluZ2lmeT86IGZhbHNlXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlQ29uc3RhbnQ8VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRleHByOiBDb25zdGFudEV4cHJlc3Npb248VD4sXG5cdGVtYmVkZGVkSW5CaW5kaW5nOiBib29sZWFuLFxuXHRpc051bGxhYmxlPzogYm9vbGVhbixcblx0ZG9Ob3RTdHJpbmdpZnk/OiB0cnVlXG4pOiBhbnk7XG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbnN0YW50PFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0ZXhwcjogQ29uc3RhbnRFeHByZXNzaW9uPFQ+LFxuXHRlbWJlZGRlZEluQmluZGluZzogYm9vbGVhbixcblx0aXNOdWxsYWJsZSA9IGZhbHNlLFxuXHRkb05vdFN0cmluZ2lmeTogYm9vbGVhbiA9IGZhbHNlXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IGFueSB7XG5cdGlmIChleHByLnZhbHVlID09PSBudWxsKSB7XG5cdFx0cmV0dXJuIGRvTm90U3RyaW5naWZ5ID8gbnVsbCA6IFwibnVsbFwiO1xuXHR9XG5cdGlmIChleHByLnZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gZG9Ob3RTdHJpbmdpZnkgPyB1bmRlZmluZWQgOiBcInVuZGVmaW5lZFwiO1xuXHR9XG5cdGlmICh0eXBlb2YgZXhwci52YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGV4cHIudmFsdWUpKSB7XG5cdFx0XHRjb25zdCBlbnRyaWVzID0gZXhwci52YWx1ZS5tYXAoKGV4cHJlc3Npb24pID0+IGNvbXBpbGVFeHByZXNzaW9uKGV4cHJlc3Npb24sIHRydWUpKTtcblx0XHRcdHJldHVybiBgWyR7ZW50cmllcy5qb2luKFwiLCBcIil9XWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb21waWxlQ29uc3RhbnRPYmplY3QoZXhwciBhcyBDb25zdGFudEV4cHJlc3Npb248b2JqZWN0PiwgaXNOdWxsYWJsZSk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKGVtYmVkZGVkSW5CaW5kaW5nKSB7XG5cdFx0c3dpdGNoICh0eXBlb2YgZXhwci52YWx1ZSkge1xuXHRcdFx0Y2FzZSBcIm51bWJlclwiOlxuXHRcdFx0Y2FzZSBcImJpZ2ludFwiOlxuXHRcdFx0Y2FzZSBcImJvb2xlYW5cIjpcblx0XHRcdFx0cmV0dXJuIGV4cHIudmFsdWUudG9TdHJpbmcoKTtcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdFx0cmV0dXJuIGAnJHtlc2NhcGVYbWxBdHRyaWJ1dGUoZXhwci52YWx1ZS50b1N0cmluZygpKX0nYDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZG9Ob3RTdHJpbmdpZnkgPyBleHByLnZhbHVlIDogZXhwci52YWx1ZS50b1N0cmluZygpO1xuXHR9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSBiaW5kaW5nIHN0cmluZyBmb3IgYSBCaW5kaW5nIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb25Gb3JCaW5kaW5nIFRoZSBleHByZXNzaW9uIHRvIGNvbXBpbGVcbiAqIEBwYXJhbSBlbWJlZGRlZEluQmluZGluZyBXaGV0aGVyIHRoZSBleHByZXNzaW9uIHRvIGNvbXBpbGUgaXMgZW1iZWRkZWQgaW50byBhbm90aGVyIGV4cHJlc3Npb25cbiAqIEBwYXJhbSBlbWJlZGRlZFNlcGFyYXRvciBUaGUgYmluZGluZyB2YWx1ZSBldmFsdWF0b3IgKCQgb3IgJSBkZXBlbmRpbmcgb24gd2hldGhlciB3ZSB3YW50IHRvIGZvcmNlIHRoZSB0eXBlIG9yIG5vdClcbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIGV4cHJlc3Npb24gYmluZGluZ1xuICovXG5mdW5jdGlvbiBjb21waWxlUGF0aEluTW9kZWxFeHByZXNzaW9uPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihcblx0ZXhwcmVzc2lvbkZvckJpbmRpbmc6IFBhdGhJbk1vZGVsRXhwcmVzc2lvbjxUPixcblx0ZW1iZWRkZWRJbkJpbmRpbmc6IGJvb2xlYW4sXG5cdGVtYmVkZGVkU2VwYXJhdG9yOiBzdHJpbmdcbikge1xuXHRpZiAoXG5cdFx0ZXhwcmVzc2lvbkZvckJpbmRpbmcudHlwZSB8fFxuXHRcdGV4cHJlc3Npb25Gb3JCaW5kaW5nLnBhcmFtZXRlcnMgfHxcblx0XHRleHByZXNzaW9uRm9yQmluZGluZy50YXJnZXRUeXBlIHx8XG5cdFx0ZXhwcmVzc2lvbkZvckJpbmRpbmcuZm9ybWF0T3B0aW9ucyB8fFxuXHRcdGV4cHJlc3Npb25Gb3JCaW5kaW5nLmNvbnN0cmFpbnRzXG5cdCkge1xuXHRcdC8vIFRoaXMgaXMgbm93IGEgY29tcGxleCBiaW5kaW5nIGRlZmluaXRpb24sIGxldCdzIHByZXBhcmUgZm9yIGl0XG5cdFx0Y29uc3QgY29tcGxleEJpbmRpbmdEZWZpbml0aW9uID0ge1xuXHRcdFx0cGF0aDogY29tcGlsZVBhdGhJbk1vZGVsKGV4cHJlc3Npb25Gb3JCaW5kaW5nKSxcblx0XHRcdHR5cGU6IGV4cHJlc3Npb25Gb3JCaW5kaW5nLnR5cGUsXG5cdFx0XHR0YXJnZXRUeXBlOiBleHByZXNzaW9uRm9yQmluZGluZy50YXJnZXRUeXBlLFxuXHRcdFx0cGFyYW1ldGVyczogZXhwcmVzc2lvbkZvckJpbmRpbmcucGFyYW1ldGVycyxcblx0XHRcdGZvcm1hdE9wdGlvbnM6IGV4cHJlc3Npb25Gb3JCaW5kaW5nLmZvcm1hdE9wdGlvbnMsXG5cdFx0XHRjb25zdHJhaW50czogZXhwcmVzc2lvbkZvckJpbmRpbmcuY29uc3RyYWludHNcblx0XHR9O1xuXHRcdGNvbnN0IG91dEJpbmRpbmcgPSBjb21waWxlRXhwcmVzc2lvbihjb21wbGV4QmluZGluZ0RlZmluaXRpb24sIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0aWYgKGVtYmVkZGVkSW5CaW5kaW5nKSB7XG5cdFx0XHRyZXR1cm4gYCR7ZW1iZWRkZWRTZXBhcmF0b3J9JHtvdXRCaW5kaW5nfWA7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRCaW5kaW5nO1xuXHR9IGVsc2UgaWYgKGVtYmVkZGVkSW5CaW5kaW5nKSB7XG5cdFx0cmV0dXJuIGAke2VtYmVkZGVkU2VwYXJhdG9yfXske2NvbXBpbGVQYXRoSW5Nb2RlbChleHByZXNzaW9uRm9yQmluZGluZyl9fWA7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGB7JHtjb21waWxlUGF0aEluTW9kZWwoZXhwcmVzc2lvbkZvckJpbmRpbmcpfX1gO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVDb21wbGV4VHlwZUV4cHJlc3Npb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KGV4cHJlc3Npb246IENvbXBsZXhUeXBlRXhwcmVzc2lvbjxUPikge1xuXHRpZiAoZXhwcmVzc2lvbi5iaW5kaW5nUGFyYW1ldGVycy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gYHske2NvbXBpbGVQYXRoUGFyYW1ldGVyKGV4cHJlc3Npb24uYmluZGluZ1BhcmFtZXRlcnNbMF0sIHRydWUpfSwgdHlwZTogJyR7ZXhwcmVzc2lvbi50eXBlfSd9YDtcblx0fVxuXG5cdGxldCBvdXRwdXRFbmQgPSBgXSwgdHlwZTogJyR7ZXhwcmVzc2lvbi50eXBlfSdgO1xuXHRpZiAoaGFzRWxlbWVudHMoZXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zKSkge1xuXHRcdG91dHB1dEVuZCArPSBgLCBmb3JtYXRPcHRpb25zOiAke2NvbXBpbGVFeHByZXNzaW9uKGV4cHJlc3Npb24uZm9ybWF0T3B0aW9ucyl9YDtcblx0fVxuXHRpZiAoaGFzRWxlbWVudHMoZXhwcmVzc2lvbi5wYXJhbWV0ZXJzKSkge1xuXHRcdG91dHB1dEVuZCArPSBgLCBwYXJhbWV0ZXJzOiAke2NvbXBpbGVFeHByZXNzaW9uKGV4cHJlc3Npb24ucGFyYW1ldGVycyl9YDtcblx0fVxuXHRvdXRwdXRFbmQgKz0gXCJ9XCI7XG5cblx0cmV0dXJuIGB7bW9kZTonVHdvV2F5JywgcGFydHM6WyR7ZXhwcmVzc2lvbi5iaW5kaW5nUGFyYW1ldGVycy5tYXAoKHBhcmFtOiBhbnkpID0+IGNvbXBpbGVQYXRoUGFyYW1ldGVyKHBhcmFtKSkuam9pbihcIixcIil9JHtvdXRwdXRFbmR9YDtcbn1cblxuLyoqXG4gKiBXcmFwIHRoZSBjb21waWxlZCBiaW5kaW5nIHN0cmluZyBhcyByZXF1aXJlZCBkZXBlbmRpbmcgb24gaXRzIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGV4cHJlc3Npb24gVGhlIGNvbXBpbGVkIGV4cHJlc3Npb25cbiAqIEBwYXJhbSBlbWJlZGRlZEluQmluZGluZyBUcnVlIGlmIHRoZSBjb21waWxlZCBleHByZXNzaW9uIGlzIHRvIGJlIGVtYmVkZGVkIGluIGEgYmluZGluZ1xuICogQHBhcmFtIHBhcmVudGhlc2lzUmVxdWlyZWQgVHJ1ZSBpZiB0aGUgZW1iZWRkZWQgYmluZGluZyBuZWVkcyB0byBiZSB3cmFwcGVkIGluIHBhcmV0aGVzaXMgc28gdGhhdCBpdCBpcyBldmFsdWF0ZWQgYXMgb25lXG4gKiBAcmV0dXJucyBGaW5hbGl6ZWQgY29tcGlsZWQgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcEJpbmRpbmdFeHByZXNzaW9uKFxuXHRleHByZXNzaW9uOiBzdHJpbmcsXG5cdGVtYmVkZGVkSW5CaW5kaW5nOiBib29sZWFuLFxuXHRwYXJlbnRoZXNpc1JlcXVpcmVkID0gZmFsc2Vcbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0aWYgKGVtYmVkZGVkSW5CaW5kaW5nKSB7XG5cdFx0aWYgKHBhcmVudGhlc2lzUmVxdWlyZWQpIHtcblx0XHRcdHJldHVybiBgKCR7ZXhwcmVzc2lvbn0pYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGV4cHJlc3Npb247XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBgez0gJHtleHByZXNzaW9ufX1gO1xuXHR9XG59XG5cbi8qKlxuICogQ29tcGlsZSBhbiBleHByZXNzaW9uIGludG8gYW4gZXhwcmVzc2lvbiBiaW5kaW5nLlxuICpcbiAqIEB0ZW1wbGF0ZSBUIFRoZSB0YXJnZXQgdHlwZVxuICogQHBhcmFtIGV4cHJlc3Npb24gVGhlIGV4cHJlc3Npb24gdG8gY29tcGlsZVxuICogQHBhcmFtIGVtYmVkZGVkSW5CaW5kaW5nIFdoZXRoZXIgdGhlIGV4cHJlc3Npb24gdG8gY29tcGlsZSBpcyBlbWJlZGRlZCBpbnRvIGFub3RoZXIgZXhwcmVzc2lvblxuICogQHBhcmFtIGtlZXBUYXJnZXRUeXBlIEtlZXAgdGhlIHRhcmdldCB0eXBlIG9mIHRoZSBlbWJlZGRlZCBiaW5kaW5ncyBpbnN0ZWFkIG9mIGNhc3RpbmcgdGhlbSB0byBhbnlcbiAqIEBwYXJhbSBpc051bGxhYmxlIFdoZXRoZXIgYmluZGluZyBleHByZXNzaW9uIGNhbiByZXNvbHZlIHRvIGVtcHR5IHN0cmluZyBvciBub3RcbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIGV4cHJlc3Npb24gYmluZGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUV4cHJlc3Npb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KFxuXHRleHByZXNzaW9uOiBFeHByZXNzaW9uT3JQcmltaXRpdmU8VD4sXG5cdGVtYmVkZGVkSW5CaW5kaW5nID0gZmFsc2UsXG5cdGtlZXBUYXJnZXRUeXBlID0gZmFsc2UsXG5cdGlzTnVsbGFibGUgPSBmYWxzZVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRjb25zdCBleHByID0gd3JhcFByaW1pdGl2ZShleHByZXNzaW9uKTtcblx0Y29uc3QgZW1iZWRkZWRTZXBhcmF0b3IgPSBrZWVwVGFyZ2V0VHlwZSA/IFwiJFwiIDogXCIlXCI7XG5cblx0c3dpdGNoIChleHByLl90eXBlKSB7XG5cdFx0Y2FzZSBcIlVucmVzb2x2YWJsZVwiOlxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGNhc2UgXCJDb25zdGFudFwiOlxuXHRcdFx0cmV0dXJuIGNvbXBpbGVDb25zdGFudChleHByLCBlbWJlZGRlZEluQmluZGluZywgaXNOdWxsYWJsZSk7XG5cblx0XHRjYXNlIFwiUmVmXCI6XG5cdFx0XHRyZXR1cm4gZXhwci5yZWYgfHwgXCJudWxsXCI7XG5cblx0XHRjYXNlIFwiRnVuY3Rpb25cIjpcblx0XHRcdGxldCBoYXNFbWJlZGRlZEZ1bmN0aW9uQ2FsbE9yQmluZGluZyA9IGZhbHNlO1xuXHRcdFx0aWYgKGV4cHIuaXNGb3JtYXR0aW5nRm4pIHtcblx0XHRcdFx0dHJhbnNmb3JtUmVjdXJzaXZlbHkoXG5cdFx0XHRcdFx0ZXhwcixcblx0XHRcdFx0XHRcIkZ1bmN0aW9uXCIsXG5cdFx0XHRcdFx0KHN1YkZuKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoc3ViRm4gIT09IGV4cHIgJiYgc3ViRm4ub2JqID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0aGFzRW1iZWRkZWRGdW5jdGlvbkNhbGxPckJpbmRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHN1YkZuO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHR0cmFuc2Zvcm1SZWN1cnNpdmVseShcblx0XHRcdFx0XHRleHByLFxuXHRcdFx0XHRcdFwiQ29uc3RhbnRcIixcblx0XHRcdFx0XHQoc3ViRm4pID0+IHtcblx0XHRcdFx0XHRcdGlmIChzdWJGbiAhPT0gZXhwciAmJiB0eXBlb2Ygc3ViRm4udmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRcdFx0dHJhbnNmb3JtUmVjdXJzaXZlbHkoc3ViRm4sIFwiUGF0aEluTW9kZWxcIiwgKHN1YlN1YkZuKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aGFzRW1iZWRkZWRGdW5jdGlvbkNhbGxPckJpbmRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzdWJTdWJGbjtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBzdWJGbjtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGFyZ3VtZW50U3RyaW5nID0gYCR7ZXhwci5wYXJhbWV0ZXJzLm1hcCgoYXJnKSA9PiBjb21waWxlRXhwcmVzc2lvbihhcmcsIHRydWUpKS5qb2luKFwiLCBcIil9YDtcblx0XHRcdGxldCBmbkNhbGwgPVxuXHRcdFx0XHRleHByLm9iaiA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0PyBgJHtleHByLmZufSgke2FyZ3VtZW50U3RyaW5nfSlgXG5cdFx0XHRcdFx0OiBgJHtjb21waWxlRXhwcmVzc2lvbihleHByLm9iaiwgdHJ1ZSl9LiR7ZXhwci5mbn0oJHthcmd1bWVudFN0cmluZ30pYDtcblx0XHRcdGlmICghZW1iZWRkZWRJbkJpbmRpbmcgJiYgaGFzRW1iZWRkZWRGdW5jdGlvbkNhbGxPckJpbmRpbmcpIHtcblx0XHRcdFx0Zm5DYWxsID0gYHs9ICR7Zm5DYWxsfX1gO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZuQ2FsbDtcblxuXHRcdGNhc2UgXCJFbWJlZGRlZEV4cHJlc3Npb25CaW5kaW5nXCI6XG5cdFx0XHRyZXR1cm4gZW1iZWRkZWRJbkJpbmRpbmcgPyBgKCR7ZXhwci52YWx1ZS5zdWJzdHJpbmcoMiwgZXhwci52YWx1ZS5sZW5ndGggLSAxKX0pYCA6IGAke2V4cHIudmFsdWV9YDtcblxuXHRcdGNhc2UgXCJFbWJlZGRlZEJpbmRpbmdcIjpcblx0XHRcdHJldHVybiBlbWJlZGRlZEluQmluZGluZyA/IGAke2VtYmVkZGVkU2VwYXJhdG9yfSR7ZXhwci52YWx1ZX1gIDogYCR7ZXhwci52YWx1ZX1gO1xuXG5cdFx0Y2FzZSBcIlBhdGhJbk1vZGVsXCI6XG5cdFx0XHRyZXR1cm4gY29tcGlsZVBhdGhJbk1vZGVsRXhwcmVzc2lvbihleHByLCBlbWJlZGRlZEluQmluZGluZywgZW1iZWRkZWRTZXBhcmF0b3IpO1xuXG5cdFx0Y2FzZSBcIkNvbXBhcmlzb25cIjpcblx0XHRcdGNvbnN0IGNvbXBhcmlzb25FeHByZXNzaW9uID0gY29tcGlsZUNvbXBhcmlzb25FeHByZXNzaW9uKGV4cHIpO1xuXHRcdFx0cmV0dXJuIHdyYXBCaW5kaW5nRXhwcmVzc2lvbihjb21wYXJpc29uRXhwcmVzc2lvbiwgZW1iZWRkZWRJbkJpbmRpbmcpO1xuXG5cdFx0Y2FzZSBcIklmRWxzZVwiOlxuXHRcdFx0Y29uc3QgaWZFbHNlRXhwcmVzc2lvbiA9IGAke2NvbXBpbGVFeHByZXNzaW9uKGV4cHIuY29uZGl0aW9uLCB0cnVlKX0gPyAke2NvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRleHByLm9uVHJ1ZSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0a2VlcFRhcmdldFR5cGVcblx0XHRcdCl9IDogJHtjb21waWxlRXhwcmVzc2lvbihleHByLm9uRmFsc2UsIHRydWUsIGtlZXBUYXJnZXRUeXBlKX1gO1xuXHRcdFx0cmV0dXJuIHdyYXBCaW5kaW5nRXhwcmVzc2lvbihpZkVsc2VFeHByZXNzaW9uLCBlbWJlZGRlZEluQmluZGluZywgdHJ1ZSk7XG5cblx0XHRjYXNlIFwiU2V0XCI6XG5cdFx0XHRjb25zdCBzZXRFeHByZXNzaW9uID0gZXhwci5vcGVyYW5kcy5tYXAoKG9wZXJhbmQpID0+IGNvbXBpbGVFeHByZXNzaW9uKG9wZXJhbmQsIHRydWUpKS5qb2luKGAgJHtleHByLm9wZXJhdG9yfSBgKTtcblx0XHRcdHJldHVybiB3cmFwQmluZGluZ0V4cHJlc3Npb24oc2V0RXhwcmVzc2lvbiwgZW1iZWRkZWRJbkJpbmRpbmcsIHRydWUpO1xuXG5cdFx0Y2FzZSBcIkNvbmNhdFwiOlxuXHRcdFx0Y29uc3QgY29uY2F0RXhwcmVzc2lvbiA9IGV4cHIuZXhwcmVzc2lvbnNcblx0XHRcdFx0Lm1hcCgobmVzdGVkRXhwcmVzc2lvbikgPT4gY29tcGlsZUV4cHJlc3Npb24obmVzdGVkRXhwcmVzc2lvbiwgdHJ1ZSwgdHJ1ZSkpXG5cdFx0XHRcdC5qb2luKFwiICsgXCIpO1xuXHRcdFx0cmV0dXJuIHdyYXBCaW5kaW5nRXhwcmVzc2lvbihjb25jYXRFeHByZXNzaW9uLCBlbWJlZGRlZEluQmluZGluZyk7XG5cblx0XHRjYXNlIFwiTGVuZ3RoXCI6XG5cdFx0XHRjb25zdCBsZW5ndGhFeHByZXNzaW9uID0gYCR7Y29tcGlsZUV4cHJlc3Npb24oZXhwci5wYXRoSW5Nb2RlbCwgdHJ1ZSl9Lmxlbmd0aGA7XG5cdFx0XHRyZXR1cm4gd3JhcEJpbmRpbmdFeHByZXNzaW9uKGxlbmd0aEV4cHJlc3Npb24sIGVtYmVkZGVkSW5CaW5kaW5nKTtcblxuXHRcdGNhc2UgXCJOb3RcIjpcblx0XHRcdGNvbnN0IG5vdEV4cHJlc3Npb24gPSBgISR7Y29tcGlsZUV4cHJlc3Npb24oZXhwci5vcGVyYW5kLCB0cnVlKX1gO1xuXHRcdFx0cmV0dXJuIHdyYXBCaW5kaW5nRXhwcmVzc2lvbihub3RFeHByZXNzaW9uLCBlbWJlZGRlZEluQmluZGluZyk7XG5cblx0XHRjYXNlIFwiVHJ1dGh5XCI6XG5cdFx0XHRjb25zdCB0cnV0aHlFeHByZXNzaW9uID0gYCEhJHtjb21waWxlRXhwcmVzc2lvbihleHByLm9wZXJhbmQsIHRydWUpfWA7XG5cdFx0XHRyZXR1cm4gd3JhcEJpbmRpbmdFeHByZXNzaW9uKHRydXRoeUV4cHJlc3Npb24sIGVtYmVkZGVkSW5CaW5kaW5nKTtcblxuXHRcdGNhc2UgXCJGb3JtYXR0ZXJcIjpcblx0XHRcdGNvbnN0IGZvcm1hdHRlckV4cHJlc3Npb24gPSBjb21waWxlRm9ybWF0dGVyRXhwcmVzc2lvbihleHByKTtcblx0XHRcdHJldHVybiBlbWJlZGRlZEluQmluZGluZyA/IGAkJHtmb3JtYXR0ZXJFeHByZXNzaW9ufWAgOiBmb3JtYXR0ZXJFeHByZXNzaW9uO1xuXG5cdFx0Y2FzZSBcIkNvbXBsZXhUeXBlXCI6XG5cdFx0XHRjb25zdCBjb21wbGV4VHlwZUV4cHJlc3Npb24gPSBjb21waWxlQ29tcGxleFR5cGVFeHByZXNzaW9uKGV4cHIpO1xuXHRcdFx0cmV0dXJuIGVtYmVkZGVkSW5CaW5kaW5nID8gYCQke2NvbXBsZXhUeXBlRXhwcmVzc2lvbn1gIDogY29tcGxleFR5cGVFeHByZXNzaW9uO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBcIlwiO1xuXHR9XG59XG5cbi8qKlxuICogQ29tcGlsZSBhIGNvbXBhcmlzb24gZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgY29tcGFyaXNvbiBleHByZXNzaW9uLlxuICogQHJldHVybnMgVGhlIGNvbXBpbGVkIGV4cHJlc3Npb24uIE5lZWRzIHdyYXBwaW5nIGJlZm9yZSBpdCBjYW4gYmUgdXNlZCBhcyBhbiBleHByZXNzaW9uIGJpbmRpbmcuXG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGVDb21wYXJpc29uRXhwcmVzc2lvbihleHByZXNzaW9uOiBDb21wYXJpc29uRXhwcmVzc2lvbikge1xuXHRmdW5jdGlvbiBjb21waWxlT3BlcmFuZChvcGVyYW5kOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55Pikge1xuXHRcdGNvbnN0IGNvbXBpbGVkT3BlcmFuZCA9IGNvbXBpbGVFeHByZXNzaW9uKG9wZXJhbmQsIHRydWUpID8/IFwidW5kZWZpbmVkXCI7XG5cdFx0cmV0dXJuIHdyYXBCaW5kaW5nRXhwcmVzc2lvbihjb21waWxlZE9wZXJhbmQsIHRydWUsIG5lZWRQYXJlbnRoZXNpcyhvcGVyYW5kKSk7XG5cdH1cblxuXHRyZXR1cm4gYCR7Y29tcGlsZU9wZXJhbmQoZXhwcmVzc2lvbi5vcGVyYW5kMSl9ICR7ZXhwcmVzc2lvbi5vcGVyYXRvcn0gJHtjb21waWxlT3BlcmFuZChleHByZXNzaW9uLm9wZXJhbmQyKX1gO1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBmb3JtYXR0ZXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgZm9ybWF0dGVyIGV4cHJlc3Npb24uXG4gKiBAcmV0dXJucyBUaGUgY29tcGlsZWQgZXhwcmVzc2lvbi5cbiAqL1xuZnVuY3Rpb24gY29tcGlsZUZvcm1hdHRlckV4cHJlc3Npb248VCBleHRlbmRzIFByaW1pdGl2ZVR5cGU+KGV4cHJlc3Npb246IEZvcm1hdHRlckV4cHJlc3Npb248VD4pIHtcblx0aWYgKGV4cHJlc3Npb24ucGFyYW1ldGVycy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gYHske2NvbXBpbGVQYXRoUGFyYW1ldGVyKGV4cHJlc3Npb24ucGFyYW1ldGVyc1swXSwgdHJ1ZSl9LCBmb3JtYXR0ZXI6ICcke2V4cHJlc3Npb24uZm59J31gO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IHBhcnRzID0gZXhwcmVzc2lvbi5wYXJhbWV0ZXJzLm1hcCgocGFyYW0pID0+IHtcblx0XHRcdGlmIChwYXJhbS5fdHlwZSA9PT0gXCJDb21wbGV4VHlwZVwiKSB7XG5cdFx0XHRcdHJldHVybiBjb21waWxlQ29tcGxleFR5cGVFeHByZXNzaW9uKHBhcmFtKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb21waWxlUGF0aFBhcmFtZXRlcihwYXJhbSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGB7cGFydHM6IFske3BhcnRzLmpvaW4oXCIsIFwiKX1dLCBmb3JtYXR0ZXI6ICcke2V4cHJlc3Npb24uZm59J31gO1xuXHR9XG59XG5cbi8qKlxuICogQ29tcGlsZSB0aGUgcGF0aCBwYXJhbWV0ZXIgb2YgYSBmb3JtYXR0ZXIgY2FsbC5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgYmluZGluZyBwYXJ0IHRvIGV2YWx1YXRlXG4gKiBAcGFyYW0gc2luZ2xlUGF0aCBXaGV0aGVyIHRoZXJlIGlzIG9uZSBvciBtdWx0aXBsZSBwYXRoIHRvIGNvbnNpZGVyXG4gKiBAcmV0dXJucyBUaGUgc3RyaW5nIHNuaXBwZXQgdG8gaW5jbHVkZSBpbiB0aGUgb3ZlcmFsbCBiaW5kaW5nIGRlZmluaXRpb25cbiAqL1xuZnVuY3Rpb24gY29tcGlsZVBhdGhQYXJhbWV0ZXIoZXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4sIHNpbmdsZVBhdGggPSBmYWxzZSk6IHN0cmluZyB7XG5cdGxldCBvdXRWYWx1ZSA9IFwiXCI7XG5cdGlmIChleHByZXNzaW9uLl90eXBlID09PSBcIkNvbnN0YW50XCIpIHtcblx0XHRpZiAoZXhwcmVzc2lvbi52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBTcGVjaWFsIGNhc2Ugb3RoZXJ3aXNlIHRoZSBKU1Rva2VuaXplciBjb21wbGFpbnMgYWJvdXQgaW5jb3JyZWN0IGNvbnRlbnRcblx0XHRcdG91dFZhbHVlID0gYHZhbHVlOiAndW5kZWZpbmVkJ2A7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG91dFZhbHVlID0gYHZhbHVlOiAke2NvbXBpbGVDb25zdGFudChleHByZXNzaW9uLCB0cnVlKX1gO1xuXHRcdH1cblx0fSBlbHNlIGlmIChleHByZXNzaW9uLl90eXBlID09PSBcIlBhdGhJbk1vZGVsXCIpIHtcblx0XHRvdXRWYWx1ZSA9IGBwYXRoOiAnJHtjb21waWxlUGF0aEluTW9kZWwoZXhwcmVzc2lvbil9J2A7XG5cblx0XHRvdXRWYWx1ZSArPSBleHByZXNzaW9uLnR5cGUgPyBgLCB0eXBlOiAnJHtleHByZXNzaW9uLnR5cGV9J2AgOiBgLCB0YXJnZXRUeXBlOiAnYW55J2A7XG5cdFx0aWYgKGhhc0VsZW1lbnRzKGV4cHJlc3Npb24ubW9kZSkpIHtcblx0XHRcdG91dFZhbHVlICs9IGAsIG1vZGU6ICcke2NvbXBpbGVFeHByZXNzaW9uKGV4cHJlc3Npb24ubW9kZSl9J2A7XG5cdFx0fVxuXHRcdGlmIChoYXNFbGVtZW50cyhleHByZXNzaW9uLmNvbnN0cmFpbnRzKSkge1xuXHRcdFx0b3V0VmFsdWUgKz0gYCwgY29uc3RyYWludHM6ICR7Y29tcGlsZUV4cHJlc3Npb24oZXhwcmVzc2lvbi5jb25zdHJhaW50cyl9YDtcblx0XHR9XG5cdFx0aWYgKGhhc0VsZW1lbnRzKGV4cHJlc3Npb24uZm9ybWF0T3B0aW9ucykpIHtcblx0XHRcdG91dFZhbHVlICs9IGAsIGZvcm1hdE9wdGlvbnM6ICR7Y29tcGlsZUV4cHJlc3Npb24oZXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zKX1gO1xuXHRcdH1cblx0XHRpZiAoaGFzRWxlbWVudHMoZXhwcmVzc2lvbi5wYXJhbWV0ZXJzKSkge1xuXHRcdFx0b3V0VmFsdWUgKz0gYCwgcGFyYW1ldGVyczogJHtjb21waWxlRXhwcmVzc2lvbihleHByZXNzaW9uLnBhcmFtZXRlcnMpfWA7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cdHJldHVybiBzaW5nbGVQYXRoID8gb3V0VmFsdWUgOiBgeyR7b3V0VmFsdWV9fWA7XG59XG5cbmZ1bmN0aW9uIGhhc0VsZW1lbnRzKG9iajogYW55KSB7XG5cdHJldHVybiBvYmogJiYgT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPiAwO1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBiaW5kaW5nIGV4cHJlc3Npb24gcGF0aC5cbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBUaGUgZXhwcmVzc2lvbiB0byBjb21waWxlLlxuICogQHJldHVybnMgVGhlIGNvbXBpbGVkIHBhdGguXG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGVQYXRoSW5Nb2RlbDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oZXhwcmVzc2lvbjogUGF0aEluTW9kZWxFeHByZXNzaW9uPFQ+KSB7XG5cdHJldHVybiBgJHtleHByZXNzaW9uLm1vZGVsTmFtZSA/IGAke2V4cHJlc3Npb24ubW9kZWxOYW1lfT5gIDogXCJcIn0ke2V4cHJlc3Npb24ucGF0aH1gO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBNktPLE1BQU1BLGdCQUFxQyxHQUFHO0lBQ3BELGFBQWEsRUFBRTtNQUFFQyxJQUFJLEVBQUU7SUFBa0MsQ0FBQztJQUMxRCxVQUFVLEVBQUU7TUFBRUEsSUFBSSxFQUFFO0lBQStCLENBQUM7SUFDcEQsVUFBVSxFQUFFO01BQUVBLElBQUksRUFBRTtJQUErQixDQUFDO0lBQ3BELG9CQUFvQixFQUFFO01BQ3JCQyxXQUFXLEVBQUU7UUFDWkMsVUFBVSxFQUFFLFdBQVc7UUFDdkJDLEdBQUcsRUFBRTtNQUNOLENBQUM7TUFDREgs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