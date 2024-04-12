<script lang="ts">
    import { uniqueId } from "lodash";
    import PopupMenuItem from "./PopupMenuItem.svelte";
    import { Menu, MenuItem } from "./popup-menu-types";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let x: number;
    export let y: number;
    export let menu: Menu;

    export const id = uniqueId();
    export const focus = () => {
        if (searchBar) searchBar.focus();
    };

    let searchBar: HTMLInputElement;
    let searchText: string;

    $: filteredItems = searchText
        ? menu.items.filter((menuItem) => {
              return menuItem.title
                  .toLowerCase()
                  .includes(searchText.toLowerCase());
          })
        : menu.items;
</script>

<div
    class="absolute z-50 w-36 border bg-white"
    style="left: {x}px; top: {y}px;"
    on:mouseleave={(event) => dispatch("mouseleave", event)}
    role="none"
    {id}
>
    {#if menu.options.searchBar && menu.items.length > 0}
        <input
            class="w-full border-b px-2 py-1 text-sm focus:outline-none"
            bind:this={searchBar}
            placeholder="Search..."
            bind:value={searchText}
        />
    {/if}
    <div
        class="flex flex-col overflow-y-auto"
        style="max-height: {menu.options.maxHeight};"
    >
        {#if menu.items.length === 0}
            <div class="px-2 py-1 text-sm italic text-gray-500">
                No actions...
            </div>
        {:else if filteredItems.length === 0}
            <div class="px-2 py-1 text-sm italic text-gray-500">
                No results...
            </div>
        {:else}
            {#each filteredItems as menuItem (menuItem.id)}
                <PopupMenuItem {menuItem} />
            {/each}
        {/if}
    </div>
</div>
