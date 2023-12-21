<script lang="ts">
    export let path: string;
</script>

<svg
    class="absolute overflow-visible"
    shape-rendering="crispEdges"
    style="
    left: 0px; 
    top: 0px;
    "
>
    <path d={path} fill="none" stroke="blue" stroke-width="4px" />
</svg>
