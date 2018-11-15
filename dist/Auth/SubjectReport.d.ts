import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
import { PermissionReport } from "./PermissionReport";
export interface SubjectReport extends TransientResource {
    subject: Pointer;
    permissionReports: PermissionReport[];
}
export interface SubjectReportFactory {
    TYPE: CS["SubjectReport"];
    SCHEMA: ObjectSchema;
}
export declare const SubjectReport: SubjectReportFactory;
