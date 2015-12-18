import Context from "./../Context";
import * as HTTP from "./../HTTP";
import Authenticator from "./Authenticator";
import AuthenticationToken from "./AuthenticationToken";
import UsernameAndPasswordToken from "./UsernameAndPasswordToken";
export declare class Class implements Authenticator<UsernameAndPasswordToken> {
    private static TOKEN_CONTAINER;
    private context;
    private basicAuthenticator;
    private token;
    constructor(context: Context);
    isAuthenticated(): boolean;
    authenticate(authenticationToken: UsernameAndPasswordToken): Promise<void>;
    addAuthentication(requestOptions: HTTP.Request.Options): HTTP.Request.Options;
    clearAuthentication(): void;
    supports(authenticationToken: AuthenticationToken): boolean;
    private createToken();
    private addTokenAuthenticationHeader(headers);
}
export default Class;
