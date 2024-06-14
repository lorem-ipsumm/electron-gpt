import { atom } from 'jotai';
import { CONVERSATION, MESSAGE, MODEL, MODEL_OPTIONS, VOICE } from './interfaces';
import { voices } from './utils';

// the name of the current model
export const currentModelNameAtom = atom<string | null>(null);
// the current model object
export const modelsAtom = atom<MODEL[]>([]);
// the type of chat (chat or generate)
export const chatTypeAtom = atom<'chat' | 'generate'>('chat');
// is the settings menu open
export const isSettingsMenuOpenAtom = atom<boolean>(false);
// is the conversations menu open
export const isConversationsMenuOpenAtom = atom<boolean>(false);
// options for the model
export const modelOptionsAtom = atom<MODEL_OPTIONS>({
  temperature: 0.8,
  top_p: 0.9,
  repeat_penalty: 1.1,
});
// data for the current conversation
export const currentConversationAtom = atom<CONVERSATION | null>(null);
// should the message be auto read
export const autoReadAtom = atom<boolean>(true);
// the current voice being used 
export const currentVoiceAtom = atom<VOICE>(voices[0]);
// list of messages in the conversation
export const messagesAtom = atom<MESSAGE[]>([]);
// is the user in private mode (should conversations be stored)
export const privateModeAtom = atom<boolean>(false);