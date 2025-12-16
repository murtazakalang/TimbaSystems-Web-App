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
    let editedMarkup: number | null = $state(null);
    let editedTransportCost: number | null = $state(null);
    let editedTimbaDescription: string = $state("");
    let isSaving = $state(false);

    // Initialize local state when product changes
    $effect(() => {
        if ($selectedProduct) {
            editedMarkup = $selectedProduct.markupPct
                ? Number($selectedProduct.markupPct)
                : null;
            editedTransportCost = $selectedProduct.transportCost
                ? Number($selectedProduct.transportCost)
                : null;
            editedTimbaDescription = $selectedProduct.timbaDescription || "";
        }
    });

    function formatPrice(value: unknown): string {
        const num = Number(value);
        if (isNaN(num)) return "£0.00";
        return `£${num.toFixed(2)}`;
    }

    function formatPercent(value: unknown): string {
        const num = Number(value);
        if (isNaN(num)) return "0%";
        return `${num.toFixed(1)}%`;
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

        if (
            editedMarkup !== null &&
            editedMarkup !== Number($selectedProduct.markupPct)
        ) {
            updates.markupPct = editedMarkup;
        }
        if (
            editedTransportCost !== null &&
            editedTransportCost !== Number($selectedProduct.transportCost)
        ) {
            updates.transportCost = editedTransportCost;
        }
        if (
            editedTimbaDescription !== ($selectedProduct.timbaDescription || "")
        ) {
            updates.timbaDescription = editedTimbaDescription;
        }

        if (Object.keys(updates).length === 0) {
            addToast({ type: "info", message: "No changes to save" });
            isSaving = false;
            return;
        }

        const success = await updateSelectedProduct(
            $selectedProduct.itemCode,
            updates,
        );

        if (success) {
            addToast({
                type: "success",
                message: "Product updated successfully",
            });
            onUpdated?.();
        } else {
            addToast({
                type: "error",
                message: $productError || "Failed to update product",
            });
        }

        isSaving = false;
    }

    function handleClose() {
        closeProductModal();
    }
</script>

