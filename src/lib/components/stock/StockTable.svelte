<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { StockWithProduct } from "$lib/types/stock";
    import { addToast } from "$lib/stores/toastStore";

    interface Props {
        stocks?: StockWithProduct[];
        loading?: boolean;
        onStockUpdate?: (itemCode: string, newQuantity: number) => void;
    }

    let { stocks = [], loading = false, onStockUpdate }: Props = $props();

    // Track which rows are being edited
    let editingCode = $state<string | null>(null);
    let editValue = $state<number>(0);
    let savingCode = $state<string | null>(null);

    function formatPrice(price: number): string {
        return `£${price.toFixed(2)}`;
    }

    function formatWeight(weight: number): string {
        return `${weight.toFixed(3)} kg`;
    }

    function getStockBadgeVariant(
        status: string,
    ): "success" | "warning" | "error" {
        switch (status) {
            case "in_stock":
                return "success";
            case "low_stock":
                return "warning";
            case "out_of_stock":
                return "error";
            default:
                return "success";
        }
    }

    function getStockLabel(status: string): string {
        switch (status) {
            case "out_of_stock":
                return "Out";
            case "low_stock":
                return "Low";
            default:
                return "OK";
        }
    }

    function startEditing(stock: StockWithProduct) {
        editingCode = stock.itemCode;
        editValue = stock.quantityAvailable;
    }

    function handleBlur(stock: StockWithProduct) {
        if (editingCode === stock.itemCode) {
            saveQuantity(stock);
        }
    }

    function handleKeydown(event: KeyboardEvent, stock: StockWithProduct) {
        if (event.key === "Enter") {
            event.preventDefault();
            saveQuantity(stock);
        } else if (event.key === "Escape") {
            cancelEditing();
        }
    }

    async function saveQuantity(stock: StockWithProduct) {
        if (editingCode !== stock.itemCode) return;

        // Only save if value changed
        if (editValue === stock.quantityAvailable) {
            editingCode = null;
            return;
        }

        savingCode = stock.itemCode;

        try {
            const response = await fetch(`/api/stock/${stock.itemCode}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quantity: editValue,
                    changeType: "ADJUST",
                    notes: `Manual adjustment from ${stock.quantityAvailable} to ${editValue}`,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update stock");
            }

            addToast({
                message: `Updated ${stock.itemCode} stock to ${editValue}`,
                type: "success",
            });

            // Notify parent to refresh data
            onStockUpdate?.(stock.itemCode, editValue);
        } catch (error) {
            console.error("Error updating stock:", error);
            addToast({
                message: "Failed to update stock",
                type: "error",
            });
        } finally {
            editingCode = null;
            savingCode = null;
        }
    }

    function cancelEditing() {
        editingCode = null;
    }
</script>

<div class="stock-table-container">
    <table class="stock-table">
        <thead>
            <tr>
                <th class="col-code">Code</th>
                <th class="col-description">Description</th>
                <th class="col-qty">Quantity</th>
                <th class="col-status">Status</th>
                <th class="col-price">Selling Price</th>
                <th class="col-weight">Weight</th>
            </tr>
        </thead>
        <tbody>
            {#if loading}
                {#each Array(5) as _}
                    <tr class="skeleton-row">
                        <td><div class="skeleton"></div></td>
                        <td><div class="skeleton skeleton-wide"></div></td>
                        <td><div class="skeleton"></div></td>
                        <td><div class="skeleton"></div></td>
                        <td><div class="skeleton"></div></td>
                        <td><div class="skeleton"></div></td>
                    </tr>
                {/each}
            {:else if stocks.length === 0}
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">📋</span>
                            <p>No stock records found</p>
                            <span class="empty-hint"
                                >Try adjusting your filters</span
                            >
                        </div>
                    </td>
                </tr>
            {:else}
                {#each stocks as stock (stock.itemCode)}
                    <tr
                        class="data-row"
                        class:editing={editingCode === stock.itemCode}
                    >
                        <td class="col-code">
                            <span class="code">{stock.itemCode}</span>
                        </td>
                        <td class="col-description">
                            {stock.description || "-"}
                        </td>
                        <td class="col-qty">
                            {#if editingCode === stock.itemCode}
                                <input
                                    type="number"
                                    class="qty-input"
                                    bind:value={editValue}
                                    onblur={() => handleBlur(stock)}
                                    onkeydown={(e) => handleKeydown(e, stock)}
                                    min="0"
                                    disabled={savingCode === stock.itemCode}
                                />
                            {:else}
                                <button
                                    class="qty-display"
                                    onclick={() => startEditing(stock)}
                                    title="Click to edit"
                                >
                                    {stock.quantityAvailable}
                                </button>
                            {/if}
                        </td>
                        <td class="col-status">
                            <Badge variant={getStockBadgeVariant(stock.status)}>
                                {getStockLabel(stock.status)}
                            </Badge>
                        </td>
                        <td class="col-price">
                            <span class="price"
                                >{formatPrice(stock.sellingPrice)}</span
                            >
                        </td>
                        <td class="col-weight">
                            <span class="weight"
                                >{formatWeight(stock.weight)}</span
                            >
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<style>
    .stock-table-container {
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--shadow-md);
        overflow: hidden;
    }

    .stock-table {
        width: 100%;
        border-collapse: collapse;
    }

    thead {
        position: sticky;
        top: 0;
        z-index: 10;
    }

    th {
        background: var(--color-primary);
        color: white;
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: var(--font-semibold);
        text-transform: uppercase;
        letter-spacing: 0.02em;
        padding: var(--space-3) var(--space-4);
        text-align: left;
        white-space: nowrap;
    }

    td {
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--color-border);
        font-family: var(--font-body);
        font-size: var(--text-sm);
    }

    .data-row {
        transition: background-color var(--duration-fast) var(--ease-out);
    }

    .data-row:nth-child(even) {
        background: #fafbfc;
    }

    .data-row:hover {
        background: var(--color-accent-light);
    }

    .data-row.editing {
        background: var(--color-accent-light);
        box-shadow: inset 3px 0 0 var(--color-accent);
    }

    .col-code {
        width: 120px;
    }

    .col-description {
        min-width: 200px;
    }

    .col-qty {
        width: 100px;
        text-align: center;
    }

    .col-status {
        width: 80px;
        text-align: center;
    }

    .col-price,
    .col-weight {
        width: 110px;
        text-align: right;
    }

    .code {
        font-family: var(--font-mono);
        font-weight: var(--font-medium);
        color: var(--color-accent);
    }

    .price,
    .weight {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
    }

    /* Editable quantity */
    .qty-display {
        font-family: var(--font-mono);
        font-size: var(--text-base);
        font-weight: var(--font-medium);
        background: transparent;
        border: 1px dashed var(--color-border);
        border-radius: 4px;
        padding: var(--space-1) var(--space-2);
        cursor: pointer;
        min-width: 60px;
        transition: all var(--duration-fast) var(--ease-out);
    }

    .qty-display:hover {
        background: var(--color-accent-light);
        border-color: var(--color-accent);
    }

    .qty-input {
        font-family: var(--font-mono);
        font-size: var(--text-base);
        font-weight: var(--font-medium);
        border: 2px solid var(--color-accent);
        border-radius: 4px;
        padding: var(--space-1) var(--space-2);
        width: 70px;
        text-align: center;
        outline: none;
        box-shadow: 0 0 0 3px var(--color-accent-light);
    }

    .qty-input:disabled {
        opacity: 0.6;
    }

    /* Empty state */
    .empty-state {
        padding: var(--space-8) !important;
    }

    .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
        color: var(--color-text-secondary);
    }

    .empty-icon {
        font-size: 48px;
        opacity: 0.5;
    }

    .empty-content p {
        margin: 0;
        font-size: var(--text-base);
        font-weight: var(--font-medium);
    }

    .empty-hint {
        font-size: var(--text-sm);
        opacity: 0.7;
    }

    /* Loading skeleton */
    .skeleton-row td {
        padding: var(--space-4);
    }

    .skeleton {
        height: 16px;
        background: linear-gradient(
            90deg,
            var(--color-border) 25%,
            #f0f0f0 50%,
            var(--color-border) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        width: 80px;
    }

    .skeleton-wide {
        width: 160px;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .col-weight {
            display: none;
        }
    }

    @media (max-width: 600px) {
        .col-price {
            display: none;
        }
    }
</style>
