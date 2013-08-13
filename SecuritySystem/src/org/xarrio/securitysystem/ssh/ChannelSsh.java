package org.xarrio.securitysystem.ssh;

import java.io.ByteArrayOutputStream;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;

public class ChannelSsh {
	
	private ChannelExec channelSsh;
	private ByteArrayOutputStream baos;
	
	public ChannelSsh(Session session) throws JSchException {
		channelSsh = (ChannelExec) session.openChannel("exec");
		baos = new ByteArrayOutputStream();
		channelSsh.setOutputStream(baos);
	}
	
	public void sendCommand(String command) {
		channelSsh.setCommand(command);
	}
	
	public void connect() throws JSchException {
		channelSsh.connect();
	}
	
	public boolean isConnected() {
		return channelSsh.isConnected();
	}

	public ByteArrayOutputStream getBaos() {
		return baos;
	}

	public void setBaos(ByteArrayOutputStream baos) {
		this.baos = baos;
	}

}
