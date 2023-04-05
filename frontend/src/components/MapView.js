import React, { useRef, useEffect, useState } from "react";
import mapboxgl, {} from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
//import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined';
import axios from 'axios'

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
  
  // route stuff
  const [routeObject, setRouteObject] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentBounds, setCurrentBounds] = useState([]);
  const [currentDistance, setCurrentDistance] = useState(0); // mi or km
  const [currentDuration, setCurrentDuration] = useState(0); // seconds

  const addLoc = (item) => {
    new mapboxgl.Marker({
      draggable: true,
    }).setLngLat(item.geometry.coordinates).addTo(map.current);
    return item.place_name;
  };

  // initialize map
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
  });

  // update states bsaed on routeObject change
  useEffect(() => {
    if (routeObject) {
      const coordinates = routeObject.resourceSets[0].resources[0].routePath.line.coordinates;
      setCurrentPath(reverseTuples(coordinates));
      setCurrentBounds(routeObject.resourceSets[0].resources[0].bbox);
      setCurrentDistance(routeObject.resourceSets[0].resources[0].travelDistance);
      setCurrentDuration(routeObject.resourceSets[0].resources[0].travelDuration);
    }
  }, [routeObject]);

  
  // update map based on currentPath change, set bounds and zoom
  useEffect(() => {
    if (map.current) {
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
              'coordinates': currentPath
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
            'line-color': '#888',
            'line-width': 8
          }
        });
      });

      map.current.fitBounds(currentBounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [currentBounds, currentPath]);



  //   // add marker to mouse location on click
  //   // map.current.on("click", (e) => {
  //   //   new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map.current);
  //   // });
    
  //   map.current.on('load', () => {
  //     new mapboxgl.Marker().setLngLat([-120.669373, 35.304410]).addTo(map.current);
  //     new mapboxgl.Marker().setLngLat([-120.66529, 35.282592]).addTo(map.current);
  //     map.current.addSource('route1', {
  //       'type': 'geojson',
  //       'data': {
  //         'type': 'Feature',
  //         'properties': {},
  //         'geometry': {
  //           'type': 'LineString',
  //           'coordinates': currentPath
  //         }
  //       }
  //     });
  //     map.current.addLayer({
  //       'id': 'route1',
  //       'type': 'line',
  //       'source': 'route1',
  //       'layout': {
  //         'line-join': 'round',
  //         'line-cap': 'round'
  //       },
  //       'paint': {
  //         'line-color': '#3386c0',
  //         'line-width': 8
  //       }
  //     });


  //     // fit route to screen
  //     document.getElementById('zoomto').addEventListener('click', () => {  
  //       const bounds = new mapboxgl.LngLatBounds(currentBounds[0], currentBounds[0]);

  //       map.current.fitBounds(bounds, {
  //         padding: 20
  //       });
  //     });

  //     document.getElementById('routing').addEventListener('click', () => {
  //       const markers = document.querySelectorAll('[aria-label="Map marker"]');
  //       //const markers = document.getElementsByClassName("mapboxgl-ctrl-icon");
      
  //       for(let i = 0; i < markers.length; i++) {
  //           console.log("marker ", i);
  //           console.log(markers[i]);
  //       }
  //     });

  //   });
  // }, [routeObject]);

  // useEffect(() => {
  //   if (!map.current) return; // wait for map to initialize
  //   map.current.on("move", () => {
  //     setLng(map.current.getCenter().lng.toFixed(4));
  //     setLat(map.current.getCenter().lat.toFixed(4));
  //     setZoom(map.current.getZoom().toFixed(2));
  //   });
  // });

  function reverseTuples(list) {
    const reversedList = [];
    
    for (let i = 0; i < list.length; i++) {
      const tuple = list[i];
      reversedList.push(new mapboxgl.LngLat(tuple[1], tuple[0]));
    }
    
    return reversedList;
  }  

  // get route from /api/route
  const getRoute = async () => {
    const wp0 = [35.290401, -120.669763];
    const wp1 = [35.2813, -120.6608];
    const unit = "mi";

    const waypoint = (wp) => {
      return `${wp[0]},${wp[1]}`;
    }

    // send waypoints to server api/route
    await axios.get(`http://localhost:4000/api/route?unit=${unit}&wp0=${waypoint(wp0)}&wp1=${waypoint(wp1)}`)
      .then(response => {
        console.log(response.data);
        setRouteObject(response.data);
      }
    );
  }
  
  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <button id="zoomto" className="sidebar2">test zoom</button>
      <button onClick={getRoute} id="routing" className="sidebar3">Find route</button>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default MapView;