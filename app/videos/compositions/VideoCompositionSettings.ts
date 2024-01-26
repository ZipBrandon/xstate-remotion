import { BasicComposition } from "~/videos/compositions/BasicComposition.tsx";
import { ZipVideoComposition } from "~/videos/compositions/ZipVideoComposition.client.tsx";

export const ZipVideoCompositionSettings = {
  Composition: ZipVideoComposition,
  offsets: [30 * 2, 30 * 5],
  transitions: [-30, -30],
  additional: 0,
  // additional: 30 * 2 + 30 * 5 + -30 * 2,
}; // intro, outro, and offset crossfade duration

export const ZipVideoCompositions = {
  ZipVideoComposition: {
    id: `ZipVideoComposition`,
    label: `Normal`,
    CompositionComponent: ZipVideoComposition,
    offsets: [],
    transitions: [],
    additional: 0,
  },

  BasicComposition: {
    id: `BasicComposition`,
    label: `Basic`,
    CompositionComponent: BasicComposition,
    offsets: [],
    transitions: [],
    additional: 0,
  },
};
