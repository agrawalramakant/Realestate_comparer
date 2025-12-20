import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PropertyModule } from './property/property.module';
import { FinancingModule } from './financing/financing.module';
import { CalculationModule } from './calculation/calculation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    PropertyModule,
    FinancingModule,
    CalculationModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
