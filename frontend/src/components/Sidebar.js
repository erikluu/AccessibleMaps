import React, { useEffect, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import ElevationChart from './ElevationChart';
import AdvancedOptions from './AdvancedOptions';

import axios from "axios";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import CancelIcon from '@mui/icons-material/Cancel';
import PlaceIcon from '@mui/icons-material/Place';
import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Stack from '@mui/material/Stack'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import HelpIcon from '@mui/icons-material/Help';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const createQuery = require('../modules/createQuery');

const INITIAL_COORDS = [];
const INITIAL_SEARCHBARS = [];
const INITIAL_REMOVERS = [];
const INITIAL_HEIGHTS = [];

const Sidebar = (props) => {
  const {map, updateStops, sidebarState, setSidebarState, bboxAllowed, setBboxAllowed} = props;

  const [heights, setHeights] = useState(INITIAL_HEIGHTS);

  const [newLoc, setNewLoc] = useState();  
  const [curPosition, setCurPosition] = useState();
  const [canRemove, setCanRemove] = useState(INITIAL_REMOVERS);
  const updateCanRemove = (id, val) => {
    canRemove[id] = val;
    //console.log(canRemove);
  };

  const [searchBars, setSearchBars] = useState(INITIAL_SEARCHBARS);
  const addSearchBar = (id) => {
    let newID = id;
    let meta = 'init';
    if (newID === 0) {
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

  const [optionsDisplay, setOptionsDisplay] = useState("block");
  const toggleOptions = () => {
    const div = document.getElementById("options");
    if (optionsDisplay == "none") {
      setOptionsDisplay("block");
      div.style.display = "block";
    }
    else {
      setOptionsDisplay("none");
      div.style.display = "none";
    }
  }

  const getOptionsButtonText = () => {
    if (optionsDisplay == "none") {
      return "More Options";
    }
    else {
      return "Back";
    }
  };

  const getOptionsButtonIcon = () => {
    if (optionsDisplay == "none") {
      return <SettingsIcon/>;
    }
    else {
      return <ArrowBackIcon/>;
    }
  };


  // navigation function - calls backend and returns list of points
  const getRoute = async () => {
    let slope = 40;
    const query = createQuery.createQuery(coords, slope);

    if (query) {
      console.log("got", query);

      const resp = await axios.get(query);
      //console.log(resp.data[0][0].sections);
      const points = resp.data[0][0].sections[0].polyline.polyline;
      //console.log(points);
      let elevations = [];
      for (let i = 0; i < points.length; i++) {
        elevations.push({
          distance: i,
          elevation: points[i][2]
        });
      }
      setHeights(elevations);
      updateStops(points);      
    }
    
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
        if (searchBar.firstChild.id === "placeholder") {
          searchBar.removeChild(searchBar.firstChild);
          searchBar.appendChild(newGeocoder.onAdd(map.map));
          searchBar.setAttribute("id", i);
          searchBar.style.zIndex = 1000 - i;
          console.log("update searchbar: ", searchBar);

          // update most recently used searchbar so that a location can be tied to it
          searchBar.addEventListener("change", (e) => {
            setCurPosition(e.currentTarget.id);
          });
        }
      }

    }
  };

  const test = (i) => {
    if (canRemove[i]) {
      return <CancelIcon sx={{ m: 1 }} />;    
    }
    else {
      return <PlaceIcon sx={{ m: 1 }} />;
    }
  }

  const renderStops = () => {
    const fullList = searchBars.map(s => {
      const searchBar = <ListItem disablePadding key={s.id} >
        <ListItemButton>
          <div className="geocoder_div" >
            <div id="placeholder"></div>
          </div>
          <ListItemIcon
            onMouseEnter={() => updateCanRemove(s.id, true)}
            onMouseLeave={() => updateCanRemove(s.id, false)}
          >
            {test(s.id)}
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
    updateGeocoders();
  });

  useEffect(() => {
    let arr = [];
    for (let i = 0; i < searchBars.length - 1; i++)
      arr.push(false);
    setCanRemove(arr);
  }, [searchBars]);

  // return empty if the map hasn't initialized, need the map to create geocoders in the search bar
  // bug: not sure why this is true when the search bar re collapses
  if (!map) {
    return <div></div>;
  }

  // init path to have 2 stops to begin
  // bug: only the second search bar renders when they are added at the same time
  if (searchBars.length === 0) {
    addSearchBar(1);
  }
  if (searchBars.length === 1) {
    addSearchBar(2);
  } 

  return (
    <Drawer 
      anchor="left"
      open={sidebarState}
      variant="persistent"
    >
      <div className="navbar">
        <div className="navbar-header">
          <Stack   
            direction="row"
            justifyContent="space-around"
            alignItems="center"
            spacing={6}
          >
            <Typography variant="h4">
              Navigation
            </Typography>
            <IconButton 
              onClick={() => setSidebarState(false)}
            >
              <NavigateBeforeIcon />
            </IconButton>
          </Stack>
          <br className="header-br"></br>
          <Divider/>
        </div>
        <div className="navbar-body">
          <List className="navlist">
            {renderStops()}
          </List>
          <Divider>
            <NavigationOutlinedIcon sx={{ color: "black" }}/>
          </Divider>
          <Button 
            sx={{ mt: 2 }} 
            variant="contained" 
            size="large"
            onClick={() => getRoute()}
          >
            Find Route
          </Button>
          <div className="options" id="options" >
            <AdvancedOptions />
          </div>
        </div>

        <div className="nav-bottom">
          <Divider/>
          <br className="footer-br"></br>
          <Stack   
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={5}
          >
            <Button 
              variant="raised"
              endIcon={getOptionsButtonIcon()} 
              sx={{ color: "gray" }}
              size="large"
              onClick={() => toggleOptions()}
            >
              {getOptionsButtonText()}
            </Button>
            <Button 
              variant="raised"
              endIcon={<HelpIcon/>} 
              sx={{ color: "gray" }}
              size="large"
            >
              Help
            </Button>
          </Stack>
        </div>
      </div>
    </Drawer>
  );
};

export default Sidebar;