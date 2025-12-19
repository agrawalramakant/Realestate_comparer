# Phase 4 – Frontend Page Structure and UI Design

## 1. Overall Page Structure & Navigation

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Property Overview | List all properties with KPIs, filters, actions |
| `/properties/new` | New Property | Create new property form |
| `/properties/[id]` | Property Detail | Full detail view with inputs, scenarios, results |

### Navigation Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏠 Real Estate Analyzer                        [+ New Property]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         Page Content                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- **Header**: Fixed top navigation with app name/logo and primary action button
- **No sidebar**: Simple, clean layout focused on content
- **Breadcrumbs**: On detail pages (`Properties > Berlin Mitte 2BR`)

### Design Principles

1. **Form-heavy but organized** – Group inputs into collapsible sections
2. **Side-by-side comparison** – Up to 3 financing scenarios visible together
3. **Real-time feedback** – Calculate on input change (debounced), save explicitly
4. **Responsive** – Desktop-first, but usable on tablet

---

## 2. Property Overview Page

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 Real Estate Analyzer                              [+ New Property]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Properties (15)                                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Filters                                                       [Clear]│   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │ │City      │ │State     │ │Status    │ │Min Price │ │Max Price │   │   │
│  │ │[Select ▼]│ │[Select ▼]│ │[Select ▼]│ │[_______] │ │[_______] │   │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Name          │City   │Size │Price    │€/m²  │Yield│IRR-10│CF/mo│Act│   │
│  ├───────────────┼───────┼─────┼─────────┼──────┼─────┼──────┼─────┼───┤   │
│  │ Berlin 2BR    │Berlin │73m² │€490,000 │€6,667│3.5% │5.2%  │-€245│ ⋮ │   │
│  │ Munich Studio │Munich │45m² │€380,000 │€8,444│2.8% │4.1%  │-€180│ ⋮ │   │
│  │ Hamburg 3BR   │Hamburg│95m² │€520,000 │€5,474│4.2% │6.8%  │+€120│ ⋮ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Showing 1-10 of 15                              [< Prev] [1] [2] [Next >]  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Table Columns

| Column | Field | Format | Sortable | Description |
|--------|-------|--------|----------|-------------|
| **Name** | `name` | Text + status badge | Yes | Property name with colored status indicator |
| **City** | `city` | Text | Yes | City name |
| **State** | `state` | Badge | Yes | Abbreviated (e.g., "BE", "BY") |
| **Size** | `propertySize` | `XX m²` | Yes | Living area |
| **Price** | `purchasePrice` | `€XXX,XXX` | Yes | Purchase price |
| **€/m²** | `nettoPricePerSqm` | `€X,XXX` | Yes | Computed |
| **Yield** | `grossYield` | `X.X%` | Yes | From latest calculation |
| **IRR-10** | `irr10Year` | `X.X%` | Yes | From latest calculation |
| **CF/mo** | `monthlyNetCashflowYear1` | `±€XXX` | Yes | Green if positive, red if negative |
| **Actions** | - | Dropdown | No | Edit, Duplicate, Delete |

### Status Badges

| Status | Color | Badge |
|--------|-------|-------|
| `INITIAL_INPUT` | Gray | ○ Initial |
| `APPOINTMENT_SCHEDULED` | Blue | ◐ Scheduled |
| `VISITED` | Yellow | ◑ Visited |
| `OFFER_MADE` | Orange | ◕ Offer Made |
| `REJECTED` | Red | ✕ Rejected |
| `PURCHASED` | Green | ✓ Purchased |

### Filter Section

| Filter | Type | Options |
|--------|------|---------|
| **City** | Text input with autocomplete | From existing properties |
| **State** | Multi-select dropdown | All 16 German states |
| **Status** | Multi-select dropdown | All PropertyStatus values |
| **Min Price** | Number input | EUR |
| **Max Price** | Number input | EUR |
| **Clear** | Button | Reset all filters |

### Actions Menu (per row)

```
┌─────────────┐
│ 👁 View     │  → Navigate to /properties/[id]
│ ✏️ Edit     │  → Navigate to /properties/[id]?edit=true
│ 📋 Duplicate│  → POST /api/properties/[id]/duplicate
│ ─────────── │
│ 🗑 Delete   │  → Confirm dialog, then DELETE
└─────────────┘
```

### Empty State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        🏠                                       │
│                                                                 │
│              No properties yet                                  │
│                                                                 │
│     Start by adding your first property to analyze             │
│                                                                 │
│              [+ Add First Property]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Components

```
components/property-list/
├── PropertyListPage.tsx          # Main page container
├── PropertyFilters.tsx           # Filter bar
├── PropertyTable.tsx             # Data table
├── PropertyTableRow.tsx          # Single row
├── PropertyStatusBadge.tsx       # Status indicator
├── PropertyActionsMenu.tsx       # Dropdown actions
├── PropertyEmptyState.tsx        # No data view
└── DeletePropertyDialog.tsx      # Confirmation modal
```

---

## 3. Property Detail Page Layout

### Overall Structure

