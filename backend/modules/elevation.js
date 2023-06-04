const { get } = require("https");
const PNG = require('pngjs').PNG;
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

    return R * c; // in meters
}

function interpolatePointsAlongPolyline(start, end, interval) {
    const distance = getDistance(start, end);
    const numPoints = Math.ceil(distance / interval); // get a point every 4 meters

    const points = []
    for (let i = 0; i < numPoints; i++) {
        const fraction = i / numPoints;
        const lat = start[0] + fraction * (end[0] - start[0]);
        const lng = start[1] + fraction * (end[1] - start[1]);
        points.push([lat, lng]);
    }
    return points;
}

function segmentPolylines(routes) {
    let newRouteObject = [];
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        let formattedRoute = {sections: []};
        for (let j = 0; j < route.sections.length; j++) {
            const section = route.sections[j];
            let formattedSection = {
                arrival: section.arrival,
                departure: section.departure,
                summary: section.summary,
                segments: []
            };
            const polyline = section.polyline.polyline;
            for (let i = 0; i < polyline.length - 1; i++) {
                const start = polyline[i];
                const end = polyline[i + 1];
                const segment = {
                    start: start,
                    end: end,
                    points: interpolatePointsAlongPolyline(start, end, 4),
                    totalDistance: 0,
                    tiles: [],
                    isPassable: true
                }
                formattedSection.segments.push(segment);
            }
            formattedRoute.sections.push(formattedSection);
        };
        newRouteObject.push(formattedRoute);
    };

    return newRouteObject;
}

function getDistanceBetweenAllPoints(routes) {
    let newRoutes = JSON.parse(JSON.stringify(routes));
    for (let i = 0; i < newRoutes.length; i++) {
        const route = newRoutes[i];
        for (let j = 0; j < route.sections.length; j++) {
            const section = route.sections[j];
            for (let k = 0; k < section.segments.length; k++) {
                const segment = section.segments[k];
                let totalDistance = 0;
                for (let l = 0; l < segment.points.length - 1; l++) {
                    const start = segment.points[l];
                    const end = segment.points[l + 1];
                    const distance = getDistance(start, end);
                    start[2] = distance;
                    totalDistance += distance;
                }
                segment.points[segment.points.length - 1][2] = 0;
                segment.totalDistance = totalDistance;
            }
        }
    }
    return newRoutes;
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
    try {
        const endpoint = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoom}/${tileX}/${tileY}.pngraw?access_token=${process.env.MAPBOXGL_API_KEY}`;
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
    } catch (err) {
        console.log(err);
        return null;
    }
}

function getElevationTiles(routes, zoom) {
    let newRoutes = JSON.parse(JSON.stringify(routes));
    for (let i = 0; i < newRoutes.length; i++) {
        const route = newRoutes[i];
        for (let j = 0; j < route.sections.length; j++) {
            const section = route.sections[j];
            for (let k = 0; k < section.segments.length; k++) {
                const segment = section.segments[k];
                let tiles = [];
                for (let l = 0; l < segment.points.length; l++) {
                    const point = segment.points[l];
                    const tile = coordinateToTile(point[0], point[1], zoom);
                    if (!tiles.includes(tile)) {
                        tiles.push(tile);
                    }
                }
                segment.tiles = tiles;
            }
        }
    }
    return newRoutes;
}

function getTilePromises(routes, zoom) {
    const tilePromises = {};
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        for (let j = 0; j < route.sections.length; j++) {
            const section = route.sections[j];
            for (let k = 0; k < section.segments.length; k++) {
                const segment = section.segments[k];
                const tiles = segment.tiles;
                for (let l = 0; l < tiles.length; l++) {
                    const tile = tiles[l];
                    if (!Object.keys(tilePromises).includes(`${tile[0]},${tile[1]}`)) {
                        tilePromises[`${tile[0]},${tile[1]}`] = requestElevationTile(tile[0], tile[1], zoom);
                    }
                }
            }
        }
    }
    return tilePromises;
}

async function resolveObjectPromises(obj) {
    const entries = Object.entries(obj);
    for (const [key, promise] of entries) {
        const tile = await promise;
        obj[key] = tile;
    }
    return obj;
  }

function getPixelValue(tileBuffers, point, zoom) {
    const [tileX, tileY] = coordinateToTile(point[0], point[1], zoom);
    const tileBuffer = tileBuffers[`${tileX},${tileY}`]; // finds a buffer that doesn't exist in tileBuffers... why?

    const png = PNG.sync.read(tileBuffer);
    const pixels = png.data;

    const pixelX = mercator.px([point[1], point[0]], zoom)[0] - tileX * 256;
    const pixelY = mercator.px([point[1], point[0]], zoom)[1] - tileY * 256;
    const pixelIndex = (256 * pixelY + pixelX) * 4;
    const r = pixels[pixelIndex];
    const g = pixels[pixelIndex + 1];
    const b = pixels[pixelIndex + 2];
    const elevation = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
    return elevation;
}

function getElevations(routes, tileBuffers, zoom) {
    let newRoutes = JSON.parse(JSON.stringify(routes));
    for (let i = 0; i < newRoutes.length; i++) {
        const route = newRoutes[i];
        for (let j = 0; j < route.sections.length; j++) {
            const section = route.sections[j];
            for (let k = 0; k < section.segments.length; k++) {
                const segment = section.segments[k];
                for (let l = 0; l < segment.points.length; l++) {
                    const point = segment.points[l];
                    const elevation = getPixelValue(tileBuffers, point, zoom);
                    point.push(elevation);
                }
            }
        }
    }
    return newRoutes;
}

function calculateGrade(start, end) {
    const distance = start[2];
    const elevation = end[3] - start[3];
    const grade = elevation / distance * 100;
    return grade;
}

function getGradeBetweenPoints(routes, maxGrade) {
    let newRoutes = JSON.parse(JSON.stringify(routes));
    for (let i = 0; i < newRoutes.length; i++) {
        const route = newRoutes[i];
        for (let j = 0; j < route.sections.length; j++) {
            const section = route.sections[j];
            for (let k = 0; k < section.segments.length; k++) {
                const segment = section.segments[k];
                for (let l = 0; l < segment.points.length - 1; l++) {
                    const start = segment.points[l];
                    const end = segment.points[l + 1];
                    const grade = calculateGrade(start, end);
                    segment.points[l].push(grade);
                    if (segment.isPassable && grade >= maxGrade) {
                        segment.isPassable = false;
                    }
                }
                segment.points[segment.points.length - 1].push(null);
            }
        }
    }
    return newRoutes;
}
                
async function calculateElevationAndGradeBetweenPoints(routes, maxGrade) {
    const zoom = 18; // 14 or 15 zoom with DEM or RGB tiles gets weird reults. Bad file signatures... not png or json or anything on wikipedia https://en.wikipedia.org/wiki/List_of_file_signatures
    routes = segmentPolylines(routes);
    routes = getDistanceBetweenAllPoints(routes);
    routes = getElevationTiles(routes, zoom);

    const tilePromises = getTilePromises(routes, zoom);
    let tileBuffers = {};

    try {
        console.log('requesting tiles');
        tileBuffers = await resolveObjectPromises(tilePromises);
        console.log('tiles received');
    } catch (error) {
        console.error(error);
        throw error;
    }

    routes = getElevations(routes, tileBuffers, zoom);
    routes = getGradeBetweenPoints(routes, maxGrade);
    return routes;
}

module.exports = {
    calculateElevationAndGradeBetweenPoints
}