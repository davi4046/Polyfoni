import type Track from "../../models/Track";
import getOutlinePath from "../../utils/track_interval/getOutlinePath";
import Highlight__SvelteComponent_ from "../../visuals/other/Highlight.svelte";
import Attribute from "../../../../architecture/AttributeEnum";
import type Interval from "../../../../shared/utils/interval/Interval";
import mergeIntervals from "../../../../shared/utils/interval/merge_intervals/mergeIntervals";
import createSvgPath from "../../../../shared/utils/point/create_svg_path/createSvgPath";

export default class HighlightManager {
    private _highlights: Highlight[] = [];

    private _component?: Highlight__SvelteComponent_;

    set highlights(newHighlights: Highlight[]) {
        this._highlights = newHighlights;
        this.renderHighlights();
    }

    get highlights() {
        return this._highlights;
    }

    addHighlight(newHighlight: Highlight) {
        const highlights = this._highlights.filter(
            (highlight) => highlight.track === newHighlight.track
        );

        this._highlights = this._highlights.filter(
            (highlight) => !highlights.includes(highlight)
        ); // remove highlights that are on the same track as the new highlight

        highlights.push(newHighlight);

        this._highlights.push(
            ...mergeIntervals(highlights).map((interval) => {
                return {
                    track: newHighlight.track,
                    start: interval.start,
                    end: interval.end,
                };
            })
        );

        this.renderHighlights();
    }

    renderHighlights() {
        const overlayElement = document.querySelector(
            `[${Attribute.Type}='overlay']`
        )!;

        const path = getOutlinePath(this._highlights)
            .map((path) => createSvgPath(path))
            .join(" ");

        this._component?.$destroy();

        this._component = new Highlight__SvelteComponent_({
            target: overlayElement,
            props: {
                path: path,
            },
        });
    }
}

type Highlight = { track: Track<any> } & Interval;
