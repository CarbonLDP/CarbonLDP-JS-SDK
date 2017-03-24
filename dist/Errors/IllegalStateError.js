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
var AbstractError_1 = require("./AbstractError");
var IllegalStateError = (function (_super) {
    __extends(IllegalStateError, _super);
    function IllegalStateError(message) {
        if (message === void 0) { message = ""; }
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, IllegalStateError.prototype);
        return _this;
    }
    Object.defineProperty(IllegalStateError.prototype, "name", {
        get: function () { return "IllegalStateError"; },
        enumerable: true,
        configurable: true
    });
    return IllegalStateError;
}(AbstractError_1.default));
exports.IllegalStateError = IllegalStateError;
exports.default = IllegalStateError;

//# sourceMappingURL=IllegalStateError.js.map
