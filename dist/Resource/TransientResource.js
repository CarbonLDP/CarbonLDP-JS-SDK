"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Pointer_1 = require("../Pointer");
var Utils = __importStar(require("../Utils"));
function addTypeInResource(type) {
    if (this.types.indexOf(type) !== -1)
        return;
    this.types.push(type);
}
exports.addTypeInResource = addTypeInResource;
function hasTypeInResource(type) {
    return this.types.indexOf(type) !== -1;
}
exports.hasTypeInResource = hasTypeInResource;
function removeTypeInResource(type) {
    var index = this.types.indexOf(type);
    if (index !== -1)
        this.types.splice(index, 1);
}
exports.removeTypeInResource = removeTypeInResource;
exports.TransientResource = {
    isDecorated: function (object) {
        return (Utils.hasPropertyDefined(object, "types")
            && Utils.hasFunction(object, "addType")
            && Utils.hasFunction(object, "hasType")
            && Utils.hasFunction(object, "removeType"));
    },
    is: function (value) {
        return Pointer_1.Pointer.is(value)
            && exports.TransientResource.isDecorated(value);
    },
    create: function (data) {
        var clone = Object.assign({}, data);
        return exports.TransientResource.createFrom(clone);
    },
    createFrom: function (object) {
        return exports.TransientResource.decorate(object);
    },
    decorate: function (object) {
        if (exports.TransientResource.isDecorated(object))
            return object;
        var resource = object;
        Pointer_1.Pointer.decorate(resource);
        Object.defineProperties(resource, {
            "types": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: resource.types || [],
            },
            "addType": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: addTypeInResource,
            },
            "hasType": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: hasTypeInResource,
            },
            "removeType": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: removeTypeInResource,
            },
        });
        return resource;
    },
};

//# sourceMappingURL=TransientResource.js.map
