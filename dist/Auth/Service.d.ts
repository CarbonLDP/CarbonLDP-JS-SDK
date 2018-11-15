import { Context } from "../Context";
import { RequestOptions } from "../HTTP";
import { Authenticator } from "./Authenticator";
import { AuthMethod } from "./AuthMethod";
import { BasicCredentials } from "./BasicCredentials";
import { User } from "./User";
import { RolesEndpoint } from "./RolesEndpoint";
import { TokenCredentials, TokenCredentialsBase } from "./TokenCredentials";
import { UsersEndpoint } from "./UsersEndpoint";
export declare class AuthService {
    readonly users: UsersEndpoint;
    readonly roles: RolesEndpoint;
    protected readonly context: Context;
    protected readonly authenticators: {
        [P in AuthMethod]: Authenticator<object, object>;
    };
    protected authenticator: Authenticator<object, object>;
    protected _authenticatedUser: User;
    readonly authenticatedUser: User;
    constructor(context: Context);
    isAuthenticated(askParent?: boolean): boolean;
    authenticate(username: string, password: string): Promise<TokenCredentials>;
    authenticateUsing(method: AuthMethod.BASIC, username: string, password: string): Promise<BasicCredentials>;
    authenticateUsing(method: AuthMethod.TOKEN, username: string, password: string): Promise<TokenCredentials>;
    authenticateUsing(method: AuthMethod.TOKEN, token: TokenCredentialsBase): Promise<TokenCredentials>;
    addAuthentication(requestOptions: RequestOptions): void;
    clearAuthentication(): void;
}
