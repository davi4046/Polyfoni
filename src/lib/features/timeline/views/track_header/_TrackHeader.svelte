<script lang="ts">
    import type TrackVM from "../../view_models/track/TrackVM";

    export let trackVM: TrackVM;

    trackVM.subscribe(() => (trackVM = trackVM));
</script>

<div
    class="flex h-[var(--timeline-track-height)] w-full items-center whitespace-nowrap p-2"
    data-type="header"
    data-model-id={trackVM.modelId}
>
    {trackVM.state.label}
</div>
