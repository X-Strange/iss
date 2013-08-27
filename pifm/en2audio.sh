#!/bin/bash
# write an English text string as an audio file using Google Translate
# usage: en2audio.sh <text>
wget -q -U Mozilla -O "out.mp3" "http://translate.google.com/translate_tts?ie=UTF-8&tl=en&q=$*"
#ffmpeg -i out.mp3 -acodec pcm_s16le -ar 44100 out.wav
avconv -i out.mp3 -ar 22000 out.wav
rm out.mp3