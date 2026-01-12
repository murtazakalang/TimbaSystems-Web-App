<script lang="ts">
    import Modal from "$lib/components/ui/Modal.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import {
        selectedProduct,
        isProductModalOpen,
        isProductLoading,
        productError,
        closeProductModal,
        updateSelectedProduct,
    } from "$lib/stores/selectedProduct";
    import { addToast } from "$lib/stores/toastStore";

    interface Props {
        onUpdated?: () => void;
    }

    let { onUpdated }: Props = $props();

    // Local editable state
    let editedMargin: number = $state(25);
    let isSaving = $state(false);

    // Computed selling price based on margin
    let computedSellingPrice = $derived(() => {
        if (!$selectedProduct) return 0;
        const trueCost =
            Number($selectedProduct.trueCostGBP) ||
            Number($selectedProduct.costGBP) ||
            0;
        const margin = editedMargin ?? Number($selectedProduct.marginPct) ?? 25;
        if (margin >= 100) return trueCost; // Prevent division by zero
        return trueCost / (1 - margin / 100);
    });

    // Initialize local state when product changes
    $effect(() => {
        if ($selectedProduct) {
            editedMargin = $selectedProduct.marginPct
                ? Number($selectedProduct.marginPct)
                : 25;
        }
    });

    function formatPrice(value: number | unknown): string {
        const num = Number(value);
        if (isNaN(num)) return "£0.00";
        return `£${num.toFixed(2)}`;
    }

    function formatPercent(value: number | unknown): string {
        const num = Number(value);
        if (isNaN(num)) return "0%";
        return `${num.toFixed(0)}%`;
    }

    function formatWeight(value: unknown): string {
        const num = Number(value);
        if (isNaN(num)) return "0 kg";
        return `${num.toFixed(3)} kg`;
    }

    function getStockBadgeVariant(
        qty: number,
    ): "success" | "warning" | "error" {
        if (qty === 0) return "error";
        if (qty <= 50) return "warning";
        return "success";
    }

    function getStockLabel(qty: number): string {
        if (qty === 0) return "Out of Stock";
        if (qty <= 50) return "Low Stock";
        return "In Stock";
    }

    async function handleSave() {
        if (!$selectedProduct) return;

        isSaving = true;

        const updates: Record<string, unknown> = {};

        // Only save margin if changed
        if (editedMargin !== Number($selectedProduct.marginPct)) {
            updates.marginPct = editedMargin;
            // Also update the selling price based on new margin
            updates.sellingPriceUnit = computedSellingPrice();
        }

        if (Object.keys(updates).length === 0) {
            addToast("No changes to save", "info");
            isSaving = false;
            return;
        }

        const success = await updateSelectedProduct(
            $selectedProduct.itemCode,
            updates,
        );

        if (success) {
            addToast("Product updated successfully", "success");
            onUpdated?.();
        } else {
            addToast($productError || "Failed to update product", "error");
        }

        isSaving = false;
    }

    function handleClose() {
        closeProductModal();
    }
</script>

