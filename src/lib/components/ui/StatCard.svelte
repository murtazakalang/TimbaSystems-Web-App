<!-- 
  StatCard Component
  Dashboard stat display with icon, value, label, and trend
  Features count-up animation on mount
-->
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    value: number | string;
    label: string;
    icon?: string;
    trend?: {
      value: number;
      direction: 'up' | 'down';
    };
    color?: 'default' | 'success' | 'warning' | 'error';
    prefix?: string;
    suffix?: string;
    animate?: boolean;
  }

  let {
    value,
    label,
    icon = '',
    trend,
    color = 'default',
    prefix = '',
    suffix = '',
    animate = true
  }: Props = $props();

  let displayValue = $state(animate ? 0 : value);
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    
    if (animate && typeof value === 'number') {
      const duration = 800;
      const startTime = performance.now();
      const startValue = 0;
      const endValue = value;
      
      function easeOut(t: number): number {
        return 1 - Math.pow(1 - t, 3);
      }
      
      function updateValue(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOut(progress);
        
        displayValue = Math.round(startValue + (endValue - startValue) * easedProgress);
        
        if (progress < 1) {
          requestAnimationFrame(updateValue);
        } else {
          displayValue = endValue;
        }
      }
      
      requestAnimationFrame(updateValue);
    } else {
      displayValue = value;
    }
  });

  const colorClasses: Record<string, string> = {
    default: 'color-default',
    success: 'color-success',
    warning: 'color-warning',
    error: 'color-error'
  };
</script>

<div class="stat-card {colorClasses[color]}" class:mounted>
  {#if icon}
    <div class="stat-icon">
      {icon}
    </div>
  {/if}
  
  <div class="stat-content">
    <span class="stat-value">
      {prefix}{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}{suffix}
    </span>
    <span class="stat-label">{label}</span>
  </div>

  {#if trend}
    <div 
      class="stat-trend" 
      class:up={trend.direction === 'up'} 
      class:down={trend.direction === 'down'}
    >
      <span class="trend-arrow">{trend.direction === 'up' ? '↑' : '↓'}</span>
      <span class="trend-value">{trend.value}%</span>
    </div>
  {/if}
</div>

<style>
  .stat-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-6);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    opacity: 0;
    transform: translateY(10px);
    transition: all var(--duration-slow) var(--ease-out);
  }

  .stat-card.mounted {
    opacity: 1;
    transform: translateY(0);
  }

  /* Icon */
  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }

  .color-default .stat-icon {
    background: var(--color-accent-light);
  }

  .color-success .stat-icon {
    background: var(--color-success-light);
  }

  .color-warning .stat-icon {
    background: var(--color-warning-light);
  }

  .color-error .stat-icon {
    background: var(--color-error-light);
  }

  /* Content */
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
    min-width: 0;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: var(--text-3xl);
    font-weight: var(--font-semibold);
    color: var(--color-text);
    line-height: 1.1;
  }

  .stat-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* Trend */
  .stat-trend {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }

  .stat-trend.up {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .stat-trend.down {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  .trend-arrow {
    font-size: var(--text-xs);
  }

  .trend-value {
    font-family: var(--font-mono);
  }
</style>
