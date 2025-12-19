# Phase 2 – Domain Model and Data Structures

## 1. Entity Relationship Diagram

```
┌─────────────────┐       1:N        ┌─────────────────────┐
│    Property     │─────────────────▶│  FinancingScenario  │
│                 │   (max 3)        │                     │
└────────┬────────┘                  └─────────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│   TaxProfile    │
└─────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────────┐
│InvestmentAssumptions│
└─────────────────────┘
         │
         │ 1:N (saved)
         ▼
┌─────────────────────┐
│  CalculationResult  │
└─────────────────────┘
         │
         │ 1:N (30 rows)
         ▼
┌─────────────────────┐
│  YearlyCashflowRow  │
└─────────────────────┘
```

---

## 2. Enums

### GermanState
| Value | Grunderwerbsteuer Rate |
|-------|------------------------|
| `BADEN_WUERTTEMBERG` | 5.0% |
| `BAYERN` | 3.5% |
| `BERLIN` | 6.0% |
| `BRANDENBURG` | 6.5% |
| `BREMEN` | 5.0% |
| `HAMBURG` | 5.5% |
| `HESSEN` | 6.0% |
| `MECKLENBURG_VORPOMMERN` | 6.0% |
| `NIEDERSACHSEN` | 5.0% |
| `NORDRHEIN_WESTFALEN` | 6.5% |
| `RHEINLAND_PFALZ` | 5.0% |
| `SAARLAND` | 6.5% |
| `SACHSEN` | 5.5% |
| `SACHSEN_ANHALT` | 5.0% |
| `SCHLESWIG_HOLSTEIN` | 6.5% |
| `THUERINGEN` | 5.0% |

### PropertyStatus
| Value | Description |
|-------|-------------|
| `INITIAL_INPUT` | Initial data entry |
| `APPOINTMENT_SCHEDULED` | Visit appointment scheduled |
| `VISITED` | Property visited |
| `OFFER_MADE` | Offer submitted |
| `REJECTED` | Property rejected |
| `PURCHASED` | Property purchased |

### EnergyClass
| Value | Description |
|-------|-------------|
| `A_PLUS` | A+ (< 30 kWh/m²a) |
| `A` | A (30-50 kWh/m²a) |
| `B` | B (50-75 kWh/m²a) |
| `C` | C (75-100 kWh/m²a) |
| `D` | D (100-130 kWh/m²a) |
| `E` | E (130-160 kWh/m²a) |
| `F` | F (160-200 kWh/m²a) |
| `G` | G (200-250 kWh/m²a) |
| `H` | H (> 250 kWh/m²a) |

### RenovationStatus
| Value | German | Description |
|-------|--------|-------------|
| `UNRENOVATED` | Unsaniert | No renovation |
| `COSMETIC` | Schönwertig saniert | Cosmetic updates |
| `QUALITY` | Hochwertig saniert | High-quality renovation |
| `CORE` | Kernsaniert | Core renovation |

### FurnishingStatus
| Value | Description |
|-------|-------------|
| `EMPTY` | Empty apartment |
| `KITCHEN_ONLY` | Kitchen without appliances |
| `KITCHEN_EQUIPPED` | Kitchen with all appliances (EBK) |
| `FULLY_FURNISHED` | Fully furnished |

### ParkingType
| Value | German | Description |
|-------|--------|-------------|
| `OUTDOOR` | Außenstellplatz | Open outdoor parking |
| `CARPORT` | Carport | Covered outdoor |
| `UNDERGROUND` | Tiefgarage | Underground garage |
| `GARAGE` | Einzelgarage | Individual garage |
| `DUPLEX` | Duplex-Parker | Stacked parking |

### BuildingType
| Value | Description |
|-------|-------------|
| `ALTBAU_PRE1918` | Altbau (pre-1918) |
| `ALTBAU_1918_1949` | Altbau (1918-1949) |
| `NEUBAU_1950_1989` | Post-war (1950-1989) |
| `PLATTENBAU` | Plattenbau (prefab concrete) |
| `NEUBAU_1990_2010` | Modern (1990-2010) |
| `NEUBAU_POST2010` | New build (post-2010) |
| `NEW_CONSTRUCTION` | Under construction |

