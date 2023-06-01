const { get } = require("https");
const SphericalMercator = require('@mapbox/sphericalmercator');

const mercator = new SphericalMercator({
    size: 256
});

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
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

function interpolatePointsAlongPolyline(start, end, interval) {
    const distance = getDistance(start, end);
    const numPoints = Math.ceil(distance / interval); // get a point every 4 meters

    const segment = []
    for (let i = 0; i < numPoints; i++) {
        const fraction = i / numPoints;
        const lat = start[0] + fraction * (end[0] - start[0]);
        const lng = start[1] + fraction * (end[1] - start[1]);
        segment.push([lat, lng]);
    }
    return segment;
}

function segmentPolylines(routes) {
    routes.forEach((route) => {
        let fullLine = [];
        route.sections.forEach((section) => {
            const polyline = section.polyline.polyline;
            for (let i = 0; i < polyline.length - 1; i++) {
                const start = polyline[i];
                const end = polyline[i + 1];
                const segment = interpolatePointsAlongPolyline(start, end, 4);
                fullLine = fullLine.concat(segment);
            }
        });
        route["fullLine"] = fullLine;
    });

    return routes;
}

function getDistanceBetweenAllPoints(routes) {
    routes.forEach((route) => {
        const fullLine = route.fullLine;
        for (let i = 0; i < fullLine.length - 1; i++) {
            const start = fullLine[i];
            const end = fullLine[i + 1];
            const distance = getDistance(start, end);
            start[2] = distance;
        }
    });

    return routes;
}

function coordinateToTile(latitude, longitude, zoom) {
    Math.radians = function(degrees) {
        return degrees * Math.PI / 180;
    }
    const tileX = parseInt((longitude + 180.0) / 360.0 * (1 << zoom));
    const tileY = parseInt((1 - Math.log(Math.tan(Math.radians(latitude)) + (1 / Math.cos(Math.radians(latitude)))) / Math.PI) / 2 * (2 ** zoom))
    return [tileX, tileY];
} 

function requestElevationTile(tileX, tileY, zoom) {
    const endpoint = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${tileX}/${tileY}.pngraw?access_token=${process.env.MAPBOXGL_API_KEY}}`;
    console.log(endpoint);
    return new Promise((resolve, reject) => {
        get(endpoint, (response) => {
            let data;
            
            response.on('data', (chunk) => {
                data = chunk;
            });

            response.on('end', () => {
                resolve(data);
            });

        }).on('error', (err) => {
            console.log(err);
            reject('Mapbox API error');
        });
    });
}

function getElevationTiles(routes, zoom) {
    let tileByCoordinate = {};
    let uniqueTilesHash = [];
    let uniqueTiles = [];
    let tilePromises = {};
    routes.forEach((route) => {
        const fullLine = route.fullLine;
        for (let i = 0; i < fullLine.length; i++) {
            const coordinate = fullLine[i];
            const [tileX, tileY] = coordinateToTile(coordinate[0], coordinate[1], zoom);

            const coordinateHash = hashCode(`${coordinate[0]},${coordinate[1]}`);
            const tileHash = hashCode(`${tileX},${tileY}`);
            tileByCoordinate[coordinateHash] = tileHash;
            
            if (!uniqueTilesHash.includes(tileHash)) {
                uniqueTilesHash.push(tileHash);
                uniqueTiles.push([tileX, tileY]);
            }   
        }
    });

    uniqueTiles.forEach((tile) => {
        const tileX = tile[0];
        const tileY = tile[1];
        const tileHash = hashCode(`${tileX},${tileY}`);
        tilePromises[tileHash] = requestElevationTile(tileX, tileY, zoom);
    });

    return [tilePromises, tileByCoordinate];
}

async function resolveObjectPromises(obj) {
    const entries = Object.entries(obj);
    for (const [key, promise] of entries) {
        const tile = await promise;
        obj[key] = tile.toString();
    }
    return obj;
  }

function getElevationFromTile(tile, tileX, tileY, coordinate, zoom) {
    const pixelX = mercator.px([coordinate[1], coordinate[0]], zoom)[0] - tileX * 256;
    const pixelY = mercator.px([coordinate[1], coordinate[0]], zoom)[1] - tileY * 256;
    const pixelIndex = (256 * pixelY + pixelX) * 4;
    const r = tile[pixelIndex];
    const g = tile[pixelIndex + 1];
    const b = tile[pixelIndex + 2];
    const elevation = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
    return elevation;
}

function getElevationValue(tile, coordinate, zoom) {
    const [tileX, tileY] = coordinateToTile(coordinate[0], coordinate[1], zoom);
    const elevation = getElevationFromTile(tile, tileX, tileY, coordinate, zoom);
    return elevation;
}
                
async function getGrades(routes, maxGrade, units) {
    const zoom = 18;
    routes = segmentPolylines(routes);
    routes = getDistanceBetweenAllPoints(routes);
    const [tilePromises, tileByCoordinate] = getElevationTiles(routes, zoom);
    let tiles = []

    try {
        console.log('requesting tiles');
        tiles = await resolveObjectPromises(tilePromises);
        console.log('tiles received');
    } catch (error) {
        console.error(error);
        throw error;
    }

    // getElevations
    routes.forEach((route) => {
        const fullLine = route.fullLine;
        for (let i = 0; i < fullLine.length; i++) {
            const coordinate = fullLine[i];
            const coordinateHash = hashCode(`${coordinate[0]},${coordinate[1]}`);
            const tileHash = tileByCoordinate[coordinateHash];
            const tile = tiles[tileHash];
            const elevation = getElevationValue(tile, coordinate, zoom);
            coordinate[3] = elevation;
        }
    });

    // getGrades
    routes.forEach((route) => {
        const fullLine = route.fullLine;
        for (let i = 0; i < fullLine.length - 1; i++) {
            const start = fullLine[i];
            const end = fullLine[i + 1];
            const distance = start[2];
            const elevation = start[3];
            // const grade = getGrade(distance, elevation, start, end, units);
            // start[4] = grade;
            start[4] = "WOOOO"
        }
    });

    return routes;
}

module.exports = {
    getGrades
}