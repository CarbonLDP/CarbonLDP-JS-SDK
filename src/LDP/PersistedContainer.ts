import * as PersistedDocument from "./../PersistedDocument";
import * as RDF from "./../RDF";

export interface Class extends PersistedDocument.Class {
	createChild( object:Object ):Promise<void>;
}

function createChild( object:Object ):Promise<void> {
	// TODO
	return null;
}

export class Factory {
	create():Class {
		// TODO
		return null;
	}

	createFrom<T extends Object>( object:T ):T & Class {
		// TODO
		return null;
	}

	decorate<T extends Object>( object:T ):T & Class {
		// TODO
		return null;
	}
}

export let factory:Factory = new Factory();
