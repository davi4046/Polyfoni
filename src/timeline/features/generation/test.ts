import makeDemoTimeline from "../../dev_utils/makeDemoTimeline";
import createDecorationPass from "../../utils/createDecorationPass";
import { getChildren } from "../../../architecture/state-hierarchy-utils";

import { getTracksOfType } from "./track-config";

describe("getTracksOfType", () => {
    const timeline = makeDemoTimeline();
    const voice = getChildren(getChildren(timeline)[1])[0];
    createDecorationPass(voice);
    createDecorationPass(voice);

    test("Handles tracktype with non-specified path", () => {
        expect(() => {
            getTracksOfType(voice, "blah");
        }).toThrow();
    });

    test("Handles tracktype path not matching voice", () => {
        const voice = getChildren(getChildren(timeline)[0])[0]; // Voice containing Tempo and Scale tracks
        expect(() => {
            getTracksOfType(voice, "frameworkPitch");
        }).toThrow();
    });

    test("Can find 'output' track", () => {
        expect(getTracksOfType(voice, "output")).toHaveLength(1);
    });

    test("Can find 'frameworkPitch' track", () => {
        expect(getTracksOfType(voice, "frameworkPitch")).toHaveLength(1);
    });

    test("Can find 'frameworkDuration' track", () => {
        expect(getTracksOfType(voice, "frameworkDuration")).toHaveLength(1);
    });

    test("Can find 'frameworkRest' track", () => {
        expect(getTracksOfType(voice, "frameworkRest")).toHaveLength(1);
    });

    test("Can find 'frameworkHarmony' track", () => {
        expect(getTracksOfType(voice, "output")).toHaveLength(1);
    });

    test("Can find 'decorationPitches' tracks", () => {
        expect(getTracksOfType(voice, "decorationPitches")).toHaveLength(2);
    });

    test("Can find 'decorationFraction' tracks", () => {
        expect(getTracksOfType(voice, "decorationFraction")).toHaveLength(2);
    });

    test("Can find 'decorationSkip' tracks", () => {
        expect(getTracksOfType(voice, "decorationSkip")).toHaveLength(2);
    });

    test("Can find 'decorationHarmony' tracks", () => {
        expect(getTracksOfType(voice, "decorationHarmony")).toHaveLength(2);
    });
});
