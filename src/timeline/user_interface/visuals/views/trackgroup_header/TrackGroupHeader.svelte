<script lang="ts">
    import type TrackGroupVM from "../../../view_models/TrackGroupVM";
    import DynamicComponent from "../../utils/DynamicComponent.svelte";
    import TrackHeader from "../track_header/TrackHeader.svelte";
    import PopupMenu from "../../../../../utils/popup_menu/PopupMenu.svelte";

    export let vm: TrackGroupVM;

    vm.subscribe(() => (vm = vm));

    function handleContextMenu(event: MouseEvent) {
        if (!vm.state.headerMenu) return;

        event.preventDefault();

        const component = new PopupMenu({
            target: document.getElementById("app")!,
            props: {
                x: event.clientX - 8,
                y: event.clientY - 8,
                menu: vm.state.headerMenu,
            },
        });

        const eventHandler = () => {
            component.$destroy();
            document.removeEventListener("click", eventHandler);
            document.removeEventListener("contextmenu", eventHandler, true);
        };

        document.addEventListener("click", eventHandler);
        document.addEventListener("contextmenu", eventHandler, true);
    }
</script>

{#if !vm.state.hidden}
    <div
        class="flex h-[var(--timeline-track-group-gap)] items-center p-2 text-sm"
        on:contextmenu={handleContextMenu}
        role="none"
    >
        <div class="mr-2 h-6 w-6 overflow-clip">
            <DynamicComponent bind:createComponent={vm.state.createIcon} />
        </div>
        {vm.state.label}
    </div>
{/if}
<div class="space-y-[var(--timeline-track-gap)]">
    {#each vm.state.tracks as trackVM (trackVM.id)}
        <TrackHeader vm={trackVM}></TrackHeader>
    {/each}
</div>
