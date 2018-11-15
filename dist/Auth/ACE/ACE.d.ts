import { ModelSchema } from "../../core/ModelSchema";
import { ObjectSchema } from "../../ObjectSchema";
import { Pointer } from "../../Pointer";
import { TransientResource } from "../../Resource";
import { CS } from "../../Vocabularies";
import { BaseACE } from "./BaseACE";
export interface ACE extends TransientResource {
    subject: Pointer;
    permissions: Pointer[];
}
export interface ACEFactory extends ModelSchema {
    TYPE: CS["AccessControlEntry"];
    SCHEMA: ObjectSchema;
    create<T extends object>(data: T & BaseACE): T & ACE;
    createFrom<T extends object>(object: T & BaseACE): T & ACE;
}
export declare const ACE: ACEFactory;
