import {
	isDefined,
	module,
	reexports,
	STATIC,
} from "../test/JasmineExtender";
import * as Utils from "../Utils";

import * as Auth from "./";

import {
	ACE,
	BaseACE,
} from "./ACE";
import {
	ACL,
	BaseACL,
	TransientACL,
} from "./ACL";
import { AuthenticatedUserInformationAccessor } from "./AuthenticatedUserInformationAccessor";
import { AuthenticatedUserMetadata } from "./AuthenticatedUserMetadata";
import { Authenticator } from "./Authenticator";
import { AuthMethod } from "./AuthMethod";
import { BasicAuthenticator } from "./BasicAuthenticator";
import { BasicCredentials } from "./BasicCredentials";
import { BasicToken } from "./BasicToken";
import { CompleteACReport } from "./CompleteACReport";
import { CredentialSet } from "./CredentialSet";
import { DetailedUserACReport } from "./DetailedUserACReport";
import { GrantingStep } from "./GrantingStep";
import { LDAPCredentials } from "./LDAPCredentials";
import { PasswordSecret } from "./PasswordSecret";
import { PermissionReport } from "./PermissionReport";
import * as PersistedRole from "./PersistedRole";
import * as Role from "./Role";
import * as Roles from "./Roles";
import { AuthService } from "./Service";
import { SimpleUserACReport } from "./SimpleUserACReport";
import { SubjectReport } from "./SubjectReport";
import { TokenAuthenticator } from "./TokenAuthenticator";
import {
	TokenCredentials,
	TokenCredentialsBase,
} from "./TokenCredentials";
import {
	TransientUser,
	User,
} from "./User";
import { UsernameAndPasswordCredentials } from "./UsernameAndPasswordCredentials";
import { UsersEndpoint } from "./UsersEndpoint";


describe( module( "carbonldp/Auth" ), ():void => {

	it( isDefined(), ():void => {
		expect( Auth ).toBeDefined();
		expect( Utils.isObject( Auth ) ).toBe( true );
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
		"CarbonLDP.Auth.CredentialSet"
	), ():void => {
		expect( Auth.CredentialSet ).toBeDefined();
		expect( Auth.CredentialSet ).toBe( CredentialSet );
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
		"BaseACE",
		"CarbonLDP.Auth.BaseACE"
	), ():void => {
		const target:Auth.BaseACE = {} as BaseACE;
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
		"BaseACL",
		"CarbonLDP.Auth.BaseACL"
	), ():void => {
		const target:Auth.BaseACL = {} as BaseACL;
		expect( target ).toBeDefined();
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
		"PasswordSecret",
		"CarbonLDP.Auth.PasswordSecret"
	), ():void => {
		expect( Auth.PasswordSecret ).toBeDefined();
		expect( Auth.PasswordSecret ).toBe( PasswordSecret );
	} );

	it( reexports(
		STATIC,
		"PersistedRole",
		"carbonldp/Auth/PersistedRole"
	), ():void => {
		expect( Auth.PersistedRole ).toBeDefined();
		expect( Auth.PersistedRole ).toBe( PersistedRole );
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
		"Roles",
		"carbonldp/Auth/Roles"
	), ():void => {
		expect( Auth.Roles ).toBeDefined();
		expect( Auth.Roles ).toBe( Roles );
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

	it( reexports(
		STATIC,
		"SimpleUserACReport",
		"CarbonLDP.Auth.SimpleUserACReport"
	), ():void => {
		expect( Auth.SimpleUserACReport ).toBeDefined();
		expect( Auth.SimpleUserACReport ).toBe( SimpleUserACReport );
	} );

	it( reexports(
		STATIC,
		"DetailedUserACReport",
		"CarbonLDP.Auth.DetailedUserACReport"
	), ():void => {
		expect( Auth.DetailedUserACReport ).toBeDefined();
		expect( Auth.DetailedUserACReport ).toBe( DetailedUserACReport );
	} );

	it( reexports(
		STATIC,
		"PermissionReport",
		"CarbonLDP.Auth.PermissionReport"
	), ():void => {
		expect( Auth.PermissionReport ).toBeDefined();
		expect( Auth.PermissionReport ).toBe( PermissionReport );
	} );

	it( reexports(
		STATIC,
		"GrantingStep",
		"CarbonLDP.Auth.GrantingStep"
	), ():void => {
		expect( Auth.GrantingStep ).toBeDefined();
		expect( Auth.GrantingStep ).toBe( GrantingStep );
	} );

	it( reexports(
		STATIC,
		"CompleteACReport",
		"CarbonLDP.Auth.CompleteACReport"
	), ():void => {
		expect( Auth.CompleteACReport ).toBeDefined();
		expect( Auth.CompleteACReport ).toBe( CompleteACReport );
	} );

	it( reexports(
		STATIC,
		"SubjectReport",
		"CarbonLDP.Auth.SubjectReport"
	), ():void => {
		expect( Auth.SubjectReport ).toBeDefined();
		expect( Auth.SubjectReport ).toBe( SubjectReport );
	} );

} );
