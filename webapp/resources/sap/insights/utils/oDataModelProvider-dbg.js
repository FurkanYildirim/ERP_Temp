/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(
  [
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/v4/ODataModel",
    "./AppConstants"
  ],
  function (
    ODataModelV2,
    ODataModelV4,
    AppConstants
  ) {
    var oDataModel = {};

    function _createCardOdataModel(oCardDataSource) {
      var oFilterService = oCardDataSource.filterService;
      var uri = oFilterService && oFilterService.uri;
      var oTempSettings = oFilterService && oFilterService.settings;
      var annotations = [];
      if (oTempSettings) {
        oTempSettings.annotations.forEach(function (annotationName) {
          var annotation = oCardDataSource[annotationName];
          var annotationURI = annotation.uri;
          annotations.push(annotationURI);
        });
        if (oTempSettings.odataVersion === AppConstants.ODATA_VERSION_2) {
          return new ODataModelV2(uri, {
            annotationURI: annotations,
            loadAnnotationsJoined: true
          });
        }
      }
    }

    function createOdataModelsforCard(oCardDataSource) {
      var index = oCardDataSource.filterService.uri;
      var oTempModel = _createCardOdataModel(oCardDataSource);
      oDataModel[index] = {
        oData: oTempModel,
        loaded: undefined
      };

      return new Promise(function (resolve) {
        if (oTempModel) {
          oTempModel.attachMetadataLoaded(function (oEvent) {
            return oEvent.getSource().getMetaModel().loaded().then(function () {
              oDataModel[index].loaded = true;
              resolve(oDataModel[index]);
            });
          });
          oTempModel.attachMetadataFailed(function () {
            oDataModel[index].loaded = false;
            resolve(oDataModel[index]);
          });
        } else {
          resolve(oDataModel[index]);
        }
      });
    }

    function _createCardOdataModelV4(oCardDataSource) {
      var oFilterService = oCardDataSource.filterService;
      var uri = oFilterService && oFilterService.uri;
      var oTempSettings = oFilterService && oFilterService.settings;
      var annotations = [];
      if (oTempSettings) {
        oTempSettings.annotations.forEach(function (annotationName) {
          var annotation = oCardDataSource[annotationName];
          var annotationURI = annotation.uri;
          annotations.push(annotationURI);
        });
        if (oTempSettings.odataVersion === AppConstants.ODATA_VERSION_4) {
          return new ODataModelV4({
            serviceUrl: uri
          });
        }
      }
    }

    function createOdataV4ModelsforCard(oDataSource) {
      var sURI = oDataSource.filterService.uri,
          oModel = _createCardOdataModelV4(oDataSource);

      oDataModel[sURI] = {
        oData: oModel
      };

      return new Promise(function (resolve) {
        oModel.getMetaModel().requestData()
          .then(function () {
            oDataModel[sURI].loaded = true;
          })
          .catch(function () {
            oDataModel[sURI].loaded = false;
          })
          .finally(function () {
            resolve(oDataModel[sURI]);
          });
      });
    }

    function getOdataModel(oCardDataSource) {
      if (oCardDataSource.filterService && oCardDataSource.filterService.uri) {
        var oFilterService = oCardDataSource.filterService,
        index = oCardDataSource.filterService.uri;
        if (oDataModel[index]) {
          return Promise.resolve(oDataModel[index]);
        } else if (oFilterService.settings && oFilterService.settings.odataVersion === AppConstants.ODATA_VERSION_2) {
          return createOdataModelsforCard(oCardDataSource);
        } else if (oFilterService.settings && oFilterService.settings.odataVersion === AppConstants.ODATA_VERSION_4) {
          return createOdataV4ModelsforCard(oCardDataSource);
        }
      } else {
        return Promise.resolve(undefined);
      }

    }

    return {
      getOdataModel: getOdataModel
    };
  });
