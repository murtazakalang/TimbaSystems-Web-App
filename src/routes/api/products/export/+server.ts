import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import * as XLSX from 'xlsx';

/**
 * GET /api/products/export?format=xlsx|csv
 * Export all products to Excel or CSV format
 */
export const GET: RequestHandler = async ({ url }) => {
    const format = url.searchParams.get('format') || 'xlsx';

    if (!['xlsx', 'csv'].includes(format)) {
        throw error(400, 'Invalid format. Use xlsx or csv.');
    }

    try {
        // Fetch all products with stock
        const products = await prisma.product.findMany({
            include: {
                stock: true
            },
            orderBy: { itemCode: 'asc' }
        });

        // Prepare data for export
        const exportData = products.map(product => ({
            'Item Code': product.itemCode,
            'Product Group': product.productGroup ?? '',
            'Supplier Description': product.supplierDescription ?? '',
            'Timba Description': product.timbaDescription ?? '',
            'Pieces/Package': product.piecesPerPackage,
            'Unit of Measure': product.unitOfMeasure,
            'Price List (GBP)': Number(product.priceListGBP),
            'Discount 1 %': Number(product.discount1Pct),
            'Discount 2 %': Number(product.discount2Pct),
            'Unit Discounted Price': Number(product.unitDiscountedPrice),
            'Transport Cost': Number(product.transportCost),
            'Markup %': Number(product.markupPct),
            'Margin %': Number(product.marginPct),
            'Selling Price/Unit': Number(product.sellingPriceUnit),
            'Selling Price/Box': Number(product.sellingPriceBox),
            'Net Unit Weight (kg)': Number(product.netUnitWeightKg),
            'Weight/Box (kg)': Number(product.weightPerBoxKg),
            'Brand': product.brand ?? '',
            'Line': product.line ?? '',
            'Diameter': product.diameter ?? '',
            'Length': product.length ?? '',
            'HS Code': product.hsCode ?? '',
            'EAN Code': product.eanCode ?? '',
            'Stock Quantity': product.stock?.quantityAvailable ?? 0
        }));

        // Create workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const colWidths = [
            { wch: 15 },  // Item Code
            { wch: 15 },  // Product Group
            { wch: 40 },  // Supplier Description
            { wch: 40 },  // Timba Description
            { wch: 12 },  // Pieces/Package
            { wch: 10 },  // Unit of Measure
            { wch: 14 },  // Price List
            { wch: 12 },  // Discount 1
            { wch: 12 },  // Discount 2
            { wch: 18 },  // Unit Discounted Price
            { wch: 12 },  // Transport Cost
            { wch: 10 },  // Markup
            { wch: 10 },  // Margin
            { wch: 14 },  // Selling Price Unit
            { wch: 14 },  // Selling Price Box
            { wch: 16 },  // Net Unit Weight
            { wch: 14 },  // Weight/Box
            { wch: 15 },  // Brand
            { wch: 15 },  // Line
            { wch: 10 },  // Diameter
            { wch: 10 },  // Length
            { wch: 12 },  // HS Code
            { wch: 14 },  // EAN Code
            { wch: 12 },  // Stock
        ];
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

        // Generate file
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `timba_products_${timestamp}`;

        if (format === 'xlsx') {
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            return new Response(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
                }
            });
        } else {
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);

            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${filename}.csv"`,
                }
            });
        }
    } catch (err) {
        console.error('Export error:', err);
        throw error(500, 'Failed to export products');
    }
};
