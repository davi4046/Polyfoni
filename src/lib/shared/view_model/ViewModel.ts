import type Model from "../model/Model";
import Stateful from "../stateful/Stateful";
import Subscribable from "../subscribable/Subscribable";

type StateFilter<TState extends object> = (
    state: Required<TState>
) => Required<TState>;

class ViewModel<TModel extends Model<any>, TState extends object> {
    readonly subscribable = new Subscribable(this);
    readonly state: Stateful<TState> & Required<TState>;
    readonly modelId: string;

    private _filters: StateFilter<TState>[] = [];

    constructor(model: TModel, update: (model: TModel) => Required<TState>) {
        this.state = Stateful.create(update(model));
        this.modelId = model.id;

        model.subscribable.subscribe((_) => {
            this.state.setState(
                this._filters.reduce(
                    (state, filter) => filter(state),
                    update(model)
                )
            );
            this.subscribable.notifySubscribers();
        });

        this.subscribable.notifySubscribers();
    }

    addFilter(filter: StateFilter<TState>): { removeFilter: () => void } {
        this._filters.push(filter);
        const removeFilter = () => {
            const index = this._filters.indexOf(filter);
            this._filters.splice(index, 1);
        };
        return { removeFilter };
    }
}

export default ViewModel;
