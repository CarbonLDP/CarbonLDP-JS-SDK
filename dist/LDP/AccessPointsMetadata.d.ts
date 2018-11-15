import { ObjectSchema } from "../ObjectSchema";
import { C } from "../Vocabularies";
import { VolatileResource } from "./VolatileResource";
export interface AccessPointsMetadata extends VolatileResource {
}
export interface AccessPointsMetadataFactory {
    TYPE: C["AccessPointsMetadata"];
    SCHEMA: ObjectSchema;
    is(value: any): value is AccessPointsMetadata;
}
export declare const AccessPointsMetadata: AccessPointsMetadataFactory;
