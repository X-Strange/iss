package org.xarrio.websocket;

import java.util.Collection;

import javolution.util.FastList;

import org.apache.log4j.Logger;
import org.jwebsocket.api.PluginConfiguration;
import org.jwebsocket.api.WebSocketConnector;
import org.jwebsocket.kit.CloseReason;
import org.jwebsocket.kit.PlugInResponse;
import org.jwebsocket.logging.Logging;
import org.jwebsocket.plugins.TokenPlugIn;
import org.jwebsocket.token.BaseToken;
import org.jwebsocket.token.Token;
import org.jwebsocket.token.TokenFactory;

public class XarrioPlugin extends TokenPlugIn {
	
	// change the Apache logger to your Classname
	private static Logger mLog = Logging.getLogger(XarrioPlugin.class);
	// if you change the namespace, don't forget to change the ns_sample!
	private final static String NS_SAMPLE = "org.xarrio.websocket.XarrioPlugin";
	private Collection<WebSocketConnector> mClients;

	public XarrioPlugin(PluginConfiguration aConfiguration) {
		super(aConfiguration);
		if (mLog.isDebugEnabled()) {
			mLog.debug("Instantiating Xarrio's PlugIn ...");
		}
		// specify your namespace
		this.setNamespace(NS_SAMPLE);
		mClients = new FastList<WebSocketConnector>().shared();
	}
	
	@Override
	public void connectorStarted(WebSocketConnector aConnector) {
	    // this method is called every time when a client
	    // connected to the server
		mClients.add(aConnector);
		if (mLog.isDebugEnabled()) {
			mLog.debug("new client has registered: " + aConnector.getId());
		}
	  }

	@Override
	public void connectorStopped(WebSocketConnector aConnector, CloseReason aCloseReason) {
		// ensure that we do not keep any dead connectors in the list
		mClients.remove(aConnector);
		if (mLog.isDebugEnabled()) {
			mLog.debug("client " + aConnector.getId() + " is gone");
		}
	}

	//Method is called when a token has to be progressed
	@Override
	public void processToken(PlugInResponse aResponse, WebSocketConnector aConnector, Token aToken) {
		// get the type of the token
		// the type can be associated with a "command"
		String lType = aToken.getType();

		// get the namespace of the token
		// each plug-in should have its own unique namespace
		String lNS = aToken.getNS();

		// check if token has a type and a matching namespace
		if (lType != null && lNS != null && lNS.equals(getNamespace())) {
			if (lType.equals("getAuthorName")) {//if the request is "getAuthorName"
				mLog.debug("Authorname was requested");
				Token lResponse = createResponse(aToken);//create the response
				//add the variable "name" with the value "Daniel X" to the response
				lResponse.setString("name", "Daniel X");
				sendToken(aConnector, aConnector, lResponse);//send the response
			}else if (lType.equals("calculate")) {//if the request is "calculate"
				int square= aToken.getInteger("myNumber");//get the Value of the variable "myNumber"
				mLog.debug("trying to calculate:"+square);
				square*=square;// square the input
				Token lResponse = createResponse(aToken);//create the response
				//add the variable "calNumber" with the value -square- to the response
				lResponse.setInteger("calNumber",square);
				sendToken(aConnector, aConnector, lResponse);//send the response
			}else if (lType.equals("left")) {//if the request is "calculate"
				//Token lResponse = createResponse(aToken);//create the response
				//lResponse.setInteger("leftResponse",1);
				//sendToken(aConnector, aConnector, lResponse);//send the response
				Token lToken = TokenFactory.createToken(BaseToken.TT_EVENT);
            	lToken.setString("ns", NS_SAMPLE);
                lToken.setString("reqType", "left");
                lToken.setInteger("value", 1);
                broadcast(lToken,aConnector);
			}else if (lType.equals("right")) {//if the request is "calculate"
				//Token lResponse = createResponse(aToken);//create the response
				//lResponse.setInteger("rightResponse",2);
				//sendToken(aConnector, aConnector, lResponse);//send the response
				Token lToken = TokenFactory.createToken(BaseToken.TT_EVENT);
            	lToken.setString("ns", NS_SAMPLE);
                lToken.setString("reqType", "right");
                lToken.setInteger("value", 2);
                broadcast(lToken,aConnector);
			}else if (lType.equals("position")) {//if the request is "calculate"
				String value = aToken.getString("value");
//				Token lResponse = createResponse(aToken);//create the response
//				lResponse.setString("positionResponse",value);
//				sendToken(aConnector, aConnector, lResponse);//send the response
				
				Token lToken = TokenFactory.createToken(BaseToken.TT_EVENT);
            	lToken.setString("ns", NS_SAMPLE);
                lToken.setString("reqType", "position");
                lToken.setString("value", value);
                broadcast(lToken,aConnector);
			}else if (lType.equals("sliderChanged")) {//if the slider has changed
				int value= aToken.getInteger("value");//get the Value of the slider
				mLog.debug("new Slider Value:"+value);
				//Broadcast the new Value to all other Clients
				Token lToken = TokenFactory.createToken(BaseToken.TT_EVENT);
            	lToken.setString("ns", NS_SAMPLE);
                lToken.setString("reqType", "sliderHasChanged");
                lToken.setInteger("value", value);
                broadcast(lToken,aConnector);
			}else if (lType.equals("kazoo")) {//if the request is "calculate"
				//Token lResponse = createResponse(aToken);//create the response
				//lResponse.setInteger("stopResponse",0);
				//sendToken(aConnector, aConnector, lResponse);//send the response
				Token lToken = TokenFactory.createToken(BaseToken.TT_EVENT);
            	lToken.setString("ns", NS_SAMPLE);
                lToken.setString("reqType", "kazoo");
                lToken.setInteger("value", 3);
                broadcast(lToken,aConnector);
			}else if (lType.equals("message")) {//if the request is "calculate"
				String value = aToken.getString("value");
				String value2 = aToken.getString("value2");
				//Token lResponse = createResponse(aToken);//create the response
				//lResponse.setInteger("stopResponse",0);
				//sendToken(aConnector, aConnector, lResponse);//send the response
				Token lToken = TokenFactory.createToken(BaseToken.TT_EVENT);
            	lToken.setString("ns", NS_SAMPLE);
                lToken.setString("reqType", "message");
                lToken.setString("value", value);
                lToken.setString("value2", value2);
                broadcast(lToken,aConnector);
			}
		}
	}

	//Method broadcasts a tokens to all clients except one
	public void broadcast(Token aToken, WebSocketConnector except) {
		mLog.debug("broadcasting my token");
		for (WebSocketConnector lConnector : mClients) {
			if(lConnector!=except){
				mLog.debug("sending new Slider Value...");
				getServer().sendToken(lConnector, aToken);
			}
		}
	}

	//Method broadcasts a token to all connected clients
    public void broadcastToAll(Token aToken) {
		for (WebSocketConnector lConnector : mClients) {
			getServer().sendToken(lConnector, aToken);
		}
	}

}
