import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
import { SubjectReport } from "./SubjectReport";

export interface CompleteACReport extends TransientResource {
	protectedDocument:Pointer;
	subjectReports:SubjectReport[];
}


export interface CompleteACReportFactory {
	TYPE:CS[ "CompleteACReport" ];
	SCHEMA:ObjectSchema;


	is( value:any ):value is CompleteACReport;
}

export const CompleteACReport:CompleteACReportFactory = {
	TYPE: CS.CompleteACReport,
	SCHEMA: {
		"protectedDocument": {
			"@id": CS.protectedDocument,
			"@type": "@id",
		},
		"subjectReports": {
			"@id": CS.subjectReport,
			"@type": "@id",
			"@container": "@set",
		},
	},


	is( value:any ):value is CompleteACReport {
		return TransientResource.is( value )
			&& value.hasType( CompleteACReport.TYPE )
			;
	},
};
