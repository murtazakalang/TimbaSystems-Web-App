<script lang="ts">
    import ProductSearchAdd from "$lib/components/offer/ProductSearchAdd.svelte";
    import OfferItemsTable from "$lib/components/offer/OfferItemsTable.svelte";
    import OfferSummary from "$lib/components/offer/OfferSummary.svelte";
    import { itemCount, grandTotal, totalWeight } from "$lib/stores/quickOffer";
    import { onMount } from "svelte";

    const count = $derived($itemCount);

    // Keyboard shortcuts
    function handleKeydown(event: KeyboardEvent) {
        // Ctrl+P for print
        if ((event.ctrlKey || event.metaKey) && event.key === "p") {
            event.preventDefault();
            // Trigger PDF generation via clicking the button
            const pdfButton = document.querySelector(
                '[data-action="generate-pdf"]',
            ) as HTMLButtonElement | null;
            pdfButton?.click();
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<svelte:head>
    <title>Quick Offer | Timba Systems</title>
</svelte:head>

<div class="offer-page">
    <header class="page-header">
        <div class="header-content">
            <h1>📋 Quick Offer</h1>
            <p class="subtitle">
                Build your quotation quickly. Search products, add quantities,
                and generate a professional quote.
            </p>
        </div>
        {#if count > 0}
            <div class="header-stats">
                <span class="stat-pill"
                    >{count} item{count !== 1 ? "s" : ""}</span
                >
                <span class="stat-pill weight"
                    >{$totalWeight.toFixed(1)} kg</span
                >
                <span class="stat-pill total">£{$grandTotal.toFixed(2)}</span>
            </div>
        {/if}
    </header>

    <div class="search-section">
        <ProductSearchAdd />
    </div>

    <div class="main-content">
        <div class="items-section">
            <OfferItemsTable />
        </div>
        <aside class="summary-section">
            <OfferSummary />
        </aside>
    </div>

    <div class="keyboard-hints">
        <span class="hint">
            <kbd>Enter</kbd> Add item
        </span>
        <span class="hint">
            <kbd>Esc</kbd> Clear search
        </span>
        <span class="hint">
            <kbd>Ctrl</kbd>+<kbd>P</kbd> Print PDF
        </span>
    </div>
</div>

<style>
    .offer-page {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
        min-height: 100%;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
    }

    .header-content h1 {
        font-family: "DM Sans", sans-serif;
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
        letter-spacing: -0.02em;
    }

    .subtitle {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 6px 0 0;
    }

    .header-stats {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
    }

    .stat-pill {
        padding: 8px 14px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 20px;
        font-size: 13px;
        color: var(--color-text-secondary);
    }

    .stat-pill.weight {
        font-family: "JetBrains Mono", monospace;
        font-weight: 500;
    }

    .stat-pill.total {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
        font-family: "JetBrains Mono", monospace;
        font-weight: 600;
    }

    .search-section {
        /* No additional styles needed */
    }

    .main-content {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 24px;
        flex: 1;
        align-items: start;
    }

    .items-section {
        min-height: 400px;
    }

    .summary-section {
        position: sticky;
        top: 24px;
    }

    .keyboard-hints {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 16px;
        background: var(--color-surface);
        border-radius: 8px;
        margin-top: auto;
    }

    .hint {
        font-size: 12px;
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        gap: 6px;
    }

    kbd {
        display: inline-block;
        padding: 3px 6px;
        font-family: "JetBrains Mono", monospace;
        font-size: 11px;
        color: var(--color-text);
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
        .main-content {
            grid-template-columns: 1fr;
        }

        .summary-section {
            position: static;
        }

        .page-header {
            flex-direction: column;
        }

        .header-stats {
            flex-wrap: wrap;
        }
    }

    @media (max-width: 640px) {
        .offer-page {
            padding: 16px;
        }

        .keyboard-hints {
            display: none;
        }
    }
</style>
