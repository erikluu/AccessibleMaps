const BASE_URL = 'https://route.ls.hereapi.com/routing/7.2/calculateroute.json';
const MODE = (option) => `mode=${option};pedestrian`; // mode=[fastest, shortest, balanced]

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
            waypointsQuery += `&origin=${waypoints[i]}`;
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
                rest += `${key}=${defaultQuery[key]}&`;
            } else {
                rest += `${key}=${query[key]}&`;
            }
        }
    });

    return rest;
}

function formatURL(query) {
    const defaultQuery = {
        alternatives: 3,
        return: "elevation,polyline,summary",
        routingMode: 'fastest',
        spans: "length,duration,routeNumbers",
        speed: 1.4,
        units: 'imperial'
    };

    const waypoints = formatWaypoints(query);
    const rest = formatRest(defaultQuery, query);

    const url = `${BASE_URL}?${rest}${waypoints}&apiKey=${process.env.HERE_API_KEY}`;
    
    return url;
}

module.exports = {
    formatURL
};