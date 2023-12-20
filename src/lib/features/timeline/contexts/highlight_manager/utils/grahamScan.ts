interface Point {
    x: number;
    y: number;
}

// Function to calculate the polar angle between two points and the anchor point
function polarAngle(a: Point, b: Point): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

// Function to compare two points based on polar angle
function comparePoints(a: Point, b: Point, anchor: Point): number {
    const angleA = polarAngle(anchor, a);
    const angleB = polarAngle(anchor, b);

    if (angleA < angleB) return -1;
    if (angleA > angleB) return 1;

    // If angles are the same, choose the one closer to the anchor
    const distanceA = Math.hypot(a.x - anchor.x, a.y - anchor.y);
    const distanceB = Math.hypot(b.x - anchor.x, b.y - anchor.y);

    if (distanceA < distanceB) return -1;
    if (distanceA > distanceB) return 1;

    return 0;
}

// Function to find the convex hull using Graham Scan algorithm
function grahamScan(points: Point[]): Point[] {
    if (points.length < 3) {
        throw new Error("Graham Scan requires at least 3 points");
    }

    // Find the point with the lowest y-coordinate (and leftmost if tied)
    const anchor = points.reduce(
        (min, point) =>
            point.y < min.y || (point.y === min.y && point.x < min.x)
                ? point
                : min,
        points[0]
    );

    // Sort the points based on polar angle from the anchor point
    const sortedPoints = points
        .slice()
        .sort((a, b) => comparePoints(a, b, anchor));

    // Initialize the convex hull with the anchor and the first two sorted points
    const convexHull = [anchor, sortedPoints[0], sortedPoints[1]];

    // Iterate through the sorted points to find the convex hull
    for (let i = 2; i < sortedPoints.length; i++) {
        while (
            convexHull.length >= 2 &&
            // Remove the last point if the current point makes a right turn
            polarAngle(
                convexHull[convexHull.length - 2],
                convexHull[convexHull.length - 1]
            ) >= polarAngle(convexHull[convexHull.length - 2], sortedPoints[i])
        ) {
            convexHull.pop();
        }

        // Add the current point to the convex hull
        convexHull.push(sortedPoints[i]);
    }

    return convexHull;
}

export default grahamScan;
