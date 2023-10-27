<script lang="ts">
    import TrackShell from "./TrackShell.svelte";

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
        <svg class="w-6 h-6 text-gray-500" viewBox="0 0 100 100">
            <g stroke="currentColor" stroke-width="8">
                <path d="M 50 50 L 100 50 Z" />
                {#if position == 4}
                    <path d="M 50 0 L 50 50 Z" />
                {:else}
                    <path d="M 50 0 L 50 100 Z" />
                {/if}
            </g>
        </svg>
        <p class="font-semibold text-gray-700">{label}</p>
    </div>
</TrackShell>
