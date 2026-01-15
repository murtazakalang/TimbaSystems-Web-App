<!-- 
  Header Component
  Top bar with brand, global search, and user menu
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import GlobalSearch from "$lib/components/GlobalSearch.svelte";
  import { authStore } from "$lib/stores/authStore";

  let isUserMenuOpen = $state(false);

  function toggleUserMenu() {
    isUserMenuOpen = !isUserMenuOpen;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".user-menu-container")) {
      isUserMenuOpen = false;
    }
  }

  function handleLogout() {
    authStore.logout();
    goto("/login");
  }
</script>

<svelte:document onclick={handleClickOutside} />

<header class="header">
  <!-- Page Title Slot or Spacer -->
  <div class="header-left">
    <slot name="title">
      <span></span>
    </slot>
  </div>

  <!-- Global Search -->
  <div class="search-container">
    <GlobalSearch placeholder="Search products..." />
  </div>

  <!-- User Menu -->
  <div class="user-menu-container">
    <button class="user-button" onclick={toggleUserMenu}>
      <span class="user-avatar">👤</span>
      <span class="user-name">Admin</span>
      <span class="user-chevron" class:open={isUserMenuOpen}>▾</span>
    </button>

    {#if isUserMenuOpen}
      <div class="user-dropdown">
        <a href="/settings" class="dropdown-item">⚙️ Settings</a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item logout" onclick={handleLogout}
          >🚪 Logout</button
        >
      </div>
    {/if}
  </div>
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: var(--sidebar-width);
    right: 0;
    height: var(--header-height);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-6);
    z-index: var(--z-sticky);
    gap: var(--space-6);
  }

  /* Gradient fade on bottom border */
  .header::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--color-accent) 50%,
      transparent 100%
    );
    opacity: 0.3;
  }

  .header-left {
    flex-shrink: 0;
  }

  /* Search */
  .search-container {
    flex: 1;
    max-width: 480px;
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: var(--space-4);
    font-size: var(--text-base);
    opacity: 0.5;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    padding-left: calc(var(--space-4) + 24px);
    padding-right: calc(var(--space-4) + 24px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
    background: var(--color-bg);
    transition: all var(--duration-fast) var(--ease-out);
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: var(--shadow-focus);
    background: var(--color-surface);
  }

  .search-clear {
    position: absolute;
    right: var(--space-3);
    padding: var(--space-1);
    background: none;
    border: none;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--duration-fast) var(--ease-out);
  }

  .search-clear:hover {
    color: var(--color-text);
    background: var(--color-bg);
  }

  /* User Menu */
  .user-menu-container {
    position: relative;
  }

  .user-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    color: var(--color-text);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .user-button:hover {
    background: var(--color-bg);
    border-color: var(--color-border);
  }

  .user-avatar {
    font-size: 1.25rem;
  }

  .user-name {
    color: var(--color-text);
  }

  .user-chevron {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .user-chevron.open {
    transform: rotate(180deg);
  }

  /* Dropdown */
  .user-dropdown {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    min-width: 160px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    animation: scaleIn var(--duration-fast) var(--ease-out);
    transform-origin: top right;
    overflow: hidden;
    z-index: var(--z-dropdown);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: none;
    border: none;
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
    text-decoration: none;
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .dropdown-item:hover {
    background: var(--color-accent-light);
  }

  .dropdown-item.logout {
    color: var(--color-error);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--color-border);
    margin: var(--space-1) 0;
  }
</style>
