import { atom } from "jotai";
import { MODEL, MODEL_OPTIONS } from "./interfaces";

// the name of the current model
export const currentModelNameAtom = atom<string | null>(null);
// the current model object
export const modelsAtom = atom<MODEL[]>([]);
// the type of chat (chat or generate)
export const chatTypeAtom = atom<"chat" | "generate">("chat");
// is the sidebar open
export const isSidebarOpenAtom = atom<boolean>(false);
// options for the model
export const modelOptionsAtom = atom<MODEL_OPTIONS>({
  temperature: 0.8,
  top_p: 0.9,
  repeat_penalty: 1.1
})