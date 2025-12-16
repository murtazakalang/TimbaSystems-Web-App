import type { PageServerLoad } from './$types';
import { getAllProducts, getUniqueBrands } from '$lib/server/services/productService';
import type { ProductFilters } from '$lib/types/product';

export const load: PageServerLoad = async ({ url }) => {
    const search = url.searchParams.get('search') || undefined;
    const brand = url.searchParams.get('brand') || undefined;
    const stockStatus = url.searchParams.get('stockStatus') as ProductFilters['stockStatus'] || undefined;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '25', 10);

    const [productsResult, brands] = await Promise.all([
        getAllProducts({ search, brand, stockStatus, page, limit }),
        getUniqueBrands()
    ]);

    return {
        products: productsResult.items,
        pagination: productsResult.pagination,
        brands,
        filters: {
            search: search || '',
            brand: brand || '',
            stockStatus: stockStatus || 'all'
        }
    };
};
