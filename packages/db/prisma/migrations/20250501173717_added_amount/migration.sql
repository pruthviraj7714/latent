/*
  Warnings:

  - Added the required column `amount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "amount" INTEGER NOT NULL;