**Top-to-Bottom layout**: Inputs on top, Outputs on bottom

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🏠 Real Estate Analyzer                                    [+ New Property]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Properties > Berlin Mitte 2BR                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PAGE HEADER (Name, Address, Stats, Comments)                                   │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INPUT SECTIONS (Collapsible Accordion)                                         │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FINANCING SCENARIOS (Up to 3 cards)                                            │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [Calculate All Scenarios]                              [Save All Changes]      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  OUTPUT SECTIONS (KPIs, Tables, Charts - tied to selected scenario)             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Page Header

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  Berlin Mitte 2BR                              [○ Initial ▼]                   │
│  Torstraße 123, Berlin                                                          │
│                                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                   │
│  │ 73.5 m²    │ │ €490,000   │ │ €6,667/m²  │ │ 2.5 Rooms  │                   │
│  │ Size       │ │ Price      │ │ Price/m²   │ │ Rooms      │                   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                   │
│                                                                                 │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐│
│  │ 📝 General Comments                 │ │ 👁 Visit Notes           📅 10.12.24││
│  │                                     │ │                                     ││
│  │ Good location near U-Bahn, quiet    │ │ Needs new bathroom, otherwise good  ││
│  │ backyard facing south. Building     │ │ condition. Neighbors seem friendly. ││
│  │ well maintained.                    │ │ Check heating system age.           ││
│  │                                     │ │                                     ││
│  │ [Edit]                              │ │ [Edit]                              ││
│  └─────────────────────────────────────┘ └─────────────────────────────────────┘│
│                                                                                 │
│                                                        [Duplicate] [🗑 Delete]  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Input Sections (Accordion)

| # | Section | Default | Condition |
|---|---------|---------|-----------|
| 1 | Property Details | Expanded | Always visible |
| 2 | Building & Layout | Collapsed | Always visible |
| 3 | Parking Details | Collapsed | **Only if hasParkingSpace = true** |
| 4 | Renovation | Collapsed | Always visible |
| 5 | Rental & Income | Expanded | Always visible |
| 6 | Hausgeld & Costs | Collapsed | Always visible |
| 7 | Tax Profile | Collapsed | Always visible |
| 8 | Depreciation (AfA) | Collapsed | Always visible |
| 9 | Source & Acquisition | Collapsed | Always visible |

### Output Sections

All output sections are **tied to the selected financing scenario**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Select Scenario:  (●) Conservative  ( ) Aggressive  ( ) With KfW            │
│                                                      [Compare All ↗]         │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Section | Contents |
|---------|----------|
| **KPI Summary Cards** | IRR (10/15/30), Yield, CF+ From Year, Total Profit, Equity, Loan@30 |
| **Yearly Cashflow Table** | 30-year projection with Export CSV |
| **Profit Breakdown Chart** | Stacked bar: Appreciation, Operating, Tax Savings |
| **Depreciation Schedule** | Year-by-year AfA and tax savings |

### KPI Cards

| KPI | Description | Format |
|-----|-------------|--------|
| **IRR-10yr** | Internal rate of return at 10-year exit | `X.X%` |
| **IRR-15yr** | Internal rate of return at 15-year exit | `X.X%` |
| **IRR-30yr** | Internal rate of return at 30-year exit | `X.X%` |
| **Gross Yield** | Annual rent / purchase price | `X.X%` |
| **CF+ From** | First year with positive annual cashflow | `Year X` or `Never` |
| **Total Profit** | Total profit at 30-year exit | `€XXXk` |
| **Equity Required** | Cash needed upfront | `€XXX,XXX` |
| **Upfront Investment** | Equity + purchase costs | `€XXX,XXX` |
| **Remaining Loan @30** | Outstanding loan at year 30 | `€XXX,XXX` or `€0` |

### Scenario Comparison View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO COMPARISON                                              [Back to Single]│
│                                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Conservative (80%)  │ │ Aggressive (100%)   │ │ With KfW            │        │
│ ├─────────────────────┤ ├─────────────────────┤ ├─────────────────────┤        │
│ │ IRR-10:    5.2%     │ │ IRR-10:    4.8%     │ │ IRR-10:    5.5%     │        │
│ │ IRR-15:    6.1%     │ │ IRR-15:    5.9%     │ │ IRR-15:    6.3%     │        │
│ │ IRR-30:    7.5%     │ │ IRR-30:    7.2%     │ │ IRR-30:    7.8%     │        │
│ │ Yield:     3.5%     │ │ Yield:     3.5%     │ │ Yield:     3.5%     │        │
│ │ CF+ From:  Year 8   │ │ CF+ From:  Year 12  │ │ CF+ From:  Year 6   │ ← Best │
│ │ Profit:    €485k    │ │ Profit:    €510k    │ │ Profit:    €495k    │        │
│ │ Equity:    €154,693 │ │ Equity:    €56,693  │ │ Equity:    €106,693 │        │
│ │ Loan@30:   €0       │ │ Loan@30:   €45,000  │ │ Loan@30:   €0       │        │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘        │
│                                                                                 │
│ Best scenario highlighted: ★ With KfW (earliest positive cashflow)             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Components

```
components/property-detail/
├── PropertyDetailPage.tsx
├── PropertyPageHeader.tsx
│   ├── PropertyQuickStats.tsx
│   ├── PropertyStatusSelect.tsx
│   └── PropertyComments.tsx
├── PropertyInputSections.tsx
├── FinancingScenarios.tsx
├── PropertyActionBar.tsx
├── PropertyOutputSection.tsx
│   ├── ScenarioSelector.tsx
│   ├── KpiSummaryCards.tsx
│   ├── CashflowTable.tsx
│   ├── ProfitBreakdownChart.tsx
│   ├── DepreciationSchedule.tsx
│   └── ScenarioComparisonView.tsx
└── sections/
    └── (form sections)
```

