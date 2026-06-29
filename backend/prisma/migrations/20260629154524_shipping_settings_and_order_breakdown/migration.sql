/*
  Warnings:

  - You are about to drop the column `shippingFee` on the `SiteSettings` table. All the data in the column will be lost.
  - Added the required column `shippingFee` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingFee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "shippingFee",
ADD COLUMN     "localCity" TEXT NOT NULL DEFAULT 'Lahore',
ADD COLUMN     "localShippingFee" DECIMAL(10,2) NOT NULL DEFAULT 200,
ADD COLUMN     "outstationShippingFee" DECIMAL(10,2) NOT NULL DEFAULT 400,
ALTER COLUMN "freeShippingThreshold" SET DEFAULT 5000;
