import {
	STATIC,

	module,
	clazz,

	isDefined,
	hasProperty,
} from "./../test/JasmineExtender";
import * as Utils from "./../Utils";

import * as CS from "./CS";

describe( module(
	"Carbon/NS/CS"
), ():void => {

	it( isDefined(), ():void => {
		expect( CS ).toBeDefined();
		expect( Utils.isObject( CS ) ).toBe( true );
	} );

	it( hasProperty(
		STATIC,
		"namespace",
		"string"
	), ():void => {
		expect( CS.namespace ).toBeDefined();
		expect( Utils.isString( CS.namespace ) ).toBe( true );

		expect( CS.namespace ).toBe( "https://carbonldp.com/ns/v1/security#" );
	} );

	describe( clazz(
		"Carbon.NS.CS.Class",
		"Class that contains classes defined by Carbon Security."
	), ():void => {

		it( isDefined(), ():void => {
			expect( CS.Class ).toBeDefined();
			expect( Utils.isFunction( CS.Class ) ).toBe( true );
			expect( Object.keys( CS.Class ).length ).toBe( 19 );
		} );

		it( hasProperty(
			STATIC,
			"AccessControlEntry",
			"string"
		), ():void => {
			expect( CS.Class.AccessControlEntry ).toBeDefined();
			expect( Utils.isString( CS.Class.AccessControlEntry ) ).toBe( true );

			expect( CS.Class.AccessControlEntry ).toBe( "https://carbonldp.com/ns/v1/security#AccessControlEntry" );
		} );

		it( hasProperty(
			STATIC,
			"AccessControlList",
			"string"
		), ():void => {
			expect( CS.Class.AccessControlList ).toBeDefined();
			expect( Utils.isString( CS.Class.AccessControlList ) ).toBe( true );

			expect( CS.Class.AccessControlList ).toBe( "https://carbonldp.com/ns/v1/security#AccessControlList" );
		} );

		it( hasProperty(
			STATIC,
			"AddMember",
			"string"
		), ():void => {
			expect( CS.Class.AddMember ).toBeDefined();
			expect( Utils.isString( CS.Class.AddMember ) ).toBe( true );

			expect( CS.Class.AddMember ).toBe( "https://carbonldp.com/ns/v1/security#AddMember" );
		} );

		it( hasProperty(
			STATIC,
			"Agent",
			"string"
		), ():void => {
			expect( CS.Class.Agent ).toBeDefined();
			expect( Utils.isString( CS.Class.Agent ) ).toBe( true );

			expect( CS.Class.Agent ).toBe( "https://carbonldp.com/ns/v1/security#Agent" );
		} );

		it( hasProperty(
			STATIC,
			"AllOrigins",
			"string"
		), ():void => {
			expect( CS.Class.Agent ).toBeDefined();
			expect( Utils.isString( CS.Class.Agent ) ).toBe( true );

			expect( CS.Class.Agent ).toBe( "https://carbonldp.com/ns/v1/security#Agent" );
		} );

		it( hasProperty(
			STATIC,
			"CreateAccessPoint",
			"string"
		), ():void => {
			expect( CS.Class.CreateAccessPoint ).toBeDefined();
			expect( Utils.isString( CS.Class.CreateAccessPoint ) ).toBe( true );

			expect( CS.Class.CreateAccessPoint ).toBe( "https://carbonldp.com/ns/v1/security#CreateAccessPoint" );
		} );

		it( hasProperty(
			STATIC,
			"CreateChild",
			"string"
		), ():void => {
			expect( CS.Class.CreateChild ).toBeDefined();
			expect( Utils.isString( CS.Class.CreateChild ) ).toBe( true );

			expect( CS.Class.CreateChild ).toBe( "https://carbonldp.com/ns/v1/security#CreateChild" );
		} );

		it( hasProperty(
			STATIC,
			"Delete",
			"string"
		), ():void => {
			expect( CS.Class.Delete ).toBeDefined();
			expect( Utils.isString( CS.Class.Delete ) ).toBe( true );

			expect( CS.Class.Delete ).toBe( "https://carbonldp.com/ns/v1/security#Delete" );
		} );

		it( hasProperty(
			STATIC,
			"Download",
			"string"
		), ():void => {
			expect( CS.Class.Download ).toBeDefined();
			expect( Utils.isString( CS.Class.Download ) ).toBe( true );

			expect( CS.Class.Download ).toBe( "https://carbonldp.com/ns/v1/security#Download" );
		} );

		it( hasProperty(
			STATIC,
			"Extend",
			"string"
		), ():void => {
			expect( CS.Class.Extend ).toBeDefined();
			expect( Utils.isString( CS.Class.Extend ) ).toBe( true );

			expect( CS.Class.Extend ).toBe( "https://carbonldp.com/ns/v1/security#Extend" );
		} );

		it( hasProperty(
			STATIC,
			"ManageSecurity",
			"string"
		), ():void => {
			expect( CS.Class.ManageSecurity ).toBeDefined();
			expect( Utils.isString( CS.Class.ManageSecurity ) ).toBe( true );

			expect( CS.Class.ManageSecurity ).toBe( "https://carbonldp.com/ns/v1/security#ManageSecurity" );
		} );

		it( hasProperty(
			STATIC,
			"ProtectedDocument",
			"string"
		), ():void => {
			expect( CS.Class.ProtectedDocument ).toBeDefined();
			expect( Utils.isString( CS.Class.ProtectedDocument ) ).toBe( true );

			expect( CS.Class.ProtectedDocument ).toBe( "https://carbonldp.com/ns/v1/security#ProtectedDocument" );
		} );

		it( hasProperty(
			STATIC,
			"Read",
			"string"
		), ():void => {
			expect( CS.Class.Read ).toBeDefined();
			expect( Utils.isString( CS.Class.Read ) ).toBe( true );

			expect( CS.Class.Read ).toBe( "https://carbonldp.com/ns/v1/security#Read" );
		} );

		it( hasProperty(
			STATIC,
			"RemoveMember",
			"string"
		), ():void => {
			expect( CS.Class.RemoveMember ).toBeDefined();
			expect( Utils.isString( CS.Class.RemoveMember ) ).toBe( true );

			expect( CS.Class.RemoveMember ).toBe( "https://carbonldp.com/ns/v1/security#RemoveMember" );
		} );

		it( hasProperty(
			STATIC,
			"Role",
			"string"
		), ():void => {
			expect( CS.Class.Role ).toBeDefined();
			expect( Utils.isString( CS.Class.Role ) ).toBe( true );

			expect( CS.Class.Role ).toBe( "https://carbonldp.com/ns/v1/security#Role" );
		} );

		it( hasProperty(
			STATIC,
			"Ticket",
			"string"
		), ():void => {
			expect( CS.Class.Ticket ).toBeDefined();
			expect( Utils.isString( CS.Class.Ticket ) ).toBe( true );

			expect( CS.Class.Ticket ).toBe( "https://carbonldp.com/ns/v1/security#Ticket" );
		} );

		it( hasProperty(
			STATIC,
			"Token",
			"string"
		), ():void => {
			expect( CS.Class.Token ).toBeDefined();
			expect( Utils.isString( CS.Class.Token ) ).toBe( true );

			expect( CS.Class.Token ).toBe( "https://carbonldp.com/ns/v1/security#Token" );
		} );

		it( hasProperty(
			STATIC,
			"Update",
			"string"
		), ():void => {
			expect( CS.Class.Update ).toBeDefined();
			expect( Utils.isString( CS.Class.Update ) ).toBe( true );

			expect( CS.Class.Update ).toBe( "https://carbonldp.com/ns/v1/security#Update" );
		} );

		it( hasProperty(
			STATIC,
			"Upload",
			"string"
		), ():void => {
			expect( CS.Class.Upload ).toBeDefined();
			expect( Utils.isString( CS.Class.Upload ) ).toBe( true );

			expect( CS.Class.Upload ).toBe( "https://carbonldp.com/ns/v1/security#Upload" );
		} );

	} );

	describe( clazz(
		"Carbon.NS.CS.Predicate",
		"Class that contains predicates defined by Carbon Security."
	), ():void => {

		it( isDefined(), ():void => {
			expect( CS.Predicate ).toBeDefined();
			expect( Utils.isFunction( CS.Predicate ) ).toBe( true );

			expect( Object.keys( CS.Predicate ).length ).toBe( 22 );
		} );

		it( hasProperty(
			STATIC,
			"accessControlEntry",
			"string"
		), ():void => {
			expect( CS.Predicate.accessControlEntry ).toBeDefined();
			expect( Utils.isString( CS.Predicate.accessControlEntry ) ).toBe( true );

			expect( CS.Predicate.accessControlEntry ).toBe( "https://carbonldp.com/ns/v1/security#accessControlEntry" );
		} );

		it( hasProperty(
			STATIC,
			"accessControlList",
			"string"
		), ():void => {
			expect( CS.Predicate.accessControlList ).toBeDefined();
			expect( Utils.isString( CS.Predicate.accessControlList ) ).toBe( true );

			expect( CS.Predicate.accessControlList ).toBe( "https://carbonldp.com/ns/v1/security#accessControlList" );
		} );

		it( hasProperty(
			STATIC,
			"accessTo",
			"string"
		), ():void => {
			expect( CS.Predicate.accessTo ).toBeDefined();
			expect( Utils.isString( CS.Predicate.accessTo ) ).toBe( true );

			expect( CS.Predicate.accessTo ).toBe( "https://carbonldp.com/ns/v1/security#accessTo" );
		} );

		it( hasProperty(
			STATIC,
			"agent",
			"string"
		), ():void => {
			expect( CS.Predicate.agent ).toBeDefined();
			expect( Utils.isString( CS.Predicate.agent ) ).toBe( true );

			expect( CS.Predicate.agent ).toBe( "https://carbonldp.com/ns/v1/security#agent" );
		} );

		it( hasProperty(
			STATIC,
			"allowsOrigin",
			"string"
		), ():void => {
			expect( CS.Predicate.allowsOrigin ).toBeDefined();
			expect( Utils.isString( CS.Predicate.allowsOrigin ) ).toBe( true );

			expect( CS.Predicate.allowsOrigin ).toBe( "https://carbonldp.com/ns/v1/security#allowsOrigin" );
		} );

		it( hasProperty(
			STATIC,
			"childRole",
			"string"
		), ():void => {
			expect( CS.Predicate.childRole ).toBeDefined();
			expect( Utils.isString( CS.Predicate.childRole ) ).toBe( true );

			expect( CS.Predicate.childRole ).toBe( "https://carbonldp.com/ns/v1/security#childRole" );
		} );

		it( hasProperty(
			STATIC,
			"credentialsOf",
			"string"
		), ():void => {
			expect( CS.Predicate.credentialsOf ).toBeDefined();
			expect( Utils.isString( CS.Predicate.credentialsOf ) ).toBe( true );

			expect( CS.Predicate.credentialsOf ).toBe( "https://carbonldp.com/ns/v1/security#credentialsOf" );
		} );

		it( hasProperty(
			STATIC,
			"description",
			"string"
		), ():void => {
			expect( CS.Predicate.description ).toBeDefined();
			expect( Utils.isString( CS.Predicate.description ) ).toBe( true );

			expect( CS.Predicate.description ).toBe( "https://carbonldp.com/ns/v1/security#description" );
		} );

		it( hasProperty(
			STATIC,
			"enabled",
			"string"
		), ():void => {
			expect( CS.Predicate.enabled ).toBeDefined();
			expect( Utils.isString( CS.Predicate.enabled ) ).toBe( true );

			expect( CS.Predicate.enabled ).toBe( "https://carbonldp.com/ns/v1/security#enabled" );
		} );

		it( hasProperty(
			STATIC,
			"expirationTime",
			"string"
		), ():void => {
			expect( CS.Predicate.expirationTime ).toBeDefined();
			expect( Utils.isString( CS.Predicate.expirationTime ) ).toBe( true );

			expect( CS.Predicate.expirationTime ).toBe( "https://carbonldp.com/ns/v1/security#expirationTime" );
		} );

		it( hasProperty(
			STATIC,
			"forIRI",
			"string"
		), ():void => {
			expect( CS.Predicate.forIRI ).toBeDefined();
			expect( Utils.isString( CS.Predicate.forIRI ) ).toBe( true );

			expect( CS.Predicate.forIRI ).toBe( "https://carbonldp.com/ns/v1/security#forIRI" );
		} );

		it( hasProperty(
			STATIC,
			"granting",
			"string"
		), ():void => {
			expect( CS.Predicate.granting ).toBeDefined();
			expect( Utils.isString( CS.Predicate.granting ) ).toBe( true );

			expect( CS.Predicate.granting ).toBe( "https://carbonldp.com/ns/v1/security#granting" );
		} );

		it( hasProperty(
			STATIC,
			"inheritableEntry",
			"string"
		), ():void => {
			expect( CS.Predicate.inheritableEntry ).toBeDefined();
			expect( Utils.isString( CS.Predicate.inheritableEntry ) ).toBe( true );

			expect( CS.Predicate.inheritableEntry ).toBe( "https://carbonldp.com/ns/v1/security#inheritableEntry" );
		} );

		it( hasProperty(
			STATIC,
			"namae",
			"string"
		), ():void => {
			expect( CS.Predicate.namae ).toBeDefined();
			expect( Utils.isString( CS.Predicate.namae ) ).toBe( true );

			expect( CS.Predicate.namae ).toBe( "https://carbonldp.com/ns/v1/security#name" );
		} );

		it( hasProperty(
			STATIC,
			"parentRole",
			"string"
		), ():void => {
			expect( CS.Predicate.parentRole ).toBeDefined();
			expect( Utils.isString( CS.Predicate.parentRole ) ).toBe( true );

			expect( CS.Predicate.parentRole ).toBe( "https://carbonldp.com/ns/v1/security#parentRole" );
		} );

		it( hasProperty(
			STATIC,
			"password",
			"string"
		), ():void => {
			expect( CS.Predicate.password ).toBeDefined();
			expect( Utils.isString( CS.Predicate.password ) ).toBe( true );

			expect( CS.Predicate.password ).toBe( "https://carbonldp.com/ns/v1/security#password" );
		} );

		it( hasProperty(
			STATIC,
			"permission",
			"string"
		), ():void => {
			expect( CS.Predicate.permission ).toBeDefined();
			expect( Utils.isString( CS.Predicate.permission ) ).toBe( true );

			expect( CS.Predicate.permission ).toBe( "https://carbonldp.com/ns/v1/security#permission" );
		} );

		it( hasProperty(
			STATIC,
			"rootContainer",
			"string"
		), ():void => {
			expect( CS.Predicate.rootContainer ).toBeDefined();
			expect( Utils.isString( CS.Predicate.rootContainer ) ).toBe( true );

			expect( CS.Predicate.rootContainer ).toBe( "https://carbonldp.com/ns/v1/security#rootContainer" );
		} );

		it( hasProperty(
			STATIC,
			"subject",
			"string"
		), ():void => {
			expect( CS.Predicate.subject ).toBeDefined();
			expect( Utils.isString( CS.Predicate.subject ) ).toBe( true );

			expect( CS.Predicate.subject ).toBe( "https://carbonldp.com/ns/v1/security#subject" );
		} );

		it( hasProperty(
			STATIC,
			"subjectClass",
			"string"
		), ():void => {
			expect( CS.Predicate.subjectClass ).toBeDefined();
			expect( Utils.isString( CS.Predicate.subjectClass ) ).toBe( true );

			expect( CS.Predicate.subjectClass ).toBe( "https://carbonldp.com/ns/v1/security#subjectClass" );
		} );

		it( hasProperty(
			STATIC,
			"ticketKey",
			"string"
		), ():void => {
			expect( CS.Predicate.ticketKey ).toBeDefined();
			expect( Utils.isString( CS.Predicate.ticketKey ) ).toBe( true );

			expect( CS.Predicate.ticketKey ).toBe( "https://carbonldp.com/ns/v1/security#ticketKey" );
		} );

		it( hasProperty(
			STATIC,
			"tokenKey",
			"string"
		), ():void => {
			expect( CS.Predicate.tokenKey ).toBeDefined();
			expect( Utils.isString( CS.Predicate.tokenKey ) ).toBe( true );

			expect( CS.Predicate.tokenKey ).toBe( "https://carbonldp.com/ns/v1/security#tokenKey" );
		} );

	} );

} );
