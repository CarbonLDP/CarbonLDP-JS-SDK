import {
	isDefined,
	module,
	reexports,
	STATIC,
} from "../test/JasmineExtender";
import * as Utils from "../Utils";

import * as Auth from "./";

import { ACE, TransientACE } from "./ACE";
import { ACL, TransientACL } from "./ACL";
import { AuthenticatedUserInformationAccessor } from "./AuthenticatedUserInformationAccessor";
import { AuthenticatedUserMetadata } from "./AuthenticatedUserMetadata";
import { Authenticator } from "./Authenticator";
import { AuthMethod } from "./AuthMethod";
import { BasicAuthenticator } from "./BasicAuthenticator";
import { BasicCredentials } from "./BasicCredentials";
import { BasicToken } from "./BasicToken";
import { CredentialsSet } from "./CredentialsSet";
import { LDAPCredentials } from "./LDAPCredentials";
import { Role, TransientRole } from "./Role";
import { RolesEndpoint } from "./RolesEndpoint";
import { AuthService } from "./Service";
import { TokenAuthenticator } from "./TokenAuthenticator";
import { TokenCredentials, TokenCredentialsBase, } from "./TokenCredentials";
import { TransientUser, User } from "./User";
import { UsernameAndPasswordCredentials } from "./UsernameAndPasswordCredentials";
import { UsersEndpoint } from "./UsersEndpoint";

