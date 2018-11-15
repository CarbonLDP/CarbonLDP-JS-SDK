"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../Document");
var Utils = __importStar(require("../Utils"));
var Vocabularies_1 = require("../Vocabularies");
var TransientProtectedDocument_1 = require("./TransientProtectedDocument");
exports.ProtectedDocument = {
    TYPE: TransientProtectedDocument_1.TransientProtectedDocument.TYPE,
    SCHEMA: {
        "accessControlList": {
            "@id": Vocabularies_1.CS.accessControlList,
            "@type": "@id",
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
        });
        return persistedProtectedDocument;
    },
};
function getACL(requestOptions) {
    var _this = this;
    var aclPromise = this.isResolved() ?
        Promise.resolve(this.accessControlList) :
        this.executeSELECTQuery("SELECT ?acl WHERE {<" + this.id + "> <" + Vocabularies_1.CS.accessControlList + "> ?acl}")
            .then(function (results) { return results.bindings[0].acl; });
    return aclPromise.then(function (acl) {
        return _this._documents.get(acl.id, requestOptions);
    });
}

//# sourceMappingURL=ProtectedDocument.js.map
