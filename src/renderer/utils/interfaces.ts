export interface MESSAGE {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  streaming?: boolean;
  images?: SELECTED_IMAGE[];
}

export interface SETTINGS {
  lastModelName: string;
  lastConversation: CONVERSATION;
  modelOptions: MODEL_OPTIONS;
}

export interface CONVERSATION {
  uid: string;
  messages: MESSAGE[];
  timestamp: number;
  modelName: string;
}

export interface MODEL_OPTIONS {
  temperature: number;
  top_p: number;
  repeat_penalty: number;
}

export interface MODEL {
  digest: string;
  name: string;
  model: string;
  modified_at: string;
  size: number;
}

export interface SELECTED_IMAGE {
  base64: string;
  path: string;
}
