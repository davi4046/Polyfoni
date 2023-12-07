import type Model from "../model/Model";
import Subscribable from '../subscribable/Subscribable';

class ViewModel<
    TModel extends Model,
    TState extends object,
> extends Subscribable {
    readonly modelId: string;

    private constructor(model: TModel, update: (model: TModel) => TState) {
        super();

        this.modelId = model.id;

        model.subscribe((_) => {
            Object.assign(this, update(model));
            this.notifySubscribers();
        });

        Object.assign(this, update(model));
        this.notifySubscribers();
    }

    static create<TModel extends Model, TState extends object>(
        model: TModel,
        update: (model: TModel) => TState
    ) {
        return new ViewModel(model, update) as ViewModel<TModel, TState> &
            Required<TState>;
    }
}

export default ViewModel;
