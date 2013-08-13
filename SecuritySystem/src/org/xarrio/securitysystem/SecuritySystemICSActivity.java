/* Copyright 2011 Google Inc.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
 * USA.
 *
 * Project home page: http://code.google.com/p/usb-serial-for-android/
 */

package org.xarrio.securitysystem;

import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.xarrio.securitysystem.speech.Speech;
import org.xarrio.securitysystem.ssh.SSHConnection;
import org.xarrio.securitysystem.websocket.WebsocketX;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.hardware.usb.UsbManager;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.StrictMode;
import android.speech.RecognizerIntent;
import android.text.format.Time;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialProber;
import com.hoho.android.usbserial.util.HexDump;
import com.hoho.android.usbserial.util.SerialInputOutputManager;

/**
 * A sample Activity demonstrating USB-Serial support.
 *
 * @author mike wakerly (opensource@hoho.com)
 */
public class SecuritySystemICSActivity extends Activity {

    private final static String TAG = SecuritySystemICSActivity.class.getSimpleName();

    /**
     * The device currently in use, or {@code null}.
     */
    private static UsbSerialDriver mSerialDevice;

    /**
     * The system's USB service.
     */
    private UsbManager mUsbManager;

    private TextView mTitleTextView;
    private static TextView mDumpTextView;
    private TextView mCommand;
    //private ScrollView mScrollView;
    private Button btnOn;
    private Button btnOff;

    private Button btnConnect;
    
    private WebsocketX wsx;
    
    private LocationManager mgr;
    private static String sPos = "";
    
    private SSHConnection connect = null;
    private Boolean isSSH = false;
	
    private static Speech speech = null;
    
    private Activity activity;

    private final ExecutorService mExecutor = Executors.newSingleThreadExecutor();

    private SerialInputOutputManager mSerialIoManager;

