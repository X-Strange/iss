package org.xarrio.securitysystem.speech;

import android.content.Context;
import android.speech.tts.TextToSpeech;
import android.speech.tts.TextToSpeech.OnInitListener;
import android.util.Log;

public class Speech implements OnInitListener{
	
	private static String LOG = "SPEECH";
    // speech synthesis
    private static TextToSpeech mTextToSpeech = null;
    
    private static Context context;
    
    // Speech recognition
    public static final int VOICE_RECOGNITION_REQUEST = 0x10101;
    
    public Speech(Context context) {
    	setContext(context);
    	mTextToSpeech = new TextToSpeech(context, this);
	}
    
    public void onPauseSpeech() {
        mTextToSpeech.shutdown();
        mTextToSpeech = null;
    }
    
    public static void speak(String message) {
    	mTextToSpeech.speak(message, TextToSpeech.QUEUE_FLUSH, null);
    }

	@Override
	public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            Log.i(LOG, "Speech initialized");
        }
	}

	public static Context getContext() {
		return context;
	}

	public void setContext(Context context) {
		Speech.context = context;
	}
    

}
