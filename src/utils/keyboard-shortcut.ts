import { isEqual } from "lodash-es";

type Modifiers = { alt: boolean; ctrl: boolean; shift: boolean };
type Shortcut = {
    key: string;
    modifiers: Modifiers;
    listener: (event: KeyboardEvent) => void;
};

document.addEventListener(
    "keydown",
    (event) => {
        const modifiers = {
            alt: event.altKey,
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
        };

        const shortcut = shortcuts.find((shortcut) => {
            return (
                shortcut.key === event.key.toLowerCase() &&
                isEqual(shortcut.modifiers, modifiers)
            );
        });

        if (shortcut) shortcut.listener(event);
    },
    { capture: true }
);

const shortcuts: Shortcut[] = [];

export function registerShortcut(
    shortcut: string,
    listener: (event: KeyboardEvent) => void
) {
    const keys = shortcut.split("+");

    const modifiers = { alt: false, ctrl: false, shift: false };

    let nonModifierCount = 0;
    let nonModifierKey: string;

    for (const key of keys) {
        if (Object.keys(modifiers).includes(key)) {
            modifiers[key as keyof Modifiers] = true;
        } else {
            nonModifierCount += 1;
            nonModifierKey = key;
        }
    }

    if (nonModifierCount === 0) {
        throw new Error(
            "Shortcut must contain one key that is not alt, ctrl, or shift"
        );
    }
    if (nonModifierCount > 1) {
        throw new Error(
            "Shortcut may only contain one key that is not alt, ctrl, or shift"
        );
    }

    const matchingShortcutIndex = shortcuts.findIndex((shortcut) => {
        return (
            shortcut.key === nonModifierKey &&
            isEqual(shortcut.modifiers, modifiers)
        );
    });

    if (matchingShortcutIndex !== -1) {
        shortcuts.splice(matchingShortcutIndex, 1);
    }

    shortcuts.push({ key: nonModifierKey!, modifiers, listener });
}
