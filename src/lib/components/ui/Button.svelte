<!-- 
  Button Component
  Variants: primary, secondary, danger, ghost
  Sizes: sm, md, lg
  States: loading, disabled
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    onclick,
    children
  }: Props = $props();

  const isDisabled = $derived(disabled || loading);
</script>

<button
  {type}
  class="btn btn-{variant} btn-{size}"
  class:loading
  class:full-width={fullWidth}
  disabled={isDisabled}
  {onclick}
>
  {#if loading}
    <span class="spinner"></span>
  {/if}
  <span class="btn-content" class:hidden={loading}>
    {@render children()}
  </span>
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-body);
    font-weight: var(--font-medium);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    position: relative;
    white-space: nowrap;
  }

  .btn:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .btn:hover:not(:disabled) {
    transform: scale(1.02);
  }

  .btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Sizes */
  .btn-sm {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    min-height: 32px;
  }

  .btn-md {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-base);
    min-height: 40px;
  }

  .btn-lg {
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-lg);
    min-height: 48px;
  }

  /* Variants */
  .btn-primary {
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border: 1px solid var(--color-primary);
    box-shadow: var(--shadow-sm);
  }

  .btn-primary:hover:not(:disabled) {
    background: #2d3748;
    box-shadow: var(--shadow-md);
  }

  .btn-secondary {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-bg);
    border-color: var(--color-text-muted);
  }

  .btn-danger {
    background: var(--color-error);
    color: var(--color-text-inverse);
    border: 1px solid var(--color-error);
  }

  .btn-danger:hover:not(:disabled) {
    background: #dc2626;
  }

  .btn-ghost {
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid transparent;
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--color-bg);
    color: var(--color-text);
  }

  /* Full Width */
  .full-width {
    width: 100%;
  }

  /* Loading State */
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    position: absolute;
  }

  .btn-content.hidden {
    visibility: hidden;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
