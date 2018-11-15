"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Auth_1 = require("../Auth");
var Document_1 = require("../Document");
var HTTP_1 = require("../HTTP");
var ServerErrors_1 = require("../HTTP/Errors/ServerErrors");
var JSONLD_1 = require("../JSONLD");
var RDF_1 = require("../RDF");
var Utils = __importStar(require("../Utils"));
var Utils_1 = require("../Utils");
var Vocabularies_1 = require("../Vocabularies");
var TransientProtectedDocument_1 = require("./TransientProtectedDocument");
exports.ProtectedDocument = {
    TYPE: TransientProtectedDocument_1.TransientProtectedDocument.TYPE,
    SCHEMA: {
        "accessControlList": {
            "@id": Vocabularies_1.CS.accessControlList,
            "@type": "@id",
        },
        "creator": {
            "@id": Vocabularies_1.CS.creator,
            "@type": "@id",
        },
        "owners": {
            "@id": Vocabularies_1.CS.owner,
            "@type": "@id",
            "@container": "@set",
        },
    },
    isDecorated: function (object) {
        return Utils.isObject(object)
            && Utils.hasFunction(object, "getACL");
    },
    is: function (object) {
        return exports.ProtectedDocument.isDecorated(object)
            && Document_1.Document.is(object);
    },
    decorate: function (object, documents) {
        if (exports.ProtectedDocument.isDecorated(object))
            return object;
        Document_1.Document.decorate(object, documents);
        var persistedProtectedDocument = object;
        Object.defineProperties(persistedProtectedDocument, {
            "getACL": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: getACL,
            },
            "getSimpleUserACReport": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: getSimpleUserACReport,
            },
            "getDetailedUserACReport": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: getDetailedUserACReport,
            },
            "getCompleteACReport": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: getCompleteACReport,
            },
        });
        return persistedProtectedDocument;
    },
};
function getACL(requestOptions) {
    var _this = this;
    if (this.accessControlList)
        return this._documents.get(this.accessControlList.id, requestOptions);
    return this.resolve(function (_) { return _
        .withType(Vocabularies_1.CS.ProtectedDocument)
        .properties({
        accessControlList: {
            "query": function (__) { return __
                .properties(__.full); },
        },
    }); }).then(function () {
        return _this.accessControlList;
    });
}
function addDefaultRequestOptions(documents, requestOptions) {
    if (documents["context"] && documents["context"].auth)
        documents["context"].auth.addAuthentication(requestOptions);
    HTTP_1.RequestUtils.setAcceptHeader("application/ld+json", requestOptions);
    HTTP_1.RequestUtils.setRetrievalPreferences({ include: [Vocabularies_1.C.PreferMinimalDocument] }, requestOptions);
    HTTP_1.RequestUtils.setPreferredInteractionModel(Vocabularies_1.LDP.RDFSource, requestOptions);
}
function parseParams(resource, uriOrOptions, requestOptions) {
    var uri = Utils_1.isString(uriOrOptions) ? uriOrOptions : void 0;
    var url = uri ? RDF_1.URI.resolve(resource.id, uri) : resource.id;
    var options = Utils_1.isObject(uriOrOptions) ? uriOrOptions :
        requestOptions ? requestOptions : {};
    return { url: url, options: options };
}
function makeMinimalGET(documents, url, options) {
    addDefaultRequestOptions(documents, options);
    return HTTP_1.RequestService
        .get(url, options, new JSONLD_1.JSONLDParser())
        .catch(function (error) { return documents._parseErrorResponse(error); });
}
function getReport(reportFactory, documents, rdfData, response) {
    var freeNodes = RDF_1.RDFNode.getFreeNodes(rdfData);
    var acReport = documents
        ._getFreeResources(freeNodes)
        .getResources()
        .find(reportFactory.is);
    if (!acReport)
        throw new ServerErrors_1.BadResponseError("Expecting a " + reportFactory.TYPE + ", none has returned.", response);
    return acReport;
}
function getSimpleUserACReport(uriOrOptions, requestOptions) {
    var _this = this;
    var _a = parseParams(this, uriOrOptions, requestOptions), url = _a.url, options = _a.options;
    HTTP_1.RequestUtils.setRetrievalPreferences({ include: [Vocabularies_1.CS.PreferSimpleUserACReport] }, options);
    return makeMinimalGET(this._documents, url, options)
        .then(function (_a) {
        var rdfData = _a[0], response = _a[1];
        return getReport(Auth_1.SimpleUserACReport, _this._documents, rdfData, response);
    });
}
function getDetailedUserACReport(uriOrOptions, requestOptions) {
    var _this = this;
    var _a = parseParams(this, uriOrOptions, requestOptions), url = _a.url, options = _a.options;
    HTTP_1.RequestUtils.setRetrievalPreferences({ include: [Vocabularies_1.CS.PreferDetailedUserACReport] }, options);
    return makeMinimalGET(this._documents, url, options)
        .then(function (_a) {
        var rdfData = _a[0], response = _a[1];
        return getReport(Auth_1.DetailedUserACReport, _this._documents, rdfData, response);
    });
}
function getCompleteACReport(uriOrOptions, requestOptions) {
    var _this = this;
    var _a = parseParams(this, uriOrOptions, requestOptions), url = _a.url, options = _a.options;
    HTTP_1.RequestUtils.setRetrievalPreferences({ include: [Vocabularies_1.CS.PreferCompleteACReport] }, options);
    return makeMinimalGET(this._documents, url, options)
        .then(function (_a) {
        var rdfData = _a[0], response = _a[1];
        return getReport(Auth_1.CompleteACReport, _this._documents, rdfData, response);
    });
}

//# sourceMappingURL=ProtectedDocument.js.map
