import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/api/fs";
import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";

import { load } from "js-yaml";

import type StateHierarchyWatcher from "../../../architecture/StateHierarchyWatcher";
import {
    countAncestors,
    getNestedArrayOfDescendants,
} from "../../../architecture/state-hierarchy-utils";
import purifyArrays from "../../../utils/purifyArrays";
import type Item from "../../models/item/Item";
import type Timeline from "../../models/timeline/Timeline";

export default class AliasManager {
    async init(watcher: StateHierarchyWatcher<Timeline>) {
        const timeline = watcher.root;
        const trackedAliases = await loadTimelineAliases(timeline);

        // Remove unused aliases
        {
            const unusedAliases: string[] = [];

            trackedAliases.forEach((refCount, alias) => {
                if (refCount === 0) unusedAliases.push(alias);
            });

            timeline.state = {
                aliases: Object.fromEntries(
                    Object.entries(timeline.state.aliases).filter(
                        ([key]) => !unusedAliases.includes(key)
                    )
                ),
            };

            unusedAliases.forEach((alias) => trackedAliases.delete(alias));
        }

        const builtins = new Map<string, string>();

        // Load builtin aliases
        {
            const path = await resolveResource("res/builtin_aliases.yaml");
            const content = await readTextFile(path);

            Object.entries(load(content) as object).forEach(
                ([alias, value]) => {
                    const cleanedValue = value
                        .replace(/\r?\n|\r/g, "") // Remove linebreaks
                        .replace(/\s+/g, " "); // Remove redundant spaces

                    builtins.set(alias, cleanedValue);
                }
            );
        }

        function handleAddedName(name: string) {
            if (trackedAliases.has(name)) {
                trackedAliases.set(name, trackedAliases.get(name)! + 1);
            } else if (builtins.has(name)) {
                trackedAliases.set(name, 1);
                timeline.state = {
                    aliases: Object.assign({}, timeline.state.aliases, {
                        [name]: builtins.get(name)!,
                    }),
                };
                emit("display-message", {
                    message: `Added Builtin: ${name}`,
                });
            }
        }

        function handleRemovedName(name: string) {
            if (!trackedAliases.has(name)) return;

            const newValue = trackedAliases.get(name)! - 1;

            if (newValue > 0) {
                trackedAliases.set(name, newValue);
            } else {
                trackedAliases.delete(name);
                timeline.state = {
                    aliases: Object.fromEntries(
                        Object.entries(timeline.state.aliases).filter(
                            ([key]) => key !== name
                        )
                    ),
                };
                emit("display-message", {
                    message: `Removed Builtin: ${name}`,
                });
            }
        }

        watcher.subscribe(async (obj, oldState) => {
            const objDepth = countAncestors(obj);
            const newState = obj.state as any;

            switch (objDepth) {
                // Track
                case 4: {
                    const [removedItems, addedItems] = purifyArrays<Item<any>>(
                        oldState.children,
                        newState.children
                    );

                    const removedPromises = removedItems.map((item) =>
                        getVariableNames(item.state.content)
                    );
                    const addedPromises = addedItems.map((item) =>
                        getVariableNames(item.state.content)
                    );

                    const [removedNames, addedNames] = await Promise.all([
                        Promise.all(removedPromises),
                        Promise.all(addedPromises),
                    ]);

                    addedNames.flat().forEach(handleAddedName);
                    removedNames.flat().forEach(handleRemovedName);
                    break;
                }
                // Item
                case 5: {
                    const [oldNames, newNames] = await Promise.all([
                        getVariableNames(oldState.content),
                        getVariableNames(newState.content),
                    ]);

                    const [removedNames, addedNames] = purifyArrays(
                        oldNames,
                        newNames
                    );

                    addedNames.forEach(handleAddedName);
                    removedNames.forEach(handleRemovedName);
                    break;
                }
            }
        });
    }
}

async function loadTimelineAliases(
    timeline: Timeline
): Promise<Map<string, number>> {
    const items = (
        getNestedArrayOfDescendants(timeline, 5).flat(Infinity) as Item<any>[]
    ).filter(
        (item): item is Item<"StringItem"> => item.itemType === "StringItem"
    );

    const promises = items.map((item) => getVariableNames(item.state.content));

    const varNames = (await Promise.all(promises)).flat();

    return new Map(
        Object.entries(timeline.state.aliases).map(([key]) => {
            const refCount = varNames.reduce((count, value) => {
                return value === key ? count + 1 : count;
            }, 0);
            return [key, refCount];
        })
    );
}

async function getVariableNames(pythonString: string): Promise<string[]> {
    return invoke("evaluate", {
        task: `get_names ||| ${pythonString}`,
    }).then((result) => {
        try {
            const parsedResult = JSON.parse(
                (result as string).replaceAll(`'`, `"`)
            );
            return Array.from(new Set(parsedResult));
        } catch {
            return [];
        }
    });
}
