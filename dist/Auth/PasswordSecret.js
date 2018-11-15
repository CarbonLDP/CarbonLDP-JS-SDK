"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vocabularies_1 = require("../Vocabularies");
exports.PasswordSecret = {
    TYPE: Vocabularies_1.CS.PasswordSecret,
    SCHEMA: {
        "hashedPassword": {
            "@id": Vocabularies_1.CS.hashedPassword,
            "@type": Vocabularies_1.XSD.string,
        },
    },
};

//# sourceMappingURL=PasswordSecret.js.map
