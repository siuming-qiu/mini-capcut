import { useEffect, useRef, useState } from "react";
import { drawTimeLine, getSelectFrame } from "@/utils/canvas";
import type { UserConfig, CanvasConfig } from "@/utils/canvas";

interface TimeLineProps {
  start?: number; // 开始坐标
  step?: number; // 步进，与视频fps同步
  scale?: number; // 时间轴缩放比例
  focusPosition?: {
    start: number; // 起始帧数
    end: number; // 结束帧数
    frameCount: number; // 总帧数
  };
  onSelectFrame?: (frameIndex: number) => void;
}

const TimeLine: React.FC<TimeLineProps> = ({
  start = 0,
  step = 30,
  scale = 0,
  focusPosition = { start: 0, end: 0, frameCount: 0 },
  onSelectFrame,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const canvasConfigs = {
    bgColor: "#374151",
    ratio: window.devicePixelRatio || 1,
    textSize: 12,
    textScale: 0.83,
    lineWidth: 1,
    textBaseline: "middle" as CanvasTextBaseline,
    textAlign: "center" as CanvasTextAlign,
    longColor: "#E5E7EB",
    shortColor: "#9CA3AF",
    textColor: "#E5E7EB",
    subTextColor: "#9CA3AF",
    focusColor: "#6D28D9",
  };

  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const setCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    contextRef.current = context;
    context.font = `${
      canvasConfigs.textSize * canvasConfigs.ratio
    }px -apple-system, ".SFNSText-Regular", "SF UI Text", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", "WenQuanYi Zen Hei", "Microsoft YaHei", Arial, sans-serif`;
    context.lineWidth = canvasConfigs.lineWidth;
    context.textBaseline = canvasConfigs.textBaseline;
    context.textAlign = canvasConfigs.textAlign;
  };

  const updateTimeLine = () => {
    if (!contextRef.current) return;
    const userConfig: UserConfig = { start, step, scale, focusPosition };
    const canvasConfig: CanvasConfig = { ...canvasSize, ...canvasConfigs };
    drawTimeLine(contextRef.current, userConfig, canvasConfig);
  };

  const setCanvasRect = () => {
    if (!canvasContainerRef.current) return;
    const { width, height } =
      canvasContainerRef.current.getBoundingClientRect();
    setCanvasSize({
      width: width * canvasConfigs.ratio,
      height: height * canvasConfigs.ratio,
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const offset = event.nativeEvent.offsetX;
    const frameIndex = getSelectFrame(start + offset, scale, step);
    onSelectFrame?.(frameIndex);
  };

  useEffect(() => {
    setCanvasRect();
    const handleResize = () => setCanvasRect();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCanvasContext();
    updateTimeLine();
  }, [canvasSize]);

  useEffect(() => {
    updateTimeLine();
  }, [canvasConfigs, start, step, scale, focusPosition]);

  const canvasStyle = {
    width: `${canvasSize.width / canvasConfigs.ratio}px`,
    height: `${canvasSize.height / canvasConfigs.ratio}px`,
  };

  return (
    <div
      ref={canvasContainerRef}
      className="sticky top-0 left-0 right-0 h-5 text-center leading-5 text-sm z-20"
    >
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleClick}
      />
    </div>
  );
};

export default TimeLine;
