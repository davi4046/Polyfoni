import type Point from "../../../../../shared/point/Point";
import type Highlight from "./Highlight";
import getCornerPoints from "./getCornerPoints";

function createPath(highlights: Highlight[]): Point[] {
    const boxes = highlights.map(getCornerPoints);

    let currPoint = boxes.reduce((prev, curr) => {
        return prev[0].x + prev[0].y < curr[0].x + curr[0].y ? prev : curr;
    }, boxes[0])[0];

    const initPoint = currPoint;

    console.log("initial point:", initPoint);

    const findNextPoint = (): Point => {
        let currBox = boxes.find((box) => box.includes(currPoint))!;

        const index = currBox.indexOf(currPoint);

        switch (index) {
            // top-left
            case 0: {
                console.log("top-left");
                let foundPoint;

                // zone 1
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x < currPoint.x &&
                        point.y <= currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 1");

                    path.push({ x: foundPoint.x, y: currPoint.y });
                    return foundPoint;
                }

                // zone 2
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x >= currPoint.x &&
                        point.y < currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 2");

                    path.push({ x: currPoint.x, y: foundPoint.y });
                    return foundPoint;
                }

                console.log("zone 3");

                return currBox[1];
            }
            // top-right
            case 1: {
                console.log("top-right");

                let foundPoint;

                // zone 1
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x >= currPoint.x &&
                        point.y < currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 1");

                    path.push({ x: currPoint.x, y: foundPoint.y });
                    return foundPoint;
                }

                // zone 2
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x > currPoint.x &&
                        point.y >= currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 2");

                    path.push({ x: foundPoint.x, y: currPoint.y });
                    return foundPoint;
                }

                console.log("zone 3");

                return currBox[2];
            }
            // bottom-right
            case 2: {
                console.log("bottom-right");

                let foundPoint;

                // zone 1
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x > currPoint.x &&
                        point.y >= currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 1");

                    path.push({ x: foundPoint.x, y: currPoint.y });
                    return foundPoint;
                }

                // zone 2
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x <= currPoint.x &&
                        point.y > currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 2");

                    path.push({ x: currPoint.x, y: foundPoint.y });
                    return foundPoint;
                }

                console.log("zone 3");

                return currBox[3];
            }
            // bottom-left
            default: {
                console.log("bottom-left");

                let foundPoint;

                // zone 1
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x <= currPoint.x &&
                        point.y > currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 1");

                    path.push({ x: currPoint.x, y: foundPoint.y });
                    return foundPoint;
                }

                // zone 2
                foundPoint = boxes.flat().find((point) => {
                    return (
                        point.x < currPoint.x &&
                        point.y <= currPoint.y &&
                        !path.includes(point)
                    );
                });

                if (foundPoint) {
                    console.log("zone 2");

                    path.push({ x: foundPoint.x, y: currPoint.y });
                    return foundPoint;
                }

                console.log("zone 3");

                return currBox[0];
            }
        }
    };

    const path: Point[] = [];

    while (path.length < 2 || path[path.length - 1] !== initPoint) {
        currPoint = findNextPoint();
        path.push(currPoint);
    }

    return path;
}

export default createPath;
