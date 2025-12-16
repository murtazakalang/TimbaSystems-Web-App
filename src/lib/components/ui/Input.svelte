<!-- 
  Input Component
  Types: text, number, email, password, search
  States: error, disabled
  Features: label, icon, clearable
-->
<script lang="ts">
  interface Props {
    type?: 'text' | 'number' | 'email' | 'password' | 'search';
    name?: string;
    value?: string | number;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    icon?: string;
    clearable?: boolean;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onkeydown?: (event: KeyboardEvent) => void;
  }

  let {
    type = 'text',
    name = '',
    value = $bindable(''),
    placeholder = '',
    label = '',
    error = '',
    disabled = false,
    required = false,
    icon = '',
    clearable = false,
    oninput,
    onchange,
    onkeydown
  }: Props = $props();

  const isSearch = $derived(type === 'search');
  const showClear = $derived(clearable && value && String(value).length > 0);

  function handleClear() {
    value = '';
  }
</script>

<div class="input-wrapper">
  {#if label}
    <label for={name} class="input-label">
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}

  <div class="input-container" class:has-icon={icon || isSearch} class:has-error={error}>
    {#if icon || isSearch}
      <span class="input-icon">{icon || '🔍'}</span>
    {/if}

    <input
      {type}
      {name}
      id={name}
      bind:value
      {placeholder}
      {disabled}
      {required}
      class="input"
      class:search={isSearch}
      {oninput}
      {onchange}
      {onkeydown}
    />

    {#if showClear}
      <button
        type="button"
        class="input-clear"
        onclick={handleClear}
        tabindex="-1"
      >
        ✕
      </button>
    {/if}
  </div>

  {#if error}
    <span class="input-error">
      <span class="error-icon">⚠</span>
      {error}
    </span>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
  }

  .input-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
  }

  .required {
    color: var(--color-error);
    margin-left: 2px;
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: all var(--duration-fast) var(--ease-out);
  }

  .input::placeholder {
    color: var(--color-text-muted);
  }

  .input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: var(--shadow-focus);
  }

  .input:disabled {
    background: var(--color-bg);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }

  /* Icon padding */
  .has-icon .input {
    padding-left: calc(var(--space-4) + 24px);
  }

  .input-icon {
    position: absolute;
    left: var(--space-4);
    font-size: var(--text-base);
    opacity: 0.5;
    pointer-events: none;
  }

  /* Clear button padding */
  .input-container:has(.input-clear) .input {
    padding-right: calc(var(--space-4) + 24px);
  }

  .input-clear {
    position: absolute;
    right: var(--space-3);
    padding: var(--space-1);
    background: none;
    border: none;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--duration-fast) var(--ease-out);
    line-height: 1;
  }

  .input-clear:hover {
    color: var(--color-text);
    background: var(--color-bg);
  }

  /* Error state */
  .has-error .input {
    border-color: var(--color-error);
  }

  .has-error .input:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
  }

  .input-error {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--color-error);
  }

  .error-icon {
    font-size: var(--text-xs);
  }

  /* Number input - hide arrows */
  .input[type='number']::-webkit-inner-spin-button,
  .input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .input[type='number'] {
    -moz-appearance: textfield;
  }
</style>
