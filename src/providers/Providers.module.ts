import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProvidersService } from './providers.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [ProvidersService, Logger],
  exports: [ProvidersService],
})
export class ProvidersModule {}
