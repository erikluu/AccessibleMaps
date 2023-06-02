/*
    This module is responsible for processing the route data
    and filtering it by grade of road
*/
const https = require('https');
const polyline = require('./polyline');
const queryFormatting = require('./queryFormatting');
const elevation = require('./elevation');

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
    let routeNumber = 0;
    let routeObject = {};

    let units = query['units'];
    let maxGrade = query['maxGrade'];
    let url = queryFormatting.formatInitialURL(query);

    routeObject[0] = await callHERE(url);
    routeObject[0]["steepSegments"] = await elevation.getGrades(routeObject[0], maxGrade, units);
    console.log(routeObject);
    
    return routeObject;
}

module.exports = {
    getRoute
};