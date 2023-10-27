<script lang="ts">
    import TrackShell from "./TrackShell.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;

    function toggleCollapsed() {
        data.isCollapsed = !data.isCollapsed;
    }
</script>

<TrackShell>
    <div class="flex items-center w-32 p-2 space-x-2">
        <button on:click={toggleCollapsed}>
            <svg
                class="w-6 h-6 text-gray-500"
                class:-rotate-90={data.isCollapsed}
                viewBox="0 0 100 100"
            >
                <path
                    stroke="currentColor"
                    stroke-width="8"
                    fill="currentColor"
                    d="M 25 50 L 75 50 L 50 75 Z"
                />
            </svg>
        </button>
        <p class="font-semibold text-gray-700">{data.name}</p>
    </div>
</TrackShell>
