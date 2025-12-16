import prisma from '../db';
import type { StockFilters, StockHistoryEntry, StockUpdatePayload, StockSummary, StockWithProduct } from '$lib/types/stock';
import type { PaginatedResponse } from '$lib/types/product';
import type { Prisma } from '@prisma/client';

const LOW_STOCK_THRESHOLD = 50;

/**
 * Get stock levels for all products with filtering and pagination
 */
export async function getStockLevels(filters: StockFilters = {}): Promise<PaginatedResponse<StockWithProduct>> {
    const { search, status, page = 1, limit = 25 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.StockWhereInput = {};

    // Search filter (search in related product)
    if (search) {
        where.product = {
            OR: [
                { itemCode: { contains: search, mode: 'insensitive' } },
                { timbaDescription: { contains: search, mode: 'insensitive' } },
                { supplierDescription: { contains: search, mode: 'insensitive' } },
            ],
        };
    }

    // Stock status filter
    if (status && status !== 'all') {
        if (status === 'out_of_stock') {
            where.quantityAvailable = { equals: 0 };
        } else if (status === 'low_stock') {
            where.quantityAvailable = { gt: 0, lte: LOW_STOCK_THRESHOLD };
        } else if (status === 'in_stock') {
            where.quantityAvailable = { gt: LOW_STOCK_THRESHOLD };
        }
    }

    const [stocks, total] = await Promise.all([
        prisma.stock.findMany({
            where,
            include: {
                product: {
                    select: {
                        timbaDescription: true,
                        supplierDescription: true,
                        sellingPriceUnit: true,
                        netUnitWeightKg: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { itemCode: 'asc' },
        }),
        prisma.stock.count({ where }),
    ]);

    const items: StockWithProduct[] = stocks.map((s) => ({
        itemCode: s.itemCode,
        quantityAvailable: s.quantityAvailable,
        lastUpdated: s.lastUpdated,
        description: s.product.timbaDescription ?? s.product.supplierDescription,
        sellingPrice: Number(s.product.sellingPriceUnit),
        weight: Number(s.product.netUnitWeightKg),
        status: getStockStatus(s.quantityAvailable),
    }));

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Update stock quantity for a product
 * Handles RECEIVE, ADJUST, SALE, and RETURN operations
 */
export async function updateStock(payload: StockUpdatePayload) {
    const { itemCode, quantity, changeType, notes } = payload;

    return prisma.$transaction(async (tx) => {
        // Get current stock
        const currentStock = await tx.stock.findUnique({
            where: { itemCode },
        });

        if (!currentStock) {
            // Create stock record if it doesn't exist
            const newStock = await tx.stock.create({
                data: {
                    itemCode,
                    quantityAvailable: quantity,
                },
            });

            // Log the history
            await tx.stockHistory.create({
                data: {
                    itemCode,
                    quantityChange: quantity,
                    quantityAfter: quantity,
                    changeType,
                    notes,
                },
            });

            return newStock;
        }

        // Calculate new quantity based on change type
        let newQuantity: number;
        let quantityChangeForLog: number;

        switch (changeType) {
            case 'RECEIVE':
            case 'RETURN':
                newQuantity = currentStock.quantityAvailable + quantity;
                quantityChangeForLog = quantity;
                break;
            case 'SALE':
                newQuantity = currentStock.quantityAvailable - quantity;
                quantityChangeForLog = -quantity;
                break;
            case 'ADJUST':
            default:
                newQuantity = quantity;
                quantityChangeForLog = quantity - currentStock.quantityAvailable;
                break;
        }

        // Ensure non-negative
        newQuantity = Math.max(0, newQuantity);

        // Update stock
        const updatedStock = await tx.stock.update({
            where: { itemCode },
            data: { quantityAvailable: newQuantity },
        });

        // Log the history
        await tx.stockHistory.create({
            data: {
                itemCode,
                quantityChange: quantityChangeForLog,
                quantityAfter: newQuantity,
                changeType,
                notes,
            },
        });

        return updatedStock;
    });
}

/**
 * Get stock history for a specific product
 */
export async function getStockHistory(itemCode: string, limit: number = 50): Promise<StockHistoryEntry[]> {
    const history = await prisma.stockHistory.findMany({
        where: { itemCode },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    return history.map((h) => ({
        id: h.id,
        itemCode: h.itemCode,
        quantityChange: h.quantityChange,
        quantityAfter: h.quantityAfter,
        changeType: h.changeType as StockHistoryEntry['changeType'],
        notes: h.notes,
        createdAt: h.createdAt,
    }));
}

/**
 * Get stock summary statistics
 */
export async function getStockSummary(): Promise<StockSummary> {
    const [inStock, lowStock, outOfStock, valueResult] = await Promise.all([
        prisma.stock.count({
            where: { quantityAvailable: { gt: LOW_STOCK_THRESHOLD } },
        }),
        prisma.stock.count({
            where: { quantityAvailable: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
        }),
        prisma.stock.count({
            where: { quantityAvailable: { equals: 0 } },
        }),
        // Calculate total stock value
        prisma.$queryRaw<{ total: number | null }[]>`
      SELECT COALESCE(SUM(s.quantity_available::numeric * p.selling_price_unit), 0) as total
      FROM stock s
      JOIN products p ON s.item_code = p.item_code
    `,
    ]);

    return {
        inStock,
        lowStock,
        outOfStock,
        totalProducts: inStock + lowStock + outOfStock,
        totalValue: Number(valueResult[0]?.total ?? 0),
    };
}

/**
 * Create initial stock records for all products that don't have one
 */
export async function initializeStockForAllProducts() {
    const productsWithoutStock = await prisma.product.findMany({
        where: {
            stock: null,
        },
        select: {
            itemCode: true,
        },
    });

    if (productsWithoutStock.length === 0) {
        return { created: 0 };
    }

    await prisma.stock.createMany({
        data: productsWithoutStock.map((p) => ({
            itemCode: p.itemCode,
            quantityAvailable: 0,
        })),
        skipDuplicates: true,
    });

    return { created: productsWithoutStock.length };
}

/**
 * Helper function to determine stock status
 */
function getStockStatus(qty: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (qty === 0) return 'out_of_stock';
    if (qty <= LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
}
