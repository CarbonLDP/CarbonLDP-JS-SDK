"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var IDAlreadyInUseError_1 = require("./Errors/IDAlreadyInUseError");
var IllegalArgumentError_1 = require("./Errors/IllegalArgumentError");
var URI_1 = require("./RDF/URI");
var Resource_1 = require("./Resource");
var Utils = __importStar(require("./Utils"));
function hasPointer(id) {
    if (!inLocalScope(id)) {
        return this._documents.hasPointer(id);
    }
    return this.hasResource(id);
}
function getPointer(id) {
    if (!inLocalScope(id)) {
        return this._documents.getPointer(id);
    }
    var resource = this.getResource(id);
    return !resource ? this.createResource(id) : resource;
}
function inLocalScope(id) {
    return URI_1.URI.isBNodeID(id);
}
function inScope(idOrPointer) {
    var id = Utils.isString(idOrPointer) ? idOrPointer : idOrPointer.id;
    return inLocalScope(id) || this._documents.inScope(id);
}
function hasResource(id) {
    return this._resourcesIndex.has(id);
}
function getResource(id) {
    return this._resourcesIndex.get(id) || null;
}
function getResources() {
    return Utils.ArrayUtils.from(this._resourcesIndex.values());
}
function createResource(id) {
    return this.createResourceFrom({}, id);
}
function createResourceFrom(object, id) {
    if (id) {
        if (!inLocalScope(id))
            throw new IllegalArgumentError_1.IllegalArgumentError("The id \"" + id + "\" is out of scope.");
        if (this._resourcesIndex.has(id))
            throw new IDAlreadyInUseError_1.IDAlreadyInUseError("The id \"" + id + "\" is already in use by another resource.");
    }
    else {
        id = URI_1.URI.generateBNodeID();
    }
    var resource = Resource_1.TransientResource.createFrom(object);
    resource.id = id;
    this._resourcesIndex.set(id, resource);
    return resource;
}
function toJSON(key) {
    var _this = this;
    var generalSchema = this._documents.getGeneralSchema();
    var jsonldConverter = this._documents.jsonldConverter;
    return this
        .getResources()
        .map(function (resource) {
        var resourceSchema = _this._documents.getSchemaFor(resource);
        return jsonldConverter.expand(resource, generalSchema, resourceSchema);
    });
}
exports.FreeResources = {
    is: function (value) {
        return exports.FreeResources.isDecorated(value);
    },
    isDecorated: function (object) {
        return (Utils.hasPropertyDefined(object, "_documents") &&
            Utils.hasPropertyDefined(object, "_resourcesIndex") &&
            Utils.hasFunction(object, "hasResource") &&
            Utils.hasFunction(object, "getResource") &&
            Utils.hasFunction(object, "getResources") &&
            Utils.hasFunction(object, "createResource") &&
            Utils.hasFunction(object, "createResourceFrom") &&
            Utils.hasFunction(object, "hasPointer") &&
            Utils.hasFunction(object, "getPointer") &&
            Utils.hasFunction(object, "inScope") &&
            Utils.hasFunction(object, "toJSON"));
    },
    create: function (data) {
        var copy = Object.assign({}, data);
        return exports.FreeResources.createFrom(copy);
    },
    createFrom: function (object) {
        return exports.FreeResources.decorate(object, object._documents);
    },
    decorate: function (object, documents) {
        if (exports.FreeResources.isDecorated(object))
            return object;
        Object.defineProperties(object, {
            "_documents": {
                configurable: true,
                value: documents,
            },
            "_resourcesIndex": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: new Map(),
            },
            "hasPointer": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: hasPointer,
            },
            "getPointer": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: getPointer,
            },
            "inScope": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: inScope,
            },
            "hasResource": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: hasResource,
            },
            "getResource": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: getResource,
            },
            "getResources": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: getResources,
            },
            "createResource": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: createResource,
            },
            "createResourceFrom": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: createResourceFrom,
            },
            "toJSON": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: toJSON,
            },
        });
        return object;
    },
};

//# sourceMappingURL=FreeResources.js.map
