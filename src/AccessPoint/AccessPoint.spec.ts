import {
	extendsClass,
	hasMethod,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC,
} from "../test/JasmineExtender";
import { AccessPoint } from "./AccessPoint";

describe( module( "carbonldp/AccessPoint" ), ():void => {

	describe( interfaze(
		"CarbonLDP.AccessPoint",
		"Interface that represents a persisted Carbon LDP AccessPoint."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientAccessPoint" ), ():void => {} );
		it( extendsClass( "CarbonLDP.ProtectedDocument" ), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"membershipResource",
			"CarbonLDP.Pointer",
			"The membership resource the access point belongs to."
		), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"hasMemberRelation",
			"CarbonLDP.Pointer",
			"The member relation of the access point manages."
		), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"isMemberOfRelation",
			"CarbonLDP.Pointer",
			"The inverted relation of the access point."
		), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"insertedContentRelation",
			"CarbonLDP.Pointer",
			"The inserted content relation of the access point."
		), ():void => {} );

	} );

	describe( interfaze(
		"CarbonLDP.AccessPointFactory",
		"Interface with the factory, decorate and utils methods of a `CarbonLDP.AccessPointFactory` object."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.C.AccessPoint"
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"is",
			"Returns true if the object provided is considered a `CarbonLDP.AccessPoint` object", [
				{ name: "value", type: "any" },
			],
			{ type: "value is CarbonLDP.AccessPoint" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"create",
			[ "T extends object" ],
			"Creates a `CarbonLDP.TransientAccessPoint` object with the parameters specified.", [
				{ name: "data", type: "T & CarbonLDP.BaseAccessPoint", description: "Data necessary to create an access point." },
			],
			{ type: "CarbonLDP.TransientAccessPoint" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"createFrom",
			[ "T extends object" ],
			"Creates a `CarbonLDP.TransientAccessPoint` object from the object and parameters specified.", [
				{ name: "object", type: "T & CarbonLDP.BaseAccessPoint", description: "Object that will be converted into an AccessPoint." },
			],
			{ type: "T & CarbonLDP.TransientAccessPoint" }
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"AccessPoint",
		"CarbonLDP.AccessPointFactory",
		"Constant that implements the `CarbonLDP.AccessPointFactory` interface."
	), ():void => {

		it( "should exists", ():void => {
			expect( AccessPoint ).toBeDefined();
			expect( AccessPoint ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Test `TYPE`
		// TODO: Test `is`
		// TODO: Test `create`
		// TODO: Test `createFrom`

	} );

} );

