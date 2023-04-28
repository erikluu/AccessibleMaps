import React, { useEffect, useMemo, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PlaceIcon from '@mui/icons-material/Place';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AirlineStopsOutlinedIcon from '@mui/icons-material/AirlineStopsOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';

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
    const allSearchBars = document.getElementsByClassName("geocoder_div");
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
            console.log("update searchbar: ", searchBar);

            // update most recently used searchbar so that a location can be tied to it
            searchBar.addEventListener("change", (e) => {
              setCurPosition(e.currentTarget.id);
            });
          }
        }
      }
  };

  const renderStops = () => {
    const fullList = searchBars.map(s => {
      const searchBar = <ListItem disablePadding key={s.id} >
        <ListItemButton>
          <div className="geocoder_div" >
            <div id="placeholder"></div>
          </div>
          <ListItemIcon>
            <PlaceIcon sx={{ m: 1 }} />
          </ListItemIcon>
        </ListItemButton>
      </ListItem>;
      
      return searchBar;
    });

    const addButton = <ListItem disablePadding key="form" >
      <ListItemButton onClick={() => addSearchBar(0)} >
        <Button 
          variant="raised"
          endIcon={<AddIcon/>} 
          sx={{ color: "gray", backgroundColor: "transparent",  "&:hover": {backgroundColor: "transparent"} }}
          size="small"
          disableRipple
        >
          Add Destination
        </Button>
      </ListItemButton>
    </ListItem>;

    fullList.push(addButton);

    return fullList;
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
    <div style={{ textAlign: "center", margin: "5px" }}>
      <h3>Navigation</h3>
      <List >
        {renderStops()}
      </List>
      <Divider>
        <NavigationOutlinedIcon sx={{ color: "black" }}/>
      </Divider>
      <Button sx={{ mt: 2 }} variant="contained" size="large">Find Route</Button>
      
    </div>
  );
};

export default Path;