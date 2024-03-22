/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/sac/df/firefly/library"],function(i){i.info("Load bi_mobile_util");(function(i){var e=/iPhone/i,t=/iPod/i,o=/iPad/i,n=/ipad/i,a=/iphone/i,s=/(?=.*\bAndroid\b)(?=.*\bMobile\b)/i,r=/Android/i,h=/IEMobile/i,d=/(?=.*\bWindows\b)(?=.*\bARM\b)/i,b=/BlackBerry/i,l=/Opera Mini/i,c=/(?=.*\bFirefox\b)(?=.*\bMobile\b)/i;var p=function(i){var p=i||navigator.userAgent;this.apple={phone:f(e,p),ipod:f(t,p),tablet:f(o,p),device:f(e,p)||f(t,p)||f(o,p)};this.android={phone:f(s,p),tablet:!f(s,p)&&f(r,p),device:f(s,p)||f(r,p)};this.windows={phone:f(h,p),tablet:f(d,p),device:f(h,p)||f(d,p)};this.mobi={android:f(s,p)||f(r,p),iPhone:v(a),iPad:v(n),device:v(r)||v(a)||v(n)};this.other={blackberry:f(b,p),opera:f(l,p),firefox:f(c,p),device:f(b,p)||f(l,p)||f(c,p)};this.phone=this.apple.phone||this.android.phone||this.windows.phone;this.tablet=this.apple.tablet||this.android.tablet||this.windows.tablet;this.mobile=this.apple.device||this.android.device||this.windows.device||this.other.device;if(navigator.maxTouchPoints){this.touchPoints=navigator.maxTouchPoints;this.touchEnabled=true}else if(navigator.msMaxTouchPoints){this.touchPoints=navigator.msMaxTouchPoints;this.touchEnabled=true}if(typeof window==="undefined"){return this}return null};var u=function(){var i=new p;i.Class=p;return i};var v=function(i){var e=location.search;return i.test(e)};var f=function(i,e){return i.test(e)};i.sapbi_Mobile=u();i.sapbi_isMobile=i.sapbi_Mobile.mobile})(window)});
//# sourceMappingURL=bi_mobile_util.js.map