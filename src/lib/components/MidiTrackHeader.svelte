<script lang="ts">
    import TrackShell from "./TrackShell.svelte";
    import ArrowDown from "./svg/ArrowDown.svelte";

    import { VoiceModel } from "../models";

    export let data: VoiceModel;

    function toggleCollapsed() {
        data.isCollapsed = !data.isCollapsed;
    }
</script>

<TrackShell>
    <div class="flex items-center w-32 p-2 space-x-2">
        <button
            class="w-6 h-6 text-gray-500"
            class:-rotate-90={data.isCollapsed}
            on:click={toggleCollapsed}
        >
            <ArrowDown />
        </button>
        <p class="font-semibold text-gray-700">{data.label}</p>
    </div>
</TrackShell>
