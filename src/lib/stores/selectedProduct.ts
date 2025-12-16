import { writable, derived, get } from 'svelte/store';
import type { ProductWithStock } from '$lib/types/product';

// Store for the currently selected product
export const selectedProduct = writable<ProductWithStock | null>(null);

// Store for modal open/close state
export const isProductModalOpen = writable<boolean>(false);

// Loading state for async operations
export const isProductLoading = writable<boolean>(false);

// Error state
export const productError = writable<string | null>(null);

/**
 * Open the product detail modal and fetch product data
 */
export async function openProductModal(code: string): Promise<void> {
    isProductLoading.set(true);
    productError.set(null);
    isProductModalOpen.set(true);

    try {
        const response = await fetch(`/api/products/${encodeURIComponent(code)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const product = await response.json();
        selectedProduct.set(product);
    } catch (error) {
        productError.set(error instanceof Error ? error.message : 'Unknown error');
        selectedProduct.set(null);
    } finally {
        isProductLoading.set(false);
    }
}

/**
 * Close the product detail modal
 */
export function closeProductModal(): void {
    isProductModalOpen.set(false);
    // Clear product after animation completes
    setTimeout(() => {
        selectedProduct.set(null);
        productError.set(null);
    }, 300);
}

/**
 * Update the selected product
 */
export async function updateSelectedProduct(
    code: string,
    updates: Record<string, unknown>
): Promise<boolean> {
    isProductLoading.set(true);
    productError.set(null);

    try {
        const response = await fetch(`/api/products/${encodeURIComponent(code)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update product');
        }

        const updatedProduct = await response.json();

        // Merge updated fields with current product
        const current = get(selectedProduct);
        if (current) {
            selectedProduct.set({
                ...current,
                ...updatedProduct,
            });
        }

        return true;
    } catch (error) {
        productError.set(error instanceof Error ? error.message : 'Unknown error');
        return false;
    } finally {
        isProductLoading.set(false);
    }
}

// Derived store for checking if we have a valid product loaded
export const hasProduct = derived(selectedProduct, ($product) => $product !== null);
