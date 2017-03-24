import HTTPError from "./../HTTPError";
import Response from "./../../Response";

const name:string = "BadRequestError";
const statusCode:number = 400;

export class BadRequestError extends HTTPError {
	static get statusCode():number { return statusCode; }

	get name():string { return name; }

	constructor( message:string, response:Response ) {
		super( message, response );
		Object.setPrototypeOf( this, BadRequestError.prototype );
	}
}

export default BadRequestError;
