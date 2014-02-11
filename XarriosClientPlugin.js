jws.XarriosClientPlugin = {
	// if namespace is changed update server plug-in accordingly!
	NS: "org.xarrio.websocket.XarrioPlugin",

	//Method is called when a token has to be progressed
	processToken: function( aToken ) {
	    // check if namespace matches
	    if( aToken.ns == jws.XarriosClientPlugin.NS ) {
	      // if it's an answer for the request "getAuthorName"
	      if( aToken.reqType == "getAuthorName" ) {
	    	  alert( "This Tutorial is done by: " + aToken.name );
	      }
	      // if it's an answer for the request "calculate"
	      else if( aToken.reqType == "calculate" ) {
	    	  alert( "calculated Number is: " + aToken.calNumber );
		  }
	      else if( aToken.reqType == "left" ) {
	    	  if (aToken.leftResponse != null) {
	    		  alert( "Motor is rotated to: " + aToken.leftResponse );
	    	  }
		  }
	      else if( aToken.reqType == "right" ) {
	    	  if (aToken.rightResponse != null) {
	    		  alert( "Motor is rotated to: " + aToken.rightResponse );
	    	  }
		  }
	      else if( aToken.reqType == "position" ) {
	    	  function open_in_new_tab(url )
	    	  {
	    	    var win=window.open(url, '_blank');
	    	    win.focus();
	    	  }
	    	  alert( "Position received! ");
	    	  open_in_new_tab("http://xarrio.dyndns.org/map.php?" + aToken.value);
		  }
	      else if( aToken.reqType == "message" ) {
	    	  alert( "Message sent!" );
	      }
	      else if( aToken.reqType == "sliderHasChanged" ) {
	    	  console.log("change Slider to "+aToken.value);
	    	  document.getElementById("slider").value=aToken.value;
	      }
	      else if( aToken.reqType == "servoLeft" ) {
	    	  if (aToken.leftResponse != null) {
	    		  alert( "Servo is rotated to: " + aToken.leftResponse );
	    	  }
		  }
	      else if( aToken.reqType == "servoRight" ) {
	    	  if (aToken.rightResponse != null) {
	    		  alert( "Servo is rotated to: " + aToken.rightResponse );
	    	  }
		  }
	      else if( aToken.reqType == "servoCenter" ) {
	    	alert( "Servo is centered" );
		  }
	   }
	},

	  //Method is called from the button "Author"
	  //to send a request to the jwebsocketserver-> LauridsPlugIn
	  requestAuthorName: function( aOptions ) {
	    if( this.isConnected() ) {
	       //create the request token
	      var lToken = {
	         ns: jws.XarriosClientPlugin.NS,
	         type: "getAuthorName"
	      };
	      console.log("asking for Author Name...");
	      this.sendToken( lToken,  aOptions );//send it
	    }
	  },

	  calculateMyNumber: function(inputNumber, aOptions ) {
		    if( this.isConnected() ) {
		    	//create the request token
		      var lToken = {
			     ns: jws.XarriosClientPlugin.NS,
			     type: "calculate",
			     myNumber: inputNumber//add the input Number to our token
		      };
		      console.log("sending calculation request for:"+inputNumber);
		      this.sendToken( lToken,  aOptions );//send it
		    }
		},
		
	  sliderChanged: function(value, aOptions ) {
		    if( this.isConnected() ) {
		    	//create the request token
		      var lToken = {
			     ns: jws.XarriosClientPlugin.NS,
			     type: "sliderChanged",
			     value: value//add the slider value to the token
		      };
		      console.log("sending slider changed to:"+value);
		      this.sendToken( lToken,  aOptions );//send it
		    }
	},
	
	  left: function(inputNumber, aOptions ) {
		    if( this.isConnected() ) {
		       //create the request token
		      var lToken = {
		         ns: jws.XarriosClientPlugin.NS,
		         type: "left",
		         value: inputNumber
		      };
		      console.log("Motor left...");
		      this.sendToken( lToken,  aOptions );//send it
		    }
		  },
		  
	  right: function(inputNumber, aOptions ) {
		    if( this.isConnected() ) {
		       //create the request token
		      var lToken = {
		         ns: jws.XarriosClientPlugin.NS,
		         type: "right",
		         value: inputNumber
		      };
		      console.log("Motor right...");
		      this.sendToken( lToken,  aOptions );//send it
		    }
		  },
	  servoLeft: function(inputNumber, aOptions ) {
		    if( this.isConnected() ) {
		       //create the request token
		      var lToken = {
		         ns: jws.XarriosClientPlugin.NS,
		         type: "servoLeft",
		         value: inputNumber
		      };
		      console.log("Servo left...");
		      this.sendToken( lToken,  aOptions );//send it
		    }
		  },
		  
	  servoRight: function(inputNumber, aOptions ) {
		    if( this.isConnected() ) {
		       //create the request token
		      var lToken = {
		         ns: jws.XarriosClientPlugin.NS,
		         type: "servoRight",
		         value: inputNumber
		      };
		      console.log("Servo right...");
		      this.sendToken( lToken,  aOptions );//send it
		    }
		  },
	  servoCenter: function(inputNumber, aOptions ) {
		    if( this.isConnected() ) {
		       //create the request token
		      var lToken = {
		         ns: jws.XarriosClientPlugin.NS,
		         type: "servoCenter",
		         value: inputNumber
		      };
		      console.log("Servo centered...");
		      this.sendToken( lToken,  aOptions );//send it
		    }
		  },
	  position: function(inputNumber, aOptions ) {
		    if( this.isConnected() ) {
		       //create the request token
		      var lToken = {
		         ns: jws.XarriosClientPlugin.NS,
		         type: "position",
		         value: inputNumber
		      };
		      console.log("Position sent!");
		      this.sendToken( lToken,  aOptions );//send it
		    }
		  },
	
	  message: function(sms, cel, aOptions ) {
		    if( this.isConnected() ) {
		       //create the request token
		      var lToken = {
		         ns: jws.XarriosClientPlugin.NS,
		         type: "message",
		         value: sms,
		         value2: cel
		      };
		      console.log("Message sent!");
		      this.sendToken( lToken,  aOptions );//send it
		    }
		  }
};

//add the client PlugIn
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.XarriosClientPlugin );

