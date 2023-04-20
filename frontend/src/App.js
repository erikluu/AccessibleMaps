import "./App.css";
import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import axios from 'axios';
import SideBar from "./components/SideBar";
import MapView from "./components/MapView";

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
/>;

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleViewSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [map, setMap] = useState();
  const updateMap = (map) => {
    setMap(map);
  };

  const [stops, setStops] = useState([]);
  const updateStops = (stop) => {
    const data = {
      id: 'TODO',
      coords: stop
    };
    setStops([...stops, data]);
  };
 
  return (
    <div className="top-level">
      <SideBar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} mapData={map} updateStops={updateStops} />
      <MapView getMap={updateMap} stops={stops} />
    </div>
  );
};

export default App;
