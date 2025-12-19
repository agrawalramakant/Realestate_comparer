# Phase 3 – API Design

## 1. API Overview

| Resource | Base Path | Description |
|----------|-----------|-------------|
| Properties | `/api/properties` | CRUD for properties |
| Financing | `/api/properties/:id/financing` | Financing scenarios |
| Calculation | `/api/calculate` | Run calculations |
| Tax Profile | `/api/properties/:id/tax-profile` | Tax settings |
| Assumptions | `/api/properties/:id/assumptions` | Investment assumptions |
| Utilities | `/api/utils` | Helper endpoints |

**Base URL:** `http://localhost:3001/api`

---

## 2. Property Endpoints

### 2.1 List Properties

```
GET /api/properties
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `city` | string | Filter by city |
| `state` | GermanState | Filter by state |
| `status` | PropertyStatus | Filter by status |
| `minPrice` | number | Min purchase price |
| `maxPrice` | number | Max purchase price |
| `minIrr` | number | Min IRR (latest calc) |
| `sortBy` | string | `createdAt`, `purchasePrice`, `irr10Year`, `grossYield` |
| `sortOrder` | `asc` \| `desc` | Sort direction |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Berlin Mitte 2BR",
      "address": "Torstraße 123",
      "city": "Berlin",
      "state": "BERLIN",
      "propertyStatus": "VISITED",
      "propertySize": 73.5,
      "numberOfRooms": 2.5,
      "purchasePrice": 490000,
      "nettoPricePerSqm": 6666.67,
      "finalPricePerSqm": 7200.00,
      "totalAcquisitionCost": 529400,
      "latestCalculation": {
        "scenarioName": "Conservative",
        "irr10Year": 0.0523,
        "irr15Year": 0.0612,
        "irr30Year": 0.0745,
        "grossYield": 0.0357,
        "netYield": 0.0298,
        "monthlyNetCashflowYear1": -245.50,
        "cashOnCashReturn": 0.0312
      },
      "financingScenariosCount": 2,
      "createdAt": "2024-12-14T10:30:00Z",
      "updatedAt": "2024-12-14T11:00:00Z"
    }
  ],
  "total": 15
}
```

---

### 2.2 Get Property Detail

```
GET /api/properties/:id
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Berlin Mitte 2BR",
  "address": "Torstraße 123",
  "city": "Berlin",
  "state": "BERLIN",
  "propertyStatus": "VISITED",
  
  "propertySize": 73.5,
  "numberOfRooms": 2.5,
  "purchasePrice": 490000,
  "landValuePercent": 0.15,
  "constructionYear": 1985,
  "propertyCompletionYear": null,
  "purchaseInMonths": 0,
  "energyClass": "D",
  "furnishingStatus": "KITCHEN_EQUIPPED",
  
  "floorLevel": 3,
  "totalFloors": 5,
  "hasBalcony": true,
  "balconySize": 8.5,
  "hasTerrace": false,
  "terraceSize": null,
  "hasGarden": false,
  "gardenSize": null,
  "hasCellar": true,
  "cellarSize": 5.0,
  
  "buildingType": "NEUBAU_1950_1989",
  "numberOfUnitsInBuilding": 24,
  "hasElevator": true,
  
  "hasParkingSpace": true,
  "parkingType": "UNDERGROUND",
  "parkingPrice": 25000,
  "parkingIncludedInPrice": false,
  
  "maklerFeePercent": 0.0357,
  
  "renovationStatus": "QUALITY",
  "renovationCost": 15000,
  "renovationYear": 2022,
  "renovationTaxDeductible": true,
  
  "rentalPricePerM2": 14.50,
  "parkingRentalIncome": 100,
  "houseAppreciation": 0.035,
  "rentalDelayPeriod": 0,
  "guaranteedRentPeriod": 0,
  "rentalPriceAfterGuaranteed": null,
  "vacancyRate": 0.02,
  "rentIncrementPercent": 0.02,
  "rentIncrementFrequencyYears": 2,
  
  "hausgeldTotal": 350,
  "hausgeldNichtUmlagefaehig": 180,
  "hausgeldUmlagefaehig": 170,
  "ruecklagePerSqm": 0.80,
  
  "sourceType": "MAKLER",
  "sourceName": "Engel & Völkers",
  "sourceContact": "Herr Schmidt, 030-123456",
  
  "generalComments": "Good location near U-Bahn",
  "visitComments": "Needs new bathroom, otherwise good condition",
  "visitDate": "2024-12-10",
  
  "computed": {
    "landValue": 73500,
    "buildingValue": 416500,
    "nettoPricePerSqm": 6666.67,
    "grunderwerbsteuer": 29400,
    "notaryFees": 7350,
    "grundbuchFees": 2450,
    "maklerFees": 17493,
    "totalPurchaseCosts": 56693,
    "totalAcquisitionCost": 571693,
    "finalPricePerSqm": 7914.19,
    "depreciableBasis": 488193,
    "monthlyRent": 1166.75,
    "annualRent": 14001,
    "grossYield": 0.0286
  },
  
  "financingScenarios": [...],
  "taxProfile": {...},
  "investmentAssumptions": {...},
  
  "createdAt": "2024-12-14T10:30:00Z",
  "updatedAt": "2024-12-14T11:00:00Z"
}
```

