<!-- 
  Pagination Component
  Page navigation with prev/next and items per page selector
-->
<script lang="ts">
  interface Props {
    page: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];
    showItemsPerPage?: boolean;
    onPageChange?: (page: number) => void;
    onItemsPerPageChange?: (perPage: number) => void;
  }

  let {
    page = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 25,
    itemsPerPageOptions = [25, 50, 100],
    showItemsPerPage = true,
    onPageChange,
    onItemsPerPageChange
  }: Props = $props();

  const startItem = $derived((page - 1) * itemsPerPage + 1);
  const endItem = $derived(Math.min(page * itemsPerPage, totalItems));

  // Calculate visible page numbers
  const visiblePages = $derived.by(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (page > 3) {
        pages.push('ellipsis');
      }
      
      // Show pages around current
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  });

  function goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPageChange?.(newPage);
    }
  }

  function handlePerPageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = parseInt(select.value, 10);
    onItemsPerPageChange?.(value);
  }
</script>

<div class="pagination">
  <!-- Items info -->
  {#if totalItems > 0}
    <span class="pagination-info">
      Showing {startItem}-{endItem} of {totalItems.toLocaleString()} items
    </span>
  {/if}

  <div class="pagination-controls">
    <!-- Items per page -->
    {#if showItemsPerPage}
      <div class="per-page">
        <label for="per-page-select" class="per-page-label">Show</label>
        <select
          id="per-page-select"
          class="per-page-select"
          value={itemsPerPage}
          onchange={handlePerPageChange}
        >
          {#each itemsPerPageOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Page navigation -->
    <nav class="page-nav" aria-label="Pagination">
      <button
        class="page-btn prev"
        disabled={page <= 1}
        onclick={() => goToPage(page - 1)}
        aria-label="Previous page"
      >
        ◂ Prev
      </button>

      {#each visiblePages as pageNum, i}
        {#if pageNum === 'ellipsis'}
          <span class="page-ellipsis">…</span>
        {:else}
          <button
            class="page-btn page-number"
            class:active={pageNum === page}
            onclick={() => goToPage(pageNum)}
            aria-label="Page {pageNum}"
            aria-current={pageNum === page ? 'page' : undefined}
          >
            {pageNum}
          </button>
        {/if}
      {/each}

      <button
        class="page-btn next"
        disabled={page >= totalPages}
        onclick={() => goToPage(page + 1)}
        aria-label="Next page"
      >
        Next ▸
      </button>
    </nav>
  </div>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }

  .pagination-info {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: var(--space-6);
  }

  /* Per page selector */
  .per-page {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .per-page-label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .per-page-select {
    padding: var(--space-2) var(--space-3);
    padding-right: var(--space-6);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
  }

  .per-page-select:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: var(--shadow-focus);
  }

  /* Page navigation */
  .page-nav {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 var(--space-3);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .page-btn:hover:not(:disabled) {
    background: var(--color-bg);
    border-color: var(--color-text-muted);
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-btn.active {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-color: var(--color-primary);
  }

  .page-btn.prev,
  .page-btn.next {
    font-size: var(--text-sm);
  }

  .page-number {
    font-family: var(--font-mono);
  }

  .page-ellipsis {
    padding: 0 var(--space-2);
    color: var(--color-text-muted);
  }
</style>
