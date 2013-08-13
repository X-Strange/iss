//	---------------------------------------------------------------------------
//	jWebSocket Streaming PlugIn (uses jWebSocket Client and Server)
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


//	---------------------------------------------------------------------------
//  jWebSocket Streaming Plug-In
//	---------------------------------------------------------------------------

//:package:*:jws
//:class:*:jws.StreamingPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.StreamingPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to register and unregister at certain _
//:d:en:stream sn the server.
jws.StreamingPlugIn = {

	//:const:*:NS:String:org.jwebsocket.plugins.streaming (jws.NS_BASE + ".plugins.streaming")
	//:d:en:Namespace for the [tt]StreamingPlugIn[/tt] class.
	// if namespace changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.streaming",

	//:m:*:registerStream
	//:d:en:Registers the client at the given stream on the server. _
	//:d:en:After this operation the client obtains all messages in this _
	//:d:en:stream. Basically a client can register at multiple streams.
	//:d:en:If no stream with the given ID exists on the server an error token _
	//:d:en:is returned. Depending on the type of the stream it may take more _
	//:d:en:or less time until you get the first token from the stream.
	//:a:en::aStream:String:The id of the server side data stream.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get noticed on error or success.
	registerStream: function( aStream, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.StreamingPlugIn.NS,
				type: "register",
				stream: aStream
			}, aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	//:m:*:unregisterStream
	//:d:en:Unregisters the client from the given stream on the server.
	//:a:en::aStream:String:The id of the server side data stream.
	//:r:*:::void:none
	// TODO: introduce OnResponse here too to get noticed on error or success.
	unregisterStream: function( aStream, aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			this.sendToken({
				ns: jws.StreamingPlugIn.NS,
				type: "unregister",
				stream: aStream
			}, aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	}
};

// add the StreamingPlugIn PlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.StreamingPlugIn );
