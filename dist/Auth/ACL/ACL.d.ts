import { Document } from "../../Document";
import { ObjectSchema } from "../../ObjectSchema";
import { Pointer } from "../../Pointer";
import { ACE } from "../ACE";
import { TransientACLFactory } from "./TransientACL";
export interface ACL extends Document {
    protectedDocument?: Pointer;
    inherits?: boolean;
    directACEntries?: ACE[];
    immediateDescendantsACEntries?: ACE[];
    allDescendantsACEntries?: ACE[];
}
export interface ACLFactory extends TransientACLFactory {
    SCHEMA: ObjectSchema;
}
export declare const ACL: ACLFactory;
