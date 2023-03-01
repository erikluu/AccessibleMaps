import "./App.css";
import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import axios from 'axios';
import MapView from "./components/MapView";

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
/>;

function App() {

  const [waypoints, setWaypoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDistanceUnit, setRouteDistanceUnit] = useState('mi'); // 'km' or 'mi'

  const waypoint0 = 'Cal Poly, CA';
  const waypoint1 = '776 Chorro St, San Luis Obispo, CA';

  useEffect(() => {
    axios.get(`http://localhost:4000/api/route?wp0=${waypoint0}&wp1=${waypoint1}&unit=${routeDistanceUnit}`)
      .then(response => {
        setRoutePath(response.data.resourceSets[0].resources[0].routePath.line.coordinates);
        setRouteDistance(response.data.resourceSets[0].resources[0].travelDistance);
        setRouteDistanceUnit(response.data.resourceSets[0].resources[0].travelDistanceUnit);
        
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <MapView />
    </div>
  );
}

export default App;
