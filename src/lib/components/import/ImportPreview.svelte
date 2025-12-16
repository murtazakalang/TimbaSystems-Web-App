<script lang="ts">
    import { importWizard } from "$lib/stores/importWizard";
    import { addToast } from "$lib/stores/toastStore";
    import { goto } from "$app/navigation";
    import type { ImportResult } from "$lib/types/import";

    let isImporting = $state(false);
    let importResult = $state<ImportResult | null>(null);

    // Calculate preview statistics
    function getPreviewStats() {
        const state = $importWizard;
        const totalRows = state.rawRows.length;

        // Count rows with valid itemCode
        const headerIndex = state.headers.indexOf(state.mapping.itemCode);
        let validRows = 0;

        if (headerIndex >= 0) {
            validRows = state.rawRows.filter((row) => {
                const value = (row as unknown[])[headerIndex];
                return value !== null && value !== undefined && value !== "";
            }).length;
        }

        return {
            totalRows,
            validRows,
            invalidRows: totalRows - validRows,
            mappedFields: Object.values(state.mapping).filter(Boolean).length,
        };
    }

    let stats = $derived(getPreviewStats());

    async function handleConfirmImport() {
        isImporting = true;
        importResult = null;

        try {
            const state = $importWizard;

            const response = await fetch("/api/products/import/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    headers: state.headers,
                    rows: state.rawRows,
                    mapping: state.mapping,
                    fileName: state.fileName,
                }),
            });

            const result = (await response.json()) as ImportResult;

            if (!response.ok) {
                throw new Error(
                    (result as unknown as { message: string }).message ||
                        "Import failed",
                );
            }

            importResult = result;

            if (result.success) {
                addToast(
                    `Import successful! ${result.recordsImported} created, ${result.recordsUpdated} updated.`,
                    "success",
                );
            } else {
                addToast(
                    `Import completed with ${result.errors.length} errors.`,
                    "warning",
                );
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Import failed";
            addToast(message, "error");
        } finally {
            isImporting = false;
        }
    }

    function handleDone() {
        importWizard.reset();
        goto("/products");
    }

    function handleNewImport() {
        importWizard.reset();
    }
</script>

