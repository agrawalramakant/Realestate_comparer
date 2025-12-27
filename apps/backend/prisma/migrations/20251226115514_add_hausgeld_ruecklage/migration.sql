-- CreateEnum
CREATE TYPE "GermanState" AS ENUM ('BADEN_WUERTTEMBERG', 'BAYERN', 'BERLIN', 'BRANDENBURG', 'BREMEN', 'HAMBURG', 'HESSEN', 'MECKLENBURG_VORPOMMERN', 'NIEDERSACHSEN', 'NORDRHEIN_WESTFALEN', 'RHEINLAND_PFALZ', 'SAARLAND', 'SACHSEN', 'SACHSEN_ANHALT', 'SCHLESWIG_HOLSTEIN', 'THUERINGEN');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('INITIAL_INPUT', 'APPOINTMENT_SCHEDULED', 'VISITED', 'OFFER_MADE', 'REJECTED', 'PURCHASED');

-- CreateEnum
CREATE TYPE "EnergyClass" AS ENUM ('A_PLUS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');

-- CreateEnum
CREATE TYPE "RenovationStatus" AS ENUM ('UNRENOVATED', 'COSMETIC', 'QUALITY', 'CORE');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('EMPTY', 'KITCHEN_ONLY', 'KITCHEN_EQUIPPED', 'FULLY_FURNISHED');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('OUTDOOR', 'CARPORT', 'UNDERGROUND', 'GARAGE', 'DUPLEX');

-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('ALTBAU_PRE1918', 'ALTBAU_1918_1949', 'NEUBAU_1950_1989', 'PLATTENBAU', 'NEUBAU_1990_2010', 'NEUBAU_POST2010', 'NEW_CONSTRUCTION');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('BUILDER', 'MAKLER', 'PRIVATE', 'AUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxFilingType" AS ENUM ('SINGLE', 'JOINT');

-- CreateEnum
CREATE TYPE "AfaType" AS ENUM ('LINEAR_2', 'LINEAR_2_5', 'LINEAR_3', 'LINEAR_4', 'DEGRESSIVE_5', 'CUSTOM');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" "GermanState" NOT NULL,
    "propertyStatus" "PropertyStatus" NOT NULL DEFAULT 'INITIAL_INPUT',
    "propertySize" DECIMAL(10,2) NOT NULL,
    "numberOfRooms" DECIMAL(3,1),
    "purchasePrice" DECIMAL(12,2) NOT NULL,
    "landValuePercent" DECIMAL(5,4) NOT NULL,
    "constructionYear" INTEGER,
    "propertyCompletionYear" INTEGER,
    "purchaseInMonths" INTEGER NOT NULL DEFAULT 0,
    "energyClass" "EnergyClass",
    "furnishingStatus" "FurnishingStatus",
    "floorLevel" INTEGER,
    "totalFloors" INTEGER,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "balconySize" DECIMAL(6,2),
    "hasTerrace" BOOLEAN NOT NULL DEFAULT false,
    "terraceSize" DECIMAL(6,2),
    "hasGarden" BOOLEAN NOT NULL DEFAULT false,
    "gardenSize" DECIMAL(8,2),
    "hasCellar" BOOLEAN NOT NULL DEFAULT false,
    "cellarSize" DECIMAL(6,2),
    "buildingType" "BuildingType",
    "numberOfUnitsInBuilding" INTEGER,
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "hasParkingSpace" BOOLEAN NOT NULL DEFAULT false,
    "parkingType" "ParkingType",
    "parkingPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "parkingIncludedInPrice" BOOLEAN NOT NULL DEFAULT true,
    "maklerFeePercent" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "renovationStatus" "RenovationStatus",
    "renovationCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "renovationYear" INTEGER,
    "renovationTaxDeductible" BOOLEAN NOT NULL DEFAULT false,
    "rentalPricePerM2" DECIMAL(8,2) NOT NULL,
    "parkingRentalIncome" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "houseAppreciation" DECIMAL(5,4) NOT NULL DEFAULT 0.02,
    "rentalDelayPeriod" INTEGER NOT NULL DEFAULT 0,
    "guaranteedRentPeriod" INTEGER NOT NULL DEFAULT 0,
    "rentalPriceAfterGuaranteed" DECIMAL(8,2),
    "vacancyRate" DECIMAL(5,4) NOT NULL DEFAULT 0.02,
    "rentIncrementPercent" DECIMAL(5,4) NOT NULL DEFAULT 0.02,
    "rentIncrementFrequencyYears" INTEGER NOT NULL DEFAULT 1,
    "hausgeldTotal" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "hausgeldUmlagefaehig" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "hausgeldNichtUmlagefaehig" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "hausgeldRuecklage" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "sourceType" "SourceType",
    "sourceName" TEXT,
    "sourceContact" TEXT,
    "generalComments" TEXT,
    "visitComments" TEXT,
    "visitDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancingScenario" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "scenarioOrder" INTEGER NOT NULL,
    "ltvPercent" DECIMAL(5,2) NOT NULL,
    "bankInterestRate" DECIMAL(5,4) NOT NULL,
    "bankFixedPeriod" INTEGER NOT NULL,
    "repaymentRate" DECIMAL(5,4) NOT NULL,
    "bankAcquisitionCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "disburseBankLoanFirst" BOOLEAN NOT NULL DEFAULT false,
    "kfwLoanSize" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "kfwInterestRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "kfwFixedPeriod" INTEGER NOT NULL DEFAULT 10,
    "kfwRepaymentFreePeriod" INTEGER NOT NULL DEFAULT 0,
    "kfwPaybackPeriod" INTEGER NOT NULL DEFAULT 35,
    "kfwTilgungszuschuss" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "kfwAcquisitionCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancingScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxProfile" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "annualGrossIncome" DECIMAL(12,2) NOT NULL,
    "taxFilingType" "TaxFilingType" NOT NULL,
    "churchTaxRate" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "numberOfChildren" INTEGER NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentAssumptions" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "afaType" "AfaType" NOT NULL DEFAULT 'LINEAR_2_5',
    "sonderAfaEligible" BOOLEAN NOT NULL DEFAULT false,
    "sonderAfaPercent" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "sonderAfaYears" INTEGER NOT NULL DEFAULT 0,
    "denkmalschutzEligible" BOOLEAN NOT NULL DEFAULT false,
    "denkmalschutzOldValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "denkmalschutzRenovationCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "propertyManagementPercent" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "insuranceCostAnnual" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "otherOperatingCosts" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentAssumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculationResult" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "financingScenarioId" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputSnapshot" JSONB NOT NULL,
    "irr10Year" DECIMAL(6,4) NOT NULL,
    "irr15Year" DECIMAL(6,4) NOT NULL,
    "irr30Year" DECIMAL(6,4) NOT NULL,
    "totalProfitAtExit" DECIMAL(14,2) NOT NULL,
    "upfrontInvestment" DECIMAL(12,2) NOT NULL,
    "monthlyNetCashflowYear1" DECIMAL(10,2) NOT NULL,
    "grossYield" DECIMAL(6,4) NOT NULL,
    "netYield" DECIMAL(6,4) NOT NULL,
    "cashOnCashReturn" DECIMAL(6,4) NOT NULL,
    "profitFromAppreciation" DECIMAL(14,2) NOT NULL,
    "profitFromOperating" DECIMAL(14,2) NOT NULL,
    "profitFromTaxSavings" DECIMAL(14,2) NOT NULL,
    "totalTaxSavingsFromAfa" DECIMAL(14,2) NOT NULL,
    "remainingLoanAtYear30" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearlyCashflowRow" (
    "id" TEXT NOT NULL,
    "calculationResultId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "calendarYear" INTEGER NOT NULL,
    "rentalIncome" DECIMAL(12,2) NOT NULL,
    "parkingIncome" DECIMAL(10,2) NOT NULL,
    "totalIncome" DECIMAL(12,2) NOT NULL,
    "mortgagePayment" DECIMAL(12,2) NOT NULL,
    "kfwPayment" DECIMAL(12,2) NOT NULL,
    "interestPortion" DECIMAL(12,2) NOT NULL,
    "principalPortion" DECIMAL(12,2) NOT NULL,
    "hausgeldNichtUmlagefaehig" DECIMAL(10,2) NOT NULL,
    "otherCosts" DECIMAL(10,2) NOT NULL,
    "totalExpenses" DECIMAL(12,2) NOT NULL,
    "normalDepreciation" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "specialDepreciation" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "depreciationAmount" DECIMAL(12,2) NOT NULL,
    "marginalTaxRate" DECIMAL(5,4) NOT NULL DEFAULT 0.42,
    "taxSavingOnDepreciation" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxableIncome" DECIMAL(12,2) NOT NULL,
    "taxRefund" DECIMAL(10,2) NOT NULL,
    "netCashflowBeforeTax" DECIMAL(12,2) NOT NULL,
    "netCashflowAfterTax" DECIMAL(12,2) NOT NULL,
    "cumulativeCashflow" DECIMAL(14,2) NOT NULL,
    "remainingBankLoan" DECIMAL(12,2) NOT NULL,
    "remainingKfwLoan" DECIMAL(12,2) NOT NULL,
    "propertyValue" DECIMAL(14,2) NOT NULL,
    "equity" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "YearlyCashflowRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");

