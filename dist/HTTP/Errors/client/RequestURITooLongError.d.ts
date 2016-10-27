import HTTPError from "./../HTTPError";
declare class RequestURITooLongError extends HTTPError {
    static readonly statusCode: number;
    readonly name: string;
}
export default RequestURITooLongError;
