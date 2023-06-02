
const createQuery = (path, slope) => {
    if (slope == null || slope == 0) 
        slope = 50;

    console.log('given', path, slope);
    if (path.length != 2) return;

    let wp0 = "";
    wp0 += path[0].loc[1];
    wp0 += ","
    wp0 += path[0].loc[0];

    let wp1 = "";
    wp1 += path[1].loc[1];
    wp1 += ",";
    wp1 += path[1].loc[0];

    const query = `http://localhost:4000/api/route?units=metric&wp0=${wp0}&wp1=${wp1}&maxGrade=${slope}`;

    return query;
};



module.exports = {
    createQuery
};