-- CreateIndex
CREATE INDEX "Property_state_idx" ON "Property"("state");

-- CreateIndex
CREATE INDEX "Property_propertyStatus_idx" ON "Property"("propertyStatus");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "Property"("createdAt");

-- CreateIndex
CREATE INDEX "FinancingScenario_propertyId_idx" ON "FinancingScenario"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancingScenario_propertyId_scenarioOrder_key" ON "FinancingScenario"("propertyId", "scenarioOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TaxProfile_propertyId_key" ON "TaxProfile"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentAssumptions_propertyId_key" ON "InvestmentAssumptions"("propertyId");

-- CreateIndex
CREATE INDEX "CalculationResult_propertyId_idx" ON "CalculationResult"("propertyId");

-- CreateIndex
CREATE INDEX "CalculationResult_financingScenarioId_idx" ON "CalculationResult"("financingScenarioId");

-- CreateIndex
CREATE INDEX "CalculationResult_calculatedAt_idx" ON "CalculationResult"("calculatedAt");

-- CreateIndex
CREATE INDEX "YearlyCashflowRow_calculationResultId_idx" ON "YearlyCashflowRow"("calculationResultId");

-- CreateIndex
CREATE UNIQUE INDEX "YearlyCashflowRow_calculationResultId_year_key" ON "YearlyCashflowRow"("calculationResultId", "year");

-- AddForeignKey
ALTER TABLE "FinancingScenario" ADD CONSTRAINT "FinancingScenario_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxProfile" ADD CONSTRAINT "TaxProfile_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentAssumptions" ADD CONSTRAINT "InvestmentAssumptions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationResult" ADD CONSTRAINT "CalculationResult_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculationResult" ADD CONSTRAINT "CalculationResult_financingScenarioId_fkey" FOREIGN KEY ("financingScenarioId") REFERENCES "FinancingScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearlyCashflowRow" ADD CONSTRAINT "YearlyCashflowRow_calculationResultId_fkey" FOREIGN KEY ("calculationResultId") REFERENCES "CalculationResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
