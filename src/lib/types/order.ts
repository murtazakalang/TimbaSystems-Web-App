export interface Order {
    id: number;
    orderNumber: string;
    status: 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    totalValue: number;
    totalWeight: number;
    totalMargin: number;
    totalItems: number;
    createdAt: Date;
    updatedAt: Date;
    items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    orderId: number;
    itemCode: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    lineWeight: number;
    lineMargin: number;
    available: boolean;
}

export interface OrderSummary {
    totalItems: number;
    totalWeight: number;
    grandTotal: number;
    totalMargin: number;
    avgMarginPct: number;
    availableCount: number;
    unavailableCount: number;
}

export interface CreateOrderItemPayload {
    itemCode: string;
    quantity: number;
}

export interface CreateOrderPayload {
    items: CreateOrderItemPayload[];
}

export interface OrderListItem {
    id: number;
    orderNumber: string;
    status: Order['status'];
    totalValue: number;
    totalItems: number;
    createdAt: Date;
}
