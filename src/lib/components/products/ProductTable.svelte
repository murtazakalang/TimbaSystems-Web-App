<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { ProductListItem } from "$lib/types/product";

    interface Props {
        products?: ProductListItem[];
        loading?: boolean;
        onRowClick?: (product: ProductListItem) => void;
    }

    let { products = [], loading = false, onRowClick }: Props = $props();

    function handleRowClick(product: ProductListItem) {
        onRowClick?.(product);
    }

    function handleKeydown(event: KeyboardEvent, product: ProductListItem) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleRowClick(product);
        }
    }

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

    function getStockLabel(status: string, qty: number): string {
        switch (status) {
            case "out_of_stock":
                return "Out of Stock";
            case "low_stock":
                return `${qty} (Low)`;
            default:
                return String(qty);
        }
    }
</script>

<div class="product-table-container">
    <table class="product-table">
        <thead>
            <tr>
                <th class="col-code">Code</th>
                <th class="col-description">Description</th>
                <th class="col-price">Price</th>
                <th class="col-stock">Stock</th>
                <th class="col-weight">Weight</th>
                <th class="col-brand">Brand</th>
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
            {:else if products.length === 0}
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-content">
                            <span class="empty-icon">📦</span>
                            <p>No products found</p>
                            <span class="empty-hint"
                                >Try adjusting your filters</span
                            >
                        </div>
                    </td>
                </tr>
            {:else}
                {#each products as product (product.itemCode)}
                    <tr
                        class="data-row"
                        onclick={() => handleRowClick(product)}
                        onkeydown={(e) => handleKeydown(e, product)}
                        tabindex="0"
                        role="button"
                    >
                        <td class="col-code">
                            <span class="code">{product.itemCode}</span>
                        </td>
                        <td class="col-description">
                            {product.timbaDescription ||
                                product.supplierDescription ||
                                "-"}
                        </td>
                        <td class="col-price">
                            <span class="price"
                                >{formatPrice(product.sellingPriceUnit)}</span
                            >
                        </td>
                        <td class="col-stock">
                            <Badge
                                variant={getStockBadgeVariant(
                                    product.stockStatus,
                                )}
                            >
                                {getStockLabel(
                                    product.stockStatus,
                                    product.stockQuantity,
                                )}
                            </Badge>
                        </td>
                        <td class="col-weight">
                            <span class="weight"
                                >{formatWeight(product.netUnitWeightKg)}</span
                            >
                        </td>
                        <td class="col-brand">
                            {product.brand || "-"}
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>

<style>
    .product-table-container {
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--shadow-md);
        overflow: hidden;
    }

    .product-table {
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
        cursor: pointer;
        transition: background-color var(--duration-fast) var(--ease-out);
    }

    .data-row:nth-child(even) {
        background: #fafbfc;
    }

    .data-row:hover {
        background: var(--color-accent-light);
    }

    .data-row:focus {
        outline: none;
        background: var(--color-accent-light);
        box-shadow: inset 3px 0 0 var(--color-accent);
    }

    .col-code {
        width: 120px;
    }

    .col-description {
        min-width: 200px;
    }

    .col-price,
    .col-weight {
        width: 100px;
        text-align: right;
    }

    .col-stock {
        width: 120px;
        text-align: center;
    }

    .col-brand {
        width: 140px;
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
    @media (max-width: 900px) {
        .col-brand {
            display: none;
        }
    }

    @media (max-width: 768px) {
        .col-weight {
            display: none;
        }
    }
</style>
