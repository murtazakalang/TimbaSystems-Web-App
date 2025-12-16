<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import ProductFilters from "$lib/components/products/ProductFilters.svelte";
    import ProductTable from "$lib/components/products/ProductTable.svelte";
    import ProductDetailModal from "$lib/components/products/ProductDetailModal.svelte";
    import Pagination from "$lib/components/ui/Pagination.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import { openProductModal } from "$lib/stores/selectedProduct";
    import type { PageData } from "./$types";
    import type { ProductListItem } from "$lib/types/product";

    let { data }: { data: PageData } = $props();

    let loading = $state(false);

    const products = $derived(data.products);
    const pagination = $derived(data.pagination);
    const brands = $derived(data.brands);
    const filters = $derived(data.filters);

    async function handleFilterChange(filterData: {
        search: string;
        brand: string;
        stockStatus: string;
    }) {
        const { search, brand, stockStatus } = filterData;
        loading = true;

        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (brand) params.set("brand", brand);
        if (stockStatus && stockStatus !== "all")
            params.set("stockStatus", stockStatus);
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

    function handleRowClick(product: ProductListItem) {
        openProductModal(product.itemCode);
    }

    function handleProductUpdated() {
        // Trigger a re-fetch by invalidating the data
        invalidateAll();
    }

    function goToImport() {
        goto("/products/import");
    }
</script>

<svelte:head>
    <title>Products | Timba Systems</title>
</svelte:head>

<div class="products-page">
    <header class="page-header">
        <div class="header-content">
            <h1>Products</h1>
            <p class="subtitle">
                Manage your product catalog, pricing, and stock
            </p>
        </div>
        <div class="header-actions">
            <Button
                variant="secondary"
                onclick={() =>
                    (window.location.href = "/api/products/export?format=xlsx")}
            >
                <span class="btn-icon">📊</span>
                Export Excel
            </Button>
            <Button
                variant="secondary"
                onclick={() =>
                    (window.location.href = "/api/products/export?format=csv")}
            >
                <span class="btn-icon">📄</span>
                Export CSV
            </Button>
            <Button variant="primary" onclick={goToImport}>
                <span class="btn-icon">📥</span>
                Import Prices
            </Button>
        </div>
    </header>

    <ProductFilters
        search={filters.search}
        brand={filters.brand}
        stockStatus={filters.stockStatus}
        {brands}
        onFilterChange={handleFilterChange}
    />

    <ProductTable {products} {loading} onRowClick={handleRowClick} />

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
            )} of {pagination.total} products
        </span>
    </div>

    <ProductDetailModal onUpdated={handleProductUpdated} />
</div>

<style>
    .products-page {
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
        text-align: center;
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            gap: var(--space-3);
        }

        .header-actions {
            width: 100%;
        }
    }
</style>
