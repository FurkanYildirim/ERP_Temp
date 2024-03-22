// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(
  [
    "../Category",
    "sap/ushell/services/VisualizationInstantiation",
    "../../jsSearch"
  ],
  function (
    Category,
    VisualizationInstantiation,
    JSSearchFactory
  ) {
    "use strict";
    var Application = Category.extend(
      "sap.ushell.components.cepsearchresult.app.util.controls.categories.Application", /** @lends sap.ushell.components.cepsearchresult.app.util.controls.categories.Application.prototype */ {
      renderer: Category.getMetadata().getRenderer()
    }
    );

    var oInstanceFactory = new VisualizationInstantiation();
    var iTileActivationTime = 1200;

    Application.prototype.getViewSettings = function () {
      return {
        views: [
          {
            key: "list",
            icon: "sap-icon://text-align-justified"
          },
          {
            key: "tile",
            icon: "sap-icon://grid"
          }
        ],
        default: "tile"
      };
    };

    Application.prototype.createListItemTemplate = function () {
      var oListItem = Category.prototype.createListItemTemplate.apply(this);
      oListItem.attachModelContextChange(this.addTile.bind(this));
      return oListItem;
    };

    Application.prototype.createCardItemTemplate = function () {
      var oListItem = Category.prototype.createListItemTemplate.apply(this);
      oListItem.attachModelContextChange(this.addTile.bind(this));
      return oListItem;
    };

    Application.prototype.createTileItemTemplate = function () {
      var oListItem = new Category.CustomListItem({});
      oListItem.attachModelContextChange(this.addTile.bind(this));
      return oListItem;
    };

    Application.prototype.addTile = function (oEvent) {
      var oItem = oEvent.getSource();
      if (oItem.getBindingContext("data")) {
        var oContextData = oItem.getBindingContext("data").getObject(),
          oVizData = oContextData.visualization;
        if (!oVizData) {
          return;
        }
        if (oItem._oViz) {
          oItem._oViz.destroy();
        }
        var oViz = oInstanceFactory.instantiateVisualization(oVizData);
        oViz.addStyleClass(oVizData.displayFormatHint);
        oItem._oViz = oViz;
        if (this.getCurrentView() === "tile") {
          this.activateTile(oViz);
          oItem.destroyContent();
          oItem.addContent(oViz);
        } else {
          // render a hidden tile to trigger event in itemNavigate
          oItem.addContent(oViz.addStyleClass("hiddentile"));
        }
      }
    };

    Application.prototype.activateTile = function (oViz) {
      setTimeout(function () {
        if (sap.ushell.Container) {
          sap.ushell.Container.getServiceAsync("ReferenceResolver").then(function () {
            oViz.setActive(true, false);
          });
        }
      }, iTileActivationTime);
    };

    Application.prototype.itemNavigate = function (oEvent) {
      if (this.isLoading()) {
        return;
      }
      var oItem = oEvent.getSource();
      if (oItem.isA("sap.m.ObjectIdentifier")) {
        oItem = oItem.getParent().getParent().getParent();
      }
      // trigger a tap event on the hidden tile
      jQuery(oItem._oViz.getDomRef().querySelector("a")).trigger("tap");
    };

    Application.prototype.fetchData = function (sSearchTerm, iSkip, iTop) {
      return this.getData(sSearchTerm, iSkip, iTop);
    };

    Application.prototype.fetchCount = function (sSearchTerm, iSkip, iTop) {
      return this.getData(sSearchTerm, iSkip, iTop);
    };

    Application.prototype.getPlaceholderData = function () {
      return {
        title: new Array(10).join("\u00A0"),
        description: new Array(35).join("\u00A0"),
        keywords: "",
        icon: "sap-icon://person-placeholder",
        label: new Array(17).join("\u00A0"),
        url: ""
      };
    };
    Application.prototype.normalize = function (aApps) {
      if (!Array.isArray(aApps)) {
        aApps = [];
      }
      var aResultApps = [];
      aApps.forEach(function (oApp) {
        oApp.visualizations.forEach(function (oVis) {
          var label = oVis.title;
          if (oVis.subtitle) {
            label = label + " - " + oVis.subtitle;
          }
          aResultApps.push({
            title: (oVis.vizConfig && oVis.vizConfig["sap.app"] && oVis.vizConfig["sap.app"].title) || oVis.title || oApp.title,
            description: (oVis.vizConfig && oVis.vizConfig["sap.app"] && oVis.vizConfig["sap.app"].subTitle) || oVis.subtitle || oApp.subtitle,
            keywords: oVis.keywords ? oVis.keywords.join(" ") : "",
            icon: oVis.icon || "",
            label: label,
            visualization: oVis,
            url: oVis.targetURL
          });
        });
      });
      return aResultApps;
    };

    Application.prototype.filter = function (aResult, sSearchTerm, iSkip, iTop) {
      // eslint-disable-next-line new-cap
      this.searchEngine = new JSSearchFactory({
        objects: aResult,
        fields: ["text", "title", "keywords"],
        shouldNormalize: !String.prototype.normalize,
        algorithm: {
          id: "contains-ranked",
          options: [50, 49, 40, 39, 5, 4, 51]
        }
      });
      // format of the result is { results:[{object:{aResult[i]}}], totalCount:number}
      if (sSearchTerm) {
        //search only works with searchTerm today
        var oResult = this.searchEngine.search({
          searchFor: sSearchTerm,
          top: iTop,
          skip: iSkip
        });
        return {
          data: oResult.results.map(function (o) {
            return o.object;
          }),
          count: oResult.totalCount
        };
      }
      // no searchTerm needs to create a unified result for { results:[{object:{aResult[i]}}], totalCount:number}
      var oTargetResult = {
        data: [],
        count: aResult.length
      };
      // sort alphabetically
      aResult.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      }).splice(iSkip, iTop).forEach(function (o) {
        oTargetResult.data.push(o);
      });
      return oTargetResult;
    };

    Application.prototype.getData = function (sSearchTerm, iSkip, iTop) {
      var oResult = {
        data: [],
        totalCount: 0
      };
      // embedded in flp
      if (sap.ushell.Container && sap.ushell.Container.getServiceAsync) {
        return sap.ushell.Container.getServiceAsync("SearchableContent")
          .then(function (Service) {
            Service._changeVizType = function () {
            };
            return Service.getApps()
              .then(function (aResult) {
                aResult = this.normalize(aResult);
                return this.filter(aResult, sSearchTerm, iSkip, iTop);
              }.bind(this));
          }.bind(this));
      }
      return Promise.resolve(oResult);
    };
    return Application;
  });