### SourceType
| Value | Description |
|-------|-------------|
| `BUILDER` | Direct from builder |
| `MAKLER` | Via real estate agent |
| `PRIVATE` | Private seller |
| `AUCTION` | Auction |
| `OTHER` | Other source |

### TaxFilingType
| Value | Description |
|-------|-------------|
| `SINGLE` | Single filing |
| `JOINT` | Joint filing (married) |

### AfaType
| Value | Description | Rate | Duration |
|-------|-------------|------|----------|
| `LINEAR_2` | Pre-1925 buildings | 2.0% p.a. | 50 years |
| `LINEAR_2_5` | 1925-2022 buildings | 2.5% p.a. | 40 years |
| `LINEAR_3` | Post-2023 buildings | 3.0% p.a. | 33 years |
| `LINEAR_4` | Specific cases | 4.0% p.a. | 25 years |
| `DEGRESSIVE_5` | New builds (2024+) | 5% degressive | Variable |

---

## 3. Entity Definitions

### 3.1 Property

| Field | Type | Unit | Required | Default | Description |
|-------|------|------|----------|---------|-------------|
| **Basic Info** |
| `id` | UUID | - | Yes | auto | Primary key |
| `name` | string | - | Yes | - | User-defined name |
| `address` | string | - | No | null | Full street address |
| `city` | string | - | Yes | - | City name |
| `state` | GermanState | - | Yes | - | Federal state |
| `propertyStatus` | PropertyStatus | - | Yes | INITIAL_INPUT | Tracking status |
| **Property Details** |
| `propertySize` | decimal(10,2) | m² | Yes | - | Living area |
| `numberOfRooms` | decimal(3,1) | - | No | null | Number of rooms (e.g., 2.5) |
| `purchasePrice` | decimal(12,2) | EUR | Yes | - | Purchase price |
| `landValuePercent` | decimal(5,4) | % | Yes | - | Land as % of price (e.g., 0.15 = 15%) |
| `constructionYear` | integer | year | No | null | Year built |
| `propertyCompletionYear` | integer | year | No | null | Completion year (new builds) |
| `purchaseInMonths` | integer | months | No | 0 | Months until purchase closes |
| `energyClass` | EnergyClass | - | No | null | Energy efficiency class |
| `furnishingStatus` | FurnishingStatus | - | No | null | Furnishing level |
| **Floor & Layout** |
| `floorLevel` | integer | - | No | null | Floor number (0 = EG) |
| `totalFloors` | integer | - | No | null | Total floors in building |
| `hasBalcony` | boolean | - | No | false | Has balcony |
| `balconySize` | decimal(6,2) | m² | No | null | Balcony area |
| `hasTerrace` | boolean | - | No | false | Has terrace |
| `terraceSize` | decimal(6,2) | m² | No | null | Terrace area |
| `hasGarden` | boolean | - | No | false | Has garden |
| `gardenSize` | decimal(8,2) | m² | No | null | Garden area |
| `hasCellar` | boolean | - | No | false | Has cellar |
| `cellarSize` | decimal(6,2) | m² | No | null | Cellar area |
| **Building Details** |
| `buildingType` | BuildingType | - | No | null | Type of building |
| `numberOfUnitsInBuilding` | integer | - | No | null | Units in building |
| `hasElevator` | boolean | - | No | false | Has elevator |
| **Parking** |
| `hasParkingSpace` | boolean | - | No | false | Has parking |
| `parkingType` | ParkingType | - | No | null | Type of parking |
| `parkingPrice` | decimal(10,2) | EUR | No | 0 | Parking purchase price |
| `parkingIncludedInPrice` | boolean | - | No | true | Included in purchasePrice |
| **Purchase Costs** |
| `maklerFeePercent` | decimal(5,4) | % | No | 0 | Makler commission |
| **Renovation** |
| `renovationStatus` | RenovationStatus | - | No | null | Renovation level |
| `renovationCost` | decimal(12,2) | EUR | No | 0 | Renovation cost |
| `renovationYear` | integer | year | No | null | Year of renovation |
| `renovationTaxDeductible` | boolean | - | No | false | Tax deductible |
| **Rental Details** |
| `rentalPricePerM2` | decimal(8,2) | EUR/m² | Yes | - | Monthly rent per m² |
| `parkingRentalIncome` | decimal(8,2) | EUR/month | No | 0 | Parking rental income |
| `houseAppreciation` | decimal(5,4) | % p.a. | Yes | - | Annual value growth |
| `rentalDelayPeriod` | integer | months | No | 0 | Delay before first rent |
| `guaranteedRentPeriod` | integer | months | No | 0 | Mietgarantie duration |
| `rentalPriceAfterGuaranteed` | decimal(8,2) | EUR/m² | No | null | Rent after guarantee |
| `vacancyRate` | decimal(5,4) | % | No | 0.02 | Expected vacancy |
| **Rent Increment** |
| `rentIncrementPercent` | decimal(5,4) | % | No | 0.02 | Increment percentage |
| `rentIncrementFrequencyYears` | integer | years | No | 1 | Every N years |
| **Hausgeld** |
| `hausgeldTotal` | decimal(8,2) | EUR/month | No | 0 | Total monthly Hausgeld |
| `hausgeldNichtUmlagefaehig` | decimal(8,2) | EUR/month | No | 0 | Non-recoverable (incl. Rücklage) |
| `hausgeldUmlagefaehig` | decimal(8,2) | EUR/month | No | 0 | Recoverable (Nebenkosten) |
| `ruecklagePerSqm` | decimal(6,4) | EUR/m²/month | No | 0 | Instandhaltungsrücklage |
| **Source** |
| `sourceType` | SourceType | - | No | null | Acquisition source |
| `sourceName` | string | - | No | null | Builder/Makler name |
| `sourceContact` | string | - | No | null | Contact details |
| **Comments** |
| `generalComments` | text | - | No | null | General notes |
| `visitComments` | text | - | No | null | Notes after visiting |
| `visitDate` | date | - | No | null | Date of visit |
| **Timestamps** |
| `createdAt` | timestamp | - | Yes | now() | Created |
| `updatedAt` | timestamp | - | Yes | auto | Updated |

