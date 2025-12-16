import type { PageServerLoad } from './$types';
import prisma from '$lib/server/db';

const LOW_STOCK_THRESHOLD = 50;

export const load: PageServerLoad = async () => {
    try {
        // Get product counts
        const [total, inStock, lowStock, outOfStock] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({
                where: {
                    stock: {
                        quantityAvailable: { gt: LOW_STOCK_THRESHOLD }
                    }
                }
            }),
            prisma.product.count({
                where: {
                    stock: {
                        quantityAvailable: { gt: 0, lte: LOW_STOCK_THRESHOLD }
                    }
                }
            }),
            prisma.product.count({
                where: {
                    stock: {
                        quantityAvailable: { equals: 0 }
                    }
                }
            }),
        ]);

        // Get recent offers (last 5) - stored as Orders with status DRAFT
        const recentOffers = await prisma.order.findMany({
            where: { status: 'DRAFT' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true,
                totalValue: true,
                items: {
                    select: { id: true }
                }
            }
        });

        // Get recent stock updates (last 5)
        const recentStockUpdates = await prisma.stockHistory.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                stock: {
                    include: {
                        product: {
                            select: {
                                timbaDescription: true,
                                supplierDescription: true
                            }
                        }
                    }
                }
            }
        });

        return {
            stats: {
                total,
                inStock,
                lowStock,
                outOfStock
            },
            recentOffers: recentOffers.map(offer => ({
                id: offer.id,
                offerNumber: offer.orderNumber,
                createdAt: offer.createdAt.toISOString(),
                totalValue: Number(offer.totalValue),
                itemCount: offer.items.length
            })),
            recentStockUpdates: recentStockUpdates.map(update => ({
                id: update.id,
                itemCode: update.itemCode,
                description: update.stock?.product?.timbaDescription ??
                    update.stock?.product?.supplierDescription ?? null,
                quantityChange: update.quantityChange,
                createdAt: update.createdAt.toISOString()
            }))
        };
    } catch (error) {
        console.error('Dashboard load error:', error);
        return {
            stats: { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 },
            recentOffers: [],
            recentStockUpdates: []
        };
    }
};
