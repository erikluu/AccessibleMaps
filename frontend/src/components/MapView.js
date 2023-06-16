import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_API_KEY;

// default lat/long is set to SLO
const defLNG = -120.6252; 
const defLAT = 35.2628;
const defZoom = 9.00;

const SIDEBAR_WIDTH_PADDING = { left: 325 };
const INITIAL_ROUTE = {
  type: "FeatureCollection",
  features: [{
      type: "Feature",
      geometry: {
          type: "LineString",
          coordinates: [[-2000, -2000]]
      }
  }]
};
const INITIAL_BOX = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: []
  }
};
const INITIAL_POINT = {type: "Point", coordinates: [-2000, -2000]};

const createBoxOutline = (box) => {
  let points = [];
  const x1 = box[0].lng;
  const y1 = box[0].lat;
  const x2 = box[1].lng;
  const y2 = box[1].lat;

  points.push([x1, y1]);
  points.push([x2, y1]);
  points.push([x2, y2]);
  points.push([x1, y2]);
  points.push([x1, y1]);

  return [points];
};

const MapView = (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const canvas = useRef(null);
  const [lng, setLng] = useState(defLNG);
  const [lat, setLat] = useState(defLAT);
  const [zoom, setZoom] = useState(defZoom);

  const currentPath = props.stops;
  const {sidebarState, setSidebarState, setBox} = props;

  const [topLeftP, setTopLeftP] = useState(null);
  const [bottomRightP, setBottomRightP] = useState(null);

  const allowBox = () => {
    const div = document.getElementById("top-level");
    return div.getAttribute("data-box") != 0;
  };

  const clearBox = () => {
    document.getElementById("top-level").setAttribute("data-box", 0);
    const box = document.getElementById("bbox");
    if (box) {
      box.parentNode.removeChild(box);

      map.current.dragPan.enable();
      map.current.doubleClickZoom.enable();
      map.current.keyboard.enable();
      map.current.scrollZoom.enable();
      map.current.dragRotate.enable();
      map.current.touchZoomRotate.enable();
    }
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
    //if (!(e.shiftKey && e.button === 0)) return;
    if (!allowBox()) return;
     
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
    box.id = 'bbox';
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

    clearBox();
  };

  // route render function
  const updatePath = () => {
    const points = currentPath.map(pp => [pp[1], pp[0]]);  
    const geoJson = {
      type: "FeatureCollection",
      features: [{
          type: "Feature",
          geometry: {
              type: "LineString",
              coordinates: points
          }
      }]
    };
  
    map.current.getSource("data-update").setData(geoJson);

    const bounds = new mapboxgl.LngLatBounds(points[0], points[0]);
    for (const p of points) {
      bounds.extend(p);
    } 
    map.current.fitBounds(bounds, {
      padding: 20
    });
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
        id: "data-update",
        type: "line",
        source: {
            type: "geojson",
            data: INITIAL_ROUTE 
        },
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": "#4285F4",
            "line-width": 8
        }
      });

      // tracks a point along the current route
      map.current.addLayer({
        id: "point",
        source: {
          type: "geojson",
          data: INITIAL_POINT
        },
        type: "circle",
        paint: {
          "circle-radius": 10,
          "circle-color": "#FF0000"
        }
      });

      // bounding box template layers
      map.current.addLayer({
        id: "box1outline",
        type: "line",
        source: {
          type: "geojson",
          data: INITIAL_BOX,
        },
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 3
        }
      });
      map.current.addLayer({
        id: "box1fill",
        type: "fill",
        source: {
          type: "geojson",
          data: INITIAL_BOX,
        },
        layout: {},
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.3
        }
      });
      map.current.addLayer({
        id: "box2outline",
        type: "line",
        source: {
          type: "geojson",
          data: INITIAL_BOX,
        },
        layout: {},
        paint: {
          "line-color": "#FF0000",
          "line-width": 3
        }
      });
      map.current.addLayer({
        id: "box2fill",
        type: "fill",
        source: {
          type: "geojson",
          data: INITIAL_BOX,
        },
        layout: {},
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.3
        }
      });

      canvas.current = map.current.getCanvasContainer();
      canvas.current.addEventListener("mousedown", mouseDown, true);
    });

    map.current.on("mousedown", (e) => {
      if (!allowBox()) return;
      setTopLeftP(e.lngLat.wrap());
    });    
    map.current.on("mouseup", (e) => {
      if (!allowBox()) return;
      setBottomRightP(e.lngLat.wrap());
    });

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
      duration: 0
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
    if (currentPath.length === 0) return;
    console.log("trying to re render path");
    updatePath();
  }, [currentPath]);

  useEffect(() => {
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

  useEffect(() => {
    if (!allowBox()) return;
    console.log("adding new bounding box...", topLeftP, bottomRightP);

    const boxOutline = createBoxOutline([topLeftP, bottomRightP]);
    const geoJson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: boxOutline
      }
    };

    const b1 = map.current.getSource("box1outline");
    console.log(b1._options.data);

    if (map.current.getSource("box1outline")._options.data.geometry.coordinates.length == 0) {
      map.current.getSource("box1outline").setData(geoJson);
      map.current.getSource("box1fill").setData(geoJson);
      console.log(map.current.getSource("box1outline")._options.data);

    }
    else if (map.current.getSource("box2outline")._options.data.geometry.coordinates.length == 0) {
      map.current.getSource("box2outline").setData(geoJson);
      map.current.getSource("box2fill").setData(geoJson);
    }

    setBox([topLeftP, bottomRightP])
  }, [bottomRightP]);

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