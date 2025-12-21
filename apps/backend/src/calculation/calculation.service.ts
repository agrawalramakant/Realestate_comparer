import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Property, FinancingScenario, TaxProfile, InvestmentAssumptions } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// German state transfer tax rates
const GRUNDERWERBSTEUER: Record<string, number> = {
  BADEN_WUERTTEMBERG: 0.05,
  BAYERN: 0.035,
  BERLIN: 0.06,
  BRANDENBURG: 0.065,
  BREMEN: 0.05,
  HAMBURG: 0.055,
  HESSEN: 0.06,
  MECKLENBURG_VORPOMMERN: 0.06,
  NIEDERSACHSEN: 0.05,
  NORDRHEIN_WESTFALEN: 0.065,
  RHEINLAND_PFALZ: 0.05,
  SAARLAND: 0.065,
  SACHSEN: 0.055,
  SACHSEN_ANHALT: 0.05,
  SCHLESWIG_HOLSTEIN: 0.065,
  THUERINGEN: 0.05,
};

// Notary + registration fees (approximate)
const NOTAR_GRUNDBUCH_RATE = 0.02;

interface PropertyWithRelations extends Property {
  taxProfile: TaxProfile | null;
  investmentAssumptions: InvestmentAssumptions | null;
}

interface YearlyCashflowData {
  year: number;
  calendarYear: number;
  rentalIncome: number;
  parkingIncome: number;
  totalIncome: number;
  mortgagePayment: number;
  kfwPayment: number;
  interestPortion: number;
  principalPortion: number;
  hausgeldNichtUmlagefaehig: number;
  otherCosts: number;
  totalExpenses: number;
  normalDepreciation: number;
  specialDepreciation: number;
  depreciationAmount: number;
  marginalTaxRate: number;
  taxSavingOnDepreciation: number;
  taxableIncome: number;
  taxRefund: number;
  netCashflowBeforeTax: number;
  netCashflowAfterTax: number;
  cumulativeCashflow: number;
  remainingBankLoan: number;
  remainingKfwLoan: number;
  propertyValue: number;
  equity: number;
}

interface CalculationSummary {
  irr10Year: number;
  irr15Year: number;
  irr30Year: number;
  totalProfitAtExit: number;
  upfrontInvestment: number;
  monthlyNetCashflowYear1: number;
  grossYield: number;
  netYield: number;
  cashOnCashReturn: number;
  profitFromAppreciation: number;
  profitFromOperating: number;
  profitFromTaxSavings: number;
  totalTaxSavingsFromAfa: number;
  remainingLoanAtYear30: number;
}

