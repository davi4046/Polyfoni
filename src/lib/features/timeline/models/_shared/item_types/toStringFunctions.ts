import pitchNames from "../../../utils/pitchNames";

import type ItemTypes from "./ItemTypes";

type ToStringFunctions = {
    [K in keyof ItemTypes]: (
        value: ItemTypes[K]["ContentType"] | null
    ) => string;
};

const toStringFunctions: ToStringFunctions = {
    StringItem: (value) => (value ? value : ""),
    ChordItem: (value) => {
        if (!value) return "";
        const root = pitchNames[value.pitchClassSet[0] % 12];
        const decimal = value.getDecimal();
        return root + "-" + decimal;
    },
};

export { toStringFunctions, type ToStringFunctions };
