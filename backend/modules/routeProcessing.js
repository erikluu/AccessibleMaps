/*
    This module is responsible for processing the route data
    and filtering it by grade of road
*/
const https = require('https');
const request = require('request');
const polyline = require('./polyline');
const queryFormatting = require('./queryFormatting');
const elevation = require('./elevation');
const avoidance = require('./avoidance.js');
const fs = require('fs');

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

            response.on('end', () => {  // get request not big enough, should be post to fix:<head><title>414 Request-URI Too Large</title></head>
                console.log(data);
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
    const maxGrade = parseInt(query['maxGrade']);

    let url = queryFormatting.formatInitialURL(query);
    let routes = await callHERE(url);
    let formattedRoutes = await elevation.calculateElevationAndGradeBetweenPoints(routes, units);
    
    // for testing
    // const maxGrade = 10;
    // fs.writeFileSync('routes.json', JSON.stringify(formattedRoutes));
    // const formattedRoutes = JSON.parse(fs.readFileSync('routesPeach.json'));

    let bboxes = avoidance.createBoundingBoxForSteepGrades(formattedRoutes, maxGrade);
    while (bboxes.length > 0) {
        url = queryFormatting.formatAvoidance(url, bboxes);
        routes = await callHERE(url);
        formattedRoutes = await elevation.calculateElevationAndGradeBetweenPoints(routes, maxGrade);
        bboxes = avoidance.createBoundingBoxForSteepGrades(formattedRoutes, maxGrade);
    }

    return formattedRoutes;
}

module.exports = {
    getRoute
};