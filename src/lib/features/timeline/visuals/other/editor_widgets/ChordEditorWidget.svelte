<script lang="ts">
    import type Chord from "../../../utils/chord/Chord";

    export let value: Chord | null;
    export let update: (value: Chord | null) => void;
</script>

<div>Chord editor widget</div>
