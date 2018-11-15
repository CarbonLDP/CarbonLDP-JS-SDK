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
			"AddMember",
			"https://carbonldp.com/ns/v1/security#AddMember"
		), ():void => {
			const target:CS[ "AddMember" ] = "https://carbonldp.com/ns/v1/security#AddMember";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AllDescendantsACEntry",
			"https://carbonldp.com/ns/v1/security#AllDescendantsACEntry"
		), ():void => {
			const target:CS[ "AllDescendantsACEntry" ] = "https://carbonldp.com/ns/v1/security#AllDescendantsACEntry";
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
			"AnonymousUser",
			"https://carbonldp.com/ns/v1/security#AnonymousUser"
		), ():void => {
			const target:CS[ "AnonymousUser" ] = "https://carbonldp.com/ns/v1/security#AnonymousUser";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AuthenticatedUser",
			"https://carbonldp.com/ns/v1/security#AuthenticatedUser"
		), ():void => {
			const target:CS[ "AuthenticatedUser" ] = "https://carbonldp.com/ns/v1/security#AuthenticatedUser";
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
			"CompleteACReport",
			"https://carbonldp.com/ns/v1/security#CompleteACReport"
		), ():void => {
			const target:CS[ "CompleteACReport" ] = "https://carbonldp.com/ns/v1/security#CompleteACReport";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ControlAccess",
			"https://carbonldp.com/ns/v1/security#ControlAccess"
		), ():void => {
			const target:CS[ "ControlAccess" ] = "https://carbonldp.com/ns/v1/security#ControlAccess";
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
			"Creator",
			"https://carbonldp.com/ns/v1/security#Creator"
		), ():void => {
			const target:CS[ "Creator" ] = "https://carbonldp.com/ns/v1/security#Creator";
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
			"CredentialSet",
			"https://carbonldp.com/ns/v1/security#CredentialSet"
		), ():void => {
			const target:CS[ "CredentialSet" ] = "https://carbonldp.com/ns/v1/security#CredentialSet";
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
			"DetailedUserACReport",
			"https://carbonldp.com/ns/v1/security#DetailedUserACReport"
		), ():void => {
			const target:CS[ "DetailedUserACReport" ] = "https://carbonldp.com/ns/v1/security#DetailedUserACReport";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"DirectACEntry",
			"https://carbonldp.com/ns/v1/security#DirectACEntry"
		), ():void => {
			const target:CS[ "DirectACEntry" ] = "https://carbonldp.com/ns/v1/security#DirectACEntry";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"GrantingStep",
			"https://carbonldp.com/ns/v1/security#GrantingStep"
		), ():void => {
			const target:CS[ "GrantingStep" ] = "https://carbonldp.com/ns/v1/security#GrantingStep";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ImmediateDescendantsACEntry",
			"https://carbonldp.com/ns/v1/security#ImmediateDescendantsACEntry"
		), ():void => {
			const target:CS[ "ImmediateDescendantsACEntry" ] = "https://carbonldp.com/ns/v1/security#ImmediateDescendantsACEntry";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Impersonate",
			"https://carbonldp.com/ns/v1/security#Impersonate"
		), ():void => {
			const target:CS[ "Impersonate" ] = "https://carbonldp.com/ns/v1/security#Impersonate";
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
			"Owner",
			"https://carbonldp.com/ns/v1/security#Owner"
		), ():void => {
			const target:CS[ "Owner" ] = "https://carbonldp.com/ns/v1/security#Owner";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PasswordSecret",
			"https://carbonldp.com/ns/v1/security#PasswordSecret"
		), ():void => {
			const target:CS[ "PasswordSecret" ] = "https://carbonldp.com/ns/v1/security#PasswordSecret";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PermissionReport",
			"https://carbonldp.com/ns/v1/security#PermissionReport"
		), ():void => {
			const target:CS[ "PermissionReport" ] = "https://carbonldp.com/ns/v1/security#PermissionReport";
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
			"PreferCompleteACReport",
			"https://carbonldp.com/ns/v1/security#PreferCompleteACReport"
		), ():void => {
			const target:CS[ "PreferCompleteACReport" ] = "https://carbonldp.com/ns/v1/security#PreferCompleteACReport";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferDetailedUserACReport",
			"https://carbonldp.com/ns/v1/security#PreferDetailedUserACReport"
		), ():void => {
			const target:CS[ "PreferDetailedUserACReport" ] = "https://carbonldp.com/ns/v1/security#PreferDetailedUserACReport";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferSimpleUserACReport",
			"https://carbonldp.com/ns/v1/security#PreferSimpleUserACReport"
		), ():void => {
			const target:CS[ "PreferSimpleUserACReport" ] = "https://carbonldp.com/ns/v1/security#PreferSimpleUserACReport";
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
			"SimpleUserACReport",
			"https://carbonldp.com/ns/v1/security#SimpleUserACReport"
		), ():void => {
			const target:CS[ "SimpleUserACReport" ] = "https://carbonldp.com/ns/v1/security#SimpleUserACReport";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"SubjectReport",
			"https://carbonldp.com/ns/v1/security#SubjectReport"
		), ():void => {
			const target:CS[ "SubjectReport" ] = "https://carbonldp.com/ns/v1/security#SubjectReport";
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
			"accessControlList",
			"https://carbonldp.com/ns/v1/security#accessControlList"
		), ():void => {
			const target:CS[ "accessControlList" ] = "https://carbonldp.com/ns/v1/security#accessControlList";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"allDescendantsACEntry",
			"https://carbonldp.com/ns/v1/security#allDescendantsACEntry"
		), ():void => {
			const target:CS[ "allDescendantsACEntry" ] = "https://carbonldp.com/ns/v1/security#allDescendantsACEntry";
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
			"applied",
			"https://carbonldp.com/ns/v1/security#applied"
		), ():void => {
			const target:CS[ "applied" ] = "https://carbonldp.com/ns/v1/security#applied";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"appliedBy",
			"https://carbonldp.com/ns/v1/security#appliedBy"
		), ():void => {
			const target:CS[ "appliedBy" ] = "https://carbonldp.com/ns/v1/security#appliedBy";
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
			"childRole",
			"https://carbonldp.com/ns/v1/security#childRole"
		), ():void => {
			const target:CS[ "childRole" ] = "https://carbonldp.com/ns/v1/security#childRole";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"creator",
			"https://carbonldp.com/ns/v1/security#creator"
		), ():void => {
			const target:CS[ "creator" ] = "https://carbonldp.com/ns/v1/security#creator";
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
			"credentialSet",
			"https://carbonldp.com/ns/v1/security#credentialSet"
		), ():void => {
			const target:CS[ "credentialSet" ] = "https://carbonldp.com/ns/v1/security#credentialSet";
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
			"directACEntry",
			"https://carbonldp.com/ns/v1/security#directACEntry"
		), ():void => {
			const target:CS[ "directACEntry" ] = "https://carbonldp.com/ns/v1/security#directACEntry";
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
			"granted",
			"https://carbonldp.com/ns/v1/security#granted"
		), ():void => {
			const target:CS[ "granted" ] = "https://carbonldp.com/ns/v1/security#granted";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"grantingChain",
			"https://carbonldp.com/ns/v1/security#grantingChain"
		), ():void => {
			const target:CS[ "grantingChain" ] = "https://carbonldp.com/ns/v1/security#grantingChain";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"hashedPassword",
			"https://carbonldp.com/ns/v1/security#hashedPassword"
		), ():void => {
			const target:CS[ "hashedPassword" ] = "https://carbonldp.com/ns/v1/security#hashedPassword";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"immediateDescendantsACEntry",
			"https://carbonldp.com/ns/v1/security#immediateDescendantsACEntry"
		), ():void => {
			const target:CS[ "immediateDescendantsACEntry" ] = "https://carbonldp.com/ns/v1/security#immediateDescendantsACEntry";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"inheritanceDisabledBy",
			"https://carbonldp.com/ns/v1/security#inheritanceDisabledBy"
		), ():void => {
			const target:CS[ "inheritanceDisabledBy" ] = "https://carbonldp.com/ns/v1/security#inheritanceDisabledBy";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"inherits",
			"https://carbonldp.com/ns/v1/security#inherits"
		), ():void => {
			const target:CS[ "inherits" ] = "https://carbonldp.com/ns/v1/security#inherits";
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
			"owner",
			"https://carbonldp.com/ns/v1/security#owner"
		), ():void => {
			const target:CS[ "owner" ] = "https://carbonldp.com/ns/v1/security#owner";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"parentRole",
			"https://carbonldp.com/ns/v1/security#parentRole"
		), ():void => {
			const target:CS[ "parentRole" ] = "https://carbonldp.com/ns/v1/security#parentRole";
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
			"passwordSecret",
			"https://carbonldp.com/ns/v1/security#passwordSecret"
		), ():void => {
			const target:CS[ "passwordSecret" ] = "https://carbonldp.com/ns/v1/security#passwordSecret";
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
			"permissionReport",
			"https://carbonldp.com/ns/v1/security#permissionReport"
		), ():void => {
			const target:CS[ "permissionReport" ] = "https://carbonldp.com/ns/v1/security#permissionReport";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"protectedDocument",
			"https://carbonldp.com/ns/v1/security#protectedDocument"
		), ():void => {
			const target:CS[ "protectedDocument" ] = "https://carbonldp.com/ns/v1/security#protectedDocument";
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
			"subjectReport",
			"https://carbonldp.com/ns/v1/security#subjectReport"
		), ():void => {
			const target:CS[ "subjectReport" ] = "https://carbonldp.com/ns/v1/security#subjectReport";
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
			expect( Object.keys( CS ).length ).toBe( 80 );
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

		it( "CS.AddMember", ():void => {
			expect( CS.AddMember ).toEqual( jasmine.any( String ) );
			expect( CS.AddMember ).toBe( "https://carbonldp.com/ns/v1/security#AddMember" );
		} );

		it( "CS.AllDescendantsACEntry", ():void => {
			expect( CS.AllDescendantsACEntry ).toEqual( jasmine.any( String ) );
			expect( CS.AllDescendantsACEntry ).toBe( "https://carbonldp.com/ns/v1/security#AllDescendantsACEntry" );
		} );

		it( "CS.AllOrigins", ():void => {
			expect( CS.AllOrigins ).toEqual( jasmine.any( String ) );
			expect( CS.AllOrigins ).toBe( "https://carbonldp.com/ns/v1/security#AllOrigins" );
		} );

		it( "CS.AnonymousUser", ():void => {
			expect( CS.AnonymousUser ).toEqual( jasmine.any( String ) );
			expect( CS.AnonymousUser ).toBe( "https://carbonldp.com/ns/v1/security#AnonymousUser" );
		} );

		it( "CS.AuthenticatedUser", ():void => {
			expect( CS.AuthenticatedUser ).toEqual( jasmine.any( String ) );
			expect( CS.AuthenticatedUser ).toBe( "https://carbonldp.com/ns/v1/security#AuthenticatedUser" );
		} );

		it( "CS.AuthenticatedUserInformationAccessor", ():void => {
			expect( CS.AuthenticatedUserInformationAccessor ).toEqual( jasmine.any( String ) );
			expect( CS.AuthenticatedUserInformationAccessor ).toBe( "https://carbonldp.com/ns/v1/security#AuthenticatedUserInformationAccessor" );
		} );

		it( "CS.AuthenticatedUserMetadata", ():void => {
			expect( CS.AuthenticatedUserMetadata ).toEqual( jasmine.any( String ) );
			expect( CS.AuthenticatedUserMetadata ).toBe( "https://carbonldp.com/ns/v1/security#AuthenticatedUserMetadata" );
		} );

		it( "CS.CompleteACReport", ():void => {
			expect( CS.CompleteACReport ).toEqual( jasmine.any( String ) );
			expect( CS.CompleteACReport ).toBe( "https://carbonldp.com/ns/v1/security#CompleteACReport" );
		} );

		it( "CS.ControlAccess", ():void => {
			expect( CS.ControlAccess ).toEqual( jasmine.any( String ) );
			expect( CS.ControlAccess ).toBe( "https://carbonldp.com/ns/v1/security#ControlAccess" );
		} );

		it( "CS.CreateAccessPoint", ():void => {
			expect( CS.CreateAccessPoint ).toEqual( jasmine.any( String ) );
			expect( CS.CreateAccessPoint ).toBe( "https://carbonldp.com/ns/v1/security#CreateAccessPoint" );
		} );

		it( "CS.CreateChild", ():void => {
			expect( CS.CreateChild ).toEqual( jasmine.any( String ) );
			expect( CS.CreateChild ).toBe( "https://carbonldp.com/ns/v1/security#CreateChild" );
		} );

		it( "CS.Creator", ():void => {
			expect( CS.Creator ).toEqual( jasmine.any( String ) );
			expect( CS.Creator ).toBe( "https://carbonldp.com/ns/v1/security#Creator" );
		} );

		it( "CS.Credentials", ():void => {
			expect( CS.Credentials ).toEqual( jasmine.any( String ) );
			expect( CS.Credentials ).toBe( "https://carbonldp.com/ns/v1/security#Credentials" );
		} );

		it( "CS.CredentialSet", ():void => {
			expect( CS.CredentialSet ).toEqual( jasmine.any( String ) );
			expect( CS.CredentialSet ).toBe( "https://carbonldp.com/ns/v1/security#CredentialSet" );
		} );

		it( "CS.Delete", ():void => {
			expect( CS.Delete ).toEqual( jasmine.any( String ) );
			expect( CS.Delete ).toBe( "https://carbonldp.com/ns/v1/security#Delete" );
		} );

		it( "CS.DetailedUserACReport", ():void => {
			expect( CS.DetailedUserACReport ).toEqual( jasmine.any( String ) );
			expect( CS.DetailedUserACReport ).toBe( "https://carbonldp.com/ns/v1/security#DetailedUserACReport" );
		} );

		it( "CS.DirectACEntry", ():void => {
			expect( CS.DirectACEntry ).toEqual( jasmine.any( String ) );
			expect( CS.DirectACEntry ).toBe( "https://carbonldp.com/ns/v1/security#DirectACEntry" );
		} );

		it( "CS.GrantingStep", ():void => {
			expect( CS.GrantingStep ).toEqual( jasmine.any( String ) );
			expect( CS.GrantingStep ).toBe( "https://carbonldp.com/ns/v1/security#GrantingStep" );
		} );

		it( "CS.ImmediateDescendantsACEntry", ():void => {
			expect( CS.ImmediateDescendantsACEntry ).toEqual( jasmine.any( String ) );
			expect( CS.ImmediateDescendantsACEntry ).toBe( "https://carbonldp.com/ns/v1/security#ImmediateDescendantsACEntry" );
		} );

		it( "CS.Impersonate", ():void => {
			expect( CS.Impersonate ).toEqual( jasmine.any( String ) );
			expect( CS.Impersonate ).toBe( "https://carbonldp.com/ns/v1/security#Impersonate" );
		} );

		it( "CS.LDAPCredentials", ():void => {
			expect( CS.LDAPCredentials ).toEqual( jasmine.any( String ) );
			expect( CS.LDAPCredentials ).toBe( "https://carbonldp.com/ns/v1/security#LDAPCredentials" );
		} );

		it( "CS.Owner", ():void => {
			expect( CS.Owner ).toEqual( jasmine.any( String ) );
			expect( CS.Owner ).toBe( "https://carbonldp.com/ns/v1/security#Owner" );
		} );

		it( "CS.PasswordSecret", ():void => {
			expect( CS.PasswordSecret ).toEqual( jasmine.any( String ) );
			expect( CS.PasswordSecret ).toBe( "https://carbonldp.com/ns/v1/security#PasswordSecret" );
		} );

		it( "CS.PermissionReport", ():void => {
			expect( CS.PermissionReport ).toEqual( jasmine.any( String ) );
			expect( CS.PermissionReport ).toBe( "https://carbonldp.com/ns/v1/security#PermissionReport" );
		} );

		it( "CS.PreferAuthToken", ():void => {
			expect( CS.PreferAuthToken ).toEqual( jasmine.any( String ) );
			expect( CS.PreferAuthToken ).toBe( "https://carbonldp.com/ns/v1/security#PreferAuthToken" );
		} );

		it( "CS.PreferCompleteACReport", ():void => {
			expect( CS.PreferCompleteACReport ).toEqual( jasmine.any( String ) );
			expect( CS.PreferCompleteACReport ).toBe( "https://carbonldp.com/ns/v1/security#PreferCompleteACReport" );
		} );

		it( "CS.PreferDetailedUserACReport", ():void => {
			expect( CS.PreferDetailedUserACReport ).toEqual( jasmine.any( String ) );
			expect( CS.PreferDetailedUserACReport ).toBe( "https://carbonldp.com/ns/v1/security#PreferDetailedUserACReport" );
		} );

		it( "CS.PreferSimpleUserACReport", ():void => {
			expect( CS.PreferSimpleUserACReport ).toEqual( jasmine.any( String ) );
			expect( CS.PreferSimpleUserACReport ).toBe( "https://carbonldp.com/ns/v1/security#PreferSimpleUserACReport" );
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

		it( "CS.SimpleUserACReport", ():void => {
			expect( CS.SimpleUserACReport ).toEqual( jasmine.any( String ) );
			expect( CS.SimpleUserACReport ).toBe( "https://carbonldp.com/ns/v1/security#SimpleUserACReport" );
		} );

		it( "CS.SubjectReport", ():void => {
			expect( CS.SubjectReport ).toEqual( jasmine.any( String ) );
			expect( CS.SubjectReport ).toBe( "https://carbonldp.com/ns/v1/security#SubjectReport" );
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

		it( "CS.User", ():void => {
			expect( CS.User ).toEqual( jasmine.any( String ) );
			expect( CS.User ).toBe( "https://carbonldp.com/ns/v1/security#User" );
		} );

		it( "CS.UsernameAndPasswordCredentials", ():void => {
			expect( CS.UsernameAndPasswordCredentials ).toEqual( jasmine.any( String ) );
			expect( CS.UsernameAndPasswordCredentials ).toBe( "https://carbonldp.com/ns/v1/security#UsernameAndPasswordCredentials" );
		} );


		it( "CS.accessControlList", ():void => {
			expect( CS.accessControlList ).toEqual( jasmine.any( String ) );
			expect( CS.accessControlList ).toBe( "https://carbonldp.com/ns/v1/security#accessControlList" );
		} );

		it( "CS.allDescendantsACEntry", ():void => {
			expect( CS.allDescendantsACEntry ).toEqual( jasmine.any( String ) );
			expect( CS.allDescendantsACEntry ).toBe( "https://carbonldp.com/ns/v1/security#allDescendantsACEntry" );
		} );

		it( "CS.allowsOrigin", ():void => {
			expect( CS.allowsOrigin ).toEqual( jasmine.any( String ) );
			expect( CS.allowsOrigin ).toBe( "https://carbonldp.com/ns/v1/security#allowsOrigin" );
		} );

		it( "CS.applied", ():void => {
			expect( CS.applied ).toEqual( jasmine.any( String ) );
			expect( CS.applied ).toBe( "https://carbonldp.com/ns/v1/security#applied" );
		} );

		it( "CS.appliedBy", ():void => {
			expect( CS.appliedBy ).toEqual( jasmine.any( String ) );
			expect( CS.appliedBy ).toBe( "https://carbonldp.com/ns/v1/security#appliedBy" );
		} );

		it( "CS.authToken", ():void => {
			expect( CS.authToken ).toEqual( jasmine.any( String ) );
			expect( CS.authToken ).toBe( "https://carbonldp.com/ns/v1/security#authToken" );
		} );

		it( "CS.authenticatedUserMetadata", ():void => {
			expect( CS.authenticatedUserMetadata ).toEqual( jasmine.any( String ) );
			expect( CS.authenticatedUserMetadata ).toBe( "https://carbonldp.com/ns/v1/security#authenticatedUserMetadata" );
		} );

		it( "CS.childRole", ():void => {
			expect( CS.childRole ).toEqual( jasmine.any( String ) );
			expect( CS.childRole ).toBe( "https://carbonldp.com/ns/v1/security#childRole" );
		} );

		it( "CS.creator", ():void => {
			expect( CS.creator ).toEqual( jasmine.any( String ) );
			expect( CS.creator ).toBe( "https://carbonldp.com/ns/v1/security#creator" );
		} );

		it( "CS.credentials", ():void => {
			expect( CS.credentials ).toEqual( jasmine.any( String ) );
			expect( CS.credentials ).toBe( "https://carbonldp.com/ns/v1/security#credentials" );
		} );

		it( "CS.credentialSet", ():void => {
			expect( CS.credentialSet ).toEqual( jasmine.any( String ) );
			expect( CS.credentialSet ).toBe( "https://carbonldp.com/ns/v1/security#credentialSet" );
		} );

		it( "CS.description", ():void => {
			expect( CS.description ).toEqual( jasmine.any( String ) );
			expect( CS.description ).toBe( "https://carbonldp.com/ns/v1/security#description" );
		} );

		it( "CS.directACEntry", ():void => {
			expect( CS.directACEntry ).toEqual( jasmine.any( String ) );
			expect( CS.directACEntry ).toBe( "https://carbonldp.com/ns/v1/security#directACEntry" );
		} );

		it( "CS.expires", ():void => {
			expect( CS.expires ).toEqual( jasmine.any( String ) );
			expect( CS.expires ).toBe( "https://carbonldp.com/ns/v1/security#expires" );
		} );

		it( "CS.forIRI", ():void => {
			expect( CS.forIRI ).toEqual( jasmine.any( String ) );
			expect( CS.forIRI ).toBe( "https://carbonldp.com/ns/v1/security#forIRI" );
		} );

		it( "CS.granted", ():void => {
			expect( CS.granted ).toEqual( jasmine.any( String ) );
			expect( CS.granted ).toBe( "https://carbonldp.com/ns/v1/security#granted" );
		} );

		it( "CS.grantingChain", ():void => {
			expect( CS.grantingChain ).toEqual( jasmine.any( String ) );
			expect( CS.grantingChain ).toBe( "https://carbonldp.com/ns/v1/security#grantingChain" );
		} );

		it( "CS.hashedPassword", ():void => {
			expect( CS.hashedPassword ).toEqual( jasmine.any( String ) );
			expect( CS.hashedPassword ).toBe( "https://carbonldp.com/ns/v1/security#hashedPassword" );
		} );

		it( "CS.immediateDescendantsACEntry", ():void => {
			expect( CS.immediateDescendantsACEntry ).toEqual( jasmine.any( String ) );
			expect( CS.immediateDescendantsACEntry ).toBe( "https://carbonldp.com/ns/v1/security#immediateDescendantsACEntry" );
		} );

		it( "CS.inheritanceDisabledBy", ():void => {
			expect( CS.inheritanceDisabledBy ).toEqual( jasmine.any( String ) );
			expect( CS.inheritanceDisabledBy ).toBe( "https://carbonldp.com/ns/v1/security#inheritanceDisabledBy" );
		} );

		it( "CS.inherits", ():void => {
			expect( CS.inherits ).toEqual( jasmine.any( String ) );
			expect( CS.inherits ).toBe( "https://carbonldp.com/ns/v1/security#inherits" );
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

		it( "CS.owner", ():void => {
			expect( CS.owner ).toEqual( jasmine.any( String ) );
			expect( CS.owner ).toBe( "https://carbonldp.com/ns/v1/security#owner" );
		} );

		it( "CS.parentRole", ():void => {
			expect( CS.parentRole ).toEqual( jasmine.any( String ) );
			expect( CS.parentRole ).toBe( "https://carbonldp.com/ns/v1/security#parentRole" );
		} );

		it( "CS.password", ():void => {
			expect( CS.password ).toEqual( jasmine.any( String ) );
			expect( CS.password ).toBe( "https://carbonldp.com/ns/v1/security#password" );
		} );

		it( "CS.passwordSecret", ():void => {
			expect( CS.passwordSecret ).toEqual( jasmine.any( String ) );
			expect( CS.passwordSecret ).toBe( "https://carbonldp.com/ns/v1/security#passwordSecret" );
		} );

		it( "CS.permission", ():void => {
			expect( CS.permission ).toEqual( jasmine.any( String ) );
			expect( CS.permission ).toBe( "https://carbonldp.com/ns/v1/security#permission" );
		} );

		it( "CS.permissionReport", ():void => {
			expect( CS.permissionReport ).toEqual( jasmine.any( String ) );
			expect( CS.permissionReport ).toBe( "https://carbonldp.com/ns/v1/security#permissionReport" );
		} );

		it( "CS.protectedDocument", ():void => {
			expect( CS.protectedDocument ).toEqual( jasmine.any( String ) );
			expect( CS.protectedDocument ).toBe( "https://carbonldp.com/ns/v1/security#protectedDocument" );
		} );

		it( "CS.rootContainer", ():void => {
			expect( CS.rootContainer ).toEqual( jasmine.any( String ) );
			expect( CS.rootContainer ).toBe( "https://carbonldp.com/ns/v1/security#rootContainer" );
		} );

		it( "CS.subject", ():void => {
			expect( CS.subject ).toEqual( jasmine.any( String ) );
			expect( CS.subject ).toBe( "https://carbonldp.com/ns/v1/security#subject" );
		} );

		it( "CS.subjectReport", ():void => {
			expect( CS.subjectReport ).toEqual( jasmine.any( String ) );
			expect( CS.subjectReport ).toBe( "https://carbonldp.com/ns/v1/security#subjectReport" );
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
