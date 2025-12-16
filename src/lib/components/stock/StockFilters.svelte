<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    interface Props {
        search?: string;
        status?: string;
        onFilterChange?: (filters: { search: string; status: string }) => void;
    }

    let {
        search = $bindable(""),
        status = $bindable("all"),
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

    function handleStatusChange(value: string) {
        status = value;
        emitFilterChange();
    }

    function emitFilterChange() {
        onFilterChange?.({ search, status });
    }

    function clearFilters() {
        search = "";
        status = "all";
        clearTimeout(searchTimeout);
        emitFilterChange();
    }

    const statusOptions = [
        { value: "all", label: "All Stock" },
        { value: "in_stock", label: "In Stock" },
        { value: "low_stock", label: "Low Stock" },
        { value: "out_of_stock", label: "Out of Stock" },
    ];

    const hasActiveFilters = $derived(search !== "" || status !== "all");
</script>

<div class="stock-filters">
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
                    value={status}
                    options={statusOptions}
                    onchange={handleStatusChange}
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
    .stock-filters {
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
