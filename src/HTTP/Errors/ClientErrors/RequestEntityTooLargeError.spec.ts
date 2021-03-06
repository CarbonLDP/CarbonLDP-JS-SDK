import { RequestService } from "../../Request";
import { Response } from "../../Response";

import { HTTPError } from "../HTTPError";

import { RequestEntityTooLargeError } from "./RequestEntityTooLargeError";


describe( "RequestEntityTooLargeError", () => {

	it( "should exist", () => {
		expect( RequestEntityTooLargeError ).toBeDefined();
		expect( RequestEntityTooLargeError ).toEqual( jasmine.any( Function ) );
	} );

	let response:Response;
	beforeAll( ( done ) => {
		jasmine.Ajax.install();
		jasmine.Ajax.stubRequest( "http://example.com/request/" ).andReturn( {
			"status": 200,
			"responseText": "A response",
		} );

		RequestService
			.send( "GET", "http://example.com/request/" )
			.then( ( _response ) => {
				response = _response;
				done();
			} )
			.catch( done.fail );
	} );

	afterAll( () => {
		jasmine.Ajax.uninstall();
	} );


	it( "should extend from HTTError", () => {
		const error:RequestEntityTooLargeError = new RequestEntityTooLargeError( "Message of the error", response );
		expect( error ).toEqual( jasmine.any( HTTPError ) );
	} );

	it( "should have RequestEntityTooLargeError as name", () => {
		const error:RequestEntityTooLargeError = new RequestEntityTooLargeError( "The message", response );
		expect( error.name ).toEqual( "RequestEntityTooLargeError" );
	} );

	it( "should have statusCode as `413`", () => {
		expect( RequestEntityTooLargeError.statusCode ).toBe( 413 );
	} );

} );
