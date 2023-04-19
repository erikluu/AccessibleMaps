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
*/
function getDistance(firstPoint, secondPoint) {
    const lat1 = firstPoint[0];
    const lng1 = firstPoint[1];
    const lat2 = secondPoint[0];
    const lng2 = secondPoint[1];

    const R = 6371e3; // radius of the Earth in meters
    const φ1 = lat1 * Math.PI/180; // convert latitudes to radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // distance in meters
    return distance;
}

function calculateGrade(firstPoint, secondPoint) {
    const elevationChange = firstPoint[2] - secondPoint[2];
    const distance = getDistance(secondPoint, firstPoint);
    return elevationChange / distance * 100;
}

function getSteepSegments(routes, maxGrade) {
    steepSegments = [];
    routes.forEach((route) => {
        route.sections.forEach((section) => {
            for (i = 1; i < section.polyline.length; i++) {
                grade = calculateGrade(section.polyline[i-1], section.polyline[i]);
                if (grade > maxGrade) {
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

function getRoute(query) {
    const initialURL = queryProcessing.formatInitialURL(query);
    
    const routeObject = callHERE(initialURL);
    // const steepSegments = getSteepSegments(routeObject, 10);

    
    return routeObject;
}

module.exports = {
    getRoute
};