import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
export interface GrantingStep extends TransientResource {
    subject?: Pointer;
    applied: boolean;
    appliedBy: Pointer;
    protectedDocument: Pointer;
    accessControlList: Pointer;
    inheritanceDisabledBy?: Pointer[];
}
export interface GrantingStepFactory {
    TYPE: CS["GrantingStep"];
    SCHEMA: ObjectSchema;
}
export declare const GrantingStep: GrantingStepFactory;
