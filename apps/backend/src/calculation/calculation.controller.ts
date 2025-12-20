import { Controller, Post, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CalculationService } from './calculation.service';

@Controller('properties/:propertyId/scenarios/:scenarioId/calculate')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}

  /**
   * Trigger calculation for a specific financing scenario
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async calculate(
    @Param('propertyId') propertyId: string,
    @Param('scenarioId') scenarioId: string,
  ) {
    return this.calculationService.calculate(propertyId, scenarioId);
  }

  /**
   * Get latest calculation result for a scenario
   */
  @Get()
  async getCalculationResult(
    @Param('scenarioId') scenarioId: string,
  ) {
    return this.calculationService.getCalculationResult(scenarioId);
  }
}
