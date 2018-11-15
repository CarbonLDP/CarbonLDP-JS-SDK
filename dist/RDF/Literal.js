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
var XSD_1 = require("../Vocabularies/XSD");
var Utils = __importStar(require("./../Utils"));
var Serializers = __importStar(require("./Literal/Serializers"));
exports.Serializers = Serializers;
exports.RDFLiteral = {
    from: function (value) {
        if (Utils.isNull(value))
            throw new Errors.IllegalArgumentError("Null cannot be converted into a Literal");
        if (!Utils.isDefined(value))
            throw new Errors.IllegalArgumentError("The value is undefined");
        var type;
        switch (true) {
            case Utils.isDate(value):
                type = XSD_1.XSD.dateTime;
                value = value.toISOString();
                break;
            case Utils.isNumber(value):
                if (Utils.isInteger(value)) {
                    type = XSD_1.XSD.integer;
                }
                else {
                    type = XSD_1.XSD.double;
                }
                break;
            case Utils.isString(value):
                type = XSD_1.XSD.string;
                break;
            case Utils.isBoolean(value):
                type = XSD_1.XSD.boolean;
                break;
            default:
                type = XSD_1.XSD.object;
                value = JSON.stringify(value);
                break;
        }
        var literal = { "@value": value.toString() };
        if (type)
            literal["@type"] = type;
        return literal;
    },
    parse: function (valueOrLiteral, type) {
        var literalValue;
        if (Utils.isString(valueOrLiteral)) {
            literalValue = valueOrLiteral;
        }
        else {
            var literal = valueOrLiteral;
            if (!literal)
                return null;
            if (!Utils.hasProperty(literal, "@value"))
                return null;
            type = "@type" in literal ? literal["@type"] : null;
            literalValue = literal["@value"];
        }
        var value = literalValue;
        var parts;
        switch (type) {
            case XSD_1.XSD.date:
            case XSD_1.XSD.dateTime:
                value = new Date(literalValue);
                break;
            case XSD_1.XSD.time:
                parts = literalValue.match(/(\d+):(\d+):(\d+)\.(\d+)Z/);
                value = new Date();
                value.setUTCHours(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4]));
                break;
            case XSD_1.XSD.duration:
                break;
            case XSD_1.XSD.gDay:
            case XSD_1.XSD.gMonth:
            case XSD_1.XSD.gMonthDay:
            case XSD_1.XSD.gYear:
            case XSD_1.XSD.gYearMonth:
                break;
            case XSD_1.XSD.byte:
            case XSD_1.XSD.decimal:
            case XSD_1.XSD.int:
            case XSD_1.XSD.integer:
            case XSD_1.XSD.long:
            case XSD_1.XSD.negativeInteger:
            case XSD_1.XSD.nonNegativeInteger:
            case XSD_1.XSD.nonPositiveInteger:
            case XSD_1.XSD.positiveInteger:
            case XSD_1.XSD.short:
            case XSD_1.XSD.unsignedLong:
            case XSD_1.XSD.unsignedInt:
            case XSD_1.XSD.unsignedShort:
            case XSD_1.XSD.unsignedByte:
            case XSD_1.XSD.double:
            case XSD_1.XSD.float:
                value = parseFloat(literalValue);
                break;
            case XSD_1.XSD.boolean:
                value = Utils.parseBoolean(literalValue);
                break;
            case XSD_1.XSD.string:
                value = literalValue;
                break;
            case XSD_1.XSD.object:
                value = JSON.parse(literalValue);
                break;
            default:
                break;
        }
        return value;
    },
    is: function (value) {
        return Utils.hasProperty(value, "@value")
            && Utils.isString(value["@value"]);
    },
    hasType: function (value, type) {
        if (!value["@type"] && type === XSD_1.XSD.string)
            return true;
        return value["@type"] === type;
    },
};

//# sourceMappingURL=Literal.js.map
