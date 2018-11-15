import { Document } from "../Document";
import { ObjectSchema } from "../ObjectSchema";
import { CS } from "../Vocabularies";
export interface PasswordSecret extends Document {
    hashedPassword?: string;
}
export interface PasswordSecretFactory {
    TYPE: CS["PasswordSecret"];
    SCHEMA: ObjectSchema;
}
export declare const PasswordSecret: PasswordSecretFactory;
