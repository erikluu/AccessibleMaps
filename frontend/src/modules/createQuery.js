const formatBox = (box) => {
    return `[[[${box[0].lat},${box[0].lng}],[${box[1].lat},${box[1].lng}]]]`;
};


const createQuery = (path, slope, box) => {
    if (slope == null || slope === 0) 
        slope = 50;

    console.log('BOX', box);
    console.log("given", path, slope);
    if (path.length < 2) {
        console.log("ERROR: Not enough waypoints");
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
        query += "&bbox=" + formatBox(box);
    }

    return query;
};



module.exports = {
    createQuery
};