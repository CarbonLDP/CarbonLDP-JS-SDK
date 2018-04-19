import { AbstractContext } from "./AbstractContext";
import { TransientFragment } from "./TransientFragment";
import { Document } from "./Document";

import { PersistedFragment } from "./PersistedFragment";

import { PersistedResource } from "./PersistedResource";
import {
	extendsClass,
	hasMethod,
	hasProperty,
	interfaze,
	isDefined,
	module,
	OBLIGATORY,
	property,
	STATIC,
} from "./test/JasmineExtender";
import * as Utils from "./Utils";

describe( module( "carbonldp/PersistedFragment" ), ():void => {

	describe( interfaze(
		"CarbonLDP.PersistedFragment",
		"Interface that represents a persisted fragment of a persisted document."
	), ():void => {

		it( extendsClass( "CarbonLDP.PersistedResource" ), ():void => {} );
		it( extendsClass( "CarbonLDP.TransientFragment" ), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"document",
			"CarbonLDP.Document",
			"A reference to the persisted document the current fragment belongs to."
		), ():void => {} );

	} );

	describe( interfaze(
		"CarbonLDP.PersistedFragmentFactory",
		"Interface with the factory, decorate and utils methods of a `CarbonLDP.PersistedFragment` object."
	), ():void => {

		it( hasMethod(
			OBLIGATORY,
			"isDecorated", [
				{ name: "object", type: "object" },
			],
			{ type: "object is CarbonLDP.PersistedFragment" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"is", [
				{ name: "object", type: "object" },
			],
			{ type: "object is CarbonLDP.PersistedFragment" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"decorate",
			[ "T extends object" ],
			"Decorates the object provided with the properties and methods of a `CarbonLDP.PersistedFragment` object.",
			[
				{ name: "object", type: "object", description: "The object to convert into a persisted fragment." },
			]
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"create",
			[
				{ name: "document", type: "CarbonLDP.Document" },
				{ name: "id", type: "string", optional: true },
			],
			{ type: "CarbonLDP.PersistedFragment" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"createFrom",
			[ "T extends object" ],
			[
				{ name: "object", type: "object" },
				{ name: "document", type: "CarbonLDP.Document" },
				{ name: "id", type: "string", optional: true },
			],
			{ type: "T & CarbonLDP.PersistedFragment" }
		), ():void => {} );

	} );

	describe( property( STATIC, "PersistedFragment", "CarbonLDP.PersistedFragmentFactory", "Constant that implements the `CarbonLDP.PersistedFragmentFactory` interface." ), ():void => {

		it( isDefined(), ():void => {
			expect( PersistedFragment ).toBeDefined();
			expect( PersistedFragment ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Test `PersistedFragment.isDecorated`

		// TODO: Test `PersistedFragment.is`

		// TODO: Separate in different tests
		it( "PersistedFragment.decorate", ():void => {
			expect( PersistedFragment.decorate ).toBeDefined();
			expect( Utils.isFunction( PersistedFragment.decorate ) ).toBe( true );

			let spyPersistedDecorator:jasmine.Spy = spyOn( PersistedResource, "decorate" );

			let fragment:TransientFragment = TransientFragment.create( null, "_:01" );
			let persistedFragment:PersistedFragment = PersistedFragment.decorate( fragment );

			expect( persistedFragment ).toBeTruthy();
			expect( spyPersistedDecorator ).toHaveBeenCalledWith( fragment );
		} );

		// TODO: Test `PersistedFragment.create`

		// TODO: Test `PersistedFragment.createFrom`

		describe( "PersistedFragment instance", ():void => {

			let persistedFragment:PersistedFragment;
			beforeEach( ():void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://example.com/";
						this.settings = {
							vocabulary: "http://example.com/vocab#",
							paths: { system: ".system/" },
						};
					}
				}

				let context:AbstractContext = new MockedContext();
				context.extendObjectSchema( {
					"exTypes": "http://example.com/types#",
					"another": "http://example.com/another-url/ns#",
				} );

				context.documents.getPointer( "http://example.com/in/documents/" );

				let document:Document = Document.create( context.documents, "http://example.com/document/" );

				let fragment:TransientFragment = TransientFragment.create( document );
				persistedFragment = PersistedFragment.decorate( fragment );
			} );

			// TODO: Separate in different tests
			it( "PersistedFragment.addType", ():void => {
				expect( persistedFragment.addType ).toBeDefined();
				expect( Utils.isFunction( persistedFragment.addType ) ).toBe( true );

				expect( persistedFragment.types.length ).toBe( 0 );

				persistedFragment.addType( "http://example.com/types#Type-1" );
				expect( persistedFragment.types.length ).toBe( 1 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );

				persistedFragment.addType( "http://example.com/types#Type-2" );
				expect( persistedFragment.types.length ).toBe( 2 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-2" );

				persistedFragment.addType( "exTypes:Type-3" );
				expect( persistedFragment.types.length ).toBe( 3 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-2" );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-3" );

				persistedFragment.addType( "another:Type-0" );
				expect( persistedFragment.types.length ).toBe( 4 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-2" );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-3" );
				expect( persistedFragment.types ).toContain( "http://example.com/another-url/ns#Type-0" );

				persistedFragment.addType( "Current-Type" );
				expect( persistedFragment.types.length ).toBe( 5 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-2" );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-3" );
				expect( persistedFragment.types ).toContain( "http://example.com/another-url/ns#Type-0" );
				expect( persistedFragment.types ).toContain( "http://example.com/vocab#Current-Type" );
			} );

			// TODO: Separate in different tests
			it( "PersistedFragment.hasType", ():void => {
				expect( persistedFragment.hasType ).toBeDefined();
				expect( Utils.isFunction( persistedFragment.hasType ) ).toBe( true );

				persistedFragment.types = [ "http://example.com/types#Type-1" ];
				expect( persistedFragment.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "http://example.com/types#Type-2" ) ).toBe( false );


				persistedFragment.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2" ];
				expect( persistedFragment.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "http://example.com/types#Type-2" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Type-2" ) ).toBe( true );
				expect( persistedFragment.hasType( "http://example.com/types#Type-3" ) ).toBe( false );
				expect( persistedFragment.hasType( "exTypes:#Type-3" ) ).toBe( false );

				persistedFragment.types = [ "http://example.com/types#Type-1", "http://example.com/another-url/ns#Type-2" ];
				expect( persistedFragment.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "another:Type-1" ) ).toBe( false );
				expect( persistedFragment.hasType( "http://example.com/another-url/ns#Type-2" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Type-2" ) ).toBe( false );
				expect( persistedFragment.hasType( "another:Type-2" ) ).toBe( true );

				persistedFragment.types = [ "http://example.com/types#Type-1", "http://example.com/another-url/ns#Type-2", "http://example.com/vocab#Current-Type" ];
				expect( persistedFragment.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( persistedFragment.hasType( "another:Type-1" ) ).toBe( false );
				expect( persistedFragment.hasType( "Type-1" ) ).toBe( false );
				expect( persistedFragment.hasType( "http://example.com/another-url/ns#Type-2" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Type-2" ) ).toBe( false );
				expect( persistedFragment.hasType( "another:Type-2" ) ).toBe( true );
				expect( persistedFragment.hasType( "Type-2" ) ).toBe( false );
				expect( persistedFragment.hasType( "http://example.com/vocab#Current-Type" ) ).toBe( true );
				expect( persistedFragment.hasType( "exTypes:Current-Type" ) ).toBe( false );
				expect( persistedFragment.hasType( "another:Current-Type" ) ).toBe( false );
				expect( persistedFragment.hasType( "Current-Type" ) ).toBe( true );
			} );

			// TODO: Separate in different tests
			it( "PersistedFragment.removeType", ():void => {
				expect( persistedFragment.removeType ).toBeDefined();
				expect( Utils.isFunction( persistedFragment.removeType ) ).toBe( true );

				persistedFragment.types = [ "http://example.com/types#Type-1" ];
				persistedFragment.removeType( "http://example.com/types#Type-2" );
				expect( persistedFragment.types.length ).toBe( 1 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );
				persistedFragment.removeType( "another:Type-1" );
				expect( persistedFragment.types.length ).toBe( 1 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );
				persistedFragment.removeType( "Type-1" );
				expect( persistedFragment.types.length ).toBe( 1 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-1" );

				persistedFragment.types = [ "http://example.com/types#Type-1" ];
				persistedFragment.removeType( "http://example.com/types#Type-1" );
				expect( persistedFragment.types.length ).toBe( 0 );
				persistedFragment.types = [ "http://example.com/types#Type-1" ];
				persistedFragment.removeType( "exTypes:Type-1" );
				expect( persistedFragment.types.length ).toBe( 0 );

				persistedFragment.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2" ];
				persistedFragment.removeType( "http://example.com/types#Type-1" );
				expect( persistedFragment.types.length ).toBe( 1 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-2" );
				persistedFragment.removeType( "exTypes:Type-2" );
				expect( persistedFragment.types.length ).toBe( 0 );

				persistedFragment.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2", "http://example.com/another-url/ns#Type-3" ];
				persistedFragment.removeType( "http://example.com/types#Type-1" );
				expect( persistedFragment.types.length ).toBe( 2 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-2" );
				expect( persistedFragment.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				persistedFragment.removeType( "exTypes:Type-2" );
				expect( persistedFragment.types.length ).toBe( 1 );
				expect( persistedFragment.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				persistedFragment.removeType( "another:Type-3" );
				expect( persistedFragment.types.length ).toBe( 0 );

				persistedFragment.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2", "http://example.com/another-url/ns#Type-3", "http://example.com/vocab#Type-4" ];
				persistedFragment.removeType( "http://example.com/types#Type-1" );
				expect( persistedFragment.types.length ).toBe( 3 );
				expect( persistedFragment.types ).toContain( "http://example.com/types#Type-2" );
				expect( persistedFragment.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				expect( persistedFragment.types ).toContain( "http://example.com/vocab#Type-4" );
				persistedFragment.removeType( "exTypes:Type-2" );
				expect( persistedFragment.types.length ).toBe( 2 );
				expect( persistedFragment.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				expect( persistedFragment.types ).toContain( "http://example.com/vocab#Type-4" );
				persistedFragment.removeType( "another:Type-3" );
				expect( persistedFragment.types.length ).toBe( 1 );
				expect( persistedFragment.types ).toContain( "http://example.com/vocab#Type-4" );
				persistedFragment.removeType( "Type-4" );
				expect( persistedFragment.types.length ).toBe( 0 );
			} );

		} );

	} );

} );
