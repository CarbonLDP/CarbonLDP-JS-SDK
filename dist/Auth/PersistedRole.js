"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Errors = __importStar(require("../Errors"));
var ProtectedDocument_1 = require("../ProtectedDocument");
var Utils = __importStar(require("./../Utils"));
var Factory = (function () {
    function Factory() {
    }
    Factory.hasClassProperties = function (object) {
        return Utils.hasPropertyDefined(object, "_roles")
            && Utils.hasFunction(object, "createChild")
            && Utils.hasFunction(object, "getUsers")
            && Utils.hasFunction(object, "addUser")
            && Utils.hasFunction(object, "addUsers")
            && Utils.hasFunction(object, "removeUser")
            && Utils.hasFunction(object, "removeUsers");
    };
    Factory.is = function (object) {
        return Factory.hasClassProperties(object)
            && ProtectedDocument_1.ProtectedDocument.is(object);
    };
    Factory.decorate = function (object, documents) {
        var persistedRole = object;
        if (Factory.hasClassProperties(persistedRole))
            return persistedRole;
        ProtectedDocument_1.ProtectedDocument.decorate(persistedRole, documents);
        Object.defineProperties(persistedRole, {
            "_roles": {
                writable: false,
                enumerable: false,
                configurable: true,
                value: documents["context"] ? documents["context"].auth.roles : null,
            },
            "createChild": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: createChild,
            },
            "getUsers": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: getUsers,
            },
            "addUser": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: addUser,
            },
            "addUsers": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: addUsers,
            },
            "removeUser": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: removeUser,
            },
            "removeUsers": {
                writable: true,
                enumerable: false,
                configurable: true,
                value: removeUsers,
            },
        });
        return persistedRole;
    };
    return Factory;
}());
exports.Factory = Factory;
function createChild(role, slugOrRequestOptions, requestOptions) {
    checkState(this);
    return this._roles.createChild(this.id, role, slugOrRequestOptions, requestOptions);
}
function getUsers(requestOptions) {
    checkState(this);
    return this._roles.getUsers(this.id, requestOptions);
}
function addUser(user, requestOptions) {
    checkState(this);
    return this._roles.addUsers(this.id, [user], requestOptions);
}
function addUsers(users, requestOptions) {
    checkState(this);
    return this._roles.addUsers(this.id, users, requestOptions);
}
function removeUser(user, requestOptions) {
    checkState(this);
    return this._roles.removeUsers(this.id, [user], requestOptions);
}
function removeUsers(users, requestOptions) {
    checkState(this);
    return this._roles.removeUsers(this.id, users, requestOptions);
}
function checkState(role) {
    if (!role._roles)
        throw new Errors.IllegalStateError("The context of the current role, does not support roles management.");
}

//# sourceMappingURL=PersistedRole.js.map
