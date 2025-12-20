import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateFinancingDto {
  @IsString()
  scenarioName: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  scenarioOrder?: number;

  // Bank Loan
  @IsNumber()
  @Min(0)
  @Max(1)
  ltvPercent: number; // Loan-to-value ratio (e.g., 0.8 = 80%)

  @IsNumber()
  @Min(0)
  @Max(0.2)
  bankInterestRate: number; // e.g., 0.035 = 3.5%

  @IsInt()
  @Min(1)
  @Max(30)
  bankFixedPeriod: number; // Years of fixed interest

  @IsNumber()
  @Min(0)
  @Max(0.1)
  repaymentRate: number; // Initial repayment rate (e.g., 0.02 = 2%)

  @IsOptional()
  @IsNumber()
  @Min(0)
  bankAcquisitionCost?: number;

  @IsOptional()
  @IsBoolean()
  disburseBankLoanFirst?: boolean;

  // KfW Loan (optional secondary loan)
  @IsOptional()
  @IsNumber()
  @Min(0)
  kfwLoanAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.2)
  kfwInterestRate?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  kfwFixedPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  kfwRepaymentRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  kfwTilgungsfreieJahre?: number; // Grace period years

  @IsOptional()
  @IsNumber()
  @Min(0)
  kfwAcquisitionCost?: number;

  // Interest Rate After Fixed Period
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.2)
  bankInterestRateAfterFixed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.2)
  kfwInterestRateAfterFixed?: number;
}
