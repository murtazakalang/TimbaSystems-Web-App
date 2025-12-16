import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';

/**
 * GET /api/offers/[id] - Get offer details
 */
export const GET: RequestHandler = async ({ params }) => {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return json({ error: 'Invalid offer ID' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                timbaDescription: true,
                                supplierDescription: true,
                                netUnitWeightKg: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return json({ error: 'Offer not found' }, { status: 404 });
        }

        return json({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalValue: Number(order.totalValue),
            totalWeight: Number(order.totalWeight),
            totalItems: order.totalItems,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
                itemCode: item.itemCode,
                description:
                    item.product.timbaDescription ??
                    item.product.supplierDescription ??
                    item.itemCode,
                unitPrice: Number(item.unitPrice),
                quantity: item.quantity,
                lineTotal: Number(item.lineTotal),
                weight: Number(item.product.netUnitWeightKg),
                lineWeight: Number(item.lineWeight),
                available: item.available,
            })),
        });
    } catch (error) {
        console.error('Error fetching offer:', error);
        return json({ error: 'Failed to fetch offer' }, { status: 500 });
    }
};

/**
 * DELETE /api/offers/[id] - Delete offer
 */
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return json({ error: 'Invalid offer ID' }, { status: 400 });
        }

        await prisma.order.delete({
            where: { id },
        });

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting offer:', error);
        return json({ error: 'Failed to delete offer' }, { status: 500 });
    }
};
