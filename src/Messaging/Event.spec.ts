import { enumeration, hasDefaultExport, hasEnumeral, isDefined, module } from "../test/JasmineExtender";
import * as MessagingEvent from "./Event";
import DefaultExport from "./Event";

describe( module( "Carbon/Messaging/Event" ), ():void => {

	it( isDefined(), ():void => {
		expect( MessagingEvent ).toBeDefined();
		expect( MessagingEvent ).toEqual( jasmine.any( Object ) );
	} );

	describe( enumeration( "Carbon.Messaging.Event" ), ():void => {

		it( isDefined(), ():void => {
			expect( MessagingEvent.Event ).toBeDefined();
			expect( MessagingEvent.Event ).toEqual( jasmine.any( Object ) );
		} );

		it( hasEnumeral( "CHILD_CREATED" ), ():void => {
			expect( MessagingEvent.Event.CHILD_CREATED ).toBeDefined();
			expect( MessagingEvent.Event.CHILD_CREATED ).toBe( "child.created" );
		} );

		it( hasEnumeral( "ACCESS_POINT_CREATED" ), ():void => {
			expect( MessagingEvent.Event.ACCESS_POINT_CREATED ).toBeDefined();
			expect( MessagingEvent.Event.ACCESS_POINT_CREATED ).toBe( "access-point.created" );
		} );

		it( hasEnumeral( "DOCUMENT_CREATED" ), ():void => {
			expect( MessagingEvent.Event.DOCUMENT_CREATED ).toBeDefined();
			expect( MessagingEvent.Event.DOCUMENT_CREATED ).toBe( "*.created" );
		} );

		it( hasEnumeral( "DOCUMENT_MODIFIED" ), ():void => {
			expect( MessagingEvent.Event.DOCUMENT_MODIFIED ).toBeDefined();
			expect( MessagingEvent.Event.DOCUMENT_MODIFIED ).toBe( "document.modified" );
		} );

		it( hasEnumeral( "DOCUMENT_DELETED" ), ():void => {
			expect( MessagingEvent.Event.DOCUMENT_DELETED ).toBeDefined();
			expect( MessagingEvent.Event.DOCUMENT_DELETED ).toBe( "document.deleted" );
		} );

		it( hasEnumeral( "MEMBER_ADDED" ), ():void => {
			expect( MessagingEvent.Event.MEMBER_ADDED ).toBeDefined();
			expect( MessagingEvent.Event.MEMBER_ADDED ).toBe( "member.added" );
		} );

		it( hasEnumeral( "MEMBER_REMOVED" ), ():void => {
			expect( MessagingEvent.Event.MEMBER_REMOVED ).toBeDefined();
			expect( MessagingEvent.Event.MEMBER_REMOVED ).toBe( "member.removed" );
		} );

	} );

	it( hasDefaultExport( "Carbon.Messaging.Event" ), ():void => {
		expect( DefaultExport ).toBeDefined();
		expect( DefaultExport ).toBe( MessagingEvent.Event );
	} );

} );