export const baseSystemPrompt =
  "Your name is Alpha. You are Lorem's helpful AI assistant. Treat me like an expert, and please don't be too wordy with your responses";

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


export const voices = [
  {
    name: "Alba",
    file: "en_GB-alba-medium.onnx"
  },
  {
    name: "Kristin",
    file: "en_US-kristin-medium.onnx"
  },
  {
    name: "Joe",
    file: "en_US-joe-medium.onnx"
  },
  {
    name: "Arctic",
    file: "en_US-arctic-medium.onnx"
  },
  {
    name: "Jenny",
    file: "en_GB-jenny_dioco-medium.onnx"
  },
  {
    name: "Cori",
    file: "en_GB-cori-high.onnx"
  }
]