**Computed Fields (not stored):**
- `landValue = purchasePrice × landValuePercent`
- `buildingValue = purchasePrice × (1 - landValuePercent)`
- `nettoPricePerSqm = purchasePrice / propertySize`
- `grunderwerbsteuer = purchasePrice × stateRate`
- `notaryFees = purchasePrice × 0.015`
- `grundbuchFees = purchasePrice × 0.005`
- `maklerFees = purchasePrice × maklerFeePercent`
- `totalPurchaseCosts = grunderwerbsteuer + notaryFees + grundbuchFees + maklerFees`
- `totalAcquisitionCost = purchasePrice + totalPurchaseCosts + (parkingPrice if not included)`
- `finalPricePerSqm = (purchasePrice + totalPurchaseCosts + renovationCost) / propertySize`
- `depreciableBasis = buildingValue + totalPurchaseCosts + (renovationCost if taxDeductible)`

---

### 3.2 FinancingScenario

| Field | Type | Unit | Required | Default | Description |
|-------|------|------|----------|---------|-------------|
| `id` | UUID | - | Yes | auto | Primary key |
| `propertyId` | UUID | - | Yes | - | FK to Property |
| `scenarioName` | string | - | Yes | - | e.g., "Conservative" |
| `scenarioOrder` | integer | - | Yes | - | 1, 2, or 3 |
| **Bank Loan** |
| `ltvPercent` | decimal(5,2) | % | Yes | - | Loan-to-value (e.g., 80.00) |
| `bankInterestRate` | decimal(5,4) | % p.a. | Yes | - | Interest rate |
| `bankFixedPeriod` | integer | years | Yes | - | Zinsbindung |
| `repaymentRate` | decimal(5,4) | % p.a. | Yes | - | Initial Tilgung |
| `disburseBankLoanFirst` | boolean | - | No | false | Disbursement order |
| **KfW Loan** |
| `kfwLoanSize` | decimal(12,2) | EUR | No | 0 | KfW loan amount |
| `kfwInterestRate` | decimal(5,4) | % p.a. | No | 0 | KfW interest |
| `kfwFixedPeriod` | integer | years | No | 10 | KfW Zinsbindung |
| `kfwRepaymentFreePeriod` | integer | years | No | 0 | Tilgungsfreie Jahre |
| `kfwPaybackPeriod` | integer | years | No | 35 | Total KfW term |
| `kfwTilgungszuschuss` | decimal(12,2) | EUR | No | 0 | KfW grant |
| **Comments** |
| `comments` | text | - | No | null | Scenario notes |
| **Timestamps** |
| `createdAt` | timestamp | - | Yes | now() | |
| `updatedAt` | timestamp | - | Yes | auto | |

