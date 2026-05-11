-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "submitterName" TEXT NOT NULL,
    "submitterEmail" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "makeModel" TEXT NOT NULL,
    "serialNumber" TEXT,
    "purchaseDate" TEXT,
    "condition" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "locationDetail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Device_submitterEmail_idx" ON "Device"("submitterEmail");

-- CreateIndex
CREATE INDEX "Device_deviceType_idx" ON "Device"("deviceType");
