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
                if (segment.grade >= maxGrade) {
                    bboxes.push(formatBBox(segment.start, segment.end));
                }
            }
        }
    }

    return bboxes;
}


module.exports = {
    createBoundingBoxForSteepGrades
};