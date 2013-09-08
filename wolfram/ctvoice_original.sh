#!/bin/bash

# c't Hardware Hacks - Spracherkennung für den Raspberry Pi, GPL-Lizenz

count=1
lastsize=0
rec=0
first=1

# Der Soundchip des RPI erzeugt vor und nach der Wiedergabe ein Knacken. Deutlich bessere Ergebnisse liefert eine USB-Soundkarte, wie man sie bereits für rund fünf Euro bekommt. Damit mplayer die USB-Soundkarte benutzt, ändert man den Parameter "-ao alsa:device=hw=0.0" in "-ao alsa:device=hw=1.0".

function say {
mplayer -ao alsa:device=hw=0.0 -really-quiet -http-header-fields "User-Agent:Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22m" "http://translate.google.com/translate_tts?tl=es&q=$1";
} 

sox -t alsa hw:1,0 test.wav silence 1 0 0.5% -1 1.0 1% &
sox_pid=$!

while [ $count -le 9 ]
do
   
size=$(stat --printf="%s" test.wav)

if [ $size -gt $lastsize ]
	then
		if [ $first -eq 0 ]
		then
			echo "Recording!"
			rec=1
		else
			first=0
		fi
	else
		if [ $rec -eq 1 ]
			then
				echo "Sending"
				kill $sox_pid
				ffmpeg -loglevel panic -y -i test.wav -ar 16000 -acodec flac file.flac
				wget -q -U "Mozilla/5.0" --post-file file.flac --header "Content-Type: audio/x-flac; rate=16000" -O - "http://www.google.com/speech-api/v1/recognize?lang=es-sp&client=chromium" | cut -d\" -f12 >stt.txt
				cat stt.txt
				say "Dijiste: $(cat stt.txt)"

				if [[ $(cat stt.txt) =~ "comando" ]]
				then
					echo "Voice command recognized!"
 					say "Comando de voz reconocido! Ejecutando comando!"
					# mach was
				elif [[ $(cat stt.txt) =~ "clima" ]]
				then
					echo "Weather recognized!"
					# mach was
					python /home/pi/PyScripts/clima.py $(cat stt.txt | awk '1 {print $2, $3, $4}') > response.txt
					say "El clima en la ciudad es:"
					say "$(cat response.txt)"
				else
 					echo "Command not recognized..."
				fi

			sleep 1
			bash ctvoice.sh
		else
			echo "Silence..."
		fi
		rec=0
fi

lastsize=$size

sleep 1

done
