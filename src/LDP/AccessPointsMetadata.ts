import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { C } from "../Vocabularies";
import { VolatileResource } from "./VolatileResource";


export interface AccessPointsMetadata extends VolatileResource {
}


export interface AccessPointsMetadataFactory {
	TYPE:C[ "AccessPointsMetadata" ];
	SCHEMA:ObjectSchema;

	is( value:any ):value is AccessPointsMetadata;
}

export const AccessPointsMetadata:AccessPointsMetadataFactory = {
	TYPE: C.AccessPointsMetadata,
	SCHEMA: {
		"@vocab": null,
	},

	is( value:any ):value is AccessPointsMetadata {
		return VolatileResource.is( value )
			&& value.hasType( AccessPointsMetadata.TYPE )
			;
	},
};
