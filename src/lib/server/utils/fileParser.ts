import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { ImportColumn } from '$lib/types/import';

/**
 * Parsed data structure returned by file parsers
 */
export interface ParsedFileData {
    headers: string[];
    rows: unknown[][];
    columns: ImportColumn[];
    totalRows: number;
}

/**
 * Detect file type based on filename extension
 */
export function detectFileType(filename: string): 'xlsx' | 'csv' | null {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
    if (ext === 'csv') return 'csv';
    return null;
}

/**
 * Parse Excel file from ArrayBuffer
 */
export function parseExcel(buffer: ArrayBuffer): ParsedFileData {
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
        throw new Error('No sheets found in Excel file');
    }

    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) {
        throw new Error('Could not read worksheet');
    }

    // Convert to array of arrays
    const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: ''
    });

    if (rawData.length === 0) {
        throw new Error('Excel file is empty');
    }

    // First row is headers
    const headers = (rawData[0] as unknown[]).map(h => String(h ?? '').trim());
    const rows = rawData.slice(1);

    // Build columns with sample data
    const columns = getColumnHeaders(headers, rows);

    return {
        headers,
        rows,
        columns,
        totalRows: rows.length
    };
}

/**
 * Parse CSV file from text string
 */
export function parseCSV(text: string): ParsedFileData {
    const result = Papa.parse(text, {
        skipEmptyLines: true,
        dynamicTyping: false, // Keep everything as strings for consistency
    });

    if (result.errors.length > 0 && result.data.length === 0) {
        throw new Error(`CSV parsing error: ${result.errors[0]?.message ?? 'Unknown error'}`);
    }

    const rawData = result.data as unknown[][];

    if (rawData.length === 0) {
        throw new Error('CSV file is empty');
    }

    // First row is headers
    const headers = (rawData[0] as unknown[]).map(h => String(h ?? '').trim());
    const rows = rawData.slice(1);

    // Build columns with sample data
    const columns = getColumnHeaders(headers, rows);

    return {
        headers,
        rows,
        columns,
        totalRows: rows.length
    };
}

/**
 * Build ImportColumn array with sample values from the first 3 rows
 */
function getColumnHeaders(headers: string[], rows: unknown[][]): ImportColumn[] {
    return headers.map((name, index) => {
        // Get sample values from first 3 rows
        const sample: string[] = [];
        for (let i = 0; i < Math.min(3, rows.length); i++) {
            const row = rows[i];
            if (row && row[index] !== undefined && row[index] !== null && row[index] !== '') {
                sample.push(String(row[index]));
            }
        }

        return {
            name,
            sample
        };
    });
}

/**
 * Parse file based on detected type
 */
export async function parseFile(file: File): Promise<ParsedFileData> {
    const fileType = detectFileType(file.name);

    if (!fileType) {
        throw new Error('Unsupported file type. Please upload an Excel (.xlsx) or CSV (.csv) file.');
    }

    if (fileType === 'xlsx') {
        const buffer = await file.arrayBuffer();
        return parseExcel(buffer);
    } else {
        const text = await file.text();
        return parseCSV(text);
    }
}

/**
 * Map of common column names to system field names for auto-detection
 */
const COLUMN_NAME_MAPPINGS: Record<string, string[]> = {
    itemCode: ['item code', 'itemcode', 'product code', 'sku', 'code', 'article', 'article code'],
    supplierDescription: ['supplier description', 'supplier desc'],
    description: ['description', 'desc', 'name', 'product name', 'title', 'timba description'],
    piecesPerPackage: ['pieces per package', 'pcs', 'qty per box', 'units per pack', 'pack size', 'unity'],
    priceList: ['price', 'pricelist', 'price list', 'pricelist customer', 'unit price', 'list price', 'price list (£)'],
    discount: ['discount', 'discount %', 'disc', 'disc %', 'discount1', 'discount%'],
    discount2: ['discount 2', 'discount2', 'disc 2', 'discount 2 %'],
    cost: ['cost', 'cost (£)', 'cost gbp'],
    trueCost: ['true cost', 'true cost (£)', 'truecost'],
    margin: ['margin', 'margin %', 'margin%'],
    sellingPrice: ['selling price', 'selling price (£)', 'sell price'],
    unitWeight: ['weight', 'unit weight', 'net weight', 'net unit weight', 'weight kg', 'net unit weight kg', 'weight (kg)'],
    stockQuantity: ['stock', 'stock quantity', 'qty', 'quantity', 'available'],
    brand: ['brand', 'manufacturer', 'vendor'],
    productGroup: ['product group', 'group', 'category', 'type'],
    unitOfMeasure: ['unit', 'uom', 'unit of measure', 'measure'],
    hsCode: ['hs code', 'hscode', 'hs', 'tariff code'],
    eanCode: ['ean', 'ean code', 'barcode', 'upc', 'gtin']
};

/**
 * Auto-detect column mappings based on column names
 */
export function autoDetectMappings(columns: ImportColumn[]): Record<string, string> {
    const mappings: Record<string, string> = {};

    for (const [systemField, patterns] of Object.entries(COLUMN_NAME_MAPPINGS)) {
        for (const column of columns) {
            const normalizedName = column.name.toLowerCase().trim();

            if (patterns.some(pattern => normalizedName === pattern || normalizedName.includes(pattern))) {
                mappings[systemField] = column.name;
                break;
            }
        }
    }

    return mappings;
}

/**
 * Transform raw data using column mapping
 */
export function transformDataWithMapping(
    rows: unknown[][],
    headers: string[],
    mapping: Record<string, string>
): Array<Record<string, unknown>> {
    const headerIndexMap: Record<string, number> = {};
    headers.forEach((header, index) => {
        headerIndexMap[header] = index;
    });

    return rows.map(row => {
        const transformed: Record<string, unknown> = {};

        for (const [systemField, sourceColumn] of Object.entries(mapping)) {
            if (sourceColumn && headerIndexMap[sourceColumn] !== undefined) {
                const index = headerIndexMap[sourceColumn];
                const value = row[index];

                // Convert value based on field type
                transformed[systemField] = convertValue(systemField, value);
            }
        }

        return transformed;
    }).filter(row => row.itemCode); // Only include rows with itemCode
}

/**
 * Convert value to appropriate type based on field
 */
function convertValue(field: string, value: unknown): unknown {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const stringValue = String(value).trim();

    // Numeric fields
    const numericFields = ['piecesPerPackage', 'priceList', 'discount', 'discount2', 'unitWeight', 'cost', 'trueCost', 'margin', 'sellingPrice', 'stockQuantity'];
    if (numericFields.includes(field)) {
        // Remove currency symbols and commas
        const cleaned = stringValue.replace(/[£$€,]/g, '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }

    // String fields
    return stringValue;
}
