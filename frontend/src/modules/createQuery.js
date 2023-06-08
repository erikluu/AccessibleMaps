const formatBox = (box) => {
    const start = box[0];
    const end = box[1];
    const topLeft = {
        lat: Math.max(start.lat, end.lat),
        lng: Math.min(start.lng, end.lng)
    };

    const bottomRight = {
        lat: Math.min(start.lat, end.lat),
        lng: Math.max(start.lng, end.lng)
    };
 
    return JSON.stringify({ bottomRight, topLeft });
    
    // return `[[${box[0].lat},${box[0].lng}],[${box[1].lat},${box[1].lng}]]`;
};


const createQuery = (path, slope, box) => {
    if (slope == null || slope === 0) 
        slope = 50;

    console.log('BOX', box);
    console.log("given", path, slope);
    if (path.length < 2) {
        console.log("ERROR: Not enough waypoints");
        return;
    }

    // with an > 2 waypoints, format the query
    const base = "http://localhost:4000/api/route";
    let parameters = `?units=metric&maxGrade=${slope}`;
    for (let i = 0; i < path.length; i++) {
        if (path[i] == undefined) continue;
        const waypoint = path[i].loc;
        const lat = waypoint[0];
        const lon = waypoint[1];
        const wp = `&wp${i}=${lon.toString()},${lat.toString()}`;
        parameters += wp;
    }

    let query = base + parameters;
    if (box != null) {
        query += "&bbox0=" + formatBox(box);
    }

    return query;
};



module.exports = {
    createQuery
};