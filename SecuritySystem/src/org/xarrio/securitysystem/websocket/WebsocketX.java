package org.xarrio.securitysystem.websocket;

import java.net.URI;
import java.net.URISyntaxException;

import org.json.JSONException;
import org.json.JSONObject;
import org.xarrio.securitysystem.SecuritySystemICSActivity;
import org.xarrio.securitysystem.speech.Speech;

import android.util.Log;
import de.roderick.weberknecht.WebSocket;
import de.roderick.weberknecht.WebSocketConnection;
import de.roderick.weberknecht.WebSocketEventHandler;
import de.roderick.weberknecht.WebSocketException;
import de.roderick.weberknecht.WebSocketMessage;

public class WebsocketX {

	private final static String WEBSOCKET_LOG = "WEBSOCKET";
	private final static String JSON_LOG = "JSON";
	private final static String NS = "org.xarrio.websocket.XarrioPlugin";
	private final static String LOCALHOST = "localhost";
	private final static String WS_URL = "xarrio.dyndns.org";
	private WebSocket websocket;
	private WebSocketEventHandler eventHandler;
	private String mType;
	private String mValue;
	private static boolean isConnected;

	public WebsocketX(boolean isSSH) {
		super();
		wsConnect(null, null, isSSH);
	}
	
	private void manageEvents(final String type, final String value) {
		eventHandler = new WebSocketEventHandler() {
			@Override
			public void onOpen() {
				Log.i(WEBSOCKET_LOG, "--open");
			}
			
			@Override
			public void onMessage(WebSocketMessage message) {
				String jsonText = message.getText();//save the message into a string
                try{
                	JSONObject test = new JSONObject(jsonText);//decode the string to a json object
                	if(test.getString("ns").equals(NS)){//if it's my namespace
                		String val = test.getString("value");
                		String reqType = test.getString("reqType");
                		if (val != "null") {
                			int wsValue=test.getInt("value");//get the value
                			Log.i(JSON_LOG, "Command received: " + Integer.valueOf(wsValue).toString());
                			Log.i(JSON_LOG, "Command received: " + reqType);
                			serialWrite(String.valueOf(wsValue));
                		} else {//if (val == "null") {
                			Log.i(JSON_LOG, "Type: "  + getmType() + " | Position: " +getmValue());
                			Log.i(JSON_LOG, "Command received: " + reqType);
               				websocket.send(createJSONObject(getmType(), getmValue()).toString());
                		}
                		Speech.speak(getStringResourceByName(reqType));
                	}
                } catch(WebSocketException we) {
                	Log.e(WEBSOCKET_LOG, we.getMessage());
                } catch(JSONException jse) {
                	Log.e(JSON_LOG, jse.getMessage());
                }
			}
			
			@Override
			public void onClose() {
				Log.i(WEBSOCKET_LOG, "--close");
				isConnected = false;
			}
		};
	}
	
	private void wsConnect(String type, String value, boolean isSSH) {
		    try {
		    	URI url;
		    	if (isSSH) {
		    		url = new URI("ws://" + LOCALHOST +":8787/myWebSocketWebClient");
		    	} else {
		    		url = new URI("ws://" + WS_URL +":8787/myWebSocketWebClient");
		    	}
		        websocket = new WebSocketConnection(url);
	        	Log.i(WEBSOCKET_LOG, "Websocket created");
		    	
		        manageEvents(getmType(), getmValue());
		        
		        // Register Event Handlers
				websocket.setEventHandler(eventHandler);
				Log.i(WEBSOCKET_LOG, "EventHandler set");
		        
		        // Establish WebSocket Connection
		        websocket.connect();
		        isConnected = true;
		        Log.i(WEBSOCKET_LOG, "CONNECTED!");
		        
		        // Send UTF-8 Text
		        //websocket.send("Keep alive connection!");
		        
		        // Close WebSocket Connection
		        //websocket.close();
			}
			catch (WebSocketException wse) {
			        wse.printStackTrace();
			}
			catch (URISyntaxException use) {
			        use.printStackTrace();
			}
	    }
	    
	    public void wsDisconnect(){
	    	try {
	            // Close WebSocket Connection
	    		websocket.close();
	    		isConnected = false;
	    		Log.i(WEBSOCKET_LOG, "DISCONNECTED!");
		    }
		    catch (WebSocketException wse) {
		        wse.printStackTrace();//log error
		    }
	    }
	    
	    public void sendData(String type, String value) {
	    	try {
	    		if (!isConnected) {
	    			websocket.connect();
	    			isConnected = true;
	    		}
				websocket.send(createJSONObject(type, value).toString());
			} catch (WebSocketException we) {
				Log.e(WEBSOCKET_LOG, we.getMessage());
			}
	    }
	    
	    private JSONObject createJSONObject(String type, String value) {
			JSONObject out = new JSONObject();//create a new json Object
				try {
					out.put("ns", NS);//add the namespace
					out.put("type", type);//add the event type
					out.put("value", value);//add the value
				} catch (JSONException e) {
					e.printStackTrace();
				}
	    	return out;
	    }
	    
	    private void serialWrite(String output) {
	    	SecuritySystemICSActivity.meSerialWrite(output);
	    }

		public String getmType() {
			return mType;
		}

		public void setmType(String mType) {
			this.mType = mType;
		}

		public String getmValue() {
			return mValue;
		}

		public void setmValue(String mValue) {
			this.mValue = mValue;
		}
		
		public static boolean isConnected() {
			return isConnected;
		}
		
		private String getStringResourceByName(String aString) {
		    String packageName = Speech.getContext().getPackageName();
		    int resId = Speech.getContext().getResources()
		            .getIdentifier(aString, "string", packageName);
		    if (resId == 0) {
		        return aString;
		    } else {
		        return Speech.getContext().getString(resId);
		    }
		}
	
}
