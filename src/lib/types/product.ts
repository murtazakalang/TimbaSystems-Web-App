import type { Prisma } from '@prisma/client';

// Re-export Decimal type for convenience
export type Decimal = Prisma.Decimal;

export interface Product {
    itemCode: string;
    productGroup: string | null;
    supplierDescription: string | null;
    timbaDescription: string | null;
    piecesPerPackage: number;
    unitOfMeasure: string;
    priceListGBP: Decimal;
    discount1Pct: Decimal;
    discount2Pct: Decimal;
    unitDiscountedPrice: Decimal;
    transportCost: Decimal;
    costGBP: Decimal;
    trueCostGBP: Decimal;
    markupPct: Decimal;
    marginPct: Decimal;
    sellingPriceUnit: Decimal;
    sellingPriceBox: Decimal;
    netUnitWeightKg: Decimal;
    weightPerBoxKg: Decimal;
    brand: string | null;
    line: string | null;
    diameter: string | null;
    length: string | null;
    hsCode: string | null;
    eanCode: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductListItem {
    itemCode: string;
    supplierDescription: string | null;
    piecesPerPackage: number;
    priceListGBP: number;
    discount1Pct: number;
    costGBP: number;
    trueCostGBP: number;
    timbaDescription: string | null;
    marginPct: number;
    sellingPriceUnit: number;
    netUnitWeightKg: number;
    stockQuantity: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface ProductFilters {
    search?: string;
    brand?: string;
    stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    page?: number;
    limit?: number;
}

export interface ProductWithStock extends Product {
    stock: {
        quantityAvailable: number;
        lastUpdated: Date;
    } | null;
}

export interface ProductUpdatePayload {
    timbaDescription?: string;
    markupPct?: number;
    transportCost?: number;
    sellingPriceUnit?: number;
    sellingPriceBox?: number;
    marginPct?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
