<script lang="ts">
    export let stripeColor: string;

    stripeColor = stripeColor.replace("#", "%23");

    const style = `background-image: url('data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="pattern_56TX" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)"><line x1="0" y="0" x2="0" y2="20" stroke="${stripeColor}" stroke-width="20"/></pattern></defs> <rect width="100%" height="100%" fill="url(%23pattern_56TX)" opacity="1"/></svg>')`;
</script>

<div class="w-full h-full" {style} />
