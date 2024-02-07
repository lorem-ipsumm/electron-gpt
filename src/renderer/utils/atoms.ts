import { atom } from "jotai";
import { MODEL } from "./interfaces";

// the name of the current model
export const currentModelNameAtom = atom<string | null>(null);
// the current model object
export const modelsAtom = atom<MODEL[]>([]);
// the type of chat (chat or generate)
export const chatTypeAtom = atom<"chat" | "generate">("chat");
// is the sidebar open
export const isSidebarOpenAtom = atom<boolean>(false);