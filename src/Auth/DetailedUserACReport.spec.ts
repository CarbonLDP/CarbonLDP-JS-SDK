import { AnyJasmineValue } from "../../test/helpers/types";
import { CarbonLDP } from "../CarbonLDP";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import {
	extendsClass,
	hasProperty,
	hasSignature,
	interfaze,
	method,
	module,
	OBLIGATORY,
	property
} from "../test/JasmineExtender";
import { CS } from "../Vocabularies";
import { DetailedUserACReport } from "./DetailedUserACReport";
import { PermissionReport } from "./PermissionReport";


describe( module( "carbonldp/Auth/DetailedUserACReport" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.DetailedUserACReport",
		"Model that describes a detailed access control report resource."
	), () => {

		it( extendsClass( "CarbonLDP.TransientResource" ), () => {
			const target:TransientResource = {} as DetailedUserACReport;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"protectedDocument",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:DetailedUserACReport[ "protectedDocument" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"permissionReports",
			"CarbonLDP.PermissionReport[]"
		), ():void => {
			const target:DetailedUserACReport[ "permissionReports" ] = [] as PermissionReport[];
			expect( target ).toBeDefined();
		} );

	} );


	describe( interfaze(
		"CarbonLDP.Auth.DetailedUserACReportFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.DetailedUserACReport` objects."
	), () => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.DetailedUserACReport"
		), () => {

			it( "should exists", ():void => {
				expect( DetailedUserACReport.TYPE ).toBeDefined();
				expect( DetailedUserACReport.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:DetailedUserACReport", () => {
				expect( DetailedUserACReport.TYPE ).toBe( CS.DetailedUserACReport );
			} );

		} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), () => {

			it( "should exists", ():void => {
				expect( DetailedUserACReport.SCHEMA ).toBeDefined();
				expect( DetailedUserACReport.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );


			it( "should has model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<DetailedUserACReport,
					| "protectedDocument"
					| "permissionReports">>>;

				expect( DetailedUserACReport.SCHEMA as Target ).toEqual( {
					protectedDocument: jasmine.any( Object ),
					permissionReports: jasmine.any( Object ),
				} );
			} );

			it( "should has cs:protectedDocument", () => {
				expect( DetailedUserACReport.SCHEMA[ "protectedDocument" ] ).toEqual( {
					"@id": CS.protectedDocument,
					"@type": "@id",
				} );
			} );

			it( "should has cs:permissionReport", () => {
				expect( DetailedUserACReport.SCHEMA[ "permissionReports" ] ).toEqual( {
					"@id": CS.permissionReport,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );


		describe( method( OBLIGATORY, "is" ), () => {

			it( hasSignature(
				"Returns true when the value is considered a `CarbonLDP.Auth.DetailedUserACReport` object.",
				[
					{ name: "value", type: "any", description: "The value to be checked." },
				],
				{ type: "value is CarbonLDP.Auth.DetailedUserACReport" }
			), () => {} );

			it( "should exists", ():void => {
				expect( DetailedUserACReport.is ).toBeDefined();
				expect( DetailedUserACReport.is ).toEqual( jasmine.any( Function ) );
			} );


			let isTransientResource:jasmine.Spy;
			let object:jasmine.SpyObj<TransientResource>;
			beforeEach( ():void => {
				isTransientResource = spyOn( TransientResource, "is" )
					.and.returnValue( true );

				object = jasmine.createSpyObj( {
					hasType: true,
				} );
			} );

			it( "should check it is a TransientResource", () => {
				DetailedUserACReport.is( object );
				expect( isTransientResource ).toHaveBeenCalledWith( object );
			} );

			it( "should check that have type cs:DetailedUserACReport", () => {
				DetailedUserACReport.is( object );
				expect( object.hasType ).toHaveBeenCalledWith( CS.DetailedUserACReport );
			} );

			it( "should return true when all assertions", () => {
				const returned:boolean = DetailedUserACReport.is( object );
				expect( returned ).toBe( true );
			} );


		} );

	} );

} );
