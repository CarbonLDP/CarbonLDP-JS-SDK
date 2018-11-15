import { BaseDocument } from "../../Document";
import { Pointer } from "../../Pointer";
import {
	extendsClass,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	OPTIONAL
} from "../../test/JasmineExtender";
import { ACE } from "../ACE";
import { BaseACL } from "./BaseACL";
import { TransientACL } from "./TransientACL";

describe( module( "carbonLDP/Auth/ACL" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.BaseACL",
		"Interface with the base properties for the creation of an ACL."
	), () => {

		it( extendsClass( "CarbonLDP.TransientDocument" ), ():void => {
			const target:BaseDocument = {} as BaseACL;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"protectedDocument",
			"CarbonLDP.Pointer",
			"Reference to the protected document the ACL belongs."
		), ():void => {
			const target:TransientACL[ "protectedDocument" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"inherits",
			"boolean",
			"Flag that enables or disables the parents ACL inheritance.\n" +
			"If not set, it will be considered as true."
		), ():void => {
			const target:TransientACL[ "inherits" ] = true as boolean;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"directACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to the target protected document."
		), ():void => {
			const target:TransientACL[ "directACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"immediateDescendantsACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to the immediate descendants of the protected document."
		), ():void => {
			const target:TransientACL[ "immediateDescendantsACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"allDescendantsACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to all the branch descendants of the protected document."
		), ():void => {
			const target:TransientACL[ "allDescendantsACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

	} );

} );
