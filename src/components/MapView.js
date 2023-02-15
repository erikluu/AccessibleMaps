import React, { useRef, useEffect, useState } from "react";
import mapboxgl, {} from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_API_KEY;

const defLNG = -120.6252; // default lat/long is set to SLO
const defLAT = 35.2628;
const defZoom = 9.00;

const morroRockLNG = -120.864096;
const morroRockLAT = 35.373504;
const pismoLNG = -120.643497;
const pismoLAT = 35.138778;


// possible schema for storing beach locations
// displays on the map based on lat/long 
// should store in database and display based on filters such as which are in view
const beachList = {
  type: "BeachCollection",
  beaches: [
    {
      type: "Beach",
      properties: {
        message: "Its Morro Rock dude",
        iconSize: [60, 60],
      },
      geometry: {
        type: "Point",
        coordinates: [morroRockLNG, morroRockLAT],
      },
      img: "https://assets.simpleviewinc.com/simpleview/image/upload/c_fill,h_640,q_75,w_640/v1/clients/morrobayca/temp_6b55308e-95b9-4995-9749-d7342425ff73.jpg"
    },
    {
      type: "Beach",
      properties: {
        message: "its pismo beach bro",
        iconSize: [60, 60],
      },
      geometry: {
        type: "Point",
        coordinates: [pismoLNG, pismoLAT],
      },
      img: "https://keyt.b-cdn.net/2020/09/118794055_1429416193923564_3229598932206464322_n-1.jpg",
    }
  ],
};

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
      //console.log(e.lngLat);
      //console.log(e.lngLat.wrap());
      new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map.current);
    });
    // Add markers to the map.
    // for (const marker of beachList.beaches) {
    //   // Create a DOM element for each marker.
    //   const mark = document.createElement("div");
    //   const width = marker.properties.iconSize[0];
    //   const height = marker.properties.iconSize[1];
    //   mark.className = "marker";
    //   mark.style.backgroundImage = `url(${marker.img})`;
    //   mark.style.width = `${width}px`;
    //   mark.style.height = `${height}px`;
    //   mark.style.backgroundSize = "100%";

    //   mark.addEventListener("click", () => {
    //     window.alert(marker.properties.message);
    //   });
    //   // Add markers to the map.
    //   new mapboxgl.Marker(mark).setLngLat(marker.geometry.coordinates).addTo(map.current);
    // }
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