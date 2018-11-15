import { ObjectSchema } from "../../ObjectSchema";
import { Pointer } from "../../Pointer";
import { ProtectedDocument } from "../../ProtectedDocument";
import { TransientRoleFactory } from "./TransientRole";
export interface Role extends ProtectedDocument {
    name?: string;
    description?: string;
    parent?: Pointer;
    children?: Pointer[];
    users?: Pointer[];
}
export interface RoleFactory extends Pick<TransientRoleFactory, "TYPE" | "create" | "createFrom"> {
    SCHEMA: ObjectSchema;
    is(value: any): value is Role;
}
export declare const Role: RoleFactory;
