/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/ui/core/Core", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/VersionInfo", "../converters/MetaModelConverter"], function (CollaborationHelper, Core, Service, ServiceFactory, VersionInfo, MetaModelConverter) {
  "use strict";

  var _exports = {};
  var DefaultEnvironmentCapabilities = MetaModelConverter.DefaultEnvironmentCapabilities;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let EnvironmentCapabilitiesService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(EnvironmentCapabilitiesService, _Service);
    function EnvironmentCapabilitiesService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.EnvironmentCapabilitiesService = EnvironmentCapabilitiesService;
    var _proto = EnvironmentCapabilitiesService.prototype;
    // !: means that we know it will be assigned before usage
    _proto.init = function init() {
      this.initPromise = new Promise((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
      });
      const oContext = this.getContext();
      this.environmentCapabilities = Object.assign({}, DefaultEnvironmentCapabilities);
      VersionInfo.load().then(async versionInfo => {
        this.environmentCapabilities.Chart = !!versionInfo.libraries.find(lib => lib.name === "sap.viz");
        this.environmentCapabilities.MicroChart = !!versionInfo.libraries.find(lib => lib.name === "sap.suite.ui.microchart");
        this.environmentCapabilities.UShell = !!(sap && sap.ushell && sap.ushell.Container);
        this.environmentCapabilities.IntentBasedNavigation = !!(sap && sap.ushell && sap.ushell.Container);
        this.environmentCapabilities.InsightsSupported = !!versionInfo.libraries.find(lib => lib.name === "sap.insights") && (await getInsightsEnabled());
        this.environmentCapabilities = Object.assign(this.environmentCapabilities, oContext.settings);
        this.resolveFn(this);
        return null;
      }).catch(this.rejectFn);
    };
    EnvironmentCapabilitiesService.resolveLibrary = async function resolveLibrary(libraryName) {
      return new Promise(function (resolve) {
        try {
          Core.loadLibrary(`${libraryName.replace(/\./g, "/")}`, {
            async: true
          }).then(function () {
            resolve(true);
          }).catch(function () {
            resolve(false);
          });
        } catch (e) {
          resolve(false);
        }
      });
    };
    _proto.setCapabilities = function setCapabilities(oCapabilities) {
      this.environmentCapabilities = oCapabilities;
    };
    _proto.setCapability = function setCapability(capability, value) {
      this.environmentCapabilities[capability] = value;
    };
    _proto.getCapabilities = function getCapabilities() {
      return this.environmentCapabilities;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return EnvironmentCapabilitiesService;
  }(Service);
  _exports.EnvironmentCapabilitiesService = EnvironmentCapabilitiesService;
  let EnvironmentServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(EnvironmentServiceFactory, _ServiceFactory);
    function EnvironmentServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    _exports.EnvironmentServiceFactory = EnvironmentServiceFactory;
    var _proto2 = EnvironmentServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const environmentCapabilitiesService = new EnvironmentCapabilitiesService(oServiceContext);
      return environmentCapabilitiesService.initPromise;
    };
    return EnvironmentServiceFactory;
  }(ServiceFactory);
  /**
   * Checks if insights are enabled on the home page.
   *
   * @returns True if insights are enabled on the home page.
   */
  _exports.EnvironmentServiceFactory = EnvironmentServiceFactory;
  async function getInsightsEnabled() {
    // insights is enabled
    return new Promise(async resolve => {
      try {
        // getServiceAsync from suite/insights checks to see if myHome is configured with insights and returns a cardHelperInstance if so.
        const isLibAvailable = await EnvironmentCapabilitiesService.resolveLibrary("sap.insights");
        if (isLibAvailable) {
          sap.ui.require(["sap/insights/CardHelper"], async CardHelper => {
            try {
              await CardHelper.getServiceAsync("UIService");
              resolve(!(await getMSTeamsActive()));
            } catch {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Checks if the application is opened on Microsoft Teams.
   *
   * @returns True if the application is opened on Microsoft Teams.
   */
  _exports.getInsightsEnabled = getInsightsEnabled;
  async function getMSTeamsActive() {
    let isTeamsModeActive = false;
    try {
      isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
    } catch {
      return false;
    }
    return isTeamsModeActive;
  }
  _exports.getMSTeamsActive = getMSTeamsActive;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2UiLCJpbml0IiwiaW5pdFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJlc29sdmVGbiIsInJlamVjdEZuIiwib0NvbnRleHQiLCJnZXRDb250ZXh0IiwiZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJEZWZhdWx0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMiLCJWZXJzaW9uSW5mbyIsImxvYWQiLCJ0aGVuIiwidmVyc2lvbkluZm8iLCJDaGFydCIsImxpYnJhcmllcyIsImZpbmQiLCJsaWIiLCJuYW1lIiwiTWljcm9DaGFydCIsIlVTaGVsbCIsInNhcCIsInVzaGVsbCIsIkNvbnRhaW5lciIsIkludGVudEJhc2VkTmF2aWdhdGlvbiIsIkluc2lnaHRzU3VwcG9ydGVkIiwiZ2V0SW5zaWdodHNFbmFibGVkIiwic2V0dGluZ3MiLCJjYXRjaCIsInJlc29sdmVMaWJyYXJ5IiwibGlicmFyeU5hbWUiLCJDb3JlIiwibG9hZExpYnJhcnkiLCJyZXBsYWNlIiwiYXN5bmMiLCJlIiwic2V0Q2FwYWJpbGl0aWVzIiwib0NhcGFiaWxpdGllcyIsInNldENhcGFiaWxpdHkiLCJjYXBhYmlsaXR5IiwidmFsdWUiLCJnZXRDYXBhYmlsaXRpZXMiLCJnZXRJbnRlcmZhY2UiLCJTZXJ2aWNlIiwiRW52aXJvbm1lbnRTZXJ2aWNlRmFjdG9yeSIsImNyZWF0ZUluc3RhbmNlIiwib1NlcnZpY2VDb250ZXh0IiwiZW52aXJvbm1lbnRDYXBhYmlsaXRpZXNTZXJ2aWNlIiwiU2VydmljZUZhY3RvcnkiLCJpc0xpYkF2YWlsYWJsZSIsInVpIiwicmVxdWlyZSIsIkNhcmRIZWxwZXIiLCJnZXRTZXJ2aWNlQXN5bmMiLCJnZXRNU1RlYW1zQWN0aXZlIiwiaXNUZWFtc01vZGVBY3RpdmUiLCJDb2xsYWJvcmF0aW9uSGVscGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFbnZpcm9ubWVudFNlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb2xsYWJvcmF0aW9uSGVscGVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25IZWxwZXJcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgU2VydmljZSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlXCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBWZXJzaW9uSW5mbyBmcm9tIFwic2FwL3VpL1ZlcnNpb25JbmZvXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBFbnZpcm9ubWVudENhcGFiaWxpdGllcyB9IGZyb20gXCIuLi9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgRGVmYXVsdEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIH0gZnJvbSBcIi4uL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5cbmV4cG9ydCBjbGFzcyBFbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2UgZXh0ZW5kcyBTZXJ2aWNlPEVudmlyb25tZW50Q2FwYWJpbGl0aWVzPiB7XG5cdHJlc29sdmVGbjogYW55O1xuXG5cdHJlamVjdEZuOiBhbnk7XG5cblx0aW5pdFByb21pc2UhOiBQcm9taXNlPGFueT47XG5cblx0ZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMhOiBFbnZpcm9ubWVudENhcGFiaWxpdGllcztcblx0Ly8gITogbWVhbnMgdGhhdCB3ZSBrbm93IGl0IHdpbGwgYmUgYXNzaWduZWQgYmVmb3JlIHVzYWdlXG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLmluaXRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0dGhpcy5yZXNvbHZlRm4gPSByZXNvbHZlO1xuXHRcdFx0dGhpcy5yZWplY3RGbiA9IHJlamVjdDtcblx0XHR9KTtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdHRoaXMuZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBEZWZhdWx0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMpO1xuXHRcdFZlcnNpb25JbmZvLmxvYWQoKVxuXHRcdFx0LnRoZW4oYXN5bmMgKHZlcnNpb25JbmZvKTogUHJvbWlzZTxudWxsPiA9PiB7XG5cdFx0XHRcdHRoaXMuZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMuQ2hhcnQgPSAhIXZlcnNpb25JbmZvLmxpYnJhcmllcy5maW5kKChsaWIpOiBib29sZWFuID0+IGxpYi5uYW1lID09PSBcInNhcC52aXpcIik7XG5cdFx0XHRcdHRoaXMuZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMuTWljcm9DaGFydCA9ICEhdmVyc2lvbkluZm8ubGlicmFyaWVzLmZpbmQoXG5cdFx0XHRcdFx0KGxpYik6IGJvb2xlYW4gPT4gbGliLm5hbWUgPT09IFwic2FwLnN1aXRlLnVpLm1pY3JvY2hhcnRcIlxuXHRcdFx0XHQpO1xuXHRcdFx0XHR0aGlzLmVudmlyb25tZW50Q2FwYWJpbGl0aWVzLlVTaGVsbCA9ICEhKHNhcCAmJiBzYXAudXNoZWxsICYmIHNhcC51c2hlbGwuQ29udGFpbmVyKTtcblx0XHRcdFx0dGhpcy5lbnZpcm9ubWVudENhcGFiaWxpdGllcy5JbnRlbnRCYXNlZE5hdmlnYXRpb24gPSAhIShzYXAgJiYgc2FwLnVzaGVsbCAmJiBzYXAudXNoZWxsLkNvbnRhaW5lcik7XG5cdFx0XHRcdHRoaXMuZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMuSW5zaWdodHNTdXBwb3J0ZWQgPVxuXHRcdFx0XHRcdCEhdmVyc2lvbkluZm8ubGlicmFyaWVzLmZpbmQoKGxpYik6IGJvb2xlYW4gPT4gbGliLm5hbWUgPT09IFwic2FwLmluc2lnaHRzXCIpICYmIChhd2FpdCBnZXRJbnNpZ2h0c0VuYWJsZWQoKSk7XG5cdFx0XHRcdHRoaXMuZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSBPYmplY3QuYXNzaWduKHRoaXMuZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMsIG9Db250ZXh0LnNldHRpbmdzKTtcblx0XHRcdFx0dGhpcy5yZXNvbHZlRm4odGhpcyk7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCh0aGlzLnJlamVjdEZuKTtcblx0fVxuXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlTGlicmFyeShsaWJyYXJ5TmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRDb3JlLmxvYWRMaWJyYXJ5KGAke2xpYnJhcnlOYW1lLnJlcGxhY2UoL1xcLi9nLCBcIi9cIil9YCwgeyBhc3luYzogdHJ1ZSB9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdHJlc29sdmUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHVibGljIHNldENhcGFiaWxpdGllcyhvQ2FwYWJpbGl0aWVzOiBFbnZpcm9ubWVudENhcGFiaWxpdGllcykge1xuXHRcdHRoaXMuZW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSBvQ2FwYWJpbGl0aWVzO1xuXHR9XG5cblx0cHVibGljIHNldENhcGFiaWxpdHkoY2FwYWJpbGl0eToga2V5b2YgRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMsIHZhbHVlOiBib29sZWFuKSB7XG5cdFx0dGhpcy5lbnZpcm9ubWVudENhcGFiaWxpdGllc1tjYXBhYmlsaXR5XSA9IHZhbHVlO1xuXHR9XG5cblx0cHVibGljIGdldENhcGFiaWxpdGllcygpIHtcblx0XHRyZXR1cm4gdGhpcy5lbnZpcm9ubWVudENhcGFiaWxpdGllcztcblx0fVxuXG5cdGdldEludGVyZmFjZSgpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBFbnZpcm9ubWVudFNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8RW52aXJvbm1lbnRDYXBhYmlsaXRpZXM+IHtcblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxFbnZpcm9ubWVudENhcGFiaWxpdGllcz4pIHtcblx0XHRjb25zdCBlbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2UgPSBuZXcgRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNTZXJ2aWNlKG9TZXJ2aWNlQ29udGV4dCk7XG5cdFx0cmV0dXJuIGVudmlyb25tZW50Q2FwYWJpbGl0aWVzU2VydmljZS5pbml0UHJvbWlzZTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiBpbnNpZ2h0cyBhcmUgZW5hYmxlZCBvbiB0aGUgaG9tZSBwYWdlLlxuICpcbiAqIEByZXR1cm5zIFRydWUgaWYgaW5zaWdodHMgYXJlIGVuYWJsZWQgb24gdGhlIGhvbWUgcGFnZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluc2lnaHRzRW5hYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0Ly8gaW5zaWdodHMgaXMgZW5hYmxlZFxuXHRyZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gZ2V0U2VydmljZUFzeW5jIGZyb20gc3VpdGUvaW5zaWdodHMgY2hlY2tzIHRvIHNlZSBpZiBteUhvbWUgaXMgY29uZmlndXJlZCB3aXRoIGluc2lnaHRzIGFuZCByZXR1cm5zIGEgY2FyZEhlbHBlckluc3RhbmNlIGlmIHNvLlxuXHRcdFx0Y29uc3QgaXNMaWJBdmFpbGFibGUgPSBhd2FpdCBFbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2UucmVzb2x2ZUxpYnJhcnkoXCJzYXAuaW5zaWdodHNcIik7XG5cdFx0XHRpZiAoaXNMaWJBdmFpbGFibGUpIHtcblx0XHRcdFx0c2FwLnVpLnJlcXVpcmUoW1wic2FwL2luc2lnaHRzL0NhcmRIZWxwZXJcIl0sIGFzeW5jIChDYXJkSGVscGVyOiB7IGdldFNlcnZpY2VBc3luYzogRnVuY3Rpb24gfSkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBDYXJkSGVscGVyLmdldFNlcnZpY2VBc3luYyhcIlVJU2VydmljZVwiKTtcblx0XHRcdFx0XHRcdHJlc29sdmUoIShhd2FpdCBnZXRNU1RlYW1zQWN0aXZlKCkpKTtcblx0XHRcdFx0XHR9IGNhdGNoIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoZmFsc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXNvbHZlKGZhbHNlKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIHtcblx0XHRcdHJlc29sdmUoZmFsc2UpO1xuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBvcGVuZWQgb24gTWljcm9zb2Z0IFRlYW1zLlxuICpcbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGlzIG9wZW5lZCBvbiBNaWNyb3NvZnQgVGVhbXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNU1RlYW1zQWN0aXZlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRsZXQgaXNUZWFtc01vZGVBY3RpdmUgPSBmYWxzZTtcblx0dHJ5IHtcblx0XHRpc1RlYW1zTW9kZUFjdGl2ZSA9IGF3YWl0IENvbGxhYm9yYXRpb25IZWxwZXIuaXNUZWFtc01vZGVBY3RpdmUoKTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiBpc1RlYW1zTW9kZUFjdGl2ZTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7TUFTYUEsOEJBQThCO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBUTFDO0lBQUEsT0FFQUMsSUFBSSxHQUFKLGdCQUFPO01BQ04sSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSUMsT0FBTyxDQUFDLENBQUNDLE9BQU8sRUFBRUMsTUFBTSxLQUFLO1FBQ25ELElBQUksQ0FBQ0MsU0FBUyxHQUFHRixPQUFPO1FBQ3hCLElBQUksQ0FBQ0csUUFBUSxHQUFHRixNQUFNO01BQ3ZCLENBQUMsQ0FBQztNQUNGLE1BQU1HLFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsRUFBRTtNQUNsQyxJQUFJLENBQUNDLHVCQUF1QixHQUFHQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsOEJBQThCLENBQUM7TUFDaEZDLFdBQVcsQ0FBQ0MsSUFBSSxFQUFFLENBQ2hCQyxJQUFJLENBQUMsTUFBT0MsV0FBVyxJQUFvQjtRQUMzQyxJQUFJLENBQUNQLHVCQUF1QixDQUFDUSxLQUFLLEdBQUcsQ0FBQyxDQUFDRCxXQUFXLENBQUNFLFNBQVMsQ0FBQ0MsSUFBSSxDQUFFQyxHQUFHLElBQWNBLEdBQUcsQ0FBQ0MsSUFBSSxLQUFLLFNBQVMsQ0FBQztRQUMzRyxJQUFJLENBQUNaLHVCQUF1QixDQUFDYSxVQUFVLEdBQUcsQ0FBQyxDQUFDTixXQUFXLENBQUNFLFNBQVMsQ0FBQ0MsSUFBSSxDQUNwRUMsR0FBRyxJQUFjQSxHQUFHLENBQUNDLElBQUksS0FBSyx5QkFBeUIsQ0FDeEQ7UUFDRCxJQUFJLENBQUNaLHVCQUF1QixDQUFDYyxNQUFNLEdBQUcsQ0FBQyxFQUFFQyxHQUFHLElBQUlBLEdBQUcsQ0FBQ0MsTUFBTSxJQUFJ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