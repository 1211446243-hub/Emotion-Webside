export class ProviderError extends Error {
  constructor(message: string) { super(message); this.name = "ProviderError"; }
}

export class PromptValidationError extends Error {
  constructor(message: string) { super(message); this.name = "PromptValidationError"; }
}
