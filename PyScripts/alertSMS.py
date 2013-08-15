__author__ = 'daniel'

import websocket
import json
import sys


def on_message(ws, message):
    content = {'ns': 'org.xarrio.websocket.XarrioPlugin', 'type': 'message', 'value':  sys.argv[1:],
               'value2': '1153396947'}
    content = json.dumps(content)
    ws.send(content)
    print message
    ws.close()


def on_error(ws, error):
    print error


def on_close(ws):
    print "### closed ###"


def on_open(ws):
    ws.send("Hello")
    #ws.close()


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://xarrio.dyndns.org:8787/",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever()

