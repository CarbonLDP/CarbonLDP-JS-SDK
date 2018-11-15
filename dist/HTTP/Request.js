"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var https_1 = __importDefault(require("https"));
var url_1 = __importDefault(require("url"));
var Utils = __importStar(require("./../Utils"));
var Errors_1 = require("./Errors");
var Header_1 = require("./Header");
var HTTPMethod_1 = require("./HTTPMethod");
var Response_1 = require("./Response");
function forEachHeaders(headers, setHeader) {
    var namesIterator = headers.keys();
    var next = namesIterator.next();
    while (!next.done) {
        var name_1 = next.value;
        var value = headers.get(name_1);
        setHeader(name_1, value.toString());
        next = namesIterator.next();
    }
}
function onResolve(resolve, reject, response) {
    if (response.status >= 200 && response.status <= 299) {
        resolve(response);
    }
    else {
        reject(response);
    }
}
function sendWithBrowser(method, url, body, options) {
    return new Promise(function (resolve, reject) {
        var request = options.request ? options.request : new XMLHttpRequest();
        request.open(method, url, true);
        if (options.headers)
            forEachHeaders(options.headers, function (name, value) { return request.setRequestHeader(name, value); });
        request.withCredentials = options.sendCredentialsOnCORS;
        if (options.timeout)
            request.timeout = options.timeout;
        request.onload = request.onerror = function () {
            var response = new Response_1.Response(request);
            onResolve(resolve, reject, response);
        };
        if (body) {
            request.send(body);
        }
        else {
            request.send();
        }
    });
}
function sendWithNode(method, url, body, options) {
    return new Promise(function (resolve, reject) {
        function returnResponse(request, res) {
            var rawData = [];
            res.on("data", function (chunk) {
                if (typeof chunk === "string")
                    chunk = Buffer.from(chunk, "utf-8");
                rawData.push(chunk);
            }).on("end", function () {
                var data = Buffer.concat(rawData).toString("utf8");
                var response = new Response_1.Response(request, data, res);
                onResolve(resolve, reject, response);
            });
        }
        var numberOfRedirects = 0;
        function sendRequestWithRedirect(_url) {
            var parsedURL = url_1.default.parse(_url);
            var Adapter = parsedURL.protocol === "http:" ? http_1.default : https_1.default;
            var requestOptions = {
                protocol: parsedURL.protocol,
                hostname: parsedURL.hostname,
                port: parsedURL.port,
                path: parsedURL.path,
                method: method,
                headers: {},
            };
            if (options.headers)
                forEachHeaders(options.headers, function (name, value) { return requestOptions.headers[name] = value; });
            var request = Adapter.request(requestOptions);
            if (options.timeout)
                request.setTimeout(options.timeout);
            request.on("response", function (res) {
                if (res.statusCode >= 300 && res.statusCode <= 399 && "location" in res.headers) {
                    if (++numberOfRedirects < 10)
                        return sendRequestWithRedirect(url_1.default.resolve(_url, res.headers.location));
                }
                returnResponse(request, res);
            });
            request.on("error", function (error) {
                var response = new Response_1.Response(request, error.message);
                onResolve(resolve, reject, response);
            });
            request.end(body);
        }
        sendRequestWithRedirect(url);
    });
}
function sendRequest(method, url, body, options) {
    return typeof XMLHttpRequest !== "undefined" ?
        sendWithBrowser(method, url, body, options) :
        sendWithNode(method, url, body, options);
}
function isBody(data) {
    return Utils.isString(data)
        || typeof Blob !== "undefined" && data instanceof Blob
        || typeof Buffer !== "undefined" && data instanceof Buffer;
}
var RequestService = (function () {
    function RequestService() {
    }
    RequestService.send = function (method, url, bodyOrOptions, optionsOrParser, parser) {
        var _this = this;
        if (bodyOrOptions === void 0) { bodyOrOptions = RequestService.defaultOptions; }
        if (optionsOrParser === void 0) { optionsOrParser = RequestService.defaultOptions; }
        if (parser === void 0) { parser = null; }
        var body = null;
        var options = Utils.hasProperty(optionsOrParser, "parse") ? bodyOrOptions : optionsOrParser;
        parser = Utils.hasProperty(optionsOrParser, "parse") ? optionsOrParser : parser;
        if (isBody(bodyOrOptions)) {
            body = bodyOrOptions;
        }
        else {
            options = bodyOrOptions ? bodyOrOptions : options;
        }
        options = Object.assign({}, RequestService.defaultOptions, options);
        if (Utils.isNumber(method))
            method = HTTPMethod_1.HTTPMethod[method];
        var requestPromise = sendRequest(method, url, body, options)
            .then(function (response) {
            if (method === "GET" && options.headers)
                return _this._handleGETResponse(url, options, response);
            else
                return response;
        });
        if (parser === null)
            return requestPromise;
        return requestPromise.then(function (response) {
            return parser.parse(response.data).then(function (parsedBody) {
                return [parsedBody, response];
            });
        });
    };
    RequestService.options = function (url, options) {
        if (options === void 0) { options = RequestService.defaultOptions; }
        return RequestService.send(HTTPMethod_1.HTTPMethod.OPTIONS, url, options);
    };
    RequestService.head = function (url, options) {
        if (options === void 0) { options = RequestService.defaultOptions; }
        return RequestService.send(HTTPMethod_1.HTTPMethod.HEAD, url, options);
    };
    RequestService.get = function (url, options, parser) {
        if (options === void 0) { options = RequestService.defaultOptions; }
        if (parser === void 0) { parser = null; }
        return RequestService.send(HTTPMethod_1.HTTPMethod.GET, url, null, options, parser);
    };
    RequestService.post = function (url, bodyOrOptions, options, parser) {
        if (bodyOrOptions === void 0) { bodyOrOptions = RequestService.defaultOptions; }
        if (options === void 0) { options = RequestService.defaultOptions; }
        if (parser === void 0) { parser = null; }
        return RequestService.send(HTTPMethod_1.HTTPMethod.POST, url, bodyOrOptions, options, parser);
    };
    RequestService.put = function (url, bodyOrOptions, options, parser) {
        if (bodyOrOptions === void 0) { bodyOrOptions = RequestService.defaultOptions; }
        if (options === void 0) { options = RequestService.defaultOptions; }
        if (parser === void 0) { parser = null; }
        return RequestService.send(HTTPMethod_1.HTTPMethod.PUT, url, bodyOrOptions, options, parser);
    };
    RequestService.patch = function (url, bodyOrOptions, options, parser) {
        if (bodyOrOptions === void 0) { bodyOrOptions = RequestService.defaultOptions; }
        if (options === void 0) { options = RequestService.defaultOptions; }
        if (parser === void 0) { parser = null; }
        return RequestService.send(HTTPMethod_1.HTTPMethod.PATCH, url, bodyOrOptions, options, parser);
    };
    RequestService.delete = function (url, bodyOrOptions, optionsOrParser, parser) {
        if (bodyOrOptions === void 0) { bodyOrOptions = RequestService.defaultOptions; }
        if (optionsOrParser === void 0) { optionsOrParser = RequestService.defaultOptions; }
        if (parser === void 0) { parser = null; }
        return RequestService.send(HTTPMethod_1.HTTPMethod.DELETE, url, bodyOrOptions, optionsOrParser, parser);
    };
    RequestService._handleGETResponse = function (url, requestOptions, response) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (_this._contentTypeIsAccepted(requestOptions, response))
                return response;
            _this._setNoCacheHeaders(requestOptions);
            if (!_this._isChromiumAgent())
                _this._setFalseETag(requestOptions);
            return sendRequest("GET", url, null, requestOptions)
                .then(function (noCachedResponse) {
                if (!_this._contentTypeIsAccepted(requestOptions, response)) {
                    throw new Errors_1.BadResponseError("The server responded with an unacceptable Content-Type", response);
                }
                return noCachedResponse;
            });
        });
    };
    RequestService._contentTypeIsAccepted = function (requestOptions, response) {
        var accepts = requestOptions.headers.has("accept") ?
            requestOptions.headers.get("accept").values :
            [];
        var contentType = response.headers.has("content-type") ?
            response.headers.get("content-type") :
            null;
        return !contentType || accepts.some(contentType.hasValue, contentType);
    };
    RequestService._setNoCacheHeaders = function (requestOptions) {
        requestOptions.headers
            .set("pragma", new Header_1.Header("no-cache"))
            .set("cache-control", new Header_1.Header("no-cache, max-age=0"));
    };
    RequestService._isChromiumAgent = function () {
        return typeof window !== "undefined" && !window["chrome"];
    };
    RequestService._setFalseETag = function (requestOptions) {
        requestOptions.headers.set("if-none-match", new Header_1.Header());
    };
    RequestService.defaultOptions = {
        sendCredentialsOnCORS: true,
    };
    return RequestService;
}());
exports.RequestService = RequestService;
var RequestUtils = (function () {
    function RequestUtils() {
    }
    RequestUtils.getHeader = function (headerName, requestOptions, initialize) {
        if (initialize === void 0) { initialize = false; }
        headerName = headerName.toLowerCase();
        if (initialize) {
            var headers = requestOptions.headers ? requestOptions.headers : requestOptions.headers = new Map();
            if (!headers.has(headerName))
                headers.set(headerName, new Header_1.Header());
        }
        if (!requestOptions.headers)
            return undefined;
        return requestOptions.headers.get(headerName);
    };
    RequestUtils.setAcceptHeader = function (accept, requestOptions) {
        var headers = requestOptions.headers ? requestOptions.headers : requestOptions.headers = new Map();
        headers.set("accept", new Header_1.Header(accept));
        return requestOptions;
    };
    RequestUtils.setContentTypeHeader = function (contentType, requestOptions) {
        var headers = requestOptions.headers ? requestOptions.headers : requestOptions.headers = new Map();
        headers.set("content-type", new Header_1.Header(contentType));
        return requestOptions;
    };
    RequestUtils.setIfMatchHeader = function (eTag, requestOptions) {
        if (!eTag)
            return;
        var headers = requestOptions.headers ? requestOptions.headers : requestOptions.headers = new Map();
        headers.set("if-match", new Header_1.Header(eTag));
        return requestOptions;
    };
    RequestUtils.setIfNoneMatchHeader = function (eTag, requestOptions) {
        if (!eTag)
            return;
        var headers = requestOptions.headers ? requestOptions.headers : requestOptions.headers = new Map();
        headers.set("if-none-match", new Header_1.Header(eTag));
        return requestOptions;
    };
    RequestUtils.setPreferredInteractionModel = function (interactionModelURI, requestOptions) {
        var prefer = RequestUtils.getHeader("prefer", requestOptions, true);
        prefer.values.push(interactionModelURI + "; rel=interaction-model");
        return requestOptions;
    };
    RequestUtils.setPreferredRetrieval = function (retrievalType, requestOptions) {
        var prefer = RequestUtils.getHeader("prefer", requestOptions, true);
        prefer.values.push("return=" + retrievalType);
        return requestOptions;
    };
    RequestUtils.setRetrievalPreferences = function (preferences, requestOptions) {
        var prefer = RequestUtils.getHeader("prefer", requestOptions, true);
        var keys = ["include", "omit"];
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (key in preferences && preferences[key].length > 0) {
                prefer.values.push(key + "=\"" + preferences[key].join(" ") + "\"");
            }
        }
        return requestOptions;
    };
    RequestUtils.setSlug = function (slug, requestOptions) {
        var slugHeader = RequestUtils.getHeader("slug", requestOptions, true);
        slugHeader.values.push(slug);
        return requestOptions;
    };
    RequestUtils.isOptions = function (object) {
        return Utils.hasPropertyDefined(object, "headers")
            || Utils.hasPropertyDefined(object, "sendCredentialsOnCORS")
            || Utils.hasPropertyDefined(object, "timeout")
            || Utils.hasPropertyDefined(object, "request");
    };
    RequestUtils.cloneOptions = function (options) {
        var clone = __assign({}, options, { headers: new Map() });
        if (options.headers)
            options.headers
                .forEach(function (value, key) { return clone.headers.set(key, new Header_1.Header(value.values.slice())); });
        return clone;
    };
    return RequestUtils;
}());
exports.RequestUtils = RequestUtils;

//# sourceMappingURL=Request.js.map
