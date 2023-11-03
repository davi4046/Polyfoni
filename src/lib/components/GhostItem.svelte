<script lang="ts">
    import type { GhostItemModel } from "../models";

    export let data: GhostItemModel;
</script>

<div
    class="absolute z-40 h-full py-1 pointer-events-none"
    style="width: {(data.end - data.start) * 64}px; left: {data.start * 64}px"
>
    <div
        class="flex items-center h-full p-2 bg-green-500 border-2 border-green-600 opacity-75"
    >
        <p class="truncate">Item {data.item.start}-{data.item.end}</p>
    </div>
</div>
