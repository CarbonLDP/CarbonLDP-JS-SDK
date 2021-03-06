import { IRIToken, LanguageToken, LiteralToken, RDFLiteralToken } from "sparqler/tokens";

import { isDate } from "../Utils";

import { XSD } from "../Vocabularies/XSD";

import { QueryContainer } from "./QueryContainer";


/**
 * Wrapper for a safe query value of any standard JS value.
 */
export class QueryValue {
	private readonly _queryContainer:QueryContainer;

	private readonly _value:string | number | boolean | Date;
	private _literal?:LiteralToken;

	constructor( queryContainer:QueryContainer, value:string | number | boolean | Date ) {
		this._value = value;
		this._queryContainer = queryContainer;

		if( isDate( value ) ) {
			this.withType( XSD.dateTime );
		} else {
			this._literal = new LiteralToken( value );
		}
	}


	/**
	 * Sets an specific type to the query value.
	 * If the value is not string, it will be serialized.
	 * @param type The type to be assigned to the literal value.
	 */
	withType( type:string ):this {
		if( XSD.hasOwnProperty( type ) ) type = XSD[ type ];

		const value:string = this._queryContainer.serializeLiteral( type, this._value );
		const typeToken:IRIToken = this._queryContainer.compactIRI( type );
		this._literal = new RDFLiteralToken( value, typeToken );

		return this;
	}

	/**
	 * Sets an specific language to the query value.
	 * @param language The language to be assigned to the string literal value.
	 */
	withLanguage( language:string ):this {
		const value:string = this._queryContainer.serializeLiteral( XSD.string, this._value );
		const languageToken:LanguageToken = new LanguageToken( language );
		this._literal = new RDFLiteralToken( value, languageToken );

		return this;
	}


	/**
	 * Returns the SPARQL token of the value.
	 */
	getToken():LiteralToken {
		return this._literal!;
	}

	/**
	 * Returns the SPARQL string representation of the value.
	 */
	toString():string {
		return `${ this._literal }`;
	}
}
