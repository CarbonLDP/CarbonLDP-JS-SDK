import * as Errors from "../Errors";
import {
	RequestOptions,
	RequestService,
	RequestUtils,
} from "../HTTP/Request";
import { Response } from "../HTTP/Response";
import { StringParser } from "../HTTP/StringParser";
import { PointerLibrary } from "../Pointer";
import * as RDF from "./../RDF";
import {
	SPARQLRawBindingObject,
	SPARQLRawBindingProperty,
	SPARQLRawResults,
} from "./RawResults";
import { SPARQLRawResultsParser } from "./RawResultsParser";
import { SPARQLSelectResults } from "./SelectResults";


export class SPARQLService {
	private static DEFAULT_OPTIONS:RequestOptions = {};
	private static RESULTS_PARSER:SPARQLRawResultsParser = new SPARQLRawResultsParser();
	private static STRING_PARSER:StringParser = new StringParser();

	static executeRawASKQuery( url:string, askQuery:string, options:RequestOptions = {} ):Promise<[ SPARQLRawResults, Response ]> {
		options = Object.assign( options, SPARQLService.DEFAULT_OPTIONS );

		RequestUtils.setAcceptHeader( "application/sparql-results+json", options );
		RequestUtils.setContentTypeHeader( "application/sparql-query", options );

		return RequestService.post( url, askQuery, options, SPARQLService.RESULTS_PARSER );
	}

	static executeASKQuery( url:string, askQuery:string, options:RequestOptions = {} ):Promise<[ boolean, Response ]> {
		return SPARQLService
			.executeRawASKQuery( url, askQuery, options )
			.then<[ boolean, Response ]>( ( [ rawResults, response ]:[ SPARQLRawResults, Response ] ) => {
				return [ rawResults.boolean, response ];
			} );
	}

	static executeRawSELECTQuery( url:string, selectQuery:string, options:RequestOptions = {} ):Promise<[ SPARQLRawResults, Response ]> {
		options = Object.assign( options, SPARQLService.DEFAULT_OPTIONS );

		RequestUtils.setAcceptHeader( "application/sparql-results+json", options );
		RequestUtils.setContentTypeHeader( "application/sparql-query", options );

		return RequestService.post( url, selectQuery, options, SPARQLService.RESULTS_PARSER );
	}

	static executeSELECTQuery<T>( url:string, selectQuery:string, pointerLibrary:PointerLibrary, options:RequestOptions = {} ):Promise<[ SPARQLSelectResults<T>, Response ]> {
		return SPARQLService
			.executeRawSELECTQuery( url, selectQuery, options )
			.then<[ SPARQLSelectResults<T>, Response ]>( ( [ rawResults, response ]:[ SPARQLRawResults, Response ] ) => {
				let rawBindings:SPARQLRawBindingObject[] = rawResults.results.bindings;
				let bindings:T[] = [];

				for( let bindingColumn of rawBindings ) {
					let binding:T = {} as T;
					for( let bindingRow in bindingColumn ) {
						if( ! bindingColumn.hasOwnProperty( bindingRow ) ) continue;

						let bindingCell:SPARQLRawBindingProperty = bindingColumn[ bindingRow ];
						binding[ bindingRow ] = SPARQLService.parseRawBindingProperty( bindingCell, pointerLibrary );
					}
					bindings.push( binding );
				}

				let results:SPARQLSelectResults<T> = {
					vars: rawResults.head.vars,
					bindings: bindings,
				};
				return [ results, response ];
			} );
	}

	static executeRawCONSTRUCTQuery( url:string, constructQuery:string, options:RequestOptions = {} ):Promise<[ string, Response ]> {
		options = Object.assign( options, SPARQLService.DEFAULT_OPTIONS );

		if( RequestUtils.getHeader( "Accept", options ) === undefined ) RequestUtils.setAcceptHeader( "application/ld+json", options );
		RequestUtils.setContentTypeHeader( "application/sparql-query", options );

		return RequestService.post( url, constructQuery, options, SPARQLService.STRING_PARSER );
	}

	static executeRawDESCRIBEQuery( url:string, describeQuery:string, options:RequestOptions = {} ):Promise<[ string, Response ]> {
		options = Object.assign( options, SPARQLService.DEFAULT_OPTIONS );

		if( RequestUtils.getHeader( "Accept", options ) === undefined ) RequestUtils.setAcceptHeader( "application/ld+json", options );
		RequestUtils.setContentTypeHeader( "application/sparql-query", options );

		return RequestService.post( url, describeQuery, options, SPARQLService.STRING_PARSER );
	}

	static executeUPDATE( url:string, updateQuery:string, options:RequestOptions = {} ):Promise<Response> {
		options = Object.assign( options, SPARQLService.DEFAULT_OPTIONS );

		if( RequestUtils.getHeader( "Accept", options ) === undefined ) RequestUtils.setAcceptHeader( "application/ld+json", options );
		RequestUtils.setContentTypeHeader( "application/sparql-update", options );

		return RequestService.post( url, updateQuery, options );
	}

	private static parseRawBindingProperty( rawBindingProperty:SPARQLRawBindingProperty, pointerLibrary:PointerLibrary ):any {
		switch( rawBindingProperty.type ) {
			case "uri":
				return pointerLibrary.getPointer( rawBindingProperty.value );
			case "bnode":
				throw new Errors.NotImplementedError( "BNodes cannot be queried directly" );
			case "literal":
				if( "datatype" in rawBindingProperty ) {
					return RDF.Literal.Factory.parse( rawBindingProperty.value, rawBindingProperty.datatype );
				} else {
					return RDF.Literal.Factory.parse( rawBindingProperty.value );
				}
			default:
				throw new Errors.IllegalArgumentError( "The bindingProperty has an unsupported type" );
		}
	}

}

export default SPARQLService;
