<script lang="ts">
    import { Menu } from "../../../../../utils/popup_menu/popup-menu-types";
    import type TrackVM from "../../../view_models/TrackVM";
    import PopupMenu from "../../../../../utils/popup_menu/PopupMenu.svelte";
    import DynamicComponent from "../../utils/DynamicComponent.svelte";

    export let vm: TrackVM;

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

        component.$on("mouseleave", (_) => component.$destroy());
    }
</script>

<div
    class="flex h-[var(--timeline-track-height)] w-full items-center whitespace-nowrap p-2"
    on:contextmenu={handleContextMenu}
    role="none"
>
    <div class="mr-2 h-6 w-6 overflow-clip">
        <DynamicComponent bind:createComponent={vm.state.createIcon} />
    </div>
    {vm.state.label}
</div>
