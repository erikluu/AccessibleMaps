
const createQuery = (path, slope) => {
    if (slope == null || slope === 0) 
        slope = 50;

    console.log('given', path, slope);
    if (path.length < 2) {
        return "ERROR: Not enough waypoints";
    }

    // with an > 2 waypoints, format the query
    const base = "http://localhost:4000/api/route";
    let parameters = `?units=metric&maxGrade=${slope}`;
    for (let i = 0; i < path.length; i++) {
        const waypoint = path[i].loc;
        const lat = waypoint[0];
        const lon = waypoint[1];
        const wp = `&wp${i}=${lon.toString()},${lat.toString()}`;
        parameters += wp;
    }

    const query = base + parameters;
    return query;
};



module.exports = {
    createQuery
};