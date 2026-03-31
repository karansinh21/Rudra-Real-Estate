CREATE TABLE IF NOT EXISTS "wishlists" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wishlists_userId_propertyId_key" UNIQUE ("userId", "propertyId"),
  CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "wishlists_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "wishlists_userId_idx" ON "wishlists"("userId");
