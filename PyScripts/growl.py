# use standard Python logging
import logging
logging.basicConfig(level=logging.INFO)
import gntp.notifier

growl = gntp.notifier.GrowlNotifier(
 applicationName = "Rasp",
 notifications = ["New Updates","New Messages"],
 defaultNotifications = ["New Messages"],
 hostname = "192.168.0.3",
 password = "narf"
)
growl.register()
# Send one message
growl.notify(
 noteType = "New Messages",
 title = "Alerta de camara",
 description = "Movimiento detectado",
 icon = "https://www.iconfinder.com/icons/48991/download/png/128",
 sticky = False,
 priority = 1,
)