---

## 4. Input Form Sections

### Section 1: Property Details (Expanded by default)

**Fields:**
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `name` | text | Yes | min 1 char | |
| `address` | text | No | | |
| `city` | text | Yes | min 1 char | |
| `state` | select | Yes | GermanState enum | Affects Grunderwerbsteuer |
| `propertyStatus` | select | No | PropertyStatus enum | Default: INITIAL_INPUT |
| `energyClass` | select | No | EnergyClass enum | |
| `propertySize` | number | Yes | > 0 | m² |
| `numberOfRooms` | number | No | > 0 | Allows decimals (2.5) |
| `constructionYear` | number | No | 1800-2030 | |
| `purchasePrice` | number | Yes | > 0 | EUR |
| `landValuePercent` | number | Yes | 0-100 | % |
| `maklerFeePercent` | number | No | 0-10 | %, default 0 |
| `hasParkingSpace` | checkbox | No | | Enables parking fields |
| `parkingPrice` | number | No | | EUR, shown if hasParkingSpace |
| `parkingIncludedInPrice` | radio | No | | Affects total cost calculation |

**Computed Display:**
- Land Value (€)
- Building Value (€)
- Grunderwerbsteuer
- Notary Fees
- Grundbuch Fees
- Makler Fees
- Total Purchase Costs
- Total Acquisition Cost
- Price per m² (netto)
- Price per m² (final)

### Section 2: Building & Layout (Collapsed)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `buildingType` | select | No | BuildingType enum |
| `numberOfUnitsInBuilding` | number | No | |
| `hasElevator` | checkbox | No | |
| `floorLevel` | number | No | 0 = EG |
| `totalFloors` | number | No | |
| `furnishingStatus` | select | No | FurnishingStatus enum |
| `hasBalcony` | checkbox | No | Enables size field |
| `balconySize` | number | No | m², only if hasBalcony |
| `hasTerrace` | checkbox | No | Enables size field |
| `terraceSize` | number | No | m², only if hasTerrace |
| `hasGarden` | checkbox | No | Enables size field |
| `gardenSize` | number | No | m², only if hasGarden |
| `hasCellar` | checkbox | No | Enables size field |
| `cellarSize` | number | No | m², only if hasCellar |

### Section 3: Parking Details (Collapsed, only if hasParkingSpace)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `parkingType` | select | No | ParkingType enum |
| `parkingRentalIncome` | number | No | EUR/month |

### Section 4: Renovation (Collapsed)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `renovationStatus` | select | No | RenovationStatus enum |
| `renovationYear` | number | No | |
| `renovationCost` | number | No | EUR |
| `renovationTaxDeductible` | checkbox | No | Affects depreciable basis |

### Section 5: Rental & Income (Expanded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `rentalPricePerM2` | number | Yes | EUR/m² |
| `vacancyRate` | number | No | %, default 2 |
| `rentIncrementPercent` | number | No | %, default 2 |
| `rentIncrementFrequencyYears` | number | No | years, default 1 |
| `houseAppreciation` | number | Yes | % p.a. |
| `rentalDelayPeriod` | number | No | months |
| `guaranteedRentPeriod` | number | No | months |
| `rentalPriceAfterGuaranteed` | number | No | EUR/m² |

**Computed Display:**
- Monthly Rent
- Annual Rent (after vacancy)

### Section 6: Hausgeld & Costs (Collapsed)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hausgeldTotal` | number | No | EUR/month |
| `hausgeldNichtUmlagefaehig` | number | No | EUR/month, owner's cost |
| `hausgeldUmlagefaehig` | number | No | EUR/month, passed to tenant |
| `ruecklagePerSqm` | number | No | EUR/m²/month |
| `propertyManagementPercent` | number | No | % of rent |
| `insuranceCostAnnual` | number | No | EUR/year |
| `otherOperatingCosts` | number | No | EUR/year |

**Computed Display:**
- Annual Owner Costs Summary

### Section 7: Tax Profile (Collapsed)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `annualGrossIncome` | number | Yes | EUR |
| `taxFilingType` | select | Yes | SINGLE / JOINT |
| `churchTaxRate` | number | No | 0, 8, or 9 % |
| `numberOfChildren` | number | No | For future Kinderfreibetrag |
| `otherDeductions` | number | No | EUR |

**Computed Display:**
- Taxable Income
- Income Tax
- Solidarity Tax
- Church Tax
- Total Tax
- Effective Rate
- Marginal Rate (with tooltip explanation)

### Section 8: Depreciation / AfA (Collapsed)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `afaType` | radio | Yes | AfaType enum |
| `sonderAfaEligible` | checkbox | No | Enables Sonder-AfA fields |
| `sonderAfaPercent` | number | No | %, max 5 |
| `sonderAfaYears` | number | No | years, max 4 |
| `denkmalschutzEligible` | checkbox | No | Enables Denkmal fields |
| `denkmalschutzOldValue` | number | No | EUR |
| `denkmalschutzRenovationCost` | number | No | EUR |

**Computed Display:**
- Depreciable Basis
- Annual Regular AfA
- Annual Sonder-AfA
- Total Year 1 AfA
- Tax Savings Year 1

### Section 9: Source & Acquisition (Collapsed)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sourceType` | select | No | SourceType enum |
| `sourceName` | text | No | |
| `sourceContact` | text | No | |
| `purchaseInMonths` | number | No | months |

### Form Components

