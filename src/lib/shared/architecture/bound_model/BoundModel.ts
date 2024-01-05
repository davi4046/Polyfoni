import Model from "../model/Model";

/**
 * A model which state is bound to the state of another model.
 */
class BoundModel<
    TModel extends Model<any>,
    TBound extends object,
    TUnbound extends object,
> {
    readonly modelId;

    private _boundModel: Model<TBound>;
    private _unboundModel: Model<TUnbound>;

    constructor(
        model: TModel,
        updateBoundState: (model: TModel) => Required<TBound>,
        initUnboundState: Required<TUnbound>
    ) {
        this.modelId = model.id;
        this._boundModel = new Model<TBound>(updateBoundState(model));
        this._unboundModel = new Model<TUnbound>(initUnboundState);

        model.subscribe((_) => {
            this._boundModel.state = updateBoundState(model);
        });
    }

    get state(): TBound & TUnbound {
        return { ...this._boundModel.state, ...this._unboundModel.state };
    }

    set state(newState: TUnbound) {
        this._unboundModel.state = newState;
    }

    subscribe(callback: () => void) {
        this._boundModel.subscribe(callback);
        this._unboundModel.subscribe(callback);
    }
}

export default BoundModel;
