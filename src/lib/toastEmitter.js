/**
 * Module-level event emitter for global toast notifications.
 *
 * Usage:
 *   - Call toastEmitter.emit(message, severity) from anywhere (e.g. api.js)
 *     to show a toast without needing React context.
 *   - ToastProvider registers itself as the listener on mount.
 */

let _listener = null;

export const toastEmitter = {
  register(fn) {
    _listener = fn;
  },
  emit(message, severity = "error") {
    if (_listener) _listener(message, severity);
  },
};
