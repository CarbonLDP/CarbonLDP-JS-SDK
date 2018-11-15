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
var Errors = __importStar(require("../../../Errors"));
var Utils = __importStar(require("./../../../Utils"));
function pad(value) {
    var paddedValue = String(value);
    if (paddedValue.length === 1)
        paddedValue = "0" + paddedValue;
    return paddedValue;
}
var notNumberError = "The value is not a number.";
var DateSerializer = (function () {
    function DateSerializer() {
    }
    DateSerializer.prototype.serialize = function (value) {
        if (!Utils.isDate(value))
            throw new Errors.IllegalArgumentError("The value is not a Date object.");
        return value.getUTCFullYear() + "-" + pad((value.getUTCMonth() + 1)) + "-" + pad(value.getUTCDate());
    };
    return DateSerializer;
}());
exports.DateSerializer = DateSerializer;
exports.dateSerializer = new DateSerializer();
var DateTimeSerializer = (function () {
    function DateTimeSerializer() {
    }
    DateTimeSerializer.prototype.serialize = function (value) {
        if (!Utils.isDate(value))
            throw new Errors.IllegalArgumentError("The value is not a Date object.");
        return value.toISOString();
    };
    return DateTimeSerializer;
}());
exports.DateTimeSerializer = DateTimeSerializer;
exports.dateTimeSerializer = new DateTimeSerializer();
var TimeSerializer = (function () {
    function TimeSerializer() {
    }
    TimeSerializer.prototype.serialize = function (value) {
        if (!Utils.isDate(value))
            throw new Errors.IllegalArgumentError("The value is not a Date object.");
        return pad(value.getUTCHours())
            + ":" + pad(value.getUTCMinutes())
            + ":" + pad(value.getUTCSeconds())
            + "." + String((value.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
            + "Z";
    };
    return TimeSerializer;
}());
exports.TimeSerializer = TimeSerializer;
exports.timeSerializer = new TimeSerializer();
var IntegerSerializer = (function () {
    function IntegerSerializer() {
    }
    IntegerSerializer.prototype.serialize = function (value) {
        if (!Utils.isNumber(value))
            throw new Errors.IllegalArgumentError(notNumberError);
        return (~~value).toString();
    };
    return IntegerSerializer;
}());
exports.IntegerSerializer = IntegerSerializer;
exports.integerSerializer = new IntegerSerializer();
var LongSerializer = (function () {
    function LongSerializer() {
    }
    LongSerializer.prototype.serialize = function (value) {
        if (!Utils.isNumber(value))
            throw new Errors.IllegalArgumentError(notNumberError);
        return Math.trunc(value).toString();
    };
    return LongSerializer;
}());
exports.LongSerializer = LongSerializer;
exports.longSerializer = new LongSerializer();
var UnsignedIntegerSerializer = (function (_super) {
    __extends(UnsignedIntegerSerializer, _super);
    function UnsignedIntegerSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UnsignedIntegerSerializer.prototype.serialize = function (value) {
        var stringValue = _super.prototype.serialize.call(this, value);
        stringValue = Utils.StringUtils.startsWith(stringValue, "-") ? stringValue.substring(1) : stringValue;
        return stringValue;
    };
    return UnsignedIntegerSerializer;
}(IntegerSerializer));
exports.UnsignedIntegerSerializer = UnsignedIntegerSerializer;
exports.unsignedIntegerSerializer = new UnsignedIntegerSerializer();
var UnsignedLongSerializer = (function () {
    function UnsignedLongSerializer() {
    }
    UnsignedLongSerializer.prototype.serialize = function (value) {
        if (!Utils.isNumber(value))
            throw new Errors.IllegalArgumentError(notNumberError);
        return Math.trunc(Math.abs(value)).toString();
    };
    return UnsignedLongSerializer;
}());
exports.UnsignedLongSerializer = UnsignedLongSerializer;
exports.unsignedLongSerializer = new UnsignedLongSerializer();
var FloatSerializer = (function () {
    function FloatSerializer() {
    }
    FloatSerializer.prototype.serialize = function (value) {
        if (value === Number.POSITIVE_INFINITY)
            return "INF";
        if (value === Number.NEGATIVE_INFINITY)
            return "-INF";
        if (!Utils.isNumber(value))
            throw new Errors.IllegalArgumentError(notNumberError);
        return value.toString();
    };
    return FloatSerializer;
}());
exports.FloatSerializer = FloatSerializer;
exports.floatSerializer = new FloatSerializer();
var BooleanSerializer = (function () {
    function BooleanSerializer() {
    }
    BooleanSerializer.prototype.serialize = function (value) {
        return (!!value).toString();
    };
    return BooleanSerializer;
}());
exports.BooleanSerializer = BooleanSerializer;
exports.booleanSerializer = new BooleanSerializer();
var StringSerializer = (function () {
    function StringSerializer() {
    }
    StringSerializer.prototype.serialize = function (value) {
        return String(value);
    };
    return StringSerializer;
}());
exports.StringSerializer = StringSerializer;
exports.stringSerializer = new StringSerializer();

//# sourceMappingURL=XSD.js.map
