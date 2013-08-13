package org.xarrio.securitysystem;

import java.util.ArrayList;

import org.xarrio.securitysystem.speech.Speech;
import org.xarrio.securitysystem.ssh.SSHConnection;
import org.xarrio.securitysystem.websocket.WebsocketX;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.StrictMode;
import android.speech.RecognizerIntent;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import at.abraxas.amarino.Amarino;
import at.abraxas.amarino.AmarinoIntent;

public class SecuritySystem extends Activity implements android.view.View.OnClickListener {
	
	private static final String TAG = "SecuritySystem";
	
	EditText passwordField;
	Button button;

	String device_id;
	
    // speech synthesis
    private Speech speech = null;
    
    private WebsocketX wsx;
    
	//stores the connection status
	private Boolean connected;
	private Boolean isSSH;
	
	private ArduinoReceiver arduinoReceiver = new ArduinoReceiver();
	private Activity activity;
	
    private SSHConnection connect = null;

    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
		StrictMode.ThreadPolicy policy = new StrictMode.
				ThreadPolicy.Builder().permitAll().build();
				StrictMode.setThreadPolicy(policy);
				
		Bundle bundle = getIntent().getExtras();
		connected = bundle.getBoolean("Wifi");
		isSSH = bundle.getBoolean("SSH");
		Log.i("WIFI|3G CONNECTED?", connected.toString());
		Log.i("TUNNEL SSH", isSSH.toString());

		//Amarino.connect(this, DEVICE_ADDRESS);   
        passwordField = (EditText) findViewById(R.id.passwordField);
        passwordField.setVisibility(View.GONE);
        button = (Button) findViewById(R.id.sendButton);
        button.setOnClickListener(this);
        button.setVisibility(View.GONE);
        activity = this;
        
        if (isSSH) {
        	connectTunnel();
        }
        
	    wsx = new WebsocketX(isSSH);
    }
    
	@Override
	protected void onStart() {
		super.onStart();
    	// in order to receive broadcasted intents we need to register our receiver
		registerReceiver(arduinoReceiver, new IntentFilter(AmarinoIntent.ACTION_RECEIVED));

        new Thread(){
        	public void run(){
        		try {
					Thread.sleep(6000);
				} catch (InterruptedException e) {}
				Log.d(TAG, "Inside!");
        	}
        }.start();
        TelephonyManager tm = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
        device_id = tm.getDeviceId();
		Amarino.sendDataToArduino(this, SecuritySystemInterface.DEVICE_ADDRESS, 'd', device_id);
		Log.i("IMEI:", device_id);
	}

	@Override
	protected void onStop() {
		super.onStop();
		// save state
		/* PreferenceManager.getDefaultSharedPreferences(this)
			.edit()
				.putInt("red", red)
				.putInt("green", green)
				.putInt("blue", blue)
			.commit();*/ 
		
		// stop Amarino's background service, we don't need it any more 
		Amarino.disconnect(this, SecuritySystemInterface.DEVICE_ADDRESS);
	}

	public void onClick(View v) {
		String toSend = null; 
		toSend = passwordField.getText().toString();
			if (!toSend.equals("")) {
				toSend = toSend.trim();
				if(!toSend.contains("?")){
					toSend = toSend + " ";
				} 
				if (connected) {
					if (toSend.contains("1")) {
						wsx.sendData("left", "1");
					} else if (toSend.contains("2")) {
						wsx.sendData("right", "2");
					}
				}
				if (toSend.contains("notas")) {
					Amarino.sendDataToArduino(this, SecuritySystemInterface.DEVICE_ADDRESS, 'n', toSend);
				} else if (toSend.contains("0") || toSend.contains("1") || toSend.contains("2")) {
					Amarino.sendDataToArduino(this, SecuritySystemInterface.DEVICE_ADDRESS, 'm', toSend);
				} else {
					Amarino.sendDataToArduino(this, SecuritySystemInterface.DEVICE_ADDRESS, 'p', toSend);
				}
				Log.i("PASSCODE:", toSend);
				passwordField.setText("");
			} else {
				Toast.makeText(activity, "Diga la contraseña", Toast.LENGTH_SHORT).show();
				Speech.speak("Diga la contraseña");
			}
	}
	
	/**
	 * ArduinoReceiver is responsible for catching broadcasted Amarino
	 * events.
	 * 
	 * It extracts data from the intent.
	 */
	public class ArduinoReceiver extends BroadcastReceiver {

		@Override
		public void onReceive(Context context, Intent intent) {
			String data = null;
			
			// the device address from which the data was sent, we don't need it here but to demonstrate how you retrieve it
			//final String address = intent.getStringExtra(AmarinoIntent.EXTRA_DEVICE_ADDRESS);
			
			// the type of data which is added to the intent
			final int dataType = intent.getIntExtra(AmarinoIntent.EXTRA_DATA_TYPE, -1);
			
			// we only expect String data though, but it is better to check if really string was sent
			// later Amarino will support differnt data types, so far data comes always as string and
			// you have to parse the data to the type you have sent from Arduino, like it is shown below
			if (dataType == AmarinoIntent.STRING_EXTRA){
				data = intent.getStringExtra(AmarinoIntent.EXTRA_DATA);
				
				if (data != null){
					if (data.contains("reconocido")) {
						passwordField.setVisibility(View.VISIBLE);
						button.setVisibility(View.VISIBLE);
					}
					Toast.makeText(activity, data.toString(), Toast.LENGTH_LONG ).show();
					Speech.speak(data.toString());
				}
			}
		}
	}
	
	@Override
    protected void onPause() {
        super.onPause();
        speech.onPauseSpeech();
    }

    @Override
    protected void onResume() {
        super.onResume();
        speech = new Speech(getApplicationContext());
    }


