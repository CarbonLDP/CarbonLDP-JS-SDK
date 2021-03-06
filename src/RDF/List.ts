import * as Utils from "./../Utils";
import { RDFValue } from "./Value";


/**
 * Interface that represents an RDF List.
 */
export interface RDFList {
	/**
	 * Array of the elements in the list.
	 */
	"@list":RDFValue[];
}


/**
 * Factory and utils for {@link RDFList}.
 */
export interface RDFListFactory {
	/**
	 * Returns true if the object provided is considered a {@link RDFList} object.
	 * @param value
	 */
	is( value:any ):value is RDFList;
}

/**
 * Constant with the factory, decorator and/or utils for a {@link RDFList} object.
 */
export const RDFList:{
	/**
	 * Returns true when the value provided is considered to be a {@link RDFList}.
	 */
	is( value:any ):value is RDFList;
} = <RDFListFactory> {
	is( value:any ):value is RDFList {
		return Utils.hasPropertyDefined( value, "@list" );
	},
};

