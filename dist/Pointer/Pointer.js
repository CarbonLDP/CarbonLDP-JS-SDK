"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../Errors");
var Utils = __importStar(require("../Utils"));
function isPointerResolved() {
    return this._resolved;
}
exports.isPointerResolved = isPointerResolved;
function resolveStandalonePointer() {
    return Promise.reject(new Errors_1.IllegalStateError("The pointer has not been assigned to a context."));
}
exports.resolveStandalonePointer = resolveStandalonePointer;
exports.Pointer = {
    isDecorated: function (object) {
        return (Utils.hasPropertyDefined(object, "_id") &&
            Utils.hasPropertyDefined(object, "_resolved") &&
            Utils.hasPropertyDefined(object, "id") &&
            Utils.hasFunction(object, "isResolved") &&
            Utils.hasFunction(object, "resolve"));
    },
    is: function (value) {
        return (Utils.isObject(value) &&
            exports.Pointer.isDecorated(value));
    },
    create: function (data) {
        var clone = Object.assign({}, data);
        return exports.Pointer.createFrom(clone);
    },
    createFrom: function (object) {
        return exports.Pointer.decorate(object);
    },
    decorate: function (object) {
        if (exports.Pointer.isDecorated(object))
            return object;
        var pointer = object;
        Object.defineProperties(pointer, {
            "_id": {
                writable: true,
                configurable: true,
                value: pointer.id || "",
            },
            "_resolved": {
                writable: true,
                configurable: true,
                value: pointer._resolved || false,
            },
            "id": {
                enumerable: false,
                configurable: true,
                get: function () {
                    return this._id;
                },
                set: function (value) {
                    this._id = value;
                },
            },
            "isResolved": {
                configurable: true,
                value: isPointerResolved,
            },
            "resolve": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: resolveStandalonePointer,
            },
        });
        return pointer;
    },
    areEqual: function (pointer1, pointer2) {
        return pointer1.id === pointer2.id;
    },
    getIDs: function (pointers) {
        return pointers
            .map(function (pointer) { return pointer.id; });
    },
};

//# sourceMappingURL=Pointer.js.map
