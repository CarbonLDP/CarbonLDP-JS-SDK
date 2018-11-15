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
var Request_1 = require("../HTTP/Request");
var URI_1 = require("../RDF/URI");
var Utils = __importStar(require("./../Utils"));
var PersistedRole = __importStar(require("./PersistedRole"));
var Class = (function () {
    function Class(context) {
        this.context = context;
    }
    Class.prototype.createChild = function (parentRole, role, slugOrRequestOptions, requestOptions) {
        var _this = this;
        var parentURI = Utils.isString(parentRole) ? parentRole : parentRole.id;
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        requestOptions = Request_1.RequestUtils.isOptions(slugOrRequestOptions) ? slugOrRequestOptions : requestOptions;
        var containerURI;
        var persistedRole;
        return Utils.promiseMethod(function () {
            containerURI = _this.getContainerURI();
            parentURI = URI_1.URI.resolve(containerURI, parentURI);
            if (!URI_1.URI.isBaseOf(containerURI, parentURI))
                throw new Errors.IllegalArgumentError("The parent role provided is not a valid role.");
            return _this.context.documents.exists(parentURI);
        }).then(function (exists) {
            if (!exists)
                throw new Errors.IllegalArgumentError("The parent role provided doesn't exist.");
            return _this.context.documents.createChild(containerURI, role, slug, requestOptions);
        }).then(function (newRole) {
            persistedRole = PersistedRole.Factory.decorate(newRole, _this.context.documents);
            return _this.context.documents.addMember(parentURI, newRole);
        }).then(function () {
            return persistedRole;
        });
    };
    Class.prototype.get = function (roleURI, requestOptions) {
        var _this = this;
        return Utils.promiseMethod(function () {
            var uri = _this.resolveURI(roleURI);
            return _this.context.documents.get(uri, requestOptions);
        });
    };
    Class.prototype.getUsers = function (roleURI, retrievalPreferencesOrRequestOptions, requestOptions) {
        throw new Errors.NotImplementedError("To be re-implemented in milestone:Security");
    };
    Class.prototype.addUser = function (roleURI, user, requestOptions) {
        return this.addUsers(roleURI, [user], requestOptions);
    };
    Class.prototype.addUsers = function (roleURI, users, requestOptions) {
        var _this = this;
        return this.getUsersAccessPoint(roleURI).then(function (accessPoint) {
            return _this.context.documents.addMembers(accessPoint.id, users, requestOptions);
        });
    };
    Class.prototype.removeUser = function (roleURI, user, requestOptions) {
        return this.removeUsers(roleURI, [user], requestOptions);
    };
    Class.prototype.removeUsers = function (roleURI, users, requestOptions) {
        var _this = this;
        return this.getUsersAccessPoint(roleURI).then(function (accessPoint) {
            return _this.context.documents.removeMembers(accessPoint.id, users, requestOptions);
        });
    };
    Class.prototype.resolveURI = function (relativeURI) {
        var rolesContainer = this.getContainerURI();
        var absoluteRoleURI = URI_1.URI.resolve(rolesContainer, relativeURI);
        if (!absoluteRoleURI.startsWith(rolesContainer))
            throw new Errors.IllegalArgumentError("The provided URI \"" + relativeURI + "\" isn't a valid Carbon LDP role.");
        return absoluteRoleURI;
    };
    Class.prototype.getUsersAccessPoint = function (roleURI) {
        var _this = this;
        return Utils.promiseMethod(function () {
            var uri = _this.resolveURI(roleURI);
            return _this.context.documents.executeSELECTQuery(uri, "PREFIX:<https://carbonldp.com/ns/v1/>SELECT DISTINCT?accessPoint{<" + uri + ">:platform#accessPoint?accessPoint.?accessPoint<http://www.w3.org/ns/ldp#hasMemberRelation>:security#user}");
        }).then(function (selectResults) {
            return selectResults.bindings[0].accessPoint;
        });
    };
    Class.prototype.getContainerURI = function () {
        return this.context._resolvePath("system.roles");
    };
    return Class;
}());
exports.Class = Class;
exports.default = Class;

//# sourceMappingURL=Roles.js.map
