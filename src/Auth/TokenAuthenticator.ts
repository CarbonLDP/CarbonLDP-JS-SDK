import * as Errors from "../Errors";
import { BadResponseError } from "../HTTP/Errors";
import { Header } from "../HTTP/Header";
import * as Request from "../HTTP/Request";
import * as Response from "../HTTP/Response";
import { LDP } from "../Vocabularies/LDP";
import Context from "./../Context";
import { FreeResources } from "./../FreeResources";
import * as JSONLD from "./../JSONLD";
import { ResponseMetadata } from "./../LDP";
import * as PersistedDocument from "./../PersistedDocument";
import * as RDF from "./../RDF";
import * as Utils from "./../Utils";
import Authenticator from "./Authenticator";
import BasicAuthenticator from "./BasicAuthenticator";
import * as Token from "./Token";
import * as UsernameAndPasswordToken from "./UsernameAndPasswordToken";

export const TOKEN_CONTAINER:string = "auth-tokens/";

export class Class implements Authenticator<UsernameAndPasswordToken.Class, Token.Class> {

	private context:Context;
	private basicAuthenticator:BasicAuthenticator;
	private _credentials:Token.Class;

	constructor( context:Context ) {
		if( context === null ) throw new Errors.IllegalArgumentError( "context cannot be null" );

		this.context = context;
		this.basicAuthenticator = new BasicAuthenticator();
	}

	isAuthenticated():boolean {
		return ! ! this._credentials && this._credentials.expirationTime > new Date();
	}

	authenticate( authenticationToken:UsernameAndPasswordToken.Class ):Promise<Token.Class>;
	authenticate( credentials:Token.Class ):Promise<Token.Class>;
	authenticate( authenticationOrCredentials:UsernameAndPasswordToken.Class | Token.Class ):Promise<Token.Class> {
		if( authenticationOrCredentials instanceof UsernameAndPasswordToken.Class ) return this.basicAuthenticator.authenticate( authenticationOrCredentials ).then( () => {
			return this.createToken();
		} ).then( ( [ token, response ]:[ Token.Class, Response.Class ] ):Token.Class => {
			this.basicAuthenticator.clearAuthentication();
			this._credentials = token;
			return token;
		} );

		let credentials:Token.Class = <Token.Class> authenticationOrCredentials;
		if( Utils.isString( credentials.expirationTime ) ) authenticationOrCredentials.expirationTime = new Date( <any> credentials.expirationTime );
		if( credentials.expirationTime <= new Date() ) return Promise.reject<any>( new Errors.IllegalArgumentError( "The token provided in not valid." ) );

		this._credentials = credentials;
		return Promise.resolve( credentials );
	}

	addAuthentication( requestOptions:Request.Options ):Request.Options {
		let headers:Map<string, Header> = requestOptions.headers ? requestOptions.headers : requestOptions.headers = new Map<string, Header>();

		this.addTokenAuthenticationHeader( headers );

		return requestOptions;
	}

	clearAuthentication():void {
		this._credentials = null;
	}

	private createToken():Promise<[ Token.Class, Response.Class ]> {
		let requestOptions:Request.Options = {};

		this.basicAuthenticator.addAuthentication( requestOptions );

		Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		Request.Util.setPreferredInteractionModel( LDP.RDFSource, requestOptions );

		return Promise.resolve().then( () => {
			const tokensURI:string = this.context._resolvePath( "system" ) + TOKEN_CONTAINER;
			return Request.Service.post( tokensURI, null, requestOptions, new JSONLD.Parser.Class() );
		} ).then<[ Token.Class, Response.Class ]>( ( [ expandedResult, response ]:[ any, Response.Class ] ) => {
			let freeNodes:RDF.Node.Class[] = RDF.Node.Util.getFreeNodes( expandedResult );

			let freeResources:FreeResources = this.context.documents._getFreeResources( freeNodes );
			let tokenResources:Token.Class[] = <Token.Class[]> freeResources.getResources().filter( resource => resource.hasType( Token.RDF_CLASS ) );

			if( tokenResources.length === 0 ) throw new BadResponseError( "No '" + Token.RDF_CLASS + "' was returned.", response );
			if( tokenResources.length > 1 ) throw new BadResponseError( "Multiple '" + Token.RDF_CLASS + "' were returned. ", response );
			let token:Token.Class = tokenResources[ 0 ];

			let userDocuments:RDF.Document.Class[] = RDF.Document.Util.getDocuments( expandedResult ).filter( rdfDocument => rdfDocument[ "@id" ] === token.user.id );
			userDocuments.forEach( document => this.context.documents._getPersistedDocument( document, response ) );

			const responseMetadata:ResponseMetadata.Class = <ResponseMetadata.Class> freeResources
				.getResources()
				.find( ResponseMetadata.Factory.is );

			if( responseMetadata ) responseMetadata
				.documentsMetadata
				.forEach( documentMetadata => {
					const document:PersistedDocument.Class = documentMetadata.relatedDocument as PersistedDocument.Class;
					document._etag = documentMetadata.eTag;
				} );

			return [ token, response ];
		}, response => this.context.documents._parseErrorResponse( response ) );
	}

	private addTokenAuthenticationHeader( headers:Map<string, Header> ):void {
		if( headers.has( "authorization" ) ) return;

		let header:Header = new Header();
		headers.set( "authorization", header );

		let authorization:string = "Token " + this._credentials.key;
		header.values.push( authorization );
	}
}

export default Class;
