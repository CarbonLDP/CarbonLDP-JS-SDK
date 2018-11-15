import { AnyJasmineValue } from "../../test/helpers/types";
import { CarbonLDP } from "../CarbonLDP";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
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
import {
	CS,
	XSD
} from "../Vocabularies";
import { GrantingStep } from "./GrantingStep";

describe( module( "carbonldp/Auth/GrantingStep" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.GrantingStep",
		"Model for the a step in the granting inheritance of a access control report."
	), () => {

		it( extendsClass( "CarbonLDP.TransientResource" ), () => {
			const target:TransientResource = {} as GrantingStep;
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OPTIONAL,
			"subject",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:GrantingStep[ "subject" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"applied",
			"boolean"
		), ():void => {
			const target:GrantingStep[ "applied" ] = true as boolean;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"appliedBy",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:GrantingStep[ "appliedBy" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"protectedDocument",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:GrantingStep[ "protectedDocument" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"accessControlList",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:GrantingStep[ "accessControlList" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"inheritanceDisabledBy",
			"CarbonLDP.Pointer[]"
		), ():void => {
			const target:GrantingStep[ "inheritanceDisabledBy" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

	} );


	describe( interfaze(
		"CarbonLDP.Auth.GrantingStepFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.GrantingStep` objects."
	), () => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.GrantingStep"
		), () => {

			it( "should exists", ():void => {
				expect( GrantingStep.TYPE ).toBeDefined();
				expect( GrantingStep.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:GrantingStep", () => {
				expect( GrantingStep.TYPE ).toBe( CS.GrantingStep );
			} );

		} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), () => {

			it( "should exists", ():void => {
				expect( GrantingStep.SCHEMA ).toBeDefined();
				expect( GrantingStep.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );

			it( "should have model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<GrantingStep,
					| "subject"
					| "applied"
					| "appliedBy"
					| "protectedDocument"
					| "accessControlList"
					| "inheritanceDisabledBy">>>;

				expect( GrantingStep.SCHEMA as Target ).toEqual( {
					subject: jasmine.any( Object ),
					applied: jasmine.any( Object ),
					appliedBy: jasmine.any( Object ),
					protectedDocument: jasmine.any( Object ),
					accessControlList: jasmine.any( Object ),
					inheritanceDisabledBy: jasmine.any( Object ),
				} );
			} );

			it( "should have cs:subject", () => {
				expect( GrantingStep.SCHEMA[ "subject" ] ).toEqual( {
					"@id": CS.subject,
					"@type": "@id",
				} );
			} );

			it( "should have cs:applied", () => {
				expect( GrantingStep.SCHEMA[ "applied" ] ).toEqual( {
					"@id": CS.applied,
					"@type": XSD.boolean,
				} );
			} );

			it( "should have cs:appliedBy", () => {
				expect( GrantingStep.SCHEMA[ "appliedBy" ] ).toEqual( {
					"@id": CS.appliedBy,
					"@type": "@id",
				} );
			} );

			it( "should have cs:protectedDocument", () => {
				expect( GrantingStep.SCHEMA[ "protectedDocument" ] ).toEqual( {
					"@id": CS.protectedDocument,
					"@type": "@id",
				} );
			} );

			it( "should have cs:accessControlList", () => {
				expect( GrantingStep.SCHEMA[ "accessControlList" ] ).toEqual( {
					"@id": CS.accessControlList,
					"@type": "@id",
				} );
			} );

			it( "should have cs:inheritanceDisabledBy", () => {
				expect( GrantingStep.SCHEMA[ "inheritanceDisabledBy" ] ).toEqual( {
					"@id": CS.inheritanceDisabledBy,
					"@type": "@id",
					"@container": "@list",
				} );
			} );

		} );

	} );

	describe( property(
		STATIC,
		"GrantingStep",
		"CarbonLDP.Auth.GrantingStepFactory"
	), () => {

		it( "should exists", ():void => {
			expect( GrantingStep ).toBeDefined();
			expect( GrantingStep ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
