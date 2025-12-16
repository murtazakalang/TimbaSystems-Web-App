<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { addToast } from "$lib/stores/toastStore";

    interface ProductResult {
        itemCode: string;
        description: string;
        currentStock: number;
    }

    interface Props {
        onReceived?: (entry: {
            itemCode: string;
            quantity: number;
            newStock: number;
            description: string;
        }) => void;
    }

    let { onReceived }: Props = $props();

    let searchQuery = $state("");
    let searchResults = $state<ProductResult[]>([]);
    let searching = $state(false);
    let showResults = $state(false);

    let selectedProduct = $state<ProductResult | null>(null);
    let quantity = $state<number>(1);
    let notes = $state("");
    let submitting = $state(false);
    let showSuccess = $state(false);

    let searchTimeout: ReturnType<typeof setTimeout>;
    let searchInputRef: HTMLInputElement | null = $state(null);

    async function searchProducts(query: string) {
        if (query.length < 2) {
            searchResults = [];
            return;
        }

        searching = true;
        try {
            const response = await fetch(
                `/api/products?search=${encodeURIComponent(query)}&limit=5`,
            );
            if (response.ok) {
                const data = await response.json();
                searchResults = data.items.map(
                    (p: {
                        itemCode: string;
                        timbaDescription?: string;
                        supplierDescription?: string;
                        stockQuantity: number;
                    }) => ({
                        itemCode: p.itemCode,
                        description:
                            p.timbaDescription ||
                            p.supplierDescription ||
                            p.itemCode,
                        currentStock: p.stockQuantity ?? 0,
                    }),
                );
                showResults = true;
            }
        } catch (error) {
            console.error("Error searching products:", error);
        } finally {
            searching = false;
        }
    }

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;
        selectedProduct = null;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchProducts(searchQuery);
        }, 300);
    }

    function selectProduct(product: ProductResult) {
        selectedProduct = product;
        searchQuery = product.itemCode;
        showResults = false;
        searchResults = [];
    }

    function handleSearchFocus() {
        if (searchResults.length > 0) {
            showResults = true;
        }
    }

    function handleSearchBlur() {
        // Delay hiding to allow click on results
        setTimeout(() => {
            showResults = false;
        }, 200);
    }

    async function handleSubmit() {
        if (!selectedProduct || quantity < 1) return;

        submitting = true;
        try {
            const response = await fetch("/api/stock/receive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemCode: selectedProduct.itemCode,
                    quantity,
                    notes: notes || undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to receive stock");
            }

            const result = await response.json();

            // Show success animation
            showSuccess = true;
            setTimeout(() => {
                showSuccess = false;
            }, 1500);

            addToast({
                message: `Added ${quantity} units to ${selectedProduct.itemCode}`,
                type: "success",
            });

            // Notify parent
            onReceived?.({
                itemCode: selectedProduct.itemCode,
                quantity,
                newStock: result.data.quantityAvailable,
                description: selectedProduct.description,
            });

            // Reset form
            searchQuery = "";
            selectedProduct = null;
            quantity = 1;
            notes = "";
            searchResults = [];

            // Focus search input for next entry
            setTimeout(() => {
                searchInputRef?.focus();
            }, 100);
        } catch (error) {
            console.error("Error receiving stock:", error);
            addToast({
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to receive stock",
                type: "error",
            });
        } finally {
            submitting = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && selectedProduct && quantity > 0) {
            event.preventDefault();
            handleSubmit();
        }
    }
</script>

