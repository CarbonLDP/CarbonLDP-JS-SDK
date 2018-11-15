"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokens_1 = require("sparqler/tokens");
var Utils_1 = require("../../Utils");
function getLevelRegExp(property) {
    if (property)
        property += ".";
    var parsedName = property.replace(/\./g, "\\.");
    return new RegExp("^" + parsedName + "[^.]+$");
}
exports.getLevelRegExp = getLevelRegExp;
function createPropertyPatterns(context, resourcePath, propertyPath, propertyDefinition) {
    var uri = propertyDefinition.uri, literalType = propertyDefinition.literalType, pointerType = propertyDefinition.pointerType;
    var propertyIRI = context.compactIRI(uri);
    var resource = context.getVariable(resourcePath);
    var propertyObject = context.getVariable(propertyPath);
    var propertyPatterns = [new tokens_1.SubjectToken(resource)
            .addPredicate(new tokens_1.PredicateToken(propertyIRI)
            .addObject(propertyObject)),
    ];
    if (literalType !== null)
        propertyPatterns
            .push(new tokens_1.FilterToken("datatype( " + propertyObject + " ) = " + context.compactIRI(literalType)));
    if (pointerType !== null)
        propertyPatterns
            .push(new tokens_1.FilterToken("! isLiteral( " + propertyObject + " )"));
    return propertyPatterns;
}
exports.createPropertyPatterns = createPropertyPatterns;
function createTypesPattern(context, resourcePath) {
    return new tokens_1.OptionalToken()
        .addPattern(new tokens_1.SubjectToken(context.getVariable(resourcePath))
        .addPredicate(new tokens_1.PredicateToken("a")
        .addObject(context.getVariable(resourcePath + ".types"))));
}
exports.createTypesPattern = createTypesPattern;
function createGraphPattern(context, resourcePath) {
    return new tokens_1.GraphToken(context.getVariable(resourcePath))
        .addPattern(new tokens_1.SubjectToken(context.getVariable(resourcePath + "._subject"))
        .addPredicate(new tokens_1.PredicateToken(context.getVariable(resourcePath + "._predicate"))
        .addObject(context.getVariable(resourcePath + "._object"))));
}
exports.createGraphPattern = createGraphPattern;
function createAllPattern(context, resourcePath) {
    return new tokens_1.SubjectToken(context.getVariable(resourcePath))
        .addPredicate(new tokens_1.PredicateToken(context.getVariable(resourcePath + "._predicate"))
        .addObject(context.getVariable(resourcePath + "._object")));
}
exports.createAllPattern = createAllPattern;
function getParentPath(path) {
    return path
        .split(".")
        .slice(0, -1)
        .join(".");
}
exports.getParentPath = getParentPath;
function isFullTriple(triple) {
    return triple
        .predicates
        .map(function (x) { return x.predicate; })
        .some(function (x) { return Utils_1.isObject(x) && x.token === "variable"; });
}
exports.isFullTriple = isFullTriple;
function getAllTriples(patterns) {
    var subjectsMap = new Map();
    internalTripleAdder(subjectsMap, patterns);
    return Array.from(subjectsMap.values());
}
exports.getAllTriples = getAllTriples;
function internalTripleAdder(subjectsMap, patterns) {
    patterns.forEach(function (pattern) {
        if (pattern.token === "optional" || pattern.token === "graph")
            return internalTripleAdder(subjectsMap, pattern.patterns);
        if (pattern.token !== "subject")
            return;
        var valid = pattern.predicates
            .map(function (predicate) { return predicate.objects; })
            .some(function (objects) { return objects.some(function (object) { return object.token === "variable"; }); });
        if (valid) {
            var subject = getSubject(subjectsMap, pattern);
            if (isFullTriple(subject))
                return;
            if (isFullTriple(pattern))
                subject.predicates.length = 0;
            (_a = subject.predicates).push.apply(_a, pattern.predicates);
        }
        var _a;
    });
}
function getSubject(subjectsMap, original) {
    var subjectStr = original.subject.toString();
    if (subjectsMap.has(subjectStr))
        return subjectsMap.get(subjectStr);
    var subject = new tokens_1.SubjectToken(original.subject);
    subjectsMap.set(subjectStr, subject);
    return subject;
}
function getResourcesVariables(patterns) {
    var resourcesVariables = new Set();
    patterns.forEach(function (pattern) {
        if (pattern.token === "optional")
            getResourcesVariables(pattern.patterns)
                .forEach(resourcesVariables.add, resourcesVariables);
        if (pattern.token === "graph" && pattern.graph.token === "variable")
            resourcesVariables.add(pattern.graph);
        if (pattern.token !== "subject")
            return;
        if (pattern.subject.token !== "variable")
            return;
        var predicate = pattern.predicates
            .find(function (p) { return p.predicate === "a" || p.predicate.token === "variable"; });
        if (predicate)
            resourcesVariables.add(pattern.subject);
    });
    return Array.from(resourcesVariables);
}
exports.getResourcesVariables = getResourcesVariables;
function getPathProperty(element, path) {
    if (element === void 0 || !path)
        return element;
    var _a = path.split("."), propName = _a[0], restParts = _a.slice(1);
    var property = element[propName];
    var restPath = restParts.join(".");
    return getPathProperty(property, restPath);
}
exports.getPathProperty = getPathProperty;
function areDifferentType(a, b) {
    if (typeof a !== typeof b)
        return true;
    if (typeof a === "object")
        return a instanceof Date !== b instanceof Date;
    return false;
}
exports.areDifferentType = areDifferentType;

//# sourceMappingURL=Utils.js.map
