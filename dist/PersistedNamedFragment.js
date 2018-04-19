"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NamedFragment_1 = require("./NamedFragment");
var Fragment_1 = require("./Fragment");
exports.PersistedNamedFragment = {
    isDecorated: function (object) {
        return Fragment_1.Fragment.isDecorated(object);
    },
    decorate: function (object) {
        if (exports.PersistedNamedFragment.isDecorated(object))
            return object;
        var fragment = NamedFragment_1.NamedFragment.decorate(object);
        return Fragment_1.Fragment.decorate(fragment);
    },
};

//# sourceMappingURL=PersistedNamedFragment.js.map
