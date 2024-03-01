import { useContext } from "react";
import { useStore } from "zustand";

import { PerferenceState } from "@/store/perference";

import { PerferenceContext } from "@/context/perference";

export function usePerferenceContext<T>(
  selector: (state: PerferenceState) => T
): T {
  const store = useContext(PerferenceContext);

  if (store === null)
    throw new Error("Missing PerferenceContext.Provider in the tree");

  return useStore(store, selector);
}
