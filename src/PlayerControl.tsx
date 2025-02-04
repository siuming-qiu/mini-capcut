import { useEffect, useRef, useMemo, useCallback } from "react";
import { Pause, Play } from "lucide-react";
import {
  formatPlayerTime,
  getCurrentTrackItemList,
  isOfCanPlayType,
  preciseInterval,
} from "./utils/base";
import { useFrameCount, usePlayerStore, useTrackStore } from "./hooks";

interface PlayerControlProps {
  disable?: boolean;
}

const PlayerControl: React.FC<PlayerControlProps> = ({ disable = false }) => {
  const playTimer = useRef<any>(null);
  const timeStamp = 1000 / 30;

  const {
    isPause,
    playStartFrame,
    setIsPause,
    addPlayStartFrame,
    setPlayStartFrame,
  } = usePlayerStore();
  const { trackList } = useTrackStore();
  const frameCount = useFrameCount();

  const playTime = useMemo(() => {
    return formatPlayerTime(playStartFrame);
  }, [playStartFrame]);

  const allTime = useMemo(() => formatPlayerTime(frameCount), [frameCount]);

  const pauseVideo = () => {
    if (disable) return;
    setIsPause(true);
    playTimer.current?.cancel();

    const trackItemList = getCurrentTrackItemList(
      trackList,
      playStartFrame,
      isOfCanPlayType
    );
    trackItemList.forEach((item) => {
      item?.pause();
    });
  };

  const startPlay = useCallback(() => {
    if (disable) return;
    if (playStartFrame >= frameCount) {
      setPlayStartFrame(0);
    }
    setIsPause(false);
    playTimer.current?.cancel();
    playTimer.current = preciseInterval(() => {
      addPlayStartFrame();
      const currentPlayStartFrame = usePlayerStore.getState().playStartFrame;
      console.log("playStartFrame=>", currentPlayStartFrame, frameCount);
      if (currentPlayStartFrame + 1 === frameCount) {
        pauseVideo();
      }
    }, timeStamp);
  }, [playStartFrame, frameCount]);

  useEffect(() => {
    if (isPause) {
      pauseVideo();
    }
  }, [isPause]);

  useEffect(() => {
    if (!isPause) {
      const trackItemList = getCurrentTrackItemList(
        trackList,
        playStartFrame,
        isOfCanPlayType
      );
      trackItemList.forEach((item) => {
        item?.play(playStartFrame);
      });
    }
  }, [playStartFrame]);

  return (
    <div className="flex items-center justify-center absolute bottom-0 left-0 right-0 pl-4 pr-4 h-8 border-t dark:border-darker border-gray-300">
      <div className="absolute left-4 h-full text-xs leading-8">
        <span className="text-blue-400 mr-1 w-20 inline-block">{playTime}</span>
        /<span className="ml-2 w-20">{allTime}</span>
      </div>
      <div className="m-auto flex items-center">
        <div
          className={`cursor-pointer box-content ${
            disable ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{ fontSize: "24px" }}
        >
          {!isPause ? (
            <Pause onClick={pauseVideo} />
          ) : (
            <Play onClick={startPlay} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerControl;
