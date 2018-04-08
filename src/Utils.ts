export function hasFunction( object:Object, functionName:string ):boolean {
	return typeof object[ functionName ] === "function";
}

export function hasProperty( object:Object, property:string ):boolean {
	if( ! object ) return false;
	return isDefined( object[ property ] );
}

export function hasPropertyDefined( object:Object, property:string ):boolean {
	if( ! object ) return false;
	return ! ! Object.getOwnPropertyDescriptor( object, property );
}

export function isDefined( value:any ):boolean {
	return void 0 !== value;
}

export function isNull( value:any ):boolean {
	return value === null;
}

export function isArray( object:any ):object is Array<any> {
	return Array.isArray( object );
}

export function isString( value:any ):value is string {
	return typeof value === "string" || value instanceof String;
}

export function isBoolean( value:any ):value is boolean {
	return typeof value === "boolean";
}

export function isNumber( value:any ):value is number {
	return typeof value === "number" || value instanceof Number;
}

export function isInteger( value:any ):boolean {
	if( ! isNumber( value ) ) return false;
	return value % 1 === 0;
}

export function isDouble( value:any ):boolean {
	if( ! isNumber( value ) ) return false;
	return value % 1 !== 0;
}

export function isDate( date:any ):date is Date {
	return date instanceof Date || ( typeof date === "object" && Object.prototype.toString.call( date ) === "[object Date]" );
}

export function isObject( object:any ):object is object {
	return typeof object === "object" && ( ! ! object );
}

export function isPlainObject( object:Object ):boolean {
	return isObject( object )
		&& ! isArray( object )
		&& ! isDate( object )
		&& ! isMap( object )
		&& ! ( typeof Blob !== "undefined" && object instanceof Blob )
		&& ! ( Object.prototype.toString.call( object ) === "[object Set]" );
}

export function isFunction( value:any ):value is Function {
	return typeof value === "function";
}

export function isMap( value:any ):boolean {
	return (
		isObject( value ) &&

		hasFunction( value, "get" ) &&
		hasFunction( value, "has" ) &&
		hasProperty( value, "size" ) &&
		hasFunction( value, "clear" ) &&
		hasFunction( value, "delete" ) &&
		hasFunction( value, "entries" ) &&
		hasFunction( value, "forEach" ) &&
		hasFunction( value, "get" ) &&
		hasFunction( value, "has" ) &&
		hasFunction( value, "keys" ) &&
		hasFunction( value, "set" ) &&
		hasFunction( value, "values" )
	);
}

