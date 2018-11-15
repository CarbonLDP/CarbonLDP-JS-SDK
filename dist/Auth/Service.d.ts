import { Context } from "../Context";
import { RequestOptions } from "../HTTP";
import { Pointer } from "../Pointer";
import { Authenticator } from "./Authenticator";
import { AuthMethod } from "./AuthMethod";
import { BasicCredentials } from "./BasicCredentials";
import * as Roles from "./Roles";
import { TokenCredentials, TokenCredentialsBase } from "./TokenCredentials";
import { User } from "./User";
import { UsersEndpoint } from "./UsersEndpoint";
export declare class AuthService {
    readonly users: UsersEndpoint;
    readonly roles: Roles.Class;
    protected readonly context: Context;
    protected readonly authenticators: {
        [P in AuthMethod]: Authenticator<object, object>;
    };
    protected authenticator: Authenticator<object, object>;
    protected _authenticatedUser: User;
    readonly authenticatedUser: User;
    Permission: {
        READ: Pointer;
        UPDATE: Pointer;
        DELETE: Pointer;
        CREATE_CHILD: Pointer;
        CREATE_ACCESS_POINT: Pointer;
        ADD_MEMBER: Pointer;
        REMOVE_MEMBER: Pointer;
        CONTROL_ACCESS: Pointer;
        IMPERSONATE: Pointer;
    };
    constructor(context: Context);
    isAuthenticated(askParent?: boolean): boolean;
    authenticate(username: string, password: string): Promise<TokenCredentials>;
    authenticateUsing(method: AuthMethod.BASIC, username: string, password: string): Promise<BasicCredentials>;
    authenticateUsing(method: AuthMethod.TOKEN, username: string, password: string): Promise<TokenCredentials>;
    authenticateUsing(method: AuthMethod.TOKEN, token: TokenCredentialsBase): Promise<TokenCredentials>;
    addAuthentication(requestOptions: RequestOptions): void;
    clearAuthentication(): void;
}
