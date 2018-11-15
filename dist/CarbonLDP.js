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
};
Object.defineProperty(exports, "__esModule", { value: true });
var iri_1 = require("sparqler/iri");
var AbstractContext_1 = require("./AbstractContext");
var Auth = __importStar(require("./Auth"));
var Document_1 = require("./Document");
var Documents_1 = require("./Documents");
var Errors = __importStar(require("./Errors"));
var Fragment_1 = require("./Fragment");
var FreeResources_1 = require("./FreeResources");
var HTTP = __importStar(require("./HTTP"));
var JSONLD = __importStar(require("./JSONLD"));
var LDP = __importStar(require("./LDP"));
var LDPatch = __importStar(require("./LDPatch"));
var Messaging = __importStar(require("./Messaging"));
var NamedFragment_1 = require("./NamedFragment");
var ObjectSchema_1 = require("./ObjectSchema");
var Pointer_1 = require("./Pointer");
var ProtectedDocument_1 = require("./ProtectedDocument");
var RDF = __importStar(require("./RDF"));
var Resource_1 = require("./Resource");
var SDKContext_1 = require("./SDKContext");
var ServiceAwareDocument_1 = require("./ServiceAwareDocument");
var SHACL = __importStar(require("./SHACL"));
var SPARQL = __importStar(require("./SPARQL"));
var System = __importStar(require("./System"));
var AccessPoint_1 = require("./AccessPoint");
var BlankNode_1 = require("./BlankNode");
var Document_2 = require("./Document");
var Fragment_2 = require("./Fragment");
var NamedFragment_2 = require("./NamedFragment");
var ProtectedDocument_2 = require("./ProtectedDocument");
var Utils = __importStar(require("./Utils"));
var Vocabularies = __importStar(require("./Vocabularies"));
var CarbonLDP = (function (_super) {
    __extends(CarbonLDP, _super);
    function CarbonLDP(urlOrSettings) {
        var _this = _super.call(this) || this;
        _this.settings = {
            vocabulary: "vocabularies/main/#",
            paths: {
                system: {
                    slug: ".system/",
                    paths: {
                        platform: "platform/",
                        credentials: "credentials/",
                        roles: "roles/",
                    },
                },
                users: {
                    slug: "users/",
                    paths: {
                        me: "me/",
                    },
                },
            },
        };
        if (Utils.isString(urlOrSettings)) {
            if (!RDF.URI.hasProtocol(urlOrSettings))
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
            var paths = mergePaths(_this.settings.paths, urlOrSettings.paths);
            _this.settings = Utils.ObjectUtils.extend(_this.settings, urlOrSettings);
            _this.settings.paths = paths;
        }
        if (!_this._baseURI.endsWith("/"))
            _this._baseURI = _this._baseURI + "/";
        _this.auth = new Auth.AuthService(_this);
        _this.messaging = new Messaging.MessagingService(_this);
        return _this;
    }
    Object.defineProperty(CarbonLDP, "version", {
        get: function () { return "1.0.0-alpha.18"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarbonLDP.prototype, "version", {
        get: function () { return CarbonLDP.version; },
        enumerable: true,
        configurable: true
    });
    CarbonLDP.prototype.getPlatformMetadata = function () {
        var _this = this;
        return Utils.promiseMethod(function () {
            var uri = _this._resolvePath("system.platform");
            return _this.documents.get(uri);
        });
    };
    CarbonLDP.AbstractContext = AbstractContext_1.AbstractContext;
    CarbonLDP.TransientAccessPoint = AccessPoint_1.TransientAccessPoint;
    CarbonLDP.Auth = Auth;
    CarbonLDP.TransientBlankNode = BlankNode_1.TransientBlankNode;
    CarbonLDP.TransientDocument = Document_2.TransientDocument;
    CarbonLDP.Documents = Documents_1.Documents;
    CarbonLDP.Errors = Errors;
    CarbonLDP.TransientFragment = Fragment_2.TransientFragment;
    CarbonLDP.FreeResources = FreeResources_1.FreeResources;
    CarbonLDP.HTTP = HTTP;
    CarbonLDP.JSONLD = JSONLD;
    CarbonLDP.LDP = LDP;
    CarbonLDP.LDPatch = LDPatch;
    CarbonLDP.Messaging = Messaging;
    CarbonLDP.TransientNamedFragment = NamedFragment_2.TransientNamedFragment;
    CarbonLDP.Vocabularies = Vocabularies;
    CarbonLDP.ObjectSchemaUtils = ObjectSchema_1.ObjectSchemaUtils;
    CarbonLDP.ObjectSchemaDigester = ObjectSchema_1.ObjectSchemaDigester;
    CarbonLDP.DigestedObjectSchemaProperty = ObjectSchema_1.DigestedObjectSchemaProperty;
    CarbonLDP.PointerType = ObjectSchema_1.PointerType;
    CarbonLDP.ContainerType = ObjectSchema_1.ContainerType;
    CarbonLDP.DigestedObjectSchema = ObjectSchema_1.DigestedObjectSchema;
    CarbonLDP.Document = Document_1.Document;
    CarbonLDP.Fragment = Fragment_1.Fragment;
    CarbonLDP.NamedFragment = NamedFragment_1.NamedFragment;
    CarbonLDP.ProtectedDocument = ProtectedDocument_1.ProtectedDocument;
    CarbonLDP.Resource = Resource_1.Resource;
    CarbonLDP.Pointer = Pointer_1.Pointer;
    CarbonLDP.TransientProtectedDocument = ProtectedDocument_2.TransientProtectedDocument;
    CarbonLDP.RDF = RDF;
    CarbonLDP.TransientResource = Resource_1.TransientResource;
    CarbonLDP.SDKContext = SDKContext_1.SDKContext;
    CarbonLDP.globalContext = SDKContext_1.globalContext;
    CarbonLDP.ServiceAwareDocument = ServiceAwareDocument_1.ServiceAwareDocument;
    CarbonLDP.SHACL = SHACL;
    CarbonLDP.SPARQL = SPARQL;
    CarbonLDP.System = System;
    CarbonLDP.Utils = Utils;
    return CarbonLDP;
}(AbstractContext_1.AbstractContext));
exports.CarbonLDP = CarbonLDP;
function mergePaths(target, source) {
    if (!source)
        return target;
    if (!target)
        return Utils.ObjectUtils.clone(source, { objects: true });
    for (var _i = 0, _a = Object.keys(source); _i < _a.length; _i++) {
        var key = _a[_i];
        var sourcePath = source[key];
        if (sourcePath === null) {
            delete target[key];
            continue;
        }
        var targetPath = target[key];
        if (!targetPath) {
            target[key] = Utils.isObject(sourcePath) ?
                Utils.ObjectUtils.clone(sourcePath, { objects: true }) :
                sourcePath;
            continue;
        }
        if (Utils.isString(sourcePath)) {
            if (Utils.isObject(targetPath)) {
                targetPath.slug = sourcePath;
            }
            else {
                target[key] = sourcePath;
            }
            continue;
        }
        if (sourcePath.slug === void 0 && sourcePath.paths === void 0)
            continue;
        var targetDocPaths = Utils.isString(targetPath) ?
            target[key] = { slug: targetPath } : targetPath;
        if (sourcePath.slug !== void 0)
            targetDocPaths.slug = sourcePath.slug;
        if (sourcePath.paths !== void 0)
            targetDocPaths.paths = mergePaths(targetDocPaths.paths, sourcePath.paths);
    }
    return target;
}

//# sourceMappingURL=CarbonLDP.js.map
