/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
 sap.ui.define([], function() {
 	var AnnotationConverter;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 175:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convert = void 0;
const VocabularyReferences_1 = __webpack_require__(899);
const utils_1 = __webpack_require__(168);
/**
 * Symbol to extend an annotation with the reference to its target.
 */
const ANNOTATION_TARGET = Symbol('Annotation Target');
/**
 * Append an object to the list of visited objects if it is different from the last object in the list.
 *
 * @param objectPath    The list of visited objects
 * @param visitedObject The object
 * @returns The list of visited objects
 */
function appendObjectPath(objectPath, visitedObject) {
    if (objectPath[objectPath.length - 1] !== visitedObject) {
        objectPath.push(visitedObject);
    }
    return objectPath;
}
/**
 * Resolves a (possibly relative) path.
 *
 * @param converter         Converter
 * @param startElement      The starting point in case of relative path resolution
 * @param path              The path to resolve
 * @param annotationsTerm   Only for error reporting: The annotation term
 * @returns An object containing the resolved target and the elements that were visited while getting to the target.
 */
function resolveTarget(converter, startElement, path, annotationsTerm) {
    var _a, _b, _c, _d;
    // absolute paths always start at the entity container
    if (path.startsWith('/')) {
        path = path.substring(1);
        startElement = undefined; // will resolve to the entity container (see below)
    }
    const pathSegments = path.split('/').reduce((targetPath, segment) => {
        if (segment.includes('@')) {
            // Separate out the annotation
            const [pathPart, annotationPart] = (0, utils_1.splitAtFirst)(segment, '@');
            targetPath.push(pathPart);
            targetPath.push(`@${annotationPart}`);
        }
        else {
            targetPath.push(segment);
        }
        return targetPath;
    }, []);
    // determine the starting point for the resolution
    if (startElement === undefined) {
        // no starting point given: start at the entity container
        if (pathSegments[0].startsWith(`${converter.rawSchema.namespace}.`) &&
            pathSegments[0] !== ((_a = converter.getConvertedEntityContainer()) === null || _a === void 0 ? void 0 : _a.fullyQualifiedName)) {
            // We have a fully qualified name in the path that is not the entity container.
            startElement =
                (_c = (_b = converter.getConvertedEntityType(pathSegments[0])) !== null && _b !== void 0 ? _b : converter.getConvertedComplexType(pathSegments[0])) !== null && _c !== void 0 ? _c : converter.getConvertedAction(pathSegments[0]);
            pathSegments.shift(); // Let's remove the first path element
        }
        else {
            startElement = converter.getConvertedEntityContainer();
        }
    }
    else if (startElement[ANNOTATION_TARGET] !== undefined) {
        // annotation: start at the annotation target
        startElement = startElement[ANNOTATION_TARGET];
    }
    else if (startElement._type === 'Property') {
        // property: start at the entity type or complex type the property belongs to
        const parentElementFQN = (0, utils_1.substringBeforeFirst)(startElement.fullyQualifiedName, '/');
        startElement =
            (_d = converter.getConvertedEntityType(parentElementFQN)) !== null && _d !== void 0 ? _d : converter.getConvertedComplexType(parentElementFQN);
    }
    const result = pathSegments.reduce((current, segment) => {
        var _a, _b, _c, _d, _e;
        const error = (message) => {
            current.messages.push({ message });
            current.target = undefined;
            return current;
        };
        if (current.target === undefined) {
            return current;
        }
        current.objectPath = appendObjectPath(current.objectPath, current.target);
        // Annotation
        if (segment.startsWith('@') && segment !== '@$ui5.overload') {
            const [vocabularyAlias, term] = converter.splitTerm(segment);
            const annotation = (_a = current.target.annotations[vocabularyAlias.substring(1)]) === null || _a === void 0 ? void 0 : _a[term];
            if (annotation !== undefined) {
                current.target = annotation;
                return current;
            }
            return error(`Annotation '${segment.substring(1)}' not found on ${current.target._type} '${current.target.fullyQualifiedName}'`);
        }
        // $Path / $AnnotationPath syntax
        if (current.target.$target) {
            let subPath;
            if (segment === '$AnnotationPath') {
                subPath = current.target.value;
            }
            else if (segment === '$Path') {
                subPath = current.target.path;
            }
            if (subPath !== undefined) {
                const subTarget = resolveTarget(converter, current.target[ANNOTATION_TARGET], subPath);
                subTarget.objectPath.forEach((visitedSubObject) => {
                    if (!current.objectPath.includes(visitedSubObject)) {
                        current.objectPath = appendObjectPath(current.objectPath, visitedSubObject);
                    }
                });
                current.target = subTarget.target;
                current.objectPath = appendObjectPath(current.objectPath, current.target);
                return current;
            }
        }
        // traverse based on the element type
        switch ((_b = current.target) === null || _b === void 0 ? void 0 : _b._type) {
            case 'Schema':
                // next element: EntityType, ComplexType, Action, EntityContainer ?
                break;
            case 'EntityContainer':
                {
                    const thisElement = current.target;
                    if (segment === '' || converter.unalias(segment) === thisElement.fullyQualifiedName) {
                        return current;
                    }
                    // next element: EntitySet, Singleton or ActionImport?
                    const nextElement = (_d = (_c = thisElement.entitySets.by_name(segment)) !== null && _c !== void 0 ? _c : thisElement.singletons.by_name(segment)) !== null && _d !== void 0 ? _d : thisElement.actionImports.by_name(segment);
                    if (nextElement) {
                        current.target = nextElement;
                        return current;
                    }
                }
                break;
            case 'EntitySet':
            case 'Singleton': {
                const thisElement = current.target;
                if (segment === '' || segment === '$Type') {
                    // Empty Path after an EntitySet or Singleton means EntityType
                    current.target = thisElement.entityType;
                    return current;
                }
                if (segment === '$') {
                    return current;
                }
                if (segment === '$NavigationPropertyBinding') {
                    const navigationPropertyBindings = thisElement.navigationPropertyBinding;
                    current.target = navigationPropertyBindings;
                    return current;
                }
                // continue resolving at the EntitySet's or Singleton's type
                const result = resolveTarget(converter, thisElement.entityType, segment);
                current.target = result.target;
                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                return current;
            }
            case 'EntityType':
                {
                    const thisElement = current.target;
                    if (segment === '' || segment === '$Type') {
                        return current;
                    }
                    const property = thisElement.entityProperties.by_name(segment);
                    if (property) {
                        current.target = property;
                        return current;
                    }
                    const navigationProperty = thisElement.navigationProperties.by_name(segment);
                    if (navigationProperty) {
                        current.target = navigationProperty;
                        return current;
                    }
                    const actionName = (0, utils_1.substringBeforeFirst)(converter.unalias(segment), '(');
                    const action = thisElement.actions[actionName];
                    if (action) {
                        current.target = action;
                        return current;
                    }
                }
                break;
            case 'ActionImport': {
                // continue resolving at the Action
                const result = resolveTarget(converter, current.target.action, segment);
                current.target = result.target;
                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                return current;
            }
            case 'Action': {
                const thisElement = current.target;
                if (segment === '') {
                    return current;
                }
                if (segment === '@$ui5.overload' || segment === '0') {
                    return current;
                }
                if (segment === '$Parameter' && thisElement.isBound) {
                    current.target = thisElement.parameters;
                    return current;
                }
                const nextElement = (_e = thisElement.parameters[segment]) !== null && _e !== void 0 ? _e : thisElement.parameters.find((param) => param.name === segment);
                if (nextElement) {
                    current.target = nextElement;
                    return current;
                }
                break;
            }
            case 'Property':
                {
                    const thisElement = current.target;
                    // Property or NavigationProperty of the ComplexType
                    const type = thisElement.targetType;
                    if (type !== undefined) {
                        const property = type.properties.by_name(segment);
                        if (property) {
                            current.target = property;
                            return current;
                        }
                        const navigationProperty = type.navigationProperties.by_name(segment);
                        if (navigationProperty) {
                            current.target = navigationProperty;
                            return current;
                        }
                    }
                }
                break;
            case 'ActionParameter':
                const referencedType = current.target.typeReference;
                if (referencedType !== undefined) {
                    const result = resolveTarget(converter, referencedType, segment);
                    current.target = result.target;
                    current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                    return current;
                }
                break;
            case 'NavigationProperty':
                // continue at the NavigationProperty's target type
                const result = resolveTarget(converter, current.target.targetType, segment);
                current.target = result.target;
                current.objectPath = result.objectPath.reduce(appendObjectPath, current.objectPath);
                return current;
            default:
                if (segment === '') {
                    return current;
                }
                if (current.target[segment]) {
                    current.target = current.target[segment];
                    current.objectPath = appendObjectPath(current.objectPath, current.target);
                    return current;
                }
        }
        return error(`Element '${segment}' not found at ${current.target._type} '${current.target.fullyQualifiedName}'`);
    }, { target: startElement, objectPath: [], messages: [] });
    // Diagnostics
    result.messages.forEach((message) => converter.logError(message.message));
    if (!result.target) {
        if (annotationsTerm) {
            const annotationType = inferTypeFromTerm(converter, annotationsTerm, startElement.fullyQualifiedName);
            converter.logError('Unable to resolve the path expression: ' +
                '\n' +
                path +
                '\n' +
                '\n' +
                'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                '<Annotation Term = ' +
                annotationsTerm +
                '>' +
                '\n' +
                '<Record Type = ' +
                annotationType +
                '>' +
                '\n' +
                '<AnnotationPath = ' +
                path +
                '>');
        }
        else {
            converter.logError('Unable to resolve the path expression: ' +
                path +
                '\n' +
                '\n' +
                'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                '<Annotation Term = ' +
                pathSegments[0] +
                '>' +
                '\n' +
                '<PropertyValue  Path= ' +
                pathSegments[1] +
                '>');
        }
    }
    return result;
}
/**
 * Typeguard to check if the path contains an annotation.
 *
 * @param pathStr the path to evaluate
 * @returns true if there is an annotation in the path.
 */
function isAnnotationPath(pathStr) {
    return pathStr.includes('@');
}
function parseValue(converter, currentTarget, currentTerm, currentProperty, currentSource, propertyValue, valueFQN) {
    if (propertyValue === undefined) {
        return undefined;
    }
    switch (propertyValue.type) {
        case 'String':
            return propertyValue.String;
        case 'Int':
            return propertyValue.Int;
        case 'Bool':
            return propertyValue.Bool;
        case 'Decimal':
            return (0, utils_1.Decimal)(propertyValue.Decimal);
        case 'Date':
            return propertyValue.Date;
        case 'EnumMember':
            const splitEnum = propertyValue.EnumMember.split(' ').map((enumValue) => {
                var _a;
                const unaliased = (_a = converter.unalias(enumValue)) !== null && _a !== void 0 ? _a : '';
                return (0, utils_1.alias)(VocabularyReferences_1.VocabularyReferences, unaliased);
            });
            if (splitEnum[0] !== undefined && utils_1.EnumIsFlag[(0, utils_1.substringBeforeFirst)(splitEnum[0], '/')]) {
                return splitEnum;
            }
            return splitEnum[0];
        case 'PropertyPath':
            return {
                type: 'PropertyPath',
                value: propertyValue.PropertyPath,
                fullyQualifiedName: valueFQN,
                $target: resolveTarget(converter, currentTarget, propertyValue.PropertyPath, currentTerm).target,
                [ANNOTATION_TARGET]: currentTarget
            };
        case 'NavigationPropertyPath':
            return {
                type: 'NavigationPropertyPath',
                value: propertyValue.NavigationPropertyPath,
                fullyQualifiedName: valueFQN,
                $target: resolveTarget(converter, currentTarget, propertyValue.NavigationPropertyPath, currentTerm)
                    .target,
                [ANNOTATION_TARGET]: currentTarget
            };
        case 'AnnotationPath':
            return {
                type: 'AnnotationPath',
                value: propertyValue.AnnotationPath,
                fullyQualifiedName: valueFQN,
                $target: resolveTarget(converter, currentTarget, converter.unalias(propertyValue.AnnotationPath), currentTerm).target,
                annotationsTerm: currentTerm,
                term: '',
                path: '',
                [ANNOTATION_TARGET]: currentTarget
            };
        case 'Path':
            const $target = resolveTarget(converter, currentTarget, propertyValue.Path, currentTerm).target;
            if (isAnnotationPath(propertyValue.Path)) {
                // inline the target
                return $target;
            }
            else {
                return {
                    type: 'Path',
                    path: propertyValue.Path,
                    fullyQualifiedName: valueFQN,
                    $target: $target,
                    [ANNOTATION_TARGET]: currentTarget
                };
            }
        case 'Record':
            return parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, propertyValue.Record, valueFQN);
        case 'Collection':
            return parseCollection(converter, currentTarget, currentTerm, currentProperty, currentSource, propertyValue.Collection, valueFQN);
        case 'Apply':
        case 'Null':
        case 'Not':
        case 'Eq':
        case 'Ne':
        case 'Gt':
        case 'Ge':
        case 'Lt':
        case 'Le':
        case 'If':
        case 'And':
        case 'Or':
        default:
            return propertyValue;
    }
}
/**
 * Infer the type of a term based on its type.
 *
 * @param converter         Converter
 * @param annotationsTerm   The annotation term
 * @param annotationTarget  The annotation target
 * @param currentProperty   The current property of the record
 * @returns The inferred type.
 */
function inferTypeFromTerm(converter, annotationsTerm, annotationTarget, currentProperty) {
    let targetType = utils_1.TermToTypes[annotationsTerm];
    if (currentProperty) {
        annotationsTerm = `${(0, utils_1.substringBeforeLast)(annotationsTerm, '.')}.${currentProperty}`;
        targetType = utils_1.TermToTypes[annotationsTerm];
    }
    converter.logError(`The type of the record used within the term ${annotationsTerm} was not defined and was inferred as ${targetType}.
Hint: If possible, try to maintain the Type property for each Record.
<Annotations Target="${annotationTarget}">
	<Annotation Term="${annotationsTerm}">
		<Record>...</Record>
	</Annotation>
</Annotations>`);
    return targetType;
}
function isDataFieldWithForAction(annotationContent) {
    return (annotationContent.hasOwnProperty('Action') &&
        (annotationContent.$Type === 'com.sap.vocabularies.UI.v1.DataFieldForAction' ||
            annotationContent.$Type === 'com.sap.vocabularies.UI.v1.DataFieldWithAction'));
}
function parseRecordType(converter, currentTerm, currentTarget, currentProperty, recordDefinition) {
    let targetType;
    if (!recordDefinition.type && currentTerm) {
        targetType = inferTypeFromTerm(converter, currentTerm, currentTarget.fullyQualifiedName, currentProperty);
    }
    else {
        targetType = converter.unalias(recordDefinition.type);
    }
    return targetType;
}
function parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, annotationRecord, currentFQN) {
    const record = {
        $Type: parseRecordType(converter, currentTerm, currentTarget, currentProperty, annotationRecord),
        fullyQualifiedName: currentFQN,
        [ANNOTATION_TARGET]: currentTarget,
        __source: currentSource
    };
    for (const propertyValue of annotationRecord.propertyValues) {
        (0, utils_1.lazy)(record, propertyValue.name, () => parseValue(converter, currentTarget, currentTerm, propertyValue.name, currentSource, propertyValue.value, `${currentFQN}/${propertyValue.name}`));
    }
    // annotations on the record
    (0, utils_1.lazy)(record, 'annotations', resolveAnnotationsOnAnnotation(converter, annotationRecord, record));
    if (isDataFieldWithForAction(record)) {
        (0, utils_1.lazy)(record, 'ActionTarget', () => {
            var _a, _b, _c;
            const actionTargetFQN = converter.unalias((_a = record.Action) === null || _a === void 0 ? void 0 : _a.toString());
            // (1) Bound action of the annotation target?
            let actionTarget = (_b = currentTarget.actions) === null || _b === void 0 ? void 0 : _b[actionTargetFQN];
            if (!actionTarget) {
                // (2) ActionImport (= unbound action)?
                actionTarget = (_c = converter.getConvertedActionImport(actionTargetFQN)) === null || _c === void 0 ? void 0 : _c.action;
            }
            if (!actionTarget) {
                // (3) Bound action of a different EntityType
                actionTarget = converter.getConvertedAction(actionTargetFQN);
                if (!(actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.isBound)) {
                    actionTarget = undefined;
                }
            }
            if (!actionTarget) {
                converter.logError(`${record.fullyQualifiedName}: Unable to resolve '${record.Action}' ('${actionTargetFQN}')`);
            }
            return actionTarget;
        });
    }
    return record;
}
/**
 * Retrieve or infer the collection type based on its content.
 *
 * @param collectionDefinition
 * @returns the type of the collection
 */
function getOrInferCollectionType(collectionDefinition) {
    let type = collectionDefinition.type;
    if (type === undefined && collectionDefinition.length > 0) {
        const firstColItem = collectionDefinition[0];
        if (firstColItem.hasOwnProperty('PropertyPath')) {
            type = 'PropertyPath';
        }
        else if (firstColItem.hasOwnProperty('Path')) {
            type = 'Path';
        }
        else if (firstColItem.hasOwnProperty('AnnotationPath')) {
            type = 'AnnotationPath';
        }
        else if (firstColItem.hasOwnProperty('NavigationPropertyPath')) {
            type = 'NavigationPropertyPath';
        }
        else if (typeof firstColItem === 'object' &&
            (firstColItem.hasOwnProperty('type') || firstColItem.hasOwnProperty('propertyValues'))) {
            type = 'Record';
        }
        else if (typeof firstColItem === 'string') {
            type = 'String';
        }
    }
    else if (type === undefined) {
        type = 'EmptyCollection';
    }
    return type;
}
function parseCollection(converter, currentTarget, currentTerm, currentProperty, currentSource, collectionDefinition, parentFQN) {
    const collectionDefinitionType = getOrInferCollectionType(collectionDefinition);
    switch (collectionDefinitionType) {
        case 'PropertyPath':
            return collectionDefinition.map((propertyPath, propertyIdx) => {
                const result = {
                    type: 'PropertyPath',
                    value: propertyPath.PropertyPath,
                    fullyQualifiedName: `${parentFQN}/${propertyIdx}`
                };
                (0, utils_1.lazy)(result, '$target', () => {
                    var _a;
                    return (_a = resolveTarget(converter, currentTarget, propertyPath.PropertyPath, currentTerm)
                        .target) !== null && _a !== void 0 ? _a : {};
                } // TODO: $target is mandatory - throw an error?
                );
                return result;
            });
        case 'Path':
            // TODO: make lazy?
            return collectionDefinition.map((pathValue) => {
                return resolveTarget(converter, currentTarget, pathValue.Path, currentTerm).target;
            });
        case 'AnnotationPath':
            return collectionDefinition.map((annotationPath, annotationIdx) => {
                const result = {
                    type: 'AnnotationPath',
                    value: annotationPath.AnnotationPath,
                    fullyQualifiedName: `${parentFQN}/${annotationIdx}`,
                    annotationsTerm: currentTerm,
                    term: '',
                    path: ''
                };
                (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, annotationPath.AnnotationPath, currentTerm).target);
                return result;
            });
        case 'NavigationPropertyPath':
            return collectionDefinition.map((navPropertyPath, navPropIdx) => {
                var _a;
                const navigationPropertyPath = (_a = navPropertyPath.NavigationPropertyPath) !== null && _a !== void 0 ? _a : '';
                const result = {
                    type: 'NavigationPropertyPath',
                    value: navigationPropertyPath,
                    fullyQualifiedName: `${parentFQN}/${navPropIdx}`
                };
                if (navigationPropertyPath === '') {
                    result.$target = undefined;
                }
                else {
                    (0, utils_1.lazy)(result, '$target', () => resolveTarget(converter, currentTarget, navigationPropertyPath, currentTerm).target);
                }
                return result;
            });
        case 'Record':
            return collectionDefinition.map((recordDefinition, recordIdx) => {
                return parseRecord(converter, currentTerm, currentTarget, currentProperty, currentSource, recordDefinition, `${parentFQN}/${recordIdx}`);
            });
        case 'Apply':
        case 'Null':
        case 'If':
        case 'Eq':
        case 'Ne':
        case 'Lt':
        case 'Gt':
        case 'Le':
        case 'Ge':
        case 'Not':
        case 'And':
        case 'Or':
            return collectionDefinition.map((ifValue) => ifValue);
        case 'String':
            return collectionDefinition.map((stringValue) => {
                if (typeof stringValue === 'string' || stringValue === undefined) {
                    return stringValue;
                }
                else {
                    return stringValue.String;
                }
            });
        default:
            if (collectionDefinition.length === 0) {
                return [];
            }
            throw new Error('Unsupported case');
    }
}
function isV4NavigationProperty(navProp) {
    return !!navProp.targetTypeName;
}
function convertAnnotation(converter, target, rawAnnotation) {
    var _a;
    let annotation;
    if (rawAnnotation.record) {
        annotation = parseRecord(converter, rawAnnotation.term, target, '', rawAnnotation.__source, rawAnnotation.record, rawAnnotation.fullyQualifiedName);
    }
    else if (rawAnnotation.collection === undefined) {
        annotation = parseValue(converter, target, rawAnnotation.term, '', rawAnnotation.__source, (_a = rawAnnotation.value) !== null && _a !== void 0 ? _a : { type: 'Bool', Bool: true }, rawAnnotation.fullyQualifiedName);
    }
    else if (rawAnnotation.collection) {
        annotation = parseCollection(converter, target, rawAnnotation.term, '', rawAnnotation.__source, rawAnnotation.collection, rawAnnotation.fullyQualifiedName);
    }
    else {
        throw new Error('Unsupported case');
    }
    switch (typeof annotation) {
        case 'string':
            // eslint-disable-next-line no-new-wrappers
            annotation = new String(annotation);
            break;
        case 'boolean':
            // eslint-disable-next-line no-new-wrappers
            annotation = new Boolean(annotation);
            break;
        case 'number':
            annotation = new Number(annotation);
            break;
        default:
            // do nothing
            break;
    }
    annotation.fullyQualifiedName = rawAnnotation.fullyQualifiedName;
    annotation[ANNOTATION_TARGET] = target;
    const [vocAlias, vocTerm] = converter.splitTerm(rawAnnotation.term);
    annotation.term = converter.unalias(`${vocAlias}.${vocTerm}`, VocabularyReferences_1.VocabularyReferences);
    annotation.qualifier = rawAnnotation.qualifier;
    annotation.__source = rawAnnotation.__source;
    try {
        (0, utils_1.lazy)(annotation, 'annotations', resolveAnnotationsOnAnnotation(converter, rawAnnotation, annotation));
    }
    catch (e) {
        // not an error: parseRecord() already adds annotations, but the other parseXXX functions don't, so this can happen
    }
    return annotation;
}
/**
 * Merge annotation from different source together by overwriting at the term level.
 *
 * @param converter
 * @returns the resulting merged annotations
 */
