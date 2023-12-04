<script lang="ts">
    import type ItemVM from "../view_models/item/ItemVM";

    export let itemVM: ItemVM;

    itemVM.subscribe((_) => (itemVM = itemVM));

    $: width = (itemVM.state.end - itemVM.state.start) * 64 + 2;
    $: left = itemVM.state.start * 64;
</script>

<div
    class="absolute z-50 h-full py-1"
    style="width: {width}px; left: {left}px;"
>
    <div
        class="flex items-center h-full p-2 text-white bg-black border-x-2 border-x-white"
        on:mousedown={(event) => {
            itemVM.state.handleMouseDown(event);
        }}
        role="none"
    >
        <div class="truncate">
            {itemVM.state.isSelected}
        </div>
    </div>
</div>
