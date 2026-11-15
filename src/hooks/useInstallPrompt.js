/**
 * useInstallPrompt
 * Path: src/hooks/useInstallPrompt.js
 *
 * { canInstall, installed, install } from src/lib/installPrompt.js.
 */
import { useSyncExternalStore } from 'react';
import { getInstallState, promptInstall, subscribeInstall } from '../lib/installPrompt';

export function useInstallPrompt() {
  const state = useSyncExternalStore(subscribeInstall, getInstallState, getInstallState);
  return { ...state, install: promptInstall };
}