```
components/property-form/
├── sections/
│   ├── PropertyDetailsSection.tsx
│   ├── BuildingLayoutSection.tsx
│   ├── ParkingDetailsSection.tsx
│   ├── RenovationSection.tsx
│   ├── RentalIncomeSection.tsx
│   ├── HausgeldCostsSection.tsx
│   ├── TaxProfileSection.tsx
│   ├── DepreciationSection.tsx
│   └── SourceAcquisitionSection.tsx
├── CollapsibleSection.tsx
├── ComputedSummary.tsx
└── FormField.tsx
```

---

## 5. Key Design Decisions

### Layout Decisions

1. **Top-to-Bottom layout** (not left-right) for Property Detail page
2. **Comments in Page Header** (General + Visit notes visible at top)
3. **Parking basics in Property Details** (hasParkingSpace, price, included) for immediate cost calculation
4. **Parking details in separate section** (type, rental income) only if hasParkingSpace is checked

### Output Decisions

1. **All outputs tied to selected scenario** via radio selector
2. **"CF+ From Year X"** instead of monthly cashflow (which varies yearly)
3. **"Compare All" view** for side-by-side scenario comparison
4. **Labels show scenario name** on each output section

### Calculation Decisions

1. **Auto-calculate** on input change (debounced 500ms) for live preview
2. **Explicit Save** required to persist changes
3. **Parking affects total cost** when "Separate from purchase price" is selected

### Cost Calculation Logic

```typescript
// If parking is separate (not included in purchase price)
if (hasParkingSpace && !parkingIncludedInPrice) {
  baseForCosts = purchasePrice + parkingPrice;
} else {
  baseForCosts = purchasePrice;
}

// Purchase costs calculated on baseForCosts
grunderwerbsteuer = baseForCosts * stateRate;
notaryFees = baseForCosts * 0.015;
grundbuchFees = baseForCosts * 0.005;
maklerFees = baseForCosts * maklerFeePercent;

totalPurchaseCosts = grunderwerbsteuer + notaryFees + grundbuchFees + maklerFees;
totalAcquisitionCost = baseForCosts + totalPurchaseCosts;

// Price per m² calculations
nettoPricePerSqm = purchasePrice / propertySize;  // Always based on property only
finalPricePerSqm = totalAcquisitionCost / propertySize;
```

---

## 6. Component Hierarchy (Complete)

```
app/
├── layout.tsx
├── page.tsx                          # Property Overview
└── properties/
    ├── new/page.tsx                  # New Property
    └── [id]/page.tsx                 # Property Detail

components/
├── layout/
│   ├── Header.tsx
│   └── Breadcrumbs.tsx
├── ui/                               # shadcn/ui components
├── property-list/
│   ├── PropertyListPage.tsx
│   ├── PropertyFilters.tsx
│   ├── PropertyTable.tsx
│   ├── PropertyTableRow.tsx
│   ├── PropertyStatusBadge.tsx
│   ├── PropertyActionsMenu.tsx
│   ├── PropertyEmptyState.tsx
│   └── DeletePropertyDialog.tsx
├── property-detail/
│   ├── PropertyDetailPage.tsx
│   ├── PropertyPageHeader.tsx
│   │   ├── PropertyQuickStats.tsx
│   │   ├── PropertyStatusSelect.tsx
│   │   └── PropertyComments.tsx
│   ├── PropertyInputSections.tsx
│   ├── FinancingScenarios.tsx
│   ├── PropertyActionBar.tsx
│   └── PropertyOutputSection.tsx
│       ├── ScenarioSelector.tsx
│       ├── KpiSummaryCards.tsx
│       ├── CashflowTable.tsx
│       ├── ProfitBreakdownChart.tsx
│       ├── DepreciationSchedule.tsx
│       └── ScenarioComparisonView.tsx
├── property-form/
│   ├── sections/
│   │   ├── PropertyDetailsSection.tsx
│   │   ├── BuildingLayoutSection.tsx
│   │   ├── ParkingDetailsSection.tsx
│   │   ├── RenovationSection.tsx
│   │   ├── RentalIncomeSection.tsx
│   │   ├── HausgeldCostsSection.tsx
│   │   ├── TaxProfileSection.tsx
│   │   ├── DepreciationSection.tsx
│   │   └── SourceAcquisitionSection.tsx
│   ├── CollapsibleSection.tsx
│   ├── ComputedSummary.tsx
│   └── FormField.tsx
└── hooks/
    ├── useProperties.ts
    ├── useProperty.ts
    └── useCalculation.ts
```

---

## 7. Financing Scenarios

### Layout

