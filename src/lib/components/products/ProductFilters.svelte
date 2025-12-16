<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    interface Props {
        search?: string;
        brand?: string;
        stockStatus?: string;
        brands?: string[];
        onFilterChange?: (filters: {
            search: string;
            brand: string;
            stockStatus: string;
        }) => void;
    }

    let {
        search = $bindable(""),
        brand = $bindable(""),
        stockStatus = $bindable("all"),
        brands = [],
        onFilterChange,
    }: Props = $props();

    let searchTimeout: ReturnType<typeof setTimeout>;

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        search = target.value;

        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            emitFilterChange();
        }, 300);
    }

    function handleBrandChange(value: string) {
        brand = value;
        emitFilterChange();
    }

    function handleStockStatusChange(value: string) {
        stockStatus = value;
        emitFilterChange();
    }

    function emitFilterChange() {
        onFilterChange?.({ search, brand, stockStatus });
    }

    function clearFilters() {
        search = "";
        brand = "";
        stockStatus = "all";
        clearTimeout(searchTimeout);
        emitFilterChange();
    }

    const brandOptions = $derived([
        { value: "", label: "All Brands" },
        ...brands.map((b) => ({ value: b, label: b })),
    ]);

    const stockStatusOptions = [
        { value: "all", label: "All Stock" },
        { value: "in_stock", label: "In Stock" },
        { value: "low_stock", label: "Low Stock" },
        { value: "out_of_stock", label: "Out of Stock" },
    ];

    const hasActiveFilters = $derived(
        search !== "" || brand !== "" || stockStatus !== "all",
    );
</script>

<div class="product-filters">
    <div class="filter-row">
        <div class="search-wrapper">
            <Input
                type="search"
                placeholder="Search by code or description..."
                value={search}
                oninput={handleSearchInput}
                clearable
            />
        </div>

        <div class="filter-group">
            <div class="select-container">
                <Select
                    value={brand}
                    options={brandOptions}
                    placeholder="All Brands"
                    onchange={handleBrandChange}
                />
            </div>

            <div class="select-container">
                <Select
                    value={stockStatus}
                    options={stockStatusOptions}
                    onchange={handleStockStatusChange}
                />
            </div>

            {#if hasActiveFilters}
                <Button variant="ghost" size="sm" onclick={clearFilters}>
                    Clear Filters
                </Button>
            {/if}
        </div>
    </div>
</div>

<style>
    .product-filters {
        background: var(--color-surface);
        border-radius: 12px;
        padding: var(--space-4);
        box-shadow: var(--shadow-sm);
        margin-bottom: var(--space-4);
    }

    .filter-row {
        display: flex;
        gap: var(--space-4);
        align-items: flex-end;
        flex-wrap: wrap;
    }

    .search-wrapper {
        flex: 1;
        min-width: 250px;
    }

    .filter-group {
        display: flex;
        gap: var(--space-3);
        align-items: flex-end;
        flex-wrap: wrap;
    }

    .select-container {
        min-width: 150px;
    }

    @media (max-width: 768px) {
        .filter-row {
            flex-direction: column;
            align-items: stretch;
        }

        .search-wrapper {
            min-width: 100%;
        }

        .filter-group {
            width: 100%;
        }

        .select-container {
            flex: 1;
        }
    }
</style>
