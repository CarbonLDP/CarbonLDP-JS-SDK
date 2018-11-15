import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
import { SubjectReport } from "./SubjectReport";
export interface CompleteACReport extends TransientResource {
    protectedDocument: Pointer;
    subjectReports: SubjectReport[];
}
export interface CompleteACReportFactory {
    TYPE: CS["CompleteACReport"];
    SCHEMA: ObjectSchema;
    is(value: any): value is CompleteACReport;
}
export declare const CompleteACReport: CompleteACReportFactory;