**Constraints:**
- Unique: `(propertyId, scenarioOrder)`
- Max 3 scenarios per property

---

### 3.3 TaxProfile

| Field | Type | Unit | Required | Default | Description |
|-------|------|------|----------|---------|-------------|
| `id` | UUID | - | Yes | auto | Primary key |
| `propertyId` | UUID | - | Yes | - | FK to Property (unique) |
| `annualGrossIncome` | decimal(12,2) | EUR | Yes | - | Household income |
| `taxFilingType` | TaxFilingType | - | Yes | - | Single or joint |
| `churchTaxRate` | decimal(4,2) | % | No | 0 | 0, 8, or 9 |
| `numberOfChildren` | integer | - | No | 0 | For Kinderfreibetrag |
| `otherDeductions` | decimal(12,2) | EUR | No | 0 | Additional deductions |
| `createdAt` | timestamp | - | Yes | now() | |
| `updatedAt` | timestamp | - | Yes | auto | |

**Computed Fields:**
- `marginalTaxRate` – from 2024 German tax brackets
- `effectiveTaxRate` – average tax rate
- `solidarityTaxApplies` – income threshold check

---

### 3.4 InvestmentAssumptions

| Field | Type | Unit | Required | Default | Description |
|-------|------|------|----------|---------|-------------|
| `id` | UUID | - | Yes | auto | Primary key |
| `propertyId` | UUID | - | Yes | - | FK to Property (unique) |
| **Depreciation** |
| `afaType` | AfaType | - | Yes | LINEAR_2_5 | Depreciation type |
| `sonderAfaEligible` | boolean | - | No | false | Sonder-AfA eligible |
| `sonderAfaPercent` | decimal(4,2) | % | No | 0 | Additional depreciation |
| `sonderAfaYears` | integer | years | No | 0 | Sonder-AfA duration |
| `denkmalschutzEligible` | boolean | - | No | false | Heritage building |
| `denkmalschutzOldValue` | decimal(12,2) | EUR | No | 0 | Pre-renovation value |
| `denkmalschutzRenovationCost` | decimal(12,2) | EUR | No | 0 | Renovation cost (9% AfA) |
| **Operating Costs** |
| `propertyManagementPercent` | decimal(4,2) | % of rent | No | 0 | Hausverwaltung |
| `insuranceCostAnnual` | decimal(8,2) | EUR/year | No | 0 | Building insurance |
| `otherOperatingCosts` | decimal(8,2) | EUR/year | No | 0 | Miscellaneous |
| `createdAt` | timestamp | - | Yes | now() | |
| `updatedAt` | timestamp | - | Yes | auto | |

---

### 3.5 CalculationResult

| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| `id` | UUID | - | Yes | Primary key |
| `propertyId` | UUID | - | Yes | FK to Property |
| `financingScenarioId` | UUID | - | Yes | FK to FinancingScenario |
| `calculatedAt` | timestamp | - | Yes | When calculated |
| `inputSnapshot` | JSON | - | Yes | Full input state |
| **Summary KPIs** |
| `irr10Year` | decimal(6,4) | % | Yes | IRR at 10 years |
| `irr15Year` | decimal(6,4) | % | Yes | IRR at 15 years |
| `irr30Year` | decimal(6,4) | % | Yes | IRR at 30 years |
| `totalProfitAtExit` | decimal(14,2) | EUR | Yes | Total profit |
| `upfrontInvestment` | decimal(12,2) | EUR | Yes | Equity + costs |
| `monthlyNetCashflowYear1` | decimal(10,2) | EUR | Yes | Year 1 cashflow |
| `grossYield` | decimal(6,4) | % | Yes | Annual rent / price |
| `netYield` | decimal(6,4) | % | Yes | After costs |
| `cashOnCashReturn` | decimal(6,4) | % | Yes | Cashflow / equity |
| **Profit Breakdown** |
| `profitFromAppreciation` | decimal(14,2) | EUR | Yes | Value gain |
| `profitFromOperating` | decimal(14,2) | EUR | Yes | Rental profit |
| `profitFromTaxSavings` | decimal(14,2) | EUR | Yes | Tax benefits |
| `totalTaxSavingsFromAfa` | decimal(14,2) | EUR | Yes | AfA savings |
| `remainingLoanAtYear30` | decimal(12,2) | EUR | Yes | Outstanding loan |
| `createdAt` | timestamp | - | Yes | |

