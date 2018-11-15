import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
import { GrantingStep } from "./GrantingStep";
export interface PermissionReport extends TransientResource {
    permission: Pointer;
    granted: boolean;
    grantingChain: GrantingStep[];
}
export interface PermissionReportFactory {
    TYPE: CS["PermissionReport"];
    SCHEMA: ObjectSchema;
}
export declare const PermissionReport: PermissionReportFactory;
