import DefaultExport, { PersistedAccessPoint } from "./PersistedAccessPoint";

import {
	extendsClass,
	hasDefaultExport,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
} from "./test/JasmineExtender";

describe( module( "Carbon/PersistedAccessPoint" ), ():void => {

	describe( interfaze(
		"Carbon.PersistedAccessPoint.PersistedAccessPoint",
		"Interface that represents a persisted Carbon LDP AccessPoint."
	), ():void => {

		it( extendsClass( "Carbon.AccessPoint.AccessPoint" ), ():void => {} );
		it( extendsClass( "Carbon.PersistedProtectedDocument.PersistedProtectedDocument" ), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"membershipResource",
			"Carbon.Pointer.Pointer",
			"The membership resource the access point belongs to."
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"hasMemberRelation",
			"Carbon.Pointer.Pointer",
			"The member relation of the access point manages."
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"isMemberOfRelation",
			"Carbon.Pointer.Pointer",
			"The inverted relation of the access point."
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"insertedContentRelation",
			"Carbon.Pointer.Pointer",
			"The inserted content relation of the access point."
		), ():void => {} );

	} );

	it( hasDefaultExport( "Carbon.PersistedAccessPoint.PersistedAccessPoint" ), ():void => {
		let defaultExport:DefaultExport = <any> {};
		let defaultTarget:PersistedAccessPoint;

		defaultTarget = defaultExport;
		expect( defaultTarget ).toEqual( jasmine.any( Object ) );
	} );

} );

