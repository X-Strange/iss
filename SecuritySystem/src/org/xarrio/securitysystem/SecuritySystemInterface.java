package org.xarrio.securitysystem;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.EditText;
import at.abraxas.amarino.Amarino;

public class SecuritySystemInterface extends Activity implements OnClickListener, OnCheckedChangeListener {
	
	private static final String TAG = "SecuritySystem";
	
	public static String DEVICE_ADDRESS;
	
	private boolean isCheck = false;
	
	EditText idField;
	Button button;
	Button button2;
	CheckBox cb;
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.input);
        
        Log.d(TAG, "Main onStart");
        
        // get references to views defined in our input.xml layout file
        idField = (EditText) findViewById(R.id.deviceIDField);
        button = (Button) findViewById(R.id.okButton);
        button2 = (Button) findViewById(R.id.wifiButton);
        // register listeners
        button.setOnClickListener(this);
        cb = (CheckBox) findViewById(R.id.checkSSH);
        cb.setOnCheckedChangeListener(this);
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(this);
        DEVICE_ADDRESS = prefs.getString("device", "00:12:03:09:76:53");
        idField.setText(DEVICE_ADDRESS);
    }
    
	public void onClick(View v) 
	{
		DEVICE_ADDRESS = idField.getText().toString();
		PreferenceManager.getDefaultSharedPreferences(this)
			.edit()
				.putString("device", DEVICE_ADDRESS)
			.commit();
		Amarino.connect(this, DEVICE_ADDRESS);
		try {
			Thread.sleep(10000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		Intent i = new Intent(this, SecuritySystem.class);
		i.putExtra("Wifi", false);
    	startActivity(i);
	}
	
	public void openRemote(View v) {
		Intent i = new Intent(this, SecuritySystem.class);
		i.putExtra("Wifi", true);
		i.putExtra("SSH", isCheck);
    	startActivity(i);
	}
	
	public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
		if (isChecked) {
			cb.setText("Create tunnels.");
			isCheck = true;
		} else {
			cb.setText("Don't create tunnels.");
			isCheck = false;
		}
	}
}
