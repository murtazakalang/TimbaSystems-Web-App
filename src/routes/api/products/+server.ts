import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllProducts, getUniqueBrands } from '$lib/server/services/productService';
import type { ProductFilters } from '$lib/types/product';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const search = url.searchParams.get('search') || undefined;
        const brand = url.searchParams.get('brand') || undefined;
        const stockStatus = url.searchParams.get('stockStatus') as ProductFilters['stockStatus'] || undefined;
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '25', 10);

        // Check if brands list is requested
        const includeBrands = url.searchParams.get('includeBrands') === 'true';

        const [productsResult, brands] = await Promise.all([
            getAllProducts({ search, brand, stockStatus, page, limit }),
            includeBrands ? getUniqueBrands() : Promise.resolve([])
        ]);

        return json({
            ...productsResult,
            ...(includeBrands && { brands })
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
};
