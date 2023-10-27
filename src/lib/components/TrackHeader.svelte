<script lang="ts">
    import TrackShell from "./TrackShell.svelte";
    import Pipe from "./svg/Pipe.svelte";
    import EndPipe from "./svg/EndPipe.svelte";

    import { TrackModel } from "../models";

    export let data: TrackModel;

    let label: string;

    switch (data.type) {
        case 0:
            label = "Pitch";
            break;
        case 1:
            label = "Duration";
            break;
        case 2:
            label = "Rest";
            break;
        case 3:
            label = "Velocity";
            break;
        case 4:
            label = "Harmony";
            break;
    }

    let position = data.parent!.children.indexOf(data);
</script>

<TrackShell>
    <div class="flex items-center p-2 space-x-2">
        <div class="w-6 h-6 text-gray-500">
            {#if position == 4}
                <EndPipe />
            {:else}
                <Pipe />
            {/if}
        </div>
        <p class="font-semibold text-gray-700">{label}</p>
    </div>
</TrackShell>
