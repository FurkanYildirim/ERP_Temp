// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery"],function(jQuery){"use strict";function e(){this.oLastPromise=new jQuery.Deferred;this.oLastPromise.resolve()}e.prototype.addToQueue=function(e){var r=new jQuery.Deferred;this.oLastPromise.always(function(){var t=e();t.done(function(){r.resolve.apply(r,arguments)}).fail(function(){r.reject.apply(r,arguments)})});this.oLastPromise=r;return r.promise()};return e});
//# sourceMappingURL=Sequentializer.js.map