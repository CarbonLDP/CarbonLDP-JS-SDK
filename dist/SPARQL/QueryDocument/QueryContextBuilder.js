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
}
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("../../Errors");
var ObjectSchema_1 = require("../../ObjectSchema");
var QueryContext = __importStar(require("./QueryContext"));
var QueryProperty = __importStar(require("./QueryProperty"));
var Utils_1 = require("./Utils");
var Class = (function (_super) {
    __extends(Class, _super);
    function Class(context) {
        var _this = _super.call(this, context) || this;
        _this._propertiesMap = new Map();
        return _this;
    }
    Class.prototype.hasProperty = function (name) {
        return this._propertiesMap.has(name);
    };
    Class.prototype.hasProperties = function (name) {
        var levelRegex = Utils_1.getLevelRegExp(name);
        return Array.from(this._propertiesMap.keys())
            .some(function (propertyName) { return levelRegex.test(propertyName); });
    };
    Class.prototype.addProperty = function (name) {
        var property = new QueryProperty.Class(this, name);
        this._propertiesMap.set(name, property);
        return property;
    };
    Class.prototype.getProperty = function (name) {
        return this._propertiesMap.get(name);
    };
    Class.prototype.getProperties = function (name) {
        var levelRegex = Utils_1.getLevelRegExp(name);
        return Array.from(this._propertiesMap.entries())
            .filter(function (_a) {
            var propertyName = _a[0];
            return levelRegex.test(propertyName);
        })
            .map(function (_a) {
            var propertyName = _a[0], property = _a[1];
            return property;
        });
    };
    Class.prototype.getInheritTypeDefinition = function (existingSchema, propertyName, propertyURI) {
        var schemas = [existingSchema].concat(this._getTypeSchemas());
        for (var _i = 0, schemas_1 = schemas; _i < schemas_1.length; _i++) {
            var schema = schemas_1[_i];
            if (!schema.properties.has(propertyName))
                continue;
            var mergeSchema = ObjectSchema_1.Digester.combineDigestedObjectSchemas([existingSchema, schema]);
            var digestedProperty = ObjectSchema_1.Util.resolveProperty(mergeSchema, schema.properties.get(propertyName));
            if (!propertyURI || propertyURI === digestedProperty.uri)
                return digestedProperty;
        }
    };
    Class.prototype.hasSchemaFor = function (object, path) {
        if (path === void 0)
            return _super.prototype.hasSchemaFor.call(this, object);
        if (!this.hasProperty(path))
            return false;
        var property = this.getProperty(path);
        return property.getType() !== void 0;
    };
    Class.prototype.getSchemaFor = function (object, path) {
        if (path === void 0)
            return _super.prototype.getSchemaFor.call(this, object);
        var property = this.getProperty(path);
        if (property) {
            switch (property.getType()) {
                case QueryProperty.PropertyType.PARTIAL:
                    return this.getProperty(path).getSchema();
                case QueryProperty.PropertyType.FULL:
                case QueryProperty.PropertyType.ALL:
                    return _super.prototype.getSchemaFor.call(this, object);
                default:
                    throw new Errors_1.IllegalArgumentError("Property \"" + path + "\" is not a resource.");
            }
        }
        var parent = this.getProperty(Utils_1.getParentPath(path));
        if (!parent || parent.getType() !== QueryProperty.PropertyType.FULL)
            throw new Errors_1.IllegalArgumentError("Schema path \"" + path + "\" does not exists.");
        return _super.prototype.getSchemaFor.call(this, object);
    };
    Class.prototype._getTypeSchemas = function () {
        var _this = this;
        if (this._schemas)
            return this._schemas;
        var schemasTypes = new Set();
        (function addSchemasTypes(context) {
            if (!context)
                return;
            Array.from(context["typeObjectSchemaMap"].keys()).forEach(schemasTypes.add, schemasTypes);
            addSchemasTypes(context.parentContext);
        })(this.context);
        this._schemas = [];
        schemasTypes.forEach(function (type) { return _this._schemas.push(_this.context.getObjectSchema(type)); });
        return this._schemas;
    };
    return Class;
}(QueryContext.Class));
exports.Class = Class;
exports.default = Class;

//# sourceMappingURL=QueryContextBuilder.js.map
