<!-- 
  Modal Component
  Backdrop with fade, modal with scale animation
  Supports header, body, footer slots
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    onclose?: () => void;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    onclose,
    children,
    footer
  }: Props = $props();

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }

  function close() {
    open = false;
    onclose?.();
  }
</script>

<svelte:document onkeydown={handleKeydown} />

{#if open}
  <div 
    class="modal-backdrop" 
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div class="modal modal-{size}">
      <!-- Header -->
      {#if title}
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title">{title}</h2>
          <button class="modal-close" onclick={close} aria-label="Close modal">
            ✕
          </button>
        </div>
      {:else}
        <button class="modal-close floating" onclick={close} aria-label="Close modal">
          ✕
        </button>
      {/if}

      <!-- Body -->
      <div class="modal-body">
        {@render children()}
      </div>

      <!-- Footer -->
      {#if footer}
        <div class="modal-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(26, 32, 44, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    z-index: var(--z-modal-backdrop);
    animation: fadeIn var(--duration-fast) var(--ease-out);
  }

  .modal {
    position: relative;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-height: calc(100vh - var(--space-12));
    display: flex;
    flex-direction: column;
    animation: modalIn var(--duration-normal) var(--ease-out);
    z-index: var(--z-modal);
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Sizes */
  .modal-sm {
    width: 100%;
    max-width: 400px;
  }

  .modal-md {
    width: 100%;
    max-width: 560px;
  }

  .modal-lg {
    width: 100%;
    max-width: 800px;
  }

  /* Header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .modal-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-text);
    margin: 0;
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: all var(--duration-fast) var(--ease-out);
  }

  .modal-close:hover {
    background: var(--color-bg);
    color: var(--color-text);
  }

  .modal-close.floating {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
  }

  /* Body */
  .modal-body {
    padding: var(--space-6);
    overflow-y: auto;
    flex: 1;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border);
    flex-shrink: 0;
  }
</style>
