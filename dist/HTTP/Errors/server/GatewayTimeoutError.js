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
Object.defineProperty(exports, "__esModule", { value: true });
var HTTPError_1 = require("./../HTTPError");
var name = "GatewayTimeoutError";
var statusCode = 504;
var GatewayTimeoutError = (function (_super) {
    __extends(GatewayTimeoutError, _super);
    function GatewayTimeoutError(message, response) {
        var _this = _super.call(this, message, response) || this;
        Object.setPrototypeOf(_this, GatewayTimeoutError.prototype);
        return _this;
    }
    Object.defineProperty(GatewayTimeoutError, "statusCode", {
        get: function () { return statusCode; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GatewayTimeoutError.prototype, "name", {
        get: function () { return name; },
        enumerable: true,
        configurable: true
    });
    return GatewayTimeoutError;
}(HTTPError_1.default));
exports.GatewayTimeoutError = GatewayTimeoutError;
exports.default = GatewayTimeoutError;

//# sourceMappingURL=GatewayTimeoutError.js.map
