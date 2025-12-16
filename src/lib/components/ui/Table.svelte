<!-- 
  Table Component
  Sticky header, sortable columns, row selection, loading state
-->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }

  interface Props<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    selectable?: boolean;
    selectedRows?: Set<string>;
    getRowId?: (row: T) => string;
    onRowClick?: (row: T) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onSelectionChange?: (selected: Set<string>) => void;
    emptyMessage?: string;
    row?: Snippet<[T, number]>;
  }

  let {
    columns,
    data,
    loading = false,
    selectable = false,
    selectedRows = new Set(),
    getRowId = (row: T) => String((row as Record<string, unknown>)['id'] ?? Math.random()),
    onRowClick,
    onSort,
    onSelectionChange,
    emptyMessage = 'No data available',
    row
  }: Props<T> = $props();

  let sortKey = $state<string | null>(null);
  let sortDirection = $state<'asc' | 'desc'>('asc');

  const allSelected = $derived(
    data.length > 0 && data.every(item => selectedRows.has(getRowId(item)))
  );

  function handleSort(column: Column<T>) {
    if (!column.sortable) return;
    
    const key = String(column.key);
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
    
    onSort?.(key, sortDirection);
  }

  function toggleRowSelection(rowData: T) {
    const id = getRowId(rowData);
    const newSelection = new Set(selectedRows);
    
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    
    onSelectionChange?.(newSelection);
  }

  function toggleAllSelection() {
    if (allSelected) {
      onSelectionChange?.(new Set());
    } else {
      const all = new Set(data.map(getRowId));
      onSelectionChange?.(all);
    }
  }

  function getCellValue(rowData: T, key: keyof T | string): unknown {
    return (rowData as Record<string, unknown>)[String(key)];
  }
</script>

<div class="table-container" class:loading>
  <table class="table">
    <thead>
      <tr>
        {#if selectable}
          <th class="th-select">
            <input
              type="checkbox"
              checked={allSelected}
              onchange={toggleAllSelection}
              class="checkbox"
            />
          </th>
        {/if}
        {#each columns as column}
          <th
            class="th"
            class:sortable={column.sortable}
            style:width={column.width}
            style:text-align={column.align || 'left'}
            onclick={() => handleSort(column)}
          >
            <span class="th-content">
              {column.label}
              {#if column.sortable}
                <span class="sort-icon" class:active={sortKey === String(column.key)}>
                  {#if sortKey === String(column.key)}
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  {:else}
                    ↕
                  {/if}
                </span>
              {/if}
            </span>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if loading}
        {#each Array(5) as _, i}
          <tr class="tr skeleton-row">
            {#if selectable}
              <td class="td"><div class="skeleton"></div></td>
            {/if}
            {#each columns as _}
              <td class="td"><div class="skeleton"></div></td>
            {/each}
          </tr>
        {/each}
      {:else if data.length === 0}
        <tr>
          <td colspan={columns.length + (selectable ? 1 : 0)} class="td-empty">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as rowData, i}
          {@const id = getRowId(rowData)}
          {@const isSelected = selectedRows.has(id)}
          <tr
            class="tr"
            class:selected={isSelected}
            class:clickable={!!onRowClick}
            onclick={() => onRowClick?.(rowData)}
          >
            {#if selectable}
              <td class="td td-select">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onclick={(e) => e.stopPropagation()}
                  onchange={() => toggleRowSelection(rowData)}
                  class="checkbox"
                />
              </td>
            {/if}
            {#if row}
              {@render row(rowData, i)}
            {:else}
              {#each columns as column}
                <td class="td" style:text-align={column.align || 'left'}>
                  {getCellValue(rowData, column.key)}
                </td>
              {/each}
            {/if}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    width: 100%;
    overflow-x: auto;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .table-container.loading {
    pointer-events: none;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-body);
  }

  /* Header */
  thead {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .th {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    padding: var(--space-4);
    text-align: left;
    white-space: nowrap;
  }

  .th:first-child {
    border-radius: var(--radius-lg) 0 0 0;
  }

  .th:last-child {
    border-radius: 0 var(--radius-lg) 0 0;
  }

  .th-select {
    width: 48px;
    padding: var(--space-4) var(--space-3);
    background: var(--color-primary);
    border-radius: var(--radius-lg) 0 0 0;
  }

  .th.sortable {
    cursor: pointer;
    user-select: none;
  }

  .th.sortable:hover {
    background: #2d3748;
  }

  .th-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .sort-icon {
    font-size: var(--text-sm);
    opacity: 0.5;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .sort-icon.active {
    opacity: 1;
    color: var(--color-accent);
  }

  /* Body */
  .tr {
    border-bottom: 1px solid var(--color-border);
    transition: background var(--duration-fast) var(--ease-out);
  }

  .tr:nth-child(even) {
    background: var(--color-surface-alt);
  }

  .tr:hover {
    background: var(--color-accent-light);
  }

  .tr.clickable {
    cursor: pointer;
  }

  .tr.selected {
    background: var(--color-accent-light);
    position: relative;
  }

  .tr.selected::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--color-accent);
  }

  .td {
    padding: var(--space-4);
    font-size: var(--text-base);
    color: var(--color-text);
    min-height: 56px;
    vertical-align: middle;
  }

  .td-select {
    width: 48px;
    padding: var(--space-4) var(--space-3);
  }

  .td-empty {
    padding: var(--space-12) var(--space-6);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-base);
  }

  /* Checkbox */
  .checkbox {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
    cursor: pointer;
  }

  /* Skeleton Loading */
  .skeleton-row .td {
    padding: var(--space-3) var(--space-4);
  }

  .skeleton {
    height: 20px;
    background: linear-gradient(
      90deg,
      var(--color-bg) 25%,
      var(--color-surface) 50%,
      var(--color-bg) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-sm);
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
