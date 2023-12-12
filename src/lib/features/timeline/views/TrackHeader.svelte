<script lang="ts">
    import type TrackVM from "../view_models/track/TrackVM";

    export let trackVM: TrackVM;

    trackVM.subscribable.subscribe((_) => (trackVM = trackVM));
</script>

<div
    class="flex items-center w-full h-[var(--timeline-track-height)] p-2 whitespace-nowrap"
    data-type="header"
    data-model-id={trackVM.modelId}
>
    {trackVM.state.label}
</div>
