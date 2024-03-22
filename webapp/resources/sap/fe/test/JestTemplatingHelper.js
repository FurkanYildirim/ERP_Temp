/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["@sap/cds-compiler", "fs", "@prettier/plugin-xml", "path", "prettier", "sap/base/Log", "sap/base/util/LoaderExtensions", "sap/base/util/merge", "sap/fe/core/converters/ConverterContext", "sap/fe/core/services/SideEffectsServiceFactory", "sap/fe/core/TemplateModel", "sap/fe/test/UI5MockHelper", "sap/ui/base/BindingParser", "sap/ui/base/ManagedObjectMetadata", "sap/ui/core/Component", "sap/ui/core/InvisibleText", "sap/ui/core/util/serializer/Serializer", "sap/ui/core/util/XMLPreprocessor", "sap/ui/fl/apply/_internal/flexState/FlexState", "sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor", "sap/ui/fl/initial/_internal/Storage", "sap/ui/fl/Utils", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/lib/_MetadataRequestor", "sap/ui/model/odata/v4/ODataMetaModel", "xpath", "./JestFlexibilityHelper"], function (compiler, fs, plugin, path, prettier, Log, LoaderExtensions, merge, ConverterContext, SideEffectsFactory, TemplateModel, UI5MockHelper, BindingParser, ManagedObjectMetadata, Component, InvisibleText, Serializer, XMLPreprocessor, FlexState, XmlPreprocessor, AppStorage, Utils, JSONModel, _MetadataRequestor, ODataMetaModel, xpath, JestFlexibilityHelper) {
  "use strict";

  var _exports = {};
  var createFlexibilityChangesObject = JestFlexibilityHelper.createFlexibilityChangesObject;
  var createMockResourceModel = UI5MockHelper.createMockResourceModel;
  var format = prettier.format;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const formatXml = require("xml-formatter");
  Log.setLevel(1, "sap.ui.core.util.XMLPreprocessor");
  jest.setTimeout(40000);
  const nameSpaceMap = {
    macros: "sap.fe.macros",
    macro: "sap.fe.macros",
    macroField: "sap.fe.macros.field",
    macrodata: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    log: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    unittest: "http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1",
    control: "sap.fe.core.controls",
    controls: "sap.fe.macros.controls",
    core: "sap.ui.core",
    dt: "sap.ui.dt",
    m: "sap.m",
    f: "sap.ui.layout.form",
    fl: "sap.ui.fl",
    internalMacro: "sap.fe.macros.internal",
    mdc: "sap.ui.mdc",
    mdcat: "sap.ui.mdc.actiontoolbar",
    mdcField: "sap.ui.mdc.field",
    mdcTable: "sap.ui.mdc.table",
    u: "sap.ui.unified",
    macroMicroChart: "sap.fe.macros.microchart",
    microChart: "sap.suite.ui.microchart",
    macroTable: "sap.fe.macros.table"
  };
  const select = xpath.useNamespaces(nameSpaceMap);
  const defaultFakeSideEffectService = {
    computeFieldGroupIds: () => []
  };
  function _getTemplatedSelector(xmldom, selector) {
    /**
     * if a root element has been added during the templating by our Jest Templating methods
     * the root element is added to the selector path.
     */
    const rootPath = "/root";
    return `${xmldom.nodeName === "root" && !selector.startsWith(rootPath) ? rootPath : ""}${selector}`;
  }
  async function _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels, fakeSideEffectService) {
    const oMetaModel = await getMetaModel(sMetadataUrl);

    // To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
    // if not already passed to teh templating
    if (!mModels.hasOwnProperty("converterContext")) {
      mModels = Object.assign(mModels, {
        converterContext: new TemplateModel({}, oMetaModel)
      });
    }
    Object.keys(mModels).forEach(function (sModelName) {
      if (mModels[sModelName] && mModels[sModelName].isTemplateModel) {
        mModels[sModelName] = new TemplateModel(mModels[sModelName].data, oMetaModel);
      }
    });
    const settings = {
      models: Object.assign({
        metaModel: oMetaModel
      }, mModels),
      bindingContexts: {},
      appComponent: {
        getSideEffectsService: jest.fn(),
        getDiagnostics: () => undefined
      }
    };
    settings.appComponent.getSideEffectsService.mockReturnValue(fakeSideEffectService ?? defaultFakeSideEffectService);
    //Inject models and bindingContexts
    Object.keys(mBindingContexts).forEach(function (sKey) {
      /* Assert to make sure the annotations are in the test metadata -> avoid misleading tests */
      expect(typeof oMetaModel.getObject(mBindingContexts[sKey])).toBeDefined();
      const oModel = mModels[sKey] || oMetaModel;
      settings.bindingContexts[sKey] = oModel.createBindingContext(mBindingContexts[sKey]); //Value is sPath
      settings.models[sKey] = oModel;
    });
    return settings;
  }
  function _removeCommentFromXml(xml) {
    return formatXml(xml, {
      filter: node => node.type !== "Comment"
    });
  }
  function _loadResourceView(viewName) {
    const name = viewName.replace(/\./g, "/") + ".view.xml";
    const view = LoaderExtensions.loadResource(name);
    return view.documentElement;
  }
  const runXPathQuery = function (selector, xmldom) {
    return select(selector, xmldom);
  };
  expect.extend({
    toHaveControl(xmldom, selector) {
      const nodes = runXPathQuery(_getTemplatedSelector(xmldom, selector), xmldom);
      return {
        message: () => {
          const outputXml = serializeXML(xmldom);
          return `did not find controls matching ${selector} in generated xml:\n ${outputXml}`;
        },
        pass: nodes && nodes.length >= 1
      };
    },
    toNotHaveControl(xmldom, selector) {
      const nodes = runXPathQuery(_getTemplatedSelector(xmldom, selector), xmldom);
      return {
        message: () => {
          const outputXml = serializeXML(xmldom);
          return `There is a control matching ${selector} in generated xml:\n ${outputXml}`;
        },
        pass: nodes && nodes.length === 0
      };
    },
    /**
     * Checks for errors in `xml` created during templating of an XML string or
     * an XML node.
     *
     * This function checkes for the xml errors created by the
     * function [BuildingBlockTemplateProcessor.createErrorXML]{@link sap.fe.core.buildingBlocks.BuildingBlockTemplateProcessor#createErrorXML}.
     *
     * @param xml XML String or XML Node to be tested for errors
     * @returns Jest Matcher result object
     */
    toHaveTemplatingErrors(xml) {
      const xmlText = typeof xml === "string" ? xml : serializeXML(xml);
      const base64Entries = xmlText.match(/BBF\.base64Decode\('([^']*)'\)/gm) || [];
      const errorMessages = base64Entries.map(message => {
        if (message && message.length > 0) {
          var _message$match, _message$match$;
          return atob(((_message$match = message.match(/('[^']*)/)) === null || _message$match === void 0 ? void 0 : (_message$match$ = _message$match[0]) === null || _message$match$ === void 0 ? void 0 : _message$match$.slice(1)) || "");
        }
        return "";
      });
      if (errorMessages.length <= 0) {
        return {
          message: () => `XML Templating without errors`,
          pass: false
        };
      } else {
        return {
          message: () => errorMessages.join("\n"),
          pass: true
        };
      }
    }
  });
  _exports.runXPathQuery = runXPathQuery;
  const formatBuildingBlockXML = function (xmlString) {
    if (Array.isArray(xmlString)) {
      xmlString = xmlString.join("");
    }
    let xmlFormatted = formatXML(xmlString);
    xmlFormatted = xmlFormatted.replace(/uid--id-[0-9]{13}-[0-9]{1,3}/g, "uid--id");
    return xmlFormatted;
  };
  _exports.formatBuildingBlockXML = formatBuildingBlockXML;
  const getControlAttribute = function (controlSelector, attributeName, xmlDom) {
    const selector = `string(${_getTemplatedSelector(xmlDom, controlSelector)}/@${attributeName})`;
    return runXPathQuery(selector, xmlDom);
  };

  /**
   * Serialize the parts or the complete given XML DOM to string.
   *
   * @param xmlDom DOM node that is to be serialized.
   * @param selector Optional selector of sub nodes
   * @returns XML string
   */
  _exports.getControlAttribute = getControlAttribute;
  const serializeXML = function (xmlDom, selector) {
    const serializer = new window.XMLSerializer();
    let xmlString;
    if (selector) {
      const nodes = runXPathQuery(selector, xmlDom);
      xmlString = nodes.map(node => serializer.serializeToString(node)).join("\n");
    } else {
      xmlString = serializer.serializeToString(xmlDom);
    }
    return formatXML(xmlString);
  };
  _exports.serializeXML = serializeXML;
  const formatXML = function (xmlString) {
    return format(xmlString, {
      parser: "xml",
      xmlWhitespaceSensitivity: "ignore",
      plugins: [plugin]
    });
  };

  /**
   * Compile a CDS file into an EDMX file.
   *
   * @param cdsUrl The path to the file containing the CDS definition. This file must declare the namespace
   * sap.fe.test and a service JestService
   * @param options Options for creating the EDMX output
   * @returns The path of the generated EDMX
   */
  _exports.formatXML = formatXML;
  const compileCDS = function (cdsUrl) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const cdsString = fs.readFileSync(cdsUrl, "utf-8");
    const edmxContent = cds2edmx(cdsString, "sap.fe.test.JestService", options);
    const dir = path.resolve(cdsUrl, "..", "gen");

    // If the caller provided CDS compiler options: Include them in the filename. This prevents unpredictable results if the same CDS source
    // file is used simultaneously with a different set of options (e.g. in a test running in parallel)
    const allOptions = Object.entries(options);
    allOptions.sort((a, b) => b[0].localeCompare(a[0]));
    const edmxFileName = allOptions.reduce((filename, _ref) => {
      let [optionKey, optionValue] = _ref;
      return `${filename}#${optionKey}=${optionValue.toString()}#`;
    }, path.basename(cdsUrl).replace(".cds", "")) + ".xml";
    const edmxFilePath = path.resolve(dir, edmxFileName);
    fs.mkdirSync(dir, {
      recursive: true
    });
    fs.writeFileSync(edmxFilePath, edmxContent);
    return edmxFilePath;
  };

  /**
   * Compile CDS to EDMX.
   *
   * @param cds The CDS model. It must define at least one service.
   * @param service The fully-qualified name of the service to be compiled. Defaults to "sap.fe.test.JestService".
   * @param options Options for creating the EDMX output
   * @returns The compiled service model as EDMX.
   */
  _exports.compileCDS = compileCDS;
  function cds2edmx(cds) {
    let service = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sap.fe.test.JestService";
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const sources = {
      "source.cds": cds
    };

    // allow to include stuff from @sap/cds/common
    if (cds.includes("'@sap/cds/common'")) {
      sources["common.cds"] = fs.readFileSync(require.resolve("@sap/cds/common.cds"), "utf-8");
    }
    const csn = compiler.compileSources(sources, {});
    const edmxOptions = {
      odataForeignKeys: true,
      odataFormat: "structured",
      odataContainment: true,
      ...options,
      service: service
    };
    const edmx = compiler.to.edmx(csn, edmxOptions);
    if (!edmx) {
      throw new Error(`Compilation failed. Hint: Make sure that the CDS model defines service ${service}.`);
    }
    return edmx;
  }
  _exports.cds2edmx = cds2edmx;
  const getFakeSideEffectsService = async function (oMetaModel) {
    const oServiceContext = {
      scopeObject: {},
      scopeType: "",
      settings: {}
    };
    return new SideEffectsFactory().createInstance(oServiceContext).then(function (oServiceInstance) {
      const oJestSideEffectsService = oServiceInstance.getInterface();
      oJestSideEffectsService.getContext = function () {
        return {
          scopeObject: {
            getModel: function () {
              return {
                getMetaModel: function () {
                  return oMetaModel;
                }
              };
            }
          }
        };
      };
      return oJestSideEffectsService;
    });
  };
  _exports.getFakeSideEffectsService = getFakeSideEffectsService;
  const getFakeDiagnostics = function () {
    const issues = [];
    return {
      addIssue(issueCategory, issueSeverity, details) {
        issues.push({
          issueCategory,
          issueSeverity,
          details
        });
      },
      getIssues() {
        return issues;
      },
      checkIfIssueExists(issueCategory, issueSeverity, details) {
        return issues.find(issue => {
          return issue.issueCategory === issueCategory && issue.issueSeverity === issueSeverity && issue.details === details;
        });
      }
    };
  };
  _exports.getFakeDiagnostics = getFakeDiagnostics;
  const getConverterContextForTest = function (convertedTypes, manifestSettings) {
    const entitySet = convertedTypes.entitySets.find(es => es.name === manifestSettings.entitySet);
    const dataModelPath = getDataModelObjectPathForProperty(entitySet, convertedTypes, entitySet);
    return new ConverterContext(convertedTypes, manifestSettings, getFakeDiagnostics(), merge, dataModelPath);
  };
  _exports.getConverterContextForTest = getConverterContextForTest;
  const metaModelCache = {};
  const getMetaModel = async function (sMetadataUrl) {
    const oRequestor = _MetadataRequestor.create({}, "4.0", undefined, {});
    if (!metaModelCache[sMetadataUrl]) {
      const oMetaModel = new ODataMetaModel(oRequestor, sMetadataUrl, undefined, null);
      await oMetaModel.fetchEntityContainer();
      metaModelCache[sMetadataUrl] = oMetaModel;
    }
    return metaModelCache[sMetadataUrl];
  };
  _exports.getMetaModel = getMetaModel;
  const getDataModelObjectPathForProperty = function (entitySet, convertedTypes, property) {
    const targetPath = {
      startingEntitySet: entitySet,
      navigationProperties: [],
      targetObject: property,
      targetEntitySet: entitySet,
      targetEntityType: entitySet.entityType,
      convertedTypes: convertedTypes
    };
    targetPath.contextLocation = targetPath;
    return targetPath;
  };
  _exports.getDataModelObjectPathForProperty = getDataModelObjectPathForProperty;
  const evaluateBinding = function (bindingString) {
    const bindingElement = BindingParser.complexParser(bindingString);
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return bindingElement.formatter.apply(undefined, args);
  };
  _exports.evaluateBinding = evaluateBinding;
  /**
   * Evaluate a binding against a model.
   *
   * @param bindingString The binding string.
   * @param modelContent Content of the default model to use for evaluation.
   * @param namedModelsContent Contents of additional, named models to use.
   * @returns The evaluated binding.
   */
  function evaluateBindingWithModel(bindingString, modelContent, namedModelsContent) {
    const bindingElement = BindingParser.complexParser(bindingString);
    const text = new InvisibleText();
    text.bindProperty("text", bindingElement);
    const defaultModel = new JSONModel(modelContent);
    text.setModel(defaultModel);
    text.setBindingContext(defaultModel.createBindingContext("/"));
    if (namedModelsContent) {
      for (const [name, content] of Object.entries(namedModelsContent)) {
        const model = new JSONModel(content);
        text.setModel(model, name);
        text.setBindingContext(model.createBindingContext("/"), name);
      }
    }
    return text.getText();
  }
  _exports.evaluateBindingWithModel = evaluateBindingWithModel;
  const TESTVIEWID = "testViewId";
  const applyFlexChanges = async function (flexChanges, oMetaModel, resultXML) {
    var _flexChanges$changes, _flexChanges$variantD;
    // prefix Ids
    [...resultXML.querySelectorAll("[id]")].forEach(node => {
      node.id = `${TESTVIEWID}--${node.id}`;
    });
    const changes = createFlexibilityChangesObject(TESTVIEWID, flexChanges);
    const appId = "someComponent";
    const oManifest = {
      "sap.app": {
        id: appId,
        type: "application",
        crossNavigation: {
          outbounds: []
        }
      }
    };
    const oAppComponent = {
      getDiagnostics: jest.fn().mockReturnValue(getFakeDiagnostics()),
      getModel: jest.fn().mockReturnValue({
        getMetaModel: jest.fn().mockReturnValue(oMetaModel)
      }),
      getComponentData: jest.fn().mockReturnValue({}),
      getManifestObject: jest.fn().mockReturnValue({
        getEntry: function (name) {
          return oManifest[name];
        }
      }),
      getLocalId: jest.fn(sId => sId)
    };
    //fake changes
    jest.spyOn(AppStorage, "loadFlexData").mockReturnValue(Promise.resolve(changes));
    jest.spyOn(Component, "get").mockReturnValue(oAppComponent);
    jest.spyOn(Utils, "getAppComponentForControl").mockReturnValue(oAppComponent);
    await FlexState.initialize({
      componentId: appId
    });
    resultXML = await XmlPreprocessor.process(resultXML, {
      name: "Test Fragment",
      componentId: appId,
      id: TESTVIEWID
    });

    //Assert that all changes have been applied
    const changesApplied = getChangesFromXML(resultXML);
    expect(changesApplied.length).toBe((flexChanges === null || flexChanges === void 0 ? void 0 : (_flexChanges$changes = flexChanges.changes) === null || _flexChanges$changes === void 0 ? void 0 : _flexChanges$changes.length) ?? 0 + (flexChanges === null || flexChanges === void 0 ? void 0 : (_flexChanges$variantD = flexChanges.variantDependentControlChanges) === null || _flexChanges$variantD === void 0 ? void 0 : _flexChanges$variantD.length) ?? 0);
    return resultXML;
  };
  const getChangesFromXML = xml => [...xml.querySelectorAll("*")].flatMap(e => [...e.attributes].map(a => a.name)).filter(attr => attr.includes("sap.ui.fl.appliedChanges"));
  _exports.getChangesFromXML = getChangesFromXML;
  const getTemplatingResult = async function (xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges, fakeSideEffectService) {
    if (!mModels["sap.fe.i18n"]) {
      mModels["sap.fe.i18n"] = createMockResourceModel();
    }
    const templatedXml = `<root>${xmlInput}</root>`;
    const parser = new window.DOMParser();
    const xmlDoc = parser.parseFromString(templatedXml, "text/xml");
    // To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
    // if not already passed to teh templating

    const oMetaModel = await getMetaModel(sMetadataUrl);
    const oPreprocessorSettings = await _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels, fakeSideEffectService);

    //This context for macro testing
    if (oPreprocessorSettings.models["this"]) {
      oPreprocessorSettings.bindingContexts["this"] = oPreprocessorSettings.models["this"].createBindingContext("/");
    }
    let resultXML = await XMLPreprocessor.process(xmlDoc.firstElementChild, {
      name: "Test Fragment"
    }, oPreprocessorSettings);
    if (flexChanges) {
      // apply flex changes
      resultXML = await applyFlexChanges(flexChanges, oMetaModel, resultXML);
    }
    return resultXML;
  };
  _exports.getTemplatingResult = getTemplatingResult;
  const getTemplatedXML = async function (xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges, fakeSideEffectService) {
    const templatedXML = await getTemplatingResult(xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges, fakeSideEffectService);
    const serialiedXML = serializeXML(templatedXML);
    expect(serialiedXML).not.toHaveTemplatingErrors();
    return serialiedXML;
  };

  /**
   * Process the requested view with the provided data.
   *
   * @param name Fully qualified name of the view to be tested.
   * @param sMetadataUrl Url of the metadata.
   * @param mBindingContexts Map of the bindingContexts to set on the models.
   * @param mModels Map of the models.
   * @param flexChanges Object with UI changes like 'changes' or 'variantDependentControlChanges'
   * @returns Templated view as string
   */
  _exports.getTemplatedXML = getTemplatedXML;
  async function processView(name, sMetadataUrl, mBindingContexts, mModels, flexChanges) {
    var _oPreprocessedView;
    const oMetaModel = await getMetaModel(sMetadataUrl);
    const oViewDocument = _loadResourceView(name);
    const oPreprocessorSettings = await _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels);
    let oPreprocessedView = await XMLPreprocessor.process(oViewDocument, {
      name: name
    }, oPreprocessorSettings);
    if (flexChanges) {
      oPreprocessedView = await applyFlexChanges(flexChanges ?? [], oMetaModel, oPreprocessedView);
    }
    return {
      asElement: oPreprocessedView,
      asString: _removeCommentFromXml(((_oPreprocessedView = oPreprocessedView) === null || _oPreprocessedView === void 0 ? void 0 : _oPreprocessedView.outerHTML) || "")
    };
  }

  /**
   * Process the requested XML fragment with the provided data.
   *
   * @param name Fully qualified name of the fragment to be tested.
   * @param testData Test data consisting
   * @returns Templated fragment as string
   */
  _exports.processView = processView;
  async function processFragment(name, testData) {
    const inputXml = `<root><core:Fragment fragmentName="${name}" type="XML" xmlns:core="sap.ui.core" /></root>`;
    const parser = new window.DOMParser();
    const inputDoc = parser.parseFromString(inputXml, "text/xml");

    // build model and bindings for given test data
    const settings = {
      models: {},
      bindingContexts: {},
      appComponent: {
        getSideEffectsService: jest.fn(),
        getDiagnostics: () => undefined
      }
    };
    for (const model in testData) {
      const jsonModel = new JSONModel();
      jsonModel.setData(testData[model]);
      settings.models[model] = jsonModel;
      settings.bindingContexts[model] = settings.models[model].createBindingContext("/");
    }
    settings.appComponent.getSideEffectsService.mockReturnValue(defaultFakeSideEffectService);

    // execute the pre-processor
    const resultDoc = await XMLPreprocessor.process(inputDoc.firstElementChild, {
      name
    }, settings);

    // exclude nested fragments from test snapshots
    const fragments = resultDoc.getElementsByTagName("core:Fragment");
    if ((fragments === null || fragments === void 0 ? void 0 : fragments.length) > 0) {
      for (const fragment of fragments) {
        fragment.innerHTML = "";
      }
    }

    // Keep the fragment result as child of root node when fragment generates multiple root controls
    const xmlResult = resultDoc.children.length > 1 ? resultDoc.outerHTML : resultDoc.innerHTML;
    return _removeCommentFromXml(xmlResult);
  }
  _exports.processFragment = processFragment;
  function serializeControl(controlToSerialize) {
    let tabCount = 0;
    function getTab() {
      let toAdd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let tab = "";
      for (let i = 0; i < tabCount + toAdd; i++) {
        tab += "\t";
      }
      return tab;
    }
    const serializeDelegate = {
      start: function (control, sAggregationName) {
        let controlDetail = "";
        if (sAggregationName) {
          if (control.getParent()) {
            var _control$getParent$ge, _control$getParent$ge2;
            const indexInParent = (_control$getParent$ge = control.getParent().getAggregation(sAggregationName)) === null || _control$getParent$ge === void 0 ? void 0 : (_control$getParent$ge2 = _control$getParent$ge.indexOf) === null || _control$getParent$ge2 === void 0 ? void 0 : _control$getParent$ge2.call(_control$getParent$ge, control);
            if (indexInParent > 0) {
              controlDetail += `,\n${getTab()}`;
            }
          }
        }
        controlDetail += `${control.getMetadata().getName()}(`;
        return controlDetail;
      },
      end: function () {
        return "})";
      },
      middle: function (control) {
        const id = control.getId();
        let data = `{id: ${ManagedObjectMetadata.isGeneratedId(id) ? "__dynamicId" : id}`;
        for (const oControlKey in control.mProperties) {
          if (control.mProperties.hasOwnProperty(oControlKey)) {
            data += `,\n${getTab()} ${oControlKey}: ${control.mProperties[oControlKey]}`;
          } else if (control.mBindingInfos.hasOwnProperty(oControlKey)) {
            const bindingDetail = control.mBindingInfos[oControlKey];
            data += `,\n${getTab()} ${oControlKey}: ${JSON.stringify(bindingDetail)}`;
          }
        }
        for (const oControlKey in control.mAssociations) {
          if (control.mAssociations.hasOwnProperty(oControlKey)) {
            var _control$mAssociation, _control$mAssociation2, _control$mAssociation3;
            data += `,\n${getTab()} ${oControlKey}: ${(((_control$mAssociation = control.mAssociations[oControlKey]) === null || _control$mAssociation === void 0 ? void 0 : (_control$mAssociation2 = (_control$mAssociation3 = _control$mAssociation).join) === null || _control$mAssociation2 === void 0 ? void 0 : _control$mAssociation2.call(_control$mAssociation3, ",")) ?? control.mAssociations[oControlKey]) || undefined}`;
          }
        }
        for (const oControlKey in control.mEventRegistry) {
          if (control.mEventRegistry.hasOwnProperty(oControlKey)) {
            data += `,\n${getTab()} ${oControlKey}: true}`;
          }
        }
        data += ``;
        return data;
      },
      startAggregation: function (control, sName) {
        let out = `,\n${getTab()}${sName}`;
        tabCount++;
        if (control.mBindingInfos[sName]) {
          out += `={ path:'${control.mBindingInfos[sName].path}', template:\n${getTab()}`;
        } else {
          out += `=[\n${getTab()}`;
        }
        return out;
      },
      endAggregation: function (control, sName) {
        tabCount--;
        if (control.mBindingInfos[sName]) {
          return `\n${getTab()}}`;
        } else {
          return `\n${getTab()}]`;
        }
      }
    };
    if (Array.isArray(controlToSerialize)) {
      return controlToSerialize.map(controlToRender => {
        return new Serializer(controlToRender, serializeDelegate).serialize();
      });
    } else {
      return new Serializer(controlToSerialize, serializeDelegate).serialize();
    }
  }
  _exports.serializeControl = serializeControl;
  function createAwaiter() {
    let fnResolve;
    const myPromise = new Promise(resolve => {
      fnResolve = resolve;
    });
    return {
      promise: myPromise,
      resolve: fnResolve
    };
  }
  _exports.createAwaiter = createAwaiter;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmb3JtYXRYbWwiLCJyZXF1aXJlIiwiTG9nIiwic2V0TGV2ZWwiLCJqZXN0Iiwic2V0VGltZW91dCIsIm5hbWVTcGFjZU1hcCIsIm1hY3JvcyIsIm1hY3JvIiwibWFjcm9GaWVsZCIsIm1hY3JvZGF0YSIsImxvZyIsInVuaXR0ZXN0IiwiY29udHJvbCIsImNvbnRyb2xzIiwiY29yZSIsImR0IiwibSIsImYiLCJmbCIsImludGVybmFsTWFjcm8iLCJtZGMiLCJtZGNhdCIsIm1kY0ZpZWxkIiwibWRjVGFibGUiLCJ1IiwibWFjcm9NaWNyb0NoYXJ0IiwibWljcm9DaGFydCIsIm1hY3JvVGFibGUiLCJzZWxlY3QiLCJ4cGF0aCIsInVzZU5hbWVzcGFjZXMiLCJkZWZhdWx0RmFrZVNpZGVFZmZlY3RTZXJ2aWNlIiwiY29tcHV0ZUZpZWxkR3JvdXBJZHMiLCJfZ2V0VGVtcGxhdGVkU2VsZWN0b3IiLCJ4bWxkb20iLCJzZWxlY3RvciIsInJvb3RQYXRoIiwibm9kZU5hbWUiLCJzdGFydHNXaXRoIiwiX2J1aWxkUHJlUHJvY2Vzc29yU2V0dGluZ3MiLCJzTWV0YWRhdGFVcmwiLCJtQmluZGluZ0NvbnRleHRzIiwibU1vZGVscyIsImZha2VTaWRlRWZmZWN0U2VydmljZSIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJoYXNPd25Qcm9wZXJ0eSIsIk9iamVjdCIsImFzc2lnbiIsImNvbnZlcnRlckNvbnRleHQiLCJUZW1wbGF0ZU1vZGVsIiwia2V5cyIsImZvckVhY2giLCJzTW9kZWxOYW1lIiwiaXNUZW1wbGF0ZU1vZGVsIiwiZGF0YSIsInNldHRpbmdzIiwibW9kZWxzIiwibWV0YU1vZGVsIiwiYmluZGluZ0NvbnRleHRzIiwiYXBwQ29tcG9uZW50IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZm4iLCJnZXREaWFnbm9zdGljcyIsInVuZGVmaW5lZCIsIm1vY2tSZXR1cm5WYWx1ZSIsInNLZXkiLCJleHBlY3QiLCJnZXRPYmplY3QiLCJ0b0JlRGVmaW5lZCIsIm9Nb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiX3JlbW92ZUNvbW1lbnRGcm9tWG1sIiwieG1sIiwiZmlsdGVyIiwibm9kZSIsInR5cGUiLCJfbG9hZFJlc291cmNlVmlldyIsInZpZXdOYW1lIiwibmFtZSIsInJlcGxhY2UiLCJ2aWV3IiwiTG9hZGVyRXh0ZW5zaW9ucyIsImxvYWRSZXNvdXJjZSIsImRvY3VtZW50RWxlbWVudCIsInJ1blhQYXRoUXVlcnkiLCJleHRlbmQiLCJ0b0hhdmVDb250cm9sIiwibm9kZXMiLCJtZXNzYWdlIiwib3V0cHV0WG1sIiwic2VyaWFsaXplWE1MIiwicGFzcyIsImxlbmd0aCIsInRvTm90SGF2ZUNvbnRyb2wiLCJ0b0hhdmVUZW1wbGF0aW5nRXJyb3JzIiwieG1sVGV4dCIsImJhc2U2NEVudHJpZXMiLCJtYXRjaCIsImVycm9yTWVzc2FnZXMiLCJtYXAiLCJhdG9iIiwic2xpY2UiLCJqb2luIiwiZm9ybWF0QnVpbGRpbmdCbG9ja1hNTCIsInhtbFN0cmluZyIsIkFycmF5IiwiaXNBcnJheSIsInhtbEZvcm1hdHRlZCIsImZvcm1hdFhNTCIsImdldENvbnRyb2xBdHRyaWJ1dGUiLCJjb250cm9sU2VsZWN0b3IiLCJhdHRyaWJ1dGVOYW1lIiwieG1sRG9tIiwic2VyaWFsaXplciIsIndpbmRvdyIsIlhNTFNlcmlhbGl6ZXIiLCJzZXJpYWxpemVUb1N0cmluZyIsImZvcm1hdCIsInBhcnNlciIsInhtbFdoaXRlc3BhY2VTZW5zaXRpdml0eSIsInBsdWdpbnMiLCJwbHVnaW4iLCJjb21waWxlQ0RTIiwiY2RzVXJsIiwib3B0aW9ucyIsImNkc1N0cmluZyIsImZzIiwicmVhZEZpbGVTeW5jIiwiZWRteENvbnRlbnQiLCJjZHMyZWRteCIsImRpciIsInBhdGgiLCJyZXNvbHZlIiwiYWxsT3B0aW9ucyIsImVudHJpZXMiLCJzb3J0IiwiYSIsImIiLCJsb2NhbGVDb21wYXJlIiwiZWRteEZpbGVOYW1lIiwicmVkdWNlIiwiZmlsZW5hbWUiLCJvcHRpb25LZXkiLCJvcHRpb25WYWx1ZSIsInRvU3RyaW5nIiwiYmFzZW5hbWUiLCJlZG14RmlsZVBhdGgiLCJta2RpclN5bmMiLCJyZWN1cnNpdmUiLCJ3cml0ZUZpbGVTeW5jIiwiY2RzIiwic2VydmljZSIsInNvdXJjZXMiLCJpbmNsdWRlcyIsImNzbiIsImNvbXBpbGVyIiwiY29tcGlsZVNvdXJjZXMiLCJlZG14T3B0aW9ucyIsIm9kYXRhRm9yZWlnbktleXMiLCJvZGF0YUZvcm1hdCIsIm9kYXRhQ29udGFpbm1lbnQiLCJlZG14IiwidG8iLCJFcnJvciIsImdldEZha2VTaWRlRWZmZWN0c1NlcnZpY2UiLCJvU2VydmljZUNvbnRleHQiLCJzY29wZU9iamVjdCIsInNjb3BlVHlwZSIsIlNpZGVFZmZlY3RzRmFjdG9yeSIsImNyZWF0ZUluc3RhbmNlIiwidGhlbiIsIm9TZXJ2aWNlSW5zdGFuY2UiLCJvSmVzdFNpZGVFZmZlY3RzU2VydmljZSIsImdldEludGVyZmFjZSIsImdldENvbnRleHQiLCJnZXRNb2RlbCIsImdldEZha2VEaWFnbm9zdGljcyIsImlzc3VlcyIsImFkZElzc3VlIiwiaXNzdWVDYXRlZ29yeSIsImlzc3VlU2V2ZXJpdHkiLCJkZXRhaWxzIiwicHVzaCIsImdldElzc3VlcyIsImNoZWNrSWZJc3N1ZUV4aXN0cyIsImZpbmQiLCJpc3N1ZSIsImdldENvbnZlcnRlckNvbnRleHRGb3JUZXN0IiwiY29udmVydGVkVHlwZXMiLCJtYW5pZmVzdFNldHRpbmdzIiwiZW50aXR5U2V0IiwiZW50aXR5U2V0cyIsImVzIiwiZGF0YU1vZGVsUGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JQcm9wZXJ0eSIsIkNvbnZlcnRlckNvbnRleHQiLCJtZXJnZSIsIm1ldGFNb2RlbENhY2hlIiwib1JlcXVlc3RvciIsIl9NZXRhZGF0YVJlcXVlc3RvciIsImNyZWF0ZSIsIk9EYXRhTWV0YU1vZGVsIiwiZmV0Y2hFbnRpdHlDb250YWluZXIiLCJwcm9wZXJ0eSIsInRhcmdldFBhdGgiLCJzdGFydGluZ0VudGl0eVNldCIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwidGFyZ2V0T2JqZWN0IiwidGFyZ2V0RW50aXR5U2V0IiwidGFyZ2V0RW50aXR5VHlwZSIsImVudGl0eVR5cGUiLCJjb250ZXh0TG9jYXRpb24iLCJldmFsdWF0ZUJpbmRpbmciLCJiaW5kaW5nU3RyaW5nIiwiYmluZGluZ0VsZW1lbnQiLCJCaW5kaW5nUGFyc2VyIiwiY29tcGxleFBhcnNlciIsImFyZ3MiLCJmb3JtYXR0ZXIiLCJhcHBseSIsImV2YWx1YXRlQmluZGluZ1dpdGhNb2RlbCIsIm1vZGVsQ29udGVudCIsIm5hbWVkTW9kZWxzQ29udGVudCIsInRleHQiLCJJbnZpc2libGVUZXh0IiwiYmluZFByb3BlcnR5IiwiZGVmYXVsdE1vZGVsIiwiSlNPTk1vZGVsIiwic2V0TW9kZWwiLCJzZXRCaW5kaW5nQ29udGV4dCIsImNvbnRlbnQiLCJtb2RlbCIsImdldFRleHQiLCJURVNUVklFV0lEIiwiYXBwbHlGbGV4Q2hhbmdlcyIsImZsZXhDaGFuZ2VzIiwicmVzdWx0WE1MIiwicXVlcnlTZWxlY3RvckFsbCIsImlkIiwiY2hhbmdlcyIsImNyZWF0ZUZsZXhpYmlsaXR5Q2hhbmdlc09iamVjdCIsImFwcElkIiwib01hbmlmZXN0IiwiY3Jvc3NOYXZpZ2F0aW9uIiwib3V0Ym91bmRzIiwib0FwcENvbXBvbmVudCIsImdldENvbXBvbmVudERhdGEiLCJnZXRNYW5pZmVzdE9iamVjdCIsImdldEVudHJ5IiwiZ2V0TG9jYWxJZCIsInNJZCIsInNweU9uIiwiQXBwU3RvcmFnZSIsIlByb21pc2UiLCJDb21wb25lbnQiLCJVdGlscyIsIkZsZXhTdGF0ZSIsImluaXRpYWxpemUiLCJjb21wb25lbnRJZCIsIlhtbFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJjaGFuZ2VzQXBwbGllZCIsImdldENoYW5nZXNGcm9tWE1MIiwidG9CZSIsInZhcmlhbnREZXBlbmRlbnRDb250cm9sQ2hhbmdlcyIsImZsYXRNYXAiLCJlIiwiYXR0cmlidXRlcyIsImF0dHIiLCJnZXRUZW1wbGF0aW5nUmVzdWx0IiwieG1sSW5wdXQiLCJjcmVhdGVNb2NrUmVzb3VyY2VNb2RlbCIsInRlbXBsYXRlZFhtbCIsIkRPTVBhcnNlciIsInhtbERvYyIsInBhcnNlRnJvbVN0cmluZyIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsIlhNTFByZXByb2Nlc3NvciIsImZpcnN0RWxlbWVudENoaWxkIiwiZ2V0VGVtcGxhdGVkWE1MIiwidGVtcGxhdGVkWE1MIiwic2VyaWFsaWVkWE1MIiwibm90IiwicHJvY2Vzc1ZpZXciLCJvVmlld0RvY3VtZW50Iiwib1ByZXByb2Nlc3NlZFZpZXciLCJhc0VsZW1lbnQiLCJhc1N0cmluZyIsIm91dGVySFRNTCIsInByb2Nlc3NGcmFnbWVudCIsInRlc3REYXRhIiwiaW5wdXRYbWwiLCJpbnB1dERvYyIsImpzb25Nb2RlbCIsInNldERhdGEiLCJyZXN1bHREb2MiLCJmcmFnbWVudHMiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImZyYWdtZW50IiwiaW5uZXJIVE1MIiwieG1sUmVzdWx0IiwiY2hpbGRyZW4iLCJzZXJpYWxpemVDb250cm9sIiwiY29udHJvbFRvU2VyaWFsaXplIiwidGFiQ291bnQiLCJnZXRUYWIiLCJ0b0FkZCIsInRhYiIsImkiLCJzZXJpYWxpemVEZWxlZ2F0ZSIsInN0YXJ0Iiwic0FnZ3JlZ2F0aW9uTmFtZSIsImNvbnRyb2xEZXRhaWwiLCJnZXRQYXJlbnQiLCJpbmRleEluUGFyZW50IiwiZ2V0QWdncmVnYXRpb24iLCJpbmRleE9mIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiZW5kIiwibWlkZGxlIiwiZ2V0SWQiLCJNYW5hZ2VkT2JqZWN0TWV0YWRhdGEiLCJpc0dlbmVyYXRlZElkIiwib0NvbnRyb2xLZXkiLCJtUHJvcGVydGllcyIsIm1CaW5kaW5nSW5mb3MiLCJiaW5kaW5nRGV0YWlsIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1Bc3NvY2lhdGlvbnMiLCJtRXZlbnRSZWdpc3RyeSIsInN0YXJ0QWdncmVnYXRpb24iLCJzTmFtZSIsIm91dCIsImVuZEFnZ3JlZ2F0aW9uIiwiY29udHJvbFRvUmVuZGVyIiwiU2VyaWFsaXplciIsInNlcmlhbGl6ZSIsImNyZWF0ZUF3YWl0ZXIiLCJmblJlc29sdmUiLCJteVByb21pc2UiLCJwcm9taXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJKZXN0VGVtcGxhdGluZ0hlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFueUFubm90YXRpb24sIENvbnZlcnRlZE1ldGFkYXRhLCBFbnRpdHlTZXQsIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgY29tcGlsZXIgZnJvbSBcIkBzYXAvY2RzLWNvbXBpbGVyXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCAqIGFzIHBsdWdpbiBmcm9tIFwiQHByZXR0aWVyL3BsdWdpbi14bWxcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB0eXBlIHsgT3B0aW9ucyB9IGZyb20gXCJwcmV0dGllclwiO1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcInByZXR0aWVyXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBMb2FkZXJFeHRlbnNpb25zIGZyb20gXCJzYXAvYmFzZS91dGlsL0xvYWRlckV4dGVuc2lvbnNcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lzc3VlTWFuYWdlclwiO1xuaW1wb3J0IHR5cGUgeyBMaXN0UmVwb3J0TWFuaWZlc3RTZXR0aW5ncywgT2JqZWN0UGFnZU1hbmlmZXN0U2V0dGluZ3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSB7IElEaWFnbm9zdGljcyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL1RlbXBsYXRlQ29udmVydGVyXCI7XG5pbXBvcnQgU2lkZUVmZmVjdHNGYWN0b3J5IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgY3JlYXRlTW9ja1Jlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL3Rlc3QvVUk1TW9ja0hlbHBlclwiO1xuaW1wb3J0IEJpbmRpbmdQYXJzZXIgZnJvbSBcInNhcC91aS9iYXNlL0JpbmRpbmdQYXJzZXJcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdE1ldGFkYXRhIGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0TWV0YWRhdGFcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgVUk1RWxlbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRWxlbWVudFwiO1xuaW1wb3J0IEludmlzaWJsZVRleHQgZnJvbSBcInNhcC91aS9jb3JlL0ludmlzaWJsZVRleHRcIjtcbmltcG9ydCBTZXJpYWxpemVyIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL3NlcmlhbGl6ZXIvU2VyaWFsaXplclwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBGbGV4U3RhdGUgZnJvbSBcInNhcC91aS9mbC9hcHBseS9faW50ZXJuYWwvZmxleFN0YXRlL0ZsZXhTdGF0ZVwiO1xuaW1wb3J0IFhtbFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2ZsL2FwcGx5L19pbnRlcm5hbC9wcmVwcm9jZXNzb3JzL1htbFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IEFwcFN0b3JhZ2UgZnJvbSBcInNhcC91aS9mbC9pbml0aWFsL19pbnRlcm5hbC9TdG9yYWdlXCI7XG5pbXBvcnQgVXRpbHMgZnJvbSBcInNhcC91aS9mbC9VdGlsc1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IE1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL01ldGFNb2RlbFwiO1xuaW1wb3J0IF9NZXRhZGF0YVJlcXVlc3RvciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L2xpYi9fTWV0YWRhdGFSZXF1ZXN0b3JcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcbmltcG9ydCB4cGF0aCBmcm9tIFwieHBhdGhcIjtcbmltcG9ydCB7IGNyZWF0ZUZsZXhpYmlsaXR5Q2hhbmdlc09iamVjdCB9IGZyb20gXCIuL0plc3RGbGV4aWJpbGl0eUhlbHBlclwiO1xuXG50eXBlIFByZVByb2Nlc3NvclNldHRpbmdzVHlwZSA9IHtcblx0bW9kZWxzOiB7XG5cdFx0W25hbWU6IHN0cmluZ106IEpTT05Nb2RlbCB8IE9EYXRhTWV0YU1vZGVsO1xuXHR9O1xuXHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRbbmFtZTogc3RyaW5nXTogQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0fTtcbn07XG5cbnR5cGUgSmVzdFRlbXBsYXRlZFZpZXcgPSB7XG5cdGFzRWxlbWVudDogRWxlbWVudCB8IHVuZGVmaW5lZDtcblx0YXNTdHJpbmc6IHN0cmluZztcbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG5jb25zdCBmb3JtYXRYbWwgPSByZXF1aXJlKFwieG1sLWZvcm1hdHRlclwiKTtcblxuTG9nLnNldExldmVsKDEgYXMgYW55LCBcInNhcC51aS5jb3JlLnV0aWwuWE1MUHJlcHJvY2Vzc29yXCIpO1xuamVzdC5zZXRUaW1lb3V0KDQwMDAwKTtcblxuY29uc3QgbmFtZVNwYWNlTWFwID0ge1xuXHRtYWNyb3M6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHRtYWNybzogXCJzYXAuZmUubWFjcm9zXCIsXG5cdG1hY3JvRmllbGQ6IFwic2FwLmZlLm1hY3Jvcy5maWVsZFwiLFxuXHRtYWNyb2RhdGE6IFwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiLFxuXHRsb2c6IFwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiLFxuXHR1bml0dGVzdDogXCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9wcmVwcm9jZXNzb3JleHRlbnNpb24vc2FwLmZlLnVuaXR0ZXN0aW5nLzFcIixcblx0Y29udHJvbDogXCJzYXAuZmUuY29yZS5jb250cm9sc1wiLFxuXHRjb250cm9sczogXCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzXCIsXG5cdGNvcmU6IFwic2FwLnVpLmNvcmVcIixcblx0ZHQ6IFwic2FwLnVpLmR0XCIsXG5cdG06IFwic2FwLm1cIixcblx0ZjogXCJzYXAudWkubGF5b3V0LmZvcm1cIixcblx0Zmw6IFwic2FwLnVpLmZsXCIsXG5cdGludGVybmFsTWFjcm86IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRtZGM6IFwic2FwLnVpLm1kY1wiLFxuXHRtZGNhdDogXCJzYXAudWkubWRjLmFjdGlvbnRvb2xiYXJcIixcblx0bWRjRmllbGQ6IFwic2FwLnVpLm1kYy5maWVsZFwiLFxuXHRtZGNUYWJsZTogXCJzYXAudWkubWRjLnRhYmxlXCIsXG5cdHU6IFwic2FwLnVpLnVuaWZpZWRcIixcblx0bWFjcm9NaWNyb0NoYXJ0OiBcInNhcC5mZS5tYWNyb3MubWljcm9jaGFydFwiLFxuXHRtaWNyb0NoYXJ0OiBcInNhcC5zdWl0ZS51aS5taWNyb2NoYXJ0XCIsXG5cdG1hY3JvVGFibGU6IFwic2FwLmZlLm1hY3Jvcy50YWJsZVwiXG59O1xuY29uc3Qgc2VsZWN0ID0geHBhdGgudXNlTmFtZXNwYWNlcyhuYW1lU3BhY2VNYXApO1xuXG5jb25zdCBkZWZhdWx0RmFrZVNpZGVFZmZlY3RTZXJ2aWNlID0geyBjb21wdXRlRmllbGRHcm91cElkczogKCkgPT4gW10gfTtcblxuZnVuY3Rpb24gX2dldFRlbXBsYXRlZFNlbGVjdG9yKHhtbGRvbTogTm9kZSwgc2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG5cdC8qKlxuXHQgKiBpZiBhIHJvb3QgZWxlbWVudCBoYXMgYmVlbiBhZGRlZCBkdXJpbmcgdGhlIHRlbXBsYXRpbmcgYnkgb3VyIEplc3QgVGVtcGxhdGluZyBtZXRob2RzXG5cdCAqIHRoZSByb290IGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhlIHNlbGVjdG9yIHBhdGguXG5cdCAqL1xuXHRjb25zdCByb290UGF0aCA9IFwiL3Jvb3RcIjtcblx0cmV0dXJuIGAke3htbGRvbS5ub2RlTmFtZSA9PT0gXCJyb290XCIgJiYgIXNlbGVjdG9yLnN0YXJ0c1dpdGgocm9vdFBhdGgpID8gcm9vdFBhdGggOiBcIlwifSR7c2VsZWN0b3J9YDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gX2J1aWxkUHJlUHJvY2Vzc29yU2V0dGluZ3MoXG5cdHNNZXRhZGF0YVVybDogc3RyaW5nLFxuXHRtQmluZGluZ0NvbnRleHRzOiB7IFt4OiBzdHJpbmddOiBzdHJpbmcgfSxcblx0bU1vZGVsczogeyBbeDogc3RyaW5nXTogYW55IH0sXG5cdGZha2VTaWRlRWZmZWN0U2VydmljZT86IHVua25vd25cbik6IFByb21pc2U8UHJlUHJvY2Vzc29yU2V0dGluZ3NUeXBlPiB7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBhd2FpdCBnZXRNZXRhTW9kZWwoc01ldGFkYXRhVXJsKTtcblxuXHQvLyBUbyBlbnN1cmUgb3VyIG1hY3JvIGNhbiB1c2UgI3NldEJpbmRpbmdDb250ZXh0IHdlIGVuc3VyZSB0aGVyZSBpcyBhIHByZSBleGlzdGluZyBKU09OTW9kZWwgZm9yIGNvbnZlcnRlckNvbnRleHRcblx0Ly8gaWYgbm90IGFscmVhZHkgcGFzc2VkIHRvIHRlaCB0ZW1wbGF0aW5nXG5cdGlmICghbU1vZGVscy5oYXNPd25Qcm9wZXJ0eShcImNvbnZlcnRlckNvbnRleHRcIikpIHtcblx0XHRtTW9kZWxzID0gT2JqZWN0LmFzc2lnbihtTW9kZWxzLCB7IGNvbnZlcnRlckNvbnRleHQ6IG5ldyBUZW1wbGF0ZU1vZGVsKHt9LCBvTWV0YU1vZGVsKSB9KTtcblx0fVxuXG5cdE9iamVjdC5rZXlzKG1Nb2RlbHMpLmZvckVhY2goZnVuY3Rpb24gKHNNb2RlbE5hbWUpIHtcblx0XHRpZiAobU1vZGVsc1tzTW9kZWxOYW1lXSAmJiBtTW9kZWxzW3NNb2RlbE5hbWVdLmlzVGVtcGxhdGVNb2RlbCkge1xuXHRcdFx0bU1vZGVsc1tzTW9kZWxOYW1lXSA9IG5ldyBUZW1wbGF0ZU1vZGVsKG1Nb2RlbHNbc01vZGVsTmFtZV0uZGF0YSwgb01ldGFNb2RlbCk7XG5cdFx0fVxuXHR9KTtcblxuXHRjb25zdCBzZXR0aW5nczogYW55ID0ge1xuXHRcdG1vZGVsczogT2JqZWN0LmFzc2lnbihcblx0XHRcdHtcblx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsXG5cdFx0XHR9LFxuXHRcdFx0bU1vZGVsc1xuXHRcdCksXG5cdFx0YmluZGluZ0NvbnRleHRzOiB7fSxcblx0XHRhcHBDb21wb25lbnQ6IHsgZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlOiBqZXN0LmZuKCksIGdldERpYWdub3N0aWNzOiAoKSA9PiB1bmRlZmluZWQgfVxuXHR9O1xuXG5cdHNldHRpbmdzLmFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UubW9ja1JldHVyblZhbHVlKGZha2VTaWRlRWZmZWN0U2VydmljZSA/PyBkZWZhdWx0RmFrZVNpZGVFZmZlY3RTZXJ2aWNlKTtcblx0Ly9JbmplY3QgbW9kZWxzIGFuZCBiaW5kaW5nQ29udGV4dHNcblx0T2JqZWN0LmtleXMobUJpbmRpbmdDb250ZXh0cykuZm9yRWFjaChmdW5jdGlvbiAoc0tleSkge1xuXHRcdC8qIEFzc2VydCB0byBtYWtlIHN1cmUgdGhlIGFubm90YXRpb25zIGFyZSBpbiB0aGUgdGVzdCBtZXRhZGF0YSAtPiBhdm9pZCBtaXNsZWFkaW5nIHRlc3RzICovXG5cdFx0ZXhwZWN0KHR5cGVvZiBvTWV0YU1vZGVsLmdldE9iamVjdChtQmluZGluZ0NvbnRleHRzW3NLZXldKSkudG9CZURlZmluZWQoKTtcblx0XHRjb25zdCBvTW9kZWwgPSBtTW9kZWxzW3NLZXldIHx8IG9NZXRhTW9kZWw7XG5cdFx0c2V0dGluZ3MuYmluZGluZ0NvbnRleHRzW3NLZXldID0gb01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG1CaW5kaW5nQ29udGV4dHNbc0tleV0pOyAvL1ZhbHVlIGlzIHNQYXRoXG5cdFx0c2V0dGluZ3MubW9kZWxzW3NLZXldID0gb01vZGVsO1xuXHR9KTtcblx0cmV0dXJuIHNldHRpbmdzO1xufVxuXG5mdW5jdGlvbiBfcmVtb3ZlQ29tbWVudEZyb21YbWwoeG1sOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gZm9ybWF0WG1sKHhtbCwge1xuXHRcdGZpbHRlcjogKG5vZGU6IGFueSkgPT4gbm9kZS50eXBlICE9PSBcIkNvbW1lbnRcIlxuXHR9KTtcbn1cblxuZnVuY3Rpb24gX2xvYWRSZXNvdXJjZVZpZXcodmlld05hbWU6IHN0cmluZyk6IEVsZW1lbnQge1xuXHRjb25zdCBuYW1lID0gdmlld05hbWUucmVwbGFjZSgvXFwuL2csIFwiL1wiKSArIFwiLnZpZXcueG1sXCI7XG5cdGNvbnN0IHZpZXcgPSBMb2FkZXJFeHRlbnNpb25zLmxvYWRSZXNvdXJjZShuYW1lKTtcblx0cmV0dXJuIHZpZXcuZG9jdW1lbnRFbGVtZW50O1xufVxuXG5leHBvcnQgY29uc3QgcnVuWFBhdGhRdWVyeSA9IGZ1bmN0aW9uIChzZWxlY3Rvcjogc3RyaW5nLCB4bWxkb206IE5vZGUgfCB1bmRlZmluZWQpIHtcblx0cmV0dXJuIHNlbGVjdChzZWxlY3RvciwgeG1sZG9tKTtcbn07XG5cbmV4cGVjdC5leHRlbmQoe1xuXHR0b0hhdmVDb250cm9sKHhtbGRvbSwgc2VsZWN0b3IpIHtcblx0XHRjb25zdCBub2RlcyA9IHJ1blhQYXRoUXVlcnkoX2dldFRlbXBsYXRlZFNlbGVjdG9yKHhtbGRvbSwgc2VsZWN0b3IpLCB4bWxkb20pO1xuXHRcdHJldHVybiB7XG5cdFx0XHRtZXNzYWdlOiAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG91dHB1dFhtbCA9IHNlcmlhbGl6ZVhNTCh4bWxkb20pO1xuXHRcdFx0XHRyZXR1cm4gYGRpZCBub3QgZmluZCBjb250cm9scyBtYXRjaGluZyAke3NlbGVjdG9yfSBpbiBnZW5lcmF0ZWQgeG1sOlxcbiAke291dHB1dFhtbH1gO1xuXHRcdFx0fSxcblx0XHRcdHBhc3M6IG5vZGVzICYmIG5vZGVzLmxlbmd0aCA+PSAxXG5cdFx0fTtcblx0fSxcblx0dG9Ob3RIYXZlQ29udHJvbCh4bWxkb20sIHNlbGVjdG9yKSB7XG5cdFx0Y29uc3Qgbm9kZXMgPSBydW5YUGF0aFF1ZXJ5KF9nZXRUZW1wbGF0ZWRTZWxlY3Rvcih4bWxkb20sIHNlbGVjdG9yKSwgeG1sZG9tKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bWVzc2FnZTogKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBvdXRwdXRYbWwgPSBzZXJpYWxpemVYTUwoeG1sZG9tKTtcblx0XHRcdFx0cmV0dXJuIGBUaGVyZSBpcyBhIGNvbnRyb2wgbWF0Y2hpbmcgJHtzZWxlY3Rvcn0gaW4gZ2VuZXJhdGVkIHhtbDpcXG4gJHtvdXRwdXRYbWx9YDtcblx0XHRcdH0sXG5cdFx0XHRwYXNzOiBub2RlcyAmJiBub2Rlcy5sZW5ndGggPT09IDBcblx0XHR9O1xuXHR9LFxuXHQvKipcblx0ICogQ2hlY2tzIGZvciBlcnJvcnMgaW4gYHhtbGAgY3JlYXRlZCBkdXJpbmcgdGVtcGxhdGluZyBvZiBhbiBYTUwgc3RyaW5nIG9yXG5cdCAqIGFuIFhNTCBub2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGNoZWNrZXMgZm9yIHRoZSB4bWwgZXJyb3JzIGNyZWF0ZWQgYnkgdGhlXG5cdCAqIGZ1bmN0aW9uIFtCdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3IuY3JlYXRlRXJyb3JYTUxde0BsaW5rIHNhcC5mZS5jb3JlLmJ1aWxkaW5nQmxvY2tzLkJ1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvciNjcmVhdGVFcnJvclhNTH0uXG5cdCAqXG5cdCAqIEBwYXJhbSB4bWwgWE1MIFN0cmluZyBvciBYTUwgTm9kZSB0byBiZSB0ZXN0ZWQgZm9yIGVycm9yc1xuXHQgKiBAcmV0dXJucyBKZXN0IE1hdGNoZXIgcmVzdWx0IG9iamVjdFxuXHQgKi9cblx0dG9IYXZlVGVtcGxhdGluZ0Vycm9ycyh4bWw6IHN0cmluZyB8IE5vZGUpIHtcblx0XHRjb25zdCB4bWxUZXh0ID0gdHlwZW9mIHhtbCA9PT0gXCJzdHJpbmdcIiA/IHhtbCA6IHNlcmlhbGl6ZVhNTCh4bWwpO1xuXHRcdGNvbnN0IGJhc2U2NEVudHJpZXM6IHN0cmluZ1tdID0geG1sVGV4dC5tYXRjaCgvQkJGXFwuYmFzZTY0RGVjb2RlXFwoJyhbXiddKiknXFwpL2dtKSB8fCAoW10gYXMgc3RyaW5nW10pO1xuXHRcdGNvbnN0IGVycm9yTWVzc2FnZXM6IHN0cmluZ1tdID0gYmFzZTY0RW50cmllcy5tYXAoKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuXHRcdFx0aWYgKG1lc3NhZ2UgJiYgbWVzc2FnZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHJldHVybiBhdG9iKG1lc3NhZ2UubWF0Y2goLygnW14nXSopLyk/LlswXT8uc2xpY2UoMSkgfHwgXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9KTtcblx0XHRpZiAoZXJyb3JNZXNzYWdlcy5sZW5ndGggPD0gMCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bWVzc2FnZTogKCkgPT4gYFhNTCBUZW1wbGF0aW5nIHdpdGhvdXQgZXJyb3JzYCxcblx0XHRcdFx0cGFzczogZmFsc2Vcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG1lc3NhZ2U6ICgpID0+IGVycm9yTWVzc2FnZXMuam9pbihcIlxcblwiKSxcblx0XHRcdFx0cGFzczogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cbn0pO1xuXG5leHBvcnQgY29uc3QgZm9ybWF0QnVpbGRpbmdCbG9ja1hNTCA9IGZ1bmN0aW9uICh4bWxTdHJpbmc6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KHhtbFN0cmluZykpIHtcblx0XHR4bWxTdHJpbmcgPSB4bWxTdHJpbmcuam9pbihcIlwiKTtcblx0fVxuXHRsZXQgeG1sRm9ybWF0dGVkID0gZm9ybWF0WE1MKHhtbFN0cmluZyk7XG5cdHhtbEZvcm1hdHRlZCA9IHhtbEZvcm1hdHRlZC5yZXBsYWNlKC91aWQtLWlkLVswLTldezEzfS1bMC05XXsxLDN9L2csIFwidWlkLS1pZFwiKTtcblx0cmV0dXJuIHhtbEZvcm1hdHRlZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb250cm9sQXR0cmlidXRlID0gZnVuY3Rpb24gKGNvbnRyb2xTZWxlY3Rvcjogc3RyaW5nLCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHhtbERvbTogTm9kZSkge1xuXHRjb25zdCBzZWxlY3RvciA9IGBzdHJpbmcoJHtfZ2V0VGVtcGxhdGVkU2VsZWN0b3IoeG1sRG9tLCBjb250cm9sU2VsZWN0b3IpfS9AJHthdHRyaWJ1dGVOYW1lfSlgO1xuXHRyZXR1cm4gcnVuWFBhdGhRdWVyeShzZWxlY3RvciwgeG1sRG9tKTtcbn07XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBwYXJ0cyBvciB0aGUgY29tcGxldGUgZ2l2ZW4gWE1MIERPTSB0byBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHhtbERvbSBET00gbm9kZSB0aGF0IGlzIHRvIGJlIHNlcmlhbGl6ZWQuXG4gKiBAcGFyYW0gc2VsZWN0b3IgT3B0aW9uYWwgc2VsZWN0b3Igb2Ygc3ViIG5vZGVzXG4gKiBAcmV0dXJucyBYTUwgc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBzZXJpYWxpemVYTUwgPSBmdW5jdGlvbiAoeG1sRG9tOiBOb2RlLCBzZWxlY3Rvcj86IHN0cmluZykge1xuXHRjb25zdCBzZXJpYWxpemVyID0gbmV3IHdpbmRvdy5YTUxTZXJpYWxpemVyKCk7XG5cdGxldCB4bWxTdHJpbmc6IHN0cmluZztcblx0aWYgKHNlbGVjdG9yKSB7XG5cdFx0Y29uc3Qgbm9kZXMgPSBydW5YUGF0aFF1ZXJ5KHNlbGVjdG9yLCB4bWxEb20pIGFzIE5vZGVbXTtcblx0XHR4bWxTdHJpbmcgPSBub2Rlcy5tYXAoKG5vZGUpID0+IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcobm9kZSkpLmpvaW4oXCJcXG5cIik7XG5cdH0gZWxzZSB7XG5cdFx0eG1sU3RyaW5nID0gc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyh4bWxEb20pO1xuXHR9XG5cdHJldHVybiBmb3JtYXRYTUwoeG1sU3RyaW5nKTtcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRYTUwgPSBmdW5jdGlvbiAoeG1sU3RyaW5nOiBzdHJpbmcpIHtcblx0cmV0dXJuIGZvcm1hdCh4bWxTdHJpbmcsIHtcblx0XHRwYXJzZXI6IFwieG1sXCIsXG5cdFx0eG1sV2hpdGVzcGFjZVNlbnNpdGl2aXR5OiBcImlnbm9yZVwiLFxuXHRcdHBsdWdpbnM6IFtwbHVnaW5dXG5cdH0gYXMgT3B0aW9ucyAmIHsgeG1sV2hpdGVzcGFjZVNlbnNpdGl2aXR5OiBcImlnbm9yZVwiIHwgXCJzdHJpY3RcIiB9KTtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBhIENEUyBmaWxlIGludG8gYW4gRURNWCBmaWxlLlxuICpcbiAqIEBwYXJhbSBjZHNVcmwgVGhlIHBhdGggdG8gdGhlIGZpbGUgY29udGFpbmluZyB0aGUgQ0RTIGRlZmluaXRpb24uIFRoaXMgZmlsZSBtdXN0IGRlY2xhcmUgdGhlIG5hbWVzcGFjZVxuICogc2FwLmZlLnRlc3QgYW5kIGEgc2VydmljZSBKZXN0U2VydmljZVxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgY3JlYXRpbmcgdGhlIEVETVggb3V0cHV0XG4gKiBAcmV0dXJucyBUaGUgcGF0aCBvZiB0aGUgZ2VuZXJhdGVkIEVETVhcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbXBpbGVDRFMgPSBmdW5jdGlvbiAoY2RzVXJsOiBzdHJpbmcsIG9wdGlvbnM6IGNvbXBpbGVyLk9EYXRhT3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IGNkc1N0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhjZHNVcmwsIFwidXRmLThcIik7XG5cdGNvbnN0IGVkbXhDb250ZW50ID0gY2RzMmVkbXgoY2RzU3RyaW5nLCBcInNhcC5mZS50ZXN0Lkplc3RTZXJ2aWNlXCIsIG9wdGlvbnMpO1xuXHRjb25zdCBkaXIgPSBwYXRoLnJlc29sdmUoY2RzVXJsLCBcIi4uXCIsIFwiZ2VuXCIpO1xuXG5cdC8vIElmIHRoZSBjYWxsZXIgcHJvdmlkZWQgQ0RTIGNvbXBpbGVyIG9wdGlvbnM6IEluY2x1ZGUgdGhlbSBpbiB0aGUgZmlsZW5hbWUuIFRoaXMgcHJldmVudHMgdW5wcmVkaWN0YWJsZSByZXN1bHRzIGlmIHRoZSBzYW1lIENEUyBzb3VyY2Vcblx0Ly8gZmlsZSBpcyB1c2VkIHNpbXVsdGFuZW91c2x5IHdpdGggYSBkaWZmZXJlbnQgc2V0IG9mIG9wdGlvbnMgKGUuZy4gaW4gYSB0ZXN0IHJ1bm5pbmcgaW4gcGFyYWxsZWwpXG5cdGNvbnN0IGFsbE9wdGlvbnMgPSBPYmplY3QuZW50cmllcyhvcHRpb25zKTtcblx0YWxsT3B0aW9ucy5zb3J0KChhLCBiKSA9PiBiWzBdLmxvY2FsZUNvbXBhcmUoYVswXSkpO1xuXG5cdGNvbnN0IGVkbXhGaWxlTmFtZSA9XG5cdFx0YWxsT3B0aW9ucy5yZWR1Y2UoXG5cdFx0XHQoZmlsZW5hbWUsIFtvcHRpb25LZXksIG9wdGlvblZhbHVlXSkgPT4gYCR7ZmlsZW5hbWV9IyR7b3B0aW9uS2V5fT0ke29wdGlvblZhbHVlLnRvU3RyaW5nKCl9I2AsXG5cdFx0XHRwYXRoLmJhc2VuYW1lKGNkc1VybCkucmVwbGFjZShcIi5jZHNcIiwgXCJcIilcblx0XHQpICsgXCIueG1sXCI7XG5cblx0Y29uc3QgZWRteEZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGRpciwgZWRteEZpbGVOYW1lKTtcblxuXHRmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuXHRmcy53cml0ZUZpbGVTeW5jKGVkbXhGaWxlUGF0aCwgZWRteENvbnRlbnQpO1xuXHRyZXR1cm4gZWRteEZpbGVQYXRoO1xufTtcblxuLyoqXG4gKiBDb21waWxlIENEUyB0byBFRE1YLlxuICpcbiAqIEBwYXJhbSBjZHMgVGhlIENEUyBtb2RlbC4gSXQgbXVzdCBkZWZpbmUgYXQgbGVhc3Qgb25lIHNlcnZpY2UuXG4gKiBAcGFyYW0gc2VydmljZSBUaGUgZnVsbHktcXVhbGlmaWVkIG5hbWUgb2YgdGhlIHNlcnZpY2UgdG8gYmUgY29tcGlsZWQuIERlZmF1bHRzIHRvIFwic2FwLmZlLnRlc3QuSmVzdFNlcnZpY2VcIi5cbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGNyZWF0aW5nIHRoZSBFRE1YIG91dHB1dFxuICogQHJldHVybnMgVGhlIGNvbXBpbGVkIHNlcnZpY2UgbW9kZWwgYXMgRURNWC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNkczJlZG14KGNkczogc3RyaW5nLCBzZXJ2aWNlID0gXCJzYXAuZmUudGVzdC5KZXN0U2VydmljZVwiLCBvcHRpb25zOiBjb21waWxlci5PRGF0YU9wdGlvbnMgPSB7fSkge1xuXHRjb25zdCBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0geyBcInNvdXJjZS5jZHNcIjogY2RzIH07XG5cblx0Ly8gYWxsb3cgdG8gaW5jbHVkZSBzdHVmZiBmcm9tIEBzYXAvY2RzL2NvbW1vblxuXHRpZiAoY2RzLmluY2x1ZGVzKFwiJ0BzYXAvY2RzL2NvbW1vbidcIikpIHtcblx0XHRzb3VyY2VzW1wiY29tbW9uLmNkc1wiXSA9IGZzLnJlYWRGaWxlU3luYyhyZXF1aXJlLnJlc29sdmUoXCJAc2FwL2Nkcy9jb21tb24uY2RzXCIpLCBcInV0Zi04XCIpO1xuXHR9XG5cblx0Y29uc3QgY3NuID0gY29tcGlsZXIuY29tcGlsZVNvdXJjZXMoc291cmNlcywge30pO1xuXG5cdGNvbnN0IGVkbXhPcHRpb25zOiBjb21waWxlci5PRGF0YU9wdGlvbnMgPSB7XG5cdFx0b2RhdGFGb3JlaWduS2V5czogdHJ1ZSxcblx0XHRvZGF0YUZvcm1hdDogXCJzdHJ1Y3R1cmVkXCIsXG5cdFx0b2RhdGFDb250YWlubWVudDogdHJ1ZSxcblx0XHQuLi5vcHRpb25zLFxuXHRcdHNlcnZpY2U6IHNlcnZpY2Vcblx0fTtcblxuXHRjb25zdCBlZG14ID0gY29tcGlsZXIudG8uZWRteChjc24sIGVkbXhPcHRpb25zKTtcblx0aWYgKCFlZG14KSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBDb21waWxhdGlvbiBmYWlsZWQuIEhpbnQ6IE1ha2Ugc3VyZSB0aGF0IHRoZSBDRFMgbW9kZWwgZGVmaW5lcyBzZXJ2aWNlICR7c2VydmljZX0uYCk7XG5cdH1cblx0cmV0dXJuIGVkbXg7XG59XG5cbmV4cG9ydCBjb25zdCBnZXRGYWtlU2lkZUVmZmVjdHNTZXJ2aWNlID0gYXN5bmMgZnVuY3Rpb24gKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKTogUHJvbWlzZTxhbnk+IHtcblx0Y29uc3Qgb1NlcnZpY2VDb250ZXh0ID0geyBzY29wZU9iamVjdDoge30sIHNjb3BlVHlwZTogXCJcIiwgc2V0dGluZ3M6IHt9IH0gYXMgU2VydmljZUNvbnRleHQ8YW55Pjtcblx0cmV0dXJuIG5ldyBTaWRlRWZmZWN0c0ZhY3RvcnkoKS5jcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG9TZXJ2aWNlSW5zdGFuY2U6IGFueSkge1xuXHRcdGNvbnN0IG9KZXN0U2lkZUVmZmVjdHNTZXJ2aWNlID0gb1NlcnZpY2VJbnN0YW5jZS5nZXRJbnRlcmZhY2UoKTtcblx0XHRvSmVzdFNpZGVFZmZlY3RzU2VydmljZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2NvcGVPYmplY3Q6IHtcblx0XHRcdFx0XHRnZXRNb2RlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0Z2V0TWV0YU1vZGVsOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9NZXRhTW9kZWw7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cdFx0cmV0dXJuIG9KZXN0U2lkZUVmZmVjdHNTZXJ2aWNlO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGYWtlRGlhZ25vc3RpY3MgPSBmdW5jdGlvbiAoKTogSURpYWdub3N0aWNzIHtcblx0Y29uc3QgaXNzdWVzOiBhbnlbXSA9IFtdO1xuXHRyZXR1cm4ge1xuXHRcdGFkZElzc3VlKGlzc3VlQ2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnksIGlzc3VlU2V2ZXJpdHk6IElzc3VlU2V2ZXJpdHksIGRldGFpbHM6IHN0cmluZyk6IHZvaWQge1xuXHRcdFx0aXNzdWVzLnB1c2goe1xuXHRcdFx0XHRpc3N1ZUNhdGVnb3J5LFxuXHRcdFx0XHRpc3N1ZVNldmVyaXR5LFxuXHRcdFx0XHRkZXRhaWxzXG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldElzc3VlcygpOiBhbnlbXSB7XG5cdFx0XHRyZXR1cm4gaXNzdWVzO1xuXHRcdH0sXG5cdFx0Y2hlY2tJZklzc3VlRXhpc3RzKGlzc3VlQ2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnksIGlzc3VlU2V2ZXJpdHk6IElzc3VlU2V2ZXJpdHksIGRldGFpbHM6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdFx0cmV0dXJuIGlzc3Vlcy5maW5kKChpc3N1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gaXNzdWUuaXNzdWVDYXRlZ29yeSA9PT0gaXNzdWVDYXRlZ29yeSAmJiBpc3N1ZS5pc3N1ZVNldmVyaXR5ID09PSBpc3N1ZVNldmVyaXR5ICYmIGlzc3VlLmRldGFpbHMgPT09IGRldGFpbHM7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q29udmVydGVyQ29udGV4dEZvclRlc3QgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlZFR5cGVzOiBDb252ZXJ0ZWRNZXRhZGF0YSxcblx0bWFuaWZlc3RTZXR0aW5nczogTGlzdFJlcG9ydE1hbmlmZXN0U2V0dGluZ3MgfCBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5nc1xuKSB7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlZFR5cGVzLmVudGl0eVNldHMuZmluZCgoZXMpID0+IGVzLm5hbWUgPT09IG1hbmlmZXN0U2V0dGluZ3MuZW50aXR5U2V0KTtcblx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IGdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JQcm9wZXJ0eShlbnRpdHlTZXQgYXMgRW50aXR5U2V0LCBjb252ZXJ0ZWRUeXBlcywgZW50aXR5U2V0KTtcblx0cmV0dXJuIG5ldyBDb252ZXJ0ZXJDb250ZXh0KGNvbnZlcnRlZFR5cGVzLCBtYW5pZmVzdFNldHRpbmdzLCBnZXRGYWtlRGlhZ25vc3RpY3MoKSwgbWVyZ2UsIGRhdGFNb2RlbFBhdGgpO1xufTtcbmNvbnN0IG1ldGFNb2RlbENhY2hlOiBhbnkgPSB7fTtcbmV4cG9ydCBjb25zdCBnZXRNZXRhTW9kZWwgPSBhc3luYyBmdW5jdGlvbiAoc01ldGFkYXRhVXJsOiBzdHJpbmcpIHtcblx0Y29uc3Qgb1JlcXVlc3RvciA9IF9NZXRhZGF0YVJlcXVlc3Rvci5jcmVhdGUoe30sIFwiNC4wXCIsIHVuZGVmaW5lZCwge30pO1xuXHRpZiAoIW1ldGFNb2RlbENhY2hlW3NNZXRhZGF0YVVybF0pIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gbmV3IChPRGF0YU1ldGFNb2RlbCBhcyBhbnkpKG9SZXF1ZXN0b3IsIHNNZXRhZGF0YVVybCwgdW5kZWZpbmVkLCBudWxsKTtcblx0XHRhd2FpdCBvTWV0YU1vZGVsLmZldGNoRW50aXR5Q29udGFpbmVyKCk7XG5cdFx0bWV0YU1vZGVsQ2FjaGVbc01ldGFkYXRhVXJsXSA9IG9NZXRhTW9kZWw7XG5cdH1cblxuXHRyZXR1cm4gbWV0YU1vZGVsQ2FjaGVbc01ldGFkYXRhVXJsXTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yUHJvcGVydHkgPSBmdW5jdGlvbiAoXG5cdGVudGl0eVNldDogRW50aXR5U2V0LFxuXHRjb252ZXJ0ZWRUeXBlczogQ29udmVydGVkTWV0YWRhdGEsXG5cdHByb3BlcnR5PzogUHJvcGVydHkgfCBFbnRpdHlTZXQgfCBBbnlBbm5vdGF0aW9uXG4pOiBEYXRhTW9kZWxPYmplY3RQYXRoIHtcblx0Y29uc3QgdGFyZ2V0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCA9IHtcblx0XHRzdGFydGluZ0VudGl0eVNldDogZW50aXR5U2V0LFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBbXSxcblx0XHR0YXJnZXRPYmplY3Q6IHByb3BlcnR5LFxuXHRcdHRhcmdldEVudGl0eVNldDogZW50aXR5U2V0LFxuXHRcdHRhcmdldEVudGl0eVR5cGU6IGVudGl0eVNldC5lbnRpdHlUeXBlLFxuXHRcdGNvbnZlcnRlZFR5cGVzOiBjb252ZXJ0ZWRUeXBlc1xuXHR9O1xuXHR0YXJnZXRQYXRoLmNvbnRleHRMb2NhdGlvbiA9IHRhcmdldFBhdGg7XG5cdHJldHVybiB0YXJnZXRQYXRoO1xufTtcblxuZXhwb3J0IGNvbnN0IGV2YWx1YXRlQmluZGluZyA9IGZ1bmN0aW9uIChiaW5kaW5nU3RyaW5nOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG5cdGNvbnN0IGJpbmRpbmdFbGVtZW50ID0gQmluZGluZ1BhcnNlci5jb21wbGV4UGFyc2VyKGJpbmRpbmdTdHJpbmcpO1xuXHRyZXR1cm4gYmluZGluZ0VsZW1lbnQuZm9ybWF0dGVyLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG59O1xuXG50eXBlIE1vZGVsQ29udGVudCA9IHtcblx0W25hbWU6IHN0cmluZ106IGFueTtcbn07XG5cbi8qKlxuICogRXZhbHVhdGUgYSBiaW5kaW5nIGFnYWluc3QgYSBtb2RlbC5cbiAqXG4gKiBAcGFyYW0gYmluZGluZ1N0cmluZyBUaGUgYmluZGluZyBzdHJpbmcuXG4gKiBAcGFyYW0gbW9kZWxDb250ZW50IENvbnRlbnQgb2YgdGhlIGRlZmF1bHQgbW9kZWwgdG8gdXNlIGZvciBldmFsdWF0aW9uLlxuICogQHBhcmFtIG5hbWVkTW9kZWxzQ29udGVudCBDb250ZW50cyBvZiBhZGRpdGlvbmFsLCBuYW1lZCBtb2RlbHMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIGV2YWx1YXRlZCBiaW5kaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVCaW5kaW5nV2l0aE1vZGVsKFxuXHRiaW5kaW5nU3RyaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdG1vZGVsQ29udGVudDogTW9kZWxDb250ZW50LFxuXHRuYW1lZE1vZGVsc0NvbnRlbnQ/OiB7IFttb2RlbE5hbWU6IHN0cmluZ106IE1vZGVsQ29udGVudCB9XG4pOiBzdHJpbmcge1xuXHRjb25zdCBiaW5kaW5nRWxlbWVudCA9IEJpbmRpbmdQYXJzZXIuY29tcGxleFBhcnNlcihiaW5kaW5nU3RyaW5nKTtcblx0Y29uc3QgdGV4dCA9IG5ldyBJbnZpc2libGVUZXh0KCk7XG5cdHRleHQuYmluZFByb3BlcnR5KFwidGV4dFwiLCBiaW5kaW5nRWxlbWVudCk7XG5cblx0Y29uc3QgZGVmYXVsdE1vZGVsID0gbmV3IEpTT05Nb2RlbChtb2RlbENvbnRlbnQpO1xuXHR0ZXh0LnNldE1vZGVsKGRlZmF1bHRNb2RlbCk7XG5cdHRleHQuc2V0QmluZGluZ0NvbnRleHQoZGVmYXVsdE1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSk7XG5cblx0aWYgKG5hbWVkTW9kZWxzQ29udGVudCkge1xuXHRcdGZvciAoY29uc3QgW25hbWUsIGNvbnRlbnRdIG9mIE9iamVjdC5lbnRyaWVzKG5hbWVkTW9kZWxzQ29udGVudCkpIHtcblx0XHRcdGNvbnN0IG1vZGVsID0gbmV3IEpTT05Nb2RlbChjb250ZW50KTtcblx0XHRcdHRleHQuc2V0TW9kZWwobW9kZWwsIG5hbWUpO1xuXHRcdFx0dGV4dC5zZXRCaW5kaW5nQ29udGV4dChtb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksIG5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0ZXh0LmdldFRleHQoKTtcbn1cblxuY29uc3QgVEVTVFZJRVdJRCA9IFwidGVzdFZpZXdJZFwiO1xuXG5jb25zdCBhcHBseUZsZXhDaGFuZ2VzID0gYXN5bmMgZnVuY3Rpb24gKGZsZXhDaGFuZ2VzOiB7IFt4OiBzdHJpbmddOiBvYmplY3RbXSB9LCBvTWV0YU1vZGVsOiBNZXRhTW9kZWwsIHJlc3VsdFhNTDogYW55KSB7XG5cdC8vIHByZWZpeCBJZHNcblx0Wy4uLnJlc3VsdFhNTC5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKV0uZm9yRWFjaCgobm9kZSkgPT4ge1xuXHRcdG5vZGUuaWQgPSBgJHtURVNUVklFV0lEfS0tJHtub2RlLmlkfWA7XG5cdH0pO1xuXHRjb25zdCBjaGFuZ2VzID0gY3JlYXRlRmxleGliaWxpdHlDaGFuZ2VzT2JqZWN0KFRFU1RWSUVXSUQsIGZsZXhDaGFuZ2VzKTtcblx0Y29uc3QgYXBwSWQgPSBcInNvbWVDb21wb25lbnRcIjtcblx0Y29uc3Qgb01hbmlmZXN0ID0ge1xuXHRcdFwic2FwLmFwcFwiOiB7XG5cdFx0XHRpZDogYXBwSWQsXG5cdFx0XHR0eXBlOiBcImFwcGxpY2F0aW9uXCIsXG5cdFx0XHRjcm9zc05hdmlnYXRpb246IHtcblx0XHRcdFx0b3V0Ym91bmRzOiBbXVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0Y29uc3Qgb0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50ID0ge1xuXHRcdGdldERpYWdub3N0aWNzOiBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKGdldEZha2VEaWFnbm9zdGljcygpKSxcblx0XHRnZXRNb2RlbDogamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7XG5cdFx0XHRnZXRNZXRhTW9kZWw6IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUob01ldGFNb2RlbClcblx0XHR9KSxcblx0XHRnZXRDb21wb25lbnREYXRhOiBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHt9KSxcblx0XHRnZXRNYW5pZmVzdE9iamVjdDogamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7XG5cdFx0XHRnZXRFbnRyeTogZnVuY3Rpb24gKG5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gKG9NYW5pZmVzdCBhcyBhbnkpW25hbWVdO1xuXHRcdFx0fVxuXHRcdH0pLFxuXHRcdGdldExvY2FsSWQ6IGplc3QuZm4oKHNJZCkgPT4gc0lkKVxuXHR9IGFzIHVua25vd24gYXMgQXBwQ29tcG9uZW50O1xuXHQvL2Zha2UgY2hhbmdlc1xuXHRqZXN0LnNweU9uKEFwcFN0b3JhZ2UsIFwibG9hZEZsZXhEYXRhXCIpLm1vY2tSZXR1cm5WYWx1ZShQcm9taXNlLnJlc29sdmUoY2hhbmdlcykpO1xuXHRqZXN0LnNweU9uKENvbXBvbmVudCwgXCJnZXRcIikubW9ja1JldHVyblZhbHVlKG9BcHBDb21wb25lbnQpO1xuXHRqZXN0LnNweU9uKFV0aWxzLCBcImdldEFwcENvbXBvbmVudEZvckNvbnRyb2xcIikubW9ja1JldHVyblZhbHVlKG9BcHBDb21wb25lbnQpO1xuXHRhd2FpdCBGbGV4U3RhdGUuaW5pdGlhbGl6ZSh7XG5cdFx0Y29tcG9uZW50SWQ6IGFwcElkXG5cdH0pO1xuXHRyZXN1bHRYTUwgPSBhd2FpdCBYbWxQcmVwcm9jZXNzb3IucHJvY2VzcyhyZXN1bHRYTUwsIHsgbmFtZTogXCJUZXN0IEZyYWdtZW50XCIsIGNvbXBvbmVudElkOiBhcHBJZCwgaWQ6IFRFU1RWSUVXSUQgfSk7XG5cblx0Ly9Bc3NlcnQgdGhhdCBhbGwgY2hhbmdlcyBoYXZlIGJlZW4gYXBwbGllZFxuXHRjb25zdCBjaGFuZ2VzQXBwbGllZCA9IGdldENoYW5nZXNGcm9tWE1MKHJlc3VsdFhNTCk7XG5cdGV4cGVjdChjaGFuZ2VzQXBwbGllZC5sZW5ndGgpLnRvQmUoZmxleENoYW5nZXM/LmNoYW5nZXM/Lmxlbmd0aCA/PyAwICsgZmxleENoYW5nZXM/LnZhcmlhbnREZXBlbmRlbnRDb250cm9sQ2hhbmdlcz8ubGVuZ3RoID8/IDApO1xuXHRyZXR1cm4gcmVzdWx0WE1MO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldENoYW5nZXNGcm9tWE1MID0gKHhtbDogYW55KSA9PlxuXHRbLi4ueG1sLnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpXVxuXHRcdC5mbGF0TWFwKChlKSA9PiBbLi4uZS5hdHRyaWJ1dGVzXS5tYXAoKGEpID0+IGEubmFtZSkpXG5cdFx0LmZpbHRlcigoYXR0cikgPT4gYXR0ci5pbmNsdWRlcyhcInNhcC51aS5mbC5hcHBsaWVkQ2hhbmdlc1wiKSk7XG5cbmV4cG9ydCBjb25zdCBnZXRUZW1wbGF0aW5nUmVzdWx0ID0gYXN5bmMgZnVuY3Rpb24gKFxuXHR4bWxJbnB1dDogc3RyaW5nLFxuXHRzTWV0YWRhdGFVcmw6IHN0cmluZyxcblx0bUJpbmRpbmdDb250ZXh0czogeyBbeDogc3RyaW5nXTogYW55OyBlbnRpdHlTZXQ/OiBzdHJpbmcgfSxcblx0bU1vZGVsczogeyBbeDogc3RyaW5nXTogYW55IH0sXG5cdGZsZXhDaGFuZ2VzPzogeyBbeDogc3RyaW5nXTogb2JqZWN0W10gfSxcblx0ZmFrZVNpZGVFZmZlY3RTZXJ2aWNlPzogdW5rbm93blxuKSB7XG5cdGlmICghbU1vZGVsc1tcInNhcC5mZS5pMThuXCJdKSB7XG5cdFx0bU1vZGVsc1tcInNhcC5mZS5pMThuXCJdID0gY3JlYXRlTW9ja1Jlc291cmNlTW9kZWwoKTtcblx0fVxuXG5cdGNvbnN0IHRlbXBsYXRlZFhtbCA9IGA8cm9vdD4ke3htbElucHV0fTwvcm9vdD5gO1xuXHRjb25zdCBwYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpO1xuXHRjb25zdCB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHRlbXBsYXRlZFhtbCwgXCJ0ZXh0L3htbFwiKTtcblx0Ly8gVG8gZW5zdXJlIG91ciBtYWNybyBjYW4gdXNlICNzZXRCaW5kaW5nQ29udGV4dCB3ZSBlbnN1cmUgdGhlcmUgaXMgYSBwcmUgZXhpc3RpbmcgSlNPTk1vZGVsIGZvciBjb252ZXJ0ZXJDb250ZXh0XG5cdC8vIGlmIG5vdCBhbHJlYWR5IHBhc3NlZCB0byB0ZWggdGVtcGxhdGluZ1xuXG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBhd2FpdCBnZXRNZXRhTW9kZWwoc01ldGFkYXRhVXJsKTtcblx0Y29uc3Qgb1ByZXByb2Nlc3NvclNldHRpbmdzID0gYXdhaXQgX2J1aWxkUHJlUHJvY2Vzc29yU2V0dGluZ3Moc01ldGFkYXRhVXJsLCBtQmluZGluZ0NvbnRleHRzLCBtTW9kZWxzLCBmYWtlU2lkZUVmZmVjdFNlcnZpY2UpO1xuXG5cdC8vVGhpcyBjb250ZXh0IGZvciBtYWNybyB0ZXN0aW5nXG5cdGlmIChvUHJlcHJvY2Vzc29yU2V0dGluZ3MubW9kZWxzW1widGhpc1wiXSkge1xuXHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5ncy5iaW5kaW5nQ29udGV4dHNbXCJ0aGlzXCJdID0gb1ByZXByb2Nlc3NvclNldHRpbmdzLm1vZGVsc1tcInRoaXNcIl0uY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9XG5cblx0bGV0IHJlc3VsdFhNTCA9IChhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2Vzcyh4bWxEb2MuZmlyc3RFbGVtZW50Q2hpbGQhLCB7IG5hbWU6IFwiVGVzdCBGcmFnbWVudFwiIH0sIG9QcmVwcm9jZXNzb3JTZXR0aW5ncykpIGFzIGFueTtcblxuXHRpZiAoZmxleENoYW5nZXMpIHtcblx0XHQvLyBhcHBseSBmbGV4IGNoYW5nZXNcblx0XHRyZXN1bHRYTUwgPSBhd2FpdCBhcHBseUZsZXhDaGFuZ2VzKGZsZXhDaGFuZ2VzLCBvTWV0YU1vZGVsLCByZXN1bHRYTUwpO1xuXHR9XG5cdHJldHVybiByZXN1bHRYTUw7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VGVtcGxhdGVkWE1MID0gYXN5bmMgZnVuY3Rpb24gKFxuXHR4bWxJbnB1dDogc3RyaW5nLFxuXHRzTWV0YWRhdGFVcmw6IHN0cmluZyxcblx0bUJpbmRpbmdDb250ZXh0czogeyBbeDogc3RyaW5nXTogc3RyaW5nIH0sXG5cdG1Nb2RlbHM6IHsgW3g6IHN0cmluZ106IGFueSB9LFxuXHRmbGV4Q2hhbmdlcz86IHsgW3g6IHN0cmluZ106IG9iamVjdFtdIH0sXG5cdGZha2VTaWRlRWZmZWN0U2VydmljZT86IHVua25vd25cbikge1xuXHRjb25zdCB0ZW1wbGF0ZWRYTUwgPSBhd2FpdCBnZXRUZW1wbGF0aW5nUmVzdWx0KHhtbElucHV0LCBzTWV0YWRhdGFVcmwsIG1CaW5kaW5nQ29udGV4dHMsIG1Nb2RlbHMsIGZsZXhDaGFuZ2VzLCBmYWtlU2lkZUVmZmVjdFNlcnZpY2UpO1xuXHRjb25zdCBzZXJpYWxpZWRYTUwgPSBzZXJpYWxpemVYTUwodGVtcGxhdGVkWE1MKTtcblx0ZXhwZWN0KHNlcmlhbGllZFhNTCkubm90LnRvSGF2ZVRlbXBsYXRpbmdFcnJvcnMoKTtcblx0cmV0dXJuIHNlcmlhbGllZFhNTDtcbn07XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgcmVxdWVzdGVkIHZpZXcgd2l0aCB0aGUgcHJvdmlkZWQgZGF0YS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBGdWxseSBxdWFsaWZpZWQgbmFtZSBvZiB0aGUgdmlldyB0byBiZSB0ZXN0ZWQuXG4gKiBAcGFyYW0gc01ldGFkYXRhVXJsIFVybCBvZiB0aGUgbWV0YWRhdGEuXG4gKiBAcGFyYW0gbUJpbmRpbmdDb250ZXh0cyBNYXAgb2YgdGhlIGJpbmRpbmdDb250ZXh0cyB0byBzZXQgb24gdGhlIG1vZGVscy5cbiAqIEBwYXJhbSBtTW9kZWxzIE1hcCBvZiB0aGUgbW9kZWxzLlxuICogQHBhcmFtIGZsZXhDaGFuZ2VzIE9iamVjdCB3aXRoIFVJIGNoYW5nZXMgbGlrZSAnY2hhbmdlcycgb3IgJ3ZhcmlhbnREZXBlbmRlbnRDb250cm9sQ2hhbmdlcydcbiAqIEByZXR1cm5zIFRlbXBsYXRlZCB2aWV3IGFzIHN0cmluZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc1ZpZXcoXG5cdG5hbWU6IHN0cmluZyxcblx0c01ldGFkYXRhVXJsOiBzdHJpbmcsXG5cdG1CaW5kaW5nQ29udGV4dHM6IHsgW3g6IHN0cmluZ106IHN0cmluZyB9LFxuXHRtTW9kZWxzOiB7IFt4OiBzdHJpbmddOiBhbnkgfSxcblx0ZmxleENoYW5nZXM/OiB7IFt4OiBzdHJpbmddOiBvYmplY3RbXSB9XG4pOiBQcm9taXNlPEplc3RUZW1wbGF0ZWRWaWV3PiB7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBhd2FpdCBnZXRNZXRhTW9kZWwoc01ldGFkYXRhVXJsKTtcblx0Y29uc3Qgb1ZpZXdEb2N1bWVudCA9IF9sb2FkUmVzb3VyY2VWaWV3KG5hbWUpO1xuXHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSBhd2FpdCBfYnVpbGRQcmVQcm9jZXNzb3JTZXR0aW5ncyhzTWV0YWRhdGFVcmwsIG1CaW5kaW5nQ29udGV4dHMsIG1Nb2RlbHMpO1xuXHRsZXQgb1ByZXByb2Nlc3NlZFZpZXcgPSBhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhvVmlld0RvY3VtZW50LCB7IG5hbWU6IG5hbWUgfSwgb1ByZXByb2Nlc3NvclNldHRpbmdzKTtcblx0aWYgKGZsZXhDaGFuZ2VzKSB7XG5cdFx0b1ByZXByb2Nlc3NlZFZpZXcgPSBhd2FpdCBhcHBseUZsZXhDaGFuZ2VzKGZsZXhDaGFuZ2VzID8/IFtdLCBvTWV0YU1vZGVsLCBvUHJlcHJvY2Vzc2VkVmlldyk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRhc0VsZW1lbnQ6IG9QcmVwcm9jZXNzZWRWaWV3LFxuXHRcdGFzU3RyaW5nOiBfcmVtb3ZlQ29tbWVudEZyb21YbWwob1ByZXByb2Nlc3NlZFZpZXc/Lm91dGVySFRNTCB8fCBcIlwiKVxuXHR9O1xufVxuXG4vKipcbiAqIFByb2Nlc3MgdGhlIHJlcXVlc3RlZCBYTUwgZnJhZ21lbnQgd2l0aCB0aGUgcHJvdmlkZWQgZGF0YS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBGdWxseSBxdWFsaWZpZWQgbmFtZSBvZiB0aGUgZnJhZ21lbnQgdG8gYmUgdGVzdGVkLlxuICogQHBhcmFtIHRlc3REYXRhIFRlc3QgZGF0YSBjb25zaXN0aW5nXG4gKiBAcmV0dXJucyBUZW1wbGF0ZWQgZnJhZ21lbnQgYXMgc3RyaW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzRnJhZ21lbnQobmFtZTogc3RyaW5nLCB0ZXN0RGF0YTogeyBbbW9kZWw6IHN0cmluZ106IG9iamVjdCB9KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0Y29uc3QgaW5wdXRYbWwgPSBgPHJvb3Q+PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwiJHtuYW1lfVwiIHR5cGU9XCJYTUxcIiB4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIiAvPjwvcm9vdD5gO1xuXHRjb25zdCBwYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpO1xuXHRjb25zdCBpbnB1dERvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoaW5wdXRYbWwsIFwidGV4dC94bWxcIik7XG5cblx0Ly8gYnVpbGQgbW9kZWwgYW5kIGJpbmRpbmdzIGZvciBnaXZlbiB0ZXN0IGRhdGFcblx0Y29uc3Qgc2V0dGluZ3MgPSB7XG5cdFx0bW9kZWxzOiB7fSBhcyB7IFtuYW1lOiBzdHJpbmddOiBKU09OTW9kZWwgfSxcblx0XHRiaW5kaW5nQ29udGV4dHM6IHt9IGFzIHsgW25hbWU6IHN0cmluZ106IG9iamVjdCB9LFxuXHRcdGFwcENvbXBvbmVudDogeyBnZXRTaWRlRWZmZWN0c1NlcnZpY2U6IGplc3QuZm4oKSwgZ2V0RGlhZ25vc3RpY3M6ICgpID0+IHVuZGVmaW5lZCB9XG5cdH07XG5cdGZvciAoY29uc3QgbW9kZWwgaW4gdGVzdERhdGEpIHtcblx0XHRjb25zdCBqc29uTW9kZWwgPSBuZXcgSlNPTk1vZGVsKCk7XG5cdFx0anNvbk1vZGVsLnNldERhdGEodGVzdERhdGFbbW9kZWxdKTtcblx0XHRzZXR0aW5ncy5tb2RlbHNbbW9kZWxdID0ganNvbk1vZGVsO1xuXHRcdHNldHRpbmdzLmJpbmRpbmdDb250ZXh0c1ttb2RlbF0gPSBzZXR0aW5ncy5tb2RlbHNbbW9kZWxdLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0fVxuXHRzZXR0aW5ncy5hcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlLm1vY2tSZXR1cm5WYWx1ZShkZWZhdWx0RmFrZVNpZGVFZmZlY3RTZXJ2aWNlKTtcblxuXHQvLyBleGVjdXRlIHRoZSBwcmUtcHJvY2Vzc29yXG5cdGNvbnN0IHJlc3VsdERvYyA9IGF3YWl0IFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKGlucHV0RG9jLmZpcnN0RWxlbWVudENoaWxkLCB7IG5hbWUgfSwgc2V0dGluZ3MpO1xuXG5cdC8vIGV4Y2x1ZGUgbmVzdGVkIGZyYWdtZW50cyBmcm9tIHRlc3Qgc25hcHNob3RzXG5cdGNvbnN0IGZyYWdtZW50cyA9IHJlc3VsdERvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNvcmU6RnJhZ21lbnRcIikgYXMgYW55O1xuXHRpZiAoZnJhZ21lbnRzPy5sZW5ndGggPiAwKSB7XG5cdFx0Zm9yIChjb25zdCBmcmFnbWVudCBvZiBmcmFnbWVudHMpIHtcblx0XHRcdGZyYWdtZW50LmlubmVySFRNTCA9IFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0Ly8gS2VlcCB0aGUgZnJhZ21lbnQgcmVzdWx0IGFzIGNoaWxkIG9mIHJvb3Qgbm9kZSB3aGVuIGZyYWdtZW50IGdlbmVyYXRlcyBtdWx0aXBsZSByb290IGNvbnRyb2xzXG5cdGNvbnN0IHhtbFJlc3VsdCA9IHJlc3VsdERvYy5jaGlsZHJlbi5sZW5ndGggPiAxID8gcmVzdWx0RG9jLm91dGVySFRNTCA6IHJlc3VsdERvYy5pbm5lckhUTUw7XG5cblx0cmV0dXJuIF9yZW1vdmVDb21tZW50RnJvbVhtbCh4bWxSZXN1bHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplQ29udHJvbChjb250cm9sVG9TZXJpYWxpemU6IFVJNUVsZW1lbnQgfCBVSTVFbGVtZW50W10pIHtcblx0bGV0IHRhYkNvdW50ID0gMDtcblx0ZnVuY3Rpb24gZ2V0VGFiKHRvQWRkOiBudW1iZXIgPSAwKSB7XG5cdFx0bGV0IHRhYiA9IFwiXCI7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0YWJDb3VudCArIHRvQWRkOyBpKyspIHtcblx0XHRcdHRhYiArPSBcIlxcdFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gdGFiO1xuXHR9XG5cdGNvbnN0IHNlcmlhbGl6ZURlbGVnYXRlID0ge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbiAoY29udHJvbDogYW55LCBzQWdncmVnYXRpb25OYW1lOiBzdHJpbmcpIHtcblx0XHRcdGxldCBjb250cm9sRGV0YWlsID0gXCJcIjtcblx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lKSB7XG5cdFx0XHRcdGlmIChjb250cm9sLmdldFBhcmVudCgpKSB7XG5cdFx0XHRcdFx0Y29uc3QgaW5kZXhJblBhcmVudCA9IChjb250cm9sLmdldFBhcmVudCgpLmdldEFnZ3JlZ2F0aW9uKHNBZ2dyZWdhdGlvbk5hbWUpIGFzIE1hbmFnZWRPYmplY3RbXSk/LmluZGV4T2Y/Lihjb250cm9sKTtcblx0XHRcdFx0XHRpZiAoaW5kZXhJblBhcmVudCA+IDApIHtcblx0XHRcdFx0XHRcdGNvbnRyb2xEZXRhaWwgKz0gYCxcXG4ke2dldFRhYigpfWA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb250cm9sRGV0YWlsICs9IGAke2NvbnRyb2wuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCl9KGA7XG5cdFx0XHRyZXR1cm4gY29udHJvbERldGFpbDtcblx0XHR9LFxuXHRcdGVuZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIFwifSlcIjtcblx0XHR9LFxuXHRcdG1pZGRsZTogZnVuY3Rpb24gKGNvbnRyb2w6IGFueSkge1xuXHRcdFx0Y29uc3QgaWQgPSBjb250cm9sLmdldElkKCk7XG5cdFx0XHRsZXQgZGF0YSA9IGB7aWQ6ICR7TWFuYWdlZE9iamVjdE1ldGFkYXRhLmlzR2VuZXJhdGVkSWQoaWQpID8gXCJfX2R5bmFtaWNJZFwiIDogaWR9YDtcblx0XHRcdGZvciAoY29uc3Qgb0NvbnRyb2xLZXkgaW4gY29udHJvbC5tUHJvcGVydGllcykge1xuXHRcdFx0XHRpZiAoY29udHJvbC5tUHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShvQ29udHJvbEtleSkpIHtcblx0XHRcdFx0XHRkYXRhICs9IGAsXFxuJHtnZXRUYWIoKX0gJHtvQ29udHJvbEtleX06ICR7Y29udHJvbC5tUHJvcGVydGllc1tvQ29udHJvbEtleV19YDtcblx0XHRcdFx0fSBlbHNlIGlmIChjb250cm9sLm1CaW5kaW5nSW5mb3MuaGFzT3duUHJvcGVydHkob0NvbnRyb2xLZXkpKSB7XG5cdFx0XHRcdFx0Y29uc3QgYmluZGluZ0RldGFpbCA9IGNvbnRyb2wubUJpbmRpbmdJbmZvc1tvQ29udHJvbEtleV07XG5cdFx0XHRcdFx0ZGF0YSArPSBgLFxcbiR7Z2V0VGFiKCl9ICR7b0NvbnRyb2xLZXl9OiAke0pTT04uc3RyaW5naWZ5KGJpbmRpbmdEZXRhaWwpfWA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoY29uc3Qgb0NvbnRyb2xLZXkgaW4gY29udHJvbC5tQXNzb2NpYXRpb25zKSB7XG5cdFx0XHRcdGlmIChjb250cm9sLm1Bc3NvY2lhdGlvbnMuaGFzT3duUHJvcGVydHkob0NvbnRyb2xLZXkpKSB7XG5cdFx0XHRcdFx0ZGF0YSArPSBgLFxcbiR7Z2V0VGFiKCl9ICR7b0NvbnRyb2xLZXl9OiAke1xuXHRcdFx0XHRcdFx0KGNvbnRyb2wubUFzc29jaWF0aW9uc1tvQ29udHJvbEtleV0/LmpvaW4/LihcIixcIikgPz8gY29udHJvbC5tQXNzb2NpYXRpb25zW29Db250cm9sS2V5XSkgfHwgdW5kZWZpbmVkXG5cdFx0XHRcdFx0fWA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoY29uc3Qgb0NvbnRyb2xLZXkgaW4gY29udHJvbC5tRXZlbnRSZWdpc3RyeSkge1xuXHRcdFx0XHRpZiAoY29udHJvbC5tRXZlbnRSZWdpc3RyeS5oYXNPd25Qcm9wZXJ0eShvQ29udHJvbEtleSkpIHtcblx0XHRcdFx0XHRkYXRhICs9IGAsXFxuJHtnZXRUYWIoKX0gJHtvQ29udHJvbEtleX06IHRydWV9YDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZGF0YSArPSBgYDtcblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0sXG5cdFx0c3RhcnRBZ2dyZWdhdGlvbjogZnVuY3Rpb24gKGNvbnRyb2w6IGFueSwgc05hbWU6IHN0cmluZykge1xuXHRcdFx0bGV0IG91dCA9IGAsXFxuJHtnZXRUYWIoKX0ke3NOYW1lfWA7XG5cdFx0XHR0YWJDb3VudCsrO1xuXG5cdFx0XHRpZiAoY29udHJvbC5tQmluZGluZ0luZm9zW3NOYW1lXSkge1xuXHRcdFx0XHRvdXQgKz0gYD17IHBhdGg6JyR7Y29udHJvbC5tQmluZGluZ0luZm9zW3NOYW1lXS5wYXRofScsIHRlbXBsYXRlOlxcbiR7Z2V0VGFiKCl9YDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dCArPSBgPVtcXG4ke2dldFRhYigpfWA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3V0O1xuXHRcdH0sXG5cdFx0ZW5kQWdncmVnYXRpb246IGZ1bmN0aW9uIChjb250cm9sOiBhbnksIHNOYW1lOiBzdHJpbmcpIHtcblx0XHRcdHRhYkNvdW50LS07XG5cdFx0XHRpZiAoY29udHJvbC5tQmluZGluZ0luZm9zW3NOYW1lXSkge1xuXHRcdFx0XHRyZXR1cm4gYFxcbiR7Z2V0VGFiKCl9fWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYFxcbiR7Z2V0VGFiKCl9XWA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRpZiAoQXJyYXkuaXNBcnJheShjb250cm9sVG9TZXJpYWxpemUpKSB7XG5cdFx0cmV0dXJuIGNvbnRyb2xUb1NlcmlhbGl6ZS5tYXAoKGNvbnRyb2xUb1JlbmRlcjogVUk1RWxlbWVudCkgPT4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTZXJpYWxpemVyKGNvbnRyb2xUb1JlbmRlciwgc2VyaWFsaXplRGVsZWdhdGUpLnNlcmlhbGl6ZSgpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBuZXcgU2VyaWFsaXplcihjb250cm9sVG9TZXJpYWxpemUsIHNlcmlhbGl6ZURlbGVnYXRlKS5zZXJpYWxpemUoKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXdhaXRlcigpIHtcblx0bGV0IGZuUmVzb2x2ZSE6IEZ1bmN0aW9uO1xuXHRjb25zdCBteVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdGZuUmVzb2x2ZSA9IHJlc29sdmU7XG5cdH0pO1xuXHRyZXR1cm4geyBwcm9taXNlOiBteVByb21pc2UsIHJlc29sdmU6IGZuUmVzb2x2ZSB9O1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQXdEQTtFQUNBLE1BQU1BLFNBQVMsR0FBR0MsT0FBTyxDQUFDLGVBQWUsQ0FBQztFQUUxQ0MsR0FBRyxDQUFDQyxRQUFRLENBQUMsQ0FBQyxFQUFTLGtDQUFrQyxDQUFDO0VBQzFEQyxJQUFJLENBQUNDLFVBQVUsQ0FBQyxLQUFLLENBQUM7RUFFdEIsTUFBTUMsWUFBWSxHQUFHO0lBQ3BCQyxNQUFNLEVBQUUsZUFBZTtJQUN2QkMsS0FBSyxFQUFFLGVBQWU7SUFDdEJDLFVBQVUsRUFBRSxxQkFBcUI7SUFDakNDLFNBQVMsRUFBRSxrRUFBa0U7SUFDN0VDLEdBQUcsRUFBRSxrRUFBa0U7SUFDdkVDLFFBQVEsRUFBRSwwRUFBMEU7SUFDcEZDLE9BQU8sRUFBRSxzQkFBc0I7SUFDL0JDLFFBQVEsRUFBRSx3QkFBd0I7SUFDbENDLElBQUksRUFBRSxhQUFhO0lBQ25CQyxFQUFFLEVBQUUsV0FBVztJQUNmQyxDQUFDLEVBQUUsT0FBTztJQUNWQyxDQUFDLEVBQUUsb0JBQW9CO0lBQ3ZCQyxFQUFFLEVBQUUsV0FBVztJQUNmQyxhQUFhLEVBQUUsd0JBQXdCO0lBQ3ZDQyxHQUFHLEVBQUUsWUFBWTtJQUNqQkMsS0FBSyxFQUFFLDBCQUEwQjtJQUNqQ0MsUUFBUSxFQUFFLGtCQUFrQjtJQUM1QkMsUUFBUSxFQUFFLGtCQUFrQjtJQUM1QkMsQ0FBQyxFQUFFLGdCQUFnQjtJQUNuQkMsZUFBZSxFQUFFLDBCQUEwQjtJQUMzQ0MsVUFBVSxFQUFFLHlCQUF5QjtJQUNyQ0MsVUFBVSxFQUFFO0VBQ2IsQ0FBQztFQUNELE1BQU1DLE1BQU0sR0FBR0MsS0FBSyxDQUFDQyxhQUFhLENBQUN6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