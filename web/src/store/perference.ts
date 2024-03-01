import { createStore } from "zustand";

import { Sort, View } from "@/types";

interface PerferenceProps {
  view: View;
  sort: Sort;
}

export interface PerferenceState extends PerferenceProps {
  changeView: (view: View) => void;
  changeSort: (sort: Sort) => void;
}

export type PerferenceStore = ReturnType<typeof createPerferenceStore>;

export const createPerferenceStore = (initProps: PerferenceProps) => {
  return createStore<PerferenceState>()((set) => ({
    ...initProps,
    changeView: (view) => set(() => ({ view })),
    changeSort: (sort) => set(() => ({ sort })),
  }));
};