---

### 2.3 Create Property

```
POST /api/properties
```

**Request Body:**
```json
{
  "name": "Berlin Mitte 2BR",
  "city": "Berlin",
  "state": "BERLIN",
  "propertySize": 73.5,
  "purchasePrice": 490000,
  "landValuePercent": 0.15,
  "rentalPricePerM2": 14.50,
  "houseAppreciation": 0.035,
  
  "address": "Torstraße 123",
  "propertyStatus": "INITIAL_INPUT",
  "numberOfRooms": 2.5,
  "constructionYear": 1985,
  "energyClass": "D",
  "furnishingStatus": "KITCHEN_EQUIPPED",
  
  "floorLevel": 3,
  "totalFloors": 5,
  "hasBalcony": true,
  "balconySize": 8.5,
  "hasCellar": true,
  "cellarSize": 5.0,
  
  "buildingType": "NEUBAU_1950_1989",
  "numberOfUnitsInBuilding": 24,
  "hasElevator": true,
  
  "hasParkingSpace": true,
  "parkingType": "UNDERGROUND",
  "parkingPrice": 25000,
  "parkingIncludedInPrice": false,
  "parkingRentalIncome": 100,
  
  "maklerFeePercent": 0.0357,
  
  "renovationStatus": "QUALITY",
  "renovationCost": 15000,
  "renovationYear": 2022,
  "renovationTaxDeductible": true,
  
  "vacancyRate": 0.02,
  "rentIncrementPercent": 0.02,
  "rentIncrementFrequencyYears": 2,
  
  "hausgeldTotal": 350,
  "hausgeldNichtUmlagefaehig": 180,
  "hausgeldUmlagefaehig": 170,
  "ruecklagePerSqm": 0.80,
  
  "sourceType": "MAKLER",
  "sourceName": "Engel & Völkers",
  "sourceContact": "Herr Schmidt",
  
  "generalComments": "Good location",
  
  "taxProfile": {
    "annualGrossIncome": 120000,
    "taxFilingType": "JOINT",
    "churchTaxRate": 0
  },
  
  "investmentAssumptions": {
    "afaType": "LINEAR_2_5",
    "propertyManagementPercent": 0
  },
  
  "financingScenarios": [
    {
      "scenarioName": "Conservative",
      "scenarioOrder": 1,
      "ltvPercent": 80,
      "bankInterestRate": 0.04,
      "bankFixedPeriod": 10,
      "repaymentRate": 0.02
    }
  ]
}
```

**Response:** `201 Created` → Full PropertyDetail

---

### 2.4 Update Property

```
PATCH /api/properties/:id
```

**Request Body:** Partial property fields

**Response:** `200 OK` → PropertyDetail

---

### 2.5 Delete Property

```
DELETE /api/properties/:id
```

**Response:** `204 No Content`

---

### 2.6 Duplicate Property

```
POST /api/properties/:id/duplicate
```

**Request Body:**
```json
{
  "name": "Berlin Mitte 2BR (Copy)"
}
```

**Response:** `201 Created` → PropertyDetail

---

## 3. Financing Scenario Endpoints

### 3.1 List Financing Scenarios

