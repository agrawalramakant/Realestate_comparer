import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  GermanState,
  PropertyStatus,
  EnergyClass,
  RenovationStatus,
  FurnishingStatus,
  ParkingType,
  BuildingType,
  SourceType,
} from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  city: string;

  @IsEnum(GermanState)
  state: GermanState;

  @IsOptional()
  @IsEnum(PropertyStatus)
  propertyStatus?: PropertyStatus;

  @IsNumber()
  @Min(1)
  propertySize: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  numberOfRooms?: number;

  @IsNumber()
  @Min(1)
  purchasePrice: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  landValuePercent: number;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2030)
  constructionYear?: number;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2030)
  propertyCompletionYear?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  purchaseInMonths?: number;

  @IsOptional()
  @IsEnum(EnergyClass)
  energyClass?: EnergyClass;

  @IsOptional()
  @IsEnum(FurnishingStatus)
  furnishingStatus?: FurnishingStatus;

  // Floor & Layout
  @IsOptional()
  @IsInt()
  @Min(0)
  floorLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalFloors?: number;

  @IsOptional()
  @IsBoolean()
  hasBalcony?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balconySize?: number;

  @IsOptional()
  @IsBoolean()
  hasTerrace?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  terraceSize?: number;

  @IsOptional()
  @IsBoolean()
  hasGarden?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gardenSize?: number;

  @IsOptional()
  @IsBoolean()
  hasCellar?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cellarSize?: number;

  // Building Details
  @IsOptional()
  @IsEnum(BuildingType)
  buildingType?: BuildingType;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfUnitsInBuilding?: number;

  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  // Parking
  @IsOptional()
  @IsBoolean()
  hasParkingSpace?: boolean;

  @IsOptional()
  @IsEnum(ParkingType)
  parkingType?: ParkingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  parkingPrice?: number;

  @IsOptional()
  @IsBoolean()
  parkingIncludedInPrice?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  parkingRentalIncome?: number;

  // Purchase Costs
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  maklerFeePercent?: number;

  // Renovation
  @IsOptional()
  @IsEnum(RenovationStatus)
  renovationStatus?: RenovationStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  renovationCost?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  renovationYear?: number;

  @IsOptional()
  @IsBoolean()
  renovationTaxDeductible?: boolean;

  // Rental Details
  @IsNumber()
  @Min(0)
  rentalPricePerM2: number;

  @IsOptional()
  @IsNumber()
  @Min(-0.1)
  @Max(0.2)
  houseAppreciation?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rentalDelayPeriod?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  guaranteedRentPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rentalPriceAfterGuaranteed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.5)
  vacancyRate?: number;

  // Rent Increment
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  rentIncrementPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rentIncrementFrequencyYears?: number;

  // Hausgeld
  @IsOptional()
  @IsNumber()
  @Min(0)
  hausgeldTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hausgeldNichtUmlagefaehig?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hausgeldUmlagefaehig?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ruecklagePerSqm?: number;

  // Source
  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;

  @IsOptional()
  @IsString()
  sourceName?: string;

  @IsOptional()
  @IsString()
  sourceContact?: string;

  // Comments
  @IsOptional()
  @IsString()
  generalComments?: string;

  @IsOptional()
  @IsString()
  visitComments?: string;

  @IsOptional()
  @IsString()
  visitDate?: string;
}
