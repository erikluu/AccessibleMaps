/*
    This module is responsible for processing the query object
    and formatting it into a URL string
*/

const BASE_URL = 'https://router.hereapi.com/v8/routes';

/* 
    Format the waypoints into a URL string
*/
function formatWaypoints(query) {
    let waypointsCount = 0;
    let waypoints = [];
    Object.keys(query).forEach((key) => {
        if (/^wp\d+$/.test(key)) {
            waypoints.push(query[key]);
            waypointsCount++;
        }
    });

    let waypointsQuery = '';
    for (let i = 0; i < waypoints.length; i++) {
        if (i === 0) {
            waypointsQuery += `origin=${waypoints[i]}`;
        } else if (i === waypoints.length - 1) {
            waypointsQuery += `&destination=${waypoints[i]}`;
        } else {
            waypointsQuery += `&via=${waypoints[i]}`;
        }
    }
    
    return waypointsQuery;
}

/*
    Format the rest of the query object into a URL string
*/
function formatRest(defaultQuery, query) {
    let rest = '';
    Object.keys(defaultQuery).forEach((key) => {
        if (!/^wp\d+$/.test(key)) {    
            if (query[key] === undefined) {
                rest += `&${key}=${defaultQuery[key]}`;
            } else {
                rest += `&${key}=${query[key]}`;
            }
        }
    });

    return rest;
}


function formatAvoidance(url, bboxes) {
    let avoidanceQuery = url.includes('avoid[areas]=') ? '|' : '&avoid[areas]=';
    for (let i = 0; i < bboxes.length; i++) {
        avoidanceQuery += `bbox:${bboxes[i].bottomRight.lng},${bboxes[i].bottomRight.lat},${bboxes[i].topLeft.lng},${bboxes[i].topLeft.lat}`;
        if (i !== bboxes.length - 1) {
            avoidanceQuery += '|';
        }
    }

    return url + avoidanceQuery;
}

/*
    Format the query object into a URL string
*/
function formatInitialURL(query) {
    const defaultQuery = {
        alternatives: 0,
        return: "elevation,polyline,summary",
        // spans: "segmentRef", // got rid of segmentRef, which is not supported by the free tier and sometimes messes up the JSON response causing a crash
        transportMode: "pedestrian",
        units: "imperial"
    };

    delete query['maxGrade'];

    const waypoints = formatWaypoints(query);
    const rest = formatRest(defaultQuery, query);

    const url = `${BASE_URL}?${waypoints}${rest}&apiKey=${process.env.HERE_API_KEY}`;
    
    return url;
}

module.exports = {
    formatInitialURL,
    formatAvoidance
};