```
GET /api/properties/:propertyId/financing
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "scenarioName": "Conservative",
      "scenarioOrder": 1,
      
      "ltvPercent": 80,
      "bankInterestRate": 0.04,
      "bankFixedPeriod": 10,
      "repaymentRate": 0.02,
      "disburseBankLoanFirst": false,
      
      "kfwLoanSize": 0,
      "kfwInterestRate": 0,
      "kfwFixedPeriod": 10,
      "kfwRepaymentFreePeriod": 0,
      "kfwPaybackPeriod": 35,
      "kfwTilgungszuschuss": 0,
      
      "comments": "Standard bank financing",
      
      "computed": {
        "bankLoanAmount": 392000,
        "totalLoanAmount": 392000,
        "equityRequired": 179693,
        "monthlyBankPayment": 1960,
        "monthlyKfwPayment": 0,
        "totalMonthlyPayment": 1960
      },
      
      "createdAt": "2024-12-14T10:30:00Z",
      "updatedAt": "2024-12-14T10:30:00Z"
    }
  ]
}
```

---

### 3.2 Create Financing Scenario

```
POST /api/properties/:propertyId/financing
```

**Request Body:**
```json
{
  "scenarioName": "Aggressive",
  "scenarioOrder": 2,
  "ltvPercent": 100,
  "bankInterestRate": 0.042,
  "bankFixedPeriod": 10,
  "repaymentRate": 0.015,
  "kfwLoanSize": 100000,
  "kfwInterestRate": 0.0306,
  "kfwFixedPeriod": 10,
  "kfwRepaymentFreePeriod": 2,
  "kfwPaybackPeriod": 25,
  "comments": "With KfW loan"
}
```

**Response:** `201 Created` → FinancingScenarioResponse

---

### 3.3 Update Financing Scenario

```
PATCH /api/properties/:propertyId/financing/:scenarioId
```

**Request Body:** Partial fields

**Response:** `200 OK` → FinancingScenarioResponse

---

### 3.4 Delete Financing Scenario

```
DELETE /api/properties/:propertyId/financing/:scenarioId
```

**Response:** `204 No Content`

---

## 4. Tax Profile Endpoints

### 4.1 Get Tax Profile

```
GET /api/properties/:propertyId/tax-profile
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  
  "annualGrossIncome": 120000,
  "taxFilingType": "JOINT",
  "churchTaxRate": 0,
  "numberOfChildren": 0,
  "otherDeductions": 0,
  
  "computed": {
    "taxableIncome": 120000,
    "incomeTax": 28382,
    "solidarityTax": 0,
    "churchTax": 0,
    "totalTax": 28382,
    "effectiveTaxRate": 0.2365,
    "marginalTaxRate": 0.42,
    "marginalTaxRateExplanation": "Income above €62,810 (joint) is taxed at 42% (Spitzensteuersatz)"
  },
  
  "createdAt": "2024-12-14T10:30:00Z",
  "updatedAt": "2024-12-14T10:30:00Z"
}
```

---

### 4.2 Create/Update Tax Profile

```
PUT /api/properties/:propertyId/tax-profile
```

**Request Body:**
```json
{
  "annualGrossIncome": 120000,
  "taxFilingType": "JOINT",
  "churchTaxRate": 9,
  "numberOfChildren": 2,
  "otherDeductions": 5000
}
```

**Response:** `200 OK` → TaxProfileResponse

---

## 5. Investment Assumptions Endpoints

### 5.1 Get Investment Assumptions

```
GET /api/properties/:propertyId/assumptions
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  
  "afaType": "LINEAR_2_5",
  "sonderAfaEligible": false,
  "sonderAfaPercent": 0,
  "sonderAfaYears": 0,
  "denkmalschutzEligible": false,
  "denkmalschutzOldValue": 0,
  "denkmalschutzRenovationCost": 0,
  
  "propertyManagementPercent": 0,
  "insuranceCostAnnual": 0,
  "otherOperatingCosts": 0,
  
  "computed": {
    "afaRate": 0.025,
    "afaDurationYears": 40,
    "annualDepreciation": 12204.83,
    "sonderAfaAnnual": null
  },
  
  "createdAt": "2024-12-14T10:30:00Z",
  "updatedAt": "2024-12-14T10:30:00Z"
}
```

---

### 5.2 Create/Update Investment Assumptions

```
PUT /api/properties/:propertyId/assumptions
```

**Request Body:**
```json
{
  "afaType": "LINEAR_2_5",
  "sonderAfaEligible": true,
  "sonderAfaPercent": 5,
  "sonderAfaYears": 4,
  "propertyManagementPercent": 5,
  "insuranceCostAnnual": 200
}
```

