import { invoke } from "@tauri-apps/api";

import type Item from "../models/item/Item";

export type TempoChange = {
    beat: number;
    tempo: number;
};

export async function deriveTempoChangesFromItems(
    items: Item<"StringItem">[],
    defaultTempo: number
): Promise<TempoChange[]> {
    const tempoChanges = new Map<number, number>();
    tempoChanges.set(0, defaultTempo);

    items = items.slice();
    items.sort((a, b) => a.state.start - b.state.start);

    const promises: Promise<void>[] = [];

    items.forEach((item) => {
        const promise = invoke("evaluate", {
            task: `eval ||| ${item.state.content} ||| {}`,
        }).then((result) => {
            const parsedResult = Number(result);

            if (isNaN(parsedResult)) {
                console.warn("tempo item result error");
                return;
            }
            if (parsedResult < 15) {
                console.warn("tempo item result too small");
                return;
            }
            if (parsedResult > 360) {
                console.warn("tempo item result too big");
                return;
            }

            tempoChanges.set(item.state.start, parsedResult);
            tempoChanges.set(item.state.end, defaultTempo);
        });
        promises.push(promise);
    });
    await Promise.all(promises);

    return Array.from(tempoChanges).map(([beat, tempo]) => {
        return { beat, tempo };
    });
}
