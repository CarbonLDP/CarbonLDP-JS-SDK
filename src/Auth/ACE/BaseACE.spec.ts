import { Pointer } from "../../Pointer";
import { BaseResource } from "../../Resource";
import {
	extendsClass,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY
} from "../../test/JasmineExtender";
import { BaseACE } from "./BaseACE";

describe( module( "carbonldp/Auth/ACE" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.BaseACE",
		"Interface with the base properties for create an ACE."
	), () => {

		it( extendsClass( "CarbonLDP.BaseResource" ), () => {
			const target:BaseResource = {} as BaseACE;
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OBLIGATORY,
			"permissions",
			"CarbonLDP.Pointer[]",
			"An array with all the permissions to grant or deny."
		), ():void => {
			const target:BaseACE[ "permissions" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"subject",
			"CarbonLDP.Pointer",
			"The subject to grant the specified permissions."
		), ():void => {
			const target:BaseACE[ "subject" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

	} );

} );
