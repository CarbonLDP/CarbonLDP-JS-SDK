import {
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	property,
	STATIC,
} from "../test/JasmineExtender";

import { CS } from "./CS";

describe( module( "carbonldp/Vocabularies/CS" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Vocabularies.CS",
		"Interface that describes the vocabulary for the security system of Carbon LDP."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"namespace",
			"https://carbonldp.com/ns/v1/security#"
		), ():void => {
			const target:CS[ "namespace" ] = "https://carbonldp.com/ns/v1/security#";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AccessControlEntry",
			"https://carbonldp.com/ns/v1/security#AccessControlEntry"
		), ():void => {
			const target:CS[ "AccessControlEntry" ] = "https://carbonldp.com/ns/v1/security#AccessControlEntry";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AccessControlList",
			"https://carbonldp.com/ns/v1/security#AccessControlList"
		), ():void => {
			const target:CS[ "AccessControlList" ] = "https://carbonldp.com/ns/v1/security#AccessControlList";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AllOrigins",
			"https://carbonldp.com/ns/v1/security#AllOrigins"
		), ():void => {
			const target:CS[ "AllOrigins" ] = "https://carbonldp.com/ns/v1/security#AllOrigins";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AuthenticatedUserInformationAccessor",
			"https://carbonldp.com/ns/v1/security#AuthenticatedUserInformationAccessor"
		), ():void => {
			const target:CS[ "AuthenticatedUserInformationAccessor" ] = "https://carbonldp.com/ns/v1/security#AuthenticatedUserInformationAccessor";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AuthenticatedUserMetadata",
			"https://carbonldp.com/ns/v1/security#AuthenticatedUserMetadata"
		), ():void => {
			const target:CS[ "AuthenticatedUserMetadata" ] = "https://carbonldp.com/ns/v1/security#AuthenticatedUserMetadata";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"CreateAccessPoint",
			"https://carbonldp.com/ns/v1/security#CreateAccessPoint"
		), ():void => {
			const target:CS[ "CreateAccessPoint" ] = "https://carbonldp.com/ns/v1/security#CreateAccessPoint";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"CreateChild",
			"https://carbonldp.com/ns/v1/security#CreateChild"
		), ():void => {
			const target:CS[ "CreateChild" ] = "https://carbonldp.com/ns/v1/security#CreateChild";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Credentials",
			"https://carbonldp.com/ns/v1/security#Credentials"
		), ():void => {
			const target:CS[ "Credentials" ] = "https://carbonldp.com/ns/v1/security#Credentials";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"CredentialsSet",
			"https://carbonldp.com/ns/v1/security#CredentialsSet"
		), ():void => {
			const target:CS[ "CredentialsSet" ] = "https://carbonldp.com/ns/v1/security#CredentialsSet";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Delete",
			"https://carbonldp.com/ns/v1/security#Delete"
		), ():void => {
			const target:CS[ "Delete" ] = "https://carbonldp.com/ns/v1/security#Delete";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Download",
			"https://carbonldp.com/ns/v1/security#Download"
		), ():void => {
			const target:CS[ "Download" ] = "https://carbonldp.com/ns/v1/security#Download";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Extend",
			"https://carbonldp.com/ns/v1/security#Extend"
		), ():void => {
			const target:CS[ "Extend" ] = "https://carbonldp.com/ns/v1/security#Extend";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"LDAPCredentials",
			"https://carbonldp.com/ns/v1/security#LDAPCredentials"
		), ():void => {
			const target:CS[ "LDAPCredentials" ] = "https://carbonldp.com/ns/v1/security#LDAPCredentials";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ManageSecurity",
			"https://carbonldp.com/ns/v1/security#ManageSecurity"
		), ():void => {
			const target:CS[ "ManageSecurity" ] = "https://carbonldp.com/ns/v1/security#ManageSecurity";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferAuthToken",
			"https://carbonldp.com/ns/v1/security#PreferAuthToken"
		), ():void => {
			const target:CS[ "PreferAuthToken" ] = "https://carbonldp.com/ns/v1/security#PreferAuthToken";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ProtectedDocument",
			"https://carbonldp.com/ns/v1/security#ProtectedDocument"
		), ():void => {
			const target:CS[ "ProtectedDocument" ] = "https://carbonldp.com/ns/v1/security#ProtectedDocument";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Read",
			"https://carbonldp.com/ns/v1/security#Read"
		), ():void => {
			const target:CS[ "Read" ] = "https://carbonldp.com/ns/v1/security#Read";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"RemoveMember",
			"https://carbonldp.com/ns/v1/security#RemoveMember"
		), ():void => {
			const target:CS[ "RemoveMember" ] = "https://carbonldp.com/ns/v1/security#RemoveMember";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Role",
			"https://carbonldp.com/ns/v1/security#Role"
		), ():void => {
			const target:CS[ "Role" ] = "https://carbonldp.com/ns/v1/security#Role";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Ticket",
			"https://carbonldp.com/ns/v1/security#Ticket"
		), ():void => {
			const target:CS[ "Ticket" ] = "https://carbonldp.com/ns/v1/security#Ticket";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"TokenCredentials",
			"https://carbonldp.com/ns/v1/security#TokenCredentials"
		), ():void => {
			const target:CS[ "TokenCredentials" ] = "https://carbonldp.com/ns/v1/security#TokenCredentials";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Update",
			"https://carbonldp.com/ns/v1/security#Update"
		), ():void => {
			const target:CS[ "Update" ] = "https://carbonldp.com/ns/v1/security#Update";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Upload",
			"https://carbonldp.com/ns/v1/security#Upload"
		), ():void => {
			const target:CS[ "Upload" ] = "https://carbonldp.com/ns/v1/security#Upload";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"User",
			"https://carbonldp.com/ns/v1/security#User"
		), ():void => {
			const target:CS[ "User" ] = "https://carbonldp.com/ns/v1/security#User";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"UsernameAndPasswordCredentials",
			"https://carbonldp.com/ns/v1/security#UsernameAndPasswordCredentials"
		), ():void => {
			const target:CS[ "UsernameAndPasswordCredentials" ] = "https://carbonldp.com/ns/v1/security#UsernameAndPasswordCredentials";
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OBLIGATORY,
			"accessControlEntry",
			"https://carbonldp.com/ns/v1/security#accessControlEntry"
		), ():void => {
			const target:CS[ "accessControlEntry" ] = "https://carbonldp.com/ns/v1/security#accessControlEntry";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"accessControlList",
			"https://carbonldp.com/ns/v1/security#accessControlList"
		), ():void => {
			const target:CS[ "accessControlList" ] = "https://carbonldp.com/ns/v1/security#accessControlList";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"accessTo",
			"https://carbonldp.com/ns/v1/security#accessTo"
		), ():void => {
			const target:CS[ "accessTo" ] = "https://carbonldp.com/ns/v1/security#accessTo";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"allowsOrigin",
			"https://carbonldp.com/ns/v1/security#allowsOrigin"
		), ():void => {
			const target:CS[ "allowsOrigin" ] = "https://carbonldp.com/ns/v1/security#allowsOrigin";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"authToken",
			"https://carbonldp.com/ns/v1/security#authToken"
		), ():void => {
			const target:CS[ "authToken" ] = "https://carbonldp.com/ns/v1/security#authToken";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"authenticatedUserMetadata",
			"https://carbonldp.com/ns/v1/security#authenticatedUserMetadata"
		), ():void => {
			const target:CS[ "authenticatedUserMetadata" ] = "https://carbonldp.com/ns/v1/security#authenticatedUserMetadata";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"child",
			"https://carbonldp.com/ns/v1/security#child"
		), ():void => {
			const target:CS[ "child" ] = "https://carbonldp.com/ns/v1/security#child";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"credentials",
			"https://carbonldp.com/ns/v1/security#credentials"
		), ():void => {
			const target:CS[ "credentials" ] = "https://carbonldp.com/ns/v1/security#credentials";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"credentialsOf",
			"https://carbonldp.com/ns/v1/security#credentialsOf"
		), ():void => {
			const target:CS[ "credentialsOf" ] = "https://carbonldp.com/ns/v1/security#credentialsOf";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"description",
			"https://carbonldp.com/ns/v1/security#description"
		), ():void => {
			const target:CS[ "description" ] = "https://carbonldp.com/ns/v1/security#description";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"enabled",
			"https://carbonldp.com/ns/v1/security#enabled"
		), ():void => {
			const target:CS[ "enabled" ] = "https://carbonldp.com/ns/v1/security#enabled";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"expires",
			"https://carbonldp.com/ns/v1/security#expires"
		), ():void => {
			const target:CS[ "expires" ] = "https://carbonldp.com/ns/v1/security#expires";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"forIRI",
			"https://carbonldp.com/ns/v1/security#forIRI"
		), ():void => {
			const target:CS[ "forIRI" ] = "https://carbonldp.com/ns/v1/security#forIRI";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"granting",
			"https://carbonldp.com/ns/v1/security#granting"
		), ():void => {
			const target:CS[ "granting" ] = "https://carbonldp.com/ns/v1/security#granting";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"inheritableEntry",
			"https://carbonldp.com/ns/v1/security#inheritableEntry"
		), ():void => {
			const target:CS[ "inheritableEntry" ] = "https://carbonldp.com/ns/v1/security#inheritableEntry";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"name",
			"https://carbonldp.com/ns/v1/security#name"
		), ():void => {
			const target:CS[ "name" ] = "https://carbonldp.com/ns/v1/security#name";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"parent",
			"https://carbonldp.com/ns/v1/security#parent"
		), ():void => {
			const target:CS[ "parent" ] = "https://carbonldp.com/ns/v1/security#parent";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"password",
			"https://carbonldp.com/ns/v1/security#password"
		), ():void => {
			const target:CS[ "password" ] = "https://carbonldp.com/ns/v1/security#password";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"permission",
			"https://carbonldp.com/ns/v1/security#permission"
		), ():void => {
			const target:CS[ "permission" ] = "https://carbonldp.com/ns/v1/security#permission";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"role",
			"https://carbonldp.com/ns/v1/security#role"
		), ():void => {
			const target:CS[ "role" ] = "https://carbonldp.com/ns/v1/security#role";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"rootContainer",
			"https://carbonldp.com/ns/v1/security#rootContainer"
		), ():void => {
			const target:CS[ "rootContainer" ] = "https://carbonldp.com/ns/v1/security#rootContainer";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"subject",
			"https://carbonldp.com/ns/v1/security#subject"
		), ():void => {
			const target:CS[ "subject" ] = "https://carbonldp.com/ns/v1/security#subject";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"subjectClass",
			"https://carbonldp.com/ns/v1/security#subjectClass"
		), ():void => {
			const target:CS[ "subjectClass" ] = "https://carbonldp.com/ns/v1/security#subjectClass";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ticketKey",
			"https://carbonldp.com/ns/v1/security#ticketKey"
		), ():void => {
			const target:CS[ "ticketKey" ] = "https://carbonldp.com/ns/v1/security#ticketKey";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"token",
			"https://carbonldp.com/ns/v1/security#token"
		), ():void => {
			const target:CS[ "token" ] = "https://carbonldp.com/ns/v1/security#token";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"user",
			"https://carbonldp.com/ns/v1/security#user"
		), ():void => {
			const target:CS[ "user" ] = "https://carbonldp.com/ns/v1/security#user";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"username",
			"https://carbonldp.com/ns/v1/security#username"
		), ():void => {
			const target:CS[ "username" ] = "https://carbonldp.com/ns/v1/security#username";
			expect( target ).toBeDefined();
		} );

	} );

	describe( property(
		STATIC,
		"CS",
		"CarbonLDP.Vocabularies.CS",
		"Constant that implements the vocabulary for the security system of Carbon LDP."
	), ():void => {

		it( "should exists", ():void => {
			expect( CS ).toBeDefined();
			expect( CS ).toEqual( jasmine.any( Object ) );
		} );

		it( "should test all exported IRIs", ():void => {
			expect( Object.keys( CS ).length ).toBe( 55 );
		} );

		it( "CS.namespace", ():void => {
			expect( CS.namespace ).toEqual( jasmine.any( String ) );
			expect( CS.namespace ).toBe( "https://carbonldp.com/ns/v1/security#" );
		} );

		it( "CS.AccessControlEntry", ():void => {
			expect( CS.AccessControlEntry ).toEqual( jasmine.any( String ) );
			expect( CS.AccessControlEntry ).toBe( "https://carbonldp.com/ns/v1/security#AccessControlEntry" );
		} );

		it( "CS.AccessControlList", ():void => {
			expect( CS.AccessControlList ).toEqual( jasmine.any( String ) );
			expect( CS.AccessControlList ).toBe( "https://carbonldp.com/ns/v1/security#AccessControlList" );
		} );

		it( "CS.AllOrigins", ():void => {
			expect( CS.AllOrigins ).toEqual( jasmine.any( String ) );
			expect( CS.AllOrigins ).toBe( "https://carbonldp.com/ns/v1/security#AllOrigins" );
		} );

		it( "CS.AuthenticatedUserInformationAccessor", ():void => {
			expect( CS.AuthenticatedUserInformationAccessor ).toEqual( jasmine.any( String ) );
			expect( CS.AuthenticatedUserInformationAccessor ).toBe( "https://carbonldp.com/ns/v1/security#AuthenticatedUserInformationAccessor" );
		} );

		it( "CS.AuthenticatedUserMetadata", ():void => {
			expect( CS.AuthenticatedUserMetadata ).toEqual( jasmine.any( String ) );
			expect( CS.AuthenticatedUserMetadata ).toBe( "https://carbonldp.com/ns/v1/security#AuthenticatedUserMetadata" );
		} );

		it( "CS.CreateAccessPoint", ():void => {
			expect( CS.CreateAccessPoint ).toEqual( jasmine.any( String ) );
			expect( CS.CreateAccessPoint ).toBe( "https://carbonldp.com/ns/v1/security#CreateAccessPoint" );
		} );

		it( "CS.CreateChild", ():void => {
			expect( CS.CreateChild ).toEqual( jasmine.any( String ) );
			expect( CS.CreateChild ).toBe( "https://carbonldp.com/ns/v1/security#CreateChild" );
		} );

		it( "CS.Credentials", ():void => {
			expect( CS.Credentials ).toEqual( jasmine.any( String ) );
			expect( CS.Credentials ).toBe( "https://carbonldp.com/ns/v1/security#Credentials" );
		} );

		it( "CS.CredentialsSet", ():void => {
			expect( CS.CredentialsSet ).toEqual( jasmine.any( String ) );
			expect( CS.CredentialsSet ).toBe( "https://carbonldp.com/ns/v1/security#CredentialsSet" );
		} );

		it( "CS.Delete", ():void => {
			expect( CS.Delete ).toEqual( jasmine.any( String ) );
			expect( CS.Delete ).toBe( "https://carbonldp.com/ns/v1/security#Delete" );
		} );

		it( "CS.Download", ():void => {
			expect( CS.Download ).toEqual( jasmine.any( String ) );
			expect( CS.Download ).toBe( "https://carbonldp.com/ns/v1/security#Download" );
		} );

		it( "CS.Extend", ():void => {
			expect( CS.Extend ).toEqual( jasmine.any( String ) );
			expect( CS.Extend ).toBe( "https://carbonldp.com/ns/v1/security#Extend" );
		} );

		it( "CS.LDAPCredentials", ():void => {
			expect( CS.LDAPCredentials ).toEqual( jasmine.any( String ) );
			expect( CS.LDAPCredentials ).toBe( "https://carbonldp.com/ns/v1/security#LDAPCredentials" );
		} );

		it( "CS.ManageSecurity", ():void => {
			expect( CS.ManageSecurity ).toEqual( jasmine.any( String ) );
			expect( CS.ManageSecurity ).toBe( "https://carbonldp.com/ns/v1/security#ManageSecurity" );
		} );

		it( "CS.PreferAuthToken", ():void => {
			expect( CS.PreferAuthToken ).toEqual( jasmine.any( String ) );
			expect( CS.PreferAuthToken ).toBe( "https://carbonldp.com/ns/v1/security#PreferAuthToken" );
		} );

		it( "CS.ProtectedDocument", ():void => {
			expect( CS.ProtectedDocument ).toEqual( jasmine.any( String ) );
			expect( CS.ProtectedDocument ).toBe( "https://carbonldp.com/ns/v1/security#ProtectedDocument" );
		} );

		it( "CS.Read", ():void => {
			expect( CS.Read ).toEqual( jasmine.any( String ) );
			expect( CS.Read ).toBe( "https://carbonldp.com/ns/v1/security#Read" );
		} );

		it( "CS.RemoveMember", ():void => {
			expect( CS.RemoveMember ).toEqual( jasmine.any( String ) );
			expect( CS.RemoveMember ).toBe( "https://carbonldp.com/ns/v1/security#RemoveMember" );
		} );

		it( "CS.Role", ():void => {
			expect( CS.Role ).toEqual( jasmine.any( String ) );
			expect( CS.Role ).toBe( "https://carbonldp.com/ns/v1/security#Role" );
		} );

		it( "CS.Ticket", ():void => {
			expect( CS.Ticket ).toEqual( jasmine.any( String ) );
			expect( CS.Ticket ).toBe( "https://carbonldp.com/ns/v1/security#Ticket" );
		} );

		it( "CS.TokenCredentials", ():void => {
			expect( CS.TokenCredentials ).toEqual( jasmine.any( String ) );
			expect( CS.TokenCredentials ).toBe( "https://carbonldp.com/ns/v1/security#TokenCredentials" );
		} );

		it( "CS.Update", ():void => {
			expect( CS.Update ).toEqual( jasmine.any( String ) );
			expect( CS.Update ).toBe( "https://carbonldp.com/ns/v1/security#Update" );
		} );

		it( "CS.Upload", ():void => {
			expect( CS.Upload ).toEqual( jasmine.any( String ) );
			expect( CS.Upload ).toBe( "https://carbonldp.com/ns/v1/security#Upload" );
		} );

		it( "CS.User", ():void => {
			expect( CS.User ).toEqual( jasmine.any( String ) );
			expect( CS.User ).toBe( "https://carbonldp.com/ns/v1/security#User" );
		} );

		it( "CS.UsernameAndPasswordCredentials", ():void => {
			expect( CS.UsernameAndPasswordCredentials ).toEqual( jasmine.any( String ) );
			expect( CS.UsernameAndPasswordCredentials ).toBe( "https://carbonldp.com/ns/v1/security#UsernameAndPasswordCredentials" );
		} );


		it( "CS.accessControlEntry", ():void => {
			expect( CS.accessControlEntry ).toEqual( jasmine.any( String ) );
			expect( CS.accessControlEntry ).toBe( "https://carbonldp.com/ns/v1/security#accessControlEntry" );
		} );

		it( "CS.accessControlList", ():void => {
			expect( CS.accessControlList ).toEqual( jasmine.any( String ) );
			expect( CS.accessControlList ).toBe( "https://carbonldp.com/ns/v1/security#accessControlList" );
		} );

		it( "CS.accessTo", ():void => {
			expect( CS.accessTo ).toEqual( jasmine.any( String ) );
			expect( CS.accessTo ).toBe( "https://carbonldp.com/ns/v1/security#accessTo" );
		} );

		it( "CS.allowsOrigin", ():void => {
			expect( CS.allowsOrigin ).toEqual( jasmine.any( String ) );
			expect( CS.allowsOrigin ).toBe( "https://carbonldp.com/ns/v1/security#allowsOrigin" );
		} );

		it( "CS.authToken", ():void => {
			expect( CS.authToken ).toEqual( jasmine.any( String ) );
			expect( CS.authToken ).toBe( "https://carbonldp.com/ns/v1/security#authToken" );
		} );

		it( "CS.authenticatedUserMetadata", ():void => {
			expect( CS.authenticatedUserMetadata ).toEqual( jasmine.any( String ) );
			expect( CS.authenticatedUserMetadata ).toBe( "https://carbonldp.com/ns/v1/security#authenticatedUserMetadata" );
		} );

		it( "CS.child", ():void => {
			expect( CS.child ).toEqual( jasmine.any( String ) );
			expect( CS.child ).toBe( "https://carbonldp.com/ns/v1/security#child" );
		} );

		it( "CS.credentials", ():void => {
			expect( CS.credentials ).toEqual( jasmine.any( String ) );
			expect( CS.credentials ).toBe( "https://carbonldp.com/ns/v1/security#credentials" );
		} );

		it( "CS.credentialsOf", ():void => {
			expect( CS.credentialsOf ).toEqual( jasmine.any( String ) );
			expect( CS.credentialsOf ).toBe( "https://carbonldp.com/ns/v1/security#credentialsOf" );
		} );

		it( "CS.description", ():void => {
			expect( CS.description ).toEqual( jasmine.any( String ) );
			expect( CS.description ).toBe( "https://carbonldp.com/ns/v1/security#description" );
		} );

		it( "CS.enabled", ():void => {
			expect( CS.enabled ).toEqual( jasmine.any( String ) );
			expect( CS.enabled ).toBe( "https://carbonldp.com/ns/v1/security#enabled" );
		} );

		it( "CS.expires", ():void => {
			expect( CS.expires ).toEqual( jasmine.any( String ) );
			expect( CS.expires ).toBe( "https://carbonldp.com/ns/v1/security#expires" );
		} );

		it( "CS.forIRI", ():void => {
			expect( CS.forIRI ).toEqual( jasmine.any( String ) );
			expect( CS.forIRI ).toBe( "https://carbonldp.com/ns/v1/security#forIRI" );
		} );

		it( "CS.granting", ():void => {
			expect( CS.granting ).toEqual( jasmine.any( String ) );
			expect( CS.granting ).toBe( "https://carbonldp.com/ns/v1/security#granting" );
		} );

		it( "CS.inheritableEntry", ():void => {
			expect( CS.inheritableEntry ).toEqual( jasmine.any( String ) );
			expect( CS.inheritableEntry ).toBe( "https://carbonldp.com/ns/v1/security#inheritableEntry" );
		} );

		it( "CS.ldapServer", ():void => {
			expect( CS.ldapServer ).toEqual( jasmine.any( String ) );
			expect( CS.ldapServer ).toBe( "https://carbonldp.com/ns/v1/security#ldapServer" );
		} );

		it( "CS.ldapUserDN", ():void => {
			expect( CS.ldapUserDN ).toEqual( jasmine.any( String ) );
			expect( CS.ldapUserDN ).toBe( "https://carbonldp.com/ns/v1/security#ldapUserDN" );
		} );

		it( "CS.name", ():void => {
			expect( CS.name ).toEqual( jasmine.any( String ) );
			expect( CS.name ).toBe( "https://carbonldp.com/ns/v1/security#name" );
		} );

		it( "CS.parent", ():void => {
			expect( CS.parent ).toEqual( jasmine.any( String ) );
			expect( CS.parent ).toBe( "https://carbonldp.com/ns/v1/security#parent" );
		} );

		it( "CS.password", ():void => {
			expect( CS.password ).toEqual( jasmine.any( String ) );
			expect( CS.password ).toBe( "https://carbonldp.com/ns/v1/security#password" );
		} );

		it( "CS.permission", ():void => {
			expect( CS.permission ).toEqual( jasmine.any( String ) );
			expect( CS.permission ).toBe( "https://carbonldp.com/ns/v1/security#permission" );
		} );

		it( "CS.role", ():void => {
			expect( CS.role ).toEqual( jasmine.any( String ) );
			expect( CS.role ).toBe( "https://carbonldp.com/ns/v1/security#role" );
		} );

		it( "CS.rootContainer", ():void => {
			expect( CS.rootContainer ).toEqual( jasmine.any( String ) );
			expect( CS.rootContainer ).toBe( "https://carbonldp.com/ns/v1/security#rootContainer" );
		} );

		it( "CS.subject", ():void => {
			expect( CS.subject ).toEqual( jasmine.any( String ) );
			expect( CS.subject ).toBe( "https://carbonldp.com/ns/v1/security#subject" );
		} );

		it( "CS.subjectClass", ():void => {
			expect( CS.subjectClass ).toEqual( jasmine.any( String ) );
			expect( CS.subjectClass ).toBe( "https://carbonldp.com/ns/v1/security#subjectClass" );
		} );

		it( "CS.ticketKey", ():void => {
			expect( CS.ticketKey ).toEqual( jasmine.any( String ) );
			expect( CS.ticketKey ).toBe( "https://carbonldp.com/ns/v1/security#ticketKey" );
		} );

		it( "CS.token", ():void => {
			expect( CS.token ).toEqual( jasmine.any( String ) );
			expect( CS.token ).toBe( "https://carbonldp.com/ns/v1/security#token" );
		} );

		it( "CS.user", ():void => {
			expect( CS.user ).toEqual( jasmine.any( String ) );
			expect( CS.user ).toBe( "https://carbonldp.com/ns/v1/security#user" );
		} );

		it( "CS.username", ():void => {
			expect( CS.username ).toEqual( jasmine.any( String ) );
			expect( CS.username ).toBe( "https://carbonldp.com/ns/v1/security#username" );
		} );

	} );

} );
