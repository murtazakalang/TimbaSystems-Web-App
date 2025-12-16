<!-- 
  Toast Component
  Notification toast with slide-in animation and auto-dismiss
-->
<script lang="ts">
  import type { Toast } from '$lib/stores/toastStore';
  import { removeToast } from '$lib/stores/toastStore';
  import { onMount } from 'svelte';

  interface Props {
    toast: Toast;
  }

  let { toast }: Props = $props();

  let progress = $state(100);
  let progressInterval: ReturnType<typeof setInterval>;

  const icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  onMount(() => {
    if (toast.duration && toast.duration > 0) {
      const step = 100 / (toast.duration / 50);
      progressInterval = setInterval(() => {
        progress -= step;
        if (progress <= 0) {
          clearInterval(progressInterval);
          handleClose();
        }
      }, 50);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  });

  function handleClose() {
    removeToast(toast.id);
  }
</script>

<div class="toast toast-{toast.type}">
  <span class="toast-icon">{icons[toast.type]}</span>
  
  <span class="toast-message">{toast.message}</span>
  
  <button class="toast-close" onclick={handleClose} aria-label="Close">
    ✕
  </button>

  {#if toast.duration && toast.duration > 0}
    <div class="toast-progress" style="width: {progress}%"></div>
  {/if}
</div>

<style>
  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
    min-width: 280px;
    max-width: 400px;
    animation: slideInRight var(--duration-normal) var(--ease-out);
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Icon */
  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-bold);
    flex-shrink: 0;
  }

  .toast-success .toast-icon {
    background: var(--color-success);
    color: var(--color-text-inverse);
  }

  .toast-error .toast-icon {
    background: var(--color-error);
    color: var(--color-text-inverse);
  }

  .toast-warning .toast-icon {
    background: var(--color-warning);
    color: var(--color-primary);
  }

  .toast-info .toast-icon {
    background: var(--color-accent);
    color: var(--color-text-inverse);
  }

  /* Message */
  .toast-message {
    flex: 1;
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
    line-height: 1.4;
  }

  /* Close button */
  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--duration-fast) var(--ease-out);
    flex-shrink: 0;
  }

  .toast-close:hover {
    background: var(--color-bg);
    color: var(--color-text);
  }

  /* Progress bar */
  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    transition: width 50ms linear;
  }

  .toast-success .toast-progress {
    background: var(--color-success);
  }

  .toast-error .toast-progress {
    background: var(--color-error);
  }

  .toast-warning .toast-progress {
    background: var(--color-warning);
  }

  .toast-info .toast-progress {
    background: var(--color-accent);
  }
</style>
