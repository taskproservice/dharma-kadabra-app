-- Customer booking, account purchases and lunar ritual events.
ALTER TABLE "Appointment"
  ADD COLUMN "clientEmail" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "depositPaid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "customerId" TEXT;

CREATE INDEX "Appointment_clientEmail_date_idx" ON "Appointment"("clientEmail", "date");

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpecialEvent" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SpecialEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SpecialEvent_date_idx" ON "SpecialEvent"("date");

CREATE TABLE "_EventProducts" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX "_EventProducts_AB_unique" ON "_EventProducts"("A", "B");
CREATE INDEX "_EventProducts_B_index" ON "_EventProducts"("B");

CREATE TABLE "Purchase" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "productId" TEXT,
  "title" TEXT NOT NULL,
  "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Purchase_customerId_purchasedAt_idx" ON "Purchase"("customerId", "purchasedAt");

CREATE TABLE "AudioPurchase" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "audioUrl" TEXT,
  "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AudioPurchase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AudioPurchase_customerId_purchasedAt_idx" ON "AudioPurchase"("customerId", "purchasedAt");

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_EventProducts" ADD CONSTRAINT "_EventProducts_A_fkey"
  FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EventProducts" ADD CONSTRAINT "_EventProducts_B_fkey"
  FOREIGN KEY ("B") REFERENCES "SpecialEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AudioPurchase" ADD CONSTRAINT "AudioPurchase_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
