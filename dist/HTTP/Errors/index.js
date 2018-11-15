"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ClientErrors = __importStar(require("./ClientErrors"));
var ServerErrors = __importStar(require("./ServerErrors"));
__export(require("./ClientErrors"));
__export(require("./ServerErrors"));
__export(require("./HTTPError"));
__export(require("./UnknownError"));
exports.statusCodeMap = new Map();
var addErrors = function (o) { return Object
    .keys(o)
    .map(function (k) { return o[k]; })
    .forEach(function (e) { return exports.statusCodeMap.set(e.statusCode, e); }); };
addErrors(ClientErrors);
addErrors(ServerErrors);

//# sourceMappingURL=index.js.map
