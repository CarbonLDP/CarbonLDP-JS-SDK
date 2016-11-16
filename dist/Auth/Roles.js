"use strict";
var Errors = require("./../Errors");
var HTTP = require("./../HTTP");
var PersistedProtectedDocument = require("./../PersistedProtectedDocument");
var PersistedRole = require("./PersistedRole");
var URI = require("./../RDF/URI");
var Utils = require("./../Utils");
var Class = (function () {
    function Class(context) {
        this.context = context;
    }
    Class.prototype.createChild = function (parentRole, role, slugOrRequestOptions, requestOptions) {
        var _this = this;
        var parentURI = Utils.isString(parentRole) ? parentRole : parentRole.id;
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        requestOptions = HTTP.Request.Util.isOptions(slugOrRequestOptions) ? slugOrRequestOptions : requestOptions;
        var containerURI;
        var persistedRole;
        var responseCreated;
        return this.resolveURI("").then(function (uri) {
            containerURI = uri;
            parentURI = URI.Util.resolve(containerURI, parentURI);
            if (!URI.Util.isBaseOf(containerURI, parentURI))
                throw new Errors.IllegalArgumentError("The parent role provided is not a valid role of the current context.");
            return _this.context.documents.exists(parentURI);
        }).then(function (_a) {
            var exists = _a[0], response = _a[1];
            if (!exists)
                throw new Errors.IllegalArgumentError("The parent role provided does not exist.");
            return _this.context.documents.createChild(containerURI, role, slug, requestOptions);
        }).then(function (_a) {
            var newRole = _a[0], response = _a[1];
            responseCreated = response;
            persistedRole = PersistedRole.Factory.decorate(newRole, _this);
            return _this.context.documents.addMember(parentURI, newRole);
        }).then(function (responseAddMember) {
            return [persistedRole, [responseCreated, responseAddMember]];
        });
    };
    Class.prototype.createChildren = function (parentRole, roles, slugsOrRequestOptions, requestOptions) {
        var _this = this;
        var parentURI = Utils.isString(parentRole) ? parentRole : parentRole.id;
        var slugs = Utils.isArray(slugsOrRequestOptions) ? slugsOrRequestOptions : null;
        requestOptions = HTTP.Request.Util.isOptions(slugsOrRequestOptions) ? slugsOrRequestOptions : requestOptions;
        var containerURI;
        var persistedRoles;
        var responsesCreated;
        return this.resolveURI("").then(function (uri) {
            containerURI = uri;
            parentURI = URI.Util.resolve(containerURI, parentURI);
            if (!URI.Util.isBaseOf(containerURI, parentURI))
                throw new Errors.IllegalArgumentError("The parent role provided is not a valid role of the current context.");
            return _this.context.documents.exists(parentURI);
        }).then(function (_a) {
            var exists = _a[0], response = _a[1];
            if (!exists)
                throw new Errors.IllegalArgumentError("The parent role provided does not exist.");
            return _this.context.documents.createChildren(containerURI, roles, slugs, requestOptions);
        }).then(function (_a) {
            var newRoles = _a[0], responses = _a[1];
            responsesCreated = responses;
            persistedRoles = newRoles.map(function (role) { return PersistedRole.Factory.decorate(role, _this); });
            return _this.context.documents.addMembers(parentURI, newRoles);
        }).then(function (responseAddMember) {
            return [persistedRoles, responsesCreated.concat(responseAddMember)];
        });
    };
    Class.prototype.createChildAndRetrieve = function (parentRole, role, slugOrRequestOptions, requestOptions) {
        var _this = this;
        var createResponses;
        return this.createChild(parentRole, role, slugOrRequestOptions, requestOptions).then(function (_a) {
            var document = _a[0], responses = _a[1];
            createResponses = responses;
            return _this.get(document.id);
        }).then(function (_a) {
            var persistedDocument = _a[0], response = _a[1];
            return [persistedDocument, createResponses.concat(response)];
        });
    };
    Class.prototype.createChildrenAndRetrieve = function (parentRole, roles, slugsOrRequestOptions, requestOptions) {
        var _this = this;
        var parentURI = Utils.isString(parentRole) ? parentRole : parentRole.id;
        var slugs = Utils.isArray(slugsOrRequestOptions) ? slugsOrRequestOptions : null;
        requestOptions = HTTP.Request.Util.isOptions(slugsOrRequestOptions) ? slugsOrRequestOptions : requestOptions;
        var containerURI;
        var persistedRoles;
        var responsesCreated;
        return this.resolveURI("").then(function (uri) {
            containerURI = uri;
            parentURI = URI.Util.resolve(containerURI, parentURI);
            if (!URI.Util.isBaseOf(containerURI, parentURI))
                throw new Errors.IllegalArgumentError("The parent role provided is not a valid role of the current context.");
            return _this.context.documents.exists(parentURI);
        }).then(function (_a) {
            var exists = _a[0], response = _a[1];
            if (!exists)
                throw new Errors.IllegalArgumentError("The parent role provided does not exist.");
            return _this.context.documents.createChildrenAndRetrieve(containerURI, roles, slugs, requestOptions);
        }).then(function (_a) {
            var newRoles = _a[0], responses = _a[1];
            responsesCreated = responses;
            persistedRoles = newRoles.map(function (role) { return PersistedRole.Factory.decorate(role, _this); });
            return _this.context.documents.addMembers(parentURI, newRoles);
        }).then(function (responseAddMember) {
            return [persistedRoles, responsesCreated.concat(responseAddMember)];
        });
    };
    Class.prototype.get = function (roleURI, requestOptions) {
        var _this = this;
        return this.resolveURI(roleURI).then(function (uri) {
            return _this.context.documents.get(uri, requestOptions);
        });
    };
    Class.prototype.listAgents = function (roleURI, requestOptions) {
        var _this = this;
        return this.getAgentsAccessPoint(roleURI).then(function (agentsAccessPoint) {
            return _this.context.documents.listMembers(agentsAccessPoint.id, requestOptions);
        }).then(function (_a) {
            var agents = _a[0], response = _a[1];
            return [agents.map(function (agent) { return PersistedProtectedDocument.Factory.decorate(agent); }), response];
        });
    };
    Class.prototype.getAgents = function (roleURI, retrievalPreferencesOrRequestOptions, requestOptions) {
        var _this = this;
        return this.getAgentsAccessPoint(roleURI).then(function (agentsAccessPoint) {
            return _this.context.documents.getMembers(agentsAccessPoint.id, retrievalPreferencesOrRequestOptions, requestOptions);
        });
    };
    Class.prototype.addAgent = function (roleURI, agent, requestOptions) {
        return this.addAgents(roleURI, [agent], requestOptions);
    };
    Class.prototype.addAgents = function (roleURI, agents, requestOptions) {
        var _this = this;
        return this.getAgentsAccessPoint(roleURI).then(function (agentsAccessPoint) {
            return _this.context.documents.addMembers(agentsAccessPoint.id, agents, requestOptions);
        });
    };
    Class.prototype.removeAgent = function (roleURI, agent, requestOptions) {
        return this.removeAgents(roleURI, [agent], requestOptions);
    };
    Class.prototype.removeAgents = function (roleURI, agents, requestOptions) {
        var _this = this;
        return this.getAgentsAccessPoint(roleURI).then(function (agentsAccessPoint) {
            return _this.context.documents.removeMembers(agentsAccessPoint.id, agents, requestOptions);
        });
    };
    Class.prototype.resolveURI = function (agentURI) {
        var _this = this;
        return new Promise(function (resolve) {
            var containerURI = _this.context.resolve(_this.getContainerURI());
            var uri = URI.Util.resolve(containerURI, agentURI);
            if (!URI.Util.isBaseOf(containerURI, uri))
                throw new Errors.IllegalArgumentError("The URI provided is not a valid role of the current context.");
            resolve(uri);
        });
    };
    Class.prototype.getAgentsAccessPoint = function (roleURI) {
        var _this = this;
        return this.resolveURI(roleURI).then(function (uri) {
            return _this.context.documents.executeSELECTQuery(uri, " select distinct ?agentsAccessPoint where {\n\t\t\t\t<" + uri + "> <https://carbonldp.com/ns/v1/platform#accessPoint> ?agentsAccessPoint .\n\t\t\t\t?agentsAccessPoint <http://www.w3.org/ns/ldp#hasMemberRelation> <https://carbonldp.com/ns/v1/security#agent> .\n\t\t\t}");
        }).then(function (_a) {
            var selectResults = _a[0], response = _a[1];
            return selectResults.bindings[0]["agentsAccessPoint"];
        });
    };
    Class.prototype.getContainerURI = function () {
        if (!this.context.hasSetting("platform.roles.container"))
            throw new Errors.IllegalStateError("The roles container setting hasn't been declared.");
        return this.context.getSetting("platform.roles.container");
    };
    return Class;
}());
exports.Class = Class;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Class;

//# sourceMappingURL=Roles.js.map
