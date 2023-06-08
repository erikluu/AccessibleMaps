import React, { useEffect, useState } from 'react';

import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const DEFAULT_ADA_SLOPE = 8;

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
    if (document.getElementById("bbox") != null) return;
    document.getElementById("top-level").setAttribute("data-box", 1);
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

  return (
    <div className="advanced-options">
      <Typography
        variant="h6"
      >
        Set Maximum grade
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
          max={15}
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
        Select an area on the map to avoid. Click on the button below to define the bounds, using a box.
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
          Reset
        </Button>
      </Stack>
    </div>
  );
};

export default AdvancedOptions;
