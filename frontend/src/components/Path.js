import React, { useEffect, useMemo, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MaterialReactTable from 'material-react-table';
import parse from 'html-react-parser';
import parseHTML from 'jquery';


const INITIAL_COORDS = [];
const INITIAL_SEARCHBARS = [];

const Path = (props) => {
  const {map, updateStops} = props;

  const [newLoc, setNewLoc] = useState();

  const [searchBars, setSearchBars] = useState(INITIAL_SEARCHBARS);
  const addSearchBar = (id) => {
    let newID = id;
    let meta = 'init';
    if (newID == 0) {
      newID = searchBars[searchBars.length - 1].id + 1;
      meta = 'additional';
    }
    const data = {
      loc: '',
      id: newID,
      meta
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

  const renderStops = () => {
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


  // if a new location has been added from any geocoder (triggered when newLoc is updated) 
  // add new location to stop list
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
  }, [searchBars]);

  // return empty if the map hasn't initialized, need the map to create geocoders in the search bar
  if (!map) {
    console.log("Map initializing...");
    return <div></div>;
  }

  // init path to have 2 stops to begin
  // bug: only the second search bar would appear when they were called in the same conditional
  if (searchBars.length == 0) {
    addSearchBar(1);
  }
  if (searchBars.length == 1) {
    addSearchBar(2);
  } 

  return (
    <div style={{ margin: '5px' }}>
      <h3>Navigation</h3>
      <table>
        <tbody>
            {renderStops()}
        </tbody>
      </table>
      <button onClick={() => addSearchBar(0)}>Add Destination</button>
    </div>
  );
};

export default Path;