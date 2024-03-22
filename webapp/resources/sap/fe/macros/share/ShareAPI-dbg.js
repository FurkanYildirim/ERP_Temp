/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/suite/ui/commons/collaboration/CollaborationHelper", "../MacroAPI"], function (Log, ClassSupport, CollaborationHelper, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create the ‘Share’ functionality.
   * <br>
   * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
   * <br>
   * If you are consuming this building block in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Share
   * 	id="someID"
   *	visible="true"
   * /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.ShareAPI
   * @private
   * @since 1.108.0
   */
  let ShareAPI = (_dec = defineUI5Class("sap.fe.macros.share.ShareAPI", {
    interfaces: ["sap.m.IOverflowToolbarContent"]
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "boolean",
    defaultValue: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(ShareAPI, _MacroAPI);
    function ShareAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ShareAPI.prototype;
    /**
     * Returns properties for the interface IOverflowToolbarContent.
     *
     * @returns {object} Returns the configuration of IOverflowToolbarContent
     */
    _proto.getOverflowToolbarConfig = function getOverflowToolbarConfig() {
      return {
        canOverflow: false
      };
    }

    /**
     * Sets the visibility of the 'Share' building block based on the value.
     * If the 'Share' building block is used in an application that's running in Microsoft Teams,
     * this function does not have any effect,
     * since the 'Share' building block handles the visibility on it's own in that case.
     *
     * @param visibility The desired visibility to be set
     * @returns Promise which resolves with the instance of ShareAPI
     * @private
     */;
    _proto.setVisibility = async function setVisibility(visibility) {
      const isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
      // In case of teams mode share should not be visible
      // so we do not do anything
      if (!isTeamsModeActive) {
        this.content.setVisible(visibility);
        this.visible = visibility;
      } else {
        Log.info("Share Building Block: visibility not changed since application is running in teams mode!");
      }
      return Promise.resolve(this);
    }

    /**
     * Adds style class to MenuButton. Requested by the toolbars that contain the Share Button.
     *
     * @param style
     * @returns {object} Returns the reference to the MenuButton
     */;
    _proto.addStyleClass = function addStyleClass(style) {
      const menuButton = this.getAggregation("content");
      menuButton.addStyleClass(style);
      return this;
    };
    return ShareAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ShareAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUFQSSIsImRlZmluZVVJNUNsYXNzIiwiaW50ZXJmYWNlcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImdldE92ZXJmbG93VG9vbGJhckNvbmZpZyIsImNhbk92ZXJmbG93Iiwic2V0VmlzaWJpbGl0eSIsInZpc2liaWxpdHkiLCJpc1RlYW1zTW9kZUFjdGl2ZSIsIkNvbGxhYm9yYXRpb25IZWxwZXIiLCJjb250ZW50Iiwic2V0VmlzaWJsZSIsInZpc2libGUiLCJMb2ciLCJpbmZvIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhZGRTdHlsZUNsYXNzIiwic3R5bGUiLCJtZW51QnV0dG9uIiwiZ2V0QWdncmVnYXRpb24iLCJNYWNyb0FQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hhcmVBUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNZW51QnV0dG9uIGZyb20gXCJzYXAvbS9NZW51QnV0dG9uXCI7XG5pbXBvcnQgQ29sbGFib3JhdGlvbkhlbHBlciBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uSGVscGVyXCI7XG5pbXBvcnQgTWFjcm9BUEkgZnJvbSBcIi4uL01hY3JvQVBJXCI7XG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIHVzZWQgdG8gY3JlYXRlIHRoZSDigJhTaGFyZeKAmSBmdW5jdGlvbmFsaXR5LlxuICogPGJyPlxuICogUGxlYXNlIG5vdGUgdGhhdCB0aGUgJ1NoYXJlIGluIFNBUCBKYW0nIG9wdGlvbiBpcyBvbmx5IGF2YWlsYWJsZSBvbiBwbGF0Zm9ybXMgdGhhdCBhcmUgaW50ZWdyYXRlZCB3aXRoIFNBUCBKYW0uXG4gKiA8YnI+XG4gKiBJZiB5b3UgYXJlIGNvbnN1bWluZyB0aGlzIGJ1aWxkaW5nIGJsb2NrIGluIGFuIGVudmlyb25tZW50IHdoZXJlIHRoZSBTQVAgRmlvcmkgbGF1bmNocGFkIGlzIG5vdCBhdmFpbGFibGUsIHRoZW4gdGhlICdTYXZlIGFzIFRpbGUnIG9wdGlvbiBpcyBub3QgdmlzaWJsZS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86U2hhcmVcbiAqIFx0aWQ9XCJzb21lSURcIlxuICpcdHZpc2libGU9XCJ0cnVlXCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5TaGFyZUFQSVxuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjEwOC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3Muc2hhcmUuU2hhcmVBUElcIiwge1xuXHRpbnRlcmZhY2VzOiBbXCJzYXAubS5JT3ZlcmZsb3dUb29sYmFyQ29udGVudFwiXVxufSlcbmNsYXNzIFNoYXJlQVBJIGV4dGVuZHMgTWFjcm9BUEkge1xuXHQvKipcblx0ICogVGhlIGlkZW50aWZpZXIgb2YgdGhlICdTaGFyZScgYnVpbGRpbmcgYmxvY2tcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhlICdTaGFyZScgYnVpbGRpbmcgYmxvY2sgaXMgdmlzaWJsZSBvciBub3QuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHZpc2libGUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHByb3BlcnRpZXMgZm9yIHRoZSBpbnRlcmZhY2UgSU92ZXJmbG93VG9vbGJhckNvbnRlbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IFJldHVybnMgdGhlIGNvbmZpZ3VyYXRpb24gb2YgSU92ZXJmbG93VG9vbGJhckNvbnRlbnRcblx0ICovXG5cdGdldE92ZXJmbG93VG9vbGJhckNvbmZpZygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2FuT3ZlcmZsb3c6IGZhbHNlXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSAnU2hhcmUnIGJ1aWxkaW5nIGJsb2NrIGJhc2VkIG9uIHRoZSB2YWx1ZS5cblx0ICogSWYgdGhlICdTaGFyZScgYnVpbGRpbmcgYmxvY2sgaXMgdXNlZCBpbiBhbiBhcHBsaWNhdGlvbiB0aGF0J3MgcnVubmluZyBpbiBNaWNyb3NvZnQgVGVhbXMsXG5cdCAqIHRoaXMgZnVuY3Rpb24gZG9lcyBub3QgaGF2ZSBhbnkgZWZmZWN0LFxuXHQgKiBzaW5jZSB0aGUgJ1NoYXJlJyBidWlsZGluZyBibG9jayBoYW5kbGVzIHRoZSB2aXNpYmlsaXR5IG9uIGl0J3Mgb3duIGluIHRoYXQgY2FzZS5cblx0ICpcblx0ICogQHBhcmFtIHZpc2liaWxpdHkgVGhlIGRlc2lyZWQgdmlzaWJpbGl0eSB0byBiZSBzZXRcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIHRoZSBpbnN0YW5jZSBvZiBTaGFyZUFQSVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXN5bmMgc2V0VmlzaWJpbGl0eSh2aXNpYmlsaXR5OiBib29sZWFuKTogUHJvbWlzZTx0aGlzPiB7XG5cdFx0Y29uc3QgaXNUZWFtc01vZGVBY3RpdmUgPSBhd2FpdCBDb2xsYWJvcmF0aW9uSGVscGVyLmlzVGVhbXNNb2RlQWN0aXZlKCk7XG5cdFx0Ly8gSW4gY2FzZSBvZiB0ZWFtcyBtb2RlIHNoYXJlIHNob3VsZCBub3QgYmUgdmlzaWJsZVxuXHRcdC8vIHNvIHdlIGRvIG5vdCBkbyBhbnl0aGluZ1xuXHRcdGlmICghaXNUZWFtc01vZGVBY3RpdmUpIHtcblx0XHRcdHRoaXMuY29udGVudC5zZXRWaXNpYmxlKHZpc2liaWxpdHkpO1xuXHRcdFx0dGhpcy52aXNpYmxlID0gdmlzaWJpbGl0eTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLmluZm8oXCJTaGFyZSBCdWlsZGluZyBCbG9jazogdmlzaWJpbGl0eSBub3QgY2hhbmdlZCBzaW5jZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIHRlYW1zIG1vZGUhXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgc3R5bGUgY2xhc3MgdG8gTWVudUJ1dHRvbi4gUmVxdWVzdGVkIGJ5IHRoZSB0b29sYmFycyB0aGF0IGNvbnRhaW4gdGhlIFNoYXJlIEJ1dHRvbi5cblx0ICpcblx0ICogQHBhcmFtIHN0eWxlXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IFJldHVybnMgdGhlIHJlZmVyZW5jZSB0byB0aGUgTWVudUJ1dHRvblxuXHQgKi9cblx0YWRkU3R5bGVDbGFzcyhzdHlsZTogc3RyaW5nKTogdGhpcyB7XG5cdFx0Y29uc3QgbWVudUJ1dHRvbiA9IHRoaXMuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpIGFzIE1lbnVCdXR0b247XG5cdFx0bWVudUJ1dHRvbi5hZGRTdHlsZUNsYXNzKHN0eWxlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgU2hhcmVBUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBbkJBLElBdUJNQSxRQUFRLFdBSGJDLGNBQWMsQ0FBQyw4QkFBOEIsRUFBRTtJQUMvQ0MsVUFBVSxFQUFFLENBQUMsK0JBQStCO0VBQzdDLENBQUMsQ0FBQyxVQU9BQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUMsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBR2xEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFKQyxPQUtBQyx3QkFBd0IsR0FBeEIsb0NBQTJCO01BQzFCLE9BQU87UUFDTkMsV0FBVyxFQUFFO01BQ2QsQ0FBQztJQUNGOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BVEM7SUFBQSxPQVVNQyxhQUFhLEdBQW5CLDZCQUFvQkMsVUFBbUIsRUFBaUI7TUFDdkQsTUFBTUMsaUJBQWlCLEdBQUcsTUFBTUMsbUJBQW1CLENBQUNELGlCQUFpQixFQUFFO01BQ3ZFO01BQ0E7TUFDQSxJQUFJLENBQUNBLGlCQUFpQixFQUFFO1FBQ3ZCLElBQUksQ0FBQ0UsT0FBTyxDQUFDQyxVQUFVLENBQUNKLFVBQVUsQ0FBQztRQUNuQyxJQUFJLENBQUNLLE9BQU8sR0FBR0wsVUFBVTtNQUMxQixDQUFDLE1BQU07UUFDTk0sR0FBRyxDQUFDQyxJQUFJLENBQUMsMEZBQTBGLENBQUM7TUFDckc7TUFDQSxPQUFPQyxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDN0I7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BQyxhQUFhLEdBQWIsdUJBQWNDLEtBQWEsRUFBUTtNQUNsQyxNQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDQyxjQUFjLENBQUMsU0FBUyxDQUFlO01BQy9ERCxVQUFVLENBQUNGLGFBQWEsQ0FBQ0MsS0FBSyxDQUFDO01BQy9CLE9BQU8sSUFBSTtJQUNaLENBQUM7SUFBQTtFQUFBLEVBN0RxQkcsUUFBUTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0ErRGhCdkIsUUFBUTtBQUFBIn0=