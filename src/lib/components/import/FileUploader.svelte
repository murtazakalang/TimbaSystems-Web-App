<script lang="ts">
    import { importWizard } from '$lib/stores/importWizard';
    import { addToast } from '$lib/stores/toastStore';

    let isDragging = $state(false);
    let fileInput: HTMLInputElement;

    const acceptedTypes = ['.xlsx', '.xls', '.csv'];
    const acceptString = acceptedTypes.join(',');

    async function handleFile(file: File) {
        // Validate file type
        const ext = file.name.toLowerCase().split('.').pop();
        if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
            addToast('Invalid file type. Please upload an Excel (.xlsx) or CSV (.csv) file.', 'error');
            return;
        }

        importWizard.setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/products/import', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to parse file');
            }

            importWizard.setFileData(
                file,
                result.fileName,
                result.columns,
                result.headers,
                result.previewRows,
                result.suggestedMappings
            );

            addToast(`File "${file.name}" parsed successfully. ${result.totalRows} rows found.`, 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload file';
            importWizard.setError(message);
            addToast(message, 'error');
        }
    }

    function handleDragEnter(e: DragEvent) {
        e.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleInputChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }

    function openFilePicker() {
        fileInput?.click();
    }
</script>

<div
    class="file-uploader"
    class:dragging={isDragging}
    class:loading={$importWizard.isLoading}
    ondragenter={handleDragEnter}
    ondragleave={handleDragLeave}
    ondragover={handleDragOver}
    ondrop={handleDrop}
    onclick={openFilePicker}
    onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
    role="button"
    tabindex="0"
>
    <input
        type="file"
        accept={acceptString}
        onchange={handleInputChange}
        bind:this={fileInput}
        hidden
    />

    {#if $importWizard.isLoading}
        <div class="upload-content">
            <div class="spinner"></div>
            <p class="upload-text">Parsing file...</p>
        </div>
    {:else}
        <div class="upload-content">
            <div class="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
            </div>
            <p class="upload-text">
                <strong>Click to upload</strong> or drag and drop
            </p>
            <p class="upload-hint">Excel (.xlsx) or CSV (.csv) files only</p>
        </div>
    {/if}
</div>

{#if $importWizard.error}
    <div class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>{$importWizard.error}</span>
    </div>
{/if}

<style>
    .file-uploader {
        border: 2px dashed var(--color-border);
        border-radius: 12px;
        padding: 48px 24px;
        text-align: center;
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);
        background: var(--color-surface);
    }

    .file-uploader:hover,
    .file-uploader:focus {
        border-color: var(--color-accent);
        background: var(--color-accent-light);
    }

    .file-uploader.dragging {
        border-color: var(--color-accent);
        background: var(--color-accent-light);
        transform: scale(1.02);
    }

    .file-uploader.loading {
        pointer-events: none;
        opacity: 0.7;
    }

    .upload-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .upload-icon {
        width: 48px;
        height: 48px;
        color: var(--color-accent);
    }

    .upload-icon svg {
        width: 100%;
        height: 100%;
    }

    .upload-text {
        font-size: 16px;
        color: var(--color-text);
        margin: 0;
    }

    .upload-hint {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 12px 16px;
        background: #FEF2F2;
        border: 1px solid #FCA5A5;
        border-radius: 8px;
        color: var(--color-error);
        font-size: 14px;
    }

    .error-message svg {
        flex-shrink: 0;
    }
</style>
