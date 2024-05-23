import { uniqueId } from "lodash-es";

export class Menu {
    constructor(
        readonly items: readonly MenuItem[],
        readonly options: MenuOptions = {}
    ) {}
}

export class MenuItem {
    constructor(
        readonly title: string,
        readonly action: Menu | (() => void),
        readonly options: MenuItemOptions = {}
    ) {}

    readonly id = uniqueId();
}

export type MenuOptions = Partial<
    Readonly<{
        maxHeight: string;
        searchBar: boolean;
    }>
>;

export type MenuItemOptions = Partial<
    Readonly<{
        disabled: boolean;
    }>
>;
