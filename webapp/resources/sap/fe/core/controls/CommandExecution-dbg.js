/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/CommandExecution", "sap/ui/core/Component", "sap/ui/core/Element", "sap/ui/core/Shortcut"], function (Log, ClassSupport, CoreCommandExecution, Component, Element, Shortcut) {
  "use strict";

  var _dec, _class;
  var _exports = {};
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let CommandExecution = (_dec = defineUI5Class("sap.fe.core.controls.CommandExecution"), _dec(_class = /*#__PURE__*/function (_CoreCommandExecution) {
    _inheritsLoose(CommandExecution, _CoreCommandExecution);
    function CommandExecution(sId, mSettings) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return _CoreCommandExecution.call(this, sId, mSettings) || this;
    }
    _exports = CommandExecution;
    var _proto = CommandExecution.prototype;
    _proto.setParent = function setParent(oParent) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _CoreCommandExecution.prototype.setParent.call(this, oParent);
      const aCommands = oParent.data("sap.ui.core.Shortcut");
      if (Array.isArray(aCommands) && aCommands.length > 0) {
        const oCommand = oParent.data("sap.ui.core.Shortcut")[aCommands.length - 1],
          oShortcut = oCommand.shortcutSpec;
        if (oShortcut) {
          // Check if single key shortcut
          for (const key in oShortcut) {
            if (oShortcut[key] && key !== "key") {
              return this;
            }
          }
        }
        return this;
      }
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      const oParent = this.getParent();
      if (oParent) {
        const oCommand = this._getCommandInfo();
        if (oCommand) {
          Shortcut.unregister(this.getParent(), oCommand.shortcut);
        }
        this._cleanupContext(oParent);
      }
      Element.prototype.destroy.apply(this, [bSuppressInvalidate]);
    };
    _proto.setVisible = function setVisible(bValue) {
      let oCommand,
        oParentControl = this.getParent(),
        oComponent;
      if (!oParentControl) {
        _CoreCommandExecution.prototype.setVisible.call(this, bValue);
      }
      while (!oComponent && oParentControl) {
        oComponent = Component.getOwnerComponentFor(oParentControl);
        oParentControl = oParentControl.getParent();
      }
      if (oComponent) {
        oCommand = oComponent.getCommand(this.getCommand());
        if (oCommand) {
          _CoreCommandExecution.prototype.setVisible.call(this, bValue);
        } else {
          Log.info("There is no shortcut definition registered in the manifest for the command : " + this.getCommand());
        }
      }
      return this;
    };
    return CommandExecution;
  }(CoreCommandExecution)) || _class);
  _exports = CommandExecution;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21tYW5kRXhlY3V0aW9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJzSWQiLCJtU2V0dGluZ3MiLCJzZXRQYXJlbnQiLCJvUGFyZW50IiwiYUNvbW1hbmRzIiwiZGF0YSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIm9Db21tYW5kIiwib1Nob3J0Y3V0Iiwic2hvcnRjdXRTcGVjIiwia2V5IiwiZGVzdHJveSIsImJTdXBwcmVzc0ludmFsaWRhdGUiLCJnZXRQYXJlbnQiLCJfZ2V0Q29tbWFuZEluZm8iLCJTaG9ydGN1dCIsInVucmVnaXN0ZXIiLCJzaG9ydGN1dCIsIl9jbGVhbnVwQ29udGV4dCIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJhcHBseSIsInNldFZpc2libGUiLCJiVmFsdWUiLCJvUGFyZW50Q29udHJvbCIsIm9Db21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImdldENvbW1hbmQiLCJMb2ciLCJpbmZvIiwiQ29yZUNvbW1hbmRFeGVjdXRpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbW1hbmRFeGVjdXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb3JlQ29tbWFuZEV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvQ29tbWFuZEV4ZWN1dGlvblwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgRWxlbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRWxlbWVudFwiO1xuaW1wb3J0IFNob3J0Y3V0IGZyb20gXCJzYXAvdWkvY29yZS9TaG9ydGN1dFwiO1xuXG50eXBlICRDb21tYW5kRXhlY3V0aW9uU2V0dGluZ3MgPSB7XG5cdHZpc2libGU6IGJvb2xlYW4gfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdGVuYWJsZWQ6IGJvb2xlYW4gfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdGV4ZWN1dGU6IEZ1bmN0aW9uO1xuXHRjb21tYW5kOiBzdHJpbmc7XG59O1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbHMuQ29tbWFuZEV4ZWN1dGlvblwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZEV4ZWN1dGlvbiBleHRlbmRzIENvcmVDb21tYW5kRXhlY3V0aW9uIHtcblx0Y29uc3RydWN0b3Ioc0lkPzogc3RyaW5nIHwgJENvbW1hbmRFeGVjdXRpb25TZXR0aW5ncywgbVNldHRpbmdzPzogJENvbW1hbmRFeGVjdXRpb25TZXR0aW5ncykge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3VwZXIoc0lkLCBtU2V0dGluZ3MpO1xuXHR9XG5cblx0c2V0UGFyZW50KG9QYXJlbnQ6IGFueSkge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3VwZXIuc2V0UGFyZW50KG9QYXJlbnQpO1xuXHRcdGNvbnN0IGFDb21tYW5kcyA9IG9QYXJlbnQuZGF0YShcInNhcC51aS5jb3JlLlNob3J0Y3V0XCIpO1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGFDb21tYW5kcykgJiYgYUNvbW1hbmRzLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9Db21tYW5kID0gb1BhcmVudC5kYXRhKFwic2FwLnVpLmNvcmUuU2hvcnRjdXRcIilbYUNvbW1hbmRzLmxlbmd0aCAtIDFdLFxuXHRcdFx0XHRvU2hvcnRjdXQgPSBvQ29tbWFuZC5zaG9ydGN1dFNwZWM7XG5cdFx0XHRpZiAob1Nob3J0Y3V0KSB7XG5cdFx0XHRcdC8vIENoZWNrIGlmIHNpbmdsZSBrZXkgc2hvcnRjdXRcblx0XHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gb1Nob3J0Y3V0KSB7XG5cdFx0XHRcdFx0aWYgKG9TaG9ydGN1dFtrZXldICYmIGtleSAhPT0gXCJrZXlcIikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH1cblxuXHRkZXN0cm95KGJTdXBwcmVzc0ludmFsaWRhdGU6IGJvb2xlYW4pIHtcblx0XHRjb25zdCBvUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKTtcblx0XHRpZiAob1BhcmVudCkge1xuXHRcdFx0Y29uc3Qgb0NvbW1hbmQgPSB0aGlzLl9nZXRDb21tYW5kSW5mbygpO1xuXHRcdFx0aWYgKG9Db21tYW5kKSB7XG5cdFx0XHRcdFNob3J0Y3V0LnVucmVnaXN0ZXIodGhpcy5nZXRQYXJlbnQoKSwgb0NvbW1hbmQuc2hvcnRjdXQpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fY2xlYW51cENvbnRleHQob1BhcmVudCk7XG5cdFx0fVxuXHRcdEVsZW1lbnQucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgW2JTdXBwcmVzc0ludmFsaWRhdGVdKTtcblx0fVxuXG5cdHNldFZpc2libGUoYlZhbHVlOiBib29sZWFuKSB7XG5cdFx0bGV0IG9Db21tYW5kLFxuXHRcdFx0b1BhcmVudENvbnRyb2wgPSB0aGlzLmdldFBhcmVudCgpLFxuXHRcdFx0b0NvbXBvbmVudDogYW55O1xuXG5cdFx0aWYgKCFvUGFyZW50Q29udHJvbCkge1xuXHRcdFx0c3VwZXIuc2V0VmlzaWJsZShiVmFsdWUpO1xuXHRcdH1cblxuXHRcdHdoaWxlICghb0NvbXBvbmVudCAmJiBvUGFyZW50Q29udHJvbCkge1xuXHRcdFx0b0NvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcihvUGFyZW50Q29udHJvbCk7XG5cdFx0XHRvUGFyZW50Q29udHJvbCA9IG9QYXJlbnRDb250cm9sLmdldFBhcmVudCgpO1xuXHRcdH1cblxuXHRcdGlmIChvQ29tcG9uZW50KSB7XG5cdFx0XHRvQ29tbWFuZCA9IG9Db21wb25lbnQuZ2V0Q29tbWFuZCh0aGlzLmdldENvbW1hbmQoKSk7XG5cblx0XHRcdGlmIChvQ29tbWFuZCkge1xuXHRcdFx0XHRzdXBlci5zZXRWaXNpYmxlKGJWYWx1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cuaW5mbyhcIlRoZXJlIGlzIG5vIHNob3J0Y3V0IGRlZmluaXRpb24gcmVnaXN0ZXJlZCBpbiB0aGUgbWFuaWZlc3QgZm9yIHRoZSBjb21tYW5kIDogXCIgKyB0aGlzLmdldENvbW1hbmQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztNQWVxQkEsZ0JBQWdCLFdBRHBDQyxjQUFjLENBQUMsdUNBQXVDLENBQUM7SUFBQTtJQUV2RCwwQkFBWUMsR0FBd0MsRUFBRUMsU0FBcUMsRUFBRTtNQUM1RjtNQUNBO01BQUEsT0FDQSxpQ0FBTUQsR0FBRyxFQUFFQyxTQUFTLENBQUM7SUFDdEI7SUFBQztJQUFBO0lBQUEsT0FFREMsU0FBUyxHQUFULG1CQUFVQyxPQUFZLEVBQUU7TUFDdkI7TUFDQTtNQUNBLGdDQUFNRCxTQUFTLFlBQUNDLE9BQU87TUFDdkIsTUFBTUMsU0FBUyxHQUFHRCxPQUFPLENBQUNFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztNQUN0RCxJQUFJQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0gsU0FBUyxDQUFDLElBQUlBLFNBQVMsQ0FBQ0ksTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNyRCxNQUFNQyxRQUFRLEdBQUdOLE9BQU8sQ0FBQ0UsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUNELFNBQVMsQ0FBQ0ksTUFBTSxHQUFHLENBQUMsQ0FBQztVQUMxRUUsU0FBUyxHQUFHRCxRQUFRLENBQUNFLFlBQVk7UUFDbEMsSUFBSUQsU0FBUyxFQUFFO1VBQ2Q7VUFDQSxLQUFLLE1BQU1FLEdBQUcsSUFBSUYsU0FBUyxFQUFFO1lBQzVCLElBQUlBLFNBQVMsQ0FBQ0UsR0FBRyxDQUFDLElBQUlBLEdBQUcsS0FBSyxLQUFLLEVBQUU7Y0FDcEMsT0FBTyxJQUFJO1lBQ1o7VUFDRDtRQUNEO1FBQ0EsT0FBTyxJQUFJO01BQ1o7SUFDRCxDQUFDO0lBQUEsT0FFREMsT0FBTyxHQUFQLGlCQUFRQyxtQkFBNEIsRUFBRTtNQUNyQyxNQUFNWCxPQUFPLEdBQUcsSUFBSSxDQUFDWSxTQUFTLEVBQUU7TUFDaEMsSUFBSVosT0FBTyxFQUFFO1FBQ1osTUFBTU0sUUFBUSxHQUFHLElBQUksQ0FBQ08sZUFBZSxFQUFFO1FBQ3ZDLElBQUlQLFFBQVEsRUFBRTtVQUNiUSxRQUFRLENBQUNDLFVBQVUsQ0FBQyxJQUFJLENBQUNILFNBQVMsRUFBRSxFQUFFTixRQUFRLENBQUNVLFFBQVEsQ0FBQztRQUN6RDtRQUNBLElBQUksQ0FBQ0MsZUFBZSxDQUFDakIsT0FBTyxDQUFDO01BQzlCO01BQ0FrQixPQUFPLENBQUNDLFNBQVMsQ0FBQ1QsT0FBTyxDQUFDVSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUNULG1CQUFtQixDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUFBLE9BRURVLFVBQVUsR0FBVixvQkFBV0MsTUFBZSxFQUFFO01BQzNCLElBQUloQixRQUFRO1FBQ1hpQixjQUFjLEdBQUcsSUFBSSxDQUFDWCxTQUFTLEVBQUU7UUFDakNZLFVBQWU7TUFFaEIsSUFBSSxDQUFDRCxjQUFjLEVBQUU7UUFDcEIsZ0NBQU1GLFVBQVUsWUFBQ0MsTUFBTTtNQUN4QjtNQUVBLE9BQU8sQ0FBQ0UsVUFBVSxJQUFJRCxjQUFjLEVBQUU7UUFDckNDLFVBQVUsR0FBR0MsU0FBUyxDQUFDQyxvQkFBb0IsQ0FBQ0gsY0FBYyxDQUFDO1FBQzNEQSxjQUFjLEdBQUdBLGNBQWMsQ0FBQ1gsU0FBUyxFQUFFO01BQzVDO01BRUEsSUFBSVksVUFBVSxFQUFFO1FBQ2ZsQixRQUFRLEdBQUdrQixVQUFVLENBQUNHLFVBQVUsQ0FBQyxJQUFJLENBQUNBLFVBQVUsRUFBRSxDQUFDO1FBRW5ELElBQUlyQixRQUFRLEVBQUU7VUFDYixnQ0FBTWUsVUFBVSxZQUFDQyxNQUFNO1FBQ3hCLENBQUMsTUFBTTtVQUNOTSxHQUFHLENBQUNDLElBQUksQ0FBQywrRUFBK0UsR0FBRyxJQUFJLENBQUNGLFVBQVUsRUFBRSxDQUFDO1FBQzlHO01BQ0Q7TUFDQSxPQUFPLElBQUk7SUFDWixDQUFDO0lBQUE7RUFBQSxFQS9ENENHLG9CQUFvQjtFQUFBO0VBQUE7QUFBQSJ9