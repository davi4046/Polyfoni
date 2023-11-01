<script lang="ts">
    import { ItemModel } from "../models";

    export let data: ItemModel;
</script>

<div
    class="absolute z-30 h-full py-1"
    style="width: {(data.end - data.start) * 64}px; left: {data.start * 64}px"
>
    <div
        class="flex items-center h-full p-2 bg-green-500 border-2 border-green-600"
        class:border-blue-500={data.isSelected()}
        on:mousedown={(event) => {
            if (event.shiftKey) {
                if (data.isSelected()) {
                    data.controller?.deselectItem(data);
                } else {
                    data.controller?.selectItemAdditive(data);
                }
            } else {
                data.controller?.selectItem(data);
            }
        }}
        role="none"
    >
        <p class="truncate">Item ({data.start}-{data.end})</p>
    </div>
</div>
