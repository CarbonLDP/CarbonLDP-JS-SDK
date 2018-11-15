import { Pointer } from "../../Pointer";
import {
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	OPTIONAL
} from "../../test/JasmineExtender";
import { BaseRole } from "./BaseRole";


describe( module( "carbonldp/Auth/Role" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.BaseRole",
		"Base interface with the base properties for a role document."
	), ():void => {

		it( hasProperty(
			OPTIONAL,
			"name",
			"string",
			"A optional name for the role."
		), ():void => {
			const target:BaseRole[ "name" ] = "name" as string;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"description",
			"string",
			"An optional large description of the role."
		), ():void => {
			const target:BaseRole[ "description" ] = "description" as string;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"parent",
			"CarbonLDP.Pointer",
			"Parent role where the new role will be added as a child role relationship."
		), ():void => {
			const target:BaseRole[ "parent" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

	} );

} );
