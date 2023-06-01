import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
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
    chart.options.scales.y1.max = maxHeight + Math.round(maxHeight * 0.2);
  }
}];

const options = {
  animation: false,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  tooltip: { position: 'nearest' },
  scales: {
    x: { type: 'linear' },
    y: { type: 'linear', beginAtZero: true },
    y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }},
  },
  plugins: {
    title: { align: "end", display: true, text: "Distance, m / Elevation, m" },
    legend: { display: false },
    tooltip: {
      displayColors: false,
      callbacks: {
        title: (tooltipItems) => {
          return "Distance: " + tooltipItems[0].label + 'm'
        },
        label: (tooltipItem) => {
          return "Elevation: " + tooltipItem.raw + 'm'
        },
      }
    }
  }
}

const ElevationChart = (props) => {
  const {heights} = props;

  //const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  const data = {
    labels: [0, 21, 44, 68, 88, 109, 125, 134, 139, 156, 164, 172, 187, 208, 263, 441, 472, 591, 664, 707, 785, 823, 900, 941, 1057, 1096, 1135, 1175, 1214], // this is test data
    datasets: [{
      data: [2377, 2378, 2379, 2380, 2381, 2382, 2383, 2383, 2383, 2384, 2384, 2384, 2384, 2384, 2388, 2391, 2392, 2393, 2392, 2391, 2394, 2395, 2397, 2397, 2394, 2393, 2394, 2393, 2392], // this is test data
      fill: true,
      borderColor: '#66ccff',
      backgroundColor: '#66ccff66',
      tension: 0.1,
      pointRadius: 0,
      spanGaps: true
    }]
  };

  return (
    <Line options={options} data={data} plugins={plugins} />
  );
};

export default ElevationChart;