describe( module( "carbonldp/Auth" ), ():void => {

	it( isDefined(), ():void => {
		expect( Auth ).toBeDefined();
		expect( Utils.isObject( Auth ) ).toBe( true );
	} );

	it( reexports(
		STATIC,
		"TransientACE",
		"CarbonLDP.Auth.TransientACE"
	), ():void => {
		expect( Auth.TransientACE ).toBeDefined();
		expect( Auth.TransientACE ).toBe( TransientACE );
	} );

	it( reexports(
		STATIC,
		"TransientACL",
		"CarbonLDP.Auth.TransientACL"
	), ():void => {
		expect( Auth.TransientACL ).toBeDefined();
		expect( Auth.TransientACL ).toBe( TransientACL );
	} );

	it( reexports(
		STATIC,
		"AuthenticatedUserInformationAccessor",
		"CarbonLDP.Auth.AuthenticatedUserInformationAccessor"
	), ():void => {
		expect( Auth.AuthenticatedUserInformationAccessor ).toBeDefined();
		expect( Auth.AuthenticatedUserInformationAccessor ).toBe( AuthenticatedUserInformationAccessor );
	} );

	it( reexports(
		STATIC,
		"AuthenticatedUserMetadata",
		"CarbonLDP.Auth.AuthenticatedUserMetadata"
	), ():void => {
		expect( Auth.AuthenticatedUserMetadata ).toBeDefined();
		expect( Auth.AuthenticatedUserMetadata ).toBe( AuthenticatedUserMetadata );
	} );

	it( reexports(
		STATIC,
		"TransientUser",
		"carbonldp/Auth/TransientUser"
	), ():void => {
		expect( Auth.TransientUser ).toBeDefined();
		expect( Auth.TransientUser ).toBe( TransientUser );
	} );

	it( reexports(
		STATIC,
		"UsersEndpoint",
		"CarbonLDP.Auth.UsersEndpoint"
	), ():void => {
		expect( Auth.UsersEndpoint ).toBeDefined();
		expect( Auth.UsersEndpoint ).toBe( UsersEndpoint );
	} );

	it( reexports(
		STATIC,
		"Authenticator",
		"CarbonLDP.Auth.Authenticator"
	), ():void => {
		expect( Auth.Authenticator ).toBeDefined();
		expect( Auth.Authenticator ).toBe( Authenticator );
	} );

	it( reexports(
		STATIC,
		"AuthMethod",
		"CarbonLDP.Auth.AuthMethod"
	), ():void => {
		expect( Auth.AuthMethod ).toBeDefined();
		expect( Auth.AuthMethod ).toBe( AuthMethod );
	} );

	it( reexports(
		STATIC,
		"AuthService",
		"CarbonLDP.Auth.AuthService"
	), ():void => {
		expect( Auth.AuthService ).toBeDefined();
		expect( Auth.AuthService ).toBe( AuthService );
	} );

	it( reexports(
		STATIC,
		"BasicAuthenticator",
		"CarbonLDP.Auth.BasicAuthenticator"
	), ():void => {
		expect( Auth.BasicAuthenticator ).toBeDefined();
		expect( Auth.BasicAuthenticator ).toBe( BasicAuthenticator );
	} );

	it( reexports(
		STATIC,
		"BasicCredentials",
		"CarbonLDP.Auth.BasicCredentials"
	), ():void => {
		expect( Auth.BasicCredentials ).toBeDefined();
		expect( Auth.BasicCredentials ).toBe( BasicCredentials );
	} );

	it( reexports(
		STATIC,
		"BasicToken",
		"CarbonLDP.Auth.BasicToken"
	), ():void => {
		expect( Auth.BasicToken ).toBeDefined();
		expect( Auth.BasicToken ).toBe( BasicToken );
	} );

	it( reexports(
		STATIC,
		"CredentialsSet",
		"CarbonLDP.Auth.CredentialsSet"
	), ():void => {
		expect( Auth.CredentialsSet ).toBeDefined();
		expect( Auth.CredentialsSet ).toBe( CredentialsSet );
	} );

	it( reexports(
		STATIC,
		"LDAPCredentials",
		"CarbonLDP.Auth.LDAPCredentials"
	), ():void => {
		expect( Auth.LDAPCredentials ).toBeDefined();
		expect( Auth.LDAPCredentials ).toBe( LDAPCredentials );
	} );

	it( reexports(
		STATIC,
		"ACE",
		"CarbonLDP.Auth.ACE"
	), ():void => {
		const target:Auth.ACE = {} as ACE;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"ACL",
		"CarbonLDP.Auth.ACL"
	), ():void => {
		expect( Auth.ACL ).toBeDefined();
		expect( Auth.ACL ).toBe( ACL );
	} );

	it( reexports(
		STATIC,
		"User",
		"CarbonLDP.Auth.User"
	), ():void => {
		expect( Auth.User ).toBeDefined();
		expect( Auth.User ).toBe( User );
	} );

	it( reexports(
		STATIC,
		"Role",
		"carbonldp/Auth/Role"
	), ():void => {
		expect( Auth.Role ).toBeDefined();
		expect( Auth.Role ).toBe( Role );
	} );

	it( reexports(
		STATIC,
		"TransientRole",
		"CarbonLDP.Auth.TransientRole"
	), ():void => {
		expect( Auth.TransientRole ).toBeDefined();
		expect( Auth.TransientRole ).toBe( TransientRole );
	} );

	it( reexports(
		STATIC,
		"RolesEndpoint",
		"carbonldp/Auth/RolesEndpoint"
	), ():void => {
		expect( Auth.RolesEndpoint ).toBeDefined();
		expect( Auth.RolesEndpoint ).toBe( RolesEndpoint );
	} );

	it( reexports(
		STATIC,
		"TokenCredentials",
		"CarbonLDP.Auth.TokenCredentials"
	), ():void => {
		expect( Auth.TokenCredentials ).toBeDefined();
		expect( Auth.TokenCredentials ).toBe( TokenCredentials );
	} );

	it( reexports(
		STATIC,
		"TokenCredentialsBase",
		"CarbonLDP.Auth.TokenCredentialsBase"
	), ():void => {
		expect( Auth.TokenCredentialsBase ).toBeDefined();
		expect( Auth.TokenCredentialsBase ).toBe( TokenCredentialsBase );
	} );

	it( reexports(
		STATIC,
		"TokenAuthenticator",
		"CarbonLDP.Auth.TokenAuthenticator"
	), ():void => {
		expect( Auth.TokenAuthenticator ).toBeDefined();
		expect( Auth.TokenAuthenticator ).toBe( TokenAuthenticator );
	} );

	it( reexports(
		STATIC,
		"UsernameAndPasswordCredentials",
		"CarbonLDP.Auth.UsernameAndPasswordCredentials"
	), ():void => {
		expect( Auth.UsernameAndPasswordCredentials ).toBeDefined();
		expect( Auth.UsernameAndPasswordCredentials ).toBe( UsernameAndPasswordCredentials );
	} );

} );
