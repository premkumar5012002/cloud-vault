import { createContext } from "react";

import { PerferenceStore } from "@/store/perference";

export const PerferenceContext = createContext<PerferenceStore | null>(null);
