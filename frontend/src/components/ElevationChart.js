import React, { useEffect, useState } from 'react';

import {
    LineChart,
    ResponsiveContainer,
    Legend, Tooltip,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const ElevationChart = (props) => {
  const {heights} = props;

  return (
    <ResponsiveContainer width="100%" aspect={3} style={{overflow: "hidden"}}>
      <LineChart data={heights}>
        <CartesianGrid />
        <XAxis 
        dataKey="distance" 
        interval={'preserveStartEnd'} 
        />
        <YAxis></YAxis>
        <Legend />
        <Tooltip />
        <Line 
        dataKey="elevation"
        stroke="black" activeDot={{ r: 1 }}
        />      
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ElevationChart;
