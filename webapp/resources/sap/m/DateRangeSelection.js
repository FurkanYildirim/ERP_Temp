/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/Device","./DatePicker","./library","sap/ui/core/LocaleData","sap/ui/core/format/DateFormat","sap/ui/core/date/UniversalDate","./DateRangeSelectionRenderer","sap/ui/unified/calendar/CustomMonthPicker","sap/ui/unified/calendar/CustomYearPicker","sap/base/util/deepEqual","sap/base/Log","sap/base/assert","sap/ui/core/Configuration","sap/ui/core/date/UI5Date","sap/ui/dom/jquery/cursorPos"],function(e,t,a,i,s,r,n,o,l,u,h,g,p,c){"use strict";var f=t.extend("sap.m.DateRangeSelection",{metadata:{library:"sap.m",properties:{delimiter:{type:"string",group:"Misc",defaultValue:"-"},secondDateValue:{type:"object",group:"Data",defaultValue:null},from:{type:"object",group:"Misc",defaultValue:null,deprecated:true},to:{type:"object",group:"Misc",defaultValue:null,deprecated:true}},designtime:"sap/m/designtime/DateRangeSelection.designtime",dnd:{draggable:false,droppable:true}},renderer:n});var d=String.fromCharCode(45),D=String.fromCharCode(8211),_=String.fromCharCode(8212);f.prototype.init=function(){t.prototype.init.apply(this,arguments);this._bIntervalSelection=true};f.prototype._createPopupContent=function(){t.prototype._createPopupContent.apply(this,arguments);var e=this._getCalendar();if(e instanceof o){e._getMonthPicker().setIntervalSelection(true)}if(e instanceof l){e._getYearPicker().setIntervalSelection(true)}this._getCalendar().detachWeekNumberSelect(this._handleWeekSelect,this);this._getCalendar().attachWeekNumberSelect(this._handleWeekSelect,this);this._getCalendar().getSelectedDates()[0].setStartDate(this._oDateRange.getStartDate());this._getCalendar().getSelectedDates()[0].setEndDate(this._oDateRange.getEndDate())};f.prototype.onkeypress=function(e){if(!e.charCode||e.metaKey||e.ctrlKey){return}var t=b.call(this);var a=S.call(this);var i=t.sAllowedCharacters+a+" ";var s=String.fromCharCode(e.charCode);if(s&&t.sAllowedCharacters&&i.indexOf(s)<0){e.preventDefault()}};f.prototype._getPlaceholder=function(){var e=this.getPlaceholder(),t,a,s,r;if(!e){t=this.getBinding("value");s=p.getFormatSettings().getFormatLocale();r=i.getInstance(s);if(t&&t.getType()&&t.getType().isA("sap.ui.model.type.DateInterval")){a=t.getType();if(a.oFormatOptions&&a.oFormatOptions.format){e=r.getCustomDateTimePattern(a.oFormatOptions.format)}else{e=r.getDatePattern("medium")}}else{e=this.getDisplayFormat();if(!e){e="medium"}if(this._checkStyle(e)){e=r.getDatePattern(e)}}var n=S.call(this);if(n&&n!==""){e=e+" "+n+" "+e}}return e};f.prototype.setValue=function(e){e=this.validateProperty("value",e);if(e!==this.getValue()){this.setLastValue(e)}else{return this}var t=this._parseAndValidateValue(e);this.setProperty("dateValue",m(t[0]),this._bPreferUserInteraction);this.setProperty("secondDateValue",m(t[1]),this._bPreferUserInteraction);this._formatValueAndUpdateOutput(t);this.setProperty("value",e,this._bPreferUserInteraction);return this};f.prototype._parseAndValidateValue=function(e){this._bValid=true;var t=[undefined,undefined];if(e){t=this._parseValue(e);if(!V.call(this,t[0],t[1])[0]){this._bValid=false;h.warning("Value can not be converted to a valid dates",this)}}return t};f.prototype._formatValueAndUpdateOutput=function(e){if(!this.getDomRef()){return}var t=this._formatValue(e[0],e[1]);if(this._bPreferUserInteraction){this.handleInputValueConcurrency(t)}else if(this._$input.val()!==t){this._$input.val(t);this._curpos=this._$input.cursorPos()}};function m(e){return typeof e==="number"?c.getInstance(e):e}function y(e){return e&&e.getTime?e.getTime():e}f.prototype.setValueFormat=function(e){this.setProperty("valueFormat",e,true);h.warning("Property valueFormat is not supported in sap.m.DateRangeSelection control.",this);return this};f.prototype.setDisplayFormat=function(e){t.prototype.setDisplayFormat.apply(this,arguments);var a=this._formatValue(this.getDateValue(),this.getSecondDateValue());this.setProperty("value",a,true);if(this.getDomRef()&&this._$input.val()!==a){this._$input.val(a);this._curpos=this._$input.cursorPos()}return this};f.prototype.setFrom=function(e){this.setDateValue(e);return this};f.prototype.getFrom=function(){return this.getDateValue()};f.prototype.setTo=function(e){this.setSecondDateValue(e);return this};f.prototype.getTo=function(){return this.getSecondDateValue()};f.prototype.setDateValue=function(e){if(!this._isValidDate(e)){throw new Error("Date must be a JavaScript or UI5Date date object; "+this)}if(u(this.getDateValue(),e)){return this}t.prototype._dateValidation.call(this,e);this._syncDateObjectsToValue(e,this.getSecondDateValue());return this};f.prototype.setSecondDateValue=function(e){if(!this._isValidDate(e)){throw new Error("Date must be a JavaScript or UI5Date date object; "+this)}if(u(this.getSecondDateValue(),e)){return this}this._bValid=true;if(e&&(e.getTime()<this._oMinDate.getTime()||e.getTime()>this._oMaxDate.getTime())){this._bValid=false;g(this._bValid,"Date must be in valid range")}this.setProperty("secondDateValue",e);this._syncDateObjectsToValue(this.getDateValue(),e);return this};f.prototype.setMinDate=function(e){t.prototype.setMinDate.apply(this,arguments);if(e){var a=this.getSecondDateValue();if(a&&a.getTime()<this._oMinDate.getTime()){h.warning("SecondDateValue not in valid date range",this)}}return this};f.prototype.setMaxDate=function(e){t.prototype.setMaxDate.apply(this,arguments);if(e){var a=this.getSecondDateValue();if(a&&a.getTime()>this._oMaxDate.getTime()){h.warning("SecondDateValue not in valid date range",this)}}return this};f.prototype._checkMinMaxDate=function(){t.prototype._checkMinMaxDate.apply(this,arguments);var e=this.getSecondDateValue();if(e&&(e.getTime()<this._oMinDate.getTime()||e.getTime()>this._oMaxDate.getTime())){h.error("secondDateValue "+e.toString()+"(value="+this.getValue()+") does not match "+"min/max date range("+this._oMinDate.toString()+" - "+this._oMaxDate.toString()+"). App. "+"developers should take care to maintain secondDateValue/value accordingly.",this)}};f.prototype._parseValue=function(e){var t;var a=[];var i,s;var r=this.getBinding("value");if(r&&r.getType()&&r.getType().isA("sap.ui.model.type.DateInterval")){try{a=r.getType().parseValue(e,"string")}catch(e){return[undefined,undefined]}if(r.getType().oFormatOptions&&r.getType().oFormatOptions.UTC){a=a.map(function(e){return c.getInstance(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds())})}return a}var n=S.call(this);if(n&&e){e=e.trim();e=F(e,[n," "]);a=this._splitValueByDelimiter(e,n);if(a.length===2){if(a[0].slice(a[0].length-1,a[0].length)==" "){a[0]=a[0].slice(0,a[0].length-1)}if(a[1].slice(0,1)==" "){a[1]=a[1].slice(1)}}else{a=e.split(" "+n+" ")}if(e.indexOf(n)===-1){var o=e.split(" ");if(o.length===2){a=o}}}if(e&&a.length<=2){t=b.call(this);if(!n||n===""||a.length===1){i=t.parse(e)}else if(a.length===2){i=t.parse(a[0]);s=t.parse(a[1]);if(!i||!s){i=undefined;s=undefined}}}return[i,s]};f.prototype._splitValueByDelimiter=function(e,t){var a=[d,D,_],i;if(t){if(a.indexOf(t)===-1){return e.split(t)}}for(i=0;i<a.length;i++){if(e.indexOf(a[i])>0){return e.split(a[i])}}return e?e.split(" "):[]};f.prototype._formatValue=function(e,t){var a="",i=S.call(this),s,r,n,o;n=e;o=t;if(n){r=this.getBinding("value");if(r&&r.getType()&&r.getType().isA("sap.ui.model.type.DateInterval")){if(r.getType().oFormatOptions&&r.getType().oFormatOptions.source&&r.getType().oFormatOptions.source.pattern==="timestamp"){a=r.getType().formatValue([y(e),y(t)],"string")}else{if(r.getType().oFormatOptions&&r.getType().oFormatOptions.UTC){n=c.getInstance(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds()));if(t){o=c.getInstance(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),t.getHours(),t.getMinutes(),t.getSeconds()))}}a=r.getType().formatValue([n,o],"string")}}else{s=b.call(this);if(i&&i!==""&&o){a=s.format(n)+" "+i+" "+s.format(o)}else{a=s.format(n)}}}return a};f.prototype.onChange=function(){if(!this.getEditable()||!this.getEnabled()){return}var e=this._$input.val();var t=[undefined,undefined];if(this.getShowFooter()&&this._oPopup&&!e){this._oPopup.getBeginButton().setEnabled(false)}this._bValid=true;if(e!=""){t=this._parseValue(e);t[1]&&t[1].setHours(23,59,59,999);t=V.call(this,t[0],t[1]);if(t[0]){e=this._formatValue(t[0],t[1])}else{this._bValid=false}}if(e!==this.getLastValue()){if(this.getDomRef()&&this._$input.val()!==e){this._$input.val(e);this._curpos=this._$input.cursorPos()}this.setLastValue(e);this.setProperty("value",e,true);if(this._bValid){this.setProperty("dateValue",m(t[0]),true);this.setProperty("secondDateValue",m(t[1]),true)}if(this._oPopup&&this._oPopup.isOpen()){var a=this.getDateValue();if(a){if(!this._oDateRange.getStartDate()||this._oDateRange.getStartDate().getTime()!==a.getTime()){this._oDateRange.setStartDate(c.getInstance(a.getTime()));this._getCalendar().focusDate(a)}}else{if(this._oDateRange.getStartDate()){this._oDateRange.setStartDate(undefined)}}var i=this.getSecondDateValue();if(i){if(!this._oDateRange.getEndDate()||this._oDateRange.getEndDate().getTime()!==i.getTime()){this._oDateRange.setEndDate(c.getInstance(i.getTime()));this._getCalendar().focusDate(i)}}else{if(this._oDateRange.getEndDate()){this._oDateRange.setEndDate(undefined)}}}v.call(this,this._bValid)}};f.prototype.updateDomValue=function(e){this._bCheckDomValue=true;e=typeof e=="undefined"?this._$input.val():e.toString();this._curpos=this._$input.cursorPos();var t=this._parseValue(e);e=this._formatValue(t[0],t[1]);if(this._bPreferUserInteraction){this.handleInputValueConcurrency(e)}else{if(this.isActive()&&this._$input.val()!==e){this._$input.val(e);this._$input.cursorPos(this._curpos)}}return this};f.prototype._fillDateRange=function(){t.prototype._fillDateRange.apply(this,arguments);var e=this.getSecondDateValue();if(e&&e.getTime()>=this._oMinDate.getTime()&&e.getTime()<=this._oMaxDate.getTime()){if(!this._oDateRange.getEndDate()||this._oDateRange.getEndDate().getTime()!==e.getTime()){this._oDateRange.setEndDate(c.getInstance(e.getTime()))}}else{if(this._oDateRange.getEndDate()){this._oDateRange.setEndDate(undefined)}}};f.prototype._selectDate=function(){var t=this._getCalendar().getSelectedDates();if(t.length>0){var a=t[0].getStartDate();var i=t[0].getEndDate();if(a&&i){var s=this.getDateValue();var r=this.getSecondDateValue();i.setHours(23,59,59,999);var n;if(!u(a,s)||!u(i,r)){if(u(i,r)){this.setDateValue(a)}else{this.setProperty("dateValue",a,true);this.setSecondDateValue(i)}n=this.getValue();v.call(this,true);if(e.system.desktop||!e.support.touch){this._curpos=n.length;this._$input.cursorPos(this._curpos)}}else if(!this._bValid){n=this._formatValue(a,i);if(n!=this._$input.val()){this._bValid=true;if(this.getDomRef()){this._$input.val(n)}v.call(this,true)}}this._oDateRange.setStartDate(this._getCalendar().getSelectedDates()[0].getStartDate());this._oDateRange.setEndDate(this._getCalendar().getSelectedDates()[0].getEndDate());this._oPopup.close()}}};f.prototype._handleCalendarSelect=function(){var e=this._getCalendar().getSelectedDates(),t=e[0].getStartDate(),a=e[0].getEndDate();if(this.getShowFooter()){this._oPopup.getBeginButton().setEnabled(!!(t&&a));return}this._selectDate()};f.prototype._handleWeekSelect=function(e){var t=e.getParameter("weekDays"),a=t.getStartDate(),i=t.getEndDate();if(!t){return}if(this.getShowFooter()){this._oPopup.getBeginButton().setEnabled(!!(a&&i));return}this._getCalendar().getSelectedDates()[0].setStartDate(a);this._getCalendar().getSelectedDates()[0].setEndDate(i);this._oDateRange.setStartDate(a);this._oDateRange.setEndDate(i);this._selectDate()};f.prototype.getAccessibilityInfo=function(){var e=this.getRenderer();var a=t.prototype.getAccessibilityInfo.apply(this,arguments);var i=this.getValue()||"";if(this._bValid){var s=this.getDateValue();if(s){i=this._formatValue(s,this.getSecondDateValue())}}a.type=sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_DATERANGEINPUT");a.description=[i,e.getLabelledByAnnouncement(this),e.getDescribedByAnnouncement(this)].join(" ").trim();return a};f.prototype._syncDateObjectsToValue=function(e,t){var a=this._formatValue(e,t);if(a!==this.getValue()){this.setLastValue(a)}this.setProperty("value",a);if(this.getDomRef()){var i=this._formatValue(e,t);if(this._$input.val()!==i){this._$input.val(i);this._curpos=this._$input.cursorPos()}}};function v(e){this.fireChangeEvent(this.getValue(),{from:this.getDateValue(),to:this.getSecondDateValue(),valid:e})}function V(e,t){var a,i;if(e&&e.getTime){a=e.getTime()}else if(typeof e==="number"){a=e}if(t&&t.getTime){i=t.getTime()}else if(typeof t==="number"){i=t}if(e&&t&&a>i){var s=e;e=t;t=s}if(e&&(a<this._oMinDate.getTime()||a>this._oMaxDate.getTime())||t&&(i<this._oMinDate.getTime()||i>this._oMaxDate.getTime())){return[undefined,undefined]}else{return[e,t]}}f.prototype._increaseDate=function(e,t){var a=this._$input.val(),i=this._parseValue(a),s=i[0],r=i[1],n=b.call(this),o=S.call(this),l,g,p,f,d,D,_;if(!s||!this.getEditable()||!this.getEnabled()){return}if(!V.call(this,s,r)[0]){h.warning("Value can not be converted to a valid dates or dates are outside of the min/max range",this);this._bValid=false;v.call(this,this._bValid);return}a=F(a,[o," "]);l=this._$input.cursorPos();g=s?n.format(s).length:0;p=r?n.format(r).length:0;f=a.length;d=l<=g+1;D=l>=f-p-1&&l<=f;if(d&&s){_=T.call(this,s,e,t);if(!u(this.getDateValue(),_.getJSDate())){this.setDateValue(c.getInstance(_.getTime()));this._curpos=l;this._$input.cursorPos(this._curpos);this.fireChangeEvent(this.getValue(),{valid:this._bValid})}}else if(D&&r){_=T.call(this,r,e,t);if(!u(this.getSecondDateValue(),_.getJSDate())){this.setSecondDateValue(c.getInstance(_.getTime()));this._curpos=l;this._$input.cursorPos(this._curpos);this.fireChangeEvent(this.getValue(),{valid:this._bValid})}}};function T(e,t,a){var i=this.getBinding("value"),s,n,o,l;if(i&&i.oType&&i.oType.oOutputFormat){s=i.oType.oOutputFormat.oFormatOptions.calendarType}else if(i&&i.oType&&i.oType.oFormat){s=i.oType.oFormat.oFormatOptions.calendarType}if(!s){s=this.getDisplayFormatType()}o=r.getInstance(c.getInstance(e.getTime()),s);l=o.getMonth();switch(a){case"day":o.setDate(o.getDate()+t);break;case"month":o.setMonth(o.getMonth()+t);n=(l+t)%12;if(n<0){n=12+n}while(o.getMonth()!=n){o.setDate(o.getDate()-1)}break;case"year":o.setFullYear(o.getFullYear()+t);while(o.getMonth()!=l){o.setDate(o.getDate()-1)}break;default:break}if(o.getTime()<this._oMinDate.getTime()){o=new r(this._oMinDate.getTime())}else if(o.getTime()>this._oMaxDate.getTime()){o=new r(this._oMaxDate.getTime())}return o}function S(){var e=this.getDelimiter();if(!e){if(!this._sLocaleDelimiter){var t=p.getFormatSettings().getFormatLocale();var a=i.getInstance(t);var s=a.getIntervalPattern();var r=s.indexOf("{0}")+3;var n=s.indexOf("{1}");e=s.slice(r,n);if(e.length>1){if(e.slice(0,1)==" "){e=e.slice(1)}if(e.slice(e.length-1,e.length)==" "){e=e.slice(0,e.length-1)}}this._sLocaleDelimiter=e}else{e=this._sLocaleDelimiter}}return e}function b(){var e=this.getDisplayFormat()||"medium";var t;var a=this.getDisplayFormatType();if(e==this._sUsedDisplayPattern&&a==this._sUsedDisplayCalendarType){t=this._oDisplayFormat}else{if(this._checkStyle(e)){t=s.getInstance({style:e,strictParsing:true,calendarType:a})}else{t=s.getInstance({pattern:e,strictParsing:true,calendarType:a})}this._sUsedDisplayPattern=e;this._sUsedDisplayCalendarType=a;this._oDisplayFormat=t}return t}function P(e,t){return e&&t&&e.lastIndexOf(t)===e.length-t.length}function C(e,t){return e&&t&&e.indexOf(t)===0}function F(e,t){var a=0,i=t;if(!i){i=[" "]}while(a<i.length){if(P(e,i[a])){e=e.substring(0,e.length-i[a].length);a=0;continue}a++}a=0;while(a<i.length){if(C(e,i[a])){e=e.substring(i[a].length);a=0;continue}a++}return e}return f});
//# sourceMappingURL=DateRangeSelection.js.map