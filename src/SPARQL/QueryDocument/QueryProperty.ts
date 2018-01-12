import { OptionalToken, PatternToken, SubjectToken } from "sparqler/tokens";

import { DigestedObjectSchema } from "../../ObjectSchema";
import * as QueryContext from "./QueryContext";
import * as QueryVariable from "./QueryVariable";

export enum PropertyType {
	FULL,
	PARTIAL,
}

export class Class {
	readonly name:string;
	readonly variable:QueryVariable.Class;

	private _context:QueryContext.Class;

	private _optional:boolean;
	private _type?:PropertyType;

	private _patterns:PatternToken[];
	private _schema:DigestedObjectSchema;

	constructor( context:QueryContext.Class, name:string ) {
		this.name = name;
		this.variable = context.getVariable( name );

		this._optional = true;
		this._type = PropertyType.PARTIAL;

		this._context = context;
		this._patterns = [];
	}

	addPattern( ...patterns:PatternToken[] ):this {
		this._patterns.push( ...patterns );
		return this;
	}

	getPatterns():PatternToken[] {
		if( ! this._optional ) return this._patterns;

		return [ new OptionalToken()
			.addPattern( ...this._patterns ),
		];
	}

	getSchema():DigestedObjectSchema {
		if( this._schema ) return this._schema;

		this._schema = new DigestedObjectSchema();
		this._schema.vocab = this._context.expandIRI( "" ) || null;

		return this._schema;
	}

	isOptional():boolean {
		return this._optional;
	}

	setOptional( optional:boolean ):this {
		this._optional = optional;
		return this;
	}

	getType():PropertyType {
		return this._type;
	}

	setType( type:PropertyType ):this {
		this._type = type;
		return this;
	}

	getTriple():SubjectToken {
		return this._patterns
			.find( pattern => pattern instanceof SubjectToken ) as SubjectToken;
	}

	toString():string {
		return `${ this.variable }`;
	}
}

export default Class;
