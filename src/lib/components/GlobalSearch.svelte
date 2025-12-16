<script lang="ts">
    import { goto } from "$app/navigation";
    import { openProductModal } from "$lib/stores/selectedProduct";
    import { addToast } from "$lib/stores/toastStore";

    interface SearchResult {
        itemCode: string;
        description: string | null;
        price: number;
        weight: number;
        stock: number;
        stockStatus: "in_stock" | "low_stock" | "out_of_stock";
    }

    let {
        variant = "default",
        placeholder = "Search products by code or description...",
    } = $props<{
        variant?: "default" | "large";
        placeholder?: string;
    }>();

    let query = $state("");
    let results = $state<SearchResult[]>([]);
    let isOpen = $state(false);
    let isLoading = $state(false);
    let selectedIndex = $state(-1);
    let inputElement: HTMLInputElement;
    let debounceTimer: ReturnType<typeof setTimeout>;

    function handleInput() {
        clearTimeout(debounceTimer);
        selectedIndex = -1;

        if (!query.trim()) {
            results = [];
            isOpen = false;
            return;
        }

        debounceTimer = setTimeout(async () => {
            await search();
        }, 300);
    }

    async function search() {
        if (!query.trim()) return;

        isLoading = true;
        isOpen = true;

        try {
            const response = await fetch(
                `/api/products?search=${encodeURIComponent(query)}&limit=8`,
            );
            const data = await response.json();

            if (data.items) {
                results = data.items.map(
                    (item: {
                        itemCode: string;
                        timbaDescription?: string | null;
                        supplierDescription?: string | null;
                        sellingPriceUnit: number;
                        netUnitWeightKg: number;
                        stockQuantity: number;
                        stockStatus: "in_stock" | "low_stock" | "out_of_stock";
                    }) => ({
                        itemCode: item.itemCode,
                        description:
                            item.timbaDescription ?? item.supplierDescription,
                        price: item.sellingPriceUnit,
                        weight: item.netUnitWeightKg,
                        stock: item.stockQuantity,
                        stockStatus: item.stockStatus,
                    }),
                );
            }
        } catch (error) {
            console.error("Search error:", error);
            results = [];
        } finally {
            isLoading = false;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!isOpen || results.length === 0) {
            if (e.key === "Escape") {
                closeDropdown();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
                break;
            case "ArrowUp":
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                break;
            case "Enter":
                e.preventDefault();
                const selected = results[selectedIndex];
                if (selectedIndex >= 0 && selected) {
                    selectResult(selected);
                }
                break;
            case "Escape":
                closeDropdown();
                break;
        }
    }

    function selectResult(result: SearchResult) {
        openProductModal(result.itemCode);
        closeDropdown();
    }

    function addToOffer(result: SearchResult, e: MouseEvent) {
        e.stopPropagation();
        // Navigate to offer page with product pre-selected
        goto(`/offer?add=${result.itemCode}`);
        closeDropdown();
        addToast(`${result.itemCode} ready to add to offer`, "success");
    }

    function closeDropdown() {
        isOpen = false;
        selectedIndex = -1;
    }

    function handleFocus() {
        if (results.length > 0) {
            isOpen = true;
        }
    }

    function handleClickOutside(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest(".global-search")) {
            closeDropdown();
        }
    }

    function getStockBadgeClass(status: string): string {
        switch (status) {
            case "in_stock":
                return "badge-success";
            case "low_stock":
                return "badge-warning";
            case "out_of_stock":
                return "badge-error";
            default:
                return "";
        }
    }

    function getStockLabel(status: string): string {
        switch (status) {
            case "in_stock":
                return "In Stock";
            case "low_stock":
                return "Low";
            case "out_of_stock":
                return "Out";
            default:
                return "";
        }
    }
</script>

<svelte:document onclick={handleClickOutside} />

