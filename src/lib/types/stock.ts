export interface Stock {
    itemCode: string;
    quantityAvailable: number;
    lastUpdated: Date;
}

export interface StockWithProduct extends Stock {
    supplierDescription: string | null;
    piecesPerPackage: number;
    priceListGBP: number;
    discount1Pct: number;
    costGBP: number;
    trueCostGBP: number;
    timbaDescription: string | null;
    marginPct: number;
    sellingPrice: number;
    weight: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface StockHistoryEntry {
    id: number;
    itemCode: string;
    quantityChange: number;
    quantityAfter: number;
    changeType: 'RECEIVE' | 'ADJUST' | 'SALE' | 'RETURN';
    notes: string | null;
    createdAt: Date;
}

export interface StockFilters {
    search?: string;
    status?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    page?: number;
    limit?: number;
}

export interface StockUpdatePayload {
    itemCode: string;
    quantity: number;
    changeType: 'RECEIVE' | 'ADJUST' | 'SALE' | 'RETURN';
    notes?: string;
}

export interface StockSummary {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalProducts: number;
    totalValue: number;
}
