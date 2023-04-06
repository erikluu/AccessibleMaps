const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const polyline = require('./polyline');

const port = 4000;
const app = express();
app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

const baseURL = 'https://route.ls.hereapi.com/routing/7.2/calculateroute.json';
const mode = (option) => `mode=${option};pedestrian`; // mode=[fastest, shortest, balanced]

app.get('/api/route', async (req, res) => {
  const { unit, wp0, wp1 } = req.query;
  const url = `https://router.hereapi.com/v8/routes?transportMode=pedestrian&origin=${wp0}&destination=${wp1}&return=elevation,polyline,summary&apiKey=${process.env.HERE_API_KEY}`;

  https.get(url, (response) => {
    let data;

    response.on('data', (chunk) => {
      data = chunk;
    });

    response.on('end', () => {
      const result = JSON.parse(data);
      res.send(result);
    });

  }).on('error', (err) => {
    console.log(err);
    res.status(500).send('Error');
  });
});

app.get('/api/decodePolyline', async (req, res) => {
  const { polyline } = req.query;
  const decoded = polyline.decode(polyline);
  res.send(decoded);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
