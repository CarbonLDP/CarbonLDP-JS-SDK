import {
	isDefined,
	module,
	reexports,
	STATIC,
} from "../test/JasmineExtender";
import * as Utils from "../Utils";

import * as LDP from "./";

import { AccessPointsMetadata } from "./AccessPointsMetadata";
import {
	AddMemberAction,
	AddMemberActionFactory,
} from "./AddMemberAction";
import {
	TransientDirectContainer,
	TransientDirectContainerFactory,
} from "./DirectContainer";
import {
	DocumentMetadata,
	DocumentMetadataFactory,
} from "./DocumentMetadata";
import {
	Error,
	ErrorFactory,
} from "./Error";
import {
	ErrorResponse,
	ErrorResponseFactory,
} from "./ErrorResponse";
import {
	Map,
	MapFactory,
} from "./Map";
import {
	MapEntry,
	MapEntryFactory,
} from "./MapEntry";
import {
	RemoveMemberAction,
	RemoveMemberActionFactory,
} from "./RemoveMemberAction";
import {
	ResponseMetadata,
	ResponseMetadataFactory,
} from "./ResponseMetadata";
import {
	ValidationError,
	ValidationErrorFactory,
} from "./ValidationError";
import {
	VolatileResource,
	VolatileResourceFactory,
} from "./VolatileResource";

describe( module( "carbonldp/LDP" ), ():void => {

	it( isDefined(), ():void => {
		expect( LDP ).toBeDefined();
		expect( Utils.isObject( LDP ) ).toBe( true );
	} );

	it( reexports(
		STATIC,
		"AccessPointsMetadata",
		"CarbonLDP.LDP.AccessPointsMetadata"
	), ():void => {
		expect( LDP.AccessPointsMetadata ).toBeDefined();
		expect( LDP.AccessPointsMetadata ).toBe( AccessPointsMetadata );
	} );

	it( reexports(
		STATIC,
		"AddMemberAction",
		"CarbonLDP.LDP.AddMemberAction"
	), ():void => {
		expect( LDP.AddMemberAction ).toBeDefined();
		expect( LDP.AddMemberAction ).toBe( AddMemberAction );
	} );

	it( reexports(
		STATIC,
		"AddMemberActionFactory",
		"CarbonLDP.LDP.AddMemberActionFactory"
	), ():void => {
		const target:LDP.AddMemberActionFactory = {} as AddMemberActionFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"Map",
		"CarbonLDP.LDP.Map"
	), ():void => {
		expect( LDP.Map ).toBeDefined();
		expect( LDP.Map ).toBe( Map );
	} );

	it( reexports(
		STATIC,
		"MapFactory",
		"CarbonLDP.LDP.MapFactory"
	), ():void => {
		const target:LDP.MapFactory = {} as MapFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"TransientDirectContainer",
		"CarbonLDP.LDP.TransientDirectContainer"
	), ():void => {
		expect( LDP.TransientDirectContainer ).toBeDefined();
		expect( LDP.TransientDirectContainer ).toBe( TransientDirectContainer );
	} );

	it( reexports(
		STATIC,
		"DirectContainerFactory",
		"CarbonLDP.LDP.DirectContainerFactory"
	), ():void => {
		const target:LDP.TransientDirectContainerFactory = {} as TransientDirectContainerFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"MapEntry",
		"CarbonLDP.LDP.MapEntry"
	), ():void => {
		expect( LDP.MapEntry ).toBeDefined();
		expect( LDP.MapEntry ).toBe( MapEntry );
	} );

	it( reexports(
		STATIC,
		"MapEntryFactory",
		"CarbonLDP.LDP.MapEntryFactory"
	), ():void => {
		const target:LDP.MapEntryFactory = {} as MapEntryFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"Error",
		"CarbonLDP.LDP.Error"
	), ():void => {
		expect( LDP.Error ).toBeDefined();
		expect( LDP.Error ).toBe( Error );
	} );

	it( reexports(
		STATIC,
		"ErrorFactory",
		"CarbonLDP.LDP.ErrorFactory"
	), ():void => {
		const target:LDP.ErrorFactory = {} as ErrorFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"RemoveMemberAction",
		"CarbonLDP.LDP.RemoveMemberAction"
	), ():void => {
		expect( LDP.RemoveMemberAction ).toBeDefined();
		expect( LDP.RemoveMemberAction ).toBe( RemoveMemberAction );
	} );

	it( reexports(
		STATIC,
		"RemoveMemberActionFactory",
		"CarbonLDP.LDP.RemoveMemberActionFactory"
	), ():void => {
		const target:LDP.RemoveMemberActionFactory = {} as RemoveMemberActionFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"ErrorResponse",
		"CarbonLDP.LDP.ErrorResponse"
	), ():void => {
		expect( LDP.ErrorResponse ).toBeDefined();
		expect( LDP.ErrorResponse ).toBe( ErrorResponse );
	} );

	it( reexports(
		STATIC,
		"ErrorResponseFactory",
		"CarbonLDP.LDP.ErrorResponseFactory"
	), ():void => {
		const target:LDP.ErrorResponseFactory = {} as ErrorResponseFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"ResponseMetadata",
		"CarbonLDP.LDP.ResponseMetadata"
	), ():void => {
		expect( LDP.ResponseMetadata ).toBeDefined();
		expect( LDP.ResponseMetadata ).toBe( ResponseMetadata );
	} );

	it( reexports(
		STATIC,
		"ResponseMetadataFactory",
		"CarbonLDP.LDP.ResponseMetadataFactory"
	), ():void => {
		const target:LDP.ResponseMetadataFactory = {} as ResponseMetadataFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"DocumentMetadata",
		"CarbonLDP.LDP.DocumentMetadata"
	), ():void => {
		expect( LDP.DocumentMetadata ).toBeDefined();
		expect( LDP.DocumentMetadata ).toBe( DocumentMetadata );
	} );

	it( reexports(
		STATIC,
		"DocumentMetadataFactory",
		"CarbonLDP.LDP.DocumentMetadataFactory"
	), ():void => {
		const target:LDP.DocumentMetadataFactory = {} as DocumentMetadataFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"ValidationError",
		"CarbonLDP.LDP.ValidationError"
	), ():void => {
		expect( LDP.ValidationError ).toBeDefined();
		expect( LDP.ValidationError ).toBe( ValidationError );
	} );

	it( reexports(
		STATIC,
		"ValidationErrorFactory",
		"CarbonLDP.LDP.ValidationErrorFactory"
	), ():void => {
		const target:LDP.ValidationErrorFactory = {} as ValidationErrorFactory;
		expect( target ).toBeDefined();
	} );

	it( reexports(
		STATIC,
		"VolatileResource",
		"CarbonLDP.LDP.VolatileResource"
	), ():void => {
		expect( LDP.VolatileResource ).toBeDefined();
		expect( LDP.VolatileResource ).toBe( VolatileResource );
	} );

	it( reexports(
		STATIC,
		"VolatileResourceFactory",
		"CarbonLDP.LDP.VolatileResourceFactory"
	), ():void => {
		const target:LDP.VolatileResourceFactory = {} as VolatileResourceFactory;
		expect( target ).toBeDefined();
	} );

} );
