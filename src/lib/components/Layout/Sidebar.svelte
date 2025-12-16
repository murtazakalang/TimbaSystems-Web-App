<!-- 
  Sidebar Component
  Dark navigation sidebar with teal accent states
-->
<script lang="ts">
  import { page } from "$app/stores";
  import logo from "$lib/assets/logo.svg";

  interface NavItem {
    href: string;
    label: string;
    icon: string;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { href: "/offer", label: "Quick Offer", icon: "📋", highlight: true },
    { href: "/offer/saved", label: "Saved Offers", icon: "💾" },
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/products", label: "Products", icon: "📦" },
    { href: "/stock", label: "Stock", icon: "🗃️" },
    { href: "/products/import", label: "Import", icon: "📥" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  let { collapsed = false } = $props<{ collapsed?: boolean }>();
</script>

<aside class="sidebar" class:collapsed>
  <!-- Brand -->
  <div class="brand">
    <img src={logo} alt="Timba Systems" class="brand-logo" />
  </div>

  <!-- Navigation -->
  <nav class="nav">
    {#each navItems as item, i}
      <a
        href={item.href}
        class="nav-item"
        class:active={$page.url.pathname === item.href ||
          (item.href !== "/" && $page.url.pathname.startsWith(item.href))}
        style="animation-delay: {50 + i * 30}ms"
      >
        <span class="nav-icon">{item.icon}</span>
        {#if !collapsed}
          <span class="nav-label">{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Divider -->
  <div class="divider"></div>

  <!-- Settings at bottom (only show if not in main nav) -->
</aside>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--sidebar-width);
    background: linear-gradient(180deg, var(--color-primary) 0%, #151a24 100%);
    display: flex;
    flex-direction: column;
    padding: var(--space-4) 0;
    transition: width var(--duration-normal) var(--ease-out);
    z-index: var(--z-sticky);
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 72px;
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4) var(--space-5);
    margin-bottom: var(--space-6);
  }

  .brand-logo {
    max-width: 160px;
    height: auto;
    transition: all var(--duration-normal) var(--ease-out);
  }

  .collapsed .brand-logo {
    max-width: 40px;
  }

  /* Navigation */
  .nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: 0 var(--space-3);
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    text-decoration: none;
    transition: all var(--duration-fast) var(--ease-out);
    position: relative;
    animation: fadeInUp var(--duration-slow) var(--ease-out) backwards;
  }

  .nav-item:hover {
    background: rgba(57, 158, 162, 0.1);
    color: var(--color-text-inverse);
  }

  .nav-item.active {
    background: rgba(57, 158, 162, 0.15);
    color: var(--color-text-inverse);
  }

  /* Active indicator - teal left border */
  .nav-item.active::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 24px;
    background: var(--color-accent);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }

  .nav-icon {
    font-size: 1.125rem;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }

  .nav-label {
    white-space: nowrap;
    animation: fadeIn var(--duration-fast) var(--ease-out);
  }

  /* Divider */
  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: var(--space-4) var(--space-5);
  }
</style>
