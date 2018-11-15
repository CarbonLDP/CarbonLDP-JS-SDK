import { Documents } from "../Documents";
import { ProtectedDocument } from "../ProtectedDocument";
export interface RolesEndpoint extends ProtectedDocument {
}
export interface RolesEndpointFactory {
    is(value: any): value is RolesEndpoint;
    decorate<T extends object>(object: T, documents: Documents): T & RolesEndpoint;
}
export declare const RolesEndpoint: RolesEndpointFactory;
