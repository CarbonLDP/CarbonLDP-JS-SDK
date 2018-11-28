import { INSTANCE, module, reexports } from "../test/JasmineExtender";

import * as System from "./";

import { PlatformInstance } from "./PlatformInstance";
import { PlatformMetadata, PlatformMetadataFactory } from "./PlatformMetadata";

describe( module( "carbonldp/System" ), () => {

	it( "should exist", ():void => {
		expect( System ).toBeDefined();
		expect( System ).toEqual( jasmine.any( Object ) );
	} );

	it( reexports(
		INSTANCE,
		"PlatformMetadata",
		"CarbonLDP.System.PlatformMetadata"
	), ():void => {
		expect( System.PlatformMetadata ).toBeDefined();
		expect( System.PlatformMetadata ).toBe( PlatformMetadata );
	} );

	it( reexports(
		INSTANCE,
		"PlatformMetadataFactory",
		"CarbonLDP.System.PlatformMetadataFactory"
	), ():void => {
		const target:System.PlatformMetadataFactory = {} as PlatformMetadataFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		INSTANCE,
		"PlatformInstance",
		"CarbonLDP.System.PlatformInstance"
	), ():void => {
		expect( System.PlatformInstance ).toBeDefined();
		expect( System.PlatformInstance ).toBe( PlatformInstance );
	} );

} );
