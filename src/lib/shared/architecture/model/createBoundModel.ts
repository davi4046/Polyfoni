import Model from "./Model";

/** Creates a model which state is bound to that of another model. */
function createBoundModel<T extends object, U extends object>(
    ctor: new (state: T, id?: string) => Model<T>,
    model: Model<U>,
    binding: (state: U) => T
): Model<T> {
    const boundModel = new ctor(binding(model.state), model.id);

    model.subscribe(() => {
        boundModel.state = binding(model.state);
    });

    return boundModel;
}

export default createBoundModel;
