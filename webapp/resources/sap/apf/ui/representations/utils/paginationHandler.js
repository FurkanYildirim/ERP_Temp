/* SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.define(["sap/apf/utils/exportToGlobal","sap/ui/Device"],function(t,i){"use strict";function n(){this.pagingOption={top:100,skip:0}}n.prototype.constructor=n;function e(t,i){t.pagingOption.skip=i.getData().tableData.length;t.pagingOption.top=99}function a(t,i){var n=i.tableControl.getModel();var a=n.getData();e(t,n);if(!t.bPaginationTriggered&&t.pagingOption.skip<i.nDataResponseCount){i.tableControl.getParent().setBusy(true);sap.ui.getCore().applyChanges();var o=i.oApi.getActiveStep();t.bPaginationTriggered=true;i.oApi.updatePath(function(e,p){t.bPaginationTriggered=false;if(e===o){n.setData(a);i.markSelectionInTable();i.tableControl.getParent().setBusy(false);if(n.getData().tableData.length>=i.nDataResponseCount){i.oLoadMoreLink.setVisible(false)}}})}}function o(t,i){i.oLoadMoreLink.setVisible(true);i.oLoadMoreLink.attachPress(function(){a(t,i)})}function p(t,i){var n=i.tableControl;i.tableControl.attachFirstVisibleRowChanged(function(e){var o=e.getParameter("firstVisibleRow");var p=n.getVisibleRowCount();var s=t.pagingOption.top+t.pagingOption.skip;if(o+p+10>s){a(t,i)}})}n.prototype.attachPaginationOnTable=function(t){if(i.system.desktop){p(this,t)}else{o(this,t)}};n.prototype.getPagingOption=function(t){var i,n;if(t){i=t;n=0}else if(this.pagingOption.top!==100&&this.pagingOption.skip!==0){i=this.pagingOption.top;n=this.pagingOption.skip}else{i=100;n=0}this.pagingOption={inlineCount:t?false:true,top:i,skip:n};return this.pagingOption};n.prototype.resetPaginationOption=function(){this.pagingOption={top:100,skip:0}};t("sap.apf.ui.representations.utils.PaginationHandler",n);return n});
//# sourceMappingURL=paginationHandler.js.map