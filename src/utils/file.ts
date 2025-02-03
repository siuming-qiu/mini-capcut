interface FileUploadOptions {
  accept: string;
  multiple: boolean;
  max?: string;
}
/**
 * 比较文件大小，第一个参数为文件大小，为纯数字，第二个参数为目标大小，是一个数字+单位的字符串，如'1MB'
 * @param size
 * @param target
 */
export const compareSize = (size: number, target: string): boolean => {
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = sizes.findIndex((item) => item === target.replace(/\d+/, ""));
  return size > parseInt(target) * k ** i;
};

export const selectFile = (options: FileUploadOptions): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    // 创建input[file]元素
    const input = document.createElement("input");
    // 设置相应属性
    input.setAttribute("type", "file");
    input.setAttribute("accept", options.accept);
    if (options.multiple) {
      input.setAttribute("multiple", "multiple");
    } else {
      input.removeAttribute("multiple");
    }
    // 绑定事件
    input.onchange = function (e: Event) {
      const target = e.target as HTMLInputElement;
      const files = target.files ? Array.from(target.files) : [];
      // 获取文件列表
      if (files) {
        const filteredFiles = files.filter((file) => {
          if (options.max) {
            return !compareSize(file.size, options.max);
          }
          return true;
        });
        if (filteredFiles.length > 0) {
          resolve(filteredFiles);
        } else {
          reject(new Error(`上传文件大小不能大于${options.max}`));
        }
      } else {
        reject(new Error("No files selected"));
      }
    };

    input.oncancel = function () {
      reject(new Error("No files selected"));
    };
    input.click();
  });
};
