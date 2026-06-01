/**
 * Service Worker Registration for Ethio Herd Connect
 * Optimized for Ethiopian farmers with caching and offline support
 */

export function register() {
  // No-op: service worker disabled in dev to avoid Vite HMR conflicts
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    });
  }
}

