import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';
import { JobOffer } from '../entities/job-offer.entity';
import { ProvidersModule } from '../providers/Providers.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer]), ProvidersModule],
  controllers: [JobOffersController],
  providers: [JobOffersService, Logger],
  exports: [JobOffersService],
})
export class JobOffersModule {}
