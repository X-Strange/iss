//	---------------------------------------------------------------------------
//	jWebSocket Worker (supports multithreading and background processes
//	on the browser clients, if they support the HTML5 WebWorker standard)
//	Copyright (c) 2011 Alexander Schulze, Innotrade GmbH, Herzogenrath
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

//:i:en:This method is executed if postmessage is invoked by the caller.
//:i:de:Über aEvent können von der Applikation Daten _
//:i:de:an den Thread übergeben werden
onmessage = function( aEvent ) {
	// console.log( "started!" );
	// here computationally intensive processes can be run as thread.
	// aEvent.data contains the Object from the caller (application)
	var lMethod;
	eval( "lMethod=" + aEvent.data.method );

	// run the method and return the result via postmessage to the application.
	// in the application the onmessage listener of the worker is invoked
	postMessage( lMethod( aEvent.data.args ) );

};
