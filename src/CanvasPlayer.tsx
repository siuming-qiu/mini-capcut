import { useEffect, useRef, useState } from "react";
import { usePlayerStore, useTrackStore } from "@/hooks";

const CanvasPlayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerContext, setPlayerContext] =
    useState<ImageBitmapRenderingContext | null>(null);
  const { playerConfig, playStartFrame, ingLoadingCount } = usePlayerStore();
  const trackState = useTrackStore();

  // 初始化 context
  useEffect(() => {
    if (canvasRef.current) {
      setPlayerContext(canvasRef.current.getContext("bitmaprenderer"));
    }
  }, []);

  // 监听变化并重新渲染
  useEffect(() => {
    if (ingLoadingCount !== 0) return;
    drawCanvas();
  }, [trackState.trackList, playStartFrame]);

  // 绘制方法
  const drawCanvas = async () => {
    const offCanvas = new OffscreenCanvas(
      playerConfig.playerWidth,
      playerConfig.playerHeight
    );
    const ctx = offCanvas.getContext("2d");
    const videoList: Array<() => Promise<boolean | void>> = [];

    trackState.trackList.forEach(({ list }) => {
      const trackItem = list.find((item: Record<string, any>) => {
        return (
          playStartFrame >= item.start &&
          playStartFrame <= item.end &&
          !["audio"].includes(item.type)
        );
      });
      console.log("trackItem=>", trackItem);

      trackItem &&
        videoList.unshift(() =>
          drawToRenderCanvas(ctx!, trackItem, playStartFrame)
        );
    });

    for (const nextPromise of videoList) {
      await nextPromise();
    }
    await drawToPlayerCanvas(offCanvas);
  };

  // 预渲染canvas
  const drawToRenderCanvas = (
    ctx: OffscreenCanvasRenderingContext2D,
    trackItem: Record<string, any>,
    frameIndex: number
  ) => {
    return trackItem
      .draw(
        ctx,
        {
          width: playerConfig.playerWidth,
          height: playerConfig.playerHeight,
        },
        frameIndex
      )
      .then(() => true);
  };

  // 渲染到播放器
  const drawToPlayerCanvas = async (canvas: OffscreenCanvas) => {
    if (playerContext) {
      playerContext.transferFromImageBitmap(canvas.transferToImageBitmap());
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={playerConfig.playerWidth}
      height={playerConfig.playerHeight}
    />
  );
};
export default CanvasPlayer;
