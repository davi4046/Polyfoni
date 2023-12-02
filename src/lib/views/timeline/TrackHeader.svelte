<script lang="ts">
    import type TrackVM from "../../view_models/timeline/track/TrackVM";

    export let trackVM: TrackVM;
</script>

<div
    class="flex items-center w-full h-[var(--track-height)] p-2 whitespace-nowrap"
>
    {trackVM.label}
</div>
