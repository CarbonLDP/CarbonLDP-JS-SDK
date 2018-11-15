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
var StringParser_1 = require("../HTTP/StringParser");
var Literal_1 = require("../RDF/Literal");
var RawResultsParser_1 = require("./RawResultsParser");
var SPARQLService = (function () {
    function SPARQLService() {
    }
    SPARQLService.executeRawASKQuery = function (url, askQuery, options) {
        if (options === void 0) { options = {}; }
        options = Object.assign(options, SPARQLService.DEFAULT_OPTIONS);
        Request_1.RequestUtils.setAcceptHeader("application/sparql-results+json", options);
        Request_1.RequestUtils.setContentTypeHeader("application/sparql-query", options);
        return Request_1.RequestService.post(url, askQuery, options, SPARQLService.RESULTS_PARSER);
    };
    SPARQLService.executeASKQuery = function (url, askQuery, options) {
        if (options === void 0) { options = {}; }
        return SPARQLService
            .executeRawASKQuery(url, askQuery, options)
            .then(function (_a) {
            var rawResults = _a[0], response = _a[1];
            return [rawResults.boolean, response];
        });
    };
    SPARQLService.executeRawSELECTQuery = function (url, selectQuery, options) {
        if (options === void 0) { options = {}; }
        options = Object.assign(options, SPARQLService.DEFAULT_OPTIONS);
        Request_1.RequestUtils.setAcceptHeader("application/sparql-results+json", options);
        Request_1.RequestUtils.setContentTypeHeader("application/sparql-query", options);
        return Request_1.RequestService.post(url, selectQuery, options, SPARQLService.RESULTS_PARSER);
    };
    SPARQLService.executeSELECTQuery = function (url, selectQuery, pointerLibrary, options) {
        if (options === void 0) { options = {}; }
        return SPARQLService
            .executeRawSELECTQuery(url, selectQuery, options)
            .then(function (_a) {
            var rawResults = _a[0], response = _a[1];
            var rawBindings = rawResults.results.bindings;
            var bindings = [];
            for (var _i = 0, rawBindings_1 = rawBindings; _i < rawBindings_1.length; _i++) {
                var bindingColumn = rawBindings_1[_i];
                var binding = {};
                for (var bindingRow in bindingColumn) {
                    if (!bindingColumn.hasOwnProperty(bindingRow))
                        continue;
                    var bindingCell = bindingColumn[bindingRow];
                    binding[bindingRow] = SPARQLService.parseRawBindingProperty(bindingCell, pointerLibrary);
                }
                bindings.push(binding);
            }
            var results = {
                vars: rawResults.head.vars,
                bindings: bindings,
            };
            return [results, response];
        });
    };
    SPARQLService.executeRawCONSTRUCTQuery = function (url, constructQuery, options) {
        if (options === void 0) { options = {}; }
        options = Object.assign(options, SPARQLService.DEFAULT_OPTIONS);
        if (Request_1.RequestUtils.getHeader("Accept", options) === undefined)
            Request_1.RequestUtils.setAcceptHeader("application/ld+json", options);
        Request_1.RequestUtils.setContentTypeHeader("application/sparql-query", options);
        return Request_1.RequestService.post(url, constructQuery, options, SPARQLService.STRING_PARSER);
    };
    SPARQLService.executeRawDESCRIBEQuery = function (url, describeQuery, options) {
        if (options === void 0) { options = {}; }
        options = Object.assign(options, SPARQLService.DEFAULT_OPTIONS);
        if (Request_1.RequestUtils.getHeader("Accept", options) === undefined)
            Request_1.RequestUtils.setAcceptHeader("application/ld+json", options);
        Request_1.RequestUtils.setContentTypeHeader("application/sparql-query", options);
        return Request_1.RequestService.post(url, describeQuery, options, SPARQLService.STRING_PARSER);
    };
    SPARQLService.executeUPDATE = function (url, updateQuery, options) {
        if (options === void 0) { options = {}; }
        options = Object.assign(options, SPARQLService.DEFAULT_OPTIONS);
        if (Request_1.RequestUtils.getHeader("Accept", options) === undefined)
            Request_1.RequestUtils.setAcceptHeader("application/ld+json", options);
        Request_1.RequestUtils.setContentTypeHeader("application/sparql-update", options);
        return Request_1.RequestService.post(url, updateQuery, options);
    };
    SPARQLService.parseRawBindingProperty = function (rawBindingProperty, pointerLibrary) {
        switch (rawBindingProperty.type) {
            case "uri":
                return pointerLibrary.getPointer(rawBindingProperty.value);
            case "bnode":
                throw new Errors.NotImplementedError("BNodes cannot be queried directly");
            case "literal":
                if ("datatype" in rawBindingProperty) {
                    return Literal_1.RDFLiteral.parse(rawBindingProperty.value, rawBindingProperty.datatype);
                }
                else {
                    return Literal_1.RDFLiteral.parse(rawBindingProperty.value);
                }
            default:
                throw new Errors.IllegalArgumentError("The bindingProperty has an unsupported type");
        }
    };
    SPARQLService.DEFAULT_OPTIONS = {};
    SPARQLService.RESULTS_PARSER = new RawResultsParser_1.SPARQLRawResultsParser();
    SPARQLService.STRING_PARSER = new StringParser_1.StringParser();
    return SPARQLService;
}());
exports.SPARQLService = SPARQLService;

//# sourceMappingURL=Service.js.map
