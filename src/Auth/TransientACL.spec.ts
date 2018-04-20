import { TransientDocument } from "../TransientDocument";
import { Documents } from "../Documents";
import { TransientFragment } from "../TransientFragment";
import { Document } from "../Document";
import { Pointer } from "../Pointer";
import {
	extendsClass,
	hasMethod,
	hasProperty,
	hasSignature,
	interfaze,
	isDefined,
	method,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC,
} from "../test/JasmineExtender";
import { CS } from "../Vocabularies/CS";
import * as Utils from "./../Utils";
import { TransientACE } from "./TransientACE";

import { TransientACL } from "./TransientACL";

describe( module( "carbonldp/Auth/TransientACL" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.TransientACL",
		"Interface that represents an in-memory Access Control List (ACL)."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientDocument" ), ():void => {
			let acl:TransientACL = <any> {};
			let fragment:TransientDocument;

			fragment = acl;
			expect( fragment ).toEqual( jasmine.any( Object ) );
		} );

		it( hasProperty(
			OBLIGATORY,
			"accessTo",
			"CarbonLDP.Pointer",
			"Reference to the document the ACL belongs."
		), ():void => {
			let document:Pointer = Pointer.create();
			let acl:TransientACL = <any> {};

			acl.accessTo = document;
			expect( Pointer.is( acl.accessTo ) ).toBe( true );
		} );

		it( hasProperty(
			OPTIONAL,
			"entries",
			"CarbonLDP.Auth.TransientACE[]",
			"Array of ACEs that only grants or denies permissions of the document the ACL belongs."
		), ():void => {
			let entries:TransientACE[] = [ <any> {} ];
			let acl:TransientACL = <any> {};

			acl.entries = entries;
			expect( acl.entries ).toEqual( jasmine.any( Array ) );
			expect( acl.entries[ 0 ] ).toEqual( jasmine.any( Object ) );
		} );

		it( hasProperty(
			OPTIONAL,
			"inheritableEntries",
			"CarbonLDP.Auth.TransientACE[]",
			"Array of ACEs that grants or denies permissions of the document's children the ACL belongs."
		), ():void => {
			let inheritableEntries:TransientACE[] = [ <any> {} ];
			let acl:TransientACL = <any> {};

			acl.inheritableEntries = inheritableEntries;
			expect( acl.inheritableEntries ).toEqual( jasmine.any( Array ) );
			expect( acl.inheritableEntries[ 0 ] ).toEqual( jasmine.any( Object ) );
		} );

		it( hasMethod(
			OBLIGATORY,
			"_parsePointer",
			"(Internal) Function that parse string URIs to pointers.", [
				{ name: "element", type: "string | CarbonLDP.Pointer", description: "The URI string o pointer to convert into pointer." },
			],
			{ type: "CarbonLDP.Pointer" }
		), ():void => {
			let parsePointer:( element:string | Pointer ) => Pointer = <any> new Function();
			let acl:TransientACL = <any> {};

			acl._parsePointer = parsePointer;
			expect( acl._parsePointer ).toEqual( jasmine.any( Function ) );
		} );

		describe( method( OBLIGATORY, "grant" ), ():void => {

			it( hasSignature(
				"Grant the permission specified to the subject provided for the document related to the ACL.", [
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject which will be assigned the permission specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subject provided." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission that will be granted to the subject specified." },
				]
			), ():void => {} );

			it( hasSignature(
				"Grant several permissions to the subject provided for the document related to the ACL.", [
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject which will be assigned the permission specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subject provided." },
					{ name: "permissions", type: "(string | CarbonLDP.Pointer)[]", description: "The permissions that will be granted to the subject specified." },
				]
			), ():void => {} );

			it( hasSignature(
				"Grant the permission specified to the every subject provided for the document related to the ACL.", [
					{ name: "subjects", type: "(string | CarbonLDP.Pointer)[]", description: "The subjects which will be assigned the every permissions specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subjects provided." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission that will be granted to the every subject." },
				]
			), ():void => {} );

			it( hasSignature(
				"Grant several permissions to the every subject provided for the document related to the ACL.", [
					{ name: "subjects", type: "(string | CarbonLDP.Pointer)[]", description: "The subjects which will be assigned the every permissions specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subjects provided." },
					{ name: "permissions", type: "(string | CarbonLDP.Pointer)[]", description: "The permissions that will be granted to the every subject." },
				]
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "deny" ), ():void => {

			it( hasSignature(
				"Grant the permission specified to the subject provided for the document related to the ACL.", [
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject which will be assigned the permission specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subject provided." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission that will be granted to the subject specified." },
				]
			), ():void => {} );

			it( hasSignature(
				"Grant several permissions to the subject provided for the document related to the ACL.", [
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject which will be assigned the permission specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subject provided." },
					{ name: "permissions", type: "(string | CarbonLDP.Pointer)[]", description: "The permissions that will be granted to the subject specified." },
				]
			), ():void => {} );

			it( hasSignature(
				"Grant the permission specified to the every subject provided for the document related to the ACL.", [
					{ name: "subjects", type: "(string | CarbonLDP.Pointer)[]", description: "The subjects which will be assigned the every permissions specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subjects provided." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission that will be granted to the every subject." },
				]
			), ():void => {} );

			it( hasSignature(
				"Grant several permissions to the every subject provided for the document related to the ACL.", [
					{ name: "subjects", type: "(string | CarbonLDP.Pointer)[]", description: "The subjects which will be assigned the every permissions specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subjects provided." },
					{ name: "permissions", type: "(string | CarbonLDP.Pointer)[]", description: "The permissions that will be granted to the every subject." },
				]
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "configureChildInheritance" ), ():void => {

			it( hasSignature(
				"Configures the permission specified to the subject provided either granting or denying it for the children of the document related to the ACL.", [
					{ name: "granting", type: "boolean", description: "Boolean to indicate if the permission will be granted o denied." },
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject which will be assigned the permission specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subject provided." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission that will be granted to the subject specified." },
				]
			), ():void => {} );

			it( hasSignature(
				"Configure several permissions to the subject provided either granting or denying them for the children of the document related to the ACL.", [
					{ name: "granting", type: "boolean", description: "Boolean to indicate if the permission will be granted o denied." },
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject which will be assigned the permission specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subject provided." },
					{ name: "permissions", type: "(string | CarbonLDP.Pointer)[]", description: "The permissions that will be granted to the subject specified." },
				]
			), ():void => {} );

			it( hasSignature(
				"Configure the permission specified to the every subject provided either granting or denying it for the children of the document related to the ACL.", [
					{ name: "granting", type: "boolean", description: "Boolean to indicate if the permission will be granted o denied." },
					{ name: "subjects", type: "(string | CarbonLDP.Pointer)[]", description: "The subjects which will be assigned the every permissions specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subjects provided." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission that will be granted to the every subject." },
				]
			), ():void => {} );

			it( hasSignature(
				"Configure several permissions to the every subject provided either granting or denying them for the children of the document related to the ACL.", [
					{ name: "granting", type: "boolean", description: "Boolean to indicate if the permission will be granted o denied." },
					{ name: "subjects", type: "(string | CarbonLDP.Pointer)[]", description: "The subjects which will be assigned the every permissions specified." },
					{ name: "subjectClass", type: "string | CarbonLDP.Pointer", description: "The type of subjects provided." },
					{ name: "permissions", type: "(string | CarbonLDP.Pointer)[]", description: "The permissions that will be granted to the every subject." },
				]
			), ():void => {} );

		} );

		it( hasMethod(
			OBLIGATORY,
			"grants",
			"Returns true if the subject has a configuration where it grants the permission specified for the document related to de ACL.\nReturns `null` if no configuration of the subject and permission exists in the ACL.", [
				{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject to look for its configuration." },
				{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission to check if it has a granting configuration." },
			],
			{ type: "boolean" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"denies",
			"Returns true if the subject has a configuration where it denies the permission specified for the document related to de ACL.\nReturns `null` if no configuration of the subject and permission exists in the ACL.", [
				{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject to look for its configuration." },
				{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission to check if it has a granting configuration." },
			],
			{ type: "boolean" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"getChildInheritance",
			"Returns if grants or denies a configuration of the subject and the permission specified for the children of document related to de ACL.\nReturns `null` if no configuration of the subject and permission exists in the ACL.", [
				{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject to look for its configuration." },
				{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission to check if it has a granting configuration." },
			],
			{ type: "boolean" }
		), ():void => {} );

		describe( method(
			OBLIGATORY,
			"remove"
		), ():void => {

			it( hasSignature(
				"Remove the configuration of a permission from a subject for the document related to the ACL.", [
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject from will be removed the permission." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission to remove from the subject configuration." },
				]
			), ():void => {} );

			it( hasSignature(
				"Remove the configuration of several permissions from a subject for the document related to the ACL.", [
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject from will removed the permission." },
					{ name: "permissions", type: "(string | CarbonLDP.Pointer)[]", description: "The permissions to remove from the subject configuration." },
				]
			), ():void => {} );

		} );

		describe( method(
			OBLIGATORY,
			"removeChildInheritance"
		), ():void => {

			it( hasSignature(
				"Remove the configuration of a permission from a subject for the children of the document related to the ACL.", [
					{ name: "subject", type: "string | CarbonLDP.Pointer", description: "The subject from will be removed the permission." },
					{ name: "permission", type: "string | CarbonLDP.Pointer", description: "The permission to remove from the subject configuration." },
				]
			), ():void => {} );

		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.TransientACLFactory",
		"Interface with factory, decorate and utils methods for `CarbonLDP.Auth.TransientACL` objects."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"string"
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"isDecorated",
			"Return true if the object provided has the properties and methods of a `CarbonLDP.Auth.TransientACL` object.", [
				{ name: "object", type: "object", description: "The object to analise." },
			],
			{ type: "object is CarbonLDP.Auth.TransientACL" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"decorate",
			[ "T extends object" ],
			"Decorate the object with the methods o a `CarbonLDP.Auth.TransientACL` object.", [
				{ name: "object", type: "T", description: "The object to decorate." },
			],
			{ type: "T & CarbonLDP.Auth.ACl.Class" }
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"TransientACL",
		"CarbonLDP.Auth.TransientACLFactory",
		"Constant that implements the `CarbonLDP.Auth.TransientACLFactory` interface."
	), ():void => {

		it( isDefined(), ():void => {
			expect( TransientACL ).toBeDefined();
			expect( TransientACL ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Separate in different tests
		it( "TransientACL.TYPE", ():void => {
			expect( TransientACL.TYPE ).toBeDefined();
			expect( Utils.isString( TransientACL.TYPE ) ).toBe( true );

			expect( TransientACL.TYPE ).toBe( CS.AccessControlList );
		} );

		// TODO: Separate in different tests
		it( "TransientACL.SCHEMA", ():void => {
			expect( TransientACL.SCHEMA ).toBeDefined();
			expect( Utils.isObject( TransientACL.SCHEMA ) ).toBe( true );

			expect( Utils.hasProperty( TransientACL.SCHEMA, "entries" ) ).toBe( true );
			expect( TransientACL.SCHEMA[ "entries" ] ).toEqual( {
				"@id": CS.accessControlEntry,
				"@type": "@id",
				"@container": "@set",
			} );

			expect( Utils.hasProperty( TransientACL.SCHEMA, "accessTo" ) ).toBe( true );
			expect( TransientACL.SCHEMA[ "accessTo" ] ).toEqual( {
				"@id": CS.accessTo,
				"@type": "@id",
			} );

			expect( Utils.hasProperty( TransientACL.SCHEMA, "inheritableEntries" ) ).toBe( true );
			expect( TransientACL.SCHEMA[ "inheritableEntries" ] ).toEqual( {
				"@id": CS.inheritableEntry,
				"@type": "@id",
				"@container": "@set",
			} );
		} );

		// TODO: Separate in different tests
		it( "TransientACL.isDecorated", ():void => {
			expect( TransientACL.isDecorated ).toBeDefined();
			expect( Utils.isFunction( TransientACL.isDecorated ) ).toBe( true );

			let object:any = void 0;
			expect( TransientACL.isDecorated( object ) ).toBe( false );

			object = {
				entries: null,
				accessTo: null,
				inheritableEntries: null,
				_parsePointer: ():void => {},
				grant: ():void => {},
				deny: ():void => {},
				configureChildInheritance: ():void => {},
				grants: ():void => {},
				denies: ():void => {},
				getChildInheritance: ():void => {},
				remove: ():void => {},
				removeChildInheritance: ():void => {},
			};
			expect( TransientACL.isDecorated( object ) ).toBe( true );

			delete object.accessTo;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.accessTo = null;

			delete object.entries;
			expect( TransientACL.isDecorated( object ) ).toBe( true );
			object.entries = null;

			delete object.inheritableEntries;
			expect( TransientACL.isDecorated( object ) ).toBe( true );
			object.inheritableEntries = null;

			delete object._parsePointer;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object._parsePointer = ():void => {};

			delete object.grant;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.grant = ():void => {};

			delete object.deny;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.deny = ():void => {};

			delete object.configureChildInheritance;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.configureChildInheritance = ():void => {};

			delete object.grants;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.grants = ():void => {};

			delete object.denies;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.denies = ():void => {};

			delete object.getChildInheritance;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.getChildInheritance = ():void => {};

			delete object.remove;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.remove = ():void => {};

			delete object.removeChildInheritance;
			expect( TransientACL.isDecorated( object ) ).toBe( false );
			object.removeChildInheritance = ():void => {};
		} );

		// TODO: Separate in different tests
		it( "TransientACL.decorate", ():void => {
			expect( TransientACL.decorate ).toBeDefined();
			expect( Utils.isFunction( TransientACL.decorate ) ).toBe( true );

			let document:Document = Document.create( new Documents(), "http://example.com/resource/~acl/" );
			let acl:TransientACL = TransientACL.decorate( document );
			acl.accessTo = acl.getPointer( "http://example.com/resource/" );

			expect( TransientACL.isDecorated( acl ) );
		} );

		describe( "TransientACL instance", ():void => {
			let acl:TransientACL;

			function getACEsOf( subject:string, fragments:TransientFragment[] ):TransientACE[] {
				return <TransientACE[]> fragments.filter( fragment => {
					let ids:string[] = Pointer.getIDs( (<TransientACE> fragment).subjects );
					return ids.indexOf( subject ) !== - 1;
				} );
			}

			beforeEach( ():void => {
				let document:Document = Document.create( new Documents(), "http://example.com/resource/~acl/" );
				acl = TransientACL.decorate( document );
				acl.accessTo = acl.getPointer( "http://example.com/resource/" );
			} );

			it( isDefined(), ():void => {
				expect( acl ).toBeTruthy();
				expect( TransientACL.isDecorated( acl ) ).toBe( true );
			} );

			describe( "TransientACL.grant", ():void => {

				it( isDefined(), ():void => {
					expect( acl.grant ).toBeDefined();
					expect( Utils.isFunction( acl.grant ) ).toBe( true );
				} );

				// TODO: Separate in different tests
				it( "should test when subject, subjectClass and a permission", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.grant( "http://example.com/ns#Subject", "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.grant( acl.getPointer( "http://example.com/ns#Subject" ), "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when subject, subjectClass and permissions", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.grant( "http://example.com/ns#Subject", "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.grant( acl.getPointer( "http://example.com/ns#Subject" ), "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#DELETE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when subjects, subjectClass and a permission", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.grant( [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when subject, subjectClass and permissions", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.grant( [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 5 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );


					acl.entries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					acl.entries = [];

					ace = TransientACE.createFrom(
						acl.createFragment(),
						false,
						[ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#DELETE" ) ]
					);
					acl.entries.push( ace );

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.entries.push( ace );

					acl.grant( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#READ" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 5 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? - 1 : 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? - 1 : 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );

					acl.entries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					acl.entries = [];
					acl.inheritableEntries = [];

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.entries.push( ace );
					acl.inheritableEntries.push( ace );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

					acl.grant( [ "http://example.com/ns#Subject", "http://example.com/ns#Subject-1" ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#UPDATE", "http://example.com/ns#CREATE" ] );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
				} );

			} );

			describe( "TransientACL.deny", ():void => {

				it( isDefined(), ():void => {
					expect( acl.deny ).toBeDefined();
					expect( Utils.isFunction( acl.deny ) ).toBe( true );
				} );

				// TODO: Separate in different tests
				it( "should test when subject, subjectClass and a permission", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.deny( "http://example.com/ns#Subject", "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.deny( acl.getPointer( "http://example.com/ns#Subject" ), "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when subject, subjectClass and permissions", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.deny( "http://example.com/ns#Subject", "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.deny( acl.getPointer( "http://example.com/ns#Subject" ), "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#DELETE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when subjects, subjectClass and a permission", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.deny( [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when subjects, subjectClass and permissions", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.deny( [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.entries ).toContain( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 5 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.entries ).toContain( ace );


					acl.entries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					acl.entries = [];
					ace = TransientACE.createFrom(
						acl.createFragment(),
						false,
						[ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#DELETE" ) ]
					);
					acl.entries.push( ace );
					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.entries.push( ace );

					acl.deny( [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#READ" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 5 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );

					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? 1 : - 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );

					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? 1 : - 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.entries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.entries ).toContain( ace );


					acl.entries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					acl.entries = [];
					acl.inheritableEntries = [];

					ace = TransientACE.createFrom(
						acl.createFragment(),
						false,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.entries.push( ace );
					acl.inheritableEntries.push( ace );

					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( false );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( false );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

					acl.deny( [ "http://example.com/ns#Subject", "http://example.com/ns#Subject-1" ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#UPDATE", "http://example.com/ns#CREATE" ] );

					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBe( true );
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );

					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBeNull();
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBe( true );
					expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( false );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( false );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
				} );

			} );

			describe( "TransientACL.configureChildInheritance", ():void => {

				it( isDefined(), ():void => {
					expect( acl.configureChildInheritance ).toBeDefined();
					expect( Utils.isFunction( acl.configureChildInheritance ) ).toBe( true );
				} );

				// TODO: Separate in different tests
				it( "should test when granting, subject, subjectClass and a permission", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.configureChildInheritance( true, "http://example.com/ns#Subject-01", "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject-01", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-01" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, acl.getPointer( "http://example.com/ns#Subject-01" ), "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject-01", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-01" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, acl.getPointer( "http://example.com/ns#Subject-11" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-11", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-11" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, acl.getPointer( "http://example.com/ns#Subject-11" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-11", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-11" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.inheritableEntries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					delete acl.inheritableEntries;

					acl.configureChildInheritance( false, "http://example.com/ns#Subject-02", "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject-02", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-02" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, acl.getPointer( "http://example.com/ns#Subject-02" ), "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject-02", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-02" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, acl.getPointer( "http://example.com/ns#Subject-12" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-12", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-12" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, acl.getPointer( "http://example.com/ns#Subject-12" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-12", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-12" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when granting, subject, subjectClass and permissions", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.configureChildInheritance( true, "http://example.com/ns#Subject", "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, acl.getPointer( "http://example.com/ns#Subject" ), "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#DELETE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.inheritableEntries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					delete acl.inheritableEntries;

					acl.configureChildInheritance( false, "http://example.com/ns#Subject", "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, acl.getPointer( "http://example.com/ns#Subject" ), "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#DELETE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when granting, subjects, subjectClass and a permission", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.configureChildInheritance( true, [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.inheritableEntries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					delete acl.inheritableEntries;

					acl.configureChildInheritance( false, [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", "http://example.com/ns#READ" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", "http://example.com/ns#WRITE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), "http://example.com/ns#UPDATE" );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), acl.getPointer( "http://example.com/ns#DELETE" ) );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
				} );

				// TODO: Separate in different tests
				it( "should test when granting, subjects, subjectClass and permissions", ():void => {
					let fragments:TransientFragment[];
					let aces:TransientACE[];
					let ace:TransientACE;

					acl.configureChildInheritance( true, [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 5 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.inheritableEntries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					delete acl.inheritableEntries;

					acl.configureChildInheritance( false, [ "http://example.com/ns#Subject" ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#READ" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ) ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#WRITE", "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 1 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ acl.getPointer( "http://example.com/ns#DELETE" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 2 );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 2 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), "http://example.com/ns#WRITE" ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 3 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 5 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.inheritableEntries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					acl.inheritableEntries = [];

					ace = TransientACE.createFrom(
						acl.createFragment(),
						false,
						[ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#DELETE" ) ]
					);
					acl.inheritableEntries.push( ace );
					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.inheritableEntries.push( ace );

					acl.configureChildInheritance( true, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#READ" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 5 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? - 1 : 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? - 1 : 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( acl.inheritableEntries ).toContain( ace );
					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.inheritableEntries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					acl.inheritableEntries = [];

					ace = TransientACE.createFrom(
						acl.createFragment(),
						false,
						[ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#DELETE" ) ]
					);
					acl.inheritableEntries.push( ace );
					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.inheritableEntries.push( ace );

					acl.configureChildInheritance( false, [ acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#Subject-2" ), acl.getPointer( "http://example.com/ns#Subject-3" ) ], acl.getPointer( "http://example.com/ns#SubjetClass" ), [ "http://example.com/ns#UPDATE", acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#READ" ) ] );
					fragments = acl.getFragments();
					expect( fragments.length ).toBe( 5 );
					aces = getACEsOf( "http://example.com/ns#Subject", fragments );
					expect( aces.length ).toBe( 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );

					aces = getACEsOf( "http://example.com/ns#Subject-2", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? 1 : - 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 4 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#DELETE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-2" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );

					aces = getACEsOf( "http://example.com/ns#Subject-3", fragments );
					expect( aces.length ).toBe( 2 );
					aces.sort( ( a, b ) => a.granting ? 1 : - 1 );
					ace = <TransientACE> aces[ 0 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( false );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 3 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#UPDATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#CREATE" );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#READ" );
					expect( acl.inheritableEntries ).toContain( ace );
					ace = <TransientACE> aces[ 1 ];
					expect( Pointer.getIDs( ace.subjects ) ).toContain( "http://example.com/ns#Subject-3" );
					expect( ace.types ).toContain( TransientACE.TYPE );
					expect( ace.granting ).toBe( true );
					expect( ace.subjectsClass.id ).toBe( "http://example.com/ns#SubjetClass" );
					expect( ace.permissions.length ).toBe( 1 );
					expect( Pointer.getIDs( ace.permissions ) ).toContain( "http://example.com/ns#WRITE" );
					expect( acl.inheritableEntries ).toContain( ace );

					acl.inheritableEntries.forEach( forEachACE => acl._removeFragment( forEachACE.id ) );
					acl.inheritableEntries = [];
					acl.entries = [];

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjetClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.inheritableEntries.push( ace );
					acl.entries.push( ace );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

					acl.configureChildInheritance( true, [ "http://example.com/ns#Subject", "http://example.com/ns#Subject-1" ], "http://example.com/ns#SubjetClass", [ "http://example.com/ns#UPDATE", "http://example.com/ns#CREATE" ] );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject-1" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#UPDATE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
				} );

			} );

			// TODO: Separate in different tests
			it( "ACl.grants", ():void => {
				expect( acl.grants ).toBeDefined();
				expect( Utils.isFunction( acl.grants ) ).toBe( true );

				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

				let ace:TransientACE;

				ace = TransientACE.createFrom(
					acl.createFragment(),
					true,
					[ acl.getPointer( "http://example.com/ns#Subject" ) ],
					acl.getPointer( "http://example.com/ns#SubjectClass" ),
					[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
				);
				acl.entries = [ ace ];

				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();
				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject-02" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();

				ace = TransientACE.createFrom(
					acl.createFragment(),
					false,
					[ acl.getPointer( "http://example.com/ns#Subject" ) ],
					acl.getPointer( "http://example.com/ns#SubjectClass" ),
					[ acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#DELETE" ) ]
				);
				acl.entries.push( ace );

				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( false );
				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#DELETE" ) ) ).toBe( false );

				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();
				expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject-02" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
			} );

			// TODO: Separate in different tests
			it( "TransientACL.denies", ():void => {
				expect( acl.denies ).toBeDefined();
				expect( Utils.isFunction( acl.denies ) ).toBe( true );

				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

				let ace:TransientACE;

				ace = TransientACE.createFrom(
					acl.createFragment(),
					false,
					[ acl.getPointer( "http://example.com/ns#Subject" ) ],
					acl.getPointer( "http://example.com/ns#SubjectClass" ),
					[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
				);
				acl.entries = [ ace ];

				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();
				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject-02" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();

				ace = TransientACE.createFrom(
					acl.createFragment(),
					true,
					[ acl.getPointer( "http://example.com/ns#Subject" ) ],
					acl.getPointer( "http://example.com/ns#SubjectClass" ),
					[ acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#DELETE" ) ]
				);
				acl.entries.push( ace );

				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( false );
				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#DELETE" ) ) ).toBe( false );

				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();
				expect( acl.denies( acl.getPointer( "http://example.com/ns#Subject-02" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
			} );

			// TODO: Separate in different tests
			it( "TransientACL.getChildInheritance", ():void => {
				expect( acl.getChildInheritance ).toBeDefined();
				expect( Utils.isFunction( acl.getChildInheritance ) ).toBe( true );

				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();

				let ace:TransientACE;

				ace = TransientACE.createFrom(
					acl.createFragment(),
					true,
					[ acl.getPointer( "http://example.com/ns#Subject" ) ],
					acl.getPointer( "http://example.com/ns#SubjectClass" ),
					[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
				);
				acl.inheritableEntries = [ ace ];

				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();
				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject-02" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();

				ace = TransientACE.createFrom(
					acl.createFragment(),
					false,
					[ acl.getPointer( "http://example.com/ns#Subject" ) ],
					acl.getPointer( "http://example.com/ns#SubjectClass" ),
					[ acl.getPointer( "http://example.com/ns#CREATE" ), acl.getPointer( "http://example.com/ns#DELETE" ) ]
				);
				acl.inheritableEntries.push( ace );

				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( false );
				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#DELETE" ) ) ).toBe( false );

				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();
				expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject-02" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
			} );

			describe( "TransientACL.remove", ():void => {

				it( isDefined(), ():void => {
					expect( acl.remove ).toBeDefined();
					expect( Utils.isFunction( acl.remove ) ).toBe( true );
				} );

				// TODO: Separate in different tests
				it( "should test when subject and a permission", ():void => {
					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) );
					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) );

					let ace:TransientACE;

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.entries = [ ace ];

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					expect( acl.entries.length ).toBe( 0 );

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.entries.push( ace );
					acl.inheritableEntries = [ ace ];

					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
				} );

				// TODO: Separate in different tests
				it( "should test when subject and permissions", ():void => {
					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ) ] );
					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#CREATE" ) ] );

					let ace:TransientACE;

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ), acl.getPointer( "http://example.com/ns#CREATE" ) ]
					);
					acl.entries = [ ace ];

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#CREATE" ) ] );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ] );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					expect( acl.entries.length ).toBe( 0 );

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ), acl.getPointer( "http://example.com/ns#CREATE" ) ]
					);
					acl.entries.push( ace );
					acl.inheritableEntries = [ ace ];

					acl.remove( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#CREATE" ) ] );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
				} );

			} );

			describe( "TransientACL.removeChildInheritance", ():void => {

				it( isDefined(), ():void => {
					expect( acl.removeChildInheritance ).toBeDefined();
					expect( Utils.isFunction( acl.removeChildInheritance ) ).toBe( true );
				} );

				// TODO: Separate in different tests
				it( "should test when subject and a permission", ():void => {
					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) );
					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) );

					let ace:TransientACE;

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.inheritableEntries = [ ace ];

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					expect( acl.inheritableEntries.length ).toBe( 0 );

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ]
					);
					acl.inheritableEntries.push( ace );
					acl.entries = [ ace ];

					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
				} );

				// TODO: Separate in different tests
				it( "should test when subject and permissions", ():void => {
					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ) ] );
					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#CREATE" ) ] );

					let ace:TransientACE;

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ), acl.getPointer( "http://example.com/ns#CREATE" ) ]
					);
					acl.inheritableEntries = [ ace ];

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#CREATE" ) ] );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ) ] );
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#ANOTHER" ) ) ).toBeNull();

					expect( acl.inheritableEntries.length ).toBe( 0 );

					ace = TransientACE.createFrom(
						acl.createFragment(),
						true,
						[ acl.getPointer( "http://example.com/ns#Subject" ) ],
						acl.getPointer( "http://example.com/ns#SubjectClass" ),
						[ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#WRITE" ), acl.getPointer( "http://example.com/ns#CREATE" ) ]
					);
					acl.inheritableEntries.push( ace );
					acl.entries = [ ace ];

					acl.removeChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), [ acl.getPointer( "http://example.com/ns#READ" ), acl.getPointer( "http://example.com/ns#CREATE" ) ] );

					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBeNull();
					expect( acl.getChildInheritance( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );

					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#READ" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#CREATE" ) ) ).toBe( true );
					expect( acl.grants( acl.getPointer( "http://example.com/ns#Subject" ), acl.getPointer( "http://example.com/ns#WRITE" ) ) ).toBe( true );
				} );

			} );

		} );

	} );

} );