function mergeAnnotations(converter) {
    return Object.keys(converter.rawSchema.annotations).reduceRight((annotationsPerTarget, annotationSource) => {
        for (const { target, annotations: rawAnnotations } of converter.rawSchema.annotations[annotationSource]) {
            if (!annotationsPerTarget[target]) {
                annotationsPerTarget[target] = [];
            }
            annotationsPerTarget[target].push(...rawAnnotations
                .filter((rawAnnotation) => !annotationsPerTarget[target].some((existingAnnotation) => existingAnnotation.term === rawAnnotation.term &&
                existingAnnotation.qualifier === rawAnnotation.qualifier))
                .map((rawAnnotation) => {
                let annotationFQN = `${target}@${converter.unalias(rawAnnotation.term)}`;
                if (rawAnnotation.qualifier) {
                    annotationFQN = `${annotationFQN}#${rawAnnotation.qualifier}`;
                }
                const annotation = rawAnnotation;
                annotation.fullyQualifiedName = annotationFQN;
                annotation.__source = annotationSource;
                return annotation;
            }));
        }
        return annotationsPerTarget;
    }, {});
}
class Converter {
    /**
     * Get preprocessed annotations on the specified target.
     *
     * @param target    The annotation target
     * @returns An array of annotations
     */
    getAnnotations(target) {
        var _a;
        if (this.annotationsByTarget === undefined) {
            this.annotationsByTarget = mergeAnnotations(this);
        }
        return (_a = this.annotationsByTarget[target]) !== null && _a !== void 0 ? _a : [];
    }
    getConvertedEntityContainer() {
        return this.getConvertedElement(this.rawMetadata.schema.entityContainer.fullyQualifiedName, this.rawMetadata.schema.entityContainer, convertEntityContainer);
    }
    getConvertedEntitySet(fullyQualifiedName) {
        return this.convertedOutput.entitySets.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedSingleton(fullyQualifiedName) {
        return this.convertedOutput.singletons.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedEntityType(fullyQualifiedName) {
        return this.convertedOutput.entityTypes.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedComplexType(fullyQualifiedName) {
        return this.convertedOutput.complexTypes.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedTypeDefinition(fullyQualifiedName) {
        return this.convertedOutput.typeDefinitions.by_fullyQualifiedName(fullyQualifiedName);
    }
    getConvertedActionImport(fullyQualifiedName) {
        let actionImport = this.convertedOutput.actionImports.by_fullyQualifiedName(fullyQualifiedName);
        if (!actionImport) {
            actionImport = this.convertedOutput.actionImports.by_name(fullyQualifiedName);
        }
        return actionImport;
    }
    getConvertedAction(fullyQualifiedName) {
        return this.convertedOutput.actions.by_fullyQualifiedName(fullyQualifiedName);
    }
    convert(rawValue, map) {
        if (Array.isArray(rawValue)) {
            return () => {
                const converted = rawValue.reduce((convertedElements, rawElement) => {
                    const convertedElement = this.getConvertedElement(rawElement.fullyQualifiedName, rawElement, map);
                    if (convertedElement) {
                        convertedElements.push(convertedElement);
                    }
                    return convertedElements;
                }, []);
                (0, utils_1.addGetByValue)(converted, 'name');
                (0, utils_1.addGetByValue)(converted, 'fullyQualifiedName');
                return converted;
            };
        }
        else {
            return () => this.getConvertedElement(rawValue.fullyQualifiedName, rawValue, map);
        }
    }
    constructor(rawMetadata, convertedOutput) {
        this.convertedElements = new Map();
        this.rawMetadata = rawMetadata;
        this.rawSchema = rawMetadata.schema;
        this.convertedOutput = convertedOutput;
    }
    getConvertedElement(fullyQualifiedName, rawElement, map) {
        let converted = this.convertedElements.get(fullyQualifiedName);
        if (converted === undefined) {
            const rawMetadata = typeof rawElement === 'function' ? rawElement.apply(undefined, [fullyQualifiedName]) : rawElement;
            if (rawMetadata !== undefined) {
                converted = map.apply(undefined, [this, rawMetadata]);
                this.convertedElements.set(fullyQualifiedName, converted);
            }
        }
        return converted;
    }
    logError(message) {
        this.convertedOutput.diagnostics.push({ message });
    }
    /**
     * Split the alias from the term value.
     *
     * @param term the value of the term
     * @returns the term alias and the actual term value
     */
    splitTerm(term) {
        const aliased = (0, utils_1.alias)(VocabularyReferences_1.VocabularyReferences, term);
        return (0, utils_1.splitAtLast)(aliased, '.');
    }
    unalias(value, references = this.rawMetadata.references) {
        var _a;
        return (_a = (0, utils_1.unalias)(references, value, this.rawSchema.namespace)) !== null && _a !== void 0 ? _a : '';
    }
}
function resolveEntityType(converter, fullyQualifiedName) {
    return () => {
        let entityType = converter.getConvertedEntityType(fullyQualifiedName);
        if (!entityType) {
            converter.logError(`EntityType '${fullyQualifiedName}' not found`);
            entityType = {};
        }
        return entityType;
    };
}
function resolveNavigationPropertyBindings(converter, rawNavigationPropertyBindings, rawElement) {
    return () => Object.keys(rawNavigationPropertyBindings).reduce((navigationPropertyBindings, bindingName) => {
        const rawBindingTarget = rawNavigationPropertyBindings[bindingName];
        (0, utils_1.lazy)(navigationPropertyBindings, bindingName, () => {
            let resolvedBindingTarget;
            if (rawBindingTarget._type === 'Singleton') {
                resolvedBindingTarget = converter.getConvertedSingleton(rawBindingTarget.fullyQualifiedName);
            }
            else {
                resolvedBindingTarget = converter.getConvertedEntitySet(rawBindingTarget.fullyQualifiedName);
            }
            if (!resolvedBindingTarget) {
                converter.logError(`${rawElement._type} '${rawElement.fullyQualifiedName}': Failed to resolve NavigationPropertyBinding ${bindingName}`);
                resolvedBindingTarget = {};
            }
            return resolvedBindingTarget;
        });
        return navigationPropertyBindings;
    }, {});
}
function resolveAnnotations(converter, rawAnnotationTarget) {
    const nestedAnnotations = rawAnnotationTarget.annotations;
    return () => createAnnotationsObject(converter, rawAnnotationTarget, nestedAnnotations !== null && nestedAnnotations !== void 0 ? nestedAnnotations : converter.getAnnotations(rawAnnotationTarget.fullyQualifiedName));
}
function resolveAnnotationsOnAnnotation(converter, annotationRecord, annotationTerm) {
    return () => {
        const currentFQN = annotationTerm.fullyQualifiedName;
        // be graceful when resolving annotations on annotations: Sometimes they are referenced directly, sometimes they
        // are part of the global annotations list
        let annotations;
        if (annotationRecord.annotations && annotationRecord.annotations.length > 0) {
            annotations = annotationRecord.annotations;
        }
        else {
            annotations = converter.getAnnotations(currentFQN);
        }
        annotations === null || annotations === void 0 ? void 0 : annotations.forEach((annotation) => {
            annotation.target = currentFQN;
            annotation.__source = annotationTerm.__source;
            annotation[ANNOTATION_TARGET] = annotationTerm[ANNOTATION_TARGET];
            annotation.fullyQualifiedName = `${currentFQN}@${annotation.term}`;
        });
        return createAnnotationsObject(converter, annotationTerm, annotations !== null && annotations !== void 0 ? annotations : []);
    };
}
function createAnnotationsObject(converter, target, rawAnnotations) {
    return rawAnnotations.reduce((vocabularyAliases, annotation) => {
        const [vocAlias, vocTerm] = converter.splitTerm(annotation.term);
        const vocTermWithQualifier = `${vocTerm}${annotation.qualifier ? '#' + annotation.qualifier : ''}`;
        if (vocabularyAliases[vocAlias] === undefined) {
            vocabularyAliases[vocAlias] = {};
        }
        if (!vocabularyAliases[vocAlias].hasOwnProperty(vocTermWithQualifier)) {
            (0, utils_1.lazy)(vocabularyAliases[vocAlias], vocTermWithQualifier, () => converter.getConvertedElement(annotation.fullyQualifiedName, annotation, (converter, rawAnnotation) => convertAnnotation(converter, target, rawAnnotation)));
        }
        return vocabularyAliases;
    }, {});
}
/**
 * Converts an EntityContainer.
 *
 * @param converter     Converter
 * @param rawEntityContainer    Unconverted EntityContainer
 * @returns The converted EntityContainer
 */
function convertEntityContainer(converter, rawEntityContainer) {
    const convertedEntityContainer = rawEntityContainer;
    (0, utils_1.lazy)(convertedEntityContainer, 'annotations', resolveAnnotations(converter, rawEntityContainer));
    (0, utils_1.lazy)(convertedEntityContainer, 'entitySets', converter.convert(converter.rawSchema.entitySets, convertEntitySet));
    (0, utils_1.lazy)(convertedEntityContainer, 'singletons', converter.convert(converter.rawSchema.singletons, convertSingleton));
    (0, utils_1.lazy)(convertedEntityContainer, 'actionImports', converter.convert(converter.rawSchema.actionImports, convertActionImport));
    return convertedEntityContainer;
}
/**
 * Converts a Singleton.
 *
 * @param converter   Converter
 * @param rawSingleton  Unconverted Singleton
 * @returns The converted Singleton
 */
function convertSingleton(converter, rawSingleton) {
    const convertedSingleton = rawSingleton;
    (0, utils_1.lazy)(convertedSingleton, 'entityType', resolveEntityType(converter, rawSingleton.entityTypeName));
    (0, utils_1.lazy)(convertedSingleton, 'annotations', resolveAnnotations(converter, rawSingleton));
    const _rawNavigationPropertyBindings = rawSingleton.navigationPropertyBinding;
    (0, utils_1.lazy)(convertedSingleton, 'navigationPropertyBinding', resolveNavigationPropertyBindings(converter, _rawNavigationPropertyBindings, rawSingleton));
    return convertedSingleton;
}
/**
 * Converts an EntitySet.
 *
 * @param converter   Converter
 * @param rawEntitySet  Unconverted EntitySet
 * @returns The converted EntitySet
 */
function convertEntitySet(converter, rawEntitySet) {
    const convertedEntitySet = rawEntitySet;
    (0, utils_1.lazy)(convertedEntitySet, 'entityType', resolveEntityType(converter, rawEntitySet.entityTypeName));
    (0, utils_1.lazy)(convertedEntitySet, 'annotations', resolveAnnotations(converter, rawEntitySet));
    const _rawNavigationPropertyBindings = rawEntitySet.navigationPropertyBinding;
    (0, utils_1.lazy)(convertedEntitySet, 'navigationPropertyBinding', resolveNavigationPropertyBindings(converter, _rawNavigationPropertyBindings, rawEntitySet));
    return convertedEntitySet;
}
/**
 * Converts an EntityType.
 *
 * @param converter   Converter
 * @param rawEntityType  Unconverted EntityType
 * @returns The converted EntityType
 */
function convertEntityType(converter, rawEntityType) {
    const convertedEntityType = rawEntityType;
    rawEntityType.keys.forEach((keyProp) => {
        keyProp.isKey = true;
    });
    (0, utils_1.lazy)(convertedEntityType, 'annotations', resolveAnnotations(converter, rawEntityType));
    (0, utils_1.lazy)(convertedEntityType, 'keys', converter.convert(rawEntityType.keys, convertProperty));
    (0, utils_1.lazy)(convertedEntityType, 'entityProperties', converter.convert(rawEntityType.entityProperties, convertProperty));
    (0, utils_1.lazy)(convertedEntityType, 'navigationProperties', converter.convert(rawEntityType.navigationProperties, convertNavigationProperty));
    (0, utils_1.lazy)(convertedEntityType, 'actions', () => converter.rawSchema.actions
        .filter((rawAction) => rawAction.isBound &&
        (rawAction.sourceType === rawEntityType.fullyQualifiedName ||
            rawAction.sourceType === `Collection(${rawEntityType.fullyQualifiedName})`))
        .reduce((actions, rawAction) => {
        const name = `${converter.rawSchema.namespace}.${rawAction.name}`;
        actions[name] = converter.getConvertedAction(rawAction.fullyQualifiedName);
        return actions;
    }, {}));
    convertedEntityType.resolvePath = (relativePath, includeVisitedObjects) => {
        const resolved = resolveTarget(converter, rawEntityType, relativePath);
        if (includeVisitedObjects) {
            return { target: resolved.target, visitedObjects: resolved.objectPath, messages: resolved.messages };
        }
        else {
            return resolved.target;
        }
    };
    return convertedEntityType;
}
/**
 * Converts a Property.
 *
 * @param converter   Converter
 * @param rawProperty  Unconverted Property
 * @returns The converted Property
 */
function convertProperty(converter, rawProperty) {
    const convertedProperty = rawProperty;
    (0, utils_1.lazy)(convertedProperty, 'annotations', resolveAnnotations(converter, rawProperty));
    (0, utils_1.lazy)(convertedProperty, 'targetType', () => {
        var _a;
        const type = rawProperty.type;
        const typeName = type.startsWith('Collection') ? type.substring(11, type.length - 1) : type;
        return (_a = converter.getConvertedComplexType(typeName)) !== null && _a !== void 0 ? _a : converter.getConvertedTypeDefinition(typeName);
    });
    return convertedProperty;
}
/**
 * Converts a NavigationProperty.
 *
 * @param converter   Converter
 * @param rawNavigationProperty  Unconverted NavigationProperty
 * @returns The converted NavigationProperty
 */
function convertNavigationProperty(converter, rawNavigationProperty) {
    var _a, _b, _c;
    const convertedNavigationProperty = rawNavigationProperty;
    convertedNavigationProperty.referentialConstraint = (_a = convertedNavigationProperty.referentialConstraint) !== null && _a !== void 0 ? _a : [];
    if (!isV4NavigationProperty(rawNavigationProperty)) {
        const associationEnd = (_b = converter.rawSchema.associations
            .find((association) => association.fullyQualifiedName === rawNavigationProperty.relationship)) === null || _b === void 0 ? void 0 : _b.associationEnd.find((end) => end.role === rawNavigationProperty.toRole);
        convertedNavigationProperty.isCollection = (associationEnd === null || associationEnd === void 0 ? void 0 : associationEnd.multiplicity) === '*';
        convertedNavigationProperty.targetTypeName = (_c = associationEnd === null || associationEnd === void 0 ? void 0 : associationEnd.type) !== null && _c !== void 0 ? _c : '';
    }
    (0, utils_1.lazy)(convertedNavigationProperty, 'targetType', resolveEntityType(converter, rawNavigationProperty.targetTypeName));
    (0, utils_1.lazy)(convertedNavigationProperty, 'annotations', resolveAnnotations(converter, rawNavigationProperty));
    return convertedNavigationProperty;
}
/**
 * Converts an ActionImport.
 *
 * @param converter   Converter
 * @param rawActionImport  Unconverted ActionImport
 * @returns The converted ActionImport
 */
function convertActionImport(converter, rawActionImport) {
    const convertedActionImport = rawActionImport;
    (0, utils_1.lazy)(convertedActionImport, 'annotations', resolveAnnotations(converter, rawActionImport));
    (0, utils_1.lazy)(convertedActionImport, 'action', () => converter.getConvertedAction(rawActionImport.actionName));
    return convertedActionImport;
}
/**
 * Converts an Action.
 *
 * @param converter   Converter
 * @param rawAction  Unconverted Action
 * @returns The converted Action
 */
function convertAction(converter, rawAction) {
    const convertedAction = rawAction;
    if (convertedAction.sourceType) {
        (0, utils_1.lazy)(convertedAction, 'sourceEntityType', resolveEntityType(converter, rawAction.sourceType));
    }
    if (convertedAction.returnType) {
        (0, utils_1.lazy)(convertedAction, 'returnEntityType', resolveEntityType(converter, rawAction.returnType));
    }
    (0, utils_1.lazy)(convertedAction, 'parameters', converter.convert(rawAction.parameters, convertActionParameter));
    (0, utils_1.lazy)(convertedAction, 'annotations', () => {
        const action = (0, utils_1.substringBeforeFirst)(rawAction.fullyQualifiedName, '(');
        // if the action is unbound (e.g. "myAction"), the annotation target is "myAction()"
        const annotationTargetFQN = rawAction.isBound
            ? rawAction.fullyQualifiedName
            : `${rawAction.fullyQualifiedName}()`;
        const rawAnnotations = converter.getAnnotations(annotationTargetFQN);
        const baseAnnotations = converter.getAnnotations(action);
        for (const baseAnnotation of baseAnnotations) {
            if (!rawAnnotations.some((annotation) => annotation.term === baseAnnotation.term && annotation.qualifier === baseAnnotation.qualifier)) {
                rawAnnotations.push(baseAnnotation);
            }
        }
        return createAnnotationsObject(converter, rawAction, rawAnnotations);
    });
    return convertedAction;
}
/**
 * Converts an ActionParameter.
 *
 * @param converter   Converter
 * @param rawActionParameter  Unconverted ActionParameter
 * @returns The converted ActionParameter
 */
function convertActionParameter(converter, rawActionParameter) {
    const convertedActionParameter = rawActionParameter;
    (0, utils_1.lazy)(convertedActionParameter, 'typeReference', () => {
        var _a, _b;
        return (_b = (_a = converter.getConvertedEntityType(rawActionParameter.type)) !== null && _a !== void 0 ? _a : converter.getConvertedComplexType(rawActionParameter.type)) !== null && _b !== void 0 ? _b : converter.getConvertedTypeDefinition(rawActionParameter.type);
    });
    (0, utils_1.lazy)(convertedActionParameter, 'annotations', resolveAnnotations(converter, rawActionParameter));
    return convertedActionParameter;
}
/**
 * Converts a ComplexType.
 *
 * @param converter   Converter
 * @param rawComplexType  Unconverted ComplexType
 * @returns The converted ComplexType
 */
function convertComplexType(converter, rawComplexType) {
    const convertedComplexType = rawComplexType;
    (0, utils_1.lazy)(convertedComplexType, 'properties', converter.convert(rawComplexType.properties, convertProperty));
    (0, utils_1.lazy)(convertedComplexType, 'navigationProperties', converter.convert(rawComplexType.navigationProperties, convertNavigationProperty));
    (0, utils_1.lazy)(convertedComplexType, 'annotations', resolveAnnotations(converter, rawComplexType));
    return convertedComplexType;
}
/**
 * Converts a TypeDefinition.
 *
 * @param converter   Converter
 * @param rawTypeDefinition  Unconverted TypeDefinition
 * @returns The converted TypeDefinition
 */
function convertTypeDefinition(converter, rawTypeDefinition) {
    const convertedTypeDefinition = rawTypeDefinition;
    (0, utils_1.lazy)(convertedTypeDefinition, 'annotations', resolveAnnotations(converter, rawTypeDefinition));
    return convertedTypeDefinition;
}
/**
 * Convert a RawMetadata into an object representation to be used to easily navigate a metadata object and its annotation.
 *
 * @param rawMetadata
 * @returns the converted representation of the metadata.
 */
function convert(rawMetadata) {
    // Converter Output
    const convertedOutput = {
        version: rawMetadata.version,
        namespace: rawMetadata.schema.namespace,
        annotations: rawMetadata.schema.annotations,
        references: VocabularyReferences_1.VocabularyReferences.concat(rawMetadata.references),
        diagnostics: []
    };
    // fall back on the default references if the caller does not specify any
    if (rawMetadata.references.length === 0) {
        rawMetadata.references = VocabularyReferences_1.VocabularyReferences;
    }
    // Converter
    const converter = new Converter(rawMetadata, convertedOutput);
    (0, utils_1.lazy)(convertedOutput, 'entityContainer', converter.convert(converter.rawSchema.entityContainer, convertEntityContainer));
    (0, utils_1.lazy)(convertedOutput, 'entitySets', converter.convert(converter.rawSchema.entitySets, convertEntitySet));
    (0, utils_1.lazy)(convertedOutput, 'singletons', converter.convert(converter.rawSchema.singletons, convertSingleton));
    (0, utils_1.lazy)(convertedOutput, 'entityTypes', converter.convert(converter.rawSchema.entityTypes, convertEntityType));
    (0, utils_1.lazy)(convertedOutput, 'actions', converter.convert(converter.rawSchema.actions, convertAction));
    (0, utils_1.lazy)(convertedOutput, 'complexTypes', converter.convert(converter.rawSchema.complexTypes, convertComplexType));
    (0, utils_1.lazy)(convertedOutput, 'actionImports', converter.convert(converter.rawSchema.actionImports, convertActionImport));
    (0, utils_1.lazy)(convertedOutput, 'typeDefinitions', converter.convert(converter.rawSchema.typeDefinitions, convertTypeDefinition));
    convertedOutput.resolvePath = function resolvePath(path) {
        const targetResolution = resolveTarget(converter, undefined, path);
        if (targetResolution.target) {
            appendObjectPath(targetResolution.objectPath, targetResolution.target);
        }
        return targetResolution;
    };
    return convertedOutput;
}
exports.convert = convert;


/***/ }),

/***/ 878:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(175), exports);
__exportStar(__webpack_require__(168), exports);
__exportStar(__webpack_require__(311), exports);


/***/ }),

/***/ 168:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addGetByValue = exports.createIndexedFind = exports.lazy = exports.Decimal = exports.isComplexTypeDefinition = exports.unalias = exports.alias = exports.substringBeforeLast = exports.substringBeforeFirst = exports.splitAtLast = exports.splitAtFirst = exports.defaultReferences = exports.TermToTypes = exports.EnumIsFlag = void 0;
var EnumIsFlag_1 = __webpack_require__(830);
Object.defineProperty(exports, "EnumIsFlag", ({ enumerable: true, get: function () { return EnumIsFlag_1.EnumIsFlag; } }));
var TermToTypes_1 = __webpack_require__(377);
Object.defineProperty(exports, "TermToTypes", ({ enumerable: true, get: function () { return TermToTypes_1.TermToTypes; } }));
var VocabularyReferences_1 = __webpack_require__(899);
Object.defineProperty(exports, "defaultReferences", ({ enumerable: true, get: function () { return VocabularyReferences_1.VocabularyReferences; } }));
function splitAt(string, index) {
    return index < 0 ? [string, ''] : [string.substring(0, index), string.substring(index + 1)];
}
function substringAt(string, index) {
    return index < 0 ? string : string.substring(0, index);
}
/**
 * Splits a string at the first occurrence of a separator.
 *
 * @param string    The string to split
 * @param separator Separator, e.g. a single character.
 * @returns An array consisting of two elements: the part before the first occurrence of the separator and the part after it. If the string does not contain the separator, the second element is the empty string.
 */
function splitAtFirst(string, separator) {
    return splitAt(string, string.indexOf(separator));
}
exports.splitAtFirst = splitAtFirst;
/**
 * Splits a string at the last occurrence of a separator.
 *
 * @param string    The string to split
 * @param separator Separator, e.g. a single character.
 * @returns An array consisting of two elements: the part before the last occurrence of the separator and the part after it. If the string does not contain the separator, the second element is the empty string.
 */
function splitAtLast(string, separator) {
    return splitAt(string, string.lastIndexOf(separator));
}
exports.splitAtLast = splitAtLast;
/**
 * Returns the substring before the first occurrence of a separator.
 *
 * @param string    The string
 * @param separator Separator, e.g. a single character.
 * @returns The substring before the first occurrence of the separator, or the input string if it does not contain the separator.
 */
function substringBeforeFirst(string, separator) {
    return substringAt(string, string.indexOf(separator));
}
exports.substringBeforeFirst = substringBeforeFirst;
/**
 * Returns the substring before the last occurrence of a separator.
 *
 * @param string    The string
 * @param separator Separator, e.g. a single character.
 * @returns The substring before the last occurrence of the separator, or the input string if it does not contain the separator.
 */
function substringBeforeLast(string, separator) {
    return substringAt(string, string.lastIndexOf(separator));
}
exports.substringBeforeLast = substringBeforeLast;
/**
 * Transform an unaliased string representation annotation to the aliased version.
 *
 * @param references currentReferences for the project
 * @param unaliasedValue the unaliased value
 * @returns the aliased string representing the same
 */
function alias(references, unaliasedValue) {
    if (!references.reverseReferenceMap) {
        references.reverseReferenceMap = references.reduce((map, ref) => {
            map[ref.namespace] = ref;
            return map;
        }, {});
    }
    if (!unaliasedValue) {
        return unaliasedValue;
    }
    const [namespace, value] = splitAtLast(unaliasedValue, '.');
    const reference = references.reverseReferenceMap[namespace];
    if (reference) {
        return `${reference.alias}.${value}`;
    }
    else if (unaliasedValue.includes('@')) {
        // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
        const [preAlias, postAlias] = splitAtFirst(unaliasedValue, '@');
        return `${preAlias}@${alias(references, postAlias)}`;
    }
    else {
        return unaliasedValue;
    }
}
exports.alias = alias;
/**
 * Transform an aliased string to its unaliased version given a set of references.
 *
 * @param references The references to use for unaliasing.
 * @param aliasedValue The aliased value
 * @param namespace The fallback namespace
 * @returns The equal unaliased string.
 */
function unalias(references, aliasedValue, namespace) {
    var _a;
    const _unalias = (value) => {
        if (!references.referenceMap) {
            references.referenceMap = Object.fromEntries(references.map((ref) => [ref.alias, ref]));
        }
        // Aliases are of type 'SimpleIdentifier' and must not contain dots
        const [maybeAlias, rest] = splitAtFirst(value, '.');
        if (!rest || rest.includes('.')) {
            // either there is no dot in the value or there is more than one --> nothing to do
            return value;
        }
        const isAnnotation = maybeAlias.startsWith('@');
        const valueToUnalias = isAnnotation ? maybeAlias.substring(1) : maybeAlias;
        const knownReference = references.referenceMap[valueToUnalias];
        if (knownReference) {
            return isAnnotation ? `@${knownReference.namespace}.${rest}` : `${knownReference.namespace}.${rest}`;
        }
        // The alias could not be resolved using the references. Assume it is the "global" alias (= namespace)
        return namespace && !isAnnotation ? `${namespace}.${rest}` : value;
    };
    return (_a = aliasedValue === null || aliasedValue === void 0 ? void 0 : aliasedValue.split('/').reduce((segments, segment) => {
        // the segment could be an action, like "doSomething(foo.bar)"
        const [first, rest] = splitAtFirst(segment, '(');
        const subSegment = [_unalias(first)];
        if (rest) {
            const parameter = rest.slice(0, -1); // remove trailing ")"
            subSegment.push(`(${_unalias(parameter)})`);
        }
        segments.push(subSegment.join(''));
        return segments;
    }, [])) === null || _a === void 0 ? void 0 : _a.join('/');
}
exports.unalias = unalias;
/**
 * Differentiate between a ComplexType and a TypeDefinition.
 *
 * @param complexTypeDefinition
 * @returns true if the value is a complex type
 */
function isComplexTypeDefinition(complexTypeDefinition) {
    return (!!complexTypeDefinition && complexTypeDefinition._type === 'ComplexType' && !!complexTypeDefinition.properties);
}
exports.isComplexTypeDefinition = isComplexTypeDefinition;
function Decimal(value) {
    return {
        isDecimal() {
            return true;
        },
        valueOf() {
            return value;
        },
        toString() {
            return value.toString();
        }
    };
}
exports.Decimal = Decimal;
/**
 * Defines a lazy property.
 *
 * The property is initialized by calling the init function on the first read access, or by directly assigning a value.
 *
 * @param object    The host object
 * @param property  The lazy property to add
 * @param init      The function that initializes the property's value
 */
function lazy(object, property, init) {
    const initial = Symbol('initial');
    let _value = initial;
    Object.defineProperty(object, property, {
        enumerable: true,
        get() {
            if (_value === initial) {
                _value = init();
            }
            return _value;
        },
        set(value) {
            _value = value;
        }
    });
}
exports.lazy = lazy;
/**
 * Creates a function that allows to find an array element by property value.
 *
 * @param array     The array
 * @param property  Elements in the array are searched by this property
 * @returns A function that can be used to find an element of the array by property value.
 */
function createIndexedFind(array, property) {
    const index = new Map();
    return function find(value) {
        const element = index.get(value);
        if ((element === null || element === void 0 ? void 0 : element[property]) === value) {
            return element;
        }
        return array.find((element) => {
            if (!(element === null || element === void 0 ? void 0 : element.hasOwnProperty(property))) {
                return false;
            }
            const propertyValue = element[property];
            index.set(propertyValue, element);
            return propertyValue === value;
        });
    };
}
exports.createIndexedFind = createIndexedFind;
/**
 * Adds a 'get by value' function to an array.
 *
 * If this function is called with addIndex(myArray, 'name'), a new function 'by_name(value)' will be added that allows to
 * find a member of the array by the value of its 'name' property.
 *
 * @param array      The array
 * @param property   The property that will be used by the 'by_{property}()' function
 * @returns The array with the added function
 */
function addGetByValue(array, property) {
    const indexName = `by_${property}`;
    if (!array.hasOwnProperty(indexName)) {
        Object.defineProperty(array, indexName, { writable: false, value: createIndexedFind(array, property) });
    }
    else {
        throw new Error(`Property '${indexName}' already exists`);
    }
    return array;
}
exports.addGetByValue = addGetByValue;


/***/ }),

/***/ 311:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.revertTermToGenericType = void 0;
const utils_1 = __webpack_require__(168);
/**
 * Revert an object to its raw type equivalent.
 *
 * @param references the current reference
 * @param value the value to revert
 * @returns the raw value
 */
function revertObjectToRawType(references, value) {
    var _a, _b, _c, _d, _e, _f;
    let result;
    if (Array.isArray(value)) {
        result = {
            type: 'Collection',
            Collection: value.map((anno) => revertCollectionItemToRawType(references, anno))
        };
    }
    else if ((_a = value.isDecimal) === null || _a === void 0 ? void 0 : _a.call(value)) {
        result = {
            type: 'Decimal',
            Decimal: value.valueOf()
        };
    }
    else if ((_b = value.isString) === null || _b === void 0 ? void 0 : _b.call(value)) {
        const valueMatches = value.valueOf().split('.');
        if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
            result = {
                type: 'EnumMember',
                EnumMember: value.valueOf()
            };
        }
        else {
            result = {
                type: 'String',
                String: value.valueOf()
            };
        }
    }
    else if ((_c = value.isInt) === null || _c === void 0 ? void 0 : _c.call(value)) {
        result = {
            type: 'Int',
            Int: value.valueOf()
        };
    }
    else if ((_d = value.isFloat) === null || _d === void 0 ? void 0 : _d.call(value)) {
        result = {
            type: 'Float',
            Float: value.valueOf()
        };
    }
    else if ((_e = value.isDate) === null || _e === void 0 ? void 0 : _e.call(value)) {
        result = {
            type: 'Date',
            Date: value.valueOf()
        };
    }
    else if ((_f = value.isBoolean) === null || _f === void 0 ? void 0 : _f.call(value)) {
        result = {
            type: 'Bool',
            Bool: value.valueOf()
        };
    }
    else if (value.type === 'Path') {
        result = {
            type: 'Path',
            Path: value.path
        };
    }
    else if (value.type === 'AnnotationPath') {
        result = {
            type: 'AnnotationPath',
            AnnotationPath: value.value
        };
    }
    else if (value.type === 'Apply') {
        result = {
            type: 'Apply',
            Apply: value.Apply
        };
    }
    else if (value.type === 'Null') {
        result = {
            type: 'Null'
        };
    }
    else if (value.type === 'PropertyPath') {
        result = {
            type: 'PropertyPath',
            PropertyPath: value.value
        };
    }
    else if (value.type === 'NavigationPropertyPath') {
        result = {
            type: 'NavigationPropertyPath',
            NavigationPropertyPath: value.value
        };
    }
    else if (Object.prototype.hasOwnProperty.call(value, '$Type')) {
        result = {
            type: 'Record',
            Record: revertCollectionItemToRawType(references, value)
        };
    }
    return result;
}
/**
 * Revert a value to its raw value depending on its type.
 *
 * @param references the current set of reference
 * @param value the value to revert
 * @returns the raw expression
 */
function revertValueToRawType(references, value) {
    let result;
    const valueConstructor = value === null || value === void 0 ? void 0 : value.constructor.name;
    switch (valueConstructor) {
        case 'String':
        case 'string':
            const valueMatches = value.toString().split('.');
            if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
                result = {
                    type: 'EnumMember',
                    EnumMember: value.toString()
                };
            }
            else {
                result = {
                    type: 'String',
                    String: value.toString()
                };
            }
            break;
        case 'Boolean':
        case 'boolean':
            result = {
                type: 'Bool',
                Bool: value.valueOf()
            };
            break;
        case 'Number':
        case 'number':
            if (value.toString() === value.toFixed()) {
                result = {
                    type: 'Int',
                    Int: value.valueOf()
                };
            }
            else {
                result = {
                    type: 'Decimal',
                    Decimal: value.valueOf()
                };
            }
            break;
        case 'object':
        default:
            result = revertObjectToRawType(references, value);
            break;
    }
    return result;
}
const restrictedKeys = ['$Type', 'term', '__source', 'qualifier', 'ActionTarget', 'fullyQualifiedName', 'annotations'];
/**
 * Revert the current embedded annotations to their raw type.
 *
 * @param references the current set of reference
 * @param currentAnnotations the collection item to evaluate
 * @param targetAnnotations the place where we need to add the annotation
 */
function revertAnnotationsToRawType(references, currentAnnotations, targetAnnotations) {
    Object.keys(currentAnnotations)
        .filter((key) => key !== '_annotations')
        .forEach((key) => {
        Object.keys(currentAnnotations[key]).forEach((term) => {
            const parsedAnnotation = revertTermToGenericType(references, currentAnnotations[key][term]);
            if (!parsedAnnotation.term) {
                const unaliasedTerm = (0, utils_1.unalias)(references, `${key}.${term}`);
                if (unaliasedTerm) {
                    const qualifiedSplit = unaliasedTerm.split('#');
                    parsedAnnotation.term = qualifiedSplit[0];
                    if (qualifiedSplit.length > 1) {
                        // Sub Annotation with a qualifier, not sure when that can happen in real scenarios
                        parsedAnnotation.qualifier = qualifiedSplit[1];
                    }
                }
            }
            targetAnnotations.push(parsedAnnotation);
        });
    });
}
/**
 * Revert the current collection item to the corresponding raw annotation.
 *
 * @param references the current set of reference
 * @param collectionItem the collection item to evaluate
 * @returns the raw type equivalent
 */
function revertCollectionItemToRawType(references, collectionItem) {
    if (typeof collectionItem === 'string') {
        return collectionItem;
    }
    else if (typeof collectionItem === 'object') {
        if (collectionItem.hasOwnProperty('$Type')) {
            // Annotation Record
            const outItem = {
                type: collectionItem.$Type,
                propertyValues: []
            };
            // Could validate keys and type based on $Type
            Object.keys(collectionItem).forEach((collectionKey) => {
                if (restrictedKeys.indexOf(collectionKey) === -1) {
                    const value = collectionItem[collectionKey];
                    outItem.propertyValues.push({
                        name: collectionKey,
                        value: revertValueToRawType(references, value)
                    });
                }
                else if (collectionKey === 'annotations' && Object.keys(collectionItem[collectionKey]).length > 0) {
                    outItem.annotations = [];
                    revertAnnotationsToRawType(references, collectionItem[collectionKey], outItem.annotations);
                }
            });
            return outItem;
        }
        else if (collectionItem.type === 'PropertyPath') {
            return {
                type: 'PropertyPath',
                PropertyPath: collectionItem.value
            };
        }
        else if (collectionItem.type === 'AnnotationPath') {
            return {
                type: 'AnnotationPath',
                AnnotationPath: collectionItem.value
            };
        }
        else if (collectionItem.type === 'NavigationPropertyPath') {
            return {
                type: 'NavigationPropertyPath',
                NavigationPropertyPath: collectionItem.value
            };
        }
    }
    return undefined;
}
/**
 * Revert an annotation term to it's generic or raw equivalent.
 *
 * @param references the reference of the current context
 * @param annotation the annotation term to revert
 * @returns the raw annotation
 */
function revertTermToGenericType(references, annotation) {
    const baseAnnotation = {
        term: annotation.term,
        qualifier: annotation.qualifier
    };
    if (Array.isArray(annotation)) {
        // Collection
        if (annotation.hasOwnProperty('annotations') && Object.keys(annotation.annotations).length > 0) {
            // Annotation on a collection itself, not sure when that happens if at all
            baseAnnotation.annotations = [];
            revertAnnotationsToRawType(references, annotation.annotations, baseAnnotation.annotations);
        }
        return {
            ...baseAnnotation,
            collection: annotation.map((anno) => revertCollectionItemToRawType(references, anno))
        };
    }
    else if (annotation.hasOwnProperty('$Type')) {
        return { ...baseAnnotation, record: revertCollectionItemToRawType(references, annotation) };
    }
    else {
        return { ...baseAnnotation, value: revertValueToRawType(references, annotation) };
    }
}
exports.revertTermToGenericType = revertTermToGenericType;


/***/ }),

/***/ 830:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnumIsFlag = void 0;
exports.EnumIsFlag = {
    "Auth.KeyLocation": false,
    "Core.RevisionKind": false,
    "Core.DataModificationOperationKind": false,
    "Core.Permission": true,
    "Capabilities.ConformanceLevelType": false,
    "Capabilities.IsolationLevel": true,
    "Capabilities.NavigationType": false,
    "Capabilities.SearchExpressions": true,
    "Capabilities.HttpMethod": true,
    "Aggregation.RollupType": false,
    "Common.TextFormatType": false,
    "Common.FilterExpressionType": false,
    "Common.FieldControlType": false,
    "Common.EffectType": true,
    "Communication.KindType": false,
    "Communication.ContactInformationType": true,
    "Communication.PhoneType": true,
    "Communication.GenderType": false,
    "UI.VisualizationType": false,
    "UI.CriticalityType": false,
    "UI.ImprovementDirectionType": false,
    "UI.TrendType": false,
    "UI.ChartType": false,
    "UI.ChartAxisScaleBehaviorType": false,
    "UI.ChartAxisAutoScaleDataScopeType": false,
    "UI.ChartDimensionRoleType": false,
    "UI.ChartMeasureRoleType": false,
    "UI.SelectionRangeSignType": false,
    "UI.SelectionRangeOptionType": false,
    "UI.TextArrangementType": false,
    "UI.ImportanceType": false,
    "UI.CriticalityRepresentationType": false,
    "UI.OperationGroupingType": false,
};


/***/ }),

