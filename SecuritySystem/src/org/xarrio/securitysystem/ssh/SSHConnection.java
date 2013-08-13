package org.xarrio.securitysystem.ssh;

import java.util.Properties;

import android.os.Environment;
import android.util.Log;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;

public class SSHConnection {
	
	private static String LOG = "SSHCONNECTION";
	
	String user = "pi";
	String host = "xarrio.dyndns.org";  
	int port = 227;
	
	private ChannelSsh channelSsh;
	private Session session;
	private boolean isForwarded = false;
	
	public boolean conectar() {     

	    JSch jsch = new JSch();
	    try {
			jsch.addIdentity(Environment.getExternalStorageDirectory().getPath() + "/id_rsa");
			session = jsch.getSession(user, host, port);
		} catch (JSchException je) {
			Log.e(LOG, "Getting session: " + je.getMessage());
		}
	    //session.setPassword(pass);
	    Log.d(LOG, "Connecting");

	    // Avoid asking for key confirmation
	    Properties prop = new Properties();
	    prop.put("StrictHostKeyChecking", "no");
	    prop.put("PreferredAuthentications", "publickey");
	    session.setConfig(prop);

	    try {
			session.connect();
		} catch (JSchException je) {
			Log.e(LOG, "Connecting: " + je.getMessage());
		}
	    Log.d("SSH", "Established connection!");
	    
//	    session.setPortForwardingR(15801, "localhost", 5801);
//	    Log.d("PORT FORWARDING", "Tunnel 5801 done!");
//	    session.setPortForwardingR(15901, "localhost", 5901);
//	    Log.d("PORT FORWARDING", "Tunnel 5901 done!");
//	    session.setPortForwardingR(8888, "localhost", 8080);
//	    Log.d("PORT FORWARDING", "Tunnel 8080 done!");
//	    session.setPortForwardingR(18090, "localhost", 8090);
//	    Log.d("PORT FORWARDING", "Tunnel 8090 done!");
	    if (!isForwarded) {
	    	try {
	    		session.setPortForwardingL(8787, "localhost", 8181);
	    	} catch (JSchException je) {
	    		Log.e(LOG, "Forwarding: " + je.getMessage());
	    	}
	    	Log.d("PORT FORWARDING", "Tunnel 8787 done!");
	    	isForwarded = true;
	    	
	    	// SSH Channel
	    	try {
	    		channelSsh = new ChannelSsh(session);
	    		channelSsh.sendCommand("ls");
	    		channelSsh.connect();
	    	} catch (JSchException je) {
	    		Log.e(LOG, "ChannelSsh: " + je.getMessage());
	    	}
	    	
	    	//Thread.sleep(2500);
	    	//channelssh.disconnect();
	    	return true;
	    }
	    
	    return false;
	}

}
