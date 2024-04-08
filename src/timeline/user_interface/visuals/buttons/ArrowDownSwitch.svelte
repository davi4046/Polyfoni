<script lang="ts">
    export let onClick: (event: MouseEvent) => void;

    let value = false;
</script>

<button
    class="h-full w-full"
    on:click={(event) => {
        value = !value;
        onClick(event);
    }}
>
    <svg
        class:-rotate-90={value}
        viewBox="0 0 100 100"
        shape-rendering="crispEdges"
    >
        <path
            stroke="currentColor"
            stroke-width="8"
            fill="currentColor"
            d="M 25 50 L 75 50 L 50 75 Z"
        />
    </svg>
</button>
