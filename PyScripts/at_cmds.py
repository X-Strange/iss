#!/usr/bin/env python
"""
at_cmds_v4.py - All AT commands and all classes are here. Call them from outside. 
"""
## The packges below must be installed in advance
## yum -y install python-setuptools
## easy_install pyserial
 
import serial
import time
 
class ATcommands:
    def setDialledNumber(self, number):
        self.dialledNumber = number
 
    def setRecipient(self, number):
        self.recipient = number
 
    def setContent(self, message):
        self.content = message
 
    def connectPhone(self):
        self.ser = serial.Serial('/dev/ttyACM0', 460800, timeout=5)
        time.sleep(1)
 
    def disconnectPhone(self):
        self.ser.close()
 
 
class TextMessage:
    def __init__(self, recipient="0000000", message="TextMessage.content not set."):
        self.recipient = recipient
        self.content = message
 
    def sendMessage(self):
        self.ser = serial.Serial('/dev/ttyACM0', 460800, timeout=5)
        self.ser.write('ATZ\r')
        time.sleep(1)
        self.ser.write('AT+CMGF=1\r')
        time.sleep(1)
        self.ser.write('''AT+CMGS="''' + self.recipient + '''"\r''')
        #self.ser.write('AT+CMGS="' + self.recipient + '"\r')
        time.sleep(1)
        self.ser.write(self.content + "\r")
        time.sleep(1)
        self.ser.write(chr(26))
        time.sleep(1)
 
 
class VoiceCall:
    def __init__(self, dialledNumber='000000'):
        self.dialledNumber = dialledNumber
 
    def dialNumber(self):
        self.ser = serial.Serial('/dev/ttyACM0', 460800, timeout=5)
        self.ser.write('ATZ\r')
                ## ATZ : Restore profile ##
        time.sleep(1)
        self.ser.write('ATD ' + self.dialledNumber + ';\r')
                ## ATD : Dial command ##
                ## semicolon : voice call ##
        time.sleep(1)
        time.sleep(1)
        self.ser.write(chr(26))
        time.sleep(1)
        time.sleep(1)
        time.sleep(1)
 
    def endCall(self):
        self.ser = serial.Serial('/dev/ttyACM0', 460800, timeout=5)
        self.ser.write('ATZ\r')
        time.sleep(1)
        self.ser.write('AT+CHUP\r')
        time.sleep(1)
        self.ser.write(chr(26))
        time.sleep(1)
 
 
 
 
#Main function that calls other functions - Makes script reusable
def main():
	pass
 
if __name__ == "__main__":
	main()