Up to 3 financing scenario cards displayed side-by-side:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ FINANCING SCENARIOS                                                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐ │
│ │ Scenario 1             │ │ Scenario 2             │ │ + Add Scenario         │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━ │ │ ━━━━━━━━━━━━━━━━━━━━━━ │ │                        │ │
│ │ Conservative           │ │ Aggressive             │ │                        │ │
│ │                        │ │                        │ │   Click to add a new   │ │
│ │ Bank Loan              │ │ Bank Loan              │ │   financing scenario   │ │
│ │ LTV:        80%        │ │ LTV:        100%       │ │                        │ │
│ │ Interest:   4.00%      │ │ Interest:   4.20%      │ │   (max 3 scenarios)    │ │
│ │ Fixed:      10 years   │ │ Fixed:      10 years   │ │                        │ │
│ │ Repayment:  2.00%      │ │ Repayment:  1.50%      │ │                        │ │
│ │                        │ │                        │ │                        │ │
│ │ Loan Amount: €392,000  │ │ Loan Amount: €490,000  │ │                        │ │
│ │ Monthly:     €1,960    │ │ Monthly:     €2,328    │ │                        │ │
│ │                        │ │                        │ │                        │ │
│ │ KfW Loan: None         │ │ KfW Loan               │ │                        │ │
│ │                        │ │ Amount:     €100,000   │ │                        │ │
│ │                        │ │ Interest:   3.06%      │ │                        │ │
│ │                        │ │ Monthly:    €450       │ │                        │ │
│ │                        │ │                        │ │                        │ │
│ │ ────────────────────── │ │ ────────────────────── │ │                        │ │
│ │ Equity Required:       │ │ Equity Required:       │ │                        │ │
│ │ €154,693               │ │ €56,693                │ │                        │ │
│ │                        │ │                        │ │                        │ │
│ │ [Edit] [Duplicate] [🗑]│ │ [Edit] [Duplicate] [🗑]│ │                        │ │
│ └────────────────────────┘ └────────────────────────┘ └────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Scenario Card (Collapsed View)

```
┌────────────────────────────────────────┐
│ Scenario 1                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Conservative                           │
│                                        │
│ Bank Loan                              │
│ LTV:        80%       → €392,000       │
│ Interest:   4.00%                      │
│ Fixed:      10 years                   │
│ Repayment:  2.00%                      │
│ Monthly:    €1,960                     │
│                                        │
│ KfW Loan: None                         │
│                                        │
│ ────────────────────────────────────── │
│ Total Monthly:    €1,960               │
│ Equity Required:  €154,693             │
│                                        │
│ 💬 "Standard conservative approach"    │
│                                        │
│ [Edit] [Duplicate] [🗑]                │
└────────────────────────────────────────┘
```

### Scenario Edit Modal/Drawer

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Edit Financing Scenario                                              [✕]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Scenario Name *                                                     │    │
│  │ [Conservative                                                     ] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│  BANK LOAN                                                                   │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │ LTV % *         │ │ Loan Amount     │  (computed)                        │
│  │ [80          %] │ │ €392,000        │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │ Interest Rate * │ │ Fixed Period *  │                                    │
│  │ [4.00        %] │ │ [10      years] │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │ Repayment Rate *│ │ Monthly Payment │  (computed)                        │
│  │ [2.00        %] │ │ €1,960          │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ Acquisition Cost│  ℹ️ Tax deductible (usually €0)                        │
│  │ [0           €] │  (Bearbeitungsgebühr, Schätzkosten)                    │
│  └─────────────────┘                                                        │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│  KFW LOAN (Optional)                                                         │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ [✓] Include KfW │                                                        │
│  └─────────────────┘                                                        │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │ KfW Loan Amount │ │ KfW Interest    │                                    │
│  │ [100,000     €] │ │ [3.06        %] │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │ KfW Fixed Period│ │ KfW Payback     │                                    │
│  │ [10      years] │ │ [25      years] │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │ Repayment-Free  │ │ Tilgungszuschuss│                                    │
│  │ [2       years] │ │ [0           €] │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ Acquisition Cost│  ℹ️ Tax deductible in year of purchase                 │
│  │ [1,500       €] │  (Bereitstellungsprovision, processing fees)           │
│  └─────────────────┘                                                        │
│                                                                              │
│  ┌─────────────────┐                                                        │
│  │ KfW Monthly     │  (computed)                                            │
│  │ €450            │                                                        │
│  └─────────────────┘                                                        │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│  DISBURSEMENT ORDER                                                          │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ (●) Disburse KfW loan first                                         │    │
│  │ ( ) Disburse Bank loan first                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│  SUMMARY                                                                     │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Total Loan Amount:       €492,000                                    │   │
│  │ Total Monthly Payment:   €2,410                                      │   │
│  │ Equity Required:         €82,693                                     │   │
│  │                                                                      │   │
│  │ Loan Acquisition Costs:  €1,500  (tax deductible Year 1)             │   │
│  │   • Bank: €0                                                         │   │
│  │   • KfW:  €1,500                                                     │   │
│  │                                                                      │   │
│  │ Effective Upfront:       €84,193  (Equity + Loan costs)              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│  COMMENTS                                                                    │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Notes about this scenario...                                         │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                              [Cancel]  [Save Scenario]       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Financing Scenario Fields

#### Bank Loan (Required)

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `scenarioName` | text | Yes | min 1 char | e.g., "Conservative" |
| `ltvPercent` | number | Yes | 0-150 | % of purchase price |
| `bankInterestRate` | number | Yes | 0-15 | % p.a. |
| `bankFixedPeriod` | number | Yes | 1-30 | years |
| `repaymentRate` | number | Yes | 0-10 | % p.a. initial Tilgung |
| `bankAcquisitionCost` | number | No | ≥ 0 | EUR, default 0, tax deductible |
| `disburseBankLoanFirst` | radio | No | | Default: KfW first |

#### KfW Loan (Optional)

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `includeKfw` | checkbox | No | | Enables KfW fields |
| `kfwLoanSize` | number | No | 0-150,000 | EUR (KfW limits) |
| `kfwInterestRate` | number | No | 0-10 | % p.a. |
| `kfwFixedPeriod` | number | No | 1-20 | years |
| `kfwRepaymentFreePeriod` | number | No | 0-5 | years |
| `kfwPaybackPeriod` | number | No | 4-35 | years |
| `kfwTilgungszuschuss` | number | No | 0-50,000 | EUR grant |
| `kfwAcquisitionCost` | number | No | ≥ 0 | EUR, tax deductible |

