<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import { offerItems } from "$lib/stores/quickOffer";
    import type { OfferProductSearchResult } from "$lib/types/offer";

    let searchQuery = $state("");
    let searchResults = $state<OfferProductSearchResult[]>([]);
    let searching = $state(false);
    let showResults = $state(false);
    let quantity = $state(1);
    let selectedProduct = $state<OfferProductSearchResult | null>(null);

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
                `/api/products?search=${encodeURIComponent(query)}&limit=8`,
            );
            if (response.ok) {
                const data = await response.json();
                searchResults = data.items.map(
                    (item: {
                        itemCode: string;
                        timbaDescription: string | null;
                        supplierDescription: string | null;
                        sellingPriceUnit: number;
                        netUnitWeightKg: number;
                        stockQuantity: number;
                        stockStatus: "in_stock" | "low_stock" | "out_of_stock";
                    }): OfferProductSearchResult => ({
                        itemCode: item.itemCode,
                        description:
                            item.timbaDescription ?? item.supplierDescription,
                        price: item.sellingPriceUnit,
                        weight: item.netUnitWeightKg,
                        stock: item.stockQuantity,
                        stockStatus: item.stockStatus,
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

    function selectProduct(product: OfferProductSearchResult) {
        selectedProduct = product;
        searchQuery = product.itemCode;
        showResults = false;
        quantity = 1;
    }

    function handleAddItem() {
        if (!selectedProduct) return;

        offerItems.addItem(selectedProduct, quantity);

        // Reset form
        searchQuery = "";
        selectedProduct = null;
        quantity = 1;
        searchResults = [];

        // Focus search input for next entry
        setTimeout(() => {
            searchInputRef?.focus();
        }, 100);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && selectedProduct) {
            event.preventDefault();
            handleAddItem();
        } else if (event.key === "Escape") {
            searchQuery = "";
            selectedProduct = null;
            searchResults = [];
            showResults = false;
        }
    }

    function getStockBadgeVariant(
        status: "in_stock" | "low_stock" | "out_of_stock",
    ): "success" | "warning" | "error" {
        if (status === "in_stock") return "success";
        if (status === "low_stock") return "warning";
        return "error";
    }
</script>

<div class="product-search-add" onkeydown={handleKeydown}>
    <div class="search-section">
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
            {#if searching}
                <div class="search-spinner">🔄</div>
            {/if}

            {#if showResults && searchResults.length > 0}
                <div class="search-results">
                    {#each searchResults as result}
                        <button
                            type="button"
                            class="result-item"
                            onclick={() => selectProduct(result)}
                        >
                            <div class="result-main">
                                <span class="result-code">{result.itemCode}</span>
                                <span class="result-desc"
                                    >{result.description ?? "No description"}</span
                                >
                            </div>
                            <div class="result-meta">
                                <span class="result-price"
                                    >£{result.price.toFixed(2)}</span
                                >
                                <Badge variant={getStockBadgeVariant(result.stockStatus)}>
                                    {result.stock}
                                </Badge>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    {#if selectedProduct}
        <div class="add-section">
            <div class="selected-info">
                <span class="selected-code">{selectedProduct.itemCode}</span>
                <span class="selected-price"
                    >£{selectedProduct.price.toFixed(2)}</span
                >
                <span class="selected-stock">{selectedProduct.stock} in stock</span>
            </div>
            <div class="quantity-add">
                <label class="qty-label" for="add-quantity">Qty:</label>
                <input
                    id="add-quantity"
                    type="number"
                    class="qty-input"
                    min="1"
                    bind:value={quantity}
                />
                <Button variant="primary" onclick={handleAddItem}>
                    ➕ Add
                </Button>
            </div>
        </div>
    {/if}
</div>

<style>
    .product-search-add {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 20px;
        box-shadow: var(--shadow-md);
    }

    .search-section {
        position: relative;
    }

    .search-container {
        position: relative;
    }

    .search-spinner {
        position: absolute;
        right: 12px;
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

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 100;
        max-height: 320px;
        overflow-y: auto;
        margin-top: 4px;
    }

    .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: none;
        cursor: pointer;
        text-align: left;
        border-bottom: 1px solid var(--color-border);
        transition: background-color var(--duration-fast) var(--ease-out);
    }

    .result-item:last-child {
        border-bottom: none;
    }

    .result-item:hover {
        background: var(--color-accent-light);
    }

    .result-main {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    }

    .result-code {
        font-family: "JetBrains Mono", monospace;
        font-weight: 500;
        color: var(--color-text);
    }

    .result-desc {
        font-size: 13px;
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .result-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: 16px;
    }

    .result-price {
        font-family: "JetBrains Mono", monospace;
        font-weight: 500;
        color: var(--color-accent);
    }

    .add-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--color-border);
    }

    .selected-info {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .selected-code {
        font-family: "JetBrains Mono", monospace;
        font-weight: 600;
        font-size: 15px;
        color: var(--color-text);
    }

    .selected-price {
        font-family: "JetBrains Mono", monospace;
        color: var(--color-accent);
        font-size: 15px;
    }

    .selected-stock {
        font-size: 13px;
        color: var(--color-text-secondary);
    }

    .quantity-add {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .qty-label {
        font-size: 14px;
        color: var(--color-text-secondary);
    }

    .qty-input {
        width: 70px;
        padding: 8px 12px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        font-family: "JetBrains Mono", monospace;
        font-size: 14px;
        text-align: center;
    }

    .qty-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(57, 158, 162, 0.15);
    }
</style>
