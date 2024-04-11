<script lang="ts">
    import { uniqueId } from "lodash";
    import PopupMenuItem from "./PopupMenuItem.svelte";
    import { Menu } from "./menu";

    export let x: number;
    export let y: number;
    export let menu: Menu;

    export const id = uniqueId();
</script>

<div
    class="absolute z-50 flex w-48 flex-col border bg-white"
    style="left: {x}px; top: {y}px;"
    role="none"
    {id}
>
    {#each menu.items as menuItem}
        <PopupMenuItem {menuItem} />
    {/each}
</div>
