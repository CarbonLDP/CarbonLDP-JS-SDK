import {
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	property,
	STATIC,
} from "../test/JasmineExtender";

import { C } from "./C";

describe( module( "carbonldp/Vocabularies/C" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Vocabularies.C",
		"Interface that describes the vocabulary of Carbon LDP."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"namespace",
			"https://carbonldp.com/ns/v1/platform#"
		), ():void => {
			const target:C[ "namespace" ] = "https://carbonldp.com/ns/v1/platform#";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AccessPoint",
			"https://carbonldp.com/ns/v1/platform#AccessPoint"
		), ():void => {
			const target:C[ "AccessPoint" ] = "https://carbonldp.com/ns/v1/platform#AccessPoint";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AccessPointCreated",
			"https://carbonldp.com/ns/v1/platform#AccessPointCreated"
		), ():void => {
			const target:C[ "AccessPointCreated" ] = "https://carbonldp.com/ns/v1/platform#AccessPointCreated";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AccessPointsMetadata",
			"https://carbonldp.com/ns/v1/platform#AccessPointsMetadata"
		), ():void => {
			const target:C[ "AccessPointsMetadata" ] = "https://carbonldp.com/ns/v1/platform#AccessPointsMetadata";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"AddMemberAction",
			"https://carbonldp.com/ns/v1/platform#AddMemberAction"
		), ():void => {
			const target:C[ "AddMemberAction" ] = "https://carbonldp.com/ns/v1/platform#AddMemberAction";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ChildCreated",
			"https://carbonldp.com/ns/v1/platform#ChildCreatedEvent"
		), ():void => {
			const target:C[ "ChildCreated" ] = "https://carbonldp.com/ns/v1/platform#ChildCreatedEvent";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Document",
			"https://carbonldp.com/ns/v1/platform#Document"
		), ():void => {
			const target:C[ "Document" ] = "https://carbonldp.com/ns/v1/platform#Document";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"DocumentCreatedDetails",
			"https://carbonldp.com/ns/v1/platform#DocumentCreatedEventDetails"
		), ():void => {
			const target:C[ "DocumentCreatedDetails" ] = "https://carbonldp.com/ns/v1/platform#DocumentCreatedEventDetails";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"DocumentDeleted",
			"https://carbonldp.com/ns/v1/platform#DocumentDeleted"
		), ():void => {
			const target:C[ "DocumentDeleted" ] = "https://carbonldp.com/ns/v1/platform#DocumentDeleted";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"DocumentMetadata",
			"https://carbonldp.com/ns/v1/platform#DocumentMetadata"
		), ():void => {
			const target:C[ "DocumentMetadata" ] = "https://carbonldp.com/ns/v1/platform#DocumentMetadata";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"DocumentModified",
			"https://carbonldp.com/ns/v1/platform#DocumentModified"
		), ():void => {
			const target:C[ "DocumentModified" ] = "https://carbonldp.com/ns/v1/platform#DocumentModified";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ErrorResponse",
			"https://carbonldp.com/ns/v1/platform#ErrorResponse"
		), ():void => {
			const target:C[ "ErrorResponse" ] = "https://carbonldp.com/ns/v1/platform#ErrorResponse";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Error",
			"https://carbonldp.com/ns/v1/platform#Error"
		), ():void => {
			const target:C[ "Error" ] = "https://carbonldp.com/ns/v1/platform#Error";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Instance",
			"https://carbonldp.com/ns/v1/platform#Instance"
		), ():void => {
			const target:C[ "Instance" ] = "https://carbonldp.com/ns/v1/platform#Instance";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Map",
			"https://carbonldp.com/ns/v1/platform#Map"
		), ():void => {
			const target:C[ "Map" ] = "https://carbonldp.com/ns/v1/platform#Map";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"MemberAdded",
			"https://carbonldp.com/ns/v1/platform#MemberAddedEvent"
		), ():void => {
			const target:C[ "MemberAdded" ] = "https://carbonldp.com/ns/v1/platform#MemberAddedEvent";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"MemberAddedDetails",
			"https://carbonldp.com/ns/v1/platform#MemberAddedEventDetails"
		), ():void => {
			const target:C[ "MemberAddedDetails" ] = "https://carbonldp.com/ns/v1/platform#MemberAddedEventDetails";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"MemberRemoved",
			"https://carbonldp.com/ns/v1/platform#MemberRemovedEvent"
		), ():void => {
			const target:C[ "MemberRemoved" ] = "https://carbonldp.com/ns/v1/platform#MemberRemovedEvent";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"MemberRemovedDetails",
			"https://carbonldp.com/ns/v1/platform#MemberRemovedEventDetails"
		), ():void => {
			const target:C[ "MemberRemovedDetails" ] = "https://carbonldp.com/ns/v1/platform#MemberRemovedEventDetails";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"NonReadableMembershipResourceTriples",
			"https://carbonldp.com/ns/v1/platform#NonReadableMembershipResourceTriples"
		), ():void => {
			const target:C[ "NonReadableMembershipResourceTriples" ] = "https://carbonldp.com/ns/v1/platform#NonReadableMembershipResourceTriples";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"Platform",
			"https://carbonldp.com/ns/v1/platform#Platform"
		), ():void => {
			const target:C[ "Platform" ] = "https://carbonldp.com/ns/v1/platform#Platform";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PlatformInstance",
			"string"
		), ():void => {
			expect( C.PlatformInstance ).toEqual( jasmine.any( String ) );
			expect( C.PlatformInstance ).toBe( "https://carbonldp.com/ns/v1/platform#PlatformInstance" );
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferContainer",
			"https://carbonldp.com/ns/v1/platform#PreferContainer"
		), ():void => {
			const target:C[ "PreferContainer" ] = "https://carbonldp.com/ns/v1/platform#PreferContainer";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferContainmentResources",
			"https://carbonldp.com/ns/v1/platform#PreferContainmentResources"
		), ():void => {
			const target:C[ "PreferContainmentResources" ] = "https://carbonldp.com/ns/v1/platform#PreferContainmentResources";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferContainmentTriples",
			"https://carbonldp.com/ns/v1/platform#PreferContainmentTriples"
		), ():void => {
			const target:C[ "PreferContainmentTriples" ] = "https://carbonldp.com/ns/v1/platform#PreferContainmentTriples";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferDocumentETags",
			"https://carbonldp.com/ns/v1/platform#PreferDocumentETags"
		), ():void => {
			const target:C[ "PreferDocumentETags" ] = "https://carbonldp.com/ns/v1/platform#PreferDocumentETags";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferMembershipResources",
			"https://carbonldp.com/ns/v1/platform#PreferMembershipResources"
		), ():void => {
			const target:C[ "PreferMembershipResources" ] = "https://carbonldp.com/ns/v1/platform#PreferMembershipResources";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferMembershipTriples",
			"https://carbonldp.com/ns/v1/platform#PreferMembershipTriples"
		), ():void => {
			const target:C[ "PreferMembershipTriples" ] = "https://carbonldp.com/ns/v1/platform#PreferMembershipTriples";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"PreferResultsContext",
			"https://carbonldp.com/ns/v1/platform#PreferResultsContext"
		), ():void => {
			const target:C[ "PreferResultsContext" ] = "https://carbonldp.com/ns/v1/platform#PreferResultsContext";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"QueryMetadata",
			"https://carbonldp.com/ns/v1/platform#QueryMetadata"
		), ():void => {
			const target:C[ "QueryMetadata" ] = "https://carbonldp.com/ns/v1/platform#QueryMetadata";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"RemoveMemberAction",
			"https://carbonldp.com/ns/v1/platform#RemoveMemberAction"
		), ():void => {
			const target:C[ "RemoveMemberAction" ] = "https://carbonldp.com/ns/v1/platform#RemoveMemberAction";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ResponseMetadata",
			"https://carbonldp.com/ns/v1/platform#ResponseMetadata"
		), ():void => {
			const target:C[ "ResponseMetadata" ] = "https://carbonldp.com/ns/v1/platform#ResponseMetadata";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"ValidationError",
			"https://carbonldp.com/ns/v1/platform#ValidationError"
		), ():void => {
			const target:C[ "ValidationError" ] = "https://carbonldp.com/ns/v1/platform#ValidationError";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"VolatileResource",
			"https://carbonldp.com/ns/v1/platform#VolatileResource"
		), ():void => {
			const target:C[ "VolatileResource" ] = "https://carbonldp.com/ns/v1/platform#VolatileResource";
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OBLIGATORY,
			"accessPoint",
			"https://carbonldp.com/ns/v1/platform#accessPoint"
		), ():void => {
			const target:C[ "accessPoint" ] = "https://carbonldp.com/ns/v1/platform#accessPoint";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"bNodesMap",
			"https://carbonldp.com/ns/v1/platform#bNodesMap"
		), ():void => {
			const target:C[ "bNodesMap" ] = "https://carbonldp.com/ns/v1/platform#bNodesMap";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"buildDate",
			"https://carbonldp.com/ns/v1/platform#buildDate"
		), ():void => {
			const target:C[ "buildDate" ] = "https://carbonldp.com/ns/v1/platform#buildDate";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"created",
			"https://carbonldp.com/ns/v1/platform#created"
		), ():void => {
			const target:C[ "created" ] = "https://carbonldp.com/ns/v1/platform#created";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"createdDocument",
			"https://carbonldp.com/ns/v1/platform#createdDocument"
		), ():void => {
			const target:C[ "createdDocument" ] = "https://carbonldp.com/ns/v1/platform#createdDocument";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"details",
			"https://carbonldp.com/ns/v1/platform#details"
		), ():void => {
			const target:C[ "details" ] = "https://carbonldp.com/ns/v1/platform#details";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"defaultInteractionModel",
			"https://carbonldp.com/ns/v1/platform#defaultInteractionModel"
		), ():void => {
			const target:C[ "defaultInteractionModel" ] = "https://carbonldp.com/ns/v1/platform#defaultInteractionModel";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"documentMetadata",
			"https://carbonldp.com/ns/v1/platform#documentMetadata"
		), ():void => {
			const target:C[ "documentMetadata" ] = "https://carbonldp.com/ns/v1/platform#documentMetadata";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"entry",
			"https://carbonldp.com/ns/v1/platform#entry"
		), ():void => {
			const target:C[ "entry" ] = "https://carbonldp.com/ns/v1/platform#entry";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"entryKey",
			"https://carbonldp.com/ns/v1/platform#key"
		), ():void => {
			const target:C[ "entryKey" ] = "https://carbonldp.com/ns/v1/platform#key";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"modified",
			"https://carbonldp.com/ns/v1/platform#modified"
		), ():void => {
			const target:C[ "modified" ] = "https://carbonldp.com/ns/v1/platform#modified";
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OBLIGATORY,
			"mediaType",
			"https://carbonldp.com/ns/v1/platform#mediaType"
		), ():void => {
			const target:C[ "mediaType" ] = "https://carbonldp.com/ns/v1/platform#mediaType";
			expect( target ).toBeDefined();
		} );


		it( hasProperty(
			OBLIGATORY,
			"size",
			"https://carbonldp.com/ns/v1/platform#size"
		), ():void => {
			const target:C[ "size" ] = "https://carbonldp.com/ns/v1/platform#size";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"error",
			"https://carbonldp.com/ns/v1/platform#error"
		), ():void => {
			const target:C[ "error" ] = "https://carbonldp.com/ns/v1/platform#error";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"errorCode",
			"https://carbonldp.com/ns/v1/platform#errorCode"
		), ():void => {
			const target:C[ "errorCode" ] = "https://carbonldp.com/ns/v1/platform#errorCode";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"errorDetails",
			"https://carbonldp.com/ns/v1/platform#errorDetails"
		), ():void => {
			const target:C[ "errorDetails" ] = "https://carbonldp.com/ns/v1/platform#errorDetails";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"member",
			"https://carbonldp.com/ns/v1/platform#member"
		), ():void => {
			const target:C[ "member" ] = "https://carbonldp.com/ns/v1/platform#member";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"errorMessage",
			"https://carbonldp.com/ns/v1/platform#errorMessage"
		), ():void => {
			const target:C[ "errorMessage" ] = "https://carbonldp.com/ns/v1/platform#errorMessage";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"errorParameters",
			"https://carbonldp.com/ns/v1/platform#errorParameters"
		), ():void => {
			const target:C[ "errorParameters" ] = "https://carbonldp.com/ns/v1/platform#errorParameters";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"httpStatusCode",
			"https://carbonldp.com/ns/v1/platform#httpStatusCode"
		), ():void => {
			const target:C[ "httpStatusCode" ] = "https://carbonldp.com/ns/v1/platform#httpStatusCode";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"instance",
			"string"
		), ():void => {
			expect( C.instance ).toEqual( jasmine.any( String ) );
			expect( C.instance ).toBe( "https://carbonldp.com/ns/v1/platform#instance" );
		} );

		it( hasProperty(
			OBLIGATORY,
			"relatedDocument",
			"https://carbonldp.com/ns/v1/platform#relatedDocument"
		), ():void => {
			const target:C[ "relatedDocument" ] = "https://carbonldp.com/ns/v1/platform#relatedDocument";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"eTag",
			"https://carbonldp.com/ns/v1/platform#eTag"
		), ():void => {
			const target:C[ "eTag" ] = "https://carbonldp.com/ns/v1/platform#eTag";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"requestID",
			"https://carbonldp.com/ns/v1/platform#requestID"
		), ():void => {
			const target:C[ "requestID" ] = "https://carbonldp.com/ns/v1/platform#requestID";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"entryValue",
			"https://carbonldp.com/ns/v1/platform#value"
		), ():void => {
			const target:C[ "entryValue" ] = "https://carbonldp.com/ns/v1/platform#value";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"version",
			"https://carbonldp.com/ns/v1/platform#version"
		), ():void => {
			const target:C[ "version" ] = "https://carbonldp.com/ns/v1/platform#version";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"target",
			"https://carbonldp.com/ns/v1/platform#target"
		), ():void => {
			const target:C[ "target" ] = "https://carbonldp.com/ns/v1/platform#target";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"targetMember",
			"https://carbonldp.com/ns/v1/platform#targetMember"
		), ():void => {
			const target:C[ "targetMember" ] = "https://carbonldp.com/ns/v1/platform#targetMember";
			expect( target ).toBeDefined();
		} );
	} );

	describe( property(
		STATIC,
		"C",
		"CarbonLDP.Vocabularies.C",
		"Constant that implements the vocabulary of Carbon LDP."
	), ():void => {

		it( "should exists", ():void => {
			expect( C ).toEqual( jasmine.any( Object ) );
		} );

		it( "should test all exported IRIs", ():void => {
			expect( Object.keys( C ).length ).toBe( 63 );
		} );

		it( "C.namespace", ():void => {
			expect( C.namespace ).toEqual( jasmine.any( String ) );
			expect( C.namespace ).toBe( "https://carbonldp.com/ns/v1/platform#" );
		} );

		it( "C.AccessPoint", ():void => {
			expect( C.AccessPoint ).toEqual( jasmine.any( String ) );
			expect( C.AccessPoint ).toBe( "https://carbonldp.com/ns/v1/platform#AccessPoint" );
		} );

		it( "C.AccessPointCreated", ():void => {
			expect( C.AccessPointCreated ).toEqual( jasmine.any( String ) );
			expect( C.AccessPointCreated ).toBe( "https://carbonldp.com/ns/v1/platform#AccessPointCreated" );
		} );

		it( "C.AccessPointsMetadata", ():void => {
			expect( C.AccessPointsMetadata ).toEqual( jasmine.any( String ) );
			expect( C.AccessPointsMetadata ).toBe( "https://carbonldp.com/ns/v1/platform#AccessPointsMetadata" );
		} );

		it( "C.AddMemberAction", ():void => {
			expect( C.AddMemberAction ).toEqual( jasmine.any( String ) );
			expect( C.AddMemberAction ).toBe( "https://carbonldp.com/ns/v1/platform#AddMemberAction" );
		} );

		it( "C.ChildCreated", ():void => {
			expect( C.ChildCreated ).toEqual( jasmine.any( String ) );
			expect( C.ChildCreated ).toBe( "https://carbonldp.com/ns/v1/platform#ChildCreatedEvent" );
		} );

		it( "C.Document", ():void => {
			expect( C.Document ).toEqual( jasmine.any( String ) );
			expect( C.Document ).toBe( "https://carbonldp.com/ns/v1/platform#Document" );
		} );

		it( "C.DocumentCreatedDetails", ():void => {
			expect( C.DocumentCreatedDetails ).toEqual( jasmine.any( String ) );
			expect( C.DocumentCreatedDetails ).toBe( "https://carbonldp.com/ns/v1/platform#DocumentCreatedEventDetails" );
		} );

		it( "C.DocumentDeleted", ():void => {
			expect( C.DocumentDeleted ).toEqual( jasmine.any( String ) );
			expect( C.DocumentDeleted ).toBe( "https://carbonldp.com/ns/v1/platform#DocumentDeleted" );
		} );

		it( "C.DocumentMetadata", ():void => {
			expect( C.DocumentMetadata ).toEqual( jasmine.any( String ) );
			expect( C.DocumentMetadata ).toBe( "https://carbonldp.com/ns/v1/platform#DocumentMetadata" );
		} );

		it( "C.DocumentModified", ():void => {
			expect( C.DocumentModified ).toEqual( jasmine.any( String ) );
			expect( C.DocumentModified ).toBe( "https://carbonldp.com/ns/v1/platform#DocumentModified" );
		} );

		it( "C.ErrorResponse", ():void => {
			expect( C.ErrorResponse ).toEqual( jasmine.any( String ) );
			expect( C.ErrorResponse ).toBe( "https://carbonldp.com/ns/v1/platform#ErrorResponse" );
		} );

		it( "C.Error", ():void => {
			expect( C.Error ).toEqual( jasmine.any( String ) );
			expect( C.Error ).toBe( "https://carbonldp.com/ns/v1/platform#Error" );
		} );

		it( "C.Instance", ():void => {
			expect( C.Instance ).toEqual( jasmine.any( String ) );
			expect( C.Instance ).toBe( "https://carbonldp.com/ns/v1/platform#Instance" );
		} );

		it( "C.Map", ():void => {
			expect( C.Map ).toEqual( jasmine.any( String ) );
			expect( C.Map ).toBe( "https://carbonldp.com/ns/v1/platform#Map" );
		} );

		it( "C.MemberAdded", ():void => {
			expect( C.MemberAdded ).toEqual( jasmine.any( String ) );
			expect( C.MemberAdded ).toBe( "https://carbonldp.com/ns/v1/platform#MemberAddedEvent" );
		} );

		it( "C.MemberAddedDetails", ():void => {
			expect( C.MemberAddedDetails ).toEqual( jasmine.any( String ) );
			expect( C.MemberAddedDetails ).toBe( "https://carbonldp.com/ns/v1/platform#MemberAddedEventDetails" );
		} );

		it( "C.MemberRemoved", ():void => {
			expect( C.MemberRemoved ).toEqual( jasmine.any( String ) );
			expect( C.MemberRemoved ).toBe( "https://carbonldp.com/ns/v1/platform#MemberRemovedEvent" );
		} );

		it( "C.MemberRemovedDetails", ():void => {
			expect( C.MemberRemovedDetails ).toEqual( jasmine.any( String ) );
			expect( C.MemberRemovedDetails ).toBe( "https://carbonldp.com/ns/v1/platform#MemberRemovedEventDetails" );
		} );

		it( "C.NonReadableMembershipResourceTriples", ():void => {
			expect( C.NonReadableMembershipResourceTriples ).toEqual( jasmine.any( String ) );
			expect( C.NonReadableMembershipResourceTriples ).toBe( "https://carbonldp.com/ns/v1/platform#NonReadableMembershipResourceTriples" );
		} );

		it( "C.Platform", ():void => {
			expect( C.Platform ).toEqual( jasmine.any( String ) );
			expect( C.Platform ).toBe( "https://carbonldp.com/ns/v1/platform#Platform" );
		} );

		it( "C.PlatformInstance", ():void => {
			expect( C.PlatformInstance ).toEqual( jasmine.any( String ) );
			expect( C.PlatformInstance ).toBe( "https://carbonldp.com/ns/v1/platform#PlatformInstance" );
		} );

		it( "C.PreferContainer", ():void => {
			expect( C.PreferContainer ).toEqual( jasmine.any( String ) );
			expect( C.PreferContainer ).toBe( "https://carbonldp.com/ns/v1/platform#PreferContainer" );
		} );

		it( "C.PreferContainmentResources", ():void => {
			expect( C.PreferContainmentResources ).toEqual( jasmine.any( String ) );
			expect( C.PreferContainmentResources ).toBe( "https://carbonldp.com/ns/v1/platform#PreferContainmentResources" );
		} );

		it( "C.PreferContainmentTriples", ():void => {
			expect( C.PreferContainmentTriples ).toEqual( jasmine.any( String ) );
			expect( C.PreferContainmentTriples ).toBe( "https://carbonldp.com/ns/v1/platform#PreferContainmentTriples" );
		} );

		it( "C.PreferDocumentETags", ():void => {
			expect( C.PreferDocumentETags ).toEqual( jasmine.any( String ) );
			expect( C.PreferDocumentETags ).toBe( "https://carbonldp.com/ns/v1/platform#PreferDocumentETags" );
		} );

		it( "C.PreferMembershipResources", ():void => {
			expect( C.PreferMembershipResources ).toEqual( jasmine.any( String ) );
			expect( C.PreferMembershipResources ).toBe( "https://carbonldp.com/ns/v1/platform#PreferMembershipResources" );
		} );

		it( "C.PreferMembershipTriples", ():void => {
			expect( C.PreferMembershipTriples ).toEqual( jasmine.any( String ) );
			expect( C.PreferMembershipTriples ).toBe( "https://carbonldp.com/ns/v1/platform#PreferMembershipTriples" );
		} );

		it( "C.PreferResultsContext", ():void => {
			expect( C.PreferResultsContext ).toEqual( jasmine.any( String ) );
			expect( C.PreferResultsContext ).toBe( "https://carbonldp.com/ns/v1/platform#PreferResultsContext" );
		} );

		it( "C.QueryMetadata", ():void => {
			expect( C.QueryMetadata ).toEqual( jasmine.any( String ) );
			expect( C.QueryMetadata ).toBe( "https://carbonldp.com/ns/v1/platform#QueryMetadata" );
		} );

		it( "C.RemoveMemberAction", ():void => {
			expect( C.RemoveMemberAction ).toEqual( jasmine.any( String ) );
			expect( C.RemoveMemberAction ).toBe( "https://carbonldp.com/ns/v1/platform#RemoveMemberAction" );
		} );

		it( "C.ResponseMetadata", ():void => {
			expect( C.ResponseMetadata ).toEqual( jasmine.any( String ) );
			expect( C.ResponseMetadata ).toBe( "https://carbonldp.com/ns/v1/platform#ResponseMetadata" );
		} );

		it( "C.ValidationError", ():void => {
			expect( C.ValidationError ).toEqual( jasmine.any( String ) );
			expect( C.ValidationError ).toBe( "https://carbonldp.com/ns/v1/platform#ValidationError" );
		} );

		it( "C.VolatileResource", ():void => {
			expect( C.VolatileResource ).toEqual( jasmine.any( String ) );
			expect( C.VolatileResource ).toBe( "https://carbonldp.com/ns/v1/platform#VolatileResource" );
		} );


		it( "C.accessPoint", ():void => {
			expect( C.accessPoint ).toEqual( jasmine.any( String ) );
			expect( C.accessPoint ).toBe( "https://carbonldp.com/ns/v1/platform#accessPoint" );
		} );

		it( "C.bNodesMap", ():void => {
			expect( C.bNodesMap ).toEqual( jasmine.any( String ) );
			expect( C.bNodesMap ).toBe( "https://carbonldp.com/ns/v1/platform#bNodesMap" );
		} );

		it( "C.buildDate", ():void => {
			expect( C.buildDate ).toEqual( jasmine.any( String ) );
			expect( C.buildDate ).toBe( "https://carbonldp.com/ns/v1/platform#buildDate" );
		} );

		it( "C.created", ():void => {
			expect( C.created ).toEqual( jasmine.any( String ) );
			expect( C.created ).toBe( "https://carbonldp.com/ns/v1/platform#created" );
		} );

		it( "C.createdDocument", ():void => {
			expect( C.createdDocument ).toEqual( jasmine.any( String ) );
			expect( C.createdDocument ).toBe( "https://carbonldp.com/ns/v1/platform#createdDocument" );
		} );

		it( "C.details", ():void => {
			expect( C.details ).toEqual( jasmine.any( String ) );
			expect( C.details ).toBe( "https://carbonldp.com/ns/v1/platform#details" );
		} );

		it( "C.defaultInteractionModel", ():void => {
			expect( C.defaultInteractionModel ).toEqual( jasmine.any( String ) );
			expect( C.defaultInteractionModel ).toBe( "https://carbonldp.com/ns/v1/platform#defaultInteractionModel" );
		} );

		it( "C.documentMetadata", ():void => {
			expect( C.documentMetadata ).toEqual( jasmine.any( String ) );
			expect( C.documentMetadata ).toBe( "https://carbonldp.com/ns/v1/platform#documentMetadata" );
		} );

		it( "C.entry", ():void => {
			expect( C.entry ).toEqual( jasmine.any( String ) );
			expect( C.entry ).toBe( "https://carbonldp.com/ns/v1/platform#entry" );
		} );

		it( "C.entryKey", ():void => {
			expect( C.entryKey ).toEqual( jasmine.any( String ) );
			expect( C.entryKey ).toBe( "https://carbonldp.com/ns/v1/platform#key" );
		} );

		it( "C.modified", ():void => {
			expect( C.modified ).toEqual( jasmine.any( String ) );
			expect( C.modified ).toBe( "https://carbonldp.com/ns/v1/platform#modified" );
		} );


		it( "C.mediaType", ():void => {
			expect( C.mediaType ).toEqual( jasmine.any( String ) );
			expect( C.mediaType ).toBe( "https://carbonldp.com/ns/v1/platform#mediaType" );
		} );


		it( "C.size", ():void => {
			expect( C.size ).toEqual( jasmine.any( String ) );
			expect( C.size ).toBe( "https://carbonldp.com/ns/v1/platform#size" );
		} );

		it( "C.error", ():void => {
			expect( C.error ).toEqual( jasmine.any( String ) );
			expect( C.error ).toBe( "https://carbonldp.com/ns/v1/platform#error" );
		} );

		it( "C.errorCode", ():void => {
			expect( C.errorCode ).toEqual( jasmine.any( String ) );
			expect( C.errorCode ).toBe( "https://carbonldp.com/ns/v1/platform#errorCode" );
		} );

		it( "C.errorDetails", ():void => {
			expect( C.errorDetails ).toEqual( jasmine.any( String ) );
			expect( C.errorDetails ).toBe( "https://carbonldp.com/ns/v1/platform#errorDetails" );
		} );

		it( "C.member", ():void => {
			expect( C.member ).toEqual( jasmine.any( String ) );
			expect( C.member ).toBe( "https://carbonldp.com/ns/v1/platform#member" );
		} );

		it( "C.errorMessage", ():void => {
			expect( C.errorMessage ).toEqual( jasmine.any( String ) );
			expect( C.errorMessage ).toBe( "https://carbonldp.com/ns/v1/platform#errorMessage" );
		} );

		it( "C.errorParameters", ():void => {
			expect( C.errorParameters ).toEqual( jasmine.any( String ) );
			expect( C.errorParameters ).toBe( "https://carbonldp.com/ns/v1/platform#errorParameters" );
		} );

		it( "C.httpStatusCode", ():void => {
			expect( C.httpStatusCode ).toEqual( jasmine.any( String ) );
			expect( C.httpStatusCode ).toBe( "https://carbonldp.com/ns/v1/platform#httpStatusCode" );
		} );

		it( "C.instance", ():void => {
			expect( C.instance ).toEqual( jasmine.any( String ) );
			expect( C.instance ).toBe( "https://carbonldp.com/ns/v1/platform#instance" );
		} );

		it( "C.relatedDocument", ():void => {
			expect( C.relatedDocument ).toEqual( jasmine.any( String ) );
			expect( C.relatedDocument ).toBe( "https://carbonldp.com/ns/v1/platform#relatedDocument" );
		} );

		it( "C.eTag", ():void => {
			expect( C.eTag ).toEqual( jasmine.any( String ) );
			expect( C.eTag ).toBe( "https://carbonldp.com/ns/v1/platform#eTag" );
		} );

		it( "C.requestID", ():void => {
			expect( C.requestID ).toEqual( jasmine.any( String ) );
			expect( C.requestID ).toBe( "https://carbonldp.com/ns/v1/platform#requestID" );
		} );

		it( "C.entryValue", ():void => {
			expect( C.entryValue ).toEqual( jasmine.any( String ) );
			expect( C.entryValue ).toBe( "https://carbonldp.com/ns/v1/platform#value" );
		} );

		it( "C.version", ():void => {
			expect( C.version ).toEqual( jasmine.any( String ) );
			expect( C.version ).toBe( "https://carbonldp.com/ns/v1/platform#version" );
		} );

		it( "C.target", ():void => {
			expect( C.target ).toEqual( jasmine.any( String ) );
			expect( C.target ).toBe( "https://carbonldp.com/ns/v1/platform#target" );
		} );

		it( "C.targetMember", ():void => {
			expect( C.targetMember ).toEqual( jasmine.any( String ) );
			expect( C.targetMember ).toBe( "https://carbonldp.com/ns/v1/platform#targetMember" );
		} );

	} );

} );
