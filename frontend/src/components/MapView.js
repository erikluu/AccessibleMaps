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

const MapView = (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(defLNG);
  const [lat, setLat] = useState(defLAT);
  const [zoom, setZoom] = useState(defZoom);
  const [pathRendered, setPathRender] = useState(false);


  const [waypoints, setWaypoints] = useState([]); // list of lists of coordinates in order
  const [routes, setRoutes] = useState(null); // list of route objects 

  const currentPath = props.stops;
  if (currentPath.length >= 2 && !pathRendered) {
    const qeury = createQuery.createQuery(currentPath);
    setPathRender(true);
  }

  const addLoc = (item) => {
    const coords = item.geometry.coordinates;
    const marker = new mapboxgl.Marker({
      draggable: true,
    })
    .setLngLat(coords)
    .addTo(map.current);

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

    map.current.on("load", () => {});

    props.updateMap({
      map: map.current,
      mapboxgl,
    });
  });

  // // get route
  // useEffect(() => {
  //   if (!map.current) return; // wait for map to initialize
  //   const getURL = (waypoints, routeDistanceUnit) => {
  //     let url = `http://localhost:4000/api/route?unit=${routeDistanceUnit}`;
  //     for (let i = 0; i < waypoints.length; i++) {
  //       url += `&wp${i}=${waypoints[i]}`;
  //     }
  //     return url;
  //   }
    
  //   axios.get(`${getURL(waypoints, routeDistanceUnit)}`)
  //     .then(response => {
  //       // setRoutePath(response);
  //       // setRouteDistance(response.data.resourceSets[0].resources[0].travelDistance);
  //       console.log(response);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // }, [waypoints, routeDistanceUnit]);


  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  // get route from /api/route
  const getRoute = async () => {
    const wp0 = [35.290401, -120.669763];
    const wp1 = [35.2813, -120.6608];
    const wp2 = [35.282592, -120.66529];
    const unit = "imperial";

    // [lat, lng] -> "lat,lng"
    const waypoint = (wp) => {
      return `${wp[0]},${wp[1]}`;
    }

    // send waypoints to server api/route
    await axios.get(`http://localhost:4000/api/route?units=${unit}&wp0=${waypoint(wp0)}&wp1=${waypoint(wp1)}&wp2=${waypoint(wp2)}`)
      .then(response => {
        console.log(response.data);
      }
    );
  }

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default MapView;