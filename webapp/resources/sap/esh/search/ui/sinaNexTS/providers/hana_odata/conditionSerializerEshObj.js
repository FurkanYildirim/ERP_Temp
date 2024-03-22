/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../sina/DataSource","../../sina/ComparisonOperator","../../sina/LogicalOperator","../../sina/ComplexCondition","../../sina/AttributeType","./typeConverter","./eshObjects/src/index","../../core/errors","../../sina/NullValue"],function(e,r,a,t,n,o,i,s,u){function l(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function c(e,r){for(var a=0;a<r.length;a++){var t=r[a];t.enumerable=t.enumerable||false;t.configurable=true;if("value"in t)t.writable=true;Object.defineProperty(e,t.key,t)}}function p(e,r,a){if(r)c(e.prototype,r);if(a)c(e,a);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var v=e["DataSource"];var d=r["ComparisonOperator"];var f=a["LogicalOperator"];var C=t["ComplexCondition"];var h=n["AttributeType"];var O=i["SearchQueryComparisonOperator"];var w=i["ComparisonOperator"];var y=i["NullValue"];var S=i["SearchQueryLogicalOperator"];var m=i["Expression"];var b=i["Comparison"];var g=i["Phrase"];var E=i["StringValue"];var T=s["UnknownComparisonOperatorError"];var L=s["UnknownLogicalOperatorError"];var k=u["NullValue"];var q=function(){function e(r){l(this,e);this.dataSource=r}p(e,[{key:"convertSinaToOdataOperator",value:function e(r){switch(r){case d.Eq:return O.EqualCaseSensitive;case d.Ne:return O.NotEqualCaseSensitive;case d.Lt:return O.LessThanCaseInsensitive;case d.Gt:return O.GreaterThanCaseInsensitive;case d.Le:return O.LessThanOrEqualCaseInsensitive;case d.Ge:return O.GreaterThanOrEqualCaseInsensitive;case d.Co:return O.EqualCaseInsensitive;case d.Bw:return O.EqualCaseInsensitive;case d.Ew:return O.EqualCaseInsensitive;case d.DescendantOf:return O.DescendantOf;case d.ChildOf:return O.ChildOf;default:throw new T("Unknow comparison operator "+r)}}},{key:"convertSinaToOdataLogicalOperator",value:function e(r){switch(r){case f.And:return S.AND;case f.Or:return S.OR;default:throw new L("Unknow logical operator "+r)}}},{key:"serializeComplexCondition",value:function e(r){var a=new m({operator:this.convertSinaToOdataLogicalOperator(r.operator),items:[]});var t=r.conditions;for(var n=0;n<t.length;++n){var o=t[n];a.items.push(this.serialize(o))}return a}},{key:"serializeSimpleCondition",value:function e(r){if(r.value instanceof k&&r.operator===d.Eq){return new b({property:r.attribute,operator:w.Is,value:new y})}var a=h.String;var t;if(this.dataSource instanceof v){t=this.dataSource.getAttributeMetadata(r.attribute);if(t&&t.type){a=t.type}}var n=o.sina2Odata(a,r.value,{operator:r.operator});var i=this.convertSinaToOdataOperator(r.operator);return new b({property:r.attribute,operator:i,value:new g({phrase:n})})}},{key:"serializeBetweenCondition",value:function e(r){var a=r.conditions[0];var t=r.conditions[1];var n=h.String;if(this.dataSource instanceof v){var i=this.dataSource.getAttributeMetadata(a.attribute);n=i.type||h.String}var s=o.sina2Odata(n,a.value,{operator:a.operator});var u=o.sina2Odata(n,t.value,{operator:t.operator});return new m({operator:S.AND,items:[new b({property:a.attribute,operator:O.GreaterThanOrEqualCaseInsensitive,value:new E({value:s,isQuoted:true})}),new b({property:a.attribute,operator:O.LessThanOrEqualCaseInsensitive,value:new E({value:u,isQuoted:true})})]})}},{key:"serialize",value:function e(r){if(r instanceof C){if(r.operator===f.And&&r.conditions.length>1&&r.conditions[0]&&(r.conditions[0].operator===d.Ge||r.conditions[0].operator===d.Gt||r.conditions[0].operator===d.Le||r.conditions[0].operator===d.Lt)){return this.serializeBetweenCondition(r)}return this.serializeComplexCondition(r)}return this.serializeSimpleCondition(r)}}]);return e}();function z(e,r){var a=new q(e);var t=a.serialize(r);if(t instanceof b){t=new m({operator:S.TIGHT_AND,items:[t]})}return t}var I={__esModule:true};I.ConditionSerializer=q;I.serialize=z;return I})})();
//# sourceMappingURL=conditionSerializerEshObj.js.map