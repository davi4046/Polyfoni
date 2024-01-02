<svg
    class="h-full w-full overflow-visible"
    shape-rendering="crispEdges"
    preserveAspectRatio="none"
>
    <rect width="100%" height="100%" rx="5" ry="5" />
</svg>

<style>
    rect,
    path {
        fill: none;
        stroke: currentColor;
        stroke-width: 4px;
        stroke-dasharray: 12px;
        stroke-dashoffset: 24px;
        animation: stroke 0.4s linear infinite;
        vector-effect: non-scaling-stroke;
    }

    @keyframes stroke {
        to {
            stroke-dashoffset: 0;
        }
    }
</style>
