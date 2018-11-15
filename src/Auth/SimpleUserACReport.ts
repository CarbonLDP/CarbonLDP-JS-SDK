import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import { CS } from "../Vocabularies";

export interface SimpleUserACReport extends TransientResource {
	protectedDocument:Pointer;
	permissions:Pointer[];
}


export interface SimpleUserACReportFactory {
	TYPE:CS[ "SimpleUserACReport" ];
	SCHEMA:ObjectSchema;


	is( value:any ):value is SimpleUserACReport;
}

export const SimpleUserACReport:SimpleUserACReportFactory = {
	TYPE: CS.SimpleUserACReport,
	SCHEMA: {
		"protectedDocument": {
			"@id": CS.protectedDocument,
			"@type": "@id",
		},
		"permissions": {
			"@id": CS.permission,
			"@type": "@id",
			"@container": "@set",
		},
	},


	is( value:any ):value is SimpleUserACReport {
		return TransientResource.is( value )
			&& value.hasType( SimpleUserACReport.TYPE )
			;
	},
};
