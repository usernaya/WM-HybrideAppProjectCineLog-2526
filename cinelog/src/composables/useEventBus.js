// src/composables/useEventBus.js
import { onUnmounted } from "vue";

// bus event for inter-component communication

const listeners = new Map(); // eventName: set of handlers

function getSet(eventName) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  return listeners.get(eventName);
}

export function useEventBus() {
  function emit(eventName, payload = null) {
    const set = getSet(eventName);
    set.forEach((handler) => {
      try {
        handler(payload);
      } catch (e) {
        console.error("EventBus handler error:", e);
      }
    });
  }

  function on(eventName, handler) {
    const set = getSet(eventName);
    set.add(handler);

    // return function to unsubscribe
    return () => {
      set.delete(handler);
    };
  }

  return { emit, on };
}

// helper to auto-unsubscribe on unmount
export function useBusListener(eventName, handler) {
  const bus = useEventBus();
  const off = bus.on(eventName, handler);
  onUnmounted(off);
  return off;
}
