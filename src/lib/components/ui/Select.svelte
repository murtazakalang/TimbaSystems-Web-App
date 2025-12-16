<!-- 
  Select Component
  Dropdown with animation and keyboard navigation
-->
<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    name?: string;
    value?: string;
    options: Option[];
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    required?: boolean;
    onchange?: (value: string) => void;
  }

  let {
    name = "",
    value = $bindable(""),
    options = [],
    placeholder = "Select an option",
    label = "",
    disabled = false,
    required = false,
    onchange,
  }: Props = $props();

  let isOpen = $state(false);
  let highlightedIndex = $state(-1);
  let selectRef: HTMLDivElement;

  const selectedOption = $derived(options.find((opt) => opt.value === value));

  function toggle() {
    if (!disabled) {
      isOpen = !isOpen;
      if (isOpen) {
        highlightedIndex = options.findIndex((opt) => opt.value === value);
      }
    }
  }

  function selectOption(option: Option) {
    value = option.value;
    isOpen = false;
    onchange?.(option.value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        isOpen = true;
        highlightedIndex = options.findIndex((opt) => opt.value === value);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        break;
      case "Enter":
        event.preventDefault();
        const selectedOpt = options[highlightedIndex];
        if (highlightedIndex >= 0 && selectedOpt) {
          selectOption(selectedOpt);
        }
        break;
      case "Escape":
        event.preventDefault();
        isOpen = false;
        break;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (selectRef && !selectRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }
</script>

<svelte:document onclick={handleClickOutside} />

<div class="select-wrapper">
  {#if label}
    <label for={name} class="select-label">
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}

  <div
    bind:this={selectRef}
    class="select-container"
    class:open={isOpen}
    class:disabled
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    tabindex={disabled ? -1 : 0}
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    <span class="select-value" class:placeholder={!selectedOption}>
      {selectedOption?.label || placeholder}
    </span>
    <span class="select-chevron" class:open={isOpen}>▾</span>

    {#if isOpen}
      <div class="select-dropdown" role="listbox">
        {#each options as option, i}
          <div
            class="select-option"
            class:selected={option.value === value}
            class:highlighted={i === highlightedIndex}
            role="option"
            aria-selected={option.value === value}
            onclick={(e) => {
              e.stopPropagation();
              selectOption(option);
            }}
            onmouseenter={() => (highlightedIndex = i)}
          >
            {option.label}
            {#if option.value === value}
              <span class="check-icon">✓</span>
            {/if}
          </div>
        {/each}

        {#if options.length === 0}
          <div class="select-empty">No options available</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
  }

  .select-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
  }

  .required {
    color: var(--color-error);
    margin-left: 2px;
  }

  .select-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    user-select: none;
  }

  .select-container:hover:not(.disabled) {
    border-color: var(--color-text-muted);
  }

  .select-container:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: var(--shadow-focus);
  }

  .select-container.open {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-focus);
  }

  .select-container.disabled {
    background: var(--color-bg);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .select-value {
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--color-text);
  }

  .select-value.placeholder {
    color: var(--color-text-muted);
  }

  .select-chevron {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .select-chevron.open {
    transform: rotate(180deg);
  }

  /* Dropdown */
  .select-dropdown {
    position: absolute;
    top: calc(100% + var(--space-1));
    left: 0;
    right: 0;
    max-height: 240px;
    overflow-y: auto;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-dropdown);
    animation: dropdownOpen var(--duration-fast) var(--ease-out);
    transform-origin: top center;
  }

  @keyframes dropdownOpen {
    from {
      opacity: 0;
      transform: scaleY(0.95);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  .select-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-base);
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .select-option:hover,
  .select-option.highlighted {
    background: var(--color-accent-light);
  }

  .select-option.selected {
    color: var(--color-accent);
    font-weight: var(--font-medium);
  }

  .check-icon {
    color: var(--color-accent);
    font-size: var(--text-sm);
  }

  .select-empty {
    padding: var(--space-4);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
