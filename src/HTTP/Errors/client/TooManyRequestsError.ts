import HTTPError from "./../HTTPError";
import Response from "./../../Response";

const name:string = "TooManyRequestsError";
const statusCode:number = 429;

export class TooManyRequestsError extends HTTPError {
	static get statusCode():number { return statusCode; }

	get name():string { return name; }

	constructor( message:string, response:Response ) {
		super( message, response );
		Object.setPrototypeOf( this, TooManyRequestsError.prototype );
	}
}

export default TooManyRequestsError;
