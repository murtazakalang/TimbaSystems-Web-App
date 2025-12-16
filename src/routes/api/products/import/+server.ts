import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseFile, autoDetectMappings } from '$lib/server/utils/fileParser';

/**
 * POST /api/products/import
 * Upload and parse file, return columns and preview for mapping
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            throw error(400, 'No file provided');
        }

        // Validate file size (max 10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            throw error(400, 'File too large. Maximum size is 10MB.');
        }

        // Parse the file
        const parsedData = await parseFile(file);

        // Auto-detect column mappings
        const suggestedMappings = autoDetectMappings(parsedData.columns);

        return json({
            success: true,
            fileName: file.name,
            columns: parsedData.columns,
            headers: parsedData.headers,
            totalRows: parsedData.totalRows,
            suggestedMappings,
            // Include raw data for client-side preview (limit to first 100 rows for performance)
            previewRows: parsedData.rows.slice(0, 100)
        });

    } catch (err) {
        console.error('Import error:', err);

        if (err && typeof err === 'object' && 'status' in err) {
            throw err; // Re-throw SvelteKit errors
        }

        throw error(500, err instanceof Error ? err.message : 'Failed to parse file');
    }
};
