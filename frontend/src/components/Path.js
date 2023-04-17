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
  console.log("path: map props", map);



  const [stops, setStops] = useState(INITIAL_STATE);
  const [geocoders, setGeocoders] = useState([]);


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
      getItemValue: map.addLoc,
      marker: false,
      mapboxgl: map.mapboxgl,
    });

    return stops.map(s => {
      const stop = <tr key={s.id} >
        <td className="geocoder_td" >
          <div className="mapboxgl-ctrl-geocoder mapboxgl-ctrl" id="placeholder">
            {parse(geocoderPlaceholder.onAdd(map.map).innerHTML)}
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
      getItemValue: map.addLoc,
      marker: false,
      mapboxgl: map.mapboxgl,
    });

    const stop = allStops[i];
    console.log('nice', stop);
    if (stop.hasChildNodes()) {
      if (stop.firstChild.id == "placeholder") {
        console.log("GOOOOOOOOOOOOOOOD");
        stop.removeChild(stop.firstChild);
        stop.appendChild(newGeocoder.onAdd(map.current));
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