/*
    This module is responsible for processing the route data
    and filtering it by grade of road
*/
const https = require('https');
const polyline = require('./polyline');
const queryProcessing = require('./queryProcessing');

function decodePolylines(data) {
    data.routes.forEach((route) => {
        route.sections.forEach((section) => {
            section.polyline = polyline.decode(section.polyline);
        });
    });
    return data;
}

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
    if (units === 'imperial') {
        elevationChange *= 3.28084; // convert meters to feet
    }
    const distance = getDistance(secondPoint, firstPoint);
    return Math.ceil(elevationChange / distance * 100); // round up to nearest integer
}

function getSteepSegments(routes, maxGrade, units) {
    steepSegments = [];
    routes.forEach((route) => {
        route.sections.forEach((section) => {
            for (i = 1; i < section.polyline.polyline.length; i++) {
                grade = calculateGrade(section.polyline.polyline[i-1], section.polyline.polyline[i], units);
                if (grade >= maxGrade) {
                    steepSegments.push(section.polyline[i]);
                }
            }
        });
    });

    return steepSegments;
}

function callHERE(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data;
            
            response.on('data', (chunk) => {
                data = chunk;
            });

            response.on('end', () => {
                const result = JSON.parse(data);
                const decoded = decodePolylines(result);
                resolve(decoded);
            });

        }).on('error', (err) => {
            console.log(err);
            reject('HERE API error');
        });
    });
}

async function getRoute(query) {
    let units = query.units;

    let url = queryProcessing.formatInitialURL(query);
    let routeObject = await callHERE(url);

    let steepSegments = getSteepSegments(routeObject.routes, 10, units);
    let unaccountedSteepSegments = steepSegments;
    while (unaccountedSteepSegments.length > 0) {
        url = queryProcessing.formatAvoidance(url, unaccountedSteepSegments);
        routeObject = await callHERE(newURL);
        unaccountedSteepSegments = getSteepSegments(routeObject, 10, units);
        steepSegments.push(unaccountedSteepSegments);
    }
    
    return routeObject;
}

module.exports = {
    getRoute
};