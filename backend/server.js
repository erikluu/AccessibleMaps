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
const queryProcessing = require('./modules/queryProcessing');
const resultProcessing = require('./modules/resultProcessing');
const { check, validationResult } = require('express-validator');

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.get('/api/route',[
  check('alternatives').optional().isInt({ min: 0, max: 6 }),
  check('return').optional().isIn(['elevation', 'polyline', 'summary']),
  check('spans').optional().isIn(['length', 'duration', 'routeNumbers', 'walkAttributes', 'streetAttributes', 'trafficAttributes', 'routeNumbers']),
  check('units').optional().isIn(['metric', 'imperial']),
  check('wp').custom((_value, { req }) => {
    // filter out all query parameters that are not waypoints
    const waypoints = Object.keys(req.query).filter((key) => /^wp\d+$/.test(key));

    // check if there are at least 2 waypoints
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required');
    }    

    // check if all waypoints are valid coordinates
    waypoints.forEach((waypoint) => {
      const coordinates = req.query[waypoint];
      if (coordinates.split(',').length !== 2) {
        throw new Error(`Invalid waypoint formatting: ${waypoint}. Check if it is in the format "lat,lng"`);
      }
    });

    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const url = queryProcessing.formatURL(req.query);
    
  https.get(url, (response) => {
    let data;

    response.on('data', (chunk) => {
      data = chunk;
    });

    response.on('end', () => {
      const result = JSON.parse(data);
      // res.status(200).send(result);
      const decoded = resultProcessing.decodePolyline(result);
      res.status(200).send(decoded);
    });

  }).on('error', (err) => {
    console.log(err);
    res.status(500).send('HERE API error');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
