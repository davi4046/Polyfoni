import type { SvelteComponent } from "svelte";

class MultiViewManager {
    private _views: SvelteComponent[] = [];

    setViews(newViews: SvelteComponent[]) {
        this._views.forEach((view) => view.$destroy());
        this._views = newViews;
    }
}

export default MultiViewManager;