<Modal open={$isProductModalOpen} onclose={handleClose} size="lg">
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

        <!-- Basic Info Section -->
        <section class="info-section">
            <h3>Product Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <label>Item Code</label>
                    <span class="code-value">{$selectedProduct.itemCode}</span>
                </div>
                <div class="info-item">
                    <label>Product Group</label>
                    <span>{$selectedProduct.productGroup || "-"}</span>
                </div>
                <div class="info-item full-width">
                    <label>Supplier Description</label>
                    <span>{$selectedProduct.supplierDescription || "-"}</span>
                </div>
                <div class="info-item">
                    <label>Brand</label>
                    <span>{$selectedProduct.brand || "-"}</span>
                </div>
                <div class="info-item">
                    <label>Pieces per Package</label>
                    <span>{$selectedProduct.piecesPerPackage || "-"}</span>
                </div>
            </div>
        </section>

        <!-- Editable Fields Section -->
        <section class="info-section editable-section">
            <h3>Editable Fields</h3>
            <div class="info-grid editable-grid">
                <div class="info-item">
                    <Input
                        label="TIMBA Description"
                        bind:value={editedTimbaDescription}
                        placeholder="Custom product description"
                    />
                </div>
                <div class="info-item">
                    <Input
                        label="Markup %"
                        type="number"
                        bind:value={editedMarkup}
                    />
                </div>
                <div class="info-item">
                    <Input
                        label="Transport Cost (£)"
                        type="number"
                        bind:value={editedTransportCost}
                    />
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section class="info-section pricing-section">
            <h3>Pricing Breakdown</h3>
            <div class="pricing-grid">
                <div class="pricing-item">
                    <label>Price List (GBP)</label>
                    <span class="price"
                        >{formatPrice($selectedProduct.priceListGbp)}</span
                    >
                </div>
                <div class="pricing-item">
                    <label>Discount 1</label>
                    <span>{formatPercent($selectedProduct.discount1Pct)}</span>
                </div>
                <div class="pricing-item">
                    <label>Discount 2</label>
                    <span>{formatPercent($selectedProduct.discount2Pct)}</span>
                </div>
                <div class="pricing-item">
                    <label>Unit Discounted Price</label>
                    <span class="price"
                        >{formatPrice(
                            $selectedProduct.unitDiscountedPrice,
                        )}</span
                    >
                </div>
                <div class="pricing-item highlight">
                    <label>Margin %</label>
                    <span class="price"
                        >{formatPercent($selectedProduct.marginPct)}</span
                    >
                </div>
                <div class="pricing-item highlight primary">
                    <label>Selling Price (Unit)</label>
                    <span class="price large"
                        >{formatPrice($selectedProduct.sellingPriceUnit)}</span
                    >
                </div>
                <div class="pricing-item highlight">
                    <label>Selling Price (Box)</label>
                    <span class="price"
                        >{formatPrice($selectedProduct.sellingPriceBox)}</span
                    >
                </div>
            </div>
        </section>

        <!-- Inventory & Weight Section -->
        <section class="info-section inventory-section">
            <h3>Inventory & Weight</h3>
            <div class="inventory-grid">
                <div class="inventory-item stock-item">
                    <label>Current Stock</label>
                    <div class="stock-display">
                        <span class="stock-qty"
                            >{$selectedProduct.stock?.quantityAvailable ??
                                0}</span
                        >
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
                    <label>Unit Weight</label>
                    <span class="weight"
                        >{formatWeight($selectedProduct.netUnitWeightKg)}</span
                    >
                </div>
                <div class="inventory-item">
                    <label>Box Weight</label>
                    <span class="weight"
                        >{formatWeight($selectedProduct.weightPerBoxKg)}</span
                    >
                </div>
            </div>
        </section>

        <!-- Additional Info -->
        <section class="info-section">
            <h3>Additional Information</h3>
            <div class="info-grid small">
                <div class="info-item">
                    <label>HS Code</label>
                    <span class="code-value"
                        >{$selectedProduct.hsCode || "-"}</span
                    >
                </div>
                <div class="info-item">
                    <label>EAN Code</label>
                    <span class="code-value"
                        >{$selectedProduct.eanCode || "-"}</span
                    >
                </div>
                <div class="info-item">
                    <label>Diameter</label>
                    <span>{$selectedProduct.diameter || "-"}</span>
                </div>
                <div class="info-item">
                    <label>Length</label>
                    <span>{$selectedProduct.length || "-"}</span>
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
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--space-4);
        margin-bottom: var(--space-4);
    }

    .info-section:last-of-type {
        border-bottom: none;
        padding-bottom: 0;
        margin-bottom: 0;
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
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
    }

    .info-grid.small {
        grid-template-columns: repeat(4, 1fr);
    }

    .editable-grid {
        grid-template-columns: 1fr 1fr 1fr;
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
    }

    /* Pricing Section */
    .pricing-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
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

    .pricing-item .price {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        font-weight: var(--font-medium);
    }

    .pricing-item.highlight {
        background: var(--color-accent-light);
    }

    .pricing-item.primary {
        background: var(--color-accent);
        color: white;
    }

    .pricing-item.primary label {
        color: rgba(255, 255, 255, 0.8);
    }

    .pricing-item.primary .price {
        color: white;
    }

    .pricing-item .price.large {
        font-size: var(--text-lg);
    }

    /* Inventory Section */
    .inventory-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-3);
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
        font-size: var(--text-sm);
    }

    /* Editable Section */
    .editable-section {
        background: var(--color-accent-light);
        margin: 0 calc(var(--space-6) * -1);
        padding: var(--space-4) var(--space-6);
        border-radius: 0;
        border: none;
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

    @media (max-width: 768px) {
        .info-grid,
        .info-grid.small,
        .pricing-grid,
        .inventory-grid {
            grid-template-columns: 1fr 1fr;
        }

        .editable-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