#### Comments

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `comments` | textarea | No | Notes about scenario |

### Computed Values (Display Only)

| Value | Formula |
|-------|---------|
| `bankLoanAmount` | `totalAcquisitionCost × (ltvPercent / 100)` |
| `monthlyBankPayment` | Annuity formula |
| `kfwMonthlyPayment` | KfW-specific calculation |
| `totalMonthlyPayment` | `monthlyBankPayment + kfwMonthlyPayment` |
| `totalLoanAmount` | `bankLoanAmount + kfwLoanSize` |
| `equityRequired` | `totalAcquisitionCost - totalLoanAmount` |
| `totalLoanAcquisitionCost` | `bankAcquisitionCost + kfwAcquisitionCost` |
| `effectiveUpfront` | `equityRequired + totalLoanAcquisitionCost` |

### Scenario Actions

| Action | Behavior |
|--------|----------|
| **Edit** | Opens edit modal/drawer |
| **Duplicate** | Creates copy with "Copy of [name]" |
| **Delete** | Confirm dialog, removes scenario |
| **Add** | Opens empty edit modal (only if < 3 scenarios) |

### Validation Rules

1. **Max 3 scenarios** per property
2. **Scenario order** (1, 2, 3) assigned automatically
3. **LTV > 100%** allowed (for 110% financing)
4. **KfW limits** enforced (max €150,000 typically)
5. **At least 1 scenario** required for calculation

### Tax Treatment of Loan Acquisition Costs

- `bankAcquisitionCost` and `kfwAcquisitionCost` are **tax deductible in Year 1**
- Deducted from taxable rental income
- Shown in Depreciation Schedule as one-time deduction

### Components

```
components/property-detail/
├── FinancingScenarios.tsx           # Container for all scenarios
├── FinancingScenarioCard.tsx        # Individual card (collapsed view)
├── FinancingScenarioModal.tsx       # Edit modal/drawer
├── FinancingScenarioForm.tsx        # Form inside modal
│   ├── BankLoanFields.tsx
│   ├── KfwLoanFields.tsx
│   └── FinancingSummary.tsx
└── AddScenarioCard.tsx              # "+ Add Scenario" placeholder
```

---

## 8. Output Panels

All outputs are tied to the selected financing scenario.

### Overall Output Section Layout

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ RESULTS                                                                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Select Scenario:  (●) Conservative  ( ) Aggressive  ( ) With KfW               │
│                                                           [Compare All ↗]        │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│  1. KPI SUMMARY CARDS                                                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│  2. YEARLY CASHFLOW TABLE                                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│  3. CHARTS (Profit Breakdown + Equity Growth)                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│  4. DEPRECIATION SCHEDULE                                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 KPI Summary Cards

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ KPI SUMMARY                                              For: Conservative       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │ IRR-10yr   │ │ IRR-15yr   │ │ IRR-30yr   │ │ Gross      │ │ Net        │     │
│  │   5.2%     │ │   6.1%     │ │   7.5%     │ │ Yield      │ │ Yield      │     │
│  │            │ │            │ │            │ │   3.5%     │ │   2.8%     │     │
│  │ ▲ Good     │ │ ▲ Good     │ │ ▲ Great    │ │            │ │            │     │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
│                                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │ CF+ From   │ │ Total      │ │ Upfront    │ │ Equity     │ │ Loan @30   │     │
│  │   Year 8   │ │ Profit     │ │ Investment │ │ Required   │ │   €0       │     │
│  │            │ │   €485,000 │ │   €84,193  │ │   €82,693  │ │            │     │
│  │ ● Moderate │ │            │ │            │ │            │ │ ✓ Paid off │     │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### KPI Card Details

| KPI | Source | Format | Indicator |
|-----|--------|--------|-----------|
| **IRR-10yr** | `irr10Year` | `X.X%` | Color: <5% red, 5-7% yellow, >7% green |
| **IRR-15yr** | `irr15Year` | `X.X%` | Same color logic |
| **IRR-30yr** | `irr30Year` | `X.X%` | Same color logic |
| **Gross Yield** | `grossYield` | `X.X%` | Neutral |
| **Net Yield** | `netYield` | `X.X%` | Neutral |
| **CF+ From** | Computed | `Year X` | <5 green, 5-10 yellow, >10 red, "Never" red |
| **Total Profit** | `totalProfitAtExit` | `€XXX,XXX` | Neutral |
| **Upfront Investment** | `effectiveUpfront` | `€XXX,XXX` | Neutral |
| **Equity Required** | `equityRequired` | `€XXX,XXX` | Neutral |
| **Loan @30** | `remainingLoanAtYear30` | `€XXX,XXX` | €0 = green checkmark |

