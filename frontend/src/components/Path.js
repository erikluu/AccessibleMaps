import React, { useEffect, useMemo, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MaterialReactTable from 'material-react-table';
import parse from 'html-react-parser';
import parseHTML from 'jquery';

const INITIAL_SEARCHBARS = [
  {loc: '', id: 1},
  {loc: '', id: 2}
];
const INITIAL_COORDS = [];

const Path = (props) => {
  const map = props.mapData;
  const updateStops = props.updateStops;
  
  const [newLoc, setNewLoc] = useState();

  const [searchBars, setSearchBars] = useState(INITIAL_SEARCHBARS);
  const addSearchBar = () => {
    const data = {
      loc: '',
      id: searchBars[searchBars.length - 1].id + 1
    };
    setSearchBars([...searchBars, data]);
  };

  const [coords, setCoords] = useState(INITIAL_COORDS);
  const addCoords = (coord) => {
    const data = {
      id: "TODO",
      loc: coord
    };
    setCoords([...coords, data]);
  };

  const addLoc = (item) => {
    console.log(item);
    const newCoords = item.geometry.coordinates;
    setNewLoc(newCoords);
    const marker = new map.mapboxgl.Marker({
      draggable: true,
    })
    .setLngLat(newCoords)
    .addTo(map.map);

    return item.place_name;
  };

  const updateGeocoders = () => {
    const allSearchBars = document.getElementsByClassName("geocoder_td");
      for (let i  = 0; i < allSearchBars.length; i++) {
        const newGeocoder = new MapboxGeocoder({
          accessToken: map.mapboxgl.accessToken,
          getItemValue: addLoc,
          marker: false,
          mapboxgl: map.mapboxgl,
        });

        const searchBar = allSearchBars[i];
        if (searchBar.hasChildNodes()) {
          if (searchBar.firstChild.id == "placeholder") {
            console.log("GOOOOOOOOOOOOOOOD");
            searchBar.removeChild(searchBar.firstChild);
            searchBar.appendChild(newGeocoder.onAdd(map.map));
          }
        }
      }
  };

  const renderUsers = () => {
    const geocoderPlaceholder = new MapboxGeocoder({
      accessToken: map.mapboxgl.accessToken,
      getItemValue: addLoc,
      marker: false,
      mapboxgl: map.mapboxgl,
    });

    return searchBars.map(s => {
      const searchBar = <tr key={s.id} >
        <td className="geocoder_td" >
          <div className="mapboxgl-ctrl-geocoder mapboxgl-ctrl" id="placeholder">
            {parse(geocoderPlaceholder.onAdd(map.map).outerHTML)}
          </div>
        </td>
      </tr>;
      
      return searchBar;
    });
  }

  useEffect(() => {
    if (!newLoc)
      return;
    addCoords(newLoc);
    setNewLoc(undefined);
  }, [newLoc]);

  useEffect(() => {
    updateStops(coords)
  }, [coords]);

  useEffect(() => {
    updateGeocoders();
  }, []);

  useEffect(() => {
    updateGeocoders();
  }, [searchBars]);


  if (!map) {
    return <div></div>;
  }


  return (
    <div style={{ margin: '5px' }}>
      <h3>Navigation</h3>
      <table>
        <tbody>
            {renderUsers()}
        </tbody>
      </table>
      <button onClick={addSearchBar}>Add Destination</button>
    </div>
  );
};

export default Path;