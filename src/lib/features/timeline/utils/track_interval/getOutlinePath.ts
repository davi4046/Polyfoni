import polygonClipping from "polygon-clipping";

import Attribute from "../../../../shared/architecture/AttributeEnum";
import { getIndex } from "../../../../shared/architecture/state/state_utils";

import type TrackInterval from "./TrackInterval";
import groupByTrack from "./groupByTrack";
import groupByVoice from "./groupByVoice";

export default function getOutlinePath(highlights: TrackInterval[]): Point[][] {
    if (highlights.length === 0) return [];

    const groups = groupByVoice(highlights).map((group) =>
        groupByTrack(group).sort(
            // sort track groups by track index
            (a, b) => getIndex(a[0].track) - getIndex(b[0].track)
        )
    );

    const boundingBoxes: BoundingBox[] = [];

    for (const voiceGroup of groups) {
        for (let i = 0; i < voiceGroup.length; i++) {
            const currTrackGroup = voiceGroup[i];
            const currTrackRects = currTrackGroup
                .map(getBoundingBox)
                .filter((value): value is BoundingBox => value !== undefined);

            currTrackRects.forEach((boundingBox) =>
                boundingBoxes.push(boundingBox)
            );

            if (i === voiceGroup.length - 1) continue;

            const nextTrackGroup = voiceGroup[i + 1];

            if (
                getIndex(nextTrackGroup[0].track) !==
                getIndex(currTrackGroup[0].track) + 1
            ) {
                continue;
            }

            const nextTrackRects = nextTrackGroup
                .map(getBoundingBox)
                .filter((value): value is BoundingBox => value !== undefined);

            for (const upper of currTrackRects) {
                for (const lower of nextTrackRects) {
                    const filler = getVerticalFiller(upper, lower);
                    if (filler) boundingBoxes.push(filler);
                }
            }
        }
    }

    const polygons = boundingBoxes.map((boundingBox) => [
        [
            [boundingBox.x1, boundingBox.y1],
            [boundingBox.x2, boundingBox.y1],
            [boundingBox.x2, boundingBox.y2],
            [boundingBox.x1, boundingBox.y2],
        ],
    ]) as polygonClipping.Polygon[];

    let joinedPolygons =
        polygons.length > 1
            ? polygonClipping.union(polygons[0], polygons.slice(1))
            : [polygons[0]];

    const paths = joinedPolygons.flatMap((polygon) => {
        return polygon.map((ring) => {
            return ring.map((pair) => {
                return { x: pair[0], y: pair[1] };
            });
        });
    });

    return paths;
}

type Point = {
    x: number;
    y: number;
};

function getBoundingBox(highlight: TrackInterval): BoundingBox | undefined {
    const x1 = highlight.start * 64;
    const x2 = highlight.end * 64;

    const trackElement = document.querySelector(
        `[${Attribute.ModelId}='${highlight.track.id}']`
    ) as HTMLElement;

    if (!trackElement) return;

    const rect = getRelativeRect(
        trackElement,
        trackElement.parentElement!.parentElement!
    );

    const y1 = rect.top;
    const y2 = rect.bottom;

    return { x1, y1, x2, y2 };
}

type BoundingBox = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

function getRelativeRect(
    element1: HTMLElement,
    element2: HTMLElement
): DOMRect {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const relativeRect = new DOMRect(
        rect1.left - rect2.left,
        rect1.top - rect2.top,
        rect1.width,
        rect1.height
    );

    return relativeRect;
}

function getVerticalFiller(
    upper: BoundingBox,
    lower: BoundingBox
): BoundingBox | undefined {
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
