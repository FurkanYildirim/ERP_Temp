/*
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/smartfield/BindingUtil","sap/ui/model/ParseException","sap/base/strings/capitalize","sap/base/util/isPlainObject"],function(t,e,i,r){"use strict";var n=function(e,i){this._bIsDestroyed=false;this._oBinding=new t;this._oStoredProperties={};this._bVisibleSet=false;this._bEditableSet=false;this._bMandatorySet=false;this._bUomEditableSet=false;this._oStoredBindings={};this._oParent=e;this._oHelper=i;this._oAnnotation=i.oAnnotation};n.prototype.getPropertyNames=function(t){if(t){return["editable","visible"]}return["editable","visible","mandatory"]};n.prototype.getControlFormatters=function(t,e){var r,n,o,a={};if(t&&e){n=e.length;while(n--){o=e[n];r="_get"+i(o);if(this[r]){a[o]=this[r](t,this._oParent.getBindingInfo(o))}}}return a};n.prototype._getEditable=function(t,e,n){if(n===undefined){n="editable"}var o,a=this._oParent["get"+i(n)](),s=-1,p=-1,l=-1,d=-1,f=this;var u={length:0};if(n==="uomEditable"){this._bUomEditableSet=true}else{this._bEditableSet=true}if(!e){o=this._oParent["get"+i(n)]();this._oStoredProperties[n]=o;this._oStoredBindings.editable=null}else if(this._oStoredBindings.editable===undefined){this._oStoredBindings.editable=e}return{path:function(){var i=[],r,n=0;if(!t.property||!t.property.property){return[""]}r=f._oAnnotation.getFieldControlPath(t.property.property);if(r){i.push(f._toPath(t,r));s=n;n++}if(t.entitySet["sap:updatable-path"]){if(t.toRoleAssociationEndMultiplicity==="1"){i.push(f._toPath(t,t.entitySet["sap:updatable-path"]))}else{i.push(t.entitySet["sap:updatable-path"])}p=n;n++}if(e){l=n;f._oBinding.getBindingParts(e,i,u);n=n+u.length}if(t&&t.navigationPath&&!f._oParent._getEditableForNotExpandedNavigation()){i.push(t.navigationPath);d=n;n++}if(n>0){return i}return[""]},formatter:function h(_,g,y,b){if(f._bIsDestroyed){return false}if(!f._oAnnotation){return false}var c=this||f._oParent;var m;if(c&&typeof c.getBindingContext==="function"){m=c.getBindingContext()}var P=m&&m.getObject(),S=P&&P.__metadata,v=!!(S&&S.created),E=t.property&&t.property.property;if(P&&E){if(v){if(!f._getCreatableStatic(t)){return false}}else if(!f._getUpdatableStatic(t)){return false}}var B=[];if(s>-1){B.push(arguments[s]!==1)}if(p>-1&&(!P||!S||!v)&&arguments[p]!==undefined&&arguments[p]!==null){B.push(!!arguments[p])}if(l>-1){if(e.formatter){B.push(f._execFormatter(e.formatter,arguments,l,u.length))}else{B.push(!!arguments[l])}}if(d>-1){B.push(!!arguments[d])}if(B.length===0){var A=c&&c.getBinding(n),C=c&&c.getBindingPath(n),I=C==="",M=!!A&&A.isInitial(),T=_==null;if(T&&I&&(m&&!m.isTransient()||m===undefined)){o=f._oParent["get"+i(n)]()}else if(I&&r(_)&&P&&E&&f._getCreatableStatic(t)&&f._getUpdatableStatic(t)){o=f._oParent["get"+i(n)]()}else if(!M&&T){o=true}else if(!M&&a&&m&&m.isTransient()&&P&&E&&f._getCreatableStatic(t)){o=true}else if(!M&&!T&&I&&!r(_)){o=_}B.push(o)}return f._compare(B,false,true)}}};n.prototype._execFormatter=function(t,e,i,r){var n=[],o;if(i>-1&&r>-1){for(o=0;o<r;o++){n.push(e[i+o])}}return t.apply(this._oParent,n)};n.prototype._getCreatableStatic=function(t){var e=this._oAnnotation.canCreateEntitySet(t.entitySet),i=this._oAnnotation.canCreateProperty(t.property.property),r=t.ignoreInsertRestrictions;return(e||r)&&i};n.prototype._getUpdatableStatic=function(t){return this._oAnnotation.canUpdateEntitySet(t.entitySet)&&this._oAnnotation.canUpdateProperty(t.property.property)};n.prototype._compare=function(t,e,i){var r,n=t.length;for(r=0;r<n;r++){if(t[r]===e){return e}}return i};n.prototype._getVisible=function(t,e,n){if(n===undefined){n="visible"}var o,a=-1,s=-1,p=this;var l={length:0};this._bVisibleSet=true;if(!e){o=this._oParent["get"+i(n)]();this._oStoredProperties[n]=o;this._oStoredBindings.visible=null}else if(this._oStoredBindings.visible===undefined){this._oStoredBindings.visible=e}return{path:function(){var i=[],r,n=0;if(!t.property||!t.property.property){return[""]}r=p._oAnnotation.getUIHiddenPath(t.property.property);if(!r){r=p._oAnnotation.getFieldControlPath(t.property.property)}if(r){i.push(p._toPath(t,r));s=n;n++}if(e){a=n;p._oBinding.getBindingParts(e,i,l);n=n+l.length}if(n>0){return i}return[""]},formatter:function d(f,u){if(p._bIsDestroyed){return false}if(!p._oAnnotation){return false}var h=this||p._oParent;var _=t.property&&t.property.property;if(_&&p._oAnnotation.getVisible(_)==="false"||p._oAnnotation.getUIHiddenPath(_)&&f===true){return false}var g=[];if(s>-1){g.push(arguments[s]!==0);h._fieldControlValue=f}if(a>-1){if(e.formatter){g.push(p._execFormatter(e.formatter,arguments,a,l.length))}else{g.push(!!arguments[a])}}if(g.length==0){var y=h&&h.getBinding(n),b=h&&h.getBindingPath(n),c=b==="",m=!!y&&y.isInitial(),P=f==null,S;if(m&&P&&c){S=o}else if(!m&&P){S=true}else if(!m&&!P&&c&&!r(f)){S=f}else{S=p._oParent["get"+i(n)]()}g.push(S)}return p._compare(g,false,true)}}};n.prototype._getMandatory=function(t,e){var i=-1,r=-1,n=this;var o={length:0};this._bMandatorySet=true;if(!e){this._oStoredProperties.mandatory=this._oParent.getMandatory();this._oStoredBindings.mandatory=null}else if(this._oStoredBindings.mandatory===undefined){this._oStoredBindings.mandatory=e}return{path:function(){var a=[],s,p=0;if(!t.property||!t.property.property){return[""]}s=n._oAnnotation.getFieldControlPath(t.property.property);if(s){a.push(n._toPath(t,s));r=p;p++}if(e){i=p;n._oBinding.getBindingParts(e,a,o);p=p+o.length}if(p>0){return a}return[""]},formatter:function a(s,p){var l=t.property&&t.property.property,d=[],f,u,h;if(l&&l.nullable!==undefined){h=l&&l.nullable==="false"?true:false}if(n._bIsDestroyed){return true}f=r>-1;if(f){if(arguments[r]===7){h=true}else if(arguments[r]===3){h=false}}if(l&&n._oAnnotation){if(n._oAnnotation.isStaticMandatory(l)){h=true}else if(n._oAnnotation.isStaticOptional(l)){h=false}}if(h!==undefined){d.push(h)}u=i>-1;if(u){if(e.formatter){d.push(n._execFormatter(e.formatter,arguments,i,o.length))}else{d.push(!!arguments[i])}}if(d.length===0||l&&l.nullable==="true"&&!f&&!u){d.push(n._oParent.getMandatory())}return n._compare(d,true,false)}}};n.prototype._toPath=function(t,e){if(t.property.complex){return t.path.replace(t.property.property.name,e)}if(t.navigationPath){return t.navigationPath+"/"+e}return e};n.prototype.getMandatoryCheck=function(t,i){if(t){switch(t.property.type){case"Edm.DateTimeOffset":case"Edm.DateTime":case"Edm.Time":case"Edm.String":case"Edm.Decimal":case"Edm.Double":case"Edm.Float":case"Edm.Single":case"Edm.Int16":case"Edm.Int32":case"Edm.Int64":case"Edm.Byte":case"Edm.SByte":case"Edm.Guid":return function(r,n){var o,a=sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp"),s=i?r==null:r===""||r==null;if(s){if(this._oParent&&this._oParent.getComputedTextLabel&&this._oParent.getComputedTextLabel()){o=a.getText("MANDATORY_FIELD_WITH_LABEL_ERROR",[this._oParent.getComputedTextLabel()])}else{o=a.getText("MANDATORY_FIELD_ERROR")}if(this._oAnnotation&&(!this._oAnnotation.isNullable(t.property)&&!this._oAnnotation.isStaticOptional(t.property)&&(this._oParent&&this._oParent._fieldControlValue!==3))&&(this._oParent.getClientSideMandatoryCheck()||t.property.type!=="Edm.String")){throw new e(o)}if(this._oParent.getClientSideMandatoryCheck()&&this._oParent.getMandatory()){throw new e(o)}}}.bind(this)}}};n.prototype.getUOMEditState=function(t){var e,i,r,n=0,o;o=this._oParent.getBindingInfo("editable");e=this._getEditable(t,o);r={model:t.model,path:this._oHelper.getUOMPath(t),entitySet:t.entitySet,entityType:t.entityType,property:{property:t.annotations.uom.property,complex:t.property.complex,typePath:this._oHelper.getUOMTypePath(t)}};i=this._getEditable(r,this._oParent.getBindingInfo("uomEditable"),"uomEditable");return{path:function(){var t=e.path(),r=i.path();if(t[0]===""&&r===""){return[""]}n=t.length;return t.concat(r)},formatter:function t(r,o,a,s){var p=[],l,d,f,u=arguments.length;for(l=0;l<n;l++){p.push(arguments[l])}d=e.formatter.apply(null,p);p=[];for(l=0;l<u;l++){p.push(arguments[l])}for(l=0;l<n;l++){p.shift()}f=i.formatter.apply(null,p);if(!f&&!d){return 0}return 1}}};n.prototype.hasUomEditState=function(t){var e;if(t&&t.annotations&&t.annotations.uom){e=this._oParent.getControlProposal();if(e){if(e.getControlType()==="ObjectNumber"){return true}if(e.getObjectStatus()){return true}}return this._oParent.getProposedControl()==="ObjectNumber"}return false};n.prototype.bindProperties=function(t){var e={propertiesNames:this.getPropertyNames()};t=Object.assign(e,t);var i=t.propertiesNames,r=t.metadata;if(i.length){var n=this.getControlFormatters(r,i);for(var o in n){var a=this._oBinding.fromFormatter(r.model,n[o]);this._oParent.bindProperty(o,a)}}};n.prototype.destroy=function(){if(this._oBinding){this._oBinding.destroy();this._oBinding=null}this._oAnnotation=null;var t=this._oParent;if(t&&!t._bInDestroy){var e=true;for(var r in this._oStoredProperties){t.unbindProperty(r,e);var n="set"+i(r),o=t[n];if(typeof o==="function"){o.call(t,this._oStoredProperties[r])}}if(this._oStoredProperties){if(!this._oStoredProperties.editable&&this._bEditableSet){t.unbindProperty("editable")}if(!this._oStoredProperties.visible&&this._bVisibleSet){t.unbindProperty("visible")}if(!this._oStoredProperties.mandatory&&this._bMandatorySet){t.unbindProperty("mandatory")}if(!this._oStoredProperties.uomEditable&&this._bUomEditableSet){t.unbindProperty("uomEditable")}}if(this._oStoredBindings){if(this._oStoredBindings.editable){t.bindProperty("editable",this._oStoredBindings.editable)}if(this._oStoredBindings.visible){t.bindProperty("visible",this._oStoredBindings.visible)}if(this._oStoredBindings.mandatory){t.bindProperty("mandatory",this._oStoredBindings.mandatory)}if(this._oStoredBindings.uomEditable){t.bindProperty("uomEditable",this._oStoredBindings.uomEditable)}}}this._oStoredProperties=null;this._oStoredBindings=null;this._oParent=null;this._oHelper=null;this._bIsDestroyed=true;this._bEditableSet=false;this._bMandatorySet=false;this._bVisibleSet=false;this._bUomEditableSet=false};return n},true);
//# sourceMappingURL=FieldControl.js.map