#!/bin/bash

INPUT=$*
# Define a timestamp function 
timestamp() {
 date +"%T"
}

DEVICE="/dev/ttyUSB0"

stty --f $DEVICE raw -cstopb -crtscts -parenb -parodd cs8 19200 -onlcr -echo

# 376 octal == 254 decimal == FE hex
# 130 octal == 88 decimal  == 58 hex
# 107 octal == 71 decimal  == 47 hex

if [ "clear" = "$INPUT" ]; then
    echo -n '\376\130' > $DEVICE           # Clear screen: 254 88
    echo -n '\376\107\005\022' > $DEVICE   # Goto(5,2):  254 71 5 2 
else
echo -n '\376\107\005\022' > $DEVICE   # Goto(5,2):  254 71 5 2 
echo -n $(timestamp) $INPUT > $DEVICE
echo -n '\n\r' > $DEVICE
fi