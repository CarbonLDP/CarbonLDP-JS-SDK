"use strict";
var IllegalArgumentError_1 = require("./Errors/IllegalArgumentError");
var Pointer = require("./Pointer");
var RDF = require("./RDF");
var Resource = require("./Resource");
var Utils = require("./Utils");
var IDAlreadyInUseError_1 = require("./Errors/IDAlreadyInUseError");
function hasPointer(id) {
    var freeResources = this;
    if (!inLocalScope(id)) {
        return freeResources._documents.hasPointer(id);
    }
    return freeResources.hasResource(id);
}
function getPointer(id) {
    var freeResources = this;
    if (!inLocalScope(id)) {
        return freeResources._documents.getPointer(id);
    }
    var resource = freeResources.getResource(id);
    return !resource ? freeResources.createResource(id) : resource;
}
function inLocalScope(id) {
    return RDF.URI.Util.isBNodeID(id);
}
function inScope(idOrPointer) {
    var freeResources = this;
    var id = Pointer.Factory.is(idOrPointer) ? idOrPointer.id : idOrPointer;
    if (inLocalScope(id))
        return true;
    return freeResources._documents.inScope(id);
}
function hasResource(id) {
    var freeResources = this;
    return freeResources._resourcesIndex.has(id);
}
function getResource(id) {
    var freeResources = this;
    return freeResources._resourcesIndex.get(id) || null;
}
function getResources() {
    var freeResources = this;
    return Utils.A.from(freeResources._resourcesIndex.values());
}
function createResource(id) {
    var freeResources = this;
    if (id) {
        if (!inLocalScope(id))
            throw new IllegalArgumentError_1.default("The id \"" + id + "\" is out of scope.");
        if (freeResources._resourcesIndex.has(id))
            throw new IDAlreadyInUseError_1.default("The id \"" + id + "\" is already in use by another resource.");
    }
    else {
        id = RDF.URI.Util.generateBNodeID();
    }
    var resource = Resource.Factory.create(id);
    freeResources._resourcesIndex.set(id, resource);
    return resource;
}
var Factory = (function () {
    function Factory() {
    }
    Factory.hasClassProperties = function (value) {
        return (Utils.hasFunction(value, "hasPointer") &&
            Utils.hasFunction(value, "getPointer") &&
            Utils.hasFunction(value, "inScope") &&
            Utils.hasPropertyDefined(value, "_documents") &&
            Utils.hasPropertyDefined(value, "_resourcesIndex") &&
            Utils.hasFunction(value, "hasResource") &&
            Utils.hasFunction(value, "getResource") &&
            Utils.hasFunction(value, "getResources") &&
            Utils.hasFunction(value, "createResource"));
    };
    Factory.create = function (documents) {
        return Factory.createFrom({}, documents);
    };
    Factory.createFrom = function (object, documents) {
        var freeResources = Factory.decorate(object);
        freeResources._documents = documents;
        return freeResources;
    };
    Factory.decorate = function (object) {
        if (Factory.hasClassProperties(object))
            return object;
        Object.defineProperties(object, {
            "_resourcesIndex": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: new Map(),
            },
            "hasPointer": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: hasPointer,
            },
            "getPointer": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: getPointer,
            },
            "inScope": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: inScope,
            },
            "hasResource": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: hasResource,
            },
            "getResource": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: getResource,
            },
            "getResources": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: getResources,
            },
            "createResource": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: createResource,
            },
        });
        return object;
    };
    return Factory;
}());
exports.Factory = Factory;

//# sourceMappingURL=FreeResources.js.map