import { create } from "zustand";

export type FolderSelection = {
  id: string;
  name: string;
  isStarred: boolean;
  parentId: string | null;
};

export type FileSelection = {
  id: string;
  name: string;
  isStarred: boolean;
  folderId: string | null;
};

export type Selection = FolderSelection | FileSelection;

export type SelectionStore = {
  selectedFolders: FolderSelection[];
  selectedFiles: FileSelection[];

  addSelectedFile: (file: FileSelection) => void;
  addSelectedFolder: (folder: FolderSelection) => void;

  setSelectedFolders: (folders: FolderSelection[]) => void;
  setSelectedFiles: (files: FileSelection[]) => void;

  clearSelection: () => void;
  removeSelectedFolder: (id: string) => void;
  removeSelectedFile: (id: string) => void;
};

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedFolders: [],

  selectedFiles: [],

  addSelectedFolder: (folder) => {
    set(({ selectedFolders }) => ({
      selectedFolders: selectedFolders.concat(folder),
    }));
  },

  addSelectedFile: (file) => {
    set(({ selectedFiles }) => ({ selectedFiles: selectedFiles.concat(file) }));
  },

  setSelectedFolders: (folders) => set(() => ({ selectedFolders: folders })),

  setSelectedFiles: (files) => set(() => ({ selectedFiles: files })),

  removeSelectedFolder: (id) => {
    set(({ selectedFolders }) => ({
      selectedFolders: selectedFolders.filter(
        (selection) => selection.id !== id
      ),
    }));
  },

  removeSelectedFile: (id) => {
    set(({ selectedFiles }) => ({
      selectedFiles: selectedFiles.filter((selection) => selection.id !== id),
    }));
  },

  clearSelection: () => set(() => ({ selectedFolders: [], selectedFiles: [] })),
}));
