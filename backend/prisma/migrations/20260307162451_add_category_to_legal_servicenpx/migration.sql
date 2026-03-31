/*
  Warnings:

  - You are about to drop the `brokers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "LoginMethod" AS ENUM ('EMAIL', 'GOOGLE', 'APPLE', 'WHATSAPP', 'PHONE');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PUBLIC';

-- DropForeignKey
ALTER TABLE "enquiries" DROP CONSTRAINT "enquiries_brokerId_fkey";

-- DropForeignKey
ALTER TABLE "legal_requests" DROP CONSTRAINT "legal_requests_brokerId_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_brokerid_fkey";

-- AlterTable
ALTER TABLE "legal_services" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'property';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "appleId" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loginMethod" "LoginMethod" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "professionalDetails" JSONB,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "role" SET DEFAULT 'PUBLIC';

-- DropTable
DROP TABLE "brokers";

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_appleId_key" ON "users"("appleId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_requests" ADD CONSTRAINT "legal_requests_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
