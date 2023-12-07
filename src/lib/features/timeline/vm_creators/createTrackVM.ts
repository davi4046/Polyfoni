import ViewModel from '../../../shared/view_model/ViewModel';
import { createTrackVMState } from '../view_models/track/TrackVMState';
import createGhostVM from './createGhostVM';
import createItemVM from './createItemVM';

import type TimelineContext from "../contexts/TimelineContext";
import type Track from "../models/track/Track";
import type ItemVM from "../view_models/item/ItemVM";
import type TrackVM from "../view_models/track/TrackVM";

function createTrackVM(model: Track, context: TimelineContext): TrackVM {
    const update = (model: Track) => {
        const items = model.items.map((item) => {
            return createItemVM(item, context);
        });

        const ghostItems = context.move.items
            .map((item) => {
                if (item.track === model) {
                    return createGhostVM(item, context);
                }
            })
            .filter((value): value is ItemVM => value !== undefined);

        return createTrackVMState({
            label: model.label,
            items: [...items, ...ghostItems],
        });
    };

    return ViewModel.create(model, update);
}

export default createTrackVM;
