import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProvidersService } from './providers.service';
import { Provider1Mapper } from '../job-offers/mapper/Provider1.mapper';
import { Provider2Mapper } from '../job-offers/mapper/Provider2.mapper';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [ProvidersService, Logger, Provider1Mapper, Provider2Mapper],
  exports: [ProvidersService, Provider1Mapper, Provider2Mapper],
})
export class ProvidersModule {}
