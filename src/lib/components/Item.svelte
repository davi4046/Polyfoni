<script lang="ts">
    import { ItemModel } from "../models";

    export let data: ItemModel;
</script>

<div
    class="absolute z-30 flex items-center h-full p-2 bg-green-500 border-2 border-green-600"
    style="width: {(data.end - data.start) * 64}px; left: {data.start * 64}px"
>
    <p class="truncate">Item ({data.start}-{data.end})</p>
</div>
