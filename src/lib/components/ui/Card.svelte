<!-- 
  Card Component
  Container with shadow, optional header, clickable variant
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    clickable?: boolean;
    padding?: 'sm' | 'md' | 'lg' | 'none';
    onclick?: () => void;
    children: Snippet;
    header?: Snippet;
    footer?: Snippet;
  }

  let {
    title = '',
    clickable = false,
    padding = 'md',
    onclick,
    children,
    header,
    footer
  }: Props = $props();
</script>

<div
  class="card padding-{padding}"
  class:clickable
  onclick={clickable ? onclick : undefined}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
  onkeydown={(e) => clickable && e.key === 'Enter' && onclick?.()}
>
  {#if title || header}
    <div class="card-header">
      {#if header}
        {@render header()}
      {:else if title}
        <h3 class="card-title">{title}</h3>
      {/if}
    </div>
  {/if}

  <div class="card-body">
    {@render children()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: all var(--duration-fast) var(--ease-out);
  }

  /* Padding variants */
  .padding-none .card-body {
    padding: 0;
  }

  .padding-sm .card-body {
    padding: var(--space-4);
  }

  .padding-md .card-body {
    padding: var(--space-6);
  }

  .padding-lg .card-body {
    padding: var(--space-8);
  }

  /* Clickable variant */
  .card.clickable {
    cursor: pointer;
  }

  .card.clickable:hover {
    transform: scale(1.01);
    box-shadow: var(--shadow-lg);
  }

  .card.clickable:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus), var(--shadow-md);
  }

  /* Header */
  .card-header {
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--color-border);
  }

  .card-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-text);
    margin: 0;
  }

  /* Body */
  .card-body {
    /* Padding handled by variants */
  }

  /* Footer */
  .card-footer {
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface-alt);
  }
</style>
