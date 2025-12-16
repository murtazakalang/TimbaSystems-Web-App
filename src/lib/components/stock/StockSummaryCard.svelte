<script lang="ts">
    import StatCard from "$lib/components/ui/StatCard.svelte";
    import type { StockSummary } from "$lib/types/stock";

    interface Props {
        summary?: StockSummary | null;
    }

    let { summary = null }: Props = $props();
</script>

<div class="stock-summary">
    {#if summary}
        <StatCard
            value={summary.inStock}
            label="In Stock"
            icon="✅"
            color="success"
        />
        <StatCard
            value={summary.lowStock}
            label="Low Stock"
            icon="⚠️"
            color="warning"
        />
        <StatCard
            value={summary.outOfStock}
            label="Out of Stock"
            icon="🔴"
            color="error"
        />
        <StatCard
            value={summary.totalValue}
            label="Stock Value"
            icon="💷"
            color="default"
            prefix="£"
        />
    {:else}
        <div class="loading-placeholder">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>
    {/if}
</div>

<style>
    .stock-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--space-4);
        margin-bottom: var(--space-4);
    }

    .loading-placeholder {
        display: contents;
    }

    .skeleton-card {
        height: 100px;
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    @media (max-width: 600px) {
        .stock-summary {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>
