<script lang="ts">
    import type ItemVM from "../../../view_models/ItemVM";

    export let vm: ItemVM;

    vm.subscribe(() => (vm = vm));

    $: width = (vm.state.end - vm.state.start) * 64 + 2;
    $: left = vm.state.start * 64;
</script>

<div
    class="absolute z-10 h-full py-1"
    style="width: {width}px; left: {left}px;"
    data-type="item"
    data-model-id={vm.id}
>
    <div
        class="relative flex h-full items-center border-2 border-black p-2 font-semibold text-black outline outline-4"
        style="
        background-color: {vm.state.bgColor.css()}; 
        outline-color: {vm.state.outlineColor.css()}; 
        opacity: {vm.state.opacity};
        "
        on:mousemove={(event) => {
            vm.state.handleMouseMove(event);
        }}
        role="none"
    >
        <div class="truncate">{vm.state.text}</div>
        <!-- start handle-->
        <div
            class="absolute bottom-0 left-0 top-0 z-50 w-1.5 bg-purple-400"
            on:mousemove={(event) =>
                vm.state.handleMouseMove_startHandle(event)}
            role="none"
        />
        <!-- end handle -->
        <div
            class="absolute bottom-0 right-0 top-0 z-50 w-1.5 bg-purple-400"
            on:mousemove={(event) => vm.state.handleMouseMove_endHandle(event)}
            role="none"
        />
    </div>
</div>
