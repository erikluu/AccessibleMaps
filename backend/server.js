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
const { check, validationResult } = require('express-validator');

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.get('/api/route',[
  check('alternatives').isInt({ min: 0, max: 6 }),
  check('routingMode').isIn(['fastest', 'shortest']),
  check('transportMode').isFloat({ min: 0.5, max: 2 }),
  check('units').isIn(['metric', 'imperial']),
  check('wp').custom((value, { req }) => {
    const wpParams = Array.isArray(req.query.wp) ? req.query.wp : [req.query.wp];
    if (wpParams.filter(p => p === 'wp').length < 2) {
      throw new Error('At least two wp query parameters are required');
    }
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
      res.send(result);
    });

  }).on('error', (err) => {
    console.log(err);
    res.status(500).send('HERE API error');
  });
});

app.get('/api/decodePolyline',[
  check('polyline').isString()
]
, async (req, res) => {
  const { polyline } = req.query;
  const decoded = polyline.decode(polyline);
  res.send(decoded);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
