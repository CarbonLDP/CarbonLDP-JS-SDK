import * as ObjectSchema from "./../ObjectSchema";
import * as PersistedDocument from "./../PersistedDocument";
import * as VolatileResource from "./VolatileResource";
import * as Map from "./Map";
import BlankNode from "./../BlankNode";
export declare const RDF_CLASS: string;
export declare const SCHEMA: ObjectSchema.Class;
export interface Class extends VolatileResource.Class {
    relatedDocument: PersistedDocument.Class;
    eTag?: string;
    bNodesMap?: Map.Class<BlankNode, BlankNode>;
}
export declare class Factory {
    static hasClassProperties(object: Object): boolean;
    static is(object: Object): boolean;
}
export default Class;
