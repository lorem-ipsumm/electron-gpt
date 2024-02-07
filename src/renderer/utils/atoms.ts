import { atom } from "jotai";
import { MODEL } from "./interfaces";

// the name of the current model
export const currentModelNameAtom = atom<string | null>(null);
// the current model object
export const modelsAtom = atom<MODEL[]>([]);