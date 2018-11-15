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
var JSONParser_1 = require("../HTTP/JSONParser");
var Request_1 = require("../HTTP/Request");
var List_1 = require("../RDF/List");
var URI_1 = require("../RDF/URI");
var ObjectSchema = __importStar(require("./../ObjectSchema"));
var Utils = __importStar(require("./../Utils"));
var MAX_CONTEXT_URLS = 10;
var LINK_HEADER_REL = "http://www.w3.org/ns/json-ld#context";
var JSONLDProcessor = (function () {
    function JSONLDProcessor() {
    }
    JSONLDProcessor.expand = function (input) {
        return JSONLDProcessor.retrieveContexts(input, Object.create(null), "").then(function () {
            var expanded = JSONLDProcessor.process(new ObjectSchema.DigestedObjectSchema(), input);
            if (Utils.isObject(expanded) && "@graph" in expanded && Object.keys(expanded).length === 1) {
                expanded = expanded["@graph"];
            }
            else if (expanded === null) {
                expanded = [];
            }
            if (!Utils.isArray(expanded))
                expanded = [expanded];
            return expanded;
        });
    };
    JSONLDProcessor.getTargetFromLinkHeader = function (header) {
        var rLinkHeader = /\s*<([^>]*?)>\s*(?:;\s*(.*))?/;
        for (var _i = 0, _a = header.values; _i < _a.length; _i++) {
            var value = _a[_i];
            var match = value.toString().match(rLinkHeader);
            if (!match)
                continue;
            var target = match[1];
            var params = match[2];
            var rParams = /(.*?)=(?:(?:"([^"]*?)")|([^"]*?))\s*(?:(?:;\s*)|$)/g;
            var result = {};
            while (true) {
                match = rParams.exec(params);
                if (!match)
                    break;
                result[match[1]] = (match[2] === undefined) ? match[3] : match[2];
            }
            if (result["rel"] === LINK_HEADER_REL)
                return target;
        }
        return null;
    };
    JSONLDProcessor.findContextURLs = function (input, contexts, base, replace) {
        if (replace === void 0) { replace = false; }
        var previousContexts = Object.keys(contexts).length;
        if (Utils.isArray(input)) {
            for (var _i = 0, _a = input; _i < _a.length; _i++) {
                var element = _a[_i];
                JSONLDProcessor.findContextURLs(element, contexts, base);
            }
        }
        else if (Utils.isPlainObject(input)) {
            for (var key in input) {
                if ("@context" !== key) {
                    JSONLDProcessor.findContextURLs(input[key], contexts, base);
                    continue;
                }
                var urlOrArrayOrContext = input[key];
                if (Utils.isArray(urlOrArrayOrContext)) {
                    var contextArray = urlOrArrayOrContext;
                    for (var index = 0, length_1 = contextArray.length; index < length_1; ++index) {
                        var urlOrContext = contextArray[index];
                        if (!Utils.isString(urlOrContext))
                            continue;
                        var url = urlOrContext;
                        url = URI_1.URI.resolve(base, url);
                        if (replace) {
                            if (Utils.isArray(contexts[url])) {
                                Array.prototype.splice.apply(contextArray, [index, 1].concat(contexts[url]));
                                index += contexts[url].length - 1;
                                length_1 = contextArray.length;
                            }
                            else {
                                contextArray[index] = contexts[url];
                            }
                        }
                        else if (!(url in contexts)) {
                            contexts[url] = true;
                        }
                    }
                }
                else if (Utils.isString(urlOrArrayOrContext)) {
                    var url = urlOrArrayOrContext;
                    url = URI_1.URI.resolve(base, url);
                    if (replace) {
                        input[key] = contexts[url];
                    }
                    else if (!(url in contexts)) {
                        contexts[url] = null;
                    }
                }
            }
        }
        return previousContexts < Object.keys(contexts).length;
    };
    JSONLDProcessor.retrieveContexts = function (input, contextsRequested, base) {
        if (Object.keys(contextsRequested).length > MAX_CONTEXT_URLS)
            return Promise.reject(new Errors_1.InvalidJSONLDSyntaxError("Maximum number of @context URLs exceeded."));
        var contextToResolved = Object.create(null);
        if (!JSONLDProcessor.findContextURLs(input, contextToResolved, base))
            return Promise.resolve();
        function resolved(url, promise) {
            return promise.then(function (_a) {
                var object = _a[0], response = _a[1];
                var _contextsRequested = Utils.ObjectUtils.clone(contextsRequested);
                _contextsRequested[url] = true;
                var contextWrapper = { "@context": {} };
                var header = response.getHeader("Content-Type");
                if (!Utils.StringUtils.contains(header.toString(), "application/ld+json")) {
                    header = response.getHeader("Link");
                    var link = void 0;
                    if (!!header)
                        link = JSONLDProcessor.getTargetFromLinkHeader(header);
                    if (!!link)
                        contextWrapper["@context"] = link;
                }
                else {
                    contextWrapper["@context"] = ("@context" in object) ? object["@context"] : {};
                }
                contextToResolved[url] = contextWrapper["@context"];
                return JSONLDProcessor.retrieveContexts(contextWrapper, _contextsRequested, url);
            });
        }
        var promises = [];
        var _loop_1 = function (url) {
            if (url in contextsRequested)
                return { value: Promise.reject(new Errors_1.InvalidJSONLDSyntaxError("Cyclical @context URLs detected.")) };
            var requestOptions = { sendCredentialsOnCORS: false };
            Request_1.RequestUtils.setAcceptHeader("application/ld+json, application/json", requestOptions);
            var promise = Request_1.RequestService
                .get(url, requestOptions, new JSONParser_1.JSONParser())
                .catch(function (response) {
                return Promise.reject(new Errors_1.InvalidJSONLDSyntaxError("Unable to resolve context from \"" + url + "\". Status code: " + response.status));
            });
            promises.push(resolved(url, promise));
        };
        for (var url in contextToResolved) {
            var state_1 = _loop_1(url);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return Promise.all(promises).then(function () {
            JSONLDProcessor.findContextURLs(input, contextToResolved, base, true);
        });
    };
    JSONLDProcessor.isKeyword = function (value) {
        if (!Utils.isString(value))
            return false;
        switch (value) {
            case "@base":
            case "@context":
            case "@container":
            case "@default":
            case "@embed":
            case "@explicit":
            case "@graph":
            case "@id":
            case "@index":
            case "@language":
            case "@list":
            case "@omitDefault":
            case "@preserve":
            case "@requireAll":
            case "@reverse":
            case "@set":
            case "@type":
            case "@value":
            case "@vocab":
                return true;
            default:
                return false;
        }
    };
    JSONLDProcessor.isValidType = function (value) {
        if (Utils.isString(value))
            return true;
        if (!Utils.isArray(value))
            return false;
        for (var _i = 0, _a = value; _i < _a.length; _i++) {
            var element = _a[_i];
            if (!Utils.isString(element))
                return false;
        }
        return true;
    };
    JSONLDProcessor.expandURI = function (schema, uri, relativeTo) {
        if (JSONLDProcessor.isKeyword(uri))
            return uri;
        return ObjectSchema.ObjectSchemaUtils.resolveURI(uri, schema, relativeTo);
    };
    JSONLDProcessor.expandLanguageMap = function (languageMap) {
        var expandedLanguage = [];
        var keys = Object.keys(languageMap).sort();
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var values = languageMap[key];
            if (!Utils.isArray(values))
                values = [values];
            for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
                var item = values_1[_a];
                if (item === null)
                    continue;
                if (!Utils.isString(item))
                    throw new Errors_1.InvalidJSONLDSyntaxError("Language map values must be strings.");
                expandedLanguage.push({
                    "@value": item,
                    "@language": key.toLowerCase(),
                });
            }
        }
        return expandedLanguage;
    };
    JSONLDProcessor.getContainer = function (context, property) {
        if (context.properties.has(property))
            return context.properties.get(property).containerType;
        return void 0;
    };
    JSONLDProcessor.expandValue = function (context, value, propertyName) {
        if (Utils.isNull(value) || !Utils.isDefined(value))
            return null;
        if (propertyName === "@id") {
            return JSONLDProcessor.expandURI(context, value, { base: true });
        }
        else if (propertyName === "@type") {
            return JSONLDProcessor.expandURI(context, value, { vocab: true, base: true });
        }
        var definition = new ObjectSchema.DigestedObjectSchemaProperty();
        if (context.properties.has(propertyName))
            definition = context.properties.get(propertyName);
        if (definition.literal === false || (propertyName === "@graph" && Utils.isString(value))) {
            var options = { base: true };
            if (definition.pointerType === ObjectSchema.PointerType.VOCAB)
                options.vocab = true;
            return { "@id": JSONLDProcessor.expandURI(context, value, options) };
        }
        if (JSONLDProcessor.isKeyword(propertyName))
            return value;
        var expandedValue = {};
        if (definition.literalType) {
            expandedValue["@type"] = ObjectSchema.ObjectSchemaUtils.resolveURI(definition.literalType, context, { vocab: true, base: true });
        }
        else if (Utils.isString(value)) {
            var language = Utils.isDefined(definition.language) ? definition.language : context.language;
            if (language !== null)
                expandedValue["@language"] = language;
        }
        if (["boolean", "number", "string"].indexOf(typeof value) === -1)
            value = value.toString();
        expandedValue["@value"] = value;
        return expandedValue;
    };
    JSONLDProcessor.process = function (context, element, activeProperty, insideList) {
        if (Utils.isNull(element) || !Utils.isDefined(element))
            return null;
        if (!Utils.isArray(element) && !Utils.isObject(element)) {
            if (!insideList && (activeProperty === null || activeProperty === "@graph"))
                return null;
            return JSONLDProcessor.expandValue(context, element, activeProperty);
        }
        if (Utils.isArray(element)) {
            var container = JSONLDProcessor.getContainer(context, activeProperty);
            insideList = insideList || container === ObjectSchema.ContainerType.LIST;
            var expanded = [];
            for (var _i = 0, _a = element; _i < _a.length; _i++) {
                var item = _a[_i];
                var expandedItem = JSONLDProcessor.process(context, item, activeProperty);
                if (expandedItem === null)
                    continue;
                if (insideList && (Utils.isArray(expandedItem) || List_1.RDFList.is(expandedItem)))
                    throw new Errors_1.InvalidJSONLDSyntaxError("Lists of lists are not permitted.");
                if (!Utils.isArray(expandedItem))
                    expandedItem = [expandedItem];
                expanded.push.apply(expanded, expandedItem);
            }
            return expanded;
        }
        if ("@context" in element) {
            context = ObjectSchema.ObjectSchemaDigester
                .combineDigestedObjectSchemas([
                context,
                ObjectSchema.ObjectSchemaDigester.digestSchema(element["@context"]),
            ]);
        }
        var expandedElement = {};
        var keys = Object.keys(element);
        for (var _b = 0, keys_2 = keys; _b < keys_2.length; _b++) {
            var key = keys_2[_b];
            if (key === "@context")
                continue;
            var uri = JSONLDProcessor.expandURI(context, key, { vocab: true });
            if (!uri || !(URI_1.URI.isAbsolute(uri) || URI_1.URI.isBNodeID(uri) || JSONLDProcessor.isKeyword(uri)))
                continue;
            var value = element[key];
            if (JSONLDProcessor.isKeyword(uri)) {
                if (uri === "@id" && !Utils.isString(value))
                    throw new Errors_1.InvalidJSONLDSyntaxError("\"@id\" value must a string.");
                if (uri === "@type" && !JSONLDProcessor.isValidType(value))
                    throw new Errors_1.InvalidJSONLDSyntaxError("\"@type\" value must a string, an array of strings.");
                if (uri === "@graph" && !(Utils.isObject(value) || Utils.isArray(value)))
                    throw new Errors_1.InvalidJSONLDSyntaxError("\"@graph\" value must not be an object or an array.");
                if (uri === "@value" && (Utils.isObject(value) || Utils.isArray(value)))
                    throw new Errors_1.InvalidJSONLDSyntaxError("\"@value\" value must not be an object or an array.");
                if (uri === "@language") {
                    if (value === null)
                        continue;
                    if (!Utils.isString(value))
                        throw new Errors_1.InvalidJSONLDSyntaxError("\"@language\" value must be a string.");
                    value = value.toLowerCase();
                }
                if (uri === "@index" && !Utils.isString(value))
                    throw new Errors_1.InvalidJSONLDSyntaxError("\"@index\" value must be a string.");
                if (uri === "@reverse" && !Utils.isObject(value))
                    throw new Errors_1.InvalidJSONLDSyntaxError("\"@reverse\" value must be an object.");
                if (uri === "@index" || uri === "@reverse")
                    throw new Errors_1.NotImplementedError("The SDK does not support \"@index\" and \"@reverse\" tags.");
            }
            var expandedValue = void 0;
            var container = JSONLDProcessor.getContainer(context, key);
            if (container === ObjectSchema.ContainerType.LANGUAGE && Utils.isObject(value)) {
                expandedValue = JSONLDProcessor.expandLanguageMap(value);
            }
            else {
                var nextActiveProperty = key;
                var isList = uri === "@list";
                if (isList || uri === "@set") {
                    nextActiveProperty = activeProperty;
                    if (isList && activeProperty === "@graph")
                        nextActiveProperty = null;
                }
                expandedValue = JSONLDProcessor.process(context, value, nextActiveProperty, isList);
            }
            if (expandedValue === null && uri !== "@value")
                continue;
            if (uri !== "@list" && !List_1.RDFList.is(expandedValue) && container === ObjectSchema.ContainerType.LIST) {
                if (!Utils.isArray(expandedValue))
                    expandedValue = [expandedValue];
                expandedValue = { "@list": expandedValue };
            }
            var useArray = ["@type", "@id", "@value", "@language"].indexOf(uri) === -1;
            JSONLDProcessor.addValue(expandedElement, uri, expandedValue, { propertyIsArray: useArray });
        }
        if ("@value" in expandedElement) {
            if (expandedElement["@value"] === null)
                expandedElement = null;
        }
        else if ("@type" in expandedElement) {
            if (!Utils.isArray(expandedElement["@type"]))
                expandedElement["@type"] = [expandedElement["@type"]];
        }
        else if ("@set" in expandedElement) {
            expandedElement = expandedElement["@set"];
        }
        return expandedElement;
    };
    JSONLDProcessor.addValue = function (element, propertyName, value, options) {
        if (Utils.isArray(value)) {
            var values = value;
            if (values.length === 0 && options.propertyIsArray && !Utils.hasProperty(element, propertyName))
                element[propertyName] = [];
            for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
                var item = values_2[_i];
                JSONLDProcessor.addValue(element, propertyName, item, options);
            }
        }
        else if (propertyName in element) {
            if (!JSONLDProcessor.hasValue(element, propertyName, value)) {
                var items = element[propertyName];
                if (!Utils.isArray(items))
                    items = element[propertyName] = [items];
                items.push(value);
            }
        }
        else {
            element[propertyName] = options.propertyIsArray ? [value] : value;
        }
    };
    JSONLDProcessor.hasProperty = function (element, propertyName) {
        if (propertyName in element) {
            var item = element[propertyName];
            return !Utils.isArray(item) || item.length > 0;
        }
        return false;
    };
    JSONLDProcessor.compareValues = function (value1, value2) {
        if (value1 === value2)
            return true;
        if (Utils.isObject(value1) && Utils.isObject(value2)) {
            if ("@value" in value1
                && value1["@value"] === value2["@value"]
                && value1["@type"] === value2["@type"]
                && value1["@language"] === value2["@language"]
                && value1["@index"] === value2["@index"])
                return true;
            if ("@id" in value1)
                return value1["@id"] === value2["@id"];
        }
        return false;
    };
    JSONLDProcessor.hasValue = function (element, propertyName, value) {
        if (JSONLDProcessor.hasProperty(element, propertyName)) {
            var item = element[propertyName];
            var isList = List_1.RDFList.is(item);
            if (isList || Utils.isArray(item)) {
                var items = isList ? item["@list"] : item;
                for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                    var entry = items_1[_i];
                    if (JSONLDProcessor.compareValues(entry, value))
                        return true;
                }
            }
            else if (!Utils.isArray(value)) {
                return JSONLDProcessor.compareValues(item, value);
            }
        }
        return false;
    };
    return JSONLDProcessor;
}());
exports.JSONLDProcessor = JSONLDProcessor;

//# sourceMappingURL=Processor.js.map
