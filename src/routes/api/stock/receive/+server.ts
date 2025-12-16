import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateStock } from '$lib/server/services/stockService';
import prisma from '$lib/server/db';

/**
 * POST /api/stock/receive
 * Receive stock - add quantity to existing stock
 * Used when deliveries arrive at the warehouse
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { itemCode, quantity, notes } = body;

        // Validate required fields
        if (!itemCode || typeof itemCode !== 'string') {
            return json(
                { success: false, error: 'Item code is required' },
                { status: 400 }
            );
        }

        if (typeof quantity !== 'number' || quantity <= 0) {
            return json(
                { success: false, error: 'Quantity must be a positive number' },
                { status: 400 }
            );
        }

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { itemCode },
            select: {
                itemCode: true,
                timbaDescription: true,
                supplierDescription: true
            }
        });

        if (!product) {
            return json(
                { success: false, error: `Product with code "${itemCode}" not found` },
                { status: 404 }
            );
        }

        // Update stock using RECEIVE change type
        const updatedStock = await updateStock({
            itemCode,
            quantity,
            changeType: 'RECEIVE',
            notes: notes || `Stock received: +${quantity} units`
        });

        return json({
            success: true,
            data: {
                itemCode: updatedStock.itemCode,
                quantityAvailable: updatedStock.quantityAvailable,
                quantityAdded: quantity,
                lastUpdated: updatedStock.lastUpdated,
                productDescription: product.timbaDescription ?? product.supplierDescription
            }
        });
    } catch (error) {
        console.error('Error receiving stock:', error);
        return json(
            { success: false, error: 'Failed to receive stock' },
            { status: 500 }
        );
    }
};