<div class="receive-form" class:success={showSuccess}>
    <div class="form-section">
        <span class="form-label" id="product-code-label">Product Code</span>
        <div class="search-container">
            <Input
                type="text"
                placeholder="Search by code or description..."
                value={searchQuery}
                oninput={handleSearchInput}
                onfocus={handleSearchFocus}
                onblur={handleSearchBlur}
                bind:ref={searchInputRef}
            />
            {#if showResults && searchResults.length > 0}
                <div class="search-dropdown">
                    {#each searchResults as result}
                        <button
                            type="button"
                            class="search-result"
                            onclick={() => selectProduct(result)}
                        >
                            <span class="result-code">{result.itemCode}</span>
                            <span class="result-desc">{result.description}</span
                            >
                            <span class="result-stock"
                                >Stock: {result.currentStock}</span
                            >
                        </button>
                    {/each}
                </div>
            {/if}
            {#if searching}
                <div class="search-spinner">🔄</div>
            {/if}
        </div>
    </div>

    {#if selectedProduct}
        <div class="product-info">
            <div class="info-row">
                <span class="info-label">Selected:</span>
                <span class="info-value code">{selectedProduct.itemCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Description:</span>
                <span class="info-value">{selectedProduct.description}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Current Stock:</span>
                <span class="info-value stock"
                    >{selectedProduct.currentStock} units</span
                >
            </div>
        </div>

        <div class="form-row">
            <div class="form-section quantity-section">
                <label class="form-label" for="quantity-input"
                    >Quantity to Add</label
                >
                <input
                    id="quantity-input"
                    type="number"
                    class="quantity-input"
                    bind:value={quantity}
                    min="1"
                    onkeydown={handleKeydown}
                />
            </div>

            <div class="form-section notes-section">
                <span class="form-label" id="notes-label">Notes (optional)</span
                >
                <Input
                    type="text"
                    placeholder="e.g., Delivery #1234"
                    value={notes}
                    oninput={(e) =>
                        (notes = (e.target as HTMLInputElement).value)}
                />
            </div>
        </div>

        <div class="form-actions">
            <Button
                variant="primary"
                onclick={handleSubmit}
                disabled={submitting || quantity < 1}
                loading={submitting}
            >
                {#if submitting}
                    Adding...
                {:else}
                    ➕ Add Stock
                {/if}
            </Button>
        </div>
    {:else if searchQuery.length > 0 && !searching && searchResults.length === 0}
        <div class="no-results">
            <span>No products found for "{searchQuery}"</span>
        </div>
    {/if}

    {#if showSuccess}
        <div class="success-overlay">
            <span class="success-icon">✓</span>
        </div>
    {/if}
</div>

<style>
    .receive-form {
        position: relative;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        box-shadow: var(--shadow-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .form-label {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: var(--font-medium);
        color: var(--color-text-secondary);
    }

    .search-container {
        position: relative;
    }

    .search-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 100;
        max-height: 250px;
        overflow-y: auto;
        margin-top: var(--space-1);
    }

    .search-result {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        width: 100%;
        padding: var(--space-3);
        text-align: left;
        background: none;
        border: none;
        border-bottom: 1px solid var(--color-border);
        cursor: pointer;
        transition: background var(--duration-fast) var(--ease-out);
    }

    .search-result:last-child {
        border-bottom: none;
    }

    .search-result:hover {
        background: var(--color-accent-light);
    }

    .result-code {
        font-family: var(--font-mono);
        font-weight: var(--font-medium);
        color: var(--color-accent);
    }

    .result-desc {
        font-size: var(--text-sm);
        color: var(--color-text);
    }

    .result-stock {
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
    }

    .search-spinner {
        position: absolute;
        right: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: translateY(-50%) rotate(0deg);
        }
        to {
            transform: translateY(-50%) rotate(360deg);
        }
    }

    .product-info {
        background: var(--color-accent-light);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    .info-row {
        display: flex;
        gap: var(--space-2);
    }

    .info-label {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        min-width: 100px;
    }

    .info-value {
        font-size: var(--text-sm);
        color: var(--color-text);
    }

    .info-value.code {
        font-family: var(--font-mono);
        font-weight: var(--font-medium);
        color: var(--color-accent);
    }

    .info-value.stock {
        font-family: var(--font-mono);
        font-weight: var(--font-semibold);
    }

    .form-row {
        display: flex;
        gap: var(--space-4);
    }

    .quantity-section {
        flex: 0 0 auto;
    }

    .notes-section {
        flex: 1;
    }

    .quantity-input {
        font-family: var(--font-mono);
        font-size: var(--text-xl);
        font-weight: var(--font-semibold);
        text-align: center;
        width: 100px;
        padding: var(--space-3);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        transition: all var(--duration-fast) var(--ease-out);
    }

    .quantity-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px var(--color-accent-light);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: var(--space-2);
    }

    .no-results {
        text-align: center;
        padding: var(--space-4);
        color: var(--color-text-secondary);
        font-size: var(--text-sm);
    }

    /* Success animation */
    .success-overlay {
        position: absolute;
        inset: 0;
        background: rgba(34, 197, 94, 0.1);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeInOut 1.5s ease-out;
        pointer-events: none;
    }

    .success-icon {
        font-size: 48px;
        color: var(--color-success);
        animation: scaleIn 0.3s ease-out;
    }

    @keyframes fadeInOut {
        0% {
            opacity: 0;
        }
        20% {
            opacity: 1;
        }
        80% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    @keyframes scaleIn {
        0% {
            transform: scale(0);
        }
        100% {
            transform: scale(1);
        }
    }

    @media (max-width: 600px) {
        .form-row {
            flex-direction: column;
        }

        .quantity-input {
            width: 100%;
        }
    }
</style>
