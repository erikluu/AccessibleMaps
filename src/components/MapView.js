import React, { useRef, useEffect, useState } from "react";
import mapboxgl, {} from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_API_KEY;

const defLNG = -120.6252; // default lat/long is set to SLO
const defLAT = 35.2628;
const defZoom = 9.00;

function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(defLNG);
  const [lat, setLat] = useState(defLAT);
  const [zoom, setZoom] = useState(defZoom);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    // add search bar
    map.current.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
      })
    );
    // track user location
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
    );

    map.current.on("click", (e) => {
      new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map.current);
    });
    
    map.current.on('load', () => {
      new mapboxgl.Marker().setLngLat([-120.669373, 35.304410]).addTo(map.current);
      new mapboxgl.Marker().setLngLat([-120.66529, 35.282592]).addTo(map.current);
      map.current.addSource('route1', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              [-120.669373, 35.304410],
              [-120.667825, 35.302423],
              [-120.668112, 35.302322],
              [-120.668584, 35.302055],
              [-120.669997, 35.300665],
              [-120.671043, 35.299108],
              [-120.671599, 35.298879],
              [-120.672737, 35.298826],
              [-120.67436, 35.298190],
              [-120.674156, 35.297916],
              [-120.673775, 35.297704],
              [-120.671281, 35.294490],
              [-120.670999, 35.294176],
              [-120.670128, 35.293591],
              [-120.669802, 35.293148],
              [-120.669763, 35.290401],
              [-120.669377, 35.288805],
              [-120.668299, 35.286070],
              [-120.667511, 35.285137],
              [-120.667262, 35.284824],
              [-120.66529, 35.282592]
            ]
          }
        }
      });
      map.current.addLayer({
        'id': 'route1',
        'type': 'line',
        'source': 'route1',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#307bf2',
          'line-width': 8
        }
      });
    });
  });


  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default MapView;