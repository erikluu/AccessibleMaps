import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import axios from "axios";

const createQuery = require('../modules/createQuery');

mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_API_KEY;

// default lat/long is set to SLO
const defLNG = -120.6252; 
const defLAT = 35.2628;
const defZoom = 9.00;


const geojson1 = {
  "type": "FeatureCollection",
  "features": [{
      "type": "Feature",
      "geometry": {
          "type": "LineString",
          "coordinates": [
                  [-122.48369693756104, 37.83381888486939],
                  [-122.48348236083984, 37.83317489144141],
                  [-122.48339653015138, 37.83270036637107],
                  [-122.48356819152832, 37.832056363179625],
                  [-122.48404026031496, 37.83114119107971]
              ]
      }
  }]
};

const MapView = (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(defLNG);
  const [lat, setLat] = useState(defLAT);
  const [zoom, setZoom] = useState(defZoom);
  const [pathRendered, setPathRender] = useState(false);

  const [route, setRoute] = useState(null);

  const currentPath = props.stops;
  const {setSidebarState} = props;

  // current route render method
  // TODO: make a better way of detecting when a new route is set
  if (currentPath.length != 0 && !pathRendered) {
    const points = currentPath.map(pp => [pp[1], pp[0]]);

    const geoJson = {
      "type": "FeatureCollection",
      "features": [{
          "type": "Feature",
          "geometry": {
              "type": "LineString",
              "coordinates": points
          }
      }]
    };

    const bounds = new mapboxgl.LngLatBounds(points[0], points[0]);
    for (const p of points) {
      bounds.extend(p);
    } 
    map.current.fitBounds(bounds, {
      padding: 20
    });

    setPathRender(true);
    setRoute(geoJson);
    map.current.getSource('data-update').setData(geoJson);
    console.log('update tile source')
  }

  const addLoc = (item) => {
    const coords = item.geometry.coordinates;
    new mapboxgl.Marker({
      draggable: true,
    }).setLngLat(coords).addTo(map.current);

    return item.place_name;
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      map.current.addLayer({
        "id": "data-update",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": geojson1 // your previously defined variable
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#4285F4",
            "line-width": 8
        }
    });
    });

    // add search bar
    map.current.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        getItemValue: addLoc,
        marker: false,
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

    props.updateMap({
      map: map.current,
      mapboxgl,
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
      <button onClick={() => setSidebarState(true)} className="sidebar-toggle">
        &#8250;
      </button>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default MapView;