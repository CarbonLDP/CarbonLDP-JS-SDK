import { PointerLibrary } from "../Pointer/PointerLibrary";
import { Serializer } from "../RDF/Literal/Serializer";
import { RDFNode } from "../RDF/Node";
import * as ObjectSchema from "./../ObjectSchema";
export declare class JSONLDConverter {
    private readonly _literalSerializers;
    readonly literalSerializers: Map<string, Serializer>;
    private static getDefaultSerializers;
    constructor(literalSerializers?: Map<string, Serializer>);
    compact(expandedObjects: Object[], targetObjects: Object[], digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary): Object[];
    compact(expandedObject: Object, targetObject: Object, digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary, strict?: boolean): Object;
    compact(expandedObjects: Object[], digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary): Object[];
    compact(expandedObject: Object, digestedSchema: ObjectSchema.DigestedObjectSchema, pointerLibrary: PointerLibrary): Object;
    expand(compactedObjects: Object[], generalSchema: ObjectSchema.DigestedObjectSchema, digestedSchema: ObjectSchema.DigestedObjectSchema): RDFNode[];
    expand(compactedObject: Object, generalSchema: ObjectSchema.DigestedObjectSchema, digestedSchema: ObjectSchema.DigestedObjectSchema): RDFNode;
    private expandSingle;
    private expandProperty;
    private expandPropertyValue;
    private expandPropertyPointer;
    private expandPropertyLiteral;
    private expandPropertyLanguageMap;
    private expandPointerValue;
    private expandValue;
    private expandLiteralValue;
    private compactSingle;
    private getPropertyContainerType;
    private getPropertyValue;
    private getPropertyURINameMap;
    private compactPropertyLiteral;
    private getProperties;
    private getPropertyPointers;
}