export function parseBoolean( value:string ):boolean {
	if( ! isString( value ) ) return false;

	/* tslint:disable: no-switch-case-fall-through */
	switch( value.toLowerCase() ) {
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
	/* tslint:enable: no-switch-case-fall-through */
}

export function forEachOwnProperty( object:Object, action:( name:string, value:any ) => ( boolean | void ) ):void {
	if( ! ( isObject( object ) || isFunction( object ) ) ) throw new Error( "IllegalArgument" );
	for( let name in object ) {
		if( object.hasOwnProperty( name ) ) {
			if( action( name, object[ name ] ) === false ) break;
		}
	}
}

export function promiseMethod<T>( fn?:() => T | Promise<T> ):Promise<T> {
	return new Promise<T>( resolve => resolve( fn ? fn() : void 0 ) );
}

export function mapTupleArray<T, W>( tuples:[ T, W ][] ):[ T[], W[] ] {
	const firsts:T[] = [];
	const seconds:W[] = [];

	tuples.forEach( tuple => {
		firsts.push( tuple[ 0 ] );
		seconds.push( tuple[ 1 ] );
	} );

	return [ firsts, seconds ];
}

export class ArrayUtils {
	static from<T>( iterator:Iterator<T> ):Array<T> {
		let array:Array<T> = [];
		let next:IteratorResult<T> = iterator.next();
		while( ! next.done ) {
			array.push( next.value );
			next = iterator.next();
		}
		return array;
	}

	static joinWithoutDuplicates<T>( ...arrays:Array<Array<T>> ):Array<T> {
		let result:Array<T> = arrays[ 0 ].slice();

		for( let i:number = 1, length:number = arrays.length; i < length; i ++ ) {
			result = result.concat( arrays[ i ].filter( function( item:T ):boolean {
				return result.indexOf( item ) < 0;
			} ) );
		}

		return result;
	}

	static indexOf<T, W>( array:Array<T>, searchedElement:W, comparator:( element:T, searchedElement:W ) => boolean = ( a:T, b:W ) => <any> a === <any> b ):number {
		if( ! array ) return - 1;

		for( let i:number = 0, length:number = array.length; i < length; ++ i ) {
			if( comparator( array[ i ], searchedElement ) ) return i;
		}
		return - 1;
	}
}

export class ObjectUtils {

	static extend<T extends object, W extends object>( target:T, source:W, config:{ arrays?:boolean, objects?:boolean } = { arrays: false, objects: false } ):T & W {
		if( ! isArray( source ) && ! isPlainObject( source ) || ! isArray( target ) && ! isPlainObject( target ) ) return null;

		(<any> source).__CarbonSDK_circularReferenceFlag = target;

		for( const key of Object.keys( source ) ) {
			if( isFunction( source[ key ] ) || key === "__CarbonSDK_circularReferenceFlag" ) continue;

			let property:any = source[ key ];
			if( isArray( property ) && config.arrays || isPlainObject( property ) && config.objects ) {
				if( "__CarbonSDK_circularReferenceFlag" in property ) {
					property = property.__CarbonSDK_circularReferenceFlag;
				} else {
					property = ! ( key in target ) || target[ key ].constructor !== property.constructor ?
						ObjectUtils.clone( property, config ) :
						ObjectUtils.extend( target[ key ], property, config );
				}
			}

			if( property === null ) {
				if( target[ key ] ) delete target[ key ];
				continue;
			}

			target[ key ] = property;
		}

		delete (<any> source).__CarbonSDK_circularReferenceFlag;
		return target as T & W;
	}

	static clone<T extends Object>( object:T, config:{ arrays?:boolean, objects?:boolean } = { arrays: false, objects: false } ):T {
		let isAnArray:boolean = isArray( object );
		if( ! isAnArray && ! isPlainObject( object ) ) return null;

		let clone:T = <T> ( isAnArray ? [] : Object.create( Object.getPrototypeOf( object ) ) );
		return ObjectUtils.extend<T, T>( clone, object, config );
	}

	static areEqual( object1:Object, object2:Object, config:{ arrays?:boolean, objects?:boolean } = { arrays: false, objects: false }, ignore:{ [ key:string ]:boolean } = {} ):boolean {
		return internalAreEqual( object1, object2, config, [ object1 ], [ object2 ], ignore );
	}

	static areShallowlyEqual( object1:Object, object2:Object ):boolean {
		if( object1 === object2 ) return true;
		if( ! isObject( object1 ) || ! isObject( object2 ) ) return false;

		let properties:string[] = [];
		for( let propertyName in object1 ) {
			if( ! object1.hasOwnProperty( propertyName ) ) continue;
			if( isFunction( object1[ propertyName ] ) ) continue;
			if( ! ( propertyName in object2 ) ) return false;
			if( object1[ propertyName ] !== object2[ propertyName ] ) return false;
			properties.push( propertyName );
		}

		for( let propertyName in object2 ) {
			if( ! object2.hasOwnProperty( propertyName ) ) continue;
			if( isFunction( object2[ propertyName ] ) ) continue;
			if( ! ( propertyName in object1 ) ) return false;
			if( properties.indexOf( propertyName ) === - 1 ) return false;
		}

		return true;
	}
}

function internalAreEqual( object1:Object, object2:Object, config:{ arrays?:boolean, objects?:boolean }, stack1:any[], stack2:any[], ignore:{ [ key:string ]:boolean } = {} ):boolean {
	if( object1 === object2 ) return true;
	if( ! isObject( object1 ) || ! isObject( object2 ) ) return false;

	if( isDate( object1 ) ) return (<Date> object1).getTime() === (<Date> object2).getTime();

	let keys:string[] = ArrayUtils.joinWithoutDuplicates( Object.keys( object1 ), Object.keys( object2 ) );
	for( let key of keys ) {
		if( ! ( key in object1 ) || ! ( key in object2 ) ) return false;
		if( typeof object1 !== typeof object2 ) return false;
		if( key in ignore ) continue;

		if( isFunction( object1[ key ] ) ) continue;

		let firstIsPlainObject:boolean = isPlainObject( object1[ key ] );
		if( isArray( object1[ key ] ) && config.arrays ||
			firstIsPlainObject && config.objects ||
			isDate( object1[ key ] ) ) {

			if( firstIsPlainObject ) {
				let lengthStack:number = stack1.length;
				while( lengthStack -- ) {
					if( stack1[ lengthStack ] === object1[ key ] ) return stack2[ lengthStack ] === object2[ key ];
				}

				stack1.push( object1[ key ] );
				stack2.push( object2[ key ] );
			}

			if( ! internalAreEqual( object1[ key ], object2[ key ], config, stack1, stack2 ) ) return false;

			if( firstIsPlainObject ) {
				stack1.pop();
				stack2.pop();
			}
		} else {
			if( object1[ key ] !== object2[ key ] ) return false;
		}
	}

	return true;
}

export class StringUtils {
	static startsWith( str:string, substring:string ):boolean {
		return str.lastIndexOf( substring, 0 ) === 0;
	}

	static endsWith( str:string, substring:string ):boolean {
		return str.indexOf( substring, str.length - substring.length ) !== - 1;
	}

	static contains( str:string, substring:string ):boolean {
		return str.indexOf( substring ) !== - 1;
	}
}

export class MapUtils {
	static from<V>( object:Object ):Map<string, V> {
		let map:Map<string, V> = new Map<string, V>();
		forEachOwnProperty( object, ( name:string, value:any ) => {
			map.set( name, value );
		} );
		return map;
	}

	static extend<K, V>( toExtend:Map<K, V>, ...extenders:Map<K, V>[] ):Map<K, V> {
		for( let i:number = 0, length:number = extenders.length; i < length; i ++ ) {
			let extender:Map<K, V> = extenders[ i ];
			let values:Iterator<Array<(K | V)>> = extender.entries();

			let next:IteratorResult<Array<(K | V)>> = values.next();
			while( ! next.done ) {
				let entry:Array<(K | V)> = next.value;
				let key:K = <K> entry[ 0 ];
				let value:V = <V> entry[ 1 ];
				toExtend.set( key, value );

				next = values.next();
			}
		}
		return toExtend;
	}
}

export class UUIDUtils {
	private static regExp:RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	public static is( uuid:string ):boolean {
		return UUIDUtils.regExp.test( uuid );
	}

	public static generate():string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function( c:string ):string {
			let r:number = Math.random() * 16 | 0;
			let v:number = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString( 16 );
		} );
	}
}
