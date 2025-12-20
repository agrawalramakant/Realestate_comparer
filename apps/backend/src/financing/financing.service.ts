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

    return this.prisma.financingScenario.create({
      data: {
        ...dto,
        propertyId,
        scenarioOrder: dto.scenarioOrder ?? nextOrder,
      } as Prisma.FinancingScenarioUncheckedCreateInput,
    });
  }

  async findAllByProperty(propertyId: string) {
    return this.prisma.financingScenario.findMany({
      where: { propertyId },
      orderBy: { scenarioOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const scenario = await this.prisma.financingScenario.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!scenario) {
      throw new NotFoundException(`Financing scenario with ID ${id} not found`);
    }

    return scenario;
  }

  async update(id: string, dto: UpdateFinancingDto) {
    await this.findOne(id); // Throws if not found

    return this.prisma.financingScenario.update({
      where: { id },
      data: dto as Prisma.FinancingScenarioUpdateInput,
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