---

### 3.6 YearlyCashflowRow

| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| `id` | UUID | - | Yes | Primary key |
| `calculationResultId` | UUID | - | Yes | FK to CalculationResult |
| `year` | integer | - | Yes | Year number (1-30) |
| `calendarYear` | integer | - | Yes | Actual year (e.g., 2025) |
| **Income** |
| `rentalIncome` | decimal(12,2) | EUR | Yes | Annual rent |
| `parkingIncome` | decimal(10,2) | EUR | Yes | Parking income |
| `totalIncome` | decimal(12,2) | EUR | Yes | Sum |
| **Expenses** |
| `mortgagePayment` | decimal(12,2) | EUR | Yes | Bank payment |
| `kfwPayment` | decimal(12,2) | EUR | Yes | KfW payment |
| `interestPortion` | decimal(12,2) | EUR | Yes | Interest |
| `principalPortion` | decimal(12,2) | EUR | Yes | Principal |
| `hausgeldNichtUmlagefaehig` | decimal(10,2) | EUR | Yes | Non-recoverable |
| `otherCosts` | decimal(10,2) | EUR | Yes | Other costs |
| `totalExpenses` | decimal(12,2) | EUR | Yes | Sum |
| **Tax** |
| `depreciationAmount` | decimal(12,2) | EUR | Yes | AfA |
| `taxableIncome` | decimal(12,2) | EUR | Yes | Taxable rental |
| `taxRefund` | decimal(10,2) | EUR | Yes | Tax savings |
| **Cashflow** |
| `netCashflowBeforeTax` | decimal(12,2) | EUR | Yes | Before tax |
| `netCashflowAfterTax` | decimal(12,2) | EUR | Yes | After tax |
| `cumulativeCashflow` | decimal(14,2) | EUR | Yes | Running total |
| **Loan Status** |
| `remainingBankLoan` | decimal(12,2) | EUR | Yes | Bank balance |
| `remainingKfwLoan` | decimal(12,2) | EUR | Yes | KfW balance |
| `propertyValue` | decimal(14,2) | EUR | Yes | Appreciated value |
| `equity` | decimal(14,2) | EUR | Yes | Value - loans |

**Constraints:**
- Unique: `(calculationResultId, year)`

---

## 4. Key Formulas

### Depreciable Basis
```
depreciableBasis = buildingValue + totalPurchaseCosts + (renovationCost if taxDeductible)

where:
  buildingValue = purchasePrice × (1 - landValuePercent)
  totalPurchaseCosts = grunderwerbsteuer + notaryFees + grundbuchFees + maklerFees
```

### Hausgeld Logic
```
hausgeldTotal = hausgeldNichtUmlagefaehig + hausgeldUmlagefaehig

Owner's annual cost (tax-deductible) = hausgeldNichtUmlagefaehig × 12
Passed to tenant = hausgeldUmlagefaehig (Nebenkosten)
```

### Rent Increment
```
For year Y:
  incrementCount = floor((Y - 1) / rentIncrementFrequencyYears)
  rentMultiplier = (1 + rentIncrementPercent) ^ incrementCount
  currentRent = baseRent × rentMultiplier
```

---

## 5. Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| Property | `city` | Filter by city |
| Property | `state` | Filter by state |
| Property | `propertyStatus` | Filter by status |
| Property | `createdAt` | Sort by date |
| FinancingScenario | `propertyId` | List scenarios |
| CalculationResult | `propertyId` | List calculations |
| CalculationResult | `financingScenarioId` | Filter by scenario |
| CalculationResult | `calculatedAt` | Sort by date |
| YearlyCashflowRow | `calculationResultId` | List rows |
