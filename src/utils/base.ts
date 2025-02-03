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
