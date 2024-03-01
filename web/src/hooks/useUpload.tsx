import { ChangeEvent } from "react";

import { useUploadStore } from "@/store/upload";

export function useUpload() {
  const { upload } = useUploadStore();

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      upload(Array.from(e.target.files));
    }
  };

  const onUploadFiles = () => {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.multiple = true;
    inputElement.style.display = "none";

    inputElement.addEventListener("change", (e) => handleFileUpload(e as any));

    document.body.appendChild(inputElement);

    inputElement.click();

    document.body.removeChild(inputElement);
  };

  const onUploadFolder = () => {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.multiple = true;
    inputElement.webkitdirectory = true;
    inputElement.style.display = "none";

    inputElement.addEventListener("change", (e) => handleFileUpload(e as any));

    document.body.appendChild(inputElement);

    inputElement.click();

    document.body.removeChild(inputElement);
  };

  return { onUploadFiles, onUploadFolder };
}
