import { AnyJasmineValue } from "../../test/helpers/types";
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
	property,
	STATIC
} from "../test/JasmineExtender";
import { CS } from "../Vocabularies";
import { SimpleUserACReport } from "./SimpleUserACReport";

describe( module( "carbonldp/SimpleUserACReport" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.SimpleUserACReport",
		"Model for the cs:SimpleUserACReport resource."
	), () => {

		it( extendsClass( "CarbonLDP.TransientResource" ), () => {
			const target:TransientResource = {} as SimpleUserACReport;
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OBLIGATORY,
			"protectedDocument",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:SimpleUserACReport[ "protectedDocument" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"permissions",
			"CarbonLDP.Pointer[]"
		), ():void => {
			const target:SimpleUserACReport[ "permissions" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

	} );


	describe( interfaze(
		"CarbonLDP.Auth.SimpleUserACReportFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.SimpleUserACReport` objects."
	), () => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.SimpleUserACReport"
		), ():void => {

			it( "should exists", ():void => {
				expect( SimpleUserACReport.TYPE ).toBeDefined();
				expect( SimpleUserACReport.TYPE ).toEqual( jasmine.any( String ) );
			} );


			it( "should be cs:SimpleUserACReport", () => {
				expect( SimpleUserACReport.TYPE ).toBe( CS.SimpleUserACReport );
			} );

		} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), () => {

			it( "should exists", ():void => {
				expect( SimpleUserACReport.SCHEMA ).toBeDefined();
				expect( SimpleUserACReport.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );


			it( "should has model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<SimpleUserACReport,
					| "protectedDocument"
					| "permissions">>>;

				expect( SimpleUserACReport.SCHEMA as Target ).toEqual( {
					protectedDocument: jasmine.any( Object ),
					permissions: jasmine.any( Object ),
				} );
			} );

			it( "should has cs:protectedDocument", () => {
				expect( SimpleUserACReport.SCHEMA[ "protectedDocument" ] ).toEqual( {
					"@id": CS.protectedDocument,
					"@type": "@id",
				} );
			} );

			it( "should has cs:permission", () => {
				expect( SimpleUserACReport.SCHEMA[ "permissions" ] ).toEqual( {
					"@id": CS.permission,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );


		describe( method( OBLIGATORY, "is" ), () => {

			it( hasSignature(
				"Return true if the provided element is considered a `CarbonLDP.Auth.SimpleUserACReport` object.",
				[
					{ name: "value", type: "any", description: "The value to check." },
				],
				{ type: "value is CarbonLDP.Auth.SimpleUserACReport" }
			), () => {} );

			it( "should exists", ():void => {
				expect( SimpleUserACReport.is ).toBeDefined();
				expect( SimpleUserACReport.is ).toEqual( jasmine.any( Function ) );
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
				SimpleUserACReport.is( object );
				expect( isTransientResource ).toHaveBeenCalledWith( object );
			} );

			it( "should check that have type cs:SimpleUserACReport", () => {
				SimpleUserACReport.is( object );
				expect( object.hasType ).toHaveBeenCalledWith( CS.SimpleUserACReport );
			} );

			it( "should return true when all assertions", () => {
				const returned:boolean = SimpleUserACReport.is( object );
				expect( returned ).toBe( true );
			} );

		} );

	} );

	describe( property(
		STATIC,
		"SimpleUserACReport",
		"CarbonLDP.Auth.SimpleUserACReportFactory"
	), () => {

		it( "should exists", ():void => {
			expect( SimpleUserACReport ).toBeDefined();
			expect( SimpleUserACReport ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
