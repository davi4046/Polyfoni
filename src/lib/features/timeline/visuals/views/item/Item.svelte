<script lang="ts">
    import type ItemVM from "../../../view_models/ItemVM";

    export let itemVM: ItemVM;

    itemVM.subscribe(() => (itemVM = itemVM));

    $: width = (itemVM.state.end - itemVM.state.start) * 64 + 2;
    $: left = itemVM.state.start * 64;
</script>

<div
    class="absolute z-10 h-full py-1"
    style="width: {width}px; left: {left}px;"
    data-type="item"
    data-model-id={itemVM.id}
>
    <div
        class="relative flex items-center h-full p-2 font-semibold text-black border-2 border-black outline outline-4"
        style="
        background-color: {itemVM.state.backgroundColor.css()}; 
        outline-color: {itemVM.state.outlineColor.css()}; 
        opacity: {itemVM.state.opacity};
        "
        on:mousemove={(event) => {
            itemVM.state.handleMouseMove(event);
        }}
        role="none"
    >
        <div class="truncate">{itemVM.state.text}</div>
        <!-- start handle-->
        <div
            class="absolute bottom-0 left-0 top-0 z-50 w-1.5 bg-purple-400"
            on:mousemove={(event) =>
                itemVM.state.handleMouseMove_startHandle(event)}
            role="none"
        />
        <!-- end handle -->
        <div
            class="absolute bottom-0 right-0 top-0 z-50 w-1.5 bg-purple-400"
            on:mousemove={(event) =>
                itemVM.state.handleMouseMove_endHandle(event)}
            role="none"
        />
    </div>
</div>
