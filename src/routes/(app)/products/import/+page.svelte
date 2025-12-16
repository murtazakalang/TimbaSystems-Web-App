<script lang="ts">
    import { importWizard, canProceed } from "$lib/stores/importWizard";
    import FileUploader from "$lib/components/import/FileUploader.svelte";
    import ColumnMapper from "$lib/components/import/ColumnMapper.svelte";
    import ImportPreview from "$lib/components/import/ImportPreview.svelte";

    // Step labels
    const steps = [
        { number: 1, label: "Upload" },
        { number: 2, label: "Map Columns" },
        { number: 3, label: "Review & Import" },
    ];
</script>

<svelte:head>
    <title>Import Price List - Timba Systems</title>
</svelte:head>

<div class="import-page">
    <div class="page-header">
        <h1>Import Price List</h1>
        <p class="page-subtitle">
            Upload a supplier price list to update product data
        </p>
    </div>

    <!-- Step Indicator -->
    <div class="step-indicator">
        {#each steps as step, i}
            <div
                class="step"
                class:active={$importWizard.step === step.number}
                class:completed={$importWizard.step > step.number}
            >
                <div class="step-number">
                    {#if $importWizard.step > step.number}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="16"
                            height="16"
                        >
                            <path
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                            />
                        </svg>
                    {:else}
                        {step.number}
                    {/if}
                </div>
                <span class="step-label">{step.label}</span>
            </div>
            {#if i < steps.length - 1}
                <div
                    class="step-connector"
                    class:active={$importWizard.step > step.number}
                ></div>
            {/if}
        {/each}
    </div>

    <!-- Wizard Content -->
    <div class="wizard-content">
        {#if $importWizard.step === 1}
            <FileUploader />
        {:else if $importWizard.step === 2}
            <ColumnMapper />
            <div class="step-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick={() => importWizard.reset()}
                >
                    ← Start Over
                </button>
                <button
                    type="button"
                    class="btn btn-primary"
                    disabled={!$canProceed}
                    onclick={() => importWizard.nextStep()}
                >
                    Next: Review →
                </button>
            </div>
        {:else if $importWizard.step === 3}
            <ImportPreview />
        {/if}
    </div>
</div>

<style>
    .import-page {
        max-width: 900px;
        margin: 0 auto;
        padding: 32px 24px;
    }

    .page-header {
        margin-bottom: 32px;
    }

    .page-header h1 {
        margin: 0 0 8px 0;
        font-family: "DM Sans", sans-serif;
        font-size: 32px;
        font-weight: 700;
        color: var(--color-text);
        letter-spacing: -0.02em;
    }

    .page-subtitle {
        margin: 0;
        font-size: 16px;
        color: var(--color-text-secondary);
    }

    .step-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 40px;
    }

    .step {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "JetBrains Mono", monospace;
        font-size: 14px;
        font-weight: 600;
        background: var(--color-border);
        color: var(--color-text-secondary);
        transition: all var(--duration-fast) var(--ease-out);
    }

    .step.active .step-number {
        background: var(--color-accent);
        color: white;
    }

    .step.completed .step-number {
        background: var(--color-success);
        color: white;
    }

    .step-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-secondary);
        transition: color var(--duration-fast) var(--ease-out);
    }

    .step.active .step-label,
    .step.completed .step-label {
        color: var(--color-text);
    }

    .step-connector {
        width: 80px;
        height: 2px;
        background: var(--color-border);
        margin: 0 16px;
        transition: background var(--duration-fast) var(--ease-out);
    }

    .step-connector.active {
        background: var(--color-success);
    }

    .wizard-content {
        animation: fadeIn var(--duration-normal) var(--ease-out);
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .step-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--color-border);
    }

    .btn {
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);
        border: none;
    }

    .btn-primary {
        background: var(--color-primary);
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        transform: scale(1.02);
        box-shadow: var(--shadow-md);
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-secondary {
        background: var(--color-surface);
        color: var(--color-text);
        border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
        background: var(--color-bg);
    }

    @media (max-width: 768px) {
        .step-label {
            display: none;
        }

        .step-connector {
            width: 40px;
        }
    }
</style>
