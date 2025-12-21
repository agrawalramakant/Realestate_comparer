import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertyQueryDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePropertyDto) {
    // Extract investment assumptions fields
    const { 
      afaType, 
      customAfaRate,
      sonderAfaEligible, 
      sonderAfaPercent, 
      sonderAfaYears,
      ...propertyData 
    } = dto as CreatePropertyDto & {
      afaType?: string;
      customAfaRate?: number;
      sonderAfaEligible?: boolean;
      sonderAfaPercent?: number;
      sonderAfaYears?: number;
    };

    const property = await this.prisma.property.create({
      data: propertyData as Prisma.PropertyCreateInput,
      include: {
        financingScenarios: true,
        taxProfile: true,
        investmentAssumptions: true,
      },
    });

    // Create investment assumptions if AfA settings provided
    if (afaType || sonderAfaEligible) {
      await this.prisma.investmentAssumptions.create({
        data: {
          propertyId: property.id,
          afaType: afaType as any || 'LINEAR_2',
          sonderAfaEligible: sonderAfaEligible || false,
          sonderAfaPercent: sonderAfaPercent || 0,
          sonderAfaYears: sonderAfaYears || 0,
        },
      });

      // Re-fetch with investment assumptions
      return this.findOne(property.id);
    }

    return property;
  }

  async findAll(query: PropertyQueryDto) {
    const { page = 1, limit = 10, city, state, status, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.PropertyWhereInput = {};
    
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state;
    if (status) where.propertyStatus = status;
    if (minPrice || maxPrice) {
      where.purchasePrice = {};
      if (minPrice) where.purchasePrice.gte = minPrice;
      if (maxPrice) where.purchasePrice.lte = maxPrice;
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          financingScenarios: { take: 1, orderBy: { scenarioOrder: 'asc' } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        financingScenarios: { orderBy: { scenarioOrder: 'asc' } },
        taxProfile: true,
        investmentAssumptions: true,
        calculationResults: {
          take: 1,
          orderBy: { calculatedAt: 'desc' },
          include: { yearlyCashflows: true },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(id: string, dto: UpdatePropertyDto) {
    const existingProperty = await this.findOne(id); // Throws if not found

    // Extract investment assumptions fields
    const { 
      afaType, 
      customAfaRate,
      sonderAfaEligible, 
      sonderAfaPercent, 
      sonderAfaYears,
      ...propertyData 
    } = dto as UpdatePropertyDto & {
      afaType?: string;
      customAfaRate?: number;
      sonderAfaEligible?: boolean;
      sonderAfaPercent?: number;
      sonderAfaYears?: number;
    };

    // Update property
    await this.prisma.property.update({
      where: { id },
      data: propertyData as Prisma.PropertyUpdateInput,
    });

    // Update or create investment assumptions if AfA settings provided
    if (afaType !== undefined || sonderAfaEligible !== undefined) {
      const investmentData = {
        afaType: afaType as any || 'LINEAR_2',
        sonderAfaEligible: sonderAfaEligible || false,
        sonderAfaPercent: sonderAfaPercent || 0,
        sonderAfaYears: sonderAfaYears || 0,
      };

      if (existingProperty.investmentAssumptions) {
        await this.prisma.investmentAssumptions.update({
          where: { propertyId: id },
          data: investmentData,
        });
      } else {
        await this.prisma.investmentAssumptions.create({
          data: {
            propertyId: id,
            ...investmentData,
          },
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id); // Throws if not found
    
    return this.prisma.property.delete({
      where: { id },
    });
  }
}
