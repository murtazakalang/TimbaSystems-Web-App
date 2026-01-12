<script lang="ts">
    import { onMount } from "svelte";
    import { addToast } from "$lib/stores/toastStore";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";

    interface Settings {
        defaultMarkupPct: number;
        transportCost: number;
        lowStockThreshold: number;
        rowsPerPage: number;
        currencySymbol: string;
        updatedAt: string;
    }

    let settings = $state<Settings | null>(null);
    let isLoading = $state(true);
    let isSaving = $state(false);

    // Form fields
    let defaultMarkupPct = $state(30);
    let transportCost = $state(0);
    let lowStockThreshold = $state(50);
    let rowsPerPage = $state(20);
    let currencySymbol = $state("£");

    onMount(async () => {
        await loadSettings();
    });

    async function loadSettings() {
        isLoading = true;
        try {
            const response = await fetch("/api/settings");
            const data = await response.json();

            if (response.ok) {
                settings = data;
                defaultMarkupPct = data.defaultMarkupPct;
                transportCost = data.transportCost;
                lowStockThreshold = data.lowStockThreshold;
                rowsPerPage = data.rowsPerPage;
                currencySymbol = data.currencySymbol;
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            addToast("Failed to load settings", "error");
        } finally {
            isLoading = false;
        }
    }

    async function saveSettings() {
        isSaving = true;
        try {
            const response = await fetch("/api/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    defaultMarkupPct,
                    transportCost,
                    lowStockThreshold,
                    rowsPerPage,
                    currencySymbol,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                settings = data;
                addToast("Settings saved successfully", "success");
            } else {
                throw new Error(data.error || "Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            addToast(
                error instanceof Error
                    ? error.message
                    : "Failed to save settings",
                "error",
            );
        } finally {
            isSaving = false;
        }
    }
</script>

<svelte:head>
    <title>Settings | Timba Systems</title>
</svelte:head>

<div class="settings-page">
    <header class="page-header">
        <h1>Settings</h1>
        <p class="subtitle">Configure application settings and preferences</p>
    </header>

    {#if isLoading}
        <div class="loading">
            <div class="spinner"></div>
            <span>Loading settings...</span>
        </div>
    {:else}
        <div class="settings-grid">
            <!-- Stock Settings -->
            <section class="settings-section">
                <h2>
                    <span class="section-icon">📦</span>
                    Stock
                </h2>
                <div class="settings-group">
                    <div class="setting-row">
                        <label for="threshold">Low Stock Threshold</label>
                        <Input
                            id="threshold"
                            type="number"
                            bind:value={lowStockThreshold}
                            min={0}
                        />
                        <span class="setting-hint"
                            >Products below this quantity show warning</span
                        >
                    </div>
                </div>
            </section>

            <!-- Display Settings -->
            <section class="settings-section">
                <h2>
                    <span class="section-icon">🎨</span>
                    Display
                </h2>
                <div class="settings-group">
                    <div class="setting-row">
                        <label for="rows">Rows Per Page</label>
                        <Input
                            id="rows"
                            type="number"
                            bind:value={rowsPerPage}
                            min={5}
                            max={100}
                        />
                        <span class="setting-hint"
                            >Default items per page in lists</span
                        >
                    </div>
                    <div class="setting-row">
                        <label for="currency">Currency Symbol</label>
                        <Input
                            id="currency"
                            type="text"
                            bind:value={currencySymbol}
                            maxlength={3}
                        />
                        <span class="setting-hint">Displayed with prices</span>
                    </div>
                </div>
            </section>
        </div>

        <div class="actions">
            <Button
                variant="primary"
                onclick={saveSettings}
                disabled={isSaving}
            >
                {#if isSaving}
                    Saving...
                {:else}
                    Save Settings
                {/if}
            </Button>
            {#if settings?.updatedAt}
                <span class="last-saved">
                    Last saved: {new Date(settings.updatedAt).toLocaleString()}
                </span>
            {/if}
        </div>
    {/if}
</div>

<style>
    .settings-page {
        max-width: 800px;
    }

    .page-header {
        margin-bottom: 32px;
    }

    .page-header h1 {
        font-family: "DM Sans", sans-serif;
        font-size: 32px;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
    }

    .subtitle {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 8px 0 0 0;
    }

    .loading {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 48px;
        justify-content: center;
        color: var(--color-text-secondary);
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .settings-section {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 24px;
        box-shadow: var(--shadow-md);
    }

    .settings-section h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: "DM Sans", sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 20px 0;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border);
    }

    .section-icon {
        font-size: 20px;
    }

    .settings-group {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .setting-row {
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 16px;
        align-items: start;
    }

    .setting-row label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text);
        padding-top: 10px;
    }

    .setting-hint {
        grid-column: 2;
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-top: -8px;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--color-border);
    }

    .last-saved {
        font-size: 13px;
        color: var(--color-text-secondary);
    }

    @media (max-width: 640px) {
        .setting-row {
            grid-template-columns: 1fr;
            gap: 8px;
        }

        .setting-hint {
            grid-column: 1;
        }
    }
</style>
