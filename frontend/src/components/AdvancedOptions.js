import React, { useEffect, useState } from 'react';

import { Slider, Button, Stack, IconButton, Tooltip, Typography, Divider } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';


const DEFAULT_ADA_SLOPE = 8;

const INITIAL_BOX = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: []
  }
};

const AdvancedOptions = (props) => {
  const {map, setMaxSlope, setBox} = props;

  const [slope, setSlope] = useState(0); 
  const handleSliderChange = (event, newValue) => {
    setSlope(newValue);
  };

  useEffect(() => {
    setMaxSlope(slope);
  }, [slope]);

  const allowBox = () => {
    document.getElementById("top-level").setAttribute("data-box", 1);
  };

  const clearBox = () => {
    document.getElementById("top-level").setAttribute("data-box", 0);
    map.map.getSource("box1outline").setData(INITIAL_BOX);
    map.map.getSource("box1fill").setData(INITIAL_BOX);
    setBox(null);
  };

  return (
    <div className="advanced-options">
      <Typography
        variant="h6"
      >
        Set Maximum Grade
      </Typography>
      <br className="menu-spacer"></br>
      <Typography 
        variant="body2"
      >
        Select the maximum grade, as a percent. The returned route will not exceed this value. Standard ADA grade is 8%.
      </Typography>
      <Stack 
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        spacing={1}
      >
        <Slider
          min={0}
          max={20}
          default={DEFAULT_ADA_SLOPE}
          valueLabelDisplay="auto"
          value={slope}
          onChange={handleSliderChange}
          sx={{color: "gray"}}
        />
        <Tooltip 
          placement="top"
          title="Remove Filter"
        >
          <IconButton 
            onClick={() => setMaxSlope(null)}
          >
            <CancelIcon/>
          </IconButton>
        </Tooltip>
      </Stack>
      <br className="menu-spacer"></br>
      <Divider/>
      <br className="menu-spacer"></br>
      <br className="menu-spacer"></br>
      <Typography
        variant="h6"
      >
        Select Sections to Avoid
      </Typography>
      <br className="menu-spacer"></br>
      <Typography 
        variant="body2"
      >
        Select an area on the map to avoid. Click on the button below to define the bounds by clicking and dragging on the map.
      </Typography>
      <Stack
        direction="row"
        justifyContent="space-around"
        alignItems="flex-end"
        spacing={2}
      >
        <Button
          sx={{ mt: 2, color: "gray", borderColor: "gray",  }} 
          onClick={() => allowBox()}
          variant="outlined"
          size="large"
        >
          Add Bounds
        </Button>
        <Button
          sx={{ mt: 2, color: "gray", borderColor: "gray" }} 
          onClick={() => clearBox()}
          variant="outlined"
          size="large"
        >
          Clear
        </Button>
      </Stack>
    </div>
  );
};

export default AdvancedOptions;