<div class="import-preview">
    {#if !importResult}
        <!-- Pre-import preview -->
        <div class="preview-header">
            <h3>Review Import</h3>
            <p class="preview-subtitle">
                Review the import summary before applying changes.
            </p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{stats.totalRows}</div>
                <div class="stat-label">Total Rows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value success">{stats.validRows}</div>
                <div class="stat-label">Valid Rows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" class:warning={stats.invalidRows > 0}>
                    {stats.invalidRows}
                </div>
                <div class="stat-label">Invalid Rows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.mappedFields}</div>
                <div class="stat-label">Fields Mapped</div>
            </div>
        </div>

        <div class="file-info">
            <span class="file-icon">📄</span>
            <span class="file-name">{$importWizard.fileName}</span>
        </div>

        <div class="mapping-summary">
            <h4>Column Mapping</h4>
            <div class="mapping-list">
                {#each Object.entries($importWizard.mapping).filter(([_, value]) => value) as [field, column]}
                    <div class="mapping-item">
                        <span class="mapping-field">{field}</span>
                        <span class="mapping-arrow">→</span>
                        <span class="mapping-column">{column}</span>
                    </div>
                {/each}
            </div>
        </div>

        <div class="warning-box">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
            >
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <div>
                <strong>Important:</strong> This action will update existing products
                and create new ones. Products are matched by Item Code.
            </div>
        </div>

        <div class="action-buttons">
            <button
                type="button"
                class="btn btn-secondary"
                onclick={() => importWizard.prevStep()}
                disabled={isImporting}
            >
                ← Back
            </button>
            <button
                type="button"
                class="btn btn-primary"
                onclick={handleConfirmImport}
                disabled={isImporting || stats.validRows === 0}
            >
                {#if isImporting}
                    <span class="spinner"></span>
                    Importing...
                {:else}
                    Confirm Import
                {/if}
            </button>
        </div>
    {:else}
        <!-- Post-import results -->
        <div class="result-container">
            <div
                class="result-icon"
                class:success={importResult.success}
                class:warning={!importResult.success}
            >
                {#if importResult.success}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                        />
                    </svg>
                {:else}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                        />
                    </svg>
                {/if}
            </div>

            <h3 class="result-title">
                {importResult.success
                    ? "Import Successful!"
                    : "Import Completed with Errors"}
            </h3>

            <div class="result-stats">
                <div class="result-stat">
                    <span class="result-stat-value success"
                        >{importResult.recordsImported}</span
                    >
                    <span class="result-stat-label">Created</span>
                </div>
                <div class="result-stat">
                    <span class="result-stat-value"
                        >{importResult.recordsUpdated}</span
                    >
                    <span class="result-stat-label">Updated</span>
                </div>
                {#if importResult.errors.length > 0}
                    <div class="result-stat">
                        <span class="result-stat-value warning"
                            >{importResult.errors.length}</span
                        >
                        <span class="result-stat-label">Errors</span>
                    </div>
                {/if}
            </div>

            {#if importResult.errors.length > 0}
                <div class="errors-section">
                    <h4>Errors</h4>
                    <div class="errors-list">
                        {#each importResult.errors.slice(0, 10) as error}
                            <div class="error-item">
                                <span class="error-row">Row {error.row}</span>
                                <span class="error-message"
                                    >{error.message}</span
                                >
                            </div>
                        {/each}
                        {#if importResult.errors.length > 10}
                            <div class="error-more">
                                ... and {importResult.errors.length - 10} more errors
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}

            <div class="result-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick={handleNewImport}
                >
                    Import Another File
                </button>
                <button
                    type="button"
                    class="btn btn-primary"
                    onclick={handleDone}
                >
                    Done
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .import-preview {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 24px;
    }

    .preview-header h3 {
        margin: 0 0 8px 0;
        font-family: "DM Sans", sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: var(--color-text);
    }

    .preview-subtitle {
        margin: 0 0 24px 0;
        font-size: 14px;
        color: var(--color-text-secondary);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
    }

    .stat-card {
        background: var(--color-bg);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }

    .stat-value {
        font-family: "JetBrains Mono", monospace;
        font-size: 28px;
        font-weight: 600;
        color: var(--color-text);
    }

    .stat-value.success {
        color: var(--color-success);
    }

    .stat-value.warning {
        color: var(--color-warning);
    }

    .stat-label {
        font-size: 12px;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.02em;
        margin-top: 4px;
    }

    .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--color-bg);
        border-radius: 8px;
        margin-bottom: 24px;
    }

    .file-icon {
        font-size: 20px;
    }

    .file-name {
        font-weight: 500;
        color: var(--color-text);
    }

    .mapping-summary {
        margin-bottom: 24px;
    }

    .mapping-summary h4 {
        margin: 0 0 12px 0;
        font-family: "DM Sans", sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
    }

    .mapping-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .mapping-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--color-accent-light);
        border-radius: 6px;
        font-size: 13px;
    }

    .mapping-field {
        font-weight: 500;
        color: var(--color-text);
    }

    .mapping-arrow {
        color: var(--color-text-secondary);
    }

    .mapping-column {
        color: var(--color-accent);
        font-family: "JetBrains Mono", monospace;
    }

    .warning-box {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #fffbeb;
        border: 1px solid #fcd34d;
        border-radius: 8px;
        margin-bottom: 24px;
        color: #92400e;
    }

    .warning-box svg {
        flex-shrink: 0;
        color: #f59e0b;
    }

    .action-buttons {
        display: flex;
        justify-content: space-between;
        gap: 16px;
    }

    .btn {
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
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

    .btn-secondary:hover:not(:disabled) {
        background: var(--color-bg);
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Result styles */
    .result-container {
        text-align: center;
        padding: 24px 0;
    }

    .result-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
    }

    .result-icon.success {
        background: #d1fae5;
        color: var(--color-success);
    }

    .result-icon.warning {
        background: #fef3c7;
        color: var(--color-warning);
    }

    .result-icon svg {
        width: 32px;
        height: 32px;
    }

    .result-title {
        margin: 0 0 24px 0;
        font-family: "DM Sans", sans-serif;
        font-size: 24px;
        font-weight: 600;
        color: var(--color-text);
    }

    .result-stats {
        display: flex;
        justify-content: center;
        gap: 48px;
        margin-bottom: 32px;
    }

    .result-stat {
        text-align: center;
    }

    .result-stat-value {
        display: block;
        font-family: "JetBrains Mono", monospace;
        font-size: 36px;
        font-weight: 600;
        color: var(--color-text);
    }

    .result-stat-value.success {
        color: var(--color-success);
    }

    .result-stat-value.warning {
        color: var(--color-warning);
    }

    .result-stat-label {
        font-size: 14px;
        color: var(--color-text-secondary);
    }

    .errors-section {
        text-align: left;
        margin-bottom: 32px;
        padding: 16px;
        background: #fef2f2;
        border-radius: 8px;
    }

    .errors-section h4 {
        margin: 0 0 12px 0;
        color: var(--color-error);
    }

    .errors-list {
        max-height: 200px;
        overflow-y: auto;
    }

    .error-item {
        display: flex;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid #fca5a5;
        font-size: 13px;
    }

    .error-row {
        font-weight: 500;
        color: var(--color-error);
        white-space: nowrap;
    }

    .error-message {
        color: var(--color-text);
    }

    .error-more {
        padding: 8px 0;
        font-style: italic;
        color: var(--color-text-secondary);
    }

    .result-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .result-stats {
            flex-direction: column;
            gap: 16px;
        }
    }
</style>
