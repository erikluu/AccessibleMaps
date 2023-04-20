import React, { useMemo, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MaterialReactTable from 'material-react-table';
import parse from 'html-react-parser';
import parseHTML from 'jquery';

const INITIAL_STATE = [
  {loc: '', id: 1},
  {loc: '', id: 2}
]

const Path = (props) => {
  const map = props.mapData;
  const updateMasterPath = props.updateStops;

  const [stops, setStops] = useState(INITIAL_STATE);
  const [geocoders, setGeocoders] = useState([]);

  const addLoc = (item) => {
    const coords = item.geometry.coordinates;
    updateMasterPath(coords);
    const marker = new map.mapboxgl.Marker({
      draggable: true,
    })
    .setLngLat(coords)
    .addTo(map.map);

    return item.place_name;
  };

  const addStop = () => {
    const data = {
      loc: '',
      id: stops[stops.length - 1].id + 1
    };
    setStops([...stops, data]);
  };

  const renderUsers = () => {
    const geocoderPlaceholder = new MapboxGeocoder({
      accessToken: map.mapboxgl.accessToken,
      getItemValue: addLoc,
      marker: false,
      mapboxgl: map.mapboxgl,
    });

    return stops.map(s => {
      const stop = <tr key={s.id} >
        <td className="geocoder_td" >
          <div className="mapboxgl-ctrl-geocoder mapboxgl-ctrl" id="placeholder">
            {parse(geocoderPlaceholder.onAdd(map.map).outerHTML)}
          </div>
        </td>
      </tr>;
      
      return stop;
    });
  }

  if (!map) {
    return <div></div>;
  }

  const allStops = document.getElementsByClassName("geocoder_td");
  for (let i  = 0; i < allStops.length; i++) {
    const newGeocoder = new MapboxGeocoder({
      accessToken: map.mapboxgl.accessToken,
      getItemValue: addLoc,
      marker: false,
      mapboxgl: map.mapboxgl,
    });

    const stop = allStops[i];
    if (stop.hasChildNodes()) {
      if (stop.firstChild.id === "placeholder") {
        console.log("GOOOOOOOOOOOOOOOD");
        stop.removeChild(stop.firstChild);
        stop.appendChild(newGeocoder.onAdd(map.map));
      }
    }
  }

  return (
    <div style={{ margin: '5px' }}>
      <h3>Navigation</h3>
      <table>
        <tbody>
            {renderUsers()}
        </tbody>
      </table>
      <button onClick={addStop}>Add Destination</button>
    </div>
  );
};

export default Path;