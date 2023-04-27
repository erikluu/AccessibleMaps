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
  const [curPosition, setCurPosition] = useState();

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
  const addCoords = (coord, id) => {
    const data = {
      id,
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
            searchBar.removeChild(searchBar.firstChild);
            searchBar.appendChild(newGeocoder.onAdd(map.map));
            searchBar.setAttribute("id", i);
            console.log("updated searchbar: ", searchBar);

            // update most recently used searchbar so that a location can be tied to it
            searchBar.addEventListener("change", (e) => {
              setCurPosition(e.currentTarget.id);
            });
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
  };

  // if a new location has been added from any geocoder (triggered when newLoc is updated) 
  // add new location to stop list
  useEffect(() => {
    if (!newLoc)
      return;
    addCoords(newLoc, curPosition);
    setNewLoc(undefined);
  }, [newLoc]);

  useEffect(() => {
    updateStops(coords)
  }, [coords]);

  useEffect(() => {
    updateGeocoders();
  });

  // return empty if the map hasn't initialized, need the map to create geocoders in the search bar
  // bug: not sure why this is true when the search bar re collapses
  if (!map) {
    return <div></div>;
  }

  // init path to have 2 stops to begin
  // bug: only the second search bar renders when they are added at the same time
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