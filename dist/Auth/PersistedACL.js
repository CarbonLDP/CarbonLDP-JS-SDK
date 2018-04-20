"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../Document");
var Utils = __importStar(require("../Utils"));
var TransientACL_1 = require("./TransientACL");
exports.PersistedACL = {
    isDecorated: function (object) {
        return Utils.hasPropertyDefined(object, "accessTo")
            && object["_parsePointer"] === parsePointer;
    },
    decorate: function (object, documents) {
        if (exports.PersistedACL.isDecorated(object))
            return object;
        TransientACL_1.TransientACL.decorate(object);
        Document_1.Document.decorate(object, documents);
        var acl = object;
        Object.defineProperties(acl, {
            "_parsePointer": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: parsePointer,
            },
        });
        var removeInvalidACE = function (ace) {
            if (!ace.subjects)
                acl._removeFragment(ace);
            return !!ace.subjects;
        };
        if (acl.entries)
            acl.entries = acl.entries.filter(removeInvalidACE);
        if (acl.inheritableEntries)
            acl.inheritableEntries = acl.inheritableEntries.filter(removeInvalidACE);
        return acl;
    },
};
function parsePointer(element) {
    return Utils.isObject(element) ? element : this.getPointer(element);
}

//# sourceMappingURL=PersistedACL.js.map
