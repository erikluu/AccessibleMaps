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

function App() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleViewSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div>
      <SideBar isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
      <MapView />
    </div>
  );
}

export default App;
