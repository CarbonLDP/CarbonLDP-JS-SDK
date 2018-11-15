"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tokens_1 = require("sparqler/tokens");
var AccessPoint_1 = require("./AccessPoint");
var Auth = __importStar(require("./Auth"));
var ACL_1 = require("./Auth/ACL");
var User_1 = require("./Auth/User");
var Document_1 = require("./Document");
var Errors = __importStar(require("./Errors"));
var Fragment_1 = require("./Fragment");
var FreeResources_1 = require("./FreeResources");
var Errors_1 = require("./HTTP/Errors");
var BadResponseError_1 = require("./HTTP/Errors/ServerErrors/BadResponseError");
var UnknownError_1 = require("./HTTP/Errors/UnknownError");
var HTTPMethod_1 = require("./HTTP/HTTPMethod");
var Request_1 = require("./HTTP/Request");
var Compacter_1 = require("./JSONLD/Compacter");
var Converter_1 = require("./JSONLD/Converter");
var Parser_1 = require("./JSONLD/Parser");
var LDP_1 = require("./LDP");
var AddMemberAction_1 = require("./LDP/AddMemberAction");
var ErrorResponse_1 = require("./LDP/ErrorResponse");
var RemoveMemberAction_1 = require("./LDP/RemoveMemberAction");
var ResponseMetadata_1 = require("./LDP/ResponseMetadata");
var DeltaCreator_1 = require("./LDPatch/DeltaCreator");
var Event_1 = require("./Messaging/Event");
var Utils_1 = require("./Messaging/Utils");
var ObjectSchema_1 = require("./ObjectSchema");
var Pointer_1 = require("./Pointer");
var ProtectedDocument_1 = require("./ProtectedDocument");
var Document_2 = require("./RDF/Document");
var Node_1 = require("./RDF/Node");
var URI_1 = require("./RDF/URI");
var Resource_1 = require("./Resource");
var Builder_1 = require("./SPARQL/Builder");
var PartialMetadata_1 = require("./SPARQL/QueryDocument/PartialMetadata");
var QueryContextBuilder_1 = require("./SPARQL/QueryDocument/QueryContextBuilder");
var QueryContextPartial_1 = require("./SPARQL/QueryDocument/QueryContextPartial");
var QueryDocumentBuilder_1 = require("./SPARQL/QueryDocument/QueryDocumentBuilder");
var QueryDocumentsBuilder_1 = require("./SPARQL/QueryDocument/QueryDocumentsBuilder");
var QueryMetadata_1 = require("./SPARQL/QueryDocument/QueryMetadata");
var QueryProperty_1 = require("./SPARQL/QueryDocument/QueryProperty");
var Utils_2 = require("./SPARQL/QueryDocument/Utils");
var Service_1 = require("./SPARQL/Service");
var Utils = __importStar(require("./Utils"));
var Utils_3 = require("./Utils");
var C_1 = require("./Vocabularies/C");
var LDP_2 = require("./Vocabularies/LDP");
var Documents = (function () {
    function Documents(context) {
        this.context = context;
        this.pointers = new Map();
        this.documentsBeingResolved = new Map();
        if (!!this.context && !!this.context.parentContext) {
            var contextJSONLDConverter = this.context.parentContext.documents.jsonldConverter;
            this._jsonldConverter = new Converter_1.JSONLDConverter(contextJSONLDConverter.literalSerializers);
        }
        else {
            this._jsonldConverter = new Converter_1.JSONLDConverter();
        }
        var decorators = new Map();
        if (this.context && this.context.parentContext) {
            var parentDecorators = this.context.parentContext.documents.documentDecorators;
            if (parentDecorators)
                decorators = this._documentDecorators = Utils.MapUtils.extend(decorators, parentDecorators);
        }
        else {
            decorators
                .set(ProtectedDocument_1.ProtectedDocument.TYPE, ProtectedDocument_1.ProtectedDocument.decorate)
                .set(User_1.User.TYPE, User_1.User.decorate)
                .set(ACL_1.ACL.TYPE, ACL_1.ACL.decorate)
                .set(Auth.Role.RDF_CLASS, Auth.PersistedRole.Factory.decorate);
        }
        this._documentDecorators = decorators;
    }
    Object.defineProperty(Documents.prototype, "jsonldConverter", {
        get: function () { return this._jsonldConverter; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Documents.prototype, "documentDecorators", {
        get: function () { return this._documentDecorators; },
        enumerable: true,
        configurable: true
    });
    Documents.prototype.inScope = function (idOrPointer) {
        var id = Pointer_1.Pointer.is(idOrPointer) ? idOrPointer.id : idOrPointer;
        if (URI_1.URI.isBNodeID(id))
            return false;
        if (!!this.context) {
            id = ObjectSchema_1.ObjectSchemaUtils.resolveURI(id, this.context.getObjectSchema());
            if (URI_1.URI.isRelative(id))
                return true;
            if (URI_1.URI.isBaseOf(this.context.baseURI, id))
                return true;
        }
        else {
            if (URI_1.URI.isAbsolute(id))
                return true;
        }
        if (!!this.context && !!this.context.parentContext)
            return this.context.parentContext.documents.inScope(id);
        return URI_1.URI.isRelative(id);
    };
    Documents.prototype.hasPointer = function (id) {
        id = this._getPointerID(id);
        if (this.pointers.has(id))
            return true;
        if (!!this.context && !!this.context.parentContext)
            return this.context.parentContext.documents.hasPointer(id);
        return false;
    };
    Documents.prototype.getPointer = function (id) {
        var localID = this._getPointerID(id);
        if (localID === null) {
            if (!!this.context && !!this.context.parentContext)
                return this.context.parentContext.documents.getPointer(id);
            throw new Errors.IllegalArgumentError("The pointer id is not supported by this module.");
        }
        var pointer;
        if (!this.pointers.has(localID)) {
            pointer = this._createPointer(localID);
            this.pointers.set(localID, pointer);
        }
        return this.pointers.get(localID);
    };
    Documents.prototype.removePointer = function (idOrPointer) {
        var id = Utils.isString(idOrPointer) ? idOrPointer : idOrPointer.id;
        var localID = this._getPointerID(id);
        if (localID === null) {
            if (!!this.context && !!this.context.parentContext)
                return this.context.parentContext.documents.removePointer(id);
            return false;
        }
        return this.pointers.delete(localID);
    };
    Documents.prototype.register = function (id) {
        var pointerID = this._getPointerID(id);
        if (!pointerID)
            throw new Errors.IllegalArgumentError("Cannot register a document outside the scope of this documents instance.");
        var persistedDocument = Document_1.Document.decorate(this.getPointer(pointerID), this);
        return persistedDocument;
    };
    Documents.prototype.get = function (uri, optionsOrQueryBuilderFn, queryBuilderFn) {
        var _this = this;
        var requestOptions = Request_1.RequestUtils.isOptions(optionsOrQueryBuilderFn) ? optionsOrQueryBuilderFn : {};
        if (Utils.isFunction(optionsOrQueryBuilderFn))
            queryBuilderFn = optionsOrQueryBuilderFn;
        return Utils_3.promiseMethod(function () {
            uri = _this._getRequestURI(uri);
            return queryBuilderFn ?
                _this._getPartialDocument(uri, requestOptions, queryBuilderFn) :
                _this._getFullDocument(uri, requestOptions);
        });
    };
    Documents.prototype.exists = function (documentURI, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            _this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.RDFSource);
            return _this._sendRequest(HTTPMethod_1.HTTPMethod.HEAD, documentURI, requestOptions);
        }).then(function () {
            return true;
        }).catch(function (error) {
            if (error.statusCode === 404)
                return false;
            return Promise.reject(error);
        });
    };
    Documents.prototype.createChild = function (parentURI, childObject, slugOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        requestOptions = !Utils.isString(slugOrRequestOptions) && !!slugOrRequestOptions ? slugOrRequestOptions : requestOptions;
        return Utils_3.promiseMethod(function () {
            parentURI = _this._getRequestURI(parentURI);
            Request_1.RequestUtils.setPreferredRetrieval("minimal", requestOptions);
            return _this._persistChildDocument(parentURI, childObject, slug, requestOptions);
        });
    };
    Documents.prototype.createChildren = function (parentURI, childrenObjects, slugsOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slugs = Utils.isArray(slugsOrRequestOptions) ? slugsOrRequestOptions : [];
        requestOptions = !Utils.isArray(slugsOrRequestOptions) && !!slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;
        return Utils_3.promiseMethod(function () {
            parentURI = _this._getRequestURI(parentURI);
            Request_1.RequestUtils.setPreferredRetrieval("minimal", requestOptions);
            var creationPromises = childrenObjects
                .map(function (childObject, index) {
                var cloneOptions = Request_1.RequestUtils.cloneOptions(requestOptions);
                return _this._persistChildDocument(parentURI, childObject, slugs[index], cloneOptions);
            });
            return Promise.all(creationPromises);
        });
    };
    Documents.prototype.createChildAndRetrieve = function (parentURI, childObject, slugOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        requestOptions = Request_1.RequestUtils.isOptions(slugOrRequestOptions) ? slugOrRequestOptions : requestOptions;
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        return Utils_3.promiseMethod(function () {
            parentURI = _this._getRequestURI(parentURI);
            Request_1.RequestUtils.setPreferredRetrieval("representation", requestOptions);
            return _this._persistChildDocument(parentURI, childObject, slug, requestOptions);
        });
    };
    Documents.prototype.createChildrenAndRetrieve = function (parentURI, childrenObjects, slugsOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slugs = Utils.isArray(slugsOrRequestOptions) ? slugsOrRequestOptions : [];
        requestOptions = !Utils.isArray(slugsOrRequestOptions) && !!slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;
        return Utils_3.promiseMethod(function () {
            parentURI = _this._getRequestURI(parentURI);
            Request_1.RequestUtils.setPreferredRetrieval("representation", requestOptions);
            var creationPromises = childrenObjects
                .map(function (childObject, index) {
                var cloneOptions = Request_1.RequestUtils.cloneOptions(requestOptions);
                return _this._persistChildDocument(parentURI, childObject, slugs[index], cloneOptions);
            });
            return Promise.all(creationPromises);
        });
    };
    Documents.prototype.listChildren = function (parentURI, requestOptions) {
        if (requestOptions === void 0) { requestOptions = {}; }
        return this._executeChildrenBuilder(parentURI, requestOptions, emptyQueryBuildFn);
    };
    Documents.prototype.getChildren = function (parentURI, requestOptionsOrQueryBuilderFn, queryBuilderFn) {
        var requestOptions = Request_1.RequestUtils.isOptions(requestOptionsOrQueryBuilderFn) ? requestOptionsOrQueryBuilderFn : {};
        queryBuilderFn = Utils.isFunction(requestOptionsOrQueryBuilderFn) ? requestOptionsOrQueryBuilderFn : queryBuilderFn;
        Request_1.RequestUtils.setRetrievalPreferences({ include: [C_1.C.PreferDocumentETags] }, requestOptions);
        return this._executeChildrenBuilder(parentURI, requestOptions, queryBuilderFn);
    };
    Documents.prototype.createAccessPoint = function (documentURI, accessPoint, slugOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        requestOptions = !Utils.isString(slugOrRequestOptions) && !!slugOrRequestOptions ? slugOrRequestOptions : requestOptions;
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            Request_1.RequestUtils.setPreferredRetrieval("minimal", requestOptions);
            return _this._persistAccessPoint(documentURI, accessPoint, slug, requestOptions);
        });
    };
    Documents.prototype.createAccessPoints = function (documentURI, accessPoints, slugsOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slugs = Utils.isArray(slugsOrRequestOptions) ? slugsOrRequestOptions : [];
        requestOptions = !Utils.isArray(slugsOrRequestOptions) && !!slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            Request_1.RequestUtils.setPreferredRetrieval("minimal", requestOptions);
            var creationPromises = accessPoints
                .map(function (accessPoint, index) {
                var cloneOptions = Request_1.RequestUtils.cloneOptions(requestOptions);
                return _this._persistAccessPoint(documentURI, accessPoint, slugs[index], cloneOptions);
            });
            return Promise.all(creationPromises);
        });
    };
    Documents.prototype.listMembers = function (uri, requestOptions) {
        if (requestOptions === void 0) { requestOptions = {}; }
        return this._executeMembersBuilder(uri, requestOptions, emptyQueryBuildFn);
    };
    Documents.prototype.getMembers = function (uri, requestOptionsOrQueryBuilderFn, queryBuilderFn) {
        var requestOptions = Request_1.RequestUtils.isOptions(requestOptionsOrQueryBuilderFn) ? requestOptionsOrQueryBuilderFn : {};
        queryBuilderFn = Utils.isFunction(requestOptionsOrQueryBuilderFn) ? requestOptionsOrQueryBuilderFn : queryBuilderFn;
        Request_1.RequestUtils.setRetrievalPreferences({ include: [C_1.C.PreferDocumentETags] }, requestOptions);
        return this._executeMembersBuilder(uri, requestOptions, queryBuilderFn);
    };
    Documents.prototype.addMember = function (documentURI, memberORUri, requestOptions) {
        if (requestOptions === void 0) { requestOptions = {}; }
        return this.addMembers(documentURI, [memberORUri], requestOptions);
    };
    Documents.prototype.addMembers = function (documentURI, members, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            var targetMembers = _this._parseMembers(members);
            documentURI = _this._getRequestURI(documentURI);
            _this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.Container);
            Request_1.RequestUtils.setContentTypeHeader("application/ld+json", requestOptions);
            var freeResources = FreeResources_1.FreeResources.createFrom({ _documents: _this });
            freeResources.createResourceFrom(AddMemberAction_1.AddMemberAction.createFrom({ targetMembers: targetMembers }));
            var body = JSON.stringify(freeResources);
            return _this
                ._sendRequest(HTTPMethod_1.HTTPMethod.PUT, documentURI, requestOptions, body)
                .then(function () { });
        });
    };
    Documents.prototype.removeMember = function (documentURI, memberORUri, requestOptions) {
        if (requestOptions === void 0) { requestOptions = {}; }
        return this.removeMembers(documentURI, [memberORUri], requestOptions);
    };
    Documents.prototype.removeMembers = function (documentURI, members, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            var targetMembers = _this._parseMembers(members);
            documentURI = _this._getRequestURI(documentURI);
            _this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.Container);
            Request_1.RequestUtils.setContentTypeHeader("application/ld+json", requestOptions);
            var containerRetrievalPreferences = {
                include: [C_1.C.PreferSelectedMembershipTriples],
                omit: [C_1.C.PreferMembershipTriples],
            };
            Request_1.RequestUtils.setRetrievalPreferences(containerRetrievalPreferences, requestOptions);
            var freeResources = FreeResources_1.FreeResources.createFrom({ _documents: _this });
            freeResources.createResourceFrom(RemoveMemberAction_1.RemoveMemberAction.createFrom({ targetMembers: targetMembers }));
            var body = JSON.stringify(freeResources);
            return _this
                ._sendRequest(HTTPMethod_1.HTTPMethod.DELETE, documentURI, requestOptions, body)
                .then(function () { });
        });
    };
    Documents.prototype.removeAllMembers = function (documentURI, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            _this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.Container);
            var containerRetrievalPreferences = {
                include: [
                    C_1.C.PreferMembershipTriples,
                ],
                omit: [
                    C_1.C.PreferMembershipResources,
                    C_1.C.PreferContainmentTriples,
                    C_1.C.PreferContainmentResources,
                    C_1.C.PreferContainer,
                ],
            };
            Request_1.RequestUtils.setRetrievalPreferences(containerRetrievalPreferences, requestOptions);
            return _this
                ._sendRequest(HTTPMethod_1.HTTPMethod.DELETE, documentURI, requestOptions)
                .then(function () { });
        });
    };
    Documents.prototype.save = function (persistedDocument, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            if (!Document_1.Document.is(persistedDocument))
                throw new Errors.IllegalArgumentError("Provided element is not a valid persisted document.");
            Request_1.RequestUtils.setPreferredRetrieval("minimal", requestOptions);
            return _this._patchDocument(persistedDocument, requestOptions);
        });
    };
    Documents.prototype.refresh = function (persistedDocument, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils.promiseMethod(function () {
            if (!Document_1.Document.is(persistedDocument))
                throw new Errors.IllegalArgumentError("Provided element is not a valid persisted document.");
            return persistedDocument.isPartial() ?
                _this._refreshPartialDocument(persistedDocument, requestOptions) :
                _this._refreshFullDocument(persistedDocument, requestOptions);
        });
    };
    Documents.prototype.saveAndRefresh = function (persistedDocument, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            if (!Document_1.Document.is(persistedDocument))
                throw new Errors.IllegalArgumentError("Provided element is not a valid persisted document.");
            var cloneOptions = Request_1.RequestUtils.cloneOptions(requestOptions);
            Request_1.RequestUtils.setPreferredRetrieval(persistedDocument.isPartial() ? "minimal" : "representation", cloneOptions);
            return _this._patchDocument(persistedDocument, cloneOptions);
        }).then(function () {
            if (!persistedDocument.isPartial())
                return persistedDocument;
            return _this._refreshPartialDocument(persistedDocument, requestOptions);
        });
    };
    Documents.prototype.delete = function (documentURI, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            _this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.RDFSource);
            return _this._sendRequest(HTTPMethod_1.HTTPMethod.DELETE, documentURI, requestOptions);
        }).then(function () {
            var pointerID = _this._getPointerID(documentURI);
            _this.pointers.delete(pointerID);
        });
    };
    Documents.prototype.getGeneralSchema = function () {
        if (!this.context)
            return new ObjectSchema_1.DigestedObjectSchema();
        return this.context.getObjectSchema();
    };
    Documents.prototype.hasSchemaFor = function (object, path) {
        if (path !== void 0)
            return false;
        return "@id" in object || "id" in object;
    };
    Documents.prototype.getSchemaFor = function (object) {
        return ("@id" in object) ?
            this._getDigestedObjectSchemaForExpandedObject(object) :
            this._getDigestedObjectSchemaForDocument(object);
    };
    Documents.prototype.executeRawASKQuery = function (documentURI, askQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            if (_this.context && _this.context.auth && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return Service_1.SPARQLService
                .executeRawASKQuery(documentURI, askQuery, requestOptions)
                .then(function (_a) {
                var rawResults = _a[0];
                return rawResults;
            })
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Documents.prototype.executeASKQuery = function (documentURI, askQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            if (_this.context && _this.context.auth && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return Service_1.SPARQLService
                .executeASKQuery(documentURI, askQuery, requestOptions)
                .then(function (_a) {
                var rawResults = _a[0];
                return rawResults;
            })
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Documents.prototype.executeRawSELECTQuery = function (documentURI, selectQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            if (_this.context && _this.context.auth && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return Service_1.SPARQLService
                .executeRawSELECTQuery(documentURI, selectQuery, requestOptions)
                .then(function (_a) {
                var rawResults = _a[0];
                return rawResults;
            })
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Documents.prototype.executeSELECTQuery = function (documentURI, selectQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            if (_this.context && _this.context.auth && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return Service_1.SPARQLService
                .executeSELECTQuery(documentURI, selectQuery, _this, requestOptions)
                .then(function (_a) {
                var selectResults = _a[0];
                return selectResults;
            })
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Documents.prototype.executeRawCONSTRUCTQuery = function (documentURI, constructQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            if (_this.context && _this.context.auth && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return Service_1.SPARQLService
                .executeRawCONSTRUCTQuery(documentURI, constructQuery, requestOptions)
                .then(function (_a) {
                var strConstruct = _a[0];
                return strConstruct;
            })
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Documents.prototype.executeRawDESCRIBEQuery = function (documentURI, describeQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            if (_this.context && _this.context.auth && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return Service_1.SPARQLService
                .executeRawDESCRIBEQuery(documentURI, describeQuery, requestOptions)
                .then(function (_a) {
                var strDescribe = _a[0];
                return strDescribe;
            })
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Documents.prototype.executeUPDATE = function (documentURI, update, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_3.promiseMethod(function () {
            documentURI = _this._getRequestURI(documentURI);
            if (_this.context && _this.context.auth && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return Service_1.SPARQLService
                .executeUPDATE(documentURI, update, requestOptions)
                .then(function () { })
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Documents.prototype.sparql = function (documentURI) {
        var builder = new Builder_1.SPARQLBuilder(this, this._getRequestURI(documentURI));
        if (this.context) {
            var schema = this._getProcessedSchema();
            builder = builder
                .base(schema.base)
                .vocab(schema.vocab);
            schema.prefixes.forEach(function (uri, prefix) {
                builder = builder.prefix(prefix, uri);
            });
        }
        return builder;
    };
    Documents.prototype.on = function (event, uriPattern, onEvent, onError) {
        try {
            Utils_1.validateEventContext(this.context);
            var destination = Utils_1.createDestination(event, uriPattern, this.context.baseURI);
            this.context.messaging.subscribe(destination, onEvent, onError);
        }
        catch (error) {
            if (!onError)
                throw error;
            onError(error);
        }
    };
    Documents.prototype.off = function (event, uriPattern, onEvent, onError) {
        try {
            Utils_1.validateEventContext(this.context);
            var destination = Utils_1.createDestination(event, uriPattern, this.context.baseURI);
            this.context.messaging.unsubscribe(destination, onEvent);
        }
        catch (error) {
            if (!onError)
                throw error;
            onError(error);
        }
    };
    Documents.prototype.one = function (event, uriPattern, onEvent, onError) {
        var self = this;
        this.on(event, uriPattern, function onEventWrapper(message) {
            onEvent(message);
            self.off(event, uriPattern, onEventWrapper, onError);
        }, onError);
    };
    Documents.prototype.onDocumentCreated = function (uriPattern, onEvent, onError) {
        return this.on(Event_1.Event.DOCUMENT_CREATED, uriPattern, onEvent, onError);
    };
    Documents.prototype.onChildCreated = function (uriPattern, onEvent, onError) {
        return this.on(Event_1.Event.CHILD_CREATED, uriPattern, onEvent, onError);
    };
    Documents.prototype.onAccessPointCreated = function (uriPattern, onEvent, onError) {
        return this.on(Event_1.Event.ACCESS_POINT_CREATED, uriPattern, onEvent, onError);
    };
    Documents.prototype.onDocumentModified = function (uriPattern, onEvent, onError) {
        return this.on(Event_1.Event.DOCUMENT_MODIFIED, uriPattern, onEvent, onError);
    };
    Documents.prototype.onDocumentDeleted = function (uriPattern, onEvent, onError) {
        return this.on(Event_1.Event.DOCUMENT_DELETED, uriPattern, onEvent, onError);
    };
    Documents.prototype.onMemberAdded = function (uriPattern, onEvent, onError) {
        return this.on(Event_1.Event.MEMBER_ADDED, uriPattern, onEvent, onError);
    };
    Documents.prototype.onMemberRemoved = function (uriPattern, onEvent, onError) {
        return this.on(Event_1.Event.MEMBER_REMOVED, uriPattern, onEvent, onError);
    };
    Documents.prototype._convertRDFDocument = function (rdfDocument, response) {
        var documentResources = Document_2.RDFDocument.getNodes(rdfDocument)[0];
        if (documentResources.length === 0)
            throw new BadResponseError_1.BadResponseError("The RDFDocument: " + rdfDocument["@id"] + ", doesn't contain a document resource.", response);
        if (documentResources.length > 1)
            throw new BadResponseError_1.BadResponseError("The RDFDocument: " + rdfDocument["@id"] + ", contains more than one document resource.", response);
        var persistedDocument = new Compacter_1.JSONLDCompacter(this)
            .compactDocument(rdfDocument);
        persistedDocument._resolved = true;
        return persistedDocument;
    };
    Documents.prototype._getFreeResources = function (nodes) {
        var freeResourcesDocument = FreeResources_1.FreeResources.createFrom({ _documents: this });
        var resources = nodes.map(function (node) { return freeResourcesDocument.createResource(node["@id"]); });
        this._compact(nodes, resources, freeResourcesDocument);
        return freeResourcesDocument;
    };
    Documents.prototype._parseErrorResponse = function (response) {
        var _this = this;
        if (response instanceof Error)
            return Promise.reject(response);
        if (!(response.status >= 400 && response.status < 600 && Errors_1.statusCodeMap.has(response.status)))
            return Promise.reject(new UnknownError_1.UnknownError(response.data, response));
        var error = new (Errors_1.statusCodeMap.get(response.status))(response.data, response);
        if (!response.data || !this.context)
            return Promise.reject(error);
        return new Parser_1.JSONLDParser()
            .parse(response.data)
            .then(function (freeNodes) {
            var freeResources = _this._getFreeResources(freeNodes);
            var errorResponses = freeResources
                .getResources()
                .filter(function (resource) { return resource.hasType(ErrorResponse_1.ErrorResponse.TYPE); });
            if (errorResponses.length === 0)
                return Promise.reject(new Errors.IllegalArgumentError("The response string does not contains a c:ErrorResponse."));
            if (errorResponses.length > 1)
                return Promise.reject(new Errors.IllegalArgumentError("The response string contains multiple c:ErrorResponse."));
            Object.assign(error, errorResponses[0]);
            error.message = ErrorResponse_1.ErrorResponse.getMessage(error);
            return Promise.reject(error);
        }, function () {
            return Promise.reject(error);
        });
    };
    Documents.prototype._getFullDocument = function (uri, requestOptions) {
        var _this = this;
        if (this.hasPointer(uri) && !requestOptions.ensureLatest) {
            var pointer = this.getPointer(uri);
            if (pointer.isResolved() && !pointer.isPartial())
                return pointer;
        }
        this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.RDFSource);
        if (this.documentsBeingResolved.has(uri))
            return this.documentsBeingResolved.get(uri);
        var promise = this
            ._sendRequest(HTTPMethod_1.HTTPMethod.GET, uri, requestOptions, null, new Document_2.RDFDocumentParser())
            .then(function (_a) {
            var rdfDocuments = _a[0], response = _a[1];
            var eTag = response.getETag();
            if (eTag === null)
                throw new BadResponseError_1.BadResponseError("The response doesn't contain an ETag", response);
            var targetURI = uri;
            var locationHeader = response.getHeader("Content-Location");
            if (locationHeader) {
                if (locationHeader.values.length !== 1)
                    throw new BadResponseError_1.BadResponseError("The response must contain one Content-Location header.", response);
                var locationString = "" + locationHeader;
                if (!locationString)
                    throw new BadResponseError_1.BadResponseError("The response doesn't contain a valid 'Content-Location' header.", response);
                targetURI = locationString;
            }
            var rdfDocument = _this._getRDFDocument(targetURI, rdfDocuments, response);
            if (rdfDocument === null)
                throw new BadResponseError_1.BadResponseError("No document was returned.", response);
            var document = _this._convertRDFDocument(rdfDocument, response);
            document._eTag = eTag;
            _this.documentsBeingResolved.delete(uri);
            return document;
        }).catch(function (error) {
            _this.documentsBeingResolved.delete(uri);
            return Promise.reject(error);
        });
        this.documentsBeingResolved.set(uri, promise);
        return promise;
    };
    Documents.prototype._getPartialDocument = function (uri, requestOptions, queryBuilderFn) {
        var queryContext = new QueryContextBuilder_1.QueryContextBuilder(this.context);
        var documentProperty = queryContext
            .addProperty("document")
            .setOptional(false);
        var propertyValue = new tokens_1.ValuesToken().addValues(documentProperty.variable, queryContext.compactIRI(uri));
        documentProperty.addPattern(propertyValue);
        Request_1.RequestUtils.setRetrievalPreferences({ include: [C_1.C.PreferDocumentETags] }, requestOptions);
        return this
            ._executeQueryBuilder(uri, requestOptions, queryContext, documentProperty, queryBuilderFn)
            .then(function (documents) { return documents[0]; });
    };
    Documents.prototype._patchDocument = function (persistedDocument, requestOptions) {
        var _this = this;
        var uri = this._getRequestURI(persistedDocument.id);
        if (!persistedDocument.isDirty())
            return persistedDocument;
        if (persistedDocument.isLocallyOutDated())
            throw new Errors.IllegalStateError("Cannot save an outdated document.");
        this._setDefaultRequestOptions(requestOptions);
        Request_1.RequestUtils.setContentTypeHeader("text/ldpatch", requestOptions);
        Request_1.RequestUtils.setIfMatchHeader(persistedDocument._eTag, requestOptions);
        persistedDocument._normalize();
        var deltaCreator = new DeltaCreator_1.DeltaCreator(this.jsonldConverter);
        [persistedDocument].concat(persistedDocument.getFragments()).forEach(function (resource) {
            var schema = _this.getSchemaFor(resource);
            deltaCreator.addResource(schema, resource._snapshot, resource);
        });
        var body = deltaCreator.getPatch();
        return this
            ._sendRequest(HTTPMethod_1.HTTPMethod.PATCH, uri, requestOptions, body)
            .then(function (response) {
            return _this._applyResponseData(persistedDocument, response);
        });
    };
    Documents.prototype._refreshFullDocument = function (persistedDocument, requestOptions) {
        var _this = this;
        var uri = this._getRequestURI(persistedDocument.id);
        this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.RDFSource);
        Request_1.RequestUtils.setIfNoneMatchHeader(persistedDocument._eTag, requestOptions);
        return this
            ._sendRequest(HTTPMethod_1.HTTPMethod.GET, uri, requestOptions, null, new Document_2.RDFDocumentParser())
            .then(function (_a) {
            var rdfDocuments = _a[0], response = _a[1];
            if (response === null)
                return persistedDocument;
            var eTag = response.getETag();
            if (eTag === null)
                throw new BadResponseError_1.BadResponseError("The response doesn't contain an ETag.", response);
            var rdfDocument = _this._getRDFDocument(uri, rdfDocuments, response);
            if (rdfDocument === null)
                throw new BadResponseError_1.BadResponseError("No document was returned.", response);
            var updatedPersistedDocument = _this._convertRDFDocument(rdfDocument, response);
            updatedPersistedDocument._eTag = eTag;
            return updatedPersistedDocument;
        }).catch(function (error) {
            if (error.statusCode === 304)
                return persistedDocument;
            return Promise.reject(error);
        });
    };
    Documents.prototype._refreshPartialDocument = function (persistedDocument, requestOptions) {
        var uri = this._getRequestURI(persistedDocument.id);
        var queryContext = new QueryContextPartial_1.QueryContextPartial(persistedDocument, this.context);
        var targetName = "document";
        var constructPatterns = new tokens_1.OptionalToken()
            .addPattern(new tokens_1.ValuesToken()
            .addValues(queryContext.getVariable(targetName), new tokens_1.IRIToken(uri)));
        this._addRefreshQueryPatterns(queryContext, constructPatterns, persistedDocument, targetName);
        Request_1.RequestUtils.setRetrievalPreferences({ include: [C_1.C.PreferDocumentETags] }, requestOptions);
        return this
            ._executeConstructPatterns(uri, requestOptions, queryContext, targetName, constructPatterns.patterns, persistedDocument)
            .then(function (documents) { return documents[0]; });
    };
    Documents.prototype._addRefreshQueryPatterns = function (queryContext, parentAdder, resource, parentName) {
        var _this = this;
        if (resource._partialMetadata.schema === PartialMetadata_1.PartialMetadata.ALL) {
            parentAdder.addPattern(Utils_2.createAllPattern(queryContext, parentName));
            return;
        }
        parentAdder.addPattern(Utils_2.createTypesPattern(queryContext, parentName));
        resource._partialMetadata.schema.properties.forEach(function (digestedProperty, propertyName) {
            var path = parentName + "." + propertyName;
            var propertyPattern = (_a = new tokens_1.OptionalToken()).addPattern.apply(_a, Utils_2.createPropertyPatterns(queryContext, parentName, path, digestedProperty));
            parentAdder.addPattern(propertyPattern);
            var propertyValues = Array.isArray(resource[propertyName]) ? resource[propertyName] : [resource[propertyName]];
            var propertyFragment = propertyValues
                .filter(Fragment_1.Fragment.is)
                .find(function (fragment) { return fragment.isPartial(); });
            if (!propertyFragment)
                return;
            _this._addRefreshQueryPatterns(queryContext, propertyPattern, propertyFragment, path);
            var _a;
        });
    };
    Documents.prototype._executeChildrenBuilder = function (uri, requestOptions, queryBuilderFn) {
        var _this = this;
        return Utils_3.promiseMethod(function () {
            uri = _this._getRequestURI(uri);
            var queryContext = new QueryContextBuilder_1.QueryContextBuilder(_this.context);
            var childrenProperty = queryContext
                .addProperty("child")
                .setOptional(false);
            var selectChildren = new tokens_1.SelectToken("DISTINCT")
                .addVariable(childrenProperty.variable)
                .addPattern(new tokens_1.SubjectToken(queryContext.compactIRI(uri))
                .addPredicate(new tokens_1.PredicateToken(queryContext.compactIRI(LDP_2.LDP.contains))
                .addObject(childrenProperty.variable)));
            childrenProperty.addPattern(selectChildren);
            return _this._executeQueryBuilder(uri, requestOptions, queryContext, childrenProperty, queryBuilderFn);
        });
    };
    Documents.prototype._executeMembersBuilder = function (uri, requestOptions, queryBuilderFn) {
        var _this = this;
        return Utils_3.promiseMethod(function () {
            uri = _this._getRequestURI(uri);
            var queryContext = new QueryContextBuilder_1.QueryContextBuilder(_this.context);
            var membersProperty = queryContext
                .addProperty("member")
                .setOptional(false);
            var membershipResource = queryContext.getVariable("membershipResource");
            var hasMemberRelation = queryContext.getVariable("hasMemberRelation");
            var selectMembers = new tokens_1.SelectToken("DISTINCT")
                .addVariable(membersProperty.variable)
                .addPattern(new tokens_1.SubjectToken(queryContext.compactIRI(uri))
                .addPredicate(new tokens_1.PredicateToken(queryContext.compactIRI(LDP_2.LDP.membershipResource))
                .addObject(membershipResource))
                .addPredicate(new tokens_1.PredicateToken(queryContext.compactIRI(LDP_2.LDP.hasMemberRelation))
                .addObject(hasMemberRelation)))
                .addPattern(new tokens_1.SubjectToken(membershipResource)
                .addPredicate(new tokens_1.PredicateToken(hasMemberRelation)
                .addObject(membersProperty.variable)));
            membersProperty.addPattern(selectMembers);
            return _this._executeQueryBuilder(uri, requestOptions, queryContext, membersProperty, queryBuilderFn);
        });
    };
    Documents.prototype._executeQueryBuilder = function (uri, requestOptions, queryContext, targetProperty, queryBuilderFn) {
        var Builder = targetProperty.name === "document" ?
            QueryDocumentBuilder_1.QueryDocumentBuilder : QueryDocumentsBuilder_1.QueryDocumentsBuilder;
        var queryBuilder = new Builder(queryContext, targetProperty);
        targetProperty.setType(queryBuilderFn ?
            queryBuilderFn === emptyQueryBuildFn ?
                QueryProperty_1.QueryPropertyType.EMPTY :
                QueryProperty_1.QueryPropertyType.PARTIAL :
            QueryProperty_1.QueryPropertyType.FULL);
        if (queryBuilderFn && queryBuilderFn.call(void 0, queryBuilder) !== queryBuilder)
            throw new Errors.IllegalArgumentError("The provided query builder was not returned");
        var constructPatterns = targetProperty.getPatterns();
        return this
            ._executeConstructPatterns(uri, requestOptions, queryContext, targetProperty.name, constructPatterns)
            .then(function (documents) {
            if (queryBuilder instanceof QueryDocumentsBuilder_1.QueryDocumentsBuilder && queryBuilder._orderData) {
                var _a = queryBuilder._orderData, path_1 = _a.path, flow = _a.flow;
                var inverter_1 = flow === "DESC" ? -1 : 1;
                documents.sort(function (a, b) {
                    a = Utils_2.getPathProperty(a, path_1);
                    b = Utils_2.getPathProperty(b, path_1);
                    var aValue = Pointer_1.Pointer.is(a) ? a.id : a;
                    var bValue = Pointer_1.Pointer.is(b) ? b.id : b;
                    if (aValue === bValue)
                        return 0;
                    if (aValue === void 0)
                        return -1 * inverter_1;
                    if (bValue === void 0)
                        return inverter_1;
                    if (!Utils_2.areDifferentType(a, b)) {
                        if (Pointer_1.Pointer.is(a)) {
                            var aIsBNode = URI_1.URI.isBNodeID(aValue);
                            var bIsBNode = URI_1.URI.isBNodeID(bValue);
                            if (aIsBNode && !bIsBNode)
                                return -1 * inverter_1;
                            if (bIsBNode && !aIsBNode)
                                return inverter_1;
                        }
                    }
                    else {
                        if (Pointer_1.Pointer.is(a))
                            return -1 * inverter_1;
                        if (Pointer_1.Pointer.is(b))
                            return inverter_1;
                        if (Utils.isNumber(a))
                            return -1 * inverter_1;
                        if (Utils.isNumber(b))
                            return inverter_1;
                        if (Utils.isDate(a))
                            return -1 * inverter_1;
                        if (Utils.isDate(b))
                            return inverter_1;
                        if (Utils.isBoolean(a))
                            return -1 * inverter_1;
                        if (Utils.isBoolean(b))
                            return inverter_1;
                        if (Utils.isString(a))
                            return -1 * inverter_1;
                        if (Utils.isString(b))
                            return inverter_1;
                    }
                    if (aValue < bValue)
                        return -1 * inverter_1;
                    if (aValue > bValue)
                        return inverter_1;
                });
            }
            return documents;
        });
    };
    Documents.prototype._executeConstructPatterns = function (uri, requestOptions, queryContext, targetName, constructPatterns, targetDocument) {
        var _this = this;
        var queryMetadata = queryContext.getVariable("queryMetadata");
        var accessPointsMetadata = queryContext.getVariable("accessPointsMetadata");
        var construct = (_a = new tokens_1.ConstructToken()
            .addTriple(new tokens_1.SubjectToken(queryMetadata)
            .addPredicate(new tokens_1.PredicateToken("a")
            .addObject(queryContext.compactIRI(C_1.C.VolatileResource))
            .addObject(queryContext.compactIRI(C_1.C.QueryMetadata)))
            .addPredicate(new tokens_1.PredicateToken(queryContext.compactIRI(C_1.C.target))
            .addObject(queryContext.getVariable(targetName))))
            .addPattern(new tokens_1.BindToken("BNODE()", queryMetadata))
            .addPattern("{ " + new tokens_1.BindToken("BNODE()", accessPointsMetadata) + " }")).addPattern.apply(_a, constructPatterns);
        var query = (_b = new tokens_1.QueryToken(construct)).addPrologues.apply(_b, queryContext.getPrologues());
        var accessPointsTriple = new tokens_1.SubjectToken(accessPointsMetadata)
            .addPredicate(new tokens_1.PredicateToken("a")
            .addObject(queryContext.compactIRI(C_1.C.VolatileResource))
            .addObject(queryContext.compactIRI(C_1.C.AccessPointsMetadata)));
        construct.addTriple(accessPointsTriple);
        Utils_2.getResourcesVariables(constructPatterns)
            .forEach(function (resource) {
            var name = resource.name.replace(/__/g, ".");
            var accessPoints = queryContext.getVariable(name + ".accessPoints");
            var relation = queryContext.getVariable(name + ".accessPoints.hasMemberRelation");
            construct
                .addPattern(new tokens_1.OptionalToken()
                .addPattern(new tokens_1.SubjectToken(resource)
                .addPredicate(new tokens_1.PredicateToken(queryContext.compactIRI(C_1.C.accessPoint))
                .addObject(accessPoints)))
                .addPattern(new tokens_1.SubjectToken(accessPoints)
                .addPredicate(new tokens_1.PredicateToken(queryContext.compactIRI(LDP_2.LDP.hasMemberRelation))
                .addObject(relation))));
            accessPointsTriple
                .addPredicate(new tokens_1.PredicateToken(relation)
                .addObject(accessPoints));
        });
        var triples = Utils_2.getAllTriples(constructPatterns);
        construct.addTriple.apply(construct, triples);
        Request_1.RequestUtils.setRetrievalPreferences({ include: [C_1.C.PreferResultsContext] }, requestOptions);
        return this
            .executeRawCONSTRUCTQuery(uri, query.toString(), requestOptions)
            .then(function (jsonldString) {
            return new Parser_1.JSONLDParser().parse(jsonldString);
        }).then(function (rdfNodes) {
            var targetETag = targetDocument && targetDocument._eTag;
            if (targetDocument)
                targetDocument._eTag = void 0;
            var freeResources = _this
                ._getFreeResources(Node_1.RDFNode.getFreeNodes(rdfNodes))
                .getResources();
            freeResources
                .filter(ResponseMetadata_1.ResponseMetadata.is)
                .map(function (responseMetadata) { return responseMetadata.documentsMetadata || responseMetadata[C_1.C.documentMetadata]; })
                .map(function (documentsMetadata) { return Array.isArray(documentsMetadata) ? documentsMetadata : [documentsMetadata]; })
                .forEach(function (documentsMetadata) { return documentsMetadata.forEach(function (documentMetadata) {
                if (!documentMetadata)
                    return;
                var relatedDocument = documentMetadata.relatedDocument || documentMetadata[C_1.C.relatedDocument];
                var eTag = documentMetadata.eTag || documentMetadata[C_1.C.eTag];
                if (!eTag)
                    return;
                relatedDocument._resolved = true;
                if (relatedDocument._eTag === void 0)
                    relatedDocument._eTag = eTag;
                if (relatedDocument._eTag !== eTag)
                    relatedDocument._eTag = null;
            }); });
            if (targetDocument && targetETag === targetDocument._eTag)
                return [targetDocument];
            var rdfDocuments = rdfNodes
                .filter(Document_2.RDFDocument.is);
            var targetSet = new Set(freeResources
                .filter(QueryMetadata_1.QueryMetadata.is)
                .map(function (x) { return _this.context ? x.target : x[C_1.C.target]; })
                .reduce(function (targets, currentTargets) { return targets.concat(currentTargets); }, [])
                .map(function (x) { return x.id; }));
            var targetDocuments = rdfDocuments
                .filter(function (x) { return targetSet.has(x["@id"]); });
            var documents = new Compacter_1.JSONLDCompacter(_this, targetName, queryContext)
                .compactDocuments(rdfDocuments, targetDocuments);
            var accessPointsMetadatas = freeResources
                .filter(LDP_1.AccessPointsMetadata.is);
            _this._applyAccessPointsMetadatas(accessPointsMetadatas);
            return documents;
        });
        var _a, _b;
    };
    Documents.prototype._persistChildDocument = function (parentURI, childObject, slug, requestOptions) {
        if (Document_1.Document.is(childObject))
            throw new Errors.IllegalArgumentError("The child provided has been already persisted.");
        var childDocument = Document_1.TransientDocument.is(childObject) ? childObject : Document_1.TransientDocument.createFrom(childObject);
        this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.Container);
        return this._persistDocument(parentURI, slug, childDocument, requestOptions);
    };
    Documents.prototype._persistAccessPoint = function (documentURI, accessPoint, slug, requestOptions) {
        if (Document_1.Document.is(accessPoint))
            throw new Errors.IllegalArgumentError("The access-point provided has been already persisted.");
        var accessPointDocument = AccessPoint_1.TransientAccessPoint.is(accessPoint) ?
            accessPoint : AccessPoint_1.TransientAccessPoint.createFrom(accessPoint);
        if (!accessPointDocument.membershipResource)
            accessPointDocument.membershipResource = this.getPointer(documentURI);
        else if (accessPointDocument.membershipResource.id !== documentURI)
            throw new Errors.IllegalArgumentError("The documentURI must be the same as the accessPoint's membershipResource.");
        this._setDefaultRequestOptions(requestOptions, LDP_2.LDP.RDFSource);
        return this._persistDocument(documentURI, slug, accessPointDocument, requestOptions);
    };
    Documents.prototype._persistDocument = function (parentURI, slug, document, requestOptions) {
        var _this = this;
        Request_1.RequestUtils.setContentTypeHeader("application/ld+json", requestOptions);
        if (document.id) {
            var childURI = document.id;
            if (!!this.context)
                childURI = this.context.resolve(childURI);
            if (!URI_1.URI.isBaseOf(parentURI, childURI)) {
                return Promise.reject(new Errors.IllegalArgumentError("The document's URI is not relative to the parentURI specified"));
            }
        }
        if (document["__CarbonSDK_InProgressOfPersisting"])
            return Promise.reject(new Errors.IllegalArgumentError("The document is already being persisted."));
        Object.defineProperty(document, "__CarbonSDK_InProgressOfPersisting", { configurable: true, enumerable: false, writable: false, value: true });
        var body = JSON.stringify(document.toJSON(this, this.jsonldConverter));
        if (!!slug)
            Request_1.RequestUtils.setSlug(slug, requestOptions);
        return this
            ._sendRequest(HTTPMethod_1.HTTPMethod.POST, parentURI, requestOptions, body)
            .then(function (response) {
            delete document["__CarbonSDK_InProgressOfPersisting"];
            var locationHeader = response.getHeader("Location");
            if (locationHeader === null || locationHeader.values.length < 1)
                throw new BadResponseError_1.BadResponseError("The response is missing a Location header.", response);
            if (locationHeader.values.length !== 1)
                throw new BadResponseError_1.BadResponseError("The response contains more than one Location header.", response);
            var localID = _this._getPointerID(locationHeader.values[0].toString());
            _this.pointers.set(localID, _this._createPointerFrom(document, localID));
            var persistedDocument = ProtectedDocument_1.ProtectedDocument.decorate(document, _this);
            persistedDocument.getFragments().forEach(Fragment_1.Fragment.decorate);
            return _this._applyResponseData(persistedDocument, response);
        }).catch(function (error) {
            delete document["__CarbonSDK_InProgressOfPersisting"];
            return Promise.reject(error);
        });
    };
    Documents.prototype._getRDFDocument = function (requestURL, rdfDocuments, response) {
        rdfDocuments = rdfDocuments.filter(function (rdfDocument) { return rdfDocument["@id"] === requestURL; });
        if (rdfDocuments.length > 1)
            throw new BadResponseError_1.BadResponseError("Several documents share the same id.", response);
        return rdfDocuments.length > 0 ? rdfDocuments[0] : null;
    };
    Documents.prototype._getPointerID = function (uri) {
        if (URI_1.URI.isBNodeID(uri))
            throw new Errors.IllegalArgumentError("BNodes cannot be fetched directly.");
        if (!!this.context) {
            uri = ObjectSchema_1.ObjectSchemaUtils.resolveURI(uri, this.getGeneralSchema());
            if (!URI_1.URI.isRelative(uri)) {
                var baseURI = this.context.baseURI;
                if (!URI_1.URI.isBaseOf(baseURI, uri))
                    return null;
                return uri.substring(baseURI.length);
            }
            else {
                return uri[0] === "/" ? uri.substr(1) : uri;
            }
        }
        else {
            if (URI_1.URI.isPrefixed(uri))
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support prefixed URIs.");
            if (URI_1.URI.isRelative(uri))
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support relative URIs.");
            return uri;
        }
    };
    Documents.prototype._createPointer = function (localID) {
        return this._createPointerFrom({}, localID);
    };
    Documents.prototype._createPointerFrom = function (object, localID) {
        var _this = this;
        var pointer = Pointer_1.Pointer.createFrom(object);
        pointer.id = this.context ? this.context.resolve(localID) : localID;
        var resolve = function (requestOptionsOrQueryBuilderFn, queryBuilderFn) {
            var requestOptions;
            if (Utils.isFunction(requestOptionsOrQueryBuilderFn)) {
                requestOptions = {};
                queryBuilderFn = requestOptionsOrQueryBuilderFn;
            }
            else {
                requestOptions = requestOptionsOrQueryBuilderFn;
            }
            if (queryBuilderFn && "types" in pointer) {
                var resource_1 = pointer;
                var superQueryBuilderFn_1 = queryBuilderFn;
                queryBuilderFn = function (_) {
                    resource_1.types.forEach(function (type) { return _.withType(type); });
                    return superQueryBuilderFn_1.call(void 0, _);
                };
            }
            return _this.get(pointer.id, requestOptions, queryBuilderFn);
        };
        Object.defineProperty(pointer, "resolve", {
            writable: false,
            enumerable: false,
            configurable: true,
            value: resolve,
        });
        return pointer;
    };
    Documents.prototype._compact = function (expandedObjectOrObjects, targetObjectOrObjects, pointerLibrary) {
        if (!Utils.isArray(expandedObjectOrObjects))
            return this._compactSingle(expandedObjectOrObjects, targetObjectOrObjects, pointerLibrary);
        var expandedObjects = expandedObjectOrObjects;
        var targetObjects = !!targetObjectOrObjects ? targetObjectOrObjects : [];
        for (var i = 0, length_1 = expandedObjects.length; i < length_1; i++) {
            var expandedObject = expandedObjects[i];
            var targetObject = targetObjects[i] = !!targetObjects[i] ? targetObjects[i] : {};
            this._compactSingle(expandedObject, targetObject, pointerLibrary);
        }
        return targetObjects;
    };
    Documents.prototype._compactSingle = function (expandedObject, targetObject, pointerLibrary) {
        var digestedSchema = this._getDigestedObjectSchemaForExpandedObject(expandedObject);
        return this.jsonldConverter.compact(expandedObject, targetObject, digestedSchema, pointerLibrary);
    };
    Documents.prototype._getDigestedObjectSchemaForExpandedObject = function (expandedObject) {
        var types = Node_1.RDFNode.getTypes(expandedObject);
        return this._getDigestedObjectSchema(types, expandedObject["@id"]);
    };
    Documents.prototype._getDigestedObjectSchemaForDocument = function (document) {
        if (Resource_1.Resource.isDecorated(document) && document.isPartial()) {
            var schemas = [document._partialMetadata.schema];
            return this._getProcessedSchema(schemas);
        }
        else {
            var types = document.types || [];
            return this._getDigestedObjectSchema(types, document.id);
        }
    };
    Documents.prototype._getDigestedObjectSchema = function (objectTypes, objectID) {
        var _this = this;
        if (!this.context)
            return new ObjectSchema_1.DigestedObjectSchema();
        if (Utils.isDefined(objectID) &&
            !URI_1.URI.hasFragment(objectID) &&
            !URI_1.URI.isBNodeID(objectID) &&
            objectTypes.indexOf(Document_1.TransientDocument.TYPE) === -1)
            objectTypes = objectTypes.concat(Document_1.TransientDocument.TYPE);
        var schemas = objectTypes
            .filter(function (type) { return _this.context.hasObjectSchema(type); })
            .map(function (type) { return _this.context.getObjectSchema(type); });
        return this._getProcessedSchema(schemas);
    };
    Documents.prototype._getProcessedSchema = function (objectSchemas) {
        if (objectSchemas === void 0) { objectSchemas = []; }
        objectSchemas.unshift(this.context.getObjectSchema());
        return ObjectSchema_1.ObjectSchemaDigester
            .combineDigestedObjectSchemas(objectSchemas);
    };
    Documents.prototype._getRequestURI = function (uri) {
        if (URI_1.URI.isBNodeID(uri)) {
            throw new Errors.IllegalArgumentError("BNodes cannot be fetched directly.");
        }
        else if (URI_1.URI.isPrefixed(uri)) {
            if (!this.context)
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support prefixed URIs.");
            uri = ObjectSchema_1.ObjectSchemaUtils.resolveURI(uri, this.context.getObjectSchema());
            if (URI_1.URI.isPrefixed(uri))
                throw new Errors.IllegalArgumentError("The prefixed URI \"" + uri + "\" could not be resolved.");
        }
        else if (URI_1.URI.isRelative(uri)) {
            if (!this.context)
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support relative URIs.");
            uri = this.context.resolve(uri);
        }
        else if (this.context && !URI_1.URI.isBaseOf(this.context.baseURI, uri)) {
            throw new Errors.IllegalArgumentError("\"" + uri + "\" isn't a valid URI for this Carbon instance.");
        }
        return uri;
    };
    Documents.prototype._setDefaultRequestOptions = function (requestOptions, interactionModel) {
        if (this.context && this.context.auth && this.context.auth.isAuthenticated())
            this.context.auth.addAuthentication(requestOptions);
        if (interactionModel)
            Request_1.RequestUtils.setPreferredInteractionModel(interactionModel, requestOptions);
        Request_1.RequestUtils.setAcceptHeader("application/ld+json", requestOptions);
        return requestOptions;
    };
    Documents.prototype._updateFromPreferenceApplied = function (persistedDocument, rdfDocuments, response) {
        var eTag = response.getETag();
        if (eTag === null)
            throw new BadResponseError_1.BadResponseError("The response doesn't contain an ETag", response);
        var rdfDocument = this._getRDFDocument(persistedDocument.id, rdfDocuments, response);
        if (rdfDocument === null)
            throw new BadResponseError_1.BadResponseError("No document was returned.", response);
        persistedDocument = this._convertRDFDocument(rdfDocument, response);
        persistedDocument._eTag = eTag;
        return persistedDocument;
    };
    Documents.prototype._parseMembers = function (pointers) {
        var _this = this;
        return pointers.map(function (pointer) {
            if (Utils.isString(pointer))
                return _this.getPointer(pointer);
            if (Pointer_1.Pointer.is(pointer))
                return pointer;
            throw new Errors.IllegalArgumentError("No CarbonLDP.Pointer or URI provided.");
        });
    };
    Documents.prototype._applyResponseData = function (persistedProtectedDocument, response) {
        var _this = this;
        if (response.status === 204 || !response.data)
            return persistedProtectedDocument;
        return new Parser_1.JSONLDParser()
            .parse(response.data)
            .then(function (expandedResult) {
            var freeNodes = Node_1.RDFNode.getFreeNodes(expandedResult);
            _this._applyNodeMap(freeNodes);
            var preferenceHeader = response.getHeader("Preference-Applied");
            if (preferenceHeader === null || preferenceHeader.toString() !== "return=representation")
                return persistedProtectedDocument;
            var rdfDocuments = Document_2.RDFDocument.getDocuments(expandedResult);
            return _this._updateFromPreferenceApplied(persistedProtectedDocument, rdfDocuments, response);
        });
    };
    Documents.prototype._applyNodeMap = function (freeNodes) {
        if (!freeNodes.length)
            return;
        var freeResources = this._getFreeResources(freeNodes);
        var responseMetadata = freeResources.getResources().find(ResponseMetadata_1.ResponseMetadata.is);
        for (var _i = 0, _a = responseMetadata.documentsMetadata; _i < _a.length; _i++) {
            var documentMetadata = _a[_i];
            var document_1 = documentMetadata.relatedDocument;
            for (var _b = 0, _c = documentMetadata.bNodesMap.entries; _b < _c.length; _b++) {
                var _d = _c[_b], entryKey = _d.entryKey, entryValue = _d.entryValue;
                var originalBNode = document_1.getFragment(entryKey.id);
                originalBNode.id = entryValue.id;
                document_1._fragmentsIndex.delete(entryKey.id);
                document_1._fragmentsIndex.set(entryValue.id, originalBNode);
            }
            document_1._syncSavedFragments();
        }
    };
    Documents.prototype._applyAccessPointsMetadatas = function (accessPointsMetadatas) {
        var _this = this;
        if (!accessPointsMetadatas.length)
            return;
        var getResourcesData = this
            ._createMembershipResourceDataGetter();
        accessPointsMetadatas.forEach(function (metadata) {
            var relationURIs = Object.keys(metadata);
            relationURIs.forEach(function (relationURI) {
                var pointers = Array.isArray(metadata[relationURI]) ?
                    metadata[relationURI] : [metadata[relationURI]];
                var compactRelation = function (schema, uris) {
                    if (uris.has(relationURI))
                        return uris.get(relationURI);
                    if (schema.vocab)
                        return URI_1.URI.getRelativeURI(relationURI, schema.vocab);
                    return relationURI;
                };
                pointers.forEach(function (pointer) {
                    var resourceURI = pointer.id
                        .split("/")
                        .slice(0, -2)
                        .concat("")
                        .join("/");
                    var _a = getResourcesData(resourceURI), resource = _a.resource, schema = _a.schema, uris = _a.uris;
                    var relationName = compactRelation(schema, uris);
                    var accessPoint = ProtectedDocument_1.ProtectedDocument
                        .decorate(pointer, _this);
                    Object.defineProperty(resource, "$" + relationName, {
                        enumerable: false,
                        configurable: true,
                        value: accessPoint,
                    });
                });
            });
        });
    };
    Documents.prototype._createMembershipResourceGetter = function () {
        var _this = this;
        var resources = new Map();
        return function (resourceURI) {
            if (resources.has(resourceURI))
                return resources.get(resourceURI);
            var resource = _this.register(resourceURI);
            Object
                .getOwnPropertyNames(resource)
                .filter(function (key) { return key.startsWith("$"); })
                .filter(function (key) { return !resource.propertyIsEnumerable(key); })
                .forEach(function (key) { return delete resource[key]; });
            resources.set(resourceURI, resource);
            return resource;
        };
    };
    Documents.prototype._createMembershipResourceDataGetter = function () {
        var _this = this;
        var getResource = this
            ._createMembershipResourceGetter();
        var resourcesData = new Map();
        return function (resourceURI) {
            if (resourcesData.has(resourceURI))
                return resourcesData.get(resourceURI);
            var resource = getResource(resourceURI);
            var schema = _this._getDigestedObjectSchema(resource.types, resource.id);
            if (resource.isPartial())
                ObjectSchema_1.ObjectSchemaDigester._combineSchemas([schema, resource._partialMetadata.schema]);
            var uris = Converter_1.JSONLDConverter.getPropertyURINameMap(schema);
            var resourceData = {
                resource: resource,
                schema: schema,
                uris: uris,
            };
            resourcesData.set(resourceURI, resourceData);
            return resourceData;
        };
    };
    Documents.prototype._sendRequest = function (method, uri, options, body, parser) {
        return Request_1.RequestService.send(method, uri, body || null, options, parser)
            .catch(this._parseErrorResponse.bind(this));
    };
    return Documents;
}());
exports.Documents = Documents;
var emptyQueryBuildFn = function (_) { return _; };

//# sourceMappingURL=Documents.js.map
