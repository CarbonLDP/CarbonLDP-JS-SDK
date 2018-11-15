import { AnyJasmineValue } from "../../test/helpers/types";
import {
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC
} from "../test/JasmineExtender";
import {
	CS,
	XSD
} from "../Vocabularies";
import { PasswordSecret } from "./PasswordSecret";


describe( module( "carbonldp/Auth/PasswordSecret" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.PasswordSecret",
		"Documents that stores the hashed password of an user."
	), () => {

		it( hasProperty(
			OPTIONAL,
			"hashedPassword",
			"string"
		), ():void => {
			const target:PasswordSecret[ "hashedPassword" ] = "password" as string;
			expect( target ).toBeDefined();
		} );

	} );


	describe( interfaze(
		"CarbonLDP.Auth.PasswordSecretFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.PasswordSecret` objects."
	), () => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.PasswordSecret"
		), ():void => {

			it( "should exists", ():void => {
				expect( PasswordSecret.TYPE ).toBeDefined();
			} );

			it( "should be cs:PasswordSecret", () => {
				expect( PasswordSecret.TYPE ).toBe( CS.PasswordSecret );
			} );

		} );

		describe( hasProperty(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {

			it( "should exists", ():void => {
				expect( PasswordSecret.SCHEMA ).toBeDefined();
			} );

			it( "should have interface properties", () => {
				type Target = AnyJasmineValue<Required<Pick<PasswordSecret,
					"hashedPassword">>>;

				expect( PasswordSecret.SCHEMA as Target ).toEqual( {
					"hashedPassword": jasmine.any( Object ),
				} );
			} );

			it( "should have cs:hashedPassword", () => {
				expect( PasswordSecret.SCHEMA[ "hashedPassword" ] ).toEqual( {
					"@id": CS.hashedPassword,
					"@type": XSD.string,
				} );
			} );

		} );

	} );

	it( hasProperty(
		STATIC,
		"PasswordSecret",
		"CarbonLDP.Auth.PasswordSecretFactory"
	), ():void => {
		expect( PasswordSecret ).toEqual( jasmine.any( Object ) );
	} );

} );
