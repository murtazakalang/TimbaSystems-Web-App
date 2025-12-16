<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import StockFilters from "$lib/components/stock/StockFilters.svelte";
    import StockTable from "$lib/components/stock/StockTable.svelte";
    import StockSummaryCard from "$lib/components/stock/StockSummaryCard.svelte";
    import Pagination from "$lib/components/ui/Pagination.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let loading = $state(false);

    const stocks = $derived(data.stocks);
    const pagination = $derived(data.pagination);
    const summary = $derived(data.summary);
    const filters = $derived(data.filters);

    async function handleFilterChange(filterData: {
        search: string;
        status: string;
    }) {
        const { search, status } = filterData;
        loading = true;

        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (status && status !== "all") params.set("status", status);
        params.set("page", "1"); // Reset to first page on filter change

        await goto(`?${params.toString()}`, {
            replaceState: true,
            noScroll: true,
        });
        loading = false;
    }

    function handlePageChange(newPage: number) {
        loading = true;

        const params = new URLSearchParams($page.url.searchParams);
        params.set("page", String(newPage));

        goto(`?${params.toString()}`, {
            replaceState: true,
            noScroll: true,
        }).then(() => {
            loading = false;
        });
    }

    function handleStockUpdate() {
        // Refresh data after inline edit
        invalidateAll();
    }

    function goToReceiveStock() {
        goto("/stock/receive");
    }
</script>

<svelte:head>
    <title>Stock Management | Timba Systems</title>
</svelte:head>

<div class="stock-page">
    <header class="page-header">
        <div class="header-content">
            <h1>Stock Management</h1>
            <p class="subtitle">
                Track inventory levels and receive incoming stock
            </p>
        </div>
        <div class="header-actions">
            <Button variant="primary" onclick={goToReceiveStock}>
                <span class="btn-icon">📦</span>
                Receive Stock
            </Button>
        </div>
    </header>

    <StockSummaryCard {summary} />

    <StockFilters
        search={filters.search}
        status={filters.status}
        onFilterChange={handleFilterChange}
    />

    <StockTable {stocks} {loading} onStockUpdate={handleStockUpdate} />

    {#if pagination.totalPages > 1}
        <div class="pagination-container">
            <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
            />
        </div>
    {/if}

    <div class="table-info">
        <span>
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(
                pagination.page * pagination.limit,
                pagination.total,
            )} of {pagination.total} items
        </span>
        <span class="edit-hint">💡 Click on quantity to edit inline</span>
    </div>
</div>

<style>
    .stock-page {
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

    .btn-icon {
        margin-right: var(--space-2);
    }

    .pagination-container {
        display: flex;
        justify-content: center;
        margin-top: var(--space-3);
    }

    .table-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
    }

    .edit-hint {
        font-style: italic;
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            gap: var(--space-3);
        }

        .header-actions {
            width: 100%;
        }

        .table-info {
            flex-direction: column;
            gap: var(--space-2);
            text-align: center;
        }
    }
</style>
