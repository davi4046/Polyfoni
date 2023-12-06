class ItemVMState {
    constructor(
        readonly start: number,
        readonly end: number,
        readonly text: string,
        readonly backgroundColor: chroma.Color,
        readonly outlineColor: chroma.Color,
        readonly opacity: number,
        readonly handleMouseDown: (event: MouseEvent) => void
    ) {}
}

export default ItemVMState;
