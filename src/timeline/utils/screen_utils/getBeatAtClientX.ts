import type Timeline from "../../../timeline/models/timeline/Timeline";

export default function getBeatAtClientX(
    timeline: Timeline,
    clientX: number
): number {
    const centerTracksContainer = document.getElementById(
        timeline.id + "-center-tracks"
    )!;

    return (
        (clientX -
            centerTracksContainer.offsetLeft +
            centerTracksContainer.scrollLeft) /
        64
    );
}
