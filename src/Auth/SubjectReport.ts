import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
import { PermissionReport } from "./PermissionReport";


export interface SubjectReport extends TransientResource {
	subject:Pointer;
	permissionReports:PermissionReport[];
}


export interface SubjectReportFactory {
	TYPE:CS[ "SubjectReport" ];
	SCHEMA:ObjectSchema;
}

export const SubjectReport:SubjectReportFactory = {
	TYPE: CS.SubjectReport,
	SCHEMA: {
		"subject": {
			"@id": CS.subject,
			"@type": "@id",
		},
		"permissionReports": {
			"@id": CS.permissionReport,
			"@type": "@id",
			"@container": "@set",
		},
	},
};