<Modal open={$isProductModalOpen} onclose={handleClose} size="md">
    {#if $isProductLoading && !$selectedProduct}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading product details...</p>
        </div>
    {:else if $productError && !$selectedProduct}
        <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{$productError}</p>
            <Button variant="secondary" onclick={handleClose}>Close</Button>
        </div>
    {:else if $selectedProduct}
        <!-- Header -->
        <div class="product-header">
            <h2>Product Details</h2>
            <span class="product-code">{$selectedProduct.itemCode}</span>
        </div>

        <!-- Product Information -->
        <section class="info-section">
            <h3>Product Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <label>Code</label>
                    <span class="code-value">{$selectedProduct.itemCode}</span>
                </div>
                <div class="info-item">
                    <label>Unity</label>
                    <span>{$selectedProduct.piecesPerPackage || 1}</span>
                </div>
                <div class="info-item full-width">
                    <label>Description</label>
                    <span
                        >{$selectedProduct.supplierDescription ||
                            $selectedProduct.timbaDescription ||
                            "-"}</span
                    >
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section class="info-section">
            <h3>Pricing</h3>
            <div class="pricing-grid">
                <div class="pricing-item">
                    <label>Price List (Unity)</label>
                    <span class="price-value">
                        {formatPrice(
                            ($selectedProduct.piecesPerPackage || 1) *
                                Number($selectedProduct.priceListGBP || 0),
                        )}
                    </span>
                    <span class="price-note">
                        {$selectedProduct.piecesPerPackage || 1} × {formatPrice(
                            $selectedProduct.priceListGBP,
                        )}
                    </span>
                </div>
                <div class="pricing-item editable">
                    <label>Margin %</label>
                    <input
                        type="number"
                        class="margin-input"
                        bind:value={editedMargin}
                        min="0"
                        max="99"
                    />
                </div>
                <div class="pricing-item highlight">
                    <label>Selling Price (£)</label>
                    <span class="price-value large"
                        >{formatPrice(computedSellingPrice())}</span
                    >
                </div>
            </div>
        </section>

        <!-- Inventory & Weight Section -->
        <section class="info-section">
            <h3>Inventory & Weight</h3>
            <div class="inventory-grid">
                <div class="inventory-item">
                    <label>Stock Quantity</label>
                    <div class="stock-display">
                        <span class="stock-qty">
                            {$selectedProduct.stock?.quantityAvailable ?? 0}
                        </span>
                        <Badge
                            variant={getStockBadgeVariant(
                                $selectedProduct.stock?.quantityAvailable ?? 0,
                            )}
                        >
                            {getStockLabel(
                                $selectedProduct.stock?.quantityAvailable ?? 0,
                            )}
                        </Badge>
                    </div>
                </div>
                <div class="inventory-item">
                    <label>Weight (kg)</label>
                    <span class="weight"
                        >{formatWeight($selectedProduct.netUnitWeightKg)}</span
                    >
                </div>
            </div>
        </section>

        <!-- Action Buttons -->
        <div class="modal-actions">
            <Button variant="secondary" onclick={handleClose}>Cancel</Button>
            <Button
                variant="primary"
                onclick={handleSave}
                loading={isSaving}
                disabled={$isProductLoading || isSaving}
            >
                Save Changes
            </Button>
        </div>
    {/if}

    {#snippet footer()}
        <!-- Footer content rendered via snippet if needed -->
    {/snippet}
</Modal>

<style>
    .product-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-5);
        padding-bottom: var(--space-4);
        border-bottom: 1px solid var(--color-border);
    }

    .product-header h2 {
        margin: 0;
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: var(--font-semibold);
    }

    .product-code {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--color-accent);
        background: var(--color-accent-light);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
    }

    .loading-state,
    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-8);
        gap: var(--space-3);
        color: var(--color-text-secondary);
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .error-icon {
        font-size: 48px;
    }

    .info-section {
        margin-bottom: var(--space-5);
    }

    .info-section h3 {
        font-family: var(--font-display);
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        text-transform: uppercase;
        letter-spacing: 0.02em;
        color: var(--color-text-secondary);
        margin: 0 0 var(--space-3) 0;
    }

    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .info-item.full-width {
        grid-column: span 2;
    }

    .info-item label {
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.01em;
    }

    .info-item span {
        font-size: var(--text-sm);
        color: var(--color-text);
    }

    .code-value {
        font-family: var(--font-mono);
        color: var(--color-accent) !important;
        font-weight: var(--font-medium);
    }

    /* Pricing Section */
    .pricing-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: var(--space-3);
    }

    .pricing-item {
        background: var(--color-bg);
        padding: var(--space-3);
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .pricing-item label {
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
        text-transform: uppercase;
    }

    .pricing-item.editable {
        background: var(--color-accent-light);
        border: 2px dashed var(--color-accent);
    }

    .pricing-item.highlight {
        background: var(--color-primary);
        color: white;
    }

    .pricing-item.highlight label {
        color: rgba(255, 255, 255, 0.8);
    }

    .price-value {
        font-family: var(--font-mono);
        font-size: var(--text-base);
        font-weight: var(--font-medium);
    }

    .price-value.large {
        font-size: var(--text-xl);
    }

    .price-note {
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
        font-family: var(--font-mono);
    }

    .margin-input {
        width: 100%;
        padding: var(--space-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-family: var(--font-mono);
        font-size: var(--text-base);
        text-align: center;
    }

    .margin-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px var(--color-accent-light);
    }

    /* Inventory Section */
    .inventory-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);
    }

    .inventory-item {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
    }

    .inventory-item label {
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
        text-transform: uppercase;
    }

    .stock-display {
        display: flex;
        align-items: center;
        gap: var(--space-2);
    }

    .stock-qty {
        font-family: var(--font-mono);
        font-size: var(--text-xl);
        font-weight: var(--font-semibold);
    }

    .weight {
        font-family: var(--font-mono);
        font-size: var(--text-base);
    }

    /* Action Buttons */
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        margin-top: var(--space-5);
        padding-top: var(--space-4);
        border-top: 1px solid var(--color-border);
    }

    @media (max-width: 600px) {
        .pricing-grid,
        .inventory-grid,
        .info-grid {
            grid-template-columns: 1fr;
        }

        .info-item.full-width {
            grid-column: span 1;
        }
    }
</style>
