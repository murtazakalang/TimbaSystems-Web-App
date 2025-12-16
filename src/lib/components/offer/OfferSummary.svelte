<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Modal from "$lib/components/ui/Modal.svelte";
    import {
        offerItems,
        itemCount,
        totalWeight,
        grandTotal,
        availabilitySummary,
        formatOfferAsText,
    } from "$lib/stores/quickOffer";
    import { toast } from "$lib/stores/toastStore";
    import { jsPDF } from "jspdf";

    let showClearConfirm = $state(false);
    let savingDraft = $state(false);
    let generatingPdf = $state(false);

    const count = $derived($itemCount);
    const weight = $derived($totalWeight);
    const total = $derived($grandTotal);
    const availability = $derived($availabilitySummary);
    const items = $derived($offerItems);

    async function handleGeneratePdf() {
        if (count === 0) return;
        generatingPdf = true;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // ===== HEADER =====
            // Logo placeholder (teal accent bar)
            doc.setFillColor(57, 158, 162); // Teal accent
            doc.rect(15, 10, 6, 25, "F");

            // Company name
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(26, 32, 44);
            doc.text("TIMBA SYSTEMS", 25, 22);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text("Quality Timber Products", 25, 30);

            // Quotation title (right aligned)
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(57, 158, 162);
            doc.text("QUOTATION", pageWidth - 15, 22, { align: "right" });

            // Date
            const date = new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text(`Date: ${date}`, pageWidth - 15, 30, { align: "right" });

            // Separator line
            doc.setDrawColor(226, 232, 240);
            doc.line(15, 40, pageWidth - 15, 40);

            // ===== TABLE HEADER =====
            let y = 52;
            doc.setFillColor(26, 32, 44);
            doc.roundedRect(15, y - 6, pageWidth - 30, 12, 2, 2, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("CODE", 18, y);
            doc.text("DESCRIPTION", 50, y);
            doc.text("UNIT PRICE", 120, y, { align: "right" });
            doc.text("QTY", 145, y, { align: "right" });
            doc.text("TOTAL", pageWidth - 18, y, { align: "right" });

            // ===== TABLE ROWS =====
            y += 14;
            doc.setTextColor(26, 32, 44);
            doc.setFont("helvetica", "normal");

            let rowIndex = 0;
            for (const item of items) {
                if (y > pageHeight - 60) {
                    doc.addPage();
                    y = 20;
                }

                // Alternating row background
                if (rowIndex % 2 === 1) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(15, y - 5, pageWidth - 30, 8, "F");
                }

                const desc =
                    item.description.length > 35
                        ? item.description.slice(0, 32) + "..."
                        : item.description;

                doc.setFont("helvetica", "bold");
                doc.text(item.itemCode, 18, y);
                doc.setFont("helvetica", "normal");
                doc.text(desc, 50, y);
                doc.text(`£${item.unitPrice.toFixed(2)}`, 120, y, {
                    align: "right",
                });
                doc.text(item.quantity.toString(), 145, y, { align: "right" });
                doc.setFont("helvetica", "bold");
                doc.text(`£${item.lineTotal.toFixed(2)}`, pageWidth - 18, y, {
                    align: "right",
                });

                y += 8;
                rowIndex++;
            }

            // ===== TOTALS SECTION =====
            y += 8;
            doc.setDrawColor(226, 232, 240);
            doc.line(100, y, pageWidth - 15, y);

            y += 10;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("Total Weight:", 120, y);
            doc.setFont("helvetica", "bold");
            doc.text(`${weight.toFixed(2)} kg`, pageWidth - 18, y, {
                align: "right",
            });

            y += 8;
            doc.setFillColor(57, 158, 162);
            doc.roundedRect(100, y - 5, pageWidth - 115, 12, 2, 2, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.text("GRAND TOTAL:", 105, y + 1);
            doc.text(`£${total.toFixed(2)}`, pageWidth - 18, y + 1, {
                align: "right",
            });

            // ===== FOOTER =====
            const footerY = pageHeight - 25;
            doc.setDrawColor(226, 232, 240);
            doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text(
                "Timba Systems Ltd | info@timbasystems.com | +44 (0) 123 456 7890",
                pageWidth / 2,
                footerY,
                { align: "center" },
            );
            doc.text(
                "Prices valid for 30 days from quotation date. Subject to availability.",
                pageWidth / 2,
                footerY + 5,
                { align: "center" },
            );

            // Save PDF
            doc.save(`Timba-Quotation-${Date.now()}.pdf`);

            toast.success("PDF downloaded successfully");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
        } finally {
            generatingPdf = false;
        }
    }

    async function handleCopyToClipboard() {
        if (count === 0) return;

        const text = formatOfferAsText(items, total, weight);

        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            toast.error("Failed to copy to clipboard");
        }
    }

    async function handleSaveDraft() {
        if (count === 0) return;
        savingDraft = true;

        try {
            const response = await fetch("/api/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) {
                throw new Error("Failed to save offer");
            }

            const data = await response.json();
            toast.success(`Offer saved as ${data.offer.orderNumber}`);
        } catch (error) {
            console.error("Error saving draft:", error);
            toast.error("Failed to save offer");
        } finally {
            savingDraft = false;
        }
    }

    function handleClearAll() {
        showClearConfirm = true;
    }

    function confirmClear() {
        offerItems.clearOffer();
        showClearConfirm = false;
        toast.info("Offer cleared");
    }
