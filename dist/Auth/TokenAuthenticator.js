"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Errors = __importStar(require("../Errors"));
var HTTP_1 = require("../HTTP");
var Errors_1 = require("../HTTP/Errors");
var LDP_1 = require("../LDP");
var Node_1 = require("../RDF/Node");
var Utils_1 = require("../Utils");
var Vocabularies_1 = require("../Vocabularies");
var Authenticator_1 = require("./Authenticator");
var BasicAuthenticator_1 = require("./BasicAuthenticator");
var TokenCredentials_1 = require("./TokenCredentials");
var TokenAuthenticator = (function (_super) {
    __extends(TokenAuthenticator, _super);
    function TokenAuthenticator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenAuthenticator.prototype.isAuthenticated = function () {
        return _super.prototype.isAuthenticated.call(this) && this._credentials.expires > new Date();
    };
    TokenAuthenticator.prototype.authenticate = function (tokenOrCredentials) {
        if (TokenCredentials_1.TokenCredentialsBase.is(tokenOrCredentials))
            return this._parseCredentialsBase(tokenOrCredentials);
        return this._getCredentials(tokenOrCredentials);
    };
    TokenAuthenticator.prototype._getHeaderValue = function () {
        return "Bearer " + this._credentials.token;
    };
    TokenAuthenticator.prototype._parseCredentialsBase = function (credentialsBase) {
        var _this = this;
        return Utils_1.promiseMethod(function () {
            var credentials = TokenCredentials_1.TokenCredentials.createFrom(credentialsBase);
            if (credentials.expires <= new Date())
                throw new Errors.IllegalArgumentError("The token has already expired.");
            return _this._credentials = credentials;
        });
    };
    TokenAuthenticator.prototype._getCredentials = function (token) {
        var _this = this;
        var basicAuthenticator = new BasicAuthenticator_1.BasicAuthenticator(this.context);
        return basicAuthenticator
            .authenticate(token)
            .then(function () {
            var requestOptions = {};
            basicAuthenticator.addAuthentication(requestOptions);
            HTTP_1.RequestUtils.setRetrievalPreferences({ include: [Vocabularies_1.CS.PreferAuthToken] }, requestOptions);
            return _this.getAuthenticatedUser(requestOptions);
        })
            .then(function () {
            return _this._credentials;
        });
    };
    TokenAuthenticator.prototype._parseRDFMetadata = function (rdfData, response, requestOptions) {
        var accessor = _super.prototype._parseRDFMetadata.call(this, rdfData, response);
        var authTokenPrefer = "include=\"" + Vocabularies_1.CS.PreferAuthToken + "\"";
        var prefer = requestOptions.headers && requestOptions.headers.get("prefer");
        if (!prefer || !prefer.hasValue(authTokenPrefer))
            return accessor;
        var preference = response.getHeader("preference-applied");
        if (!preference || !preference.hasValue(authTokenPrefer))
            throw new Errors_1.BadResponseError("Preference \"" + authTokenPrefer + "\" was not applied.", response);
        this._parseRDFCredentials(rdfData, response);
        return accessor;
    };
    TokenAuthenticator.prototype._parseRDFCredentials = function (rdfData, response) {
        var freeNodes = Node_1.RDFNode.getFreeNodes(rdfData);
        var freeResources = this.context.documents
            ._getFreeResources(freeNodes);
        var responseMetadata = freeResources
            .getResources()
            .find(LDP_1.ResponseMetadata.is);
        if (!responseMetadata)
            throw new Errors_1.BadResponseError("No \"" + LDP_1.ResponseMetadata.TYPE + "\" was returned.", response);
        var tokenCredentials = responseMetadata.authToken;
        if (!tokenCredentials)
            throw new Errors_1.BadResponseError("No \"" + TokenCredentials_1.TokenCredentials.TYPE + "\" was returned.", response);
        return this._credentials = tokenCredentials;
    };
    return TokenAuthenticator;
}(Authenticator_1.Authenticator));
exports.TokenAuthenticator = TokenAuthenticator;

//# sourceMappingURL=TokenAuthenticator.js.map
