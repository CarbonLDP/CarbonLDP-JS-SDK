import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
import { PermissionReport } from "./PermissionReport";
export interface DetailedUserACReport extends TransientResource {
    protectedDocument: Pointer;
    permissionReports: PermissionReport[];
}
export interface DetailedUserACReportFactory {
    TYPE: CS["DetailedUserACReport"];
    SCHEMA: ObjectSchema;
    is(value: any): value is DetailedUserACReport;
}
export declare const DetailedUserACReport: DetailedUserACReportFactory;
