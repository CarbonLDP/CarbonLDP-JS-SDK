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
var HTTPError_1 = require("./HTTPError");
var name = "UnknownError";
var UnknownError = (function (_super) {
    __extends(UnknownError, _super);
    function UnknownError(message, response) {
        var _this = _super.call(this, message, response) || this;
        Object.setPrototypeOf(_this, UnknownError.prototype);
        return _this;
    }
    Object.defineProperty(UnknownError.prototype, "name", {
        get: function () { return name; },
        enumerable: true,
        configurable: true
    });
    return UnknownError;
}(HTTPError_1.default));
exports.UnknownError = UnknownError;
exports.default = UnknownError;

//# sourceMappingURL=UnknownError.js.map
