sap.ui.define(["exports","sap/ui/webc/common/thirdparty/base/types/Integer","sap/ui/webc/common/thirdparty/localization/dates/CalendarDate","sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy","sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp","./DateComponentBase"],function(t,e,a,i,s,m){"use strict";Object.defineProperty(t,"__esModule",{value:true});t.default=void 0;e=r(e);a=r(a);i=r(i);s=r(s);m=r(m);function r(t){return t&&t.__esModule?t:{default:t}}const n={properties:{timestamp:{type:e.default}}};class p extends m.default{static get metadata(){return n}get _minTimestamp(){return this._minDate.valueOf()/1e3}get _maxTimestamp(){return this._maxDate.valueOf()/1e3}get _timestamp(){let t=this.timestamp!==undefined?this.timestamp:(0,s.default)(this._primaryCalendarType);if(t<this._minTimestamp||t>this._maxTimestamp){t=this._minTimestamp}return t}get _localDate(){return new Date(this._timestamp*1e3)}get _calendarDate(){return a.default.fromTimestamp(this._localDate.getTime(),this._primaryCalendarType)}_safelySetTimestamp(t){const e=this._minDate.valueOf()/1e3;const a=this._maxDate.valueOf()/1e3;if(t<e){t=e}if(t>a){t=a}this.timestamp=t}_safelyModifyTimestampBy(t,e){const a=(0,i.default)(this._calendarDate,t,e);this._safelySetTimestamp(a.valueOf()/1e3)}_getTimestampFromDom(t){const e=t.getAttribute("data-sap-timestamp");return parseInt(e)}}var o=p;t.default=o});
//# sourceMappingURL=CalendarPart.js.map