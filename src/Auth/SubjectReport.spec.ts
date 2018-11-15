import { AnyJasmineValue } from "../../test/helpers/types";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import {
	extendsClass,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	property,
	STATIC
} from "../test/JasmineExtender";
import { CS } from "../Vocabularies";
import { PermissionReport } from "./PermissionReport";
import { SubjectReport } from "./SubjectReport";


describe( module( "carbonldp/Auth/SubjectReport" ), () => {

	describe( interfaze(
		"CarbonLDP.Auth.SubjectReport",
		"Model that represents a report for an specific subject in a complete access control report."
	), () => {

		it( extendsClass( "CarbonLDP.TransientResource" ), () => {
			const target:TransientResource = {} as SubjectReport;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"subject",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:SubjectReport[ "subject" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"permissionReports",
			"CarbonLDP.Auth.PermissionReport[]"
		), ():void => {
			const target:SubjectReport[ "permissionReports" ] = [] as PermissionReport[];
			expect( target ).toBeDefined();
		} );

	} );


	describe( interfaze(
		"CarbonLDP.Auth.SubjectReportFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.SubjectReport` objects."
	), () => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.SubjectReport"
		), () => {

			it( "should exists", ():void => {
				expect( SubjectReport.TYPE ).toBeDefined();
				expect( SubjectReport.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:SubjectReport", () => {
				expect( SubjectReport.TYPE ).toBe( CS.SubjectReport );
			} );

		} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), () => {

			it( "should exists", ():void => {
				expect( SubjectReport.SCHEMA ).toBeDefined();
				expect( SubjectReport.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );


			it( "should has model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<SubjectReport,
					| "subject"
					| "permissionReports">>>;

				expect( SubjectReport.SCHEMA as Target ).toEqual( {
					subject: jasmine.any( Object ),
					permissionReports: jasmine.any( Object ),
				} );
			} );

			it( "should have cs:subject", () => {
				expect( SubjectReport.SCHEMA[ "subject" ] ).toEqual( {
					"@id": CS.subject,
					"@type": "@id",
				} );
			} );

			it( "should have cs:permissionReport", () => {
				expect( SubjectReport.SCHEMA[ "permissionReports" ] ).toEqual( {
					"@id": CS.permissionReport,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );

	} );

	describe( property(
		STATIC,
		"SubjectReport",
		"CarbonLDP.Auth.SubjectReportFactory"
	), () => {

		it( "should exists", ():void => {
			expect( SubjectReport ).toBeDefined();
			expect( SubjectReport ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
