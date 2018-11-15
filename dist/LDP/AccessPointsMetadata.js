"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vocabularies_1 = require("../Vocabularies");
var VolatileResource_1 = require("./VolatileResource");
exports.AccessPointsMetadata = {
    TYPE: Vocabularies_1.C.AccessPointsMetadata,
    SCHEMA: {
        "@vocab": null,
    },
    is: function (value) {
        return VolatileResource_1.VolatileResource.is(value)
            && value.hasType(exports.AccessPointsMetadata.TYPE);
    },
};

//# sourceMappingURL=AccessPointsMetadata.js.map
