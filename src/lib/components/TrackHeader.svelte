<script lang="ts">
    import TrackShell from "./TrackShell.svelte";

    import { TrackModel } from "../models";

    export let data: TrackModel;

    let label: string;

    switch (data.type) {
        case 0:
            label = data.parent!.name;
            break;
        case 1:
            label = "Pitch";
            break;
        case 2:
            label = "Duration";
            break;
        case 3:
            label = "Rest";
            break;
        case 4:
            label = "Velocity";
            break;
        case 5:
            label = "Harmony";
            break;
    }

    function toggleCollapsed() {
        data.parent!.isCollapsed = !data.parent!.isCollapsed;
    }
</script>

<TrackShell>
    <div class="flex items-center w-32 p-2">
        <button class="mr-2" on:click={toggleCollapsed}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
                class:-rotate-90={data.parent?.isCollapsed}
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
            </svg>
        </button>
        <p>{label}</p>
    </div>
</TrackShell>
