import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { CS } from "../Vocabularies";
export interface CredentialSet extends Document {
    user: Pointer;
}
export interface CredentialSetFactory {
    TYPE: CS["CredentialSet"];
    SCHEMA: ObjectSchema;
}
export declare const CredentialSet: CredentialSetFactory;
