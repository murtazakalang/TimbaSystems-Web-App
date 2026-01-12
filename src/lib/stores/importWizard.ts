import { writable, derived } from 'svelte/store';
import type { ImportColumn, ImportColumnMapping, ImportPreview } from '$lib/types/import';

/**
 * Import Wizard State
 */
interface ImportWizardState {
    step: 1 | 2 | 3;
    file: File | null;
    fileName: string;
    columns: ImportColumn[];
    headers: string[];
    rawRows: unknown[][];
    mapping: ImportColumnMapping;
    preview: ImportPreview | null;
    isLoading: boolean;
    error: string | null;
}

const initialMapping: ImportColumnMapping = {
    itemCode: '',
    supplierDescription: undefined,
    piecesPerPackage: undefined,
    priceList: undefined,
    discount: undefined,
    cost: undefined,
    trueCost: undefined,
    description: undefined,
    margin: undefined,
    sellingPrice: undefined,
    unitWeight: undefined,
    stockQuantity: undefined,
};

const initialState: ImportWizardState = {
    step: 1,
    file: null,
    fileName: '',
    columns: [],
    headers: [],
    rawRows: [],
    mapping: { ...initialMapping },
    preview: null,
    isLoading: false,
    error: null,
};

function createImportWizardStore() {
    const { subscribe, set, update } = writable<ImportWizardState>(initialState);

    return {
        subscribe,

        /**
         * Set the uploaded file and parsed data
         */
        setFileData: (
            file: File,
            fileName: string,
            columns: ImportColumn[],
            headers: string[],
            rawRows: unknown[][],
            suggestedMappings: Record<string, string>
        ) => {
            update(state => ({
                ...state,
                file,
                fileName,
                columns,
                headers,
                rawRows,
                mapping: {
                    itemCode: suggestedMappings['itemCode'] ?? '',
                    supplierDescription: suggestedMappings['supplierDescription'],
                    piecesPerPackage: suggestedMappings['piecesPerPackage'],
                    priceList: suggestedMappings['priceList'],
                    discount: suggestedMappings['discount'],
                    cost: suggestedMappings['cost'],
                    trueCost: suggestedMappings['trueCost'],
                    description: suggestedMappings['description'],
                    margin: suggestedMappings['margin'],
                    sellingPrice: suggestedMappings['sellingPrice'],
                    unitWeight: suggestedMappings['unitWeight'],
                    stockQuantity: suggestedMappings['stockQuantity'],
                },
                step: 2,
                error: null,
            }));
        },

        /**
         * Update a single mapping
         */
        updateMapping: (field: keyof ImportColumnMapping, column: string) => {
            update(state => ({
                ...state,
                mapping: {
                    ...state.mapping,
                    [field]: column || undefined,
                },
            }));
        },

        /**
         * Set the preview data
         */
        setPreview: (preview: ImportPreview) => {
            update(state => ({
                ...state,
                preview,
            }));
        },

        /**
         * Go to next step
         */
        nextStep: () => {
            update(state => ({
                ...state,
                step: (state.step < 3 ? state.step + 1 : 3) as 1 | 2 | 3,
            }));
        },

        /**
         * Go to previous step
         */
        prevStep: () => {
            update(state => ({
                ...state,
                step: (state.step > 1 ? state.step - 1 : 1) as 1 | 2 | 3,
            }));
        },

        /**
         * Set loading state
         */
        setLoading: (isLoading: boolean) => {
            update(state => ({ ...state, isLoading }));
        },

        /**
         * Set error
         */
        setError: (error: string | null) => {
            update(state => ({ ...state, error, isLoading: false }));
        },

        /**
         * Reset wizard to initial state
         */
        reset: () => {
            set(initialState);
        },
    };
}

export const importWizard = createImportWizardStore();

/**
 * Derived store for validation
 */
export const isMappingValid = derived(
    importWizard,
    ($wizard) => Boolean($wizard.mapping.itemCode)
);

/**
 * Derived store to check if wizard can proceed to next step
 */
export const canProceed = derived(
    importWizard,
    ($wizard) => {
        switch ($wizard.step) {
            case 1:
                return $wizard.columns.length > 0;
            case 2:
                return Boolean($wizard.mapping.itemCode);
            case 3:
                return $wizard.preview !== null;
            default:
                return false;
        }
    }
);
