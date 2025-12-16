import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProductByCode, updateProduct } from '$lib/server/services/productService';
import type { ProductUpdatePayload } from '$lib/types/product';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const { code } = params;

        if (!code) {
            return json({ error: 'Product code is required' }, { status: 400 });
        }

        const product = await getProductByCode(code);

        if (!product) {
            return json({ error: 'Product not found' }, { status: 404 });
        }

        return json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
};

export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const { code } = params;

        if (!code) {
            return json({ error: 'Product code is required' }, { status: 400 });
        }

        const body = await request.json() as ProductUpdatePayload;

        // Validate that at least one field is being updated
        const allowedFields: (keyof ProductUpdatePayload)[] = [
            'markupPct',
            'transportCost',
            'timbaDescription',
            'marginPct',
            'sellingPriceUnit',
            'sellingPriceBox'
        ];

        const updateData: ProductUpdatePayload = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                (updateData as Record<string, unknown>)[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const updatedProduct = await updateProduct(code, updateData);

        return json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);

        // Check for not found error
        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return json({ error: 'Product not found' }, { status: 404 });
        }

        return json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
};
