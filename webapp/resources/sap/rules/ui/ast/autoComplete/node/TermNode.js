sap.ui.define(["sap/rules/ui/ast/autoComplete/node/BaseNode","sap/rules/ui/ast/constants/Constants"],function(t,e){"use strict";var s=function(){t.apply(this,arguments);this._id=null;this._businessDataType=null;this._dataObjectType=null};s.prototype=new t;s.prototype.constructor=t;s.prototype.getId=function(){return this._id};s.prototype.setId=function(t){this._id=t;return this};s.prototype.getBusinessDataType=function(){return this._businessDataType};s.prototype.setBusinessDataType=function(t){this._businessDataType=t;return this};s.prototype.getDataObjectType=function(){return this._dataObjectType};s.prototype.setDataObjectType=function(t){this._dataObjectType=t;return this};s.prototype.getNodeType=function(){return e.TERMNODE};return s},true);
//# sourceMappingURL=TermNode.js.map