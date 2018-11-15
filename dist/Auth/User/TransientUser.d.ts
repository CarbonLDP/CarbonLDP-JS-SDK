import { TransientDocument } from "../../Document";
import { CS } from "../../Vocabularies";
import { UsernameAndPasswordCredentials } from "../UsernameAndPasswordCredentials";
import { BaseUser } from "./BaseUser";
export interface TransientUser extends TransientDocument {
    name?: string;
    credentials?: UsernameAndPasswordCredentials;
}
export interface TransientUserFactory {
    TYPE: CS["User"];
    is(value: any): value is TransientUser;
    create<T extends object>(data: T & BaseUser): T & TransientUser;
    createFrom<T extends object>(object: T & BaseUser): T & TransientUser;
}
export declare const TransientUser: TransientUserFactory;
