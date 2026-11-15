let pending = [];

export function setHandoff(files) {
  pending = [...files];
}

// Studio calls this once on mount. It returns the files and clears the queue.
export function takeHandoff() {
  const files = pending;
  pending = [];
  return files;
}