<script lang="ts">
    import tippy from "tippy.js";
    import PopupMenu from "./PopupMenu.svelte";
    import { Menu, type MenuItem } from "./menu";
    import { onMount } from "svelte";

    export let menuItem: MenuItem;

    const isSubmenu = menuItem.action instanceof Menu;

    let buttonElement: HTMLButtonElement;

    onMount(() => {
        if (menuItem.action instanceof Menu) {
            const submenu = new PopupMenu({
                target: document.documentElement,
                props: {
                    x: buttonElement.clientLeft,
                    y: buttonElement.clientTop,
                    // @ts-ignore
                    menu: menuItem.action,
                },
            });

            const element = document.getElementById(submenu.id)!;

            tippy(buttonElement, {
                content: element,
                placement: "right-start",
                offset: [0, 0],
                interactive: true,
            });
        }
    });
</script>

<button
    class="px-2 py-1 text-left text-sm hover:bg-gray-100 active:bg-white"
    bind:this={buttonElement}
    on:click={(_) => {
        // @ts-ignore
        if (!isSubmenu) menuItem.action();
    }}
>
    {menuItem.title}
</button>
