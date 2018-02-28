"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var iri_1 = require("sparqler/iri");
var AbstractContext = __importStar(require("./AbstractContext"));
var AccessPoint = __importStar(require("./AccessPoint"));
var Auth = __importStar(require("./Auth"));
var BlankNode = __importStar(require("./BlankNode"));
var Document = __importStar(require("./Document"));
var Documents = __importStar(require("./Documents"));
var Errors = __importStar(require("./Errors"));
var Fragment = __importStar(require("./Fragment"));
var HTTP = __importStar(require("./HTTP"));
var JSONLD = __importStar(require("./JSONLD"));
var LDP = __importStar(require("./LDP"));
var LDPatch = __importStar(require("./LDPatch"));
var Messaging = __importStar(require("./Messaging"));
var ModelFactory = __importStar(require("./ModelFactory"));
var NamedFragment = __importStar(require("./NamedFragment"));
var ObjectSchema = __importStar(require("./ObjectSchema"));
var PersistedDocument = __importStar(require("./PersistedDocument"));
var PersistedFragment = __importStar(require("./PersistedFragment"));
var PersistedNamedFragment = __importStar(require("./PersistedNamedFragment"));
var PersistedResource = __importStar(require("./PersistedResource"));
var Pointer = __importStar(require("./Pointer"));
var RDF = __importStar(require("./RDF"));
var Resource = __importStar(require("./Resource"));
var SDKContext = __importStar(require("./SDKContext"));
var Settings = __importStar(require("./Settings"));
var SHACL = __importStar(require("./SHACL"));
var SPARQL = __importStar(require("./SPARQL"));
var System = __importStar(require("./System"));
var Utils = __importStar(require("./Utils"));
var Vocabularies = __importStar(require("./Vocabularies"));
var Carbon = (function (_super) {
    __extends(Carbon, _super);
    function Carbon(urlOrSettings) {
        var _this = _super.call(this) || this;
        _this.settings = {
            vocabulary: "vocabulary/#",
            paths: {
                system: {
                    slug: ".system/",
                    paths: {
                        platform: "platform/",
                        credentials: "credentials/",
                        users: "users/",
                        roles: "roles/",
                    },
                },
            },
        };
        if (Utils.isString(urlOrSettings)) {
            if (!RDF.URI.Util.hasProtocol(urlOrSettings))
                throw new Errors.IllegalArgumentError("The URL must contain a valid protocol: \"http://\", \"https://\".");
            _this._baseURI = urlOrSettings;
        }
        else {
            if (!Utils.isString(urlOrSettings.host))
                throw new Errors.IllegalArgumentError("The settings object must contains a valid host string.");
            if (iri_1.hasProtocol(urlOrSettings.host))
                throw new Errors.IllegalArgumentError("The host must not contain a protocol.");
            if (urlOrSettings.host.includes(":"))
                throw new Errors.IllegalArgumentError("The host must not contain a port.");
            _this._baseURI = "" + (urlOrSettings.ssl === false ? "http://" : "https://") + urlOrSettings.host;
            if (Utils.isNumber(urlOrSettings.port)) {
                if (_this._baseURI.endsWith("/"))
                    _this._baseURI = _this._baseURI.slice(0, -1);
                _this._baseURI += ":" + urlOrSettings.port;
            }
            urlOrSettings.ssl = urlOrSettings.host = urlOrSettings.port = null;
            _this.settings = Utils.ObjectUtils.extend(_this.settings, urlOrSettings, { objects: true });
        }
        if (!_this._baseURI.endsWith("/"))
            _this._baseURI = _this._baseURI + "/";
        _this.messaging = new Messaging.Service.MessagingService(_this);
        return _this;
    }
    Object.defineProperty(Carbon, "version", {
        get: function () { return "1.0.0-alpha.11"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Carbon.prototype, "version", {
        get: function () { return Carbon.version; },
        enumerable: true,
        configurable: true
    });
    Carbon.prototype.getPlatformMetadata = function () {
        var _this = this;
        return Utils.promiseMethod(function () {
            var uri = _this._resolvePath("system.platform");
            return _this.documents.get(uri);
        });
    };
    Carbon.AbstractContext = AbstractContext;
    Carbon.AccessPoint = AccessPoint;
    Carbon.Auth = Auth;
    Carbon.BlankNode = BlankNode;
    Carbon.Document = Document;
    Carbon.Documents = Documents;
    Carbon.Errors = Errors;
    Carbon.Fragment = Fragment;
    Carbon.HTTP = HTTP;
    Carbon.JSONLD = JSONLD;
    Carbon.LDP = LDP;
    Carbon.LDPatch = LDPatch;
    Carbon.Messaging = Messaging;
    Carbon.ModelFactory = ModelFactory;
    Carbon.NamedFragment = NamedFragment;
    Carbon.Vocabularies = Vocabularies;
    Carbon.ObjectSchema = ObjectSchema;
    Carbon.PersistedDocument = PersistedDocument;
    Carbon.PersistedFragment = PersistedFragment;
    Carbon.PersistedNamedFragment = PersistedNamedFragment;
    Carbon.PersistedResource = PersistedResource;
    Carbon.Pointer = Pointer;
    Carbon.RDF = RDF;
    Carbon.Resource = Resource;
    Carbon.SDKContext = SDKContext;
    Carbon.Settings = Settings;
    Carbon.SHACL = SHACL;
    Carbon.SPARQL = SPARQL;
    Carbon.System = System;
    Carbon.Utils = Utils;
    return Carbon;
}(AbstractContext.AbstractContext));
exports.Carbon = Carbon;
exports.default = Carbon;

//# sourceMappingURL=Carbon.js.map
