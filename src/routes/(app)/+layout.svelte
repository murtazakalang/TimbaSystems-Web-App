<!-- 
  App Layout
  Combines Sidebar + Header with main content area
-->
<script lang="ts">
  import Sidebar from '$lib/components/Layout/Sidebar.svelte';
  import Header from '$lib/components/Layout/Header.svelte';

  let { children } = $props();
</script>

<div class="app-layout">
  <Sidebar />
  
  <div class="main-wrapper">
    <Header />
    
    <main class="main-content">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .main-wrapper {
    flex: 1;
    margin-left: var(--sidebar-width);
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevent flex item overflow */
  }

  .main-content {
    flex: 1;
    margin-top: var(--header-height);
    padding: var(--space-6);
    animation: fadeInUp var(--duration-slow) var(--ease-out);
  }
</style>
