import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancingDto, UpdateFinancingDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinancingService {
  constructor(private prisma: PrismaService) {}

  async create(propertyId: string, dto: CreateFinancingDto) {
    // Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Get next scenario order
    const maxOrder = await this.prisma.financingScenario.aggregate({
      where: { propertyId },
      _max: { scenarioOrder: true },
    });
    const nextOrder = (maxOrder._max.scenarioOrder ?? 0) + 1;

    // Map DTO fields to Prisma schema fields
    const {
      kfwPrincipalFreeYears,
      kfwLoanAmount,
      kfwRepaymentRate,
      ...rest
    } = dto;
    
    return this.prisma.financingScenario.create({
      data: {
        ...rest,
        propertyId,
        scenarioOrder: dto.scenarioOrder ?? nextOrder,
        // Map API field names to Prisma field names
        kfwLoanSize: kfwLoanAmount,
        kfwRepaymentFreePeriod: kfwPrincipalFreeYears,
      } as Prisma.FinancingScenarioUncheckedCreateInput,
    });
  }

  async findAllByProperty(propertyId: string) {
    const scenarios = await this.prisma.financingScenario.findMany({
      where: { propertyId },
      orderBy: { scenarioOrder: 'asc' },
    });
    
    // Map Prisma fields to API fields
    return scenarios.map(({ kfwRepaymentFreePeriod, kfwLoanSize, ...rest }) => ({
      ...rest,
      kfwLoanAmount: kfwLoanSize,
      kfwPrincipalFreeYears: kfwRepaymentFreePeriod,
    }));
  }

  async findOne(id: string) {
    const scenario = await this.prisma.financingScenario.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!scenario) {
      throw new NotFoundException(`Financing scenario with ID ${id} not found`);
    }

    // Map Prisma fields to API fields
    const { kfwRepaymentFreePeriod, kfwLoanSize, ...rest } = scenario;
    return {
      ...rest,
      kfwLoanAmount: kfwLoanSize,
      kfwPrincipalFreeYears: kfwRepaymentFreePeriod,
    };
  }

  async update(id: string, dto: UpdateFinancingDto) {
    await this.findOne(id); // Throws if not found

    // Map DTO fields to Prisma schema fields
    const { kfwPrincipalFreeYears, kfwLoanAmount, kfwRepaymentRate, ...rest } = dto;

    return this.prisma.financingScenario.update({
      where: { id },
      data: {
        ...rest,
        ...(kfwLoanAmount !== undefined && { kfwLoanSize: kfwLoanAmount }),
        ...(kfwPrincipalFreeYears !== undefined && { kfwRepaymentFreePeriod: kfwPrincipalFreeYears }),
      } as Prisma.FinancingScenarioUpdateInput,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Throws if not found

    return this.prisma.financingScenario.delete({
      where: { id },
    });
  }

  async reorder(propertyId: string, scenarioIds: string[]) {
    const updates = scenarioIds.map((id, index) =>
      this.prisma.financingScenario.update({
        where: { id },
        data: { scenarioOrder: index + 1 },
      })
    );

    return this.prisma.$transaction(updates);
  }
}
