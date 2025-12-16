import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { transformDataWithMapping } from '$lib/server/utils/fileParser';
import { bulkUpsertProducts } from '$lib/server/services/productService';
import prisma from '$lib/server/db';
import type { ImportColumnMapping, ImportResult } from '$lib/types/import';

interface ConfirmPayload {
    headers: string[];
    rows: unknown[][];
    mapping: ImportColumnMapping;
    fileName: string;
}

/**
 * POST /api/products/import/confirm
 * Apply the import with the specified column mapping
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json() as ConfirmPayload;
        const { headers, rows, mapping, fileName } = body;

        // Validate required field
        if (!mapping.itemCode) {
            throw error(400, 'Item Code mapping is required');
        }

        // Build mapping object with both required and optional fields
        const fullMapping: Record<string, string> = {};

        // Required field
        fullMapping['itemCode'] = mapping.itemCode;

        // Optional fields - only include if they are mapped
        const optionalFields: (keyof ImportColumnMapping)[] = [
            'description', 'piecesPerPackage', 'priceList', 'discount',
            'discount2', 'unitWeight', 'boxWeight', 'brand',
            'productGroup', 'unitOfMeasure', 'hsCode', 'eanCode'
        ];

        for (const field of optionalFields) {
            if (mapping[field]) {
                fullMapping[field] = mapping[field];
            }
        }

        // Transform data using mapping
        const transformedData = transformDataWithMapping(rows, headers, fullMapping);

        if (transformedData.length === 0) {
            throw error(400, 'No valid rows to import. Ensure Item Code is mapped correctly.');
        }

        // Map field names to Prisma model field names
        const productsToUpsert = transformedData.map(row => ({
            itemCode: String(row.itemCode),
            supplierDescription: row.description ? String(row.description) : undefined,
            piecesPerPackage: row.piecesPerPackage ? Number(row.piecesPerPackage) : undefined,
            priceListGbp: row.priceList ? Number(row.priceList) : undefined,
            discount1Pct: row.discount ? Number(row.discount) : undefined,
            discount2Pct: row.discount2 ? Number(row.discount2) : undefined,
            netUnitWeightKg: row.unitWeight ? Number(row.unitWeight) : undefined,
            weightPerBoxKg: row.boxWeight ? Number(row.boxWeight) : undefined,
            brand: row.brand ? String(row.brand) : undefined,
            productGroup: row.productGroup ? String(row.productGroup) : undefined,
            unitOfMeasure: row.unitOfMeasure ? String(row.unitOfMeasure) : undefined,
            hsCode: row.hsCode ? String(row.hsCode) : undefined,
            eanCode: row.eanCode ? String(row.eanCode) : undefined,
        }));

        // Perform bulk upsert
        const result = await bulkUpsertProducts(productsToUpsert);

        // Log the import
        await prisma.priceImportLog.create({
            data: {
                filename: fileName,
                recordsImported: result.created,
                recordsUpdated: result.updated,
            }
        });

        const importResult: ImportResult = {
            success: result.errors.length === 0,
            recordsImported: result.created,
            recordsUpdated: result.updated,
            errors: result.errors.map((e, index) => ({
                row: index + 2, // Account for header row
                field: 'itemCode',
                message: `${e.itemCode}: ${e.error}`
            }))
        };

        return json(importResult);

    } catch (err) {
        console.error('Import confirm error:', err);

        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }

        throw error(500, err instanceof Error ? err.message : 'Failed to apply import');
    }
};
