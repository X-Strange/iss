#!/usr/bin/python
import websocket
import json
import os
import humod
import syslog


MODEM = humod.Modem()
actions = None


def on_message(ws, message):
    syslog.syslog(message)
    j = json.loads(message)
    print j['reqType']
    print j['value']
    print j['value2']
    if j['reqType'] == "message":
        MODEM.enable_nmi(False)
        MODEM.prober.stop()
        if j['value2'] is not None:
            MODEM.send_text(j['value2'], j['value'])
        else:
            MODEM.send_text("1153396947", j['value'])
        print "Message sent"
        sms_action = (humod.actions.PATTERN['new sms'], sms_exec)
        actions = [sms_action]
        MODEM.enable_nmi(True)
        MODEM.prober.start(actions)


def on_error(ws, error):
    print error


def on_close(ws):
    syslog.syslog("### closed ###")
    websocket.enableTrace(False)
    ws = websocket.WebSocketApp("ws://xarrio.dyndns.org:8787/",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close,
                                keep_running=True)
    ws.on_open = on_open
    ws.run_forever(ping_interval=10)


def on_open(ws):
    sms_action = (humod.actions.PATTERN['new sms'], sms_exec)
    actions = [sms_action]
    MODEM.enter_text_mode()
    MODEM.enable_nmi(True)
    MODEM.prober.start(actions)


def sms_exec(modem, message):
    """Execute a shell command from an text message."""
    # Stripping message header and \r\n trailer.
    msg_num = int(message[12:].strip())
    command = modem.read_message(msg_num)
    for msg_header in modem.list_messages():
        if msg_header[0] == msg_num:
            textback_num = msg_header[2]
            break
    syslog.syslog('Executing %r' % command)
    if 'clima' in command:
        commands = command.split()
        commands.lower()
        if len(commands) == 3:
            cmd_exec = os.popen(
                "python /home/pi/PyScripts/clima.py " + commands[1] + " " + commands[2])
        elif len(commands) == 4:
            cmd_exec = os.popen(
                "python /home/pi/PyScripts/clima.py " + commands[1] + " " + commands[2] + " " + commands[3])
        else:
            cmd_exec = os.popen("python /home/pi/PyScripts/clima.py " + commands[1])
    else:
        cmd_exec = os.popen(command)
    output = cmd_exec.read()
    syslog.syslog('Sending the output back to %s output: %s' % (textback_num, output))
    modem.send_text(textback_num, output)
    modem.sms_del(0)


websocket.enableTrace(False)
ws = websocket.WebSocketApp("ws://xarrio.dyndns.org:8787/",
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close,
                            keep_running=True)
ws.on_open = on_open
ws.run_forever(ping_interval=10)

