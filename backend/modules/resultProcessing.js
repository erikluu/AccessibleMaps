const polyline = require('./polyline');

function decodePolyline(data) {
    data.routes.forEach((route) => {
        route.sections.forEach((section) => {
            section.polyline = polyline.decode(section.polyline);
        });
    });
    return data;
}

module.exports = {
    decodePolyline
}