**Response:** `200 OK` → InvestmentAssumptionsResponse

---

## 6. Calculation Endpoints

### 6.1 Run Calculation (On-Demand, No Save)

```
POST /api/calculate
```

**Request Body (using saved property):**
```json
{
  "propertyId": "uuid",
  "financingScenario": {
    "scenarioName": "Test",
    "scenarioOrder": 1,
    "ltvPercent": 80,
    "bankInterestRate": 0.04,
    "bankFixedPeriod": 10,
    "repaymentRate": 0.02
  }
}
```

**Request Body (inline, unsaved):**
```json
{
  "property": {
    "name": "Test Property",
    "city": "Berlin",
    "state": "BERLIN",
    "propertySize": 73.5,
    "purchasePrice": 490000,
    "landValuePercent": 0.15,
    "rentalPricePerM2": 14.50,
    "houseAppreciation": 0.035
  },
  "taxProfile": {
    "annualGrossIncome": 120000,
    "taxFilingType": "JOINT"
  },
  "investmentAssumptions": {
    "afaType": "LINEAR_2_5"
  },
  "financingScenario": {
    "scenarioName": "Test",
    "scenarioOrder": 1,
    "ltvPercent": 80,
    "bankInterestRate": 0.04,
    "bankFixedPeriod": 10,
    "repaymentRate": 0.02
  }
}
```

**Response:** `200 OK`
```json
{
  "inputs": {
    "purchasePrice": 490000,
    "totalAcquisitionCost": 546693,
    "loanAmount": 392000,
    "equityRequired": 154693,
    "monthlyRent": 1166.75,
    "depreciableBasis": 488193,
    "marginalTaxRate": 0.42
  },
  
  "kpis": {
    "irr10Year": 0.0523,
    "irr15Year": 0.0612,
    "irr30Year": 0.0745,
    "totalProfitAtExit": 485000,
    "upfrontInvestment": 154693,
    "monthlyNetCashflowYear1": -245.50,
    "grossYield": 0.0286,
    "netYield": 0.0242,
    "cashOnCashReturn": -0.019,
    "remainingLoanAtYear30": 0
  },
  
  "profitBreakdown": {
    "profitFromAppreciation": 320000,
    "profitFromOperating": 85000,
    "profitFromTaxSavings": 80000,
    "totalTaxSavingsFromAfa": 65000,
    "totalProfit": 485000
  },
  
  "yearlyCashflows": [
    {
      "year": 1,
      "calendarYear": 2025,
      "rentalIncome": 13720.44,
      "parkingIncome": 1200,
      "totalIncome": 14920.44,
      "mortgagePayment": 23520,
      "kfwPayment": 0,
      "interestPortion": 15680,
      "principalPortion": 7840,
      "hausgeldNichtUmlagefaehig": 2160,
      "otherCosts": 0,
      "totalExpenses": 25680,
      "depreciationAmount": 12204.83,
      "taxableIncome": -14124.39,
      "taxRefund": 5932.24,
      "netCashflowBeforeTax": -10759.56,
      "netCashflowAfterTax": -4827.32,
      "cumulativeCashflow": -4827.32,
      "remainingBankLoan": 384160,
      "remainingKfwLoan": 0,
      "propertyValue": 507150,
      "equity": 122990
    },
    ...
  ],
  
  "depreciationSchedule": [
    {
      "year": 1,
      "regularAfa": 12204.83,
      "sonderAfa": 0,
      "totalAfa": 12204.83,
      "remainingBasis": 475988.17,
      "taxSavings": 5126.03
    },
    ...
  ]
}
```

---

### 6.2 Save Calculation

```
POST /api/properties/:propertyId/calculations
```

**Request Body:**
```json
{
  "financingScenarioId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "financingScenarioId": "uuid",
  "calculatedAt": "2024-12-14T11:30:00Z",
  ...calculationResult
}
```

---

### 6.3 List Saved Calculations

```
GET /api/properties/:propertyId/calculations
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `scenarioId` | string | Filter by scenario |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "financingScenarioId": "uuid",
      "scenarioName": "Conservative",
      "calculatedAt": "2024-12-14T11:30:00Z",
      "irr10Year": 0.0523,
      "irr15Year": 0.0612,
      "irr30Year": 0.0745,
      "monthlyNetCashflowYear1": -245.50,
      "totalProfitAtExit": 485000
    }
  ]
}
```

