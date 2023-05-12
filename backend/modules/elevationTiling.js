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

function getElevations(polyline) {
    const endpoint = `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${start[1]},${start[0]};${end[1]},${end[0]}?layers=contour&limit=${numPoints}&access_token=${mapboxAccessToken}`;

    for (let i = 0; i < polyline.length - 1; i++) {
        const start = polyline[i];
        const end = polyline[i + 1];

        const d = getDistance(start, end);
        const numPoints = Math.ceil(d / 4); // get a point every 100 meters



        axios.get
        const grade = calculateGrade(start, end, 'metric');
        if (grade > 10) {
            console.log(grade);
        }
    }

    
    axios.get(endpoint)
        .then((response) => {
            elevationData.push(response.data.features.map(feature => feature.properties.ele));
    }).catch((error) => {
        console.error(error);
    });
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