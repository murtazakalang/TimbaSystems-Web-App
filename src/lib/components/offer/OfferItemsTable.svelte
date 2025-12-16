<script lang="ts">
    import Badge from "$lib/components/ui/Badge.svelte";
    import { offerItems } from "$lib/stores/quickOffer";
    import { flip } from "svelte/animate";
    import { fade, slide } from "svelte/transition";

    const items = $derived($offerItems);

    function handleQuantityChange(code: string, event: Event) {
        const target = event.target as HTMLInputElement;
        const newQty = parseInt(target.value, 10);
        if (newQty > 0) {
            offerItems.updateQuantity(code, newQty);
        }
    }

    function handleRemove(code: string) {
        offerItems.removeItem(code);
    }

    function getAvailabilityVariant(available: boolean): "success" | "error" {
        return available ? "success" : "error";
    }
</script>

<div class="offer-items-container">
    {#if items.length === 0}
        <div class="empty-state" transition:fade={{ duration: 200 }}>
            <div class="empty-icon">📋</div>
            <h3>No items in offer</h3>
            <p>Search and add products above to build your quotation</p>
        </div>
    {:else}
        <div class="table-wrapper">
            <table class="offer-table">
                <thead>
                    <tr>
                        <th class="col-code">Code</th>
                        <th class="col-desc">Description</th>
                        <th class="col-price">Unit Price</th>
                        <th class="col-qty">Qty</th>
                        <th class="col-total">Total</th>
                        <th class="col-stock">Stock</th>
                        <th class="col-actions"></th>
                    </tr>
                </thead>
                <tbody>
                    {#each items as item (item.itemCode)}
                        <tr
                            animate:flip={{ duration: 300 }}
                            transition:slide={{ duration: 200 }}
                            class:unavailable={!item.available}
                        >
                            <td class="col-code">
                                <span class="code">{item.itemCode}</span>
                            </td>
                            <td class="col-desc">
                                <span class="desc">{item.description}</span>
                            </td>
                            <td class="col-price">
                                <span class="price"
                                    >£{item.unitPrice.toFixed(2)}</span
                                >
                            </td>
                            <td class="col-qty">
                                <input
                                    type="number"
                                    class="qty-input"
                                    min="1"
                                    value={item.quantity}
                                    onchange={(e) =>
                                        handleQuantityChange(item.itemCode, e)}
                                />
                            </td>
                            <td class="col-total">
                                <span class="total"
                                    >£{item.lineTotal.toFixed(2)}</span
                                >
                            </td>
                            <td class="col-stock">
                                <Badge
                                    variant={getAvailabilityVariant(
                                        item.available,
                                    )}
                                >
                                    {item.available ? "✓" : "✗"}
                                </Badge>
                            </td>
                            <td class="col-actions">
                                <button
                                    type="button"
                                    class="remove-btn"
                                    onclick={() => handleRemove(item.itemCode)}
                                    title="Remove item"
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<style>
    .offer-items-container {
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--shadow-md);
        overflow: hidden;
    }

    .empty-state {
        padding: 60px 40px;
        text-align: center;
    }

    .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }

    .empty-state h3 {
        font-family: "DM Sans", sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 8px;
    }

    .empty-state p {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    .offer-table {
        width: 100%;
        border-collapse: collapse;
    }

    .offer-table thead {
        background: var(--color-primary);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .offer-table th {
        color: white;
        font-family: "DM Sans", sans-serif;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        padding: 14px 16px;
        text-align: left;
        white-space: nowrap;
    }

    .offer-table tbody tr {
        border-bottom: 1px solid var(--color-border);
        transition: background-color var(--duration-fast) var(--ease-out);
    }

    .offer-table tbody tr:hover {
        background: var(--color-accent-light);
    }

    .offer-table tbody tr.unavailable {
        background: rgba(239, 68, 68, 0.05);
    }

    .offer-table tbody tr.unavailable:hover {
        background: rgba(239, 68, 68, 0.1);
    }

    .offer-table td {
        padding: 14px 16px;
        vertical-align: middle;
    }

    .col-code {
        width: 120px;
    }

    .col-desc {
        min-width: 200px;
    }

    .col-price,
    .col-total {
        width: 100px;
        text-align: right;
    }

    .col-qty {
        width: 80px;
        text-align: center;
    }

    .col-stock {
        width: 70px;
        text-align: center;
    }

    .col-actions {
        width: 50px;
        text-align: center;
    }

    .code {
        font-family: "JetBrains Mono", monospace;
        font-weight: 500;
        color: var(--color-text);
    }

    .desc {
        font-size: 14px;
        color: var(--color-text-secondary);
    }

    .price,
    .total {
        font-family: "JetBrains Mono", monospace;
        font-weight: 500;
    }

    .total {
        color: var(--color-accent);
    }

    .qty-input {
        width: 60px;
        padding: 6px 8px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        font-family: "JetBrains Mono", monospace;
        font-size: 14px;
        text-align: center;
        transition: all var(--duration-fast) var(--ease-out);
    }

    .qty-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(57, 158, 162, 0.15);
    }

    .remove-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        border-radius: 6px;
        transition: all var(--duration-fast) var(--ease-out);
    }

    .remove-btn:hover {
        background: var(--color-error);
        color: white;
    }

    /* Right-align numeric columns in header */
    .offer-table th.col-price,
    .offer-table th.col-total {
        text-align: right;
    }

    .offer-table th.col-qty,
    .offer-table th.col-stock,
    .offer-table th.col-actions {
        text-align: center;
    }
</style>
