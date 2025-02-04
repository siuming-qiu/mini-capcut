import type { ImageTrack } from "./ImageTrack";

export type Track = ImageTrack;

export interface TrackLineItem {
  type: Track["type"];
  main?: boolean;
  list: Track[];
}
