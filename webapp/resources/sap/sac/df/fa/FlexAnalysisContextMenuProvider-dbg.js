/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define("sap/sac/df/fa/FlexAnalysisContextMenuProvider", ["sap/ui/base/Object", "sap/sac/df/firefly/library"],
  function (ObjectBase, FF) {
    "use strict";
    var TABLE_UI_CONTEXT = "Gds.Qb.Table.ContextMenu";
    var facmp = ObjectBase.extend("sap.sac.df.fa.FlexAnalysisContextMenuProvider", {

      constructor: function (flexAnalysis) {
        this.flexAnalysis = flexAnalysis;
        this.actions = {};
      },
      /* eslint-disable-next-line no-unused-vars */
      isActionVisible: function (sActionId, context) {
        return true;
      },
      /* eslint-disable-next-line no-unused-vars */
      isActionEnabled: function (sActionId, context) {
        return true;
      },
      onActionTriggered: function (sActionId, context) {
        var actionDefinition = this.actions[sActionId];
        if (actionDefinition && !actionDefinition.builtin) {
          actionDefinition.triggerAction(sActionId, this.convertContext(context));
        }
      },
      provideMenuConfig: function (context, providerListener, carrier) {
        var menuDefinition = FF.PrFactory.createStructure();
        var actionPromises = [];
        if (Object.keys(this.actions).length > 0 && context.getUiContext() === TABLE_UI_CONTEXT) {
          var extensions = menuDefinition.putNewList("MenuExtensions");
          var convertedContext = this.convertContext(context);
          var newExtension = extensions.addNewStructure();
          newExtension.putNewList("UiContext").addString(TABLE_UI_CONTEXT);
          var extensionList = newExtension.putNewList("Extension");
          var actions = this.actions;
          Object.keys(actions).forEach(function (sActionId) {
            var actionDefinition = actions[sActionId];
            var extensionDefinition = extensionList.addNewStructure();
            var extensionItems = extensionDefinition.putNewList("Items");
            var item = extensionItems.addNewStructure();
            item.putString("Action", sActionId);
            if(actionDefinition.getActionDescription){
              actionPromises.push(actionDefinition.getActionDescription(sActionId, convertedContext).then(function (actionDescription) {
                if(actionDescription.InsertAfter){
                  extensionDefinition.putString("Operation", "InsertAfter");
                  extensionDefinition.putString("Reference", actionDescription.InsertAfter);

                }
                else if(actionDescription.InsertBefore){
                  extensionDefinition.putString("Operation", "InsertBefore");
                  extensionDefinition.putString("Reference", actionDescription.InsertBefore);

                }
                else{
                  extensionDefinition.putString("Operation", "AppendInto");
                  extensionDefinition.putString("Reference", "$Root");
                }
                if(!actionDescription.builtin){
                  this.putString("Text", actionDescription.Text);
                  if (actionDescription.Icon) {
                    this.putString("Icon", actionDescription.Icon);
                  }
                }
              }.bind(item)));
            }
            else {
              extensionDefinition.putString("Operation", "AppendInto");
              extensionDefinition.putString("Reference", "$Root");
            }
            if(!actionDefinition.builtin){
              actionPromises.push(actionDefinition.isActionVisible(sActionId, convertedContext).then(function (actionVisible) {
                this.putBoolean("Visible", actionVisible);
              }.bind(item)));

              actionPromises.push(actionDefinition.isActionEnabled(sActionId, convertedContext).then(function (actionEnabled) {
                this.putBoolean("Enabled", actionEnabled);
              }.bind(item)));
            }
          });
        }
        Promise.all(actionPromises).then(function () {
          providerListener.onDynamicMenuConfigProvided(context, "flexAnalysisProvider", menuDefinition, carrier);
        });
      },
      registerAction: function (sActionId, actionDefinition) {
        this.actions[sActionId] = actionDefinition;
      },
      unregisterAction: function (sActionId) {
        delete this.actions[sActionId];
      },
      isReleaseLocked: function(){
        return true;
      },
      convertContext: function (context) {
        var model = this.flexAnalysis.getParent().getModel(this.flexAnalysis.getMultiDimModelId());
        var dataProvider = model.getDataProvider(this.flexAnalysis.getDataProvider());
        var convertedContext = {
          DataProvider: dataProvider.Name,
          Grid: {
            SelectedCells: [],
            SelectedDataCells: []
          }
        };
        var rsc = dataProvider.getQueryManager().getActiveResultSetContainer();
        var columnTuple = FF.AuGdsGenericContextResolveUtil.resolveSingleColumnTuple(context);
        var rowTuple = FF.AuGdsGenericContextResolveUtil.resolveSingleRowTuple(context);
        if (columnTuple && rowTuple) {
          var columnIndex = columnTuple.getAxisIndex() + rsc.getOffsetColumns();
          var rowIndex = rowTuple.getAxisIndex() + rsc.getOffsetRows();
          var documentId = FF.AuGdsGenericContextResolveUtil.resolveSingleDocumentId(context);
          convertedContext.Grid.SelectedDataCells.push({
            rowIndex: rowIndex,
            columnIndex: columnIndex,
            documentId: documentId
          });
        }
        var columnNumber = FF.AuGdsGenericContextResolveUtil.resolveColumn(context);
        var rowNumber = FF.AuGdsGenericContextResolveUtil.resolveRow(context);
        if( columnNumber >= 0  && rowNumber >= 0){
          convertedContext.Grid.SelectedCells.push({
            rowIndex: rowNumber,
            columnIndex: columnNumber
          });
        }
        return convertedContext;
      }
    });
    return facmp;
  }
);
