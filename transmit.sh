#!/bin/bash

OUTPUT=`python PyScripts/clima.py $*`
# OR
OUTPUT=$(python PyScripts/clima.py $*)

./speech.sh $OUTPUT

