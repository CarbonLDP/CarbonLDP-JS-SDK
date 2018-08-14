import { Document } from "../Document/Document";

import { DocumentsRegistry } from "../DocumentsRegistry/DocumentsRegistry";
import { DocumentsRepository } from "../DocumentsRepository/DocumentsRepository";

import { IllegalStateError } from "../Errors/IllegalStateError";

import { MessagingService } from "../Messaging/MessagingService";

import { URI } from "../RDF/URI";

import { isObject, isString, ObjectUtils } from "../Utils";

import { AbstractContext } from "./AbstractContext";
import { DocumentPaths, DocumentsContextSettings, Paths } from "./DocumentsContextSettings";
import { GlobalContext } from "./GlobalContext";


export class DocumentsContext extends AbstractContext<Document, Document, GlobalContext> {

	protected _baseURI:string;

	readonly registry:DocumentsRegistry;
	readonly repository:DocumentsRepository;
	readonly messaging:MessagingService;

	protected _settings?:DocumentsContextSettings;


	private static __mergePaths( this:void, target:Paths, source:Paths ):Paths {
		if( ! source ) return target;
		if( ! target ) return ObjectUtils.clone( source, { objects: true } );

		for( const key of Object.keys( source ) ) {
			const sourcePath:string | DocumentPaths = source[ key ];

			if( sourcePath === null ) {
				delete target[ key ];
				continue;
			}

			const targetPath:string | DocumentPaths = target[ key ];
			if( ! targetPath ) {
				target[ key ] = isObject( sourcePath ) ?
					ObjectUtils.clone( sourcePath, { objects: true } ) :
					sourcePath;
				continue;
			}

			if( isString( sourcePath ) ) {
				if( isObject( targetPath ) ) {
					targetPath.slug = sourcePath;
				} else {
					target[ key ] = sourcePath;
				}
				continue;
			}

			if( sourcePath.slug === void 0 && sourcePath.paths === void 0 ) continue;

			const targetDocPaths:DocumentPaths = isString( targetPath ) ?
				target[ key ] = { slug: targetPath } : targetPath;

			if( sourcePath.slug !== void 0 ) targetDocPaths.slug = sourcePath.slug;
			if( sourcePath.paths !== void 0 ) targetDocPaths.paths = DocumentsContext.__mergePaths( targetDocPaths.paths, sourcePath.paths );
		}

		return target;
	}


	constructor( url:string ) {
		super( GlobalContext.instance );
		this._baseURI = url;


		this.registry = DocumentsRegistry.createFrom( { context: this } );
		this.repository = DocumentsRepository.createFrom( { context: this } );

		this.messaging = new MessagingService( this );
	}


	/**
	 * Resolves the path provided into an URL using the `path` settings of the context.
	 * If such path does hasn't been declared an IllegalStateError will be thrown.
	 *
	 * Example: The path `system.platform` with the default setting:
	 * ```javascript
	 * {
	 *  paths: {
	 *      system: {
	 *          slug: ".system/",
	 *          paths: { platform: "platform/" }
	 *      }
	 *  }
	 * }```,
	 * This should resolve to something like `https://example.com/.system/platform/`.
	 *
	 * @param path The dot notation string that refers the path declared in the settings
	 * of the context.
	 *
	 * @returns The absolute URI of the path provided.
	 */
	_resolvePath( path:string ):string {
		const leftSearchedPaths:string[] = path.split( "." );
		const currentSearchedPaths:string[] = [];

		let url:string = "";
		let documentPaths:DocumentPaths[ "paths" ] = this._settings && this._settings.paths;
		while( leftSearchedPaths.length ) {
			const containerKey:string = leftSearchedPaths.shift();
			currentSearchedPaths.push( containerKey );

			const containerPath:string | DocumentPaths = documentPaths ? documentPaths[ containerKey ] : null;
			if( ! containerPath ) throw new IllegalStateError( `The path "${ currentSearchedPaths.join( "." ) }" hasn't been declared.` );

			const slug:string = isString( containerPath ) ? containerPath : containerPath.slug;
			if( ! slug ) throw new IllegalStateError( `The path "${ currentSearchedPaths.join( "." ) }" doesn't have a slug set.` );

			url = URI.resolve( url, slug );
			documentPaths = isObject( containerPath ) ? containerPath.paths : null;
		}

		return this.resolve( url );
	}

	protected _extendPaths( paths:Paths ):void {
		this._settings.paths = DocumentsContext.__mergePaths( this._settings.paths, paths );
	}

	protected _extendsSettings( settings:DocumentsContextSettings ):void {
		this._extendPaths( settings.paths );

		delete settings.paths;
		ObjectUtils.extend( this._settings, settings );
	}

}


