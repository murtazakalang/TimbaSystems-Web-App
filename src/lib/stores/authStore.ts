/**
 * Auth Store
 * Simple authentication with hardcoded credentials
 */
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AuthState {
    isAuthenticated: boolean;
    user: string | null;
}

const STORAGE_KEY = 'timba_auth';

// Hardcoded credentials
const VALID_EMAIL = 'nad@timbasystems.com';
const VALID_PASSWORD = 'Murtaza@fiverr';

// Initialize from localStorage
function getInitialState(): AuthState {
    if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                // Invalid stored data
            }
        }
    }
    return { isAuthenticated: false, user: null };
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>(getInitialState());

    // Persist to localStorage on change
    if (browser) {
        subscribe((state) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        });
    }

    return {
        subscribe,

        /**
         * Attempt to login with email and password
         * Returns true if successful, false otherwise
         */
        login: (email: string, password: string): boolean => {
            if (email === VALID_EMAIL && password === VALID_PASSWORD) {
                set({ isAuthenticated: true, user: email });
                return true;
            }
            return false;
        },

        /**
         * Logout the current user
         */
        logout: () => {
            set({ isAuthenticated: false, user: null });
        },

        /**
         * Check if user is authenticated
         */
        checkAuth: (): boolean => {
            const state = getInitialState();
            return state.isAuthenticated;
        }
    };
}

export const authStore = createAuthStore();
