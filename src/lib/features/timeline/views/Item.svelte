<script lang="ts">
    import type ItemVM from "../view_models/item/ItemVM";

    export let itemVM: ItemVM;

    itemVM.subscribe((_) => (itemVM = itemVM));

    $: width = (itemVM.end - itemVM.start) * 64 + 2;
    $: left = itemVM.start * 64;
</script>

<div
    class="absolute z-50 h-full py-1"
    style="width: {width}px; left: {left}px;"
    data-type="item"
    data-model-id={itemVM.modelId}
>
    <div
        class="flex items-center h-full p-2 font-semibold text-black border-2 border-black outline outline-4"
        style="
        background-color: {itemVM.backgroundColor.css()}; 
        outline-color: {itemVM.outlineColor.css()}; 
        opacity: {itemVM.opacity};
        "
        on:mousedown={(event) => {
            itemVM.handleMouseDown(event);
        }}
        role="none"
    >
        <div class="truncate">{itemVM.text}</div>
    </div>
</div>
