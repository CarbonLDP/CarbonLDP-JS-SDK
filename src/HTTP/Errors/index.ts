import * as ClientErrors from "./ClientErrors";
import { HTTPError } from "./HTTPError";
import * as ServerErrors from "./ServerErrors";


export * from "./ClientErrors";
export * from "./ServerErrors";

export * from "./HTTPError";
export * from "./UnknownError";


export const statusCodeMap:Map<number, typeof HTTPError> = new Map<number, typeof HTTPError>();

const addErrors:<T extends {}>( o:T ) => void = o => Object
	.keys( o )
	.map( k => o[ k ] )
	.forEach( e => statusCodeMap.set( e.statusCode, e ) )
;
addErrors( ClientErrors );
addErrors( ServerErrors );