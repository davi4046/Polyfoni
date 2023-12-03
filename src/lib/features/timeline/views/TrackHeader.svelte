<script lang="ts">
    import type TrackVM from "../view_models/track/TrackVM";

    export let trackVM: TrackVM;
</script>

<div
    class="flex items-center w-full h-[var(--timeline-track-height)] p-2 whitespace-nowrap"
>
    {trackVM.label}
</div>
