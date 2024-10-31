var map = L.map("map", {
  center: [0, 0],
  zoom: 2,
  layers: [
    L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
      attribution: "Map data &copy; OpenStreetMap contributors",
      noWrap: true,
      minZoom: 1,
      maxZoom: 18,
    }),
  ],
});

var geojsonMarkerOptions = {
  radius: 10,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.5,
};

var realtime = get_realtime();
realtime.addTo(map);

function get_realtime() {
  // https://www.iconfinder.com/icons/379470/hacker_icon
  var hazardIcon = L.icon({
    iconUrl: "./icon.png", // Replace with your hazard icon URL
    iconSize: [40, 40], // Size of the icon
    iconAnchor: [20, 20], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // Point from which the popup should open relative to the iconAnchor
  });

  realtime = L.realtime(
    {
      url: "http://127.0.0.1:5500/geodata.geojson",
      crossOrigin: true,
      type: "json",
    },
    {
      interval: 5 * 1000,
      force: false, 
//      getFeatureId: function (f) {
//        return f.properties.url;
//      },
      getFeatureId: function (feature) {
        return feature.id; 
      },
      start: true,
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: hazardIcon }); // Use Font Awesome icon
      },
    }
  );
  return realtime;
}

realtime.on("update", function (e) {
  //document.getElementById("is_running").innerHTML = realtime.isRunning();

  var coordPart = function (v, dirs) {
      return (
        dirs.charAt(v >= 0 ? 0 : 1) +
        (Math.round(Math.abs(v) * 100) / 100).toString()
      );
    },
    popupContent = function (fId) {
      var feature = e.features[fId],
        c = feature.geometry.coordinates;
      title = feature.properties.title;
      return (
        "Earthquake at " +
        coordPart(c[1], "NS") +
        ", " +
        coordPart(c[0], "EW") +
        "<br><b>" +
        title +
        "</b>"
      );
    },
    bindFeaturePopup = function (fId) {
      realtime.getLayer(fId).bindPopup(popupContent(fId));
    },
    updateFeaturePopup = function (fId) {
      realtime.getLayer(fId).getPopup().setContent(popupContent(fId));
    };

  //map.fitBounds(realtime.getBounds(), {maxZoom: 1});

  Object.keys(e.enter).forEach(bindFeaturePopup);
  Object.keys(e.update).forEach(updateFeaturePopup);
});
