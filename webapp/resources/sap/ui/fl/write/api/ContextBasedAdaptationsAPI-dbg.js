/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/write/api/Adaptations",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/FlexInfoSession",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/model/json/JSONModel"
], function(
	Adaptations,
	FeaturesAPI,
	FlexObjectFactory,
	ManifestUtils,
	FlexObjectState,
	Layer,
	LayerUtils,
	FlexUtils,
	FlexInfoSession,
	Storage,
	Versions,
	JSONModel
) {
	"use strict";

	var _mInstances = {};

	/**
	 * Provides an API for creating and managing context-based adaptation.
	 *
	 * @namespace sap.ui.fl.write.api.ContextBasedAdaptationsAPI
	 * @experimental Since 1.106
	 * @since 1.106
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	var ContextBasedAdaptationsAPI = /** @lends sap.ui.fl.write.api.ContextBasedAdaptationsAPI */ {};

	function getFlexReferenceForControl(oControl) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		if (!sReference) {
			throw Error("The application ID could not be determined");
		}
		return sReference;
	}

	/**
	 * Processing the response to create/read/update/delete adaptations if the expected status is contained in the response object
	 * In case of a deletion the version list is reloaded because the draft might have been deleted on the backend
	 * @param {object} oResponse - Object with response data
	 * @param {number} oResponse.status - HTTP response code
	 * @param {number} nExpectedStatus - Expected HTTP response code
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.appId - Reference of the application
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {boolean} [bDelete=false] - Indicator whether the response was from a delete
	 * @returns {Promise<object>} Object with response data
	 */
	function handleResponseForVersioning(oResponse, nExpectedStatus, mPropertyBag, bDelete) {
		if (bDelete) {
			return Versions.updateModelFromBackend({
				reference: mPropertyBag.appId,
				layer: mPropertyBag.layer
			}).then(function() {
				return oResponse;
			});
		}
		Versions.onAllChangesSaved({
			reference: mPropertyBag.appId,
			layer: mPropertyBag.layer,
			contextBasedAdaptation: true
		});
		return Promise.resolve(oResponse);
	}

	/**
	 * Initializes the context-based adaptations for a given control and layer
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {Promise<sap.ui.model.json.JSONModel>} - Model of adaptations enhanced with additional properties
	 */
	ContextBasedAdaptationsAPI.initialize = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		var sReference = getFlexReferenceForControl(mPropertyBag.control);
		mPropertyBag.reference = sReference;
		var sLayer = mPropertyBag.layer;
		if (_mInstances && _mInstances[sReference] && _mInstances[sReference][sLayer]) {
			return Promise.resolve(_mInstances[sReference][sLayer]);
		}
		var bContextBasedAdaptationsEnabled;
		return FeaturesAPI.isContextBasedAdaptationAvailable(sLayer)
			.then(function(bContextBasedAdaptationsEnabledResponse) {
				bContextBasedAdaptationsEnabled = bContextBasedAdaptationsEnabledResponse;
				var oAdaptationsPromise = bContextBasedAdaptationsEnabled ? ContextBasedAdaptationsAPI.load(mPropertyBag) : Promise.resolve({adaptations: []});
				return oAdaptationsPromise;
			})
			.then(function(oAdaptations) {
				// Determine displayed adaptation
				// Flex Info Session returns currently shown one based on Flex Data response
				// If no longer available switch to highest ranked one
				var oFlexInfoSession = FlexInfoSession.get(mPropertyBag.control) || {};
				var oDisplayedAdaptation = oAdaptations.adaptations[0];
				if (oFlexInfoSession.adaptationId) {
					oDisplayedAdaptation = oAdaptations.adaptations.find(function(oAdaptation) {
						return oAdaptation.id === oFlexInfoSession.adaptationId;
					}) || oDisplayedAdaptation;
				}

				return ContextBasedAdaptationsAPI.createModel(oAdaptations.adaptations, oDisplayedAdaptation, bContextBasedAdaptationsEnabled);
			})
			.then(function(oModel) {
				_mInstances[sReference] = _mInstances[sReference] || {};
				_mInstances[sReference][sLayer] = _mInstances[sReference][sLayer] || {};
				_mInstances[sReference][sLayer] = oModel;
				return _mInstances[sReference][sLayer];
			});
	};

	/**
	 * Initializes and creates an new adaptation Model
	 * @param {object[]} aAdaptations - List of adaptations from backend
	 * @param {object} oDisplayedAdaptation - Adaptation to be set as displayedAdaptation
	 * @param {boolean} bContextBasedAdaptationsEnabled - Whether the feature is enabled
	 * @returns {sap.ui.model.json.JSONModel} - Model of adaptations enhanced with additional properties
	 */
	ContextBasedAdaptationsAPI.createModel = function(aAdaptations, oDisplayedAdaptation, bContextBasedAdaptationsEnabled) {
		if (!Array.isArray(aAdaptations)) {
			throw Error("Adaptations model can only be initialized with an array of adaptations");
		}
		if (bContextBasedAdaptationsEnabled && !oDisplayedAdaptation) {
			throw Error("Invalid call, must pass displayed adaptation");
		}
		if (!bContextBasedAdaptationsEnabled && aAdaptations.length) {
			throw Error("Invalid call, must not pass adaptations if feature is disabled");
		}

		// TODO Extract class
		var oModel = new JSONModel({
			allAdaptations: [],
			adaptations: [],
			count: 0,
			displayedAdaptation: {},
			contextBasedAdaptationsEnabled: bContextBasedAdaptationsEnabled
		});
		oModel.updateAdaptations = function(aAdaptations) {
			var aContextBasedAdaptations = aAdaptations.filter(function(oAdapation, iIndex) {
				oAdapation.rank = iIndex + 1; // initialize ranks
				return oAdapation.type !== Adaptations.Type.Default;
			});
			oModel.setProperty("/adaptations", aContextBasedAdaptations);
			oModel.setProperty("/allAdaptations", aAdaptations);
			oModel.setProperty("/count", aContextBasedAdaptations.length);
			oModel.updateBindings(true);
		};
		oModel.insertAdaptation = function(oNewAdaptation) {
			var aAdaptations = oModel.getProperty("/allAdaptations");
			aAdaptations.splice(oNewAdaptation.priority, 0, oNewAdaptation);
			delete oNewAdaptation.priority;
			oModel.updateAdaptations(aAdaptations);
		};
		oModel.deleteAdaptation = function() {
			var iIndex = oModel.getProperty("/displayedAdaptation").rank - 1;
			var aAdaptations = oModel.getProperty("/adaptations");
			var iModelCount = oModel.getProperty("/count");
			var sToBeDisplayedAdaptationId;
			if (iModelCount > 1) {
				sToBeDisplayedAdaptationId = aAdaptations[iIndex + ((iIndex === iModelCount - 1) ? -1 : 1)].id;
			}
			aAdaptations.splice(iIndex, 1);
			var oDefaultAdaptation = oModel.getProperty("/allAdaptations").pop();
			aAdaptations.push(oDefaultAdaptation);
			oModel.updateAdaptations(aAdaptations);
			return sToBeDisplayedAdaptationId;
		};
		oModel.switchDisplayedAdaptation = function(sAdaptationId) {
			var iIndex = oModel.getIndexByAdaptationId(sAdaptationId);
			var oNewDisplayedAdaptation = iIndex ? oModel.getProperty("/allAdaptations")[iIndex] : oModel.getProperty("/allAdaptations")[0];
			oModel.setProperty("/displayedAdaptation", oNewDisplayedAdaptation);
			oModel.updateBindings(true);
		};
		oModel.updateAdaptationContent = function(oContextBasedAdaptation) {
			var aAdaptations = oModel.getProperty("/allAdaptations");
			var iIndex = oModel.getProperty("/displayedAdaptation").rank - 1;
			aAdaptations[iIndex].title = oContextBasedAdaptation.title;
			aAdaptations[iIndex].contexts = oContextBasedAdaptation.contexts;
			if (iIndex !== oContextBasedAdaptation.priority) {
				var aDisplayedAdaptation = aAdaptations.splice(iIndex, 1);
				aAdaptations.splice(oContextBasedAdaptation.priority, 0, aDisplayedAdaptation[0]);
			}
			oModel.updateAdaptations(aAdaptations);
		};
		oModel.getIndexByAdaptationId = function(sAdaptationId) {
			var aAdaptations = oModel.getProperty("/allAdaptations");
			var iAdaptationIndex = aAdaptations.findIndex(function(oAdaptation) {
				return oAdaptation.id === sAdaptationId;
			});
			return (iAdaptationIndex > -1) ? iAdaptationIndex : undefined;
		};
		if (aAdaptations.length > 0) {
			oModel.updateAdaptations(aAdaptations);
			oModel.setProperty("/displayedAdaptation", oDisplayedAdaptation);
		}
		return oModel;
	};

	/**
	 * Returns adaptations model given reference id and layer.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {sap.ui.model.json.JSONModel} - Model of adaptations enhanced with additional properties
	 */
	ContextBasedAdaptationsAPI.getAdaptationsModel = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			throw Error("No layer was provided");
		}
		if (!mPropertyBag.control) {
			throw Error("No control was provided");
		}
		mPropertyBag.reference = getFlexReferenceForControl(mPropertyBag.control);
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		if (!ContextBasedAdaptationsAPI.hasAdaptationsModel(mPropertyBag)) {
			throw Error("Adaptations model for reference '" + sReference + "' and layer '" + sLayer + "' were not initialized.");
		}
		return _mInstances[sReference][sLayer];
	};

	/**
	 * Returns displayed adaptation id given layer and control for setting the adaptationId in changes etc.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {string} - Displayed adaptation id, undefined for DEFAULT adaptation
	 */
	ContextBasedAdaptationsAPI.getDisplayedAdaptationId = function(mPropertyBag) {
		var adaptationId = this.getAdaptationsModel(mPropertyBag).getProperty("/displayedAdaptation/id");
		return adaptationId !== Adaptations.Type.Default ? adaptationId : undefined;
	};

	/**
	 * Checks if adaptations model for a given reference and layer exists.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {boolean} checks if an adaptation model exists for this reference and layer
	 */
	ContextBasedAdaptationsAPI.hasAdaptationsModel = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		return _mInstances[sReference] && _mInstances[sReference][sLayer];
	};

	/**
	 * Checks if an adaptation for a given reference and layer exists.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {boolean} checks if at least one adaptation exists for this reference and layer
	 */
	ContextBasedAdaptationsAPI.adaptationExists = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		return this.hasAdaptationsModel({reference: sReference, layer: sLayer}) && _mInstances[sReference][sLayer].getProperty("/count") > 0;
	};

	ContextBasedAdaptationsAPI.clearInstances = function() {
		_mInstances = {};
	};

	/**
	 * Discards the model, initializes it again and returns the displayed adaptation.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {string} Displayed adaptation id of the refreshed model
	 */
	ContextBasedAdaptationsAPI.refreshAdaptationModel = function(mPropertyBag) {
		this.clearInstances();
		return this.initialize(mPropertyBag)
		.then(function(oModel) {
			return oModel.getProperty("/displayedAdaptation/id");
		});
	};

	function getNewVariantId(mFileNames, sOldVariantId) {
		return mFileNames.get(sOldVariantId) || sOldVariantId;
	}
	/*
	 * Copies copy variants
	 * @param {array} aVariants - Variants to be copied
	 * @param {array} aCopiedFlexObjects - Contains copied flex objects
	 * @param {Map} mFileNames - Mapping from old variants id to new variants id for changes
	 * @param {string} sContextBasedAdaptationId - Context-based adaptation id
	 */
	function copyVariants(aVariants, aCopiedFlexObjects, mFileNames, sContextBasedAdaptationId) {
		aVariants.forEach(function(oChange) {
			// copy of CompVariant and FLVariant variants
			var oCopiedVariant = FlexObjectFactory.createFromFileContent(oChange.cloneFileContentWithNewId());
			var sFileName = oCopiedVariant.getId();
			oCopiedVariant.setAdaptationId(sContextBasedAdaptationId);
			aCopiedFlexObjects.push(oCopiedVariant);
			mFileNames.set(oChange.getId(), sFileName);
		});
	}

	/**
	 * Copies changes
	 * @param {array} aChanges - To be copied changes
	 * @param {array} aCopiedFlexObjects - Contains copied flex object
	 * @param {Map} mFileNames - Mapping from variants id to new variants id
	 * @param {string} sContextBasedAdaptationId - Context-based adaptation id
	 */
	function copyChanges(aChanges, aCopiedFlexObjects, mFileNames, sContextBasedAdaptationId) {
		aChanges.forEach(function(oChange) {
			var sFileName = FlexUtils.createDefaultFileName(oChange.getId().split("_").pop());
			var oCopiedChange = FlexObjectFactory.createFromFileContent(oChange.cloneFileContentWithNewId(sFileName));
			if (oChange.getFileType() === "change") {
				if (oChange.getSelector().variantId) {
					// selector of a change links to a CompVariant
					oCopiedChange.getSelector().variantId = getNewVariantId(mFileNames, oCopiedChange.getSelector().variantId);
				} else if (oChange.getContent().defaultVariantName) {
					// change references to a defaultVariant
					oCopiedChange.getContent().defaultVariantName = getNewVariantId(mFileNames, oCopiedChange.getContent().defaultVariantName);
				}
				// references to a FLVariant (variant dependent change)
				if (oChange.getVariantReference()) {
					oCopiedChange.setVariantReference(getNewVariantId(mFileNames, oCopiedChange.getVariantReference()));
				}
			} else if (oChange.getFileType() === "ctrl_variant_change" && oChange.getSelector().id) {
				oCopiedChange.getSelector().id = getNewVariantId(mFileNames, oCopiedChange.getSelector().id);
			} else if (oChange.getFileType() === "ctrl_variant_management_change" && oChange.getContent().defaultVariant) {
				oCopiedChange.getContent().defaultVariant = getNewVariantId(mFileNames, oCopiedChange.getContent().defaultVariant);
			}
			oCopiedChange.setAdaptationId(sContextBasedAdaptationId);
			aCopiedFlexObjects.push(oCopiedChange);
		});
	}

	/**
	 * Copies existing changes
	 * @param {array} aFlexObjects - Contains a list of flex object changes and variants
	 * @param {string} sContextBasedAdaptationId - ID of to be created adaptation id
	 * @returns {array} Returns a list of copied changes and variant as JSON object
	 */
	function copyVariantsAndChanges(aFlexObjects, sContextBasedAdaptationId) {
		var aCopiedFlexObjects = [];
		var aVariants = [];
		var aChanges = [];
		var mFileNames = new Map();
		aFlexObjects.forEach(function(oFlexObject) {
			if (oFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.Variant")) {
				aVariants.push(oFlexObject);
			} else {
				aChanges.push(oFlexObject);
			}
		});
		copyVariants(aVariants, aCopiedFlexObjects, mFileNames, sContextBasedAdaptationId);
		copyChanges(aChanges, aCopiedFlexObjects, mFileNames, sContextBasedAdaptationId);
		return aCopiedFlexObjects.map(function(oFlexObject) {
			return oFlexObject.convertToFileContent();
		});
	}

	/**
	 * Get the parent version
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.appId - Reference app ID
	 * @param {string} mPropertyBag.layer - Layer
	  * @returns {string} Returns the currently displayed version id
	 */
	function getParentVersion(mPropertyBag) {
		return Versions.getVersionsModel({ layer: mPropertyBag.layer, reference: mPropertyBag.appId }).getProperty("/persistedVersion");
	}

	/**
	 * Create new context-based adaptation and saves it in the backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.contextBasedAdaptation - Parameters for new adaptation
	 * @param {string} mPropertyBag.contextBasedAdaptation.title - Title of the new adaptation
	 * @param {object} mPropertyBag.contextBasedAdaptation.contexts - Contexts of the new adaptation, for example roles for which the adaptation is created
	 * @param {object} mPropertyBag.contextBasedAdaptation.priority - Priority of the new adaptation
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 */
	ContextBasedAdaptationsAPI.create = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.contextBasedAdaptation) {
			return Promise.reject("No contextBasedAdaptation was provided");
		}
		mPropertyBag.contextBasedAdaptation.id = FlexUtils.createDefaultFileName();
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);

		return Storage.contextBasedAdaptation.create({
			layer: mPropertyBag.layer,
			flexObject: mPropertyBag.contextBasedAdaptation,
			appId: mPropertyBag.appId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			var oModel = this.getAdaptationsModel(mPropertyBag);
			oModel.insertAdaptation(mPropertyBag.contextBasedAdaptation);
			return handleResponseForVersioning(oResponse, 201, mPropertyBag);
		}.bind(this)).then(function() {
			return FlexObjectState.getFlexObjects({ selector: mPropertyBag.control, invalidateCache: false, includeCtrlVariants: true, includeDirtyChanges: true, currentLayer: Layer.CUSTOMER });
		}).then(function(aFlexObjects) {
			//currently getFlexObjects contains also VENDOR layer ctrl variant changes which need to be removed before copy
			//TODO refactor when FlexObjectState.getFlexObjects will be refactored
			var aCustomerFlexObjects = LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(aFlexObjects, Layer.CUSTOMER);
			var aCopiedChanges = copyVariantsAndChanges(aCustomerFlexObjects, mPropertyBag.contextBasedAdaptation.id);
			return Storage.contextBasedAdaptation.writeChange({
				layer: mPropertyBag.layer,
				flexObjects: aCopiedChanges,
				transport: "",
				isLegacyVariant: false,
				parentVersion: getParentVersion(mPropertyBag)
			});
		});
	};

	/**
	 * Updates existing context-based adaptation and saves it in the backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.contextBasedAdaptation - Parameters
	 * @param {string} mPropertyBag.contextBasedAdaptation.title - Title of the updated adaptation
	 * @param {object} mPropertyBag.contextBasedAdaptation.contexts - Contexts of the updated adaptation, for example roles for which the adaptation is created
	 * @param {object} mPropertyBag.contextBasedAdaptation.priority - Priority of the updated adaptation
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 */
	ContextBasedAdaptationsAPI.update = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.contextBasedAdaptation) {
			return Promise.reject("No contextBasedAdaptation was provided");
		}
		if (!mPropertyBag.adaptationId) {
			return Promise.reject("No adaptationId was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.update({
			layer: mPropertyBag.layer,
			flexObject: mPropertyBag.contextBasedAdaptation,
			appId: mPropertyBag.appId,
			adaptationId: mPropertyBag.adaptationId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			return handleResponseForVersioning(oResponse, 200, mPropertyBag);
		});
	};

	/**
	 * Reorder context-based adaptations based on their priorities
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.parameters - Parameters
	 * @param {string[]} mPropertyBag.parameters.priorities - Priority list
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 */
	ContextBasedAdaptationsAPI.reorder = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.parameters || !mPropertyBag.parameters.priorities) {
			return Promise.reject("No valid priority list was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.reorder({
			layer: mPropertyBag.layer,
			flexObjects: mPropertyBag.parameters,
			appId: mPropertyBag.appId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			return handleResponseForVersioning(oResponse, 204, mPropertyBag);
		});
	};

	/**
	 * Load list of context-based adapations with priority
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {Promise<object>} Promise that resolves with the list of context-based adaptations
	 */
	ContextBasedAdaptationsAPI.load = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.load({
			layer: mPropertyBag.layer,
			appId: mPropertyBag.appId,
			version: getParentVersion(mPropertyBag)
		}).then(function(oAdaptations) {
			if (!oAdaptations) {
				oAdaptations = { adaptations: [] };
			}
			return oAdaptations;
		});
	};

	/**
	 * Deletes existing context-based adaptation
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {string} mPropertyBag.appId - Reference of the application
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 */
	ContextBasedAdaptationsAPI.remove = function (mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.adaptationId) {
			return Promise.reject("No adaptationId was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.remove({
			layer: mPropertyBag.layer,
			appId: mPropertyBag.appId,
			adaptationId: mPropertyBag.adaptationId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			return handleResponseForVersioning(oResponse, 204, mPropertyBag, true);
		});
	};

	return ContextBasedAdaptationsAPI;
});