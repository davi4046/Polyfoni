<script lang="ts">
    import { ItemModel } from "../models";

    export let data: ItemModel;
</script>

<div
    class="absolute z-30 h-full py-1"
    style="width: {(data.end - data.start) * 64}px; left: {data.start * 64}px"
>
    <div
        class="flex items-center h-full p-2 bg-green-500 border-2"
        class:border-green-600={!data.isSelected()}
        class:border-blue-600={data.isSelected()}
        on:mouseenter={(_) => {
            data.controller?.setHoveredItem(data);
        }}
        on:mouseleave={(_) => {
            data.controller?.setHoveredItem(null);
        }}
        role="none"
    >
        <p class="truncate">Item ({data.start}-{data.end})</p>
    </div>
</div>