---

### 6.4 Get Saved Calculation Detail

```
GET /api/properties/:propertyId/calculations/:calculationId
```

**Response:** `200 OK` → Full calculation with yearlyCashflows

---

### 6.5 Delete Saved Calculation

```
DELETE /api/properties/:propertyId/calculations/:calculationId
```

**Response:** `204 No Content`

---

### 6.6 Compare Scenarios

```
GET /api/properties/:propertyId/compare
```

**Response:** `200 OK`
```json
{
  "propertyId": "uuid",
  "propertyName": "Berlin Mitte 2BR",
  "scenarios": [
    {
      "scenario": {
        "id": "uuid",
        "scenarioName": "Conservative",
        "scenarioOrder": 1,
        "ltvPercent": 80,
        ...
      },
      "calculation": {
        "kpis": {...},
        "profitBreakdown": {...},
        "yearlyCashflows": [...]
      }
    },
    {
      "scenario": {
        "id": "uuid",
        "scenarioName": "Aggressive",
        "scenarioOrder": 2,
        "ltvPercent": 100,
        ...
      },
      "calculation": {
        "kpis": {...},
        "profitBreakdown": {...},
        "yearlyCashflows": [...]
      }
    }
  ]
}
```

---

## 7. Utility Endpoints

### 7.1 Calculate German Tax

```
POST /api/utils/german-tax
```

**Request Body:**
```json
{
  "annualGrossIncome": 120000,
  "taxFilingType": "JOINT",
  "churchTaxRate": 9
}
```

**Response:** `200 OK`
```json
{
  "taxableIncome": 120000,
  "incomeTax": 28382,
  "solidarityTax": 0,
  "churchTax": 2554.38,
  "totalTax": 30936.38,
  "effectiveTaxRate": 0.2578,
  "marginalTaxRate": 0.42,
  "brackets": [
    { "from": 0, "to": 22812, "rate": 0, "taxInBracket": 0 },
    { "from": 22812, "to": 32010, "rate": 0.14, "taxInBracket": 1287.72 },
    { "from": 32010, "to": 62810, "rate": 0.2397, "taxInBracket": 7383.68 },
    { "from": 62810, "to": 120000, "rate": 0.42, "taxInBracket": 24019.80 }
  ],
  "explanation": "Joint filing: Income above €62,810 is taxed at 42% (Spitzensteuersatz). Solidarity surcharge does not apply as tax is below threshold."
}
```

---

### 7.2 Get Grunderwerbsteuer Rates

```
GET /api/utils/grunderwerbsteuer
```

**Response:** `200 OK`
```json
{
  "rates": [
    { "state": "BADEN_WUERTTEMBERG", "stateName": "Baden-Württemberg", "rate": 0.05 },
    { "state": "BAYERN", "stateName": "Bayern", "rate": 0.035 },
    { "state": "BERLIN", "stateName": "Berlin", "rate": 0.06 },
    { "state": "BRANDENBURG", "stateName": "Brandenburg", "rate": 0.065 },
    { "state": "BREMEN", "stateName": "Bremen", "rate": 0.05 },
    { "state": "HAMBURG", "stateName": "Hamburg", "rate": 0.055 },
    { "state": "HESSEN", "stateName": "Hessen", "rate": 0.06 },
    { "state": "MECKLENBURG_VORPOMMERN", "stateName": "Mecklenburg-Vorpommern", "rate": 0.06 },
    { "state": "NIEDERSACHSEN", "stateName": "Niedersachsen", "rate": 0.05 },
    { "state": "NORDRHEIN_WESTFALEN", "stateName": "Nordrhein-Westfalen", "rate": 0.065 },
    { "state": "RHEINLAND_PFALZ", "stateName": "Rheinland-Pfalz", "rate": 0.05 },
    { "state": "SAARLAND", "stateName": "Saarland", "rate": 0.065 },
    { "state": "SACHSEN", "stateName": "Sachsen", "rate": 0.055 },
    { "state": "SACHSEN_ANHALT", "stateName": "Sachsen-Anhalt", "rate": 0.05 },
    { "state": "SCHLESWIG_HOLSTEIN", "stateName": "Schleswig-Holstein", "rate": 0.065 },
    { "state": "THUERINGEN", "stateName": "Thüringen", "rate": 0.05 }
  ]
}
```

