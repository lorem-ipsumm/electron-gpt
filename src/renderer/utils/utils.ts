const baseSystemPrompt =
  "Your name is Blorg. You are Lorem's helpful AI assistant. Treat me like an expert, and please don't be too wordy with your responses";

export const getSystemPrompt = (model: string, prompt: string) => {
  if (model in SYSTEM_PROMPTS) {
    // @ts-ignore
    return SYSTEM_PROMPTS[model](prompt);
  }
  return SYSTEM_PROMPTS['default'](prompt);
};

export const SYSTEM_PROMPTS = {
  'tinyllama:latest': (prompt: string) =>
    `<|im_start|>system\n${baseSystemPrompt}<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant`,
  default: (message: string) => '{{ .System }}\nUSER: {{ .Prompt }}',
};
