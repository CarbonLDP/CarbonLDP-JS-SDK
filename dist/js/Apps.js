/// <reference path="./../typings/tsd.d.ts" />
var App = require("./App");
var RDF = require("./RDF");
var Utils = require("./Utils");
var CS = require("./NS/CS");
var Apps = (function () {
    function Apps(context) {
        this.context = context;
    }
    Apps.prototype.get = function (uri) {
        var _this = this;
        var appsContainerURI = this.getAppsContainerURI();
        if (RDF.URI.Util.isRelative(uri)) {
            if (!Utils.S.startsWith(uri, appsContainerURI))
                uri = RDF.URI.Util.resolve(appsContainerURI, uri);
            uri = this.context.resolve(uri);
        }
        return this.context.Documents.get(uri).then(function (_a) {
            var document = _a[0], response = _a[1];
            if (!document.types.indexOf(CS.Class.Application))
                throw new Error("The resource fetched is not a cs:Application.");
            return new App.Context(_this.context, document);
        });
    };
    Apps.prototype.getAppsContainerURI = function () {
        if (!this.context.hasSetting("platform.apps.container"))
            throw new Error("The apps container URI hasn't been set.");
        return this.context.getSetting("platform.apps.container");
    };
    return Apps;
})();
exports.Apps = Apps;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Apps;

//# sourceMappingURL=Apps.js.map
