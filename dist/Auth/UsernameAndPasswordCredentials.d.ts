import { VolatileResource } from "../LDP";
import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
export interface UsernameAndPasswordCredentialsBase {
    username: string;
    password: string;
}
export interface UsernameAndPasswordCredentials extends TransientResource {
    username?: string;
    password?: string;
    passwordSecret?: Pointer;
}
export interface UsernameAndPasswordCredentialsFactory {
    TYPE: CS["UsernameAndPasswordCredentials"];
    SCHEMA: ObjectSchema;
    create<T extends object>(data: T & UsernameAndPasswordCredentialsBase): T & UsernameAndPasswordCredentials & VolatileResource;
    createFrom<T extends object>(object: T & UsernameAndPasswordCredentialsBase): T & UsernameAndPasswordCredentials & VolatileResource;
}
export declare const UsernameAndPasswordCredentials: UsernameAndPasswordCredentialsFactory;
