#!/bin/bash
#################################
# Speech Script by Dan Fountain #
# TalkToDanF@gmail.com #
#################################

INPUT=$*
STRINGNUM=0

ary=($INPUT)
echo "---------------------------"
echo "Speech Script by Dan Fountain"
echo "TalkToDanF@gmail.com"
echo "---------------------------"
for key in "${!ary[@]}"
do
SHORTTMP[$STRINGNUM]="${SHORTTMP[$STRINGNUM]} ${ary[$key]}"
LENGTH=$(echo ${#SHORTTMP[$STRINGNUM]})
#echo "word:$key, ${ary[$key]}"
#echo "adding to: $STRINGNUM"
if [[ "$LENGTH" -lt "100" ]]; then
#echo starting new line
SHORT[$STRINGNUM]=${SHORTTMP[$STRINGNUM]}
else
STRINGNUM=$(($STRINGNUM+1))
SHORTTMP[$STRINGNUM]="${ary[$key]}"
SHORT[$STRINGNUM]="${ary[$key]}"
fi
done

for key in "${!SHORT[@]}"
do
#echo "line: $key is: ${SHORT[$key]}"

echo "Playing line: $(($key+1)) of $(($STRINGNUM+1))"
mpg123 -q "http://translate.google.com/translate_tts?tl=es&q=${SHORT[$key]}"
wget -q -U Mozilla -O "out.mp3" "http://translate.google.com/translate_tts?ie=UTF-8&tl=es&q=${SHORT[$key]}"
#ffmpeg -i out.mp3 -acodec pcm_s16le -ar 44100 out.wav
avconv -i out.mp3 -ar 22000 out.wav
rm out.mp3
sudo ./a.out out.wav 90.9
rm out.wav
done
