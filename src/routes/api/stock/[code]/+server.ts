import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateStock, getStockHistory } from '$lib/server/services/stockService';
import prisma from '$lib/server/db';

/**
 * GET /api/stock/[code]
 * Get stock for a specific product including recent history
 */
export const GET: RequestHandler = async ({ params }) => {
    try {
        const { code } = params;

        const [stock, history] = await Promise.all([
            prisma.stock.findUnique({
                where: { itemCode: code },
                include: {
                    product: {
                        select: {
                            timbaDescription: true,
                            supplierDescription: true,
                            sellingPriceUnit: true,
                            netUnitWeightKg: true,
                        }
                    }
                }
            }),
            getStockHistory(code, 10)
        ]);

        if (!stock) {
            return json(
                { success: false, error: 'Stock record not found' },
                { status: 404 }
            );
        }

        return json({
            success: true,
            data: {
                itemCode: stock.itemCode,
                quantityAvailable: stock.quantityAvailable,
                lastUpdated: stock.lastUpdated,
                description: stock.product.timbaDescription ?? stock.product.supplierDescription,
                sellingPrice: Number(stock.product.sellingPriceUnit),
                weight: Number(stock.product.netUnitWeightKg),
                history
            }
        });
    } catch (error) {
        console.error('Error fetching stock:', error);
        return json(
            { success: false, error: 'Failed to fetch stock' },
            { status: 500 }
        );
    }
};

/**
 * PUT /api/stock/[code]
 * Update stock quantity for a product (for inline editing)
 */
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const { code } = params;
        const body = await request.json();
        const { quantity, changeType = 'ADJUST', notes } = body;

        if (typeof quantity !== 'number' || quantity < 0) {
            return json(
                { success: false, error: 'Invalid quantity. Must be a non-negative number.' },
                { status: 400 }
            );
        }

        const updatedStock = await updateStock({
            itemCode: code,
            quantity,
            changeType,
            notes
        });

        return json({
            success: true,
            data: {
                itemCode: updatedStock.itemCode,
                quantityAvailable: updatedStock.quantityAvailable,
                lastUpdated: updatedStock.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        return json(
            { success: false, error: 'Failed to update stock' },
            { status: 500 }
        );
    }
};
