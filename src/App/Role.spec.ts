import {
	STATIC,

	module,
	clazz,
	interfaze,

	isDefined,
	hasMethod,
	hasProperty,
	extendsClass,
	hasDefaultExport,
} from "./../test/JasmineExtender";
import * as Errors from "./../Errors";
import * as NS from "./../NS";
import * as AuthRole from "./../Auth/Role";
import * as Utils from "./../Utils";

import * as AppRole from "./Role";
import DefaultExport from "./Role";

describe( module( "Carbon/Apps/Role" ), ():void => {

	it( isDefined(), ():void => {
		expect( AppRole ).toBeDefined();
		expect( Utils.isObject( AppRole ) ).toBe( true );
	} );

	it( hasProperty(
		STATIC,
		"RDF_CLASS",
		"string"
	), ():void => {
		expect( AppRole.RDF_CLASS ).toBeDefined();
		expect( Utils.isString( AppRole.RDF_CLASS ) ).toBe( true );

		expect( AppRole.RDF_CLASS ).toBe( NS.CS.Class.AppRole );
	} );

	it( hasProperty(
		STATIC,
		"SCHEMA",
		"Carbon.ObjectSchema.Class"
	), ():void => {
		expect( AppRole.SCHEMA ).toBeDefined();
		expect( Utils.isObject( AppRole.SCHEMA ) ).toBe( true );

		expect( Utils.hasProperty( AppRole.SCHEMA, "parentRole" ) ).toBe( true );
		expect( AppRole.SCHEMA[ "parentRole" ] ).toEqual( {
			"@id": NS.CS.Predicate.parentRole,
			"@type": "@id",
		} );

		expect( Utils.hasProperty( AppRole.SCHEMA, "childRoles" ) ).toBe( true );
		expect( AppRole.SCHEMA[ "childRoles" ] ).toEqual( {
			"@id": NS.CS.Predicate.childRole,
			"@type": "@id",
			"@container": "@set",
		} );
	} );

	describe( interfaze(
		"Carbon.App.Role.Class",
		"Specific interface that represents an in memory role for an application."
	), ():void => {

		it( extendsClass( "Carbon.Auth.Role.Class" ), ():void => {
			let appRole:AppRole.Class = <any> {};
			let authRole:AuthRole.Class;

			authRole = appRole;
			expect( authRole ).toEqual( jasmine.any( Object ) );
		} );

	} );

	describe( clazz(
		"Carbon.App.Role.Factory",
		"Factory class for `Carbon.App.Role.Class` objects"
	), ():void => {

		it( isDefined(), ():void => {
			expect( AppRole.Factory ).toBeDefined();
			expect( Utils.isFunction( AppRole.Factory ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"hasClassProperties",
			"Returns true if the object provided has the properties that defines a `Carbon.App.Role.Class` object", [
				{ name: "resource", type: "Object" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( AppRole.Factory.hasClassProperties ).toBeDefined();
			expect( Utils.isFunction( AppRole.Factory.hasClassProperties ) ).toBe( true );

			let object:any = void 0;

			expect( AppRole.Factory.hasClassProperties( object ) ).toBe( false );

			object = {};
			expect( AppRole.Factory.hasClassProperties( object ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"is",
			"Returns true if the object provided is considered a `Carbon.App.Role.Class` object", [
				{ name: "object", type: "Object" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( AppRole.Factory.is ).toBeDefined();
			expect( Utils.isFunction( AppRole.Factory.is ) ).toBe( true );

			let object:any;

			object = {};
			expect( AppRole.Factory.is( object ) ).toBe( false );

			object = {};
			expect( AppRole.Factory.is( object ) ).toBe( false );
			object.types = [ NS.CS.Class.AppRole ];
			expect( AppRole.Factory.is( object ) ).toBe( false );

			object = AuthRole.Factory.create( "Role name" );
			expect( AppRole.Factory.is( object ) ).toBe( false );
			object.types.push( NS.CS.Class.AppRole );
			expect( AppRole.Factory.is( object ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"create",
			"Create a `Carbon.App.Role.Class` object with the specified name.", [
				{ name: "name", type: "string", description: "Name of the role to create." },
				{ name: "description", type: "string", optional: true, description: "Optional description of the role." },
			],
			{ type: "Carbon.App.Role.Class" }
		), ():void => {
			expect( AppRole.Factory.create ).toBeDefined();
			expect( Utils.isFunction( AppRole.Factory.create ) ).toBe( true );

			let spy:jasmine.Spy = spyOn( AppRole.Factory, "createFrom" );

			AppRole.Factory.create( "Role name" );
			expect( spy ).toHaveBeenCalledWith( {}, "Role name", undefined );

			AppRole.Factory.create( "Another Role name" );
			expect( spy ).toHaveBeenCalledWith( {}, "Another Role name", undefined );

			AppRole.Factory.create( "Another Role name", "Optional description" );
			expect( spy ).toHaveBeenCalledWith( {}, "Another Role name", "Optional description" );

			AppRole.Factory.create( "" );
			expect( spy ).toHaveBeenCalledWith( {}, "", undefined );
		} );

		it( hasMethod(
			STATIC,
			"createFrom",
			[ "T extends Object" ],
			"Create a `Carbon.App.Role.Class` object with the object provided and its name.", [
				{ name: "object", type: "T" },
				{ name: "name", type: "string", description: "Name of the role to create." },
				{ name: "description", type: "string", optional: true, description: "Optional description of the role." },
			],
			{ type: "T & Carbon.App.Role.Class" }
		), ():void => {
			expect( AppRole.Factory.createFrom ).toBeDefined();
			expect( Utils.isFunction( AppRole.Factory.createFrom ) ).toBe( true );

			interface TheAppRole {
				myProperty?:string;
			}
			interface MyAppRole extends AppRole.Class, TheAppRole {}

			let role:MyAppRole;
			role = AppRole.Factory.createFrom<TheAppRole>( {}, "Role name" );
			expect( AppRole.Factory.is( role ) ).toBe( true );
			expect( role.myProperty ).toBeUndefined();
			expect( role.name ).toBe( "Role name" );
			expect( role.description ).toBeUndefined();
			expect( role.types ).toContain( NS.CS.Class.AppRole );

			role = AppRole.Factory.createFrom<TheAppRole>( { myProperty: "a property" }, "Role name" );
			expect( AppRole.Factory.is( role ) ).toBe( true );
			expect( role.myProperty ).toBeDefined();
			expect( role.myProperty ).toBe( "a property" );
			expect( role.name ).toBe( "Role name" );
			expect( role.description ).toBeUndefined();
			expect( role.types ).toContain( NS.CS.Class.AppRole );

			role = AppRole.Factory.createFrom<TheAppRole>( { myProperty: "a property" }, "Role name", "Description" );
			expect( AppRole.Factory.is( role ) ).toBe( true );
			expect( role.myProperty ).toBeDefined();
			expect( role.myProperty ).toBe( "a property" );
			expect( role.name ).toBe( "Role name" );
			expect( role.description ).toBe( "Description" );
			expect( role.types ).toContain( NS.CS.Class.AppRole );

			expect( () => AppRole.Factory.createFrom( {}, "" ) ).toThrowError( Errors.IllegalArgumentError );
			expect( () => AppRole.Factory.createFrom( {}, null ) ).toThrowError( Errors.IllegalArgumentError );
			expect( () => AppRole.Factory.createFrom( {}, undefined ) ).toThrowError( Errors.IllegalArgumentError );
		} );

	} );

	it( hasDefaultExport( "Carbon.App.Role.Class" ), ():void => {
		let defaultExport:DefaultExport = <any> {};
		let role:AppRole.Class;

		role = defaultExport;
		expect( role ).toEqual( jasmine.any( Object ) );
	} );

} );
