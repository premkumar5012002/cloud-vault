"use client";

import {
  IconX,
  IconCheck,
  IconChevronUp,
  IconChevronDown,
  IconExclamationMark,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button, CircularProgress, useDisclosure } from "@nextui-org/react";

import { formatSize, formatUploadedSize } from "@/lib/utils";

import { UploadItem, useUploadStore } from "@/store/upload";

import { CancelUploadModal } from "./Modals/UploadCancelModal";

export const UploadTrackerOverlay = () => {
  const { items, clear } = useUploadStore();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const toggleIsCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  let remaining = 0;

  let isUploadCompleted = true;

  items.forEach((item) => {
    if (item.status === "uploading" || item.status === "pending") {
      remaining += 1;
      if (isUploadCompleted) isUploadCompleted = false;
    }
  });

  const onCloseButton = () => {
    if (isUploadCompleted) {
      clear();
    } else {
      onOpen();
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <div className="fixed shadow z-10 bottom-0 md:right-4 w-full md:w-[460px] bg-default-50 rounded-t-md border-x border-t border-divider">
        <div className="py-2.5 px-4 flex items-center justify-between border-b border-divider">
          <span className="font-medium">
            {isUploadCompleted
              ? "Upload Completed"
              : `Uploading files (${remaining})`}
          </span>
          <div className="space-x-2">
            <Button isIconOnly variant="light" onClick={toggleIsCollapsed}>
              {isCollapsed ? (
                <IconChevronDown size={18} />
              ) : (
                <IconChevronUp size={18} />
              )}
            </Button>
            <Button isIconOnly variant="light" onClick={onCloseButton}>
              <IconX size={18} />
            </Button>
          </div>
        </div>
        {isCollapsed === true && (
          <div className="px-4 py-6 space-y-8 overflow-y-scroll max-h-96">
            {items.map((item) => (
              <UploadTrackerItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      <CancelUploadModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

const UploadTrackerItem = ({ item }: { item: UploadItem }) => {
  const onCancel = () => item.request?.abort();

  // const Icon = formatFileType(item.file.name);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {/* {<Icon size={30} />} */}
        <div className="w-full overflow-hidden">
          <p className="truncate">{item.file.name}</p>
          <UploadStatus item={item} />
        </div>
        {item.status === "uploading" && (
          <CircularProgress
            onClick={onCancel}
            value={item.progress}
            showValueLabel={true}
            valueLabel={<IconX size={16} />}
          />
        )}
        {item.status === "pending" && (
          <CircularProgress
            onClick={onCancel}
            value={item.progress}
            showValueLabel={true}
            valueLabel={<IconX size={16} />}
          />
        )}
        {item.status === "done" && (
          <CircularProgress
            color="success"
            value={item.progress}
            showValueLabel={true}
            valueLabel={<IconCheck size={16} className="text-success" />}
          />
        )}
        {item.status === "error" && (
          <CircularProgress
            color="danger"
            value={100}
            showValueLabel={true}
            valueLabel={
              <IconExclamationMark size={16} className="text-danger" />
            }
          />
        )}
        {item.status === "abort" && (
          <CircularProgress
            color="danger"
            value={100}
            showValueLabel={true}
            valueLabel={
              <IconExclamationMark size={16} className="text-danger" />
            }
          />
        )}
      </div>
    </div>
  );
};

const UploadStatus = ({ item }: { item: UploadItem }) => {
  const totalSize = formatSize(item.file.size);

  switch (item.status) {
    case "uploading": {
      const uploadedSize = formatUploadedSize(item.progress, item.file.size);
      return (
        <span className="text-sm text-default-500">
          {uploadedSize + " / " + totalSize}
        </span>
      );
    }

    case "pending": {
      return (
        <div className="flex items-center gap-3 text-sm text-default-500">
          <span>Pending</span>
          <div className="w-1 h-1 bg-default-400 rounded-full" />
          <span>{totalSize}</span>
        </div>
      );
    }

    case "done": {
      return (
        <div className="flex items-center gap-3 text-sm text-default-500">
          <span className="text-success font-medium">Uploaded</span>
          <div className="w-1 h-1 bg-default-400 rounded-full" />
          <span>{totalSize}</span>
        </div>
      );
    }

    case "error": {
      return (
        <div className="flex items-center gap-3 text-sm text-default-500">
          <span className="text-danger font-medium">Upload Failed</span>
          <div className="w-1 h-1 bg-default-400 rounded-full" />
          <span>{totalSize}</span>
        </div>
      );
    }

    case "abort": {
      return (
        <div className="flex items-center gap-3 text-sm text-default-500">
          <span className="text-danger font-medium">Aborted</span>
          <div className="w-1 h-1 bg-default-400 rounded-full" />
          <span>{totalSize}</span>
        </div>
      );
    }
  }
};
