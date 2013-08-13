//	****************************************************************************
//	jWebSocket Hello World (uses jWebSocket Client and Server)
//	(C) 2010 Alexander Schulze, jWebSocket.org, Innotrade GmbH, Herzogenrath
//	****************************************************************************
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
//	****************************************************************************

/*
 * @author vbarzana
 */
$.widget("jws.auth",{
    
	_init:function(){
		w.auth   = this;
		
		// Stores the jWebSocketJSONClient
		mWSC = null;
		
		w.auth.eLogoffArea		= w.auth.element.find("#logoff_area");
		w.auth.eLogonArea		= w.auth.element.find("#login_area");
		w.auth.eUsername		= w.auth.element.find("#user_text");
		w.auth.ePassword		= w.auth.element.find("#user_password");
		w.auth.eClientStatus	= w.auth.element.find("#client_status");
		w.auth.eUserInfoName	= w.auth.element.find("#user_info_name");
		w.auth.eWebSocketType	= w.auth.element.find("#websocket_type");
		w.auth.eClientId		= w.auth.element.find("#client_id");
		w.auth.eLoginButton		= w.auth.element.find('#login_button');
		w.auth.eLogoffButton	= w.auth.element.find('#logoff_button');
		w.auth.eConnectButton	= w.auth.element.find('#connect_button');
		w.auth.eDisConnectButton= w.auth.element.find('#disconnect_button');
		
		w.auth.eDisConnectButton.hide();
		w.auth.eLogoffArea.hide();
		
		w.auth.mUsername = null;
		
		w.auth.checkWebSocketSupport();
		
		w.auth.registerEvents();
	},
	
	checkWebSocketSupport: function(){
		if( jws.browserSupportsWebSockets( ) ) {
			mWSC = new jws.jWebSocketJSONClient( );
			// Setting the type of WebSocket
			w.auth.eWebSocketType.text("WebSocket: " + 
				(jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)" ));
		} else {
			var lMsg = jws.MSG_WS_NOT_SUPPORTED;
			alert( lMsg );
			if( mLog.isDebugEnabled ) {
				log( lMsg );
			}
		}
	},
	
	registerEvents: function() {
		//adding click functions
		w.auth.eLoginButton.click( function() {
			// If there is not a connect button
			if( !w.auth.eConnectButton.attr("id") ) {
				// we open the connection and then login
				w.auth.logon();
			} else {
				// must be connected, otherwise it won't work
				w.auth.login();
			}
		});
		w.auth.eLogoffButton.click( 
			function(){
				// If there is not a connect button
				if( !w.auth.eConnectButton.attr("id") ) {
					// logout and close the connection
					w.auth.disconnect();
				} else {
					// just logout
					w.auth.logoff();
				}
			}
			);
		
		w.auth.eConnectButton.click( w.auth.connect );
		w.auth.eDisConnectButton.click( w.auth.disconnect );
		
		w.auth.eUsername.keypress( w.auth.eUsernameKeypress );
		w.auth.ePassword.keypress( w.auth.ePasswordKeypress );
	},
	
	// Logs in, only if there is connection with the server, otherwise it won't work
	login: function() {
		if( mWSC ) {
			if( mLog.isDebugEnabled ) {
				log( "Logging in..." );
			}
			
			try {
				// you can choose the username entered by the user or 
				// jWebSocket defalut jws.GUEST_USER_LOGINNAME
				var lUsername = w.auth.eUsername.val( );
				// jWebSocket defalut jws.GUEST_USER_PASSWORD
				var lPassword = w.auth.ePassword.val( );
		
				var lRes = mWSC.login(
					lUsername,
					lPassword
					);
				
				if( lRes.code == 0 ) {
					if( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}
					
				} else {
					if( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch( ex ) {
				console.log( ex.message );
				if( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},
	
	getCallbacks: function(){
		return {
			// use JSON sub protocol
			subProtocol:  (w.auth.options.subProtocol)?w.auth.options.subProtocol:jws.WS_SUBPROT_JSON,
			// connection timeout in ms
			openTimeout: (w.auth.options.timeout)?w.auth.options.timeout:3000,
				
			OnOpen: function( aEvent, aToken ) {
				if( w.auth.options.OnOpen ){
					w.auth.options.OnOpen( aEvent );
				}
				if( mLog.isDebugEnabled ) {
					log( "<font style='color:#888'>jWebSocket connection established.</font>" );
				}
				
				w.auth.eConnectButton.hide( );
				w.auth.eDisConnectButton.show( );
				
				mIsConnected = true;
				// Setting the status connected
				w.auth.eClientStatus.attr( "class", "online" ).text( "connected" );
			},
		
			// OnOpenTimeout callback
			OnOpenTimeout: function( aEvent ) {
				if(mLog.isDebugEnabled ) {
					log( "Opening timeout exceeded!" );
				}
					
				if( w.auth.options.OnOpenTimeout ){
					w.auth.options.OnOpenTimeout( aEvent );
				}
					
			},
			// OnReconnecting callback
			OnReconnecting: function( aEvent ) {
				if(mLog.isDebugEnabled ) {
					log( "Re-establishing jWebSocket connection..." );
				}
			},
					
			OnWelcome: function( aToken )  {
				if( w.auth.options.OnWelcome ) {
					w.auth.options.OnWelcome( aToken );
				}
				if( mLog.isDebugEnabled ) {
					log( "<font style='color:red'>jWebSocket Welcome received.</font>" );
				}
				
				if ("anonymous" != aToken.username){
					w.auth.eLogonArea.hide();
					w.auth.eLogoffArea.fadeIn(300);

					w.auth.eUserInfoName.text(aToken.username);
					w.auth.mUsername = aToken.username;
					w.auth.eClientId.text("Client-ID: " + aToken.sourceId);
					w.auth.eClientStatus.attr( "class", "authenticated").text("authenticated");
				}
			},

			OnGoodBye: function( aEvent ) {
				if( w.auth.options.OnGoodBye ) {
					w.auth.options.OnGoodBye( aEvent );
				}
				if( mLog.isDebugEnabled ) {
					log( "<font style='color:red'>jWebSocket GoodBye received.</font>" );
				}
			},

			// OnMessage callback
			OnMessage: function( aEvent, aToken ) {
				if( "login" == aToken.reqType || "logon" ==  aToken.reqType) {
					if( aToken.code != -1 ) {
						if( mLog.isDebugEnabled ) {
							log( "<font style='color:green'>Successfully authenticated as: " 
								+ aToken.username + "</font>");
						}
						w.auth.eLogonArea.hide();
						w.auth.eLogoffArea.fadeIn(300);

						w.auth.eUserInfoName.text(aToken.username);
						w.auth.mUsername = aToken.username;
						w.auth.eClientId.text("Client-ID: " + aToken.sourceId);
						w.auth.eClientStatus.attr( "class", "authenticated").text("authenticated");
					} else {
						if( mLog.isDebugEnabled ) {
							log( "<font style='color:red'><b>Error trying to login, \n\
								invalid credentials, please, check your user or password</font>");
						}
					}
				} else if( "logout" == aToken.reqType || "logoff" == aToken.reqType) {
					w.auth.eLogoffArea.hide( );
					w.auth.eLogonArea.fadeIn( 200 );
					
					w.auth.eConnectButton.hide( );
					w.auth.eDisConnectButton.show( );
					
					w.auth.mUsername = null;
					w.auth.eUserInfoName.text( "" );
					w.auth.eClientStatus.attr( "class", "online" ).text( "online" );
					
				}
				// Debug if the user doesn't have an OnMessage method
				if(w.auth.options.OnMessage) {
					w.auth.options.OnMessage(aEvent, aToken);
				} else{
					var lDate = "";
					if( aToken.date_val ) {
						lDate = jws.tools.ISO2Date( aToken.date_val );
					}
				
					if( mLog.isDebugEnabled ) {
						log( "<font style='color:#888'>jWebSocket '" + aToken.type 
							+ "' token received, full message: '" + aEvent.data + "' " 
							+ lDate + "</font>" );
					}
				}
			},
			// OnClose callback
			OnClose: function( aEvent ) {
				if( mLog.isDebugEnabled ) {
					log( "<font style='color:#888'>jWebSocket connection closed.</font>" );
				}
				w.auth.eLogoffArea.hide( );
				w.auth.eLogonArea.fadeIn( 200 );
			
				w.auth.eDisConnectButton.hide( );
				w.auth.eConnectButton.show( );
			
				w.auth.mUsername = null;
				w.auth.eUserInfoName.text( "" );
				w.auth.eClientId.text( "Client-ID: -" );
				w.auth.eClientStatus.attr( "class", "offline" ).text( "disconnected" );
				w.auth.eUsername.focus( );
				
				if( w.auth.options.OnClose ){
					w.auth.options.OnClose( aEvent );
				}
			}
		};
	},
	
	// If there is not connection with the server, opens a connection and then 
	// tries to log the user in the system
	logon: function() {
		var lURL = ( w.auth.options.lURL )? w.auth.options.lURL: jws.getDefaultServerURL( );
        
		var lUsername = w.auth.eUsername.val( );
		var lPassword = w.auth.ePassword.val( );
		
		if( lUsername == "" || lPassword == "" ){
			if( mLog.isDebugEnabled ) {
				log("<font style='color:red'>User or password can not be empty,\n\
						please check your login information.</font>")
			}
			return;
		}
		
		if( mLog.isDebugEnabled ) {
			log( "Connecting to " + lURL + " and logging in as '" + lUsername + "'..." );
		}
		
		var lRes = mWSC.logon( lURL, lUsername, lPassword, w.auth.getCallbacks() );
		
		if( mLog.isDebugEnabled ) {
			log( mWSC.resultToString( lRes ) );
		}
	},
	
	logoff: function( ){
		if( mWSC ) {
			if( mLog.isDebugEnabled ) {
				log( "Logging off " + ( w.auth.mUsername != null ? "'" + 
					w.auth.mUsername + "'" : "" ) + " and disconnecting..." );
			}
			// the timeout below  is optional,
			// if you use it you'll get a good-bye message.
			var lRes = mWSC.logout( {
				timeout: 3000
			} );
			
			if( mLog.isDebugEnabled ) {
				log( mWSC.resultToString( lRes ) );
			}
		}
	},
	
	connect: function( ) {
		var lURL = ( w.auth.options.lURL )?w.auth.options.lURL:jws.getDefaultServerURL( );
		if( mLog.isDebugEnabled ) {
			log( "Connecting to " + lURL + " ..." );
		}
		
		if( mWSC.isConnected( ) ) {
			if( mLog.isDebugEnabled ) {
				log( "Already connected." );
			}
			return;
		}

		try {
			mWSC.open( lURL, w.auth.getCallbacks() );
		} catch( ex ) {
			console.log( ex );
			if( mLog.isDebugEnabled ) {
				log( "Exception: " + ex.message );
			}
		}
	},
	
	disconnect: function() {
		if( mWSC ) {
			if( mLog.isDebugEnabled ) {
				log( "Disconnecting..." );
			}
			try {
				var lRes = mWSC.close({
					timeout: 3000
				});
				
				if( lRes.code != 0 ) {
					if( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch( ex ) {
				console.log( ex );
				if( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},
	
	auth: function() {
		if( mWSC ) {
			if( mLog.isDebugEnabled ) {
				log( "Authenticating..." );
			}
			try {
				var lRes = mWSC.systemLogon(
					jws.GUEST_USER_LOGINNAME, 
					jws.GUEST_USER_PASSWORD
					);
				if( lRes.code == 0 ) {
					if( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}
				} else {
					if( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch( ex ) {
				console.log( ex.message );
				if( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},

	deauth: function() {
		if( mWSC ) {
			if( mLog.isDebugEnabled ) {
				log( "Deauthenticating..." );
			}
			try {
				var lRes = mWSC.systemLogoff();
				if( lRes.code == 0 ) {
					if( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}
				} else {
					if( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch( ex ) {
				console.log( ex.message );
				if( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},

	getAuth: function() {
		if( mWSC ) {
			if( mLog.isDebugEnabled ) {
				log( "Getting authorities..." );
			}
			try {
				var lRes = mWSC.systemGetAuthorities();
				if( lRes.code == 0 ) {
					if( mLog.isDebugEnabled ) {
						log( "Asychronously waiting for response..." );
					}
				} else {
					if( mLog.isDebugEnabled ) {
						log( lRes.msg );
					}
				}
			} catch( ex ) {
				if( mLog.isDebugEnabled ) {
					log( "Exception: " + ex.message );
				}
			}
		}
	},
	
	// EVENTS FUNCTIONS
	eUsernameKeypress: function( aEvent ) {
		if( aEvent.keyCode == 13 || aEvent.keyChar == 13 ) {
			w.auth.ePassword.focus();
		}
	},
	
	ePasswordKeypress: function( aEvent ) {
		if( aEvent.keyCode == 13 || aEvent.keyChar == 13 ) {
			w.auth.logon();
		}
	}
});