import { create } from "zustand";
import { createId } from "@paralleldrive/cuid2";

import { client } from "@/trpc/client";
import { AsyncQueue } from "@/lib/helpers/async-queue";

export type UploadItem = {
  id: string;
  file: File;
  progress: number;
  folderId?: string;
  request?: XMLHttpRequest;
  status: "pending" | "uploading" | "done" | "error" | "abort";
};

export type FileItem = {
  id: string;
  file: File;
};

export type FileFolder = {
  id?: string;
  files: FileItem[];
  folders: SubFolder[];
};

export type SubFolder = {
  name: string;
  parentId?: string;
  folders: SubFolder[];
  files: FileItem[];
};

export type UploadStore = {
  items: UploadItem[];
  upload: (files: File[], folderId?: string) => void;
  clear: () => void;
};

const queue = new AsyncQueue(3);

export const useUploadStore = create<UploadStore>((set, state) => ({
  items: [],

  upload: async (files, folderId) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: createId(),
      file: file,
      progress: 0,
      status: "pending",
    }));

    set((state) => ({ items: state.items.concat(newItems) }));

    const folder = organizeFilesByPath(
      newItems.map(({ id, file }) => ({ id, file })),
      folderId
    );

    uploadFolder({
      folder,
      onStart: (id, xhr) => {
        set((prev) => ({
          items: updateItem(id, prev.items, {
            request: xhr,
            status: "uploading",
          }),
        }));
      },
      onProgress: (id, progress) => {
        set((prev) => ({
          items: updateItem(id, prev.items, { progress }),
        }));
      },
      onDone: (id) => {
        set((prev) => ({
          items: updateItem(id, prev.items, {
            status: "done",
            progress: 100,
          }),
        }));
      },
      onAbort: (id) => {
        set((prev) => ({
          items: updateItem(id, prev.items, { status: "abort" }),
        }));
      },
      onError: (id) => {
        set((prev) => ({
          items: updateItem(id, prev.items, { status: "error" }),
        }));
      },
    });
  },

  clear: () => {
    state().items.forEach((item) => item.request?.abort());
    set(() => ({ items: [] }));
  },
}));

const updateItem = (
  id: string,
  items: UploadItem[],
  update: Partial<UploadItem>
) => {
  return items.map((item) => {
    if (item.id === id) return { ...item, ...update };
    return item;
  });
};

export function organizeFilesByPath(files: FileItem[], folderId?: string) {
  const folder: FileFolder = { id: folderId, files: [], folders: [] };

  files.forEach((file) => {
    const pathSegments = file.file.webkitRelativePath.split("/");

    // Removing the file name
    pathSegments.pop();

    let currentFolder = folder;

    pathSegments.forEach((segment) => {
      // Find or create a folder for the current path segment
      const existingFolder = currentFolder.folders.find(
        (folder) => folder.name === segment
      );

      if (existingFolder) {
        currentFolder = existingFolder;
      } else {
        const newFolder = { name: segment, files: [], folders: [] };
        currentFolder.folders.push(newFolder);
        currentFolder = newFolder;
      }
    });

    // Add the file to the current folder
    currentFolder.files.push(file);
  });

  return folder;
}

type UploadFolderParams = {
  folder: FileFolder;
  onDone: (id: string) => void;
  onAbort: (id: string) => void;
  onError: (id: string) => void;
  onStart: (id: string, xhr: XMLHttpRequest) => void;
  onProgress: (id: string, progress: number) => void;
};

async function uploadFolder({
  folder,
  onStart,
  onProgress,
  onDone,
  onAbort,
  onError,
}: UploadFolderParams) {
  folder.files.forEach((item) => {
    queue.enqueue(() =>
      uploadFile({
        item,
        folderId: folder.id,
        onStart,
        onProgress,
        onDone,
        onAbort,
        onError,
      })
    );
  });

  await queue.awaitAll();

  folder.folders.forEach(async (subFolder) => {
    const { name, files, folders, parentId } = subFolder;

    const { id } = await client.folders.new.mutate({
      name: name,
      parentId: parentId,
    });

    const subFolders = folders.map((folder) => ({
      ...folder,
      parentId: id,
    }));

    await uploadFolder({
      folder: {
        id: id,
        files: files,
        folders: subFolders,
      },
      onStart,
      onProgress,
      onDone,
      onAbort,
      onError,
    });
  });
}

type UploadFileParams = {
  item: FileItem;
  folderId?: string;
  onDone: (id: string) => void;
  onAbort: (id: string) => void;
  onError: (id: string) => void;
  onStart: (id: string, xhr: XMLHttpRequest) => void;
  onProgress: (id: string, progress: number) => void;
};

async function uploadFile({
  item,
  folderId,
  onStart,
  onProgress,
  onDone,
  onAbort,
  onError,
}: UploadFileParams): Promise<void> {
  queue.enqueue(async () => {
    await new Promise(async (resolve, reject) => {
      try {
        const url = await client.files.upload.mutate({
          name: item.file.name,
          size: item.file.size,
          folderId,
        });

        const xhr = new XMLHttpRequest();

        xhr.onloadstart = () => {
          onStart(item.id, xhr);
        };

        xhr.upload.onprogress = (e) => {
          onProgress(item.id, (e.loaded / e.total) * 100);
        };

        xhr.open("PUT", url);

        xhr.send(item.file);

        xhr.onload = () => {
          if (xhr.status === 200) {
            onDone(item.id);
            resolve(xhr.status);
          } else {
            onError(item.id);
            reject(xhr.status);
          }
        };

        xhr.onabort = () => {
          onAbort(item.id);
          reject(xhr.status);
        };

        xhr.onerror = () => {
          onError(item.id);
          reject(xhr.status);
        };
      } catch (e) {
        reject();
      }
    });
  });
}
