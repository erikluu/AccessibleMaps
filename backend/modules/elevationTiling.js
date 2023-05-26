/*
    This module is responsible for filtering the route by grade of road
*/

const SphericalMercator = require('@mapbox/sphericalmercator');
const axios = require('axios');
const mercator = new SphericalMercator({
    size: 256,
    antimeridian: true
  });

/* 
* Haversine Formula for calculating distance between two points
* https://en.wikipedia.org/wiki/Haversine_formula
* Code from: https://www.movable-type.co.uk/scripts/latlong.html
*/
function getDistance(firstPoint, secondPoint) {
    const lat1 = firstPoint[0];
    const lng1 = firstPoint[1];
    const lat2 = secondPoint[0];
    const lng2 = secondPoint[1];

    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters (it's half idk why, code on website got different results) maybe I don't need to do this idk I'll figure it out later
}

function calculateGrade(firstPoint, secondPoint, units) {
    let elevationChange = Math.abs(firstPoint[2] - secondPoint[2]); // meters if "metric", feet if "imperial"
    // if (units === 'imperial') {
    //     elevationChange /= 3.28084; // convert meters to feet
    // }
    const distance = getDistance(secondPoint, firstPoint);
    return Math.ceil(elevationChange / distance * 100); // round up to nearest integer
}

function interpolatePointsAlongPolyline(start, end, interval) {
    const dist = getDistance(start, end);
    const numPoints = Math.ceil(dist / interval); // get a point every 4 meters

    const points = [];
    for (let i = 0; i < numPoints; i++) {
        const fraction = i / numPoints;
        const lat = start[0] + fraction * (end[0] - start[0]);
        const lng = start[1] + fraction * (end[1] - start[1]);
        points.push([lat, lng]);
    }
    return points;
}

function coordinateToTile(latitude, longitude, zoom) {
    Math.radians = function(degrees) {
        return degrees * Math.PI / 180;
    }
    const tileX = parseInt((longitude + 180.0) / 360.0 * (1 << zoom));
    const tileY = parseInt((1 - Math.log(Math.tan(Math.radians(latitude)) + (1 / Math.cos(Math.radians(latitude)))) / Math.PI) / 2 * (2 ** zoom))
    return [tileX, tileY];
} 

const lonLatToWorldPixelCoords = ([lon, lat], worldSize) => {
    const mercatorX = worldSize * (lon / 360 + 0.5);
    const mercatorY =
      (worldSize *
        (1 - Math.log(Math.tan(Math.PI * (0.25 + lat / 360))) / Math.PI)) /
      2;
  
    return [Math.round(mercatorX), Math.round(mercatorY)];
};


// function coordinateToPixel(latitude, longitude, zoom) {
//     const tileSize = 256; // size of each tile in pixels
//     const initialResolution = 2 * Math.PI * 6378137 / tileSize; // initial resolution at zoom level 0
//     const originShift = 2 * Math.PI * 6378137 / 2.0; // shift from latitude/longitude origin to pixel coordinate origin at zoom level 0
//     const resolution = initialResolution / Math.pow(2, zoom); // resolution at the given zoom level
    
//     const [tileX, tileY] = coordinateToTile(latitude, longitude, zoom);
//     const x = (longitude + 180) / 360 * tileSize * Math.pow(2, zoom);
//     const y = ((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2) * tileSize * Math.pow(2, zoom);
  
//     const pixelX = Math.round(x / resolution - originShift);
//     const pixelY = Math.round(y / resolution - originShift);
  
//     return [x, y];
// }

function requestElevationData(zoom, points) {

    const elevations = points.map(async (point) => {
        mercatorCoord = mercator.forward([point[1], point[0]]);
        const [tileX, tileY] = coordinateToTile(point[0], point[1], zoom);
        const endpoint = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${x}/${y}.pngraw?access_token=${process.env.MAPBOXGL_ACCESS_TOKEN}}`;
        const tile = await axios.get(endpoint);
        const [x, y] = coordinateToPixel(point[0], point[1], zoom);
        const elevation = tile.data[(y * 256 + x) * 4];
        return point.push(elevation)
    });

    console.log(elevations);
    return elevations;
  }

async function getElevations(polyline) {
    const zoom = 15;
    let allTiles = [];
    let points = [];

    for (let i = 0; i < polyline.length - 1; i++) {
        const start = polyline[i];
        const end = polyline[i + 1];
        const pointsAlongPolyline = interpolatePointsAlongPolyline(start, end, 4);
        points = points.concat(pointsAlongPolyline);
    }

    allTiles = await Promise.all(requestElevationData(zoom, points));
    console.log(allTiles);
    return allTiles;
}

function getSteepSegments(routes, maxGrade, units) {
    routes.forEach((route) => {
        let steepSegments = [];
        route.sections.forEach((section) => {
            steepSegments.concat(getElevations(section.polyline.polyline));
        });
        route.steepSegments = steepSegments;
    });

    return routes;
}

module.exports = {
    getSteepSegments
}