-- Add hausgeldRuecklage to yearly cashflow rows (annual reserve)
ALTER TABLE "YearlyCashflowRow"
ADD COLUMN IF NOT EXISTS "hausgeldRuecklage" DECIMAL(10,2) NOT NULL DEFAULT 0;
