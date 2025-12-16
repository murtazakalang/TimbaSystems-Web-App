-- CreateTable
CREATE TABLE "products" (
    "item_code" TEXT NOT NULL,
    "product_group" TEXT,
    "supplier_description" TEXT,
    "timba_description" TEXT,
    "pieces_per_package" INTEGER NOT NULL DEFAULT 1,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'PZ',
    "price_list_gbp" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "discount_1_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_2_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "unit_discounted_price" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "transport_cost" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "markup_pct" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "margin_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "selling_price_unit" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "selling_price_box" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "net_unit_weight_kg" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "weight_per_box_kg" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "brand" TEXT,
    "line" TEXT,
    "diameter" TEXT,
    "length" TEXT,
    "hs_code" TEXT,
    "ean_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("item_code")
);

-- CreateTable
CREATE TABLE "stock" (
    "item_code" TEXT NOT NULL,
    "quantity_available" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("item_code")
);

-- CreateTable
CREATE TABLE "stock_history" (
    "id" SERIAL NOT NULL,
    "item_code" TEXT NOT NULL,
    "quantity_change" INTEGER NOT NULL,
    "quantity_after" INTEGER NOT NULL,
    "change_type" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_weight" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "total_margin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "item_code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,4) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,
    "line_weight" DECIMAL(10,3) NOT NULL,
    "line_margin" DECIMAL(12,2) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_import_logs" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "records_imported" INTEGER NOT NULL,
    "records_updated" INTEGER NOT NULL,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_history_item_code_idx" ON "stock_history"("item_code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_item_code_idx" ON "order_items"("item_code");

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "products"("item_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "stock"("item_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_code_fkey" FOREIGN KEY ("item_code") REFERENCES "products"("item_code") ON DELETE RESTRICT ON UPDATE CASCADE;
