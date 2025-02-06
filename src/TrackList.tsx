import { useMemo } from "react";
import { useTrackStore } from "./hooks";
import { VideoSource } from "@/class/VideoTrack";
import { getGridPixel } from "@/utils/canvas";
import { formatTime } from "@/utils/base";
import VideoItem from "./components/VideoItem";

function TrackList() {
  const store = useTrackStore();
  const trackScale = store.trackScale;
  const showTrackList = useMemo(() => {
    return store.trackList.map((line) => {
      const newList = line.list.map((item) => {
        const { duration: time } = item.source as VideoSource;
        return {
          ...item,
          showWidth: `${getGridPixel(trackScale, item.end - item.start)}px`,
          showLeft: `${getGridPixel(trackScale, item.start)}px`,
          time: line.type === "video" ? `${formatTime(time || 0).str}` : "",
        };
      });
      return {
        ...line,
        list: newList,
      };
    });
  }, [store.trackList]);
  return (
    <div>
      {showTrackList[0] && <VideoItem trackItem={showTrackList[0].list[0]} />}
    </div>
  );
}

export default TrackList;