<div class="global-search" class:large={variant === "large"}>
    <div class="search-input-wrapper">
        <span class="search-icon">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        </span>
        <input
            type="text"
            class="search-input"
            {placeholder}
            bind:value={query}
            bind:this={inputElement}
            oninput={handleInput}
            onkeydown={handleKeydown}
            onfocus={handleFocus}
        />
        {#if query}
            <button
                class="search-clear"
                onclick={() => {
                    query = "";
                    results = [];
                    isOpen = false;
                }}
            >
                ✕
            </button>
        {/if}
        {#if isLoading}
            <div class="search-spinner"></div>
        {/if}
    </div>

    {#if isOpen}
        <div class="search-dropdown">
            {#if results.length > 0}
                <ul class="results-list">
                    {#each results as result, index}
                        <li
                            class="result-item"
                            class:selected={index === selectedIndex}
                            onclick={() => selectResult(result)}
                            onmouseenter={() => (selectedIndex = index)}
                            role="option"
                            aria-selected={index === selectedIndex}
                        >
                            <div class="result-main">
                                <span class="result-code"
                                    >{result.itemCode}</span
                                >
                                <span class="result-description"
                                    >{result.description ??
                                        "No description"}</span
                                >
                            </div>
                            <div class="result-details">
                                <span class="result-price"
                                    >£{result.price.toFixed(2)}</span
                                >
                                <span class="result-weight"
                                    >{result.weight.toFixed(3)}kg</span
                                >
                                <span
                                    class="result-stock {getStockBadgeClass(
                                        result.stockStatus,
                                    )}"
                                >
                                    {result.stock}
                                    {getStockLabel(result.stockStatus)}
                                </span>
                            </div>
                            <button
                                class="add-to-offer-btn"
                                onclick={(e) => addToOffer(result, e)}
                                title="Add to Quick Offer"
                            >
                                + Offer
                            </button>
                        </li>
                    {/each}
                </ul>
            {:else if !isLoading}
                <div class="no-results">
                    <span>No products found for "{query}"</span>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .global-search {
        position: relative;
        width: 100%;
        max-width: 480px;
    }

    .global-search.large {
        max-width: 100%;
    }

    .global-search.large .search-input {
        padding: 16px 48px 16px 52px;
        font-size: 16px;
    }

    .global-search.large .search-icon {
        left: 20px;
        width: 22px;
        height: 22px;
    }

    .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .search-icon {
        position: absolute;
        left: 14px;
        width: 18px;
        height: 18px;
        color: var(--color-text-secondary);
        pointer-events: none;
    }

    .search-input {
        width: 100%;
        padding: 12px 40px 12px 44px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        font-family: var(--font-body);
        font-size: 14px;
        color: var(--color-text);
        background: var(--color-surface);
        transition: all 0.15s ease-out;
    }

    .search-input::placeholder {
        color: var(--color-text-secondary);
    }

    .search-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(57, 158, 162, 0.1);
    }

    .search-clear {
        position: absolute;
        right: 12px;
        padding: 4px;
        background: none;
        border: none;
        font-size: 12px;
        color: var(--color-text-secondary);
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.15s ease-out;
    }

    .search-clear:hover {
        color: var(--color-text);
        background: var(--color-bg);
    }

    .search-spinner {
        position: absolute;
        right: 36px;
        width: 16px;
        height: 16px;
        border: 2px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .search-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        box-shadow: 0 12px 24px rgba(26, 32, 44, 0.15);
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .results-list {
        list-style: none;
        margin: 0;
        padding: 8px;
    }

    .result-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 12px;
        align-items: center;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.15s ease-out;
    }

    .result-item:hover,
    .result-item.selected {
        background: var(--color-accent-light);
    }

    .result-main {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .result-code {
        font-family: "JetBrains Mono", monospace;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-accent);
    }

    .result-description {
        font-size: 13px;
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .result-details {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .result-price {
        font-family: "JetBrains Mono", monospace;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
    }

    .result-weight {
        font-size: 12px;
        color: var(--color-text-secondary);
    }

    .result-stock {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .badge-success {
        background: #d1fae5;
        color: #059669;
    }

    .badge-warning {
        background: #fef3c7;
        color: #d97706;
    }

    .badge-error {
        background: #fee2e2;
        color: #dc2626;
    }

    .add-to-offer-btn {
        padding: 6px 12px;
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease-out;
        white-space: nowrap;
    }

    .add-to-offer-btn:hover {
        background: var(--color-accent);
        transform: scale(1.05);
    }

    .no-results {
        padding: 24px;
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 14px;
    }

    @media (max-width: 640px) {
        .result-item {
            grid-template-columns: 1fr;
            gap: 8px;
        }

        .result-details {
            flex-wrap: wrap;
        }

        .add-to-offer-btn {
            width: 100%;
        }
    }
</style>
