import urllib2
import json
import sys
import coding

reload(sys)
sys.setdefaultencoding("utf-8")

if len(sys.argv) == 3:
    city = sys.argv[1] + "%20" + sys.argv[2]
elif len(sys.argv) == 4:
    city = sys.argv[1] + "%20" + sys.argv[2] + "%20" + sys.argv[3]
elif len(sys.argv) == 5:
    city = sys.argv[1] + "%20" + sys.argv[2] + "%20" + sys.argv[3] + "%20" + sys.argv[4]
else:
    city = sys.argv[1]

f = urllib2.urlopen(
    'http://api.wunderground.com/api/6998003b34b9ada2/conditions/lang:SP/q/Argentina/' + coding.remove_accents(city) + '.json')
json_string = f.read()
parsed_json = json.loads(json_string)
location = parsed_json['current_observation']['display_location']['city']
temp_c = parsed_json['current_observation']['temp_c']
condition = parsed_json['current_observation']['weather']
humidity = parsed_json['current_observation']['relative_humidity']
visibility = parsed_json['current_observation']['visibility_km']
loc = "Temperatura actual en %s: %s grados" % (coding.remove_accents(location), temp_c)
weat = "Estado del tiempo: %s" % condition
hum = "Humedad: %s" % humidity
visi = "Visibilidad: %s km" % visibility
f.close()
print loc + "\n" + weat + "\n" + hum + "\n" + visi
