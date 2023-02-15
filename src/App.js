import "./App.css";
import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import MapView from "./components/MapView";

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
/>;

function App() {
  return (
    <div>
      <MapView />
    </div>
  );
}

export default App;