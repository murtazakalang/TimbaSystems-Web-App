import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStockLevels, getStockSummary } from '$lib/server/services/stockService';
import type { StockFilters } from '$lib/types/stock';

/**
 * GET /api/stock
 * List all stock levels with product info, with filtering and pagination
 */
export const GET: RequestHandler = async ({ url }) => {
    try {
        const search = url.searchParams.get('search') || undefined;
        const status = url.searchParams.get('status') as StockFilters['status'] || undefined;
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '25', 10);
        const includeSummary = url.searchParams.get('includeSummary') === 'true';

        const filters: StockFilters = { search, status, page, limit };

        const [stockResult, summary] = await Promise.all([
            getStockLevels(filters),
            includeSummary ? getStockSummary() : null
        ]);

        return json({
            success: true,
            data: stockResult.items,
            pagination: stockResult.pagination,
            ...(summary && { summary })
        });
    } catch (error) {
        console.error('Error fetching stock levels:', error);
        return json(
            { success: false, error: 'Failed to fetch stock levels' },
            { status: 500 }
        );
    }
};
