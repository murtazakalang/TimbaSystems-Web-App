import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';

/**
 * GET /api/settings
 * Load application settings
 */
export const GET: RequestHandler = async () => {
    try {
        // Get or create settings (singleton pattern)
        let settings = await prisma.settings.findFirst({
            where: { id: 1 }
        });

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.settings.create({
                data: { id: 1 }
            });
        }

        return json({
            defaultMarkupPct: Number(settings.defaultMarkupPct),
            transportCost: Number(settings.transportCost),
            lowStockThreshold: settings.lowStockThreshold,
            rowsPerPage: settings.rowsPerPage,
            currencySymbol: settings.currencySymbol,
            updatedAt: settings.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Error loading settings:', error);
        return json({ error: 'Failed to load settings' }, { status: 500 });
    }
};

/**
 * PUT /api/settings
 * Save application settings
 */
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { defaultMarkupPct, transportCost, lowStockThreshold, rowsPerPage, currencySymbol } = body as {
            defaultMarkupPct?: number;
            transportCost?: number;
            lowStockThreshold?: number;
            rowsPerPage?: number;
            currencySymbol?: string;
        };

        const settings = await prisma.settings.upsert({
            where: { id: 1 },
            update: {
                ...(defaultMarkupPct !== undefined && { defaultMarkupPct }),
                ...(transportCost !== undefined && { transportCost }),
                ...(lowStockThreshold !== undefined && { lowStockThreshold }),
                ...(rowsPerPage !== undefined && { rowsPerPage }),
                ...(currencySymbol !== undefined && { currencySymbol }),
            },
            create: {
                id: 1,
                defaultMarkupPct: defaultMarkupPct ?? 30,
                transportCost: transportCost ?? 0,
                lowStockThreshold: lowStockThreshold ?? 50,
                rowsPerPage: rowsPerPage ?? 20,
                currencySymbol: currencySymbol ?? '£',
            }
        });

        return json({
            success: true,
            defaultMarkupPct: Number(settings.defaultMarkupPct),
            transportCost: Number(settings.transportCost),
            lowStockThreshold: settings.lowStockThreshold,
            rowsPerPage: settings.rowsPerPage,
            currencySymbol: settings.currencySymbol,
            updatedAt: settings.updatedAt.toISOString()
        });
    } catch (error) {
        console.error('Error saving settings:', error);
        return json({ error: 'Failed to save settings' }, { status: 500 });
    }
};
