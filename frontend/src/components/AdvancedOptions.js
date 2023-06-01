import React, { useEffect, useState } from 'react';

import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';


const MAX_ADA_SLOPE = 8;


const AdvancedOptions = (props) => {
  const {bboxAllowed, setBboxAllowed} = props;

  const [slope, setSlope] = useState(MAX_ADA_SLOPE); 
  const handleSliderChange = (event, newValue) => {
    setSlope(newValue);
  };

  return (
    <div className="advanced-options">
      <Typography
        variant="h5"
      >
        Set Maximum grade
      </Typography>
      <br className="menu-spacer"></br>
      <Typography 
        variant="body2"
      >
        Select the maximum grade, returned route will not exceed this value. The default value is 8% grade.
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
          default={MAX_ADA_SLOPE}
          valueLabelDisplay="auto"
          value={slope}
          onChange={handleSliderChange}    
        />
        <Tooltip 
          placement="top"
          title="Remove Filter"
        >
          <IconButton 
            onClick={() => {return;}}
          >
            <CancelIcon/>
          </IconButton>
        </Tooltip>
      </Stack>
      <br className="menu-spacer"></br>
      <Divider/>
      <br></br>
      <Typography
        variant="h5"
      >
        Select Roads to Avoid
      </Typography>
      <br className="menu-spacer"></br>
      <Typography 
        variant="body2"
      >
        Select an area on the map to avoid. Click on the button below to define the bounds, using a box.
      </Typography>
      <Button
        sx={{ mt: 2 }} 
        variant="contained" 
        size="large"
        onClick={() => setBboxAllowed(bboxAllowed)}
      >
        Avoid Mode
      </Button> 
    </div>
  );
};

export default AdvancedOptions;
