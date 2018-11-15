import { AnyJasmineValue } from "../../test/helpers/types";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import {
	extendsClass,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	property
} from "../test/JasmineExtender";
import {
	CS,
	XSD
} from "../Vocabularies";
import { GrantingStep } from "./GrantingStep";
import { PermissionReport } from "./PermissionReport";


describe( module( "carbonldp/Auth/PermissionReport" ), () => {

	describe( interfaze(
		"CarbonLDP.PermissionReport",
		"Model that species the report an specific permission in a access control report."
	), () => {

		it( extendsClass( "CarbonLDP.TransientResource" ), () => {
			const target:TransientResource = {} as PermissionReport;
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OBLIGATORY,
			"permission",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:PermissionReport[ "permission" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"granted",
			"boolean"
		), ():void => {
			const target:PermissionReport[ "granted" ] = true as boolean;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"grantingChain",
			"CarbonLDP.Auth.GrantingStep[]"
		), ():void => {
			const target:PermissionReport[ "grantingChain" ] = [] as GrantingStep[];
			expect( target ).toBeDefined();
		} );

	} );


	describe( interfaze(
		"CarbonLDP.PermissionReportFactory",
		"Interface with the factory and the utils for `CarbonLDP.Auth,.PermissionReport` objects."
	), () => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.PermissionReport"
		), () => {

			it( "should exists", ():void => {
				expect( PermissionReport.TYPE ).toBeDefined();
				expect( PermissionReport.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:PermissionReport", () => {
				expect( PermissionReport.TYPE ).toBe( CS.PermissionReport );
			} );

		} );


		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.SCHEMA"
		), () => {

			it( "should exists", ():void => {
				expect( PermissionReport.SCHEMA ).toBeDefined();
				expect( PermissionReport.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );


			it( "should have model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<PermissionReport,
					| "permission"
					| "granted"
					| "grantingChain">>>;


				expect( PermissionReport.SCHEMA as Target ).toEqual( {
					permission: jasmine.any( Object ),
					granted: jasmine.any( Object ),
					grantingChain: jasmine.any( Object ),
				} );
			} );

			it( "should have cs:permission", () => {
				expect( PermissionReport.SCHEMA[ "permission" ] ).toEqual( {
					"@id": CS.permission,
					"@type": "@id",
				} );
			} );

			it( "should have cs:granted", () => {
				expect( PermissionReport.SCHEMA[ "granted" ] ).toEqual( {
					"@id": CS.granted,
					"@type": XSD.boolean,
				} );
			} );

			it( "should have cs:grantingChain", () => {
				expect( PermissionReport.SCHEMA[ "grantingChain" ] ).toEqual( {
					"@id": CS.grantingChain,
					"@type": "@id",
					"@container": "@list",
				} );
			} );

		} );

	} );

} );
