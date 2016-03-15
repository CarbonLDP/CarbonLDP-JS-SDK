import * as ObjectSchema from "./ObjectSchema";
import * as Pointer from "./Pointer";
import * as RDF from "./RDF";
export declare class Class {
    private _literalSerializers;
    literalSerializers: Map<string, RDF.Literal.Serializer>;
    private static getDefaultSerializers();
    constructor(literalSerializers?: Map<string, RDF.Literal.Serializer>);
    compact(expandedObjects: Object[], targetObjects: Object[], digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: Pointer.Library): Object[];
    compact(expandedObject: Object, targetObject: Object, digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: Pointer.Library): Object;
    compact(expandedObjects: Object[], digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: Pointer.Library): Object[];
    compact(expandedObject: Object, digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: Pointer.Library): Object;
    expand(compactedObjects: Object[], digestedSchema: ObjectSchema.DigestedObjectSchema, pointerValidator?: Pointer.Validator): RDF.Node.Class[];
    expand(compactedObject: Object, digestedSchema: ObjectSchema.DigestedObjectSchema, pointerValidator?: Pointer.Validator): RDF.Node.Class;
    private expandSingle(compactedObject, digestedSchema, pointerValidator);
    private expandProperty(propertyValue, propertyDefinition, pointerValidator);
    private expandPropertyValue(propertyValue, pointerValidator);
    private expandPropertyPointer(propertyValue, pointerValidator);
    private expandPropertyLiteral(propertyValue, literalType);
    private expandPropertyList(propertyValues, pointerValidator);
    private expandPropertyPointerList(propertyValues, pointerValidator);
    private expandPropertyLiteralList(propertyValues, literalType);
    private expandPropertyValues(propertyValues, pointerValidator);
    private expandPropertyPointers(propertyValues, pointerValidator);
    private expandPropertyLiterals(propertyValues, literalType);
    private expandPropertyLanguageMap(propertyValue);
    private serializeLiteral(propertyValue, literalType);
    private expandPointer(propertyValue, pointerValidator);
    private expandArray(propertyValue, pointerValidator);
    private expandValue(propertyValue, pointerValidator);
    private expandLiteral(literalValue);
    private compactSingle(expandedObject, targetObject, digestedSchema, pointerLibrary);
    private assignProperty(compactedObject, expandedObject, propertyName, digestedSchema, pointerLibrary);
    private assignURIProperty(compactedObject, expandedObject, propertyURI, pointerLibrary);
    private getPropertyContainerType(propertyValues);
    private getPropertyValue(expandedObject, propertyDefinition, pointerLibrary);
    private getProperty(expandedObject, propertyURI, pointerLibrary);
    private getPropertyPointer(expandedObject, propertyURI, pointerLibrary);
    private getPropertyLiteral(expandedObject, propertyURI, literalType);
    private getPropertyList(expandedObject, propertyURI, pointerLibrary);
    private getPropertyPointerList(expandedObject, propertyURI, pointerLibrary);
    private getPropertyLiteralList(expandedObject, propertyURI, literalType);
    private getProperties(expandedObject, propertyURI, pointerLibrary);
    private getPropertyPointers(expandedObject, propertyURI, pointerLibrary);
    private getPropertyLiterals(expandedObject, propertyURI, literalType);
    private getPropertyLanguageMap(expandedObject, propertyURI);
    private getList(propertyValues);
    private getPropertyURINameMap(digestedSchema);
    private parseValue(propertyValue, pointerLibrary);
}
export default Class;