/***/ 377:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TermToTypes = void 0;
var TermToTypes;
(function (TermToTypes) {
    TermToTypes["Org.OData.Authorization.V1.SecuritySchemes"] = "Org.OData.Authorization.V1.SecurityScheme";
    TermToTypes["Org.OData.Authorization.V1.Authorizations"] = "Org.OData.Authorization.V1.Authorization";
    TermToTypes["Org.OData.Core.V1.Revisions"] = "Org.OData.Core.V1.RevisionType";
    TermToTypes["Org.OData.Core.V1.Links"] = "Org.OData.Core.V1.Link";
    TermToTypes["Org.OData.Core.V1.Example"] = "Org.OData.Core.V1.ExampleValue";
    TermToTypes["Org.OData.Core.V1.Messages"] = "Org.OData.Core.V1.MessageType";
    TermToTypes["Org.OData.Core.V1.ValueException"] = "Org.OData.Core.V1.ValueExceptionType";
    TermToTypes["Org.OData.Core.V1.ResourceException"] = "Org.OData.Core.V1.ResourceExceptionType";
    TermToTypes["Org.OData.Core.V1.DataModificationException"] = "Org.OData.Core.V1.DataModificationExceptionType";
    TermToTypes["Org.OData.Core.V1.IsLanguageDependent"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AppliesViaContainer"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.DereferenceableIDs"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ConventionalIDs"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Permissions"] = "Org.OData.Core.V1.Permission";
    TermToTypes["Org.OData.Core.V1.DefaultNamespace"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Immutable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Computed"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ComputedDefaultValue"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.IsURL"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.IsMediaType"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ContentDisposition"] = "Org.OData.Core.V1.ContentDispositionType";
    TermToTypes["Org.OData.Core.V1.OptimisticConcurrency"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Core.V1.AdditionalProperties"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AutoExpand"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AutoExpandReferences"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.MayImplement"] = "Org.OData.Core.V1.QualifiedTypeName";
    TermToTypes["Org.OData.Core.V1.Ordered"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.PositionalInsert"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AlternateKeys"] = "Org.OData.Core.V1.AlternateKey";
    TermToTypes["Org.OData.Core.V1.OptionalParameter"] = "Org.OData.Core.V1.OptionalParameterType";
    TermToTypes["Org.OData.Core.V1.OperationAvailable"] = "Edm.Boolean";
    TermToTypes["Org.OData.Core.V1.RequiresExplicitBinding"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ExplicitOperationBindings"] = "Org.OData.Core.V1.QualifiedBoundOperationName";
    TermToTypes["Org.OData.Core.V1.SymbolicName"] = "Org.OData.Core.V1.SimpleIdentifier";
    TermToTypes["Org.OData.Core.V1.GeometryFeature"] = "Org.OData.Core.V1.GeometryFeatureType";
    TermToTypes["Org.OData.Capabilities.V1.ConformanceLevel"] = "Org.OData.Capabilities.V1.ConformanceLevelType";
    TermToTypes["Org.OData.Capabilities.V1.AsynchronousRequestsSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.BatchContinueOnErrorSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.IsolationSupported"] = "Org.OData.Capabilities.V1.IsolationLevel";
    TermToTypes["Org.OData.Capabilities.V1.CrossJoinSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.CallbackSupported"] = "Org.OData.Capabilities.V1.CallbackType";
    TermToTypes["Org.OData.Capabilities.V1.ChangeTracking"] = "Org.OData.Capabilities.V1.ChangeTrackingType";
    TermToTypes["Org.OData.Capabilities.V1.CountRestrictions"] = "Org.OData.Capabilities.V1.CountRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.NavigationRestrictions"] = "Org.OData.Capabilities.V1.NavigationRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.IndexableByKey"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.TopSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.SkipSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.ComputeSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.SelectSupport"] = "Org.OData.Capabilities.V1.SelectSupportType";
    TermToTypes["Org.OData.Capabilities.V1.BatchSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.BatchSupport"] = "Org.OData.Capabilities.V1.BatchSupportType";
    TermToTypes["Org.OData.Capabilities.V1.FilterRestrictions"] = "Org.OData.Capabilities.V1.FilterRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.SortRestrictions"] = "Org.OData.Capabilities.V1.SortRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.ExpandRestrictions"] = "Org.OData.Capabilities.V1.ExpandRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.SearchRestrictions"] = "Org.OData.Capabilities.V1.SearchRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.KeyAsSegmentSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.QuerySegmentSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.InsertRestrictions"] = "Org.OData.Capabilities.V1.InsertRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.DeepInsertSupport"] = "Org.OData.Capabilities.V1.DeepInsertSupportType";
    TermToTypes["Org.OData.Capabilities.V1.UpdateRestrictions"] = "Org.OData.Capabilities.V1.UpdateRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.DeepUpdateSupport"] = "Org.OData.Capabilities.V1.DeepUpdateSupportType";
    TermToTypes["Org.OData.Capabilities.V1.DeleteRestrictions"] = "Org.OData.Capabilities.V1.DeleteRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.CollectionPropertyRestrictions"] = "Org.OData.Capabilities.V1.CollectionPropertyRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.OperationRestrictions"] = "Org.OData.Capabilities.V1.OperationRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.AnnotationValuesInQuerySupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.ModificationQueryOptions"] = "Org.OData.Capabilities.V1.ModificationQueryOptionsType";
    TermToTypes["Org.OData.Capabilities.V1.ReadRestrictions"] = "Org.OData.Capabilities.V1.ReadRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.CustomHeaders"] = "Org.OData.Capabilities.V1.CustomParameter";
    TermToTypes["Org.OData.Capabilities.V1.CustomQueryOptions"] = "Org.OData.Capabilities.V1.CustomParameter";
    TermToTypes["Org.OData.Capabilities.V1.MediaLocationUpdateSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.ApplySupported"] = "Org.OData.Aggregation.V1.ApplySupportedType";
    TermToTypes["Org.OData.Aggregation.V1.ApplySupportedDefaults"] = "Org.OData.Aggregation.V1.ApplySupportedBase";
    TermToTypes["Org.OData.Aggregation.V1.Groupable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.Aggregatable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.ContextDefiningProperties"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Aggregation.V1.LeveledHierarchy"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Aggregation.V1.RecursiveHierarchy"] = "Org.OData.Aggregation.V1.RecursiveHierarchyType";
    TermToTypes["Org.OData.Aggregation.V1.AvailableOnAggregates"] = "Org.OData.Aggregation.V1.AvailableOnAggregatesType";
    TermToTypes["Org.OData.Validation.V1.Minimum"] = "Edm.PrimitiveType";
    TermToTypes["Org.OData.Validation.V1.Maximum"] = "Edm.PrimitiveType";
    TermToTypes["Org.OData.Validation.V1.Exclusive"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Validation.V1.AllowedValues"] = "Org.OData.Validation.V1.AllowedValue";
    TermToTypes["Org.OData.Validation.V1.MultipleOf"] = "Edm.Decimal";
    TermToTypes["Org.OData.Validation.V1.Constraint"] = "Org.OData.Validation.V1.ConstraintType";
    TermToTypes["Org.OData.Validation.V1.ItemsOf"] = "Org.OData.Validation.V1.ItemsOfType";
    TermToTypes["Org.OData.Validation.V1.OpenPropertyTypeConstraint"] = "Org.OData.Validation.V1.SingleOrCollectionType";
    TermToTypes["Org.OData.Validation.V1.DerivedTypeConstraint"] = "Org.OData.Validation.V1.SingleOrCollectionType";
    TermToTypes["Org.OData.Validation.V1.AllowedTerms"] = "Org.OData.Core.V1.QualifiedTermName";
    TermToTypes["Org.OData.Validation.V1.ApplicableTerms"] = "Org.OData.Core.V1.QualifiedTermName";
    TermToTypes["Org.OData.Validation.V1.MaxItems"] = "Edm.Int64";
    TermToTypes["Org.OData.Validation.V1.MinItems"] = "Edm.Int64";
    TermToTypes["Org.OData.Measures.V1.Scale"] = "Edm.Byte";
    TermToTypes["Org.OData.Measures.V1.DurationGranularity"] = "Org.OData.Measures.V1.DurationGranularityType";
    TermToTypes["com.sap.vocabularies.Analytics.v1.Dimension"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.Measure"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AccumulativeMeasure"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.RolledUpPropertyCount"] = "Edm.Int16";
    TermToTypes["com.sap.vocabularies.Analytics.v1.PlanningAction"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperties"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperty"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AnalyticalContext"] = "com.sap.vocabularies.Analytics.v1.AnalyticalContextType";
    TermToTypes["com.sap.vocabularies.Common.v1.ServiceVersion"] = "Edm.Int32";
    TermToTypes["com.sap.vocabularies.Common.v1.ServiceSchemaVersion"] = "Edm.Int32";
    TermToTypes["com.sap.vocabularies.Common.v1.TextFor"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.IsLanguageIdentifier"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.TextFormat"] = "com.sap.vocabularies.Common.v1.TextFormatType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsTimezone"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDigitSequence"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsUpperCase"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCurrency"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsUnit"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificScale"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificPrecision"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.SecondaryKey"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.MinOccurs"] = "Edm.Int64";
    TermToTypes["com.sap.vocabularies.Common.v1.MaxOccurs"] = "Edm.Int64";
    TermToTypes["com.sap.vocabularies.Common.v1.AssociationEntity"] = "Edm.NavigationPropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.DerivedNavigation"] = "Edm.NavigationPropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.Masked"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.RevealOnDemand"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Common.v1.SemanticObjectMapping"] = "com.sap.vocabularies.Common.v1.SemanticObjectMappingType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsInstanceAnnotation"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] = "com.sap.vocabularies.Common.v1.FilterExpressionRestrictionType";
    TermToTypes["com.sap.vocabularies.Common.v1.FieldControl"] = "com.sap.vocabularies.Common.v1.FieldControlType";
    TermToTypes["com.sap.vocabularies.Common.v1.Application"] = "com.sap.vocabularies.Common.v1.ApplicationType";
    TermToTypes["com.sap.vocabularies.Common.v1.Timestamp"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.ErrorResolution"] = "com.sap.vocabularies.Common.v1.ErrorResolutionType";
    TermToTypes["com.sap.vocabularies.Common.v1.Messages"] = "Edm.ComplexType";
    TermToTypes["com.sap.vocabularies.Common.v1.numericSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
    TermToTypes["com.sap.vocabularies.Common.v1.MaximumNumericMessageSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsActionCritical"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Common.v1.Attributes"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.RelatedRecursiveHierarchy"] = "Edm.AnnotationPath";
    TermToTypes["com.sap.vocabularies.Common.v1.Interval"] = "com.sap.vocabularies.Common.v1.IntervalType";
    TermToTypes["com.sap.vocabularies.Common.v1.ResultContext"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.SAPObjectNodeType"] = "com.sap.vocabularies.Common.v1.SAPObjectNodeTypeType";
    TermToTypes["com.sap.vocabularies.Common.v1.Composition"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsNaturalPerson"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueList"] = "com.sap.vocabularies.Common.v1.ValueListType";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"] = "Org.OData.Core.V1.SimpleIdentifier";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListMapping"] = "com.sap.vocabularies.Common.v1.ValueListMappingType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarHalfyear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearHalfyear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarDate"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalPeriod"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfFiscalYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearVariant"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.MutuallyExclusiveTerm"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftRoot"] = "com.sap.vocabularies.Common.v1.DraftRootType";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftNode"] = "com.sap.vocabularies.Common.v1.DraftNodeType";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftActivationVia"] = "Org.OData.Core.V1.SimpleIdentifier";
    TermToTypes["com.sap.vocabularies.Common.v1.EditableFieldFor"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.SemanticKey"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.SideEffects"] = "com.sap.vocabularies.Common.v1.SideEffectsType";
    TermToTypes["com.sap.vocabularies.Common.v1.DefaultValuesFunction"] = "com.sap.vocabularies.Common.v1.QualifiedName";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValue"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValueHigh"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.SortOrder"] = "com.sap.vocabularies.Common.v1.SortOrderType";
    TermToTypes["com.sap.vocabularies.Common.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Common.v1.RecursiveHierarchyType";
    TermToTypes["com.sap.vocabularies.Common.v1.CreatedAt"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.CreatedBy"] = "com.sap.vocabularies.Common.v1.UserID";
    TermToTypes["com.sap.vocabularies.Common.v1.ChangedAt"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.ChangedBy"] = "com.sap.vocabularies.Common.v1.UserID";
    TermToTypes["com.sap.vocabularies.Common.v1.ApplyMultiUnitBehaviorForSortingAndFiltering"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.PrimitivePropertyPath"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.CodeList.v1.CurrencyCodes"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
    TermToTypes["com.sap.vocabularies.CodeList.v1.UnitsOfMeasure"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
    TermToTypes["com.sap.vocabularies.CodeList.v1.StandardCode"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.CodeList.v1.ExternalCode"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.CodeList.v1.IsConfigurationDeprecationCode"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Communication.v1.Contact"] = "com.sap.vocabularies.Communication.v1.ContactType";
    TermToTypes["com.sap.vocabularies.Communication.v1.Address"] = "com.sap.vocabularies.Communication.v1.AddressType";
    TermToTypes["com.sap.vocabularies.Communication.v1.IsEmailAddress"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Communication.v1.IsPhoneNumber"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Communication.v1.Event"] = "com.sap.vocabularies.Communication.v1.EventData";
    TermToTypes["com.sap.vocabularies.Communication.v1.Task"] = "com.sap.vocabularies.Communication.v1.TaskData";
    TermToTypes["com.sap.vocabularies.Communication.v1.Message"] = "com.sap.vocabularies.Communication.v1.MessageData";
    TermToTypes["com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.EntitySemantics"] = "com.sap.vocabularies.PersonalData.v1.EntitySemanticsType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.FieldSemantics"] = "com.sap.vocabularies.PersonalData.v1.FieldSemanticsType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallyPersonal"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Session.v1.StickySessionSupported"] = "com.sap.vocabularies.Session.v1.StickySessionSupportedType";
    TermToTypes["com.sap.vocabularies.UI.v1.HeaderInfo"] = "com.sap.vocabularies.UI.v1.HeaderInfoType";
    TermToTypes["com.sap.vocabularies.UI.v1.Identification"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.Badge"] = "com.sap.vocabularies.UI.v1.BadgeType";
    TermToTypes["com.sap.vocabularies.UI.v1.LineItem"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.StatusInfo"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.FieldGroup"] = "com.sap.vocabularies.UI.v1.FieldGroupType";
    TermToTypes["com.sap.vocabularies.UI.v1.ConnectedFields"] = "com.sap.vocabularies.UI.v1.ConnectedFieldsType";
    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocations"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocation"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
    TermToTypes["com.sap.vocabularies.UI.v1.Contacts"] = "Edm.AnnotationPath";
    TermToTypes["com.sap.vocabularies.UI.v1.MediaResource"] = "com.sap.vocabularies.UI.v1.MediaResourceType";
    TermToTypes["com.sap.vocabularies.UI.v1.DataPoint"] = "com.sap.vocabularies.UI.v1.DataPointType";
    TermToTypes["com.sap.vocabularies.UI.v1.KPI"] = "com.sap.vocabularies.UI.v1.KPIType";
    TermToTypes["com.sap.vocabularies.UI.v1.Chart"] = "com.sap.vocabularies.UI.v1.ChartDefinitionType";
    TermToTypes["com.sap.vocabularies.UI.v1.ValueCriticality"] = "com.sap.vocabularies.UI.v1.ValueCriticalityType";
    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityLabels"] = "com.sap.vocabularies.UI.v1.CriticalityLabelType";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionFields"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.UI.v1.Facets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.HeaderFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.QuickViewFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.QuickCreateFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.FilterFacets"] = "com.sap.vocabularies.UI.v1.ReferenceFacet";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionPresentationVariant"] = "com.sap.vocabularies.UI.v1.SelectionPresentationVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.PresentationVariant"] = "com.sap.vocabularies.UI.v1.PresentationVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionVariant"] = "com.sap.vocabularies.UI.v1.SelectionVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.ThingPerspective"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsSummary"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.PartOfPreview"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.Map"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.Gallery"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsImageURL"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsImage"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.MultiLineText"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.TextArrangement"] = "com.sap.vocabularies.UI.v1.TextArrangementType";
    TermToTypes["com.sap.vocabularies.UI.v1.Note"] = "com.sap.vocabularies.UI.v1.NoteType";
    TermToTypes["com.sap.vocabularies.UI.v1.Importance"] = "com.sap.vocabularies.UI.v1.ImportanceType";
    TermToTypes["com.sap.vocabularies.UI.v1.Hidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsCopyAction"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.CreateHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.UpdateHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DeleteHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.HiddenFilter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.AdaptationHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DataFieldDefault"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.Criticality"] = "com.sap.vocabularies.UI.v1.CriticalityType";
    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityCalculation"] = "com.sap.vocabularies.UI.v1.CriticalityCalculationType";
    TermToTypes["com.sap.vocabularies.UI.v1.Emphasized"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.OrderBy"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.UI.v1.ParameterDefaultValue"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationState"] = "com.sap.vocabularies.UI.v1.RecommendationStateType";
    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationList"] = "com.sap.vocabularies.UI.v1.RecommendationListType";
    TermToTypes["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DoNotCheckScaleOfMeasuredQuantity"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.HTML5.v1.CssDefaults"] = "com.sap.vocabularies.HTML5.v1.CssDefaultsType";
})(TermToTypes = exports.TermToTypes || (exports.TermToTypes = {}));


/***/ }),

/***/ 899:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VocabularyReferences = void 0;
/**
 * The list of vocabularies with default aliases.
 */
