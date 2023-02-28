import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/data')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  console.log(data);

  return (
    <div>
      <h1>AccessibleMaps</h1>
    </div>
  );
}

export default App;
