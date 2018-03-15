import { PointerLibrary } from "../Pointer";
import { Serializer } from "../RDF/Literal/Serializer";
import { RDFNode } from "../RDF/Node";
import * as ObjectSchema from "./../ObjectSchema";
export declare class JSONLDConverter {
    private _literalSerializers;
    readonly literalSerializers: Map<string, Serializer>;
    private static getDefaultSerializers();
    constructor(literalSerializers?: Map<string, Serializer>);
    compact(expandedObjects: Object[], targetObjects: Object[], digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary): Object[];
    compact(expandedObject: Object, targetObject: Object, digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary, strict?: boolean): Object;
    compact(expandedObjects: Object[], digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary): Object[];
    compact(expandedObject: Object, digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary): Object;
    expand(compactedObjects: Object[], generalSchema: ObjectSchema.DigestedObjectSchema, digestedSchema: ObjectSchema.DigestedObjectSchema): RDFNode[];
    expand(compactedObject: Object, generalSchema: ObjectSchema.DigestedObjectSchema, digestedSchema: ObjectSchema.DigestedObjectSchema): RDFNode;
    private expandSingle(compactedObject, generalSchema, digestedSchema);
    private expandProperty(propertyName, propertyValue, digestedSchema, generalSchema);
    private expandPropertyValue(propertyValue, digestedSchema, generalSchema);
    private expandPropertyPointer(propertyValue, digestedSchema, generalSchema);
    private expandPropertyLiteral(propertyValue, definition, digestedSchema);
    private expandPropertyLanguageMap(propertyValue);
    private expandPointerValue(propertyValue, digestedSchema, generalSchema);
    private expandValue(propertyValue, digestedSchema, generalSchema);
    private expandLiteralValue(literalValue, literalType);
    private compactSingle(expandedObject, targetObject, digestedSchema, pointerLibrary, strict?);
    private getPropertyContainerType(propertyValues);
    private getPropertyValue(propertyName, propertyValues, digestedSchema, pointerLibrary);
    private getPropertyURINameMap(digestedSchema);
    private compactPropertyLiteral(propertyValues, definition, digestedSchema);
}
