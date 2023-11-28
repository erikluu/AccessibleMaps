import React, { useEffect, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import ElevationChart from './ElevationChart';
import AdvancedOptions from './AdvancedOptions';

import axios from "axios";

import {
  List, ListItem, ListItemButton, ListItemIcon,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Backdrop,
  CircularProgress
} from '@mui/material';

import { Place, Add, Settings, Help, ArrowBack, NavigationOutlined, NavigateBefore, Replay } from '@mui/icons-material';

const createQuery = require('../modules/createQuery');

const INITIAL_COORDS = [];
const INITIAL_SEARCHBARS = [];

const Sidebar = (props) => {
  const {map, updateStops, sidebarState, setSidebarState, box, setBox} = props;

  const [routeData, setRouteData] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [maxSlope, setMaxSlope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [newLoc, setNewLoc] = useState();  
  const [curPosition, setPosition] = useState();
  const setCurPosition = (i) => {
    const div = document.getElementById("top-level");
    div.setAttribute("data-cur", i);
    setPosition(i);
  };

  const [searchBars, setSearchBars] = useState(INITIAL_SEARCHBARS);
  const addSearchBar = (id) => {
    let newID = id;
    let meta = "init";
    if (newID === -1) {
      newID = searchBars[searchBars.length - 1].id + 1;
      meta = "additional";
    }
    const data = {
      loc: "",
      id: newID,
      meta
    };
    setSearchBars([...searchBars, data]);
  };

  const [coords, setCoords] = useState(INITIAL_COORDS);
  const addCoords = (coord, id) => {
    let curData = coords;
    while (curData.length < id) {
      curData.push(undefined);
    }
    if (curData.length == id) {
      curData.push({ id, loc: coord });
      setCoords(curData);
    }
    else {
      const newData = { id, loc: coord };
      curData[id] = newData;
      setCoords(curData);
    }
  };

  const [optionsDisplay, setOptionsDisplay] = useState("none");
  const toggleOptions = () => {
    const div1 = document.getElementById("options");
    const div2 = document.getElementById("stoplist");
    if (optionsDisplay == "none") {
      setOptionsDisplay("block");
      div1.style.display = "block";
      div2.style.visibility = "hidden";
    }
    else {
      setOptionsDisplay("none");
      div1.style.display = "none";
      div2.style.visibility = "visible";
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
      return <Settings/>;
    }
    else {
      return <ArrowBack/>;
    }
  };


  // updates path list with new coordinates for each searchbar
  const addLoc = (item) => {
    const div = document.getElementById("top-level");
    const pos = div.getAttribute("data-cur");

    const newCoords = item.geometry.coordinates;
    setNewLoc(newCoords);
    const marker = new map.mapboxgl.Marker({
      draggable: true,
      occludedOpacity: pos,
    })
    .setLngLat(newCoords)
    .addTo(map.map);

    const onDragEnd = () => {
      setCurPosition(pos);
      const lngLat = marker.getLngLat();
      setNewLoc([lngLat.lng, lngLat.lat]);
      setDragging(true);
    };
    marker.on('dragend', onDragEnd);

    return item.place_name;
  };

  const extractPoints = (sections) => {
    let allPoints = [];
    for (const section of sections) {
      for (const segment of section.segments) {
        for (const point of segment.points) {
          allPoints.push([point[0], point[1], point[3]]);
        }
      }
    }
    return allPoints;
  };
  
  // navigation function - calls backend and returns list of points
  const getRoute = async () => {
    setLoading(true);
    const query = createQuery.createQuery(coords, maxSlope, box);
    try {
      if (query) {
        console.log("got", query);

        const resp = await axios.get(query);

        // error checking
        if (resp.hasOwnProperty("error")) {
          setAlert(true);
          setAlertMsg(resp.error.message);
          return;
        }

        //console.log(resp.data[0].sections);
        const points = extractPoints(resp.data[0].sections);

        setRouteData(points);
        updateStops(points);      
      }
    }
    catch(err) {
      console.log("unknown error");
      setAlert(true);
      setAlertMsg("Internal server error, please try again.");
    }
    finally {
      setLoading(false);
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
          searchBar.style.zIndex = 100 - i;
          console.log("update searchbar: ", searchBar);
        }
      }
    }
  };

  const resetButtonFn = () => {
    setSearchBars(INITIAL_SEARCHBARS);
    
  }

  const renderStops = () => {
    const fullList = searchBars.map(s => {
      const searchBar = <ListItem disablePadding key={s.id} onMouseEnter={() => setCurPosition(s.id)}>
        <ListItemButton >
          <div className="geocoder_div" >
            <div id="placeholder"></div>
          </div>
          <ListItemIcon>
            <Place sx={{ m: 1 }} />
          </ListItemIcon>
        </ListItemButton>
      </ListItem>;
      
      return searchBar;
    });

    const resetButton = <ListItem disablePadding key="reset" >
      <ListItemButton onClick={() => resetButtonFn()} >
        <Button 
          variant="raised"
          endIcon={<Replay/>} 
          sx={{ color: "gray", backgroundColor: "transparent",  "&:hover": {backgroundColor: "transparent"} }}
          size="small"
          disableRipple
        >
          Reset Route
        </Button>
      </ListItemButton>
    </ListItem>;

    const addButton = <ListItem disablePadding key="form" >
      <ListItemButton onClick={() => addSearchBar(-1)} >
        <Button 
          variant="raised"
          endIcon={<Add/>} 
          sx={{ color: "gray", backgroundColor: "transparent",  "&:hover": {backgroundColor: "transparent"} }}
          size="small"
          disableRipple
        >
          Add Destination
        </Button>
      </ListItemButton>
    </ListItem>;

    fullList.push(addButton);

    if (searchBars.length > 2) {
      fullList.push(resetButton);
    }

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
    //setCanRemove(arr);
  }, [searchBars]);

  useEffect(() => {
    if (dragging & routeData == null) {
      setDragging(false);
    }
    if (dragging & routeData != null) {
      setDragging(false);
      getRoute();
    }
  }, [dragging]);

  // return empty if the map hasn't initialized, need the map to create geocoders in the search bar
  if (!map) {
    return <div></div>;
  }

  // init path to have 2 stops to begin
  if (searchBars.length === 0) {
    addSearchBar(0);
  }
  if (searchBars.length === 1) {
    addSearchBar(1);
  } 

  return (
    <div>
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
                <NavigateBefore />
              </IconButton>
            </Stack>
            <br className="header-br"></br>
            <Divider/>
          </div>
          <div className="navbar-body">
            <List className="navlist" id="stoplist" >
              {renderStops()}
            </List>
            <Divider>
              <NavigationOutlined sx={{ color: "black" }}/>
            </Divider>
            <Button 
              sx={{ mt: 1 }} 
              variant="contained" 
              size="large"
              onClick={() => getRoute()}
            >
              Find Route
            </Button>
            <div className="options" id="options" >
              <AdvancedOptions map={map} setMaxSlope={setMaxSlope} setBox={setBox}/>
            </div>
            <div 
              className="chart-wrapper" 
              onMouseLeave={() => map.map.getSource("point").setData({type: "Point", coordinates: [-2000, -2000]})}
            >
              <ElevationChart routeData={routeData} map={map} />
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
                endIcon={<Help/>} 
                sx={{ color: "gray" }}
                size="large"
              >
                Help
              </Button>
            </Stack>
          </div>
        </div>
      </Drawer>
      <Backdrop
        sx={{ color: "#fff", zIndex: 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={alert}
      >
        <DialogTitle>
          {"Error Finding Route"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {alertMsg}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlert(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;