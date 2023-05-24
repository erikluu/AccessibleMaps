/*
    This module is responsible for filtering the route by grade of road
*/

const axios = require('axios');

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

function getElevationFromPNG(pngData, width, height, lat, lon) {

}

// https://tile.nextzen.org/tilezen/terrain/v1/geotiff/12/675/1618.tif?api_key=lhZDrnOvSr2kPW4GVk5tXQ
// https://tile.nextzen.org/tilezen/terrain/v1/256/terrarium/12/675/1618.png?api_key=lhZDrnOvSr2kPW4GVk5tXQ
// https://tile.thunderforest.com/outdoors/14/2700/7429.png?apikey=37b43bbc7fff4ebe933c6f20b6c1e915
async function requestElevationData(zoom, x, y) {
    const endpoint = `https://tile.thunderforest.com/outdoors/${zoom}/${x}/${y}.png?apikey=${process.env.THUNDERFOREST_API_KEY}`;
    await axios.get(endpoint)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
        });
}

function convertToTileCoordinates(latitude, longitude, zoom) {
    Math.radians = function(degrees) {
        return degrees * Math.PI / 180;
    }
    const tileX = parseInt((longitude + 180.0) / 360.0 * (1 << zoom));
    const tileY = parseInt((1 - Math.log(Math.tan(Math.radians(latitude)) + (1 / Math.cos(Math.radians(latitude)))) / Math.PI) / 2 * (2 ** zoom))
    return [tileX, tileY];
} 

function getElevations(polyline) {
    const zoom = 12;

    for (let i = 0; i < polyline.length - 1; i++) {
        const start = polyline[i];
        const end = polyline[i + 1];
        const pointsAlongPolyline = interpolatePointsAlongPolyline(start, end, 4);

        for (let j = 0; j < pointsAlongPolyline.length; j++) {
            const point = pointsAlongPolyline[j];
            const [tileX, tileY] = convertToTileCoordinates(point[0], point[1], zoom);
            const tileData = requestElevationData(zoom, tileX, tileY);
            const elevation = parseElevationData(tileData, point);


        }

    }
}


function getSteepSegments(routes, maxGrade, units) {
    routes.forEach((route) => {
        route.sections.forEach((section) => {
            getElevations(section.polyline.polyline);
        });
    });    

    return routes;
}

module.exports = {
    getSteepSegments
}