<script lang="ts">
    import { goto } from "$app/navigation";
    import ReceiveStockForm from "$lib/components/stock/ReceiveStockForm.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    interface ReceivedEntry {
        itemCode: string;
        quantity: number;
        newStock: number;
        description: string;
        timestamp: Date;
    }

    let recentEntries = $state<ReceivedEntry[]>([]);

    function handleReceived(entry: {
        itemCode: string;
        quantity: number;
        newStock: number;
        description: string;
    }) {
        recentEntries = [
            {
                ...entry,
                timestamp: new Date(),
            },
            ...recentEntries,
        ];
    }

    function handleDone() {
        goto("/stock");
    }

    function formatTime(date: Date): string {
        return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }
</script>

<svelte:head>
    <title>Receive Stock | Timba Systems</title>
</svelte:head>

<div class="receive-page">
    <header class="page-header">
        <div class="header-content">
            <h1>Receive Stock</h1>
            <p class="subtitle">Add incoming stock when deliveries arrive</p>
        </div>
        <div class="header-actions">
            <Button variant="secondary" onclick={handleDone}>✓ Done</Button>
        </div>
    </header>

    <div class="content-layout">
        <div class="form-column">
            <ReceiveStockForm onReceived={handleReceived} />
        </div>

        <div class="recent-column">
            <div class="recent-card">
                <h3 class="recent-title">Recent Additions</h3>

                {#if recentEntries.length === 0}
                    <div class="empty-state">
                        <span class="empty-icon">📋</span>
                        <p>No stock received yet this session</p>
                    </div>
                {:else}
                    <ul class="recent-list">
                        {#each recentEntries as entry (entry.timestamp.getTime())}
                            <li class="recent-item">
                                <div class="item-main">
                                    <span class="item-code"
                                        >{entry.itemCode}</span
                                    >
                                    <span class="item-qty"
                                        >+{entry.quantity}</span
                                    >
                                </div>
                                <div class="item-details">
                                    <span class="item-desc"
                                        >{entry.description}</span
                                    >
                                    <span class="item-stock"
                                        >New total: {entry.newStock}</span
                                    >
                                </div>
                                <span class="item-time"
                                    >{formatTime(entry.timestamp)}</span
                                >
                            </li>
                        {/each}
                    </ul>

                    <div class="recent-summary">
                        <span class="summary-label">Total items added:</span>
                        <span class="summary-value"
                            >{recentEntries.reduce(
                                (sum, e) => sum + e.quantity,
                                0,
                            )} units</span
                        >
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .receive-page {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-2);
    }

    .header-content h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--color-text);
        margin: 0;
    }

    .subtitle {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        margin: var(--space-1) 0 0 0;
    }

    .header-actions {
        display: flex;
        gap: var(--space-2);
    }

    .content-layout {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: var(--space-6);
        align-items: start;
    }

    .form-column {
        /* Form takes up main space */
    }

    .recent-column {
        position: sticky;
        top: var(--space-4);
    }

    .recent-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        padding: var(--space-4);
    }

    .recent-title {
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: var(--font-semibold);
        color: var(--color-text);
        margin: 0 0 var(--space-4) 0;
        padding-bottom: var(--space-3);
        border-bottom: 1px solid var(--color-border);
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-6);
        color: var(--color-text-secondary);
        text-align: center;
    }

    .empty-icon {
        font-size: 32px;
        opacity: 0.5;
    }

    .empty-state p {
        margin: 0;
        font-size: var(--text-sm);
    }

    .recent-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        max-height: 400px;
        overflow-y: auto;
    }

    .recent-item {
        padding: var(--space-3);
        background: var(--color-bg);
        border-radius: var(--radius-md);
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-10px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .item-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-1);
    }

    .item-code {
        font-family: var(--font-mono);
        font-weight: var(--font-medium);
        color: var(--color-accent);
    }

    .item-qty {
        font-family: var(--font-mono);
        font-weight: var(--font-semibold);
        color: var(--color-success);
        background: var(--color-success-light);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
    }

    .item-details {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-1);
    }

    .item-desc {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .item-stock {
        font-family: var(--font-mono);
        margin-left: var(--space-2);
    }

    .item-time {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
    }

    .recent-summary {
        margin-top: var(--space-4);
        padding-top: var(--space-3);
        border-top: 1px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .summary-label {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
    }

    .summary-value {
        font-family: var(--font-mono);
        font-weight: var(--font-semibold);
        color: var(--color-text);
    }

    @media (max-width: 900px) {
        .content-layout {
            grid-template-columns: 1fr;
        }

        .recent-column {
            position: static;
        }
    }

    @media (max-width: 600px) {
        .page-header {
            flex-direction: column;
            gap: var(--space-3);
        }

        .header-actions {
            width: 100%;
        }
    }
</style>
