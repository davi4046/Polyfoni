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
</script>

<TrackShell>
    <div class="flex items-center p-2">
        {label}
    </div>
</TrackShell>
