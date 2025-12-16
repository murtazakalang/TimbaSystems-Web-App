<!-- 
  Badge Component
  Variants: success, warning, error, neutral
  Optional pulse animation for alerts
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'success' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md';
    pulse?: boolean;
    children: Snippet;
  }

  let {
    variant = 'neutral',
    size = 'md',
    pulse = false,
    children
  }: Props = $props();
</script>

<span class="badge badge-{variant} badge-{size}" class:pulse>
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-body);
    font-weight: var(--font-medium);
    border-radius: var(--radius-full);
    white-space: nowrap;
  }

  /* Sizes */
  .badge-sm {
    padding: 2px var(--space-2);
    font-size: var(--text-xs);
  }

  .badge-md {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
  }

  /* Variants */
  .badge-success {
    background: var(--color-success);
    color: var(--color-text-inverse);
  }

  .badge-warning {
    background: var(--color-warning);
    color: var(--color-primary);
  }

  .badge-error {
    background: var(--color-error);
    color: var(--color-text-inverse);
  }

  .badge-neutral {
    background: var(--color-bg);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  /* Pulse animation for warnings */
  .badge.pulse {
    animation: badgePulse 2s var(--ease-in-out) infinite;
  }

  @keyframes badgePulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.02);
    }
  }
</style>