### 8.2 Yearly Cashflow Table

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ YEARLY CASHFLOW                                  For: Conservative  [Export CSV] │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ ┌──────┬────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────┐│
│ │ Year │Calendar│ Rental   │ Mortgage │ Interest │ Hausgeld │ Tax      │ Net   ││
│ │      │        │ Income   │ Payment  │ Portion  │ (n.u.)   │ Refund   │ CF    ││
│ ├──────┼────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────┤│
│ │  1   │ 2025   │ €12,801  │ €23,520  │ €15,680  │ €2,160   │ +€8,245  │-€4,634││
│ │  2   │ 2026   │ €13,057  │ €23,520  │ €15,210  │ €2,160   │ +€7,890  │-€4,733││
│ │  3   │ 2027   │ €13,318  │ €23,520  │ €14,720  │ €2,160   │ +€7,512  │-€4,850││
│ │  ... │ ...    │ ...      │ ...      │ ...      │ ...      │ ...      │ ...   ││
│ │  8   │ 2032   │ €14,859  │ €23,520  │ €12,100  │ €2,160   │ +€5,421  │ +€500 ││ ← Highlighted
│ │  ... │ ...    │ ...      │ ...      │ ...      │ ...      │ ...      │ ...   ││
│ │ 30   │ 2054   │ €23,180  │ €23,520  │ €1,200   │ €2,160   │ +€890    │+€8,390││
│ └──────┴────────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────┘│
│                                                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────┐│
│ │ TOTALS (30 Years)                                                            ││
│ │ Total Rental Income:    €520,450                                             ││
│ │ Total Mortgage Paid:    €705,600                                             ││
│ │ Total Interest Paid:    €285,600                                             ││
│ │ Total Tax Refunds:      €142,350                                             ││
│ │ Cumulative Net CF:      +€85,200                                             ││
│ └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│ [Show All 30 Years ▼]  or  [Show Years 1-10] [11-20] [21-30]                    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### Table Columns

| Column | Source | Format | Notes |
|--------|--------|--------|-------|
| **Year** | `year` | 1-30 | Row number |
| **Calendar** | `calendarYear` | YYYY | Actual year |
| **Rental Income** | `totalIncome` | `€XX,XXX` | Rent + parking |
| **Mortgage Payment** | `mortgagePayment` | `€XX,XXX` | Bank + KfW |
| **Interest Portion** | `interestPortion` | `€XX,XXX` | Tax deductible part |
| **Hausgeld (n.u.)** | `hausgeldNichtUmlagefaehig` | `€X,XXX` | Non-recoverable |
| **Tax Refund** | `taxRefund` | `+€X,XXX` | From losses/depreciation |
| **Net CF** | `netCashflowAfterTax` | `±€X,XXX` | Green if +, red if - |

#### Table Features

- **Highlight first positive year** with background color
- **Expandable** – Show 10 years at a time or all 30
- **Export CSV** button
- **Totals row** at bottom

### 8.3 Charts

#### Profit Breakdown Chart

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ PROFIT BREAKDOWN AT EXIT (30 Years)                      For: Conservative       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Total Profit: €485,000                                                          │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                            │ │
│  │  ████████████████████████████████████████████  Appreciation    €320,000   │ │
│  │  ██████████████████                            Operating CF    €85,000    │ │
│  │  ████████████████                              Tax Savings     €80,000    │ │
│  │                                                                            │ │
│  │  0%        25%        50%        75%        100%                          │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                    │
│  │ 🏠 Appreciation │ │ 💰 Operating    │ │ 📋 Tax Savings  │                    │
│  │    €320,000     │ │    €85,000      │ │    €80,000      │                    │
│  │    66%          │ │    18%          │ │    16%          │                    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### Equity Growth Chart

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ EQUITY & PROPERTY VALUE OVER TIME                        For: Conservative       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  €1,400,000 ┤                                                    ╭──── Property │
│             │                                              ╭─────╯      Value   │
│  €1,200,000 ┤                                        ╭─────╯                    │
│             │                                  ╭─────╯                          │
│  €1,000,000 ┤                            ╭─────╯                                │
│             │                      ╭─────╯                                      │
│    €800,000 ┤                ╭─────╯                                            │
│             │          ╭─────╯     ╭────────────────────────────── Equity       │
│    €600,000 ┤    ╭─────╯     ╭─────╯                                            │
│             │────╯     ╭─────╯                                                  │
│    €400,000 ┤    ╭─────╯                                                        │
│             │────╯                                                              │
│    €200,000 ┤                                                                   │
│             │    ════════════════════════════════════════════════ Remaining    │
│          €0 ┼────────────────────────────────────────────────────── Loan       │
│             └────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────       │
│                  5   10   15   20   25   30                                     │
│                              Years                                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### Chart Types (using Recharts)

| Chart | Type | Data |
|-------|------|------|
| **Profit Breakdown** | Horizontal stacked bar | `profitFromAppreciation`, `profitFromOperating`, `profitFromTaxSavings` |
| **Equity Growth** | Line chart | `propertyValue`, `equity`, `remainingBankLoan + remainingKfwLoan` per year |

