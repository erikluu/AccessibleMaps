import "./App.css";
import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import {axios} from "axios";
import MapView from "./components/MapView";

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
/>;

function App() {

  const waypoint0 = 'Cal Poly, CA';
  const waypoint1 = '776 Chorro St, San Luis Obispo, CA';

  useEffect(() => {
    axios.get(`http://localhost:5000/api/route?wp.0=${waypoint0}&wp.1=${waypoint1}`)
      .then(response => {
        console.log(response.data.resourceSets[0].resources[0]);
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
