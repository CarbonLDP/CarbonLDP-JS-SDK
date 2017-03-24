import HTTPError from "./HTTPError";
import Response from "./../Response";
export declare class UnknownError extends HTTPError {
    readonly name: string;
    constructor(message: string, response: Response);
}
export default UnknownError;
