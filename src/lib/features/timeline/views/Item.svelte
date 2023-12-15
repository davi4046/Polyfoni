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
    data-type="item"
    data-model-id={itemVM.modelId}
>
    <div
        class="relative flex h-full items-center border-2 border-black p-2 font-semibold text-black outline outline-4"
        style="
        background-color: {itemVM.state.backgroundColor.css()}; 
        outline-color: {itemVM.state.outlineColor.css()}; 
        opacity: {itemVM.state.opacity};
        "
        on:mousedown={(event) => {
            itemVM.state.handleMouseDown(event);
        }}
        role="none"
    >
        <div class="truncate">{itemVM.state.text}</div>
        <!-- Left handle-->
        <div
            class="absolute bottom-0 left-0 top-0 z-50 w-1.5 bg-purple-400"
            on:mousedown={(event) => itemVM.state.handleMouseDown_L(event)}
            role="none"
        />
        <!-- Right handle -->
        <div
            class="absolute bottom-0 right-0 top-0 z-50 w-1.5 bg-purple-400"
            on:mousedown={(event) => itemVM.state.handleMouseDown_R(event)}
            role="none"
        />
    </div>
</div>
