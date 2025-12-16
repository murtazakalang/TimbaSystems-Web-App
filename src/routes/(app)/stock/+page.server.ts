import type { PageServerLoad } from './$types';
import { getStockLevels, getStockSummary } from '$lib/server/services/stockService';
import type { StockFilters } from '$lib/types/stock';

export const load: PageServerLoad = async ({ url }) => {
    const search = url.searchParams.get('search') || undefined;
    const status = url.searchParams.get('status') as StockFilters['status'] || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '25', 10);

    const [stockResult, summary] = await Promise.all([
        getStockLevels({ search, status, page, limit }),
        getStockSummary()
    ]);

    return {
        stocks: stockResult.items,
        pagination: stockResult.pagination,
        summary,
        filters: {
            search: search || '',
            status: status || 'all'
        }
    };
};