    private final SerialInputOutputManager.Listener mListener =
            new SerialInputOutputManager.Listener() {

        @Override
        public void onRunError(Exception e) {
            Log.d(TAG, "Runner stopped.");
        }

        @Override
        public void onNewData(final byte[] data) {
            SecuritySystemICSActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    SecuritySystemICSActivity.this.updateReceivedData(data);
                }
            });
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_usb);
		StrictMode.ThreadPolicy policy = new StrictMode.
				ThreadPolicy.Builder().permitAll().build();
				StrictMode.setThreadPolicy(policy); 
        mUsbManager = (UsbManager) getSystemService(Context.USB_SERVICE);
        mTitleTextView = (TextView) findViewById(R.id.demoTitle);
        mDumpTextView = (TextView) findViewById(R.id.demoText);
        //mScrollView = (ScrollView) findViewById(R.id.demoScroller);
        mCommand = (TextView) findViewById(R.id.command); 
        btnOff = (Button) findViewById(R.id.button2);
        btnOn = (Button) findViewById(R.id.button1);
        btnConnect = (Button) findViewById(R.id.connect);
        
        btnConnect.setOnClickListener(btnConnectOnClickListener);
        
        btnOn.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
            mDumpTextView.append(TAG + "You clicked ON button."+ "\n\n");
            Speech.speak("Luz encendida");
            meSerialWrite("e");
            }
        });
        
        btnOff.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
            mDumpTextView.append(TAG + "You clicked OFF button."+ "\n\n");
            Speech.speak("Luz apagada");
            meSerialWrite("a");
            }
        });
        
        setActivity(this);
    }
    
    private OnClickListener btnConnectOnClickListener = new OnClickListener() {
        public void onClick(View v){
        	if(!WebsocketX.isConnected()){//if not connected
        		wsx = new WebsocketX(isSSH);
//        	}else{//if connected
//        		disconnect();
        	}
        }
    };

    @Override
    protected void onPause() {
        super.onPause();
        speech.onPauseSpeech();
        wsx.wsDisconnect();
//        stopIoManager();
//        if (mSerialDevice != null) {
//            try {
//                mSerialDevice.close();
//            } catch (IOException e) {
//                // Ignore.
//            }
//            mSerialDevice = null;
//        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        speech = new Speech(getApplicationContext());
        mSerialDevice = UsbSerialProber.acquire(mUsbManager);

        if (isSSH) {
        	connectTunnel();
        }
        
		mgr = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
		
		Criteria criteria = new Criteria();
		criteria.setAccuracy(Criteria.ACCURACY_COARSE);
	
		final String provider = mgr.getBestProvider(criteria, true);
		Log.i("POSITION","LocationManager started...provider: " + provider);
		
		mgr.requestLocationUpdates(provider,1000,0,onLocationChange);
		Log.i("POSITION","Registered for updates...");
	    
	    
        Log.d(TAG, "Resumed, mSerialDevice=" + mSerialDevice);
        if (mSerialDevice == null) {
            mTitleTextView.setText("No serial device.");
        } else {
            try {
                mSerialDevice.open();
            } catch (IOException e) {
                Log.e(TAG, "Error setting up device: " + e.getMessage(), e);
                mTitleTextView.setText("Error opening device: " + e.getMessage());
                try {
                    mSerialDevice.close();
                } catch (IOException e2) {
                    // Ignore.
                }
                mSerialDevice = null;
                return;
            }
            mTitleTextView.setText("Serial device: " + mSerialDevice);
        }
        onDeviceStateChange();
    }

    private void stopIoManager() {
        if (mSerialIoManager != null) {
            Log.i(TAG, "Stopping io manager ..");
            mSerialIoManager.stop();
            mSerialIoManager = null;
        }
    }

    private void startIoManager() {
        if (mSerialDevice != null) {
            Log.i(TAG, "Starting io manager ..");
            mSerialIoManager = new SerialInputOutputManager(mSerialDevice, mListener);
            mExecutor.submit(mSerialIoManager);
        }
    }

    private void onDeviceStateChange() {
        stopIoManager();
        startIoManager();
    }

    private void updateReceivedData(byte[] data) {
        //final String message = "Read " + data.length + " bytes: \n"
          //      + HexDump.dumpHexString(data) + "\n\n";
        StringBuilder output = new StringBuilder();
        for (int i = 0; i < HexDump.toHexString(data).length(); i+=2) {
            String str = HexDump.toHexString(data).substring(i, i+2);
            output.append((char)Integer.parseInt(str, 16));
        }
        
        final String message = "Mensaje: " + output + "\n\n";
        mDumpTextView.setText(message);
        Speech.speak(output.toString());
        //mScrollView.smoothScrollTo(0, mDumpTextView.getBottom());
    }
    
    public static void meSerialWrite(String output){
    //String output = "off";

    if (mSerialDevice != null) {
       byte[] byteArray = output.getBytes();
       try {
           mSerialDevice.setBaudRate(115200);
           mSerialDevice.write(byteArray, 1000);
       } catch (IOException e) {
        mDumpTextView.append(TAG + e.getMessage()+ "\n\n");
           e.printStackTrace();
       }
    }
   }
    
    public void speakToMe(View view) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT,
                "Por favor hable lentamente y enuncie claramente.");
        startActivityForResult(intent, Speech.VOICE_RECOGNITION_REQUEST);
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == Speech.VOICE_RECOGNITION_REQUEST && resultCode == RESULT_OK) {
            ArrayList<String> matches = data
                    .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            TextView textView = (TextView) findViewById(R.id.command);
            String firstMatch = matches.get(0);
            if (firstMatch.contains("encender")) {
            	textView.setText(firstMatch);
            	meSerialWrite("e");
            } else if (firstMatch.contains("apagar")) {
            	textView.setText(firstMatch);
            	meSerialWrite("a");
            }
        }
    }
    
    LocationListener onLocationChange=new LocationListener() {
	    public void onLocationChanged(Location location) {
	      updateText(location);
	      if (!WebsocketX.isConnected()) {
	    	  wsx = new WebsocketX(isSSH);
	      }
	      wsx.setmType("position");
    	  wsx.setmValue(sPos);
    	  wsx.sendData(null, null);
	    }
	    
	    public void onProviderDisabled(String provider) {
	      // required for interface, not used
	    }
	    
	    public void onProviderEnabled(String provider) {
	      // required for interface, not used
	    }
	    
	    public void onStatusChanged(String provider, int status,
	                                  Bundle extras) {
	      // required for interface, not used
	    }
	  };
	  
		public void updateText(Location loc) {
			Time now = new Time();
			now.setToNow();
			Log.i("POSITION","Trying to parse information...");
			double lon = loc.getLongitude();
			double lat = loc.getLatitude();
			float accuracy = loc.getAccuracy();
			float bearing = loc.getBearing();
			Log.i("POSITION","Information parsed");
			Log.i("POSITION","Position parsed: " + lon + "," + lat + "," + accuracy + "," + bearing);
			sPos = "lat=" + String.valueOf(lat) + "&lon=" + String.valueOf(lon);
		}

		public Activity getActivity() {
			return activity;
		}

		public void setActivity(Activity activity) {
			this.activity = activity;
		}
		
		private void connectTunnel() {
	        if (connect == null) {
	        	connect = new SSHConnection();
	        }
		    try {
				if (connect.conectar()) {
					Toast.makeText(getApplicationContext(), "Tunnels created", Toast.LENGTH_SHORT).show();
					mCommand.setText("Tunnels created");
			    	wsx = new WebsocketX(isSSH);
				}
			} catch (Exception e) {
				e.printStackTrace();
				Toast.makeText(getApplicationContext(), "Tunnel creation error, check the connection.", Toast.LENGTH_SHORT).show();
			}
		}
		
		@Override
		protected void onStop() {
			super.onStop();
			wsx.wsDisconnect();
		}
}
