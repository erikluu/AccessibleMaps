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
  const canvas = useRef(null);
  const [lng, setLng] = useState(defLNG);
  const [lat, setLat] = useState(defLAT);
  const [zoom, setZoom] = useState(defZoom);

  const currentPath = props.stops;
  const {setSidebarState, bboxAllowed} = props;

  let start, box, current;

  const mousePos = (e) => {
    const rect = canvas.current.getBoundingClientRect();
  
    return new mapboxgl.Point(
      e.clientX - rect.left - canvas.current.clientLeft,
      e.clientY - rect.top - canvas.current.clientTop
    );
  };

  const mouseDown = (e) => {
    // Continue the rest of the function if bbox is allowed
    if (!(e.shiftKey && e.button === 0)) return;
     
    // Disable default drag zooming when the shift key is held down.
    map.current.dragPan.disable();
     
    // Call functions for the following events
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
     
    // Capture the first xy coordinates
    start = mousePos(e);
    console.log(start);
  };

  const onMouseMove = (e) => {
    // Capture the ongoing xy coordinates
    current = mousePos(e);
     
    // Append the box element if it doesnt exist
    if (!box) {
      box = document.createElement('div');
      box.classList.add('boxdraw');
      canvas.current.appendChild(box);
    }
     
    const minX = Math.min(start.x, current.x),
      maxX = Math.max(start.x, current.x),
      minY = Math.min(start.y, current.y),
      maxY = Math.max(start.y, current.y);
     
    // Adjust width and xy position of the box element ongoing
    const pos = `translate(${minX}px, ${minY}px)`;
    box.style.transform = pos;
    box.style.width = maxX - minX + 'px';
    box.style.height = maxY - minY + 'px';
  };
     
  const onMouseUp = (e) => {
    // Capture xy coordinates
    //finish([start, mousePos(e)]);
    //console.log("second point", e.lngLat.wrap());
    finish();
  };
     
  const onKeyDown = (e) => {
    // If the ESC key is pressed
    if (e.keyCode === 27) finish();
  };
  
  const finish = () => {
    // Remove these events now that finish has been called.
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("mouseup", onMouseUp);

    map.current.dragPan.enable();
  };

  // route render function
  const updatePath = () => {
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

    map.current.getSource('data-update').setData(geoJson);
  };

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

    map.current.boxZoom.disable();
    //map.current.doubleClickZoom.disable();
    //map.current.scrollZoom.disable();

    map.current.on("load", () => {
      // route layer
      map.current.addLayer({
        "id": "data-update",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": geojson1 
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

      canvas.current = map.current.getCanvasContainer();
      canvas.current.addEventListener("mousedown", mouseDown, true);
    });

    map.current.on("mousedown", (e) => {
      console.log("first point", e.lngLat.wrap());
    });

    map.current.on("mouseup", (e) => {
      console.log("second point", e.lngLat.wrap());
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

    return Document.getElementBy
  });




  // redraw path every time coords are updated
  useEffect(() => {
    if (!currentPath) return;
    if (currentPath.length == 0) return;
    console.log("trying to re render path");
    updatePath();
  }, [currentPath]);

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