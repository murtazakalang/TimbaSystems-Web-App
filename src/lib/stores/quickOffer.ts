import { writable, derived, get } from 'svelte/store';
import type { OfferItem, OfferProductSearchResult } from '$lib/types/offer';
import { browser } from '$app/environment';

const STORAGE_KEY = 'timba_quick_offer';

// Helper to load from localStorage
function loadFromStorage(): OfferItem[] {
    if (!browser) return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Helper to save to localStorage
function saveToStorage(items: OfferItem[]): void {
    if (!browser) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        console.error('Failed to save offer to localStorage');
    }
}

// Main store for offer items
function createOfferStore() {
    const { subscribe, set, update } = writable<OfferItem[]>(loadFromStorage());

    // Subscribe to changes and persist to localStorage
    subscribe((items) => {
        saveToStorage(items);
    });

    return {
        subscribe,

        /**
         * Add a product to the offer
         */
        addItem(product: OfferProductSearchResult, quantity: number): void {
            update((items) => {
                // Check if item already exists
                const existingIndex = items.findIndex((i) => i.itemCode === product.itemCode);

                if (existingIndex >= 0) {
                    // Update quantity of existing item
                    const existing = items[existingIndex]!;
                    const newQuantity = existing.quantity + quantity;
                    const updatedItem: OfferItem = {
                        ...existing,
                        quantity: newQuantity,
                        lineTotal: product.price * newQuantity,
                        lineWeight: product.weight * newQuantity,
                    };
                    return [
                        ...items.slice(0, existingIndex),
                        updatedItem,
                        ...items.slice(existingIndex + 1),
                    ];
                }

                // Add new item
                const newItem: OfferItem = {
                    itemCode: product.itemCode,
                    description: product.description ?? product.itemCode,
                    unitPrice: product.price,
                    quantity,
                    lineTotal: product.price * quantity,
                    weight: product.weight,
                    lineWeight: product.weight * quantity,
                    stockAvailable: product.stock,
                    available: product.stock >= quantity,
                };
                return [...items, newItem];
            });
        },

        /**
         * Remove an item from the offer
         */
        removeItem(code: string): void {
            update((items) => items.filter((i) => i.itemCode !== code));
        },

        /**
         * Update quantity for an item
         */
        updateQuantity(code: string, newQuantity: number): void {
            if (newQuantity < 1) return;
            update((items) =>
                items.map((item) => {
                    if (item.itemCode !== code) return item;
                    return {
                        ...item,
                        quantity: newQuantity,
                        lineTotal: item.unitPrice * newQuantity,
                        lineWeight: item.weight * newQuantity,
                        available: item.stockAvailable >= newQuantity,
                    };
                })
            );
        },

        /**
         * Clear all items from the offer
         */
        clearOffer(): void {
            set([]);
        },

        /**
         * Load items from a saved offer
         */
        loadItems(items: OfferItem[]): void {
            set(items);
        },

        /**
         * Get current items (for PDF generation, etc.)
         */
        getItems(): OfferItem[] {
            return get({ subscribe });
        },
    };
}

// Create the store
export const offerItems = createOfferStore();

// Derived store for total item count
export const itemCount = derived(offerItems, ($items) => $items.length);

// Derived store for total weight
export const totalWeight = derived(offerItems, ($items) =>
    $items.reduce((sum, item) => sum + item.lineWeight, 0)
);

// Derived store for grand total
export const grandTotal = derived(offerItems, ($items) =>
    $items.reduce((sum, item) => sum + item.lineTotal, 0)
);

// Derived store for availability summary
export const availabilitySummary = derived(offerItems, ($items) => ({
    availableCount: $items.filter((i) => i.available).length,
    unavailableCount: $items.filter((i) => !i.available).length,
    hasUnavailable: $items.some((i) => !i.available),
}));

// Shipping cost store (user editable)
export const shippingCost = writable<number>(0);

// Helper function to format offer as text for clipboard
export function formatOfferAsText(
    items: OfferItem[],
    total: number,
    weight: number
): string {
    const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    let text = `TIMBA SYSTEMS - QUOTATION\nDate: ${date}\n\n`;
    text += '─'.repeat(60) + '\n';
    text += 'Code          Description                    Price    Qty   Total\n';
    text += '─'.repeat(60) + '\n';

    for (const item of items) {
        const code = item.itemCode.padEnd(12);
        const desc = (item.description.length > 28
            ? item.description.slice(0, 25) + '...'
            : item.description
        ).padEnd(30);
        const price = `£${item.unitPrice.toFixed(2)}`.padStart(8);
        const qty = item.quantity.toString().padStart(5);
        const lineTotal = `£${item.lineTotal.toFixed(2)}`.padStart(8);
        text += `${code}  ${desc}  ${price}  ${qty}  ${lineTotal}\n`;
    }

    text += '─'.repeat(60) + '\n';
    text += `${''.padEnd(46)}Weight: ${weight.toFixed(2)} kg\n`;
    text += `${''.padEnd(46)}TOTAL:  £${total.toFixed(2)}\n`;

    return text;
}
