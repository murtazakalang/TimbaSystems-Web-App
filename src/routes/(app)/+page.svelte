<script lang="ts">
  import type { PageData } from "./$types";
  import GlobalSearch from "$lib/components/GlobalSearch.svelte";
  import ProductDetailModal from "$lib/components/products/ProductDetailModal.svelte";
  import { invalidateAll } from "$app/navigation";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();

  const stats = $derived(data.stats);
  const recentOffers = $derived(data.recentOffers);
  const recentStockUpdates = $derived(data.recentStockUpdates);

  // Animated counters
  let displayTotal = $state(0);
  let displayInStock = $state(0);
  let displayLowStock = $state(0);

  onMount(() => {
    // Count-up animation
    const duration = 800;
    const steps = 30;
    const interval = duration / steps;

    const animateCount = (target: number, setter: (val: number) => void) => {
      let current = 0;
      const increment = target / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, interval);
    };

    animateCount(stats.total, (v) => (displayTotal = v));
    animateCount(stats.inStock, (v) => (displayInStock = v));
    animateCount(
      stats.lowStock + stats.outOfStock,
      (v) => (displayLowStock = v),
    );
  });

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleProductUpdated() {
    invalidateAll();
  }
</script>

<svelte:head>
  <title>Dashboard | Timba Systems</title>
</svelte:head>

<div class="dashboard">
  <!-- Primary Actions -->
  <section class="actions-section">
    <h2 class="section-title">Quick Actions</h2>
    <div class="action-buttons">
      <a href="/offer" class="action-btn action-primary">
        <span class="action-icon">📝</span>
        <span class="action-label">New Quick Offer</span>
        <span class="action-hint">Create quotation</span>
      </a>
      <a href="/stock/receive" class="action-btn action-secondary">
        <span class="action-icon">📦</span>
        <span class="action-label">Receive Stock</span>
        <span class="action-hint">Add incoming stock</span>
      </a>
      <a href="/products" class="action-btn action-secondary">
        <span class="action-icon">🏷️</span>
        <span class="action-label">Products</span>
        <span class="action-hint">View catalog</span>
      </a>
    </div>
  </section>

  <!-- Global Search -->
  <section class="search-section">
    <h2 class="section-title">Product Lookup</h2>
    <GlobalSearch
      variant="large"
      placeholder="Search by product code or description..."
    />
  </section>

  <!-- Stats Cards -->
  <section class="stats-section">
    <div class="stat-card">
      <div class="stat-icon stat-icon-total">📦</div>
      <div class="stat-content">
        <span class="stat-value">{displayTotal.toLocaleString()}</span>
        <span class="stat-label">Total Products</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon stat-icon-success">✅</div>
      <div class="stat-content">
        <span class="stat-value success">{displayInStock.toLocaleString()}</span
        >
        <span class="stat-label">In Stock</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon stat-icon-warning">⚠️</div>
      <div class="stat-content">
        <span class="stat-value warning"
          >{displayLowStock.toLocaleString()}</span
        >
        <span class="stat-label">Low / Out of Stock</span>
      </div>
    </div>
  </section>

  <!-- Recent Activity -->
  <section class="activity-section">
    <div class="activity-panel">
      <h3>Recent Offers</h3>
      {#if recentOffers.length > 0}
        <ul class="activity-list">
          {#each recentOffers as offer}
            <li class="activity-item">
              <a href="/offer/saved" class="activity-link">
                <span class="activity-code">{offer.offerNumber}</span>
                <span class="activity-meta">
                  {offer.itemCount} items • £{offer.totalValue.toFixed(2)}
                </span>
                <span class="activity-time">{formatDate(offer.createdAt)}</span>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="no-activity">No recent offers</p>
      {/if}
    </div>

    <div class="activity-panel">
      <h3>Recent Stock Updates</h3>
      {#if recentStockUpdates.length > 0}
        <ul class="activity-list">
          {#each recentStockUpdates as update}
            <li class="activity-item">
              <div class="activity-link">
                <span class="activity-code">{update.itemCode}</span>
                <span
                  class="activity-change"
                  class:positive={update.quantityChange > 0}
                >
                  {update.quantityChange > 0 ? "+" : ""}{update.quantityChange}
                </span>
                <span class="activity-time">{formatDate(update.createdAt)}</span
                >
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="no-activity">No recent stock updates</p>
      {/if}
    </div>
  </section>
</div>

<ProductDetailModal onUpdated={handleProductUpdated} />

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-width: 1200px;
  }

  .section-title {
    font-family: "DM Sans", sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 16px 0;
  }

  /* Actions Section */
  .action-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px 24px;
    background: var(--color-surface);
    border-radius: 16px;
    box-shadow: var(--shadow-md);
    text-decoration: none;
    transition: all 0.2s ease-out;
  }

  .action-btn:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .action-primary {
    background: linear-gradient(135deg, var(--color-accent), #2d8a8d);
    color: white;
  }

  .action-primary:hover {
    background: linear-gradient(135deg, #2d8a8d, var(--color-accent));
  }

  .action-primary .action-hint {
    color: rgba(255, 255, 255, 0.8);
  }

  .action-secondary {
    color: var(--color-text);
  }

  .action-icon {
    font-size: 32px;
  }

  .action-label {
    font-family: "DM Sans", sans-serif;
    font-size: 18px;
    font-weight: 600;
  }

  .action-hint {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  /* Search Section */
  .search-section {
    background: var(--color-surface);
    padding: 24px;
    border-radius: 16px;
    box-shadow: var(--shadow-md);
  }

  /* Stats Section */
  .stats-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: var(--color-surface);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    border-radius: 12px;
  }

  .stat-icon-total {
    background: var(--color-accent-light);
  }

  .stat-icon-success {
    background: #d1fae5;
  }

  .stat-icon-warning {
    background: #fef3c7;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-family: "JetBrains Mono", monospace;
    font-size: 32px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1;
  }

  .stat-value.success {
    color: var(--color-success);
  }

  .stat-value.warning {
    color: var(--color-warning);
  }

  .stat-label {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-top: 4px;
  }

  /* Activity Section */
  .activity-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .activity-panel {
    background: var(--color-surface);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow-md);
  }

  .activity-panel h3 {
    font-family: "DM Sans", sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 16px 0;
  }

  .activity-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .activity-item {
    border-bottom: 1px solid var(--color-border);
  }

  .activity-item:last-child {
    border-bottom: none;
  }

  .activity-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    text-decoration: none;
    color: inherit;
  }

  a.activity-link:hover {
    color: var(--color-accent);
  }

  .activity-code {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-accent);
  }

  .activity-meta {
    flex: 1;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .activity-change {
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-error);
  }

  .activity-change.positive {
    color: var(--color-success);
  }

  .activity-time {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .no-activity {
    padding: 24px;
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 14px;
    margin: 0;
  }

  @media (max-width: 768px) {
    .action-buttons {
      grid-template-columns: 1fr;
    }

    .stats-section {
      grid-template-columns: 1fr;
    }

    .activity-section {
      grid-template-columns: 1fr;
    }
  }
</style>
