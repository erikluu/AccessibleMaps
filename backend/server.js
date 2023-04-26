// Required packages and modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Constants and variables
const port = 4000;
const app = express();
const routeProcessing = require('./modules/routeProcessing');
const { check, validationResult } = require('express-validator');

// Middleware
// app.use(cors({ origin: 'http://localhost:3000' }));
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/route',[
  check('alternatives').optional().isInt({ min: 0, max: 6 }),
  check('macxGrade').optional().isInt({ min: 5, max: 100 }),
  check('return').optional().isIn(['elevation', 'polyline', 'summary']),
  check('spans').optional().isIn(['length', 'duration', 'routeNumbers', 'walkAttributes', 'streetAttributes', 'trafficAttributes', 'routeNumbers', 'segmentId', 'segmentRef']),
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
  if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

  const route = await routeProcessing.getRoute(req.query);
  if (route === 'HERE API error') {
    res.status(500).send('HERE API error');
  } else {
    res.status(200).json(route);
  }

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
