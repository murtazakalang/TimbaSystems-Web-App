export interface ImportColumn {
    name: string;
    sample: string[];
}

export interface ImportColumnMapping {
    itemCode: string;
    supplierDescription?: string;
    piecesPerPackage?: string;
    priceList?: string;
    discount?: string;
    cost?: string;
    trueCost?: string;
    description?: string;
    margin?: string;
    sellingPrice?: string;
    unitWeight?: string;
    stockQuantity?: string;
}

export interface ImportPreview {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    newProducts: number;
    existingProducts: number;
    sampleData: Record<string, unknown>[];
    errors: ImportError[];
}

export interface ImportError {
    row: number;
    field: string;
    message: string;
}

export interface ImportResult {
    success: boolean;
    recordsImported: number;
    recordsUpdated: number;
    errors: ImportError[];
}

export interface ImportWizardState {
    step: 1 | 2 | 3;
    file: File | null;
    fileName: string;
    columns: ImportColumn[];
    mapping: ImportColumnMapping;
    preview: ImportPreview | null;
}
