import { Documents } from "../Documents";
import {
	DigestedObjectSchema,
	ObjectSchemaResolver,
} from "../ObjectSchema";
import { Document }from "../Document";
import { Resource }from "../Resource";
import {
	Pointer,
	PointerLibrary,
} from "../Pointer";
import { RDFDocument }from "../RDF/Document";
import { RDFNode }from "../RDF/Node";
import { PartialMetadata } from "../SPARQL/QueryDocument/PartialMetadata";
import { QueryContextBuilder } from "../SPARQL/QueryDocument/QueryContextBuilder";
import { QueryPropertyType } from "../SPARQL/QueryDocument/QueryProperty";
import { JSONLDConverter } from "./Converter";


interface CompactionNode {
	paths:string[];
	node:RDFNode;
	resource:Resource;
	containerLibrary:PointerLibrary;
	processed?:boolean;
}

export class JSONLDCompacter {
	private documents:Documents;
	private root?:string;
	private resolver?:ObjectSchemaResolver;
	private converter?:JSONLDConverter;
	private compactionMap:Map<string, CompactionNode>;

	constructor( documents:Documents, root?:string, schemaResolver?:ObjectSchemaResolver, jsonldConverter?:JSONLDConverter ) {
		this.documents = documents;
		this.root = root;
		this.resolver = schemaResolver || documents;
		this.converter = jsonldConverter || documents.jsonldConverter;
		this.compactionMap = new Map();
	}

	compactDocument<T extends Document>( rdfDocument:RDFDocument ):T {
		const rdfDocuments:RDFDocument[] = [ rdfDocument ];
		return this.compactDocuments<T>( rdfDocuments )[ 0 ];
	}

	compactDocuments<T extends Document>( rdfDocuments:RDFDocument[], mainDocuments?:RDFDocument[] ):T[] {
		if( ! mainDocuments || ! mainDocuments.length ) mainDocuments = rdfDocuments;

		rdfDocuments.forEach( rdfDocument => {
			const [ [ documentNode ], fragmentNodes ] = RDFDocument.getNodes( rdfDocument );
			const targetDocument:Document = this.getResource( documentNode, this.documents, true );

			const fragmentsSet:Set<string> = new Set( targetDocument._fragmentsIndex.keys() );

			fragmentNodes.forEach( fragmentNode => {
				const fragmentID:string = RDFNode.getRelativeID( fragmentNode );
				if( fragmentsSet.has( fragmentID ) ) fragmentsSet.delete( fragmentID );

				this.getResource( fragmentNode, targetDocument );
			} );

			fragmentsSet.forEach( targetDocument._removeFragment, targetDocument );
		} );

		const compactedDocuments:Document[] = rdfDocuments
			.map( rdfDocument => rdfDocument[ "@id" ] )
			.map( this.compactionMap.get, this.compactionMap )
			.map( compactionNode => compactionNode.resource as any );

		const compactionQueue:string[] = mainDocuments
			.map( rdfDocument => rdfDocument[ "@id" ] );

		const mainCompactedDocuments:T[] = compactionQueue
			.map( this.compactionMap.get, this.compactionMap )
			.map( compactionNode => {
				if( this.root ) compactionNode.paths.push( this.root );

				return compactionNode.resource as any;
			} );

		while( compactionQueue.length ) {
			this.processCompactionQueue( compactionQueue );

			this.compactionMap.forEach( ( node, key, map ) => {
				if( node.processed ) map.delete( key );
			} );

			if( this.compactionMap.size ) compactionQueue
				.push( this.compactionMap.keys().next().value );
		}

		compactedDocuments.forEach( persistedDocument => {
			persistedDocument._syncSavedFragments();

			persistedDocument.types
				.map( type => this.documents.documentDecorators.get( type ) )
				.forEach( decorator => decorator && decorator.call( void 0, persistedDocument, this.documents ) );
		} );

		return mainCompactedDocuments;
	}

	private compactNode( node:RDFNode, resource:Resource, containerLibrary:PointerLibrary, path:string ):string[] {
		const schema:DigestedObjectSchema = this.resolver.getSchemaFor( node, path );

		if( this.resolver instanceof QueryContextBuilder ) {
			const type:QueryPropertyType = this.resolver.hasProperty( path ) ?
				this.resolver.getProperty( path ).getType() : void 0;

			if( type === QueryPropertyType.PARTIAL || type === QueryPropertyType.ALL ) {
				resource._partialMetadata = new PartialMetadata(
					type === QueryPropertyType.ALL ? PartialMetadata.ALL : schema,
					resource._partialMetadata
				);
			}
		}

		const compactedData:object = this.converter.compact( node, {}, schema, containerLibrary, resource.isPartial() );

		const addedProperties:string[] = [];

		new Set( [
			...Object.keys( resource ),
			...Object.keys( compactedData ),
		] ).forEach( key => {
			if( ! compactedData.hasOwnProperty( key ) ) {
				if( ! resource.isPartial() || schema.properties.has( key ) ) delete resource[ key ];
				return;
			}

			addedProperties.push( key );

			if( ! Array.isArray( resource[ key ] ) ) {
				resource[ key ] = compactedData[ key ];
				return;
			}

			const values:any[] = Array.isArray( compactedData[ key ] ) ? compactedData[ key ] : [ compactedData[ key ] ];
			resource[ key ].length = 0;
			resource[ key ].push( ...values );
		} );

		return addedProperties
			.filter( x => schema.properties.has( x ) )
			;
	}

	private getResource<T extends Resource>( node:RDFNode, containerLibrary:PointerLibrary, isDocument?:boolean ):T {
		const resource:T = containerLibrary.getPointer( node[ "@id" ] ) as any;

		if( isDocument ) containerLibrary = Document.decorate( resource, this.documents );
		this.compactionMap.set( resource.id, { paths: [], node, resource, containerLibrary } );

		return resource;
	}

	private processCompactionQueue( compactionQueue:string[] ):void {
		while( compactionQueue.length ) {
			const targetNode:string = compactionQueue.shift();

			if( ! this.compactionMap.has( targetNode ) ) continue;
			const compactionNode:CompactionNode = this.compactionMap.get( targetNode );
			compactionNode.processed = true;

			const targetPath:string = compactionNode.paths.shift();

			const addedProperties:string[] = this.compactNode( compactionNode.node, compactionNode.resource, compactionNode.containerLibrary, targetPath );
			compactionNode.resource._syncSnapshot();

			for( const propertyName of addedProperties ) {
				if( ! compactionNode.resource.hasOwnProperty( propertyName ) ) continue;

				const value:any = compactionNode.resource[ propertyName ];
				const values:any[] = Array.isArray( value ) ? value : [ value ];

				const pointers:Pointer[] = values.filter( Pointer.is );
				for( const pointer of pointers ) {
					if( ! this.compactionMap.has( pointer.id ) ) continue;
					const subCompactionNode:CompactionNode = this.compactionMap.get( pointer.id );

					if( targetPath ) {
						const subPath:string = `${ targetPath }.${ propertyName }`;
						if( ! this.resolver.hasSchemaFor( subCompactionNode.node, subPath ) ) continue;

						subCompactionNode.paths.push( subPath );
						compactionQueue.push( pointer.id );
					}
				}
			}
		}
	}

}
