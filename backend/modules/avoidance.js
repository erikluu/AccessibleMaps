// HERE API uses bbox:bottomRight,topLeft 
function formatBBox(start, end) {
    const topLeft = {
        lat: Math.max(start[0], end[0]),
        lng: Math.min(start[1], end[1])
    };

    const bottomRight = {
        lat: Math.min(start[0], end[0]),
        lng: Math.max(start[1], end[1])
    };
 
    return { bottomRight, topLeft };
}

function createBoundingBoxForSteepGrades(routes, maxGrade) {
    let bboxes = [];
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        for (let j = 0; j < route.sections.length; j++) {
            const section = route.sections[j];
            for (let k = 0; k < section.segments.length; k++) {
                const segment = section.segments[k];
                for (let l = 0; l < segment.points.length - 1; l++) {
                    const point = segment.points[l];
                    if (point[4] === null || !segment.isPassable) continue; 
                    else if (point[4] > maxGrade) {
                        segment.isPassable = false;
                    }
                }
                if (!segment.isPassable) {
                    const bbox = formatBBox(segment.start, segment.end);
                    bboxes.push(bbox);
                }
            }
        }
    }

    return bboxes;
}


module.exports = {
    createBoundingBoxForSteepGrades
};