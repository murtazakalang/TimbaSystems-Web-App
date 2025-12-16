import prisma from '../db';
import type { ProductFilters, ProductListItem, ProductWithStock, ProductUpdatePayload, PaginatedResponse } from '$lib/types/product';
import type { Prisma } from '@prisma/client';

const LOW_STOCK_THRESHOLD = 50;

/**
 * Get all products with filtering, searching, and pagination
 */
export async function getAllProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<ProductListItem>> {
    const { search, brand, stockStatus, page = 1, limit = 25 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    // Search filter - search in code and descriptions
    if (search) {
        where.OR = [
            { itemCode: { contains: search, mode: 'insensitive' } },
            { timbaDescription: { contains: search, mode: 'insensitive' } },
            { supplierDescription: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Brand filter
    if (brand) {
        where.brand = brand;
    }

    // Stock status filter - requires join with stock table
    if (stockStatus && stockStatus !== 'all') {
        if (stockStatus === 'out_of_stock') {
            where.stock = { quantityAvailable: { equals: 0 } };
        } else if (stockStatus === 'low_stock') {
            where.stock = {
                quantityAvailable: { gt: 0, lte: LOW_STOCK_THRESHOLD },
            };
        } else if (stockStatus === 'in_stock') {
            where.stock = { quantityAvailable: { gt: LOW_STOCK_THRESHOLD } };
        }
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: { stock: true },
            skip,
            take: limit,
            orderBy: { itemCode: 'asc' },
        }),
        prisma.product.count({ where }),
    ]);

    const items: ProductListItem[] = products.map((p) => ({
        itemCode: p.itemCode,
        timbaDescription: p.timbaDescription,
        supplierDescription: p.supplierDescription,
        sellingPriceUnit: Number(p.sellingPriceUnit),
        netUnitWeightKg: Number(p.netUnitWeightKg),
        brand: p.brand,
        stockQuantity: p.stock?.quantityAvailable ?? 0,
        stockStatus: getStockStatus(p.stock?.quantityAvailable ?? 0),
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
 * Get a single product by its item code
 */
export async function getProductByCode(code: string): Promise<ProductWithStock | null> {
    const product = await prisma.product.findUnique({
        where: { itemCode: code },
        include: { stock: true },
    });

    if (!product) return null;

    return {
        ...product,
        stock: product.stock
            ? {
                quantityAvailable: product.stock.quantityAvailable,
                lastUpdated: product.stock.lastUpdated,
            }
            : null,
    };
}

/**
 * Update a product's editable fields (markup, description, etc.)
 */
export async function updateProduct(code: string, data: ProductUpdatePayload) {
    return prisma.product.update({
        where: { itemCode: code },
        data: {
            ...data,
            updatedAt: new Date(),
        },
    });
}

/**
 * Bulk upsert products - used for importing price lists
 */
export async function bulkUpsertProducts(
    products: Array<{
        itemCode: string;
        [key: string]: unknown;
    }>
) {
    const results = {
        created: 0,
        updated: 0,
        errors: [] as Array<{ itemCode: string; error: string }>,
    };

    for (const product of products) {
        try {
            // Check if product exists
            const existing = await prisma.product.findUnique({
                where: { itemCode: product.itemCode },
            });

            await prisma.product.upsert({
                where: { itemCode: product.itemCode },
                update: product,
                create: product as Prisma.ProductCreateInput,
            });

            if (existing) {
                results.updated++;
            } else {
                results.created++;

                // Create stock record for new products
                await prisma.stock.create({
                    data: {
                        itemCode: product.itemCode,
                        quantityAvailable: 0,
                    },
                });
            }
        } catch (error) {
            results.errors.push({
                itemCode: product.itemCode,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return results;
}

/**
 * Get all unique brands for filter dropdown
 */
export async function getUniqueBrands(): Promise<string[]> {
    const brands = await prisma.product.findMany({
        select: { brand: true },
        distinct: ['brand'],
        where: { brand: { not: null } },
        orderBy: { brand: 'asc' },
    });

    return brands
        .map((b) => b.brand)
        .filter((b): b is string => b !== null);
}

/**
 * Search products for autocomplete (returns minimal data for speed)
 */
export async function searchProducts(query: string, limit: number = 10) {
    if (!query || query.length < 2) return [];

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { itemCode: { contains: query, mode: 'insensitive' } },
                { timbaDescription: { contains: query, mode: 'insensitive' } },
                { supplierDescription: { contains: query, mode: 'insensitive' } },
            ],
        },
        select: {
            itemCode: true,
            timbaDescription: true,
            supplierDescription: true,
            sellingPriceUnit: true,
            netUnitWeightKg: true,
            stock: {
                select: {
                    quantityAvailable: true,
                },
            },
        },
        take: limit,
    });

    return products.map((p) => ({
        itemCode: p.itemCode,
        description: p.timbaDescription ?? p.supplierDescription,
        price: Number(p.sellingPriceUnit),
        weight: Number(p.netUnitWeightKg),
        stock: p.stock?.quantityAvailable ?? 0,
        stockStatus: getStockStatus(p.stock?.quantityAvailable ?? 0),
    }));
}

/**
 * Helper function to determine stock status
 */
function getStockStatus(qty: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (qty === 0) return 'out_of_stock';
    if (qty <= LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
}