//    public void listenToMe(View view) {
//        if (!speechSynthReady) {
//            Toast.makeText(getApplicationContext(),
//                    "Sintesis de Voz no activa.", Toast.LENGTH_SHORT).show();
//            return;
//        }
//        int result = mTextToSpeech.setLanguage(Locale.getDefault()); //setLanguage(Locale.US);
//        if (result == TextToSpeech.LANG_MISSING_DATA
//                || result == TextToSpeech.LANG_NOT_SUPPORTED) {
//            Toast.makeText(
//                    getApplicationContext(),
//                    "Idioma no disponible. Chequee el codigo o la configuracion en las Opciones.",
//                    Toast.LENGTH_SHORT).show();
//        } else {
//            TextView textView = (TextView) findViewById(R.id.textView1);
//            String textToSpeak = textView.getText().toString();
//            mTextToSpeech.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null);
//        }
//
//    }
    
    
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
            TextView textView = (TextView) findViewById(R.id.passwordField);
            String firstMatch = matches.get(0);
            if (firstMatch.contains("nueva") && firstMatch.contains("clave")) {
            	String pass = firstMatch.substring(11);
            	firstMatch = pass + "? ";
            } else if (firstMatch.contains("reset")) {
            	String reset = firstMatch.substring(9);
            	firstMatch = reset + "! ";
            } else if (firstMatch.contains("position")) {
            	firstMatch = "0";
            } else if (firstMatch.contains("left")) {
           		firstMatch = "1";
            } else if (firstMatch.contains("right")) {
           		firstMatch = "2";
            } 
            textView.setText(firstMatch);
            this.onClick(this.activity.getCurrentFocus());
        }
    }
    
	public void manual_usb(View v) {
		Intent i = new Intent(this, SecuritySystemICSActivity.class);
    	startActivity(i);
	}
	
	public void viewCam(View v) {
		Intent i = new Intent();
		//do all ur put extras set data's here...
		i.setComponent(new ComponentName("com.camera.simplemjpeg",
		"com.camera.simplemjpeg.MjpegActivity" ));
		startActivity(i);
	}
	
    public void turnLeft(View v) {
    	if (connected) {
    		wsx.sendData("left", "1");
    	} else {
    		Amarino.sendDataToArduino(this, SecuritySystemInterface.DEVICE_ADDRESS, 'm', 1);
    	}
    }
	
    public void turnRight(View v) {
    	if (connected) {
    		wsx.sendData("right", "2");
    	} else {
    		Amarino.sendDataToArduino(this, SecuritySystemInterface.DEVICE_ADDRESS, 'm', 2);
    	}
    }
    
    public void getKazoo(View v) {
    	wsx.sendData("kazoo", "3");
    }
    
    private void connectTunnel() {
        connect = new SSHConnection();
	    try {
			if (connect.conectar()) {
				Toast.makeText(getApplicationContext(), "Tunnels created", Toast.LENGTH_SHORT).show();
			}
		} catch (Exception e) {
			e.printStackTrace();
			Toast.makeText(getApplicationContext(), "Tunnel creation error, check the connection.", Toast.LENGTH_SHORT).show();
		}
    }
}