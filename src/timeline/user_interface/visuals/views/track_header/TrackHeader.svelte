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

        const eventHandler = () => {
            component.$destroy();
            document.removeEventListener("click", eventHandler);
            document.removeEventListener("contextmenu", eventHandler, true);
        };

        document.addEventListener("click", eventHandler);
        document.addEventListener("contextmenu", eventHandler, true);
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
