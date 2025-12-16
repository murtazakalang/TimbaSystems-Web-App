import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';

/**
 * GET /api/offers - List all saved offers
 */
export const GET: RequestHandler = async () => {
    try {
        const orders = await prisma.order.findMany({
            where: { status: 'DRAFT' },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return json({
            offers: orders.map((o) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                totalValue: Number(o.totalValue),
                totalWeight: Number(o.totalWeight),
                totalItems: o.totalItems,
                createdAt: o.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching offers:', error);
        return json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
};

/**
 * POST /api/offers - Save offer as draft
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { items, name } = body as {
            items: Array<{
                itemCode: string;
                description: string;
                unitPrice: number;
                quantity: number;
                lineTotal: number;
                lineWeight: number;
                available: boolean;
            }>;
            name?: string;
        };

        if (!items || !Array.isArray(items) || items.length === 0) {
            return json({ error: 'Items are required' }, { status: 400 });
        }

        // Calculate totals
        const totalValue = items.reduce((sum, item) => sum + item.lineTotal, 0);
        const totalWeight = items.reduce((sum, item) => sum + item.lineWeight, 0);
        const totalMargin = 0; // Not calculating margin for offers

        // Generate order number
        const timestamp = Date.now().toString(36).toUpperCase();
        const orderNumber = name || `QO-${timestamp}`;

        // Create the order with items
        const order = await prisma.order.create({
            data: {
                orderNumber,
                status: 'DRAFT',
                totalValue,
                totalWeight,
                totalMargin,
                totalItems: items.length,
                items: {
                    create: items.map((item) => ({
                        itemCode: item.itemCode,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        lineTotal: item.lineTotal,
                        lineWeight: item.lineWeight,
                        lineMargin: 0,
                        available: item.available,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        return json({
            success: true,
            offer: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalValue: Number(order.totalValue),
                totalWeight: Number(order.totalWeight),
                totalItems: order.totalItems,
                createdAt: order.createdAt,
            },
        });
    } catch (error) {
        console.error('Error saving offer:', error);
        return json({ error: 'Failed to save offer' }, { status: 500 });
    }
};
