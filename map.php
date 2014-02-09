<html>
  <head>
    <title>Simple Map</title>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <meta charset="utf-8">
    <style>
      html, body, #map-canvas {
        margin: 0;
        padding: 0;
        height: 100%;
      }
    </style>
    <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
    <script>
		$_GET=function(key,def){
			try{
				return RegExp('[?&;]'+key+'=([^?&#;]*)').exec(location.href)[1]
			}catch(e){
				return def||''
			}
		}
		var lat, lon; 

		var map, layer;

		function initialize() {
				  lat = <?php echo $_GET['lat']; ?>; 
				  lon = <?php echo $_GET['lon']; ?>;
		  var city = new google.maps.LatLng(lat, lon);

		  map = new google.maps.Map(document.getElementById('map-canvas'), {
			center: city,
			zoom: 17,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		  });
		  
		  var marker = new google.maps.Marker({
			position: city,
			map: map,
			title: 'Here is it!'
		  });

		  layer = new google.maps.FusionTablesLayer({
			query: {
			  select: '\'Geocodable address\'',
			  from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'
			}
		  });
		  layer.setMap(map);
		}
		
		google.maps.event.addDomListener(window, 'load', initialize);

    </script>
  </head>
  <body>
    <div id="map-canvas"></div>
  </body>
</html>

