/// <reference path="../typings/es6/es6.d.ts" />


function hasFunction( object:Object, functionName:string ):boolean {
	return typeof object[ functionName ] === 'function';
}

function hasProperty( object:Object, property:string ):boolean {
	if ( ! object ) return false;
	return 'undefined' !== typeof object[ property ];
}

function hasPropertyDefined( object:Object, property:string ):boolean {
	return ! ! Object.getOwnPropertyDescriptor( object, property );
}

function isNull( value:any ):boolean {
	return value === null;
}

function isArray( object:any ):boolean {
	return Object.prototype.toString.call( object ) === '[object Array]';
}

function isString( string:any ):boolean {
	return typeof string == 'string' || string instanceof String;
}

function isBoolean( boolean:any ):boolean {
	return typeof boolean == 'boolean';
}

function isNumber( number:any ):boolean {
	return typeof number == 'number' || number instanceof Number;
}

function isInteger( number:any ):boolean {
	if ( ! isNumber( number ) )return false;
	return number % 1 == 0;
}

function isDouble( number:any ):boolean {
	if ( ! isNumber( number ) ) return false;
	return number % 1 != 0;
}

function isDate( date:any ):boolean {
	return typeof date == 'date' || date instanceof Date;
}

function isObject( object:any ):boolean {
	return typeof object === 'object' && ( ! ! object );
}

function isFunction( value:any ):boolean {
	return typeof value === 'function';
}

function isMap( value:any ):boolean {
	//@formatter:off
	return (
		isObject( value ) &&

		hasFunction( value, 'get' ) &&
		hasFunction( value, 'has' ) &&
		hasProperty( value, 'size' ) &&
		hasFunction( value, 'clear' ) &&
		hasFunction( value, 'delete' ) &&
		hasFunction( value, 'entries' ) &&
		hasFunction( value, 'forEach' ) &&
		hasFunction( value, 'get' ) &&
		hasFunction( value, 'has' ) &&
		hasFunction( value, 'keys' ) &&
		hasFunction( value, 'set' ) &&
		hasFunction( value, 'values' )
	);
	//@formatter:on
}

function parseBoolean( value:string ):boolean {
	if ( ! isString( value ) ) return false;

	switch ( value.toLowerCase() ) {
		case "true":
		case "yes":
		case "y":
		case "1":
			return true;
		case "false":
		case "no":
		case "n":
		case "0":
		default:
			return false;
	}
}

function extend( ...target:Object[] ):Object {
	if ( arguments.length <= 1 ) return;
	for ( var i = 1, length = arguments.length; i < length; i ++ ) {
		var toMerge = arguments[ i ];
		if ( isObject( toMerge ) ) {
			for ( var name in toMerge ) {
				if ( toMerge.hasOwnProperty( name ) ) {
					target[ name ] = toMerge[ name ];
				}
			}
		}
	}
	return target;
}

function forEachOwnProperty( object:Object, action:( name:string, value:any )=>void ) {
	if ( ! isObject( object ) ) throw new Error( 'IllegalArgument' );
	for ( var name in object ) {
		if ( object.hasOwnProperty( name ) ) {
			action( name, object[ name ] );
		}
	}
}

class S {
	static startsWith( string:string, substring:string ):boolean {
		return string.lastIndexOf( substring, 0 ) === 0;
	}

	static endsWith( string:string, substring:string ):boolean {
		return string.indexOf( substring, string.length - substring.length ) !== - 1;
	}

	static contains( string:string, substring:string ):boolean {
		return string.indexOf( substring ) !== - 1;
	}
}

class A {
	static from<T>( iterator:Iterator<T> ):Array<T> {
		var array:Array<T> = [];
		var next:IteratorValue<T>;
		while ( ! ( next = iterator.next() ).done ) {
			array.push( next.value );
		}
		return array;
	}

	static joinWithoutDuplicates<T>( ...arrays:Array<Array<T>> ):Array<T> {
		var result:Array<T> = arrays[ 0 ].slice();

		for ( let i:number = 1, length:number = arrays.length; i < length; i ++ ) {
			result = result.concat( arrays[ i ].filter( function ( item ) {
				return result.indexOf( item ) < 0;
			} ) );
		}

		return result;
	}
}

class M {
	static from<V>( object:Object ):Map<string,V> {
		var map:Map<string, V> = new Map<string, V>();
		forEachOwnProperty( object, ( name:string, value:any ) => {
			map.set( name, value );
		} );
		return map;
	}

	static extend<K,V>( toExtend:Map<K,V>, ...extenders:Map<K,V>[] ):Map<K,V> {
		for ( let i:number = 0, length:number = extenders.length; i < length; i ++ ) {
			var extender:Map<K,V> = extenders[ i ];
			var values:Iterator<Array<(K|V)>> = extender.entries();

			var next:IteratorValue<Array<(K|V)>>;
			while ( ! ( next = values.next() ).done ) {
				var entry:Array<(K|V)> = next.value;
				var key:K = <K> entry[ 0 ];
				var value:V = <V> entry[ 1 ];
				if ( ! toExtend.has( key ) ) toExtend.set( key, value );
			}
		}
		return toExtend;
	}
}

//@formatter:off
export {
	hasFunction,
	hasProperty,
	hasPropertyDefined,
	isNull,
	isArray,
	isString,
	isBoolean,
	isNumber,
	isInteger,
	isDouble,
	isDate,
	isObject,
	isFunction,
	isMap,
	parseBoolean,
	extend,
	forEachOwnProperty,
	S,
	A,
	M
};
//@foramtter:on