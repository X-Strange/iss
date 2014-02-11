var websocketID = "meinTest",
websocketClient = null,
wsUsername = null,
wsPassword = null;

//Method is called when the page is loaded
function initPage() {
	// check if WebSockets are supported by the browser
	if( jws.browserSupportsWebSockets() ) {
		console.log("Websockets are supported");
		// instaniate new TokenClient, either JSON, CSV or XML
		websocketClient = new jws.jWebSocketJSONClient();
		logon();//call the logon Method
	} else {
		console.log("Websockets are NOT supported");
	}
}

//Method is called when the user clicks the "calculate" button
function requestResult(){
	myNumber=parseInt(document.getElementById("inputNumber").value);//get the number
	websocketClient.calculateMyNumber(myNumber);//call the calculate method from XarriosClientPlugin.js
}

function left(){
	value=parseInt(document.getElementById("inputNumber").value);//get the number
	websocketClient.left(value);//call the calculate method from XarriosClientPlugin.js
}

function right(){
	value=parseInt(document.getElementById("inputNumber").value);//get the number
	websocketClient.right(value);//call the calculate method from XarriosClientPlugin.js
}

function servoLeft(){
	value=parseInt(document.getElementById("inputNumber").value);//get the number
	websocketClient.servoLeft(value);//call the calculate method from XarriosClientPlugin.js
}

function servoRight(){
	value=parseInt(document.getElementById("inputNumber").value);//get the number
	websocketClient.servoRight(value);//call the calculate method from XarriosClientPlugin.js
}

function servoCenter(){
	value=parseInt(document.getElementById("inputNumber").value);//get the number
	websocketClient.servoCenter(value);//call the calculate method from XarriosClientPlugin.js
}

function position(){
	value=parseInt(document.getElementById("inputNumber").value);//get the number
	websocketClient.position(value);//call the calculate method from XarriosClientPlugin.js
}

function message(){
	value=document.getElementById("message").value;
	value2=document.getElementById("sms").value;
	websocketClient.message(value, value2);//call the message method from XarriosClientPlugin.js
}

function sliderHasChanged(){
	value=parseInt(document.getElementById("slider").value);//get the value
	console.log("Slider Value:"+value);
	websocketClient.sliderChanged(value);//call the sliderChanged method from LauridsClientPlugIn.js
}

function logon() {
	var wsURL = jws.getDefaultServerURL();// get the default server url
	console.log("Connecting to " + websocketID + " at " + wsURL + "..." );

	//get the guest username and password
	wsUsername=jws.GUEST_USER_LOGINNAME;
	wsPassword=jws.GUEST_USER_PASSWORD;

	// try to establish the connection to jWebSocket server
	websocketClient.logon( wsURL, wsUsername, wsPassword, {
		OnOpen: function( aEvent ) {
			console.log("Connection to " + websocketID + " established." );
		},

		// OnMessage callback
		OnMessage: function( aEvent, aToken ) {
			console.log(( aToken ? aToken.type : "-" ) + ": " +	aEvent.data);

			if( websocketClient.isLoggedIn() ) {
				console.log("User is authenticated");
			} else {
				console.log("User is connected");
			}
			console.log(websocketClient.getId() + "&nbsp;"	+ ( jws.browserSupportsNativeWebSockets ? "(native)" : "(flashbridge)" ));
			if( aToken ) {
				// is it a response from a previous request of this client?
				if( aToken.type == "response" ) {
					if( aToken.reqType == "login" ) {// figure out of which request
						if( aToken.code == 0 ) {
							console.log("Welcome '" + aToken.username + "'" );
						}else {
							console.log("Error logging in '" + eUsername.value + "': " + aToken.msg );
						}
					}
				// is it an event w/o a previous request ?
				}else if( aToken.type == "goodBye" ) {
					console.log("good bye (reason: " + aToken.reason + ")!" );
				}
			}
		},
		// OnClose callback
		OnClose: function( aEvent ) {
			console.log("Disconnected from " + websocketID + ".");
		}

	});
}
