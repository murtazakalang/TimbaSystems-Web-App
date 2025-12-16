/**
 * Toast Store
 * Manages toast notifications globally
 */
import { writable, derived } from 'svelte/store';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number; // ms, 0 for no auto-dismiss
}

const toasts = writable<Toast[]>([]);

// Generate unique ID
function generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add a toast notification
 */
export function addToast(
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 5000
): string {
    const id = generateId();

    toasts.update((current) => [
        ...current,
        { id, type, message, duration }
    ]);

    // Auto-remove is handled in the Toast component via progress bar
    // But we also set a fallback timeout here
    if (duration > 0) {
        setTimeout(() => {
            removeToast(id);
        }, duration + 100); // Small buffer after progress completes
    }

    return id;
}

/**
 * Remove a toast by ID
 */
export function removeToast(id: string): void {
    toasts.update((current) => current.filter((t) => t.id !== id));
}

/**
 * Clear all toasts
 */
export function clearToasts(): void {
    toasts.set([]);
}

// Export the store for subscribing
export const toastStore = {
    subscribe: toasts.subscribe
};

// Convenience methods for specific toast types
export const toast = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration)
};
