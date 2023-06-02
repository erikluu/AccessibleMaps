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

const INITIAL_BBOX = [];

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
  const [bboxAllowed, setBboxAllowed] = useState(false);
  const updateBbox = (prev) => {
    setBboxAllowed(!prev);
  };

  const [bbox, setBbox] = useState(INITIAL_BBOX);
 
  return (
    <div className="top-level" >
      <Sidebar 
        map={map} 
        updateStops={updateStops} 
        stops={stops} 
        sidebarState={sidebarState} 
        setSidebarState={setSidebarState} 
        bboxAllowed={bboxAllowed} 
        setBboxAllowed={updateBbox} 
      />
      <MapView 
        updateMap={updateMap} 
        stops={stops} 
        setSidebarState={setSidebarState}
        sidebarState={sidebarState}
        bboxAllowed={bboxAllowed}
        setBbox={setBbox}
      />
    </div>
  );
};

export default App;
