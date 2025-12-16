import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { OfferItem } from '$lib/types/offer';

/**
 * POST /api/offers/pdf - Generate PDF data
 * Returns structured data for client-side PDF generation
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { items, totalWeight, grandTotal } = body as {
            items: OfferItem[];
            totalWeight: number;
            grandTotal: number;
        };

        if (!items || !Array.isArray(items) || items.length === 0) {
            return json({ error: 'Items are required' }, { status: 400 });
        }

        // Format the date
        const date = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

        // Return structured PDF data
        // Actual PDF generation happens client-side with jsPDF
        return json({
            success: true,
            pdfData: {
                title: 'TIMBA SYSTEMS',
                subtitle: 'QUOTATION',
                date,
                items: items.map((item) => ({
                    code: item.itemCode,
                    description: item.description,
                    unitPrice: item.unitPrice.toFixed(2),
                    quantity: item.quantity,
                    lineTotal: item.lineTotal.toFixed(2),
                })),
                totalWeight: totalWeight.toFixed(2),
                grandTotal: grandTotal.toFixed(2),
            },
        });
    } catch (error) {
        console.error('Error generating PDF data:', error);
        return json({ error: 'Failed to generate PDF data' }, { status: 500 });
    }
};
