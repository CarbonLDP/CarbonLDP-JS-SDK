"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokens_1 = require("sparqler/tokens");
var AccessPoint = require("./AccessPoint");
var Auth = require("./Auth");
var Document = require("./Document");
var Errors = require("./Errors");
var FreeResources = require("./FreeResources");
var HTTP = require("./HTTP");
var JSONLD = require("./JSONLD");
var LDP = require("./LDP");
var Messaging = require("./Messaging");
var Utils_1 = require("./Messaging/Utils");
var NS = require("./NS");
var ObjectSchema = require("./ObjectSchema");
var PersistedDocument = require("./PersistedDocument");
var PersistedFragment = require("./PersistedFragment");
var PersistedProtectedDocument = require("./PersistedProtectedDocument");
var Pointer = require("./Pointer");
var ProtectedDocument = require("./ProtectedDocument");
var RDF = require("./RDF");
var Resource = require("./Resource");
var RetrievalPreferences = require("./RetrievalPreferences");
var SPARQL = require("./SPARQL");
var Builder_1 = require("./SPARQL/Builder");
var QueryDocument_1 = require("./SPARQL/QueryDocument");
var Utils = require("./Utils");
var Utils_2 = require("./Utils");
var Class = (function () {
    function Class(context) {
        this.context = context;
        this.pointers = new Map();
        this.documentsBeingResolved = new Map();
        if (!!this.context && !!this.context.parentContext) {
            var contextJSONLDConverter = this.context.parentContext.documents.jsonldConverter;
            this._jsonldConverter = new JSONLD.Converter.Class(contextJSONLDConverter.literalSerializers);
        }
        else {
            this._jsonldConverter = new JSONLD.Converter.Class();
        }
        var decorators = new Map();
        if (this.context && this.context.parentContext) {
            var parentDecorators = this.context.parentContext.documents.documentDecorators;
            if (parentDecorators)
                decorators = this._documentDecorators = Utils.M.extend(decorators, parentDecorators);
        }
        else {
            decorators.set(ProtectedDocument.RDF_CLASS, PersistedProtectedDocument.Factory.decorate);
            decorators.set(Auth.ACL.RDF_CLASS, Auth.PersistedACL.Factory.decorate);
            decorators.set(Auth.User.RDF_CLASS, Auth.PersistedUser.Factory.decorate);
            decorators.set(Auth.Role.RDF_CLASS, Auth.PersistedRole.Factory.decorate);
            decorators.set(Auth.Credentials.RDF_CLASS, Auth.PersistedCredentials.Factory.decorate);
        }
        this._documentDecorators = decorators;
    }
    Object.defineProperty(Class.prototype, "jsonldConverter", {
        get: function () { return this._jsonldConverter; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Class.prototype, "documentDecorators", {
        get: function () { return this._documentDecorators; },
        enumerable: true,
        configurable: true
    });
    Class.prototype.inScope = function (idOrPointer) {
        var id = Pointer.Factory.is(idOrPointer) ? idOrPointer.id : idOrPointer;
        if (RDF.URI.Util.isBNodeID(id))
            return false;
        if (!!this.context) {
            if (RDF.URI.Util.isPrefixed(id))
                id = ObjectSchema.Digester.resolvePrefixedURI(id, this.context.getObjectSchema());
            if (RDF.URI.Util.isRelative(id))
                return true;
            if (RDF.URI.Util.isBaseOf(this.context.baseURI, id))
                return true;
        }
        else {
            if (RDF.URI.Util.isAbsolute(id))
                return true;
        }
        if (!!this.context && !!this.context.parentContext)
            return this.context.parentContext.documents.inScope(id);
        return RDF.URI.Util.isRelative(id);
    };
    Class.prototype.hasPointer = function (id) {
        id = this.getPointerID(id);
        if (this.pointers.has(id))
            return true;
        if (!!this.context && !!this.context.parentContext)
            return this.context.parentContext.documents.hasPointer(id);
        return false;
    };
    Class.prototype.getPointer = function (id) {
        var localID = this.getPointerID(id);
        if (localID === null) {
            if (!!this.context && !!this.context.parentContext)
                return this.context.parentContext.documents.getPointer(id);
            throw new Errors.IllegalArgumentError("The pointer id is not supported by this module.");
        }
        var pointer;
        if (!this.pointers.has(localID)) {
            pointer = this.createPointer(localID);
            this.pointers.set(localID, pointer);
        }
        return this.pointers.get(localID);
    };
    Class.prototype.removePointer = function (idOrPointer) {
        var id = Utils.isString(idOrPointer) ? idOrPointer : idOrPointer.id;
        var localID = this.getPointerID(id);
        if (localID === null) {
            if (!!this.context && !!this.context.parentContext)
                return this.context.parentContext.documents.removePointer(id);
            return false;
        }
        return this.pointers.delete(localID);
    };
    Class.prototype.get = function (uri, optionsOrQueryDocument, documentQuery) {
        var _this = this;
        return Utils_2.promiseMethod(function () {
            var pointerID = _this.getPointerID(uri);
            uri = _this.getRequestURI(uri);
            if (_this.hasPointer(uri)) {
                var pointer = _this.getPointer(uri);
                if (pointer.isResolved()) {
                    return Promise.resolve([pointer, null]);
                }
            }
            if (_this.documentsBeingResolved.has(pointerID))
                return _this.documentsBeingResolved.get(pointerID);
            var requestOptions;
            if (Utils.isFunction(optionsOrQueryDocument)) {
                documentQuery = optionsOrQueryDocument;
                requestOptions = {};
            }
            else {
                requestOptions = optionsOrQueryDocument || {};
            }
            var promise;
            if (!documentQuery) {
                _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.RDFSource);
                promise = _this.sendRequest(HTTP.Method.GET, uri, requestOptions, null, new RDF.Document.Parser()).then(function (_a) {
                    var rdfDocuments = _a[0], response = _a[1];
                    var eTag = HTTP.Response.Util.getETag(response);
                    if (eTag === null)
                        throw new HTTP.Errors.BadResponseError("The response doesn't contain an ETag", response);
                    var locationHeader = response.getHeader("Content-Location");
                    if (!!locationHeader) {
                        if (locationHeader.values.length !== 1)
                            throw new HTTP.Errors.BadResponseError("The response contains more than one Content-Location header.", response);
                        uri = locationHeader.toString();
                        if (!uri)
                            throw new HTTP.Errors.BadResponseError("The response doesn't contain a valid 'Content-Location' header.", response);
                    }
                    var rdfDocument = _this.getRDFDocument(uri, rdfDocuments, response);
                    if (rdfDocument === null)
                        throw new HTTP.Errors.BadResponseError("No document was returned.", response);
                    var document = _this._getPersistedDocument(rdfDocument, response);
                    document._etag = eTag;
                    _this.documentsBeingResolved.delete(pointerID);
                    return [document, response];
                });
            }
            else {
                if (!_this.context)
                    throw new Errors.IllegalStateError("A documents with context is needed for this feature.");
                var queryContext_1 = new QueryDocument_1.QueryContext.Class(_this.context);
                var documentProperty = queryContext_1
                    .addProperty("document", new tokens_1.ValuesToken()
                    .addValues(queryContext_1.getVariable("document"), queryContext_1.compactIRI(uri)));
                var queryDocumentBuilder = new QueryDocument_1.QueryDocumentBuilder.Class(queryContext_1, documentProperty);
                if (documentQuery.call(void 0, queryDocumentBuilder) !== queryDocumentBuilder)
                    throw new Errors.IllegalArgumentError("The provided query builder was not returned");
                var constructPatterns = documentProperty.getPatterns();
                var construct_1 = (_a = new tokens_1.ConstructToken()).addPattern.apply(_a, constructPatterns);
                (function triplesAdder(patterns) {
                    patterns
                        .filter(function (pattern) { return pattern.token === "optional"; })
                        .forEach(function (optional) {
                        construct_1.addTriple(optional.patterns[0]);
                        triplesAdder(optional.patterns);
                    });
                })(constructPatterns);
                if (!construct_1.triples.length)
                    throw new Errors.IllegalArgumentError("No data specified to be retrieved.");
                HTTP.Request.Util.setContainerRetrievalPreferences({ include: [NS.C.Class.PreferResultsContext] }, requestOptions, false);
                return _this.executeRawCONSTRUCTQuery(uri, construct_1.toString(), requestOptions).then(function (_a) {
                    var jsonldString = _a[0], response = _a[1];
                    return new RDF.Document.Parser().parse(jsonldString).then(function (rdfDocuments) {
                        if (!rdfDocuments.length)
                            throw new HTTP.Errors.BadResponseError("No document was returned", response);
                        var mainRDFDocument = rdfDocuments.filter(function (rdfDocument) { return rdfDocument["@id"] === uri; });
                        var document = new JSONLD.Compacter
                            .Class(_this, queryContext_1)
                            .compactDocuments(rdfDocuments, mainRDFDocument)[0];
                        return [document, response];
                    });
                });
            }
            promise.catch(function (error) {
                _this.documentsBeingResolved.delete(pointerID);
                return Promise.reject(error);
            });
            _this.documentsBeingResolved.set(pointerID, promise);
            return promise;
            var _a;
        });
    };
    Class.prototype.exists = function (documentURI, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.RDFSource);
            return _this.sendRequest(HTTP.Method.HEAD, documentURI, requestOptions);
        }).then(function (response) {
            return [true, response];
        }).catch(function (error) {
            if (error.statusCode === 404)
                return [false, error.response];
            return Promise.reject(error);
        });
    };
    Class.prototype.createChild = function (parentURI, childObject, slugOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        requestOptions = !Utils.isString(slugOrRequestOptions) && !!slugOrRequestOptions ? slugOrRequestOptions : requestOptions;
        return Utils_2.promiseMethod(function () {
            if (PersistedDocument.Factory.is(childObject))
                return Promise.reject(new Errors.IllegalArgumentError("The child provided has been already persisted."));
            var childDocument = Document.Factory.is(childObject) ? childObject : Document.Factory.createFrom(childObject);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            return _this.persistDocument(parentURI, slug, childDocument, requestOptions);
        });
    };
    Class.prototype.createChildren = function (parentURI, childrenObjects, slugsOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slugs = Utils.isArray(slugsOrRequestOptions) ? slugsOrRequestOptions : null;
        requestOptions = !Utils.isArray(slugsOrRequestOptions) && !!slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;
        return Promise.all(childrenObjects.map(function (childObject, index) {
            var slug = (slugs !== null && index < slugs.length && !!slugs[index]) ? slugs[index] : null;
            var options = Object.assign({}, requestOptions);
            if (requestOptions.headers)
                options.headers = Utils.M.extend(new Map(), requestOptions.headers);
            return _this.createChild(parentURI, childObject, slug, options);
        })).then(function (requestResponses) {
            var persistedDocuments = requestResponses.map(function (response) { return response[0]; });
            var responses = requestResponses.map(function (response) { return response[1]; });
            return [persistedDocuments, responses];
        });
    };
    Class.prototype.createChildAndRetrieve = function (parentURI, childObject, slugOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var responses = [];
        var options = HTTP.Request.Util.isOptions(slugOrRequestOptions) ? slugOrRequestOptions : requestOptions;
        HTTP.Request.Util.setPreferredRetrievalResource("Created", options);
        return this.createChild(parentURI, childObject, slugOrRequestOptions, requestOptions).then(function (_a) {
            var document = _a[0], createResponse = _a[1];
            if (document.isResolved())
                return [document, createResponse];
            responses.push(createResponse);
            return _this.get(document.id);
        }).then(function (_a) {
            var persistedDocument = _a[0], resolveResponse = _a[1];
            responses.push(resolveResponse);
            return [persistedDocument, responses];
        });
    };
    Class.prototype.createChildrenAndRetrieve = function (parentURI, childrenObjects, slugsOrRequestOptions, requestOptions) {
        if (requestOptions === void 0) { requestOptions = {}; }
        var responses = [];
        var options = HTTP.Request.Util.isOptions(slugsOrRequestOptions) ? slugsOrRequestOptions : requestOptions;
        HTTP.Request.Util.setPreferredRetrievalResource("Created", options);
        return this.createChildren(parentURI, childrenObjects, slugsOrRequestOptions, requestOptions).then(function (_a) {
            var documents = _a[0], creationResponses = _a[1];
            responses.push(creationResponses);
            if (documents.every(function (document) { return document.isResolved(); }))
                return [documents, null];
            return Pointer.Util.resolveAll(documents);
        }).then(function (_a) {
            var persistedDocuments = _a[0], resolveResponses = _a[1];
            if (!!resolveResponses)
                responses.push(resolveResponses);
            return [persistedDocuments, responses];
        });
    };
    Class.prototype.listChildren = function (parentURI, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            parentURI = _this.getRequestURI(parentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            var containerRetrievalPreferences = {
                include: [
                    NS.LDP.Class.PreferContainment,
                ],
                omit: [
                    NS.LDP.Class.PreferMembership,
                    NS.LDP.Class.PreferMinimalContainer,
                    NS.C.Class.PreferContainmentResources,
                    NS.C.Class.PreferMembershipResources,
                ],
            };
            HTTP.Request.Util.setContainerRetrievalPreferences(containerRetrievalPreferences, requestOptions);
            return _this.sendRequest(HTTP.Method.GET, parentURI, requestOptions, null, new RDF.Document.Parser());
        }).then(function (_a) {
            var rdfDocuments = _a[0], response = _a[1];
            var rdfDocument = _this.getRDFDocument(parentURI, rdfDocuments, response);
            if (rdfDocument === null)
                return [[], response];
            var documentResource = _this.getDocumentResource(rdfDocument, response);
            var childPointers = RDF.Node.Util.getPropertyPointers(documentResource, NS.LDP.Predicate.contains, _this);
            var persistedChildPointers = childPointers.map(function (pointer) { return PersistedDocument.Factory.decorate(pointer, _this); });
            return [persistedChildPointers, response];
        });
    };
    Class.prototype.getChildren = function (parentURI, retPrefReqOpt, requestOptions) {
        var _this = this;
        var retrievalPreferences = RetrievalPreferences.Factory.is(retPrefReqOpt) ? retPrefReqOpt : null;
        requestOptions = HTTP.Request.Util.isOptions(retPrefReqOpt) ? retPrefReqOpt : (HTTP.Request.Util.isOptions(requestOptions) ? requestOptions : {});
        var containerURI;
        return Utils_2.promiseMethod(function () {
            parentURI = _this.getRequestURI(parentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            containerURI = parentURI;
            if (!!retrievalPreferences)
                parentURI += RetrievalPreferences.Util.stringifyRetrievalPreferences(retrievalPreferences, _this.getGeneralSchema());
            var containerRetrievalPreferences = {
                include: [
                    NS.LDP.Class.PreferContainment,
                    NS.C.Class.PreferContainmentResources,
                ],
                omit: [
                    NS.LDP.Class.PreferMembership,
                    NS.LDP.Class.PreferMinimalContainer,
                    NS.C.Class.PreferMembershipResources,
                ],
            };
            HTTP.Request.Util.setContainerRetrievalPreferences(containerRetrievalPreferences, requestOptions);
            return _this.sendRequest(HTTP.Method.GET, parentURI, requestOptions, null, new JSONLD.Parser.Class());
        }).then(function (_a) {
            var expandedResult = _a[0], response = _a[1];
            var freeNodes = RDF.Node.Util.getFreeNodes(expandedResult);
            var rdfDocuments = RDF.Document.Util.getDocuments(expandedResult).filter(function (document) { return document["@id"] !== containerURI; });
            var resources = _this.getPersistedMetadataResources(freeNodes, rdfDocuments, response);
            return [resources, response];
        });
    };
    Class.prototype.createAccessPoint = function (documentURI, accessPoint, slugOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        if (this.context)
            documentURI = this.context.resolve(documentURI);
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        requestOptions = !Utils.isString(slugOrRequestOptions) && !!slugOrRequestOptions ? slugOrRequestOptions : requestOptions;
        return Utils_2.promiseMethod(function () {
            if (PersistedDocument.Factory.is(accessPoint))
                return Promise.reject(new Errors.IllegalArgumentError("The accessPoint provided has been already persisted."));
            var accessPointDocument = AccessPoint.Factory.is(accessPoint) ? accessPoint
                : AccessPoint.Factory.createFrom(accessPoint, _this.getPointer(documentURI), accessPoint.hasMemberRelation, accessPoint.isMemberOfRelation);
            if (accessPointDocument.membershipResource.id !== documentURI)
                return Promise.reject(new Errors.IllegalArgumentError("The documentURI must be the same as the accessPoint's membershipResource"));
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.RDFSource);
            return _this.persistDocument(documentURI, slug, accessPointDocument, requestOptions);
        });
    };
    Class.prototype.createAccessPoints = function (documentURI, accessPoints, slugsOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slugs = Utils.isArray(slugsOrRequestOptions) ? slugsOrRequestOptions : null;
        requestOptions = !Utils.isArray(slugsOrRequestOptions) && !!slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;
        return Promise.all(accessPoints.map(function (accessPoint, index) {
            var slug = (slugs !== null && index < slugs.length && !!slugs[index]) ? slugs[index] : null;
            var options = Object.assign({}, requestOptions);
            if (requestOptions.headers)
                options.headers = Utils.M.extend(new Map(), requestOptions.headers);
            return _this.createAccessPoint(documentURI, accessPoint, slug, options);
        })).then(function (requestResponses) {
            var persistedAccessPoints = requestResponses.map(function (response) { return response[0]; });
            var responses = requestResponses.map(function (response) { return response[1]; });
            return [persistedAccessPoints, responses];
        });
    };
    Class.prototype.upload = function (parentURI, data, slugOrRequestOptions, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var slug = Utils.isString(slugOrRequestOptions) ? slugOrRequestOptions : null;
        requestOptions = !Utils.isString(slugOrRequestOptions) && !!slugOrRequestOptions ? slugOrRequestOptions : requestOptions;
        if (typeof Blob !== "undefined") {
            if (!(data instanceof Blob))
                return Promise.reject(new Errors.IllegalArgumentError("The data is not a valid Blob object."));
            HTTP.Request.Util.setContentTypeHeader(data.type, requestOptions);
        }
        else {
            if (!(data instanceof Buffer))
                return Promise.reject(new Errors.IllegalArgumentError("The data is not a valid Buffer object."));
            var fileType = require("file-type");
            var bufferType = fileType(data);
            HTTP.Request.Util.setContentTypeHeader(bufferType ? bufferType.mime : "application/octet-stream", requestOptions);
        }
        return Utils_2.promiseMethod(function () {
            parentURI = _this.getRequestURI(parentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            if (!!slug)
                HTTP.Request.Util.setSlug(slug, requestOptions);
            return _this.sendRequest(HTTP.Method.POST, parentURI, requestOptions, data);
        }).then(function (response) {
            var locationHeader = response.getHeader("Location");
            if (locationHeader === null || locationHeader.values.length < 1)
                throw new HTTP.Errors.BadResponseError("The response is missing a Location header.", response);
            if (locationHeader.values.length !== 1)
                throw new HTTP.Errors.BadResponseError("The response contains more than one Location header.", response);
            var locationURI = locationHeader.values[0].toString();
            var pointer = _this.getPointer(locationURI);
            return [pointer, response];
        });
    };
    Class.prototype.listMembers = function (uri, nonReadReqOpt, reqOpt) {
        var _this = this;
        var includeNonReadable = Utils.isBoolean(nonReadReqOpt) ? nonReadReqOpt : true;
        var requestOptions = HTTP.Request.Util.isOptions(nonReadReqOpt) ? nonReadReqOpt : (HTTP.Request.Util.isOptions(reqOpt) ? reqOpt : {});
        return Utils_2.promiseMethod(function () {
            uri = _this.getRequestURI(uri);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            var containerRetrievalPreferences = {
                include: [
                    NS.LDP.Class.PreferMinimalContainer,
                    NS.LDP.Class.PreferMembership,
                ],
                omit: [
                    NS.LDP.Class.PreferContainment,
                    NS.C.Class.PreferContainmentResources,
                    NS.C.Class.PreferMembershipResources,
                ],
            };
            if (includeNonReadable) {
                containerRetrievalPreferences.include.push(NS.C.Class.NonReadableMembershipResourceTriples);
            }
            else {
                containerRetrievalPreferences.omit.push(NS.C.Class.NonReadableMembershipResourceTriples);
            }
            HTTP.Request.Util.setContainerRetrievalPreferences(containerRetrievalPreferences, requestOptions);
            return _this.sendRequest(HTTP.Method.GET, uri, requestOptions, null, new RDF.Document.Parser());
        }).then(function (_a) {
            var rdfDocuments = _a[0], response = _a[1];
            var rdfDocument = _this.getRDFDocument(uri, rdfDocuments, response);
            if (rdfDocument === null)
                throw new HTTP.Errors.BadResponseError("No document was returned.", response);
            var documentResource = _this.getDocumentResource(rdfDocument, response);
            var membershipResource = _this.getMembershipResource(documentResource, rdfDocuments, response);
            if (membershipResource === null)
                return [[], response];
            var hasMemberRelation = RDF.Node.Util.getPropertyURI(documentResource, NS.LDP.Predicate.hasMemberRelation);
            var memberPointers = RDF.Node.Util.getPropertyPointers(membershipResource, hasMemberRelation, _this);
            var persistedMemberPointers = memberPointers.map(function (pointer) { return PersistedDocument.Factory.decorate(pointer, _this); });
            return [persistedMemberPointers, response];
        });
    };
    Class.prototype.getMembers = function (uri, nonReadRetPrefReqOpt, retPrefReqOpt, requestOptions) {
        var _this = this;
        var includeNonReadable = Utils.isBoolean(nonReadRetPrefReqOpt) ? nonReadRetPrefReqOpt : true;
        var retrievalPreferences = RetrievalPreferences.Factory.is(nonReadRetPrefReqOpt) ? nonReadRetPrefReqOpt : (RetrievalPreferences.Factory.is(retPrefReqOpt) ? retPrefReqOpt : null);
        requestOptions = HTTP.Request.Util.isOptions(nonReadRetPrefReqOpt) ? nonReadRetPrefReqOpt : (HTTP.Request.Util.isOptions(retPrefReqOpt) ? retPrefReqOpt : (HTTP.Request.Util.isOptions(requestOptions) ? requestOptions : {}));
        var containerURI;
        return Utils_2.promiseMethod(function () {
            uri = _this.getRequestURI(uri);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            containerURI = uri;
            if (!!retrievalPreferences)
                uri += RetrievalPreferences.Util.stringifyRetrievalPreferences(retrievalPreferences, _this.getGeneralSchema());
            var containerRetrievalPreferences = {
                include: [
                    NS.LDP.Class.PreferMinimalContainer,
                    NS.LDP.Class.PreferMembership,
                    NS.C.Class.PreferMembershipResources,
                ],
                omit: [
                    NS.LDP.Class.PreferContainment,
                    NS.C.Class.PreferContainmentResources,
                ],
            };
            if (includeNonReadable) {
                containerRetrievalPreferences.include.push(NS.C.Class.NonReadableMembershipResourceTriples);
            }
            else {
                containerRetrievalPreferences.omit.push(NS.C.Class.NonReadableMembershipResourceTriples);
            }
            HTTP.Request.Util.setContainerRetrievalPreferences(containerRetrievalPreferences, requestOptions);
            return _this.sendRequest(HTTP.Method.GET, uri, requestOptions, null, new JSONLD.Parser.Class());
        }).then(function (_a) {
            var expandedResult = _a[0], response = _a[1];
            var freeNodes = RDF.Node.Util.getFreeNodes(expandedResult);
            var rdfDocuments = RDF.Document.Util.getDocuments(expandedResult);
            var rdfDocument = _this.getRDFDocument(containerURI, rdfDocuments, response);
            if (rdfDocument === null)
                throw new HTTP.Errors.BadResponseError("No document was returned.", response);
            var containerResource = _this.getDocumentResource(rdfDocument, response);
            var membershipResource = _this.getMembershipResource(containerResource, rdfDocuments, response);
            if (membershipResource === null)
                return [[], response];
            rdfDocuments = rdfDocuments.filter(function (targetRDFDocument) {
                return !RDF.Node.Util.areEqual(targetRDFDocument, containerResource)
                    && !RDF.Node.Util.areEqual(targetRDFDocument, membershipResource);
            });
            var resources = _this.getPersistedMetadataResources(freeNodes, rdfDocuments, response);
            return [resources, response];
        });
    };
    Class.prototype.addMember = function (documentURI, memberORUri, requestOptions) {
        if (requestOptions === void 0) { requestOptions = {}; }
        return this.addMembers(documentURI, [memberORUri], requestOptions);
    };
    Class.prototype.addMembers = function (documentURI, members, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            var pointers = _this._parseMembers(members);
            documentURI = _this.getRequestURI(documentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            HTTP.Request.Util.setContentTypeHeader("application/ld+json", requestOptions);
            var freeResources = FreeResources.Factory.create(_this);
            freeResources.createResourceFrom(LDP.AddMemberAction.Factory.create(pointers));
            return _this.sendRequest(HTTP.Method.PUT, documentURI, requestOptions, freeResources.toJSON());
        });
    };
    Class.prototype.removeMember = function (documentURI, memberORUri, requestOptions) {
        if (requestOptions === void 0) { requestOptions = {}; }
        return this.removeMembers(documentURI, [memberORUri], requestOptions);
    };
    Class.prototype.removeMembers = function (documentURI, members, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            var pointers = _this._parseMembers(members);
            documentURI = _this.getRequestURI(documentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            HTTP.Request.Util.setContentTypeHeader("application/ld+json", requestOptions);
            var containerRetrievalPreferences = {
                include: [NS.C.Class.PreferSelectedMembershipTriples],
                omit: [NS.C.Class.PreferMembershipTriples],
            };
            HTTP.Request.Util.setContainerRetrievalPreferences(containerRetrievalPreferences, requestOptions, false);
            var freeResources = FreeResources.Factory.create(_this);
            freeResources.createResourceFrom(LDP.RemoveMemberAction.Factory.create(pointers));
            return _this.sendRequest(HTTP.Method.DELETE, documentURI, requestOptions, freeResources.toJSON());
        });
    };
    Class.prototype.removeAllMembers = function (documentURI, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.Container);
            var containerRetrievalPreferences = {
                include: [
                    NS.C.Class.PreferMembershipTriples,
                ],
                omit: [
                    NS.C.Class.PreferMembershipResources,
                    NS.C.Class.PreferContainmentTriples,
                    NS.C.Class.PreferContainmentResources,
                    NS.C.Class.PreferContainer,
                ],
            };
            HTTP.Request.Util.setContainerRetrievalPreferences(containerRetrievalPreferences, requestOptions, false);
            return _this.sendRequest(HTTP.Method.DELETE, documentURI, requestOptions);
        });
    };
    Class.prototype.save = function (persistedDocument, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            var uri = _this.getRequestURI(persistedDocument.id);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.RDFSource);
            HTTP.Request.Util.setContentTypeHeader("application/ld+json", requestOptions);
            HTTP.Request.Util.setIfMatchHeader(persistedDocument._etag, requestOptions);
            persistedDocument._normalize();
            var body = persistedDocument.toJSON(_this, _this.jsonldConverter);
            return _this.sendRequest(HTTP.Method.PUT, uri, requestOptions, body);
        }).then(function (response) {
            return _this.applyResponseData(persistedDocument, response);
        });
    };
    Class.prototype.refresh = function (persistedDocument, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var uri;
        return Utils_2.promiseMethod(function () {
            uri = _this.getRequestURI(persistedDocument.id);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.RDFSource);
            HTTP.Request.Util.setIfNoneMatchHeader(persistedDocument._etag, requestOptions);
            return _this.sendRequest(HTTP.Method.GET, uri, requestOptions, null, new RDF.Document.Parser());
        }).then(function (_a) {
            var rdfDocuments = _a[0], response = _a[1];
            if (response === null)
                return [rdfDocuments, response];
            var eTag = HTTP.Response.Util.getETag(response);
            if (eTag === null)
                throw new HTTP.Errors.BadResponseError("The response doesn't contain an ETag", response);
            var rdfDocument = _this.getRDFDocument(uri, rdfDocuments, response);
            if (rdfDocument === null)
                throw new HTTP.Errors.BadResponseError("No document was returned.", response);
            var updatedPersistedDocument = _this._getPersistedDocument(rdfDocument, response);
            updatedPersistedDocument._etag = eTag;
            return [updatedPersistedDocument, response];
        }).catch(function (error) {
            if (error.statusCode === 304)
                return [persistedDocument, null];
            return Promise.reject(error);
        });
    };
    Class.prototype.saveAndRefresh = function (persistedDocument, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        var responses = [];
        var previousETag = persistedDocument._etag;
        return Utils.promiseMethod(function () {
            HTTP.Request.Util.setPreferredRetrievalResource("Modified", requestOptions);
            return _this.save(persistedDocument, requestOptions);
        }).then(function (_a) {
            var document = _a[0], saveResponse = _a[1];
            if (document._etag !== previousETag)
                return [document, saveResponse];
            responses.push(saveResponse);
            return _this.refresh(document);
        }).then(function (_a) {
            var document = _a[0], refreshResponse = _a[1];
            responses.push(refreshResponse);
            return [persistedDocument, responses];
        });
    };
    Class.prototype.delete = function (documentURI, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            _this.setDefaultRequestOptions(requestOptions, NS.LDP.Class.RDFSource);
            return _this.sendRequest(HTTP.Method.DELETE, documentURI, requestOptions);
        }).then(function (response) {
            var pointerID = _this.getPointerID(documentURI);
            _this.pointers.delete(pointerID);
            return response;
        });
    };
    Class.prototype.getDownloadURL = function (documentURI, requestOptions) {
        var _this = this;
        if (!this.context)
            return Promise.reject(new Errors.IllegalStateError("This instance doesn't support Authenticated request."));
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            return _this.context.auth.getAuthenticatedURL(documentURI, requestOptions);
        });
    };
    Class.prototype.getGeneralSchema = function () {
        if (!this.context)
            return new ObjectSchema.DigestedObjectSchema();
        var schema = ObjectSchema.Digester.combineDigestedObjectSchemas([this.context.getObjectSchema()]);
        if (this.context.hasSetting("vocabulary"))
            schema.vocab = this.context.resolve(this.context.getSetting("vocabulary"));
        return schema;
    };
    Class.prototype.getSchemaFor = function (object) {
        return ("@id" in object) ?
            this.getDigestedObjectSchemaForExpandedObject(object) :
            this.getDigestedObjectSchemaForDocument(object);
    };
    Class.prototype.executeRawASKQuery = function (documentURI, askQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            if (_this.context && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return SPARQL.Service.executeRawASKQuery(documentURI, askQuery, requestOptions)
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Class.prototype.executeASKQuery = function (documentURI, askQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            if (_this.context && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return SPARQL.Service.executeASKQuery(documentURI, askQuery, requestOptions)
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Class.prototype.executeRawSELECTQuery = function (documentURI, selectQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            if (_this.context && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return SPARQL.Service.executeRawSELECTQuery(documentURI, selectQuery, requestOptions)
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Class.prototype.executeSELECTQuery = function (documentURI, selectQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            if (_this.context && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return SPARQL.Service.executeSELECTQuery(documentURI, selectQuery, _this, requestOptions)
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Class.prototype.executeRawCONSTRUCTQuery = function (documentURI, constructQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            if (_this.context && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return SPARQL.Service.executeRawCONSTRUCTQuery(documentURI, constructQuery, requestOptions)
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Class.prototype.executeRawDESCRIBEQuery = function (documentURI, describeQuery, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            if (_this.context && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return SPARQL.Service.executeRawDESCRIBEQuery(documentURI, describeQuery, requestOptions)
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Class.prototype.executeUPDATE = function (documentURI, update, requestOptions) {
        var _this = this;
        if (requestOptions === void 0) { requestOptions = {}; }
        return Utils_2.promiseMethod(function () {
            documentURI = _this.getRequestURI(documentURI);
            if (_this.context && _this.context.auth.isAuthenticated())
                _this.context.auth.addAuthentication(requestOptions);
            return SPARQL.Service.executeUPDATE(documentURI, update, requestOptions)
                .catch(_this._parseErrorResponse.bind(_this));
        });
    };
    Class.prototype.sparql = function (documentURI) {
        var builder = new Builder_1.default(this, this.getRequestURI(documentURI));
        if (!!this.context) {
            builder = builder.base(this.context.baseURI);
            if (this.context.hasSetting("vocabulary")) {
                builder = builder.vocab(this.context.resolve(this.context.getSetting("vocabulary")));
            }
            var schema = this.context.getObjectSchema();
            schema.prefixes.forEach(function (uri, prefix) {
                builder = builder.prefix(prefix, uri.stringValue);
            });
        }
        return builder;
    };
    Class.prototype.on = function (event, uriPattern, onEvent, onError) {
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
    Class.prototype.off = function (event, uriPattern, onEvent, onError) {
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
    Class.prototype.one = function (event, uriPattern, onEvent, onError) {
        var self = this;
        this.on(event, uriPattern, function onEventWrapper(message) {
            onEvent(message);
            self.off(event, uriPattern, onEventWrapper, onError);
        }, onError);
    };
    Class.prototype.onDocumentCreated = function (uriPattern, onEvent, onError) {
        return this.on(Messaging.Event.DOCUMENT_CREATED, uriPattern, onEvent, onError);
    };
    Class.prototype.onChildCreated = function (uriPattern, onEvent, onError) {
        return this.on(Messaging.Event.CHILD_CREATED, uriPattern, onEvent, onError);
    };
    Class.prototype.onAccessPointCreated = function (uriPattern, onEvent, onError) {
        return this.on(Messaging.Event.ACCESS_POINT_CREATED, uriPattern, onEvent, onError);
    };
    Class.prototype.onDocumentModified = function (uriPattern, onEvent, onError) {
        return this.on(Messaging.Event.DOCUMENT_MODIFIED, uriPattern, onEvent, onError);
    };
    Class.prototype.onDocumentDeleted = function (uriPattern, onEvent, onError) {
        return this.on(Messaging.Event.DOCUMENT_DELETED, uriPattern, onEvent, onError);
    };
    Class.prototype.onMemberAdded = function (uriPattern, onEvent, onError) {
        return this.on(Messaging.Event.MEMBER_ADDED, uriPattern, onEvent, onError);
    };
    Class.prototype.onMemberRemoved = function (uriPattern, onEvent, onError) {
        return this.on(Messaging.Event.MEMBER_REMOVED, uriPattern, onEvent, onError);
    };
    Class.prototype._getPersistedDocument = function (rdfDocument, response) {
        var documentResources = RDF.Document.Util.getNodes(rdfDocument)[0];
        if (documentResources.length === 0)
            throw new HTTP.Errors.BadResponseError("The RDFDocument: " + rdfDocument["@id"] + ", doesn't contain a document resource.", response);
        if (documentResources.length > 1)
            throw new HTTP.Errors.BadResponseError("The RDFDocument: " + rdfDocument["@id"] + ", contains more than one document resource.", response);
        return new JSONLD.Compacter.Class(this).compactDocument(rdfDocument);
    };
    Class.prototype._getFreeResources = function (nodes) {
        var freeResourcesDocument = FreeResources.Factory.create(this);
        var resources = nodes.map(function (node) { return freeResourcesDocument.createResource(node["@id"]); });
        this.compact(nodes, resources, freeResourcesDocument);
        return freeResourcesDocument;
    };
    Class.prototype._parseErrorResponse = function (response) {
        var _this = this;
        if (!(response.status >= 400 && response.status < 600 && HTTP.Errors.statusCodeMap.has(response.status)))
            return Promise.reject(new HTTP.Errors.UnknownError(response.data, response));
        var error = new (HTTP.Errors.statusCodeMap.get(response.status))(response.data, response);
        if (!response.data || !this.context)
            return Promise.reject(error);
        return new JSONLD.Parser.Class().parse(response.data).then(function (freeNodes) {
            var freeResources = _this._getFreeResources(freeNodes);
            var errorResponses = freeResources
                .getResources()
                .filter(function (resource) { return resource.hasType(LDP.ErrorResponse.RDF_CLASS); });
            if (errorResponses.length === 0)
                return Promise.reject(new Errors.IllegalArgumentError("The response string does not contains a c:ErrorResponse."));
            if (errorResponses.length > 1)
                return Promise.reject(new Errors.IllegalArgumentError("The response string contains multiple c:ErrorResponse."));
            Object.assign(error, errorResponses[0]);
            error.message = LDP.ErrorResponse.Util.getMessage(error);
            return Promise.reject(error);
        }, function () {
            return Promise.reject(error);
        });
    };
    Class.prototype.persistDocument = function (parentURI, slug, document, requestOptions) {
        var _this = this;
        parentURI = this.getRequestURI(parentURI);
        HTTP.Request.Util.setContentTypeHeader("application/ld+json", requestOptions);
        if (document.id) {
            var childURI = document.id;
            if (!!this.context)
                childURI = this.context.resolve(childURI);
            if (!RDF.URI.Util.isBaseOf(parentURI, childURI)) {
                return Promise.reject(new Errors.IllegalArgumentError("The document's URI is not relative to the parentURI specified"));
            }
        }
        if (document["__CarbonSDK_InProgressOfPersisting"])
            return Promise.reject(new Errors.IllegalArgumentError("The document is already being persisted."));
        Object.defineProperty(document, "__CarbonSDK_InProgressOfPersisting", { configurable: true, enumerable: false, writable: false, value: true });
        var body = document.toJSON(this, this.jsonldConverter);
        if (!!slug)
            HTTP.Request.Util.setSlug(slug, requestOptions);
        return HTTP.Request.Service.post(parentURI, body, requestOptions).then(function (response) {
            delete document["__CarbonSDK_InProgressOfPersisting"];
            var locationHeader = response.getHeader("Location");
            if (locationHeader === null || locationHeader.values.length < 1)
                throw new HTTP.Errors.BadResponseError("The response is missing a Location header.", response);
            if (locationHeader.values.length !== 1)
                throw new HTTP.Errors.BadResponseError("The response contains more than one Location header.", response);
            var localID = _this.getPointerID(locationHeader.values[0].toString());
            _this.pointers.set(localID, _this.createPointerFrom(document, localID));
            var persistedDocument = PersistedProtectedDocument.Factory.decorate(document, _this);
            persistedDocument.getFragments().forEach(PersistedFragment.Factory.decorate);
            return _this.applyResponseData(persistedDocument, response);
        }, this._parseErrorResponse.bind(this)).catch(function (error) {
            delete document["__CarbonSDK_InProgressOfPersisting"];
            return Promise.reject(error);
        });
    };
    Class.prototype.getRDFDocument = function (requestURL, rdfDocuments, response) {
        rdfDocuments = rdfDocuments.filter(function (rdfDocument) { return rdfDocument["@id"] === requestURL; });
        if (rdfDocuments.length > 1)
            throw new HTTP.Errors.BadResponseError("Several documents share the same id.", response);
        return rdfDocuments.length > 0 ? rdfDocuments[0] : null;
    };
    Class.prototype.getDocumentResource = function (rdfDocument, response) {
        var documentResources = RDF.Document.Util.getDocumentResources(rdfDocument);
        if (documentResources.length === 0)
            throw new HTTP.Errors.BadResponseError("The RDFDocument: " + rdfDocument["@id"] + ", doesn't contain a document resource.", response);
        if (documentResources.length > 1)
            throw new HTTP.Errors.BadResponseError("The RDFDocument: " + rdfDocument["@id"] + ", contains more than one document resource.", response);
        return documentResources[0];
    };
    Class.prototype.getPointerID = function (uri) {
        if (RDF.URI.Util.isBNodeID(uri))
            throw new Errors.IllegalArgumentError("BNodes cannot be fetched directly.");
        if (!!this.context) {
            if (RDF.URI.Util.isPrefixed(uri))
                uri = ObjectSchema.Digester.resolvePrefixedURI(uri, this.getGeneralSchema());
            if (!RDF.URI.Util.isRelative(uri)) {
                var baseURI = this.context.baseURI;
                if (!RDF.URI.Util.isBaseOf(baseURI, uri))
                    return null;
                return uri.substring(baseURI.length);
            }
            else {
                return uri[0] === "/" ? uri.substr(1) : uri;
            }
        }
        else {
            if (RDF.URI.Util.isPrefixed(uri))
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support prefixed URIs.");
            if (RDF.URI.Util.isRelative(uri))
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support relative URIs.");
            return uri;
        }
    };
    Class.prototype.createPointer = function (localID) {
        return this.createPointerFrom({}, localID);
    };
    Class.prototype.createPointerFrom = function (object, localID) {
        var _this = this;
        var id = !!this.context ? this.context.resolve(localID) : localID;
        var pointer = Pointer.Factory.createFrom(object, id);
        Object.defineProperty(pointer, "resolve", {
            writable: false,
            enumerable: false,
            configurable: true,
            value: function () {
                return _this.get(id);
            },
        });
        return pointer;
    };
    Class.prototype.compact = function (expandedObjectOrObjects, targetObjectOrObjects, pointerLibrary, schema) {
        if (!Utils.isArray(expandedObjectOrObjects))
            return this.compactSingle(expandedObjectOrObjects, targetObjectOrObjects, pointerLibrary, schema);
        var expandedObjects = expandedObjectOrObjects;
        var targetObjects = !!targetObjectOrObjects ? targetObjectOrObjects : [];
        for (var i = 0, length_1 = expandedObjects.length; i < length_1; i++) {
            var expandedObject = expandedObjects[i];
            var targetObject = targetObjects[i] = !!targetObjects[i] ? targetObjects[i] : {};
            this.compactSingle(expandedObject, targetObject, pointerLibrary, schema);
        }
        return targetObjects;
    };
    Class.prototype.compactSingle = function (expandedObject, targetObject, pointerLibrary, schema) {
        var digestedSchema = this.getDigestedObjectSchemaForExpandedObject(expandedObject, schema);
        return this.jsonldConverter.compact(expandedObject, targetObject, digestedSchema, pointerLibrary);
    };
    Class.prototype.getDigestedObjectSchemaForExpandedObject = function (expandedObject, schema) {
        var types = RDF.Node.Util.getTypes(expandedObject);
        return this.getDigestedObjectSchema(types, expandedObject["@id"], schema);
    };
    Class.prototype.getDigestedObjectSchemaForDocument = function (document) {
        var types = Resource.Util.getTypes(document);
        return this.getDigestedObjectSchema(types, document.id);
    };
    Class.prototype.getDigestedObjectSchema = function (objectTypes, objectID, schema) {
        if (!this.context)
            return schema || new ObjectSchema.DigestedObjectSchema();
        var objectSchemas = [this.context.getObjectSchema()];
        if (Utils.isDefined(objectID) && !RDF.URI.Util.hasFragment(objectID) && !RDF.URI.Util.isBNodeID(objectID))
            objectSchemas.push(Class._documentSchema);
        for (var _i = 0, objectTypes_1 = objectTypes; _i < objectTypes_1.length; _i++) {
            var type = objectTypes_1[_i];
            if (this.context.hasObjectSchema(type))
                objectSchemas.push(this.context.getObjectSchema(type));
        }
        if (schema)
            objectSchemas.push(schema);
        var digestedSchema = ObjectSchema.Digester.combineDigestedObjectSchemas(objectSchemas);
        if (this.context.hasSetting("vocabulary"))
            digestedSchema.vocab = this.context.resolve(this.context.getSetting("vocabulary"));
        return digestedSchema;
    };
    Class.prototype.getRequestURI = function (uri) {
        if (RDF.URI.Util.isPrefixed(uri)) {
            if (!this.context)
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support prefixed URIs.");
            uri = ObjectSchema.Digester.resolvePrefixedURI(uri, this.context.getObjectSchema());
            if (RDF.URI.Util.isPrefixed(uri))
                throw new Errors.IllegalArgumentError("The prefixed URI \"" + uri + "\" could not be resolved.");
        }
        else if (RDF.URI.Util.isRelative(uri)) {
            if (!this.context)
                throw new Errors.IllegalArgumentError("This Documents instance doesn't support relative URIs.");
            uri = this.context.resolve(uri);
        }
        else if (this.context && !RDF.URI.Util.isBaseOf(this.context.baseURI, uri)) {
            throw new Errors.IllegalArgumentError("\"" + uri + "\" isn't a valid URI for this Carbon instance.");
        }
        return uri;
    };
    Class.prototype.setDefaultRequestOptions = function (requestOptions, interactionModel) {
        if (this.context && this.context.auth.isAuthenticated())
            this.context.auth.addAuthentication(requestOptions);
        HTTP.Request.Util.setAcceptHeader("application/ld+json", requestOptions);
        HTTP.Request.Util.setPreferredInteractionModel(interactionModel, requestOptions);
        return requestOptions;
    };
    Class.prototype.getMembershipResource = function (documentResource, rdfDocuments, response) {
        var membershipResource;
        var membershipResourceURI = RDF.Node.Util.getPropertyURI(documentResource, NS.LDP.Predicate.membershipResource);
        if (documentResource["@id"] === membershipResourceURI) {
            membershipResource = documentResource;
        }
        else if (membershipResourceURI === null) {
            if (documentResource["@type"].indexOf(NS.LDP.Class.BasicContainer) !== -1) {
                membershipResource = documentResource;
            }
            else {
                throw new HTTP.Errors.BadResponseError("The document is not an ldp:BasicContainer and it doesn't contain an ldp:membershipResource triple.", response);
            }
        }
        else {
            var membershipResourceDocument = this.getRDFDocument(membershipResourceURI, rdfDocuments, response);
            if (membershipResourceDocument === null)
                return null;
            membershipResource = this.getDocumentResource(membershipResourceDocument, response);
        }
        return membershipResource;
    };
    Class.prototype.getPersistedMetadataResources = function (freeNodes, rdfDocuments, response) {
        var _this = this;
        var freeResources = this._getFreeResources(freeNodes);
        var descriptionResources = freeResources.getResources().filter(LDP.ResponseMetadata.Factory.is);
        if (descriptionResources.length === 0)
            return [];
        if (descriptionResources.length > 1)
            throw new HTTP.Errors.BadResponseError("The response contained multiple " + LDP.ResponseMetadata.RDF_CLASS + " objects.", response);
        rdfDocuments.forEach(function (rdfDocument) { return _this._getPersistedDocument(rdfDocument, response); });
        var responseMetadata = descriptionResources[0];
        return responseMetadata.documentsMetadata.map(function (documentMetadata) {
            var document = documentMetadata.relatedDocument;
            document._etag = documentMetadata.eTag;
            return document;
        });
    };
    Class.prototype.updateFromPreferenceApplied = function (persistedDocument, rdfDocuments, response) {
        var eTag = HTTP.Response.Util.getETag(response);
        if (eTag === null)
            throw new HTTP.Errors.BadResponseError("The response doesn't contain an ETag", response);
        var rdfDocument = this.getRDFDocument(persistedDocument.id, rdfDocuments, response);
        if (rdfDocument === null)
            throw new HTTP.Errors.BadResponseError("No document was returned.", response);
        persistedDocument = this._getPersistedDocument(rdfDocument, response);
        persistedDocument._etag = eTag;
        return [persistedDocument, response];
    };
    Class.prototype._parseMembers = function (pointers) {
        var _this = this;
        return pointers.map(function (pointer) {
            if (Utils.isString(pointer))
                return _this.getPointer(pointer);
            if (Pointer.Factory.is(pointer))
                return pointer;
            throw new Errors.IllegalArgumentError("No Carbon.Pointer or URI provided.");
        });
    };
    Class.prototype.applyResponseData = function (persistedProtectedDocument, response) {
        var _this = this;
        if (response.status === 204 || !response.data)
            return [persistedProtectedDocument, response];
        return new JSONLD.Parser.Class().parse(response.data).then(function (expandedResult) {
            var freeNodes = RDF.Node.Util.getFreeNodes(expandedResult);
            _this.applyNodeMap(freeNodes);
            var preferenceHeader = response.getHeader("Preference-Applied");
            if (preferenceHeader === null || preferenceHeader.toString() !== "return=representation")
                return [persistedProtectedDocument, response];
            var rdfDocuments = RDF.Document.Util.getDocuments(expandedResult);
            return _this.updateFromPreferenceApplied(persistedProtectedDocument, rdfDocuments, response);
        });
    };
    Class.prototype.applyNodeMap = function (freeNodes) {
        if (!freeNodes.length)
            return;
        var freeResources = this._getFreeResources(freeNodes);
        var responseMetadata = freeResources.getResources().find(LDP.ResponseMetadata.Factory.is);
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
    Class.prototype.sendRequest = function (method, uri, options, body, parser) {
        return HTTP.Request.Service.send(method, uri, body, options, parser)
            .catch(this._parseErrorResponse.bind(this));
    };
    Class._documentSchema = ObjectSchema.Digester.digestSchema(Document.SCHEMA);
    return Class;
}());
exports.Class = Class;
exports.default = Class;

//# sourceMappingURL=Documents.js.map
