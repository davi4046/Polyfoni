<script lang="ts">
    import { onDestroy } from "svelte";
    import convertToInlineStyles from "../../../../../utils/convertToInlineStyles";
    import type ItemVM from "../../../view_models/ItemVM";

    export let vm: ItemVM;

    vm.subscribe(() => (vm = vm));

    $: width = (vm.state.end - vm.state.start) * 64 + 2;
    $: left = vm.state.start * 64;

    onDestroy(() => {
        if (vm.state.onDestroy) vm.state.onDestroy();
    });
</script>

<div
    class="absolute z-20 h-full"
    style="width: {width}px; left: {left}px; {vm.state.outerDivStyles
        ? convertToInlineStyles(vm.state.outerDivStyles)
        : ''}"
    data-type="item"
    data-model-id={vm.id}
>
    <div
        class="absolute inset-0 flex items-center font-semibold text-black"
        style={vm.state.innerDivStyles
            ? convertToInlineStyles(vm.state.innerDivStyles)
            : ""}
        on:mousemove={(event) => {
            if (vm.state.handleMouseMove) vm.state.handleMouseMove(event);
        }}
        role="none"
    >
        {#if vm.state.text}
            <div class="truncate">{vm.state.text}</div>
        {/if}
        <!-- start handle-->
        <div
            class="absolute bottom-0 left-0 top-0 z-50 w-1.5"
            style={vm.state.handleStyles
                ? convertToInlineStyles(vm.state.handleStyles)
                : ""}
            on:mousemove={(event) => {
                if (vm.state.handleMouseMove_startHandle)
                    vm.state.handleMouseMove_startHandle(event);
            }}
            role="none"
        />
        <!-- end handle -->
        <div
            class="absolute bottom-0 right-0 top-0 z-50 w-1.5"
            style={vm.state.handleStyles
                ? convertToInlineStyles(vm.state.handleStyles)
                : ""}
            on:mousemove={(event) => {
                if (vm.state.handleMouseMove_endHandle)
                    vm.state.handleMouseMove_endHandle(event);
            }}
            role="none"
        />
    </div>
</div>
