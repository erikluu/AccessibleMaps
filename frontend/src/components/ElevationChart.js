import React, { useEffect, useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const plugins = [{
  beforeInit: (chart, args, options) => {
    const maxHeight = Math.max(...chart.data.datasets[0].data);
    chart.options.scales.x.min = Math.min(...chart.data.labels);
    chart.options.scales.x.max = Math.max(...chart.data.labels);
    chart.options.scales.y.max = maxHeight + Math.round(maxHeight * 0.2);
    //chart.options.scales.y1.max = maxHeight + Math.round(maxHeight * 0.2);
  }
}];

const calcDistance = (lat1, lon1, lat2, lon2) => {
  if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
  }
  else {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
          dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      
      // convert to km
      dist = dist * 1.609344;
      
      // convert to m
      //dist = dist * 1000;

      return dist;
  }
};

const ElevationChart = (props) => {
  const {routeData, map} = props;

  const displayGraph = () => {
    return routeData ? "block" : "none";
  };

  const updateCurPoint = (index) => {    
    const p = routeData[index];
    const geoJson = {
      'type': 'Point',
      'coordinates': [p[1], p[0]]
    };

    map.map.getSource('point').setData(geoJson);
  };

  const [curPoint, setCurPoint] = useState(null);
  const [cheese, setCheese] = useState(0);
  const updateCheese = () => {
    setCheese(cheese == 1 ? 0 : 1);
  };

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      fill: true,
      borderColor: '#66ccff',
      backgroundColor: '#66ccff66',
      tension: 0.1,
      pointRadius: 0,
      spanGaps: true
    }]
  });

  const options = useMemo(() => ({
    animation: false,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    tooltip: { position: 'nearest' },
    scales: {
      x: { type: 'linear' },
      y: { type: 'linear', beginAtZero: true },
      //y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }},
    },
    plugins: {
      title: { align: "end", display: true, text: "Distance, km / Elevation, m" },
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return "Distance: " + tooltipItems[0].label + 'km'
          },
          label: (tooltipItem) => {
            setCurPoint(tooltipItem.dataIndex);
            return "Elevation: " + tooltipItem.raw + 'm'
          },
        }
      }
    }
  }), []);

  useEffect(() => {
    if (!routeData) return;
    console.log("updating elevation chart");
    
    let distances = [];
    let heights = [];
    let distance = 0;

    distances.push(distance);
    for (let i = 0; i < routeData.length - 1; i++) {
      const curPoint = routeData[i];
      const nextPoint = routeData[i + 1];

      const curDistance = calcDistance(curPoint[0], curPoint[1], nextPoint[0], nextPoint[1]);
      distance += curDistance;
      distances.push(distance);
      heights.push(curPoint[2]);
    }
    heights.push(routeData[routeData.length - 1][2]);
    
    const newData = {
      labels: distances,
      datasets: [{
        data: heights,
        fill: true,
        borderColor: '#66ccff',
        backgroundColor: '#66ccff66',
        tension: 0.1,
        pointRadius: 0,
        spanGaps: true
      }]
    };

    setChartData(newData);
    updateCheese();
  }, [routeData]);

  useEffect(() => {
    if (!curPoint) return;
    updateCurPoint(curPoint);
  }, [curPoint]);

  return (
    <div className="inner-chart-container" style={{ display: displayGraph() }} >
      <Line options={options} data={chartData} plugins={plugins} key={cheese}/>
    </div>
  );
};

export default ElevationChart;
