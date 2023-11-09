<script lang="ts">
    import TrackShell from "./TrackShell.svelte";
    import Pipe from "./svg/Pipe.svelte";
    import EndPipe from "./svg/EndPipe.svelte";

    import { TrackModel } from "../models";

    export let data: TrackModel;

    let pos: number;
    let lastPos: number;

    if (data.parent) {
        pos = data.parent.children.indexOf(data);
        lastPos = data.parent.children.length - 1;
    }
</script>

<TrackShell>
    <div class="flex items-center p-2 space-x-2">
        {#if data.parent}
            <div class="w-6 h-6 text-gray-500">
                {#if pos == lastPos}
                    <EndPipe />
                {:else}
                    <Pipe />
                {/if}
            </div>
        {/if}
        <p class="font-semibold text-gray-700">{data.label}</p>
    </div>
</TrackShell>
