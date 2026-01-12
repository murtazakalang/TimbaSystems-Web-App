<script lang="ts">
    import { importWizard, isMappingValid } from "$lib/stores/importWizard";
    import type { ImportColumnMapping } from "$lib/types/import";

    // System fields to map, matching the user's spreadsheet format
    const systemFields: Array<{
        key: keyof ImportColumnMapping;
        label: string;
        required: boolean;
    }> = [
        { key: "itemCode", label: "Code", required: true },
        {
            key: "supplierDescription",
            label: "Supplier Description",
            required: false,
        },
        { key: "piecesPerPackage", label: "Unity", required: false },
        { key: "priceList", label: "Price List (£)", required: false },
        { key: "discount", label: "Discount%", required: false },
        { key: "cost", label: "Cost (£)", required: false },
        { key: "trueCost", label: "True Cost (£)", required: false },
        { key: "description", label: "Description", required: false },
        { key: "margin", label: "Margin %", required: false },
        { key: "sellingPrice", label: "Selling Price (£)", required: false },
        { key: "unitWeight", label: "Weight (kg)", required: false },
        { key: "stockQuantity", label: "Stock Quantity", required: false },
    ];

    function handleSelectChange(
        field: keyof ImportColumnMapping,
        value: string,
    ) {
        importWizard.updateMapping(field, value);
    }

    // Get preview data for the current mapping
    function getMappedPreviewData(): Record<string, unknown>[] {
        const state = $importWizard;
        if (state.rawRows.length === 0 || state.headers.length === 0) return [];

        const headerIndexMap: Record<string, number> = {};
        state.headers.forEach((header, index) => {
            headerIndexMap[header] = index;
        });

        return state.rawRows.slice(0, 3).map((row) => {
            const mapped: Record<string, unknown> = {};
            for (const field of systemFields) {
                const sourceColumn = state.mapping[field.key];
                if (
                    sourceColumn &&
                    headerIndexMap[sourceColumn] !== undefined
                ) {
                    mapped[field.key] = (row as unknown[])[
                        headerIndexMap[sourceColumn]
                    ];
                }
            }
            return mapped;
        });
    }

    let previewData = $derived(getMappedPreviewData());
</script>

<div class="column-mapper">
    <div class="mapper-header">
        <h3>Map Columns</h3>
        <p class="mapper-subtitle">
            Match columns from your file to system fields. Required fields are
            marked with <span class="required-star">*</span>
        </p>
    </div>

    <div class="file-info">
        <span class="file-icon">📄</span>
        <span class="file-name">{$importWizard.fileName}</span>
        <span class="row-count">{$importWizard.rawRows.length} rows</span>
    </div>

    <div class="mapping-grid">
        {#each systemFields as field}
            <div class="mapping-row">
                <label class="field-label" for={`map-${field.key}`}>
                    {field.label}
                    {#if field.required}
                        <span class="required-star">*</span>
                    {/if}
                </label>
                <div class="field-select-wrapper">
                    <select
                        id={`map-${field.key}`}
                        class="field-select"
                        class:error={field.required &&
                            !$importWizard.mapping[field.key]}
                        value={$importWizard.mapping[field.key] ?? ""}
                        onchange={(e) =>
                            handleSelectChange(
                                field.key,
                                (e.target as HTMLSelectElement).value,
                            )}
                    >
                        <option value="">-- Select Column --</option>
                        {#each $importWizard.columns as column}
                            <option value={column.name}>
                                {column.name}
                                {#if column.sample.length > 0}
                                    ({column.sample[0]?.substring(0, 20)}{column
                                        .sample[0]?.length > 20
                                        ? "..."
                                        : ""})
                                {/if}
                            </option>
                        {/each}
                    </select>
                    <svg
                        class="select-arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        {/each}
    </div>

    {#if !$isMappingValid}
        <div class="validation-error">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
            >
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                />
            </svg>
            <span>Item Code mapping is required</span>
        </div>
    {/if}

    {#if previewData.length > 0 && $isMappingValid}
        <div class="preview-section">
            <h4>Preview (First 3 Rows)</h4>
            <div class="preview-table-wrapper">
                <table class="preview-table">
                    <thead>
                        <tr>
                            {#each systemFields.filter((f) => $importWizard.mapping[f.key]) as field}
                                <th>{field.label}</th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each previewData as row}
                            <tr>
                                {#each systemFields.filter((f) => $importWizard.mapping[f.key]) as field}
                                    <td>{row[field.key] ?? ""}</td>
                                {/each}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</div>

<style>
    .column-mapper {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 24px;
    }

    .mapper-header h3 {
        margin: 0 0 8px 0;
        font-family: "DM Sans", sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: var(--color-text);
    }

    .mapper-subtitle {
        margin: 0 0 24px 0;
        font-size: 14px;
        color: var(--color-text-secondary);
    }

    .required-star {
        color: var(--color-error);
        font-weight: 600;
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

    .row-count {
        margin-left: auto;
        font-size: 13px;
        color: var(--color-text-secondary);
        background: var(--color-surface);
        padding: 4px 10px;
        border-radius: 12px;
    }

    .mapping-grid {
        display: grid;
        gap: 16px;
    }

    .mapping-row {
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 16px;
        align-items: center;
    }

    .field-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text);
    }

    .field-select-wrapper {
        position: relative;
    }

    .field-select {
        width: 100%;
        padding: 10px 36px 10px 12px;
        font-size: 14px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        color: var(--color-text);
        appearance: none;
        cursor: pointer;
        transition: border-color var(--duration-fast) var(--ease-out);
    }

    .field-select:hover {
        border-color: var(--color-text-secondary);
    }

    .field-select:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(57, 158, 162, 0.1);
    }

    .field-select.error {
        border-color: var(--color-error);
    }

    .select-arrow {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: var(--color-text-secondary);
        pointer-events: none;
    }

    .validation-error {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 12px 16px;
        background: #fef2f2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        color: var(--color-error);
        font-size: 14px;
    }

    .preview-section {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--color-border);
    }

    .preview-section h4 {
        margin: 0 0 16px 0;
        font-family: "DM Sans", sans-serif;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text);
    }

    .preview-table-wrapper {
        overflow-x: auto;
    }

    .preview-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
    }

    .preview-table th {
        background: var(--color-primary);
        color: white;
        padding: 10px 12px;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        white-space: nowrap;
    }

    .preview-table td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--color-border);
        font-family: "JetBrains Mono", monospace;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .preview-table tbody tr:hover {
        background: var(--color-accent-light);
    }

    @media (max-width: 768px) {
        .mapping-row {
            grid-template-columns: 1fr;
            gap: 8px;
        }
    }
</style>
