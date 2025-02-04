import { FileText, ImageUp, Music, Video } from "lucide-react";
import { selectFile } from "./utils/file";
import { getMD5 } from "./class/Base";
import { imageDecoder } from "./utils/webcodesc";
import { ImageSource, ImageTrack } from "./class/ImageTrack";
import { usePlayerStore, useTrackStore } from "./hooks";

export default function Uploader() {
  const { playerConfig, playStartFrame } = usePlayerStore();
  const { addTrack } = useTrackStore();
  const uploadList = [
    {
      name: "图片",
      type: "image",
      icon: <ImageUp />,
    },
    {
      name: "视频",
      type: "video",
      icon: <Video />,
    },
    {
      name: "音频",
      type: "audio",
      icon: <Music />,
    },
    {
      name: "文字",
      type: "text",
      icon: <FileText />,
    },
  ];
  const handleUpload = async () => {
    const files = await selectFile({
      accept: "image/*",
      multiple: true,
    });
    const file = files[0];
    const id = await getMD5(await file.arrayBuffer());
    const frames = await imageDecoder.decode({
      id,
      stream: file.stream(),
      type: file.type,
    });
    if (!frames) {
      // 提示解析视频失败
      console.error("解析图片失败");
      return;
    }

    // 获取文件相关信息
    const imageSource: ImageSource = {
      id,
      url: id,
      name: files[0].name,
      format: files[0].type,
      width: frames[0].codedWidth,
      height: frames[0].codedHeight,
    };
    const imageTrack = new ImageTrack(imageSource, playStartFrame);
    imageTrack.resize({
      width: playerConfig.playerWidth,
      height: playerConfig.playerHeight,
    });

    // const url = await uploadFile(files[0]);
    addTrack(imageTrack);
  };
  return (
    <div className="flex flex-col gap-4 w-16">
      {/* {uploadList.map((item) => (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {item.icon}
          </div>
          <div className="text-sm">{item.name}</div>
        </div>
      ))} */}
      <div onClick={handleUpload}>上传图片</div>
    </div>
  );
}
