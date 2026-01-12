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
            'supplierDescription', 'description', 'piecesPerPackage', 'priceList', 'discount',
            'discount2', 'cost', 'trueCost', 'margin', 'sellingPrice', 'unitWeight',
            'stockQuantity', 'brand', 'productGroup', 'unitOfMeasure', 'hsCode', 'eanCode'
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

        // Map field names to Prisma model field names with calculations
        const productsToUpsert = transformedData.map(row => {
            // Get raw values with defaults
            const piecesPerPackage = row.piecesPerPackage ? Number(row.piecesPerPackage) : 1;
            const priceListGBP = row.priceList ? Number(row.priceList) : 0;
            const discount1Pct = row.discount ? Number(row.discount) : 0;

            // Calculate Cost: Unity × Price List × (1 - Discount%)
            const costGBP = row.cost
                ? Number(row.cost)
                : Math.round((piecesPerPackage * priceListGBP * (1 - discount1Pct / 100)) * 100) / 100;

            // True Cost defaults to Cost if not provided
            const trueCostGBP = row.trueCost ? Number(row.trueCost) : costGBP;

            // Margin defaults to 25%
            const marginPct = row.margin ? Number(row.margin) : 25;

            // Calculate Selling Price: True Cost / (1 - Margin%)
            const sellingPriceUnit = row.sellingPrice
                ? Number(row.sellingPrice)
                : Math.round((trueCostGBP / (1 - marginPct / 100)) * 100) / 100;

            // Description defaults to Supplier Description
            const supplierDescription = row.supplierDescription ? String(row.supplierDescription) : undefined;
            const timbaDescription = row.description ? String(row.description) : supplierDescription;

            return {
                itemCode: String(row.itemCode),
                supplierDescription,
                timbaDescription,
                piecesPerPackage,
                priceListGbp: priceListGBP,
                discount1Pct,
                discount2Pct: row.discount2 ? Number(row.discount2) : undefined,
                costGbp: costGBP,
                trueCostGbp: trueCostGBP,
                marginPct,
                sellingPriceUnit,
                netUnitWeightKg: row.unitWeight ? Number(row.unitWeight) : 1.69, // Default: 1.69 kg
                stockQuantity: row.stockQuantity ? Number(row.stockQuantity) : 0,
                brand: row.brand ? String(row.brand) : undefined,
                productGroup: row.productGroup ? String(row.productGroup) : undefined,
                unitOfMeasure: row.unitOfMeasure ? String(row.unitOfMeasure) : undefined,
                hsCode: row.hsCode ? String(row.hsCode) : undefined,
                eanCode: row.eanCode ? String(row.eanCode) : undefined,
            };
        });

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
