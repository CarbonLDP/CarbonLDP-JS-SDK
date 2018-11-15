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
var Parser_1 = require("../JSONLD/Parser");
var Utils = __importStar(require("./../Utils"));
var Node_1 = require("./Node");
var URI_1 = require("./URI");
exports.RDFDocument = {
    is: function (value) {
        return Utils.hasProperty(value, "@graph")
            && Utils.isArray(value["@graph"]);
    },
    create: function (resources, uri) {
        var document = {
            "@graph": resources,
        };
        if (uri)
            document["@id"] = uri;
        return document;
    },
    getDocuments: function (objects) {
        if (Utils.isArray(objects))
            return objects
                .filter(exports.RDFDocument.is);
        if (exports.RDFDocument.is(objects))
            return [objects];
        return [];
    },
    getResources: function (objects) {
        var resources = Node_1.RDFNode.getFreeNodes(objects);
        exports.RDFDocument
            .getDocuments(objects)
            .map(function (document) { return document["@graph"]; })
            .forEach(function (nodes) { return resources.push.apply(resources, nodes); });
        return resources;
    },
    getDocumentResources: function (document) {
        return exports.RDFDocument
            .getResources(document)
            .filter(function (node) { return !Node_1.RDFNode.isFragment(node); });
    },
    getNamedFragmentResources: function (document, documentResource) {
        var uriToMatch = Utils.isObject(documentResource) ?
            Node_1.RDFNode.getID(documentResource) :
            documentResource;
        return exports.RDFDocument
            .getResources(document)
            .filter(function (node) {
            var id = Node_1.RDFNode.getID(node);
            if (!URI_1.URI.hasFragment(id))
                return;
            if (!uriToMatch)
                return true;
            return URI_1.URI.getDocumentURI(id) === uriToMatch;
        });
    },
    getBNodeResources: function (document) {
        return exports.RDFDocument
            .getResources(document)
            .filter(function (node) {
            var id = Node_1.RDFNode.getID(node);
            return URI_1.URI.isBNodeID(id);
        });
    },
    getNodes: function (rdfDocument) {
        var documentNodes = [];
        var fragmentNodes = [];
        for (var _i = 0, _a = rdfDocument["@graph"]; _i < _a.length; _i++) {
            var node = _a[_i];
            (Node_1.RDFNode.isFragment(node) ? fragmentNodes : documentNodes).push(node);
        }
        return [documentNodes, fragmentNodes];
    },
};
var RDFDocumentParser = (function (_super) {
    __extends(RDFDocumentParser, _super);
    function RDFDocumentParser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RDFDocumentParser.prototype.parse = function (input) {
        return _super.prototype.parse.call(this, input).then(exports.RDFDocument.getDocuments);
    };
    return RDFDocumentParser;
}(Parser_1.JSONLDParser));
exports.RDFDocumentParser = RDFDocumentParser;

//# sourceMappingURL=Document.js.map
