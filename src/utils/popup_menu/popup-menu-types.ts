import { uniqueId } from "lodash";

export class Menu {
    constructor(
        readonly items: readonly MenuItem[],
        readonly options: MenuOptions = {}
    ) {}
}

export class MenuItem {
    constructor(
        readonly title: string,
        readonly action: Menu | (() => void)
    ) {}

    readonly id = uniqueId();
}

export type MenuOptions = Partial<
    Readonly<{
        maxHeight: string;
        searchBar: boolean;
    }>
>;
