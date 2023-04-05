const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const port = 4000;

require('dotenv').config();

const baseURL = 'https://dev.virtualearth.net/REST/V1/Routes/Walking';

app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

app.get('/api/route', async (req, res) => {
  const { unit, wp0, wp1 } = req.query;
  const url = `${baseURL}?wp.0=${wp0}&wp.1=${wp1}&key=${process.env.BING_MAPS_API_KEY}&distanceUnit=${unit}&routeAttributes=routePath`;

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
