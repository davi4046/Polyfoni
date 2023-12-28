import type Point from "../Point";

function createSvgPath<P extends Point>(points: P[], closePath = true): string {
    let path = "";

    for (let i = 0; i < points.length; i++) {
        if (i === 0) {
            path = path.concat(`M ${points[i].x} ${points[i].y} `);
        } else {
            path = path.concat(`L ${points[i].x} ${points[i].y} `);
        }
        if (closePath && i === points.length - 1) {
            path = path.concat("Z");
        }
    }

    return path;
}

export default createSvgPath;
