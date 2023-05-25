import "./App.css";
import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import axios from 'axios';
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
/>;

const App = () => {
  const [map, setMap] = useState();
  const updateMap = (map) => {
    setMap(map);
  };

  const [stops, setStops] = useState([]);
  const updateStops = (stops) => {
    setStops(stops);
  };

  const [sidebarState, setSidebarState] = useState(true);
  
 
  return (
    <div className="top-level" >
      <Sidebar map={map} updateStops={updateStops} stops={stops} sidebarState={sidebarState} setSidebarState={setSidebarState} />
      <MapView updateMap={updateMap} stops={stops} setSidebarState={setSidebarState} />
    </div>
  );
};

export default App;
