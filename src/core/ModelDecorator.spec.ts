import {
	hasMethod,
	interfaze,
	module,
	OBLIGATORY
} from "../test/JasmineExtender";

import { ModelDecorator } from "./ModelDecorator";

describe( module( "carbonldp/ModelDecorator" ), ():void => {

	describe( interfaze( "CarbonLDP.ModelDecorator", [ "T extends object" ], "Interface with the standard methods of a model decorator" ), ():void => {

		it( hasMethod(
			OBLIGATORY,
			"isDecorated",
			[
				{ name: "object", type: "object" },
			],
			{ type: "object is T" }
		), ():void => {
			const target:ModelDecorator<any>[ "isDecorated" ] = ( object ):object is any => ! ! object;
			expect( target ).toBeDefined();
		} );

		it( hasMethod(
			OBLIGATORY,
			"decorate",
			[ "W extends object" ],
			[
				{ name: "object", type: "W" },
			],
			{ type: "W & T" }
		), ():void => {
			const target:ModelDecorator<any>[ "decorate" ] = ( object ) => object;
			expect( target ).toBeDefined();
		} );

	} );

} );