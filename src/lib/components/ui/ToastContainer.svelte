<!-- 
  ToastContainer Component
  Renders all active toasts in a fixed position
-->
<script lang="ts">
  import { toastStore } from '$lib/stores/toastStore';
  import Toast from './Toast.svelte';
</script>

{#if $toastStore.length > 0}
  <div class="toast-container">
    {#each $toastStore as toast (toast.id)}
      <Toast {toast} />
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: var(--space-6);
    right: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    z-index: var(--z-toast);
    pointer-events: none;
  }

  .toast-container :global(.toast) {
    pointer-events: auto;
  }
</style>
