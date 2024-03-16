<script lang="ts">
    import type ItemVM from "../../../view_models/ItemVM";

    export let vm: ItemVM;

    vm.subscribe(() => (vm = vm));

    $: width = (vm.state.end - vm.state.start) * 64 + 2;
    $: left = vm.state.start * 64;
    $: style = vm.state.styles
        ? Object.entries(vm.state.styles)
              .map(([property, value]) => {
                  return `${property}:${value}`;
              })
              .join(";")
        : "";
</script>

<div
    class="absolute z-10 h-full"
    style="width: {width}px; left: {left}px;"
    data-type="item"
    data-model-id={vm.id}
>
    <div
        class="absolute inset-0 flex items-center p-2 font-semibold text-black"
        {style}
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
            class="absolute bottom-0 left-0 top-0 z-50 w-1.5 bg-black opacity-25"
            on:mousemove={(event) => {
                if (vm.state.handleMouseMove_startHandle)
                    vm.state.handleMouseMove_startHandle(event);
            }}
            role="none"
        />
        <!-- end handle -->
        <div
            class="absolute bottom-0 right-0 top-0 z-50 w-1.5 bg-black opacity-25"
            on:mousemove={(event) => {
                if (vm.state.handleMouseMove_endHandle)
                    vm.state.handleMouseMove_endHandle(event);
            }}
            role="none"
        />
    </div>
</div>
