import { create } from "zustand";
import { checkTrackListOverlap } from "@/utils/base";
import type { Track, TrackLineItem } from "@/class/Track";

interface PlayerState {
  ingLoadingCount: number;
  canvasOptions: {
    width: number;
    height: number;
  };
  playerConfig: {
    frameCount: number;
    playerWidth: number;
    playerHeight: number;
  };
  exiistVideo: boolean;
  playStartFrame: number;

  isPause: boolean;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  ingLoadingCount: 0,
  canvasOptions: {
    width: 0,
    height: 0,
  },
  playerConfig: {
    frameCount: 0,
    playerWidth: 1080 / 6,
    playerHeight: 1920 / 6,
  },
  exiistVideo: false,
  playStartFrame: 0,
  isPause: false,
  setPlayerConfig: (config: PlayerState["playerConfig"]) =>
    set({ playerConfig: config }),
  setCanvasOptions: (options: PlayerState["canvasOptions"]) =>
    set({ canvasOptions: options }),
  setExiistVideo: (exist: PlayerState["exiistVideo"]) =>
    set({ exiistVideo: exist }),
  setPlayStartFrame: (frame: PlayerState["playStartFrame"]) =>
    set({ playStartFrame: frame }),
  setIsPause: (pause: PlayerState["isPause"]) => set({ isPause: pause }),
}));

interface TrackState {
  dragData: {
    dataInfo: Track;
    dragType: string;
    dragPoint: {
      x: number;
      y: number;
    };
    fixLines: { position: number; frame: number }[][];
    moveX: number;
    moveY: number;
  };
  moveTrackData: {
    lineIndex: number;
    itemIndex: number;
  };
  trackScale: number;
  trackList: TrackLineItem[];
  selectTrackItem: {
    line: number;
    index: number;
  };
}

interface TrackActions {
  addTrack: (newItem: Track) => void;
  selectTrackById: (id: string) => void;
  removeTrack: (lineIndex: number, itemIndex: number) => void;
}

export const useTrackStore = create<TrackState & TrackActions>()((set) => ({
  // 初始状态
  dragData: {
    dataInfo: {} as Track,
    dragType: "",
    dragPoint: { x: 0, y: 0 },
    fixLines: [],
    moveX: 0,
    moveY: 0,
  },
  moveTrackData: {
    lineIndex: -1,
    itemIndex: -1,
  },
  trackScale: 60,
  trackList: [],
  selectTrackItem: {
    line: -1,
    index: -1,
  },

  // 方法
  removeTrack: (lineIndex: number, itemIndex: number) => {
    set((state) => {
      const newTrackList = [...state.trackList];
      newTrackList[lineIndex] = {
        ...newTrackList[lineIndex],
        list: [...newTrackList[lineIndex].list],
      };
      newTrackList[lineIndex].list.splice(itemIndex, 1);

      if (
        newTrackList[lineIndex].list.length === 0 &&
        !newTrackList[lineIndex].main
      ) {
        newTrackList.splice(lineIndex, 1);
      }
      if (newTrackList.length === 1 && newTrackList[0].list.length === 0) {
        return { trackList: [] };
      }
      return { trackList: newTrackList };
    });
  },

  selectTrackById: (id: string) => {
    set((state) => {
      let newLine = -1;
      let newIndex = -1;
      state.trackList.forEach((item, index) => {
        item.list.forEach((trackItem, trackIndex) => {
          if (trackItem.id === id) {
            newLine = index;
            newIndex = trackIndex;
          }
        });
      });
      return {
        selectTrackItem: {
          line: newLine,
          index: newIndex,
        },
      };
    });
  },

  addTrack: (newItem: Track) => {
    set((state) => {
      const newTrackList = [...state.trackList];
      const lines = newTrackList.filter((line) => line.type === newItem.type);

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const { hasOverlap, insertIndex } = checkTrackListOverlap(
          line.list,
          newItem
        );
        if (!hasOverlap) {
          newTrackList[index] = {
            ...newTrackList[index],
            list: [...newTrackList[index].list],
          };
          newTrackList[index].list.splice(insertIndex, 0, newItem);
          return {
            trackList: newTrackList,
            selectTrackItem: {
              line: index,
              index: insertIndex,
            },
          };
        }
      }

      if (["audio"].includes(newItem.type)) {
        return {
          trackList: [...newTrackList, { type: newItem.type, list: [newItem] }],
          selectTrackItem: {
            line: newTrackList.length,
            index: 0,
          },
        };
      } else {
        return {
          trackList: [{ type: newItem.type, list: [newItem] }, ...newTrackList],
          selectTrackItem: {
            line: 0,
            index: 0,
          },
        };
      }
    });
  },
}));

// 选择器
export const useSelectedResource = () =>
  useTrackStore((state: TrackState) => {
    if (state.selectTrackItem.line === -1) return null;
    return (
      state.trackList[state.selectTrackItem.line]?.list[
        state.selectTrackItem.index
      ] || null
    );
  });

export const useFrameCount = () =>
  useTrackStore((state: TrackState) =>
    state.trackList.reduce((res, { list }) => {
      return Math.max(
        list.reduce((max, track) => Math.max(max, track.end), 0),
        res
      );
    }, 0)
  );
