<script lang="ts">
    import tippy from "tippy.js";
    import PopupMenu from "./PopupMenu.svelte";
    import { Menu, type MenuItem } from "./popup-menu-types";
    import { onDestroy, onMount } from "svelte";
    import ArrowRight from "./ArrowRight.svelte";

    export let menuItem: MenuItem;

    let button: HTMLButtonElement;

    let destroySubmenu: () => void;

    onMount(() => {
        if (menuItem.action instanceof Menu) {
            const submenuComponent = new PopupMenu({
                target: document.documentElement,
                props: {
                    x: button.clientLeft,
                    y: button.clientTop,
                    menu: menuItem.action,
                },
            });

            const submenuElement = document.getElementById(
                submenuComponent.id
            )!;

            const submenuTippy = tippy(button, {
                content: submenuElement,
                placement: "right-start",
                offset: [0, 0],
                interactive: true,
                appendTo: button.parentElement!.parentElement!,
                onMount: (_) => submenuComponent.focus(),
            });

            destroySubmenu = () => {
                submenuComponent.$destroy();
                submenuTippy.destroy();
            };
        }
    });

    onDestroy(() => {
        if (destroySubmenu) destroySubmenu();
    });
</script>

<button
    class="flex place-content-between items-center text-left text-sm hover:bg-gray-100 active:bg-white"
    bind:this={button}
    on:click={(_) => {
        if (!(menuItem.action instanceof Menu)) {
            menuItem.action();
        }
    }}
    title={menuItem.title}
>
    <div class="my-1 ml-2 truncate whitespace-nowrap">
        {menuItem.title}
    </div>
    {#if menuItem.action instanceof Menu}
        <div class="h-6 w-6">
            <ArrowRight />
        </div>
    {/if}
</button>
