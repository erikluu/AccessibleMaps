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

const SIDEBAR_WIDTH_PADDING = { left: 325 };
const INITIAL_BBOX = [0, 0];

const geojson1 = {};
const geojson2 = {};

const MapView = (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const canvas = useRef(null);
  const [lng, setLng] = useState(defLNG);
  const [lat, setLat] = useState(defLAT);
  const [zoom, setZoom] = useState(defZoom);

  const currentPath = props.stops;
  const {sidebarState, setSidebarState, bboxAllowed, setBbox} = props;

  const [bboxPoints, setBboxPoints] = useState(null);
  const updateBboxPoints = (p) => {
    console.log("updating box");
    setBboxPoints("nice");

    console.log("is now", bboxPoints);

  };

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
    map.current.boxZoom.disable();
    map.current.doubleClickZoom.disable();
    map.current.keyboard.disable();
    map.current.scrollZoom.disable();
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disable();
     
    // Call functions for the following events
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);

    // create box
    box = document.createElement('div');
    box.classList.add('boxdraw');
    box.id = "bbox";
    canvas.current.appendChild(box);
   
    // Capture the first xy coordinates
    start = mousePos(e);
  };

  const onMouseMove = (e) => {
    // Capture the ongoing xy coordinates
    current = mousePos(e);
          
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

    //map.current.dragPan.enable();

    updateBboxPoints(69);
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
  
    map.current.getSource('data-update').setData(geoJson);

    const bounds = new mapboxgl.LngLatBounds(points[0], points[0]);
    for (const p of points) {
      bounds.extend(p);
    } 
    map.current.fitBounds(bounds, {
      padding: 20
    });

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


      // tracks a point along the current route
      map.current.addLayer({
        'id': 'point',
        'source': {
          type: "geojson",
          data: geojson2
        },
        'type': 'circle',
        'paint': {
          'circle-radius': 10,
          'circle-color': "#FF0000"
        }
      });

      canvas.current = map.current.getCanvasContainer();
      canvas.current.addEventListener("mousedown", mouseDown, true);
    });

    map.current.on("mousedown", (e) => {
      console.log('p1:', e.lngLat.wrap());
      //setBboxPoints([e.lngLat.wrap(), bboxPoints[1]]);
    });

    map.current.on("mouseup", (e) => {
      console.log('p2:', e.lngLat.wrap());
      //setBboxPoints([bboxPoints[0], e.lngLat.wrap()]);
      updateBboxPoints();
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

    map.current.easeTo({
      padding: SIDEBAR_WIDTH_PADDING,
      duration: 0 // in MS
    });

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

  // redraw path every time coords are updated
  useEffect(() => {
    if (!currentPath) return;
    if (currentPath.length == 0) return;
    console.log("trying to re render path");
    updatePath();
  }, [currentPath]);

  useEffect(() => {
    console.log("slidddddddddddddeeee");

    if (sidebarState) {
      map.current.easeTo({
        padding: SIDEBAR_WIDTH_PADDING,
        duration: 1000
      });
    }
    else {
      map.current.easeTo({
        padding: { left: 0 },
        duration: 1000
      });
    }
  }, [sidebarState]);

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