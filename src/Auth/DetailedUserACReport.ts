import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";
import { PermissionReport } from "./PermissionReport";


export interface DetailedUserACReport extends TransientResource {
	protectedDocument:Pointer;
	permissionReports:PermissionReport[];
}

export interface DetailedUserACReportFactory {
	TYPE:CS[ "DetailedUserACReport" ];
	SCHEMA:ObjectSchema;


	is( value:any ):value is DetailedUserACReport;
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


	is( value:any ):value is DetailedUserACReport {
		return TransientResource.is( value )
			&& value.hasType( DetailedUserACReport.TYPE )
			;
	},
};
