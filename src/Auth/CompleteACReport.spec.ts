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
import { CompleteACReport } from "./CompleteACReport";
import { SubjectReport } from "./SubjectReport";


describe( module( "carbonldp/Auth.CompleteACReport" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.CompleteACReport",
		"Model that describe the most complete access control report."
	), () => {

		it( extendsClass( "CarbonLDP.TransientResource" ), () => {
			const target:TransientResource = {} as CompleteACReport;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"protectedDocument",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:CompleteACReport[ "protectedDocument" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"subjectReports",
			"CarbonLDP.Auth.SubjectReport[]"
		), ():void => {
			const target:CompleteACReport[ "subjectReports" ] = [] as SubjectReport[];
			expect( target ).toBeDefined();
		} );

	} );


	describe( interfaze(
		"CarbonLDP.Auth.CompleteACReportFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.CompleteACReport` objects."
	), () => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.CompleteACReport"
		), () => {

			it( "should exists", ():void => {
				expect( CompleteACReport.TYPE ).toBeDefined();
				expect( CompleteACReport.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:CompleteACReport", () => {
				expect( CompleteACReport.TYPE ).toBe( CS.CompleteACReport );
			} );

		} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), () => {

			it( "should exists", ():void => {
				expect( CompleteACReport.SCHEMA ).toBeDefined();
				expect( CompleteACReport.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );


			it( "should have model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<CompleteACReport,
					| "protectedDocument"
					| "subjectReports">>>;

				expect( CompleteACReport.SCHEMA as Target ).toEqual( {
					protectedDocument: jasmine.any( Object ),
					subjectReports: jasmine.any( Object ),
				} );
			} );

			it( "should has cs:protectedDocument", () => {
				expect( CompleteACReport.SCHEMA[ "protectedDocument" ] ).toEqual( {
					"@id": CS.protectedDocument,
					"@type": "@id",
				} );
			} );

			it( "should has cs:subjectReport", () => {
				expect( CompleteACReport.SCHEMA[ "subjectReports" ] ).toEqual( {
					"@id": CS.subjectReport,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );


		describe( method( OBLIGATORY, "is" ), () => {

			it( hasSignature(
				"Returns true when the value is considered a `CarbonLDP.Auth.CompleteACReport` object.",
				[
					{ name: "value", type: "any", description: "The value to be checked." },
				],
				{ type: "value is CarbonLDP.Auth.CompleteACReport" }
			), () => {} );

			it( "should exists", ():void => {
				expect( CompleteACReport.is ).toBeDefined();
				expect( CompleteACReport.is ).toEqual( jasmine.any( Function ) );
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
				CompleteACReport.is( object );
				expect( isTransientResource ).toHaveBeenCalledWith( object );
			} );

			it( "should check that have type cs:CompleteACReport", () => {
				CompleteACReport.is( object );
				expect( object.hasType ).toHaveBeenCalledWith( CS.CompleteACReport );
			} );

			it( "should return true when all assertions", () => {
				const returned:boolean = CompleteACReport.is( object );
				expect( returned ).toBe( true );
			} );

		} );

	} );

	describe( property(
		STATIC,
		"CompleteACReport",
		"CarbonLDP.Auth.CompleteACReportFactory"
	), () => {

		it( "should exists", ():void => {
			expect( CompleteACReport ).toBeDefined();
			expect( CompleteACReport ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
