import "./App.css";
import React, { useState } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
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

  const [box, setBox] = useState(null);
  const updateBox = (p1, p2) => {
    setBox([p1, p2]);
  };
 
  return (
    <div className="top-level" id="top-level" data-cur={-1} data-box={0} >
      <Sidebar 
        map={map} 
        updateStops={updateStops} 
        stops={stops} 
        sidebarState={sidebarState} 
        setSidebarState={setSidebarState}
        box={box}
        setBox={setBox}
      />
      <MapView 
        updateMap={updateMap} 
        stops={stops} 
        setSidebarState={setSidebarState}
        sidebarState={sidebarState}
        setBox={setBox}
      />
    </div>
  );
};

export default App;