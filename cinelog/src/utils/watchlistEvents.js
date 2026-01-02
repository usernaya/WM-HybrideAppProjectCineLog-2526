// src/utils/watchlistEvents.js
// functions to notify watchlist updates across the app
export function notifyWatchlistUpdated() {
  window.dispatchEvent(new Event("watchlist-updated"));
}
