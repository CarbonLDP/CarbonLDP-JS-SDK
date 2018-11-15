import { VolatileResource } from "../LDP";
import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { CS } from "../Vocabularies";
export interface AuthenticatedUserMetadata extends VolatileResource {
    user: Pointer;
}
export interface AuthenticatedUserMetadataFactory {
    TYPE: CS["AuthenticatedUserMetadata"];
    SCHEMA: ObjectSchema;
}
export declare const AuthenticatedUserMetadata: AuthenticatedUserMetadataFactory;
