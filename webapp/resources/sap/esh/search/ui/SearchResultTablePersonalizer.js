/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./i18n","sap/m/TablePersoController","./SearchResultTableColumnType","./error/errors"],function(e,t,r,o){function i(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function n(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function a(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||false;o.configurable=true;if("value"in o)o.writable=true;Object.defineProperty(e,o.key,o)}}function l(e,t,r){if(t)a(e.prototype,t);if(r)a(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}var s=i(e);var u=r["TableColumnType"];var d=o["ProgramError"];var f;(function(e){e["TITLE"]="TABLE_COLUMN_TITLE";e["TITLE_DESCRIPTION"]="TABLE_COLUMN_TITLE_DESCRIPTION";e["DETAIL"]="TABLE_COLUMN_DETAIL_";e["RELATED_APPS"]="TABLE_COLUMN_RELATED_APPS";e["EXTEND"]="TABLE_COLUMN_EXTEND"})(f||(f={}));var h=function(){function e(t){n(this,e);this.model=t;this.componentName=this.model.config.isUshell?"sap.ushell.renderers.fiori2.search.container":"entprise-search";this.persoColumnIdPrefix=this.componentName+"-table-";this.storageId=undefined}l(e,[{key:"update",value:function e(t){try{if(!t||this.model.getProperty("/tableRows").length===0){return}this.table=t;this.storageId="search-result-table-state-"+this.model.getDataSource().id;this.updateInitialPersonalizationState();this.updateActivePersonalizationState();this.updatePersoController()}catch(e){throw new d(e,s.getText("error.updatePersonalizationState"))}}},{key:"updateInitialPersonalizationState",value:function e(){var t=this.createInitialPersonalizationState();this.model.getPersonalizationStorageInstance().setItem(this.storageId+"INITIAL",t)}},{key:"createInitialPersonalizationState",value:function e(){var t=this.model.getProperty("/tableColumns");var r=[];var o=this.persoColumnIdPrefix;if(this.model.config.extendTableColumn){t.forEach(function(e){r.push({id:o+e.persoColumnId,text:e.name,order:e.index,visible:e.index<7||e.type===u.EXTEND,group:null})})}else{t.forEach(function(e){r.push({id:o+e.persoColumnId,text:e.name,order:e.index,visible:e.index<6,group:null})})}return{aColumns:r,_persoSchemaVersion:"1.0"}}},{key:"updateActivePersonalizationState",value:function e(){var t=this.model.getPersonalizationStorageInstance().getItem(this.storageId+"INITIAL");var r=this.model.getPersonalizationStorageInstance().getItem(this.storageId);if(!this.isValid(r)){this.model.getPersonalizationStorageInstance().setItem(this.storageId,t)}else{this.model.getPersonalizationStorageInstance().setItem(this.storageId,this.adaptActivePersonalizationState(r,t))}}},{key:"adaptActivePersonalizationState",value:function e(t,r){var o=t===null||t===void 0?void 0:t.aColumns;var i=r===null||r===void 0?void 0:r.aColumns;var n=[];var a=[];var l=[];for(var s=0;s<i.length;s++){var u=this.getPersonalizationColumn(o,i[s].id.substring(this.persoColumnIdPrefix.length));if(u){n.push({id:u.id,text:u.text,order:u.order,visible:u.visible,group:u.group})}else{a.push({id:i[s].id,text:i[s].text,order:-1,visible:false,group:i[s].group})}}n.sort(this.orderPersonalizationColumns);l=n.concat(a);for(var d=0;d<l.length;d++){l[d].order=d}return{aColumns:l,_persoSchemaVersion:"1.0"}}},{key:"updatePersoController",value:function e(){if(!this.table){return}try{var r,o,i;(r=this.persoController)===null||r===void 0?void 0:(o=r.getTablePersoDialog())===null||o===void 0?void 0:o.destroy();(i=this.persoController)===null||i===void 0?void 0:i.destroy();this.persoController=new t("",{table:this.table,persoService:this.model.getPersonalizationStorageInstance().getPersonalizer(this.storageId),componentName:this.componentName,resetAllMode:sap.m.ResetAllMode.ServiceReset});this.persoController.activate()}catch(e){throw new d(e,s.getText("error.updatePersoController"))}}},{key:"openDialog",value:function e(){var t;(t=this.persoController)===null||t===void 0?void 0:t.openDialog()}},{key:"destroyControllerAndDialog",value:function e(){var t,r,o;(t=this.persoController)===null||t===void 0?void 0:(r=t.getTablePersoDialog())===null||r===void 0?void 0:r.destroy();(o=this.persoController)===null||o===void 0?void 0:o.destroy()}},{key:"isValid",value:function e(t){if(!t||!Array.isArray(t.aColumns)||t._persoSchemaVersion!=="1.0"){return false}var r=false;for(var o=0;o<t.aColumns.length;o++){if(!this.isPeroColumnIdValid(t.aColumns[o])){r=true;break}}if(r){return false}var i=false;for(var n=0;n<t.aColumns.length;n++){if(t.aColumns[n].visible===true){i=true;break}}if(!i){return false}return true}},{key:"isPeroColumnIdValid",value:function e(t){var r=false;for(var o in f){if(t.id.includes(f[o])){r=true;break}}return r}},{key:"getPersonalizationColumn",value:function e(t,r){if(Array.isArray(t)===false||t.length===0){return undefined}for(var o=0;o<t.length;o++){if(t[o].id===this.persoColumnIdPrefix+r){return t[o]}}return undefined}},{key:"orderPersonalizationColumns",value:function e(t,r){if(t.order<r.order){return-1}if(t.order>r.order){return 1}return 0}}]);return e}();h.TablePersoColumnIdPrefix=f;return h})})();
//# sourceMappingURL=SearchResultTablePersonalizer.js.map