---

### 7.3 Get AfA Options

```
GET /api/utils/afa-types
```

**Response:** `200 OK`
```json
{
  "types": [
    {
      "type": "LINEAR_2",
      "label": "2% Linear",
      "rate": 0.02,
      "durationYears": 50,
      "description": "Linear depreciation at 2% per year",
      "eligibility": "Buildings constructed before 1925"
    },
    {
      "type": "LINEAR_2_5",
      "label": "2.5% Linear",
      "rate": 0.025,
      "durationYears": 40,
      "description": "Linear depreciation at 2.5% per year",
      "eligibility": "Buildings constructed 1925-2022"
    },
    {
      "type": "LINEAR_3",
      "label": "3% Linear",
      "rate": 0.03,
      "durationYears": 33,
      "description": "Linear depreciation at 3% per year",
      "eligibility": "Buildings constructed from 2023"
    },
    {
      "type": "LINEAR_4",
      "label": "4% Linear",
      "rate": 0.04,
      "durationYears": 25,
      "description": "Linear depreciation at 4% per year",
      "eligibility": "Specific qualifying buildings"
    },
    {
      "type": "DEGRESSIVE_5",
      "label": "5% Degressive",
      "rate": 0.05,
      "durationYears": null,
      "description": "Degressive depreciation starting at 5%",
      "eligibility": "New residential buildings from 2024 with building permit after Sept 30, 2023"
    }
  ]
}
```

---

## 8. Error Responses

All endpoints return consistent error format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "purchasePrice": ["must be a positive number"],
    "state": ["must be a valid German state"]
  }
}
```

| Status | Usage |
|--------|-------|
| `400` | Validation error |
| `404` | Resource not found |
| `409` | Conflict (duplicate) |
| `500` | Server error |

---

## 9. Calculation Engine Structure

```
src/calculation-engine/
├── index.ts                    # Main orchestrator
├── types.ts                    # Input/output types
│
├── purchase-costs.ts           # Grunderwerbsteuer, notary, etc.
├── loan-amortization.ts        # Bank + KfW schedules
├── rental-income.ts            # Rent with increments
├── depreciation.ts             # AfA, Sonder-AfA, Denkmal
├── german-tax.ts               # 2024 brackets
├── operating-costs.ts          # Hausgeld, management
├── cashflow.ts                 # Year-by-year
├── irr.ts                      # IRR (Newton-Raphson)
├── profit-breakdown.ts         # Appreciation, tax, operating
│
└── constants/
    ├── german-tax-2024.ts
    ├── grunderwerbsteuer.ts
    └── afa-tables.ts
```

### Calculation Flow

```typescript
export function runCalculation(input: CalculationInput): CalculationResult {
  // 1. Purchase costs
  const purchaseCosts = calculatePurchaseCosts(input.property);
  
  // 2. Depreciable basis
  const depreciableBasis = calculateDepreciableBasis(input.property, purchaseCosts);
  
  // 3. Marginal tax rate
  const taxInfo = calculateGermanTax(input.taxProfile);
  
  // 4. Loan amortization
  const bankSchedule = generateAmortizationSchedule(input.financing.bank);
  const kfwSchedule = input.financing.kfw 
    ? generateKfwSchedule(input.financing.kfw) 
    : null;
  
  // 5. Depreciation schedule
  const depreciationSchedule = generateDepreciationSchedule(
    depreciableBasis, 
    input.assumptions
  );
  
  // 6. 30-year cashflow
  const yearlyCashflows = generateYearlyCashflows({
    property: input.property,
    financing: { bank: bankSchedule, kfw: kfwSchedule },
    depreciation: depreciationSchedule,
    taxInfo,
    assumptions: input.assumptions,
    years: 30,
  });
  
  // 7. IRR at horizons
  const irr10 = calculateIRR(yearlyCashflows, 10);
  const irr15 = calculateIRR(yearlyCashflows, 15);
  const irr30 = calculateIRR(yearlyCashflows, 30);
  
  // 8. Profit breakdown
  const profitBreakdown = calculateProfitBreakdown(yearlyCashflows, 30);
  
  return {
    kpis: { irr10Year: irr10, irr15Year: irr15, irr30Year: irr30, ... },
    profitBreakdown,
    yearlyCashflows,
    depreciationSchedule,
  };
}
```
