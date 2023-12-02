<script lang="ts">
    import type ItemVM from "../../view_models/timeline/item/ItemVM";

    export let itemVM: ItemVM;

    $: width = (itemVM.end - itemVM.start) * 64 + 2;
    $: left = itemVM.start * 64;
</script>

<div
    class="absolute z-50 h-full py-1"
    style="width: {width}px; left: {left}px;"
>
    <div
        class="flex items-center h-full p-2 text-white bg-black border-x-2 border-x-white"
    >
        <div class="truncate">
            {itemVM.text}
        </div>
    </div>
</div>
