import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    const products = [
        {
            itemCode: 'AB110115',
            timbaDescription: 'Heavy Duty Anchor Bolt M10 x 115mm',
            sellingPriceUnit: 1.16,
            netUnitWeightKg: 0.25,
            stockQuantity: 100,
            category: 'Hardware',
        },
        {
            itemCode: 'PF2004',
            timbaDescription: 'Aluminium Profile 40x40mm',
            sellingPriceUnit: 15.50,
            netUnitWeightKg: 2.50,
            stockQuantity: 50,
            category: 'Profile',
        },
        {
            itemCode: 'WM5050',
            timbaDescription: 'Wire Mesh 50x50mm Grid',
            sellingPriceUnit: 8.75,
            netUnitWeightKg: 1.20,
            stockQuantity: 0, // Out of stock test
            category: 'Wire_Mesh',
        },
        {
            itemCode: 'SC1001',
            timbaDescription: 'Safety Cap Black',
            sellingPriceUnit: 0.50,
            netUnitWeightKg: 0.05,
            stockQuantity: 500,
            category: 'Accessory',
        },
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { itemCode: p.itemCode },
            update: {},
            create: {
                itemCode: p.itemCode,
                timbaDescription: p.timbaDescription,
                sellingPriceUnit: p.sellingPriceUnit,
                netUnitWeightKg: p.netUnitWeightKg,
                productGroup: p.category,
                stock: {
                    create: {
                        quantityAvailable: p.stockQuantity,
                    }
                }
            },
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
