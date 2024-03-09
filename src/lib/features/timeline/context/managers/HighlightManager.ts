import type Track from "../../models/Track";
import HighlightComponent from "../../visuals/Highlight.svelte";
import Attribute from "../../../../architecture/AttributeEnum";

export default class HighlightManager {
    private _highlights: Highlight[] = [];
    private _components: HighlightComponent[] = [];

    set highlights(newHighlights: Highlight[]) {
        this._highlights = newHighlights;
        this.renderHighlights();
    }

    get highlights() {
        return this._highlights;
    }

    renderHighlights() {
        this._components.forEach((component) => component.$destroy());

        this._components = this._highlights.map((highlight) => {
            const trackElement = document.querySelector(
                `[${Attribute.ModelId}='${highlight.track.id}'][${Attribute.Type}='track']`
            ) as HTMLElement;

            const x1 = highlight.start * 64;
            const x2 = highlight.end * 64;

            return new HighlightComponent({
                target: trackElement,
                props: {
                    left: x1,
                    width: x2 - x1,
                },
            });
        });
    }
}

type Highlight = { track: Track<any>; start: number; end: number };