exports.VocabularyReferences = [
    { alias: "Auth", namespace: "Org.OData.Authorization.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Authorization.V1.xml" },
    { alias: "Core", namespace: "Org.OData.Core.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Core.V1.xml" },
    { alias: "Capabilities", namespace: "Org.OData.Capabilities.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Capabilities.V1.xml" },
    { alias: "Aggregation", namespace: "Org.OData.Aggregation.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Aggregation.V1.xml" },
    { alias: "Validation", namespace: "Org.OData.Validation.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Validation.V1.xml" },
    { alias: "Measures", namespace: "Org.OData.Measures.V1", uri: "https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Measures.V1.xml" },
    { alias: "Analytics", namespace: "com.sap.vocabularies.Analytics.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Analytics.xml" },
    { alias: "Common", namespace: "com.sap.vocabularies.Common.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Common.xml" },
    { alias: "CodeList", namespace: "com.sap.vocabularies.CodeList.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/CodeList.xml" },
    { alias: "Communication", namespace: "com.sap.vocabularies.Communication.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Communication.xml" },
    { alias: "Hierarchy", namespace: "com.sap.vocabularies.Hierarchy.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Hierarchy.xml" },
    { alias: "PersonalData", namespace: "com.sap.vocabularies.PersonalData.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/PersonalData.xml" },
    { alias: "Session", namespace: "com.sap.vocabularies.Session.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/Session.xml" },
    { alias: "UI", namespace: "com.sap.vocabularies.UI.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/UI.xml" },
    { alias: "HTML5", namespace: "com.sap.vocabularies.HTML5.v1", uri: "https://sap.github.io/odata-vocabularies/vocabularies/HTML5.xml" }
];


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(878);
/******/ 	AnnotationConverter = __webpack_exports__;
/******/ 	
/******/ })()
;

    return AnnotationConverter;
 },true);
 //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL25vZGVfbW9kdWxlcy8ucG5wbS9Ac2FwLXV4K2Fubm90YXRpb24tY29udmVydGVyQDAuNi4xMi9ub2RlX21vZHVsZXMvQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlci9zcmMvY29udmVydGVyLnRzIiwid2VicGFjazovL0Fubm90YXRpb25Db252ZXJ0ZXIvbm9kZV9tb2R1bGVzLy5wbnBtL0BzYXAtdXgrYW5ub3RhdGlvbi1jb252ZXJ0ZXJAMC42LjEyL25vZGVfbW9kdWxlcy9Ac2FwLXV4L2Fubm90YXRpb24tY29udmVydGVyL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL25vZGVfbW9kdWxlcy8ucG5wbS9Ac2FwLXV4K2Fubm90YXRpb24tY29udmVydGVyQDAuNi4xMi9ub2RlX21vZHVsZXMvQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlci9zcmMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci9ub2RlX21vZHVsZXMvLnBucG0vQHNhcC11eCthbm5vdGF0aW9uLWNvbnZlcnRlckAwLjYuMTIvbm9kZV9tb2R1bGVzL0BzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXIvc3JjL3dyaXRlYmFjay50cyIsIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL25vZGVfbW9kdWxlcy8ucG5wbS9Ac2FwLXV4K3ZvY2FidWxhcmllcy10eXBlc0AwLjcuNS9ub2RlX21vZHVsZXMvQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0VudW1Jc0ZsYWcuanMiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci9ub2RlX21vZHVsZXMvLnBucG0vQHNhcC11eCt2b2NhYnVsYXJpZXMtdHlwZXNAMC43LjUvbm9kZV9tb2R1bGVzL0BzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9UZXJtVG9UeXBlcy5qcyIsIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL25vZGVfbW9kdWxlcy8ucG5wbS9Ac2FwLXV4K3ZvY2FidWxhcmllcy10eXBlc0AwLjcuNS9ub2RlX21vZHVsZXMvQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1ZvY2FidWxhcnlSZWZlcmVuY2VzLmpzIiwid2VicGFjazovL0Fubm90YXRpb25Db252ZXJ0ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci93ZWJwYWNrL3N0YXJ0dXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSx3REFBb0c7QUFDcEcseUNBWWlCO0FBRWpCOztHQUVHO0FBQ0gsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUV0RDs7Ozs7O0dBTUc7QUFDSCxTQUFTLGdCQUFnQixDQUFDLFVBQWlCLEVBQUUsYUFBa0I7SUFDM0QsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxhQUFhLEVBQUU7UUFDckQsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNsQztJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsYUFBYSxDQUNsQixTQUFvQixFQUNwQixZQUFpQixFQUNqQixJQUFZLEVBQ1osZUFBd0I7O0lBRXhCLHNEQUFzRDtJQUN0RCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsWUFBWSxHQUFHLFNBQVMsQ0FBQyxDQUFDLG1EQUFtRDtLQUNoRjtJQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFF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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyx3Q0FBd0MsbUJBQW1CLEtBQUs7Ozs7Ozs7O0FDbFFwRDtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCLE1BQU0sMkpBQTJKO0FBQ2pLLE1BQU0seUlBQXlJO0FBQy9JLE1BQU0saUtBQWlLO0FBQ3ZLLE1BQU0sOEpBQThKO0FBQ3BLLE1BQU0sMkpBQTJKO0FBQ2pLLE1BQU0scUpBQXFKO0FBQzNKLE1BQU0sZ0pBQWdKO0FBQ3RKLE1BQU0sdUlBQXVJO0FBQzdJLE1BQU0sNklBQTZJO0FBQ25KLE1BQU0sNEpBQTRKO0FBQ2xLLE1BQU0sZ0pBQWdKO0FBQ3RKLE1BQU0seUpBQXlKO0FBQy9KLE1BQU0sMElBQTBJO0FBQ2hKLE1BQU0sMkhBQTJIO0FBQ2pJLE1BQU07QUFDTjs7Ozs7OztVQ3RCQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VDdEJBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6IkFubm90YXRpb25Db252ZXJ0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUge1xuICAgIEFjdGlvbixcbiAgICBBY3Rpb25JbXBvcnQsXG4gICAgQWN0aW9uUGFyYW1ldGVyLFxuICAgIEFubm90YXRpb24sXG4gICAgQW5ub3RhdGlvblJlY29yZCxcbiAgICBBcnJheVdpdGhJbmRleCxcbiAgICBCYXNlTmF2aWdhdGlvblByb3BlcnR5LFxuICAgIENvbXBsZXhUeXBlLFxuICAgIENvbnZlcnRlZE1ldGFkYXRhLFxuICAgIEVudGl0eUNvbnRhaW5lcixcbiAgICBFbnRpdHlTZXQsXG4gICAgRW50aXR5VHlwZSxcbiAgICBFeHByZXNzaW9uLFxuICAgIEZ1bGx5UXVhbGlmaWVkTmFtZSxcbiAgICBOYXZpZ2F0aW9uUHJvcGVydHksXG4gICAgUHJvcGVydHksXG4gICAgUHJvcGVydHlQYXRoLFxuICAgIFJhd0FjdGlvbixcbiAgICBSYXdBY3Rpb25JbXBvcnQsXG4gICAgUmF3QW5ub3RhdGlvbixcbiAgICBSYXdDb21wbGV4VHlwZSxcbiAgICBSYXdFbnRpdHlDb250YWluZXIsXG4gICAgUmF3RW50aXR5U2V0LFxuICAgIFJhd0VudGl0eVR5cGUsXG4gICAgUmF3TWV0YWRhdGEsXG4gICAgUmF3UHJvcGVydHksXG4gICAgUmF3U2NoZW1hLFxuICAgIFJhd1NpbmdsZXRvbixcbiAgICBSYXdUeXBlRGVmaW5pdGlvbixcbiAgICBSYXdWMk5hdmlnYXRpb25Qcm9wZXJ0eSxcbiAgICBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSxcbiAgICBSZW1vdmVBbm5vdGF0aW9uQW5kVHlwZSxcbiAgICBSZXNvbHV0aW9uVGFyZ2V0LFxuICAgIFNpbmdsZXRvbixcbiAgICBUeXBlRGVmaW5pdGlvblxufSBmcm9tICdAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcyc7XG5pbXBvcnQgeyBWb2NhYnVsYXJ5UmVmZXJlbmNlcyB9IGZyb20gJ0BzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Wb2NhYnVsYXJ5UmVmZXJlbmNlcyc7XG5pbXBvcnQge1xuICAgIGFkZEdldEJ5VmFsdWUsXG4gICAgYWxpYXMsXG4gICAgRGVjaW1hbCxcbiAgICBFbnVtSXNGbGFnLFxuICAgIGxhenksXG4gICAgc3BsaXRBdEZpcnN0LFxuICAgIHNwbGl0QXRMYXN0LFxuICAgIHN1YnN0cmluZ0JlZm9yZUZpcnN0LFxuICAgIHN1YnN0cmluZ0JlZm9yZUxhc3QsXG4gICAgVGVybVRvVHlwZXMsXG4gICAgdW5hbGlhc1xufSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBTeW1ib2wgdG8gZXh0ZW5kIGFuIGFubm90YXRpb24gd2l0aCB0aGUgcmVmZXJlbmNlIHRvIGl0cyB0YXJnZXQuXG4gKi9cbmNvbnN0IEFOTk9UQVRJT05fVEFSR0VUID0gU3ltYm9sKCdBbm5vdGF0aW9uIFRhcmdldCcpO1xuXG4vKipcbiAqIEFwcGVuZCBhbiBvYmplY3QgdG8gdGhlIGxpc3Qgb2YgdmlzaXRlZCBvYmplY3RzIGlmIGl0IGlzIGRpZmZlcmVudCBmcm9tIHRoZSBsYXN0IG9iamVjdCBpbiB0aGUgbGlzdC5cbiAqXG4gKiBAcGFyYW0gb2JqZWN0UGF0aCAgICBUaGUgbGlzdCBvZiB2aXNpdGVkIG9iamVjdHNcbiAqIEBwYXJhbSB2aXNpdGVkT2JqZWN0IFRoZSBvYmplY3RcbiAqIEByZXR1cm5zIFRoZSBsaXN0IG9mIHZpc2l0ZWQgb2JqZWN0c1xuICovXG5mdW5jdGlvbiBhcHBlbmRPYmplY3RQYXRoKG9iamVjdFBhdGg6IGFueVtdLCB2aXNpdGVkT2JqZWN0OiBhbnkpOiBhbnlbXSB7XG4gICAgaWYgKG9iamVjdFBhdGhbb2JqZWN0UGF0aC5sZW5ndGggLSAxXSAhPT0gdmlzaXRlZE9iamVjdCkge1xuICAgICAgICBvYmplY3RQYXRoLnB1c2godmlzaXRlZE9iamVjdCk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RQYXRoO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIGEgKHBvc3NpYmx5IHJlbGF0aXZlKSBwYXRoLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICAgICAgICBDb252ZXJ0ZXJcbiAqIEBwYXJhbSBzdGFydEVsZW1lbnQgICAgICBUaGUgc3RhcnRpbmcgcG9pbnQgaW4gY2FzZSBvZiByZWxhdGl2ZSBwYXRoIHJlc29sdXRpb25cbiAqIEBwYXJhbSBwYXRoICAgICAgICAgICAgICBUaGUgcGF0aCB0byByZXNvbHZlXG4gKiBAcGFyYW0gYW5ub3RhdGlvbnNUZXJtICAgT25seSBmb3IgZXJyb3IgcmVwb3J0aW5nOiBUaGUgYW5ub3RhdGlvbiB0ZXJtXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgcmVzb2x2ZWQgdGFyZ2V0IGFuZCB0aGUgZWxlbWVudHMgdGhhdCB3ZXJlIHZpc2l0ZWQgd2hpbGUgZ2V0dGluZyB0byB0aGUgdGFyZ2V0LlxuICovXG5mdW5jdGlvbiByZXNvbHZlVGFyZ2V0PFQ+KFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIHN0YXJ0RWxlbWVudDogYW55LFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBhbm5vdGF0aW9uc1Rlcm0/OiBzdHJpbmdcbik6IFJlc29sdXRpb25UYXJnZXQ8VD4ge1xuICAgIC8vIGFic29sdXRlIHBhdGhzIGFsd2F5cyBzdGFydCBhdCB0aGUgZW50aXR5IGNvbnRhaW5lclxuICAgIGlmIChwYXRoLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIHN0YXJ0RWxlbWVudCA9IHVuZGVmaW5lZDsgLy8gd2lsbCByZXNvbHZlIHRvIHRoZSBlbnRpdHkgY29udGFpbmVyIChzZWUgYmVsb3cpXG4gICAgfVxuXG4gICAgY29uc3QgcGF0aFNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpLnJlZHVjZSgodGFyZ2V0UGF0aCwgc2VnbWVudCkgPT4ge1xuICAgICAgICBpZiAoc2VnbWVudC5pbmNsdWRlcygnQCcpKSB7XG4gICAgICAgICAgICAvLyBTZXBhcmF0ZSBvdXQgdGhlIGFubm90YXRpb25cbiAgICAgICAgICAgIGNvbnN0IFtwYXRoUGFydCwgYW5ub3RhdGlvblBhcnRdID0gc3BsaXRBdEZpcnN0KHNlZ21lbnQsICdAJyk7XG4gICAgICAgICAgICB0YXJnZXRQYXRoLnB1c2gocGF0aFBhcnQpO1xuICAgICAgICAgICAgdGFyZ2V0UGF0aC5wdXNoKGBAJHthbm5vdGF0aW9uUGFydH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFBhdGgucHVzaChzZWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0UGF0aDtcbiAgICB9LCBbXSBhcyBzdHJpbmdbXSk7XG5cbiAgICAvLyBkZXRlcm1pbmUgdGhlIHN0YXJ0aW5nIHBvaW50IGZvciB0aGUgcmVzb2x1dGlvblxuICAgIGlmIChzdGFydEVsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBubyBzdGFydGluZyBwb2ludCBnaXZlbjogc3RhcnQgYXQgdGhlIGVudGl0eSBjb250YWluZXJcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgcGF0aFNlZ21lbnRzWzBdLnN0YXJ0c1dpdGgoYCR7Y29udmVydGVyLnJhd1NjaGVtYS5uYW1lc3BhY2V9LmApICYmXG4gICAgICAgICAgICBwYXRoU2VnbWVudHNbMF0gIT09IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbnRpdHlDb250YWluZXIoKT8uZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICkge1xuICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIGZ1bGx5IHF1YWxpZmllZCBuYW1lIGluIHRoZSBwYXRoIHRoYXQgaXMgbm90IHRoZSBlbnRpdHkgY29udGFpbmVyLlxuICAgICAgICAgICAgc3RhcnRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkRW50aXR5VHlwZShwYXRoU2VnbWVudHNbMF0pID8/XG4gICAgICAgICAgICAgICAgY29udmVydGVyLmdldENvbnZlcnRlZENvbXBsZXhUeXBlKHBhdGhTZWdtZW50c1swXSkgPz9cbiAgICAgICAgICAgICAgICBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQWN0aW9uKHBhdGhTZWdtZW50c1swXSk7XG4gICAgICAgICAgICBwYXRoU2VnbWVudHMuc2hpZnQoKTsgLy8gTGV0J3MgcmVtb3ZlIHRoZSBmaXJzdCBwYXRoIGVsZW1lbnRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0RWxlbWVudCA9IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbnRpdHlDb250YWluZXIoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3RhcnRFbGVtZW50W0FOTk9UQVRJT05fVEFSR0VUXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGFubm90YXRpb246IHN0YXJ0IGF0IHRoZSBhbm5vdGF0aW9uIHRhcmdldFxuICAgICAgICBzdGFydEVsZW1lbnQgPSBzdGFydEVsZW1lbnRbQU5OT1RBVElPTl9UQVJHRVRdO1xuICAgIH0gZWxzZSBpZiAoc3RhcnRFbGVtZW50Ll90eXBlID09PSAnUHJvcGVydHknKSB7XG4gICAgICAgIC8vIHByb3BlcnR5OiBzdGFydCBhdCB0aGUgZW50aXR5IHR5cGUgb3IgY29tcGxleCB0eXBlIHRoZSBwcm9wZXJ0eSBiZWxvbmdzIHRvXG4gICAgICAgIGNvbnN0IHBhcmVudEVsZW1lbnRGUU4gPSBzdWJzdHJpbmdCZWZvcmVGaXJzdChzdGFydEVsZW1lbnQuZnVsbHlRdWFsaWZpZWROYW1lLCAnLycpO1xuICAgICAgICBzdGFydEVsZW1lbnQgPVxuICAgICAgICAgICAgY29udmVydGVyLmdldENvbnZlcnRlZEVudGl0eVR5cGUocGFyZW50RWxlbWVudEZRTikgPz8gY29udmVydGVyLmdldENvbnZlcnRlZENvbXBsZXhUeXBlKHBhcmVudEVsZW1lbnRGUU4pO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHBhdGhTZWdtZW50cy5yZWR1Y2UoXG4gICAgICAgIChjdXJyZW50OiBSZXNvbHV0aW9uVGFyZ2V0PGFueT4sIHNlZ21lbnQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgY3VycmVudC5tZXNzYWdlcy5wdXNoKHsgbWVzc2FnZSB9KTtcbiAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50LnRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJlbnQub2JqZWN0UGF0aCA9IGFwcGVuZE9iamVjdFBhdGgoY3VycmVudC5vYmplY3RQYXRoLCBjdXJyZW50LnRhcmdldCk7XG5cbiAgICAgICAgICAgIC8vIEFubm90YXRpb25cbiAgICAgICAgICAgIGlmIChzZWdtZW50LnN0YXJ0c1dpdGgoJ0AnKSAmJiBzZWdtZW50ICE9PSAnQCR1aTUub3ZlcmxvYWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3ZvY2FidWxhcnlBbGlhcywgdGVybV0gPSBjb252ZXJ0ZXIuc3BsaXRUZXJtKHNlZ21lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFubm90YXRpb24gPSBjdXJyZW50LnRhcmdldC5hbm5vdGF0aW9uc1t2b2NhYnVsYXJ5QWxpYXMuc3Vic3RyaW5nKDEpXT8uW3Rlcm1dO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFubm90YXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IGFubm90YXRpb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBBbm5vdGF0aW9uICcke3NlZ21lbnQuc3Vic3RyaW5nKDEpfScgbm90IGZvdW5kIG9uICR7Y3VycmVudC50YXJnZXQuX3R5cGV9ICcke1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICAgICAgICAgICAgIH0nYFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vICRQYXRoIC8gJEFubm90YXRpb25QYXRoIHN5bnRheFxuICAgICAgICAgICAgaWYgKGN1cnJlbnQudGFyZ2V0LiR0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3ViUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnJEFubm90YXRpb25QYXRoJykge1xuICAgICAgICAgICAgICAgICAgICBzdWJQYXRoID0gY3VycmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50ID09PSAnJFBhdGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YlBhdGggPSBjdXJyZW50LnRhcmdldC5wYXRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzdWJQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViVGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIGN1cnJlbnQudGFyZ2V0W0FOTk9UQVRJT05fVEFSR0VUXSwgc3ViUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIHN1YlRhcmdldC5vYmplY3RQYXRoLmZvckVhY2goKHZpc2l0ZWRTdWJPYmplY3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50Lm9iamVjdFBhdGguaW5jbHVkZXModmlzaXRlZFN1Yk9iamVjdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Lm9iamVjdFBhdGggPSBhcHBlbmRPYmplY3RQYXRoKGN1cnJlbnQub2JqZWN0UGF0aCwgdmlzaXRlZFN1Yk9iamVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gc3ViVGFyZ2V0LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5vYmplY3RQYXRoID0gYXBwZW5kT2JqZWN0UGF0aChjdXJyZW50Lm9iamVjdFBhdGgsIGN1cnJlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0cmF2ZXJzZSBiYXNlZCBvbiB0aGUgZWxlbWVudCB0eXBlXG4gICAgICAgICAgICBzd2l0Y2ggKGN1cnJlbnQudGFyZ2V0Py5fdHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ1NjaGVtYSc6XG4gICAgICAgICAgICAgICAgICAgIC8vIG5leHQgZWxlbWVudDogRW50aXR5VHlwZSwgQ29tcGxleFR5cGUsIEFjdGlvbiwgRW50aXR5Q29udGFpbmVyID9cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdFbnRpdHlDb250YWluZXInOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aGlzRWxlbWVudCA9IGN1cnJlbnQudGFyZ2V0IGFzIEVudGl0eUNvbnRhaW5lcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQgPT09ICcnIHx8IGNvbnZlcnRlci51bmFsaWFzKHNlZ21lbnQpID09PSB0aGlzRWxlbWVudC5mdWxseVF1YWxpZmllZE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBlbGVtZW50OiBFbnRpdHlTZXQsIFNpbmdsZXRvbiBvciBBY3Rpb25JbXBvcnQ/XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0RWxlbWVudDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgQWN0aW9uSW1wb3J0IHwgdW5kZWZpbmVkID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzRWxlbWVudC5lbnRpdHlTZXRzLmJ5X25hbWUoc2VnbWVudCkgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzRWxlbWVudC5zaW5nbGV0b25zLmJ5X25hbWUoc2VnbWVudCkgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzRWxlbWVudC5hY3Rpb25JbXBvcnRzLmJ5X25hbWUoc2VnbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gbmV4dEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdFbnRpdHlTZXQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ1NpbmdsZXRvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhpc0VsZW1lbnQgPSBjdXJyZW50LnRhcmdldCBhcyBFbnRpdHlTZXQgfCBTaW5nbGV0b247XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQgPT09ICcnIHx8IHNlZ21lbnQgPT09ICckVHlwZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVtcHR5IFBhdGggYWZ0ZXIgYW4gRW50aXR5U2V0IG9yIFNpbmdsZXRvbiBtZWFucyBFbnRpdHlUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHRoaXNFbGVtZW50LmVudGl0eVR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnJCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQgPT09ICckTmF2aWdhdGlvblByb3BlcnR5QmluZGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzID0gdGhpc0VsZW1lbnQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gbmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3M7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRpbnVlIHJlc29sdmluZyBhdCB0aGUgRW50aXR5U2V0J3Mgb3IgU2luZ2xldG9uJ3MgdHlwZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSByZXNvbHZlVGFyZ2V0KGNvbnZlcnRlciwgdGhpc0VsZW1lbnQuZW50aXR5VHlwZSwgc2VnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gcmVzdWx0LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5vYmplY3RQYXRoID0gcmVzdWx0Lm9iamVjdFBhdGgucmVkdWNlKGFwcGVuZE9iamVjdFBhdGgsIGN1cnJlbnQub2JqZWN0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhc2UgJ0VudGl0eVR5cGUnOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aGlzRWxlbWVudCA9IGN1cnJlbnQudGFyZ2V0IGFzIEVudGl0eVR5cGU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnJyB8fCBzZWdtZW50ID09PSAnJFR5cGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpc0VsZW1lbnQuZW50aXR5UHJvcGVydGllcy5ieV9uYW1lKHNlZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC50YXJnZXQgPSBwcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmF2aWdhdGlvblByb3BlcnR5ID0gdGhpc0VsZW1lbnQubmF2aWdhdGlvblByb3BlcnRpZXMuYnlfbmFtZShzZWdtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYXZpZ2F0aW9uUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IG5hdmlnYXRpb25Qcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aW9uTmFtZSA9IHN1YnN0cmluZ0JlZm9yZUZpcnN0KGNvbnZlcnRlci51bmFsaWFzKHNlZ21lbnQpLCAnKCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gdGhpc0VsZW1lbnQuYWN0aW9uc1thY3Rpb25OYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ0FjdGlvbkltcG9ydCc6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29udGludWUgcmVzb2x2aW5nIGF0IHRoZSBBY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIGN1cnJlbnQudGFyZ2V0LmFjdGlvbiwgc2VnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gcmVzdWx0LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudC5vYmplY3RQYXRoID0gcmVzdWx0Lm9iamVjdFBhdGgucmVkdWNlKGFwcGVuZE9iamVjdFBhdGgsIGN1cnJlbnQub2JqZWN0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhc2UgJ0FjdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGhpc0VsZW1lbnQgPSBjdXJyZW50LnRhcmdldCBhcyBBY3Rpb247XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlZ21lbnQgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnQCR1aTUub3ZlcmxvYWQnIHx8IHNlZ21lbnQgPT09ICcwJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VnbWVudCA9PT0gJyRQYXJhbWV0ZXInICYmIHRoaXNFbGVtZW50LmlzQm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gdGhpc0VsZW1lbnQucGFyYW1ldGVycztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dEVsZW1lbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc0VsZW1lbnQucGFyYW1ldGVyc1tzZWdtZW50IGFzIGFueV0gPz9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNFbGVtZW50LnBhcmFtZXRlcnMuZmluZCgocGFyYW06IEFjdGlvblBhcmFtZXRlcikgPT4gcGFyYW0ubmFtZSA9PT0gc2VnbWVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IG5leHRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FzZSAnUHJvcGVydHknOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aGlzRWxlbWVudCA9IGN1cnJlbnQudGFyZ2V0IGFzIFByb3BlcnR5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcm9wZXJ0eSBvciBOYXZpZ2F0aW9uUHJvcGVydHkgb2YgdGhlIENvbXBsZXhUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gdGhpc0VsZW1lbnQudGFyZ2V0VHlwZSBhcyBDb21wbGV4VHlwZSB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHR5cGUucHJvcGVydGllcy5ieV9uYW1lKHNlZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHByb3BlcnR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHkgPSB0eXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmJ5X25hbWUoc2VnbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hdmlnYXRpb25Qcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IG5hdmlnYXRpb25Qcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnQWN0aW9uUGFyYW1ldGVyJzpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVmZXJlbmNlZFR5cGUgPSAoY3VycmVudC50YXJnZXQgYXMgQWN0aW9uUGFyYW1ldGVyKS50eXBlUmVmZXJlbmNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVmZXJlbmNlZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIHJlZmVyZW5jZWRUeXBlLCBzZWdtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gcmVzdWx0LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQub2JqZWN0UGF0aCA9IHJlc3VsdC5vYmplY3RQYXRoLnJlZHVjZShhcHBlbmRPYmplY3RQYXRoLCBjdXJyZW50Lm9iamVjdFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdOYXZpZ2F0aW9uUHJvcGVydHknOlxuICAgICAgICAgICAgICAgICAgICAvLyBjb250aW51ZSBhdCB0aGUgTmF2aWdhdGlvblByb3BlcnR5J3MgdGFyZ2V0IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIChjdXJyZW50LnRhcmdldCBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpLnRhcmdldFR5cGUsIHNlZ21lbnQpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnRhcmdldCA9IHJlc3VsdC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQub2JqZWN0UGF0aCA9IHJlc3VsdC5vYmplY3RQYXRoLnJlZHVjZShhcHBlbmRPYmplY3RQYXRoLCBjdXJyZW50Lm9iamVjdFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50ID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudC50YXJnZXRbc2VnbWVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudGFyZ2V0ID0gY3VycmVudC50YXJnZXRbc2VnbWVudF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Lm9iamVjdFBhdGggPSBhcHBlbmRPYmplY3RQYXRoKGN1cnJlbnQub2JqZWN0UGF0aCwgY3VycmVudC50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICAgICAgICAgIGBFbGVtZW50ICcke3NlZ21lbnR9JyBub3QgZm91bmQgYXQgJHtjdXJyZW50LnRhcmdldC5fdHlwZX0gJyR7Y3VycmVudC50YXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lfSdgXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICB7IHRhcmdldDogc3RhcnRFbGVtZW50LCBvYmplY3RQYXRoOiBbXSwgbWVzc2FnZXM6IFtdIH1cbiAgICApO1xuXG4gICAgLy8gRGlhZ25vc3RpY3NcbiAgICByZXN1bHQubWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSkgPT4gY29udmVydGVyLmxvZ0Vycm9yKG1lc3NhZ2UubWVzc2FnZSkpO1xuICAgIGlmICghcmVzdWx0LnRhcmdldCkge1xuICAgICAgICBpZiAoYW5ub3RhdGlvbnNUZXJtKSB7XG4gICAgICAgICAgICBjb25zdCBhbm5vdGF0aW9uVHlwZSA9IGluZmVyVHlwZUZyb21UZXJtKGNvbnZlcnRlciwgYW5ub3RhdGlvbnNUZXJtLCBzdGFydEVsZW1lbnQuZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICAgICAgICAgIGNvbnZlcnRlci5sb2dFcnJvcihcbiAgICAgICAgICAgICAgICAnVW5hYmxlIHRvIHJlc29sdmUgdGhlIHBhdGggZXhwcmVzc2lvbjogJyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnSGludDogQ2hlY2sgYW5kIGNvcnJlY3QgdGhlIHBhdGggdmFsdWVzIHVuZGVyIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlIGluIHRoZSBtZXRhZGF0YSAoYW5ub3RhdGlvbi54bWwgZmlsZSBvciBDRFMgYW5ub3RhdGlvbnMgZm9yIHRoZSBhcHBsaWNhdGlvbik6IFxcblxcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPEFubm90YXRpb24gVGVybSA9ICcgK1xuICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uc1Rlcm0gK1xuICAgICAgICAgICAgICAgICAgICAnPicgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICc8UmVjb3JkIFR5cGUgPSAnICtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvblR5cGUgK1xuICAgICAgICAgICAgICAgICAgICAnPicgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICc8QW5ub3RhdGlvblBhdGggPSAnICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArXG4gICAgICAgICAgICAgICAgICAgICc+J1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnZlcnRlci5sb2dFcnJvcihcbiAgICAgICAgICAgICAgICAnVW5hYmxlIHRvIHJlc29sdmUgdGhlIHBhdGggZXhwcmVzc2lvbjogJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGggK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJ0hpbnQ6IENoZWNrIGFuZCBjb3JyZWN0IHRoZSBwYXRoIHZhbHVlcyB1bmRlciB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZSBpbiB0aGUgbWV0YWRhdGEgKGFubm90YXRpb24ueG1sIGZpbGUgb3IgQ0RTIGFubm90YXRpb25zIGZvciB0aGUgYXBwbGljYXRpb24pOiBcXG5cXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxBbm5vdGF0aW9uIFRlcm0gPSAnICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aFNlZ21lbnRzWzBdICtcbiAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPFByb3BlcnR5VmFsdWUgIFBhdGg9ICcgK1xuICAgICAgICAgICAgICAgICAgICBwYXRoU2VnbWVudHNbMV0gK1xuICAgICAgICAgICAgICAgICAgICAnPidcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFR5cGVndWFyZCB0byBjaGVjayBpZiB0aGUgcGF0aCBjb250YWlucyBhbiBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBwYXRoU3RyIHRoZSBwYXRoIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGFuIGFubm90YXRpb24gaW4gdGhlIHBhdGguXG4gKi9cbmZ1bmN0aW9uIGlzQW5ub3RhdGlvblBhdGgocGF0aFN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHBhdGhTdHIuaW5jbHVkZXMoJ0AnKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VWYWx1ZShcbiAgICBjb252ZXJ0ZXI6IENvbnZlcnRlcixcbiAgICBjdXJyZW50VGFyZ2V0OiBhbnksXG4gICAgY3VycmVudFRlcm06IHN0cmluZyxcbiAgICBjdXJyZW50UHJvcGVydHk6IHN0cmluZyxcbiAgICBjdXJyZW50U291cmNlOiBzdHJpbmcsXG4gICAgcHJvcGVydHlWYWx1ZTogRXhwcmVzc2lvbixcbiAgICB2YWx1ZUZRTjogc3RyaW5nXG4pIHtcbiAgICBpZiAocHJvcGVydHlWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHN3aXRjaCAocHJvcGVydHlWYWx1ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5TdHJpbmc7XG4gICAgICAgIGNhc2UgJ0ludCc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5JbnQ7XG4gICAgICAgIGNhc2UgJ0Jvb2wnOlxuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5VmFsdWUuQm9vbDtcbiAgICAgICAgY2FzZSAnRGVjaW1hbCc6XG4gICAgICAgICAgICByZXR1cm4gRGVjaW1hbChwcm9wZXJ0eVZhbHVlLkRlY2ltYWwpO1xuICAgICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eVZhbHVlLkRhdGU7XG4gICAgICAgIGNhc2UgJ0VudW1NZW1iZXInOlxuICAgICAgICAgICAgY29uc3Qgc3BsaXRFbnVtID0gcHJvcGVydHlWYWx1ZS5FbnVtTWVtYmVyLnNwbGl0KCcgJykubWFwKChlbnVtVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmFsaWFzZWQgPSBjb252ZXJ0ZXIudW5hbGlhcyhlbnVtVmFsdWUpID8/ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiBhbGlhcyhWb2NhYnVsYXJ5UmVmZXJlbmNlcywgdW5hbGlhc2VkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNwbGl0RW51bVswXSAhPT0gdW5kZWZpbmVkICYmIEVudW1Jc0ZsYWdbc3Vic3RyaW5nQmVmb3JlRmlyc3Qoc3BsaXRFbnVtWzBdLCAnLycpXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzcGxpdEVudW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3BsaXRFbnVtWzBdO1xuXG4gICAgICAgIGNhc2UgJ1Byb3BlcnR5UGF0aCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wZXJ0eVZhbHVlLlByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IHZhbHVlRlFOLFxuICAgICAgICAgICAgICAgICR0YXJnZXQ6IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCBjdXJyZW50VGFyZ2V0LCBwcm9wZXJ0eVZhbHVlLlByb3BlcnR5UGF0aCwgY3VycmVudFRlcm0pLnRhcmdldCxcbiAgICAgICAgICAgICAgICBbQU5OT1RBVElPTl9UQVJHRVRdOiBjdXJyZW50VGFyZ2V0XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wZXJ0eVZhbHVlLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiB2YWx1ZUZRTixcbiAgICAgICAgICAgICAgICAkdGFyZ2V0OiByZXNvbHZlVGFyZ2V0KGNvbnZlcnRlciwgY3VycmVudFRhcmdldCwgcHJvcGVydHlWYWx1ZS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBjdXJyZW50VGVybSlcbiAgICAgICAgICAgICAgICAgICAgLnRhcmdldCxcbiAgICAgICAgICAgICAgICBbQU5OT1RBVElPTl9UQVJHRVRdOiBjdXJyZW50VGFyZ2V0XG4gICAgICAgICAgICB9O1xuICAgICAgICBjYXNlICdBbm5vdGF0aW9uUGF0aCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb3BlcnR5VmFsdWUuQW5ub3RhdGlvblBhdGgsXG4gICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiB2YWx1ZUZRTixcbiAgICAgICAgICAgICAgICAkdGFyZ2V0OiByZXNvbHZlVGFyZ2V0KFxuICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZXIsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQsXG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnRlci51bmFsaWFzKHByb3BlcnR5VmFsdWUuQW5ub3RhdGlvblBhdGgpLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGVybVxuICAgICAgICAgICAgICAgICkudGFyZ2V0LFxuICAgICAgICAgICAgICAgIGFubm90YXRpb25zVGVybTogY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgdGVybTogJycsXG4gICAgICAgICAgICAgICAgcGF0aDogJycsXG4gICAgICAgICAgICAgICAgW0FOTk9UQVRJT05fVEFSR0VUXTogY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSAnUGF0aCc6XG4gICAgICAgICAgICBjb25zdCAkdGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIGN1cnJlbnRUYXJnZXQsIHByb3BlcnR5VmFsdWUuUGF0aCwgY3VycmVudFRlcm0pLnRhcmdldDtcbiAgICAgICAgICAgIGlmIChpc0Fubm90YXRpb25QYXRoKHByb3BlcnR5VmFsdWUuUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAvLyBpbmxpbmUgdGhlIHRhcmdldFxuICAgICAgICAgICAgICAgIHJldHVybiAkdGFyZ2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUGF0aCcsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IHByb3BlcnR5VmFsdWUuUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiB2YWx1ZUZRTixcbiAgICAgICAgICAgICAgICAgICAgJHRhcmdldDogJHRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgW0FOTk9UQVRJT05fVEFSR0VUXTogY3VycmVudFRhcmdldFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgY2FzZSAnUmVjb3JkJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVJlY29yZChcbiAgICAgICAgICAgICAgICBjb252ZXJ0ZXIsXG4gICAgICAgICAgICAgICAgY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICBjdXJyZW50UHJvcGVydHksXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZSxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlLlJlY29yZCxcbiAgICAgICAgICAgICAgICB2YWx1ZUZRTlxuICAgICAgICAgICAgKTtcbiAgICAgICAgY2FzZSAnQ29sbGVjdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VDb2xsZWN0aW9uKFxuICAgICAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUZXJtLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWUuQ29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICB2YWx1ZUZRTlxuICAgICAgICAgICAgKTtcbiAgICAgICAgY2FzZSAnQXBwbHknOlxuICAgICAgICBjYXNlICdOdWxsJzpcbiAgICAgICAgY2FzZSAnTm90JzpcbiAgICAgICAgY2FzZSAnRXEnOlxuICAgICAgICBjYXNlICdOZSc6XG4gICAgICAgIGNhc2UgJ0d0JzpcbiAgICAgICAgY2FzZSAnR2UnOlxuICAgICAgICBjYXNlICdMdCc6XG4gICAgICAgIGNhc2UgJ0xlJzpcbiAgICAgICAgY2FzZSAnSWYnOlxuICAgICAgICBjYXNlICdBbmQnOlxuICAgICAgICBjYXNlICdPcic6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZTtcbiAgICB9XG59XG5cbi8qKlxuICogSW5mZXIgdGhlIHR5cGUgb2YgYSB0ZXJtIGJhc2VkIG9uIGl0cyB0eXBlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICAgICAgICBDb252ZXJ0ZXJcbiAqIEBwYXJhbSBhbm5vdGF0aW9uc1Rlcm0gICBUaGUgYW5ub3RhdGlvbiB0ZXJtXG4gKiBAcGFyYW0gYW5ub3RhdGlvblRhcmdldCAgVGhlIGFubm90YXRpb24gdGFyZ2V0XG4gKiBAcGFyYW0gY3VycmVudFByb3BlcnR5ICAgVGhlIGN1cnJlbnQgcHJvcGVydHkgb2YgdGhlIHJlY29yZFxuICogQHJldHVybnMgVGhlIGluZmVycmVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGluZmVyVHlwZUZyb21UZXJtKFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIGFubm90YXRpb25zVGVybTogc3RyaW5nLFxuICAgIGFubm90YXRpb25UYXJnZXQ6IHN0cmluZyxcbiAgICBjdXJyZW50UHJvcGVydHk/OiBzdHJpbmdcbikge1xuICAgIGxldCB0YXJnZXRUeXBlID0gKFRlcm1Ub1R5cGVzIGFzIGFueSlbYW5ub3RhdGlvbnNUZXJtXTtcbiAgICBpZiAoY3VycmVudFByb3BlcnR5KSB7XG4gICAgICAgIGFubm90YXRpb25zVGVybSA9IGAke3N1YnN0cmluZ0JlZm9yZUxhc3QoYW5ub3RhdGlvbnNUZXJtLCAnLicpfS4ke2N1cnJlbnRQcm9wZXJ0eX1gO1xuICAgICAgICB0YXJnZXRUeXBlID0gKFRlcm1Ub1R5cGVzIGFzIGFueSlbYW5ub3RhdGlvbnNUZXJtXTtcbiAgICB9XG5cbiAgICBjb252ZXJ0ZXIubG9nRXJyb3IoXG4gICAgICAgIGBUaGUgdHlwZSBvZiB0aGUgcmVjb3JkIHVzZWQgd2l0aGluIHRoZSB0ZXJtICR7YW5ub3RhdGlvbnNUZXJtfSB3YXMgbm90IGRlZmluZWQgYW5kIHdhcyBpbmZlcnJlZCBhcyAke3RhcmdldFR5cGV9LlxuSGludDogSWYgcG9zc2libGUsIHRyeSB0byBtYWludGFpbiB0aGUgVHlwZSBwcm9wZXJ0eSBmb3IgZWFjaCBSZWNvcmQuXG48QW5ub3RhdGlvbnMgVGFyZ2V0PVwiJHthbm5vdGF0aW9uVGFyZ2V0fVwiPlxuXHQ8QW5ub3RhdGlvbiBUZXJtPVwiJHthbm5vdGF0aW9uc1Rlcm19XCI+XG5cdFx0PFJlY29yZD4uLi48L1JlY29yZD5cblx0PC9Bbm5vdGF0aW9uPlxuPC9Bbm5vdGF0aW9ucz5gXG4gICAgKTtcblxuICAgIHJldHVybiB0YXJnZXRUeXBlO1xufVxuXG5mdW5jdGlvbiBpc0RhdGFGaWVsZFdpdGhGb3JBY3Rpb24oYW5ub3RhdGlvbkNvbnRlbnQ6IGFueSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIGFubm90YXRpb25Db250ZW50Lmhhc093blByb3BlcnR5KCdBY3Rpb24nKSAmJlxuICAgICAgICAoYW5ub3RhdGlvbkNvbnRlbnQuJFR5cGUgPT09ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb24nIHx8XG4gICAgICAgICAgICBhbm5vdGF0aW9uQ29udGVudC4kVHlwZSA9PT0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb24nKVxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVjb3JkVHlwZShcbiAgICBjb252ZXJ0ZXI6IENvbnZlcnRlcixcbiAgICBjdXJyZW50VGVybTogc3RyaW5nLFxuICAgIGN1cnJlbnRUYXJnZXQ6IGFueSxcbiAgICBjdXJyZW50UHJvcGVydHk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICByZWNvcmREZWZpbml0aW9uOiBBbm5vdGF0aW9uUmVjb3JkXG4pIHtcbiAgICBsZXQgdGFyZ2V0VHlwZTtcbiAgICBpZiAoIXJlY29yZERlZmluaXRpb24udHlwZSAmJiBjdXJyZW50VGVybSkge1xuICAgICAgICB0YXJnZXRUeXBlID0gaW5mZXJUeXBlRnJvbVRlcm0oY29udmVydGVyLCBjdXJyZW50VGVybSwgY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUsIGN1cnJlbnRQcm9wZXJ0eSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGFyZ2V0VHlwZSA9IGNvbnZlcnRlci51bmFsaWFzKHJlY29yZERlZmluaXRpb24udHlwZSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRUeXBlO1xufVxuXG5mdW5jdGlvbiBwYXJzZVJlY29yZChcbiAgICBjb252ZXJ0ZXI6IENvbnZlcnRlcixcbiAgICBjdXJyZW50VGVybTogc3RyaW5nLFxuICAgIGN1cnJlbnRUYXJnZXQ6IGFueSxcbiAgICBjdXJyZW50UHJvcGVydHk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjdXJyZW50U291cmNlOiBzdHJpbmcsXG4gICAgYW5ub3RhdGlvblJlY29yZDogQW5ub3RhdGlvblJlY29yZCxcbiAgICBjdXJyZW50RlFOOiBzdHJpbmdcbikge1xuICAgIGNvbnN0IHJlY29yZDogYW55ID0ge1xuICAgICAgICAkVHlwZTogcGFyc2VSZWNvcmRUeXBlKGNvbnZlcnRlciwgY3VycmVudFRlcm0sIGN1cnJlbnRUYXJnZXQsIGN1cnJlbnRQcm9wZXJ0eSwgYW5ub3RhdGlvblJlY29yZCksXG4gICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogY3VycmVudEZRTixcbiAgICAgICAgW0FOTk9UQVRJT05fVEFSR0VUXTogY3VycmVudFRhcmdldCxcbiAgICAgICAgX19zb3VyY2U6IGN1cnJlbnRTb3VyY2VcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eVZhbHVlIG9mIGFubm90YXRpb25SZWNvcmQucHJvcGVydHlWYWx1ZXMpIHtcbiAgICAgICAgbGF6eShyZWNvcmQsIHByb3BlcnR5VmFsdWUubmFtZSwgKCkgPT5cbiAgICAgICAgICAgIHBhcnNlVmFsdWUoXG4gICAgICAgICAgICAgICAgY29udmVydGVyLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQsXG4gICAgICAgICAgICAgICAgY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZS5uYW1lLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTb3VyY2UsXG4gICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICBgJHtjdXJyZW50RlFOfS8ke3Byb3BlcnR5VmFsdWUubmFtZX1gXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gYW5ub3RhdGlvbnMgb24gdGhlIHJlY29yZFxuICAgIGxhenkocmVjb3JkLCAnYW5ub3RhdGlvbnMnLCByZXNvbHZlQW5ub3RhdGlvbnNPbkFubm90YXRpb24oY29udmVydGVyLCBhbm5vdGF0aW9uUmVjb3JkLCByZWNvcmQpKTtcblxuICAgIGlmIChpc0RhdGFGaWVsZFdpdGhGb3JBY3Rpb24ocmVjb3JkKSkge1xuICAgICAgICBsYXp5KHJlY29yZCwgJ0FjdGlvblRhcmdldCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvblRhcmdldEZRTiA9IGNvbnZlcnRlci51bmFsaWFzKHJlY29yZC5BY3Rpb24/LnRvU3RyaW5nKCkpO1xuXG4gICAgICAgICAgICAvLyAoMSkgQm91bmQgYWN0aW9uIG9mIHRoZSBhbm5vdGF0aW9uIHRhcmdldD9cbiAgICAgICAgICAgIGxldCBhY3Rpb25UYXJnZXQgPSBjdXJyZW50VGFyZ2V0LmFjdGlvbnM/LlthY3Rpb25UYXJnZXRGUU5dO1xuXG4gICAgICAgICAgICBpZiAoIWFjdGlvblRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vICgyKSBBY3Rpb25JbXBvcnQgKD0gdW5ib3VuZCBhY3Rpb24pP1xuICAgICAgICAgICAgICAgIGFjdGlvblRhcmdldCA9IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRBY3Rpb25JbXBvcnQoYWN0aW9uVGFyZ2V0RlFOKT8uYWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWFjdGlvblRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vICgzKSBCb3VuZCBhY3Rpb24gb2YgYSBkaWZmZXJlbnQgRW50aXR5VHlwZVxuICAgICAgICAgICAgICAgIGFjdGlvblRhcmdldCA9IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRBY3Rpb24oYWN0aW9uVGFyZ2V0RlFOKTtcbiAgICAgICAgICAgICAgICBpZiAoIWFjdGlvblRhcmdldD8uaXNCb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25UYXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWFjdGlvblRhcmdldCkge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlci5sb2dFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYCR7cmVjb3JkLmZ1bGx5UXVhbGlmaWVkTmFtZX06IFVuYWJsZSB0byByZXNvbHZlICcke3JlY29yZC5BY3Rpb259JyAoJyR7YWN0aW9uVGFyZ2V0RlFOfScpYFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uVGFyZ2V0O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZDtcbn1cblxuZXhwb3J0IHR5cGUgQ29sbGVjdGlvblR5cGUgPVxuICAgIHwgJ1Byb3BlcnR5UGF0aCdcbiAgICB8ICdQYXRoJ1xuICAgIHwgJ0lmJ1xuICAgIHwgJ0FwcGx5J1xuICAgIHwgJ051bGwnXG4gICAgfCAnQW5kJ1xuICAgIHwgJ0VxJ1xuICAgIHwgJ05lJ1xuICAgIHwgJ05vdCdcbiAgICB8ICdHdCdcbiAgICB8ICdHZSdcbiAgICB8ICdMdCdcbiAgICB8ICdMZSdcbiAgICB8ICdPcidcbiAgICB8ICdBbm5vdGF0aW9uUGF0aCdcbiAgICB8ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJ1xuICAgIHwgJ1JlY29yZCdcbiAgICB8ICdTdHJpbmcnXG4gICAgfCAnRW1wdHlDb2xsZWN0aW9uJztcblxuLyoqXG4gKiBSZXRyaWV2ZSBvciBpbmZlciB0aGUgY29sbGVjdGlvbiB0eXBlIGJhc2VkIG9uIGl0cyBjb250ZW50LlxuICpcbiAqIEBwYXJhbSBjb2xsZWN0aW9uRGVmaW5pdGlvblxuICogQHJldHVybnMgdGhlIHR5cGUgb2YgdGhlIGNvbGxlY3Rpb25cbiAqL1xuZnVuY3Rpb24gZ2V0T3JJbmZlckNvbGxlY3Rpb25UeXBlKGNvbGxlY3Rpb25EZWZpbml0aW9uOiBhbnlbXSk6IENvbGxlY3Rpb25UeXBlIHtcbiAgICBsZXQgdHlwZTogQ29sbGVjdGlvblR5cGUgPSAoY29sbGVjdGlvbkRlZmluaXRpb24gYXMgYW55KS50eXBlO1xuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQgJiYgY29sbGVjdGlvbkRlZmluaXRpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBmaXJzdENvbEl0ZW0gPSBjb2xsZWN0aW9uRGVmaW5pdGlvblswXTtcbiAgICAgICAgaWYgKGZpcnN0Q29sSXRlbS5oYXNPd25Qcm9wZXJ0eSgnUHJvcGVydHlQYXRoJykpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnUHJvcGVydHlQYXRoJztcbiAgICAgICAgfSBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ1BhdGgnKSkge1xuICAgICAgICAgICAgdHlwZSA9ICdQYXRoJztcbiAgICAgICAgfSBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ0Fubm90YXRpb25QYXRoJykpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnQW5ub3RhdGlvblBhdGgnO1xuICAgICAgICB9IGVsc2UgaWYgKGZpcnN0Q29sSXRlbS5oYXNPd25Qcm9wZXJ0eSgnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcpKSB7XG4gICAgICAgICAgICB0eXBlID0gJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgdHlwZW9mIGZpcnN0Q29sSXRlbSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ3R5cGUnKSB8fCBmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ3Byb3BlcnR5VmFsdWVzJykpXG4gICAgICAgICkge1xuICAgICAgICAgICAgdHlwZSA9ICdSZWNvcmQnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaXJzdENvbEl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0eXBlID0gJ1N0cmluZyc7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0eXBlID0gJ0VtcHR5Q29sbGVjdGlvbic7XG4gICAgfVxuICAgIHJldHVybiB0eXBlO1xufVxuXG5mdW5jdGlvbiBwYXJzZUNvbGxlY3Rpb24oXG4gICAgY29udmVydGVyOiBDb252ZXJ0ZXIsXG4gICAgY3VycmVudFRhcmdldDogYW55LFxuICAgIGN1cnJlbnRUZXJtOiBzdHJpbmcsXG4gICAgY3VycmVudFByb3BlcnR5OiBzdHJpbmcsXG4gICAgY3VycmVudFNvdXJjZTogc3RyaW5nLFxuICAgIGNvbGxlY3Rpb25EZWZpbml0aW9uOiBhbnlbXSxcbiAgICBwYXJlbnRGUU46IHN0cmluZ1xuKSB7XG4gICAgY29uc3QgY29sbGVjdGlvbkRlZmluaXRpb25UeXBlID0gZ2V0T3JJbmZlckNvbGxlY3Rpb25UeXBlKGNvbGxlY3Rpb25EZWZpbml0aW9uKTtcblxuICAgIHN3aXRjaCAoY29sbGVjdGlvbkRlZmluaXRpb25UeXBlKSB7XG4gICAgICAgIGNhc2UgJ1Byb3BlcnR5UGF0aCc6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChwcm9wZXJ0eVBhdGgsIHByb3BlcnR5SWR4KTogUHJvcGVydHlQYXRoID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFByb3BlcnR5UGF0aCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wZXJ0eVBhdGguUHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IGAke3BhcmVudEZRTn0vJHtwcm9wZXJ0eUlkeH1gXG4gICAgICAgICAgICAgICAgfSBhcyBhbnk7XG5cbiAgICAgICAgICAgICAgICBsYXp5KFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICckdGFyZ2V0JyxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVUYXJnZXQ8UHJvcGVydHk+KGNvbnZlcnRlciwgY3VycmVudFRhcmdldCwgcHJvcGVydHlQYXRoLlByb3BlcnR5UGF0aCwgY3VycmVudFRlcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRhcmdldCA/PyAoe30gYXMgUHJvcGVydHkpIC8vIFRPRE86ICR0YXJnZXQgaXMgbWFuZGF0b3J5IC0gdGhyb3cgYW4gZXJyb3I/XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjYXNlICdQYXRoJzpcbiAgICAgICAgICAgIC8vIFRPRE86IG1ha2UgbGF6eT9cbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKHBhdGhWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlVGFyZ2V0KGNvbnZlcnRlciwgY3VycmVudFRhcmdldCwgcGF0aFZhbHVlLlBhdGgsIGN1cnJlbnRUZXJtKS50YXJnZXQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjYXNlICdBbm5vdGF0aW9uUGF0aCc6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChhbm5vdGF0aW9uUGF0aCwgYW5ub3RhdGlvbklkeCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0Fubm90YXRpb25QYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFubm90YXRpb25QYXRoLkFubm90YXRpb25QYXRoLFxuICAgICAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IGAke3BhcmVudEZRTn0vJHthbm5vdGF0aW9uSWR4fWAsXG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25zVGVybTogY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgICAgIHRlcm06ICcnLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnJ1xuICAgICAgICAgICAgICAgIH0gYXMgYW55O1xuXG4gICAgICAgICAgICAgICAgbGF6eShcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAnJHRhcmdldCcsXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHJlc29sdmVUYXJnZXQoY29udmVydGVyLCBjdXJyZW50VGFyZ2V0LCBhbm5vdGF0aW9uUGF0aC5Bbm5vdGF0aW9uUGF0aCwgY3VycmVudFRlcm0pLnRhcmdldFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY2FzZSAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCc6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChuYXZQcm9wZXJ0eVBhdGgsIG5hdlByb3BJZHgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbmF2UHJvcGVydHlQYXRoLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPz8gJyc7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IGAke3BhcmVudEZRTn0vJHtuYXZQcm9wSWR4fWBcbiAgICAgICAgICAgICAgICB9IGFzIGFueTtcblxuICAgICAgICAgICAgICAgIGlmIChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuJHRhcmdldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYXp5KFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgJyR0YXJnZXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4gcmVzb2x2ZVRhcmdldChjb252ZXJ0ZXIsIGN1cnJlbnRUYXJnZXQsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIGN1cnJlbnRUZXJtKS50YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY2FzZSAnUmVjb3JkJzpcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKHJlY29yZERlZmluaXRpb24sIHJlY29yZElkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVJlY29yZChcbiAgICAgICAgICAgICAgICAgICAgY29udmVydGVyLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGVybSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFByb3BlcnR5LFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlLFxuICAgICAgICAgICAgICAgICAgICByZWNvcmREZWZpbml0aW9uLFxuICAgICAgICAgICAgICAgICAgICBgJHtwYXJlbnRGUU59LyR7cmVjb3JkSWR4fWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY2FzZSAnQXBwbHknOlxuICAgICAgICBjYXNlICdOdWxsJzpcbiAgICAgICAgY2FzZSAnSWYnOlxuICAgICAgICBjYXNlICdFcSc6XG4gICAgICAgIGNhc2UgJ05lJzpcbiAgICAgICAgY2FzZSAnTHQnOlxuICAgICAgICBjYXNlICdHdCc6XG4gICAgICAgIGNhc2UgJ0xlJzpcbiAgICAgICAgY2FzZSAnR2UnOlxuICAgICAgICBjYXNlICdOb3QnOlxuICAgICAgICBjYXNlICdBbmQnOlxuICAgICAgICBjYXNlICdPcic6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChpZlZhbHVlKSA9PiBpZlZhbHVlKTtcblxuICAgICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgoc3RyaW5nVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0cmluZ1ZhbHVlID09PSAnc3RyaW5nJyB8fCBzdHJpbmdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdWYWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWUuU3RyaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbkRlZmluaXRpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBjYXNlJyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1Y0TmF2aWdhdGlvblByb3BlcnR5KFxuICAgIG5hdlByb3A6IFJhd1YyTmF2aWdhdGlvblByb3BlcnR5IHwgUmF3VjROYXZpZ2F0aW9uUHJvcGVydHlcbik6IG5hdlByb3AgaXMgUmF3VjROYXZpZ2F0aW9uUHJvcGVydHkge1xuICAgIHJldHVybiAhIShuYXZQcm9wIGFzIEJhc2VOYXZpZ2F0aW9uUHJvcGVydHkpLnRhcmdldFR5cGVOYW1lO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0QW5ub3RhdGlvbihjb252ZXJ0ZXI6IENvbnZlcnRlciwgdGFyZ2V0OiBhbnksIHJhd0Fubm90YXRpb246IFJhd0Fubm90YXRpb24pOiBBbm5vdGF0aW9uIHtcbiAgICBsZXQgYW5ub3RhdGlvbjogYW55O1xuICAgIGlmIChyYXdBbm5vdGF0aW9uLnJlY29yZCkge1xuICAgICAgICBhbm5vdGF0aW9uID0gcGFyc2VSZWNvcmQoXG4gICAgICAgICAgICBjb252ZXJ0ZXIsXG4gICAgICAgICAgICByYXdBbm5vdGF0aW9uLnRlcm0sXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAnJyxcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuX19zb3VyY2UsXG4gICAgICAgICAgICByYXdBbm5vdGF0aW9uLnJlY29yZCxcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChyYXdBbm5vdGF0aW9uLmNvbGxlY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhbm5vdGF0aW9uID0gcGFyc2VWYWx1ZShcbiAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24udGVybSxcbiAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgKHJhd0Fubm90YXRpb24gYXMgYW55KS5fX3NvdXJjZSxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24udmFsdWUgPz8geyB0eXBlOiAnQm9vbCcsIEJvb2w6IHRydWUgfSxcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChyYXdBbm5vdGF0aW9uLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgYW5ub3RhdGlvbiA9IHBhcnNlQ29sbGVjdGlvbihcbiAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24udGVybSxcbiAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgKHJhd0Fubm90YXRpb24gYXMgYW55KS5fX3NvdXJjZSxcbiAgICAgICAgICAgIHJhd0Fubm90YXRpb24uY29sbGVjdGlvbixcbiAgICAgICAgICAgIChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBjYXNlJyk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlb2YgYW5ub3RhdGlvbikge1xuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy13cmFwcGVyc1xuICAgICAgICAgICAgYW5ub3RhdGlvbiA9IG5ldyBTdHJpbmcoYW5ub3RhdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LXdyYXBwZXJzXG4gICAgICAgICAgICBhbm5vdGF0aW9uID0gbmV3IEJvb2xlYW4oYW5ub3RhdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgIGFubm90YXRpb24gPSBuZXcgTnVtYmVyKGFubm90YXRpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSA9IChyYXdBbm5vdGF0aW9uIGFzIGFueSkuZnVsbHlRdWFsaWZpZWROYW1lO1xuICAgIGFubm90YXRpb25bQU5OT1RBVElPTl9UQVJHRVRdID0gdGFyZ2V0O1xuXG4gICAgY29uc3QgW3ZvY0FsaWFzLCB2b2NUZXJtXSA9IGNvbnZlcnRlci5zcGxpdFRlcm0ocmF3QW5ub3RhdGlvbi50ZXJtKTtcblxuICAgIGFubm90YXRpb24udGVybSA9IGNvbnZlcnRlci51bmFsaWFzKGAke3ZvY0FsaWFzfS4ke3ZvY1Rlcm19YCwgVm9jYWJ1bGFyeVJlZmVyZW5jZXMpO1xuICAgIGFubm90YXRpb24ucXVhbGlmaWVyID0gcmF3QW5ub3RhdGlvbi5xdWFsaWZpZXI7XG4gICAgYW5ub3RhdGlvbi5fX3NvdXJjZSA9IChyYXdBbm5vdGF0aW9uIGFzIGFueSkuX19zb3VyY2U7XG5cbiAgICB0cnkge1xuICAgICAgICBsYXp5KGFubm90YXRpb24sICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9uc09uQW5ub3RhdGlvbihjb252ZXJ0ZXIsIHJhd0Fubm90YXRpb24sIGFubm90YXRpb24pKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIG5vdCBhbiBlcnJvcjogcGFyc2VSZWNvcmQoKSBhbHJlYWR5IGFkZHMgYW5ub3RhdGlvbnMsIGJ1dCB0aGUgb3RoZXIgcGFyc2VYWFggZnVuY3Rpb25zIGRvbid0LCBzbyB0aGlzIGNhbiBoYXBwZW5cbiAgICB9XG5cbiAgICByZXR1cm4gYW5ub3RhdGlvbiBhcyBBbm5vdGF0aW9uO1xufVxuXG4vKipcbiAqIE1lcmdlIGFubm90YXRpb24gZnJvbSBkaWZmZXJlbnQgc291cmNlIHRvZ2V0aGVyIGJ5IG92ZXJ3cml0aW5nIGF0IHRoZSB0ZXJtIGxldmVsLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEByZXR1cm5zIHRoZSByZXN1bHRpbmcgbWVyZ2VkIGFubm90YXRpb25zXG4gKi9cbmZ1bmN0aW9uIG1lcmdlQW5ub3RhdGlvbnMoY29udmVydGVyOiBDb252ZXJ0ZXIpOiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uW10+IHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY29udmVydGVyLnJhd1NjaGVtYS5hbm5vdGF0aW9ucykucmVkdWNlUmlnaHQoKGFubm90YXRpb25zUGVyVGFyZ2V0LCBhbm5vdGF0aW9uU291cmNlKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgeyB0YXJnZXQsIGFubm90YXRpb25zOiByYXdBbm5vdGF0aW9ucyB9IG9mIGNvbnZlcnRlci5yYXdTY2hlbWEuYW5ub3RhdGlvbnNbYW5ub3RhdGlvblNvdXJjZV0pIHtcbiAgICAgICAgICAgIGlmICghYW5ub3RhdGlvbnNQZXJUYXJnZXRbdGFyZ2V0XSkge1xuICAgICAgICAgICAgICAgIGFubm90YXRpb25zUGVyVGFyZ2V0W3RhcmdldF0gPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYW5ub3RhdGlvbnNQZXJUYXJnZXRbdGFyZ2V0XS5wdXNoKFxuICAgICAgICAgICAgICAgIC4uLnJhd0Fubm90YXRpb25zXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAocmF3QW5ub3RhdGlvbikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhYW5ub3RhdGlvbnNQZXJUYXJnZXRbdGFyZ2V0XS5zb21lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXhpc3RpbmdBbm5vdGF0aW9uKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdBbm5vdGF0aW9uLnRlcm0gPT09IHJhd0Fubm90YXRpb24udGVybSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdBbm5vdGF0aW9uLnF1YWxpZmllciA9PT0gcmF3QW5ub3RhdGlvbi5xdWFsaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocmF3QW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFubm90YXRpb25GUU4gPSBgJHt0YXJnZXR9QCR7Y29udmVydGVyLnVuYWxpYXMocmF3QW5ub3RhdGlvbi50ZXJtKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJhd0Fubm90YXRpb24ucXVhbGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkZRTiA9IGAke2Fubm90YXRpb25GUU59IyR7cmF3QW5ub3RhdGlvbi5xdWFsaWZpZXJ9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvbiA9IHJhd0Fubm90YXRpb24gYXMgQW5ub3RhdGlvbiAmIHsgX19zb3VyY2U6IHN0cmluZyB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUgPSBhbm5vdGF0aW9uRlFOO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbi5fX3NvdXJjZSA9IGFubm90YXRpb25Tb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5ub3RhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW5ub3RhdGlvbnNQZXJUYXJnZXQ7XG4gICAgfSwge30gYXMgUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbltdPik7XG59XG5cbmNsYXNzIENvbnZlcnRlciB7XG4gICAgcHJpdmF0ZSBhbm5vdGF0aW9uc0J5VGFyZ2V0OiBSZWNvcmQ8RnVsbHlRdWFsaWZpZWROYW1lLCBBbm5vdGF0aW9uW10+O1xuXG4gICAgLyoqXG4gICAgICogR2V0IHByZXByb2Nlc3NlZCBhbm5vdGF0aW9ucyBvbiB0aGUgc3BlY2lmaWVkIHRhcmdldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0YXJnZXQgICAgVGhlIGFubm90YXRpb24gdGFyZ2V0XG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgYW5ub3RhdGlvbnNcbiAgICAgKi9cbiAgICBnZXRBbm5vdGF0aW9ucyh0YXJnZXQ6IEZ1bGx5UXVhbGlmaWVkTmFtZSk6IEFubm90YXRpb25bXSB7XG4gICAgICAgIGlmICh0aGlzLmFubm90YXRpb25zQnlUYXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5hbm5vdGF0aW9uc0J5VGFyZ2V0ID0gbWVyZ2VBbm5vdGF0aW9ucyh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmFubm90YXRpb25zQnlUYXJnZXRbdGFyZ2V0XSA/PyBbXTtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRFbnRpdHlDb250YWluZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbnZlcnRlZEVsZW1lbnQoXG4gICAgICAgICAgICB0aGlzLnJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlDb250YWluZXIuZnVsbHlRdWFsaWZpZWROYW1lLFxuICAgICAgICAgICAgdGhpcy5yYXdNZXRhZGF0YS5zY2hlbWEuZW50aXR5Q29udGFpbmVyLFxuICAgICAgICAgICAgY29udmVydEVudGl0eUNvbnRhaW5lclxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldENvbnZlcnRlZEVudGl0eVNldChmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0ZWRPdXRwdXQuZW50aXR5U2V0cy5ieV9mdWxseVF1YWxpZmllZE5hbWUoZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRTaW5nbGV0b24oZnVsbHlRdWFsaWZpZWROYW1lOiBGdWxseVF1YWxpZmllZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydGVkT3V0cHV0LnNpbmdsZXRvbnMuYnlfZnVsbHlRdWFsaWZpZWROYW1lKGZ1bGx5UXVhbGlmaWVkTmFtZSk7XG4gICAgfVxuXG4gICAgZ2V0Q29udmVydGVkRW50aXR5VHlwZShmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0ZWRPdXRwdXQuZW50aXR5VHlwZXMuYnlfZnVsbHlRdWFsaWZpZWROYW1lKGZ1bGx5UXVhbGlmaWVkTmFtZSk7XG4gICAgfVxuXG4gICAgZ2V0Q29udmVydGVkQ29tcGxleFR5cGUoZnVsbHlRdWFsaWZpZWROYW1lOiBGdWxseVF1YWxpZmllZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydGVkT3V0cHV0LmNvbXBsZXhUeXBlcy5ieV9mdWxseVF1YWxpZmllZE5hbWUoZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbihmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0ZWRPdXRwdXQudHlwZURlZmluaXRpb25zLmJ5X2Z1bGx5UXVhbGlmaWVkTmFtZShmdWxseVF1YWxpZmllZE5hbWUpO1xuICAgIH1cblxuICAgIGdldENvbnZlcnRlZEFjdGlvbkltcG9ydChmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICBsZXQgYWN0aW9uSW1wb3J0ID0gdGhpcy5jb252ZXJ0ZWRPdXRwdXQuYWN0aW9uSW1wb3J0cy5ieV9mdWxseVF1YWxpZmllZE5hbWUoZnVsbHlRdWFsaWZpZWROYW1lKTtcbiAgICAgICAgaWYgKCFhY3Rpb25JbXBvcnQpIHtcbiAgICAgICAgICAgIGFjdGlvbkltcG9ydCA9IHRoaXMuY29udmVydGVkT3V0cHV0LmFjdGlvbkltcG9ydHMuYnlfbmFtZShmdWxseVF1YWxpZmllZE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3Rpb25JbXBvcnQ7XG4gICAgfVxuXG4gICAgZ2V0Q29udmVydGVkQWN0aW9uKGZ1bGx5UXVhbGlmaWVkTmFtZTogRnVsbHlRdWFsaWZpZWROYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRlZE91dHB1dC5hY3Rpb25zLmJ5X2Z1bGx5UXVhbGlmaWVkTmFtZShmdWxseVF1YWxpZmllZE5hbWUpO1xuICAgIH1cblxuICAgIGNvbnZlcnQ8Q29udmVydGVkLCBSYXcgZXh0ZW5kcyBSYXdUeXBlPENvbnZlcnRlZD4+KFxuICAgICAgICByYXdWYWx1ZTogUmF3LFxuICAgICAgICBtYXA6IChjb252ZXJ0ZXI6IENvbnZlcnRlciwgcmF3OiBSYXcpID0+IENvbnZlcnRlZFxuICAgICk6ICgpID0+IENvbnZlcnRlZDtcbiAgICBjb252ZXJ0PENvbnZlcnRlZCwgUmF3IGV4dGVuZHMgUmF3VHlwZTxDb252ZXJ0ZWQ+LCBJbmRleFByb3BlcnR5IGV4dGVuZHMgRXh0cmFjdDxrZXlvZiBDb252ZXJ0ZWQsIHN0cmluZz4+KFxuICAgICAgICByYXdWYWx1ZTogUmF3W10sXG4gICAgICAgIG1hcDogKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXc6IFJhdykgPT4gQ29udmVydGVkXG4gICAgKTogKCkgPT4gQXJyYXlXaXRoSW5kZXg8Q29udmVydGVkLCBJbmRleFByb3BlcnR5PjtcbiAgICBjb252ZXJ0PENvbnZlcnRlZCwgUmF3IGV4dGVuZHMgUmF3VHlwZTxDb252ZXJ0ZWQ+LCBJbmRleFByb3BlcnR5IGV4dGVuZHMgRXh0cmFjdDxrZXlvZiBDb252ZXJ0ZWQsIHN0cmluZz4+KFxuICAgICAgICByYXdWYWx1ZTogUmF3IHwgUmF3W10sXG4gICAgICAgIG1hcDogKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXc6IFJhdykgPT4gQ29udmVydGVkXG4gICAgKTogKCgpID0+IENvbnZlcnRlZCkgfCAoKCkgPT4gQXJyYXlXaXRoSW5kZXg8Q29udmVydGVkLCBJbmRleFByb3BlcnR5Pikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udmVydGVkID0gcmF3VmFsdWUucmVkdWNlKChjb252ZXJ0ZWRFbGVtZW50cywgcmF3RWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb252ZXJ0ZWRFbGVtZW50ID0gdGhpcy5nZXRDb252ZXJ0ZWRFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgKHJhd0VsZW1lbnQgYXMgYW55KS5mdWxseVF1YWxpZmllZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByYXdFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb252ZXJ0ZWRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZWRFbGVtZW50cy5wdXNoKGNvbnZlcnRlZEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZWRFbGVtZW50cztcbiAgICAgICAgICAgICAgICB9LCBbXSBhcyBDb252ZXJ0ZWRbXSk7XG4gICAgICAgICAgICAgICAgYWRkR2V0QnlWYWx1ZShjb252ZXJ0ZWQsICduYW1lJyBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIGFkZEdldEJ5VmFsdWUoY29udmVydGVkLCAnZnVsbHlRdWFsaWZpZWROYW1lJyBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb252ZXJ0ZWQgYXMgQXJyYXlXaXRoSW5kZXg8Q29udmVydGVkLCBJbmRleFByb3BlcnR5PjtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gdGhpcy5nZXRDb252ZXJ0ZWRFbGVtZW50KHJhd1ZhbHVlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgcmF3VmFsdWUsIG1hcCkhO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByYXdNZXRhZGF0YTogUmF3TWV0YWRhdGE7XG4gICAgcHJpdmF0ZSBjb252ZXJ0ZWRFbGVtZW50czogTWFwPEZ1bGx5UXVhbGlmaWVkTmFtZSwgYW55PiA9IG5ldyBNYXAoKTtcbiAgICBwcml2YXRlIGNvbnZlcnRlZE91dHB1dDogQ29udmVydGVkTWV0YWRhdGE7XG5cbiAgICByYXdTY2hlbWE6IFJhd1NjaGVtYTtcblxuICAgIGNvbnN0cnVjdG9yKHJhd01ldGFkYXRhOiBSYXdNZXRhZGF0YSwgY29udmVydGVkT3V0cHV0OiBDb252ZXJ0ZWRNZXRhZGF0YSkge1xuICAgICAgICB0aGlzLnJhd01ldGFkYXRhID0gcmF3TWV0YWRhdGE7XG4gICAgICAgIHRoaXMucmF3U2NoZW1hID0gcmF3TWV0YWRhdGEuc2NoZW1hO1xuICAgICAgICB0aGlzLmNvbnZlcnRlZE91dHB1dCA9IGNvbnZlcnRlZE91dHB1dDtcbiAgICB9XG5cbiAgICBnZXRDb252ZXJ0ZWRFbGVtZW50PENvbnZlcnRlZFR5cGUsIFJhd1R5cGUgZXh0ZW5kcyBSZW1vdmVBbm5vdGF0aW9uQW5kVHlwZTxDb252ZXJ0ZWRUeXBlPj4oXG4gICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogRnVsbHlRdWFsaWZpZWROYW1lLFxuICAgICAgICByYXdFbGVtZW50OiBSYXdUeXBlIHwgdW5kZWZpbmVkIHwgKChmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSkgPT4gUmF3VHlwZSB8IHVuZGVmaW5lZCksXG4gICAgICAgIG1hcDogKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXc6IFJhd1R5cGUpID0+IENvbnZlcnRlZFR5cGVcbiAgICApOiBDb252ZXJ0ZWRUeXBlIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGNvbnZlcnRlZDogQ29udmVydGVkVHlwZSB8IHVuZGVmaW5lZCA9IHRoaXMuY29udmVydGVkRWxlbWVudHMuZ2V0KGZ1bGx5UXVhbGlmaWVkTmFtZSk7XG4gICAgICAgIGlmIChjb252ZXJ0ZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgcmF3TWV0YWRhdGEgPVxuICAgICAgICAgICAgICAgIHR5cGVvZiByYXdFbGVtZW50ID09PSAnZnVuY3Rpb24nID8gcmF3RWxlbWVudC5hcHBseSh1bmRlZmluZWQsIFtmdWxseVF1YWxpZmllZE5hbWVdKSA6IHJhd0VsZW1lbnQ7XG4gICAgICAgICAgICBpZiAocmF3TWV0YWRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnZlcnRlZCA9IG1hcC5hcHBseSh1bmRlZmluZWQsIFt0aGlzLCByYXdNZXRhZGF0YV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udmVydGVkRWxlbWVudHMuc2V0KGZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udmVydGVkO1xuICAgIH1cblxuICAgIGxvZ0Vycm9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNvbnZlcnRlZE91dHB1dC5kaWFnbm9zdGljcy5wdXNoKHsgbWVzc2FnZSB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTcGxpdCB0aGUgYWxpYXMgZnJvbSB0aGUgdGVybSB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0ZXJtIHRoZSB2YWx1ZSBvZiB0aGUgdGVybVxuICAgICAqIEByZXR1cm5zIHRoZSB0ZXJtIGFsaWFzIGFuZCB0aGUgYWN0dWFsIHRlcm0gdmFsdWVcbiAgICAgKi9cbiAgICBzcGxpdFRlcm0odGVybTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGFsaWFzZWQgPSBhbGlhcyhWb2NhYnVsYXJ5UmVmZXJlbmNlcywgdGVybSk7XG4gICAgICAgIHJldHVybiBzcGxpdEF0TGFzdChhbGlhc2VkLCAnLicpO1xuICAgIH1cblxuICAgIHVuYWxpYXModmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgcmVmZXJlbmNlcyA9IHRoaXMucmF3TWV0YWRhdGEucmVmZXJlbmNlcykge1xuICAgICAgICByZXR1cm4gdW5hbGlhcyhyZWZlcmVuY2VzLCB2YWx1ZSwgdGhpcy5yYXdTY2hlbWEubmFtZXNwYWNlKSA/PyAnJztcbiAgICB9XG59XG5cbnR5cGUgUmF3VHlwZTxUPiA9IFJlbW92ZUFubm90YXRpb25BbmRUeXBlPFQ+ICYgeyBmdWxseVF1YWxpZmllZE5hbWU6IEZ1bGx5UXVhbGlmaWVkTmFtZSB9O1xuXG5mdW5jdGlvbiByZXNvbHZlRW50aXR5VHlwZShjb252ZXJ0ZXI6IENvbnZlcnRlciwgZnVsbHlRdWFsaWZpZWROYW1lOiBGdWxseVF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBsZXQgZW50aXR5VHlwZSA9IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbnRpdHlUeXBlKGZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cbiAgICAgICAgaWYgKCFlbnRpdHlUeXBlKSB7XG4gICAgICAgICAgICBjb252ZXJ0ZXIubG9nRXJyb3IoYEVudGl0eVR5cGUgJyR7ZnVsbHlRdWFsaWZpZWROYW1lfScgbm90IGZvdW5kYCk7XG4gICAgICAgICAgICBlbnRpdHlUeXBlID0ge30gYXMgRW50aXR5VHlwZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW50aXR5VHlwZTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3MoXG4gICAgY29udmVydGVyOiBDb252ZXJ0ZXIsXG4gICAgcmF3TmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3M6IFNpbmdsZXRvblsnbmF2aWdhdGlvblByb3BlcnR5QmluZGluZyddIHwgRW50aXR5U2V0WyduYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJ10sXG4gICAgcmF3RWxlbWVudDogUmF3U2luZ2xldG9uIHwgUmF3RW50aXR5U2V0XG4pIHtcbiAgICByZXR1cm4gKCkgPT5cbiAgICAgICAgT2JqZWN0LmtleXMocmF3TmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3MpLnJlZHVjZSgobmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3MsIGJpbmRpbmdOYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByYXdCaW5kaW5nVGFyZ2V0ID0gcmF3TmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3NbYmluZGluZ05hbWVdO1xuXG4gICAgICAgICAgICBsYXp5KG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzLCBiaW5kaW5nTmFtZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCByZXNvbHZlZEJpbmRpbmdUYXJnZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHJhd0JpbmRpbmdUYXJnZXQuX3R5cGUgPT09ICdTaW5nbGV0b24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQmluZGluZ1RhcmdldCA9IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRTaW5nbGV0b24ocmF3QmluZGluZ1RhcmdldC5mdWxseVF1YWxpZmllZE5hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQmluZGluZ1RhcmdldCA9IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbnRpdHlTZXQocmF3QmluZGluZ1RhcmdldC5mdWxseVF1YWxpZmllZE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXJlc29sdmVkQmluZGluZ1RhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZXIubG9nRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtyYXdFbGVtZW50Ll90eXBlfSAnJHtyYXdFbGVtZW50LmZ1bGx5UXVhbGlmaWVkTmFtZX0nOiBGYWlsZWQgdG8gcmVzb2x2ZSBOYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nICR7YmluZGluZ05hbWV9YFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZEJpbmRpbmdUYXJnZXQgPSB7fSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlZEJpbmRpbmdUYXJnZXQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5ncztcbiAgICAgICAgfSwge30gYXMgRW50aXR5U2V0WyduYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJ10gfCBTaW5nbGV0b25bJ25hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcnXSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXI6IENvbnZlcnRlciwgcmF3QW5ub3RhdGlvblRhcmdldDogYW55KSB7XG4gICAgY29uc3QgbmVzdGVkQW5ub3RhdGlvbnMgPSByYXdBbm5vdGF0aW9uVGFyZ2V0LmFubm90YXRpb25zO1xuXG4gICAgcmV0dXJuICgpID0+XG4gICAgICAgIGNyZWF0ZUFubm90YXRpb25zT2JqZWN0KFxuICAgICAgICAgICAgY29udmVydGVyLFxuICAgICAgICAgICAgcmF3QW5ub3RhdGlvblRhcmdldCxcbiAgICAgICAgICAgIG5lc3RlZEFubm90YXRpb25zID8/IGNvbnZlcnRlci5nZXRBbm5vdGF0aW9ucyhyYXdBbm5vdGF0aW9uVGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZSlcbiAgICAgICAgKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUFubm90YXRpb25zT25Bbm5vdGF0aW9uKFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIGFubm90YXRpb25SZWNvcmQ6IEFubm90YXRpb25SZWNvcmQgfCBSYXdBbm5vdGF0aW9uLFxuICAgIGFubm90YXRpb25UZXJtOiBhbnlcbikge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRGUU4gPSBhbm5vdGF0aW9uVGVybS5mdWxseVF1YWxpZmllZE5hbWU7XG5cbiAgICAgICAgLy8gYmUgZ3JhY2VmdWwgd2hlbiByZXNvbHZpbmcgYW5ub3RhdGlvbnMgb24gYW5ub3RhdGlvbnM6IFNvbWV0aW1lcyB0aGV5IGFyZSByZWZlcmVuY2VkIGRpcmVjdGx5LCBzb21ldGltZXMgdGhleVxuICAgICAgICAvLyBhcmUgcGFydCBvZiB0aGUgZ2xvYmFsIGFubm90YXRpb25zIGxpc3RcbiAgICAgICAgbGV0IGFubm90YXRpb25zO1xuICAgICAgICBpZiAoYW5ub3RhdGlvblJlY29yZC5hbm5vdGF0aW9ucyAmJiBhbm5vdGF0aW9uUmVjb3JkLmFubm90YXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFubm90YXRpb25zID0gYW5ub3RhdGlvblJlY29yZC5hbm5vdGF0aW9ucztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFubm90YXRpb25zID0gY29udmVydGVyLmdldEFubm90YXRpb25zKGN1cnJlbnRGUU4pO1xuICAgICAgICB9XG5cbiAgICAgICAgYW5ub3RhdGlvbnM/LmZvckVhY2goKGFubm90YXRpb246IGFueSkgPT4ge1xuICAgICAgICAgICAgYW5ub3RhdGlvbi50YXJnZXQgPSBjdXJyZW50RlFOO1xuICAgICAgICAgICAgYW5ub3RhdGlvbi5fX3NvdXJjZSA9IGFubm90YXRpb25UZXJtLl9fc291cmNlO1xuICAgICAgICAgICAgYW5ub3RhdGlvbltBTk5PVEFUSU9OX1RBUkdFVF0gPSBhbm5vdGF0aW9uVGVybVtBTk5PVEFUSU9OX1RBUkdFVF07XG4gICAgICAgICAgICBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSA9IGAke2N1cnJlbnRGUU59QCR7YW5ub3RhdGlvbi50ZXJtfWA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVBbm5vdGF0aW9uc09iamVjdChjb252ZXJ0ZXIsIGFubm90YXRpb25UZXJtLCBhbm5vdGF0aW9ucyA/PyBbXSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQW5ub3RhdGlvbnNPYmplY3QoY29udmVydGVyOiBDb252ZXJ0ZXIsIHRhcmdldDogYW55LCByYXdBbm5vdGF0aW9uczogUmF3QW5ub3RhdGlvbltdKSB7XG4gICAgcmV0dXJuIHJhd0Fubm90YXRpb25zLnJlZHVjZSgodm9jYWJ1bGFyeUFsaWFzZXMsIGFubm90YXRpb24pID0+IHtcbiAgICAgICAgY29uc3QgW3ZvY0FsaWFzLCB2b2NUZXJtXSA9IGNvbnZlcnRlci5zcGxpdFRlcm0oYW5ub3RhdGlvbi50ZXJtKTtcbiAgICAgICAgY29uc3Qgdm9jVGVybVdpdGhRdWFsaWZpZXIgPSBgJHt2b2NUZXJtfSR7YW5ub3RhdGlvbi5xdWFsaWZpZXIgPyAnIycgKyBhbm5vdGF0aW9uLnF1YWxpZmllciA6ICcnfWA7XG5cbiAgICAgICAgaWYgKHZvY2FidWxhcnlBbGlhc2VzW3ZvY0FsaWFzXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2b2NhYnVsYXJ5QWxpYXNlc1t2b2NBbGlhc10gPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdm9jYWJ1bGFyeUFsaWFzZXNbdm9jQWxpYXNdLmhhc093blByb3BlcnR5KHZvY1Rlcm1XaXRoUXVhbGlmaWVyKSkge1xuICAgICAgICAgICAgbGF6eSh2b2NhYnVsYXJ5QWxpYXNlc1t2b2NBbGlhc10sIHZvY1Rlcm1XaXRoUXVhbGlmaWVyLCAoKSA9PlxuICAgICAgICAgICAgICAgIGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAoYW5ub3RhdGlvbiBhcyBBbm5vdGF0aW9uKS5mdWxseVF1YWxpZmllZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb24sXG4gICAgICAgICAgICAgICAgICAgIChjb252ZXJ0ZXIsIHJhd0Fubm90YXRpb24pID0+IGNvbnZlcnRBbm5vdGF0aW9uKGNvbnZlcnRlciwgdGFyZ2V0LCByYXdBbm5vdGF0aW9uKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZvY2FidWxhcnlBbGlhc2VzO1xuICAgIH0sIHt9IGFzIGFueSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gRW50aXR5Q29udGFpbmVyLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd0VudGl0eUNvbnRhaW5lciAgICBVbmNvbnZlcnRlZCBFbnRpdHlDb250YWluZXJcbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgRW50aXR5Q29udGFpbmVyXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRFbnRpdHlDb250YWluZXIoY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0VudGl0eUNvbnRhaW5lcjogUmF3RW50aXR5Q29udGFpbmVyKTogRW50aXR5Q29udGFpbmVyIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRFbnRpdHlDb250YWluZXIgPSByYXdFbnRpdHlDb250YWluZXIgYXMgRW50aXR5Q29udGFpbmVyO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlDb250YWluZXIsICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd0VudGl0eUNvbnRhaW5lcikpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlDb250YWluZXIsICdlbnRpdHlTZXRzJywgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS5lbnRpdHlTZXRzLCBjb252ZXJ0RW50aXR5U2V0KSk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZEVudGl0eUNvbnRhaW5lciwgJ3NpbmdsZXRvbnMnLCBjb252ZXJ0ZXIuY29udmVydChjb252ZXJ0ZXIucmF3U2NoZW1hLnNpbmdsZXRvbnMsIGNvbnZlcnRTaW5nbGV0b24pKTtcblxuICAgIGxhenkoXG4gICAgICAgIGNvbnZlcnRlZEVudGl0eUNvbnRhaW5lcixcbiAgICAgICAgJ2FjdGlvbkltcG9ydHMnLFxuICAgICAgICBjb252ZXJ0ZXIuY29udmVydChjb252ZXJ0ZXIucmF3U2NoZW1hLmFjdGlvbkltcG9ydHMsIGNvbnZlcnRBY3Rpb25JbXBvcnQpXG4gICAgKTtcblxuICAgIHJldHVybiBjb252ZXJ0ZWRFbnRpdHlDb250YWluZXI7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBTaW5nbGV0b24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd1NpbmdsZXRvbiAgVW5jb252ZXJ0ZWQgU2luZ2xldG9uXG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIFNpbmdsZXRvblxuICovXG5mdW5jdGlvbiBjb252ZXJ0U2luZ2xldG9uKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdTaW5nbGV0b246IFJhd1NpbmdsZXRvbik6IFNpbmdsZXRvbiB7XG4gICAgY29uc3QgY29udmVydGVkU2luZ2xldG9uID0gcmF3U2luZ2xldG9uIGFzIFNpbmdsZXRvbjtcblxuICAgIGxhenkoY29udmVydGVkU2luZ2xldG9uLCAnZW50aXR5VHlwZScsIHJlc29sdmVFbnRpdHlUeXBlKGNvbnZlcnRlciwgcmF3U2luZ2xldG9uLmVudGl0eVR5cGVOYW1lKSk7XG4gICAgbGF6eShjb252ZXJ0ZWRTaW5nbGV0b24sICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd1NpbmdsZXRvbiBhcyBTaW5nbGV0b24pKTtcblxuICAgIGNvbnN0IF9yYXdOYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5ncyA9IHJhd1NpbmdsZXRvbi5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nO1xuICAgIGxhenkoXG4gICAgICAgIGNvbnZlcnRlZFNpbmdsZXRvbixcbiAgICAgICAgJ25hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcnLFxuICAgICAgICByZXNvbHZlTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3MoXG4gICAgICAgICAgICBjb252ZXJ0ZXIsXG4gICAgICAgICAgICBfcmF3TmF2aWdhdGlvblByb3BlcnR5QmluZGluZ3MgYXMgU2luZ2xldG9uWyduYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJ10sXG4gICAgICAgICAgICByYXdTaW5nbGV0b25cbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gY29udmVydGVkU2luZ2xldG9uO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIEVudGl0eVNldC5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyICAgQ29udmVydGVyXG4gKiBAcGFyYW0gcmF3RW50aXR5U2V0ICBVbmNvbnZlcnRlZCBFbnRpdHlTZXRcbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgRW50aXR5U2V0XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRFbnRpdHlTZXQoY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0VudGl0eVNldDogUmF3RW50aXR5U2V0KTogRW50aXR5U2V0IHtcbiAgICBjb25zdCBjb252ZXJ0ZWRFbnRpdHlTZXQgPSByYXdFbnRpdHlTZXQgYXMgRW50aXR5U2V0O1xuXG4gICAgbGF6eShjb252ZXJ0ZWRFbnRpdHlTZXQsICdlbnRpdHlUeXBlJywgcmVzb2x2ZUVudGl0eVR5cGUoY29udmVydGVyLCByYXdFbnRpdHlTZXQuZW50aXR5VHlwZU5hbWUpKTtcbiAgICBsYXp5KGNvbnZlcnRlZEVudGl0eVNldCwgJ2Fubm90YXRpb25zJywgcmVzb2x2ZUFubm90YXRpb25zKGNvbnZlcnRlciwgcmF3RW50aXR5U2V0IGFzIEVudGl0eVNldCkpO1xuXG4gICAgY29uc3QgX3Jhd05hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdzID0gcmF3RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc7XG4gICAgbGF6eShcbiAgICAgICAgY29udmVydGVkRW50aXR5U2V0LFxuICAgICAgICAnbmF2aWdhdGlvblByb3BlcnR5QmluZGluZycsXG4gICAgICAgIHJlc29sdmVOYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5ncyhcbiAgICAgICAgICAgIGNvbnZlcnRlcixcbiAgICAgICAgICAgIF9yYXdOYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5ncyBhcyBFbnRpdHlTZXRbJ25hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcnXSxcbiAgICAgICAgICAgIHJhd0VudGl0eVNldFxuICAgICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBjb252ZXJ0ZWRFbnRpdHlTZXQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gRW50aXR5VHlwZS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyICAgQ29udmVydGVyXG4gKiBAcGFyYW0gcmF3RW50aXR5VHlwZSAgVW5jb252ZXJ0ZWQgRW50aXR5VHlwZVxuICogQHJldHVybnMgVGhlIGNvbnZlcnRlZCBFbnRpdHlUeXBlXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRFbnRpdHlUeXBlKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdFbnRpdHlUeXBlOiBSYXdFbnRpdHlUeXBlKTogRW50aXR5VHlwZSB7XG4gICAgY29uc3QgY29udmVydGVkRW50aXR5VHlwZSA9IHJhd0VudGl0eVR5cGUgYXMgRW50aXR5VHlwZTtcblxuICAgIHJhd0VudGl0eVR5cGUua2V5cy5mb3JFYWNoKChrZXlQcm9wOiBhbnkpID0+IHtcbiAgICAgICAga2V5UHJvcC5pc0tleSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZEVudGl0eVR5cGUsICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd0VudGl0eVR5cGUpKTtcblxuICAgIGxhenkoY29udmVydGVkRW50aXR5VHlwZSwgJ2tleXMnLCBjb252ZXJ0ZXIuY29udmVydChyYXdFbnRpdHlUeXBlLmtleXMsIGNvbnZlcnRQcm9wZXJ0eSkpO1xuICAgIGxhenkoY29udmVydGVkRW50aXR5VHlwZSwgJ2VudGl0eVByb3BlcnRpZXMnLCBjb252ZXJ0ZXIuY29udmVydChyYXdFbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMsIGNvbnZlcnRQcm9wZXJ0eSkpO1xuICAgIGxhenkoXG4gICAgICAgIGNvbnZlcnRlZEVudGl0eVR5cGUsXG4gICAgICAgICduYXZpZ2F0aW9uUHJvcGVydGllcycsXG4gICAgICAgIGNvbnZlcnRlci5jb252ZXJ0KHJhd0VudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMgYXMgYW55W10sIGNvbnZlcnROYXZpZ2F0aW9uUHJvcGVydHkpXG4gICAgKTtcblxuICAgIGxhenkoY29udmVydGVkRW50aXR5VHlwZSwgJ2FjdGlvbnMnLCAoKSA9PlxuICAgICAgICBjb252ZXJ0ZXIucmF3U2NoZW1hLmFjdGlvbnNcbiAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgKHJhd0FjdGlvbikgPT5cbiAgICAgICAgICAgICAgICAgICAgcmF3QWN0aW9uLmlzQm91bmQgJiZcbiAgICAgICAgICAgICAgICAgICAgKHJhd0FjdGlvbi5zb3VyY2VUeXBlID09PSByYXdFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3QWN0aW9uLnNvdXJjZVR5cGUgPT09IGBDb2xsZWN0aW9uKCR7cmF3RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWV9KWApXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAucmVkdWNlKChhY3Rpb25zLCByYXdBY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYCR7Y29udmVydGVyLnJhd1NjaGVtYS5uYW1lc3BhY2V9LiR7cmF3QWN0aW9uLm5hbWV9YDtcbiAgICAgICAgICAgICAgICBhY3Rpb25zW25hbWVdID0gY29udmVydGVyLmdldENvbnZlcnRlZEFjdGlvbihyYXdBY3Rpb24uZnVsbHlRdWFsaWZpZWROYW1lKSE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgICAgICAgICB9LCB7fSBhcyBFbnRpdHlUeXBlWydhY3Rpb25zJ10pXG4gICAgKTtcblxuICAgIGNvbnZlcnRlZEVudGl0eVR5cGUucmVzb2x2ZVBhdGggPSAocmVsYXRpdmVQYXRoOiBzdHJpbmcsIGluY2x1ZGVWaXNpdGVkT2JqZWN0cz86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlVGFyZ2V0KGNvbnZlcnRlciwgcmF3RW50aXR5VHlwZSwgcmVsYXRpdmVQYXRoKTtcbiAgICAgICAgaWYgKGluY2x1ZGVWaXNpdGVkT2JqZWN0cykge1xuICAgICAgICAgICAgcmV0dXJuIHsgdGFyZ2V0OiByZXNvbHZlZC50YXJnZXQsIHZpc2l0ZWRPYmplY3RzOiByZXNvbHZlZC5vYmplY3RQYXRoLCBtZXNzYWdlczogcmVzb2x2ZWQubWVzc2FnZXMgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlZC50YXJnZXQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZEVudGl0eVR5cGU7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBQcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyICAgQ29udmVydGVyXG4gKiBAcGFyYW0gcmF3UHJvcGVydHkgIFVuY29udmVydGVkIFByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIFByb3BlcnR5XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRQcm9wZXJ0eShjb252ZXJ0ZXI6IENvbnZlcnRlciwgcmF3UHJvcGVydHk6IFJhd1Byb3BlcnR5KTogUHJvcGVydHkge1xuICAgIGNvbnN0IGNvbnZlcnRlZFByb3BlcnR5ID0gcmF3UHJvcGVydHkgYXMgUHJvcGVydHk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZFByb3BlcnR5LCAnYW5ub3RhdGlvbnMnLCByZXNvbHZlQW5ub3RhdGlvbnMoY29udmVydGVyLCByYXdQcm9wZXJ0eSkpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRQcm9wZXJ0eSwgJ3RhcmdldFR5cGUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByYXdQcm9wZXJ0eS50eXBlO1xuICAgICAgICBjb25zdCB0eXBlTmFtZSA9IHR5cGUuc3RhcnRzV2l0aCgnQ29sbGVjdGlvbicpID8gdHlwZS5zdWJzdHJpbmcoMTEsIHR5cGUubGVuZ3RoIC0gMSkgOiB0eXBlO1xuXG4gICAgICAgIHJldHVybiBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQ29tcGxleFR5cGUodHlwZU5hbWUpID8/IGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbih0eXBlTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkUHJvcGVydHk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBOYXZpZ2F0aW9uUHJvcGVydHkuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd05hdmlnYXRpb25Qcm9wZXJ0eSAgVW5jb252ZXJ0ZWQgTmF2aWdhdGlvblByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIE5hdmlnYXRpb25Qcm9wZXJ0eVxuICovXG5mdW5jdGlvbiBjb252ZXJ0TmF2aWdhdGlvblByb3BlcnR5KFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIHJhd05hdmlnYXRpb25Qcm9wZXJ0eTogUmF3VjJOYXZpZ2F0aW9uUHJvcGVydHkgfCBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eVxuKTogTmF2aWdhdGlvblByb3BlcnR5IHtcbiAgICBjb25zdCBjb252ZXJ0ZWROYXZpZ2F0aW9uUHJvcGVydHkgPSByYXdOYXZpZ2F0aW9uUHJvcGVydHkgYXMgTmF2aWdhdGlvblByb3BlcnR5O1xuXG4gICAgY29udmVydGVkTmF2aWdhdGlvblByb3BlcnR5LnJlZmVyZW50aWFsQ29uc3RyYWludCA9IGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eS5yZWZlcmVudGlhbENvbnN0cmFpbnQgPz8gW107XG5cbiAgICBpZiAoIWlzVjROYXZpZ2F0aW9uUHJvcGVydHkocmF3TmF2aWdhdGlvblByb3BlcnR5KSkge1xuICAgICAgICBjb25zdCBhc3NvY2lhdGlvbkVuZCA9IGNvbnZlcnRlci5yYXdTY2hlbWEuYXNzb2NpYXRpb25zXG4gICAgICAgICAgICAuZmluZCgoYXNzb2NpYXRpb24pID0+IGFzc29jaWF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSA9PT0gcmF3TmF2aWdhdGlvblByb3BlcnR5LnJlbGF0aW9uc2hpcClcbiAgICAgICAgICAgID8uYXNzb2NpYXRpb25FbmQuZmluZCgoZW5kKSA9PiBlbmQucm9sZSA9PT0gcmF3TmF2aWdhdGlvblByb3BlcnR5LnRvUm9sZSk7XG5cbiAgICAgICAgY29udmVydGVkTmF2aWdhdGlvblByb3BlcnR5LmlzQ29sbGVjdGlvbiA9IGFzc29jaWF0aW9uRW5kPy5tdWx0aXBsaWNpdHkgPT09ICcqJztcbiAgICAgICAgY29udmVydGVkTmF2aWdhdGlvblByb3BlcnR5LnRhcmdldFR5cGVOYW1lID0gYXNzb2NpYXRpb25FbmQ/LnR5cGUgPz8gJyc7XG4gICAgfVxuXG4gICAgbGF6eShcbiAgICAgICAgY29udmVydGVkTmF2aWdhdGlvblByb3BlcnR5LFxuICAgICAgICAndGFyZ2V0VHlwZScsXG4gICAgICAgIHJlc29sdmVFbnRpdHlUeXBlKGNvbnZlcnRlciwgKHJhd05hdmlnYXRpb25Qcm9wZXJ0eSBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpLnRhcmdldFR5cGVOYW1lKVxuICAgICk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZE5hdmlnYXRpb25Qcm9wZXJ0eSwgJ2Fubm90YXRpb25zJywgcmVzb2x2ZUFubm90YXRpb25zKGNvbnZlcnRlciwgcmF3TmF2aWdhdGlvblByb3BlcnR5KSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkTmF2aWdhdGlvblByb3BlcnR5O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIEFjdGlvbkltcG9ydC5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyICAgQ29udmVydGVyXG4gKiBAcGFyYW0gcmF3QWN0aW9uSW1wb3J0ICBVbmNvbnZlcnRlZCBBY3Rpb25JbXBvcnRcbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgQWN0aW9uSW1wb3J0XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBY3Rpb25JbXBvcnQoY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0FjdGlvbkltcG9ydDogUmF3QWN0aW9uSW1wb3J0KTogQWN0aW9uSW1wb3J0IHtcbiAgICBjb25zdCBjb252ZXJ0ZWRBY3Rpb25JbXBvcnQgPSByYXdBY3Rpb25JbXBvcnQgYXMgQWN0aW9uSW1wb3J0O1xuXG4gICAgbGF6eShjb252ZXJ0ZWRBY3Rpb25JbXBvcnQsICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd0FjdGlvbkltcG9ydCkpO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRBY3Rpb25JbXBvcnQsICdhY3Rpb24nLCAoKSA9PiBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkQWN0aW9uKHJhd0FjdGlvbkltcG9ydC5hY3Rpb25OYW1lKSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkQWN0aW9uSW1wb3J0O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIEFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyICAgQ29udmVydGVyXG4gKiBAcGFyYW0gcmF3QWN0aW9uICBVbmNvbnZlcnRlZCBBY3Rpb25cbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgQWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBY3Rpb24oY29udmVydGVyOiBDb252ZXJ0ZXIsIHJhd0FjdGlvbjogUmF3QWN0aW9uKTogQWN0aW9uIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRBY3Rpb24gPSByYXdBY3Rpb24gYXMgQWN0aW9uO1xuXG4gICAgaWYgKGNvbnZlcnRlZEFjdGlvbi5zb3VyY2VUeXBlKSB7XG4gICAgICAgIGxhenkoY29udmVydGVkQWN0aW9uLCAnc291cmNlRW50aXR5VHlwZScsIHJlc29sdmVFbnRpdHlUeXBlKGNvbnZlcnRlciwgcmF3QWN0aW9uLnNvdXJjZVR5cGUpKTtcbiAgICB9XG5cbiAgICBpZiAoY29udmVydGVkQWN0aW9uLnJldHVyblR5cGUpIHtcbiAgICAgICAgbGF6eShjb252ZXJ0ZWRBY3Rpb24sICdyZXR1cm5FbnRpdHlUeXBlJywgcmVzb2x2ZUVudGl0eVR5cGUoY29udmVydGVyLCByYXdBY3Rpb24ucmV0dXJuVHlwZSkpO1xuICAgIH1cblxuICAgIGxhenkoY29udmVydGVkQWN0aW9uLCAncGFyYW1ldGVycycsIGNvbnZlcnRlci5jb252ZXJ0KHJhd0FjdGlvbi5wYXJhbWV0ZXJzLCBjb252ZXJ0QWN0aW9uUGFyYW1ldGVyKSk7XG5cbiAgICBsYXp5KGNvbnZlcnRlZEFjdGlvbiwgJ2Fubm90YXRpb25zJywgKCkgPT4ge1xuICAgICAgICBjb25zdCBhY3Rpb24gPSBzdWJzdHJpbmdCZWZvcmVGaXJzdChyYXdBY3Rpb24uZnVsbHlRdWFsaWZpZWROYW1lLCAnKCcpO1xuXG4gICAgICAgIC8vIGlmIHRoZSBhY3Rpb24gaXMgdW5ib3VuZCAoZS5nLiBcIm15QWN0aW9uXCIpLCB0aGUgYW5ub3RhdGlvbiB0YXJnZXQgaXMgXCJteUFjdGlvbigpXCJcbiAgICAgICAgY29uc3QgYW5ub3RhdGlvblRhcmdldEZRTiA9IHJhd0FjdGlvbi5pc0JvdW5kXG4gICAgICAgICAgICA/IHJhd0FjdGlvbi5mdWxseVF1YWxpZmllZE5hbWVcbiAgICAgICAgICAgIDogYCR7cmF3QWN0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZX0oKWA7XG5cbiAgICAgICAgY29uc3QgcmF3QW5ub3RhdGlvbnMgPSBjb252ZXJ0ZXIuZ2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvblRhcmdldEZRTik7XG4gICAgICAgIGNvbnN0IGJhc2VBbm5vdGF0aW9ucyA9IGNvbnZlcnRlci5nZXRBbm5vdGF0aW9ucyhhY3Rpb24pO1xuXG4gICAgICAgIGZvciAoY29uc3QgYmFzZUFubm90YXRpb24gb2YgYmFzZUFubm90YXRpb25zKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXJhd0Fubm90YXRpb25zLnNvbWUoXG4gICAgICAgICAgICAgICAgICAgIChhbm5vdGF0aW9uKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbi50ZXJtID09PSBiYXNlQW5ub3RhdGlvbi50ZXJtICYmIGFubm90YXRpb24ucXVhbGlmaWVyID09PSBiYXNlQW5ub3RhdGlvbi5xdWFsaWZpZXJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByYXdBbm5vdGF0aW9ucy5wdXNoKGJhc2VBbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjcmVhdGVBbm5vdGF0aW9uc09iamVjdChjb252ZXJ0ZXIsIHJhd0FjdGlvbiwgcmF3QW5ub3RhdGlvbnMpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZEFjdGlvbjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBBY3Rpb25QYXJhbWV0ZXIuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlciAgIENvbnZlcnRlclxuICogQHBhcmFtIHJhd0FjdGlvblBhcmFtZXRlciAgVW5jb252ZXJ0ZWQgQWN0aW9uUGFyYW1ldGVyXG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVkIEFjdGlvblBhcmFtZXRlclxuICovXG5mdW5jdGlvbiBjb252ZXJ0QWN0aW9uUGFyYW1ldGVyKFxuICAgIGNvbnZlcnRlcjogQ29udmVydGVyLFxuICAgIHJhd0FjdGlvblBhcmFtZXRlcjogUmF3QWN0aW9uWydwYXJhbWV0ZXJzJ11bbnVtYmVyXVxuKTogQWN0aW9uUGFyYW1ldGVyIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRBY3Rpb25QYXJhbWV0ZXIgPSByYXdBY3Rpb25QYXJhbWV0ZXIgYXMgQWN0aW9uUGFyYW1ldGVyO1xuXG4gICAgbGF6eShcbiAgICAgICAgY29udmVydGVkQWN0aW9uUGFyYW1ldGVyLFxuICAgICAgICAndHlwZVJlZmVyZW5jZScsXG4gICAgICAgICgpID0+XG4gICAgICAgICAgICBjb252ZXJ0ZXIuZ2V0Q29udmVydGVkRW50aXR5VHlwZShyYXdBY3Rpb25QYXJhbWV0ZXIudHlwZSkgPz9cbiAgICAgICAgICAgIGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRDb21wbGV4VHlwZShyYXdBY3Rpb25QYXJhbWV0ZXIudHlwZSkgPz9cbiAgICAgICAgICAgIGNvbnZlcnRlci5nZXRDb252ZXJ0ZWRUeXBlRGVmaW5pdGlvbihyYXdBY3Rpb25QYXJhbWV0ZXIudHlwZSlcbiAgICApO1xuXG4gICAgbGF6eShjb252ZXJ0ZWRBY3Rpb25QYXJhbWV0ZXIsICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd0FjdGlvblBhcmFtZXRlcikpO1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZEFjdGlvblBhcmFtZXRlcjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIENvbXBsZXhUeXBlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICBDb252ZXJ0ZXJcbiAqIEBwYXJhbSByYXdDb21wbGV4VHlwZSAgVW5jb252ZXJ0ZWQgQ29tcGxleFR5cGVcbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgQ29tcGxleFR5cGVcbiAqL1xuZnVuY3Rpb24gY29udmVydENvbXBsZXhUeXBlKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdDb21wbGV4VHlwZTogUmF3Q29tcGxleFR5cGUpOiBDb21wbGV4VHlwZSB7XG4gICAgY29uc3QgY29udmVydGVkQ29tcGxleFR5cGUgPSByYXdDb21wbGV4VHlwZSBhcyBDb21wbGV4VHlwZTtcblxuICAgIGxhenkoY29udmVydGVkQ29tcGxleFR5cGUsICdwcm9wZXJ0aWVzJywgY29udmVydGVyLmNvbnZlcnQocmF3Q29tcGxleFR5cGUucHJvcGVydGllcywgY29udmVydFByb3BlcnR5KSk7XG4gICAgbGF6eShcbiAgICAgICAgY29udmVydGVkQ29tcGxleFR5cGUsXG4gICAgICAgICduYXZpZ2F0aW9uUHJvcGVydGllcycsXG4gICAgICAgIGNvbnZlcnRlci5jb252ZXJ0KHJhd0NvbXBsZXhUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzIGFzIGFueVtdLCBjb252ZXJ0TmF2aWdhdGlvblByb3BlcnR5KVxuICAgICk7XG4gICAgbGF6eShjb252ZXJ0ZWRDb21wbGV4VHlwZSwgJ2Fubm90YXRpb25zJywgcmVzb2x2ZUFubm90YXRpb25zKGNvbnZlcnRlciwgcmF3Q29tcGxleFR5cGUpKTtcblxuICAgIHJldHVybiBjb252ZXJ0ZWRDb21wbGV4VHlwZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIFR5cGVEZWZpbml0aW9uLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXIgICBDb252ZXJ0ZXJcbiAqIEBwYXJhbSByYXdUeXBlRGVmaW5pdGlvbiAgVW5jb252ZXJ0ZWQgVHlwZURlZmluaXRpb25cbiAqIEByZXR1cm5zIFRoZSBjb252ZXJ0ZWQgVHlwZURlZmluaXRpb25cbiAqL1xuZnVuY3Rpb24gY29udmVydFR5cGVEZWZpbml0aW9uKGNvbnZlcnRlcjogQ29udmVydGVyLCByYXdUeXBlRGVmaW5pdGlvbjogUmF3VHlwZURlZmluaXRpb24pOiBUeXBlRGVmaW5pdGlvbiB7XG4gICAgY29uc3QgY29udmVydGVkVHlwZURlZmluaXRpb24gPSByYXdUeXBlRGVmaW5pdGlvbiBhcyBUeXBlRGVmaW5pdGlvbjtcblxuICAgIGxhenkoY29udmVydGVkVHlwZURlZmluaXRpb24sICdhbm5vdGF0aW9ucycsIHJlc29sdmVBbm5vdGF0aW9ucyhjb252ZXJ0ZXIsIHJhd1R5cGVEZWZpbml0aW9uKSk7XG5cbiAgICByZXR1cm4gY29udmVydGVkVHlwZURlZmluaXRpb247XG59XG5cbi8qKlxuICogQ29udmVydCBhIFJhd01ldGFkYXRhIGludG8gYW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIHRvIGJlIHVzZWQgdG8gZWFzaWx5IG5hdmlnYXRlIGEgbWV0YWRhdGEgb2JqZWN0IGFuZCBpdHMgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gcmF3TWV0YWRhdGFcbiAqIEByZXR1cm5zIHRoZSBjb252ZXJ0ZWQgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1ldGFkYXRhLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydChyYXdNZXRhZGF0YTogUmF3TWV0YWRhdGEpOiBDb252ZXJ0ZWRNZXRhZGF0YSB7XG4gICAgLy8gQ29udmVydGVyIE91dHB1dFxuICAgIGNvbnN0IGNvbnZlcnRlZE91dHB1dDogQ29udmVydGVkTWV0YWRhdGEgPSB7XG4gICAgICAgIHZlcnNpb246IHJhd01ldGFkYXRhLnZlcnNpb24sXG4gICAgICAgIG5hbWVzcGFjZTogcmF3TWV0YWRhdGEuc2NoZW1hLm5hbWVzcGFjZSxcbiAgICAgICAgYW5ub3RhdGlvbnM6IHJhd01ldGFkYXRhLnNjaGVtYS5hbm5vdGF0aW9ucyxcbiAgICAgICAgcmVmZXJlbmNlczogVm9jYWJ1bGFyeVJlZmVyZW5jZXMuY29uY2F0KHJhd01ldGFkYXRhLnJlZmVyZW5jZXMpLFxuICAgICAgICBkaWFnbm9zdGljczogW11cbiAgICB9IGFzIGFueTtcblxuICAgIC8vIGZhbGwgYmFjayBvbiB0aGUgZGVmYXVsdCByZWZlcmVuY2VzIGlmIHRoZSBjYWxsZXIgZG9lcyBub3Qgc3BlY2lmeSBhbnlcbiAgICBpZiAocmF3TWV0YWRhdGEucmVmZXJlbmNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmF3TWV0YWRhdGEucmVmZXJlbmNlcyA9IFZvY2FidWxhcnlSZWZlcmVuY2VzO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnRlclxuICAgIGNvbnN0IGNvbnZlcnRlciA9IG5ldyBDb252ZXJ0ZXIocmF3TWV0YWRhdGEsIGNvbnZlcnRlZE91dHB1dCk7XG5cbiAgICBsYXp5KFxuICAgICAgICBjb252ZXJ0ZWRPdXRwdXQsXG4gICAgICAgICdlbnRpdHlDb250YWluZXInLFxuICAgICAgICBjb252ZXJ0ZXIuY29udmVydChjb252ZXJ0ZXIucmF3U2NoZW1hLmVudGl0eUNvbnRhaW5lciwgY29udmVydEVudGl0eUNvbnRhaW5lcilcbiAgICApO1xuICAgIGxhenkoY29udmVydGVkT3V0cHV0LCAnZW50aXR5U2V0cycsIGNvbnZlcnRlci5jb252ZXJ0KGNvbnZlcnRlci5yYXdTY2hlbWEuZW50aXR5U2V0cywgY29udmVydEVudGl0eVNldCkpO1xuICAgIGxhenkoY29udmVydGVkT3V0cHV0LCAnc2luZ2xldG9ucycsIGNvbnZlcnRlci5jb252ZXJ0KGNvbnZlcnRlci5yYXdTY2hlbWEuc2luZ2xldG9ucywgY29udmVydFNpbmdsZXRvbikpO1xuICAgIGxhenkoY29udmVydGVkT3V0cHV0LCAnZW50aXR5VHlwZXMnLCBjb252ZXJ0ZXIuY29udmVydChjb252ZXJ0ZXIucmF3U2NoZW1hLmVudGl0eVR5cGVzLCBjb252ZXJ0RW50aXR5VHlwZSkpO1xuICAgIGxhenkoY29udmVydGVkT3V0cHV0LCAnYWN0aW9ucycsIGNvbnZlcnRlci5jb252ZXJ0KGNvbnZlcnRlci5yYXdTY2hlbWEuYWN0aW9ucywgY29udmVydEFjdGlvbikpO1xuICAgIGxhenkoY29udmVydGVkT3V0cHV0LCAnY29tcGxleFR5cGVzJywgY29udmVydGVyLmNvbnZlcnQoY29udmVydGVyLnJhd1NjaGVtYS5jb21wbGV4VHlwZXMsIGNvbnZlcnRDb21wbGV4VHlwZSkpO1xuICAgIGxhenkoY29udmVydGVkT3V0cHV0LCAnYWN0aW9uSW1wb3J0cycsIGNvbnZlcnRlci5jb252ZXJ0KGNvbnZlcnRlci5yYXdTY2hlbWEuYWN0aW9uSW1wb3J0cywgY29udmVydEFjdGlvbkltcG9ydCkpO1xuICAgIGxhenkoXG4gICAgICAgIGNvbnZlcnRlZE91dHB1dCxcbiAgICAgICAgJ3R5cGVEZWZpbml0aW9ucycsXG4gICAgICAgIGNvbnZlcnRlci5jb252ZXJ0KGNvbnZlcnRlci5yYXdTY2hlbWEudHlwZURlZmluaXRpb25zLCBjb252ZXJ0VHlwZURlZmluaXRpb24pXG4gICAgKTtcblxuICAgIGNvbnZlcnRlZE91dHB1dC5yZXNvbHZlUGF0aCA9IGZ1bmN0aW9uIHJlc29sdmVQYXRoPFQ+KHBhdGg6IHN0cmluZyk6IFJlc29sdXRpb25UYXJnZXQ8VD4ge1xuICAgICAgICBjb25zdCB0YXJnZXRSZXNvbHV0aW9uID0gcmVzb2x2ZVRhcmdldDxUPihjb252ZXJ0ZXIsIHVuZGVmaW5lZCwgcGF0aCk7XG4gICAgICAgIGlmICh0YXJnZXRSZXNvbHV0aW9uLnRhcmdldCkge1xuICAgICAgICAgICAgYXBwZW5kT2JqZWN0UGF0aCh0YXJnZXRSZXNvbHV0aW9uLm9iamVjdFBhdGgsIHRhcmdldFJlc29sdXRpb24udGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0UmVzb2x1dGlvbjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNvbnZlcnRlZE91dHB1dDtcbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xuZXhwb3J0ICogZnJvbSAnLi93cml0ZWJhY2snO1xuIiwiaW1wb3J0IHR5cGUgeyBBcnJheVdpdGhJbmRleCwgQ29tcGxleFR5cGUsIEluZGV4LCBSZWZlcmVuY2UsIFR5cGVEZWZpbml0aW9uIH0gZnJvbSAnQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMnO1xuXG5leHBvcnQgeyBFbnVtSXNGbGFnIH0gZnJvbSAnQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0VudW1Jc0ZsYWcnO1xuZXhwb3J0IHsgVGVybVRvVHlwZXMgfSBmcm9tICdAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVGVybVRvVHlwZXMnO1xuZXhwb3J0IHsgVm9jYWJ1bGFyeVJlZmVyZW5jZXMgYXMgZGVmYXVsdFJlZmVyZW5jZXMgfSBmcm9tICdAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVm9jYWJ1bGFyeVJlZmVyZW5jZXMnO1xuXG5leHBvcnQgdHlwZSBSZWZlcmVuY2VzV2l0aE1hcCA9IFJlZmVyZW5jZVtdICYge1xuICAgIHJlZmVyZW5jZU1hcD86IFJlY29yZDxzdHJpbmcsIFJlZmVyZW5jZT47XG4gICAgcmV2ZXJzZVJlZmVyZW5jZU1hcD86IFJlY29yZDxzdHJpbmcsIFJlZmVyZW5jZT47XG59O1xuXG5mdW5jdGlvbiBzcGxpdEF0KHN0cmluZzogc3RyaW5nLCBpbmRleDogbnVtYmVyKTogW3N0cmluZywgc3RyaW5nXSB7XG4gICAgcmV0dXJuIGluZGV4IDwgMCA/IFtzdHJpbmcsICcnXSA6IFtzdHJpbmcuc3Vic3RyaW5nKDAsIGluZGV4KSwgc3RyaW5nLnN1YnN0cmluZyhpbmRleCArIDEpXTtcbn1cblxuZnVuY3Rpb24gc3Vic3RyaW5nQXQoc3RyaW5nOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gaW5kZXggPCAwID8gc3RyaW5nIDogc3RyaW5nLnN1YnN0cmluZygwLCBpbmRleCk7XG59XG5cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGF0IHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGEgc2VwYXJhdG9yLlxuICpcbiAqIEBwYXJhbSBzdHJpbmcgICAgVGhlIHN0cmluZyB0byBzcGxpdFxuICogQHBhcmFtIHNlcGFyYXRvciBTZXBhcmF0b3IsIGUuZy4gYSBzaW5nbGUgY2hhcmFjdGVyLlxuICogQHJldHVybnMgQW4gYXJyYXkgY29uc2lzdGluZyBvZiB0d28gZWxlbWVudHM6IHRoZSBwYXJ0IGJlZm9yZSB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc2VwYXJhdG9yIGFuZCB0aGUgcGFydCBhZnRlciBpdC4gSWYgdGhlIHN0cmluZyBkb2VzIG5vdCBjb250YWluIHRoZSBzZXBhcmF0b3IsIHRoZSBzZWNvbmQgZWxlbWVudCBpcyB0aGUgZW1wdHkgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRBdEZpcnN0KHN0cmluZzogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICAgIHJldHVybiBzcGxpdEF0KHN0cmluZywgc3RyaW5nLmluZGV4T2Yoc2VwYXJhdG9yKSk7XG59XG5cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGF0IHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgYSBzZXBhcmF0b3IuXG4gKlxuICogQHBhcmFtIHN0cmluZyAgICBUaGUgc3RyaW5nIHRvIHNwbGl0XG4gKiBAcGFyYW0gc2VwYXJhdG9yIFNlcGFyYXRvciwgZS5nLiBhIHNpbmdsZSBjaGFyYWN0ZXIuXG4gKiBAcmV0dXJucyBBbiBhcnJheSBjb25zaXN0aW5nIG9mIHR3byBlbGVtZW50czogdGhlIHBhcnQgYmVmb3JlIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHNlcGFyYXRvciBhbmQgdGhlIHBhcnQgYWZ0ZXIgaXQuIElmIHRoZSBzdHJpbmcgZG9lcyBub3QgY29udGFpbiB0aGUgc2VwYXJhdG9yLCB0aGUgc2Vjb25kIGVsZW1lbnQgaXMgdGhlIGVtcHR5IHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0QXRMYXN0KHN0cmluZzogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ10ge1xuICAgIHJldHVybiBzcGxpdEF0KHN0cmluZywgc3RyaW5nLmxhc3RJbmRleE9mKHNlcGFyYXRvcikpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHN1YnN0cmluZyBiZWZvcmUgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYSBzZXBhcmF0b3IuXG4gKlxuICogQHBhcmFtIHN0cmluZyAgICBUaGUgc3RyaW5nXG4gKiBAcGFyYW0gc2VwYXJhdG9yIFNlcGFyYXRvciwgZS5nLiBhIHNpbmdsZSBjaGFyYWN0ZXIuXG4gKiBAcmV0dXJucyBUaGUgc3Vic3RyaW5nIGJlZm9yZSB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc2VwYXJhdG9yLCBvciB0aGUgaW5wdXQgc3RyaW5nIGlmIGl0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNlcGFyYXRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnN0cmluZ0JlZm9yZUZpcnN0KHN0cmluZzogc3RyaW5nLCBzZXBhcmF0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN1YnN0cmluZ0F0KHN0cmluZywgc3RyaW5nLmluZGV4T2Yoc2VwYXJhdG9yKSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc3Vic3RyaW5nIGJlZm9yZSB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIGEgc2VwYXJhdG9yLlxuICpcbiAqIEBwYXJhbSBzdHJpbmcgICAgVGhlIHN0cmluZ1xuICogQHBhcmFtIHNlcGFyYXRvciBTZXBhcmF0b3IsIGUuZy4gYSBzaW5nbGUgY2hhcmFjdGVyLlxuICogQHJldHVybnMgVGhlIHN1YnN0cmluZyBiZWZvcmUgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc2VwYXJhdG9yLCBvciB0aGUgaW5wdXQgc3RyaW5nIGlmIGl0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNlcGFyYXRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnN0cmluZ0JlZm9yZUxhc3Qoc3RyaW5nOiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc3Vic3RyaW5nQXQoc3RyaW5nLCBzdHJpbmcubGFzdEluZGV4T2Yoc2VwYXJhdG9yKSk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIHVuYWxpYXNlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gYW5ub3RhdGlvbiB0byB0aGUgYWxpYXNlZCB2ZXJzaW9uLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIGN1cnJlbnRSZWZlcmVuY2VzIGZvciB0aGUgcHJvamVjdFxuICogQHBhcmFtIHVuYWxpYXNlZFZhbHVlIHRoZSB1bmFsaWFzZWQgdmFsdWVcbiAqIEByZXR1cm5zIHRoZSBhbGlhc2VkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHNhbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFsaWFzKHJlZmVyZW5jZXM6IFJlZmVyZW5jZXNXaXRoTWFwLCB1bmFsaWFzZWRWYWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXJlZmVyZW5jZXMucmV2ZXJzZVJlZmVyZW5jZU1hcCkge1xuICAgICAgICByZWZlcmVuY2VzLnJldmVyc2VSZWZlcmVuY2VNYXAgPSByZWZlcmVuY2VzLnJlZHVjZSgobWFwOiBSZWNvcmQ8c3RyaW5nLCBSZWZlcmVuY2U+LCByZWYpID0+IHtcbiAgICAgICAgICAgIG1hcFtyZWYubmFtZXNwYWNlXSA9IHJlZjtcbiAgICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgIH0sIHt9KTtcbiAgICB9XG4gICAgaWYgKCF1bmFsaWFzZWRWYWx1ZSkge1xuICAgICAgICByZXR1cm4gdW5hbGlhc2VkVmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IFtuYW1lc3BhY2UsIHZhbHVlXSA9IHNwbGl0QXRMYXN0KHVuYWxpYXNlZFZhbHVlLCAnLicpO1xuICAgIGNvbnN0IHJlZmVyZW5jZSA9IHJlZmVyZW5jZXMucmV2ZXJzZVJlZmVyZW5jZU1hcFtuYW1lc3BhY2VdO1xuICAgIGlmIChyZWZlcmVuY2UpIHtcbiAgICAgICAgcmV0dXJuIGAke3JlZmVyZW5jZS5hbGlhc30uJHt2YWx1ZX1gO1xuICAgIH0gZWxzZSBpZiAodW5hbGlhc2VkVmFsdWUuaW5jbHVkZXMoJ0AnKSkge1xuICAgICAgICAvLyBUcnkgdG8gc2VlIGlmIGl0J3MgYW4gYW5ub3RhdGlvbiBQYXRoIGxpa2UgdG9fU2FsZXNPcmRlci9AVUkuTGluZUl0ZW1cbiAgICAgICAgY29uc3QgW3ByZUFsaWFzLCBwb3N0QWxpYXNdID0gc3BsaXRBdEZpcnN0KHVuYWxpYXNlZFZhbHVlLCAnQCcpO1xuICAgICAgICByZXR1cm4gYCR7cHJlQWxpYXN9QCR7YWxpYXMocmVmZXJlbmNlcywgcG9zdEFsaWFzKX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmFsaWFzZWRWYWx1ZTtcbiAgICB9XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGFsaWFzZWQgc3RyaW5nIHRvIGl0cyB1bmFsaWFzZWQgdmVyc2lvbiBnaXZlbiBhIHNldCBvZiByZWZlcmVuY2VzLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIFRoZSByZWZlcmVuY2VzIHRvIHVzZSBmb3IgdW5hbGlhc2luZy5cbiAqIEBwYXJhbSBhbGlhc2VkVmFsdWUgVGhlIGFsaWFzZWQgdmFsdWVcbiAqIEBwYXJhbSBuYW1lc3BhY2UgVGhlIGZhbGxiYWNrIG5hbWVzcGFjZVxuICogQHJldHVybnMgVGhlIGVxdWFsIHVuYWxpYXNlZCBzdHJpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmFsaWFzKFxuICAgIHJlZmVyZW5jZXM6IFJlZmVyZW5jZXNXaXRoTWFwLFxuICAgIGFsaWFzZWRWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIG5hbWVzcGFjZT86IHN0cmluZ1xuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBfdW5hbGlhcyA9ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmICghcmVmZXJlbmNlcy5yZWZlcmVuY2VNYXApIHtcbiAgICAgICAgICAgIHJlZmVyZW5jZXMucmVmZXJlbmNlTWFwID0gT2JqZWN0LmZyb21FbnRyaWVzKHJlZmVyZW5jZXMubWFwKChyZWYpID0+IFtyZWYuYWxpYXMsIHJlZl0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsaWFzZXMgYXJlIG9mIHR5cGUgJ1NpbXBsZUlkZW50aWZpZXInIGFuZCBtdXN0IG5vdCBjb250YWluIGRvdHNcbiAgICAgICAgY29uc3QgW21heWJlQWxpYXMsIHJlc3RdID0gc3BsaXRBdEZpcnN0KHZhbHVlLCAnLicpO1xuXG4gICAgICAgIGlmICghcmVzdCB8fCByZXN0LmluY2x1ZGVzKCcuJykpIHtcbiAgICAgICAgICAgIC8vIGVpdGhlciB0aGVyZSBpcyBubyBkb3QgaW4gdGhlIHZhbHVlIG9yIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgLS0+IG5vdGhpbmcgdG8gZG9cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzQW5ub3RhdGlvbiA9IG1heWJlQWxpYXMuc3RhcnRzV2l0aCgnQCcpO1xuICAgICAgICBjb25zdCB2YWx1ZVRvVW5hbGlhcyA9IGlzQW5ub3RhdGlvbiA/IG1heWJlQWxpYXMuc3Vic3RyaW5nKDEpIDogbWF5YmVBbGlhcztcbiAgICAgICAgY29uc3Qga25vd25SZWZlcmVuY2UgPSByZWZlcmVuY2VzLnJlZmVyZW5jZU1hcFt2YWx1ZVRvVW5hbGlhc107XG4gICAgICAgIGlmIChrbm93blJlZmVyZW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIGlzQW5ub3RhdGlvbiA/IGBAJHtrbm93blJlZmVyZW5jZS5uYW1lc3BhY2V9LiR7cmVzdH1gIDogYCR7a25vd25SZWZlcmVuY2UubmFtZXNwYWNlfS4ke3Jlc3R9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBhbGlhcyBjb3VsZCBub3QgYmUgcmVzb2x2ZWQgdXNpbmcgdGhlIHJlZmVyZW5jZXMuIEFzc3VtZSBpdCBpcyB0aGUgXCJnbG9iYWxcIiBhbGlhcyAoPSBuYW1lc3BhY2UpXG4gICAgICAgIHJldHVybiBuYW1lc3BhY2UgJiYgIWlzQW5ub3RhdGlvbiA/IGAke25hbWVzcGFjZX0uJHtyZXN0fWAgOiB2YWx1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFsaWFzZWRWYWx1ZVxuICAgICAgICA/LnNwbGl0KCcvJylcbiAgICAgICAgLnJlZHVjZSgoc2VnbWVudHMsIHNlZ21lbnQpID0+IHtcbiAgICAgICAgICAgIC8vIHRoZSBzZWdtZW50IGNvdWxkIGJlIGFuIGFjdGlvbiwgbGlrZSBcImRvU29tZXRoaW5nKGZvby5iYXIpXCJcbiAgICAgICAgICAgIGNvbnN0IFtmaXJzdCwgcmVzdF0gPSBzcGxpdEF0Rmlyc3Qoc2VnbWVudCwgJygnKTtcbiAgICAgICAgICAgIGNvbnN0IHN1YlNlZ21lbnQgPSBbX3VuYWxpYXMoZmlyc3QpXTtcblxuICAgICAgICAgICAgaWYgKHJlc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXIgPSByZXN0LnNsaWNlKDAsIC0xKTsgLy8gcmVtb3ZlIHRyYWlsaW5nIFwiKVwiXG4gICAgICAgICAgICAgICAgc3ViU2VnbWVudC5wdXNoKGAoJHtfdW5hbGlhcyhwYXJhbWV0ZXIpfSlgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goc3ViU2VnbWVudC5qb2luKCcnKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICAgICAgfSwgW10gYXMgc3RyaW5nW10pXG4gICAgICAgID8uam9pbignLycpO1xufVxuXG4vKipcbiAqIERpZmZlcmVudGlhdGUgYmV0d2VlbiBhIENvbXBsZXhUeXBlIGFuZCBhIFR5cGVEZWZpbml0aW9uLlxuICpcbiAqIEBwYXJhbSBjb21wbGV4VHlwZURlZmluaXRpb25cbiAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGlzIGEgY29tcGxleCB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbXBsZXhUeXBlRGVmaW5pdGlvbihcbiAgICBjb21wbGV4VHlwZURlZmluaXRpb24/OiBDb21wbGV4VHlwZSB8IFR5cGVEZWZpbml0aW9uXG4pOiBjb21wbGV4VHlwZURlZmluaXRpb24gaXMgQ29tcGxleFR5cGUge1xuICAgIHJldHVybiAoXG4gICAgICAgICEhY29tcGxleFR5cGVEZWZpbml0aW9uICYmIGNvbXBsZXhUeXBlRGVmaW5pdGlvbi5fdHlwZSA9PT0gJ0NvbXBsZXhUeXBlJyAmJiAhIWNvbXBsZXhUeXBlRGVmaW5pdGlvbi5wcm9wZXJ0aWVzXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlY2ltYWwodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlzRGVjaW1hbCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICB2YWx1ZU9mKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgbGF6eSBwcm9wZXJ0eS5cbiAqXG4gKiBUaGUgcHJvcGVydHkgaXMgaW5pdGlhbGl6ZWQgYnkgY2FsbGluZyB0aGUgaW5pdCBmdW5jdGlvbiBvbiB0aGUgZmlyc3QgcmVhZCBhY2Nlc3MsIG9yIGJ5IGRpcmVjdGx5IGFzc2lnbmluZyBhIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBvYmplY3QgICAgVGhlIGhvc3Qgb2JqZWN0XG4gKiBAcGFyYW0gcHJvcGVydHkgIFRoZSBsYXp5IHByb3BlcnR5IHRvIGFkZFxuICogQHBhcmFtIGluaXQgICAgICBUaGUgZnVuY3Rpb24gdGhhdCBpbml0aWFsaXplcyB0aGUgcHJvcGVydHkncyB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF6eTxUeXBlLCBLZXkgZXh0ZW5kcyBrZXlvZiBUeXBlPihvYmplY3Q6IFR5cGUsIHByb3BlcnR5OiBLZXksIGluaXQ6ICgpID0+IFR5cGVbS2V5XSkge1xuICAgIGNvbnN0IGluaXRpYWwgPSBTeW1ib2woJ2luaXRpYWwnKTtcbiAgICBsZXQgX3ZhbHVlOiBUeXBlW0tleV0gfCB0eXBlb2YgaW5pdGlhbCA9IGluaXRpYWw7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0eSwge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIGlmIChfdmFsdWUgPT09IGluaXRpYWwpIHtcbiAgICAgICAgICAgICAgICBfdmFsdWUgPSBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3ZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldCh2YWx1ZTogVHlwZVtLZXldKSB7XG4gICAgICAgICAgICBfdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGFsbG93cyB0byBmaW5kIGFuIGFycmF5IGVsZW1lbnQgYnkgcHJvcGVydHkgdmFsdWUuXG4gKlxuICogQHBhcmFtIGFycmF5ICAgICBUaGUgYXJyYXlcbiAqIEBwYXJhbSBwcm9wZXJ0eSAgRWxlbWVudHMgaW4gdGhlIGFycmF5IGFyZSBzZWFyY2hlZCBieSB0aGlzIHByb3BlcnR5XG4gKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhbiBlbGVtZW50IG9mIHRoZSBhcnJheSBieSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluZGV4ZWRGaW5kPFQ+KGFycmF5OiBBcnJheTxUPiwgcHJvcGVydHk6IGtleW9mIFQpIHtcbiAgICBjb25zdCBpbmRleDogTWFwPFRba2V5b2YgVF0sIFQgfCB1bmRlZmluZWQ+ID0gbmV3IE1hcCgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGZpbmQodmFsdWU6IFRba2V5b2YgVF0pIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGluZGV4LmdldCh2YWx1ZSk7XG5cbiAgICAgICAgaWYgKGVsZW1lbnQ/Lltwcm9wZXJ0eV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheS5maW5kKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQ/Lmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IGVsZW1lbnRbcHJvcGVydHldO1xuICAgICAgICAgICAgaW5kZXguc2V0KHByb3BlcnR5VmFsdWUsIGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5VmFsdWUgPT09IHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIEFkZHMgYSAnZ2V0IGJ5IHZhbHVlJyBmdW5jdGlvbiB0byBhbiBhcnJheS5cbiAqXG4gKiBJZiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGFkZEluZGV4KG15QXJyYXksICduYW1lJyksIGEgbmV3IGZ1bmN0aW9uICdieV9uYW1lKHZhbHVlKScgd2lsbCBiZSBhZGRlZCB0aGF0IGFsbG93cyB0b1xuICogZmluZCBhIG1lbWJlciBvZiB0aGUgYXJyYXkgYnkgdGhlIHZhbHVlIG9mIGl0cyAnbmFtZScgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIGFycmF5ICAgICAgVGhlIGFycmF5XG4gKiBAcGFyYW0gcHJvcGVydHkgICBUaGUgcHJvcGVydHkgdGhhdCB3aWxsIGJlIHVzZWQgYnkgdGhlICdieV97cHJvcGVydHl9KCknIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyBUaGUgYXJyYXkgd2l0aCB0aGUgYWRkZWQgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEdldEJ5VmFsdWU8VCwgUCBleHRlbmRzIEV4dHJhY3Q8a2V5b2YgVCwgc3RyaW5nPj4oYXJyYXk6IEFycmF5PFQ+LCBwcm9wZXJ0eTogUCkge1xuICAgIGNvbnN0IGluZGV4TmFtZToga2V5b2YgSW5kZXg8VCwgUD4gPSBgYnlfJHtwcm9wZXJ0eX1gO1xuXG4gICAgaWYgKCFhcnJheS5oYXNPd25Qcm9wZXJ0eShpbmRleE5hbWUpKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhcnJheSwgaW5kZXhOYW1lLCB7IHdyaXRhYmxlOiBmYWxzZSwgdmFsdWU6IGNyZWF0ZUluZGV4ZWRGaW5kKGFycmF5LCBwcm9wZXJ0eSkgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAnJHtpbmRleE5hbWV9JyBhbHJlYWR5IGV4aXN0c2ApO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXkgYXMgQXJyYXlXaXRoSW5kZXg8VCwgUD47XG59XG4iLCJpbXBvcnQgdHlwZSB7XG4gICAgQW5ub3RhdGlvblBhdGhFeHByZXNzaW9uLFxuICAgIEFubm90YXRpb25SZWNvcmQsXG4gICAgQW5ub3RhdGlvblRlcm0sXG4gICAgRXhwcmVzc2lvbixcbiAgICBOYXZpZ2F0aW9uUHJvcGVydHlQYXRoRXhwcmVzc2lvbixcbiAgICBQYXRoRXhwcmVzc2lvbixcbiAgICBQcm9wZXJ0eVBhdGhFeHByZXNzaW9uLFxuICAgIFJhd0Fubm90YXRpb24sXG4gICAgUmVmZXJlbmNlXG59IGZyb20gJ0BzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzJztcbmltcG9ydCB7IHVuYWxpYXMgfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBSZXZlcnQgYW4gb2JqZWN0IHRvIGl0cyByYXcgdHlwZSBlcXVpdmFsZW50LlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIHRoZSBjdXJyZW50IHJlZmVyZW5jZVxuICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSB0byByZXZlcnRcbiAqIEByZXR1cm5zIHRoZSByYXcgdmFsdWVcbiAqL1xuZnVuY3Rpb24gcmV2ZXJ0T2JqZWN0VG9SYXdUeXBlKHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLCB2YWx1ZTogYW55KSB7XG4gICAgbGV0IHJlc3VsdDogRXhwcmVzc2lvbiB8IHVuZGVmaW5lZDtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0NvbGxlY3Rpb24nLFxuICAgICAgICAgICAgQ29sbGVjdGlvbjogdmFsdWUubWFwKChhbm5vKSA9PiByZXZlcnRDb2xsZWN0aW9uSXRlbVRvUmF3VHlwZShyZWZlcmVuY2VzLCBhbm5vKSkgYXMgYW55W11cbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLmlzRGVjaW1hbD8uKCkpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0RlY2ltYWwnLFxuICAgICAgICAgICAgRGVjaW1hbDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5pc1N0cmluZz8uKCkpIHtcbiAgICAgICAgY29uc3QgdmFsdWVNYXRjaGVzID0gdmFsdWUudmFsdWVPZigpLnNwbGl0KCcuJyk7XG4gICAgICAgIGlmICh2YWx1ZU1hdGNoZXMubGVuZ3RoID4gMSAmJiByZWZlcmVuY2VzLmZpbmQoKHJlZikgPT4gcmVmLmFsaWFzID09PSB2YWx1ZU1hdGNoZXNbMF0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0VudW1NZW1iZXInLFxuICAgICAgICAgICAgICAgIEVudW1NZW1iZXI6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnU3RyaW5nJyxcbiAgICAgICAgICAgICAgICBTdHJpbmc6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodmFsdWUuaXNJbnQ/LigpKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdJbnQnLFxuICAgICAgICAgICAgSW50OiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLmlzRmxvYXQ/LigpKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdGbG9hdCcsXG4gICAgICAgICAgICBGbG9hdDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5pc0RhdGU/LigpKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdEYXRlJyxcbiAgICAgICAgICAgIERhdGU6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUuaXNCb29sZWFuPy4oKSkge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnQm9vbCcsXG4gICAgICAgICAgICBCb29sOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdQYXRoJykge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnUGF0aCcsXG4gICAgICAgICAgICBQYXRoOiB2YWx1ZS5wYXRoXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnQW5ub3RhdGlvblBhdGgnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICBBbm5vdGF0aW9uUGF0aDogdmFsdWUudmFsdWVcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdBcHBseScpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0FwcGx5JyxcbiAgICAgICAgICAgIEFwcGx5OiB2YWx1ZS5BcHBseVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ051bGwnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdOdWxsJ1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ1Byb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICBQcm9wZXJ0eVBhdGg6IHZhbHVlLnZhbHVlXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aDogdmFsdWUudmFsdWVcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJyRUeXBlJykpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ1JlY29yZCcsXG4gICAgICAgICAgICBSZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKSBhcyBBbm5vdGF0aW9uUmVjb3JkXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmV2ZXJ0IGEgdmFsdWUgdG8gaXRzIHJhdyB2YWx1ZSBkZXBlbmRpbmcgb24gaXRzIHR5cGUuXG4gKlxuICogQHBhcmFtIHJlZmVyZW5jZXMgdGhlIGN1cnJlbnQgc2V0IG9mIHJlZmVyZW5jZVxuICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSB0byByZXZlcnRcbiAqIEByZXR1cm5zIHRoZSByYXcgZXhwcmVzc2lvblxuICovXG5mdW5jdGlvbiByZXZlcnRWYWx1ZVRvUmF3VHlwZShyZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSwgdmFsdWU6IGFueSk6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQge1xuICAgIGxldCByZXN1bHQ6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgdmFsdWVDb25zdHJ1Y3RvciA9IHZhbHVlPy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHN3aXRjaCAodmFsdWVDb25zdHJ1Y3Rvcikge1xuICAgICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgY29uc3QgdmFsdWVNYXRjaGVzID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgaWYgKHZhbHVlTWF0Y2hlcy5sZW5ndGggPiAxICYmIHJlZmVyZW5jZXMuZmluZCgocmVmKSA9PiByZWYuYWxpYXMgPT09IHZhbHVlTWF0Y2hlc1swXSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdFbnVtTWVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgRW51bU1lbWJlcjogdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZzogdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdCb29sJyxcbiAgICAgICAgICAgICAgICBCb29sOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdOdW1iZXInOlxuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgaWYgKHZhbHVlLnRvU3RyaW5nKCkgPT09IHZhbHVlLnRvRml4ZWQoKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ludCcsXG4gICAgICAgICAgICAgICAgICAgIEludDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRGVjaW1hbCcsXG4gICAgICAgICAgICAgICAgICAgIERlY2ltYWw6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJlc3VsdCA9IHJldmVydE9iamVjdFRvUmF3VHlwZShyZWZlcmVuY2VzLCB2YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY29uc3QgcmVzdHJpY3RlZEtleXMgPSBbJyRUeXBlJywgJ3Rlcm0nLCAnX19zb3VyY2UnLCAncXVhbGlmaWVyJywgJ0FjdGlvblRhcmdldCcsICdmdWxseVF1YWxpZmllZE5hbWUnLCAnYW5ub3RhdGlvbnMnXTtcblxuLyoqXG4gKiBSZXZlcnQgdGhlIGN1cnJlbnQgZW1iZWRkZWQgYW5ub3RhdGlvbnMgdG8gdGhlaXIgcmF3IHR5cGUuXG4gKlxuICogQHBhcmFtIHJlZmVyZW5jZXMgdGhlIGN1cnJlbnQgc2V0IG9mIHJlZmVyZW5jZVxuICogQHBhcmFtIGN1cnJlbnRBbm5vdGF0aW9ucyB0aGUgY29sbGVjdGlvbiBpdGVtIHRvIGV2YWx1YXRlXG4gKiBAcGFyYW0gdGFyZ2V0QW5ub3RhdGlvbnMgdGhlIHBsYWNlIHdoZXJlIHdlIG5lZWQgdG8gYWRkIHRoZSBhbm5vdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHJldmVydEFubm90YXRpb25zVG9SYXdUeXBlKFxuICAgIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuICAgIGN1cnJlbnRBbm5vdGF0aW9uczogYW55LFxuICAgIHRhcmdldEFubm90YXRpb25zOiBSYXdBbm5vdGF0aW9uW11cbikge1xuICAgIE9iamVjdC5rZXlzKGN1cnJlbnRBbm5vdGF0aW9ucylcbiAgICAgICAgLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICdfYW5ub3RhdGlvbnMnKVxuICAgICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjdXJyZW50QW5ub3RhdGlvbnNba2V5XSkuZm9yRWFjaCgodGVybSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFubm90YXRpb24gPSByZXZlcnRUZXJtVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCBjdXJyZW50QW5ub3RhdGlvbnNba2V5XVt0ZXJtXSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRBbm5vdGF0aW9uLnRlcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5hbGlhc2VkVGVybSA9IHVuYWxpYXMocmVmZXJlbmNlcywgYCR7a2V5fS4ke3Rlcm19YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmFsaWFzZWRUZXJtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWFsaWZpZWRTcGxpdCA9IHVuYWxpYXNlZFRlcm0uc3BsaXQoJyMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEFubm90YXRpb24udGVybSA9IHF1YWxpZmllZFNwbGl0WzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1YWxpZmllZFNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdWIgQW5ub3RhdGlvbiB3aXRoIGEgcXVhbGlmaWVyLCBub3Qgc3VyZSB3aGVuIHRoYXQgY2FuIGhhcHBlbiBpbiByZWFsIHNjZW5hcmlvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEFubm90YXRpb24ucXVhbGlmaWVyID0gcXVhbGlmaWVkU3BsaXRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFyZ2V0QW5ub3RhdGlvbnMucHVzaChwYXJzZWRBbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbn1cblxuLyoqXG4gKiBSZXZlcnQgdGhlIGN1cnJlbnQgY29sbGVjdGlvbiBpdGVtIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJhdyBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIHRoZSBjdXJyZW50IHNldCBvZiByZWZlcmVuY2VcbiAqIEBwYXJhbSBjb2xsZWN0aW9uSXRlbSB0aGUgY29sbGVjdGlvbiBpdGVtIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB0aGUgcmF3IHR5cGUgZXF1aXZhbGVudFxuICovXG5mdW5jdGlvbiByZXZlcnRDb2xsZWN0aW9uSXRlbVRvUmF3VHlwZShcbiAgICByZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSxcbiAgICBjb2xsZWN0aW9uSXRlbTogYW55XG4pOlxuICAgIHwgQW5ub3RhdGlvblJlY29yZFxuICAgIHwgc3RyaW5nXG4gICAgfCBQcm9wZXJ0eVBhdGhFeHByZXNzaW9uXG4gICAgfCBQYXRoRXhwcmVzc2lvblxuICAgIHwgTmF2aWdhdGlvblByb3BlcnR5UGF0aEV4cHJlc3Npb25cbiAgICB8IEFubm90YXRpb25QYXRoRXhwcmVzc2lvblxuICAgIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodHlwZW9mIGNvbGxlY3Rpb25JdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbkl0ZW07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29sbGVjdGlvbkl0ZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChjb2xsZWN0aW9uSXRlbS5oYXNPd25Qcm9wZXJ0eSgnJFR5cGUnKSkge1xuICAgICAgICAgICAgLy8gQW5ub3RhdGlvbiBSZWNvcmRcbiAgICAgICAgICAgIGNvbnN0IG91dEl0ZW06IEFubm90YXRpb25SZWNvcmQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogY29sbGVjdGlvbkl0ZW0uJFR5cGUsXG4gICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZXM6IFtdIGFzIGFueVtdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gQ291bGQgdmFsaWRhdGUga2V5cyBhbmQgdHlwZSBiYXNlZCBvbiAkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29sbGVjdGlvbkl0ZW0pLmZvckVhY2goKGNvbGxlY3Rpb25LZXkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdHJpY3RlZEtleXMuaW5kZXhPZihjb2xsZWN0aW9uS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjb2xsZWN0aW9uSXRlbVtjb2xsZWN0aW9uS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgb3V0SXRlbS5wcm9wZXJ0eVZhbHVlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbGxlY3Rpb25LZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmV2ZXJ0VmFsdWVUb1Jhd1R5cGUocmVmZXJlbmNlcywgdmFsdWUpIGFzIEV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9uS2V5ID09PSAnYW5ub3RhdGlvbnMnICYmIE9iamVjdC5rZXlzKGNvbGxlY3Rpb25JdGVtW2NvbGxlY3Rpb25LZXldKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dEl0ZW0uYW5ub3RhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgcmV2ZXJ0QW5ub3RhdGlvbnNUb1Jhd1R5cGUocmVmZXJlbmNlcywgY29sbGVjdGlvbkl0ZW1bY29sbGVjdGlvbktleV0sIG91dEl0ZW0uYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG91dEl0ZW07XG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGVjdGlvbkl0ZW0udHlwZSA9PT0gJ1Byb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgUHJvcGVydHlQYXRoOiBjb2xsZWN0aW9uSXRlbS52YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9uSXRlbS50eXBlID09PSAnQW5ub3RhdGlvblBhdGgnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICAgICAgQW5ub3RhdGlvblBhdGg6IGNvbGxlY3Rpb25JdGVtLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGNvbGxlY3Rpb25JdGVtLnR5cGUgPT09ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aDogY29sbGVjdGlvbkl0ZW0udmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXZlcnQgYW4gYW5ub3RhdGlvbiB0ZXJtIHRvIGl0J3MgZ2VuZXJpYyBvciByYXcgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgcmVmZXJlbmNlIG9mIHRoZSBjdXJyZW50IGNvbnRleHRcbiAqIEBwYXJhbSBhbm5vdGF0aW9uIHRoZSBhbm5vdGF0aW9uIHRlcm0gdG8gcmV2ZXJ0XG4gKiBAcmV0dXJucyB0aGUgcmF3IGFubm90YXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJldmVydFRlcm1Ub0dlbmVyaWNUeXBlKHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLCBhbm5vdGF0aW9uOiBBbm5vdGF0aW9uVGVybTxhbnk+KTogUmF3QW5ub3RhdGlvbiB7XG4gICAgY29uc3QgYmFzZUFubm90YXRpb246IFJhd0Fubm90YXRpb24gPSB7XG4gICAgICAgIHRlcm06IGFubm90YXRpb24udGVybSxcbiAgICAgICAgcXVhbGlmaWVyOiBhbm5vdGF0aW9uLnF1YWxpZmllclxuICAgIH07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYW5ub3RhdGlvbikpIHtcbiAgICAgICAgLy8gQ29sbGVjdGlvblxuICAgICAgICBpZiAoYW5ub3RhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnYW5ub3RhdGlvbnMnKSAmJiBPYmplY3Qua2V5cygoYW5ub3RhdGlvbiBhcyBhbnkpLmFubm90YXRpb25zKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBBbm5vdGF0aW9uIG9uIGEgY29sbGVjdGlvbiBpdHNlbGYsIG5vdCBzdXJlIHdoZW4gdGhhdCBoYXBwZW5zIGlmIGF0IGFsbFxuICAgICAgICAgICAgYmFzZUFubm90YXRpb24uYW5ub3RhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHJldmVydEFubm90YXRpb25zVG9SYXdUeXBlKHJlZmVyZW5jZXMsIChhbm5vdGF0aW9uIGFzIGFueSkuYW5ub3RhdGlvbnMsIGJhc2VBbm5vdGF0aW9uLmFubm90YXRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uYmFzZUFubm90YXRpb24sXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBhbm5vdGF0aW9uLm1hcCgoYW5ubykgPT4gcmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ubykpIGFzIGFueVtdXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmIChhbm5vdGF0aW9uLmhhc093blByb3BlcnR5KCckVHlwZScpKSB7XG4gICAgICAgIHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCByZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIGFubm90YXRpb24pIGFzIGFueSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCB2YWx1ZTogcmV2ZXJ0VmFsdWVUb1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ub3RhdGlvbikgfTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRW51bUlzRmxhZyA9IHZvaWQgMDtcbmV4cG9ydHMuRW51bUlzRmxhZyA9IHtcbiAgICBcIkF1dGguS2V5TG9jYXRpb25cIjogZmFsc2UsXG4gICAgXCJDb3JlLlJldmlzaW9uS2luZFwiOiBmYWxzZSxcbiAgICBcIkNvcmUuRGF0YU1vZGlmaWNhdGlvbk9wZXJhdGlvbktpbmRcIjogZmFsc2UsXG4gICAgXCJDb3JlLlBlcm1pc3Npb25cIjogdHJ1ZSxcbiAgICBcIkNhcGFiaWxpdGllcy5Db25mb3JtYW5jZUxldmVsVHlwZVwiOiBmYWxzZSxcbiAgICBcIkNhcGFiaWxpdGllcy5Jc29sYXRpb25MZXZlbFwiOiB0cnVlLFxuICAgIFwiQ2FwYWJpbGl0aWVzLk5hdmlnYXRpb25UeXBlXCI6IGZhbHNlLFxuICAgIFwiQ2FwYWJpbGl0aWVzLlNlYXJjaEV4cHJlc3Npb25zXCI6IHRydWUsXG4gICAgXCJDYXBhYmlsaXRpZXMuSHR0cE1ldGhvZFwiOiB0cnVlLFxuICAgIFwiQWdncmVnYXRpb24uUm9sbHVwVHlwZVwiOiBmYWxzZSxcbiAgICBcIkNvbW1vbi5UZXh0Rm9ybWF0VHlwZVwiOiBmYWxzZSxcbiAgICBcIkNvbW1vbi5GaWx0ZXJFeHByZXNzaW9uVHlwZVwiOiBmYWxzZSxcbiAgICBcIkNvbW1vbi5GaWVsZENvbnRyb2xUeXBlXCI6IGZhbHNlLFxuICAgIFwiQ29tbW9uLkVmZmVjdFR5cGVcIjogdHJ1ZSxcbiAgICBcIkNvbW11bmljYXRpb24uS2luZFR5cGVcIjogZmFsc2UsXG4gICAgXCJDb21tdW5pY2F0aW9uLkNvbnRhY3RJbmZvcm1hdGlvblR5cGVcIjogdHJ1ZSxcbiAgICBcIkNvbW11bmljYXRpb24uUGhvbmVUeXBlXCI6IHRydWUsXG4gICAgXCJDb21tdW5pY2F0aW9uLkdlbmRlclR5cGVcIjogZmFsc2UsXG4gICAgXCJVSS5WaXN1YWxpemF0aW9uVHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLkNyaXRpY2FsaXR5VHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLkltcHJvdmVtZW50RGlyZWN0aW9uVHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLlRyZW5kVHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLkNoYXJ0VHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLkNoYXJ0QXhpc1NjYWxlQmVoYXZpb3JUeXBlXCI6IGZhbHNlLFxuICAgIFwiVUkuQ2hhcnRBeGlzQXV0b1NjYWxlRGF0YVNjb3BlVHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLkNoYXJ0RGltZW5zaW9uUm9sZVR5cGVcIjogZmFsc2UsXG4gICAgXCJVSS5DaGFydE1lYXN1cmVSb2xlVHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLlNlbGVjdGlvblJhbmdlU2lnblR5cGVcIjogZmFsc2UsXG4gICAgXCJVSS5TZWxlY3Rpb25SYW5nZU9wdGlvblR5cGVcIjogZmFsc2UsXG4gICAgXCJVSS5UZXh0QXJyYW5nZW1lbnRUeXBlXCI6IGZhbHNlLFxuICAgIFwiVUkuSW1wb3J0YW5jZVR5cGVcIjogZmFsc2UsXG4gICAgXCJVSS5Dcml0aWNhbGl0eVJlcHJlc2VudGF0aW9uVHlwZVwiOiBmYWxzZSxcbiAgICBcIlVJLk9wZXJhdGlvbkdyb3VwaW5nVHlwZVwiOiBmYWxzZSxcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVGVybVRvVHlwZXMgPSB2b2lkIDA7XG52YXIgVGVybVRvVHlwZXM7XG4oZnVuY3Rpb24gKFRlcm1Ub1R5cGVzKSB7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQXV0aG9yaXphdGlvbi5WMS5TZWN1cml0eVNjaGVtZXNcIl0gPSBcIk9yZy5PRGF0YS5BdXRob3JpemF0aW9uLlYxLlNlY3VyaXR5U2NoZW1lXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQXV0aG9yaXphdGlvbi5WMS5BdXRob3JpemF0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkF1dGhvcml6YXRpb24uVjEuQXV0aG9yaXphdGlvblwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuUmV2aXNpb25zXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5SZXZpc2lvblR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLkxpbmtzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5MaW5rXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5FeGFtcGxlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5FeGFtcGxlVmFsdWVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLk1lc3NhZ2VzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5NZXNzYWdlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuVmFsdWVFeGNlcHRpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlZhbHVlRXhjZXB0aW9uVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuUmVzb3VyY2VFeGNlcHRpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlJlc291cmNlRXhjZXB0aW9uVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuRGF0YU1vZGlmaWNhdGlvbkV4Y2VwdGlvblwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuRGF0YU1vZGlmaWNhdGlvbkV4Y2VwdGlvblR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLklzTGFuZ3VhZ2VEZXBlbmRlbnRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQXBwbGllc1ZpYUNvbnRhaW5lclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5EZXJlZmVyZW5jZWFibGVJRHNcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQ29udmVudGlvbmFsSURzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLlBlcm1pc3Npb25zXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5QZXJtaXNzaW9uXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5EZWZhdWx0TmFtZXNwYWNlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZERlZmF1bHRWYWx1ZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5Jc1VSTFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5Jc01lZGlhVHlwZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5Db250ZW50RGlzcG9zaXRpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLkNvbnRlbnREaXNwb3NpdGlvblR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLk9wdGltaXN0aWNDb25jdXJyZW5jeVwiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQWRkaXRpb25hbFByb3BlcnRpZXNcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQXV0b0V4cGFuZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5BdXRvRXhwYW5kUmVmZXJlbmNlc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5NYXlJbXBsZW1lbnRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFR5cGVOYW1lXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5PcmRlcmVkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLlBvc2l0aW9uYWxJbnNlcnRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQWx0ZXJuYXRlS2V5c1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuQWx0ZXJuYXRlS2V5XCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5PcHRpb25hbFBhcmFtZXRlclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuT3B0aW9uYWxQYXJhbWV0ZXJUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGVcIl0gPSBcIkVkbS5Cb29sZWFuXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5SZXF1aXJlc0V4cGxpY2l0QmluZGluZ1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5FeHBsaWNpdE9wZXJhdGlvbkJpbmRpbmdzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5RdWFsaWZpZWRCb3VuZE9wZXJhdGlvbk5hbWVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLlN5bWJvbGljTmFtZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuU2ltcGxlSWRlbnRpZmllclwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuR2VvbWV0cnlGZWF0dXJlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5HZW9tZXRyeUZlYXR1cmVUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbmZvcm1hbmNlTGV2ZWxcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ29uZm9ybWFuY2VMZXZlbFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQXN5bmNocm9ub3VzUmVxdWVzdHNTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5CYXRjaENvbnRpbnVlT25FcnJvclN1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLklzb2xhdGlvblN1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Jc29sYXRpb25MZXZlbFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Dcm9zc0pvaW5TdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DYWxsYmFja1N1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DYWxsYmFja1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ2hhbmdlVHJhY2tpbmdcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ2hhbmdlVHJhY2tpbmdUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvdW50UmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvdW50UmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk5hdmlnYXRpb25SZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluZGV4YWJsZUJ5S2V5XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVG9wU3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2tpcFN1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbXB1dGVTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWxlY3RTdXBwb3J0XCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlbGVjdFN1cHBvcnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoU3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQmF0Y2hTdXBwb3J0XCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoU3VwcG9ydFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9uc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU29ydFJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Tb3J0UmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5FeHBhbmRSZXN0cmljdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRXhwYW5kUmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWFyY2hSZXN0cmljdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5LZXlBc1NlZ21lbnRTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5RdWVyeVNlZ21lbnRTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5JbnNlcnRSZXN0cmljdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuSW5zZXJ0UmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwSW5zZXJ0U3VwcG9ydFwiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwSW5zZXJ0U3VwcG9ydFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVXBkYXRlUmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlVwZGF0ZVJlc3RyaWN0aW9uc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRGVlcFVwZGF0ZVN1cHBvcnRcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRGVlcFVwZGF0ZVN1cHBvcnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlbGV0ZVJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWxldGVSZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbGxlY3Rpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db2xsZWN0aW9uUHJvcGVydHlSZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk9wZXJhdGlvblJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5PcGVyYXRpb25SZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkFubm90YXRpb25WYWx1ZXNJblF1ZXJ5U3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuTW9kaWZpY2F0aW9uUXVlcnlPcHRpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk1vZGlmaWNhdGlvblF1ZXJ5T3B0aW9uc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuUmVhZFJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5SZWFkUmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DdXN0b21IZWFkZXJzXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkN1c3RvbVBhcmFtZXRlclwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DdXN0b21RdWVyeU9wdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ3VzdG9tUGFyYW1ldGVyXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk1lZGlhTG9jYXRpb25VcGRhdGVTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFwcGx5U3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQXBwbHlTdXBwb3J0ZWRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQXBwbHlTdXBwb3J0ZWREZWZhdWx0c1wiXSA9IFwiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFwcGx5U3VwcG9ydGVkQmFzZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkdyb3VwYWJsZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQWdncmVnYXRhYmxlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5Db250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzXCJdID0gXCJFZG0uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuTGV2ZWxlZEhpZXJhcmNoeVwiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLlJlY3Vyc2l2ZUhpZXJhcmNoeVwiXSA9IFwiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLlJlY3Vyc2l2ZUhpZXJhcmNoeVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BdmFpbGFibGVPbkFnZ3JlZ2F0ZXNcIl0gPSBcIk9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BdmFpbGFibGVPbkFnZ3JlZ2F0ZXNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5pbXVtXCJdID0gXCJFZG0uUHJpbWl0aXZlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWF4aW11bVwiXSA9IFwiRWRtLlByaW1pdGl2ZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkV4Y2x1c2l2ZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5BbGxvd2VkVmFsdWVzXCJdID0gXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5BbGxvd2VkVmFsdWVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk11bHRpcGxlT2ZcIl0gPSBcIkVkbS5EZWNpbWFsXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5Db25zdHJhaW50XCJdID0gXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5Db25zdHJhaW50VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuSXRlbXNPZlwiXSA9IFwiT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuSXRlbXNPZlR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk9wZW5Qcm9wZXJ0eVR5cGVDb25zdHJhaW50XCJdID0gXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5TaW5nbGVPckNvbGxlY3Rpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5EZXJpdmVkVHlwZUNvbnN0cmFpbnRcIl0gPSBcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLlNpbmdsZU9yQ29sbGVjdGlvblR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkFsbG93ZWRUZXJtc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuUXVhbGlmaWVkVGVybU5hbWVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkFwcGxpY2FibGVUZXJtc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuUXVhbGlmaWVkVGVybU5hbWVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1heEl0ZW1zXCJdID0gXCJFZG0uSW50NjRcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1pbkl0ZW1zXCJdID0gXCJFZG0uSW50NjRcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5NZWFzdXJlcy5WMS5TY2FsZVwiXSA9IFwiRWRtLkJ5dGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5NZWFzdXJlcy5WMS5EdXJhdGlvbkdyYW51bGFyaXR5XCJdID0gXCJPcmcuT0RhdGEuTWVhc3VyZXMuVjEuRHVyYXRpb25HcmFudWxhcml0eVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5EaW1lbnNpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLk1lYXN1cmVcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFjY3VtdWxhdGl2ZU1lYXN1cmVcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLlJvbGxlZFVwUHJvcGVydHlDb3VudFwiXSA9IFwiRWRtLkludDE2XCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuUGxhbm5pbmdBY3Rpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuQWdncmVnYXRlZFByb3BlcnR5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0eVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BbmFseXRpY2FsQ29udGV4dFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFuYWx5dGljYWxDb250ZXh0VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlcnZpY2VWZXJzaW9uXCJdID0gXCJFZG0uSW50MzJcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZXJ2aWNlU2NoZW1hVmVyc2lvblwiXSA9IFwiRWRtLkludDMyXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEZvclwiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzTGFuZ3VhZ2VJZGVudGlmaWVyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0Rm9ybWF0XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEZvcm1hdFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc1RpbWV6b25lXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0RpZ2l0U2VxdWVuY2VcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzVXBwZXJDYXNlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0N1cnJlbmN5XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc1VuaXRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlVuaXRTcGVjaWZpY1NjYWxlXCJdID0gXCJFZG0uUHJpbWl0aXZlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlVuaXRTcGVjaWZpY1ByZWNpc2lvblwiXSA9IFwiRWRtLlByaW1pdGl2ZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZWNvbmRhcnlLZXlcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NaW5PY2N1cnNcIl0gPSBcIkVkbS5JbnQ2NFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1heE9jY3Vyc1wiXSA9IFwiRWRtLkludDY0XCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXNzb2NpYXRpb25FbnRpdHlcIl0gPSBcIkVkbS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVyaXZlZE5hdmlnYXRpb25cIl0gPSBcIkVkbS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWFza2VkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXZlYWxPbkRlbWFuZFwiXSA9IFwiRWRtLkJvb2xlYW5cIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNJbnN0YW5jZUFubm90YXRpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkFwcGxpY2F0aW9uXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXBwbGljYXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGltZXN0YW1wXCJdID0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5FcnJvclJlc29sdXRpb25cIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5FcnJvclJlc29sdXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXNcIl0gPSBcIkVkbS5Db21wbGV4VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLm51bWVyaWNTZXZlcml0eVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk51bWVyaWNNZXNzYWdlU2V2ZXJpdHlUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWF4aW11bU51bWVyaWNNZXNzYWdlU2V2ZXJpdHlcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5OdW1lcmljTWVzc2FnZVNldmVyaXR5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQWN0aW9uQ3JpdGljYWxcIl0gPSBcIkVkbS5Cb29sZWFuXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXR0cmlidXRlc1wiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlbGF0ZWRSZWN1cnNpdmVIaWVyYXJjaHlcIl0gPSBcIkVkbS5Bbm5vdGF0aW9uUGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkludGVydmFsXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSW50ZXJ2YWxUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVzdWx0Q29udGV4dFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU0FQT2JqZWN0Tm9kZVR5cGVcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TQVBPYmplY3ROb2RlVHlwZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Db21wb3NpdGlvblwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNOYXR1cmFsUGVyc29uXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5TaW1wbGVJZGVudGlmaWVyXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RNYXBwaW5nXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZ1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyWWVhclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhckhhbGZ5ZWFyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyUXVhcnRlclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhck1vbnRoXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyV2Vla1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEYXlPZkNhbGVuZGFyTW9udGhcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRGF5T2ZDYWxlbmRhclllYXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFySGFsZnllYXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFyUXVhcnRlclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclllYXJNb250aFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclllYXJXZWVrXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyRGF0ZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxZZWFyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFBlcmlvZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxZZWFyUGVyaW9kXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFF1YXJ0ZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhclF1YXJ0ZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsV2Vla1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxZZWFyV2Vla1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEYXlPZkZpc2NhbFllYXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhclZhcmlhbnRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk11dHVhbGx5RXhjbHVzaXZlVGVybVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdEFjdGl2YXRpb25WaWFcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlNpbXBsZUlkZW50aWZpZXJcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5FZGl0YWJsZUZpZWxkRm9yXCJdID0gXCJFZG0uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNpZGVFZmZlY3RzVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRlZmF1bHRWYWx1ZXNGdW5jdGlvblwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlF1YWxpZmllZE5hbWVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJEZWZhdWx0VmFsdWVcIl0gPSBcIkVkbS5QcmltaXRpdmVUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmlsdGVyRGVmYXVsdFZhbHVlSGlnaFwiXSA9IFwiRWRtLlByaW1pdGl2ZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Tb3J0T3JkZXJcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Tb3J0T3JkZXJUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVjdXJzaXZlSGllcmFyY2h5XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVjdXJzaXZlSGllcmFyY2h5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkNyZWF0ZWRBdFwiXSA9IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQ3JlYXRlZEJ5XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVXNlcklEXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQ2hhbmdlZEF0XCJdID0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5DaGFuZ2VkQnlcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Vc2VySURcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5BcHBseU11bHRpVW5pdEJlaGF2aW9yRm9yU29ydGluZ0FuZEZpbHRlcmluZ1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUHJpbWl0aXZlUHJvcGVydHlQYXRoXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkN1cnJlbmN5Q29kZXNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkNvZGVMaXN0U291cmNlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MS5Vbml0c09mTWVhc3VyZVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuQ29kZUxpc3RTb3VyY2VcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLlN0YW5kYXJkQ29kZVwiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuRXh0ZXJuYWxDb2RlXCJdID0gXCJFZG0uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MS5Jc0NvbmZpZ3VyYXRpb25EZXByZWNhdGlvbkNvZGVcIl0gPSBcIkVkbS5Cb29sZWFuXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQWRkcmVzc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5BZGRyZXNzVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5Jc0VtYWlsQWRkcmVzc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLklzUGhvbmVOdW1iZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5FdmVudFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5FdmVudERhdGFcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuVGFza1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5UYXNrRGF0YVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5NZXNzYWdlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLk1lc3NhZ2VEYXRhXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5IaWVyYXJjaHkudjEuUmVjdXJzaXZlSGllcmFyY2h5XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5IaWVyYXJjaHkudjEuUmVjdXJzaXZlSGllcmFyY2h5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkVudGl0eVNlbWFudGljc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkVudGl0eVNlbWFudGljc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5GaWVsZFNlbWFudGljc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkZpZWxkU2VtYW50aWNzVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLklzUG90ZW50aWFsbHlQZXJzb25hbFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWRcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm9cIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm9UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JZGVudGlmaWNhdGlvblwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkQWJzdHJhY3RcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkJhZGdlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5CYWRnZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU3RhdHVzSW5mb1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkQWJzdHJhY3RcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db25uZWN0ZWRGaWVsZHNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbm5lY3RlZEZpZWxkc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkdlb0xvY2F0aW9uc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2VvTG9jYXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5HZW9Mb2NhdGlvblwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2VvTG9jYXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db250YWN0c1wiXSA9IFwiRWRtLkFubm90YXRpb25QYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5NZWRpYVJlc291cmNlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5NZWRpYVJlc291cmNlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5LUElcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLktQSVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydERlZmluaXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WYWx1ZUNyaXRpY2FsaXR5XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WYWx1ZUNyaXRpY2FsaXR5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlMYWJlbHNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5TGFiZWxUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckZhY2V0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlF1aWNrVmlld0ZhY2V0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlF1aWNrQ3JlYXRlRmFjZXRzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GYWNldFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmlsdGVyRmFjZXRzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnRcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25WYXJpYW50XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25WYXJpYW50VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGhpbmdQZXJzcGVjdGl2ZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc1N1bW1hcnlcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUGFydE9mUHJldmlld1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5NYXBcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2FsbGVyeVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklzSW1hZ2VcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTXVsdGlMaW5lVGV4dFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk5vdGVcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk5vdGVUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklzQ29weUFjdGlvblwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DcmVhdGVIaWRkZW5cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVXBkYXRlSGlkZGVuXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRlbGV0ZUhpZGRlblwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5GaWx0ZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQWRhcHRhdGlvbkhpZGRlblwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlDYWxjdWxhdGlvblwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlDYWxjdWxhdGlvblR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkVtcGhhc2l6ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuT3JkZXJCeVwiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUGFyYW1ldGVyRGVmYXVsdFZhbHVlXCJdID0gXCJFZG0uUHJpbWl0aXZlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25TdGF0ZVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25TdGF0ZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlY29tbWVuZGF0aW9uTGlzdFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25MaXN0VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Eb05vdENoZWNrU2NhbGVPZk1lYXN1cmVkUXVhbnRpdHlcIl0gPSBcIkVkbS5Cb29sZWFuXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5IVE1MNS52MS5Dc3NEZWZhdWx0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuSFRNTDUudjEuQ3NzRGVmYXVsdHNUeXBlXCI7XG59KShUZXJtVG9UeXBlcyA9IGV4cG9ydHMuVGVybVRvVHlwZXMgfHwgKGV4cG9ydHMuVGVybVRvVHlwZXMgPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlZvY2FidWxhcnlSZWZlcmVuY2VzID0gdm9pZCAwO1xuLyoqXG4gKiBUaGUgbGlzdCBvZiB2b2NhYnVsYXJpZXMgd2l0aCBkZWZhdWx0IGFsaWFzZXMuXG4gKi9cbmV4cG9ydHMuVm9jYWJ1bGFyeVJlZmVyZW5jZXMgPSBbXG4gICAgeyBhbGlhczogXCJBdXRoXCIsIG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuQXV0aG9yaXphdGlvbi5WMVwiLCB1cmk6IFwiaHR0cHM6Ly9vYXNpcy10Y3MuZ2l0aHViLmlvL29kYXRhLXZvY2FidWxhcmllcy92b2NhYnVsYXJpZXMvT3JnLk9EYXRhLkF1dGhvcml6YXRpb24uVjEueG1sXCIgfSxcbiAgICB7IGFsaWFzOiBcIkNvcmVcIiwgbmFtZXNwYWNlOiBcIk9yZy5PRGF0YS5Db3JlLlYxXCIsIHVyaTogXCJodHRwczovL29hc2lzLXRjcy5naXRodWIuaW8vb2RhdGEtdm9jYWJ1bGFyaWVzL3ZvY2FidWxhcmllcy9PcmcuT0RhdGEuQ29yZS5WMS54bWxcIiB9LFxuICAgIHsgYWxpYXM6IFwiQ2FwYWJpbGl0aWVzXCIsIG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxXCIsIHVyaTogXCJodHRwczovL29hc2lzLXRjcy5naXRodWIuaW8vb2RhdGEtdm9jYWJ1bGFyaWVzL3ZvY2FidWxhcmllcy9PcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJBZ2dyZWdhdGlvblwiLCBuYW1lc3BhY2U6IFwiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxXCIsIHVyaTogXCJodHRwczovL29hc2lzLXRjcy5naXRodWIuaW8vb2RhdGEtdm9jYWJ1bGFyaWVzL3ZvY2FidWxhcmllcy9PcmcuT0RhdGEuQWdncmVnYXRpb24uVjEueG1sXCIgfSxcbiAgICB7IGFsaWFzOiBcIlZhbGlkYXRpb25cIiwgbmFtZXNwYWNlOiBcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxXCIsIHVyaTogXCJodHRwczovL29hc2lzLXRjcy5naXRodWIuaW8vb2RhdGEtdm9jYWJ1bGFyaWVzL3ZvY2FidWxhcmllcy9PcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS54bWxcIiB9LFxuICAgIHsgYWxpYXM6IFwiTWVhc3VyZXNcIiwgbmFtZXNwYWNlOiBcIk9yZy5PRGF0YS5NZWFzdXJlcy5WMVwiLCB1cmk6IFwiaHR0cHM6Ly9vYXNpcy10Y3MuZ2l0aHViLmlvL29kYXRhLXZvY2FidWxhcmllcy92b2NhYnVsYXJpZXMvT3JnLk9EYXRhLk1lYXN1cmVzLlYxLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJBbmFseXRpY3NcIiwgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MVwiLCB1cmk6IFwiaHR0cHM6Ly9zYXAuZ2l0aHViLmlvL29kYXRhLXZvY2FidWxhcmllcy92b2NhYnVsYXJpZXMvQW5hbHl0aWNzLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJDb21tb25cIiwgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLCB1cmk6IFwiaHR0cHM6Ly9zYXAuZ2l0aHViLmlvL29kYXRhLXZvY2FidWxhcmllcy92b2NhYnVsYXJpZXMvQ29tbW9uLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJDb2RlTGlzdFwiLCBuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjFcIiwgdXJpOiBcImh0dHBzOi8vc2FwLmdpdGh1Yi5pby9vZGF0YS12b2NhYnVsYXJpZXMvdm9jYWJ1bGFyaWVzL0NvZGVMaXN0LnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJDb21tdW5pY2F0aW9uXCIsIG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxXCIsIHVyaTogXCJodHRwczovL3NhcC5naXRodWIuaW8vb2RhdGEtdm9jYWJ1bGFyaWVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJIaWVyYXJjaHlcIiwgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkhpZXJhcmNoeS52MVwiLCB1cmk6IFwiaHR0cHM6Ly9zYXAuZ2l0aHViLmlvL29kYXRhLXZvY2FidWxhcmllcy92b2NhYnVsYXJpZXMvSGllcmFyY2h5LnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJQZXJzb25hbERhdGFcIiwgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MVwiLCB1cmk6IFwiaHR0cHM6Ly9zYXAuZ2l0aHViLmlvL29kYXRhLXZvY2FidWxhcmllcy92b2NhYnVsYXJpZXMvUGVyc29uYWxEYXRhLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJTZXNzaW9uXCIsIG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxXCIsIHVyaTogXCJodHRwczovL3NhcC5naXRodWIuaW8vb2RhdGEtdm9jYWJ1bGFyaWVzL3ZvY2FidWxhcmllcy9TZXNzaW9uLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJVSVwiLCBuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIiwgdXJpOiBcImh0dHBzOi8vc2FwLmdpdGh1Yi5pby9vZGF0YS12b2NhYnVsYXJpZXMvdm9jYWJ1bGFyaWVzL1VJLnhtbFwiIH0sXG4gICAgeyBhbGlhczogXCJIVE1MNVwiLCBuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuSFRNTDUudjFcIiwgdXJpOiBcImh0dHBzOi8vc2FwLmdpdGh1Yi5pby9vZGF0YS12b2NhYnVsYXJpZXMvdm9jYWJ1bGFyaWVzL0hUTUw1LnhtbFwiIH1cbl07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDg3OCk7XG4iLCIiXX0=
