import React, { useEffect, useState } from 'react';

import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';


const MAX_ADA_SLOPE = 8;


const AdvancedOptions = (props) => {
  const {bboxAllowed, setBboxAllowed} = props;


  const [slope, setSlope] = useState(MAX_ADA_SLOPE); 
  const handleSliderChange = (event, newValue) => {
    setSlope(newValue);
  };


  return (
    <div className="advanced-options">
      <h4>Set Maximum Grade</h4>
      Select desired, returned route will not exceed this value
      <br></br>
      <div >
        <Slider
          min={0}
          max={15}
          default={MAX_ADA_SLOPE}
          valueLabelDisplay="auto"
          value={slope}
          onChange={handleSliderChange}    
        />
      </div>
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
