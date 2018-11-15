"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../Document");
var Pointer_1 = require("../Pointer");
var Document_2 = require("../RDF/Document");
var Node_1 = require("../RDF/Node");
var PartialMetadata_1 = require("../SPARQL/QueryDocument/PartialMetadata");
var QueryContextBuilder_1 = require("../SPARQL/QueryDocument/QueryContextBuilder");
var QueryProperty_1 = require("../SPARQL/QueryDocument/QueryProperty");
var JSONLDCompacter = (function () {
    function JSONLDCompacter(documents, root, schemaResolver, jsonldConverter) {
        this.documents = documents;
        this.root = root;
        this.resolver = schemaResolver || documents;
        this.converter = jsonldConverter || documents.jsonldConverter;
        this.compactionMap = new Map();
    }
    JSONLDCompacter.prototype.compactDocument = function (rdfDocument) {
        var rdfDocuments = [rdfDocument];
        return this.compactDocuments(rdfDocuments)[0];
    };
    JSONLDCompacter.prototype.compactDocuments = function (rdfDocuments, mainDocuments) {
        var _this = this;
        if (!mainDocuments || !mainDocuments.length)
            mainDocuments = rdfDocuments;
        rdfDocuments.forEach(function (rdfDocument) {
            var _a = Document_2.RDFDocument.getNodes(rdfDocument), documentNode = _a[0][0], fragmentNodes = _a[1];
            var targetDocument = _this.getResource(documentNode, _this.documents, true);
            var fragmentsSet = new Set(targetDocument._fragmentsIndex.keys());
            fragmentNodes.forEach(function (fragmentNode) {
                var fragmentID = Node_1.RDFNode.getRelativeID(fragmentNode);
                if (fragmentsSet.has(fragmentID))
                    fragmentsSet.delete(fragmentID);
                _this.getResource(fragmentNode, targetDocument);
            });
            fragmentsSet.forEach(targetDocument._removeFragment, targetDocument);
        });
        var compactedDocuments = rdfDocuments
            .map(function (rdfDocument) { return rdfDocument["@id"]; })
            .map(this.compactionMap.get, this.compactionMap)
            .map(function (compactionNode) { return compactionNode.resource; });
        var compactionQueue = mainDocuments
            .map(function (rdfDocument) { return rdfDocument["@id"]; });
        var mainCompactedDocuments = compactionQueue
            .map(this.compactionMap.get, this.compactionMap)
            .map(function (compactionNode) {
            if (_this.root)
                compactionNode.paths.push(_this.root);
            return compactionNode.resource;
        });
        while (compactionQueue.length) {
            this.processCompactionQueue(compactionQueue);
            this.compactionMap.forEach(function (node, key, map) {
                if (node.processed)
                    map.delete(key);
            });
            if (this.compactionMap.size)
                compactionQueue
                    .push(this.compactionMap.keys().next().value);
        }
        compactedDocuments.forEach(function (persistedDocument) {
            persistedDocument._syncSavedFragments();
            persistedDocument.types
                .map(function (type) { return _this.documents.documentDecorators.get(type); })
                .forEach(function (decorator) { return decorator && decorator.call(void 0, persistedDocument, _this.documents); });
        });
        return mainCompactedDocuments;
    };
    JSONLDCompacter.prototype.compactNode = function (node, resource, containerLibrary, path) {
        var schema = this.resolver.getSchemaFor(node, path);
        if (this.resolver instanceof QueryContextBuilder_1.QueryContextBuilder) {
            var type = this.resolver.hasProperty(path) ?
                this.resolver.getProperty(path).getType() : void 0;
            if (type === QueryProperty_1.QueryPropertyType.PARTIAL || type === QueryProperty_1.QueryPropertyType.ALL) {
                resource._partialMetadata = new PartialMetadata_1.PartialMetadata(type === QueryProperty_1.QueryPropertyType.ALL ? PartialMetadata_1.PartialMetadata.ALL : schema, resource._partialMetadata);
            }
        }
        var compactedData = this.converter.compact(node, {}, schema, containerLibrary, resource.isPartial());
        var addedProperties = [];
        new Set(Object.keys(resource).concat(Object.keys(compactedData))).forEach(function (key) {
            if (!compactedData.hasOwnProperty(key)) {
                if (!resource.isPartial() || schema.properties.has(key))
                    delete resource[key];
                return;
            }
            addedProperties.push(key);
            if (!Array.isArray(resource[key])) {
                resource[key] = compactedData[key];
                return;
            }
            var values = Array.isArray(compactedData[key]) ? compactedData[key] : [compactedData[key]];
            resource[key].length = 0;
            (_a = resource[key]).push.apply(_a, values);
            var _a;
        });
        return addedProperties
            .filter(function (x) { return schema.properties.has(x); });
    };
    JSONLDCompacter.prototype.getResource = function (node, containerLibrary, isDocument) {
        var resource = containerLibrary.getPointer(node["@id"]);
        if (isDocument)
            containerLibrary = Document_1.Document.decorate(resource, this.documents);
        this.compactionMap.set(resource.id, { paths: [], node: node, resource: resource, containerLibrary: containerLibrary });
        return resource;
    };
    JSONLDCompacter.prototype.processCompactionQueue = function (compactionQueue) {
        while (compactionQueue.length) {
            var targetNode = compactionQueue.shift();
            if (!this.compactionMap.has(targetNode))
                continue;
            var compactionNode = this.compactionMap.get(targetNode);
            compactionNode.processed = true;
            var targetPath = compactionNode.paths.shift();
            var addedProperties = this.compactNode(compactionNode.node, compactionNode.resource, compactionNode.containerLibrary, targetPath);
            compactionNode.resource._syncSnapshot();
            for (var _i = 0, addedProperties_1 = addedProperties; _i < addedProperties_1.length; _i++) {
                var propertyName = addedProperties_1[_i];
                if (!compactionNode.resource.hasOwnProperty(propertyName))
                    continue;
                var value = compactionNode.resource[propertyName];
                var values = Array.isArray(value) ? value : [value];
                var pointers = values.filter(Pointer_1.Pointer.is);
                for (var _a = 0, pointers_1 = pointers; _a < pointers_1.length; _a++) {
                    var pointer = pointers_1[_a];
                    if (!this.compactionMap.has(pointer.id))
                        continue;
                    var subCompactionNode = this.compactionMap.get(pointer.id);
                    if (targetPath) {
                        var subPath = targetPath + "." + propertyName;
                        if (!this.resolver.hasSchemaFor(subCompactionNode.node, subPath))
                            continue;
                        subCompactionNode.paths.push(subPath);
                        compactionQueue.push(pointer.id);
                    }
                }
            }
        }
    };
    return JSONLDCompacter;
}());
exports.JSONLDCompacter = JSONLDCompacter;

//# sourceMappingURL=Compacter.js.map
