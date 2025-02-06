import { useEffect, useRef, useState, useMemo } from "react";
import Loading from "@/components/Loading";
import { videoDecoder } from "@/utils/webcodesc";
import { usePlayerStore } from "@/hooks";

const VideoItem: React.FC<{ trackItem: any }> = ({ trackItem }) => {
  const [loading, setLoading] = useState(true);
  const [imgs, setImgs] = useState<string[]>([]);
  const [containerWidth, setContainerWidth] = useState(100);
  const { updateIngLoadingCount } = usePlayerStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLDivElement>(null);

  const waveStyle = useMemo(() => {
    const { start, end, offsetL, offsetR, frameCount } = trackItem;
    const showFrameCount = end - start;

    return {
      transformOrigin: "left top",
      left: `-${(offsetL / frameCount) * 100}%`,
      right: `-${(offsetR / frameCount) * 100}%`,
      width: `${(frameCount / showFrameCount) * 100}%`,
    };
  }, [trackItem]);

  const getUniformSubarray = (array: string[], m: number) => {
    const interval = array.length / m;
    const subarray: string[] = [];
    for (let i = 0; i < array.length && subarray.length < m; i += interval) {
      subarray.push(array[Math.min(Math.round(i), array.length - 1)]);
    }
    return subarray;
  };

  const thumbnails = useMemo(() => {
    if (imgs.length === 0) return [];
    const { start, end, offsetL, offsetR, frameCount } = trackItem;
    const showFrameCount = end - start;
    return getUniformSubarray(
      imgs,
      Math.ceil((containerWidth * frameCount) / showFrameCount / 50)
    );
  }, [imgs, containerWidth, trackItem]);

  useEffect(() => {
    const initVideo = async () => {
      const { source } = trackItem;
      const start = performance.now();
      const thumbnails = await videoDecoder.thumbnails(source);

      const newImgs = thumbnails?.map(({ img }) => URL.createObjectURL(img));
      setImgs(newImgs ?? []);
      setLoading(false);
      updateIngLoadingCount(-1);
      console.log(
        `生成${thumbnails?.length}张缩略图耗时`,
        performance.now() - start,
        "ms"
      );
    };

    initVideo();
  }, [trackItem?.source]);

  useEffect(() => {
    updateIngLoadingCount(1);
  }, []);

  useEffect(() => {
    if (elRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        setContainerWidth(entry.contentRect.width);
      });

      resizeObserver.observe(elRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => {
      imgs.forEach((item) => {
        URL.revokeObjectURL(item);
      });
    };
  }, [imgs]);

  return (
    <div className="flex flex-col rounded overflow-hidden h-full" ref={elRef}>
      <div className="flex items-center text-xs pl-2 overflow-hidden h-5 leading-5 bg-gray-500 bg-opacity-40 text-gray-200">
        <span className="mr-4 shrink-0">{`${trackItem.name}.${trackItem.format}`}</span>
        <span className="mr-4 shrink-0">{trackItem.time}</span>
      </div>
      <div
        ref={containerRef}
        className="overflow-hidden bg-gray-400 bg-opacity-70 flex flex-1 relative whitespace-nowrap"
        style={waveStyle}
      >
        {thumbnails.map((item, index) => (
          <img
            key={index}
            src={item}
            alt=""
            className="image-item"
            draggable={false}
          />
        ))}
      </div>
      <div className="leading-3 pl-2 overflow-hidden h-3 bg-gray-700 relative"></div>
      {loading && <Loading />}
    </div>
  );
};

export default VideoItem;
