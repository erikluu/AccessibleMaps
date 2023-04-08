const BASE_URL = 'https://route.ls.hereapi.com/routing/7.2/calculateroute.json';
const MODE = (option) => `mode=${option};pedestrian`; // mode=[fastest, shortest, balanced]

function waypointsQuery(query) {
    let waypoints = [];
    Object.keys(query).forEach((key) => {
        if (/^wp$/.test(key)) {
            waypoints.push(query[key]);
        }
    });

    let waypointsQuery = '';
    for (let i = 0; i < waypoints.length; i++) {
        if (i === 0) {
            waypointQuery += `&origin=${waypoints[i]}`;
        } else if (i === waypoints.length - 1) {
            waypointQuery += `&destination=${waypoints[i]}`;
        } else {
            waypointQuery += `&via=${waypoints[i]}`;
        }
    }
    
    return waypointsQuery;
}

// turn all keys in query object into a string
function formatQuery(query) {
    let queryArray = [];
    Object.keys(query).forEach((key) => {
        if (key !== 'origin' && key !== 'destination' && key !== 'via') {
            queryArray.push(`${key}=${query[key]}`);
        }
    });

    return queryArray.join('&');
}

function formatURL(query) {
    const waypointQuery = waypointsQuery(query);
    const restOfQuery = formatQuery(query);

    const url = `${BASE_URL}?${restOfQuery}${waypointQuery}&apiKey=${process.env.HERE_API_KEY}`;
    
    return url;
}