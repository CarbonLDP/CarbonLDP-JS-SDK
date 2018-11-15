import { Pointer } from "../Pointer";
import {
	extendsClass,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC
} from "../test/JasmineExtender";
import { CS } from "../Vocabularies";
import { CredentialSet } from "./CredentialSet";


describe( module( "Carbon/Auth/CredentialSet" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.CredentialSet",
		"Interface that describe the document that contains all the credentials of a user."
	), ():void => {

		it( extendsClass( "CarbonLDP.Document" ), () => {} );


		it( "should exists", ():void => {
			const target:CredentialSet = {} as any;
			expect( target ).toBeDefined();
		} );

		it( hasProperty( OPTIONAL, "user", "CarbonLDP.Pointer.Class" ), ():void => {
			const target:CredentialSet[ "user" ] = Pointer.create();
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.CredentialSetFactory",
		"Interface with the factory for `CarbonLDP.Auth.CredentialSet` object."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabularies.CS.CredentialsSet"
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"CredentialsSet",
		"CarbonLDP.Auth.CredentialSetFactory"
	), ():void => {

		it( "should exists", ():void => {
			expect( CredentialSet ).toBeDefined();
			expect( CredentialSet ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Separate in different tests
		it( "CredentialsSet.TYPE", ():void => {
			expect( CredentialSet.TYPE ).toEqual( jasmine.any( String ) );
			expect( CredentialSet.TYPE ).toBe( CS.CredentialSet );
		} );

		describe( "CredentialsSet.SCHEMA", ():void => {

			it( "should exists", ():void => {
				expect( CredentialSet.SCHEMA ).toBeDefined();
				expect( CredentialSet.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );

			it( "should have `cs:user` property", ():void => {
				expect( CredentialSet.SCHEMA[ "user" ] ).toEqual( {
					"@id": CS.user,
					"@type": "@id",
				} );
			} );

		} );

	} );

} );
