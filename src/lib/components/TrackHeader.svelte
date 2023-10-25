<script lang="ts">
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

<div class="flex h-12 p-2 bg-gray-400 place-items-center">
    {label}
</div>