### 8.4 Depreciation Schedule

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ▶ DEPRECIATION SCHEDULE (AfA)                            For: Conservative       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Depreciable Basis: €488,193                                                     │
│  AfA Type: 2.5% Linear (40 years)                                                │
│  Sonder-AfA: 5% for 4 years                                                      │
│                                                                                  │
│ ┌──────┬────────────┬────────────┬────────────┬────────────┬────────────┐       │
│ │ Year │ Regular AfA│ Sonder-AfA │ Total AfA  │ Marginal % │ Tax Savings│       │
│ ├──────┼────────────┼────────────┼────────────┼────────────┼────────────┤       │
│ │  1   │ €12,205    │ €24,410    │ €36,615    │ 42%        │ €15,378    │       │
│ │  2   │ €12,205    │ €24,410    │ €36,615    │ 42%        │ €15,378    │       │
│ │  3   │ €12,205    │ €24,410    │ €36,615    │ 42%        │ €15,378    │       │
│ │  4   │ €12,205    │ €24,410    │ €36,615    │ 42%        │ €15,378    │       │
│ │  5   │ €12,205    │ €0         │ €12,205    │ 42%        │ €5,126     │       │
│ │ ...  │ ...        │ ...        │ ...        │ ...        │ ...        │       │
│ │ 40   │ €12,205    │ €0         │ €12,205    │ 42%        │ €5,126     │       │
│ └──────┴────────────┴────────────┴────────────┴────────────┴────────────┘       │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ TOTALS                                                                   │   │
│  │ Total Regular AfA:     €488,193 (over 40 years)                          │   │
│  │ Total Sonder-AfA:      €97,640 (years 1-4)                               │   │
│  │ Total Tax Savings:     €246,000                                          │   │
│  │                                                                          │   │
│  │ Loan Acquisition Costs (Year 1 deduction):                               │   │
│  │   Bank: €0  |  KfW: €1,500  |  Tax Savings: €630                         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### Depreciation Table Columns

| Column | Description |
|--------|-------------|
| **Year** | 1-40 (or until fully depreciated) |
| **Regular AfA** | Annual standard depreciation |
| **Sonder-AfA** | Additional depreciation (if eligible) |
| **Total AfA** | Sum of regular + Sonder |
| **Marginal %** | User's marginal tax rate |
| **Tax Savings** | `Total AfA × Marginal Rate` |

### 8.5 Scenario Comparison View

When "Compare All" is clicked:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SCENARIO COMPARISON                                          [← Back to Single]  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────┐ │
│ │ Conservative            │ │ Aggressive              │ │ With KfW            │ │
│ │ (80% LTV)               │ │ (100% LTV)              │ │ (80% + KfW)         │ │
│ ├─────────────────────────┤ ├─────────────────────────┤ ├─────────────────────┤ │
│ │                         │ │                         │ │                     │ │
│ │ IRR-10yr:     5.2%      │ │ IRR-10yr:     4.8%      │ │ IRR-10yr:   ★ 5.5%  │ │
│ │ IRR-15yr:     6.1%      │ │ IRR-15yr:     5.9%      │ │ IRR-15yr:   ★ 6.3%  │ │
│ │ IRR-30yr:     7.5%      │ │ IRR-30yr:     7.2%      │ │ IRR-30yr:   ★ 7.8%  │ │
│ │                         │ │                         │ │                     │ │
│ │ Gross Yield:  3.5%      │ │ Gross Yield:  3.5%      │ │ Gross Yield: 3.5%   │ │
│ │ Net Yield:    2.8%      │ │ Net Yield:    2.8%      │ │ Net Yield:   2.8%   │ │
│ │                         │ │                         │ │                     │ │
│ │ CF+ From:     Year 8    │ │ CF+ From:     Year 12   │ │ CF+ From:  ★ Year 6 │ │
│ │                         │ │                         │ │                     │ │
│ │ Total Profit: €485,000  │ │ Total Profit: ★€510,000 │ │ Total Profit:€495k  │ │
│ │                         │ │                         │ │                     │ │
│ │ ─────────────────────── │ │ ─────────────────────── │ │ ───────────────────│ │
│ │ Upfront:      €154,693  │ │ Upfront:    ★ €56,693   │ │ Upfront:   €106,693│ │
│ │ Monthly:      €1,960    │ │ Monthly:      €2,328    │ │ Monthly:   €2,410  │ │
│ │ Loan @30:     €0        │ │ Loan @30:     €45,000   │ │ Loan @30:  €0      │ │
│ │                         │ │                         │ │                     │ │
│ └─────────────────────────┘ └─────────────────────────┘ └─────────────────────┘ │
│                                                                                  │
│ ★ = Best in category                                                             │
│                                                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────┐│
│ │ RECOMMENDATION                                                               ││
│ │                                                                              ││
│ │ Best Overall: With KfW                                                       ││
│ │ • Highest IRR across all timeframes                                          ││
│ │ • Earliest positive cashflow (Year 6)                                        ││
│ │ • Moderate upfront investment                                                ││
│ │                                                                              ││
│ │ Alternative: Aggressive (if minimizing upfront capital is priority)          ││
│ └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### Comparison Features

- **★ markers** for best value in each row
- **Recommendation box** with simple analysis
- **Side-by-side layout** for easy comparison

### Output Components

```
components/property-detail/
├── PropertyOutputSection.tsx       # Main container
│   ├── ScenarioSelector.tsx        # Radio buttons + Compare All
│   ├── KpiSummaryCards.tsx         # Grid of KPI cards
│   │   └── KpiCard.tsx             # Individual card with indicator
│   ├── CashflowTable.tsx           # 30-year table
│   │   ├── CashflowTableRow.tsx
│   │   └── CashflowTotals.tsx
│   ├── ProfitBreakdownChart.tsx    # Horizontal stacked bar
│   ├── EquityGrowthChart.tsx       # Line chart
│   ├── DepreciationSchedule.tsx    # Collapsible AfA table
│   └── ScenarioComparisonView.tsx  # Side-by-side comparison
│       ├── ScenarioComparisonCard.tsx
│       └── RecommendationBox.tsx
```
