import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

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
      <h1>AccessibleMaps</h1>
    </div>
  );
}

export default App;
