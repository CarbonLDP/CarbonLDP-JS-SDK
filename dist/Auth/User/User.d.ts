import { ObjectSchema } from "../../ObjectSchema";
import { ProtectedDocument } from "../../ProtectedDocument";
import { CS } from "../../Vocabularies";
import { TransientUserFactory } from "./TransientUser";
export interface User extends ProtectedDocument {
    name?: string;
}
export interface UserFactory extends TransientUserFactory {
    TYPE: CS["User"];
    SCHEMA: ObjectSchema;
    is(value: any): value is User;
}
export declare const User: UserFactory;
