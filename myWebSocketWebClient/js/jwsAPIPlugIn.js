//	---------------------------------------------------------------------------
//	jWebSocket API PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------

//:author:*:kyberneees
//:author:*:aschulze

//:package:*:jws
//:class:*:jws.APIPlugInClass
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.APIPlugIn[/tt] instance plug-in. This _
//:d:en:plug-in provides the methods to register and unregister at certain _
//:d:en:stream sn the server.
jws.APIPlugInClass = {

	//:const:*:NS:String:org.jwebsocket.plugins.API (jws.NS_BASE + ".plugins.api")
	//:d:en:Namespace for the [tt]APIPlugIn[/tt] class.
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.api",
	//:const:*:ID:String:APIPlugIn
	//:d:en:Id for the [tt]APIPlugIn[/tt] class.
	ID: "api",

	hasPlugIn: function( aId, aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "hasPlugIn",
			plugin_id: aId
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	getPlugInAPI: function( aId, aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "getPlugInAPI",
			plugin_id: aId
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	supportsToken: function( aId, aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "supportsToken",
			token_type: aId
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	getServerAPI: function( aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "getServerAPI"
		};
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	getPlugInsIds: function( aOptions ) {
		var lToken = {
			ns: jws.APIPlugInClass.NS,
			type: "getPlugInIds"
		}
		var lOptions = {};
		if( aOptions ) {
			if( aOptions.OnResponse ) {
				lOptions.OnResponse = aOptions.OnResponse;
			}
		}
		this.conn.sendToken( lToken, lOptions );
	},

	createSpecFromAPI: function( aConn, aServerPlugIn ) {

		// a plug-in might have more than one feature
		var lCnt =  aServerPlugIn.supportedTokens.length;
		var lSpecs = [];

		for( var lIdx = 0; lIdx < lCnt; lIdx++ ) {

			var lToken = aServerPlugIn.supportedTokens[ lIdx ];
			lToken.ns = aServerPlugIn.namespace;

			// console.log( JSON.stringify( lToken ) );

			// this is the function which has to be executed as a parameter
			// of the it call within a describe statement (actually the suite).
			var lItFunc = function () {
				var lResponseReceived = false;
				// create the automated test token
				var lTestToken = {
					ns: lToken.ns,
					type: lToken.type
				};
				// add all arguments
				var lInArgs = lToken.inArguments;
				for( var lInArgIdx = 0, lInArgCnt = lInArgs.length; lInArgIdx < lInArgCnt; lInArgIdx++ ) {
					var lInArg = lInArgs[ lInArgIdx ];
					lTestToken[ lInArg.name ]  = lInArg.testValue;
				}
				console.log( "Automatically sending " + JSON.stringify( lTestToken ) );
				aConn.sendToken( lTestToken, {
					OnResponse: function( aToken ) {
						console.log( "Received auto response: " + JSON.stringify( aToken ) );
						lResponseReceived = true;
					}
				});

				waitsFor(
					function() {
						return lResponseReceived == true;
					},
					"test",
					20000
				);

				runs( function() {
					expect( lResponseReceived ).toEqual( true );
					// stop watch for this spec
					// jws.StopWatchPlugIn.stopWatch( "defAPIspec" );
				});
			};

			lSpecs.push( lItFunc );
		}
		// here the spec function are created and returned only
		// but not yet executed!
		return lSpecs;
	}

};

jws.APIPlugIn = function() {
	// do NOT use this.conn = aConn; here!
	// Add the plug-in via conn.addPlugin instead!

	// here you can add optonal instance fields
	}

jws.APIPlugIn.prototype = jws.APIPlugInClass;
