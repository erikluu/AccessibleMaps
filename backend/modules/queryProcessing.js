const BASE_URL = 'https://router.hereapi.com/v8/routes';

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

// turn all keys in query object into a string
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

function formatURL(query) {
    const defaultQuery = {
        alternatives: 3,
        return: "elevation,polyline,summary",
        spans: "length,duration,routeNumbers",
        transportMode: "pedestrian",
        units: "imperial"
    };
    if (query.speed) { delete query.speed; }

    const waypoints = formatWaypoints(query);
    const rest = formatRest(defaultQuery, query);

    const url = `${BASE_URL}?${waypoints}${rest}&apiKey=${process.env.HERE_API_KEY}`;
    
    return url;
}

module.exports = {
    formatURL
};