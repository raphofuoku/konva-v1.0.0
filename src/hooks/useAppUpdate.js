/**
 * useAppUpdate
 * Path: src/hooks/useAppUpdate.js
 *
 * { updateReady, apply } where updateReady is true once a newer version of Konva has been
 * downloaded and is waiting, and apply() switches to it and reloads.
 */
import { useSyncExternalStore } from 'react';
import { applyUpdate, getUpdateState, subscribeUpdate } from '../pwa/registerSW';

const SERVER_STATE = { updateReady: false };

export function useAppUpdate() {
  const { updateReady } = useSyncExternalStore(subscribeUpdate, getUpdateState, () => SERVER_STATE);
  return { updateReady, apply: applyUpdate };
}
