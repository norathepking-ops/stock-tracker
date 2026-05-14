export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Module-level singleton — captured early in PwaRegistration
let _prompt: BeforeInstallPromptEvent | null = null;
const _listeners = new Set<() => void>();

export function capturePrompt(e: BeforeInstallPromptEvent) {
  _prompt = e;
  _listeners.forEach((fn) => fn());
}

export function getPrompt() {
  return _prompt;
}

export function clearPrompt() {
  _prompt = null;
  _listeners.forEach((fn) => fn());
}

export function onPromptChange(fn: () => void): () => void {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
}
