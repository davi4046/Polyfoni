<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import convertToInlineStyles from "../../../../../utils/css-utils";
    import type ItemVM from "../../../view_models/ItemVM";
    import tippy, { type Instance, type Props } from "tippy.js";

    export let vm: ItemVM;

    let outerDiv: HTMLElement;
    let innerDiv: HTMLElement;

    let tooltip: Instance<Props> | undefined = undefined;

    vm.subscribe((_, oldState) => {
        vm = vm;

        if (vm.state.tooltip !== oldState.tooltip) {
            if (tooltip && !tooltip.state.isDestroyed) {
                tooltip.destroy();
            }
            if (vm.state.tooltip && innerDiv && outerDiv) {
                vm.state.tooltip.triggerTarget = outerDiv;
                tooltip = tippy(innerDiv, vm.state.tooltip);
            }
        }
    });

    onMount(() => {
        if (vm.state.tooltip && innerDiv && outerDiv) {
            vm.state.tooltip.triggerTarget = outerDiv;
            tooltip = tippy(innerDiv, vm.state.tooltip);
        }
    });

    onDestroy(() => {
        if (vm.state.onDestroy) vm.state.onDestroy();
    });

    $: width = (vm.state.end - vm.state.start) * 64 + 2;
    $: left = vm.state.start * 64;
</script>

<div
    class="absolute z-20 h-full"
    style="width: {width}px; left: {left}px; {vm.state.outerDivStyles
        ? convertToInlineStyles(vm.state.outerDivStyles)
        : ''}"
    data-type="item"
    data-model-id={vm.id}
    bind:this={outerDiv}
>
    <div
        class="absolute inset-0 flex items-center font-semibold text-black"
        style={vm.state.innerDivStyles
            ? convertToInlineStyles(vm.state.innerDivStyles)
            : ""}
        on:mousemove={(event) => {
            if (vm.state.handleMouseMove) vm.state.handleMouseMove(event);
        }}
        bind:this={innerDiv}
        role="none"
    >
        {#if vm.state.text}
            <div class="truncate">{vm.state.text}</div>
        {/if}
        <!-- start grip-->
        <div
            class="absolute bottom-0 left-0 top-0 z-50 w-1.5"
            style={vm.state.handleStyles
                ? convertToInlineStyles(vm.state.handleStyles)
                : ""}
            on:mousemove={(event) => {
                if (vm.state.handleMouseMove_startGrip)
                    vm.state.handleMouseMove_startGrip(event);
            }}
            role="none"
        />
        <!-- end grip -->
        <div
            class="absolute bottom-0 right-0 top-0 z-50 w-1.5"
            style={vm.state.handleStyles
                ? convertToInlineStyles(vm.state.handleStyles)
                : ""}
            on:mousemove={(event) => {
                if (vm.state.handleMouseMove_endGrip)
                    vm.state.handleMouseMove_endGrip(event);
            }}
            role="none"
        />
    </div>
</div>
