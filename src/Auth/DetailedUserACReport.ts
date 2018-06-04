import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { CS } from "../Vocabularies";
import { PermissionReport } from "./PermissionReport";


export interface DetailedUserACReport {
	protectedDocument:Pointer;
	permissionReports:PermissionReport[];
}

export interface DetailedUserACReportFactory {
	TYPE:CS[ "DetailedUserACReport" ];
	SCHEMA:ObjectSchema;
}

export const DetailedUserACReport:DetailedUserACReportFactory = {
	TYPE: CS.DetailedUserACReport,
	SCHEMA: {
		"protectedDocument": {
			"@id": CS.protectedDocument,
			"@type": "@id",
		},
		"permissionReports": {
			"@id": CS.permissionReport,
			"@type": "@id",
			"@container": "@set",
		},
	},
};
