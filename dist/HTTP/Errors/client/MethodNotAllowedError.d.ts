import HTTPError from "./../HTTPError";
import Response from "./../../Response";
export declare class MethodNotAllowedError extends HTTPError {
    static readonly statusCode: number;
    readonly name: string;
    constructor(message: string, response: Response);
}
export default MethodNotAllowedError;
