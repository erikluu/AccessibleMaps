// Required packages and modules
const express = require('express');
const cors = require('cors');
const https = require('https');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Constants and variables
const port = 4000;
const app = express();
const polyline = require('./modules/polyline');
const queryProcessing = require('./modules/queryProcessing');

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.get('/api/route', async (req, res) => {
  // https://developer.here.com/documentation/routing-api/api-reference-swagger.html
  /* parameters: 
    transportMode=pedestrian[0.5...2] <- speed
    return=elevation,polyline,summary
    origin=''
    destination=''
    via=''
    routingMode=[fastest, shortest]
    alternatives=[0...6]
    units=[metric, imperial]
    spans=length,duration,names,walkAttributes,streetAttributes,routeNumbers
  */

  const url = queryProcessing.formatURL(req.query);
  
  res.send(waypoints);

  // const { unit, wp0, wp1 } = req.query;
  // const url = `https://router.hereapi.com/v8/routes?transportMode=pedestrian&origin=${wp0}&destination=${wp1}&return=elevation,polyline,summary&apiKey=${process.env.HERE_API_KEY}`;

  // https.get(url, (response) => {
  //   let data;

  //   response.on('data', (chunk) => {
  //     data = chunk;
  //   });

  //   response.on('end', () => {
  //     const result = JSON.parse(data);
  //     res.send(result);
  //   });

  // }).on('error', (err) => {
  //   console.log(err);
  //   res.status(500).send('Error');
  // });
});

app.get('/api/decodePolyline', async (req, res) => {
  const { polyline } = req.query;
  const decoded = polyline.decode(polyline);
  res.send(decoded);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