@Injectable()
export class CalculationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Run full calculation for a property + financing scenario
   */
  async calculate(propertyId: string, financingScenarioId: string) {
    // Fetch property with all related data
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        taxProfile: true,
        investmentAssumptions: true,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found`);
    }

    // Fetch financing scenario
    const scenario = await this.prisma.financingScenario.findUnique({
      where: { id: financingScenarioId },
    });

    if (!scenario) {
      throw new NotFoundException(`Financing scenario ${financingScenarioId} not found`);
    }

    // Calculate upfront investment
    const upfrontInvestment = this.calculateUpfrontInvestment(property, scenario);

    // Generate 30 years of cashflow
    const yearlyCashflows = this.generateYearlyCashflows(property, scenario, upfrontInvestment);

    // Calculate summary KPIs
    const summary = this.calculateSummaryKPIs(property, scenario, yearlyCashflows, upfrontInvestment);

    // Store results in database
    const result = await this.storeCalculationResult(
      propertyId,
      financingScenarioId,
      property,
      scenario,
      summary,
      yearlyCashflows,
    );

    return result;
  }

  /**
   * Calculate total upfront investment (equity + closing costs)
   */
  private calculateUpfrontInvestment(property: PropertyWithRelations, scenario: FinancingScenario): number {
    const purchasePrice = this.toNumber(property.purchasePrice);
    const ltvPercent = this.toNumber(scenario.ltvPercent);
    
    // Loan amount
    const bankLoanAmount = purchasePrice * ltvPercent;
    const kfwLoanAmount = this.toNumber(scenario.kfwLoanSize);
    const totalLoan = bankLoanAmount + kfwLoanAmount;
    
    // Equity needed
    const equityForProperty = Math.max(0, purchasePrice - totalLoan);
    
    // Closing costs
    const transferTax = purchasePrice * (GRUNDERWERBSTEUER[property.state] || 0.05);
    const notaryCosts = purchasePrice * NOTAR_GRUNDBUCH_RATE;
    const maklerFee = purchasePrice * this.toNumber(property.maklerFeePercent);
    const renovationCost = this.toNumber(property.renovationCost);
    
    // Bank acquisition costs (Bereitstellungszinsen, etc.)
    const bankAcquisitionCost = this.toNumber(scenario.bankAcquisitionCost);
    const kfwAcquisitionCost = this.toNumber(scenario.kfwAcquisitionCost);
    
    return equityForProperty + transferTax + notaryCosts + maklerFee + renovationCost + bankAcquisitionCost + kfwAcquisitionCost;
  }

  /**
   * Generate yearly cashflow projections for 30 years
   */
  private generateYearlyCashflows(
    property: PropertyWithRelations,
    scenario: FinancingScenario,
    upfrontInvestment: number,
  ): YearlyCashflowData[] {
    const cashflows: YearlyCashflowData[] = [];
    const currentYear = new Date().getFullYear();
    
    // Property values
    const purchasePrice = this.toNumber(property.purchasePrice);
    const propertySize = this.toNumber(property.propertySize);
    const rentalPricePerM2 = this.toNumber(property.rentalPricePerM2);
    const parkingRentalIncome = this.toNumber(property.parkingRentalIncome);
    const houseAppreciation = this.toNumber(property.houseAppreciation);
    const vacancyRate = this.toNumber(property.vacancyRate);
    const rentIncrementPercent = this.toNumber(property.rentIncrementPercent);
    const rentIncrementFrequencyYears = property.rentIncrementFrequencyYears || 1;
    const hausgeldNichtUmlagefaehig = this.toNumber(property.hausgeldNichtUmlagefaehig) * 12;
    
    // Loan values
    const ltvPercent = this.toNumber(scenario.ltvPercent);
    const bankLoanAmount = purchasePrice * ltvPercent;
    const bankInterestRate = this.toNumber(scenario.bankInterestRate);
    const bankRepaymentRate = this.toNumber(scenario.repaymentRate);
    const bankFixedPeriod = scenario.bankFixedPeriod;
    
    const kfwLoanAmount = this.toNumber(scenario.kfwLoanSize);
    const kfwInterestRate = this.toNumber(scenario.kfwInterestRate);
    const kfwPrincipalFreeYears = scenario.kfwRepaymentFreePeriod || 0;
    
    // Tax values - calculate marginal tax rate from gross income
    const taxRate = property.taxProfile 
      ? this.calculateMarginalTaxRate(this.toNumber(property.taxProfile.annualGrossIncome))
      : 0.42;
    const landValuePercent = this.toNumber(property.landValuePercent);
    const buildingValue = purchasePrice * (1 - landValuePercent);
    const afaRate = property.constructionYear && property.constructionYear < 1925 ? 0.025 : 0.02;
    const annualDepreciation = buildingValue * afaRate;
    
    // Track loan balances
    let remainingBankLoan = bankLoanAmount;
    let remainingKfwLoan = kfwLoanAmount;
    let cumulativeCashflow = -upfrontInvestment;
    let currentRentPerM2 = rentalPricePerM2;
    let propertyValue = purchasePrice;
    
    for (let year = 1; year <= 30; year++) {
      const calendarYear = currentYear + year;
      
      // Rent increment
      if (year > 1 && (year - 1) % rentIncrementFrequencyYears === 0) {
        currentRentPerM2 *= (1 + rentIncrementPercent);
      }
      
      // Property appreciation
      propertyValue *= (1 + houseAppreciation);
      
      // Income
      const grossRentalIncome = currentRentPerM2 * propertySize * 12;
      const effectiveRentalIncome = grossRentalIncome * (1 - vacancyRate);
      const yearlyParkingIncome = parkingRentalIncome * 12;
      const totalIncome = effectiveRentalIncome + yearlyParkingIncome;
      
      // Bank loan payment (annuity)
      const bankAnnuity = this.calculateAnnuity(bankLoanAmount, bankInterestRate, bankRepaymentRate);
      const bankInterest = remainingBankLoan * bankInterestRate;
      const bankPrincipal = Math.min(remainingBankLoan, bankAnnuity - bankInterest);
      remainingBankLoan = Math.max(0, remainingBankLoan - bankPrincipal);
      
      // KfW loan payment
      let kfwPayment = 0;
      let kfwInterest = 0;
      let kfwPrincipal = 0;
      
      if (kfwLoanAmount > 0 && remainingKfwLoan > 0) {
        kfwInterest = remainingKfwLoan * kfwInterestRate;
        
        if (year <= kfwPrincipalFreeYears) {
          // Interest-only period
          kfwPayment = kfwInterest;
          kfwPrincipal = 0;
        } else {
          // Standard annuity after grace period
          const kfwAnnuity = this.calculateKfwAnnuity(kfwLoanAmount, kfwInterestRate, 35 - kfwPrincipalFreeYears);
          kfwPrincipal = Math.min(remainingKfwLoan, kfwAnnuity - kfwInterest);
          kfwPayment = kfwInterest + kfwPrincipal;
        }
        remainingKfwLoan = Math.max(0, remainingKfwLoan - kfwPrincipal);
      }
      
      const totalInterest = bankInterest + kfwInterest;
      const totalPrincipal = bankPrincipal + kfwPrincipal;
      const mortgagePayment = bankAnnuity;
      
      // Other costs (maintenance, insurance, etc.)
      const otherCosts = 0; // Can be expanded
      
      const totalExpenses = mortgagePayment + kfwPayment + hausgeldNichtUmlagefaehig + otherCosts;
      
      // Depreciation calculation
      const normalDepreciation = annualDepreciation;
      
      // Special depreciation (Sonder-AfA) - from investment assumptions if available
      let specialDepreciation = 0;
      if (property.investmentAssumptions?.sonderAfaEligible) {
        const sonderAfaPercent = this.toNumber(property.investmentAssumptions.sonderAfaPercent);
        const sonderAfaYears = property.investmentAssumptions.sonderAfaYears || 4;
        if (year <= sonderAfaYears && sonderAfaPercent > 0) {
          specialDepreciation = buildingValue * sonderAfaPercent;
        }
      }
      
      const depreciationAmount = normalDepreciation + specialDepreciation;
      const taxSavingOnDepreciation = depreciationAmount * taxRate;
      
      // Tax calculation
      const deductibleInterest = totalInterest;
      const taxableIncome = totalIncome - hausgeldNichtUmlagefaehig - deductibleInterest - depreciationAmount;
      const taxRefund = taxableIncome < 0 ? Math.abs(taxableIncome) * taxRate : 0;
      const taxPayment = taxableIncome > 0 ? taxableIncome * taxRate : 0;
      
      // Cashflow
      const netCashflowBeforeTax = totalIncome - totalExpenses;
      const netCashflowAfterTax = netCashflowBeforeTax + taxRefund - taxPayment;
      cumulativeCashflow += netCashflowAfterTax;
      
      // Equity
      const equity = propertyValue - remainingBankLoan - remainingKfwLoan;
      
      cashflows.push({
        year,
        calendarYear,
        rentalIncome: effectiveRentalIncome,
        parkingIncome: yearlyParkingIncome,
        totalIncome,
        mortgagePayment,
        kfwPayment,
        interestPortion: totalInterest,
        principalPortion: totalPrincipal,
        hausgeldNichtUmlagefaehig,
        otherCosts,
        totalExpenses,
        normalDepreciation,
        specialDepreciation,
        depreciationAmount,
        marginalTaxRate: taxRate,
        taxSavingOnDepreciation,
        taxableIncome,
        taxRefund: taxRefund - taxPayment,
        netCashflowBeforeTax,
        netCashflowAfterTax,
        cumulativeCashflow,
        remainingBankLoan,
        remainingKfwLoan,
        propertyValue,
        equity,
      });
    }
    
    return cashflows;
  }

  /**
   * Calculate summary KPIs
   */
  private calculateSummaryKPIs(
    property: PropertyWithRelations,
    scenario: FinancingScenario,
    cashflows: YearlyCashflowData[],
    upfrontInvestment: number,
  ): CalculationSummary {
    const purchasePrice = this.toNumber(property.purchasePrice);
    const propertySize = this.toNumber(property.propertySize);
    const rentalPricePerM2 = this.toNumber(property.rentalPricePerM2);
    const parkingRentalIncome = this.toNumber(property.parkingRentalIncome);
    
    // Gross yield
    const annualRent = (rentalPricePerM2 * propertySize + parkingRentalIncome) * 12;
    const grossYield = annualRent / purchasePrice;
    
    // Net yield (after non-recoverable costs)
    const hausgeldNichtUmlagefaehig = this.toNumber(property.hausgeldNichtUmlagefaehig) * 12;
    const netRent = annualRent - hausgeldNichtUmlagefaehig;
    const netYield = netRent / purchasePrice;
    
    // Cash on cash return (Year 1)
    const year1Cashflow = cashflows[0]?.netCashflowAfterTax || 0;
    const cashOnCashReturn = upfrontInvestment > 0 ? year1Cashflow / upfrontInvestment : 0;
    
    // Monthly net cashflow Year 1
    const monthlyNetCashflowYear1 = year1Cashflow / 12;
    
    // IRR calculations
    const irr10Year = this.calculateIRR(upfrontInvestment, cashflows.slice(0, 10));
    const irr15Year = this.calculateIRR(upfrontInvestment, cashflows.slice(0, 15));
    const irr30Year = this.calculateIRR(upfrontInvestment, cashflows.slice(0, 30));
    
    // Profit breakdown at year 30
    const year30 = cashflows[29];
    const profitFromAppreciation = year30 ? year30.propertyValue - purchasePrice : 0;
    const profitFromOperating = year30 ? year30.cumulativeCashflow + upfrontInvestment : 0;
    
    // Total tax savings from depreciation
    const taxRate = property.taxProfile 
      ? this.calculateMarginalTaxRate(this.toNumber(property.taxProfile.annualGrossIncome))
      : 0.42;
    const totalTaxSavingsFromAfa = cashflows.reduce((sum, cf) => {
      return sum + (cf.taxRefund > 0 ? cf.depreciationAmount * taxRate : 0);
    }, 0);
    const profitFromTaxSavings = totalTaxSavingsFromAfa;
    
    // Total profit at exit (sell at year 30)
    const remainingLoanAtYear30 = year30 ? year30.remainingBankLoan + year30.remainingKfwLoan : 0;
    const exitProceeds = year30 ? year30.propertyValue - remainingLoanAtYear30 : 0;
    const totalProfitAtExit = exitProceeds + (year30?.cumulativeCashflow || 0);
    
    return {
      irr10Year,
      irr15Year,
      irr30Year,
      totalProfitAtExit,
      upfrontInvestment,
      monthlyNetCashflowYear1,
      grossYield,
      netYield,
      cashOnCashReturn,
      profitFromAppreciation,
      profitFromOperating,
      profitFromTaxSavings,
      totalTaxSavingsFromAfa,
      remainingLoanAtYear30,
    };
  }

  /**
   * Store calculation results in database
   */
  private async storeCalculationResult(
    propertyId: string,
    financingScenarioId: string,
    property: PropertyWithRelations,
    scenario: FinancingScenario,
    summary: CalculationSummary,
    cashflows: YearlyCashflowData[],
  ) {
    // Delete existing calculation for this scenario
    await this.prisma.calculationResult.deleteMany({
      where: { financingScenarioId },
    });

    // Create new calculation result
    const result = await this.prisma.calculationResult.create({
      data: {
        propertyId,
        financingScenarioId,
        inputSnapshot: {
          property: {
            purchasePrice: this.toNumber(property.purchasePrice),
            propertySize: this.toNumber(property.propertySize),
            rentalPricePerM2: this.toNumber(property.rentalPricePerM2),
          },
          scenario: {
            ltvPercent: this.toNumber(scenario.ltvPercent),
            bankInterestRate: this.toNumber(scenario.bankInterestRate),
          },
        },
        irr10Year: summary.irr10Year,
        irr15Year: summary.irr15Year,
        irr30Year: summary.irr30Year,
        totalProfitAtExit: summary.totalProfitAtExit,
        upfrontInvestment: summary.upfrontInvestment,
        monthlyNetCashflowYear1: summary.monthlyNetCashflowYear1,
        grossYield: summary.grossYield,
        netYield: summary.netYield,
        cashOnCashReturn: summary.cashOnCashReturn,
        profitFromAppreciation: summary.profitFromAppreciation,
        profitFromOperating: summary.profitFromOperating,
        profitFromTaxSavings: summary.profitFromTaxSavings,
        totalTaxSavingsFromAfa: summary.totalTaxSavingsFromAfa,
        remainingLoanAtYear30: summary.remainingLoanAtYear30,
        yearlyCashflows: {
          create: cashflows.map((cf) => ({
            year: cf.year,
            calendarYear: cf.calendarYear,
            rentalIncome: cf.rentalIncome,
            parkingIncome: cf.parkingIncome,
            totalIncome: cf.totalIncome,
            mortgagePayment: cf.mortgagePayment,
            kfwPayment: cf.kfwPayment,
            interestPortion: cf.interestPortion,
            principalPortion: cf.principalPortion,
            hausgeldNichtUmlagefaehig: cf.hausgeldNichtUmlagefaehig,
            otherCosts: cf.otherCosts,
            totalExpenses: cf.totalExpenses,
            normalDepreciation: cf.normalDepreciation,
            specialDepreciation: cf.specialDepreciation,
            depreciationAmount: cf.depreciationAmount,
            marginalTaxRate: cf.marginalTaxRate,
            taxSavingOnDepreciation: cf.taxSavingOnDepreciation,
            taxableIncome: cf.taxableIncome,
            taxRefund: cf.taxRefund,
            netCashflowBeforeTax: cf.netCashflowBeforeTax,
            netCashflowAfterTax: cf.netCashflowAfterTax,
            cumulativeCashflow: cf.cumulativeCashflow,
            remainingBankLoan: cf.remainingBankLoan,
            remainingKfwLoan: cf.remainingKfwLoan,
            propertyValue: cf.propertyValue,
            equity: cf.equity,
          })),
        },
      },
      include: {
        yearlyCashflows: {
          orderBy: { year: 'asc' },
        },
      },
    });

    return result;
  }

  /**
   * Get latest calculation result for a scenario
   */
  async getCalculationResult(financingScenarioId: string) {
    const result = await this.prisma.calculationResult.findFirst({
      where: { financingScenarioId },
      orderBy: { calculatedAt: 'desc' },
      include: {
        yearlyCashflows: {
          orderBy: { year: 'asc' },
        },
      },
    });

    return result;
  }

  /**
   * Get all calculation results for a property
   */
  async getCalculationResultsByProperty(propertyId: string) {
    return this.prisma.calculationResult.findMany({
      where: { propertyId },
      orderBy: { calculatedAt: 'desc' },
      include: {
        financingScenario: true,
        yearlyCashflows: {
          orderBy: { year: 'asc' },
          take: 5, // Only first 5 years for summary
        },
      },
    });
  }

  // ─────────────────────────────────────────
  // Helper Methods
  // ─────────────────────────────────────────

  private toNumber(value: Decimal | number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value.toString());
  }

  /**
   * Calculate annual annuity payment for bank loan
   */
  private calculateAnnuity(principal: number, interestRate: number, repaymentRate: number): number {
    // German-style annuity: initial repayment rate + interest
    return principal * (interestRate + repaymentRate);
  }

  /**
   * Calculate KfW annuity (standard amortizing loan)
   */
  private calculateKfwAnnuity(principal: number, interestRate: number, years: number): number {
    if (interestRate === 0) return principal / years;
    const monthlyRate = interestRate / 12;
    const months = years * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return monthlyPayment * 12;
  }

  /**
   * Calculate German marginal income tax rate based on annual gross income
   * Simplified 2024 German tax brackets
   */
  private calculateMarginalTaxRate(annualGrossIncome: number): number {
    // German tax brackets 2024 (simplified)
    if (annualGrossIncome <= 11604) return 0;
    if (annualGrossIncome <= 17005) return 0.14;
    if (annualGrossIncome <= 66760) return 0.24 + (annualGrossIncome - 17005) / (66760 - 17005) * 0.18;
    if (annualGrossIncome <= 277825) return 0.42;
    return 0.45;
  }

  /**
   * Calculate IRR using Newton-Raphson method
   */
  private calculateIRR(initialInvestment: number, cashflows: YearlyCashflowData[]): number {
    if (cashflows.length === 0) return 0;

    // Build cashflow array: [-investment, cf1, cf2, ..., cfN + exitValue]
    const lastCf = cashflows[cashflows.length - 1];
    const exitValue = lastCf.propertyValue - lastCf.remainingBankLoan - lastCf.remainingKfwLoan;
    
    const flows = [-initialInvestment];
    for (let i = 0; i < cashflows.length - 1; i++) {
      flows.push(cashflows[i].netCashflowAfterTax);
    }
    flows.push(lastCf.netCashflowAfterTax + exitValue);

    // Newton-Raphson IRR calculation
    let rate = 0.1; // Initial guess
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let derivative = 0;

      for (let t = 0; t < flows.length; t++) {
        const discountFactor = Math.pow(1 + rate, t);
        npv += flows[t] / discountFactor;
        if (t > 0) {
          derivative -= t * flows[t] / Math.pow(1 + rate, t + 1);
        }
      }

      if (Math.abs(npv) < tolerance) break;
      if (derivative === 0) break;

      rate = rate - npv / derivative;

      // Clamp rate to reasonable bounds
      if (rate < -0.99) rate = -0.99;
      if (rate > 1) rate = 1;
    }

    return isNaN(rate) || !isFinite(rate) ? 0 : rate;
  }
}
