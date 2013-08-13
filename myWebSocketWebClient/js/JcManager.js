/***
* This component handle the communication with the JavaCard controller applet ("JcControllerApplet")
* 
* @author: Marta Rodriguez Freire
* @author: Rolando Santamaria Maso
*/
var JcManager = {
	//Store JcManager listeners
	listeners: [],
                
	/**
	* Transmit a CommandAPDU to a target terminal
    * aCommandAPDU param require to be a Base64 encoded string
    *
    * @return Base64 encoded string with the response or null
    * if failure
    */
	transmit: function (aTerminalName, aCommandAPDU){
		var jc = document.getElementById('JcControllerApplet');
             
		return jc.transmit(aTerminalName, aCommandAPDU);
	},
                
	/**
    * @return The name's list of the active terminals
    */
	getActiveTerminalNames: function(){
		var jc = document.getElementById('JcControllerApplet');
		var result = jc.getActiveTerminalNames();

		if ("" == result) return [];

		return result.split(",")
	},

	OnTerminalReady: function (aTerminalName){
		console.log(">> Connected: " + aTerminalName);

		var end = this.listeners.length;
		for (i = 0; i < end; i++) {
			if (this.listeners[i]['OnTerminalReady']){
				this.listeners[i].OnTerminalReady(aTerminalName);
			}
		}
	},
                
	OnTerminalNotReady: function(aTerminalName){
		console.log("<< Disconnected: " + aTerminalName);

		var end = this.listeners.length;
		for (i = 0; i < end; i++) {
			if (this.listeners[i]['OnTerminalNotReady']){
				this.listeners[i].OnTerminalNotReady(aTerminalName);
			}
		}
	},

	/*
    * Register a JcManager listener
    */
	addListener: function(aListener){
		this.listeners.push(aListener);
	},

	/**
    * Removes a listener from JcManager
    */
	removeListener: function(aListener){
		var index = this.listeners.indexOf(aListener);
		if(-1 != index){
			this.listeners.splice(index, 1);
		}
	}

};

/**
* This methods are called from the java applet
* and cannot be renamed.
*/

//Terminal ready notification
function JcOnTerminalReady(aTerminalName){
	JcManager.OnTerminalReady(aTerminalName);
}

//Terminal not ready notification
function JcOnTerminalNotReady(aTerminalName){
	JcManager.OnTerminalNotReady(aTerminalName);
}
