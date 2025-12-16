<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import { toast } from "$lib/stores/toastStore";
    import { offerItems } from "$lib/stores/quickOffer";
    import { goto } from "$app/navigation";

    interface SavedOffer {
        id: number;
        orderNumber: string;
        totalValue: number;
        totalWeight: number;
        totalItems: number;
        createdAt: string;
    }

    let offers = $state<SavedOffer[]>([]);
    let loading = $state(true);
    let deleteConfirmId = $state<number | null>(null);
    let deleting = $state(false);

    async function loadOffers() {
        loading = true;
        try {
            const response = await fetch("/api/offers");
            if (response.ok) {
                const data = await response.json();
                offers = data.offers;
            }
        } catch (error) {
            console.error("Error loading offers:", error);
            toast.error("Failed to load saved offers");
        } finally {
            loading = false;
        }
    }

    async function loadOffer(id: number) {
        try {
            const response = await fetch(`/api/offers/${id}`);
            if (response.ok) {
                const data = await response.json();
                // Load items into the store
                offerItems.loadItems(
                    data.items.map(
                        (item: {
                            itemCode: string;
                            description: string;
                            unitPrice: number;
                            quantity: number;
                            lineTotal: number;
                            weight: number;
                            lineWeight: number;
                            available: boolean;
                        }) => ({
                            ...item,
                            stockAvailable: item.available ? 999 : 0,
                        }),
                    ),
                );
                toast.success(`Loaded offer ${data.orderNumber}`);
                goto("/offer");
            }
        } catch (error) {
            console.error("Error loading offer:", error);
            toast.error("Failed to load offer");
        }
    }

    async function deleteOffer(id: number) {
        deleting = true;
        try {
            const response = await fetch(`/api/offers/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                offers = offers.filter((o) => o.id !== id);
                toast.success("Offer deleted");
                deleteConfirmId = null;
            }
        } catch (error) {
            console.error("Error deleting offer:", error);
            toast.error("Failed to delete offer");
        } finally {
            deleting = false;
        }
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    $effect(() => {
        loadOffers();
    });
</script>

<svelte:head>
    <title>Saved Offers | Timba Systems</title>
</svelte:head>

<div class="saved-offers-page">
    <header class="page-header">
        <div class="header-content">
            <h1>💾 Saved Offers</h1>
            <p class="subtitle">
                View, edit, or delete your saved draft quotations
            </p>
        </div>
        <Button variant="primary" onclick={() => goto("/offer")}>
            ➕ New Offer
        </Button>
    </header>

    {#if loading}
        <div class="loading-state">
            <div class="spinner">🔄</div>
            <p>Loading saved offers...</p>
        </div>
    {:else if offers.length === 0}
        <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No saved offers</h3>
            <p>Create a new offer and save it as a draft to see it here</p>
            <Button variant="primary" onclick={() => goto("/offer")}>
                Create New Offer
            </Button>
        </div>
    {:else}
        <div class="offers-grid">
            {#each offers as offer (offer.id)}
                <div class="offer-card">
                    <div class="offer-header">
                        <span class="offer-number">{offer.orderNumber}</span>
                        <Badge variant="warning">Draft</Badge>
                    </div>
                    <div class="offer-meta">
                        <span class="meta-item">
                            📦 {offer.totalItems} item{offer.totalItems !== 1
                                ? "s"
                                : ""}
                        </span>
                        <span class="meta-item">
                            ⚖️ {Number(offer.totalWeight).toFixed(2)} kg
                        </span>
                    </div>
                    <div class="offer-total">
                        £{Number(offer.totalValue).toFixed(2)}
                    </div>
                    <div class="offer-date">
                        Created {formatDate(offer.createdAt)}
                    </div>
                    <div class="offer-actions">
                        <Button
                            variant="primary"
                            onclick={() => loadOffer(offer.id)}
                        >
                            ✏️ Edit
                        </Button>
                        <Button
                            variant="ghost"
                            onclick={() => (deleteConfirmId = offer.id)}
                        >
                            🗑️
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<Modal open={deleteConfirmId !== null} onclose={() => (deleteConfirmId = null)}>
    <div class="confirm-modal">
        <h3>Delete Offer?</h3>
        <p>
            This action cannot be undone. The saved offer will be permanently
            deleted.
        </p>
        <div class="confirm-actions">
            <Button
                variant="secondary"
                onclick={() => (deleteConfirmId = null)}
            >
                Cancel
            </Button>
            <Button
                variant="danger"
                onclick={() => deleteConfirmId && deleteOffer(deleteConfirmId)}
                loading={deleting}
            >
                Delete
            </Button>
        </div>
    </div>
</Modal>

<style>
    .saved-offers-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
    }

    .header-content h1 {
        font-family: "DM Sans", sans-serif;
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
    }

    .subtitle {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 6px 0 0;
    }

    .loading-state,
    .empty-state {
        text-align: center;
        padding: 80px 40px;
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--shadow-md);
    }

    .spinner {
        font-size: 32px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .empty-icon {
        font-size: 64px;
        opacity: 0.5;
        margin-bottom: 16px;
    }

    .empty-state h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px;
    }

    .empty-state p {
        color: var(--color-text-secondary);
        margin: 0 0 24px;
    }

    .offers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }

    .offer-card {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 20px;
        box-shadow: var(--shadow-md);
        transition: all var(--duration-fast) var(--ease-out);
    }

    .offer-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
    }

    .offer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .offer-number {
        font-family: "JetBrains Mono", monospace;
        font-weight: 600;
        font-size: 15px;
        color: var(--color-text);
    }

    .offer-meta {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
    }

    .meta-item {
        font-size: 13px;
        color: var(--color-text-secondary);
    }

    .offer-total {
        font-family: "JetBrains Mono", monospace;
        font-size: 24px;
        font-weight: 600;
        color: var(--color-accent);
        margin-bottom: 8px;
    }

    .offer-date {
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
    }

    .offer-actions {
        display: flex;
        gap: 8px;
    }

    .confirm-modal {
        padding: 8px;
    }

    .confirm-modal h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px;
    }

    .confirm-modal p {
        color: var(--color-text-secondary);
        margin: 0 0 20px;
    }

    .confirm-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }
</style>
