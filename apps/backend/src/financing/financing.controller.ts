import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { FinancingService } from './financing.service';
import { CreateFinancingDto, UpdateFinancingDto } from './dto';

@Controller('properties/:propertyId/scenarios')
export class FinancingController {
  constructor(private readonly financingService: FinancingService) {}

  @Post()
  create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateFinancingDto,
  ) {
    return this.financingService.create(propertyId, dto);
  }

  @Get()
  findAll(@Param('propertyId') propertyId: string) {
    return this.financingService.findAllByProperty(propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFinancingDto) {
    return this.financingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financingService.remove(id);
  }

  @Post('reorder')
  reorder(
    @Param('propertyId') propertyId: string,
    @Body() body: { scenarioIds: string[] },
  ) {
    return this.financingService.reorder(propertyId, body.scenarioIds);
  }
}
