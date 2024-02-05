import { atom } from "jotai";
import { MODEL } from "./interfaces";

// the name of the current model
export const currentModelNameAtom = atom<string | null>("tinyllama");
// the current model object
export const modelsAtom = atom<MODEL[]>([]);