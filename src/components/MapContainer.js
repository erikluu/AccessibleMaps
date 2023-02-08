import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript } from '@googlemaps/react-wrapper';

const apiKey = {
  apiKey: 'AIzaSyBhW3a3NVYWLvvALgGO4QHMgrCbLPoEEEA'
};
module.exports = apiKey;

const MapContainer = () => {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const fetchKey = async () => {
      const response = await fetch(
        'https://your-api-key-server.com/api/key'
      );
      const key = await response.text();
      setApiKey(key);
    };

    fetchKey();
  }, []);

  return (
    <LoadScript googleMapsApiKey={'AIzaSyBhW3a3NVYWLvvALgGO4QHMgrCbLPoEEEA'}>
      <GoogleMap
        zoom={8}
        center={{
          lat: 37.7749,
          lng: -122.4194
        }}
      />
    </LoadScript>
  );
};

export default MapContainer;
