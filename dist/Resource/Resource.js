"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = __importStar(require("../Utils"));
var TransientResource_1 = require("./TransientResource");
function syncSnapshot() {
    this._snapshot = Utils.ObjectUtils.clone(this, { arrays: true });
    this._snapshot.id = this.id;
    this._snapshot.types = this.types.slice();
}
function isDirty() {
    if (!Utils.ObjectUtils.areEqual(this, this._snapshot, { arrays: true }))
        return true;
    var response = false;
    if ("id" in this)
        response = response || this._snapshot.id !== this.id;
    if ("types" in this)
        response = response || !Utils.ObjectUtils.areEqual(this._snapshot.types, this.types);
    return response;
}
function revert() {
    for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
        var key = _a[_i];
        if (!(key in this._snapshot))
            delete this[key];
    }
    Utils.ObjectUtils.extend(this, this._snapshot, { arrays: true });
}
function isPartial() {
    return !!this._partialMetadata;
}
exports.Resource = {
    isDecorated: function (object) {
        return (Utils.hasPropertyDefined(object, "_snapshot")
            && Utils.hasFunction(object, "_syncSnapshot")
            && Utils.hasFunction(object, "isDirty")
            && Utils.hasFunction(object, "isPartial")
            && Utils.hasFunction(object, "revert"));
    },
    decorate: function (object) {
        if (exports.Resource.isDecorated(object))
            return object;
        TransientResource_1.TransientResource.decorate(object);
        var persistedResource = object;
        Object.defineProperties(persistedResource, {
            "_snapshot": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: {},
            },
            "_syncSnapshot": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: syncSnapshot,
            },
            "_partialMetadata": {
                writable: true,
                enumerable: false,
                configurable: true,
            },
            "isDirty": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: isDirty,
            },
            "revert": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: revert,
            },
            "isPartial": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: isPartial,
            },
        });
        return persistedResource;
    },
    is: function (value) {
        return TransientResource_1.TransientResource.is(value)
            && exports.Resource.isDecorated(value);
    },
    create: TransientResource_1.TransientResource.create,
    createFrom: TransientResource_1.TransientResource.createFrom,
};

//# sourceMappingURL=Resource.js.map
