<!-- 
  App Layout
  Combines Sidebar + Header with main content area
  Includes authentication check
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import Sidebar from "$lib/components/Layout/Sidebar.svelte";
  import Header from "$lib/components/Layout/Header.svelte";
  import { authStore } from "$lib/stores/authStore";

  let { children } = $props();
  let isChecking = $state(true);

  onMount(() => {
    // Check authentication
    if (!authStore.checkAuth()) {
      goto("/login");
    } else {
      isChecking = false;
    }
  });

  // Also subscribe to auth changes
  $effect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      if (browser && !state.isAuthenticated) {
        goto("/login");
      }
    });
    return unsubscribe;
  });
</script>

{#if isChecking}
  <div class="loading-screen">
    <div class="spinner"></div>
  </div>
{:else}
  <div class="app-layout">
    <Sidebar />

    <div class="main-wrapper">
      <Header />

      <main class="main-content">
        {@render children()}
      </main>
    </div>
  </div>
{/if}

<style>
  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-bg);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .main-wrapper {
    flex: 1;
    margin-left: 72px; /* Collapsed sidebar width */
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevent flex item overflow */
    transition: margin-left var(--duration-normal) var(--ease-out);
  }

  .main-content {
    flex: 1;
    margin-top: var(--header-height);
    padding: var(--space-6);
    animation: fadeInUp var(--duration-slow) var(--ease-out);
  }
</style>
