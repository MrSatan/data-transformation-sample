import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { SchedulerModule } from './schedulers/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    JobOffersModule,
    SchedulerModule,
  ],
  providers: [],
})
export class AppModule {}
