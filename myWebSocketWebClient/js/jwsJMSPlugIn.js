//	---------------------------------------------------------------------------
//	jWebSocket JMS PlugIn (uses jWebSocket Client and Server)
//	(c) 2011 Innotrade GmbH - jWebSocket.org, Alexander Schulze
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

//:author:*:Johannes Smutny

//:package:*:jws
//:class:*:jws.JMSPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.JMSPlugIn[/tt] class. This _
//:d:en:plug-in provides the methods to subscribe and unsubscribe at certain _
//:d:en:channel on the server.
jws.JMSPlugIn = {

	// :const:*:NS:String:org.jwebsocket.plugins.channels (jws.NS_BASE +
	// ".plugins.channels")
	// :d:en:Namespace for the [tt]ChannelPlugIn[/tt] class.
	// if namespace changes update server plug-in accordingly!
	NS : jws.NS_BASE + ".plugins.jms",

	SEND_TEXT : "sendJmsText",
	SEND_TEXT_MESSAGE : "sendJmsTextMessage",
	SEND_MAP : "sendJmsMap",
	SEND_MAP_MESSAGE : "sendJmsMapMessage",
	LISTEN : "listenJms",
	LISTEN_MESSAGE : "listenJmsMessage",
	UNLISTEN : "unlistenJms",

	listenJms : function(aConnectionFactoryName, aDestinationName, 
		aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.LISTEN,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain
			}, aOptions );
		}
		return lRes;
	},

	listenJmsMessage : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.LISTEN_MESSAGE,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain
			}, aOptions );
		}
		return lRes;
	},

	unlistenJms : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aOptions) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.UNLISTEN,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain
			}, aOptions );
		}
		return lRes;
	},
	

	sendJmsText : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aText, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_TEXT,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aText
			}, aOptions );
		}
		return lRes;
	},

	sendJmsTextMessage : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aText, aJmsHeaderProperties, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_TEXT_MESSAGE,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aText,
				jmsHeaderProperties : aJmsHeaderProperties
			}, aOptions );
		}
		return lRes;
	},

	sendJmsMap : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aMap, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_MAP,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aMap
			}, aOptions );
		}
		return lRes;
	},
	
	sendJmsMapMessage : function(aConnectionFactoryName, aDestinationName,
		aPubSubDomain, aMap, aJmsHeaderProperties, aOptions ) {
		var lRes = this.checkConnected();
		if (0 == lRes.code) {
			this.sendToken({
				ns : jws.JMSPlugIn.NS,
				type : jws.JMSPlugIn.SEND_MAP_MESSAGE,
				connectionFactoryName : aConnectionFactoryName,
				destinationName : aDestinationName,
				pubSubDomain : aPubSubDomain,
				msgPayLoad : aMap,
				jmsHeaderProperties : aJmsHeaderProperties
			}, aOptions );
		}
		return lRes;
	},

	processToken : function(aToken) {
		// check if namespace matches
		if (aToken.ns == jws.JMSPlugIn.NS) {
			// here you can handle incoming tokens from the server
			// directy in the plug-in if desired.
			if ("event" == aToken.type) {
				if ("handleJmsText" == aToken.name) {
					if (this.OnHandleJmsText) {
						this.OnHandleJmsText(aToken);
					}
				} else if ("handleJmsTextMessage" == aToken.name) {
					if (this.OnHandleJmsTextMessage) {
						this.OnHandleJmsTextMessage(aToken);
					}
				} else if ("handleJmsMap" == aToken.name) {
					if (this.OnHandleJmsMap) {
						this.OnHandleJmsMap(aToken);
					}
				} else if ("handleJmsMapMessage" == aToken.name) {
					if (this.OnHandleJmsMapMessage) {
						this.OnHandleJmsMapMessage(aToken);
					}
				}
			}
		}
	},

	setHandleMessageCallbacks : function(aListeners) {
		if (!aListeners) {
			aListeners = {};
		}
		if (aListeners.OnHandleJmsText !== undefined) {
			this.OnHandleJmsText = aListeners.OnHandleJmsText;
		}
		if (aListeners.OnHandleJmsTextMessage !== undefined) {
			this.OnHandleJmsTextMessage = aListeners.OnHandleJmsTextMessage;
		}
		if (aListeners.OnHandleJmsMap !== undefined) {
			this.OnHandleJmsMap = aListeners.OnHandleJmsMap;
		}
		if (aListeners.OnHandleJmsMapMessage !== undefined) {
			this.OnHandleJmsMapMessage = aListeners.OnHandleJmsMapMessage;
		}
	}

};
// add the JMSPlugIn PlugIn into the jWebSocketTokenClient class
jws.oop.addPlugIn(jws.jWebSocketTokenClient, jws.JMSPlugIn);
