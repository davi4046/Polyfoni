import type Point from "../../../../../../shared/utils/point/Point";
import polygonClipping from "polygon-clipping";

import { getIndex } from "../../../../../../shared/architecture/state/state_utils";
import groupBySection from "../group_by_section/groupBySection";
import groupByTrack from "../group_by_track/groupByTrack";
import groupByVoice from "../group_by_voice/groupByVoice";
import getRect from "./rectangle/get_rect/getRect";

import type Highlight from "../Highlight";
import type Rectangle from "./rectangle/Rectangle";

function getVerticalFiller(
    upper: Rectangle,
    lower: Rectangle
): Rectangle | undefined {
    const x1 = Math.max(upper.x1, lower.x1);
    const x2 = Math.min(upper.x2, lower.x2);

    if (x1 >= x2) return;

    const y1 = upper.y2;
    const y2 = lower.y1;

    if (y1 >= y2) return;

    return {
        x1,
        x2,
        y1,
        y2,
    };
}

function createPaths(highlights: Highlight[]): Point[][] {
    const groups = groupBySection(highlights).map((group) =>
        groupByVoice(group).map((group) =>
            groupByTrack(group).sort(
                // sort track groups by track index
                (a, b) => getIndex(a[0].track) - getIndex(b[0].track)
            )
        )
    );

    const rects: Rectangle[] = [];

    for (const sectionGroup of groups) {
        for (const voiceGroup of sectionGroup) {
            for (let i = 0; i < voiceGroup.length; i++) {
                const currTrackGroup = voiceGroup[i];
                const currTrackRects = currTrackGroup.map(getRect);

                currTrackRects.forEach((rect) => rects.push(rect));

                if (i === voiceGroup.length - 1) continue;

                const nextTrackGroup = voiceGroup[i + 1];

                if (
                    getIndex(nextTrackGroup[0].track) !==
                    getIndex(currTrackGroup[0].track) + 1
                ) {
                    continue;
                }

                const nextTrackRects = nextTrackGroup.map(getRect);

                for (const upper of currTrackRects) {
                    for (const lower of nextTrackRects) {
                        const filler = getVerticalFiller(upper, lower);
                        if (filler) rects.push(filler);
                    }
                }
            }
        }
    }

    const polygons = rects.map((rect) => [
        [
            [rect.x1, rect.y1],
            [rect.x2, rect.y1],
            [rect.x2, rect.y2],
            [rect.x1, rect.y2],
        ],
    ]) as polygonClipping.Polygon[];

    let joinedPolygons = polygonClipping.union(polygons[0], polygons.slice(1));

    const paths = joinedPolygons.flatMap((polygon) => {
        return polygon.map((ring) => {
            return ring.map((pair) => {
                return { x: pair[0], y: pair[1] };
            });
        });
    });

    return paths;
}

export default createPaths;
