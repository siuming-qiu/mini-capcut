import type { Track, TrackLineItem } from "@/class/Track";
import { VideoTrack } from "@/class/VideoTrack";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

declare class ImageDecoder {
  constructor(init: { type: string; data: ReadableStream<Uint8Array> });
  completed: Promise<void>;
  tracks: {
    ready: Promise<void>;
    selectedTrack?: { frameCount: number };
  };
  decode(options: { frameIndex: number }): Promise<{ image: VideoFrame }>;
}

/**
 * 解码图像流，返回一个视频帧数组。
 *
 * @param stream - 包含图像数据的可读流。
 * @param type - 图像的 MIME 类型，例如 'image/jpeg'。
 *
 * @returns 返回一个 Promise，该 Promise 在解码完成后解析为 {@link VideoFrame} 数组。
 *
 * @see [解码动图](https://bilibili.github.io/WebAV/demo/1_3-decode-image)
 *
 * @example
 *
 * const frames = await decodeImg(
 *   (await fetch('<gif url>')).body!,
 *   `image/gif`,
 * );
 */

export async function decodeImg(
  stream: ReadableStream<Uint8Array>,
  type: string
): Promise<VideoFrame[]> {
  const init = {
    type,
    data: stream,
  };
  const imageDecoder = new ImageDecoder(init);

  await Promise.all([imageDecoder.completed, imageDecoder.tracks.ready]);

  let frameCnt = imageDecoder.tracks.selectedTrack?.frameCount ?? 1;

  const rs: VideoFrame[] = [];
  for (let i = 0; i < frameCnt; i += 1) {
    rs.push((await imageDecoder.decode({ frameIndex: i })).image);
  }
  return rs;
}

export function checkTrackListOverlap(
  trackList: Track[],
  checkItem: Track,
  moveIndex = -1
) {
  const { start: insertStart, end: insertEnd } = checkItem;
  let overLapIndex = -1;
  let insertIndex = 0;
  const hasOverlap = trackList.some((trackItem, index) => {
    if (moveIndex !== -1 && index === moveIndex) {
      // 行内移动情况下忽略掉移动元素
      return false;
    }
    const { start, end } = trackItem;
    // 当前列表中元素 开始帧处于新元素内部，或结束帧处于新元素内部，则视为重叠
    if (
      (start <= insertStart && end >= insertEnd) || // 添加节点的开始和结束位置位于老节点外 或 两端相等
      (start >= insertStart && start < insertEnd) || // 老节点开始位置在添加节点内部
      (end > insertStart && end <= insertEnd) // 老节点结束位置在添加节点内部
    ) {
      overLapIndex = index;
      return true;
    } else {
      if (end <= insertStart) {
        insertIndex = index + 1;
      }
      return false;
    }
  });
  return {
    hasOverlap,
    overLapIndex,
    insertIndex,
  };
}

export function formatPlayerTime(frameCount: number) {
  let f = Math.round(frameCount % 30);
  frameCount = Math.floor(frameCount / 30);
  let s = frameCount % 60;
  frameCount = Math.floor(frameCount / 60);
  let m = frameCount % 60;
  frameCount = Math.floor(frameCount / 60);
  let h = frameCount;
  return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${
    s < 10 ? "0" : ""
  }${s}:${f < 10 ? "0" : ""}${f}`;
}

/**
 * 精确计时器
 * @param callback
 * @param interval
 * @returns
 */
export function preciseInterval(callback: () => void, interval: number) {
  let expected = performance.now() + interval;
  let stop = false;

  function step(timestamp: number) {
    if (stop) return;

    if (timestamp >= expected) {
      callback();
      // 累积期望的时间，以保持精确的间隔
      expected += interval;
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  // 返回一个对象包含取消方法
  return {
    cancel: () => {
      stop = true;
    },
  };
}

export function isOfCanPlayType(value: unknown): value is VideoTrack {
  return value instanceof VideoTrack;
}

type TypeGuard<T> = (value: unknown) => value is T;

export const getCurrentTrackItemList = <T>(
  trackList: TrackLineItem[],
  currentFrame: number,
  isOfType: TypeGuard<T>
): T[] => {
  const trackItems: T[] = [];
  trackList.forEach(({ list }) => {
    list.forEach((trackItem) => {
      const { start, end } = trackItem;
      if (start <= currentFrame && end >= currentFrame && isOfType(trackItem)) {
        trackItems.push(trackItem);
      }
    });
  });
  return trackItems;
};
/**
 *  时间格式化
 * */
export function formatTime(time: number) {
  let second = Math.ceil(time / 1000);
  const s = second % 60;
  second = Math.floor(second / 60);
  const m = second % 60;
  second = Math.floor(second / 60);
  const h = second % 60;
  return {
    s,
    m,
    h,
    str: `${h === 0 ? "" : `${h < 10 ? "0" : ""}${h}:`}${
      m < 10 ? "0" : ""
    }${m}:${s < 10 ? "0" : ""}${s}`,
  };
}
