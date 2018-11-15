import { Pointer } from "../../Pointer";
import { QueryContextBuilder } from "./QueryContextBuilder";
import { QueryObject } from "./QueryObject";
import { QueryProperty } from "./QueryProperty";
import { QuerySchema } from "./QuerySchema";
import { QuerySchemaProperty } from "./QuerySchemaProperty";
import { QueryValue } from "./QueryValue";
export declare class QueryDocumentBuilder {
    static readonly ALL: Readonly<{}>;
    static readonly FULL: Readonly<{}>;
    inherit: Readonly<{}>;
    all: Readonly<{}>;
    full: Readonly<{}>;
    readonly _context: QueryContextBuilder;
    protected _document: QueryProperty;
    private _typesTriple;
    private _values;
    private _schema;
    constructor(queryContext: QueryContextBuilder, property: QueryProperty);
    property(name?: string): QueryProperty;
    value(value: string | number | boolean | Date): QueryValue;
    object(object: Pointer | string): QueryObject;
    withType(type: string): this;
    properties(propertiesSchema: QuerySchema): this;
    filter(constraint: string): this;
    values(...values: (QueryValue | QueryObject)[]): this;
    _addProperty(propertyName: string, propertyDefinition: QuerySchemaProperty): QueryProperty;
    private addPropertyDefinition(propertyName, propertyDefinition);
}
