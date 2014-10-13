(function ( Carbon, $, jsonld, Map, _shared ) {
	'use strict';

	var _app = {};

	_app.class = Carbon.DefaultPrefixes.cs + 'Application';
	_app.Property = {
		slug  : {
			uri    : Carbon.DefaultPrefixes.c + 'slug',
			multi  : false,
			literal: true
		},
		name  : {
			uri    : Carbon.DefaultPrefixes.doap + "name",
			multi  : false,
			literal: true
		},
		domain: {
			uri    : Carbon.DefaultPrefixes.cs + 'sourceDomain',
			multi  : true,
			literal: false
		}
	};

	_app.create = function ( uri ) {
		uri = typeof uri !== 'undefined' ? uri : Carbon.getGenericRequestURI();

		var appResource = Carbon.Resource.create( uri );
		appResource.addType( _app.class );

		_app.injectMethods( appResource );

		return appResource;
	};

	_app.isApp = function ( resource ) {
		if ( ! Carbon.Resource.isResource( resource ) ) return false;
		return resource.isOfType( _app.class );
	};

	_app.injectMethods = function ( resources ) {
		if ( ! ( resources instanceof Array ) ) {
			resources = [ resources ];
		}

		resources.forEach( function ( resource ) {

			Carbon.Resource.injectPropertyMethods( resource, _app.Property );

		} );
	};

	_app.getApps = function () {
		var uri = _shared.requestProtocol + _shared.domain + _shared.endpoints.apps;

		var deferred = $.Deferred();

		// TODO: Use inline option to get them all at once
		return Carbon.SourceLibrary.get( uri )
			.then(
				function ( appsContainer ) {
					var members = appsContainer.listMemberURIs();
					if ( ! members ) {
						// Return an empty array
						deferred.resolve([]);
						return;
					}

					return Carbon.SourceLibrary.get( members );
				}
			)
		;
	};

	Carbon.Auth.App = _app;
}( Carbon, jQuery, jsonld, Map, _shared ));