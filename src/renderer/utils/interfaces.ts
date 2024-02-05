export interface MESSAGE {
  role: "user" | "assistant",
  content: string,
  timestamp: number
}

export interface MODEL {
  digest: string,
  name: string
  model: string,
  modified_at: string,
  size: number,
}