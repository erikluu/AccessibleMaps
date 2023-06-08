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
import Stack from '@mui/material/Stack'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const createQuery = require('../modules/createQuery');

const INITIAL_COORDS = [];
const INITIAL_SEARCHBARS = [];
const INITIAL_REMOVERS = [];

const createBoxOutline = (box) => {
  let points = [];
  const x1 = box[0].lng;
  const y1 = box[0].lat;
  const x2 = box[1].lng;
  const y2 = box[1].lat;

  points.push([x1, y1]);
  points.push([x2, y1]);
  points.push([x2, y2]);
  points.push([x1, y2]);
  points.push([x1, y1]);

  return [points];
};

const Sidebar = (props) => {
  const {map, updateStops, sidebarState, setSidebarState, box, setBox} = props;

  const [routeData, setRouteData] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [maxSlope, setMaxSlope] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newLoc, setNewLoc] = useState();  
  const [curPosition, setPosition] = useState();
  const setCurPosition = (i) => {
    const div = document.getElementById("top-level");
    div.setAttribute("data-cur", i);
    setPosition(i);
  };

  const [canRemove, setCanRemove] = useState(INITIAL_REMOVERS);
  const updateCanRemove = (id, val) => {
    canRemove[id] = val;
  };

  const [searchBars, setSearchBars] = useState(INITIAL_SEARCHBARS);
  const addSearchBar = (id) => {
    let newID = id;
    let meta = "init";
    if (newID === 0) {
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
      return <SettingsIcon/>;
    }
    else {
      return <ArrowBackIcon/>;
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

  const clearBox = () => {
    document.getElementById("top-level").setAttribute("data-box", 0);
    setBox(null);
    const box = document.getElementById("bbox");
    if (box) {
      box.parentNode.removeChild(box);

      map.map.dragPan.enable();
      map.map.doubleClickZoom.enable();
      map.map.keyboard.enable();
      map.map.scrollZoom.enable();
      map.map.dragRotate.enable();
      map.map.touchZoomRotate.enable();
    }
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
    if (box != null) {
      const boxOutline = createBoxOutline(box);
      const geoJson = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: boxOutline
        }
      };
      map.map.getSource("box1outline").setData(geoJson);
      map.map.getSource("box1fill").setData(geoJson);

    }
    clearBox();
    try {
      if (query) {
        console.log("got", query);

        const resp = await axios.get(query);
        console.log(resp.data[0].sections);
        const points = extractPoints(resp.data[0].sections);

        setRouteData(points);
        updateStops(points);      
      }
    }
    catch(err) {
      console.log("request error");
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

          // update most recently used searchbar so that a location can be tied to it
          searchBar.addEventListener("change", (e) => {
            setCurPosition(e.currentTarget.id);
          });
          searchBar.addEventListener("mouseover", (e) => {
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
    addSearchBar(1);
  }
  if (searchBars.length === 1) {
    addSearchBar(2);
  } 

  console.log("box is now", box);

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
                <NavigateBeforeIcon />
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
              <NavigationOutlinedIcon sx={{ color: "black" }}/>
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
      <Backdrop
        sx={{ color: "#fff", zIndex: 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending anonymous
            location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;