</script>

<div class="offer-summary">
    <h3 class="summary-title">Summary</h3>

    <div class="stats">
        <div class="stat">
            <span class="stat-label">Items</span>
            <span class="stat-value">{count}</span>
        </div>
        <div class="stat highlight">
            <span class="stat-label">Total Weight</span>
            <span class="stat-value weight">{weight.toFixed(2)} kg</span>
        </div>
        <div class="stat highlight">
            <span class="stat-label">Grand Total</span>
            <span class="stat-value total">£{total.toFixed(2)}</span>
        </div>
    </div>

    {#if availability.hasUnavailable}
        <div class="availability-warning">
            ⚠️ {availability.unavailableCount} item{availability.unavailableCount >
            1
                ? "s"
                : ""} exceed stock
        </div>
    {/if}

    <div class="actions">
        <Button
            variant="primary"
            onclick={handleGeneratePdf}
            disabled={count === 0}
            loading={generatingPdf}
            fullWidth
        >
            🖨️ Print / PDF
        </Button>

        <Button
            variant="secondary"
            onclick={handleCopyToClipboard}
            disabled={count === 0}
            fullWidth
        >
            📋 Copy for Email
        </Button>

        <Button
            variant="secondary"
            onclick={handleSaveDraft}
            disabled={count === 0}
            loading={savingDraft}
            fullWidth
        >
            💾 Save Draft
        </Button>

        <Button
            variant="ghost"
            onclick={handleClearAll}
            disabled={count === 0}
            fullWidth
        >
            🗑️ Clear All
        </Button>
    </div>
</div>

<Modal open={showClearConfirm} onclose={() => (showClearConfirm = false)}>
    <div class="confirm-modal">
        <h3>Clear All Items?</h3>
        <p>
            This will remove all {count} items from your offer. This cannot be undone.
        </p>
        <div class="confirm-actions">
            <Button
                variant="secondary"
                onclick={() => (showClearConfirm = false)}
            >
                Cancel
            </Button>
            <Button variant="danger" onclick={confirmClear}>Clear All</Button>
        </div>
    </div>
</Modal>

<style>
    .offer-summary {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 24px;
        box-shadow: var(--shadow-md);
    }

    .summary-title {
        font-family: "DM Sans", sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border);
    }

    .stats {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 20px;
    }

    .stat {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }

    .stat.highlight {
        background: var(--color-accent-light);
        margin: 0 -12px;
        padding: 12px;
        border-radius: 8px;
    }

    .stat-label {
        font-size: 14px;
        color: var(--color-text-secondary);
    }

    .stat-value {
        font-family: "JetBrains Mono", monospace;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text);
    }

    .stat-value.weight {
        color: var(--color-text);
    }

    .stat-value.total {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-accent);
    }

    .availability-warning {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid var(--color-warning);
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 13px;
        color: var(--color-warning);
        margin-bottom: 20px;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .confirm-modal {
        padding: 8px;
    }

    .confirm-modal h3 {
        font-family: "DM Sans", sans-serif;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px;
        color: var(--color-text);
    }

    .confirm-modal p {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 0 0 20px;
    }

    .confirm-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }
</style>
