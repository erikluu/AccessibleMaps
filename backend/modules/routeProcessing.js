/*
    This module is responsible for processing the route data
    and filtering it by grade of road
*/
const https = require('https');
const polyline = require('./polyline');
const queryFormatting = require('./queryFormatting');
const elevation = require('./elevation');
const avoidance = require('./avoidance');

function decodePolylines(routes) {
    routes.forEach((route) => {
        route.sections.forEach((section) => {
            section.polyline = polyline.decode(section.polyline);
        });
    });
    return routes;
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
                const routes = decodePolylines(result.routes);
                resolve(routes);
            });

        }).on('error', (err) => {
            console.log(err);
            reject('HERE API error');
        });
    });
}

async function getRoute(query) {
    const units = query['units'];
    const maxGrade = query['maxGrade'];
    const url = queryFormatting.formatInitialURL(query);

    const routeObject = await callHERE(url);
    const formattedRouteObject = await elevation.calculateElevationAndGradeBetweenPoints(routeObject, maxGrade, units);
    const bboxes = await avoidance.createBoundingBoxForSteepGrades(routeObject);

    
    return "lmao";
}

module.exports = {
    getRoute
};