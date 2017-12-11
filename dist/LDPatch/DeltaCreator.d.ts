import { Converter } from "../JSONLD";
import { DigestedObjectSchema } from "../ObjectSchema";
import * as Resource from "../Resource";
export declare class Class {
    private prefixesMap;
    private jsonldConverter;
    private addToken;
    private deleteToken;
    private updateLists;
    constructor(jsonldConverter: Converter.Class);
    getPatch(): string;
    addResource(schema: DigestedObjectSchema, oldResource: Resource.Class, newResource: Resource.Class): void;
    private getPropertyIRI(schema, propertyName);
    private getObjects(value, schema, definition?);
    private expandValues(values, schema, definition?);
    private expandLanguageMap(values, schema);
    private expandPointer(value, schema);
    private expandLiteral(value, schema, definition?);
    private compactIRI(schema, iri);
    private addPrefixFrom(object, schema);
}
export default Class;