DELETE FROM "CareTaskLog";
DELETE FROM "VirtualPlant";
UPDATE "RealPlant" SET "isAssigned" = false, "status" = 'SEED';
