// Quick Offer Types

export interface OfferItem {
    itemCode: string;
    description: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    weight: number;
    lineWeight: number;
    stockAvailable: number;
    available: boolean;
}

export interface Offer {
    id?: number;
    items: OfferItem[];
    totalItems: number;
    totalWeight: number;
    grandTotal: number;
    status: 'DRAFT' | 'SAVED';
    createdAt: Date;
    updatedAt?: Date;
}

export interface SavedOffer extends Offer {
    id: number;
    name: string;
}

export interface OfferProductSearchResult {
    itemCode: string;
    description: string | null;
    price: number;
    weight: number;
    stock: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface CreateOfferPayload {
    name?: string;
    items: Array<{
        itemCode: string;
        quantity: number;
    }>;
}

export interface OfferPdfData {
    items: OfferItem[];
    totalWeight: number;
    grandTotal: number;
    date: string;
}
